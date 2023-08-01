import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../../admin/admin.service';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { Product } from '../../../../model/product/product';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { Config } from './../../../../base/config';

@Component({
    selector: 'editorder',
    templateUrl: './editorder.template.html',
    styleUrls: ['./editorder.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditOrderComponent implements OnInit {

    processOrderDetails: ProductDeliveryTrack;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    clickedItem: any;
    showMessagetxt: boolean;
    isErrorCheck: boolean = false;
    productNameSearchResults: any;
    productNameSelectTotal: number = 0;
    productNameHardReset: boolean = false;
    validation: any;
    selectColumns: any[] = [
        {
            variable: 'productName',
            filter: 'text'
        }
    ];
    cartItem: CartItem;
    prescriptionType = "";
    crouselSelectedImage: String;

    constructor(config: AppConfig, private validationUtil: ValidationUtil,
        private adminService: AdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService,
        private pharmacyService: PharmacyService, private commonUtil: CommonUtil) {
        this.validation = validationUtil;
    }

    ngOnInit() {
        if (this.adminService && this.adminService.productDeliveryTrack) {
            this.processOrderDetails = JSON.parse(JSON.stringify(this.adminService.productDeliveryTrack));
        }
        if (!this.adminService.tempProductDeliveryTrack && this.processOrderDetails) {
            this.adminService.tempProductDeliveryTrack = JSON.parse(JSON.stringify(this.processOrderDetails));
        }
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
            this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
        }
        if (this.processOrderDetails.cartItem == undefined || this.processOrderDetails.cartItem == null) {
            this.processOrderDetails.cartItem = new CartItem();
        }
        if (this.processOrderDetails.cartItem.productList == undefined || this.processOrderDetails.cartItem.productList == null) {
            this.processOrderDetails.cartItem.productList = new Array<Product>();
        }
        this.cartItem = this.processOrderDetails.cartItem;
    }

    onGenerateBack(): void {
        if (this.adminService.tempProductDeliveryTrack) {
            this.adminService.productDeliveryTrack = new ProductDeliveryTrack();
            this.adminService.productDeliveryTrack = JSON.parse(JSON.stringify(this.adminService.tempProductDeliveryTrack));
            this.router.navigate(['/app/product/homeorder/view']);
        }
    }

    cartUpdate(cartItem) {
        this.processOrderDetails.cartItem = cartItem;
    }


    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    resetSearch() {
        this.productNameSearchResults = null;
        this.productNameSelectTotal = 0;
        this.productNameHardReset = false;
    }

    onSubmitForCalculation() {
        window.scroll(0, 0);
        console.log('Submitted the prescription');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        let hasErrors = false;
        if (!this.processOrderDetails.cartItem.productList || this.processOrderDetails.cartItem.productList.length <= 0) {
            this.errorMessage[0] = "Please add products to proceed.";
            this.isError = true;
            this.showMessage = true;
            return;
        }

        let enableStockValidation = false;
        if (Config.portal && Config.portal.productOptions && Config.portal.productOptions.enableStockValidation) {
            enableStockValidation = true;
        }

        this.processOrderDetails.cartItem.productList.forEach(item => {
            let errList = [];
            if (+item.grossPrice <= 0) {
                errList.push("Product Price ");
                item.isErrorFound = true;
                hasErrors = true;
            }
            if (+item.quantity <= 0) {
                errList.push("Quantity");
                item.isErrorFound = true;
                hasErrors = true;
            }
            if (enableStockValidation && (!item.stockDetails.batchNo || item.stockDetails.batchNo.trim() == "")) {
                errList.push("Batch Number");
                item.isErrorFound = true;
                hasErrors = true;
            }
            if (enableStockValidation && (!item.stockDetails || !item.stockDetails.expiryDate || item.stockDetails.expiryDate < new Date().getTime())) {
                errList.push("Expiry Date");
                item.isErrorFound = true;
                hasErrors = true;
            }
            if (item.isErrorFound) {
                let errmsg = 'Please check ',
                    msgLength = errList.length;
                errList.forEach(((msg, i) => {
                    errmsg += msg + (i != msgLength - 1 ? ', ' : '');
                }));
                item.isErrorMsg = [errmsg];
            }
        });
        if (hasErrors) {
            return;
        }
        this.spinnerService.start();
        this.pharmacyService.calculatePharmacyDeliveries({ ...this.processOrderDetails.cartItem }).then(cartItemResponse => {
            this.spinnerService.stop();
            if (cartItemResponse.statusCode == 200 || cartItemResponse.statusCode == 201) {
                this.processOrderDetails.cartItem = cartItemResponse;
                this.adminService.productDeliveryTrack = this.processOrderDetails;
                this.router.navigate(['/app/product/homeorder/summary']);
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error occurred while processing request. Please try again!";
                this.showMessage = true;
                return;
            }
        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        });
    }

    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        let isPdf = imageSrc.substring(imageSrc.lastIndexOf('.') + 1, imageSrc.lastIndexOf('.') + 4).toString();
        if (isPdf == "pdf") {
            let h = window.innerHeight;
            $('#prescription-modal').css('height', h * .85);
            this.crouselSelectedImage = imageSrc;
            $('#pdfView2').attr({ data: imageSrc + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100 });
        } else {
            $('#prescription-modal').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }
    }
}