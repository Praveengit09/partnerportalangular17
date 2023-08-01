import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { InvestigationRequest } from '../../../../../model/superadmin/investigationRequest';
import { InvestigationDayTime } from '../../../../../model/superadmin/investigationDayTime';
import { CommonUtil } from '../../../../../base/util/common-util';
import { ValidationUtil } from '../../../../../base/util/validation-util';
import { AppConfig } from '../../../../../app.config';
import { SuperAdminService } from '../../../../superadmin.service';
import { AuthService } from '../../../../../auth/auth.service';
import { SpinnerService } from '../../../../../layout/widget/spinner/spinner.service';

@Component({
    selector: 'createnewwellnessschedule',
    templateUrl: './createnewwellnessschedule.template.html',
    styleUrls: ['./createnewwellnessschedule.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class CreatenewWellnessScheduleComponent {

    date3: Date = new Date(2016, 5, 10);
    fromDate: Date = new Date();
    toDate: Date = new Date();
    fromTime: Date = new Date(1970, 0, 1);
    toTime: Date = new Date(1970, 0, 1);
    locFromTime: number = -this.commonUtil.getTimezoneDifferential();
    locToTime: number = -this.commonUtil.getTimezoneDifferential();

    timeInterval: any;
    minutes: any;
    datepickerOpts = {
        startDate: new Date(2016, 5, 10),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'D, d MM yyyy'
    }

    testId: number = 0;
    testList: any[] = [];
    selectedTest: string = "select";
    serviceName: string;
    serviceId: number = 0;
    testNameSelectTotal: number = 0;
    searchResult: any;
    testNameSearchResults: any;
    investigationRequest: InvestigationRequest;
    locInvestigationDayTime: Array<InvestigationDayTime> = new Array<InvestigationDayTime>();
    locDays: Array<number> = new Array<number>();
    appointment: number;
    precautions: string = "";
    item: any;
    selectColumns: any[] = [
        {
            variable: 'serviceName',
            filter: 'text'
        }
    ];
    pocDetails: any;
    daysArray = ["Sun", "Mon", "Tue", "Wed", "Thru", "Fri", "Sat"];
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    isMsgError: boolean = false;
    msgError: string = "";


    constructor(config: AppConfig,
        private superAdminService: SuperAdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil,
        private validationUtil: ValidationUtil) {
        // this.investigationRequest = new InvestigationRequest();
    }

    // ngOnInit() {
    //     let cryptoUtil: CryptoUtil = new CryptoUtil();
    //     if (window.localStorage.getItem('pocDetailInSuperAdmin') != null && window.localStorage.getItem('pocDetailInSuperAdmin').length > 0) {
    //         this.pocDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pocDetailInSuperAdmin')));
    //     }
    //     console.log("pocDetails in NgOninit---->" + JSON.stringify(this.pocDetails));
    //     this.getTestType();
    // }
    onSelectedTest(): void {
        // this.router.navigate(['/app/master/poc/manage/selectedtest/']);
    }
    // getTestType() {
    //     this.superAdminService.getTestType().then(resp => {
    //         console.log("resp in getTestType-->" + JSON.stringify(resp));
    //         this.testList = resp;
    //     })
    // }

    // onDelete(index){
    //  if(index > -1){
    //      this.locInvestigationDayTime.splice(index,1);
    //      console.log("locInvestigationDayTime in onDelete-->" + JSON.stringify(this.locInvestigationDayTime));
    //  }
    // }

    // onTestSelected(event) {
    //     console.log("event onTestSelected-->" + event + " " + this.selectedTest);
    //     if (event != "select") {
    //         var obj: any = this.testList.filter((val, index, testList) => {
    //             return val.categoryName == event;
    //         });
    //         this.testId = obj[0].categoryId;
    //         console.log("testObj onTestSelected-->" + JSON.stringify(obj) + " testId-->" + this.testId);
    //     } else {
    //         this.testId = 0;
    //         console.log("testId-->" + this.testId);
    //     }

    // }

    // testNameSearchTrigger(searchTerm: string) {
    //     console.log('In Product Name search...' + searchTerm);
    //     if (searchTerm.length > 2)
    //         this.searchTest(searchTerm);

    // }

    // searchTest(searchT) {
    //     if(this.testId == 0){
    //         this.isErrorCheck = true;
    //         setTimeout(() => {
    //             this.isErrorCheck = false;
    //         }, 1000);
    //     }
    //     var obj = {
    //         "searchTerm": searchT,
    //         "from": 0,
    //         "size": 20,
    //         "categoryId": this.testId
    //     }
    //     console.log("Obj in searchTest--->>>" + JSON.stringify(obj));
    //     this.superAdminService.getSearchedTermTest(obj).then(resp => {
    //         console.log("search termlist in searchTest--->" + JSON.stringify(resp));
    //         this.searchResult = resp;
    //         this.testNameSelectTotal = resp.length;
    //         this.testNameSearchResults = resp;
    //     });
    // }

    // selectTrigger(selected: any) {
    //     console.log("selected in selectTrigger--->" + JSON.stringify(selected));
    //     this.serviceName = selected.serviceName;
    //     this.serviceId = selected.serviceId;
    // }

    onFromDateSelected() {
        console.log("FromDate--->" + this.fromDate.getTime());
    }

    onToDateSelected() {
        console.log("ToDate--->" + this.toDate.getTime());
    }
    onDayClicked(day) {

    }
    // onDayClicked(day) {
    //     console.log("day clicked-->" + day);
    //     switch (day) {
    //         case 2: {
    //             console.log("Monday clicked...");
    //             if ($("#mon").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 3: {
    //             console.log("Tuesday clicked...");
    //             if ($("#tue").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 4: {
    //             console.log("wednesday clicked...");
    //             if ($("#wed").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 5: {
    //             console.log("thrusday clicked...");
    //             if ($("#thu").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 6: {
    //             console.log("friday clicked...");
    //             if ($("#fri").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 7: {
    //             console.log("saturday clicked...");
    //             if ($("#sat").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }
    //         case 1: {
    //             console.log("Sunday clicked...");
    //             if ($("#sun").prop('checked') == true) {
    //                 this.locDays.push(day);
    //             } else {
    //                 let index = this.locDays.indexOf(day);
    //                 this.locDays.splice(index, 1);
    //             }
    //             break;
    //         }

    //     }
    //     console.log("DaysArray-->" + JSON.stringify(this.locDays));
    // }

    onFromTimeSelected() {
        console.log("from time-->" + this.fromTime.getTime());
        this.locFromTime = this.fromTime.getTime();
    }

    onToTimeSelected() {
        console.log("To time-->" + this.toTime.getTime());
        this.locToTime = this.toTime.getTime();
    }
    onAddSchedule() {

    }

    // onAddSchedule() {
    //     if(this.locDays.length == 0){
    //         this.isMsgError = true;
    //         this.msgError = "Select atleast one day....";
    //         setTimeout(()=>{
    //             this.isMsgError = false;
    //             this.msgError = "";
    //         }, 2000);
    //         return;
    //     }else if(this.appointment==undefined||this.appointment==null||this.appointment==0){
    //         this.isMsgError = true;
    //         this.msgError = "enter number of appointment...";
    //         setTimeout(()=>{
    //             this.isMsgError = false;
    //             this.msgError = "";
    //         }, 2000);
    //         return;
    //     }
    //     let locData = new InvestigationDayTime();
    //     locData.days = this.locDays;
    //     locData.timings.startTime = this.locFromTime;
    //     locData.timings.endTime = this.locToTime;
    //     locData.timings.pplPerSlot = this.appointment;
    //     this.locInvestigationDayTime.push(locData);
    //     console.log("locInvestigationDayTime in onAddSchedule-->" + JSON.stringify(this.locInvestigationDayTime));
    //     this.locDays = new Array<number>();
    //     this.locFromTime = -19800000;
    //     this.locToTime = -19800000;
    //     this.appointment = 0;
    //     $("#mon").prop('checked', false);
    //     $("#tue").prop('checked', false);
    //     $("#wed").prop('checked', false);
    //     $("#thu").prop('checked', false);
    //     $("#fri").prop('checked', false);
    //     $("#sat").prop('checked', false);
    //     $("#sun").prop('checked', false);
    // }
    onCreate() { }
    // onCreate() {
    //     if (this.testId == 0) {
    //         this.isError = true;
    //         this.errorMessage = new Array();
    //         this.errorMessage[0] = "Select the Test Type...";
    //         this.showMessage = true;
    //         setTimeout(()=>{
    //             this.isError = false;
    //             this.showMessage = false;
    //         }, 2000);
    //         return;
    //     } else if(this.serviceId == 0){
    //         this.isError = true;
    //         this.errorMessage = new Array();
    //         this.errorMessage[0] = "Search the Test Name...";
    //         this.showMessage = true;
    //         setTimeout(()=>{
    //             this.isError = false;
    //             this.showMessage = false;
    //         }, 2000);
    //         return;
    //     }else if(this.locInvestigationDayTime==null || this.locInvestigationDayTime==undefined
    //         ||this.locInvestigationDayTime.length == 0){
    //         this.isError = true;
    //         this.errorMessage = new Array();
    //         this.errorMessage[0] = "Add atleast One Schedule...";
    //         this.showMessage = true;
    //         setTimeout(()=>{
    //             this.isError = false;
    //             this.showMessage = false;
    //         }, 2000);
    //         return;
    //     }
    //     this.investigationRequest = new InvestigationRequest();

    //     this.investigationRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.fromDate);
    //     this.investigationRequest.toDate =this.commonUtil.convertOnlyDateToTimestamp(this.toDate);
    //     this.investigationRequest.precautions = this.precautions;
    //     this.investigationRequest.specializationId = this.testId;
    //     this.investigationRequest.specialization = this.selectedTest;
    //     this.investigationRequest.serviceId = this.serviceId;
    //     this.investigationRequest.serviceName = this.serviceName;
    //     this.investigationRequest.investigationDayTime = new Array<InvestigationDayTime>();
    //     this.investigationRequest.investigationDayTime = this.locInvestigationDayTime;
    //     this.investigationRequest.pocId = this.pocDetails.pocId;
    //     console.log("InvestigationRequest in onCreate()--->" + JSON.stringify(this.investigationRequest));
    //     this.superAdminService.createDiagnosticSchedule(this.investigationRequest).then(resp => {
    //         console.log("Resp from Server----->" + JSON.stringify(resp));
    //         if(resp.statusCode == 200){
    //             this.isError = false;
    //             this.errorMessage = new Array();
    //             this.errorMessage[0] = "Success..";
    //             this.showMessage = true;
    //         }
    //         setTimeout(()=>{
    //             this.router.navigate(['/app/master/poc/manage/wellnessschedule']);
    //         }, 2000);
    //     });
    // }
}