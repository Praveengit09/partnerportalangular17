import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { CommonUtil } from '../../../../base/util/common-util';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { AuthService } from "./../../../../auth/auth.service";
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { DiagnosticAdminRequest } from './../../../../model/diagnostics//diagnosticAdminRequest';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    templateUrl: './managehomeorders.template.html',
    styleUrls: ['./managehomeorders.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ManageHomeOrderComponent implements OnDestroy {
    config: any;
    selectedDiagnosticsAdmin: DiagnosticDeliveryAdviceTrack;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    searchCriteria: string = 'orderId';
    deliveryDiagnosticslist: DiagnosticDeliveryAdviceTrack[];
    diagnoAdminRequest: DiagnosticAdminRequest;
    indexForCity: number = 0;
    indexForLoc: number = 0;
    indexForState: number = 0;
    empId: number;
    stateId: number;
    cityId: number;
    dataMsg: string = '';
    stateResponse: LocationModeResponse[] = [];
    cityResponse: LocationModeResponse[] = [];
    localityResponse: LocationModeResponse[] = [];
    perPage: number = 10;
    total: number = 0;
    pocId: number;
    pinCode: string = null;
    fromIndex: number = 0;
    isCorrectMobile: boolean = false;
    isFilterVisible: boolean = false;
    pdfHeaderType: number;

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
            display: 'Order ID',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Details',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile , patientProfileDetails.age , patientProfileDetails.gender',
            filter: 'nametitle',
            filler: ',',
            sort: true
        },
        {
            display: 'Home Collection Address',
            variable: 'deliveryAddress.address1 deliveryAddress.address2 deliveryAddress.cityName deliveryAddress.pinCode',
            filter: 'text',
            sort: false
        },
        {
            display: 'Slot Date',
            variable: 'pickupDate',
            filter: 'date',
            sort: true
        },
        {
            display: 'Slot Time',
            variable: 'pickupTime',
            filter: 'time',
            sort: true
        },
        {
            display: 'Payment Status',
            variable: 'payment.paymentStatus',
            filter: 'text',
            sort: true,
            conditions: [
                {
                    value: '0',
                    condition: 'lte',
                    label: 'Unpaid'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Paid'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    condition: 'default',
                    label: 'Unpaid'
                }
            ]
        },
        {
            display: 'Action',
            filter: 'action',
            type: 'button',
            variable: 'sampleCollectionStatus',
            isMultiBtn: true,
            buttonList: [
                {
                    event: 'acceptButton',
                    sort: false,
                    conditions: [
                        {
                            value: '1',
                            condition: 'eq',
                            label: 'ACCEPT',
                            style: 'btn btn-success width-130 mb-xs'
                        },
                        {
                            condition: 'default',
                            label: 'ACCEPT',
                            style: 'btn btn-success width-130 mb-xs'
                        }
                    ]
                }
                , {
                    event: 'rejectButton',
                    sort: false,
                    conditions: [
                        {
                            value: '1',
                            condition: 'eq',
                            label: 'REJECT',
                            style: 'btn btn-danger width-130 mb-xs'
                        },
                        {
                            condition: 'default',
                            label: 'REJECT',
                            style: 'btn btn-danger width-130 mb-xs'
                        }
                    ]
                }
            ],
        },
        {
            display: 'Order Details',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
        },
    ];
    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };

    constructor(config: AppConfig, private authService: AuthService, private businessadminService: BusinessAdminService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private router: Router, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
        this.pocId = authService.userAuth.pocId;
        this.empId = this.authService.userAuth.employeeId;
        this.fromIndex = 0;
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    }

    ngOnInit(): void {
        this.getState();
        this.getDiagnosticListForAdmin();
    }

    startDateChoosen($event): void {
        console.log("startDateChoosen: " + $event);
        this.startDate = $event;
        this.total = 0;
        this.deliveryDiagnosticslist = new Array<DiagnosticDeliveryAdviceTrack>();
        this.getAdminDiagnosticOrderList();
    }

    endDateChoosen($event): void {
        console.log("startDateChoosen1: " + $event);
        this.endDate = $event;
        this.total = 0;
        this.deliveryDiagnosticslist = new Array<DiagnosticDeliveryAdviceTrack>();
        this.getAdminDiagnosticOrderList();
    }

    onSearchChange(search: string) {
        (<any>$)("#searchBox").val("");
        this.searchCriteria = search;
        this.isCorrectMobile = false;
        if (this.diagnoAdminRequest != undefined) {
            this.diagnoAdminRequest.orderId = this.diagnoAdminRequest.mobile = "";
        }
        this.resetErrorMessage();
    }

    getRefreshedorderList(): void {
        $('#search').val('');
        (<any>$)("#searchBox").val("");
        (<any>$)("#checkOrderId").prop("checked", true);
        this.indexForCity = 0;
        this.indexForLoc = 0;
        this.indexForState = 0;
        this.pinCode = null;
        this.stateId = 0;
        this.cityId = 0;
        this.fromIndex = 0;
        this.isCorrectMobile = false;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.startDate = new Date();
        this.endDate = new Date();
        while (this.cityResponse.length > 0) {
            this.cityResponse.pop();
        }
        while (this.localityResponse.length > 0) {
            this.localityResponse.pop();
        }
        this.getDiagnosticListForAdmin();
    }

    onButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
        console.log("status-->" + JSON.stringify(statusDiagnosticsAdvise));
        this.selectedDiagnosticsAdmin = statusDiagnosticsAdvise;
        if (this.selectedDiagnosticsAdmin.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
            && this.selectedDiagnosticsAdmin.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED) {
            this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
            this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
        }
    }

    clickEventHandler(e) {
        console.log("Event:", e);
        if (e.event == "markCollectedButton") { // event in cloumn object event {....., event:"editButton"  }
            this.onButtonClicked(e.val);
        } else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        } else if (e.event == 'acceptButton') {
            this.onAcceptClick(e.val);
        } else if (e.event == 'rejectButton') {
            this.onRejectClick(e.val);
        } else if (e.event == 'viewButton') {
            this.onViewClick(e.val);
        }
    }

    onAcceptClick(val: any) {
        console.log("val: " + this.authService.userAuth.employeeId + ">>>>>>>" + JSON.stringify(val));
        val.acceptedEmpId = this.authService.userAuth.employeeId;
        val.acceptedEmpName = this.authService.userAuth.employeeName;
        val.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.ACCEPTED;
        console.log("OnAcceptClick: ", val);

        this.diagnosticsService.updateDiagnosticAdminRemarks(val).then(data => {
            if (data.statusCode == 200 || data.statusCode == 201) {
                alert(data.statusMessage + '.Order added to Pending orders');
                this.getDiagnosticListForAdmin();
            } else {
                alert(data.statusMessage);
            }
        });
    }

    onRejectClick(val: any) {
        console.log("val: " + this.authService.userAuth.employeeId + ">>>>>>>" + JSON.stringify(val));
        val.acceptedEmpId = this.authService.userAuth.employeeId;
        val.acceptedEmpName = this.authService.userAuth.employeeName;
        val.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.NOT_ACCEPTED;
        this.diagnosticsService.updateDiagnosticAdminRemarks(val).then(data => {
            if (data.statusCode == 200 || data.statusCode == 201) {
                alert(data.statusMessage + '.Order will be reassigned');
                this.getDiagnosticListForAdmin();
            } else {
                alert(data.statusMessage);
            }
        });
    }


    onViewClick(order: DiagnosticDeliveryAdviceTrack) {
        this.selectedDiagnosticsAdmin = order;
        this.router.navigate(['/app/diagnostics/homeorders/vieworder']);
    }

    onImageClicked(item: DiagnosticDeliveryAdviceTrack): void {
        console.log("Item: ", item);
        if (item.payment.paymentStatus == 1) {
            if (this.pdfHeaderType == 0) {
                window.open(item.pdfUrlWithHeader, '_blank')
            } else {
                window.open(item.pdfUrlWithoutHeader, '_blank')
            }
        }

    }

    onNewOrderButtonClicked(): void {
        this.diagnosticsService.isCentralBooking = false;
        this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
        this.diagnosticsService.receptionPriscriptionDetails = undefined;
        this.diagnosticsService.centralCheckForPaymentStatus = false;
        this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
    }

    getDiagnosticListForAdmin(): void {
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        // this.diagnoAdminRequest.pocId = this.pocId;
        this.diagnoAdminRequest.pocIdList.push(this.pocId);
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        this.diagnoAdminRequest.empId = this.empId;
        console.log("fromIndex1:: " + this.fromIndex);
        this.getAdminDiagnosticOrderList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
        }
    }

    getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(str: string = ''): void {
        this.dataMsg = '';
        str = $('#search').val().toString();
        if (isNaN(parseInt(str))) {
            this.searchCriteria = 'orderId';
        } else {
            this.searchCriteria = 'contactNo';
            if (str.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            }
        }
        this.total = 0;
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.empId = this.empId;
        // this.diagnoAdminRequest.pocId = this.pocId;
        this.diagnoAdminRequest.pocIdList.push(this.pocId);
        this.diagnoAdminRequest.fromIndex = this.total;
        let searchStr = str.trim();
        console.log("SearchString length::" + searchStr.length);
        if (this.searchCriteria == 'orderId') {
            this.diagnoAdminRequest.orderId = searchStr;
        } else if (this.searchCriteria == 'contactNo') {
            if (searchStr.length < 10 || searchStr.length > 10) {
                this.isCorrectMobile = true;
                return;
            } else {
                this.diagnoAdminRequest.mobile = searchStr;
                this.isCorrectMobile = false;
            }
        }
        this.diagnoAdminRequest.state = this.stateId;
        this.diagnoAdminRequest.city = this.cityId;
        this.diagnoAdminRequest.pinCode = this.pinCode;
        this.getAdminDiagnosticOrderList();
    }

    getDiagnosticAdvisesStateOrCityOrAreaBased() {
        this.total = 0;
        if (this.diagnoAdminRequest == undefined) {
            this.diagnoAdminRequest = new DiagnosticAdminRequest();
        }
        this.diagnoAdminRequest.state = this.stateId;
        this.diagnoAdminRequest.city = this.cityId;
        this.diagnoAdminRequest.pinCode = this.pinCode;
        this.getAdminDiagnosticOrderList();
    }

    onPage(page: number) {
        this.fromIndex = +page * +this.perPage;
        console.log("fromIndex2:: " + this.fromIndex);
        this.getDiagnosticListForAdmin();
    }

    resetErrorMessage() {
        this.errorMessage = new Array();
        this.isError = false;
        this.showMessage = false;
    }

    getAdminDiagnosticOrderList() {
        this.resetErrorMessage();
        console.log("StartDate: " + this.startDate);
        this.dataMsg = 'Loading......';
        this.spinnerService.start();
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
        }
        this.diagnoAdminRequest.employeeRequest = 3;
        this.diagnoAdminRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        let tmpDate: Date = new Date(this.endDate.getTime());
        this.diagnoAdminRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(new Date(tmpDate.setDate(tmpDate.getDate() + 1))) - 1;

        this.diagnosticsService.getDiagnosticListForAdmin(this.diagnoAdminRequest).then(diagnoListAdminData => {
            this.spinnerService.stop();
            this.total = 0;
            if (this.fromIndex > 0) {
                this.deliveryDiagnosticslist.push.apply(this.deliveryDiagnosticslist, diagnoListAdminData)
            } else {
                this.deliveryDiagnosticslist = new Array();
                this.deliveryDiagnosticslist = diagnoListAdminData;
            }
            if (diagnoListAdminData.length > 0) {
                this.deliveryDiagnosticslist = this.deliveryDiagnosticslist.filter(obj => obj.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.ACCEPTED);
                if (this.deliveryDiagnosticslist.length > 0) {
                    this.total = this.deliveryDiagnosticslist.length;
                    this.deliveryDiagnosticslist.forEach(element => {
                        if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
                            element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
                        }
                    });
                }
                else {
                    this.dataMsg = "No data found.";
                    this.deliveryDiagnosticslist = new Array();
                    this.total = this.deliveryDiagnosticslist.length;
                    this.showMessage = true;
                }
            } else if (this.diagnoAdminRequest.fromIndex == 0) {
                if (this.diagnoAdminRequest.orderId != undefined) {
                    this.dataMsg = "No data found for the specified Order Id.";
                } else if (this.diagnoAdminRequest.mobile != undefined) {
                    this.dataMsg = "No data found for the specified mobile number.";
                } else {
                    this.dataMsg = "No data found.";
                }
                this.deliveryDiagnosticslist = new Array();
                this.total = this.deliveryDiagnosticslist.length;
                this.showMessage = true;
            }
        });
    }

    ngOnDestroy(): void {
        this.diagnosticsService.orderDetailAdviceTrack = this.selectedDiagnosticsAdmin;
        this.diagnosticsService.centralAdminModify = false;
    }

    getState(): void {
        this.stateId = 0;
        this.cityId = 0;
        this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.stateResponse = locationResponse;
            this.stateResponse.sort(this.compare);
            console.log("stateresponse: " + JSON.stringify(this.stateResponse));
        });
    }

    compare(a, b): number {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    onStateChange(index: number): void {
        if (this.isCorrectMobile != true) {
            while (this.cityResponse.length > 0) {
                this.cityResponse.pop();
            }
            while (this.localityResponse.length > 0) {
                this.localityResponse.pop();
            }
            this.cityId = 0;
            this.stateId = (index > 0 ? this.stateResponse[index - 1].id : 0);
            this.pinCode = null;
            this.indexForCity = 0;
            this.indexForLoc = 0;
            this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.cityResponse = locationResponse;
                this.cityResponse.sort(this.compare);
                console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
            });
            this.getDiagnosticAdvisesStateOrCityOrAreaBased();
        }
    }

    onCityChange(index: number): void {
        if (this.isCorrectMobile != true) {
            while (this.localityResponse.length > 0) {
                this.localityResponse.pop();
            }
            this.indexForLoc = 0;
            this.cityId = (index > 0 ? this.cityResponse[index - 1].id : 0);
            this.pinCode = null;
            this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.localityResponse = locationResponse;
                this.localityResponse.sort(this.compare);
                console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
            });
            this.getDiagnosticAdvisesStateOrCityOrAreaBased();
        }
    }

    onLocationChange(index: number): void {
        if (this.isCorrectMobile != true) {
            this.pinCode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);
            this.getDiagnosticAdvisesStateOrCityOrAreaBased();
        }
    }

    filterBtnClicked() {
        this.isFilterVisible = !this.isFilterVisible;
    }

    getWidth() {
        return $(window).width();
    }

}
