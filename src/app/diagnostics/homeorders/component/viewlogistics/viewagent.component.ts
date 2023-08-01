import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { Router } from '@angular/router';
import { ProductDeliveryRequest } from './../../../../model/product/productdeliveryrequest';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { DiagnosticsService } from './../../../diagnostics.service';
import { Component, ViewEncapsulation } from "@angular/core";


@Component({
    selector: 'viewagentdetails',
    templateUrl: './viewagent.template.html',
    styleUrls: ['./viewagent.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ViewAgentDetailsComponent {

    agentDetails: any;
    dataMsg: string = ' ';
    remarks: string = '';
    pocId: number = 0;
    empId: number = 0;
    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    fromIndex: number = 0;
    response: any;
    pickupData: any = [];
    deliveryData: any = [];
    total: number = 0;
    totals: number = 0;
    perPage: number = 10;
    perPag: number = 10;
    totalSamplesForPickup: number = 0;
    totalSamplesPickedup: number = 0;
    totalSamplesDelivered: number = 0;

    convertedDocumentUrlList: Array<String> = new Array();
    crouselSelectedImage: String;
    prescriptionType = "";

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
            display: 'Employee Details',
            variable: 'pickedUpFromEmployeeName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Poc Details',
            variable: 'pocDetails.pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Samples Picked',
            variable: 'totalSamplesPickedup',
            filter: 'text',
            sort: false
        },
        {
            display: 'Time',
            variable: 'date',
            filter: 'date',
            sort: false
        },
        {
            display: 'Documents',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewOrder',
            sort: false
        }
    ];

    col: any[] = [
        
        {
            display: 'Poc Details',
            variable: 'deliveredPocDetails.pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Samples Delivered',
            variable: 'totalSamplesDelivered',
            filter: 'text',
            sort: false
        },
        {
            display: 'Time',
            variable: 'date',
            filter: 'date',
            sort: false
        },
        {
            display: 'Documents',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewDeliveryOrder',
            sort: false
        }
    ];

    constructor(
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private router: Router,
        private authService: AuthService, private spinnerService: SpinnerService) {
        this.agentDetails = this.diagnosticsService.order;
        this.diagnosticsService.diagnosticsAdviseTrack == true ? this.pocId = 0 : this.pocId = this.authService.userAuth.pocId;
        this.empId = this.agentDetails.empId;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('logstartDate') != null && window.localStorage.getItem('logstartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logstartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logendDate'))));
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

            this.diagnosticsService.getLogisticAgentOrdersList(productDeliveryReq).then(response => {
                this.spinnerService.stop();
                this.response = response;
                this.totalSamplesForPickup = response.totalSamplesForPickup;
                this.totalSamplesPickedup = response.totalSamplesPickedup;
                this.totalSamplesDelivered = response.totalSamplesDelivered;
                this.pickupData = response.samplePickedDetails;
                this.total = this.pickupData.length;
                this.deliveryData = response.sampleDeliveredDetails;
                this.totals = this.deliveryData.length;
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

    clickEventHandler(e) {
        if (e.event == 'viewOrder') {
            e.val.pickupComments != null && e.val.pickupComments.length ? this.remarks = e.val.pickupComments : this.remarks = '';
            this.viewOrderDetails(e.val.pickupProofs);
        } else if (e.event == 'viewDeliveryOrder') {
            e.val.deliveryAcceptanceComments != null && e.val.deliveryAcceptanceComments.length ? this.remarks = e.val.deliveryAcceptanceComments : this.remarks = '';
            this.viewOrderDetails(e.val.deliveryProofs);
        }
    }

    viewOrderDetails(val) {
        let temp = val;
        this.convertedDocumentUrlList = new Array();
        if (temp.length > 0 && temp[0] != "" && temp[0] != undefined && temp[0] != null) {
            temp.forEach((url) => {
                if (url.includes("https:")) {
                    this.authService.getTempFileURLFromSecureURL(url).then((resp) => {
                        if (resp.statusCode == 200 || resp.statusCode == 201)
                            this.convertedDocumentUrlList.push(resp.data);
                    })
                }
            })
        }
        (<any>$("#sliderimage")).modal("show");
    }

    onGenerateBack() {
        if (this.pocId == 0)
            this.router.navigate(['/app/diagnostics/homeorders/centrallogistics']);
        else
            this.router.navigate(['/app/diagnostics/homeorders/logistics']);
    }


    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        if (type == "pdf") {
            this.authService.openPDF(imageSrc)
        } else {
            $('#prescription-modal').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }
    }

}
