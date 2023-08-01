import { DatePipe, Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSlot } from '../../../../app/model/reception/timeslot';
import { AuthService } from '../../../../app/auth/auth.service';
import { CryptoUtil } from '../../../../app/auth/util/cryptoutil';
import { ReceptionService } from '../../reception.service';
import { PatientSlots } from '../../../../app/model/slotbooking/patientslots';
import { Doctor } from '../../../model/employee/doctor';
import { SpinnerService } from '../../../../app/layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../app/base/util/common-util';
import { SlotSummary } from '../../../../app/model/reception/slotSummary';
import { PatientQueue } from '../../../../app/model/reception/patientQueue';
import { SlotBookingDetails } from '../../../../app/model/basket/slotBookingDetails';
@Component({
  selector: 'reschedule',
  templateUrl: './reschedule.template.html',
  styleUrls: ['./reschedule.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class RescheduleComponent implements OnInit {

  patientSlotForReschedule: any;
  brandId: number;
  otherDiscountAmount: number;
  totalSlots: number;
  emptySlots: number;
  bookedSlots: number;
  convertedTimeSlot = new Array<TimeSlot>();
  patientSlots: PatientSlots;
  selectedDoctor: Doctor;
  pocId: any;
  date: Date = new Date();
  currentTime: number;
  selctedSlotInfo: SlotSummary = new SlotSummary();
  totalConvertedTimeSlot = new Array<TimeSlot>();
  timeSlot: any;
  futureDate = new Date().setFullYear(new Date().getFullYear() + 50);
  rescheduleInProgess: boolean = false;
  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }
  continueDisabled = 0;
  selectedDate = new Date();
  selectedSlotDate: any;
  datePipe = new DatePipe("en-US");
  testTime: any;
  checkedSlots = 0;
  bookedService: any;
  patientConsultationQueueList = new Array<PatientQueue>();
  bookedTime: any;
  selectedSlotTime: SlotSummary = new SlotSummary();
  age: String;
  invoiceId: any;
  bookedSlotTime: any;
  isCentralReschedule: boolean;

  constructor(private activatedRoute: ActivatedRoute, private receptionService: ReceptionService,
    private spinnerService: SpinnerService, private auth: AuthService, private common: CommonUtil, private router: Router) {

  }
  ngOnInit() {
    this.patientSlotForReschedule = this.receptionService.patientSlotForDoc;
    this.isCentralReschedule = this.receptionService.isCentralBooking;
    this.selectedDoctor = this.receptionService.selectedDoctor;
    this.date = this.receptionService.bookedDate;
    this.age = this.receptionService.age;
    this.invoiceId = this.receptionService.invoiceId;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.patientSlotForReschedule != undefined) {
      window.localStorage.setItem('patientSlotForReschedule', cryptoUtil.encryptData(JSON.stringify(this.patientSlotForReschedule)));
      window.localStorage.setItem('selectedDoctor', cryptoUtil.encryptData(JSON.stringify(this.selectedDoctor)));
      window.localStorage.setItem('age', cryptoUtil.encryptData(JSON.stringify(this.age)));
      window.localStorage.setItem('invoiceId', cryptoUtil.encryptData(JSON.stringify(this.invoiceId)));
      window.localStorage.setItem('isCentralReschedule', JSON.stringify(this.isCentralReschedule));
    } else {
      this.patientSlotForReschedule = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientSlotForReschedule')));
      this.selectedDoctor = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedDoctor')));
      this.age = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('age')));
      this.invoiceId = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('invoiceId')));
      this.isCentralReschedule = JSON.parse(window.localStorage.getItem('isCentralReschedule'));
    }
    this.bookedService = this.selectedDoctor.serviceName;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    this.spinnerService.start();

    this.receptionService.getPatientSlotForDoctor(this.patientSlotForReschedule.pocId, this.patientSlotForReschedule.serviceId, this.patientSlotForReschedule.doctorId, false).then((doctortimeSlot) => {
      this.spinnerService.stop();
      this.patientSlots = doctortimeSlot;
      console.log("ok3" + JSON.stringify(this.patientSlots))
      this.getTimeSlotsForDoctor(this.patientSlots);
    })


  }
  convertToDate(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("-");
  }

  getSlotsForThisDate() {
    this.continueDisabled = 0;
    this.selectedDate = this.date;
    this.selectedSlotDate = this.convertToDate(this.selectedDate);
    $(".order_list ul li#total").removeClass('slotactive');
    $(".order_list ul li#booked").removeClass('slotactive');
    $(".order_list ul li#empty").removeClass('slotactive');
    $(".order_list ul li#checked").removeClass('slotactive');
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    if (this.patientSlots != undefined) {
      this.convertedTimeSlot = new Array<TimeSlot>();
      this.getIdForTime();
    }
  }
  getIdForTime(): void {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.patientSlotForReschedule.doctorId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.patientSlotForReschedule.pocId, this.patientSlotForReschedule.serviceId, this.patientSlotForReschedule.doctorId, true).then((doctortimeSlot) => {
        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        this.getTimeSlotsForDoctor(this.patientSlots);
      });
    }
  }
  getTimeSlotsForDoctor(patientSlot) {
    this.selctedSlotInfo.availableSlots = new Array<String>();
    this.selctedSlotInfo.availableDates = new Array<String>();
    this.patientSlots = patientSlot;
    var todaysdate = new Date();

    todaysdate.setFullYear(1970, 0, 1);

    this.currentTime = todaysdate.getTime();
    if (this.date != undefined) {
      this.date.setHours(0);
      this.date.setMinutes(0);
      this.date.setSeconds(0);
      this.date.setMilliseconds(0);
    }
    this.patientSlots.slots.sort(function (a, b) { return a.actualDate - b.actualDate }).forEach(slot => {
      var availableDate = this.datePipe.transform(slot.actualDate, 'dd/MMM/yyyy');

      this.selctedSlotInfo.availableDates.push(availableDate);
      if (slot.actualDate == this.date.getTime()) {
        var slotTimeList = new Array();
        slot.dateSlots.forEach(element => {
          if (element.time) {
            slotTimeList.push(element);
          }
        })
        slotTimeList.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {

          this.convertTimeStamptotime(timeslot);
        });
        this.testTime = this.convertedTimeSlot;
      }
    });

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
    console.log("slotTime" + JSON.stringify(timeslot))
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
    slotTime.bookingSource = timeslot.bookingSource;
    slotTime.serviceId = timeslot.serviceId;
    slotTime.pocId = timeslot.pocId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.status = timeslot.status;
    slotTime.roomNumber = timeslot.roomNumber;
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientFirstName = timeslot.patientFirstName;
    slotTime.patientLastName = timeslot.patientLastName ? timeslot.patientLastName : '';
    slotTime.patientTitle = timeslot.patientTitle;
    slotTime.patientDOB = timeslot.patientDOB;
    slotTime.age = this.common.getAge(timeslot.patientDOB).split(",")[0] + this.common.getAge(timeslot.patientDOB).split(",")[1];
    slotTime.patientGender = timeslot.patientGender;
    slotTime.orderId = timeslot.orderId;
    slotTime.invoiceId = timeslot.invoiceId;
    slotTime.payment = timeslot.payment;
    slotTime.visitDetails = timeslot.visitDetails;
    slotTime.typeOfAppointment = timeslot.typeOfAppointment;
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
    if (slotTime.status != 0) {
      this.bookedSlots = this.bookedSlots + 1;
    }
    this.totalSlots = this.totalSlots + 1;

    this.convertedTimeSlot.push(slotTime);
    this.convertedTimeSlot.forEach(e => {
      this.bookedTime = e.timeString;
    })
    this.totalConvertedTimeSlot.push(slotTime);
  }
  getSlotDetail(event: any, timeslot: TimeSlot) {

    (<any>$)("#addpay").modal("show");
    this.selectedSlotTime.slot = this.selctedSlotInfo.slot = timeslot.timeString;
    this.bookedSlotTime = timeslot.time;
    console.log("ok===" + JSON.stringify(this.testTime))
  }
  conformPopup() {
    let request: SlotBookingDetails = new SlotBookingDetails();
    request.invoiceId = this.invoiceId;
    request.slotDate = this.date.setHours(0);
    request.slotTime = this.bookedSlotTime;
    request.empId = this.auth.employeeDetails.empId;
    this.rescheduleInProgess = true;
    (<any>$)("#addpay").modal("hide");
    this.spinnerService.start();
    this.receptionService.slotReschedule(request).then((reschedule) => {
      this.spinnerService.stop();
      if (reschedule && (reschedule.statusCode == 200 || reschedule.statusCode == 201)) {
        this.rescheduleInProgess = false;
        alert("Appointment has been rescheduled successfully");
        if (this.isCentralReschedule) {
          this.router.navigate(['/app/admin/centraldoctorbookings'])
        } else {
          this.router.navigate(['/app/reception/booking', this.patientSlotForReschedule.doctorId, this.patientSlotForReschedule.pocId]);
        }
      } else {
        alert("Could not reschedule the appointment. Please check with the administrator.");
      }
      console.log("reschedule" + JSON.stringify(reschedule))

    }).catch((error) => {
      this.spinnerService.stop();
      alert("Something went wrong. Please check with the administrator.");
    });


  }
}