import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonUtil } from "../../../base/util/common-util";
import { DateUtil } from '../../../base/util/dateutil';
import { ValidationUtil } from "../../../base/util/validation-util";
import { BasketConstants } from '../../../constants/basket/basketconstants';
import { DiagnosticsService } from "../../../diagnostics/diagnostics.service";
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { ProfileVisitedDetails } from '../../../model/reception/profilevisitedDetails';
import { AppConfig } from './../../../app.config';
import { AuthService } from './../../../auth/auth.service';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { BasketResponse } from './../../../model/basket/basketResponse';
import { Payment } from './../../../model/basket/payment';
import { Doctor } from './../../../model/employee/doctor';
import { BasketDiscount } from './../../../model/package/basketDiscount';
import { BookedPackageResponse } from './../../../model/package/bookedPackageResponse';
import { DiscountType } from './../../../model/package/discountType';
import { UserHsPackage } from './../../../model/package/userHsPackage';
import { PaymentType } from './../../../model/payment/paymentType';
import { PatientVitalInfo } from './../../../model/phr/patientVitalInfo';
import { VitalDetail } from './../../../model/phr/vitalDetail';
import { RegistrationVO } from './../../../model/profile/registrationVO';
import { SelectedRegisteredProfile } from './../../../model/profile/selectedRegisteredProfile';
import { DoctorAppointmentDetails } from './../../../model/reception/doctorAppointmentDetails';
import { GetTimeSlot } from './../../../model/reception/gettimeslot';
import { PatientArrivalRequest } from './../../../model/reception/patientArrivalRequest';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { SlotSummary } from './../../../model/reception/slotSummary';
import { TimeSlot } from './../../../model/reception/timeslot';
import { ConsultationQueueRequest } from './../../../model/slotbooking/consultationQueueRequest';
import { PatientSlots } from './../../../model/slotbooking/patientslots';
import { POCService } from "./../../../poc/poc.service";
import { ReceptionService } from './../../../reception/reception.service';
import { Config } from '../../../base/config';

@Component({
  selector: 'reception',
  templateUrl: './reception.template.html',
  styleUrls: ['./reception.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ReceptionComponent implements OnInit {



  config: any;
  month: any;
  year: any;
  selectSlotTimeErrMsg: string;
  selectedProfile: RegistrationVO;
  parentProfile: RegistrationVO;
  test: any;

  transactionTypeForWalkIn: any;
  convertedTimeSlot = new Array<TimeSlot>();
  totalConvertedTimeSlot = new Array<TimeSlot>();
  bookedPackages: BookedPackageResponse[] = new Array<BookedPackageResponse>();;
  otherDiscounts: Array<BasketDiscount>;
  // slotBookingDetails1: any;
  slotBookingDetails = new SlotBookingDetails();
  visitDetail = new Array<ProfileVisitedDetails>();
  isWalkInClicked: boolean = false;
  currentTime: number;
  currentDate: number;
  isMarkAsArrived: boolean = true;
  datePipe = new DatePipe("en-US");
  previousdoctorId: any;
  getTimeSlot: GetTimeSlot;
  selectedDate = new Date();
  todaysDate: any;
  selectedSlotDate: any;
  selctedSlotInfo: SlotSummary = new SlotSummary();
  selectedSlotTime: SlotSummary = new SlotSummary();
  patientSlots: PatientSlots;
  pocId: any;
  doctorId: any;
  serviceId: any;
  consultaionFee = 0;
  otherDiscountAmount = 0;
  packageDiscount = 0;
  finalAmount = 0;
  ispackagesAvailable = false;
  basketRequest: BasketRequest = new BasketRequest();
  patientConsultationQueueList = new Array<PatientQueue>();
  basketResponse: BasketResponse;
  datepickerToOpts: any = {};
  selectedDoctor: Doctor;
  userHsPackage = new UserHsPackage();
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  confirmationDate: any;
  confirmationTime: any;
  doctorName: any;
  bookedTime: any;
  bookedPatientTitle: string;
  bookedPatientFirstName: string;
  bookedPatientLastName: string;
  bookedPatientage: any;
  bookedPatientGender: any;
  paymentErrorMessage: any;
  continueDisabled = 0;
  date: Date = new Date();
  firstName: any;
  lastName: any;
  brandId: number;
  paymentModeIndex: number = Payment.PAYMENT_TYPE_CASH;
  totalSlots = 0;
  emptySlots = 0;
  bookedSlots = 0;
  checkedSlots = 0;
  consultationCharge: any;
  cashBackAmount: 0;
  discountPrice: any;
  totalPrice: any;
  paymentType: any;
  paymentStatus: any;
  bookedDate: any;
  bookedService: any;
  orderId: any;
  invoiceId: string;
  cancelSlotResponse: any;
  docPhysicallyAvailable: boolean = true;
  futureDate = new Date().setFullYear(new Date().getFullYear() + 50);
  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }
  Appconfig: AppConfig = new AppConfig();
  selectedPackageModel: any;
  selectedDiscountModel: any;
  slotClickDateSlot: TimeSlot;
  bookingSubType: number;
  dropDownIndexForPackages: number = 0;
  packagesBookedDropDown: string[] = new Array<string>();
  testTime: any;
  text = "&nbsp;&nbsp;";
  otherDiscountValue: number = 0;
  otherDiscountPercent: number = 0;
  basketDiscount = new BasketDiscount();
  otherDiscountPrice: any;
  creditAmount: any = 0;
  revenueDetails: any;
  grandTotalAmount: number = 0;
  isConfirming: boolean = false;
  discountType: number = DiscountType.TYPE_CONSULTATION_DISCOUNT;
  isEditText: boolean = false;
  isEditUpdate: boolean = false;
  tempSlotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
  dropDownIndex: number = 0;
  transactionId: string = '';
  usedWalletAmount: number = 0;
  platformCharges: number = 0;
  startDate: Date;
  endingDate: Date;
  empId: number;
  from: number = 0;
  mobile: string = '';
  patientName: string = '';
  filterPaymentStatus: number = 0;
  filterInvoiceStatus: number = 0;
  fiterCancellationStatus = 0;
  patientSlotForDoc: any;
  currencySymbol: string = '';
  walkinSlotDate: Date = new Date();
  walkinSlotTime: Date = new Date(1970, 0, 1, this.walkinSlotDate.getHours(), this.walkinSlotDate.getMinutes(), 0, 0);
  printBlankLetterHead:boolean

  constructor(
    private activatedRoute: ActivatedRoute,
    private receptionService: ReceptionService, private router: Router,
    private auth: AuthService,
    private spinnerService: SpinnerService, public pocService: POCService,
    private diagnosticService: DiagnosticsService,
    private authService: AuthService,
    private common: CommonUtil,
    private validation: ValidationUtil,
    private cd: ChangeDetectorRef) {
    this.config = this.Appconfig.getConfig();
    this.todaysDate = this.convertToDate(new Date());
    this.selectedSlotDate = this.convertToDate(new Date());
    this.slotBookingDetails.basketDiscount = new Array<BasketDiscount>();
    this.otherDiscountAmount = 0;
    this.empId = this.authService.userAuth.employeeId;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
  if(Config.portal && Config.portal.customizations.printBlankLetterHead){
   this.printBlankLetterHead=Config.portal.customizations.printBlankLetterHead;
  }

    
  }
  ngOnInit() {
    this.brandId = this.auth.selectedPocDetails.brandId;
    this.otherDiscountAmount = 0;
    $('.modal').on('hidden.bs.modal', (e) => {
      $("#mname").val("");
      $("#sname").val("");
      $("#sname").removeAttr("disabled");
      $("#packageDropdown").val("0");
      $("#discountDropdown").val("0");
      this.otherDiscountAmount = 0;
      this.grandTotalAmount = 0;
      this.otherDiscountPercent = 0;
      this.otherDiscountValue = 0;
    });
    $('#recption-3').on('hidden.bs.modal', (e) => {
      this.otherDiscountAmount = 0;
      this.otherDiscountPercent = 0;
      this.grandTotalAmount = 0;
      this.otherDiscountValue = 0;
      this.isConfirming = false;
    });
    jQuery(".modal").on("show", function () {
      jQuery("body").addClass("modal-open");
    }).on("hidden", function () {
      jQuery("body").removeClass("modal-open")
    });
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.packagesBookedDropDown[0] = "Select Package";
    this.activatedRoute.params.subscribe(params => {
      this.continueDisabled = 0;
      this.selectedDoctor = this.receptionService.selectedDoctor;
      if (this.selectedDoctor.myPoc && this.selectedDoctor.myPoc.participationSettings != undefined)
        this.docPhysicallyAvailable = this.selectedDoctor.myPoc.participationSettings.doctorPhysicallyAvailable
      this.pocId = this.auth.userAuth.pocId;
      if (this.selectedDoctor.serviceId != undefined) {
        this.doctorId =
          // params['doctorId'];
          this.selectedDoctor.empId;
        this.serviceId = this.selectedDoctor.serviceId;
      } else {
        this.router.navigate(['/app/reception']);
      }
      if (this.selectedDoctor.serviceId != undefined) {
        $(".order_list ul li#total").removeClass('slotactive');
        $(".order_list ul li#booked").removeClass('slotactive');
        $(".order_list ul li#empty").removeClass('slotactive');
        $(".order_list ul li#checked").removeClass('slotactive');
        this.totalSlots = 0;
        this.emptySlots = 0;
        this.bookedSlots = 0;
        this.checkedSlots = 0;
        this.convertedTimeSlot = new Array<TimeSlot>();
        this.patientSlots = undefined;
        // if (this.auth.selectedPOCMapping.participationSettings.doctorPhysicallyAvailable == true) {
        this.spinnerService.start();
        this.receptionService.getPatientSlotForDoctor(this.pocId, this.selectedDoctor.serviceId, this.selectedDoctor.empId, true).then((doctortimeSlot) => {
          this.spinnerService.stop();
          this.isWalkInClicked = false;
          this.patientSlots = doctortimeSlot;
          this.getTimeSlotsForDoctor(this.patientSlots);
          if (doctortimeSlot)
            this.getPatientConsultationQueue(doctortimeSlot);
        });
        // }
      }
    });
    this.selectedDiscountModel = "0";
    this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH;
  }


  convertToPdf() {
    (<any>$)("#addpay").modal("hide");

    this.router.navigate(['./app/reception/convertToPdf'])
  }

  onGenerateInvoice(): void {
    this.router.navigate(['/app/reception/invoice']);
  }
  convertToDate(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("-");
  }
  saveToLocalStore() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.selectedDoctor != null) {
      window.localStorage.setItem('selectedDoctor', cryptoUtil.encryptData(JSON.stringify(this.selectedDoctor)));
    }
  }
  getFromLocalStore(): void {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('selectedDoctor') != null && window.localStorage.getItem('selectedDoctor').length > 0) {
      this.selectedDoctor = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedDoctor')));
    }
  }

  getIdForTime(): void {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.doctorId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.pocId, this.serviceId, this.doctorId, true).then((doctortimeSlot) => {
        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        this.getTimeSlotsForDoctor(this.patientSlots);
        if (doctortimeSlot)
          this.getPatientConsultationQueue(doctortimeSlot);
      });
    }
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.paymentErrorMessage = "";
  }

  getRefreshedTimeSlot(nav): void {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.doctorId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.pocId, this.serviceId, this.doctorId, true).then((doctortimeSlot) => {

        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        if (this.patientSlots != undefined && nav == 2) {
          this.patientSlots.slots.forEach(slot => {
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
                this.convertTimeStamptotimeForBooked(timeslot, 2)
                this.continueDisabled = 3;
              })
            }
          });
          if (this.totalSlots > 0) {
            $(".order_list ul li#total").removeClass('slotactive');
            $(".order_list ul li#booked").removeClass('slotactive');
            $(".order_list ul li#empty").addClass('slotactive');
            $(".order_list ul li#checked").removeClass('slotactive');
          }
        } else if (this.patientSlots != undefined && nav == 1) {
          this.patientSlots.slots.forEach(slot => {
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
            $(".order_list ul li#checked").removeClass('slotactive');
          }
        }
        else if (this.patientSlots != undefined && nav == 3) {
          this.patientSlots.slots.forEach(slot => {
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
                this.convertTimeStamptotimeForBooked(timeslot, 3);
                this.continueDisabled = 0;
              })
            }
          });
          this.continueDisabled = 2;
          if (this.totalSlots > 0) {
            $(".order_list ul li#empty").removeClass('slotactive');
            $(".order_list ul li#total").removeClass('slotactive');
            $(".order_list ul li#booked").removeClass('slotactive');
            $(".order_list ul li#checked").addClass('slotactive');
          }
        }


        if (doctortimeSlot)
          this.getPatientConsultationQueue(doctortimeSlot);
      });
    }
  }

  getTotalSlots(nav) {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.continueDisabled = 0;
    this.checkedSlots = 0;
    this.getIdForTime();
    if (nav == 1) {
      $(".order_list ul li#empty").removeClass('slotactive');
      $(".order_list ul li#booked").removeClass('slotactive');
      $(".order_list ul li#total").addClass('slotactive');
      $(".order_list ul li#checked").removeClass('slotactive');
    }
  }

  getTotalBookedSlots() {
    var todaysdate = new Date();
    todaysdate.setFullYear(1970, 0, 1);
    this.currentTime = todaysdate.getTime();

    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    this.getRefreshedTimeSlot(1);
  }


  getTotalEmptySlots() {
    var todaysdate = new Date();
    todaysdate.setFullYear(1970, 0, 1);
    this.currentTime = todaysdate.getTime();

    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    this.getRefreshedTimeSlot(2);
  }

  getCheckedSlots() {
    var todaysdate = new Date();
    todaysdate.setFullYear(1970, 0, 1);
    this.currentTime = todaysdate.getTime();

    this.date.setHours(0);
    this.date.setMinutes(0);
    this.date.setSeconds(0);
    this.date.setMilliseconds(0);
    this.getRefreshedTimeSlot(3);
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
    } else {
      alert("Please choose a doctor");
    }
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
    console.log("convertedTimeSlot" + JSON.stringify(this.convertedTimeSlot[0].invoiceId))
    this.totalConvertedTimeSlot.push(slotTime);
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

    if (slotTime.status == 0 && slotTime.isDisabled && nav == 2) {

      this.selctedSlotInfo.availableSlots.push(strTime);
      this.convertedTimeSlot.push(slotTime);
    } else if (slotTime.status != 0 && nav == 1) {
      this.convertedTimeSlot.push(slotTime);
    }
    else if (slotTime.status != 0 && nav == 3) {
      this.selectedDate.setHours(0);
      this.selectedDate.setMinutes(0);
      this.selectedDate.setSeconds(0);
      this.selectedDate.setMilliseconds(0);
      let date = this.selectedDate.getTime();
      let request: ConsultationQueueRequest = new ConsultationQueueRequest();
      request.pocId = this.pocId;
      request.date = date;
      request.doctorId = this.doctorId;
      request.digiQueue = false; // To be changed later, if required
      this.receptionService.getDoctorConsultationQueueFromServer(request).then(patientQueueList => {
        this.spinnerService.stop();
        this.patientConsultationQueueList = patientQueueList;
        //This is get checked count
        for (var i = 0; i < this.patientConsultationQueueList.length; i++) {
          if (this.patientConsultationQueueList[i].bookingSubType != 3 && this.patientConsultationQueueList[i].status == 6) {
            if (slotTime.orderId == this.patientConsultationQueueList[i].orderId) {
              this.convertedTimeSlot.push(slotTime);

            }
          }
        }
      });
    }

    if (slotTime.status != 0) {
      this.bookedSlots = this.bookedSlots + 1;
    }
    if (slotTime.status == 0 && slotTime.isDisabled) {
      this.emptySlots = this.emptySlots + 1;
    }
    // if(slotTime.status != 0  && slotTime.payment.paymentStatus == 1)
    // {
    //     this.checkedSlots = this.checkedSlots + 1;
    // }
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
    // this.bookedPackages = null;
    // this.otherDiscounts = null;
    this.selctedSlotInfo.doctorName = this.selectedDoctor.firstName + " " + (this.selectedDoctor.lastName ? this.selectedDoctor.lastName : '');
    this.consultaionFee = this.selectedDoctor.consultationFee;
    this.finalAmount = this.selectedDoctor.consultationFee;
    /* this.bookedPackages = new Array<BookedPackageResponse>();
    this.packagesBookedDropDown = new Array<string>();
    this.packagesBookedDropDown[0] = "Select Package"; */

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
    this.slotBookingDetails.serviceId = this.selectedDoctor.serviceId;
    this.slotBookingDetails.serviceName = this.selectedDoctor.serviceName;
    this.slotBookingDetails.slotStatus = 0;
    this.slotBookingDetails.typeOfAppointment = 0;
    if (this.isWalkInClicked) {
      this.slotBookingDetails.bookingSubType = BasketConstants.DOCTOR_BOOKING_SUBTYPE_WALKIN;
      this.slotBookingDetails.slotDate = DateUtil.removeTimeInMillis(this.walkinSlotDate.getTime());
      this.slotBookingDetails.slotTime = this.walkinSlotTime.getTime();
    } else {
      this.slotBookingDetails.slotTime = this.getTimeStampFromOnlytime(this.selctedSlotInfo.slot);
      this.slotBookingDetails.slotDate = new Date(this.selctedSlotInfo.date).getTime();
    }
    this.slotBookingDetails.doctorId = this.patientSlots.doctorId;

    (<any>$('#myrecption')).modal('hide');
    // (<any>$('#paymant')).checked();
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    (<any>$('#recption-3')).modal('show');

    jQuery('#edit_show').hide();
    jQuery('#edit_hide').show();
    jQuery('#bottonHide').show();
    this.dropDownIndex = 0;
    this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH;
    this.transactionId = '';
    console.log("onRegisterNewUser: " + this.paymentModeIndex);

    this.cd.detectChanges();
  }

  editText() {
    this.isEditText = true;
    jQuery('#edit_show').show();
    jQuery('#edit_hide').hide();
    jQuery('#bottonHide').hide();
  }

  editTextUpdate() {
    this.isEditUpdate = true;
    if (this.selctedSlotInfo.slot != undefined && this.selctedSlotInfo.slot != '') {
      jQuery('#edit_show').hide();
      jQuery('#edit_hide').show();
      jQuery('#bottonHide').show();
    } else {
      this.selectSlotTimeErrMsg = "Please Select Slot Time";
    }
    this.slotBookingDetails.slotDate = this.convertDateToTimestamp(this.selectedDate);
    this.slotBookingDetails.slotTime = this.getTimeStampFromOnlytime(this.selctedSlotInfo.slot);
    this.slotBookingDetails = { ...this.slotBookingDetails }
  }

  buttonClose() {
    jQuery('#edit_show').hide();
    jQuery('#edit_hide').show();
    jQuery('#bottonHide').show();
  }

  resetSlot() {
    this.selctedSlotInfo.date = this.datePipe.transform(this.date.getTime(), 'dd/MMM/yyyy');
  }
  getSlotDetail(event: any, timeslot: TimeSlot) {
    this.selctedSlotInfo.doctorName = this.selectedDoctor.firstName + " " + (this.selectedDoctor.lastName ? this.selectedDoctor.lastName : '');
    this.selectedSlotTime.slot = this.selctedSlotInfo.slot = timeslot.timeString;
    this.selctedSlotInfo.date = this.datePipe.transform(this.date.getTime(), 'dd/MMM/yyyy');
    this.continueDisabled = 1;
  }

  bookedSlot(bookedSlot, date) {
    console.log('Booked Slot=>', bookedSlot);
    this.receptionService.patientDataToPdf = bookedSlot

    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    this.currentDate = currentDate.getTime();
    this.slotClickDateSlot = bookedSlot;
    this.bookingSubType = this.slotClickDateSlot.bookingSubType;


    if (bookedSlot.status == 1) {//Booked
      if (bookedSlot.payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
        this.isMarkAsArrived = true;

        (<any>$)("#addpay").modal("show");
        this.bookedDate = date;
        this.bookedTime = bookedSlot.timeString;
        this.selectedDoctor.serviceList.forEach(element => {
          if (element.serviceId == bookedSlot.serviceId) {
            this.bookedService = element.serviceName;
          }
        });
        this.bookedPatientTitle = bookedSlot.patientTitle;
        this.bookedPatientFirstName = bookedSlot.patientFirstName;
        this.bookedPatientTitle = bookedSlot.patientTitle;
        this.bookedPatientLastName = bookedSlot.patientLastName ? bookedSlot.patientLastName : '';
        this.bookedPatientage = bookedSlot.age;
        this.bookedPatientGender = bookedSlot.patientGender;
        this.consultationCharge = bookedSlot.payment.originalAmount;
        this.cashBackAmount = bookedSlot.payment.totalCashbackAmount;
        this.discountPrice = bookedSlot.payment.packageDiscountAmount;
        this.otherDiscountPrice = bookedSlot.payment.otherDiscountAmount;
        this.creditAmount = bookedSlot.payment.usedPostWalletAmount || 0;
        this.usedWalletAmount = bookedSlot.payment.usedWalletAmount;
        this.platformCharges = bookedSlot.payment.platformCharges;
        this.totalPrice = bookedSlot.payment.finalAmount;
        this.paymentType = bookedSlot.payment.transactionType;
        this.paymentStatus = bookedSlot.payment.paymentStatus;
        this.orderId = bookedSlot.orderId;
        this.invoiceId = bookedSlot.invoiceId;
        this.visitDetail = this.revenueDetails;



      } else if (bookedSlot.payment.paymentStatus == PaymentType.PAYMENT_STATUS_NOT_PAID) {
        this.isMarkAsArrived = false;
        (<any>$)("#addpay").modal("show");
        this.invoiceId = bookedSlot.invoiceId;
        this.bookedDate = date;
        this.bookedTime = bookedSlot.timeString;
        this.selectedDoctor.serviceList.forEach(element => {
          if (element.serviceId == bookedSlot.serviceId) {
            this.bookedService = element.serviceName;
          }
        });
        this.bookedPatientTitle = bookedSlot.patientTitle;
        this.bookedPatientFirstName = bookedSlot.patientFirstName;
        this.bookedPatientLastName = bookedSlot.patientLastName ? bookedSlot.patientLastName : '';
        this.bookedPatientTitle = bookedSlot.patientTitle;
        this.bookedPatientage = bookedSlot.age;
        this.bookedPatientGender = bookedSlot.patientGender;
        this.consultationCharge = bookedSlot.payment.originalAmount;
        this.cashBackAmount = bookedSlot.payment.totalCashbackAmount;
        this.discountPrice = bookedSlot.payment.packageDiscountAmount;
        this.otherDiscountPrice = bookedSlot.payment.otherDiscountAmount;
        this.creditAmount = bookedSlot.payment.usedPostWalletAmount || 0;
        this.usedWalletAmount = bookedSlot.payment.usedWalletAmount;
        this.platformCharges = bookedSlot.payment.platformCharges;
        this.totalPrice = bookedSlot.payment.finalAmount;
        this.paymentType = bookedSlot.payment.transactionType;
        this.paymentStatus = bookedSlot.payment.paymentStatus;
        this.orderId = bookedSlot.orderId;
        this.invoiceId = bookedSlot.invoiceId;
        this.visitDetail = bookedSlot.visitDetail;
      }

    }

  }

  cancelSlot(orderId) {
    this.spinnerService.start();
    this.diagnosticService.cancelBookedSlot(orderId, this.invoiceId, 0, this.selectedDoctor.empId).then((cancelSlotResponse) => {
      this.spinnerService.stop();
      this.cancelSlotResponse = cancelSlotResponse;
      if (this.cancelSlotResponse.statusCode == 200) {
        this.getSlotsForThisDate();
        this.totalSlots = 0;
        this.emptySlots = 0;
        this.bookedSlots = 0;
      }
      alert(cancelSlotResponse.statusMessage);
      (<any>$)("#cancelModal").modal("hide");
      (<any>$)("#addpay").modal("hide");
    });
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
        var slotTimeList = new Array();
        slot.dateSlots.forEach(element => {
          if (element.time) {
            slotTimeList.push(element);
          }
        })
        slotTimeList.sort(function (a, b) { return a.time - b.time }).forEach(timeslot => {
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

  checkIfValid(validTo: number): boolean {
    let slotTime: number;
    if (this.isWalkInClicked) {
      return true;
    } else {
      if (slotTime <= validTo) {
        return true;
      } else {
        return false;
      }
    }
  }

  onCalculateDiscount(slotBookingDetails): void {
    console.log("SlotBookingDetails2: " + slotBookingDetails.payment.finalAmount);
    this.finalAmount = slotBookingDetails.payment.finalAmount;
    this.tempSlotBookingDetails = slotBookingDetails;
    console.log("SlotBookingDetails1: " + JSON.stringify(this.tempSlotBookingDetails));
  }

  updatePaymentProviderDetails() {
    console.log("paymentModeIndex: " + this.paymentModeIndex);

    if (this.paymentModeIndex == 0) {
      this.isConfirming = false;
      this.paymentErrorMessage = "Please select a payment mode";
      return;
    }
    if (!this.isWalkInClicked && this.isEditText) {
      if (this.selctedSlotInfo.slot == undefined || this.selctedSlotInfo.slot == '' || this.selctedSlotInfo.slot == null) {
        this.selectSlotTimeErrMsg = "Please Select Slot Time";
        $('#recption-3').animate({ scrollTop: 0 }, 300);
        return;
      }
      if (this.isEditUpdate == false) {
        alert('Please update the slot details');
        return;
      }
    }

    this.basketRequest.transactionType = this.paymentModeIndex;
    this.transactionTypeForWalkIn = this.paymentModeIndex;
    if (this.transactionId)
      this.basketRequest.transactionId = this.transactionId;

    this.isConfirming = true;
    if (this.isWalkInClicked) {
      this.onWalkInClickCallServer();

    } else {
      console.log("FinalAmount: " + this.finalAmount);
      if (this.finalAmount >= 0) {
        if (this.consultaionFee == this.packageDiscount) {
          this.basketRequest.transactionType = Payment.PAYMENT_TYPE_CASH;
        }

        var slotBookingDetails = new SlotBookingDetails;
        slotBookingDetails = this.tempSlotBookingDetails;

        this.basketRequest.bookingSource = 3;
        this.basketRequest.parentProfileId = this.selectedProfile.relationShipId;
        slotBookingDetails.slotDate = this.convertDateToTimestamp(this.selectedDate);
        slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
        slotBookingDetails.parentProfileId = this.selectedProfile.relationShipId;
        slotBookingDetails.patientProfileId = this.selectedProfile.profileId;
        slotBookingDetails.pocId = this.patientSlots.pocId;
        slotBookingDetails.brandId = this.brandId;
        slotBookingDetails.patientRelationship = this.selectedProfile.relationShip;
        slotBookingDetails.serviceId = this.selectedDoctor.serviceId;
        slotBookingDetails.serviceName = this.selectedDoctor.serviceName;
        slotBookingDetails.slotStatus = 1;
        slotBookingDetails.bookingSource = 3;
        slotBookingDetails.paymentSource = 3;

        slotBookingDetails.slotTime = this.getTimeStampFromOnlytime(this.selctedSlotInfo.slot);
        slotBookingDetails.doctorId = this.patientSlots.doctorId;
        slotBookingDetails.empId = this.auth.userAuth.employeeId;
        this.basketRequest.slotBookingDetailsList[0] = slotBookingDetails;
        if (this.finalAmount >= 0) {
          $('html, body').animate({ scrollTop: '0px' }, 300);
          this.spinnerService.start();

          this.receptionService.getRevenueDetailsForDoctor(this.basketRequest.slotBookingDetailsList[0].patientProfileId, this.basketRequest.slotBookingDetailsList[0].parentProfileId, this.auth.selectedPocDetails.pocId).then(response => {
            if (response.revenue != undefined) {
              slotBookingDetails.visitDetail = response;
            }

            slotBookingDetails.payment.paymentStatus = 0;

            this.basketRequest.slotBookingDetailsList[0] = slotBookingDetails;

            this.diagnosticService.initiatePayment(this.basketRequest).then(basketresp => {
              this.spinnerService.stop();
              this.basketResponse = basketresp;
              if (this.basketResponse.statusCode == 200) {
                this.basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
                this.basketRequest = new BasketRequest();
                this.isEditUpdate = false;
                this.isEditText = false;
                this.selectSlotTimeErrMsg = "";
                this.finalAmount = 0;
                this.packageDiscount = 0;
                this.consultaionFee = 0;
                this.getSlotsForThisDate();
                this.totalSlots = 0;
                this.emptySlots = 0;
                this.bookedSlots = 0;
                this.otherDiscountPercent = 0;
                this.otherDiscountValue = 0;
                (<any>$)("#recption-3").modal("hide");
                (<any>$)("#confirmationModal").modal("hide");
                alert("Booking Successful");
                this.paymentErrorMessage = "";
                this.continueDisabled = 0;
                this.isConfirming = false;
              } else {
                (<any>$)("#recption-3").modal("hide");
                (<any>$)("#confirmationModal").modal("hide");
                alert(this.basketResponse.statusMessage);
                // this.userBookedHsPackage = new BookedPackageResponse();
                this.getSlotsForThisDate();
                this.totalSlots = 0;
                this.emptySlots = 0;
                this.bookedSlots = 0;
                this.otherDiscountPercent = 0
                this.otherDiscountValue = 0;
                this.isConfirming = true;
              }
            })

          }).catch((error) => {
            this.isConfirming = false;
            this.spinnerService.stop();
          });

        } else {
          this.isConfirming = false;
          this.paymentErrorMessage = "Discount can not be greater than Total Amount Payable";
        }
      } else {
        this.isConfirming = false;
        this.paymentErrorMessage = "Consultation fee cannot be negative";
      }
    }
    $('.patient-registerpopup').css({ 'height': '' });
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

  getPatientConsultationQueue(patientSlots: PatientSlots) {
    this.checkedSlots = 0;
    this.selectedDate.setHours(0);
    this.selectedDate.setMinutes(0);
    this.selectedDate.setSeconds(0);
    this.selectedDate.setMilliseconds(0);
    let date = this.selectedDate.getTime();
    console.log('convertedTimeSlot', this.convertedTimeSlot);
    let request: ConsultationQueueRequest = new ConsultationQueueRequest();
    request.pocId = this.pocId;
    request.date = date;
    request.doctorId = this.doctorId;
    request.digiQueue = false; // To be changed later, if required
    this.receptionService.getDoctorConsultationQueueFromServer(request).then(patientQueueList => {
      this.spinnerService.stop();
      this.patientConsultationQueueList = patientQueueList;
      this.patientConsultationQueueList.forEach(element => {
        this.convertedTimeSlot.forEach(melement => {
          if (melement.time == element.time && element.patientProfileId == melement.patientProfileId) {
            melement.status = element.status;
            melement.appointmentToken = element.appointmentToken;
          }
        });
      });
      //This is get checked count
      for (var i = 0; i < this.patientConsultationQueueList.length; i++) {
        if (this.patientConsultationQueueList[i].bookingSubType != 3 && this.patientConsultationQueueList[i].status == 6) {
          this.checkedSlots = this.checkedSlots + 1;
        }
      }
    });
  }

  onMarkPatientArrivedClick() {
    this.changePatientStatus(this.slotClickDateSlot, false);
  }

  onMoveToPaymentDeskClick() {
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.updatePayment(this.slotClickDateSlot);
  }

  //Logic to make a patient as arrived.
  changePatientStatus(dateSlot: TimeSlot, inPayment: boolean) {
    let arrivedPatient: PatientQueue = new PatientQueue();
    arrivedPatient.patientProfileId = dateSlot.patientProfileId;
    arrivedPatient.serviceId = dateSlot.serviceId;
    arrivedPatient.patientTitle = dateSlot.patientTitle;
    arrivedPatient.patientFirstName = dateSlot.patientFirstName;
    arrivedPatient.patientLastName = dateSlot.patientLastName ? dateSlot.patientLastName : '';
    arrivedPatient.patientTitle = dateSlot.patientTitle;
    arrivedPatient.parentProfileId = dateSlot.parentProfileId;

    arrivedPatient.visitDetails = dateSlot.visitDetails;
    arrivedPatient.typeOfAppointment = dateSlot.typeOfAppointment;

    if (inPayment) {
      arrivedPatient.status = 7;//PatientSlots.IN_PAYMENT
    } else {
      arrivedPatient.status = 4;//PatientSlots.WAITING                
    }
    arrivedPatient.time = dateSlot.time;
    arrivedPatient.orderId = dateSlot.orderId;
    arrivedPatient.invoiceId = dateSlot.invoiceId;
    let time = new Date();
    time.setFullYear(1970, 0, 1);
    // arrivedPatient.visitedTime = time.getTime();

    arrivedPatient.localAppointmentTime = this.getTimeStampFromOnlytime(dateSlot.timeString);
    arrivedPatient.doctorId = dateSlot.doctorId;
    arrivedPatient.doctorFirstName = dateSlot.doctorFirstName;
    arrivedPatient.doctorLastName = dateSlot.doctorLastName ? dateSlot.doctorLastName : '';
    arrivedPatient.doctorTitle = dateSlot.doctorTitle;
    arrivedPatient.patientGender = dateSlot.patientGender;
    //arrivedPatient.patientAge = dateSlot.age;
    arrivedPatient.patientDOB = dateSlot.patientDOB
    arrivedPatient.patientProfilePic = dateSlot.patientProfilePic;
    arrivedPatient.patientContactNumber = dateSlot.patientContactNumber;
    arrivedPatient.bookingType = 3;
    arrivedPatient.bookingSubType = 0;// Setting the consultation type
    arrivedPatient.visitedTime = new Date().getTime();
    if (!this.containsObject(arrivedPatient, this.patientConsultationQueueList)) {

      if (arrivedPatient.visitedTime < this.getTimeStampFromOnlytime(dateSlot.timeString)) {
        let isAddedToQueue: boolean = false;
        for (let i = 0; i < this.patientConsultationQueueList.length; i++) {
          let presentPatient: PatientQueue = this.patientConsultationQueueList[i];
          if (!isAddedToQueue && this.getTimeStampFromOnlytime(dateSlot.timeString) < presentPatient.localAppointmentTime) {
            this.patientConsultationQueueList.splice(i, 0, arrivedPatient);
            arrivedPatient.order = i;
            isAddedToQueue = true;
            continue;
          }

          if (isAddedToQueue) {
            presentPatient.order = i;
          }
        }

        if (!isAddedToQueue) {
          this.patientConsultationQueueList.push(arrivedPatient);
          arrivedPatient.order = this.patientConsultationQueueList.length - 1;
        }

      } else {
        this.patientConsultationQueueList.push(arrivedPatient);
        arrivedPatient.order = this.patientConsultationQueueList.length - 1;
      }
    }
    else {
      this.patientConsultationQueueList[this.patientConsultationQueueList.indexOf(arrivedPatient)].status = 4;//PatientSlots.WAITING
    }
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    this.currentDate = currentDate.getTime();

    let doctorAppointmentDetails: DoctorAppointmentDetails = new DoctorAppointmentDetails();
    doctorAppointmentDetails.pocId = this.pocId;
    doctorAppointmentDetails.patientSlotAppointmentList = this.patientConsultationQueueList;
    doctorAppointmentDetails.date = this.currentDate;
    doctorAppointmentDetails.digiQueue = dateSlot.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_DIGIROOM;//PatientSlots.TYPE_DIGI
    doctorAppointmentDetails.doctorId = dateSlot.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_DIGIROOM ? BasketConstants.DOCTOR_BOOKING_SUBTYPE_POC : dateSlot.doctorId;

    let patientVitalInfo: PatientVitalInfo = new PatientVitalInfo();
    patientVitalInfo.date = this.currentDate;

    patientVitalInfo.doctorId = dateSlot.doctorId;
    patientVitalInfo.doctorFirstName = dateSlot.doctorFirstName;
    patientVitalInfo.doctorLastName = dateSlot.doctorLastName ? dateSlot.doctorLastName : '';
    patientVitalInfo.doctorTitle = dateSlot.doctorTitle;
    patientVitalInfo.patientGender = dateSlot.patientGender;
    //patientVitalInfo.patientAge = dateSlot.age;
    patientVitalInfo.patientDOB = dateSlot.patientDOB;
    patientVitalInfo.patientProfileId = dateSlot.patientProfileId;
    patientVitalInfo.pocId = dateSlot.pocId;
    patientVitalInfo.orderId = dateSlot.orderId;
    patientVitalInfo.invoiceId = dateSlot.invoiceId;
    patientVitalInfo.time = dateSlot.time;
    patientVitalInfo.serviceId = dateSlot.serviceId;
    patientVitalInfo.patientTitle = dateSlot.patientTitle;
    patientVitalInfo.patientFirstName = dateSlot.patientFirstName;
    patientVitalInfo.patientLastName = dateSlot.patientLastName ? dateSlot.patientLastName : '';
    patientVitalInfo.patientTitle = dateSlot.patientTitle;
    patientVitalInfo.vitalStatus = PatientVitalInfo.VITAL_NOT_COMPLETED;
    patientVitalInfo.patientProfilePic = dateSlot.patientProfilePic;
    patientVitalInfo.vitalDetail = new VitalDetail();
    patientVitalInfo.bookingType = dateSlot.bookingType;
    let request: PatientArrivalRequest = new PatientArrivalRequest();
    request.doctorDailyAppointment = doctorAppointmentDetails;
    request.patientVitalInformation = patientVitalInfo;
    request.doctorDailyAppointment.patientSlotAppointmentList.forEach(patientQueue => {
      delete patientQueue.localAppointmentTime;
    });

    // Network operation to update
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.receptionService.updateConsultationQueueToServer(request).then(patienbaseResponse => {
      this.spinnerService.stop();
      this.convertedTimeSlot = new Array<TimeSlot>();
      this.getSlotsForThisDate();
      this.totalSlots = 0;
      this.emptySlots = 0;
      this.bookedSlots = 0;
      this.basketRequest = new BasketRequest();
      this.slotClickDateSlot = new TimeSlot();
    });
  }

  // Payment Update
  updatePayment(dateSlot: TimeSlot) {
    let request: BasketRequest = new BasketRequest();

    request.orderId = dateSlot.orderId;
    request.parentProfileId = dateSlot.parentProfileId;
    request.createdTimestamp = new Date().getTime();
    request.updatedTimestamp = new Date().getTime();

    let slotBookingDetails = new SlotBookingDetails();
    slotBookingDetails.payment.finalAmount = dateSlot.payment.finalAmount > 0 ? dateSlot.payment.finalAmount :
      (dateSlot.payment.originalAmount - dateSlot.payment.packageDiscountAmount);
    slotBookingDetails.payment.originalAmount = dateSlot.payment.originalAmount;
    slotBookingDetails.payment.packageDiscountAmount = dateSlot.payment.packageDiscountAmount;


    request.slotBookingDetailsList = new Array<SlotBookingDetails>();

    slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    slotBookingDetails.slotDate = this.currentDate;
    slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;

    slotBookingDetails.slotTime = dateSlot.time;


    slotBookingDetails.serviceId = dateSlot.serviceId;
    slotBookingDetails.pocId = dateSlot.pocId;


    slotBookingDetails.parentProfileId = dateSlot.parentProfileId;

    slotBookingDetails.patientProfileId = dateSlot.patientProfileId;

    slotBookingDetails.doctorId = dateSlot.doctorId;

    slotBookingDetails.bookingSubType = dateSlot.bookingSubType;

    slotBookingDetails.bookingSource = dateSlot.bookingSource;
    slotBookingDetails.paymentSource = 3;
    slotBookingDetails.baseInvoiceId = dateSlot.invoiceId;
    slotBookingDetails.parentInvoiceId = dateSlot.invoiceId;
    slotBookingDetails.orderId = dateSlot.orderId;
    slotBookingDetails.invoiceId = dateSlot.invoiceId;
    slotBookingDetails.payment = dateSlot.payment;
    request.transactionType = dateSlot.payment.transactionType;
    slotBookingDetails.slotStatus = 7;//PatientSlots.IN_PAYMENT
    slotBookingDetails.empId = this.auth.userAuth.employeeId;

    request.slotBookingDetailsList.push(slotBookingDetails);
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.receptionService.getRevenueDetailsForDoctor(dateSlot.patientProfileId, dateSlot.parentProfileId, this.auth.userAuth.pocId).then(response => {
      if (response.revenue != undefined) {
        dateSlot.visitDetails = new ProfileVisitedDetails();
        dateSlot.visitDetails.revenue = response.revenue;
        dateSlot.visitDetails.lastVisitedDate = response.lastVisitedDate;
        dateSlot.visitDetails.noOfVisits = response.noOfVisits;
        request.slotBookingDetailsList[0].visitDetail = response;

        this.receptionService.updatePaymentDeskToServer(request).then(patienbaseResponse => {
          this.spinnerService.stop();
          this.convertedTimeSlot = new Array<TimeSlot>();
          this.totalSlots = 0;
          this.emptySlots = 0;
          this.bookedSlots = 0;

          this.changePatientStatus(this.slotClickDateSlot, true);
        });
      }
    });
  }

  containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }
    return false;
  }
  getAge(dob: number): string {
    let age: string = '';
    if (dob > 0) {
      var days = Math.floor((Date.now() - dob) / (1000 * 60 * 60 * 24));
      var ageYears = Math.floor(days / 365);
      var ageMonths = Math.floor((days % 365) / 31);
      if (ageYears <= 0) {
        age = ageMonths + ' Months';
      }
      else if (ageYears >= 1) {
        age = ageYears + ' Years';
      }
    }
    return age;
  }
  convertDateToTimestamp(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    var dateString = [mnth, day, date.getFullYear()].join("-");
    var newDate = new Date(dateString.split("-").join("/")).getTime();
    return newDate
  }

  onWalkInClick() {
    var today = new Date();
    this.confirmationDate = this.datePipe.transform(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime(), 'dd/MMM/yyyy');
    this.confirmationTime = this.datePipe.transform(new Date(1970, 0, 1, today.getHours(), today.getMinutes(), 0, 0).getTime(), 'hh:mm a');
    this.isWalkInClicked = true;
    this.dropDownIndexForPackages = 0
    $('.patient-registerpopup').css({ 'height': '' });
  }

  onWalkInClickCallServer() {

    let request: BasketRequest = new BasketRequest();
    request.parentProfileId = this.parentProfile.profileId;
    request.bookingSource = 3; //For portal booking source is 3
    let slotBookingDetails = new SlotBookingDetails();
    console.log("SlotBookingDetails: " + JSON.stringify(this.tempSlotBookingDetails));
    slotBookingDetails = this.tempSlotBookingDetails;
    slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
    slotBookingDetails.bookingSubType = BasketConstants.DOCTOR_BOOKING_SUBTYPE_WALKIN;
    slotBookingDetails.bookingSource = 3; //For portal booking source is 3
    slotBookingDetails.brandId = this.brandId;
    slotBookingDetails.userPackageId = this.slotBookingDetails.userPackageId;

    slotBookingDetails.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    slotBookingDetails.payment.transactionType = this.transactionTypeForWalkIn;
    slotBookingDetails.payment.transactionId = request.transactionId = this.transactionId;
    request.transactionType = this.transactionTypeForWalkIn;
    /*  slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
    slotBookingDetails.bookingSubType = SlotBookingDetails.SERVICE_TYPE_WALKIN; */
    slotBookingDetails.isDigiQueue = false;
    slotBookingDetails.slotDate = DateUtil.removeTimeInMillis(this.walkinSlotDate.getTime());
    slotBookingDetails.slotTime = this.walkinSlotTime.getTime();

    slotBookingDetails.serviceId = this.selectedDoctor.serviceId;
    slotBookingDetails.serviceName = this.selectedDoctor.serviceName;
    slotBookingDetails.pocId = this.auth.userAuth.pocId;
    slotBookingDetails.parentProfileId = this.parentProfile.profileId;
    slotBookingDetails.patientProfileId = this.selectedProfile.profileId;


    slotBookingDetails.doctorId = this.selectedDoctor.empId;

    slotBookingDetails.addToConsultationQueue = true;

    slotBookingDetails.empId = this.auth.userAuth.employeeId;
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.receptionService.getRevenueDetailsForDoctor(slotBookingDetails.patientProfileId, slotBookingDetails.parentProfileId, this.auth.userAuth.pocId).then(response => {
      slotBookingDetails.visitDetail = response;

      slotBookingDetails.slotStatus = 7;
      request.slotBookingDetailsList.push(slotBookingDetails);
      this.diagnosticService.initiatePayment(request).then(patienbaseResponse => {
        this.spinnerService.stop();
        if (patienbaseResponse.statusCode == 201 || patienbaseResponse.statusCode == 200) {
          this.convertedTimeSlot = new Array<TimeSlot>();
          this.totalSlots = 0;
          this.emptySlots = 0;
          this.bookedSlots = 0;
          (<any>$)("#recption-3").modal("hide");
          (<any>$)("#confirmationModal").modal("hide");
          this.paymentErrorMessage = "";
          this.continueDisabled = 0;
          this.isWalkInClicked = false;
          this.getSlotsForThisDate();
          this.dropDownIndexForPackages = 0;
          alert("Booking Successful");
          this.isConfirming = false;
        } else {
          alert(patienbaseResponse.statusMessage);
          (<any>$)("#recption-3").modal("hide");
          (<any>$)("#confirmationModal").modal("hide");
        }
      });

    });
  }

  onContinueClick() {
    this.selctedSlotInfo.slot = this.selectedSlotTime.slot;
    this.isEditText = false;
    this.isEditUpdate = false;
    this.isWalkInClicked = false;
    this.dropDownIndexForPackages = 0;
  }

  opencancelModal(id: string) {
    (<any>$('#addpay')).modal('hide');
    (<any>$(id)).modal({
      show: true,
      escapeClose: false,
      clickClose: false,
      showClose: false,
      backdrop: "static",
      keyboard: false
    });
  }

  openReschedule(item) {
    this.totalSlots = 0;
    this.emptySlots = 0;
    this.bookedSlots = 0;
    this.convertedTimeSlot = new Array<TimeSlot>();
    this.totalConvertedTimeSlot = new Array<TimeSlot>();
    this.patientSlots = undefined;
    if (this.doctorId != undefined) {
      this.spinnerService.start();
      this.receptionService.getPatientSlotForDoctor(this.pocId, this.serviceId, this.doctorId, true).then((doctortimeSlot) => {
        this.spinnerService.stop();
        this.patientSlots = doctortimeSlot;
        if (this.patientSlots.statusCode == 200) {

          this.patientSlots.slots.forEach(element => {
            element.dateSlots.forEach(e => {
              if (e.serviceId == this.serviceId) {
                item = e;
                this.receptionService.bookedDate = this.bookedDate;
                this.receptionService.age = this.bookedPatientage
                this.receptionService.invoiceId = this.invoiceId
              }

            })
          });
          // console.log("Item: ", item);
          console.log("slotClickDateSlot: ", this.slotClickDateSlot)
          item['doctorId'] = this.slotClickDateSlot.doctorId;
          item['pocId'] = this.slotClickDateSlot.pocId;
          item['serviceId'] = this.slotClickDateSlot.serviceId;
          item['doctorTitle'] = this.slotClickDateSlot.doctorTitle;
          item['doctorFirstName'] = this.slotClickDateSlot.doctorFirstName;
          item['doctorLastName'] = this.slotClickDateSlot.doctorLastName;
          item['patientTitle'] = this.slotClickDateSlot.patientTitle;
          item['patientFirstName'] = this.slotClickDateSlot.patientFirstName;
          item['patientLastName'] = this.slotClickDateSlot.patientLastName;
          item['patientContactNumber'] = this.slotClickDateSlot.patientContactNumber;
          item['orderId'] = this.slotClickDateSlot.orderId;
          item['patientGender'] = this.slotClickDateSlot.patientGender;
          this.receptionService.patientSlotForDoc = item;
          (<any>$)("#addpay").modal("hide");
          this.router.navigate(['/app/reception/reschedule']);
        }
      });
    }
  }

  closeCancelModal(id: string) {
    (<any>$(id)).modal('hide');
    (<any>$('#addpay')).modal('show');
    $('#addpay').on('shown.bs.modal', function (e) {
      $("body").addClass("modal-open");
    });
  }
  roundToTwo(num) {
    num = num + "e+2";
    return +(Math.round(num) + "e-2");
  }
}


$(document).ready(  ()=> {
  let self = this;
  $('.modal').on('hidden.bs.modal', function (e) {
    $("input:radio").removeAttr("checked");
    if ($('.modal').hasClass('in')) {
      // self.otherDiscountAmount = 0;
      // self.otherDiscountPercent = 0;
      // self.grandTotalAmount = 0;
      // self.otherDiscountValue = 0;
      // $('body').addClass('modal-open');
    }
  });

});

