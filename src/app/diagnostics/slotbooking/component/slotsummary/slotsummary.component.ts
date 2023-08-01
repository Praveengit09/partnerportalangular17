import { CentralOrderInteraction } from './../../../../model/common/centralorderinteraction';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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
import { DiagnosticsService } from '../../../diagnostics.service';
import { AuthService } from './../../../../auth/auth.service';
import { Config } from '../../../../base/config';
import { CommonUtil } from '../../../../base/util/common-util';


@Component({
    selector: 'slotsummary',
    templateUrl: './slotsummary.template.html',
    styleUrls: ['./slotsummary.style.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SlotSummaryComponent implements OnInit, OnDestroy {

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;

    validation: ValidationUtil;
    dropDownIndex: number = 0;
    slotBookingDetails: SlotBookingDetails;
    basketResponse: BasketRequest;
    packageNamesShow: boolean = false;
    transactionId: string = '';
    paymentModeIndex: number = Payment.PAYMENT_TYPE_CASH;
    promotionalDiscountAmount: number = 0;
    packageList: BookedPackageResponse[];
    selectedUserPackageId: number = 0;
    otherDiscountAmount: number = 0;
    otherDiscountAmountPercent: number = 0;
    otherDiscountMode = 0;
    onlyPayment: boolean;
    discountType: number = DiscountType.TYPE_DIAGNOSTIC_DISCOUNT;
    isOldRecord: boolean = false;
    isCentralBooking: boolean = false;
    isReceptionBooking: boolean = false;
    isOnboardingBooking: boolean = false;
    customerInteraction: CentralOrderInteraction = new CentralOrderInteraction();
    paymentStatusCheck: boolean = false;
    enableInvoiceSplitting: boolean = false;
    enableCreditUser: boolean = false;
    isBack: boolean = false;
    splitSlot: boolean = false;
    enableVdcCustomTag: boolean = false;
    enablePartialPayment: boolean = false;
    selectedPartialPayment: boolean = false;
    partialPaymentAmount: number = 0;
    disableMobile: boolean = false;
    branchWalkin: boolean = false;
    ageString: string = "";

    constructor(private auth: AuthService, private common: CommonUtil, private diagnosticsService: DiagnosticsService,
        private validationUtil: ValidationUtil, private hsLocalStorage: HsLocalStorage,
        private router: Router, private spinnerService: SpinnerService) {
        this.validation = validationUtil;
        this.customerInteraction = this.diagnosticsService.diagnosticsAdviseTrack;
        if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableInvoiceSplitting)
            this.enableInvoiceSplitting = true;
        if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableCreditUser)
            this.enableCreditUser = true;
        if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName)
            this.enableVdcCustomTag = true;
        if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.disableMobileAndEditOption)
            this.disableMobile = true;
    }

    ngOnInit() {
        if (this.diagnosticsService.slotBookingDetails) {
            console.log("Ifff:" + JSON.stringify(this.diagnosticsService.slotBookingDetails));
            let data = {
                'customerInteraction': this.customerInteraction,
                'slotBookingDetails': this.diagnosticsService.slotBookingDetails,
                'onlyPayment': this.diagnosticsService.onlyPayment,
                'isCentralBooking': this.diagnosticsService.isCentralBooking,
                'isOnboardingBooking': this.diagnosticsService.isOnboardingBooking,
                'isReceptionBooking': this.diagnosticsService.isFromPriscription,
                'scheduleId': this.diagnosticsService.scheduleId
            };
            this.hsLocalStorage.saveComponentData(data);
        } else {
            this.diagnosticsService.diagnosticsAdviseTrack = this.hsLocalStorage.getComponentData().customerInteraction;
            this.diagnosticsService.slotBookingDetails = this.hsLocalStorage.getComponentData().slotBookingDetails;
            this.diagnosticsService.onlyPayment = this.hsLocalStorage.getComponentData().onlyPayment;
            this.diagnosticsService.isCentralBooking = this.hsLocalStorage.getComponentData().isCentralBooking;
            this.diagnosticsService.isOnboardingBooking = this.hsLocalStorage.getComponentData().isOnboardingBooking;
            this.diagnosticsService.isFromPriscription = this.hsLocalStorage.getComponentData().isReceptionBooking;
        }

        this.slotBookingDetails = this.diagnosticsService.slotBookingDetails;
        this.onlyPayment = this.diagnosticsService.onlyPayment;
        this.isCentralBooking = this.diagnosticsService.isCentralBooking;
        this.isOnboardingBooking = this.diagnosticsService.isOnboardingBooking;
        this.isReceptionBooking = this.diagnosticsService.isFromPriscription;
        if (this.enableVdcCustomTag) {
            this.checkPaymentStatusSelection(0);
            this.paymentStatusCheck = true;
            if (!this.isCentralBooking)
                this.branchWalkin = true;
        }
        if (this.onlyPayment) {
            console.log("this.onlyPayment: " + this.onlyPayment);
            this.isOldRecord = true;
        }
        this.slotBookingDetails.serviceList.forEach(element => {
            this.promotionalDiscountAmount += +element.discountPrice;
        });
        if (this.enableCreditUser) {
            this.slotBookingDetails.payment.creditUser = 2;
        }
        if (this.slotBookingDetails.slotDate2 && this.slotBookingDetails.slotTime2) {
            this.splitSlot = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.enablePartialPayment && this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
            // Enabling partial payment for walk-in bookings case
            this.enablePartialPayment = true;
        }

        if(this.slotBookingDetails.patientProfileDetails.dob != undefined && this.slotBookingDetails.patientProfileDetails.dob != null) {
            let ageYears = 0;
            let ageMonths = 0;
            if (isNaN(parseInt(this.common.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[0]))) {
                ageYears = 0;
              } else {
                ageYears = parseInt(this.common.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[0]);
              }
              if (isNaN(parseInt(this.common.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[1]))) {
                ageMonths = 0;
              } else {
                ageMonths = parseInt(this.common.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[1]);
              }
              if(ageYears > 0 || ageMonths > 0)
              this.ageString = '' + ageYears +' Years ' + ageMonths + ' Months';
        }
        // as not paid as checked initially
        this.checkPaymentStatusSelection(0);
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
        num = num ;
        return +(Math.round(num) );
    }

    onSubmitChanges() {
        this.resetError();
        $('html, body').animate({ scrollTop: '0px' }, 300);
        if (this.enableCreditUser && this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN && this.diagnosticsService.clientDocumentList && this.diagnosticsService.clientDocumentList.length > 0) {
            if (this.slotBookingDetails.scanDocumentsList.length != this.diagnosticsService.clientDocumentList.length) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please upload atleast one file for each document type";
                this.showMessage = true;
                return;
            }
            for (var i = 0; i < this.slotBookingDetails.scanDocumentsList.length; i++) {
                if (this.slotBookingDetails.scanDocumentsList[i].scanDocuments && this.slotBookingDetails.scanDocumentsList[i].scanDocuments.length == 0) {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = "Please upload atleast one file for each document type";
                    this.showMessage = true;
                    return;
                }
            }
        }
        if (this.paymentModeIndex == 9 || this.paymentModeIndex == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select a payment mode";
            this.showMessage = true;
            return;
        }

        if(this.disableMobile && this.paymentModeIndex != 2 && this.paymentModeIndex != 5 && this.slotBookingDetails.payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID && this.transactionId.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter transaction id";
            this.showMessage = true;
            return;
        } 

        if (this.enablePartialPayment && this.selectedPartialPayment) {
            if (this.partialPaymentAmount <= 0) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Partial payment amount cannot be zero.";
                this.showMessage = true;
                return;
            } else if (this.partialPaymentAmount >= this.slotBookingDetails.payment.finalAmount) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Partial payment amount should be less than total payable amount.";
                this.showMessage = true;
                return;
            } else if (this.partialPaymentAmount < (+this.slotBookingDetails.payment.finalAmount * .5)) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Partial payment amount should be more than or equal to Rs." + this.roundToTwo((+this.slotBookingDetails.payment.finalAmount * .5));
                this.showMessage = true;
                return;
            }
        }

        if(this.disableMobile && this.slotBookingDetails.payment.otherDiscountAmount > 0 && (this.slotBookingDetails.discountRemarks == "" || this.slotBookingDetails.discountRemarks == undefined || this.slotBookingDetails.discountRemarks == null)) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter discount reason";
            this.showMessage = true;
            return;
        }
        
        if(this.disableMobile && this.slotBookingDetails.payment.otherDiscountAmount == 0)
            this.slotBookingDetails.discountRemarks = "";

        console.log("this.onlyPaymentt: " + this.onlyPayment);

        let basketRequest: BasketRequest = new BasketRequest();
        if (!this.slotBookingDetails.brandId || this.slotBookingDetails.brandId == 0) {
            if (this.slotBookingDetails.pocDetails && this.slotBookingDetails.pocDetails.brandId) {
                this.slotBookingDetails.brandId = this.slotBookingDetails.pocDetails.brandId;
            } else {
                this.slotBookingDetails.brandId = Config.portal.appId;
            }
        }

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
            this.slotBookingDetails.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
        }

        if (this.isOnboardingBooking || this.isReceptionBooking || this.paymentStatusCheck || this.slotBookingDetails.payment.creditUser == 1) {
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
        }

        if (this.slotBookingDetails.payment.creditUser == 1)
            this.slotBookingDetails.payment.transactionType = 2;

        if (!this.slotBookingDetails.empId || this.slotBookingDetails.empId == 0) {
            this.slotBookingDetails.empId = this.auth.employeeDetails.empId;
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

        if (this.enablePartialPayment && this.selectedPartialPayment && this.partialPaymentAmount > 0) {
            this.slotBookingDetails.payment.partialPayment = new Payment();
            this.slotBookingDetails.payment.partialPayment.amountToBePaid = +this.partialPaymentAmount;
            this.slotBookingDetails.payment.partialPayment.transactionType = Payment.PAYMENT_TYPE_ONLINE;
            this.slotBookingDetails.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
            this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
            basketRequest.partialPayment = true;
            basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
        }

        basketRequest.transactionSource = this.slotBookingDetails.paymentSource;
        basketRequest.totalOriginalAmount = this.slotBookingDetails.payment.originalAmount;
        basketRequest.totalFinalAmount = this.slotBookingDetails.payment.finalAmount;
        basketRequest.bookingSource = this.slotBookingDetails.bookingSource;
        basketRequest.parentProfileId = this.slotBookingDetails.parentProfileId;
        basketRequest.slotBookingDetailsList = new Array();
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        if (this.enableInvoiceSplitting) {
            this.diagnosticsService.splitOrder(this.slotBookingDetails).then(slotList => {
                basketRequest.slotBookingDetailsList = slotList;
                if (this.slotBookingDetails.spotBooking) {
                    basketRequest.slotBookingDetailsList[0].spotBooking = true;
                    if (basketRequest.slotBookingDetailsList.length > 1)
                        basketRequest.slotBookingDetailsList[1].spotBooking = true;
                }
                this.initiatePayment(basketRequest);
            }).catch(error => {
                this.spinnerService.stop();
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = 'Something went wrong.';
                this.isError = true;
                this.showMessage = true;
            })
        } else {
            basketRequest.slotBookingDetailsList = [];
            basketRequest.slotBookingDetailsList.push(this.slotBookingDetails);
            this.initiatePayment(basketRequest);
        }
    }

    private initiatePayment(basketRequest: BasketRequest) {
        this.diagnosticsService.initiatePayment(basketRequest).then(
            (response) => {
                if (response != null && response !== undefined
                    && (response.statusCode == 200 || response.statusCode == 201)) {
                    this.spinnerService.stop();
                    this.basketResponse = response;
                    if (this.basketResponse.slotBookingDetailsList && this.basketResponse.slotBookingDetailsList.length > 0) {
                        this.slotBookingDetails = this.basketResponse.slotBookingDetailsList[0];
                    }
                    if (this.customerInteraction != null && this.customerInteraction != undefined)
                        this.changeCustomerInteraction();
                    ($('#messageModal') as any).modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                    this.isBack = true;
                    window.localStorage.removeItem('isReceptionPrescription');
                    window.localStorage.removeItem('slotBookingDetails');
                } else {
                    this.spinnerService.stop();
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = response.statusMessage;
                    this.isError = true;
                    this.showMessage = true;
                }
            }).catch(err => {
                this.spinnerService.stop();
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = 'Something went wrong.';
                this.isError = true;
                this.showMessage = true;
            });
    }

    onProceedBack() {
        this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
    }

    onGenerateBack() {
        if (this.isReceptionBooking) {
            this.router.navigate(["/app/reception/prescription/prescription"]);
        } else if (this.isCentralBooking) {
            if (this.diagnosticsService.isOnboardingBooking) {
                this.router.navigate(['/app/diagnostics/slotbooking/slotselection/1/true']);
            } else {
                this.router.navigate(['/app/diagnostics/diagnosticadmin/requestorders']);
            }
        } else if (this.diagnosticsService.tempPdfUrl != null && this.diagnosticsService.tempPdfUrl != undefined && this.diagnosticsService.tempPdfUrl.length) {
            this.router.navigate([this.diagnosticsService.tempPdfUrl]);
        } else {
            if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
                this.router.navigate(['/app/diagnostics/homeorders/managehomeorderlist']);
            } else {
                this.router.navigate(['/app/diagnostics/slotbooking/slotqueue']);
            }
        }
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

    ngOnDestroy() {
        if (!this.isBack) {
            this.diagnosticsService.receptionPriscriptionDetails = this.slotBookingDetails;
            this.isReceptionBooking == null ? this.diagnosticsService.isFromPriscription = false : this.diagnosticsService.isFromPriscription = this.isReceptionBooking;
            this.isCentralBooking == null ? this.diagnosticsService.isCentralBooking = false : this.diagnosticsService.isCentralBooking = this.isCentralBooking;
            this.diagnosticsService.slotBookingSubType = this.slotBookingDetails.bookingSubType;
        }
        else {
            window.localStorage.removeItem('isReceptionPrescription');
            window.localStorage.removeItem('slotBookingDetails');
            window.localStorage.removeItem('onlyPayment');
            window.localStorage.removeItem('isCentralBooking');
            window.localStorage.removeItem('isReceptionBooking');
            window.localStorage.removeItem('scheduleId');
            window.localStorage.removeItem('firstClient');
            this.diagnosticsService.slotBookingDetails = null;
            this.diagnosticsService.onlyPayment = false;
            this.diagnosticsService.isCentralBooking = false;
            this.diagnosticsService.isOnboardingBooking = false;
            this.diagnosticsService.isFromPriscription = false;
            this.diagnosticsService.centralCheckForPaymentStatus = false;
            this.diagnosticsService.scheduleId = 0;
        }
    }

    changeCustomerInteraction() {
        this.customerInteraction.consumerInteractedEmpId = this.auth.userAuth.employeeId;
        this.customerInteraction.consumerInteractedEmployeeName = this.auth.userAuth.employeeName;
        this.customerInteraction.consumerInteractionDate = new Date().getTime();
        this.customerInteraction.consumerInteractedComments = "";
        this.customerInteraction.consumerInteractionStatus = "Interacted"; this.spinnerService.start();
        this.diagnosticsService.updateRequesAtCS(this.customerInteraction).then(response => {
            this.spinnerService.stop();
            if (response.statusCode === 200)
                this.diagnosticsService.diagnosticsAdviseTrack = null;
        });
    }

    onResetError(val) {
        this.resetError();
    }

    checkPartialPayment(num) {
        if (num == 1) {
            this.selectedPartialPayment = true;
        } else {
            this.selectedPartialPayment = false;
        }
    }

}