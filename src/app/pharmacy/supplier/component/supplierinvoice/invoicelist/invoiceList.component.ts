import { Router } from '@angular/router';
import { SpinnerService } from '../../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../../auth/auth.service';
import { PharmacyService } from '../../../../pharmacy.service';
import { AppConfig } from '../../../../../app.config';
import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { BBCartItem } from '../../../../../model/basket/b2bcartitem';
import { EmployeePocMapping } from '../../../../../model/employee/employeepocmapping';
import { AdminService } from '../../../../../admin/admin.service';

@Component({
    selector: 'invoiceList',
    templateUrl: './invoiceList.template.html',
    styleUrls: ['./invoiceList.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class InvoiceList implements OnDestroy, OnInit {
    config: any;
    invoiceList: BBCartItem[] = new Array<BBCartItem>();
    selectedInvoiceAdvise: BBCartItem;
    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;
    defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria.";
    from: number;
    size: number;
    startDate: Date = null;
    endDate: Date;
    searchCriteria: string = '';
    orderId: string = '';
    dataMsg: string = '';
    perPage: number = 10;
    total: number = 0;
    pdfHeaderType: number;
    supplierPocId: number = 0;
    suppliersList: Array<EmployeePocMapping>;
    stausFilterValue: number = -1;
    datepickerOpts = {
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    datepickerOptEnd = {
        startDate: new Date(this.startDate),
        endDate: new Date(),
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
            display: 'Centre Name',
            variable: 'purchaserPocDetails.pocName',
            filter: 'text',
            sort: true
        },
        {
            display: 'Status',
            variable: 'invoiceCompletionStatus',
            filter: 'text',
            sort: true,
            conditions: [
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Invoiced'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Dispatched'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Delivered'
                },
                {
                    value: '21',
                    condition: 'gte',
                    label: 'Rejected'
                },
                {
                    value: '0',
                    condition: 'default',
                    label: 'Pending'
                }
            ]
        },
        {
            display: 'Date',
            variable: 'updatedTimestamp',
            filter: 'date',
            sort: true
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
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
                    value: '1',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_read.png',
                },
                {
                    value: '0',
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                }
            ]
        }
    ];
    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };
    constructor(config: AppConfig, private adminService: AdminService,
        private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;

    }

    ngOnInit(): void {
        this.invoiceList = new Array();
        this.from = 0;
        this.size = 50;
        this.pharmacyService.cleanSupplierOrdersLocalstore();
        this.getInvoiceList();
        this.getPocList();
    }

    startDateChoosen($event): void {
        this.datepickerOptEnd = {
            startDate: new Date(this.startDate),
            endDate: new Date(),
            autoclose: true,
            todayBtn: 'linked',
            todayHighlight: true,
            assumeNearbyYear: true,
            format: 'dd/mm/yyyy'
        };
    }

    getInvoiceList() {
        
        this.spinnerService.start();
        this.dataMsg = 'Loading.....';
        this.startDate ? this.startDate.setHours(0, 0, 0, 0) : 0;
        this.endDate ? this.endDate.setHours(23, 59, 59, 0) : 0;
        let fromDate = this.startDate ? this.startDate.getTime() : 0;
        let toDate = this.endDate ? this.endDate.getTime() : 0;
        let pocId = this.supplierPocId == 0 ? this.auth.selectedPOCMapping.pocId : this.supplierPocId;
        this.pharmacyService.getInVoicesList(pocId, 0, this.from, this.size,
            this.orderId, fromDate, toDate, this.stausFilterValue).then(invoiceListResult => {
                this.spinnerService.stop();
                if (invoiceListResult && invoiceListResult.length > 0) {
                    for (let i = 0; i < invoiceListResult.length; i++) {
                        if (invoiceListResult[i].invoiceId == null)
                            invoiceListResult.splice(i, 1);
                    }
                    this.invoiceList.push.apply(this.invoiceList, invoiceListResult);
                    if (this.invoiceList.length != this.total) {
                        this.total = this.invoiceList.length;
                    }
                } else {
                    this.invoiceList = new Array<BBCartItem>();
                    this.total = this.invoiceList.length;
                    if (this.searchCriteria) {
                        this.isError = true;
                        this.errorMessage = new Array();
                        this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
                    }
                    this.dataMsg = 'No data found';
                }
            })
    }

    getRefreshedorderList(): void {
        this.searchCriteria = "";
        this.orderId = "";
        this.pharmacyService.isError = false;
        this.pharmacyService.errorMessage = undefined;
        this.pharmacyService.showMessage = false;
        this.supplierPocId = 0;
        this.stausFilterValue = -1;
        this.resetAndGetInvoiceList();
    }

    resetAndGetInvoiceList() {
        this.invoiceList = new Array<BBCartItem>();
        this.total = 0;
        this.from = 0;
        this.size = 50;
        this.getInvoiceList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getInvoiceAdviceBasedOnOrderId();
        }
    }
    onSubmit() {
        if (this.startDate > this.endDate) {
            this.isError = true;
            this.errorMessage = new Array();
            this.showMessage = true;
            this.errorMessage[0] = "End date must be greater than start date";
            return;
        }
        this.orderId = this.searchCriteria.trim();
        this.invoiceList = new Array<BBCartItem>();
        this.total = 0;
        this.from = 0;
        this.size = 50;
        this.getInvoiceList();
    }

    getInvoiceAdviceBasedOnOrderId(): void {
        this.orderId = this.searchCriteria.trim();
        this.isError = false;
        this.errorMessage = undefined;
        this.showMessage = false;
        this.invoiceList = (!this.searchCriteria) ? this.invoiceList : new Array<BBCartItem>();
        this.total = 0;
        if (!this.orderId) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter search query');
            this.showMessage = true;
            return;
        }
        this.getInvoiceList();
    }

    clickEventHandler(e) {
        if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        } else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        }
    }

    onImageClicked(supplierAdvise: BBCartItem): void {
        this.selectedInvoiceAdvise = supplierAdvise;
        if (this.selectedInvoiceAdvise.payment.paymentStatus == 1) {
            let pdfUrl = '';
            if (this.pdfHeaderType == 0) {
                pdfUrl = this.selectedInvoiceAdvise.pdfUrlWithHeader;
            } else {
                pdfUrl = this.selectedInvoiceAdvise.pdfUrlWithoutHeader;
            }
            this.pharmacyService.openPDF(pdfUrl);
        }
    }
    onButtonClicked(supplierAdvise: any): void {
        this.pharmacyService.supplierAdviseTrack = supplierAdvise;
        this.pharmacyService.saveSupplierOrdersLocalstore();
        this.pharmacyService.supplierBackPageLoc = '/app/pharmacy/supplier/invoicelist';
        this.router.navigate(['/app/pharmacy/supplier/invoicedetails']);
    }

    onPage(page: number) {
        if (this.total < 50 || (+this.total % 50) > 0) {
            return;
          }
        this.from = this.total;
        this.getInvoiceList();
    }

    async getPocList() {

        await this.pharmacyService.getSupplierPoc(true).then(response => {
            if (response && response.length > 0) {
                this.suppliersList = response;
            }
        })
            .catch(error => {
                console.error('Error occurred while fetching the employee POCs', error);
            });
    }

    onPOCSelect(pocId) {
        this.supplierPocId = pocId;
        if (pocId != 0) {
            this.invoiceList = this.invoiceList.filter((list) => {
                return list.purchaserPocId == pocId;
            })
            if (this.invoiceList.length == 0 || this.invoiceList == null || this.invoiceList == undefined) {
                this.dataMsg = 'No data found';
            }
        }
        else {
            this.resetAndGetInvoiceList();
        }
    }

    onFilterChanged(value) {
        this.stausFilterValue = value;
        this.resetAndGetInvoiceList();

    }

    ngOnDestroy(): void {
        this.pharmacyService.isError = false;
        this.pharmacyService.showMessage = false;
        if (this.selectedInvoiceAdvise != undefined && this.selectedInvoiceAdvise != null) {
            this.pharmacyService.supplierAdviseTrack = this.selectedInvoiceAdvise;
        }
    }

    validateAlphaNumberInputOnly(event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (48 <= charCode && charCode <= 57)
          return true;
        if (65 <= charCode && charCode <= 90)
          return true;
        if (97 <= charCode && charCode <= 122)
          return true;
        return false;
      }
}