import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { PocDetail } from './../../../../model/poc/pocDetails';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { DoctorLeaveRequest } from '../../../../model/employee/doctorleaverequest';
import { DoctorLeaveResponse } from '../../../../model/employee/doctorleaveresponse';
import { DoctorScheduleDetails } from '../../../../model/employee/doctorscheduledetails';
import { DashboardItem } from '../../../../model/dashBoard/dashBoard';
import { Timing } from '../../../../model/employee/timing';
import { ScheduleRequest } from '../../../../model/employee/schedulerequest';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { Config } from '../../../../base/config';

@Component({
  selector: 'doctordetails',
  templateUrl: './doctordetails.template.html',
  styleUrls: ['./doctordetails.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class DoctorDetailsComponent implements OnInit {
  fromDate: Date = new Date();
  toDate: Date = new Date();
  fromTime: Date = new Date(1970, 0, 1);
  toTime: Date = new Date(1970, 0, 1);
  POCList: DashboardItem[] = new Array<DashboardItem>();
  schedules = new Array<any>();
  doctorId: number;
  conflict: boolean = false;
  doctorDetail: DoctorDetails;
  list: DoctorLeaveResponse = new DoctorLeaveResponse();
  schedule: DoctorScheduleDetails = new DoctorScheduleDetails();
  doctorLeaves: Array<DoctorLeaveRequest>;
  // pocId: number;
  pocDetails: PocDetail;
  slotPublishDays: number;
  originalPrice: number;
  count: number;
  hourList = [];
  scheduleId: number;
  editScheduleId: number;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  message: string;
  message1: string;
  dayCheckBoxList: number[] = new Array();
  timeInterval: number;
  minutes: number;
  serviceList: any;
  validation: any;
  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear((new Date().getFullYear()) + 100)),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }
  timeDurationSlotList = new Array();
  slotDurationEdit: number = 0;
  isScheduleBtnDisable: boolean = false;
  cnsltnErrMsg: string[];
  docParticipatePoc: EmployeePocMapping;

  constructor(private superAdminService: SuperAdminService, private auth: AuthService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil,
    private toast: ToasterService) {
    this.validation = validationUtil;
  }
  ngOnInit() {
    var reset = this;
    $('.modal').on('hidden.bs.modal', function (e) {
      reset.onRefresh();
    });
    this.fetchDoctorDetails();
    this.timeDurationSlotList = [5, 10, 15, 20, 30, 45, 50, 60];
    this.doctorId = this.doctorDetail.empId;
    this.getScheduleList();
    if (!Config.portal.specialFeatures.enableZeroPriceBilling) {
      this.checkConsulatationFee();
    }
    this.fromDate = null;
    this.toDate = null;

    $(document).ready(function () {
      $(document).on('click', '.buying-selling', function () {
        if ($(this).hasClass('active')) {
          $('.buying-selling').removeClass('active');
        }
        else if ($('.buying-selling').hasClass('active')) {
          $('.buying-selling').removeClass('active');
          $(this).addClass('active');
        }
        else {
          $(this).addClass('active');
        }
      });
    });
  }
  fetchDoctorDetails() {
    this.pocDetails = this.superAdminService.pocDetail;
    this.doctorDetail = this.superAdminService.doctorDetail;
    if (this.doctorDetail) {
      let data = { 'doctorDetail': this.doctorDetail, 'pocDetails': this.pocDetails };
      this.hsLocalStorage.setDataEncrypted('doctorDetailloc', data);
    } else {
      let locData = this.hsLocalStorage.getDataEncrypted('doctorDetailloc');
      this.doctorDetail = locData.doctorDetail;
      this.pocDetails = locData.pocDetails;
      this.superAdminService.doctorDetail = this.doctorDetail;
      this.superAdminService.pocDetail = this.pocDetails;
    }
    this.docParticipatePoc = this.doctorDetail.employeePocMappingList.filter(e => e.pocId == this.pocDetails.pocId)[0];
  }
  checkConsulatationFee() {
    let participationData = this.docParticipatePoc.participationSettings;
    this.cnsltnErrMsg = new Array();
    this.isScheduleBtnDisable = false;
    // console.log(`check ConsultationFee ${JSON.stringify(this.doctorDetail.employeePocMappingList)}`);
    this.docParticipatePoc.serviceList.forEach(e => {
      if ((participationData.doctorDigiAvailable && (!e.digiConsultationFee || e.digiConsultationFee <= 0)) ||
        (participationData.homeConsultationAvailable && (!e.homeConsultationFee || e.homeConsultationFee <= 0)) ||
        (participationData.doctorVideoLaterAvailable && (!e.videoLaterConsultationFee || e.videoLaterConsultationFee <= 0)) ||
        (participationData.doctorVideoNowAvailable && (!e.videoNowConsultationFee || e.videoNowConsultationFee <= 0)) ||
        (participationData.doctorPhysicallyAvailable && (!e.walkinConsultationFee || e.walkinConsultationFee <= 0)) ||
        (!participationData.doctorDigiAvailable && !participationData.homeConsultationAvailable && !participationData.doctorVideoLaterAvailable
          && !participationData.doctorVideoNowAvailable && !participationData.doctorPhysicallyAvailable) ||
        ((!e.digiConsultationFee || e.digiConsultationFee <= 0) && (!e.homeConsultationFee || e.homeConsultationFee <= 0)
          && (!e.videoLaterConsultationFee || e.videoLaterConsultationFee <= 0) && (!e.videoNowConsultationFee || e.videoNowConsultationFee <= 0)
          && (!e.walkinConsultationFee || e.walkinConsultationFee <= 0))
      ) {
        this.isScheduleBtnDisable = true;
      } else {
        this.isScheduleBtnDisable = false;
      }
    });
    if (!this.docParticipatePoc.serviceList || this.docParticipatePoc.serviceList.length <= 0) {
      this.isScheduleBtnDisable = true;
    }
    console.log(`check ConsultationFee isScheduleBtnDisable==>${this.isScheduleBtnDisable}`);
    if (this.isScheduleBtnDisable) {
      this.cnsltnErrMsg.push('Please add consultation fees for all services to create schedule.');
    }

  }

  getScheduleList() {
    this.schedules = new Array<any>();
    this.spinnerService.start();
    this.superAdminService.getScheduleList(this.doctorId).then(respList => {
      this.POCList = respList;
      this.spinnerService.stop();
      for (let i = 0; i < this.POCList.length; i++) {
        if (this.POCList[i].pocDetail.pocId == this.pocDetails.pocId) {
          // this.employeePoc = this.POCList[i];
          for (let j = 0; j < this.POCList[i].schedules.length - 1; j++) {
            if (this.POCList[i].schedules[j].scheduleId != this.POCList[i].schedules[j + 1].scheduleId)
              this.schedules.push(this.POCList[i].schedules[j + 1]);
          }
          this.schedules.push(this.POCList[i].schedules[0]);
        }
      }
    }).catch(error => {
      this.spinnerService.stop();
    });
  }
  openModal(id: string) {
    (<any>$(id)).modal("show");
    $(".modal-backdrop").not(':first').remove();
  }

  checkboxes() {
    var inputElems = document.getElementsByTagName("input"),
      count = 0;
    for (var i = 0; i < inputElems.length; i++) {
      if (inputElems[i].type === "checkbox" && inputElems[i].checked === true) {
        this.dayCheckBoxList.push(parseInt(inputElems[i].value));
        count++;
      }
    }
    this.count = count;
  }

  updateSchedule() {
    $('#myModal1').on('hidden.bs.modal', function (e) {

      $('.modal-backdrop').remove();
    });
    this.checkboxes();
    this.onCreateSchedule();
    let request: DoctorScheduleDetails = new DoctorScheduleDetails();
    request.doctorId = this.doctorDetail.empId;
    request.validFrom = this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) + this.commonUtil.getTimezoneDifferential();
    request.validTo = this.commonUtil.convertOnlyDateToTimestamp(this.toDate) + this.commonUtil.getTimezoneDifferential();
    request.pocId = this.pocDetails.pocId;
    request.displaySlotDays = this.slotPublishDays;
    if (request.validFrom > request.validTo || this.fromTime >= this.toTime) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage[0] = "Choose valid date And time"
    }
    else if (!this.timeInterval || !this.minutes || this.minutes <= 0) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage[0] = "Please select consultation slot-duration"
    }
    for (let i = 0; i < this.count; i++) {
      request.dateTiming[i] = new Timing();
      request.dateTiming[i].actualDate = 0;
      request.dateTiming[i].day = this.dayCheckBoxList[i];
      request.dateTiming[i].hours = new Array();
    }
    if (this.editScheduleId > 0) {
      request.scheduleId = this.editScheduleId;
      let fromTime = this.commonUtil.convertTimeToUTC(this.fromTime);
      let toTime = this.commonUtil.convertTimeToUTC(this.toTime);
      for (let i = 0; i < this.count; i++) {
        request.dateTiming[i].hours = new Array();
        this.hourList = [];
        for (let j = fromTime; j <= toTime; j = (j + this.minutes)) {
          this.hourList.push(j);
        }
        request.dateTiming[i].hours.push(this.hourList);
      }
      request.slotDuration = this.timeInterval;
    }
    else {
      request.scheduleId = 0;
      let fromTime = this.commonUtil.convertTimeToUTC(this.fromTime);
      let toTime = this.commonUtil.convertTimeToUTC(this.toTime);
      for (let i = 0; i < this.count; i++) {
        request.dateTiming[i].hours = new Array();
        this.hourList = [];
        for (let j = fromTime; j <= toTime; j = (j + this.minutes)) {
          this.hourList.push(j);
        }
        request.dateTiming[i].hours.push(this.hourList);
      }
      request.slotDuration = this.timeInterval;
    }

    this.docParticipatePoc && this.docParticipatePoc.serviceList ? request.serviceDetailList = this.docParticipatePoc.serviceList : '';

    if (this.isError == false) {
      this.spinnerService.start();
      this.superAdminService.updateSchedule(request).then(respList => {
        // this.updatedSchedule = respList;
        if (respList.conflictType == 2) {
          this.spinnerService.stop();
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Your schedule is conflicting with your own schedule in same centre";
          this.showMessage = true;
          return;
        }
        if (respList.conflictType == 1) {
          this.spinnerService.stop();
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Your schedule is conflicting with your own schedule in some other centre";
          this.showMessage = true;
          return;
        }
        if (respList.statusCode == 201 || respList.statusCode == 200) {
          this.spinnerService.stop();
          if (this.editScheduleId) {
            this.isError = false;
            this.errorMessage = new Array();
            this.errorMessage[0] = "";
            this.showMessage = false;
            alert("Schedule updated successfully.")
            setTimeout(() => {
              (<any>$)("#myModal1").modal("hide");
              this.getScheduleList();
              this.onRefresh();
            }, 100);
            return;
          }
          else {
            this.isError = false;
            this.errorMessage = new Array();
            this.errorMessage[0] = "";
            this.showMessage = false;
            alert("Schedule added successfully.")
            setTimeout(() => {
              (<any>$)("#myModal1").modal("hide");
              this.getScheduleList();
              this.onRefresh();
            }, 100);
            return;
          }
        }
        else {
          this.spinnerService.stop();
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Something went Wrong !!!";
          this.showMessage = true;
          return;
        }
      });
    }
  }
  onCreateSchedule() {
    if (this.commonUtil.convertTimeToUTC(this.fromTime) >= this.commonUtil.convertTimeToUTC(this.toTime)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select valid time.";
      this.showMessage = true;
      return;
    }
    if (this.commonUtil.convertOnlyDateToUTC(this.fromDate) > this.toDate.getTime()) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select valid date.";
      this.showMessage = true;
      return;
    }
    if (this.slotPublishDays == undefined || this.slotPublishDays == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select valid slot publish days.";
      this.showMessage = true;
      return;
    }
    if (this.timeIntervals == undefined || this.timeIntervals == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter valid slot duration.";
      this.showMessage = true;
      return;
    }
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }
  scheduleCancel() {
    // let request : DoctorScheduleDetails= new DoctorScheduleDetails();
    // request.slotDuration = this.timeInterval;
    this.onRefresh();
  }
  addNewSchdule() {
    $('#myModal1').on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').removeData();
    });
    let request: DoctorScheduleDetails = new DoctorScheduleDetails();
    this.fromTime = new Date(1970, 0, 1);
    this.toTime = new Date(1970, 0, 1);
    // this.fromDate = new Date();
    // this.toDate = new Date();
    this.fromDate = null;
    this.toDate = null;
    this.slotPublishDays = null;
    this.scheduleId = this.editScheduleId = 0;
    request.slotDuration = this.timeInterval;
    var inputElems = document.getElementsByTagName("input");
    for (var i = 0; i < inputElems.length; i++) {
      if (inputElems[i].type === "checkbox")
        inputElems[i].checked = false;

    }
  }

  onRefresh() {
    let request: DoctorScheduleDetails = new DoctorScheduleDetails();
    this.fromTime = new Date(1970, 0, 1);
    this.toTime = new Date(1970, 0, 1);
    this.fromDate = new Date();
    this.toDate = new Date();
    this.slotPublishDays = null;
    this.scheduleId = 0;
    this.dayCheckBoxList = new Array();

    for (let i = 0; i < this.schedule.dateTiming.length; i++) {
      $("#" + this.schedule.dateTiming[i].day).prop("checked", false);
    }
    this.slotDurationEdit = 0;
    $('.buying-selling').removeClass('active');
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }
  onEditButton(item) {
    this.superAdminService.doctorDetail.scheduleList = item;
    let request: ScheduleRequest = new ScheduleRequest();
    request.scheduleId = item.scheduleId;
    this.editScheduleId = item.scheduleId
    request.pocId = this.pocDetails.pocId;
    request.doctorId = item.doctorId;
    this.superAdminService.getdoctorschedule(request).then(respList => {
      this.schedule = respList;
      this.fromTime = new Date(this.schedule.dateTiming[0].hours[0][0]);
      this.toTime = new Date(this.schedule.dateTiming[0].hours[0][(this.schedule.dateTiming[0].hours[0].length) - 1]);
      if (new Date() > new Date((this.schedule.validFrom) + this.commonUtil.getTimezoneDifferential())) {
        this.fromDate = new Date((this.schedule.validFrom) + this.commonUtil.getTimezoneDifferential());
      }
      else {
        this.fromDate = new Date((this.schedule.validFrom) + this.commonUtil.getTimezoneDifferential());
      }
      this.toDate = new Date((this.schedule.validTo) + this.commonUtil.getTimezoneDifferential());
      this.slotPublishDays = this.schedule.displaySlotDays
      for (let i = 0; i < this.schedule.dateTiming.length; i++) {
        $("#" + this.schedule.dateTiming[i].day).prop("checked", true);
      }
      this.slotDurationEdit = new Date(this.schedule.slotDuration).getMinutes();
      this.timeIntervals(this.slotDurationEdit);
      $("#interval" + this.slotDurationEdit).addClass('active');
    });
  }

  onLeave() {
    let request: DoctorLeaveRequest = new DoctorLeaveRequest();
    request.doctorId = this.doctorDetail.empId;
    request.pocId = this.pocDetails.pocId;
    request.startDate = this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) + this.commonUtil.getTimezoneDifferential();
    request.endDate = this.commonUtil.convertOnlyDateToTimestamp(this.toDate) + this.commonUtil.getTimezoneDifferential();
    request.startTime = this.commonUtil.convertTimeToUTC(this.fromTime);
    request.endTime = this.commonUtil.convertTimeToUTC(this.toTime);
    request.proceed = false;
    if ((request.startTime == 0 && request.endTime == 0) && (request.startDate == request.endDate)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select valid date and time.";
      this.showMessage = true;
      this.conflict = false;
      return;
    }
    else if ((request.startTime >= request.endTime) && (request.startDate == request.endDate)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select vald time.";
      this.showMessage = true;
      this.conflict = false;
      return;
    }
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.superAdminService.updateDoctorLeave(request).then(responseList => {
      if (responseList.statusCode == 200 || responseList.statusCode == 201) {
        if (responseList.conflicts == true) {
          this.conflict = true;
          (<any>$)("#myModal3").modal("show");
          this.message = responseList.noOfSlotsAffecting + " Patients have already booked appointment which will be cancelled as a result of this modification.";
          this.message1 = "Do you want to go ahead with this modification?"
        }
        else if (responseList.conflicts == false) {
          this.conflict = false;
          (<any>$)("#myModal3").modal("hide");
          (<any>$)("#myModal2").modal("hide");
          alert("Updated successfully.");
        }
      }
      if (responseList.statusCode == 405) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = responseList.statusMessage;
        this.showMessage = true;
        // this.conflict = true;
        return;
      }
      else {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.conflict = false;
        // return;
      }
      this.list = responseList;

    });
  }

  onLeaveConfirm() {
    let request: DoctorLeaveRequest = new DoctorLeaveRequest();
    request.doctorId = this.doctorDetail.empId;
    request.pocId = this.pocDetails.pocId;
    request.startDate = this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) + this.commonUtil.getTimezoneDifferential();
    request.endDate = this.commonUtil.convertOnlyDateToTimestamp(this.toDate) + this.commonUtil.getTimezoneDifferential();
    request.startTime = this.commonUtil.convertTimeToUTC(this.fromTime);
    request.endTime = this.commonUtil.convertTimeToUTC(this.toTime);
    request.proceed = true;
    this.superAdminService.updateDoctorLeave(request).then(responseList => {
      if (responseList.statusCode == 200 || responseList.statusCode == 201) {
        alert("Updated successfully.");
        (<any>$)("#myModal3").modal("hide");
        (<any>$)("#myModal2").modal("hide");
      }
    });
  }
  timeIntervals(time: number) {
    this.timeInterval = this.commonUtil.convertMinutesToUTC(time);
    this.minutes = time * 60 * 1000;
  }

  validateDate(e) {
    console.log(e);

    if (e.keyCode == 110 || e.keyCode == 9 || e.keyCode == 8) {
      // return;
    }
    if (('' + e.target.value).length >= 10) {
      e.preventDefault();
      return false;
    }
    if (e.keyCode == 191 || e.keyCode == 111) {
      // return;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  showDoctorLeaves() {
    this.spinnerService.start();
    this.superAdminService.getDoctorLeaves(this.doctorDetail.empId, this.pocDetails.pocId).then(response => {
      this.spinnerService.stop();
      if (response && response.length > 0) {
        this.doctorLeaves = response;
      } else {
        this.doctorLeaves = new Array();
      }
      this.openModal('#myModal4');
    }).catch(err => {
      console.error(err);
      this.spinnerService.stop();
      this.doctorLeaves = new Array();
    })
  }

  deleteLeaveRequest(request) {
    (<any>$('#myModal4')).modal("hide");
    this.spinnerService.start();
    this.superAdminService.cancelDoctorLeave(request).then(response => {
      this.spinnerService.stop();
      this.showDoctorLeaves();
      this.toast.show("Cancelled the leave successfully.", "bg-success text-white font-weight-bold", 2000);
    }).catch(err => {
      console.error(err);
    })
  }

}