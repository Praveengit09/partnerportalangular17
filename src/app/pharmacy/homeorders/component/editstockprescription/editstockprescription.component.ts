import { ReportConstants } from './../../../../constants/report/reportconstants';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';
import { AuthService } from './../../../../auth/auth.service';
import { Config } from './../../../../base/config';
import { DiscountType } from './../../../../model/package/discountType';
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { ProductDeliveryTrack } from './../../../../model/product/productdeliverytrack';
import { PharmacyService } from './../../../pharmacy.service';

@Component({
    selector: 'editstockprescription',
    templateUrl: './editstockprescription.template.html',
    styleUrls: ['./editstockprescription.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditStockPrescriptionComponent implements OnInit {

    processOrderDetails: AdminPharmacyDeliveryResponse;

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;

    imageSources: String[];
    crouselSelectedImage: String;
    validation: any;
    pocId: number;
    discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
    oldRecord: boolean = true;
    prescriptionType: any = "";
    actionStatus: any = ProductDeliveryTrack;
    pharmacyListCount = 0 ;

    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
        this.pharmacyService.pharmacyList = new Array();
        if (this.pharmacyService && this.pharmacyService.pharmacyDeliveryDetails) {
            this.processOrderDetails = JSON.parse(JSON.stringify(this.pharmacyService.pharmacyDeliveryDetails));
            if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.pharmacyList) {
                this.pharmacyService.pharmacyList = this.processOrderDetails.cartItem.pharmacyList;
            }
        }
        pharmacyService.isEditedOrder = true;
        this.pharmacyService.isHomeOrder = true;
        this.pocId = auth.userAuth.pocId;
    }

    ngOnInit() {
        this.pharmacyListCount = 0;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
            this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
        }
        if (this.processOrderDetails.cartItem == undefined || this.processOrderDetails.cartItem == null) {
            this.processOrderDetails.cartItem = new CartItem();
        }
        if (this.processOrderDetails.cartItem.pharmacyList == undefined || this.processOrderDetails.cartItem.pharmacyList == null) {
            this.processOrderDetails.cartItem.pharmacyList = new Array<Pharmacy>();
        }
        if (this.processOrderDetails.cartItem.basketDiscount == undefined || this.processOrderDetails.cartItem.basketDiscount == null) {
            this.processOrderDetails.cartItem.basketDiscount = new Array();
        }
        this.pharmacyService.pharmacyList = this.processOrderDetails.cartItem.pharmacyList;
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            this.imageSources = this.processOrderDetails.cartItem.proofDocumentUrlList;
        }
        console.log('==>>>>2' + JSON.stringify(this.pharmacyService.tempPharmacyDeliveryDetails));
        if (!this.pharmacyService.tempPharmacyDeliveryDetails) {
            this.pharmacyService.tempPharmacyDeliveryDetails = JSON.parse(JSON.stringify(this.processOrderDetails));
        }
        this.pharmacyListCount = this.processOrderDetails.cartItem.pharmacyList.length;
        
    }

    onGenerateBack(): void {
        this.pharmacyService.pharmacyDeliveryDetails = new AdminPharmacyDeliveryResponse();
        this.pharmacyService.pharmacyDeliveryDetails = JSON.parse(JSON.stringify(this.pharmacyService.tempPharmacyDeliveryDetails));
        this.router.navigate(['/app/pharmacy/homeorder/prescription']);
    }

    onCalculateEvent(calculatedValue): void {

        this.processOrderDetails.cartItem.payment.originalAmount = calculatedValue.originalAmount;
        this.processOrderDetails.cartItem.payment.taxationAmount = calculatedValue.taxationAmount;

        this.processOrderDetails.cartItem.pharmacyList = this.pharmacyService.pharmacyList;

        this.processOrderDetails.cartItem.payment.finalAmount = calculatedValue.originalAmount + calculatedValue.taxationAmount
            + (this.processOrderDetails.cartItem.deliveryAmount ? this.processOrderDetails.cartItem.deliveryAmount : 0)
            - (this.processOrderDetails.cartItem.payment.packageDiscountAmount ? this.processOrderDetails.cartItem.payment.packageDiscountAmount : 0)
            - (this.processOrderDetails.cartItem.payment.otherDiscountAmount ? this.processOrderDetails.cartItem.payment.otherDiscountAmount : 0);
    }

    onSubmitForCalculation() {
        window.scroll(0, 0);
        console.log('Submitted the prescription');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        this.processOrderDetails.cartItem.pharmacyList.forEach((item, i) => {
            if (item.stockDetails.taxes && ((item.stockDetails.taxes.cgst && item.stockDetails.taxes.sgst) || item.stockDetails.taxes.igst)) { item.taxes = item.stockDetails.taxes; }
        });
        if (!this.processOrderDetails.cartItem.pharmacyList || this.processOrderDetails.cartItem.pharmacyList.length <= 0) {
            this.errorMessage[0] = "Please add medicines to proceed further.";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        let hasErrors = false;
        this.errorMessage = new Array();
        this.processOrderDetails.cartItem.pharmacyList.forEach((item, i) => {
            item.isErrorMsg = new Array();
            if (!item.productCode) {
                this.isError = item.isErrorFound = true;
                this.errorMessage.push("Please Select Medicine");
                item.isErrorMsg[0] = "Please Select Medicine/Medicine Code";
                // this.showMessage = true;
                hasErrors = true;
                return;
            }
            if (!item.grossPrice || +item.grossPrice <= 0) {
                this.errorMessage.push("Pricing not found for " + item.productName);
                this.isError = item.isErrorFound = true;
                item.isErrorMsg[0] = "Pricing not found";
                // this.showMessage = true;
                hasErrors = true;
                return;
            }
            if (!item.quantity || +item.quantity <= 0) {
                this.errorMessage.push("Quantity not set for " + item.productName);
                this.isError = item.isErrorFound = true;
                item.isErrorMsg[0] = "Quantity not found";
                // this.showMessage = true;
                hasErrors = true;
                return;
            }
            let enableStockValidation = false;
            if (Config.portal && Config.portal.pharmacyOptions && Config.portal.pharmacyOptions.enableStockValidation) {
                enableStockValidation = true;
            }
            if (enableStockValidation && (!item.stockDetails.batchNo || item.stockDetails.batchNo.trim() == "")) {
                this.isError = item.isErrorFound = true;
                item.isErrorMsg[0] = "Please Select Batch Number";
                hasErrors = true;
                return;
            }
            if (enableStockValidation && (!item.stockDetails || !item.stockDetails.expiryDate || item.stockDetails.expiryDate < new Date().getTime())) {
                this.isError = item.isErrorFound = true;
                item.isErrorMsg[0] = "Please Check Medicine Already Expired";
                hasErrors = true;
                return;
            }
        });
        if (hasErrors) {
            return;
        }
        // as order raised by poc side
        if(this.processOrderDetails.cartItem.userBooking) 
            this.processOrderDetails.cartItem.bookingSource = ReportConstants.BOOKING_SOURCE_PARTNER_PORTAL;
        this.spinnerService.start();
        if(this.processOrderDetails.cartItem.pharmacyList.length != this.pharmacyListCount){
            this.processOrderDetails.cartItem.payment.paymentStatus = 2;
        }
        this.pharmacyService.calculatePharmacyDeliveries(this.processOrderDetails.cartItem).then(cartItemResponse => {
            this.spinnerService.stop();
            if (cartItemResponse.statusCode == 200 || cartItemResponse.statusCode == 201) {
                this.processOrderDetails.cartItem = { ...this.processOrderDetails.cartItem, ...cartItemResponse };
                this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
                this.router.navigate(['/app/pharmacy/homeorder/checkout']);
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

    // sliderImage(imageSrc) {
    //     if (imageSrc.substring((imageSrc.lastIndexOf('.') + 1)).toString() == "pdf") {
    //         this.auth.openPDF(imageSrc)
    //     } else {
    //         this.crouselSelectedImage = imageSrc;
    //     }
    // }
    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        let isPdf = imageSrc.substring(imageSrc.lastIndexOf('.') + 1, imageSrc.lastIndexOf('.') + 4).toString();
        if (isPdf == "pdf") {
            //  window.open(imageSrc)
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