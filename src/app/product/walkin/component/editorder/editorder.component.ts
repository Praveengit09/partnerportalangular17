import { DiscountType } from './../../../../model/package/discountType';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { Payment, PaymentConnst } from '../../../../model/basket/payment';
import { Product } from '../../../../model/product/product';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { ProductService } from '../../productorder.service';
import { AdminService } from './../../../../admin/admin.service';
import { AuthService } from './../../../../auth/auth.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { Config } from './../../../../base/config';


@Component({
    selector: 'editorder',
    templateUrl: './editorder.template.html',
    styleUrls: ['./editorder.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditOrderComponent implements OnInit, OnDestroy {

    cartItem: CartItem;
    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    productNameSearchResults: any;
    productNameSelectTotal: number = 0;
    productNameHardReset: boolean = false;
    validation: any;

    selectedRegisteredProfile: SelectedRegisteredProfile;
    pocId: number;
    empId: number;
    city: number;
    packageNames: any[];
    packageNamesShow: boolean;
    bookedPackageList: any[];
    dropDownIndex: number;
    brandId: number;
    reportResponse: any;
    pdfHeaderType: number;
    paymentModeIndex: number;
    isValue: boolean;
    isPercent: boolean = true;
    isPercent1: boolean = false;
    otherDiscountAmountPer: number = 0;
    otherDiscountAmount: number = 0;

    Package4Original: number;
    transactionId: string = '';
    totalTaxationAmount: number;
    discountPercent: any;
    discountAmount: number;
    otherDiscountAmountInput: number;
    otherDiscountAmountOutput: number;
    PaymentConnst = PaymentConnst;
    notAllowForSubmit: boolean = true;
    isOldRecord: boolean = false;
    discountType: number = DiscountType.TYPE_MISCELLANEOUS;

    constructor(private validationUtil: ValidationUtil, private adminService: AdminService,
        private router: Router, private spinnerService: SpinnerService, private productService: ProductService,
        private authService: AuthService, private diagnosticService: DiagnosticsService) {
        this.pocId = authService.userAuth.pocId;
        this.city = authService.selectedPocDetails.address.city;
        this.empId = authService.userAuth.employeeId;
        this.brandId = authService.userAuth.brandId;
        this.validation = validationUtil;
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;

        let cryptoUtil: CryptoUtil = new CryptoUtil();
        this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH;
        if (productService.isUpdate) {
            if (this.productService.cartItem != undefined && this.productService.cartItem != null) {
                this.isOldRecord = true;
                this.cartItem = this.productService.cartItem;
                this.cartOnInit();
                window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
            }
        }
        else {
            this.cartItem = new CartItem();
            this.cartItem.pocId = this.pocId;
            this.cartItem.brandId = this.brandId;
            this.cartItem.empId = this.empId;
            this.cartItem.cartItemType = CartItem.CART_ITEM_TYPE_PRODUCT;
            this.cartItem.bookingSource = 3;
            this.cartItem.paymentSource = 3;
            this.cartItem.payment = new Payment();
            this.cartItem.productList = new Array<Product>();
            this.cartItem.basketDiscount = new Array();
            let cartData = window.localStorage.getItem('cartItem');
            if (cartData != null && cartData.length > 0) {
                this.cartItem = JSON.parse(cryptoUtil.decryptData(cartData));
                productService.cartItem = this.cartItem;
                productService.isUpdate = true;
                this.cartOnInit();
            }
        }

    }
    cartOnInit() {
        this.paymentModeIndex = this.cartItem.payment ? this.cartItem.payment.transactionType : Payment.PAYMENT_TYPE_CASH;
        this.otherDiscountAmountInput = this.cartItem.basketDiscount.length > 0 ? this.cartItem.basketDiscount[0].percent : 0;
        this.otherDiscountAmountOutput = this.cartItem.basketDiscount.length > 0 ? this.cartItem.basketDiscount[0].discountAmount : 0;
        this.Package4Original = this.cartItem.payment ? this.cartItem.payment.originalAmount : 0;
        this.cartUpdate(this.cartItem);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.cartItem != undefined || this.cartItem != null) {
            window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
        }
    }

    cartUpdate(event) {
        this.cartItem = { ...event };
        this.Package4Original = this.cartItem.payment.originalAmount;
        // this.applyOtherDiscount(this.otherDiscountAmountInput);
    }

    onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
        this.selectedRegisteredProfile = selectedRegisteredProfile;
        this.cartItem.patientProfileDetails = selectedRegisteredProfile.selectedProfile;
        this.cartItem.patientProfileId = selectedRegisteredProfile.selectedProfile.profileId;
        this.cartItem.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.cartItem.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    onSubmitForCalculation() {
        window.scroll(0, 0);
        if (!this.cartItem.patientProfileId || this.cartItem.patientProfileId <= 0) {
            this.errorMessage[0] = "Add Patient Details";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        console.log('Submitted the prescription');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        if (!this.cartItem.productList || this.cartItem.productList.length <= 0) {
            this.errorMessage[0] = "Please add products to proceed.";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        let hasError: boolean;

        let enableStockValidation = false;
        if (Config.portal && Config.portal.productOptions && Config.portal.productOptions.enableStockValidation) {
            enableStockValidation = true;
        }

        this.cartItem.productList.forEach((item, i) => {
            item.isErrorFound = false;
            item.isErrorMsg = new Array<string>();
            if (!item.productName || item.productName == null || item.productName == undefined || item.productName == "") {
                item.isErrorMsg.push("Product not found ");
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (+item.grossPrice <= 0 || item.grossPrice == null || item.grossPrice == undefined) {
                item.isErrorMsg.push("Pricing not found for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (+item.quantity <= 0) {
                item.isErrorMsg.push("Quantity not set for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (enableStockValidation && (!item.stockDetails.batchNo || item.stockDetails.batchNo.trim() == "")) {
                item.isErrorMsg.push("Please select Batch Number for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (enableStockValidation && (!item.stockDetails || !item.stockDetails.expiryDate || item.stockDetails.expiryDate < new Date().getTime())) {
                item.isErrorMsg.push("Please check expiry date for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
        });
        if (hasError) {
            return;
        }
        this.cartItem.payment.transactionId = this.transactionId;
        this.cartItem.payment.transactionType = this.paymentModeIndex;
        this.cartItem.payment.paymentStatus = this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE ?
            Payment.PAYMENT_STATUS_NOT_PAID : Payment.PAYMENT_STATUS_PAID;
        let basketRequest: BasketRequest = new BasketRequest();
        basketRequest.orderId = this.cartItem.orderId;
        basketRequest.cartItemList = new Array();
        basketRequest.cartItemList.push(this.cartItem);
        basketRequest.bookingSource = this.cartItem.bookingSource;
        basketRequest.transactionType = this.cartItem.payment.transactionType;
        basketRequest.parentProfileId = this.cartItem.parentProfileId;
        basketRequest.totalOriginalAmount = this.cartItem.payment.originalAmount;
        basketRequest.totalTaxationAmount = this.cartItem.payment.taxationAmount;
        basketRequest.totalOtherDiscountAmount = this.cartItem.payment.otherDiscountAmount;
        basketRequest.totalFinalAmount = this.cartItem.payment.finalAmount;


        this.spinnerService.start();
        this.diagnosticService.initiatePayment(basketRequest).then(reportResponse => {
            this.spinnerService.stop();
            if (reportResponse.statusCode == 201 || reportResponse.statusCode == 200) {
                this.spinnerService.stop();
                this.reportResponse = reportResponse;
                this.cartItem = reportResponse.cartItemList[0];
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = this.reportResponse.statusMessage;
                this.isError = false;
                this.showMessage = true;
                if (this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE) {
                    alert('Raised product bill successfully and sent payment link to the patient.')
                    this.gotoProductOrderList();
                } else {
                    alert('Raised product bill successfully.');
                    this.gotoProductInvoice();
                }
            } else {
                this.spinnerService.stop();
                this.reportResponse = reportResponse;
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = this.reportResponse.statusMessage ? this.reportResponse.statusMessage : 'Something went wrong. Please try again!';
                this.isError = true;
                this.showMessage = true;
            }
        }).catch(error => {
            this.spinnerService.stop();
            console.error('Error occurred while getting the order details', error);
        });
    }

    gotoProductOrderList(): void {
        this.spinnerService.stop();
        this.router.navigate(['/app/product/walkin/list']);
    }

    gotoProductInvoice() {
        this.spinnerService.stop();
        this.productService.cartItem = this.cartItem;
        this.router.navigate(['/app/product/walkin/invoice']);
    }

    checkDiscountSelection(isPercent: boolean) {
        this.isPercent = isPercent;
        let tempval = this.otherDiscountAmountInput;
        this.otherDiscountAmountInput = this.otherDiscountAmountOutput;
        this.otherDiscountAmountOutput = tempval;
    }

    checkPaymentModeSelection(index: number) {
        this.paymentModeIndex = index;
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
    }

    closeModel(id: string) {
        $(id).on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
        (<any>$(id)).modal('hide');
    }

    checkFinalAmount() {
        return this.cartItem.payment.finalAmount > 0;
    }

}