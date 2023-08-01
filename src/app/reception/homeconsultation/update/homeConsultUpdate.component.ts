import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { CartItem } from './../../../model/basket/cartitem';
import { SelectedRegisteredProfile } from './../../../model/profile/selectedRegisteredProfile';
import { AppConfig } from './../../../app.config';
import { Directive, ElementRef, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { AuthService } from './../../../auth/auth.service';
import { Address } from './../../../model/profile/address';
import { NavigationStart, Router, ActivatedRoute, Params } from '@angular/router';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { ReceptionService } from './../../../reception/reception.service';
import { Doctor } from './../../../model/employee/doctor';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { RoleConstants } from './../../../constants/auth/roleconstants';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import { UpdateAddress } from '../../../model/profile/updateAddress';
import { PaymentType } from '../../../model/payment/paymentType';
import { Payment } from '../../../model/basket/payment';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { BasketResponse } from '../../../model/basket/basketResponse';
import { CommonUtil } from '../../../base/util/common-util';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { BasketConstants } from '../../../constants/basket/basketconstants';
import { DoctorService } from '../../../doctor/doctor.service';

@Component({
  selector: 'homeConsultUpdate',
  templateUrl: './homeConsultUpdate.template.html',
  styleUrls: ['./homeConsultUpdate.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeConsultationUpdateComponent implements OnInit {

  pocId: number;
  empId: number;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  paymentModeIndex: number;
  paymentModeStatusIndex: number = 0;
  basketResponse: BasketResponse;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  doctorList: Doctor[] = new Array<Doctor>();
  date: Date = new Date();
  Time: Date = new Date(1970, 0, 1);
  homeConsultTrack: SlotBookingDetails;
  paymentMode: number;
  homeConsultationFee: number;
  basketRequest: BasketRequest = new BasketRequest();
  response:SlotBookingDetails;
  orderId: any;
  invoiceId: string;
  cancelSlotResponse: any;
  time_From: any;
  time: any;
  fromMinutes: any;
  message: string;
  errorMessage1: Array<string>;
  isError1: boolean;
  disabled: boolean;
  showMessage1: boolean;
  fromTimeTimeStamp: number;
  locFromTime: number = -this.commonUtil.getTimezoneDifferential();
  TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();
  dropDownIndexValue: number = 0;
  transactionId: any;
  select: number = 0;
  // date: Date = new Date(2016, 5, 10);

  datepickerOpts = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }


  constructor(
    private receptionService: ReceptionService, private diagnosticService: DiagnosticsService,
    private authService: AuthService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil,private doctorService:DoctorService) {
    // this.config = config.getConfig();
    this.pocId = this.authService.userAuth.pocId;
    this.empId = this.authService.userAuth.employeeId;
  }


  ngOnInit() {
    this.getDoctorslist();

    this.homeConsultTrack = this.receptionService.homeConsultTrack;

    
    if (this.homeConsultTrack != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('homeConsultTrack', cryptoUtil.encryptData(JSON.stringify(this.homeConsultTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('homeConsultTrack') != null) {
        this.homeConsultTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('homeConsultTrack')));
      }
    }
    console.log("@$homeConsultTrack" + JSON.stringify(this.homeConsultTrack));
    console.log("@@transactionType" + this.homeConsultTrack.payment.transactionType);
    this.paymentModeIndex = this.homeConsultTrack.payment.transactionType;
    console.log('paymentmodeindex'+this.paymentModeIndex)
    this.dropDownIndexValue = this.paymentModeIndex;
    this.homeConsultationFee = this.homeConsultTrack.payment.finalAmount;
    this.transactionId = this.homeConsultTrack.payment.transactionId;
    this.select = this.homeConsultTrack.invoiceCompletionStatus;
    this.paymentModeStatusIndex = this.homeConsultTrack.payment.paymentStatus;
    console.log("$$transactionId" + this.select);
    if (new Date() > new Date((this.homeConsultTrack.slotDate) + this.commonUtil.getTimezoneDifferential())) {
      this.date = new Date();
    }
    else {
      this.date = new Date((this.homeConsultTrack.slotDate) + this.commonUtil.getTimezoneDifferential());
    }
    this.Time = new Date(this.homeConsultTrack.slotTime);
  
}


  getDoctorslist(): void {
    this.receptionService.getDoctorList(this.pocId, this.empId, RoleConstants.receptionRoleId).then((doctor) => {
      this.doctorList = doctor;
    });
  }

  goToHomeConsultationList() {
    this.router.navigate(['app/reception/homeconsult/listing']);
  }

  checkPaymentModeSelection(index: number) {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.paymentModeIndex = index;
    console.log('paymentmodeIndex'+this.paymentModeIndex)
    this.dropDownIndexValue = index;
  }
  checkPaymentModeStatus(index: number) {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.paymentModeStatusIndex = index;
  }
  checkConsultationStatus(index: number) {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    // if (index == 19) {
    //   this.homeConsultTrack.cancellationStatus = +BasketConstants.DOCTOR_UNAVAILABLE_CANCELLED;

    // } else {
    //   this.homeConsultTrack.invoiceCompletionStatus = +index;
    // }
  }
 
  onUpdate() {

    var date = new Date(this.date.getFullYear(), this.date.getMonth(),
    this.date.getDate(), 0, 0, 0).getTime();

     if (this.select == 19) {
      this.homeConsultTrack.cancellationStatus = +BasketConstants.DOCTOR_UNAVAILABLE_CANCELLED;
    } else {
      this.homeConsultTrack.invoiceCompletionStatus = +this.select;
    }
    console.log("##" + this.homeConsultTrack.payment.finalAmount);
    this.homeConsultTrack.slotDate = date;
    this.basketRequest.orderId = this.homeConsultTrack.orderId;
    this.basketRequest.parentProfileId = this.homeConsultTrack.parentProfileId;
    if (this.Time) {
      this.homeConsultTrack.slotTime = this.Time.getTime();
    }
    else {
      this.homeConsultTrack.slotTime = this.homeConsultTrack.slotTime;
    }

    if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
      this.homeConsultTrack.payment.transactionType = this.paymentModeIndex;
        this.homeConsultTrack.payment.transactionId = this.transactionId;
    }
    else if (this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE) {
      this.homeConsultTrack.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;


    }

    // -----------------
    if (this.paymentModeStatusIndex == 1) {
      this.homeConsultTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
    } else if (this.paymentModeStatusIndex == 2) {
      this.homeConsultTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    }
  if (this.paymentModeIndex == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Mode of Payment !!";
      this.showMessage = true;
      return;
    }
    else if (!this.homeConsultTrack.invoiceCompletionStatus
      || ((!this.homeConsultTrack.cancellationStatus || this.homeConsultTrack.cancellationStatus == BasketConstants.ACTIVE)
        && this.homeConsultTrack.invoiceCompletionStatus <= 1)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Consultation Status...!!";
      this.showMessage = true;
      return;
    }
    else if (this.paymentModeStatusIndex == undefined) {
      if (!this.homeConsultTrack.payment.paymentStatus) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Please Select Payment Status ...!!";
        this.showMessage = true;
        return;
      }

    }
    else if(this.homeConsultTrack.payment.paymentStatus == 0  && this.homeConsultTrack.invoiceCompletionStatus == 5)
    {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Correct Payment Status ...!!";
      this.showMessage = true;
      return;
    }

    else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    this.basketRequest.slotBookingDetailsList[0] = this.homeConsultTrack;
    console.log('###paymentmodeindex'+this.homeConsultTrack.payment.transactionType)
    this.basketRequest.transactionType = this.homeConsultTrack.payment.transactionType;
    console.log('####paymentmodeindex'+this.basketRequest.transactionType);
    this.basketRequest.transactionId = this.homeConsultTrack.payment.transactionId;
    console.log('@!!transactionType'+this.homeConsultTrack.payment.transactionType);
      this.spinnerService.start();
   this.doctorService.UpdateHomeConsultationStatus(this.homeConsultTrack).then(basketresp => {
        this.spinnerService.stop();
        this.response = basketresp;
        if (this.response.statusCode == 200 || this.response.statusCode == 201) {
          this.basketRequest = new BasketRequest();
          alert(this.response.statusMessage);
          this.goToHomeConsultationList();
        }
        else {
          window.alert("Something went wrong please try again...!!")
        }
      })
    
  }

  onCancel() {

    this.orderId = this.homeConsultTrack.orderId;
    this.invoiceId = this.homeConsultTrack.invoiceId;
    this.spinnerService.start();
    this.diagnosticService.cancelBookedSlot(this.orderId, this.invoiceId, 0, this.empId).then((cancelSlotResponse) => {
      this.spinnerService.stop();
      this.cancelSlotResponse = cancelSlotResponse;
      if (this.cancelSlotResponse.statusCode == 405 || this.cancelSlotResponse.statusCode == 200) {
        window.alert("Order Cancelled Successfully!!!");
        this.goToHomeConsultationList();
      }
    });
  }

}