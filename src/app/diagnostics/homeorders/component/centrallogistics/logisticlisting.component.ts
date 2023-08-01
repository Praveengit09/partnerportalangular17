import { ProductDeliveryRequest } from './../../../../model/product/productdeliveryrequest';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { BusinessAdminService } from './../../../../businessadmin/businessadmin.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { DiagnosticsService } from './../../../diagnostics.service';


@Component({
    selector: 'centrallogistics',
    templateUrl: './logisticlisting.template.html',
    styleUrls: ['./logisticlisting.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class CentralLogisticsComponent {

    searchTerm: string = '';
    pinCode: string = '';
    address: any;
    fromIndex: number = 0;
    dataMsg: string = ' ';
    response: any = [];
    fromDate: number = 0;
    toDate: number = 0;
    toEmail: string = '';

    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    isError1: boolean;
    showMessage1: boolean;
    errorMessage1: Array<string>;
    perPage: number = 10;
    total: number = 0;
    empId: number;
    cashAmount: number = 0;
    stateId: number = 0;
    cityId: number = 0;
    indexForCity: number = 0;
    indexForLoc: number = 0;
    indexForState: number = 0;
    stateResponse: LocationModeResponse[] = [];
    cityResponse: LocationModeResponse[] = [];
    localityResponse: LocationModeResponse[] = [];

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
            display: 'Active Samples',
            variable: 'totalSamplesForPickup',
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
            display: 'Samples Delivered',
            variable: 'totalSamplesDelivered',
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
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewOrder',
            sort: false
        }
    ];

    constructor(private authService: AuthService, private toast: ToasterService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private businessadminService: BusinessAdminService,
        private router: Router, private spinnerService: SpinnerService) {
        this.empId = this.authService.userAuth.employeeId;
        this.stateId = this.authService.userAuth.selectedPoc.address.state;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('logstartDate') != null && window.localStorage.getItem('logstartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logstartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logendDate'))));
        }
        this.getState();
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
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('logstartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
            window.localStorage.setItem('logendDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

            this.showMessage = false;
            this.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            this.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;


            this.diagnosticsService.getSampleOfAgentList(0, this.fromIndex, 50, this.fromDate, this.toDate, this.searchTerm,this.stateId, this.cityId, this.pinCode).then(response => {
                this.spinnerService.stop()
                console.log("resposne", JSON.stringify(response));
                this.response = response;
                this.total = this.response.length;
                if (this.total == 0)
                    this.dataMsg = 'No Data Found';
            });
        }
    }

    getRefreshedorderList() {
        this.fromIndex = 0;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        $('#search').val('');
        this.getAgentList();
    }

    endDateChoosen($event): void {
        this.endDate = $event;
        this.getAgentList();
    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.getAgentList();
    }

    clickEventHandler(e) {
        if (e.event == 'viewOrder') {
            this.viewOrderDetails(e.val);
        }
    }

    viewOrderDetails(val) {
        this.diagnosticsService.order = val;
        this.diagnosticsService.diagnosticsAdviseTrack = true; //for central 
        this.router.navigate(['/app/diagnostics/homeorders/viewagentdetails']);
    }

    onPage(page: number) {
        this.fromIndex = this.total + 1;
        this.getAgentList();
    }

    getBasedOnAgentName() {
        this.searchTerm = $('#search').val().toString();
        this.getAgentList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getBasedOnAgentName();
        }
    }

    getState(): void {
        this.businessadminService.getLocation(this.empId, 0, 0).then(locationResponse => {
            this.stateResponse = locationResponse;
            this.stateResponse.sort(this.compare);
            this.indexForState = this.stateResponse.findIndex( e=> e.id == this.stateId) + 1;
            
        });
    }

    onStateChange(index: number): void {
        this.cityResponse = [];        
        this.localityResponse = [];        
        this.cityId = 0;
        this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
        this.pinCode = null;
        this.indexForCity = 0;
        this.indexForLoc = 0;
        if (index != 0) {
            this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.cityResponse = locationResponse;
                this.cityResponse.sort(this.compare);
                console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
            });
        }
        this.getAgentList();
    }

    onCityChange(index: number): void {
        this.localityResponse = [];
        this.indexForLoc = 0;
        this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
        this.pinCode = null;
        if (index != 0) {
            this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.localityResponse = locationResponse;
                this.localityResponse.sort(this.compare);
                console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
            });            
        }
        this.getAgentList();
    }

    onLocationChange(index: number): void {
        this.pinCode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);        
        this.getAgentList();
    }


    compare(a, b): number {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    onSendEmail() {
        (<any>$("#mailmodal")).modal("show");
    }

    onMailSubmit() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let emailCheck = re.test(this.toEmail);
        if (!emailCheck) {
            alert("Please enter a valid email address");
            return;
        }
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage1 = new Array();
            this.errorMessage1[0] = 'Start Date should always be greater than end date';
            this.isError1 = true;
            this.showMessage1 = true;
            return;
        }

        (<any>$)("#mailmodal").modal("hide");
        this.spinnerService.start();
        let productDeliveryReq = new ProductDeliveryRequest();
        productDeliveryReq.pocId = 0;
        productDeliveryReq.empId = 0;
        productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
        productDeliveryReq.fromIndex = this.fromIndex;
        productDeliveryReq.centralHomeOders = false;
        productDeliveryReq.isExcel = true;
        productDeliveryReq.toEmail = this.toEmail;

        this.diagnosticsService.getLogisticAgentOrdersList(productDeliveryReq).then(response => {
            this.spinnerService.stop();
            this.toEmail = '';            
            try {
                this.spinnerService.stop();
                if (this.total > 0)
                    this.toast.show('Successfully sent email.', "bg-success text-white font-weight-bold", 3000);
                else
                    this.toast.show('No data found', "bg-danger text-white font-weight-bold", 3000);
            }
            catch (error) {
                console.error(error);
            }
        })
    }

}