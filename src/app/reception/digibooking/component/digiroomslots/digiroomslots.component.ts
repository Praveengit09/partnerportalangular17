import { Component, ViewEncapsulation, OnChanges, OnInit, Input, Output, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Doctor } from '../../../../model/employee/doctor';
import { ReceptionService } from '../../../reception.service';
import { TimeSlot } from '../../../../model/reception/timeslot';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { PatientSlots } from '../../../../model/slotbooking/patientslots';
import { SlotSummary } from '../../../../model/reception/slotSummary';
import { DatePipe } from '@angular/common';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { BasketResponse } from '../../../../model/basket/basketResponse';
import { UserHsPackage } from '../../../../model/package/userHsPackage';
import { BasketDiscount } from '../../../../model/package/basketDiscount';
import { RegistrationVO } from '../../../../model/profile/registrationVO';
import { PackageService } from '../../../../packages/package.service';
import { DiscountType } from '../../../../model/package/discountType';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { Payment } from '../../../../model/basket/payment';
import { POCService } from '../../../../poc/poc.service';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { AuthService } from '../../../../auth/auth.service';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { Config } from '../../../../base/config';
import { PaymentType } from '../../../../model/payment/paymentType';


@Component({
  selector: 'digiroom',
  templateUrl: './digiroomslots.template.html',
  styleUrls: ['./digiroomslots.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class DigiRoomSlotsComponent implements OnInit {
  docSavedData: any = new Array();
  emptyString: string = " ";
  defaultDoctorImgUrl = "assets/img/doctor.png";
  pocId: number = 0;;
  convertedTimeSlot = new Array<TimeSlot>();
  totalConvertedTimeSlot = new Array<TimeSlot>();
  patientSlots: PatientSlots;
  selctedSlotInfo: SlotSummary = new SlotSummary();
  currentTime: number;
  currentDate: number;
  datePipe = new DatePipe("en-US");
  date: Date = new Date();
  totalSlots = 0;
  emptySlots = 0;
  testTime: any;
  continueDisabled = 0;
  revenueDetails: any;
  consultaionFee = 0;
  consultaionFeeInPerson = 0;
  otherDiscountAmount = 0;
  packageDiscount = 0;
  finalAmount = 0;
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  ispackagesAvailable = false;
  isSlotsDisable = false;
  basketRequest: BasketRequest = new BasketRequest();
  userBookedHsPackage: BookedPackageResponse = new BookedPackageResponse();
  // patientConsultationQueueList = new Array<PatientQueue>();
  basketResponse: BasketResponse;
  datepickerToOpts: any = {};
  selectedDoctor: Doctor;
  disabled: boolean = true;
  userHsPackage = new UserHsPackage();
  bookedPackages: BookedPackageResponse[] = new Array<BookedPackageResponse>();;
  otherDiscounts: Array<BasketDiscount>;
  selectedPackageModel: any;
  selectedDiscountModel: any;
  slotClickDateSlot: TimeSlot;
  dropDownIndexForPackages: number = 0;
  packagesBookedDropDown: string[] = new Array<string>();
  selectSlotTimeErrMsg: string;
  selectSlotTimeErrMsg1: string;
  selectedProfile: RegistrationVO;
  parentProfile: RegistrationVO;
  isWalkInClicked: boolean = false;
  selectedDate = new Date();
  slotBookingDetails = new SlotBookingDetails();
  otherDiscountValue: number = 0;
  otherDiscountPercent: number = 0;
  basketDiscount = new BasketDiscount();
  otherDiscountPrice: any;
  grandTotalAmount: number = 0;
  paymentErrorMessage: any;
  selectedSlotDate: any;
  bookedSlots = 0;
  transactionTypeForWalkIn: any;
  bookingType: number;
  status: number;
  bookingPocIdLocal: number;
  paymentModeIndex: any = 2;
  transactionId: any;
  enableDigi: boolean = false;
  hasDigiPoc: boolean = false;
  hasDigiDoc: boolean = false;
  hasVideoDoc: boolean = false;
  hasInPersonDoc: boolean = false;
  error: boolean = false;
  datepickerOpts = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }
  discountType: number = DiscountType.TYPE_CONSULTATION_DISCOUNT;
  tempSlotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
  isFromAppReq: boolean = false;
  reqDetail: any;
  selectedPartialPayment: boolean = false;
  partialPaymentAmount: number = 0;

  constructor(private activatedRoute: ActivatedRoute, private receptionService: ReceptionService, private auth: AuthService, private validation: ValidationUtil,
    private common: CommonUtil, private cd: ChangeDetectorRef, private packageService: PackageService, private spinnerService: SpinnerService,
    public pocService: POCService, private diagnosticService: DiagnosticsService, private router: Router) {
    this.bookingPocIdLocal = this.auth.selectedPocDetails.pocId;
    this.validation = validation;
  }

  ngOnInit(): void {
    this.disabled = true;
    this.bookingType = 3;
    this.docSavedData = this.receptionService.docData;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.docSavedData != undefined && this.docSavedData != null) {
      window.localStorage.setItem('docSavedData', cryptoUtil.encryptData(JSON.stringify(this.docSavedData)));
    } else {
      if (window.localStorage.getItem('docSavedData') != null && window.localStorage.getItem('docSavedData').length > 0) {
        this.docSavedData = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('docSavedData')));
      }
    }
    if (window.localStorage.getItem('isFromAppReq') != null) {
      this.isFromAppReq = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('isFromAppReq')));
      if (this.isFromAppReq) {
        if (window.localStorage.getItem('appReqPatDet') != null) {
          this.reqDetail = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('appReqPatDet')));
          console.log("reqDetail: ", this.reqDetail);
        }
      }
    }
    this.hasDigiPoc = this.auth.selectedPocDetails.hasDigi;
    this.hasDigiDoc = this.docSavedData.employeePocMapping.participationSettings.doctorDigiAvailable;
    if (this.docSavedData.employeePocMapping.participationSettings && this.docSavedData.employeePocMapping.participationSettings.doctorVideoLaterAvailable) {
      this.hasVideoDoc = this.docSavedData.employeePocMapping.participationSettings.doctorVideoLaterAvailable;
    }
    if (this.docSavedData.employeePocMapping.participationSettings && this.docSavedData.employeePocMapping.participationSettings.doctorPhysicallyAvailable) {
      this.hasInPersonDoc = this.docSavedData.employeePocMapping.participationSettings.doctorPhysicallyAvailable;
    }
    this.pocId = this.docSavedData.employeePocMapping.pocId
    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.digiReception) {
      this.enableDigi = true;
    }

  }

  onContinueClick() {
    this.isWalkInClicked = false;
    this.dropDownIndexForPackages = 0;
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.paymentErrorMessage = "";
  }

  onDisplaySlotButtonClick() {
    this.isSlotsDisable = true;
    if (this.pocId == 0) {
      this.error = true;
      return;
    }
    this.error = false;
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.disabled = true;
    //this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    //this.patientSlots = patientSlot;
    var todaysdate = new Date();
    todaysdate.setFullYear(1970, 0, 1);
    this.currentTime = todaysdate.getTime();
    //this.date = new Date();
    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    this.getRefreshedTimeSlot(2);
  }

  getTimeSlotsForDoctor(patientSlot) {
    this.selctedSlotInfo.availableSlots = new Array<String>();
    this.selctedSlotInfo.availableDates = new Array<String>();
    this.patientSlots = patientSlot;
    var todaysdate = new Date();
    todaysdate.setFullYear(1970, 0, 1);
    this.currentTime = todaysdate.getTime();
    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    this.patientSlots.slots.sort(function (a, b) { return a.actualDate - b.actualDate }).forEach(slot => {
      var availableDate = this.datePipe.transform(slot.actualDate, 'dd/MMM/yyyy');
      this.selctedSlotInfo.availableDates.push(availableDate);
      if (slot.actualDate == this.date.getTime()) {
        slot.dateSlots.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {

          this.convertTimeStamptotime(timeslot);
        });
        this.testTime = this.convertedTimeSlot;
      }
    });

  }

  convertTimeStamptotime(timeslot: any) {
    let strTime = this.getStringTimeFromTimeStampTo(timeslot);
    var slotTime = new TimeSlot();
    slotTime.timeString = strTime;
    slotTime.time = timeslot.time;
    slotTime.patientProfileId = timeslot.patientProfileId;
    slotTime.parentProfileId = timeslot.parentProfileId;
    slotTime.doctorId = timeslot.doctorId;
    slotTime.doctorFirstName = timeslot.doctorFirstName;
    slotTime.doctorLastName = timeslot.doctorLastName ? timeslot.doctorLastName : '';
    slotTime.doctorTitle = timeslot.doctorTitle;
    slotTime.patientProfilePic = timeslot.patientProfilePic;
    slotTime.patientContactNumber = timeslot.patientContactNumber;
    slotTime.bookingSubType = timeslot.bookingSubType;
    slotTime.serviceId = timeslot.serviceId;
    slotTime.pocId = timeslot.pocId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.status = timeslot.status;
    slotTime.roomNumber = timeslot.roomNumber;
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientFirstName = timeslot.patientFirstName;
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientLastName = timeslot.patientLastName ? timeslot.patientLastName : '';
    slotTime.patientDOB = timeslot.patientDOB;
    slotTime.age = this.common.getAge(timeslot.patientDOB).split(",")[0] + this.common.getAge(timeslot.patientDOB).split(",")[1];
    slotTime.patientGender = timeslot.patientGender;
    slotTime.orderId = timeslot.orderId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.payment = timeslot.payment;
    slotTime.visitDetails = timeslot.visitDetails;
    var todayDate = new Date();
    todayDate.setHours(0);
    todayDate.setMinutes(0);
    todayDate.setSeconds(0);
    todayDate.setMilliseconds(0);
    if (todayDate.getTime() == this.date.getTime()) {
      slotTime.isDisabled = timeslot.time > this.currentTime;
    } else {
      slotTime.isDisabled = true;
    }

    if (slotTime.status == 0 && slotTime.isDisabled) {
      this.selctedSlotInfo.availableSlots.push(strTime);
      this.emptySlots = this.emptySlots + 1;
    }
    this.totalSlots = this.totalSlots + 1;

    this.convertedTimeSlot.push(slotTime);
    this.totalConvertedTimeSlot.push(slotTime);
  }

  getStringTimeFromTimeStampTo(timeslot: any) {
    var date = new Date(timeslot.time);
    var hours = date.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strhours = hours < 10 ? "0" + hours : hours;
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var strTime = strhours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  getRefreshedTimeSlot(nav): void {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.docSavedData.empId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.pocId, this.docSavedData.serviceId, this.docSavedData.empId, false).then((doctortimeSlot) => {
        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        if (this.patientSlots.slots.length == 0 || this.patientSlots.slots == undefined) {

          this.selectSlotTimeErrMsg1 = "slots are not available "
        }
        if ((this.patientSlots.slots.find(slot => slot.actualDate == this.date.getTime())) == undefined) {
          this.selectSlotTimeErrMsg1 = "slots are not available "
        }
        else {
          this.selectSlotTimeErrMsg1 = " "
        }

        if (this.patientSlots != undefined && nav == 2) {
          this.patientSlots.slots.forEach(slot => {
            var availableDate = this.datePipe.transform(slot.actualDate, 'dd/MMM/yyyy');
            this.selctedSlotInfo.availableDates.push(availableDate);
            if (slot.actualDate == this.date.getTime()) {
              slot.dateSlots.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {
                this.convertTimeStamptotimeForBooked(timeslot, 2)
                this.continueDisabled = 3;
              })
            }
          });
          if (this.totalSlots > 0) {
            $(".order_list ul li#total").removeClass('slotactive');
            $(".order_list ul li#booked").removeClass('slotactive');
            $(".order_list ul li#empty").addClass('slotactive');
          }
        } else if (this.patientSlots != undefined && nav == 1) {
          this.patientSlots.slots.forEach(slot => {
            var availableDate = this.datePipe.transform(slot.actualDate, 'dd/MMM/yyyy');
            this.selctedSlotInfo.availableDates.push(availableDate);
            if (slot.actualDate == this.date.getTime()) {
              slot.dateSlots.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {
                this.convertTimeStamptotimeForBooked(timeslot, 1);
                this.continueDisabled = 0;
              })
            }
          });

          this.continueDisabled = 2;
          if (this.totalSlots > 0) {
            $(".order_list ul li#empty").removeClass('slotactive');
            $(".order_list ul li#total").removeClass('slotactive');
            $(".order_list ul li#booked").addClass('slotactive');
          }
        }
      });
    }
  }

  convertTimeStamptotimeForBooked(timeslot: any, nav) {
    let strTime = this.getStringTimeFromTimeStampTo(timeslot);
    var slotTime = new TimeSlot();
    slotTime.timeString = strTime;
    slotTime.time = timeslot.time;
    slotTime.patientProfileId = timeslot.patientProfileId;
    slotTime.parentProfileId = timeslot.parentProfileId;
    slotTime.doctorId = timeslot.doctorId;
    slotTime.doctorFirstName = timeslot.doctorFirstName;
    slotTime.doctorLastName = timeslot.doctorLastName ? timeslot.doctorLastName : '';
    slotTime.doctorTitle = timeslot.doctorTitle;
    slotTime.patientProfilePic = timeslot.patientProfilePic;
    slotTime.patientContactNumber = timeslot.patientContactNumber;
    slotTime.bookingSubType = timeslot.bookingSubType;
    slotTime.serviceId = timeslot.serviceId;
    slotTime.pocId = timeslot.pocId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.status = timeslot.status;
    slotTime.roomNumber = timeslot.roomNumber;
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientFirstName = timeslot.patientFirstName;
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientLastName = timeslot.patientLastName ? timeslot.patientLastName : '';
    slotTime.patientDOB = timeslot.patientDOB;
    slotTime.age = this.common.getAge(timeslot.patientDOB).split(",")[0] + this.common.getAge(timeslot.patientDOB).split(",")[1];
    slotTime.patientGender = timeslot.patientGender;
    slotTime.orderId = timeslot.orderId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.payment = timeslot.payment;
    slotTime.visitDetails = timeslot.visitDetails;
    var todayDate = new Date();
    todayDate.setHours(0);
    todayDate.setMinutes(0);
    todayDate.setSeconds(0);
    todayDate.setMilliseconds(0);
    if (todayDate.getTime() == this.date.getTime()) {
      slotTime.isDisabled = timeslot.time > this.currentTime;
    } else {
      slotTime.isDisabled = true;
    }

    if ((slotTime.status == 0 || slotTime.status == 1 || slotTime.status == 2) && slotTime.isDisabled && nav == 2) {
      this.selctedSlotInfo.availableSlots.push(strTime);
      this.convertedTimeSlot.push(slotTime);
    } else if (slotTime.status != 0 && nav == 1) {
      this.convertedTimeSlot.push(slotTime);
    }

    if (slotTime.status != 0) {
    }
    if (slotTime.status == 0 && slotTime.isDisabled) {
      this.emptySlots = this.emptySlots + 1;
    }
    this.totalSlots = this.totalSlots + 1;
    this.totalConvertedTimeSlot.push(slotTime);
  }

  profileVisitedDetails(details) {
    this.revenueDetails = details;
  }

  onRegisterNewUser(selectedProfile: SelectedRegisteredProfile) {
    this.packageDiscount = 0;
    this.selectedProfile = selectedProfile.selectedProfile;
    this.parentProfile = selectedProfile.selfProfile;
    this.bookedPackages = null;
    this.otherDiscounts = null;
    this.otherDiscountValue = 0;
    this.otherDiscountPercent = 0;
    this.isPercent = true;
    this.isValue = false;

    this.selctedSlotInfo.doctorName = (this.docSavedData.title ? this.docSavedData.title : '') + ' ' +
      (this.docSavedData.firstName ? this.docSavedData.firstName : '') + " " +
      (this.docSavedData.lastName ? this.docSavedData.lastName : '');

    console.log('Selected doctor details is....' + JSON.stringify(this.docSavedData));
    console.log(JSON.stringify(this.docSavedData.employeePocMapping));

    if (this.docSavedData.employeePocMapping && this.docSavedData.employeePocMapping.serviceDetails
      && this.docSavedData.employeePocMapping.serviceDetails.serviceId) {
      this.consultaionFeeInPerson = this.docSavedData.employeePocMapping.serviceDetails.walkinConsultationFee ? this.docSavedData.employeePocMapping.serviceDetails.walkinConsultationFee : 0;
      if (this.bookingType == 1) {
        this.paymentModeIndex = 2;
        this.consultaionFee = this.docSavedData.employeePocMapping.serviceDetails.digiConsultationFee;
      } else if (this.bookingType == 3) {
        this.paymentModeIndex = 5;
        this.consultaionFee = this.docSavedData.employeePocMapping.serviceDetails.videoLaterConsultationFee;
      } else {
        this.paymentModeIndex = 2;
        this.consultaionFee = this.consultaionFeeInPerson;
      }
      this.finalAmount = this.consultaionFee;
    }

    this.bookedPackages = new Array<BookedPackageResponse>();
    this.packagesBookedDropDown = new Array<string>();
    this.packagesBookedDropDown[0] = "Select Package";

    this.slotBookingDetails = new SlotBookingDetails();
    this.slotBookingDetails.basketDiscount = new Array<BasketDiscount>();

    let payment = new Payment();
    payment.originalAmount = this.consultaionFee;
    payment.finalAmount = this.consultaionFee;
    this.slotBookingDetails.payment = payment;
    this.slotBookingDetails.patientProfileDetails = this.parentProfile;
    this.slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
    this.slotBookingDetails.parentProfileId = this.selectedProfile.relationShipId;
    this.slotBookingDetails.patientProfileId = this.selectedProfile.profileId;
    this.slotBookingDetails.pocId = this.patientSlots.pocId;
    this.slotBookingDetails.serviceId = this.docSavedData.serviceId;
    this.slotBookingDetails.serviceName = this.docSavedData.serviceName;
    this.slotBookingDetails.slotStatus = 0;
    if (this.isWalkInClicked) {
      var today = new Date();
      this.slotBookingDetails.slotTime = new Date(1970, 0, 1, today.getHours(), today.getMinutes(), 0, 0).getTime();
      this.slotBookingDetails.slotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime();
    } else {
      this.slotBookingDetails.slotTime = this.getTimeStampFromOnlytime(this.selctedSlotInfo.slot);
      this.slotBookingDetails.slotDate = new Date(this.selctedSlotInfo.date).getTime();
    }
    this.slotBookingDetails.doctorId = this.patientSlots.doctorId;

    (<any>$('#myrecption')).modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    (<any>$('#recption-3')).modal('show');
    (<any>$("body")).addClass("modal-open");
    jQuery(".modal").appendTo("body");
    jQuery(".modal-open").appendTo("body");

    jQuery('#edit_show').hide();
    jQuery('#edit_hide').show();
    jQuery('#bottonHide').show();

    if ((this.hasDigiDoc != true || this.hasDigiPoc != true) && this.hasVideoDoc != true && this.hasInPersonDoc == true) {
      setTimeout(() => {
        (<any>$("#inPerson")).prop("checked", true);
        (<any>$("#video")).prop("checked", false);
        (<any>$("#digi")).prop("checked", false);
        this.onBookingTypeChange(2);
      }, 100);
    } else if (this.hasVideoDoc == true) {
      setTimeout(() => {
        (<any>$("#video")).prop("checked", true);
        (<any>$("#inPerson")).prop("checked", false);
        (<any>$("#digi")).prop("checked", false);
        this.onBookingTypeChange(3);
      }, 100);
    } else {
      (<any>$("#inPerson")).prop("checked", false);
      (<any>$("#video")).prop("checked", false);
      (<any>$("#digi")).prop("checked", true);
      this.onBookingTypeChange(1);
    }
  }

  editText() {
    jQuery('#edit_show').show();
    jQuery('#edit_hide').hide();
    jQuery('#bottonHide').hide();
  }

  getSlotDetail(event: any, timeslot: TimeSlot) {
    this.disabled = false;
    this.selctedSlotInfo.doctorName = this.docSavedData.firstName + " " + this.docSavedData.lastName;
    this.selctedSlotInfo.slot = timeslot.timeString;
    this.selctedSlotInfo.date = this.datePipe.transform(this.date.getTime(), 'dd/MMM/yyyy');
    this.continueDisabled = 1;
  }

  updateSlotDate($event) {
    this.selctedSlotInfo.availableSlots = new Array<String>();
    this.selctedSlotInfo.date = $event.target.value;
    this.selectedDate = new Date(this.selctedSlotInfo.date);
    this.selectedDate.setHours(0);
    this.selectedDate.setMinutes(0);
    this.selectedDate.setSeconds(0);
    this.selectedDate.setMilliseconds(0);

    let todayDate = new Date();
    todayDate.setHours(0);
    todayDate.setMinutes(0);
    todayDate.setSeconds(0);
    todayDate.setMilliseconds(0);
    this.patientSlots.slots.forEach(slot => {
      if (slot.actualDate == this.selectedDate.getTime()) {
        slot.dateSlots.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {
          if (timeslot.status == 0) {
            let strTime: string;
            if (todayDate.getTime() == this.selectedDate.getTime() && timeslot.time > this.currentTime) {
              strTime = this.getStringTimeFromTimeStampTo(timeslot);
              this.selctedSlotInfo.availableSlots.push(strTime);
            } else if (todayDate.getTime() != this.selectedDate.getTime()) {
              strTime = this.getStringTimeFromTimeStampTo(timeslot);
              this.selctedSlotInfo.availableSlots.push(strTime);
            }

          }
        });
      }
    });
    this.selctedSlotInfo.slot = undefined;
    this.selectSlotTimeErrMsg = '';
  }

  updateSlotTime($event) {
    this.selctedSlotInfo.slot = $event.target.value;
  }

  editTextUpdate() {
    if (this.selctedSlotInfo.slot != undefined && this.selctedSlotInfo.slot != '') {
      jQuery('#edit_show').hide();
      jQuery('#edit_hide').show();
      jQuery('#bottonHide').show();
    } else {
      this.selectSlotTimeErrMsg = "Please Select Slot Time";
    }
  }

  getTimeStampFromOnlytime(time: String) {
    var ampm = time.substring(6, 8);
    var slotTimeStr = time.substring(0, 5);
    var timeArr = slotTimeStr.split(':');
    var date = new Date();
    date.setFullYear(1970, 0, 1);
    var hour = parseInt(timeArr[0]);
    if (ampm == 'PM' && hour !== 12) {
      hour = parseInt(timeArr[0]) + 12;
    }
    date.setHours(hour);
    date.setMinutes(parseInt(timeArr[1]));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  onCalculateDiscount(slotBookingDetails): void {
    this.finalAmount = slotBookingDetails.payment.finalAmount;
    this.tempSlotBookingDetails = slotBookingDetails;
  }

  updatePaymentProviderDetails() {
    if (this.paymentModeIndex == 0) {
      this.paymentErrorMessage = "Please Select payment mode";
      return;
    }

    if (this.isFromAppReq && this.selectedPartialPayment) {
      if (this.partialPaymentAmount <= 0) {
        this.paymentErrorMessage = "Partial payment amount cannot be zero.";
        return;
      } else if (this.partialPaymentAmount >= this.slotBookingDetails.payment.finalAmount) {
        this.paymentErrorMessage = "Partial payment amount should be less than total payable amount.";
        return;
      } 
      // else if (this.partialPaymentAmount < (+this.slotBookingDetails.payment.finalAmount * .5)) {
      //   this.paymentErrorMessage = "Partial payment amount should be more than or equal to Rs." + this.roundToTwo((+this.slotBookingDetails.payment.finalAmount * .5));
      //   return;
      // }
    }

    this.basketRequest.transactionType = this.paymentModeIndex;
    this.basketRequest.transactionId = this.transactionId;

    if (this.finalAmount >= 0) {
      if (this.consultaionFee == this.packageDiscount) {
        this.basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
      }

      var slotBookingDetails = new SlotBookingDetails;
      slotBookingDetails = this.tempSlotBookingDetails;

      this.basketRequest.parentProfileId = this.selectedProfile.relationShipId;
      slotBookingDetails.slotDate = this.convertDateToTimestamp(this.selectedDate);
      slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
      slotBookingDetails.parentProfileId = this.selectedProfile.relationShipId;
      slotBookingDetails.patientProfileId = this.selectedProfile.profileId;
      // slotBookingDetails.userPackageId = this.userBookedHsPackage.userPackageId;
      slotBookingDetails.pocId = this.pocId;
      slotBookingDetails.bookingPocId = this.bookingPocIdLocal;
      slotBookingDetails.brandId = this.docSavedData.pocDetails.brandId;
      slotBookingDetails.patientRelationship = this.selectedProfile.relationShip;
      slotBookingDetails.serviceId = this.docSavedData.serviceId;
      slotBookingDetails.slotStatus = 1;
      slotBookingDetails.empId = this.auth.employeeDetails.empId;
      slotBookingDetails.slotTime = this.getTimeStampFromOnlytime(this.selctedSlotInfo.slot);
      slotBookingDetails.doctorId = this.patientSlots.doctorId;

      this.basketRequest.slotBookingDetailsList = new Array();
      if (this.isFromAppReq) {
        slotBookingDetails.appointmentRequestId = this.reqDetail.appointmentRequestId;
        slotBookingDetails.bookingSubType = this.reqDetail.bookingSubType;
        this.basketRequest.bookingSource = this.reqDetail.bookingSource;
        
        if (this.selectedPartialPayment && this.partialPaymentAmount > 0) {
          this.slotBookingDetails.payment.partialPayment = new Payment();
          this.slotBookingDetails.payment.partialPayment.amountToBePaid = +this.partialPaymentAmount;
          this.slotBookingDetails.payment.partialPayment.transactionType = Payment.PAYMENT_TYPE_ONLINE;
          // this.slotBookingDetails.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
          this.slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
          this.slotBookingDetails.payment.insuranceClaimAmount = (this.finalAmount - this.partialPaymentAmount)
          this.basketRequest.partialPayment = true;
          // this.basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
        }
      } else {
        if (this.bookingType == 1) {
          slotBookingDetails.isDigiQueue = true;
          slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_DIGIROOM;
        } else if (this.bookingType == 2) {
          slotBookingDetails.isDigiQueue = false;
          slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC
        } else {
          slotBookingDetails.isDigiQueue = false;
          slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT
        }
        this.basketRequest.bookingSource = 3;
      }
      slotBookingDetails.payment.transactionId = this.basketRequest.transactionId;
      slotBookingDetails.payment.transactionType = this.basketRequest.transactionType;
      this.basketRequest.slotBookingDetailsList.push(slotBookingDetails)
      
      if (this.finalAmount >= 0) {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();

        console.log("patient request" + this.basketRequest.slotBookingDetailsList[0].parentProfileId + " " + this.basketRequest.slotBookingDetailsList[0].patientProfileId);
        this.receptionService.getRevenueDetailsForDoctor(this.basketRequest.slotBookingDetailsList[0].patientProfileId, this.basketRequest.slotBookingDetailsList[0].parentProfileId, this.auth.selectedPocDetails.pocId).then(response => {
          console.log('enter here');
          if (response.revenue != undefined) {
            this.basketRequest.slotBookingDetailsList[0].visitDetail = response;
          }

          if(this.basketRequest.transactionType != 5){
            this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
          }
          this.basketRequest.totalOriginalAmount = this.basketRequest.slotBookingDetailsList[0].payment.originalAmount;
          this.basketRequest.totalPackageDiscountAmount = this.basketRequest.slotBookingDetailsList[0].payment.packageDiscountAmount;
          this.basketRequest.totalOtherDiscountAmount = this.basketRequest.slotBookingDetailsList[0].payment.otherDiscountAmount;
          this.basketRequest.totalTaxationAmount = this.basketRequest.slotBookingDetailsList[0].payment.taxationAmount;
          this.basketRequest.totalFinalAmount = this.basketRequest.slotBookingDetailsList[0].payment.finalAmount;
          this.diagnosticService.initiatePayment(this.basketRequest).then(basketresp => {
            this.spinnerService.stop();
            this.basketResponse = basketresp;
            if (this.basketResponse.statusCode == 200 || this.basketResponse.statusCode == 201) {
              alert("Booking Successful");
              this.basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
              this.basketRequest = new BasketRequest();
              this.finalAmount = 0;
              this.packageDiscount = 0;
              this.consultaionFee = 0;
              this.onDisplaySlotButtonClick();
              this.totalSlots = 0;
              this.emptySlots = 0;
              this.bookedSlots = 0;
              this.otherDiscountPercent = 0;
              this.otherDiscountValue = 0;
              (<any>$)("#recption-3").modal("hide");
              this.disabled = true;
              (<any>$)("#confirmationModal").modal("hide");
              this.paymentErrorMessage = "";
              this.continueDisabled = 0;
              this.status = this.basketResponse.slotBookingDetailsList[0].slotStatus;
              if (this.isFromAppReq)
                this.router.navigate(['/app/reception/apprequestqueue']);
              window.localStorage.removeItem('isFromAppReq');
              window.localStorage.removeItem('appReqPatDet');
            } else {
              (<any>$)("#recption-3").modal("hide");
              (<any>$)("#confirmationModal").modal("hide");
              alert(this.basketResponse.statusMessage);
              this.onDisplaySlotButtonClick();
              this.totalSlots = 0;
              this.emptySlots = 0;
              this.bookedSlots = 0;
              this.otherDiscountPercent = 0
              this.otherDiscountValue = 0;
            }
          })

        });
      } else {
        this.paymentErrorMessage = "Discount can not be greater than Total Amount Payable";
      }
    }
    else {
      this.paymentErrorMessage = "Total amount cannot be less than zero";
      return;
    }

  }

  roundToTwo(num) {
    num = num;
    return +(Math.round(num));
  }

  getSlotsForThisDate() {
    this.selectedDate = this.date;
  }

  convertDateToTimestamp(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    var dateString = [mnth, day, date.getFullYear()].join("-");
    var newDate = new Date(dateString.split("-").join("/")).getTime();
    return newDate
  }

  getIdForTime(): void {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.docSavedData.empId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.pocId, this.docSavedData.serviceId, this.docSavedData.empId, false).then((doctortimeSlot) => {
        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        this.getTimeSlotsForDoctor(this.patientSlots);
      });
    }
  }

  convertToDate(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("-");
  }

  onBookingTypeChange(index: number) {
    this.bookingType = index;
    if (this.bookingType == 1) {
      this.paymentModeIndex = 2;
      this.consultaionFee = this.docSavedData.employeePocMapping.serviceDetails.digiConsultationFee;
      this.slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_DIGIROOM;
    } else if (this.bookingType == 3) {
      this.paymentModeIndex = 5;
      this.consultaionFee = this.docSavedData.employeePocMapping.serviceDetails.videoLaterConsultationFee;
      this.slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT;
    } else {
      this.paymentModeIndex = 2;
      this.consultaionFee = this.docSavedData.employeePocMapping.serviceDetails.walkinConsultationFee;
      this.slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC;
    }
    let payment = new Payment();
    payment.originalAmount = this.consultaionFee || 0;
    payment.finalAmount = this.consultaionFee;
    this.slotBookingDetails.payment = payment;
    this.slotBookingDetails = { ...this.slotBookingDetails }
    this.finalAmount = this.consultaionFee;
    this.otherDiscountPercent = 0;
    this.otherDiscountValue = 0;
  }

  checkPartialPayment(num) {
    if (num == 1) {
      this.selectedPartialPayment = true;
    } else {
      this.selectedPartialPayment = false;
    }
  }

  ngOnDestroy() {
    window.localStorage.removeItem('isFromAppReq');
    window.localStorage.removeItem('appReqPatDet');
  }

}
