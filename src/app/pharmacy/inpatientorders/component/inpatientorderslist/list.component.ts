import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CartItem } from '../../../../model/basket/cartitem';
import { InpatientOrdersService } from '../../inpatientorders.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../auth/auth.service';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { CommonUtil } from '../../../../base/util/common-util';
import { NGTableComponent } from '../../../../layout/widget/ngtable/ngtable.component';
import { PharmacyOrderHistory } from '../../../../model/pharmacy/pharmacyOrderHistory';
import { PharmacyDeliverTrack } from '../../../../model/pharmacy/pharmacydeliverytrack';


@Component({
    selector: 'inpatientbilling',
    templateUrl: './list.template.html',
    styleUrls: ['./list.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InpatientBillingComponent implements OnInit {

    pageEvent: any;
    selectedList = new Array<CartItem>();
    inpatientOrdersList = new Array<CartItem>();
    selectedRows: any;

    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;

    searchCriteria: string = 'orderId';
    defaultDate: number = 0;
    pdfHeaderType: number;
    defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria."
    total: number = 0;
    paymentStatus: number = -1;
    orderId = '';
    mobileNo = '';
    filterPaymentStatus = -1;
    dataMsg = '';
    perPage: number = 10;
    hasSearchParam: boolean = false;
    consolidatedBillSummary: CartItem = new CartItem();
    startDate;
    endDate;
    searchTerm: '';
    consolidatedEdit: boolean;
    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };
    orderHistorydataMsg: string = "";
    orderHistoryTrackList = new Array<PharmacyOrderHistory>();
    @ViewChild(NGTableComponent, { static: false }) private ngTable: NGTableComponent;



    columns: any[] = [
        {
            display: '#',
            filter: 'index',
            type: 'index',
            sort: false
        },
        {
            display: 'InPatient Number',
            variable: 'inPatientNo',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Name',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile',
            filter: 'nametitle',
            filler: ',',
            sort: true
        },
        {
            display: 'Doctor Name',
            variable: 'doctorDetail.title doctorDetail.firstName doctorDetail.lastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Clinic Name',
            variable: 'pocDetails.pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'updatedTimestamp',
            filter: 'date',
            sort: false
        },
        {
            display: 'Medicines',
            variable: 'medicinesList',
            filter: 'text',
            sort: false
        },
        {
            display: 'Status',
            variable: 'payment.paymentStatus',
            filter: 'text',
            sort: true,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Paid'
                },
                {
                    value: '0',
                    condition: 'lte',
                    label: 'Not Paid'
                },
                {
                    value: '2',
                    condition: 'default',
                    label: 'Pending'
                }
            ]
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
            variable: 'invoiceCompletionStatus',
            conditions: [
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
                },
                {
                    value: '0',
                    condition: 'lte',
                    label: 'View',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'pending',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'pending',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                }
            ]
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
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                },
                {
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
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
        }
    ];

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

    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };


    constructor(
        private router: Router, private inPatientOrdersService: InpatientOrdersService, private spinner: SpinnerService,
        private auth: AuthService, private toast: ToasterService, private pharmacyService: PharmacyService, private commonUtil: CommonUtil,
    ) {

        this.selectedRows = [];
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;

    }

    ngOnInit() {
        this.total = 0;
        this.inpatientOrdersList = new Array<CartItem>();
        this.inPatientOrdersService.isSingleOrder = false;
        this.fetchinPatientOrdersList();

    }




    async fetchinPatientOrdersList() {
        let startDate, endDate;
        this.startDate ? startDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate) : startDate = 0;
        this.endDate ? endDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000 : endDate = 0;

        if (this.mobileNo.length == 10 || this.filterPaymentStatus != -1 || startDate != 0 || endDate != 0) {
            this.hasSearchParam = true
        }
        else {
            this.hasSearchParam = false;
        }
        this.spinner.start();
        await this.inPatientOrdersService.getinPatientOrdersList(this.auth.userAuth.pocId, this.total, 50, this.orderId, this.mobileNo, this.filterPaymentStatus, startDate, endDate).then((ordersList) => {

            if (ordersList.length > 0) {
                if (this.inpatientOrdersList.length == 0) {
                    this.inpatientOrdersList = ordersList;
                }
                else if (this.inpatientOrdersList.length > 0) {
                    this.inpatientOrdersList.push.apply(ordersList);
                }
                this.total = this.inpatientOrdersList.length;
            }
            else {

                if (this.total == 0)
                    this.dataMsg = this.defaultMsgForNoMacthingRecord;
            }

        }).catch((err) => {
            console.log(err);
            this.dataMsg = this.defaultMsgForNoMacthingRecord;
            this.total = 0;
            this.inpatientOrdersList = new Array<CartItem>();
            this.toast.show('Something went wrong ,please try again', "bg-danger text-white font-weight-bold", 3000);

        }).finally(() => {

            if (this.inpatientOrdersList.length > 0) {
                this.inpatientOrdersList.forEach((element, index) => {
                    let medicinesList = '';
                    for (var i = 0; i < element.pharmacyList.length; i++) {
                        medicinesList += "" + element.pharmacyList[i].productName + " - " + element.pharmacyList[i].quantity
                        if (i != element.pharmacyList.length - 1)
                            medicinesList += ", \n "
                    }
                    element.medicinesList = medicinesList;
                })
            }

            this.spinner.stop();
        })

    }

    getRefreshedorderList() {

        this.startDate = this.endDate = null;
        this.searchTerm = this.mobileNo = '';
        this.filterPaymentStatus = -1;
        this.hasSearchParam = false;
        this.resetAndGetOrdersList();
    }

    resetAndGetOrdersList() {
        this.total = 0;
        this.inpatientOrdersList = new Array<CartItem>();
        this.selectedRows = [];
        this.selectedList = new Array<CartItem>();
        this.perPage = 10;

        this.fetchinPatientOrdersList();

    }

    onPage(page: number) {
        this.fetchinPatientOrdersList();
    }

    onEnterPressed(e) {
        e.preventDefault();
        this.searchTerm = e.target.value;
        if (e.keyCode == 13) {
            this.getInPatientOrdersBasedOnPhnNoId();
        }
    }

    validateNumberInputOnly(event) {

        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }


    getInPatientOrdersBasedOnPhnNoId(): void {

        if (this.searchTerm.length > 0 && this.searchTerm.length != 10) {
            this.toast.show("Please Enter valid mobile number", "bg-danger text-white font-weight-bold", 3000);
            this.mobileNo = '';
            return;
        }
        else {
            this.mobileNo = this.searchTerm;
        }

        this.resetAndGetOrdersList();
    }


    getInPatientOrdersBasedOnPaymentStatus(status) {

        this.filterPaymentStatus = status;
        this.resetAndGetOrdersList();
    }

    startDateChoosen(startDate) {
        this.startDate = startDate;
    }

    endDateChoosen(endDate) {
        console.log('enddate', endDate);
        this.endDate = endDate;
    }


    getInPatientOrderListBasedOnDate() {
        console.log('getInPatientOrderListBasedOnDate');
        let startDate = this.startDate;
        let endDate = this.endDate
        if (this.startDate && this.endDate) {
            if (this.commonUtil.convertOnlyDateToTimestamp(startDate) > this.commonUtil.convertOnlyDateToTimestamp(endDate)) {

                this.toast.show('Start Date should always be less than end date', "bg-danger text-white font-weight-bold", 3000);
                return;
            }
            else {
                this.resetAndGetOrdersList();
            }
        }
        else {
            this.toast.show('Please enter Valid date range', "bg-danger text-white font-weight-bold", 3000);
            return;

        }

    }

    onGenerateNewAdvise() {
        localStorage.removeItem("cartItem");
        this.pharmacyService.cartItem = new CartItem();
        this.pharmacyService.pharmacyAdviseTrack = new CartItem();
        (window.localStorage.hasOwnProperty('cartItem') != true) && this.router.navigate(['/app/pharmacy/inpatientorders/neworder']);

    }


    clickEventHandler(e) {
        if (e.event == 'onChecked') {
            let list = e.val;

            let hasSinglePatientOrders = this.checkSelectedList(e.val);
            let hasPaidOrders = this.checkPaidOrder(e.val);
            setTimeout(() => {
                if (list && list.length > 0) {
                    if (hasSinglePatientOrders == true && hasPaidOrders == false) {
                        this.selectedList = e.val;
                        return;

                    }
                    else if (hasPaidOrders == true && hasSinglePatientOrders == true) {
                        this.ngTable.clearSelectedRows();
                        hasPaidOrders = false;
                        hasSinglePatientOrders == true
                        this.toast.show("Please select non-paid order", "bg-danger text-white font-weight-bold", 1000);
                        list = [];
                        this.selectedList = new Array<CartItem>();

                        return;
                    } else if (hasSinglePatientOrders == false && hasPaidOrders == false) {
                        this.ngTable.clearSelectedRows();
                        this.toast.show("Please select orders of a single patient", "bg-danger text-white font-weight-bold", 3000);
                        this.selectedRows = [];
                        list = [];
                        this.selectedList = new Array<CartItem>();
                        return;
                    }
                }
                else {
                    this.selectedRows = [];
                    this.selectedList = new Array<CartItem>();
                    return;
                }
            }, 500)


        }
        else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        }
        else if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        }
        else if (e.event == 'viewHistory') {
            this.onViewHistoryClicked(e.val);
        }
    }

    checkPaidOrder([...selectedList]) {

        let hasPaidOrders = false;
        selectedList.forEach(element => {
            if (element.invoiceCompletionStatus == 5) {
                hasPaidOrders = true;
                return;
            }
            else {
                hasPaidOrders = false;
            }
        });

        return hasPaidOrders;

    }

    onButtonClicked(pharmacyAdvise: CartItem): void {
        if (pharmacyAdvise.payment.paymentStatus !== 1) {
            this.inPatientOrdersService.isSingleOrder = true;
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(pharmacyAdvise)));
            this.router.navigate(['/app/pharmacy/inpatientorders/ordersummary']);
        }

    }

    checkSelectedList([...list]) {//checking whether the selected list has orders of single patient
        let hasSinglePatientOrders = false;
        list.forEach(element => {
            if (element.patientProfileId == list[0].patientProfileId) {
                hasSinglePatientOrders = true;
                return;
            }
            else {
                hasSinglePatientOrders = false;
            }
        });

        return hasSinglePatientOrders;
    }

    onImageClicked(pharmacyAdvise: CartItem): void {
        if (pharmacyAdvise.payment.paymentStatus == 1) {
            let pdfUrl = '';
            if (this.pdfHeaderType == 0) {
                pdfUrl = pharmacyAdvise.pdfUrlWithHeader;
            } else {
                pdfUrl = pharmacyAdvise.pdfUrlWithoutHeader;
            }
            this.pharmacyService.openPDF(pdfUrl);
        }
    }


    onGetSummaryClickHandler(type) {
        if (type == 'edit') {
            this.consolidatedEdit = true;
        }
        else {
            this.inPatientOrdersService.isPaymentSummary = true;
            this.consolidatedEdit = false;
        }
        if (this.selectedList.length > 0) {
            this.inPatientOrdersService.selectedInpatientOrders = this.selectedList;
            let billNoList = this.selectedList.map((list) => { return list.billNo });
            this.getConsolidatedSummaryOfInpatientOrders(billNoList);

        }
        else {
            this.toast.show("Please Select atleast one order", "bg-danger text-white font-weight-bold", 3000);
            return;
        }

    }

    async getConsolidatedSummaryOfInpatientOrders(billNoList) {
        this.spinner.start();
        await this.inPatientOrdersService.getConsolidatedBillDetails(billNoList).then((billSummary) => {
            if (billSummary != null && billSummary != undefined && JSON.stringify(billSummary) != '{}') {
                this.consolidatedBillSummary = { ...billSummary };
                this.consolidatedBillSummary.inPatientBilling = false;
                delete this.consolidatedBillSummary.inPatientBilling;
                this.pharmacyService.pharmacyAdviseTrack = { ...this.consolidatedBillSummary };
                if (this.consolidatedEdit == true) {
                    this.pharmacyService.pharmacyAdviseTrack.inPatientBilling = true;
                    this.pharmacyService.pharmacyAdviseTrack.isEditOrder = true;
                }
                else {
                    this.pharmacyService.pharmacyAdviseTrack.inPatientBilling = false;
                    this.pharmacyService.pharmacyAdviseTrack.isEditOrder = false;
                }

            }
            else {
                this.toast.show("Something went wrong,Plese try again", "bg-danger text-white font-weight-bold", 3000);
                this.consolidatedBillSummary = new CartItem();
            }
        }).catch((err) => {
            this.toast.show("Something went wrong,Plese try again", "bg-danger text-white font-weight-bold", 3000);
            console.log(err)

        }).finally(() => {
            this.spinner.stop();
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.pharmacyService.pharmacyAdviseTrack)));
            if (this.consolidatedEdit == false)
                this.consolidatedBillSummary.pharmacyList.length > 0 && this.router.navigate(['/app/pharmacy/inpatientorders/ordersummary']);
            else
                this.consolidatedBillSummary.pharmacyList.length > 0 && this.router.navigate(['/app/pharmacy/inpatientorders/neworder']);

        })


    }


    onViewHistoryClicked(item): void {
        this.orderHistoryTrackList = item.orderHistoryList;
        this.orderHistoryTrackList.forEach((history, index) => {
            history.label = this.getLabel(history)
        });

        if (this.orderHistoryTrackList && this.orderHistoryTrackList.length > 0) {
            (<any>$("#inpateintorderhistory")).modal("show");
        } else {

            this.orderHistorydataMsg = 'History not available';

        }


    }

    getLabel(history) {

        let label = '';
        switch (history.actionPerformed) {
            case PharmacyDeliverTrack.RAISED_ORDER:
                label = `${history.empName} has raised the order`
                break;
            case PharmacyDeliverTrack.MODIFIED_ORDER:
                label = `${history.empName} has modified the order`
                break;
            case PharmacyDeliverTrack.PROCESSED:
                label = `${history.empName} has processed the order`
                break;
            case PharmacyDeliverTrack.COLLECTED_PAYMENT:
                label = `Payment collected by ${history.empName} `
                break;
            case PharmacyDeliverTrack.PAYMENT_INITIATED:
                label = `Payment initiated by ${history.empName} `
                break;
            default:
                break;


        }

        return label;

    }


    ngOnDestroy(): void {



    }
}