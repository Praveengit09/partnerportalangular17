import { CryptoUtil } from './../../../../../auth/util/cryptoutil';
import { Component, ViewEncapsulation } from "@angular/core";
import { AuthService } from './../../../../../auth/auth.service';
import { CommonUtil } from './../../../../../base/util/common-util';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { ProductDeliveryRequest } from './../../../../../model/product/productdeliveryrequest';
import { DiagnosticsService } from './../../../../diagnostics.service';

@Component({
    selector: 'cashagentdetails',
    templateUrl: './agentdetails.template.html',
    styleUrls: ['./agentdetails.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class CashDetailsComponent {

    agentDetails: any;
    dataMsg: string = ' ';
    pocId: number = 0;
    empId: number = 0;
    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    fromIndex: number = 0;
    response: any;
    data: any[] = [];
    total: number = 0;
    perPage: number = 10;
    totalCashCollected: number = 0;
    totalCashDelivered: number = 0;
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
            display: 'Poc Details',
            variable: 'pocDetails.pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Amount',
            variable: 'cashAmount',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'updatedTimestamp',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Status',
            variable: 'cashCollectedStatus',
            filter: 'text',
            sort: true,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Initiated'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Delivered'
                },
                {
                    condition: 'default',
                    label: 'Initiated'
                }
            ]
        },
        {
            display: 'Drop off Poc Details',
            variable: 'deliveredPocDetails.pocName',
            filter: 'text',
            sort: false
        }
    ];


    constructor(
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private authService: AuthService, private spinnerService: SpinnerService) {
        this.agentDetails = this.diagnosticsService.order;
        this.diagnosticsService.diagnosticsAdviseTrack == true ? this.pocId = 0 : this.pocId = this.authService.userAuth.pocId ;
        this.empId = this.agentDetails.empId;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('centralcashstartDate') != null && window.localStorage.getItem('centralcashstartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('centralcashstartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('centralcashendDate'))));
        }
    }

    ngOnInit(): void {
        this.getAgentOrderList();
    }

    getAgentOrderList() {
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
            let productDeliveryReq = new ProductDeliveryRequest();
            productDeliveryReq.pocId = this.pocId;
            productDeliveryReq.empId = this.empId;
            productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
            productDeliveryReq.fromIndex = this.fromIndex;
            productDeliveryReq.centralHomeOders = false;

            this.diagnosticsService.getAgentOrdersList(productDeliveryReq).then(response => {
                this.spinnerService.stop();
                console.log("resposne", JSON.stringify(response));
                this.response = response;
                this.totalCashCollected = this.response.totalCashCollected;
                this.totalCashDelivered =  this.response.totalCashDelivered;
                this.total = this.response.length;
                this.data = response.cashCollectedDetails;
                this.dataMsg = 'No Data Found';
            });
        }
    }

    endDateChoosen($event): void {
        this.endDate = $event;
        this.getAgentOrderList();
    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.getAgentOrderList();
    }

    onPage(page: number) {
        this.fromIndex = this.total + 1;
        this.getAgentOrderList();
    }

}
