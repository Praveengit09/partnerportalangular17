import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';
import { InvestigationDayTime } from '../../../../model/superadmin/investigationDayTime';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { OnboardingService } from '../../../../onboarding/onboarding.service';
import { DiagnosticScheduleService } from '../../schedule.service';



@Component({
    selector: 'createnewdiagnosticschedule',
    templateUrl: './createnewdiagnosticschedule.template.html',
    styleUrls: ['./createnewdiagnosticschedule.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class CreateNewDiagnosticScheduleComponent implements OnInit, OnDestroy {


    date3: Date = new Date(2016, 5, 10);
    fromDate: Date = new Date();
    toDate: Date = new Date();
    fromTime: Date = new Date(1970, 0, 1);
    toTime: Date = new Date(1970, 0, 1);
    TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();
    isValidSlotTime: boolean;
    timeInterval: any;
    minutes: any;

    datepickerOpts = {
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear((new Date().getFullYear()) + 100)),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    }

    testId: number = 0;
    testList: any[] = [];
    selectedTest: string = "select";
    scheduleName: string = "";
    tempStartTime: any;
    tempEndTime: any;
    t1: any;
    t2: any;
    serviceName: string;
    serviceId: number = 0;
    testNameSelectTotal: number = 0;
    searchResult: any;
    testNameSearchResults: any;
    slotDuration: number = 0;
    investigationRequest: InvestigationRequest;
    locInvestigationDayTimeList: Array<InvestigationDayTime> = new Array<InvestigationDayTime>();
    locDaysList: Array<number> = new Array<number>();
    appointment: number;
    precautions: string = "";
    item: any;
    selectColumns: any[] = [
        {
            variable: 'serviceName',
            filter: 'text'
        }
    ];
    pocId: any;
    daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    isMsgError: boolean = false;
    msgError: string = "";
    scheduleId: number;
    selectedInvestigationDetailsList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    locPrecautionList: any;
    isCreate: boolean;
    scheduleType: number = 1;
    homeCollectionScheduleExists: boolean;
    canHomeCollect: boolean;
    clusterId: number = 0;
    selectedAreaList: LocationModeResponse[] = [];
    editInvestigationDayTime: InvestigationDayTime;
    selectedCity: LocationModeResponse = new LocationModeResponse();

    constructor(config: AppConfig,
        private diagnosticScheduleService: DiagnosticScheduleService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil,
        private validationUtil: ValidationUtil, private onboardingService: OnboardingService) {
        this.investigationRequest = new InvestigationRequest();
        this.pocId = this.auth.selectedPocDetails.pocId;
        this.canHomeCollect = this.auth.selectedPocDetails.diagnosticSampleCollectionAvailable;
        this.scheduleId = 0;
    }

    ngOnDestroy(): void {
        console.log("ngOnDestroy: " + this.diagnosticScheduleService.isScheduleEdit + ">>>>" +
            this.diagnosticScheduleService.selectedAreaList);
        if (this.diagnosticScheduleService.isScheduleEdit) {
            this.diagnosticScheduleService.editDiagnosticSchedule = this.editInvestigationDayTime;
            this.diagnosticScheduleService.selectedCity = this.selectedCity;
            // console.log("ngOnDestroy: " + this.editInvestigationDayTime.areaClusterId);
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
            this.scheduleType = this.investigationRequest.scheduleType;
            console.log('Schedule type is ' + this.scheduleType);
            if (this.investigationRequest.scheduleId != 0)
                this.scheduleId = this.investigationRequest.scheduleId;

            this.setData();
        }

        if (window.localStorage.getItem('selectedInvestigationDetailsList') != undefined && window.localStorage.getItem('selectedInvestigationDetailsList') != null && window.localStorage.getItem('selectedInvestigationDetailsList').length > 0) {
            this.selectedInvestigationDetailsList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedInvestigationDetailsList')));
        }
        console.log("selectedInvestigationDetailsList---->" + JSON.stringify(this.selectedInvestigationDetailsList));
        if (this.diagnosticScheduleService.isScheduleEdit && this.diagnosticScheduleService.editDiagnosticSchedule) {
            this.editInvestigationDayTime = this.diagnosticScheduleService.editDiagnosticSchedule;
            console.log("ngOnInit: " + this.editInvestigationDayTime.areaClusterId);
            // this.selectedAreaList = this.diagnosticScheduleService.editDiagnosticSchedule.areaList;
            console.log("selectedAreaList---->" + JSON.stringify(this.selectedAreaList));
            this.onEdit(this.editInvestigationDayTime, -1);
        } else {
            this.diagnosticScheduleService.editDiagnosticSchedule = new InvestigationDayTime();
            this.selectedAreaList = this.diagnosticScheduleService.selectedAreaList;
            console.log("selectedAreaList---->" + JSON.stringify(this.selectedAreaList));
        }

        if (this.scheduleId == 0) {
            this.isCreate = true;
            this.fromDate = null;
            this.toDate = null;
        } else {
            this.isCreate = false;
        }
        this.selectedCity = this.diagnosticScheduleService.selectedCity;
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

    onSelectedTest(): void {
        if (!this.scheduleType || this.scheduleType > 2 || this.scheduleType < 1) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select a scheduleType";
            this.showMessage = true;
            return;
        }
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
        this.router.navigate(['/app/diagnostics/schedule/selectedtest/', this.pocId]);
    }

    onDelete(index) {
        if (index > -1) {
            this.locInvestigationDayTimeList.splice(index, 1);
            console.log("locInvestigationDayTime in onDelete-->" + JSON.stringify(this.locInvestigationDayTimeList));
        }
    }

    onEdit(item: InvestigationDayTime, index: number) {
        console.log("OnEdit: " + index + ">>>>" + JSON.stringify(item))
        if (item) {
            this.diagnosticScheduleService.isScheduleEdit = true;
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
            this.selectedAreaList = this.editInvestigationDayTime.areaList;
            this.clusterId = this.editInvestigationDayTime.areaClusterId;
            console.log("OnEdit: " + this.clusterId);
            for (let i = 0; i < this.editInvestigationDayTime.days.length; i++) {
                $("#" + this.editInvestigationDayTime.days[i]).prop("checked", true);
            }
            this.selectedCity = this.editInvestigationDayTime.cityDetails;
        }
    }

    onFromDateSelected() {

    }

    onToDateSelected() {

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

    onAddSchedule() {
        console.log("Yessssssss" + this.scheduleType);
        console.log("slotDuration & appoitment--->" + this.slotDuration + " " + this.appointment);
        console.log("this.locInvestigationDayTimeList: " + JSON.stringify(this.locInvestigationDayTimeList));
        console.log("this.selectedAreaList: " + JSON.stringify(this.selectedAreaList));
        var temp = false;
        let doCompare = false;

        this.checkboxes();
        loop: for (let i = 0; i < this.locInvestigationDayTimeList.length; i++) {
            if (this.scheduleType == 1) {
                /* if (this.locInvestigationDayTimeList[i].areaList && this.selectedCity.id != this.locInvestigationDayTimeList[i].areaList[0].parentId) {
                    this.isMsgError = true;
                    this.msgError = "Schedule can be created for one City at a Time.";
                    return;
                } else { */
                if (this.selectedAreaList && this.selectedAreaList.length > 0 &&
                    this.locInvestigationDayTimeList[i].areaList && this.locInvestigationDayTimeList[i].areaList.length > 0) {
                    this.selectedAreaList.forEach(selectedArea => {
                        this.locInvestigationDayTimeList[i].areaList.forEach(area => {
                            if (selectedArea.id === area.id) {
                                doCompare = true;
                                return;
                            }
                        });
                    });
                } else if (((this.selectedAreaList && this.selectedAreaList.length > 0)
                    && !(this.locInvestigationDayTimeList[i].areaList
                        && this.locInvestigationDayTimeList[i].areaList.length > 0))
                    || (!(this.selectedAreaList && this.selectedAreaList.length > 0)
                        && (this.locInvestigationDayTimeList[i].areaList
                            && this.locInvestigationDayTimeList[i].areaList.length > 0))) {
                    doCompare = true;
                    break loop;
                }
                // }
                if (this.selectedAreaList && this.selectedAreaList.length == 0 && !this.locInvestigationDayTimeList[i].cityDetails) {
                    doCompare = true;
                    break loop;
                }
            } else if (this.scheduleType == 2) {
                doCompare = true;
                break loop;
            }
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

        else if (this.slotDuration == undefined || this.slotDuration == null || this.slotDuration <= 0) {
            this.isMsgError = true;
            this.msgError = "Please enter the Valid slot duration.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }
        else if (this.slotDuration > 1440) {
            this.isMsgError = true;
            this.msgError = "Slot duration should be between 1 to 1440";
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
        } else if (this.appointment == undefined || this.appointment == null || this.appointment <= 0) {
            this.isMsgError = true;
            this.msgError = "Please enter the Valid number of appointments per slot.";
            setTimeout(() => {
                this.isMsgError = false;
                this.msgError = "";
            }, 5000);
            return;
        }
        let locData = new InvestigationDayTime();
        if (this.selectedAreaList && this.selectedAreaList.length > 0) {
            locData.areaList = this.selectedAreaList;
        }
        locData.areaClusterId = this.clusterId;
        locData.days = this.locDaysList;
        locData.startTime = this.commonUtil.convertTimeToUTC(this.fromTime) + this.TIME_CONSTANT;
        locData.startTimeAmPmFormat = this.formatAMPM(locData.startTime);
        locData.endTime = this.commonUtil.convertTimeToUTC(this.toTime) + this.TIME_CONSTANT;
        locData.endTimeAmPmFormat = this.formatAMPM(locData.endTime);
        locData.pplPerSlot = this.appointment;
        locData.slotDuration = this.slotDuration * 60000;
        locData.cityDetails = this.selectedCity;
        this.locInvestigationDayTimeList.push(locData);
        console.log("locInvestigationDayTime in onAddSchedule-->" + JSON.stringify(this.locInvestigationDayTimeList));
        this.locDaysList = new Array<number>();
        this.appointment = 0;
        this.slotDuration = 0;
        this.clusterId = 0;
        this.selectedAreaList = [];
        this.clearCheckBoxes();
        this.fromTime = new Date(1970, 0, 1);
        this.toTime = new Date(1970, 0, 1);
        this.selectedCity = new LocationModeResponse();
        this.diagnosticScheduleService.selectedAreaList = [];
        this.diagnosticScheduleService.editDiagnosticSchedule = new InvestigationDayTime();
        this.diagnosticScheduleService.isScheduleEdit = false;
        this.diagnosticScheduleService.selectedCity = new LocationModeResponse();
        this.diagnosticScheduleService.allAreasofCity = [];
    }

    clearCheckBoxes() {
        var inputElems = document.getElementsByTagName("input");
        for (var i = 0; i < inputElems.length; i++) {
            if (inputElems[i].type === "checkbox")
                inputElems[i].checked = false;

        }
    }

    saveData() {
        this.investigationRequest = new InvestigationRequest();
        this.investigationRequest.fromDate = this.fromDate != null ? this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) : this.fromDate;
        this.investigationRequest.toDate = this.toDate != null ? this.commonUtil.convertOnlyDateToTimestamp(this.toDate) : this.toDate;
        this.investigationRequest.scheduleName = this.scheduleName;
        /* this.investigationRequest.scheduleList = new Array<InvestigationDayTime>();
        this.investigationRequest.scheduleList = this.locInvestigationDayTimeList; */
        this.investigationRequest.scheduleId = this.scheduleId;
        this.investigationRequest.pocId = this.pocId;
        this.investigationRequest.precautionList = this.locPrecautionList;
        this.investigationRequest.scheduleType = this.scheduleType;
        this.investigationRequest.scheduleList = this.locInvestigationDayTimeList;
        console.log("InvestigationRequest in saveData()--->" + JSON.stringify(this.investigationRequest));
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
        this.locPrecautionList = this.investigationRequest.precautionList;
        this.scheduleType = this.investigationRequest.scheduleType;
        this.locInvestigationDayTimeList = this.investigationRequest.scheduleList;
        if (this.investigationRequest.scheduleList.length > 0)
            this.locInvestigationDayTimeList = this.investigationRequest.scheduleList;
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
        else if (this.selectedInvestigationDetailsList.length == 0) {
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
        else if (this.selectedInvestigationDetailsList.length == 0 && this.scheduleType > 1) {
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
        this.investigationRequest.precautionList = this.locPrecautionList;
        this.investigationRequest.scheduleType = this.scheduleType;

        console.log("InvestigationRequest in onCreate()--->" + JSON.stringify(this.investigationRequest));
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.diagnosticScheduleService.createDiagnosticSchedule(this.investigationRequest).then(resp => {
            console.log("Resp from Server----->" + JSON.stringify(resp));
            if (resp.statusCode == 200 || resp.statusCode == 201) {
                alert(resp.statusMessage);
                this.spinnerService.stop();
                window.localStorage.removeItem('selectedInvestigationDetailsList');
                window.localStorage.removeItem('investigationRequest');
                window.localStorage.removeItem('selectedAreaList');
                this.router.navigate(['/app/diagnostics/schedule/diagnosticschedule/']);
            } else {
                alert(resp.statusMessage);
                this.spinnerService.stop();
            }
        });
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

    checkScheduleSelection(value: number) {
        this.scheduleType = value;
        if (value == 1) {
            this.selectedInvestigationDetailsList = new Array();
        }
        console.log('isHomeCollectionSchedule' + this.scheduleType);
    }

    searchLocations() {
        this.saveData();
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.selectedInvestigationDetailsList.length > 0) {
            for (let i = 0; i < this.selectedInvestigationDetailsList.length; i++) {
                delete this.selectedInvestigationDetailsList[i].walkinOrderPriceDetails;
                delete this.selectedInvestigationDetailsList[i].homeOrderPriceDetails;
            }
            window.localStorage.setItem('selectedInvestigationDetailsList', cryptoUtil.encryptData(JSON.stringify(this.selectedInvestigationDetailsList)));
        }
        if (this.investigationRequest != undefined && this.investigationRequest != null)
            window.localStorage.setItem('investigationRequest', cryptoUtil.encryptData(JSON.stringify(this.investigationRequest)));
        if (this.diagnosticScheduleService.isScheduleEdit && this.editInvestigationDayTime
            && this.editInvestigationDayTime.areaList && this.editInvestigationDayTime.areaList.length > 0) {
            this.diagnosticScheduleService.editDiagnosticSchedule = this.editInvestigationDayTime;
            console.log("searchLocations: " + this.editInvestigationDayTime.areaClusterId);
        } else if (this.selectedAreaList &&
            this.selectedAreaList.length > 0) {
            this.diagnosticScheduleService.selectedAreaList = this.selectedAreaList;
        } else {
            this.diagnosticScheduleService.selectedAreaList = [];
        }
        this.router.navigate(['/app/diagnostics/schedule/diagnosticschedulelocation/']);
    }

    checkedScheduleType(value: number) {
        console.log("value: " + value);
        this.scheduleType = value;
    }

    remove(index: number): void {
        this.selectedAreaList.splice(index, 1);
    }
}