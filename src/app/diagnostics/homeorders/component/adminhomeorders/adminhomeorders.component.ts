import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../../admin/admin.service';
import { AppConfig } from '../../../../app.config';
import { Config } from '../../../../base/config';
import { CommonUtil } from '../../../../base/util/common-util';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { CentralOrderInteraction } from '../../../../model/common/centralorderinteraction';
import { DiagnosticOrderHistory } from '../../../../model/diagnostics/diagnosticOrderHistory';
import { AuthService } from "./../../../../auth/auth.service";
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { DiagnosticAdminRequest } from './../../../../model/diagnostics//diagnosticAdminRequest';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticOrdersCount } from './../../../../model/report/DiagnosticOrdersCount';
import { DiagnosticAdminService } from './../../../diagnosticadmin/diagnosticadmin.service';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    templateUrl: './adminhomeorders.template.html',
    styleUrls: ['./adminhomeorders.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class AdminHomeOrderComponent implements OnDestroy {
    config: any;
    selectedDiagnosticsAdmin: DiagnosticDeliveryAdviceTrack;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    errorMessage1: Array<string>;
    isError1: boolean;
    showMessage1: boolean;
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
    transactionHistoryList: DiagnosticOrderHistory[];
    isVendor: boolean = false;
    appId: number;
    consumablesList: any;
    diagnosticOrdersCount: DiagnosticOrdersCount = new DiagnosticOrdersCount();
    enableButtonStatusFilter: boolean = false;
    sampleCollectionStatus: number;
    enableRowColors: boolean = false;
    workingProgressOrders: number;
    dropOffDetails: Array<any> = [];
    formattedDeliveryData: string = '';
    proofDocumentUrlList: Array<String>;
    convertedDocumentUrlList: Array<String>;
    crouselSelectedImage: String;
    prescriptionType = "";
    docsCheck: boolean = false;
    finalCountTubes: Array<String>;
    cashproofDocumentUrlList: Array<String>;
    cashconvertedDocumentUrlList: Array<String>;
    cashDocs: boolean = false;
    emailReportId: number = -1;
    emailReportList: any[] = [];
    toEmail: string = '';
    deliveryRemarks: string = '';
    optionalDOB: boolean = false;
    deliveryApprovalReq: DiagnosticDeliveryAdviceTrack;

    interactionStatus: string = '';
    modalTitle: string;
    modalId: string;
    comments: string;
    error: string;
    userData: any;
    convertedPhleboDocumentUrlList: Array<String>;
    phleboDocs: boolean = false;

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
    emailStartDate: Date = new Date();
    emailEndDate: Date = new Date();
    datepicker_emailModel = {
        emailStartDate: new Date(this.pastDate),
        emailEndDate: new Date(this.futureDate),
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
            display: 'InvoiceId',
            variable: 'invoiceId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Home Collection Location',
            variable: 'deliveryAddress.areaName deliveryAddress.pinCode',
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
            display: 'Phlebo Name',
            variable: 'employeeAcceptedName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Status',
            variable: 'orderStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Sample Collected'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Reports Pending'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed'
                },
                {
                    value: '30',
                    condition: 'eq',
                    label: 'Cancelled'
                },
                {
                    condition: 'default',
                    label: 'Pending'
                }
            ]
        },
        {
            display: 'Tracking Status',
            variable: 'tempStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Collected'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Modified'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Rejected'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Collection Pending'
                },
                {
                    value: '6',
                    condition: 'eq',
                    label: 'Updating Sample'
                },
                {
                    value: '7',
                    condition: 'eq',
                    label: 'Accepted'
                },
                {
                    value: '8',
                    condition: 'eq',
                    label: 'Not Accepted'
                },
                {
                    value: '9',
                    condition: 'eq',
                    label: 'Delivered'
                },
                {
                    value: '10',
                    condition: 'eq',
                    label: 'Phlebo Reached'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Started'
                },
                {
                    value: '12',
                    condition: 'eq',
                    label: 'User Cancelled'
                },
                {
                    value: '13',
                    condition: 'eq',
                    label: 'Cancelled'
                },
                {
                    value: '14',
                    condition: 'eq',
                    label: 'Transaction Failure'
                },
                {
                    value: '15',
                    condition: 'eq',
                    label: 'Phlebo Assigned'
                }
            ]
        },
        {
            display: 'Action',
            label: 'VIEW',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false
        },
        {
            display: 'Receipt',
            label: 'assets/img/partner/pdf_icon_read.png',
            filter: 'action',
            type: 'image',
            event: 'pdfButton',
            sort: false,
            variable: 'payment.paymentStatus',
            conditions: [
                {
                    value: '0',
                    condition: 'lte',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_read.png',
                },
                {
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                }
            ]
        },
        {
            display: 'Add Comments',
            variable: 'consumerInteractionStatus',
            filter: 'action',
            type: 'button',
            event: 'customerReviewButton',
            sort: false,
            conditions: [
                {
                    value: 'Interacted',
                    condition: 'eq',
                    label: 'Add Status',
                    // style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {

                    condition: 'default',
                    label: 'Add Status',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                }
            ]
        },
        {
            display: 'History',
            label: 'History',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewHistory',
            sort: false
        },
        {
            display: 'Consumables',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewConsumables',
            sort: false
        }
    ];
    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };

    historyColumns: any[] = [
        {
            display: 'Description',
            variable: 'label',
            filter: 'text',
            sort: false
        },
        {
            display: 'Time',
            variable: 'updatedTimestamp',
            filter: 'datetime',
            sort: false
        }
    ];

    consumablesColumns: any[] = [
        {
            display: 'Item',
            variable: 'equipmentName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Count',
            variable: 'usedCount',
            filter: 'text',
            sort: false
        }
    ];

    constructor(config: AppConfig, private authService: AuthService, private businessadminService: BusinessAdminService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private toast: ToasterService, private diagAdminService: DiagnosticAdminService,
        private router: Router, private spinnerService: SpinnerService, private adminService: AdminService) {
        this.config = config.getConfig();
        this.pocId = authService.userAuth.pocId;
        this.empId = this.authService.userAuth.employeeId;
        this.fromIndex = 0;
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        if (Config.portal)
            this.appId = Config.portal.appId;
        if (authService.userAuth.selectedPoc.pocType == 9) {
            this.isVendor = true;
        }
        if (!this.isVendor && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
            this.columns.splice(7, 0, {
                display: 'Vendor Name',
                variable: 'vendorPocName',
                filter: 'text',
                sort: false
            });
            this.columns.splice(15, 0, {
                display: 'Delivery Details',
                variable: 'sampleCollectionStatus',
                filter: 'action',
                type: 'button',
                event: 'deliveryDropDetails',
                sort: false,
                conditions: [
                    {
                        value: '9',
                        condition: 'eq',
                        label: 'View',
                        style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
                    },
                    {
                        condition: 'default',
                        label: 'View',
                        style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
                    }
                ]
            });
        }

        if (Config.portal && Config.portal.customizations && Config.portal.customizations.dobOptional) {
            this.optionalDOB = Config.portal.customizations.dobOptional;
            this.columns.push({
                display: 'Delivery Approval',
                variable: 'yodaDeliveryAccepted',
                filter: 'action',
                type: 'button',
                event: 'onClickDeliveryApproval',
                sort: false,
                conditions: [
                    {
                        value: '1',
                        condition: 'eq',
                        label: 'Accepted',
                        style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                    },
                    {
                        value: '2',
                        condition: 'eq',
                        label: 'Not Delivered',
                        style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                    },
                    {
                        condition: 'default',
                        label: 'Delivered',
                        style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                    }
                ]
            });

            this.columns.splice(2, 0, {
                display: 'Patient Details',
                variable: 'patientinfo',
                filter: 'text',
                sort: false,
                sticky: false
            });
        } else {
            this.columns.splice(2, 0, {
                display: 'Patient Details',
                variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName,  patientProfileDetails.age, patientProfileDetails.gender',
                filter: 'nametitle',
                sort: false,
                sticky: false
            });
        }

        if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableHistoryForOrder) {
            this.columns.splice(14, 0, {
                display: 'History',
                label: 'History',
                style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
                filter: 'action',
                type: 'button',
                event: 'viewHistory',
                sort: false
            });
        }
    }

    ngOnInit(): void {
        this.enableButtonStatusFilter = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableButtonStatusFilter;
        this.enableRowColors = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableBackGroundColor;
        (this.enableRowColors && this.isVendor) ? this.datepickerOpts.startDate = new Date(new Date().setDate(new Date().getDate() - 2)) : '';
        this.getState();
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('adminstartDate') != null && window.localStorage.getItem('adminstartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('adminstartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('adminendDate'))));
        }
        this.onSubmit();
        if (this.enableButtonStatusFilter)
            this.isVendor ? this.getEmailReportTypeList(2) : this.getEmailReportTypeList(1);
    }

    onSearchChange(search: string) {
        (<any>$)("#searchBox").val("");
        this.searchCriteria = search;
        this.isCorrectMobile = false;
        if (this.diagnoAdminRequest != undefined) {
            this.diagnoAdminRequest.orderId = this.diagnoAdminRequest.mobile = "";
        }
    }

    startDateChoosen($event): void {
        this.startDate = $event;
    }
    endDateChoosen($event) {
        this.endDate = $event;
    }

    onSubmit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('adminstartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('adminendDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

        let search = $('#search').val().toString();
        if (search.length > 0) {
            this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId('');
            return;
        }
        this.diagnosticOrdersCount = new DiagnosticOrdersCount();
        this.getAdminDiagnosticOrdersCount();
        this.total = 0;
        this.deliveryDiagnosticslist = new Array<DiagnosticDeliveryAdviceTrack>();
        this.getDiagnosticListForAdmin();
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
        this.sampleCollectionStatus = 0;
        this.diagnoAdminRequest.sampleCollectionStatus = 0;
        // this.startDate = null;
        while (this.cityResponse.length > 0) {
            this.cityResponse.pop();
        }
        while (this.localityResponse.length > 0) {
            this.localityResponse.pop();
        }

        this.diagnosticOrdersCount = new DiagnosticOrdersCount();
        this.getAdminDiagnosticOrdersCount();

        this.getDiagnosticListForAdmin();
    }

    onButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
        console.log("status-->" + JSON.stringify(statusDiagnosticsAdvise));
        this.selectedDiagnosticsAdmin = statusDiagnosticsAdvise;
        this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
        this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    }

    clickEventHandler(e) {
        console.log("Event:", e);
        if (e.event == "viewButton") { // event in cloumn object event {....., event:"editButton"  }
            this.onButtonClicked(e.val);
        } else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        } else if (e.event == 'viewHistory') {
            this.onViewHistoryClicked(e.val);
        } else if (e.event == 'viewConsumables') {
            this.onViewConsumablesClicked(e.val);
        } else if (e.event == 'deliveryDropDetails') {
            this.getDeliveryDropOffDetails(e.val);
        } else if (e.event == 'customerReviewButton') {
            this.customerReviewButtonClicked(e.val);
        } else if (e.event == 'onClickDeliveryApproval') {
            this.onClickDeliveryApprovalClicked(e.val);
        }
    }

    onImageClicked(item): void {
        console.log("Item: ", item);
        if (item.payment.paymentStatus == 1) {
            if (this.pdfHeaderType == 0) {
                this.authService.openPDF(item.pdfUrlWithHeader)
            } else {
                this.authService.openPDF(item.pdfUrlWithoutHeader)
            }
        }
    }

    onViewConsumablesClicked(item): void {
        this.consumablesList = [];
        if (item.consumablesInventoryDetails && item.consumablesInventoryDetails.length > 0) {
            this.consumablesList = item.consumablesInventoryDetails;
            (<any>$("#consumablesModal")).modal("show");
        }
        else {
            this.toast.show('No consumables found', "bg-danger text-white font-weight-bold", 3000);
        }
    }

    onViewHistoryClicked(item): void {
        this.transactionHistoryList = null;
        item.transactionHistory.sort(function (a, b) {
            if (a.updatedTimestamp < b.updatedTimestamp) return -1;
            if (a.updatedTimestamp > b.updatedTimestamp) return 1;
            return 0;
        })
        if (item && item.transactionHistory && item.transactionHistory.length > 0) {
            let paymentStatus = 0;
            let vendorName = null;
            let phleboName = null;
            let prescriptionOrder = false;
            let cancellationStatus = 0;
            for (let index = 0; index < item.transactionHistory.length; index++) {
                let record = item.transactionHistory[index];
                if (index == 0) {
                    // In the inital record, checking the booking and payment status
                    let source = 'Call Centre';
                    if (item.bookingSource == 1 || item.bookingSource == 4) {
                        source = 'Mobile App';
                    } else if (item.bookingSource == 5) {
                        source = 'Website';
                    } else if (item.bookingSource == 6) {
                        source = "Phlebo App";
                    }
                    if (record.paymentStatus == 1) {
                        paymentStatus = record.paymentStatus;
                    }
                    record.label = 'Order Placed from ' + source + '. Order is ' + (paymentStatus == 1 ? 'paid' : 'not paid') + '.';
                    if (record.actionPerformed == 33) {
                        prescriptionOrder = true;
                        record.label = 'Order Placed through Prescription from ' + source + '. Order is not paid.'
                    }

                } else if (record.actionPerformed > 0) {
                    switch (record.actionPerformed) {
                        case DiagnosticDeliveryAdviceTrack.COLLECTSAMPLE:
                            if (record.acceptedEmpName) {
                                record.label = 'Order has been assigned to ' + record.acceptedEmpName;
                            }
                            if (prescriptionOrder) {
                                record.label = 'Order Initaited by ' + record.acceptedEmpName;
                                prescriptionOrder = false;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.COLLECTED:
                            if (paymentStatus == 0 && record.paymentStatus == 1) {
                                record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' collected the samples and payment';
                            } else {
                                record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' collected the samples';
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.MODIFIED:
                            if (record.acceptedEmpName) {
                                record.label = 'Order has been modified by ' + record.acceptedEmpName;
                            } else if (record.rescheduledOrder) {
                                record.label = 'Order has been rescheduled.';
                            } else {
                                record.label = 'Order has been modified.';
                            }
                            if (record.remarks && record.remarks.length > 0) {
                                record.label += ' The following remarks are added: ' + record.remarks;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.NOT_ACCEPTED:
                        case DiagnosticDeliveryAdviceTrack.REJECTED:
                            if (cancellationStatus > 0) {
                                if (record.acceptedEmpName) {
                                    record.label = 'Order has been cancelled by ' + record.acceptedEmpName;
                                } else {
                                    record.label = 'Order has been cancelled.';
                                }
                            } else {
                                if (record.acceptedEmpName) {
                                    record.label = 'Order has been rejected by ' + record.acceptedEmpName;
                                } else {
                                    record.label = 'Order has been rejected.';
                                }
                            }
                            if (record.remarks && record.remarks.length > 0) {
                                record.label += ' The following remarks are added: ' + record.remarks;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.COLLECTION_PENDING:
                            if (paymentStatus == 0 && record.paymentStatus == 1) {
                                record.label = 'Payment collected by phlebo';
                                paymentStatus = record.paymentStatus;
                            } else {
                                // as yoda mobile payment is not there
                                if (!this.optionalDOB)
                                    record.label = 'Payment link sent to the customer';
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.UPDATE_SAMPLE:
                            record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' started sample collection process';
                            break;
                        case DiagnosticDeliveryAdviceTrack.ACCEPTED:
                            if (record.vendorPocName != null && (vendorName == null || vendorName != record.vendorName)) {
                                record.label = 'Order assigned to vendor ' + record.vendorPocName;
                                vendorName = record.vendorPocName;
                            } else if (record.acceptedEmpName != null && (phleboName == null || phleboName != record.acceptedEmpName || phleboName == record.acceptedEmpName)) {
                                record.label = 'Order assigned to phlebo ' + record.acceptedEmpName;
                                phleboName = record.acceptedEmpName;
                            } else if (!vendorName && !phleboName && !record.acceptedEmpName && !record.vendorPocName) {
                                record.label = 'Order accepted by admin';
                            } else if (phleboName && !record.acceptedEmpName) {
                                record.label = 'Order accepted by phlebo ' + phleboName;
                            } else if (vendorName && !record.vendorPocName) {
                                record.label = 'Order accepted by vendor ' + vendorName;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.DELIVERED:
                            record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' delivered the samples in the lab';
                            break;
                        case DiagnosticDeliveryAdviceTrack.PHLEBO_REACHED:
                            record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' reached customer to collect samples';
                            break;
                        case DiagnosticDeliveryAdviceTrack.STARTED:
                            record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' started journey to collect samples';
                            break;
                        case DiagnosticDeliveryAdviceTrack.PHLEBO_RAISED_CANCELREQ:
                            record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' raised request to cancel order.';
                            if (record.remarks && record.remarks.length > 0) {
                                record.label += ' The following remarks are added: ' + record.remarks;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.PHLEBO_CASH_COLLECTED:
                            record.label = 'Cash ' + (record.cashAmount ? ' of Rs.' + record.cashAmount : '') + ' deposited by the phlebo ' + (phleboName ? phleboName : '') + (record.pocName ? ' at ' + record.pocName : '');
                            if (record.remarks && record.remarks.length > 0) {
                                record.label += ' The following remarks are added: ' + record.remarks;
                            }
                            break;
                        case DiagnosticDeliveryAdviceTrack.PHLEBO_DLEIVERY_ACCEPTED:
                            record.label = '' + (record.acceptedEmpName) + ' accepted delivered samples from ' + (phleboName ? phleboName : '');
                            if (record.remarks && record.remarks.length > 0) {
                                record.label += ' The following remarks are added: ' + record.remarks;
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (cancellationStatus == 0 && record.cancellationStatus > 0) {
                    record.label = 'Order has been cancelled ' + (record.acceptedEmpName ? "by " + record.acceptedEmpName : '');
                    if (record.remarks && record.remarks.length > 0) {
                        record.label += ' The following remarks are added: ' + record.remarks;
                    }
                    cancellationStatus = record.cancellationStatus;
                }
                if ((record.label == null || record.label.length == 0) && record.paymentStatus == 1 && record.actionPerformed == null) {
                    if (index > 0 && item.transactionHistory[index - 1] && item.transactionHistory[index - 1].label != 'Payment has been made.')
                        record.label = 'Payment has been made.';
                }
            }
            this.transactionHistoryList = item.transactionHistory.filter((record) => { return record.label != null && record.label.length > 0 });
            this.transactionHistoryList.forEach(doc => {
                if (doc.actionPerformed == 14)
                    doc.rowStyle = { 'color': 'red' };
            });
            (<any>$("#transactionHistory")).modal("show");
            this.getPhebloDocs(item.selfiPic);
        }
    }

    onViewPhleboDocs() {
        (<any>$("#viewselfie")).modal("show");
    }

    getPhebloDocs(value) {
        this.phleboDocs = false;
        this.convertedPhleboDocumentUrlList = new Array();
        if (value && value.length > 0) {
            this.phleboDocs = true;
            value.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.convertedPhleboDocumentUrlList.push(url);
                }
                else {
                    if (url.includes("pdf"))
                        this.convertedPhleboDocumentUrlList.push(url);
                    else {
                        this.diagnosticsService.getPdfUrl(url).then(xdata => {
                            this.convertedPhleboDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
                        });
                    }
                }
            });
        }
    }

    getDiagnosticListForAdmin(): void {
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.pocIdList.push(this.pocId);
        // this.diagnoAdminRequest.pocId = this.pocId;
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        this.diagnoAdminRequest.empId = this.empId;
        console.log("fromIndex1:: " + this.fromIndex);
        if (this.sampleCollectionStatus > 0) {
            this.diagnoAdminRequest.sampleCollectionStatus = this.sampleCollectionStatus;
        }
        this.getAdminDiagnosticOrderList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
        }
    }

    getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(str: string = ''): void {
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
        this.diagnoAdminRequest.sampleCollectionStatus = 0;
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
        this.getAdminDiagnosticOrdersCount();
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
        this.getAdminDiagnosticOrdersCount();
    }

    onPage(page: number) {
        // this.fromIndex = +page * +this.perPage;
        this.fromIndex = +this.total;
        console.log("fromIndex2:: " + this.fromIndex);
        this.getDiagnosticListForAdmin();
    }

    getAdminDiagnosticOrderList() {
        this.dataMsg = 'No Data Found!';
        this.spinnerService.start();

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        } else {
            // this.diagnoAdminRequest.date = this.startDate != null ? this.commonUtil.convertDateToTimestamp(this.startDate) : 0;
            this.diagnoAdminRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            this.diagnoAdminRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
            this.diagnoAdminRequest.employeeRequest = 0;
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
                    this.total = this.deliveryDiagnosticslist.length;
                    this.isError = false;
                    this.errorMessage = new Array();
                    this.showMessage = false;
                    this.deliveryDiagnosticslist.forEach(element => {
                        if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
                            element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
                        }
                        else
                            element.patientProfileDetails.age = '';

                        // for yoda dob optional
                        if (this.optionalDOB) {
                            element.patientinfo = "" + element.patientProfileDetails.title + '. ' + element.patientProfileDetails.fName + (element.patientProfileDetails.lName ? element.patientProfileDetails.lName : '') + ", " + (element.patientProfileDetails.age != '' ? element.patientProfileDetails.age + ", " : '') + element.patientProfileDetails.gender;
                        }
                        if (this.optionalDOB) {
                            // to disable Delivery Acceptance if already accpeted / not delivered
                            element.yodaDeliveryAccepted = 3;
                            if (element.phleboDeliveryAccepted)
                                element.yodaDeliveryAccepted = 1;
                            else if (element.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED)
                                element.yodaDeliveryAccepted = 2;
                        }
                        if (this.sampleCollectionStatus == 25 && (element.phleboOrderCancelRequest != null && element.phleboOrderCancelRequest != undefined)) {
                            //phlebo-rejected color-code
                            element.rowStyle = { 'background-color': '#fe4343', 'color': 'white' };
                        }
                        else if ((this.sampleCollectionStatus == 21) && (element.employeeAccepted == undefined || element.employeeAccepted == 0) && (element.vendorPocId > 0 && element.cancellationStatus == 0)) {
                            //phlebo-unassigned color-code
                            // element.rowStyle = { 'background-color': '#9A564F', 'color': 'white' };
                        }
                        else if ((this.sampleCollectionStatus == 23) && (element.vendorPocId == 0 || element.vendorPocId == undefined) && (element.employeeAccepted == 0 || element.employeeAccepted == undefined)) {
                            //vendor-unassigned color-code
                            // element.rowStyle = { 'background-color': '#9A564F', 'color': 'white' };
                        }
                        else if ((this.sampleCollectionStatus == 4) && (element.sampleCollectionStatus == 4 && element.cancellationStatus == 0)) {
                            //vendor-rejected color-code
                            element.rowStyle = { 'background-color': '#D7972F', 'color': 'white' };
                        }
                        if (element.postPrandialSplitting)
                            element.rowStyle = { 'background-color': '#DDA0DD', 'color': 'white' };
                    });
                } else if (this.diagnoAdminRequest.fromIndex == 0) {
                    this.isError = true;
                    this.errorMessage = new Array();
                    if (this.diagnoAdminRequest.orderId != undefined) {
                        this.errorMessage[0] = this.dataMsg = "No data found for the specified Order Id.";
                    } else if (this.diagnoAdminRequest.mobile != undefined) {
                        this.errorMessage[0] = this.dataMsg = "No data found for the specified mobile number.";
                    } else {
                        this.errorMessage[0] = this.dataMsg = "No data found.";
                    }
                    this.deliveryDiagnosticslist = new Array();
                    this.total = this.deliveryDiagnosticslist.length;
                    this.showMessage = true;
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.selectedDiagnosticsAdmin)
            this.selectedDiagnosticsAdmin.isAdminHomeOrder = true;
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

    onStatusSelect(status: number): void {
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.pocIdList.push(this.pocId);
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        this.diagnoAdminRequest.empId = this.empId;
        if (status > 0) {
            this.sampleCollectionStatus = status;
            this.diagnoAdminRequest.sampleCollectionStatus = this.sampleCollectionStatus;
        }
        this.deliveryDiagnosticslist = new Array();
        this.getAdminDiagnosticOrderList();
    }

    onStatusButtonSelect(status: number): void {
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.pocIdList.push(this.pocId);
        this.diagnoAdminRequest.empId = this.empId;
        this.diagnoAdminRequest.fromIndex = 0;
        if (status > 0 || status == -1) {
            this.sampleCollectionStatus = status;
            this.diagnoAdminRequest.sampleCollectionStatus = status;
        }
        this.diagnoAdminRequest.state = this.stateId;
        this.diagnoAdminRequest.city = this.cityId;
        this.diagnoAdminRequest.pinCode = this.pinCode;
        this.deliveryDiagnosticslist = new Array();
        this.getAdminDiagnosticOrderList();
    }

    getAdminDiagnosticOrdersCount() {
        this.spinnerService.start();
        this.workingProgressOrders = 0;
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        } else {
            let diagnoAdminRequest = new DiagnosticAdminRequest();
            diagnoAdminRequest.pocIdList.push(this.pocId);
            diagnoAdminRequest.empId = this.empId;
            // diagnoAdminRequest.date = this.startDate != null ? this.commonUtil.convertDateToTimestamp(this.startDate) : 0;
            diagnoAdminRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
            diagnoAdminRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
            diagnoAdminRequest.employeeRequest = 0;
            diagnoAdminRequest.state = this.stateId;
            diagnoAdminRequest.city = this.cityId;
            diagnoAdminRequest.pinCode = this.pinCode;
            let str = $('#search').val().toString();
            let searchStr = str.trim();
            if (this.searchCriteria == 'orderId') {
                diagnoAdminRequest.orderId = searchStr;
            } else if (this.searchCriteria == 'contactNo') {
                diagnoAdminRequest.mobile = searchStr;
            }
            // if (this.sampleCollectionStatus > 0) {
            //     diagnoAdminRequest.sampleCollectionStatus = this.sampleCollectionStatus;
            // }
            this.diagnosticsService.getAdminDiagnosticOrdersCount(diagnoAdminRequest).then(response => {
                this.spinnerService.stop();
                if (response != null && response != undefined) {
                    this.diagnosticOrdersCount = response;
                    let workingProgressCount = 0;
                    if (this.isVendor == true) {
                        workingProgressCount = this.diagnosticOrdersCount.totalOrders - this.diagnosticOrdersCount.phleboUnAssignedOrders - this.diagnosticOrdersCount.phleboRejectedOrders - this.diagnosticOrdersCount.vendorRejectedOrders - this.diagnosticOrdersCount.sampleCollectedOrders - this.diagnosticOrdersCount.sampleDeliveredOrders;
                    } else {
                        workingProgressCount = this.diagnosticOrdersCount.totalOrders - this.diagnosticOrdersCount.phleboUnAssignedOrders - this.diagnosticOrdersCount.phleboRejectedOrders - this.diagnosticOrdersCount.vendorUnAssignedOrders - this.diagnosticOrdersCount.vendorRejectedOrders - this.diagnosticOrdersCount.sampleCollectedOrders - this.diagnosticOrdersCount.sampleDeliveredOrders;
                    }

                    this.workingProgressOrders = workingProgressCount > 0 ? workingProgressCount : 0;
                }
                else {
                    this.diagnosticOrdersCount = new DiagnosticOrdersCount();
                }
                console.log("adminDiagnosticOrdersCount" + JSON.stringify(this.diagnosticOrdersCount));
            }).catch((err) => {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Failed to fetch admin Diagnostic orders count";
                this.showMessage = true;
            });
        }
    }

    getDeliveryDropOffDetails(value) {
        let data = value;
        let tempString = "No details available";
        this.finalCountTubes = new Array<string>();
        this.proofDocumentUrlList = new Array<string>();
        this.cashproofDocumentUrlList = new Array<string>();
        this.docsCheck = false;
        this.cashDocs = false;
        this.consumablesList = [];
        if (value.consumablesInventoryDetails && value.consumablesInventoryDetails.length > 0)
            this.consumablesList = value.consumablesInventoryDetails;
        if (data != undefined && data != null && data.sampleDropOffDetails && data.sampleDropOffDetails.length > 0) {
            tempString = "<h4 class='page-title'>Sample Deposited Details:</h4>";
            data.sampleDropOffDetails.forEach(item => {
                console.log("item: " + JSON.stringify(item))
                let temp = '';
                let name = item.collectedByName ? ('<b>Employee Name: </b>' + item.collectedByName) : '';
                let poc = item.pocDetails.pocName ? ('<b>Drop Off Center: </b>' + item.pocDetails.pocName) : '';
                let date = item.updatedTimeStamp ? ('<b>Date: </b>' + this.commonUtil.convertTimeStampToDate(item.updatedTimeStamp)) : '';

                let service = '<b>Vacutainer list: </b>';
                let tubeNames = [];
                item.serviceList.forEach(test => {
                    if (test.vacutainerList != null && test.vacutainerList.length > 0) {
                        test.vacutainerList.forEach(tube => {
                            if (tubeNames.length == 0) {
                                tubeNames.push(tube.vacutainerType);
                            } else {
                                let check = tubeNames.filter((record) => { return record == tube.vacutainerType });
                                if (!check.length)
                                    tubeNames.push(tube.vacutainerType);
                            }
                        })
                    }
                })
                if (tubeNames.length > 0) {
                    service = service + tubeNames.length + "<br>";
                    let tub = '';
                    tubeNames.forEach((doc, index) => {
                        tub = tub + doc + "- 1";
                        if (index != tubeNames.length - 1)
                            tub = tub + ', ';
                        this.finalCountTubes.push(doc);
                    })
                    service = service + tub;
                } else {
                    service = '<b>Service Names: </b>';
                    item.serviceList.forEach((test, index) => {
                        service = service + test.serviceName;
                        if (index != item.serviceList.length - 1)
                            service = service + ', ';
                    })
                }
                temp = poc + "<br>" + name + "<br>" + date + "<br>" + service + "<br>";
                tempString = tempString + temp + "<br>";
                item.samplesDropProof.forEach(doc => {
                    this.proofDocumentUrlList.push(doc);
                })
            })
            this.docsCheck = true;
        }
        console.log("final tubes", JSON.stringify(this.finalCountTubes));

        let cashString = '';
        if (data != undefined && data != null && data.cashDeliveryDetails != null && data.cashDeliveryDetails != undefined) {
            cashString = "<h4 class='page-title'>Cash Deposited Details:</h4>";
            let item = data.cashDeliveryDetails;

            let name = item.empName ? ('<b>Employee Name: </b>' + item.empName) : '';
            let id = item.empId ? ('<b>Employee Id: </b>' + item.empId) : '';
            let date = item.updatedTimestamp ? ('<b>Date: </b>' + this.commonUtil.convertTimeStampToDate(item.updatedTimestamp)) : '';
            let amount = item.cashAmount ? ('<b>Amount: </b> Rs.' + item.cashAmount) : '';
            let poc = item.pocName ? ('<b>Drop Off Center: </b>' + item.pocName) : '';

            cashString = cashString + poc + "<br>" + name + "<br>" + id + "<br>" + date + "<br>" + amount + "<br>";

            if (item.proofs.length > 0) {
                this.cashDocs = true;
                this.cashproofDocumentUrlList = item.proofs;
            }
            else
                this.cashDocs = false;
        }
        (<any>$("#viewdropoff")).modal("show");
        this.formattedDeliveryData = tempString + cashString;
        this.getDocuments();
        this.getCashDocuments();
    }

    getDocuments() {
        this.convertedDocumentUrlList = new Array();
        if (this.proofDocumentUrlList && this.proofDocumentUrlList.length > 0) {
            this.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.convertedDocumentUrlList.push(url);
                }
                else {
                    if (url.includes("pdf"))
                        this.convertedDocumentUrlList.push(url);
                    else {
                        this.diagnosticsService.getPdfUrl(url).then(xdata => {
                            this.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
                        });
                    }
                }
            });
        }
        console.log("converted", JSON.stringify(this.convertedDocumentUrlList));
    }

    getCashDocuments() {
        this.cashconvertedDocumentUrlList = new Array();
        if (this.cashproofDocumentUrlList && this.cashproofDocumentUrlList.length > 0) {
            this.cashproofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.cashconvertedDocumentUrlList.push(url);
                }
                else {
                    if (url.includes("pdf"))
                        this.cashconvertedDocumentUrlList.push(url);
                    else {
                        this.diagnosticsService.getPdfUrl(url).then(xdata => {
                            this.cashconvertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
                        });
                    }
                }
            });
        }
        console.log("cash convert", JSON.stringify(this.cashconvertedDocumentUrlList));
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

    onViewDocs() {
        //(<any>$("#viewdropoff")).modal("hide");
        (<any>$("#viewdropoffdocs")).modal("show");
    }

    onViewCashDocs() {
        (<any>$("#viewcashdropoffdocs")).modal("show");
    }

    customerReviewButtonClicked(data: any): void {
        this.modalId = 'central_Diagnostic_id1';
        this.modalTitle = 'Add Customer Review';

        this.userData = new CentralOrderInteraction();
        this.userData = data;
        console.log("customerReviewButtonClicked: ", data);
        this.comments = '';
        this.interactionStatus = '';
        this.error = '';

        (<any>$)("#modalId").modal("show");

    }
    addInteractionStatus(status: any) {
        this.interactionStatus = status;
    }

    onRemarksSubmit(comments) {
        let requestBody: CentralOrderInteraction = new CentralOrderInteraction();
        this.error = '';
        this.comments = comments;
        if ((this.interactionStatus == '' && this.comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }

        requestBody.consumerInteractedEmpId = this.empId;
        requestBody.consumerInteractedEmployeeName = this.authService.userAuth.employeeName;
        requestBody.consumerInteractionDate = new Date().getTime();
        requestBody.consumerInteractedComments = this.comments = comments;
        requestBody.consumerInteractionStatus = this.interactionStatus;
        requestBody.interactionType = 0;
        requestBody.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;

        requestBody.profileId = this.userData.patientProfileId;
        requestBody.orderId = this.userData.orderId;
        requestBody.baseInvoiceId = this.userData.invoiceId;
        requestBody.patientName = (this.userData.patientProfileDetails.title ? this.userData.patientProfileDetails.title : '') + ' ' +
            (this.userData.patientProfileDetails.fName ? this.userData.patientProfileDetails.fName : '') + ' ' +
            (this.userData.patientProfileDetails.lName ? this.userData.patientProfileDetails.lName : '');

        this.spinnerService.start();
        this.adminService.updateReviewForCentralBookings(requestBody).then(response => {
            this.spinnerService.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {
                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                (<any>$)("#select_entity_type").val(0);
                this.interactionStatus = '';
                this.comments = ' ';
                this.modalId = null;
                this.modalTitle = '';
                this.total = 0;
                this.error = '';
            }
            else {
                window.alert('Something went wrong,please try again');
            }

        });
    }

    onSendEmail() {
        if (this.enableButtonStatusFilter)
            (<any>$("#mailmodal")).modal("show");
        else
            (<any>$("#mailmodalothers")).modal("show");
    }

    getEmailReportTypeList(num) {
        this.diagAdminService.getEmailReportTypeLIst(num).then((data) => {
            if (data)
                this.emailReportList = data;
        });
    }

    emailStartDateChoosen($event) {
        this.emailStartDate = $event;
    }
    emailEndDateChoosen($event) {
        this.emailEndDate = $event;
    }

    onMailSubmit() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let emailCheck = re.test(this.toEmail);
        if (!emailCheck) {
            alert("Please enter a valid email address");
            return;
        }
        if (this.commonUtil.convertOnlyDateToTimestamp(this.emailStartDate) > this.commonUtil.convertOnlyDateToTimestamp(this.emailEndDate)) {
            this.errorMessage1 = new Array();
            this.errorMessage1[0] = 'Start Date should always be greater than end date';
            this.isError1 = true;
            this.showMessage1 = true;
            return;
        }

        if (this.emailReportId == -1) {
            this.errorMessage1 = new Array();
            this.errorMessage1[0] = 'please select report type';
            this.isError1 = true;
            this.showMessage1 = true;
            return;
        }

        (<any>$)("#mailmodal").modal("hide");
        this.spinnerService.start();
        let emailRequestBody: DiagnosticAdminRequest = new DiagnosticAdminRequest();
        emailRequestBody.isExcel = true;
        emailRequestBody.toEmail = this.toEmail;
        emailRequestBody.emailReportId = +this.emailReportId;
        emailRequestBody.pocIdList = [];
        emailRequestBody.pocIdList.push(this.pocId);
        emailRequestBody.empId = this.empId;
        emailRequestBody.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.emailStartDate);
        emailRequestBody.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.emailEndDate);
        this.diagnosticsService.getDiagnosticListForAdmin(emailRequestBody).then(response => {
            this.spinnerService.stop();
            this.toEmail = '';
            this.emailReportId = -1;
            try {
                this.toast.show('Successfully sent email.', "bg-success text-white font-weight-bold", 3000);
            }
            catch (error) {
                console.error(error);
            }
        })
    }

    onOtherMailSubmit() {
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
        (<any>$)("#mailmodalothers").modal("hide");
        this.spinnerService.start();
        let emailRequestBody: DiagnosticAdminRequest = new DiagnosticAdminRequest();
        emailRequestBody.isExcel = true;
        emailRequestBody.toEmail = this.toEmail;
        emailRequestBody.emailReportId = 1;
        emailRequestBody.pocIdList = [];
        emailRequestBody.pocIdList.push(this.pocId);
        emailRequestBody.empId = this.empId;
        emailRequestBody.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        emailRequestBody.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
        this.diagnosticsService.getDiagnosticListForAdmin(emailRequestBody).then(response => {
            this.spinnerService.stop();
            this.toEmail = '';
            try {
                this.toast.show('Successfully sent email.', "bg-success text-white font-weight-bold", 3000);
            }
            catch (error) {
                console.error(error);
            }
        })
    }

    onClickDeliveryApprovalClicked(val) {
        this.deliveryApprovalReq = val;
        if (this.deliveryApprovalReq.yodaDeliveryAccepted != 1 && this.deliveryApprovalReq.yodaDeliveryAccepted != 2)
            (<any>$("#deliveryApproval")).modal("show");
    }

    onAcceptDelivery() {
        this.deliveryApprovalReq.remarks = this.deliveryRemarks;
        this.deliveryApprovalReq.phleboDeliveryAccepted = true;
        this.deliveryApprovalReq.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.PHLEBO_DLEIVERY_ACCEPTED;
        this.deliveryApprovalReq.acceptedEmpId = this.empId;
        this.deliveryApprovalReq.acceptedEmpName = this.authService.userAuth.employeeName;
        this.spinnerService.start();
        this.diagnosticsService.updateDiagnosticAdminRemarks(this.deliveryApprovalReq).then(data => {
            this.spinnerService.stop();
            if (data.statusCode == 201 || data.statusCode == 200) {
                this.toast.show('Successfully updated', "bg-success text-white font-weight-bold", 3000);
                this.deliveryRemarks = '';
                (<any>$)("#deliveryApproval").modal("hide");
                this.getRefreshedorderList();
            }
            else
                this.toast.show(data.statusMessage, "bg-danger text-white font-weight-bold", 3000);
        });
    }

}    
