import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { Payment } from '../../../../model/basket/payment';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { DiscountType } from '../../../../model/package/discountType';
import { PaymentType } from '../../../../model/payment/paymentType';
import { AuthService } from './../../../../auth/auth.service';
import { DiagnosticsService } from './../../../../diagnostics/diagnostics.service';

import { WellnessService } from '../../../../newwellness/wellness.service';


@Component({
    selector: 'wellness_slotsummary',
    templateUrl: './wellness_slotsummary.template.html',
    styleUrls: ['./wellness_slotsummary.style.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WellnessSlotSummaryComponent implements OnInit {

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    validation: ValidationUtil;
    dropDownIndex: number = 0;
    slotBookingDetails: SlotBookingDetails;
    basketResponse: BasketRequest;
    packageNamesShow: boolean = false;
    transactionId: string = '';
    paymentModeIndex: number = 2;
    promotionalDiscountAmount: number = 0;
    packageList: BookedPackageResponse[];
    selectedUserPackageId: number = 0;
    otherDiscountAmount: number = 0;
    otherDiscountAmountPercent: number = 0;
    otherDiscountMode = 0;
    onlyPayment: boolean;
    discountType: number = DiscountType.TYPE_DIAGNOSTIC_DISCOUNT;
    isOldRecord: boolean = false;
    hasPackageOrCouponError: boolean;


    constructor(private auth: AuthService, public wellnessService: WellnessService,
        private validationUtil: ValidationUtil, private hsLocalStorage: HsLocalStorage,
        private router: Router, private spinnerService: SpinnerService, private diagnosticsService: DiagnosticsService) {
        this.validation = validationUtil;
    }

    ngOnInit() {
  
        console.log("wellnessSlotBookingDetails" + JSON.stringify(this.wellnessService.wellnessSlotBookingDetails));
            
        this.slotBookingDetails = this.wellnessService.wellnessSlotBookingDetails;
        this.onlyPayment = this.wellnessService.onlyPayment;
        if (this.slotBookingDetails) {
            console.log("Ifff:" + JSON.stringify(this.slotBookingDetails));
            let data = {
                'slotBookingDetails': this.slotBookingDetails,
                'onlyPayment': this.onlyPayment
            };
            this.hsLocalStorage.saveComponentData(data);
        } else {
            console.log("Elseee");
            this.slotBookingDetails = this.hsLocalStorage.getComponentData().slotBookingDetails;
            this.onlyPayment = this.hsLocalStorage.getComponentData().onlyPayment;
        }
        if (this.onlyPayment) {
            console.log("this.onlyPayment: " + this.onlyPayment);
            this.isOldRecord = true;
        }
        this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.slotBookingDetails.serviceList.forEach((element, index) => {
            this.promotionalDiscountAmount += +element.discountPrice;
            this.slotBookingDetails.serviceList[index].offerPrice = element.grossPrice - element.discountPrice;
        });
    }

    checkPaymentModeSelection(index: number) {
        this.paymentModeIndex = index;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
    }

    checkPaymentStatusSelection(index: number) {
        if (index == 1) {
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        } else {
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
        }
    }

    checkDiscountSelection(index: number) {
        this.otherDiscountMode = index;
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    onSubmitChanges() {
        this.resetError();
        if (this.hasPackageOrCouponError == true) {
            return;
        }
        if (this.paymentModeIndex == 9 || this.paymentModeIndex == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select a payment mode";
            this.showMessage = true;
            return;
        }

        console.log("this.onlyPaymentt: " + this.onlyPayment);

        let basketRequest: BasketRequest = new BasketRequest();
        basketRequest.orderId = this.slotBookingDetails.orderId;

        if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
            this.slotBookingDetails.payment.transactionType = this.paymentModeIndex;
            this.slotBookingDetails.payment.transactionId = this.transactionId;
            basketRequest.transactionType = this.paymentModeIndex;
            basketRequest.transactionId = this.transactionId;
        }
        else if (this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE) {
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
            basketRequest.transactionType = Payment.PAYMENT_TYPE_MOBILE;
        }

        if (this.slotBookingDetails.payment.finalAmount == 0) {
            basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        }

        if (!this.onlyPayment) {
            let currentTimestamp: Date = new Date();
            this.slotBookingDetails.createdTimestamp = currentTimestamp.getTime();
            basketRequest.createdTimestamp = currentTimestamp.getTime();
        } else {
            basketRequest.createdTimestamp = this.slotBookingDetails.createdTimestamp;
        }


        basketRequest.transactionSource = this.slotBookingDetails.paymentSource;
        basketRequest.totalOriginalAmount = this.slotBookingDetails.payment.originalAmount;
        basketRequest.totalFinalAmount = this.slotBookingDetails.payment.finalAmount;
        basketRequest.bookingSource = this.slotBookingDetails.bookingSource;
        basketRequest.parentProfileId = this.slotBookingDetails.parentProfileId;
        basketRequest.slotBookingDetailsList = new Array();
        basketRequest.slotBookingDetailsList.push(this.slotBookingDetails);

        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.diagnosticsService.initiatePayment(basketRequest).then(
            (response) => {
                if (response != null && response !== undefined
                    && (response.statusCode == 200 || response.statusCode == 201)) {
                    this.spinnerService.stop();
                    this.basketResponse = response;
                    ($('#messageModal') as any).modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                } else {
                    this.spinnerService.stop();
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = response.statusMessage;
                    this.isError = true;
                    this.showMessage = true;
                }
            });
    }

    onGenerateBack() {
        this.router.navigate(['/app/wellness/wellness_slotbooking/wellness_slotqueue']);

    }

    onPrintButtonClick() {
        if (this.auth.userAuth.pdfHeaderType == 0) {
            this.auth.openPDF(this.basketResponse.slotBookingDetailsList[0].pdfUrlWithHeader);
        } else {
            this.auth.openPDF(this.basketResponse.slotBookingDetailsList[0].pdfUrlWithoutHeader);
        }
    }

    resetError() {
        this.errorMessage = new Array();
        this.isError = false;
        this.showMessage = false;
    }

    checkForDiscountErrors(error) {
        this.hasPackageOrCouponError = error;
    }
}