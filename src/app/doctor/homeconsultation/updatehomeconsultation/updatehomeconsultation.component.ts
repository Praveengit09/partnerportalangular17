import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { AuthService } from '../../../auth/auth.service';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import { DoctorService } from '../../doctor.service';
import { CryptoUtil } from '../../../auth/util/cryptoutil';
import { Router } from '@angular/router';
import { PaymentType } from '../../../model/payment/paymentType';
import { Payment } from './../../../model/basket/payment';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
@Component({
  selector: 'updatehomeconsultation',
  templateUrl: './updatehomeconsultation.template.html',
  styleUrls: ['./updatehomeconsultation.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UpdateHomeConsultationComponent implements OnInit {

  doctorHomeConsultTrack: SlotBookingDetails;
  slotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
  response: SlotBookingDetails = new SlotBookingDetails();
  empId: number;
  dropDownIndexValue: number = 11;
  paymentStatusIndex: number = 0;
  transactionTypeIndex: number = 2;
  transactionId: string;
  changeStatus: boolean = false;
  isError: boolean = false;
  errorMessage: Array<string>;
  showMessage: boolean = false;

  constructor(private authService: AuthService, private hsLocalStorage: HsLocalStorage,
    private doctorService: DoctorService, private router: Router, private spinnerService: SpinnerService) {
    this.empId = this.authService.userAuth.employeeId;
  }

  ngOnInit() {
    this.doctorHomeConsultTrack = this.doctorService.doctorHomeConsultTrack;
    if (this.doctorHomeConsultTrack != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('doctorHomeConsultTrack', cryptoUtil.encryptData(JSON.stringify(this.doctorHomeConsultTrack)));
    }
    else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('doctorHomeConsultTrack') != null) {
        this.doctorHomeConsultTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('doctorHomeConsultTrack')));
      }
    }
    if (this.doctorHomeConsultTrack.invoiceCompletionStatus == 5) {
      $("#invoiceCompletionStatusDrop").prop("disabled", "true")
    }
    this.transactionTypeIndex = this.doctorHomeConsultTrack.payment.transactionType;
    this.transactionId = this.doctorHomeConsultTrack.payment.transactionId;
    if (this.doctorHomeConsultTrack.invoiceCompletionStatus == 11) {
      this.dropDownIndexValue = 0;
    }
    else {
      this.dropDownIndexValue = this.doctorHomeConsultTrack.invoiceCompletionStatus;
    }

    this.paymentStatusIndex = this.doctorHomeConsultTrack.payment.paymentStatus;
    if (this.doctorHomeConsultTrack.payment.paymentStatus == 1) {
      this.changeStatus = true;
      console.log('changeStatus' + this.doctorHomeConsultTrack.payment.paymentStatus);
    }

  }

  doctorConsultationStatus(index: number) {

    this.resetErrorMessage();


  }

  doctorConsultationPaymentStatus(index: number) {
    this.paymentStatusIndex = index;
    this.resetErrorMessage();
  }

  checkPaymentMode(index: number) {
    this.transactionTypeIndex = index;
  }

  onUpdate() {

    if (this.dropDownIndexValue > 0) {
      if (this.dropDownIndexValue != 2)
        this.doctorHomeConsultTrack.invoiceCompletionStatus = this.dropDownIndexValue;
      if (this.dropDownIndexValue == 2)
        this.doctorHomeConsultTrack.cancellationStatus = this.dropDownIndexValue;
    }

    this.slotBookingDetails = this.doctorHomeConsultTrack;
    if (this.transactionTypeIndex == Payment.PAYMENT_TYPE_CARD
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_CASH
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_PHONEPE
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_PAYTM
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_NEFT
      || this.transactionTypeIndex == Payment.PAYMENT_TYPE_UPI) {
      this.slotBookingDetails.payment.transactionType = this.transactionTypeIndex;
      this.slotBookingDetails.payment.transactionId = this.transactionId;
    }
    else if (this.transactionTypeIndex == Payment.PAYMENT_TYPE_MOBILE) {
      this.slotBookingDetails.payment.transactionType = this.transactionTypeIndex;
    }
    if (this.paymentStatusIndex == 1) {
      this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
    } else if (this.paymentStatusIndex == 0) {
      this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    }
    if (this.dropDownIndexValue == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Consultation Status";
      this.showMessage = true;
      return;
    }
    else if (this.paymentStatusIndex == -1) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Payment Status";
      this.showMessage = true;
      return;
    }
    // else if(this.paymentStatusIndex == 0 && this.dropDownIndexValue == 5){
    //   this.isError = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "Please select correct payment status";
    //   this.showMessage = true;
    //   return;
    // }
    this.spinnerService.start();
    this.doctorService.UpdateHomeConsultationStatus(this.slotBookingDetails).then(response => {
      this.spinnerService.stop();
      this.response = response;

      if (this.response.statusCode == 200 || this.response.statusCode == 201) {
        window.alert('Successfully Updated');
        this.response = new SlotBookingDetails();
        this.goToDoctorHomeConsultationList();
      }
      else {
        window.alert("Something went wrong please try again...!!")
      }
    })
  }

  goToDoctorHomeConsultationList() {
    this.router.navigate(['app/doctor/doctorhomeconsult/listing']);
  }

  resetErrorMessage() {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }
}