import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from './../../../../auth/auth.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    selector: 'loginhistory',
    templateUrl: './loginhistory.template.html',
    styleUrls: ['./loginhistory.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class PhleboLoginHistoryComponent {

    searchTerm: string = '';
    fromIndex: number = 0;
    dataMsg: string = ' ';
    fromDate: number = 0;
    toDate: number = 0;
    response: any = [];

    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    perPage: number = 10;
    pocId: number = 0;
    total: number = 0;
    limit: number = 50;
    empName: string = '';
    mobile: string = '';
    docs: Array<String> = [];

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
            variable: 'empName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Contact No',
            variable: 'mobile',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: false
        },
        {
            display: 'Time',
            variable: 'time',
            filter: 'time',
            sort: false
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewOrder',
            sort: false
        }
    ];

    constructor(private authService: AuthService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private spinnerService: SpinnerService) {
        if (authService.userAuth.selectedPoc.pocType == 9)
            this.pocId = this.authService.userAuth.pocId;
        else
            this.pocId = 0;
        this.getAgentList();
    }

    getAgentList() {
        this.response = [];
        this.spinnerService.start();
        this.dataMsg = 'Loading...';

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        }
        else {
            this.showMessage = false;
            this.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            this.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;

            this.diagnosticsService.getPhleboLoginHistory(this.pocId, this.fromIndex, this.limit, this.fromDate, this.toDate, this.empName, this.mobile).then(response => {
                this.spinnerService.stop()
                console.log("resposne", JSON.stringify(response));
                this.response = response;
                this.response.sort(function (a, b) {
                    if (a.time > b.time) return -1;
                    if (a.time < b.time) return 1;
                    return 0;
                });
                this.total = this.response.length;
                if (this.total == 0)
                    this.dataMsg = 'No Data Found';
            });
        }
    }

    getRefreshedorderList() {
        this.searchTerm = '';
        this.fromIndex = 0;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        $('#search').val('');
        this.getAgentList();
    }

    clickEventHandler(e) {
        if (e.event == 'viewOrder') {
            this.viewOrderDetails(e.val);
        }
    }

    viewOrderDetails(val) {
        let images = val.imageUrl;
        this.docs = [];
        if (images != null && images != undefined && images.length > 0) {
            images.forEach(url => {
                this.authService.getTempFileURLFromSecureURL(url).then((resp) => {
                    if (resp.statusCode == 200 || resp.statusCode == 201)
                        this.docs.push(resp.data);
                });
            });
        }
        (<any>$("#viewlogindocs")).modal("show");
    }

    endDateChoosen($event): void {
        this.endDate = $event;
        this.getAgentList();
    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.getAgentList();
    }

    onPage(page: number) {
        this.fromIndex = this.total + 1;
        this.getAgentList();
    }

    getBasedOnAgentName() {
        let search = $('#search').val().toString();
        this.empName = '';
        this.mobile = '';
        if (search.length > 0) {
            if (isNaN(parseInt(search))) {
                this.empName = search;
            } else {
                if (search.length != 10) {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage.push('Please Enter valid mobile number');
                    this.showMessage = true;
                    return;
                }
                this.mobile = search;
            }
        }
        this.getAgentList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getBasedOnAgentName();
        }
    }

}