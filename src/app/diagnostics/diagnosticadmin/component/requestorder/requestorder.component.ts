import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { AdminService } from '../../../../admin/admin.service';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { CentralOrderInteraction } from '../../../../model/common/centralorderinteraction';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';
import { DiagnosticsService } from '../../../diagnostics.service';
import { Config } from './../../../../base/config';
import { CommonUtil } from './../../../../base/util/common-util';
import { DiagnosticOrdersCount } from './../../../../model/report/DiagnosticOrdersCount';

@Component({
    templateUrl: './requestorder.template.html',
    styleUrls: ['./requestorder.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class RequestOrderComponent implements OnDestroy {
    empId: number;
    employeeName: string = '';

    paymentIndexFrom: number = 0;
    paymentIndexSize: number = 50;
    reqsList: CentralOrderInteraction[];
    updatedItem: CentralOrderInteraction;
    modalTitle: string;
    modalId: any;
    interactionStatus: string = '';
    error: string = '';
    perPage: number = 10;
    total: number = 0;
    dataMsg: string = ' ';

    searchCriteria: number = 0;
    searchTerm: string = '';
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    diagnosticOrdersCount: DiagnosticOrdersCount = new DiagnosticOrdersCount();
    orderRequestType: number = 0;
    enableButtonStatusFilter: boolean = false;
    enableVdcCustomTag: boolean = false;

    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);

    startDate: Date = new Date();
    endDate: Date = new Date();
    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
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
            sort: false,
            sticky: false
        },
        {
            display: 'Patient Details',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile , patientProfileDetails.age , patientProfileDetails.gender',
            filter: 'text',
            filler: ',',
            sort: false,
            sticky: false
        },
        {
            display: 'Address',
            variable: 'deliveryAddress.address1, deliveryAddress.address2, deliveryAddress.areaName, deliveryAddress.cityName, deliveryAddress.stateName, deliveryAddress.pinCode',
            filter: 'text',
            filler: ',',
            sort: false,
            sticky: false
        },
        {
            display: 'Booking Type',
            variable: 'bookingSubType',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Walk-in'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Home Collection'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Walk-in'
                }
            ]
        },
        {
            display: 'Tests Included',
            variable: 'serviceList',
            displayVariable: 'serviceName',
            breakFill: ', ',
            filter: 'array-to-string',
            sort: false
        },
        {
            display: 'Raised Date',
            variable: 'updatedTimestamp',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Doctor Details',
            variable: 'doctorDetail.title doctorDetail.firstName doctorDetail.lastName pocDetails.pocName',
            filter: 'text',
            filler: ',',
            sort: false
        },
        {
            display: 'Interaction Status',
            variable: 'consumerInteractionStatus',
            filter: 'text',
            sort: false
        },
        {
            display: 'Interaction Comments',
            variable: 'consumerInteractedComments',
            filter: 'text',
            sort: false
        },
        {
            display: 'Interacted Person',
            variable: 'consumerInteractedEmployeeName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Interaction Details',
            variable: 'consumerInteractionDate',
            filter: 'datetime',
            sort: false
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
        {
            display: 'Add Customer Interaction Status',
            filter: 'action',
            variable: 'consumerInteractionStatus',
            type: 'button',
            event: 'UpdateStatusButton',
            sort: false,
            conditions: [
                {
                    value: 'Interacted',
                    condition: 'eq',
                    label: 'Update Status',
                    style: 'btn btn-danger width-120 mb-xs botton_txtdigo done_txt'
                },
                {
                    condition: 'default',
                    label: 'Update Status',
                    style: 'btn btn-danger width-120 mb-xs botton_txtdigo done_txt'
                }

            ]
        }
    ];
    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };

    constructor(private router: Router, private authService: AuthService, private diagnosticsService: DiagnosticsService,
        private spinnerService: SpinnerService, private adminService: AdminService, private commonUtil: CommonUtil) {
        this.empId = this.authService.userAuth.employeeId;
        this.employeeName = this.authService.userAuth.employeeName;
    }

    ngOnInit(): void {
        this.enableButtonStatusFilter = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableButtonStatusFilter;
        this.getDiagnosticOrderRequestsCount();
        this.reqsList = [];
        this.getDiagnosticHomeOrderRequests();
        if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
            this.columns[0].sticky = true;
            this.columns[1].sticky = true;
            this.columns[2].sticky = true;
        }   
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('requestOrderStartDate') != null && window.localStorage.getItem('requestOrderStartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('requestOrderStartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('requestOrderEndDate'))));
            this.submit();
          } 
        if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName) 
        this.enableVdcCustomTag = true;
    }

    clickEventHandler(e) {
        console.log("Event:", e);
        if (e.event == "UpdateStatusButton") {
            this.modalId = 'central_doctor_id1';
            this.modalTitle = 'Add Customer Review';
            this.onButtonClicked(e.val);
        } else if (e.event == 'viewButton') {
            this.onViewClick(e.val);
        }
    }

    onViewClick(order: CentralOrderInteraction) {
        this.diagnosticsService.diagnosticsAdviseTrack = order;
        this.diagnosticsService.receptionPriscriptionDetails = order;
        this.router.navigate(['/app/diagnostics/diagnosticadmin/orderdetails']);
    }

    onButtonClicked(requestedOrder: CentralOrderInteraction): void {
        console.log("status-->" + JSON.stringify(requestedOrder));
        // if (requestedOrder.consumerInteractionStatus != 'Interacted') {
        this.updatedItem = new CentralOrderInteraction();
        this.updatedItem = requestedOrder;
        this.error = '';
        this.updatedItem.consumerInteractedComments = '';
        this.interactionStatus = '';
        (<any>$)("#modalId").modal("show");
        // }

    }

    addInteractionStatus(status: any) {
        console.log("addInteractionStatus: ", status);
        this.interactionStatus = status;
    }

    getDiagnosticHomeOrderRequests(): void {
        this.paymentIndexFrom == 0 ? this.spinnerService.start() : "";
        this.dataMsg = 'Loading...';

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        } else {
            this.showMessage = false;
            this.spinnerService.start();
            let productDeliveryReq = new ProductDeliveryRequest();
            productDeliveryReq.empId = this.empId;
            productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
            if (this.searchCriteria == 1)
                productDeliveryReq.orderId = this.searchTerm;
            else if (this.searchCriteria == 2)
                productDeliveryReq.mobile = this.searchTerm;

            productDeliveryReq.orderRequest = this.orderRequestType;
            productDeliveryReq.skip = this.paymentIndexFrom;
            productDeliveryReq.limit = this.paymentIndexSize;

            this.diagnosticsService.getDiagnosticHomeOrderRequests(productDeliveryReq).then(requestsData => {
                this.spinnerService.stop();
                this.reqsList = [];
                this.reqsList.push.apply(this.reqsList, requestsData);
                this.total = this.reqsList.length;
                this.reqsList.length > 0 ? "" : this.dataMsg = 'No Data Found';
                console.log("RequetsData: " + JSON.stringify(this.reqsList));
                // this.reqsList.forEach(homeOrder => {
                //     if ((homeOrder.cancellationStatus == 1 || homeOrder.cancellationStatus == 2 || homeOrder.cancellationStatus == 3)) {
                //         // homeOrder.rowStyle = { 'background-color': '#ed6666', 'color': 'white' };
                //     }
                //     if ((homeOrder.payment.paymentStatus == 2 || homeOrder.payment.paymentStatus == 0) && homeOrder.cancellationStatus == 0) {
                //         // homeOrder.rowStyle = { 'background-color': '#eda566', 'color': 'white' };
                //     }
                // })
            });
        }
    }

    onPage(page: number) {
        if (this.total < 50 || (+this.total % 50) > 0) {
            return;
        }
        this.paymentIndexFrom = this.total;
        this.getDiagnosticHomeOrderRequests();
    }

    onRemarksSubmit(comments) {
        console.log("onRemarksSubmit: ", comments + ">>>>>: " + this.interactionStatus +
            ">>>>>: " + (this.interactionStatus == 'Select Status') + "&&" + (comments == ''));

        this.error = '';
        if ((this.interactionStatus == '' && comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }

        this.updatedItem.consumerInteractedEmpId = this.empId;
        this.updatedItem.consumerInteractedEmployeeName = this.employeeName;
        this.updatedItem.consumerInteractionDate = new Date().getTime();
        this.updatedItem.consumerInteractedComments = comments;
        this.updatedItem.consumerInteractionStatus = this.interactionStatus;
        this.spinnerService.start();
        this.diagnosticsService.updateRequesAtCS(this.updatedItem).then(response => {
            this.spinnerService.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {
                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                (<any>$)("#select_entity_type").val(0);
                this.interactionStatus = "";
                this.updatedItem = new CentralOrderInteraction();
                this.modalId = "";
                this.modalTitle = '';
                this.reqsList = [];
                this.getDiagnosticHomeOrderRequests();
            }
            else {
                window.alert('Something went wrong,please try again');
            }

        });

        (<any>$)("#modalId").modal("hide");
    }

    onGenerateNewAppointment() {
        this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
        this.diagnosticsService.isCentralBooking = true;
        this.diagnosticsService.centralCheckForPaymentStatus = true;
        this.diagnosticsService.receptionPriscriptionDetails = undefined;
        this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
    }

    onGenerateNewWalkinAppointment() {
        this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
        this.diagnosticsService.isCentralBooking = true;
        this.diagnosticsService.centralCheckForPaymentStatus = true;
        this.diagnosticsService.receptionPriscriptionDetails = undefined;
        this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
    }

    startDateChoosen($event): void {
        console.log("startDateChoosen: " + $event + ">>>>>>: " + $event.getDate());
        this.startDate = $event;
    }

    endDateChoosen($event) {
        console.log("endDateChoosen: " + $event + ">>>>>>: " + $event.getDate());
        this.endDate = $event; 
    }

    submit(){
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('requestOrderStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('requestOrderEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));
        
        this.getOrderListWithMobileOrOrderId();
        this.diagnosticOrdersCount = new DiagnosticOrdersCount();
        this.getDiagnosticOrderRequestsCount();
        this.total = 0;
        this.orderRequestType = 0;
        this.reqsList = [];
        this.getDiagnosticHomeOrderRequests();
    }

    onEnterPressed(e) {
        console.log("Event: ", e);
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        if (e.keyCode == 13) {
            this.getOrderListWithMobileOrOrderId();
        }
    }

    getOrderListWithMobileOrOrderId(search: string = '') {
        search = $('#search').val().toString();
        if (isNaN(parseInt(search))) {
            this.searchCriteria = 1;
        } else {
            this.searchCriteria = 2;
            if (search.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            }
        }
        this.total = this.paymentIndexFrom = 0;
        this.searchTerm = search;

        this.diagnosticOrdersCount = new DiagnosticOrdersCount();
        this.getDiagnosticOrderRequestsCount();

        this.getDiagnosticHomeOrderRequests();
    }

    onStatusButtonSelect(status: number): void {
        console.log("ButtonStatus-->" + status);
        this.showMessage = false;
        this.orderRequestType = 0;//all requestedOrders
        switch (status) {
            case 1: this.orderRequestType = 1; break;//pendingOrder
            case 2: this.orderRequestType = 2; break;//raised or fulfilled orders
        }
        this.getDiagnosticHomeOrderRequests();
    }

    getRefreshedorderList() {
        /* this.startDate = new Date();
        this.endDate = new Date(); */
        this.searchTerm = "";
        $('#search').val('');
        // this.indexForPOC = 0;
        this.paymentIndexFrom = 0;
        this.orderRequestType = 0;
        this.getDiagnosticOrderRequestsCount();
        this.getDiagnosticHomeOrderRequests();
    }

    getDiagnosticOrderRequestsCount(): void {
        this.spinnerService.start();
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        } else {
            this.showMessage = false;
            this.spinnerService.start();
            let productDeliveryReq = new ProductDeliveryRequest();
            productDeliveryReq.empId = this.empId;
            productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
            if (this.searchCriteria == 1)
                productDeliveryReq.orderId = this.searchTerm;
            else if (this.searchCriteria == 2)
                productDeliveryReq.mobile = this.searchTerm;

            productDeliveryReq.orderRequest = this.orderRequestType;

            this.diagnosticsService.getDiagnosticOrderRequestsCount(productDeliveryReq).then(response => {
                this.spinnerService.stop();
                if (response != null && response != undefined)
                    this.diagnosticOrdersCount = response;
                console.log("diagnosticBookingsCount" + JSON.stringify(this.diagnosticOrdersCount));
            }).catch((err) => {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Failed to fetch central Walkin Diagnostic Bookings count";
                this.showMessage = true;
            });

        }
    }

    ngOnDestroy(): void {

    }

}