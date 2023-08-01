import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiscountType } from './../../../../model/package/discountType';
import { BasketResponse } from './../../../../model/basket/basketResponse';
import { DiagnosticsService } from './../../../../diagnostics/diagnostics.service';
import { AuthService } from './../../../../auth/auth.service';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from './../../../../base/util/common-util';
import { Payment } from './../../../../model/basket/payment';
import { SlotBookingDetails } from './../../../../model/basket/slotBookingDetails';
import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { BasketDiscount } from './../../../../model/package/basketDiscount';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { RegistrationVO } from './../../../../model/profile/registrationVO';
import { SelectedRegisteredProfile } from './../../../../model/profile/selectedRegisteredProfile';
import { SlotSummary } from './../../../../model/reception/slotSummary';
import { ReceptionService } from './../../../reception.service';

@Component({
  selector: 'calendarbooking',
  templateUrl: './calendarBooking.template.html',
  styleUrls: ['./calendarBooking.style.scss']
})
export class CalendarBookingComponent implements OnInit {


  toDate: number = 0;
  pocId: number = 0;
  bookingPocIdLocal: number = 0;
  date: Date = new Date();
  futureDate = new Date().setDate(new Date().getDate() + 7)
  timeSlotsAllDay: number[] = new Array<number>();
  docList: DoctorDetails[] = new Array<DoctorDetails>();
  docSavedData: DoctorDetails = new DoctorDetails();
  headerList: DoctorDetails[] = new Array<DoctorDetails>();
  response: any[] = [];
  data: any[];
  slotBookingDetails = new SlotBookingDetails();
  tempSlotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
  basketRequest: BasketRequest = new BasketRequest();
  paymentErrorMessage: any;
  transactionId: any;
  basketResponse: BasketResponse;
  bookedPackages: BookedPackageResponse[] = new Array<BookedPackageResponse>();
  otherDiscounts: Array<BasketDiscount>;
  packagesBookedDropDown: string[] = new Array<string>();
  selctedSlotInfo: SlotSummary = new SlotSummary();
  datePipe = new DatePipe("en-US");
  bookingType: number;
  consultaionFee: number = 0;
  paymentModeIndex: any = 2;
  otherDiscountAmount: number = 0;
  packageDiscount: number = 0;
  finalAmount: number = 0;
  otherDiscountValue: number = 0;
  otherDiscountPercent: number = 0;
  selectedProfile: RegistrationVO;
  parentProfile: RegistrationVO;
  isWalkInClicked: boolean = false;
  hasVideoDoc: boolean = true;
  hasInPersonDoc: boolean = true;
  isValue: boolean = false;
  isPercent: boolean = true;
  slotTime: number = 0;
  discountType: number = DiscountType.TYPE_CONSULTATION_DISCOUNT;
  calendarbooking: string = "calendarbooking";
  dataCheck: boolean = false;

  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }

  ngOnInit(): void {
    jQuery(document).ready(function ($) {
      jQuery('table_sticky').addClass('vdcheader');
    });
    this.getDoctorAvailableSlots();
  }

  constructor(private spinnerService: SpinnerService, private auth: AuthService, private commonUtil: CommonUtil, private router: Router, private receptionService: ReceptionService, private diagnosticService: DiagnosticsService) {
    this.bookingPocIdLocal = this.auth.selectedPocDetails.pocId;
  }

  getDoctorAvailableSlots() {
    this.insertAllSlots();
    this.dataCheck = false;
    this.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.date);
    this.spinnerService.start();

    this.receptionService.getDoctorAvailableSlots(this.toDate).then((slots) => {

      this.spinnerService.stop();
      if (slots != null && slots != undefined && slots.length > 0) {
        this.dataCheck = true;
      }
      this.docList = new Array<DoctorDetails>();
      slots.forEach((slot) => this.docList.push(slot.doctorDetail))
      this.headerList = new Array<DoctorDetails>();
      this.docList.forEach((doc) => {
        let temp = new DoctorDetails();
        temp.firstName = (doc.title ? doc.title : '') + ' ' + (doc.firstName ? doc.firstName : ' ') + ' ' +
          (doc.lastName ? doc.lastName : '')
        temp.experience = doc.experience;
        temp.languages = doc.languages;
        let str = "";
        temp.languages.forEach((lang, index) => {
          str = str + lang.name;
          index != (temp.languages.length - 1) ? str = str + ", " : "";
        })
        temp.qualificationName = "Languages known -" + str;
        temp.registrationNumber = "Experience -"+temp.experience ;
        temp.experience > 1 ? temp.registrationNumber = temp.registrationNumber +" years": temp.registrationNumber = temp.registrationNumber + " year";
        temp.liveNowFee = (doc.employeePocMappingList && doc.employeePocMappingList.length > 0 && doc.employeePocMappingList[0] && doc.employeePocMappingList[0].serviceList && doc.employeePocMappingList[0].serviceList.length > 0 &&
        doc.employeePocMappingList[0].serviceList[0] && doc.employeePocMappingList[0].serviceList[0].videoLaterConsultationFee > 0 ) ? doc.employeePocMappingList[0].serviceList[0].videoLaterConsultationFee : 0;
        this.headerList.push(temp);
      })
      this.response = slots;
      this.response.forEach((response) => {
        response.slots = response.slots[0].dateSlots;
      })
      this.setData();
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  pageRefresh(event) {
    this.getDoctorAvailableSlots();
  }

  insertAllSlots() {
    this.timeSlotsAllDay = [];
    let slot = 9000000;
    this.timeSlotsAllDay.push(slot);
    for (let i = 0; slot < 66540000; i++) {
      slot = slot + 1200000;
      this.timeSlotsAllDay.push(slot);
    }
    console.log("time slot all day", this.timeSlotsAllDay);
    this.checkToday();
  }
  checkToday() {
    if (this.commonUtil.convertOnlyDateToTimestamp(this.date) == this.commonUtil.convertOnlyDateToTimestamp(new Date())) {
      let currenttime = this.commonUtil.convertCurrentDateToTimeStamp(new Date()) - this.commonUtil.convertOnlyDateToTimestamp(this.date) - 19800000;
      let ind = 0;
      for (let i = 0; i < this.timeSlotsAllDay.length; i++) {
        if (currenttime < this.timeSlotsAllDay[i]) {
          ind = i;
          break;
        }
      }
      this.timeSlotsAllDay = this.timeSlotsAllDay.slice(ind);
    }
  }

  setData() {
    this.data = [];
    this.timeSlotsAllDay.forEach((slot, index) => {
      let temp = [];
      temp.push(slot);
      this.response.forEach(response => {
        let found = 0;
        response.slots.forEach(timeSlot => {
          if (timeSlot.time == slot)
            found = 1;
          if (found == 0 && index != this.timeSlotsAllDay.length) {
            if (this.timeSlotsAllDay[index] < timeSlot.time && this.timeSlotsAllDay[index + 1] > timeSlot.time)
              found = 1;
          }
        })
        found == 1 ? temp.push("Available") : temp.push("")
      })
      this.data.push(temp);
    })
    console.log("final data: ", JSON.stringify(this.data))
  }

  bookedSlot(i, j) {
    //this.reset();
    this.getSelectedTimeSlot(i, j);
    this.docSavedData = this.docList[j - 1];
    this.response.forEach(element => {
      if (element.doctorId == this.docSavedData.empId)
        this.pocId = element.pocId
    })
  }

  getSelectedTimeSlot(i: number, j: number) {
    let temp = this.response[j - 1];
    temp.slots.sort(function (a, b) {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    })
    let found = 0;
    let value = this.timeSlotsAllDay[i];
    let nextValue = this.timeSlotsAllDay[i + 1];
    temp.slots.forEach(timeSlot => {
      if (timeSlot.time == value)
        found = 1;
    })
    if (found == 1) {
      this.slotTime = value;
    } else {
      for (let i = 0; i < temp.slots.length - 1; i++) {
        if (temp.slots[i].time < nextValue && temp.slots[i].time > value) {
          this.slotTime = temp.slots[i].time;
          break;
        }
      }
    }
  }

  onBookingTypeChange(index: number) {
    this.bookingType = index;
    this.paymentModeIndex = 5;
    this.consultaionFee = this.docSavedData.employeePocMappingList[0].serviceList[0].videoLaterConsultationFee;
    this.slotBookingDetails.bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT;
    let payment = new Payment();
    payment.originalAmount = this.consultaionFee || 0;
    payment.finalAmount = this.consultaionFee;
    this.slotBookingDetails.payment = payment;
    this.slotBookingDetails = { ...this.slotBookingDetails }
    this.finalAmount = this.consultaionFee;
    this.otherDiscountPercent = 0;
    this.otherDiscountValue = 0;
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

    this.selctedSlotInfo.slot = this.getStringTimeFromTimeStampTo(this.slotTime);
    this.selctedSlotInfo.date = this.datePipe.transform(this.toDate, 'dd/MMM/yyyy');

    console.log('Selected doctor details is....' + JSON.stringify(this.docSavedData));
    console.log(JSON.stringify(this.docSavedData.employeePocMappingList));

    if (this.docSavedData.employeePocMappingList && this.docSavedData.employeePocMappingList[0].serviceList) {
      this.paymentModeIndex = 5;
      this.consultaionFee = this.docSavedData.employeePocMappingList[0].serviceList[0].videoLaterConsultationFee;
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
    this.slotBookingDetails.pocId = this.pocId;
    this.slotBookingDetails.serviceId = this.docSavedData.employeePocMappingList[0].serviceList[0].serviceId;
    this.slotBookingDetails.serviceName = this.docSavedData.serviceName;
    this.slotBookingDetails.slotStatus = 0;
    this.slotBookingDetails.slotTime = this.slotTime;
    this.slotBookingDetails.slotDate = this.toDate;
    this.slotBookingDetails.doctorId = this.docSavedData.empId;

    (<any>$('#myrecption')).modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    (<any>$('#recption-3')).modal('show');
    (<any>$("body")).addClass("modal-open");
    jQuery(".modal").appendTo("body");
    jQuery(".modal-open").appendTo("body");

    (<any>$("#video")).prop("checked", true);
    this.onBookingTypeChange(3)
  }

  getStringTimeFromTimeStampTo(timeslot: number) {
    var date = new Date(timeslot);
    var hours = date.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strhours = hours < 10 ? "0" + hours : hours;
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var strTime = strhours + ':' + minutes + ' ' + ampm;
    return strTime;
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

    this.basketRequest.transactionType = this.paymentModeIndex;
    this.basketRequest.transactionId = this.transactionId;

    if (this.finalAmount >= 0) {
      if (this.consultaionFee == this.packageDiscount) {
        this.basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
      }

      var slotBookingDetails = new SlotBookingDetails;
      slotBookingDetails = this.tempSlotBookingDetails;

      this.basketRequest.bookingSource = 3;
      this.basketRequest.parentProfileId = this.selectedProfile.relationShipId;
      slotBookingDetails.slotDate = this.toDate;
      slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
      slotBookingDetails.parentProfileId = this.selectedProfile.relationShipId;
      slotBookingDetails.patientProfileId = this.selectedProfile.profileId;
      // slotBookingDetails.userPackageId = this.userBookedHsPackage.userPackageId;
      slotBookingDetails.pocId = this.pocId;
      slotBookingDetails.bookingPocId = this.bookingPocIdLocal;
      slotBookingDetails.brandId = this.auth.selectedPocDetails.brandId;
      slotBookingDetails.patientRelationship = this.selectedProfile.relationShip;
      slotBookingDetails.serviceId = this.docSavedData.employeePocMappingList[0].serviceList[0].serviceId;
      slotBookingDetails.slotStatus = 1;
      slotBookingDetails.empId = this.auth.employeeDetails.empId;
      slotBookingDetails.slotTime = this.slotTime;
      slotBookingDetails.doctorId = this.docSavedData.empId;

      this.basketRequest.slotBookingDetailsList = new Array();
      this.basketRequest.slotBookingDetailsList.push(slotBookingDetails)
      slotBookingDetails.payment.transactionId = this.basketRequest.transactionId;
      slotBookingDetails.payment.transactionType = this.basketRequest.transactionType;
      if (this.bookingType == 1) {
        this.basketRequest.slotBookingDetailsList[0].isDigiQueue = true;
        this.basketRequest.slotBookingDetailsList[0].bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_DIGIROOM;
      } else if (this.bookingType == 2) {
        this.basketRequest.slotBookingDetailsList[0].isDigiQueue = false;
        this.basketRequest.slotBookingDetailsList[0].bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC
      } else {
        this.basketRequest.slotBookingDetailsList[0].isDigiQueue = false;
        this.basketRequest.slotBookingDetailsList[0].bookingSubType = SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT
      }
      if (this.finalAmount >= 0) {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();

        console.log("patient request" + this.basketRequest.slotBookingDetailsList[0].parentProfileId + " " + this.basketRequest.slotBookingDetailsList[0].patientProfileId);
        this.receptionService.getRevenueDetailsForDoctor(this.basketRequest.slotBookingDetailsList[0].patientProfileId, this.basketRequest.slotBookingDetailsList[0].parentProfileId, this.auth.selectedPocDetails.pocId).then(response => {
          if (response.revenue != undefined) {
            this.basketRequest.slotBookingDetailsList[0].visitDetail = response;
          }

          this.basketRequest.slotBookingDetailsList[0].payment.paymentStatus = 0;
          this.basketRequest.totalOriginalAmount = this.basketRequest.slotBookingDetailsList[0].payment.originalAmount;
          this.basketRequest.totalPackageDiscountAmount = this.basketRequest.slotBookingDetailsList[0].payment.packageDiscountAmount;
          this.basketRequest.totalOtherDiscountAmount = this.basketRequest.slotBookingDetailsList[0].payment.otherDiscountAmount;
          this.basketRequest.totalTaxationAmount = this.basketRequest.slotBookingDetailsList[0].payment.taxationAmount;
          this.basketRequest.totalFinalAmount = this.basketRequest.slotBookingDetailsList[0].payment.finalAmount;
          this.diagnosticService.initiatePayment(this.basketRequest).then(basketresp => {
            (<any>$)("#recption-3").modal("hide");
            this.basketResponse = basketresp;
            this.spinnerService.stop();
            if (this.basketResponse.statusCode == 200) {
              (<any>$)("#confirmationModal").modal("show");
              this.paymentErrorMessage = "";
              this.reset();
            } else {
              (<any>$)("#confirmationModal").modal("hide");
              alert(this.basketResponse.statusMessage);
              this.otherDiscountPercent = 0
              this.otherDiscountValue = 0;
            }
          })
          this.getDoctorAvailableSlots();
        }).catch((err) => {
          this.getDoctorAvailableSlots();
        });
      } else {
        this.paymentErrorMessage = "Discount can not be greater than Total Amount Payable";
      }
    } else {
      this.paymentErrorMessage = "Total amount cannot be less than zero";
      return;
    }

  }

  reset() {
    this.basketRequest = new BasketRequest();
    this.basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
    this.finalAmount = 0;
    this.packageDiscount = 0;
    this.consultaionFee = 0;
    this.otherDiscountPercent = 0;
    this.otherDiscountValue = 0;
    this.docSavedData = new DoctorDetails();
  }

}
