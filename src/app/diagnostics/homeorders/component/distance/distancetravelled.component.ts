import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { DiagnosticsService } from './../../../diagnostics.service';
import { DiagnosticAdminRequest } from './../../../../model/diagnostics/diagnosticAdminRequest';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'distancetravelled',
    templateUrl: './distancetravelled.template.html',
    styleUrls: ['./distancetravelled.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LogisticTravelledComponent {

    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    diagnoAdminRequest: DiagnosticAdminRequest;
    perPage: number = 10;
    total: number = 0;
    fromIndex: number = 0;
    dataMsg: string = '';
    searchCriteria: number = 0;
    searchTerm: string = '';
    response: any;

    startDate: Date = new Date();
    endDate: Date = new Date();
    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    columns: any[] = [
        {
            display: 'Agent Name',
            variable: 'empDetails.firstName empDetails.lastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Contact Details',
            variable: 'empDetails.contactList empDetails.emailId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Total Distance (IN KM)',
            variable: 'totalDistance',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: false
        }
    ];

    constructor(private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private spinnerService: SpinnerService) {
        this.getLogisticList();
    }

    getLogisticList() {

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        } else {
            this.showMessage = false;
            this.showMessage = false;
            this.errorMessage = new Array();
        }
        this.dataMsg = "Loading..";
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        this.diagnoAdminRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        this.diagnoAdminRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
        if (this.searchCriteria == 1)
            this.diagnoAdminRequest.searchTerm = this.searchTerm;
        else if (this.searchCriteria == 2)
            this.diagnoAdminRequest.mobile = this.searchTerm;
        this.response = new Array();
        this.spinnerService.start();
        this.diagnosticsService.getLogisticsDistance(this.diagnoAdminRequest).then(diagnoListAdminData => {
            this.spinnerService.stop();
            this.response = diagnoListAdminData;
            this.total = this.response.length;
            this.dataMsg = "No data found";
        })

    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.total = 0;
        this.response = new Array();
        this.getLogisticList();
    }

    endDateChoosen($event): void {
        this.endDate = $event;
        this.total = 0;
        this.response = new Array();
        this.getLogisticList();
    }

    onPage(e) {
        this.fromIndex = this.total + 1;
        this.getLogisticList();
    }

    getRefreshedList() {
        this.fromIndex = 0;
        this.searchTerm = '';
        $('#search').val('');
        this.getLogisticList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getBasedOnName();
        }
    }

    getBasedOnName() {
        this.searchTerm = $('#search').val().toString();
        this.searchCriteria = 0;
        if (isNaN(parseInt(this.searchTerm))) {
            this.searchCriteria = 1;
        } else {
            this.searchCriteria = 2;
            if (this.searchTerm.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            } else {
                this.errorMessage = new Array();
                this.showMessage = false;
                this.showMessage = false;
            }
        }
        this.getLogisticList();
    }
}