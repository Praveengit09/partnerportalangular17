import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { SlotBookingDetails } from './../../../../model/basket/slotBookingDetails';
import { Router } from '@angular/router';
import { ReceptionService } from './../../../../reception/reception.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { SlotSummary } from './../../../../model/reception/slotSummary';
import { TimeSlot } from './../../../../model/reception/timeslot';
import { AuthService } from './../../../../auth/auth.service';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from './../../../diagnostics.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { Config } from './../../../../base/config';

@Component({
  selector: 'reschedule',
  templateUrl: './reschedulehomeorder.template.html',
  styleUrls: ['./reschedulehomeorder.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class RescheduleHomeOrderComponent {

  order: DiagnosticDeliveryAdviceTrack;
  date: Date = new Date();
  slotData: any;
  pocId: number = 0;
  bookedSlotTime: any;
  age: any;
  selectedSlotTime: SlotSummary = new SlotSummary();
  convertedTimeSlot = new Array<TimeSlot>();
  futureDate = new Date().setFullYear(new Date().getFullYear() + 50);
  spotBooking: boolean = false;
  enableSpotBook: boolean = false;
  slotTime: number = 0;
  resheduledTime: number = 0;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  spotTimeList: any[] = DiagnosticDeliveryAdviceTrack.SPOTBOOKING;
  spotBookingTimeList: any[] = [];

  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }

  constructor(private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private receptionService: ReceptionService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService) {
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableSpotBooking)
      this.enableSpotBook = true;
  }
  ngOnInit() {
    this.order = this.diagnosticsService.order;   
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.order != undefined)
      window.localStorage.setItem('diagnosticHomeOrderForReschedule', cryptoUtil.encryptData(JSON.stringify(this.order)));   
    else
      this.order = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('diagnosticHomeOrderForReschedule')));
    this.age = this.commonUtil.getAge(this.order.patientProfileDetails.dob).split(",")[0] + this.commonUtil.getAge(this.order.patientProfileDetails.dob).split(",")[1];
    this.getSlots(); 
  }


  getSlots() {
    let serviceIdList = new Array();
    this.order.serviceList.forEach(service => {
      serviceIdList.push(service.serviceId);
    });
    this.timeCheckSpotBooking();
    this.diagnosticsService.getHomeCollectionSlots(this.order.pocDetails.pocId, 0, this.order.deliveryAddress.pinCode, this.order.deliveryAddress.area, serviceIdList, 0, this.commonUtil.convertOnlyDateToTimestamp(this.date)).then(data => {
      console.log(JSON.stringify(data));
      if (data && (data.statusCode == 200 || data.statusCode == 201)) {
        this.slotData = data;
        this.getTimeSlotFromSlotData();
      } else {
        alert(data.statusMessage);
      }
      this.spinnerService.stop();
    });
  }

  getTimeSlotFromSlotData() {
    this.convertedTimeSlot = new Array<TimeSlot>();
    if (this.date != undefined) {
      this.date.setHours(0);
      this.date.setMinutes(0);
      this.date.setSeconds(0);
      this.date.setMilliseconds(0);
    }
    let currentTime = this.commonUtil.convertTimeToUTC(new Date()) - this.commonUtil.getTimezoneDifferential();
    let selectedDate = +this.commonUtil.convertDateToTimestamp(this.date) - this.commonUtil.getTimezoneDifferential();
    var slotTimeList = new Array();
    this.slotData.slots.forEach(element => {
      if (element.actualDate == this.commonUtil.convertOnlyDateToTimestamp(this.date))
        slotTimeList.push(element);
    })
    if (slotTimeList != null && slotTimeList.length && selectedDate == this.order.slotDate) {
      slotTimeList.forEach(timeslot => {
        timeslot.dateSlots.forEach(doc => {

          if ((doc.status == 0 && doc.expireTime > 0 && doc.vacantSlots > 0 && doc.time != this.order.slotTime) && ((doc.time > currentTime) || (selectedDate > (new Date().getTime()))))
            this.convertTimeStamptotime(doc);
        })
      });
    }

    if (slotTimeList != null && slotTimeList.length && selectedDate != this.order.slotDate) {
      slotTimeList.forEach(timeslot => {
        timeslot.dateSlots.forEach(doc => {

          if ((doc.status == 0 && doc.expireTime > 0 && doc.vacantSlots > 0 ) && ((doc.time > currentTime) || (selectedDate > (new Date().getTime()))))
            this.convertTimeStamptotime(doc);
        })
      });
    }
    this.convertedTimeSlot.sort(function (a, b) { return a.time - b.time })
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


  convertTimeStamptotime(timeslot: any) {
    let strTime = this.getStringTimeFromTimeStampTo(timeslot);
    var slotTime = new TimeSlot();
    slotTime.timeString = strTime;
    slotTime.time = timeslot.time;
    this.convertedTimeSlot.push(slotTime);
  }


  getSlotDetail(event: any, timeslot: TimeSlot) {
    this.selectedSlotTime.slot = timeslot.timeString;
    this.bookedSlotTime = this.resheduledTime = timeslot.time;
    (<any>$)("#addpay").modal("show");
  }

  confirmPopup() {
    let request: SlotBookingDetails = new SlotBookingDetails();
    request.invoiceId = this.order.invoiceId;
    request.slotDate = this.date.setHours(0);
    request.slotTime = this.bookedSlotTime;
    request.empId = this.auth.employeeDetails.empId;
    request.rescheduledOrder = true;
    if (this.spotBooking)
      request.spotBooking = this.spotBooking;
    (<any>$)("#addpay").modal("hide");
    this.spinnerService.start();
    this.receptionService.slotReschedule(request).then((reschedule) => {
      this.spinnerService.stop();
      if (reschedule && (reschedule.statusCode == 200 || reschedule.statusCode == 201)) {
        alert("Appointment has been rescheduled successfully");
        this.router.navigate([this.diagnosticsService.tempPdfUrl]);
        this.diagnosticsService.tempPdfUrl = '';
      } else {
        alert("Could not reschedule the appointment. Please check with the administrator.");
      }
    }).catch((error) => {
      this.spinnerService.stop();
      alert("Something went wrong. Please check with the administrator.");
    });

  }

  enableSpotBooking(val) {
    this.spotBooking = val;
    this.timeCheckSpotBooking();
  }

  timeCheckSpotBooking() {
    if (this.commonUtil.convertOnlyDateToTimestamp(this.date) == this.commonUtil.convertOnlyDateToTimestamp(new Date)) {
      let currentTime = this.commonUtil.convertTimeToUTC(new Date()) - this.commonUtil.getTimezoneDifferential();
      this.spotBookingTimeList = this.spotTimeList.filter(doc => doc.timeValue >= currentTime);
    }
    else
      this.spotBookingTimeList = this.spotTimeList;
  }

  onSpotTimeSelected(val) {
    this.slotTime = val;
  }

  onSubmit() {
    this.bookedSlotTime = this.resheduledTime = this.slotTime;
    (<any>$)("#addpay").modal("show");
  }
}
