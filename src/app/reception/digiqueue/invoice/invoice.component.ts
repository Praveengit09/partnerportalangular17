import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHsPackageHistory } from './../../../model/package/userHsPackageHistory';
import { HsLocalStorage } from './../../../base/hsLocalStorage.service'
import { AuthService } from "../../../auth/auth.service";
import { PatientQueueRequest } from './../../../model/reception/patientqueuerequest';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { PaymentService } from '../../../payment/payment.service';
import { DigiQueueService } from '../digiqueue.service';
import { Payment } from '../../../model/basket/payment';

@Component({
  selector: '[invoice-component]',
  templateUrl: './invoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./invoice.style.scss']
})
export class PaymentInvoiceComponent implements OnInit {
  config: any;
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
  showPrintOption: boolean = false;
  isPay: boolean = false;
  pdfHeaderType: number;
  paymentType: any = 2;
  paymentModeIndex: any = 2;
  paymentErrorMessage: any;
  transactionId: any;
  confirmationMessage: string;

  constructor(private router: Router, private auth: AuthService,
    private diagnosticService: DiagnosticsService, private authService: AuthService,
    private paymentservice: PaymentService, private digiqueueService: DigiQueueService,
    private spinnerService: SpinnerService) {
    this.todayDate = new Date().toDateString();
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
  }

  ngOnInit() {
    if (this.diagnosticService.isNotReloaded) {
      this.getPaymentDetailOfParticularProfile();
    }
    else {
      window.history.back();
    }
  }
  getPaymentDetailOfParticularProfile() {
    this.finalPaymentList = this.digiqueueService.basketRequest;
    console.log("hiiii222" + JSON.stringify(this.finalPaymentList));
    if (!this.finalPaymentList && !this.finalPaymentList.slotBookingDetailsList) {
      console.log("hiiii");

      this.router.navigate(['./app/reception/digiqueue/queue'])
    }
  }
  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.paymentErrorMessage = "";
  }
  makePayment() {
    if (this.paymentModeIndex == 0) {
      this.paymentErrorMessage = "Please Select payment Type";
      return;
    }

    this.basketRequest = this.finalPaymentList;
    this.basketRequest.transactionType = this.paymentModeIndex;
    this.basketRequest.transactionId = this.transactionId;
    this.basketRequest.slotBookingDetailsList[0].payment.transactionType = this.transactionId;
    this.basketRequest.slotBookingDetailsList[0].payment.transactionType = this.basketRequest.transactionType;
    this.basketRequest.slotBookingDetailsList[0].paymentSource = 3;
    if(this.paymentModeIndex==Payment.PAYMENT_TYPE_MOBILE){
      this.confirmationMessage ="Payment request has been sent to mobile successfully!!"
      this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = Payment.PAYMENT_STATUS_NOT_PAID;
    }else{
      this.confirmationMessage ="Your payment has been successfully done!!"
      this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = Payment.PAYMENT_STATUS_PAID;
    }
    this.basketRequest.slotBookingDetailsList[0].empId = this.authService.userAuth.employeeId;
    this.basketRequest.bookingSource = this.basketRequest.slotBookingDetailsList[0].bookingSource;

    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.paymentservice.initiatePayment(this.basketRequest).then(paymentDeskListResponse => {
      this.spinnerService.stop();
      console.log("=======kkkkkkkkk" + JSON.stringify(paymentDeskListResponse));

      this.paymentDeskListResponse = paymentDeskListResponse;
      if (this.paymentDeskListResponse.statusCode == 200 || this.paymentDeskListResponse.statusCode == 201) {
        (<any>$("#confirmationModal")).modal("show");
        this.showPrintOption = true;
      }
    });
  }
  goTopaymentDesk() {
    this.router.navigate(['./app/reception/digiqueue/queue'])
  }

  showPdf(pdfObj) {
    console.log(JSON.stringify(pdfObj));
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(pdfObj.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(pdfObj.pdfUrlWithoutHeader);
    }
  }
}
