import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../../../auth/auth.service";
import { PaymentService } from "../../payment.service";
import { PatientQueueRequest } from './../../../model/reception/patientqueuerequest';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { PaymentType } from '../../../model/payment/paymentType';
import { Payment } from '../../../model/basket/payment';
import { CartItem } from '../../../model/basket/cartitem';
import { BaseResponse } from '../../../model/base/baseresponse';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { Config } from '../../../base/config';

@Component({
  selector: '[invoice-component]',
  templateUrl: './invoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./invoice.style.scss']
})
export class PaymentInvoiceComponent implements OnInit {
  config: any;
  paymentModeIndex: number;
  finalPaymentList: any;
  basketRequest: BasketRequest;
  paymentDeskListResponse: any;
  packageList: any;
  todayDate: any;
  patientQueRequest: PatientQueueRequest = new PatientQueueRequest();
  patientQueResponse: any;
  message: string;
  errorMessage: Array<string> = new Array<string>();
  isError: boolean;
  showMessage: boolean;
  showDoctorDescription: boolean = false;
  showItemDescription: boolean = false;
  showPrintOption: boolean = false;
  isPay: boolean = false;
  pdfHeaderType: number;
  transactionId: any;
  empId: number;
  currencySymbol: string = '';
  currentTime = new Date().getTime();

  constructor(private router: Router, private toast: ToasterService, private auth: AuthService, private diagnosticService: DiagnosticsService, private paymentservice: PaymentService, private spinnerService: SpinnerService) {
    this.todayDate = new Date().toDateString();
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
  }

  ngOnInit() {
    this.empId = this.auth.userAuth.employeeId;
    this.getPaymentDetailOfParticularProfile();
  }

  onGeneratePrint(): void {
    this.router.navigate(['/app/payment/print']);
  }

  getPaymentDetailOfParticularProfile() {
    this.finalPaymentList = this.paymentservice.getPaymentDeskResponseForPerson();
    if ((this.finalPaymentList.cartItemList != undefined && this.finalPaymentList.cartItemList.length > 0
      && this.finalPaymentList.cartItemList[0] != undefined && this.finalPaymentList.cartItemList[0].doctorDetail !== undefined) ||
      (this.finalPaymentList.slotBookingDetailsList != undefined && this.finalPaymentList.slotBookingDetailsList.length > 0
        && this.finalPaymentList.slotBookingDetailsList[0] != undefined && this.finalPaymentList.slotBookingDetailsList[0].doctorDetail != undefined)) {
      this.showDoctorDescription = true;
    }
    if (this.finalPaymentList.slotBookingDetailsList == undefined)
      this.showItemDescription = true;
    console.log("=====>>>>", JSON.stringify(this.finalPaymentList))
    if (!this.finalPaymentList.slotBookingDetailsList && !this.finalPaymentList.cartItemList) {
      this.router.navigate(['/app/payment/desk']);
    }
    this.paymentModeIndex = this.finalPaymentList.transactionType;
    this.transactionId = this.finalPaymentList.transactionId;
  }

  makePayment() {
    this.basketRequest = this.finalPaymentList;

      if (this.paymentModeIndex == 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Please select payment mode";
        this.showMessage = true;
        return;
      } else {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      }
      this.basketRequest = this.finalPaymentList;
      if (this.basketRequest.slotBookingDetailsList != undefined && this.basketRequest.slotBookingDetailsList.length > 0) {
        this.basketRequest.parentProfileId = this.basketRequest.slotBookingDetailsList[0].parentProfileId;
        this.basketRequest.cartItemList = new Array<CartItem>();
        console.log("=====>>> paymentMode " + this.paymentModeIndex)
        if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
          this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
          this.basketRequest.slotBookingDetailsList[0].payment.transactionType = this.paymentModeIndex;
          this.basketRequest.slotBookingDetailsList[0].payment.transactionId = this.transactionId;
          this.basketRequest.transactionType = this.paymentModeIndex;
          this.basketRequest.transactionId = this.transactionId;
          this.basketRequest.orderPaymentStatus = 1;
        } else if (this.paymentModeIndex == 5) {
          this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
          this.basketRequest.slotBookingDetailsList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
          this.basketRequest.transactionType = Payment.PAYMENT_TYPE_MOBILE;
          this.basketRequest.orderPaymentStatus = 0;

        }
        this.basketRequest.slotBookingDetailsList[0].addToConsultationQueue = false;
        this.basketRequest.bookingSource = this.basketRequest.slotBookingDetailsList[0].bookingSource;
        this.basketRequest.slotBookingDetailsList[0].paymentSource = 3;
      } else if (this.basketRequest.cartItemList && this.basketRequest.cartItemList.length > 0 && this.basketRequest.cartItemList[0]) {
        this.basketRequest.parentProfileId = this.basketRequest.cartItemList[0].parentProfileId;
        this.basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
        if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
          || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
          this.basketRequest.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
          this.basketRequest.cartItemList[0].payment.transactionType = this.paymentModeIndex;
          this.basketRequest.cartItemList[0].payment.transactionId = this.transactionId;
          this.basketRequest.transactionType = this.paymentModeIndex;
          this.basketRequest.transactionId = this.transactionId;
          this.basketRequest.orderPaymentStatus = 1;
        } else if (this.paymentModeIndex == 5) {
          this.basketRequest.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
          this.basketRequest.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
          this.basketRequest.orderPaymentStatus = 0;
        }
        // this.basketRequest.cartItemList[0].empId = this.empId;
        this.basketRequest.cartItemList[0].addToConsultationQueue = false;
        this.basketRequest.bookingSource = this.basketRequest.cartItemList[0].bookingSource;
        this.basketRequest.cartItemList[0].paymentSource = 3;
        this.finalPaymentList.paymentStatus = this.basketRequest.cartItemList[0].payment.paymentStatus;
      }

      // console.log(Payment.PAYMENT_TYPE_MOBILE + " ===========>>>payment " + this.basketRequest.slotBookingDetailsList[0].payment.transactionType)
      console.log("=====>>>>", JSON.stringify(this.basketRequest))

      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.paymentservice.initiatePayment(this.basketRequest).then(paymentDeskListResponse => {
        this.spinnerService.stop();
        this.paymentDeskListResponse = paymentDeskListResponse;
        if (this.paymentDeskListResponse && ((this.paymentDeskListResponse.cartItemList
          && this.paymentDeskListResponse.cartItemList.length > 0
          && (this.paymentDeskListResponse.cartItemList[0].statusCode == 200
            || this.paymentDeskListResponse.cartItemList[0].statusCode == 201))
          || (this.paymentDeskListResponse.slotBookingDetailsList
            && this.paymentDeskListResponse.slotBookingDetailsList.length > 0
            && (this.paymentDeskListResponse.slotBookingDetailsList[0].statusCode == 200
              || this.paymentDeskListResponse.slotBookingDetailsList[0].statusCode == 201)))
        ) {
          if (this.paymentModeIndex == 5) {
            this.goTopaymentDesk();
            // (<any>$("#confirmationModal")).modal("hide");
          }
          else {
            if (this.basketRequest.slotBookingDetailsList != undefined
              && this.basketRequest.slotBookingDetailsList.length > 0) {
              this.patientQueRequest.date = this.basketRequest.slotBookingDetailsList[0].slotDate;
              this.patientQueRequest.invoiceId = this.basketRequest.slotBookingDetailsList[0].invoiceId;
              this.patientQueRequest.digiQueue = false;
              this.patientQueRequest.doctorId = this.basketRequest.slotBookingDetailsList[0].doctorId;
              this.patientQueRequest.orderId = this.basketRequest.slotBookingDetailsList[0].orderId;
              this.patientQueRequest.patientId = this.basketRequest.slotBookingDetailsList[0].patientProfileId;
              this.patientQueRequest.patientStatus = 4;
              this.patientQueRequest.pocId = this.basketRequest.slotBookingDetailsList[0].pocId;
              this.patientQueRequest.time = this.basketRequest.slotBookingDetailsList[0].slotTime;
              this.updatePatientQueue(this.patientQueRequest);
            } else {
              (<any>$("#confirmationModal")).modal("show");
              this.showPrintOption = true;
            }
          }
        }
        else {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = paymentDeskListResponse.statusMessage;
          this.showMessage = true;
          return;
        }
      });
    
  }

  updatePatientQueue(patientQueRequest) {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.paymentservice.notifyCustomer(patientQueRequest).then(patientQueResponse => {
      this.spinnerService.stop();
      this.patientQueResponse = patientQueResponse;
      if (this.patientQueResponse.statusCode == 201 || this.patientQueResponse.statusCode == 200) {
        (<any>$("#confirmationModal")).modal("show");
        this.showPrintOption = true;
      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = patientQueResponse.statusMessage;
        this.showMessage = true;
        return;
      }
    });
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }

  goTopaymentDesk() {
    this.router.navigate(['/app/payment/desk']);
  }

  showPdf(pdfObj) {
    console.log(JSON.stringify(pdfObj));
    let pdfUrl = '';
    if (this.pdfHeaderType == 0) {
      pdfUrl = pdfObj.pdfUrlWithHeader;
    } else {
      pdfUrl = pdfObj.pdfUrlWithoutHeader;
    }
    this.auth.getTempUrl(pdfUrl).then((url: BaseResponse) => {
      if ((url.statusCode == 201 || url.statusCode == 200)) {
        this.auth.openPDF(url.data);
      } else {
        this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
    })
  }

}
