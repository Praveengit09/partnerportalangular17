import { Router } from '@angular/router';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from '../../../diagnostics.service';
import { Config } from '../../../../base/config';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
    selector: 'cancelledorders',
    templateUrl: './cancelledorders.template.html',
    styleUrls: ['./cancelledorders.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class CancelledOrderComponent {


    total: number = 0;
    dataMsg: string = ' ';
    isError: boolean;
    error: string = '';
    errorMessage: Array<string>;
    showMessage: boolean;
    perPage: number = 10;
    pocId: number = 0;
    empId: number = 0;
    fromIndex: number = 0;
    toIndex: number = 50;
    orderId: string = '';
    mobileNo: string = '';
    startDate: Date = new Date();
    endDate: Date = new Date();
    fromDate: number = 0;
    toDate: number = 0;
    filterStatus: number = -1;
    cancelledOrders: Array<DiagnosticDeliveryAdviceTrack>;
    order: DiagnosticDeliveryAdviceTrack;
    remarks: string = '';

    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };


    columns: any[] = [
        {
            display: 'OrderId',
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
            display: 'Patient Details',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName, patientProfileDetails.gender',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Patient Contact',
            variable: 'patientProfileDetails.contactInfo.mobile, patientProfileDetails.contactInfo.email',
            filter: 'text',
            sort: false
        },
        {
          display: 'Phlebo Name',
          variable: 'phleboOrderCancelRequest.phleboName',
          filter: 'text',
          sort: false
        },
        {
            display: 'Action',
            label: 'VIEW',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewOrderButton',
            sort: false
        },
        {
            display: 'Home Collection Address',
            variable: 'deliveryAddress.address1, deliveryAddress.address2, deliveryAddress.areaName, deliveryAddress.cityName, deliveryAddress.stateName, deliveryAddress.pinCode',
            filter: 'text',
            sort: false
        },
        {
            display: 'Amount (Rs.)',
            variable: 'payment.finalAmount',
            filter: 'text',
            sort: false
        },
        {
            display: 'Payment Status',
            variable: 'payment.paymentStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Not Paid'
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
                    value: '3',
                    condition: 'eq',
                    label: 'Failed'
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
            display: 'Last Updated Time',
            variable: 'updatedTimestamp',
            filter: 'datetime',
            sort: true
        },
        {
            display: 'Phlebo Remarks',
            variable: 'phleboOrderCancelRequest.comments',
            filter: 'text',
            sort: false
        },
        {
            display: 'Remarks',
            variable: 'remarks',
            filter: 'text',
            sort: false
        },
        {
            display: 'Cancellation Status',
            variable: 'cancellationStatus',
            filter: 'action',
            type: 'button',
            event: 'cancelbutton',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Cancel Booking',
                    style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Rejected',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Cannot Be Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'Cancel Booking',
                    style: 'btn btn-danger width-150 mb-xs botton_txtdigo hide_btndigo disabled'
                }

            ]
        },
        {
            display: 'Reschedule',
            variable: 'rescheduleStatus',
            filter: 'action',
            type: 'button',
            event: 'reschedulebutton',
            sort: false,
            conditions: [
                {
                  value: '0',
                  condition: 'eq',
                  label: 'Reschedule Booking',
                  style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
                },
                {
                  value: '1',
                  condition: 'eq',
                  label: 'Reschedule Booking',
                  style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                  value: '2',
                  condition: 'eq',
                  label: 'Reschedule Booking',
                  style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
                },
                {
                  value: '3',
                  condition: 'eq',
                  label: 'Reschedule Booking',
                  style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                  value: '11',
                  condition: 'eq',
                  label: 'Reschedule Booking',
                  style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '30',
                    condition: 'eq',
                    label: 'Rescheduled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'Reschedule Booking',
                    style: 'btn btn-danger width-150 mb-xs botton_txtdigo hide_btndigo disabled'
                }
              ]
        }

    ];

    constructor(private authService: AuthService, private toast: ToasterService, private router: Router,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private spinnerService: SpinnerService) {

        if (Config.portal.diagnosticOptions && !Config.portal.diagnosticOptions.hideHomeCollectionPOCName) {
            this.columns.splice(3, 0, {
                display: 'Center Name',
                variable: 'pocDetails.pocName pocDetails.contactList[0]',
                filter: 'text',
                sort: false
            });
        }
        if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
            this.columns.splice(4,0, {
                display: 'Vendor Name',
                variable: 'vendorPocName',
                filter: 'text',
                sort: false
            });
        }
    }

    ngOnInit(): void {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('cancelleOrderStartDate') != null && window.localStorage.getItem('cancelleOrderStartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('cancelleOrderStartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('cancelleOrderEndDate'))));
            this.submit();
          }
          else 
            this.getCancelledOrders();
    }


    getCancelledOrders(): void {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.cancelledOrders = new Array<DiagnosticDeliveryAdviceTrack>();
        this.spinnerService.start();
        this.dataMsg = 'Loading...';

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = "End date must be greater than start date";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        this.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        this.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
        this.diagnosticsService.getCancelledOrders(this.pocId, this.empId, this.fromDate, this.toDate, this.orderId, this.mobileNo, this.fromIndex, this.toIndex, this.filterStatus).then(response => {
            this.spinnerService.stop();
            this.dataMsg = 'No data found';
            if (response != null && response != undefined && response.length > 0) {
                this.cancelledOrders = response;
                this.cancelledOrders.forEach(doc => {
                    doc.phleboOrderCancelRequest.comments = doc.phleboOrderCancelRequest.comments;
                    doc.rescheduleStatus = doc.cancellationStatus;
                    if (doc.rescheduledOrder == true) {
                        doc.rescheduleStatus = 30;
                        doc.cancellationStatus = 30; // to disable cancel reschedule orders
                    }
                })
            }
        });

    }

    clickEventHandler(e) {
        if (e.event == 'reschedulebutton') {
            this.onClickRescheduled(e.val);
        } else if (e.event == 'cancelbutton') {
            this.onClickCancel(e.val);
        } else if (e.event == 'viewOrderButton') {
            this.onViewButtonClicked(e.val);
        } 
    }

    onClickCancel(val) {
        this.order = val;
        if (this.order.cancellationStatus == 0) {
            this.remarks = '';
            (<any>$("#cancelorder")).modal("show");
        }
    }

    onClickRescheduled(val) {
        this.diagnosticsService.order = this.order = val;
        this.diagnosticsService.tempPdfUrl = '/app/diagnostics/diagnosticadmin/cancelledorders';
        if (this.order.cancellationStatus == 0) {
            this.router.navigate(['/app/diagnostics/diagnosticadmin/reschedule'])
        }
    }

    onViewButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
        let order = statusDiagnosticsAdvise;
        order.isAdminHomeOrder = true;
        this.diagnosticsService.orderDetailAdviceTrack = order;
        this.diagnosticsService.centralAdminModify = false;
        this.diagnosticsService.cancelOrder = true;
        this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    }

    startDateChoosen($event): void {
        this.startDate = $event;
    }

    endDateChoosen($event) {
        this.endDate = $event;
    }

    submit(){
        this.total = 0;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('cancelleOrderStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('cancelleOrderEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));
        this.getDateOrders();
    }
    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getOrderListWithMobile();
        }
    }

    getDateOrders() {
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        }
        this.getCancelledOrders();
    }



    getOrderListWithMobile(search: string = '') {
        search = $('#search').val().toString();
        if (isNaN(parseInt(search))) {
            this.orderId = search;
            this.mobileNo = '';
        } else {
            if (search.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            }
            this.mobileNo = search;
            this.orderId = '';
        }
        this.total = this.fromIndex = 0;
        this.getCancelledOrders();
    }

    getRefreshedorderList() {
        $('#search').val('');
        this.fromIndex = 0;
        this.mobileNo = '';
        this.orderId = '';
        this.filterStatus = -1;
        this.getCancelledOrders();
    }

    onFilterChanged(val) {
        this.filterStatus = val;
        this.getCancelledOrders();
    }

    onPage(page: number) {
        this.fromIndex = +this.total;
        this.getCancelledOrders();
    }

    cancelOrder() {
        this.filterStatus = -1;
        this.order.remarks = this.remarks;
        if (!this.remarks.length) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter reason');
            this.showMessage = true;
            return;
        }
        else {
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
        }
        (<any>$("#cancelorder")).modal("hide");
        this.order.cancellationStatus = 1;
        this.order.sampleCollectionStatus = 4;
        this.order.acceptedEmpId = this.authService.userAuth.employeeId;
        this.order.acceptedEmpName = this.authService.userAuth.employeeName;
        this.spinnerService.start();
        this.diagnosticsService.updateDiagnosticAdminRemarks(this.order).then(data => {
            this.spinnerService.stop();
            if(data.statusCode == 200)
             this.toast.show("Order Cancelled", "bg-success text-white font-weight-bold", 3000);
            else 
            this.toast.show(data.statusMessage, "bg-danger text-white font-weight-bold", 3000);
            this.getCancelledOrders();
        });
    }
}