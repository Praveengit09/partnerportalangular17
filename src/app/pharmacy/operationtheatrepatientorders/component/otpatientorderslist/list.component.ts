import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../../../model/basket/cartitem';
import { InpatientOrdersService } from '../../inpatientorders.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../auth/auth.service';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { PharmacyService } from '../../../pharmacy.service';
import { OtPatientOrdersService } from '../../otpatientorders.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { NGTableComponent } from '../../../../layout/widget/ngtable/ngtable.component';
import { PharmacyDeliverTrack } from '../../../../model/pharmacy/pharmacydeliverytrack';
import { PharmacyOrderHistory } from '../../../../model/pharmacy/pharmacyOrderHistory';

@Component({
    selector: 'otpatientbilling',
    templateUrl: './list.template.html',
    styleUrls: ['./list.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class OtPatientatientBillingComponent implements OnInit {

    pageEvent: any;
    selectedList = new Array<CartItem>();
    otPatientOrdersList = new Array<CartItem>();
    selectedRows: any;

    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;

    searchCriteria: string = 'orderId';
    defaultDate: number = 0;
    pdfHeaderType: number;
    defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria."
    total: number = 0;
    status: number = -1;
    orderId = '';
    mobileNo = '';
    filterStatus = -1;
    dataMsg = '';
    perPage: number = 10;
    isMobileNoSearch: boolean = false;
    consolidatedBillSummary: CartItem = new CartItem();
    startDate;
    endDate;
    hasSearchParam: boolean = false;
    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };
    searchTerm: string = '';

    orderHistorydataMsg: string = "";
    orderHistoryTrackList = new Array<PharmacyOrderHistory>();

    @ViewChild(NGTableComponent, { static: false }) private otPatientNgTable: NGTableComponent;

    columns: any[] = [
        {
            display: '#',
            filter: 'index',
            type: 'index',
            sort: false
        },
        // {
        //     display: 'BillNo',
        //     variable: 'billNo',
        //     filter: 'text',
        //     sort: false
        // },
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
            variable: 'invoiceCompletionStatus',
            filter: 'text',
            sort: true,
            conditions: [
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed'
                },
                {
                    value: '0',
                    condition: 'lte',
                    label: 'Pending'
                },
                {

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
            variable: 'invoiceCompletionStatus',
            conditions: [
                {
                    value: '5',
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
        private router: Router, private otPatientOrdersService: OtPatientOrdersService, private spinner: SpinnerService,
        private auth: AuthService, private toast: ToasterService, private pharmacyService: PharmacyService, private commonUtil: CommonUtil
    ) {
        this.selectedRows = [];
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;

    }

    ngOnInit() {
        this.total = 0;
        this.otPatientOrdersList = new Array<CartItem>();

        this.fetchOtPatientOrdersList();
        this.selectedRows = [];
        this.selectedList = new Array<CartItem>();
        this.otPatientOrdersService.selectedOtpatientOrdersBillNoList = new Array();
        this.otPatientOrdersService.otPatientAdviceDetails = new CartItem();
        this.otPatientOrdersService.otPatientAdviceDetailsForEdit = new CartItem();
        this.otPatientOrdersService.isEditOrder = false;
        this.otPatientOrdersService.isMultipleOrdersEdit = false;
        localStorage.removeItem("otPatientAdviceDetailsForEdit");
        localStorage.removeItem("selectedOtpatientOrdersBillNoList");
        localStorage.removeItem("otPatientAdviceDetails");

    }




    async fetchOtPatientOrdersList() {
        let email: string, startDate, endDate, from: number, size: number;

        this.startDate ? startDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate) : startDate = 0;
        this.endDate ? endDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000 : endDate = 0;

        if (this.mobileNo.length == 10 || this.filterStatus != -1 || startDate != 0 || endDate != 0) {
            this.hasSearchParam = true
        }
        else {
            this.hasSearchParam = false;
        }
        this.spinner.start();
        await this.otPatientOrdersService.getotPatientOrdersList(this.auth.userAuth.pocId, this.mobileNo, '', startDate, endDate, this.total, 50, this.filterStatus).then((ordersList) => {
            if (ordersList.length > 0) {
                if (this.otPatientOrdersList.length == 0) {
                    this.otPatientOrdersList = ordersList;
                }
                else if (this.otPatientOrdersList.length > 0) {
                    this.otPatientOrdersList.push.apply(ordersList);
                }
                this.total = this.otPatientOrdersList.length;
            }
            else {
                if (this.total == 0)
                    this.dataMsg = this.defaultMsgForNoMacthingRecord;
            }

        }).catch((err) => {
            console.log(err);
        }).finally(() => {

            if (this.otPatientOrdersList.length > 0) {
                this.otPatientOrdersList.forEach((element, index) => {
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
        this.selectedRows = [];
        this.selectedList = new Array<CartItem>();
        this.filterStatus = -1;
        this.hasSearchParam = false;
        this.mobileNo = this.searchTerm = '';
        this.resetAndGetOrdersList();
    }

    resetAndGetOrdersList() {
        this.total = 0;
        this.otPatientOrdersList = new Array<CartItem>();
        this.selectedRows = [];
        this.selectedList = new Array<CartItem>();
        this.perPage = 10;
        this.fetchOtPatientOrdersList();

    }


    onPage(page: number) {

        this.fetchOtPatientOrdersList();
    }

    onEnterPressed(e) {
        e.preventDefault();
        this.searchTerm = e.target.value;
        if (e.keyCode == 13) {
            this.getOtPatientOrdersBasedOnPhnNoId();
        }
    }

    validateNumberInputOnly(event) {

        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    getOtPatientOrdersBasedOnPhnNoId(): void {
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

    getOtPatientOrdersBasedOnPaymentStatus(status) {

        this.filterStatus = status;
        this.resetAndGetOrdersList();
    }

    startDateChoosen(startDate) {
        this.startDate = startDate;
    }

    endDateChoosen(endDate) {
        console.log('enddate', endDate);
        this.endDate = endDate;
    }


    getOtPatientOrderListBasedOnDate() {
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

        localStorage.removeItem("otPatientAdviceDetailsForEdit");
        this.otPatientOrdersService.otPatientAdviceDetailsForEdit = undefined;
        this.router.navigate(['/app/pharmacy/otpatientorders/neworder']);

    }


    // clickEventHandler(e) {
    //     console.log("VEvent: " + e.event);

    //     if (e.event == 'onChecked') {
    //         console.log("Value: " + JSON.stringify(e.val));
    //         const hasSinglePatientOrders = this.checkSelectedList(e.val);
    //         if (hasSinglePatientOrders == true) {
    //             this.selectedList = e.val;

    //         }
    //         else {
    //             this.selectedRows = [];

    //             this.selectedList = new Array<CartItem>();
    //             this.toast.show("Please select orders of a single patient", "bg-danger text-white font-weight-bold", 3000);
    //             return;
    //         }

    //     }
    //     else if (e.event == 'pdfButton') {
    //         this.onImageClicked(e.val);
    //     }
    //     else if (e.event == "viewButton") {
    //         this.onButtonClicked(e.val);
    //     }
    // }

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

                        hasPaidOrders = false;
                        hasSinglePatientOrders == true
                        this.toast.show("Please select non-paid order", "bg-danger text-white font-weight-bold", 1000);
                        list = [];
                        this.selectedList = new Array<CartItem>();
                        this.otPatientNgTable.clearSelectedRows();

                        return;
                    } else if (hasSinglePatientOrders == false && hasPaidOrders == false) {

                        this.toast.show("Please select orders of a single patient", "bg-danger text-white font-weight-bold", 3000);
                        this.selectedRows = [];
                        list = [];
                        this.selectedList = new Array<CartItem>();
                        this.otPatientNgTable.clearSelectedRows();
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
            if (element.invoiceCompletionStatus == 5 || element.orderId) {
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
        this.otPatientOrdersService.otPatientAdviceDetails = pharmacyAdvise
        if (pharmacyAdvise.invoiceCompletionStatus !== 5)
            this.router.navigate(['/app/pharmacy/otpatientorders/ordersummary']);

    }

    checkSelectedList(list) {//checking whether the selected list has orders of single patient
        let hasSinglePatientOrders = false;
        list.forEach(element => {
            if (element.patientProfileId === list[0].patientProfileId) {
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
        if (pharmacyAdvise.invoiceCompletionStatus == 5) {
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
        let billNoList = this.selectedList.map((list) => { return list.billNo });
        if (this.selectedList.length > 0) {
            if (type == 'edit') {
                this.otPatientOrdersService.isEditOrder = true;
                this.otPatientOrdersService.isMultipleOrdersEdit = true;
                this.getConsolidatedSummaryOfOtpatientOrders(billNoList);

            }
            else {

                this.otPatientOrdersService.selectedOtpatientOrdersBillNoList = [...billNoList];
                this.otPatientOrdersService.isEditOrder = false;
                this.otPatientOrdersService.isMultipleOrdersEdit = true;
                this.router.navigate(['/app/pharmacy/otpatientorders/ordersummary']);
            }



        }

    }



    async getConsolidatedSummaryOfOtpatientOrders(billNoList) {
        this.spinner.start();
        await this.otPatientOrdersService.getOtPatientConsolidatedBillDetails(billNoList).then((billSummary) => {
            console.log('billsummary', JSON.stringify(billSummary));
            if (billSummary != null && billSummary != undefined && JSON.stringify(billSummary) != '{}') {
                this.consolidatedBillSummary = { ...billSummary };

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
            // this.otPatientOrdersService.isMultipleOrdersEdit = false;
            this.otPatientOrdersService.otPatientAdviceDetailsForEdit = this.consolidatedBillSummary;
            this.otPatientOrdersService.otPatientAdviceDetailsForEdit && this.router.navigate(['/app/pharmacy/otpatientorders/neworder']);

        })


    }

    onViewHistoryClicked(item): void {
        this.orderHistoryTrackList = item.orderHistoryList;
        this.orderHistoryTrackList = this.orderHistoryTrackList.filter((item) => {
            return item != null && item != undefined;
        })
        this.orderHistoryTrackList.forEach((history, index) => {
            history.label = this.getLabel(history)
        });

        if (this.orderHistoryTrackList && this.orderHistoryTrackList.length > 0) {
            (<any>$("#otpateintorderhistory")).modal("show");
        } else {
            (<any>$("#otpateintorderhistory")).modal("show");

            this.orderHistorydataMsg = 'History not available';

        }


    }

    getLabel(history) {
        console.log('history', JSON.stringify(history));
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
            default:
                break;


        }

        return label;

    }



    ngOnDestroy(): void {
        // localStorage.removeItem("otPatientAdviceDetailsForEdit");
        // this.otPatientOrdersService.otPatientAdviceDetailsForEdit = undefined;

    }
}