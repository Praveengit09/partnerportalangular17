import { PaymentType } from './../../../../model/payment/paymentType';
import { PocAdviseData } from './../../../../model/poc/poc-advise-data';
import { AppIdConstants } from './../../../../constants/config/appid.contact';
import { SelectedRegisteredProfile } from './../../../../model/profile/selectedRegisteredProfile';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { Payment } from './../../../../model/basket/payment';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { DiagnosticsService } from './../../../../diagnostics/diagnostics.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../auth/auth.service';
import { Location } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from './../../../../model/basket/cartitem';
import { DiscountType } from './../../../../model/package/discountType';
import { PharmacyService } from './../../../pharmacy.service';
import { Config } from '../../../../base/config.js';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { PharmacyDeliverTrack } from '../../../../model/pharmacy/pharmacydeliverytrack';
import { InpatientOrdersService } from '../../inpatientorders.service';


@Component({
    selector: 'inpatientordersummary',
    templateUrl: './ordersummary.template.html',
    styleUrls: ['./ordersummary.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class InPatientOrderSummaryComponent implements OnInit {


    cartItem: CartItem;
    pdfHeaderType: number;
    brandId: number;
    configAppId: number;
    otherDiscountAmountPer: number = 0;
    selectedPackageId: number = 0;
    empId: any;
    isOtherDiscountCashPaymentHide: boolean = false;
    paymentModeIndex = 0;
    isError = false;
    showMessage = false;
    errorMessage = new Array();
    pocId = 0;
    transactionId: string = '';
    reportResponse: any;
    modalMessage: string = '';
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
    basketRequest: BasketRequest = new BasketRequest();
    isMobilePayment: boolean = false;

    constructor(private pharmacyService: PharmacyService,
        private authService: AuthService, private router: Router,
        private diagnosticService: DiagnosticsService, private inPatientOrdersService: InpatientOrdersService,
        private _location: Location, private spinnerService: SpinnerService, private toast: ToasterService,
        private hsLocalStorage: HsLocalStorage) {

        this.brandId = authService.userAuth.brandId;
        this.configAppId = Config.portal.appId;
    }

    ngOnInit() {

        this.pocId = this.authService.userAuth.pocId;
        this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
        this.cartItem = { ...this.pharmacyService.pharmacyAdviseTrack };

        if (this.cartItem != undefined && Object.keys(this.cartItem).length === 0 && this.cartItem.constructor === Object) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
        } else {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('cartItem') != null) {
                this.cartItem = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('cartItem')));
            }
        }
        this.calculateBasket();
        if (this.cartItem.inPatientBilling) {
            // this.calculateBasket();
            this.checkPaymentModeSelection(5);
        }
        else this.checkPaymentModeSelection(2);

    }
    checkPaymentModeSelection(index: number, isMobilePayment = false) {
        this.isMobilePayment = isMobilePayment;
        this.paymentModeIndex = index;
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
    }
    checkFinalAmount() {

        return this.cartItem.payment.finalAmount > 0 && this.isOtherDiscountCashPaymentHide == false;
    }
    async ConfirmOrder() {
        window.scroll(0, 0);

        if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
            this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
            this.cartItem.payment.transactionType = this.paymentModeIndex;
            this.cartItem.payment.transactionId = this.transactionId;
        } else if (this.paymentModeIndex == 5) {
            this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
            this.cartItem.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
        }
        if (!this.cartItem.inPatientBilling) {
            if (this.isMobilePayment == false)
                this.cartItem.actionPerformed = PharmacyDeliverTrack.COLLECTED_PAYMENT;
            else if (this.isMobilePayment == true)
                this.cartItem.actionPerformed = PharmacyDeliverTrack.PAYMENT_INITIATED;
            this.cartItem.inPatientBilling = false;
        };
        let basketRequest: BasketRequest = new BasketRequest();
        basketRequest.cartItemList = new Array<CartItem>();
        basketRequest.cartItemList[0] = this.cartItem;
        basketRequest.orderId = this.basketRequest.orderId;
        if (this.basketRequest.bookingSource == undefined || this.basketRequest.bookingSource <= 0) {
            basketRequest.bookingSource = this.basketRequest.bookingSource = 3;
        } else {
            basketRequest.bookingSource = this.basketRequest.bookingSource;
        }


        basketRequest.transactionId = this.cartItem.payment.transactionId;
        basketRequest.transactionType = this.cartItem.payment.transactionType;
        basketRequest.parentProfileId = this.cartItem.parentProfileId;

        basketRequest.totalOriginalAmount = this.cartItem.payment.originalAmount;
        basketRequest.totalPackageDiscountAmount = this.cartItem.payment.packageDiscountAmount;
        basketRequest.totalOtherDiscountAmount = this.cartItem.payment.otherDiscountAmount;
        basketRequest.totalTaxationAmount = this.cartItem.payment.taxationAmount;
        basketRequest.totalFinalAmount = this.cartItem.payment.finalAmount;
        basketRequest.cartItemList[0].inPatientBilling = this.cartItem.inPatientBilling;
        basketRequest.cartItemList[0].orderId = this.cartItem.orderId;
        basketRequest.orderId = this.cartItem.orderId;
        $('html, body').animate({ scrollTop: '0px' }, 300);

        this.spinnerService.start();
        await this.diagnosticService.initiatePayment(basketRequest).then(reportResponse => {
            this.spinnerService.stop();
            if (reportResponse.cartItemList[0].statusCode == 201 || reportResponse.cartItemList[0].statusCode == 200) {
                this.basketRequest = this.reportResponse = reportResponse;

                this.basketRequest.cartItemList[0] = reportResponse.cartItemList[0];
                if (this.basketRequest.cartItemList[0].pdfUrlWithHeader != undefined && this.basketRequest.cartItemList[0].pdfUrlWithHeader != null && this.basketRequest.cartItemList[0].pdfUrlWithHeader != '') {
                    if (this.pdfHeaderType == 0) {
                        this.basketRequest.pdfUrlWithHeader = reportResponse.cartItemList[0].pdfUrlWithHeader;
                    }
                    else {
                        this.basketRequest.pdfUrlWithoutHeader = reportResponse.cartItemList[0].pdfUrlWithoutHeader;
                    }
                }

                this.pharmacyService.errorMessage = new Array<string>();
                this.pharmacyService.isError = false;
                this.pharmacyService.showMessage = false;
                if (this.paymentModeIndex == 5) {
                    if (reportResponse.cartItemList[0].actionPerformed == PharmacyDeliverTrack.MODIFIED_ORDER)
                        this.toast.show('Successfully updated', "bg-success text-white font-weight-bold", 3000);
                    else if (reportResponse.cartItemList[0].actionPerformed == PharmacyDeliverTrack.PAYMENT_INITIATED)
                        this.toast.show('Raised inpatient pharmacy bill successfully and sent payment link to the patient.', "bg-success text-white font-weight-bold", 3000);
                    else
                        this.toast.show('Successfully created', "bg-success text-white font-weight-bold", 3000);

                    this.gotoInPatientPharmacyOrderList()

                }
                else {
                    this.toast.show('Raised inpatient pharmacy bill successfully.', "bg-success text-white font-weight-bold", 3000);
                    this.gotoPharmacyInvoice();
                }
            } else {
                this.reportResponse = reportResponse;
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = this.reportResponse.cartItemList[0].statusMessage;
                this.isError = true;
                this.showMessage = true;
            }
        }).catch(error => { console.error('Error occurred while getting the advice details', error); });
    }


    onBackButtonClick() {
        this.pharmacyService.showMessage = true;
        this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
        this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
        if (this.cartItem.inPatientNo && (this.inPatientOrdersService.isSingleOrder == true || this.inPatientOrdersService.isPaymentSummary == true))
            this.gotoInPatientPharmacyOrderList();
        else
            this.router.navigate(['/app/pharmacy/inpatientorders/neworder']);
    }

    onEditOrderClickHandler() {
        this.pharmacyService.showMessage = true;
        this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
        this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
        if (this.cartItem.billNo && this.cartItem.inPatientBilling == true)
            this.pharmacyService.pharmacyAdviseTrack.isEditOrder = true;
        else
            this.pharmacyService.pharmacyAdviseTrack.isEditOrder = false;

        this.router.navigate(['/app/pharmacy/inpatientorders/neworder']);



    }

    gotoInPatientPharmacyOrderList(): void {
        this.router.navigate(['/app/pharmacy/inpatientorders/list']);
    }
    async gotoPharmacyInvoice() {
        await this.onSummary();
        this.router.navigate(['/app/pharmacy/inpatientorders/invoice']);
    }

    calculateBasket() {
        let basketRequest = new BasketRequest();
        if (!this.cartItem.empId || this.cartItem.empId == 0) {
            this.cartItem.empId = this.authService.userAuth.employeeId;
        }
        if (!this.cartItem.bookingSource || this.cartItem.bookingSource == 0) {
            this.cartItem.bookingSource = 3;
        }
        basketRequest.parentProfileId = this.cartItem.parentProfileId;
        basketRequest.cartItemList = new Array<CartItem>();
        basketRequest.cartItemList[0] = this.cartItem;

        this.cartItem.actualDate = 11111;
        this.spinnerService.start();
        this.diagnosticService.calculateBasket(basketRequest).then((basketResponse) => {
            this.spinnerService.stop();
            this.cartItem = basketResponse.cartItemList[0];
            console.log('calculateBasket', JSON.stringify(basketResponse))


        });
    }



    onSummary() {
        this.pharmacyService.isError = false;
        this.pharmacyService.showMessage = false;
        if (this.basketRequest != undefined && this.basketRequest != null) {
            this.pharmacyService.pharmacyAdviseTrack = this.basketRequest.cartItemList[0];

        }
        this.pharmacyService.pharmacyList = null;
    }


    ngOnDestroy(): void {


        this.inPatientOrdersService.isPaymentSummary = false;

    }



}