import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { WellnessScheduleService } from '../../wellnessSchedule.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { AuthService } from '../../../../auth/auth.service';
import { InvestigationDayTime } from '../../../../model/superadmin/investigationDayTime';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';


@Component({
    selector: 'createnewwellnessschedule',
    templateUrl: './createwellnessschedule.template.html',
    styleUrls: ['./createwellnessschedule.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class CreateNewWellnessScheduleComponent implements OnInit {
    scheduleName: string = '';
    fromDate: Date = new Date();
    toDate: Date = new Date();
    fromTime: Date = new Date(1970, 0, 1);
    toTime: Date = new Date(1970, 0, 1);
    TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();
    investigationRequest: InvestigationRequest;//changes acc to your req pojo
    editInvestigationDayTime: InvestigationDayTime;//changes acc to your req pojo
    selectedInvestigationDetailsList: Array<InvestigationDetails> = new Array<InvestigationDetails>();//changes acc to your req pojo
    locInvestigationDayTimeList: Array<InvestigationDayTime> = new Array<InvestigationDayTime>();//changes acc to your req pojo
    locDaysList: Array<number> = new Array<number>();
    pocId: number;
    scheduleId: number;
    slotDuration: number = 0;
    appointment: number;
    // clusterId: number = 0;
    // locPrecautionList: any;
    selectedCity: LocationModeResponse = new LocationModeResponse();
    // selectedAreaList: LocationModeResponse[] = [];
    isCreate: boolean = false;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    isMsgError: boolean = false;
    msgError: string = "";
    isValidSlotTime: boolean;
    t1: any;
    t2: any;
    daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    datepickerOpts = {
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear((new Date().getFullYear()) + 100)),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    }



    constructor(config: AppConfig,
        private wellnessScheduleService: WellnessScheduleService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil,
        private validationUtil: ValidationUtil) {
        this.investigationRequest = new InvestigationRequest();
        this.pocId = this.auth.selectedPocDetails.pocId;
        this.scheduleId = 0;
    }

    ngOnDestroy(): void {
        if (this.wellnessScheduleService.isScheduleEdit) {
            this.wellnessScheduleService.editWellnessSchedule = this.editInvestigationDayTime;

        }
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();

        console.log("SelectedPOCAuth: " + JSON.stringify(this.auth.selectedPocDetails));

        if (window.localStorage.getItem('investigationRequest') != undefined && window.localStorage.getItem('investigationRequest') != null && window.localStorage.getItem('investigationRequest').length > 0) {
            this.investigationRequest = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('investigationRequest')));
            console.log("this.investigationRequest: " + JSON.stringify(this.investigationRequest));
            if (this.investigationRequest.serviceList.length > 0) {
                this.selectedInvestigationDetailsList = this.investigationRequest.serviceList;
            }
            if (this.investigationRequest.scheduleId != 0)
                this.scheduleId = this.investigationRequest.scheduleId;

            this.setData();
        }

        if (window.localStorage.getItem('selectedInvestigationDetailsList') != undefined && window.localStorage.getItem('selectedInvestigationDetailsList') != null && window.localStorage.getItem('selectedInvestigationDetailsList').length > 0) {
            this.selectedInvestigationDetailsList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedInvestigationDetailsList')));
        }
        console.log("selectedInvestigationDetailsList---->" + JSON.stringify(this.selectedInvestigationDetailsList));
        if (this.wellnessScheduleService.isScheduleEdit && this.wellnessScheduleService.editWellnessSchedule) {
            this.editInvestigationDayTime = this.wellnessScheduleService.editWellnessSchedule;
            this.onEdit(this.editInvestigationDayTime, -1);
        } else {
            this.wellnessScheduleService.editWellnessSchedule = new InvestigationDayTime();

        }

        if (this.scheduleId == 0) {
            this.isCreate = true;
            this.fromDate = null;
            this.toDate = null;
        } else {
            this.isCreate = false;
        }
        // this.selectedCity = this.wellnessScheduleService.selectedCity;
        if (this.investigationRequest.fromDate) {
            if (this.investigationRequest.fromDate < new Date().getTime()) {
                this.fromDate = new Date();
            }
            else {
                this.fromDate = new Date(this.investigationRequest.fromDate);
            }
            this.toDate = new Date(this.investigationRequest.toDate);
        } else {
            this.fromDate = null;
            this.toDate = null;
        }

    }


    setData() {
        console.log("**" + JSON.stringify(this.investigationRequest));
        if (this.investigationRequest.fromDate < new Date().getTime()) {
            this.fromDate = new Date();
        }
        else {
            this.fromDate = new Date(this.investigationRequest.fromDate);
        }
        this.toDate = new Date(this.investigationRequest.toDate);
        this.scheduleName = this.investigationRequest.scheduleName;
        this.scheduleId = this.investigationRequest.scheduleId;
        // this.locPrecautionList = this.investigationRequest.precautionList;
        this.locInvestigationDayTimeList = this.investigationRequest.scheduleList;
        if (this.investigationRequest.scheduleList.length > 0)
            this.locInvestigationDayTimeList = this.investigationRequest.scheduleList;
    }

    onEdit(item: InvestigationDayTime, index: number) {
        console.log("OnEdit: " + index + ">>>>" + JSON.stringify(item))
        if (item) {
            this.wellnessScheduleService.isScheduleEdit = true;
            this.editInvestigationDayTime = item;
            if (index > -1)
                this.locInvestigationDayTimeList.splice(index, 1);
            console.log("editInvestigationDayTime: " + JSON.stringify(this.editInvestigationDayTime));
            this.fromTime = new Date(this.editInvestigationDayTime.startTime);
            this.toTime = new Date(this.editInvestigationDayTime.endTime);
            console.log("TimestampToTime: " + this.fromTime + "ToTime: " + this.toTime);
            this.slotDuration = this.editInvestigationDayTime.slotDuration / 60000;
            console.log("SlotDuration: " + this.slotDuration);
            this.appointment = this.editInvestigationDayTime.pplPerSlot;

            for (let i = 0; i < this.editInvestigationDayTime.days.length; i++) {
                $("#" + this.editInvestigationDayTime.days[i]).prop("checked", true);
            }
        }
    }

    onDelete(index) {
        if (index > -1) {
            this.locInvestigationDayTimeList.splice(index, 1);
            console.log("locInvestigationDayTime in onDelete-->" + JSON.stringify(this.locInvestigationDayTimeList));
        }
    }

    checkboxes() {
        this.locDaysList = new Array<number>();
        var inputElems = document.getElementsByTagName("input")
        for (var i = 0; i < inputElems.length; i++) {
            if (inputElems[i].type === "checkbox" && inputElems[i].checked === true) {
                this.locDaysList.push(parseInt(inputElems[i].value));
            }
        }
    }

    clearCheckBoxes() {
        var inputElems = document.getElementsByTagName("input");
        for (var i = 0; i < inputElems.length; i++) {
            if (inputElems[i].type === "checkbox")
                inputElems[i].checked = false;

        }
    }

    onSelectedTest(): void {

        this.saveData();
        let cryptoUtil: CryptoUtil = new CryptoUtil();

        for (let i = 0; i < this.selectedInvestigationDetailsList.length; i++) {
            delete this.selectedInvestigationDetailsList[i].walkinOrderPriceDetails;
            delete this.selectedInvestigationDetailsList[i].homeOrderPriceDetails;
        }
        console.log(JSON.stringify(this.selectedInvestigationDetailsList));
        window.localStorage.setItem("investigationRequest", cryptoUtil.encryptData(JSON.stringify(this.investigationRequest)));
        if (this.selectedInvestigationDetailsList.length > 0)
            window.localStorage.setItem('selectedInvestigationDetailsList', cryptoUtil.encryptData(JSON.stringify(this.selectedInvestigationDetailsList)));
        if (this.investigationRequest != undefined && this.investigationRequest != null)
            window.localStorage.setItem('investigationRequest', cryptoUtil.encryptData(JSON.stringify(this.investigationRequest)));
        console.log('routetoservices');
        this.router.navigate(['/app/wellness/wellness_schedule/wellness_selectedservices/', this.pocId]);

    }

    saveData() {
        this.investigationRequest = new InvestigationRequest();
        this.investigationRequest.fromDate = this.fromDate != null ? this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) : this.fromDate;
        this.investigationRequest.toDate = this.toDate != null ? this.commonUtil.convertOnlyDateToTimestamp(this.toDate) : this.toDate;
        this.investigationRequest.scheduleName = this.scheduleName;
        this.investigationRequest.scheduleId = this.scheduleId;
        this.investigationRequest.pocId = this.pocId;
        // this.investigationRequest.precautionList = this.locPrecautionList;
        this.investigationRequest.scheduleList = this.locInvestigationDayTimeList;
        console.log("InvestigationRequest in saveData()--->" + JSON.stringify(this.investigationRequest));
    }

    onCreate() {
        console.log("Dateee: " + this.commonUtil.convertDateToTimestamp(new Date()) + ">>>>> " + this.commonUtil.convertDateToTimestamp(this.fromDate));
        if (this.scheduleName == "" || this.scheduleName == undefined || this.scheduleName == null) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter the schedule name.";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 5000);
            return;
        }
        else if (this.selectedInvestigationDetailsList || this.selectedInvestigationDetailsList.length == 0) {
            this.isMsgError = true;
            this.msgError = "Please Select Atleast one Diagnostic Test";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }
        else if (this.locInvestigationDayTimeList == null || this.locInvestigationDayTimeList == undefined
            || this.locInvestigationDayTimeList.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please add atleast one schedule.";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 5000);
            return;
        }
        else if (this.selectedInvestigationDetailsList.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select atleast one Test.";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 5000);
            return;
        }
        else if (this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) > this.commonUtil.convertOnlyDateToTimestamp(this.toDate)) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "To Date is earlier than From Date. Please select valid from and to dates.";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 5000);
            return;
        } else if (this.commonUtil.convertDateToTimestamp(this.fromDate) < this.commonUtil.convertDateToTimestamp(new Date())) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select valid from and to dates.";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 5000);
            return;
        }
        this.saveData();
        this.investigationRequest.serviceList = new Array<InvestigationDetails>();
        this.investigationRequest.serviceList = this.selectedInvestigationDetailsList;
        this.investigationRequest.scheduleType = 2;
        console.log("InvestigationRequest in onCreate()--->" + JSON.stringify(this.investigationRequest));
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.wellnessScheduleService.createWellnessSchedule(this.investigationRequest).then(resp => {
            console.log("Resp from Server----->" + JSON.stringify(resp));
            if (resp.statusCode == 200 || resp.statusCode == 201) {
                alert(resp.statusMessage);
                this.spinnerService.stop();
            } else {
                alert(resp.statusMessage);
                this.spinnerService.stop();
            }
            window.localStorage.removeItem('selectedInvestigationDetailsList');
            window.localStorage.removeItem('investigationRequest');
            window.localStorage.removeItem('selectedAreaList');
            this.router.navigate(['/app/wellness/wellness_schedule/schedulelistingofwellness/']);
        });
    }

    onAddSchedule() {

        console.log("slotDuration & appoitment--->" + this.slotDuration + " " + this.appointment);
        console.log("this.locInvestigationDayTimeList: " + JSON.stringify(this.locInvestigationDayTimeList));
        var temp = false;
        let doCompare = false;
        this.checkboxes();
        loop: for (let i = 0; i < this.locInvestigationDayTimeList.length; i++) {
            doCompare = true;
            break loop;

        }

        console.log("DoCompare: " + doCompare);
        if (doCompare) {
            for (let i = 0; i < this.locInvestigationDayTimeList.length; i++) {
                let days = this.locInvestigationDayTimeList[i].days;
                this.t1 = this.locInvestigationDayTimeList[i].startTime;
                this.t2 = this.locInvestigationDayTimeList[i].endTime;

                days.forEach(day => {
                    this.locDaysList.forEach(day1 => {
                        if (day == day1) {
                            if ((this.t1 <= (this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT)
                                && this.t2 > (this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT)) ||
                                (this.t1 < (this.commonUtil.convertTimeToUTC(this.toTime) + this.TIME_CONSTANT)
                                    && this.t2 >= (this.commonUtil.convertTimeToUTC(this.toTime) + this.TIME_CONSTANT)) ||
                                ((this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT) <= this.t1
                                    && (this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT) > this.t1) ||
                                ((this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT) < this.t2
                                    && (this.commonUtil.convertTimeToUTC(this.toTime) + this.TIME_CONSTANT) >= this.t2)) {
                                temp = true;
                            }
                        }
                    });
                });
            }
        }

        this.isValidSlotTime = temp;
        console.log("this.isValidSlotTime2: " + this.isValidSlotTime);
        console.log("this.locDaysList: " + this.locDaysList);
        if (this.locDaysList.length == 0) {
            this.isMsgError = true;
            this.msgError = "Please enter valid schedule timings. Schedule should be created for atleast one day";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        } else if (this.commonUtil.convertTimeToUTC(this.fromTime) > this.commonUtil.convertTimeToUTC(this.toTime)) {
            console.log("this.toMinutes: " + this.commonUtil.convertTimeToUTC(this.fromTime)
                + "this.fromMinutes: " + this.commonUtil.convertTimeToUTC(this.toTime));
            this.isMsgError = true;
            this.msgError = "To Time is earlier or equal to From Time. Please enter correct timings.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        } else if (this.isValidSlotTime != false) {
            this.isMsgError = true;
            this.msgError = "Please enter different timings. Schedule already exists for this timing.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }

        else if (this.slotDuration == undefined || this.slotDuration == null || this.slotDuration == 0) {
            this.isMsgError = true;
            this.msgError = "Please enter the Valid slot duration.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }
        else if (this.slotDuration > 60) {
            this.isMsgError = true;
            this.msgError = "Slot duration should be between 1 to 60";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        } else if (((this.commonUtil.convertTimeToUTC(this.toTime) / 60000) -
            (this.commonUtil.convertTimeToUTC(this.fromTime) / 60000)) < this.slotDuration) {
            this.isMsgError = true;
            this.msgError = "Slot Duration is more than total schedule duration.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        } else if (this.appointment == undefined || this.appointment == null || this.appointment == 0) {
            this.isMsgError = true;
            this.msgError = "Please enter the number of appointments per slot.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }
        let locData = new InvestigationDayTime();
        locData.days = this.locDaysList;
        locData.startTime = this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT;
        locData.startTimeAmPmFormat = this.formatAMPM(locData.startTime);
        locData.endTime = this.commonUtil.convertTimeToUTC(this.toTime) + this.TIME_CONSTANT;
        locData.endTimeAmPmFormat = this.formatAMPM(locData.endTime);
        locData.pplPerSlot = this.appointment;
        locData.slotDuration = this.slotDuration * 60000;
        this.locInvestigationDayTimeList.push(locData);
        console.log("locInvestigationDayTime in onAddSchedule-->" + JSON.stringify(this.locInvestigationDayTimeList));
        this.locDaysList = new Array<number>();
        this.appointment = 0;
        this.slotDuration = 0;
        this.clearCheckBoxes();
        this.fromTime = new Date(1970, 0, 1);
        this.toTime = new Date(1970, 0, 1);
        this.wellnessScheduleService.editWellnessSchedule = new InvestigationDayTime();
        this.wellnessScheduleService.isScheduleEdit = false;

    }

    formatAMPM(time) {
        console.log("Time to convert-->" + time);
        var t = new Date(time);
        console.log("t-->" + t);
        var hours = t.getHours();
        var minutes: any = t.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        console.log("Formated time-->" + strTime);
        return strTime;
    }


    validateSlot(evt: any) {
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }


    validateAppointment(event: any) {
        console.log("event2--->" + event.target.value);
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

}
