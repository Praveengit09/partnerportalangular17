import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BBCartItem } from '../../../../model/basket/b2bcartitem';
import { PharmacyService } from '../../../pharmacy.service';

@Component({
    selector: 'transfer',
    templateUrl: './transfer.template.html',
    styleUrls: ['./transfer.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class TransferComponent {

    transferList: BBCartItem[] = new Array<BBCartItem>();
    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string> = new Array();

    from: number = 0;
    size: number = 50;
    startDate: Date = new Date();
    endDate: Date = new Date();

    orderId: string = '';
    dataMsg: string = '';
    perPage: number = 10;
    total: number = 0;

    pocName: string = '';
    status: number = -1;
    pocId: number = 0;

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
            variable: 'transferPocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Order Type',
            variable: 'transferType',
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
                    value: '2',
                    condition: 'eq',
                    label: 'Accepted'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Dispatched'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed'
                }, {
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
        }
    ];

    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
      };

    constructor(private pharmacyService: PharmacyService, private auth: AuthService, private commonUtil: CommonUtil,
        private router: Router, private spinnerService: SpinnerService) {
        this.pocId = this.auth.selectedPocDetails.pocId;
        this.onSubmit();
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

    getTransferList() {
        if (this.startDate == null || this.startDate == undefined) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Select Start Date";
            return;
        }
        else if (this.endDate == null || this.endDate == undefined) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Select Start Date";
            return;
        }
        else if (this.startDate > this.endDate) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "End date must be greater than start date";
            return;
        }

        let fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        let toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;

        this.spinnerService.start();
        this.pharmacyService.getTransferPharmaList(this.pocId, fromDate, toDate, this.status, this.from, this.size,
            this.orderId, this.pocName).then(response => {
                this.spinnerService.stop();
                if (response && response.length > 0) {
                    if (this.from == 0)
                        this.transferList = response;
                    else
                        this.transferList.push.apply(this.transferList, response);
                    if (this.transferList.length != this.total) {
                        this.total = this.transferList.length;
                    }
                    this.transferList.forEach(order => {
                        if (this.pocId == order.purchaserPocId) {
                            order.transferPocName = order.pocDetails.pocName;
                            order.transferType = "Receiver";
                        }
                        else {
                            order.transferPocName = order.purchaserPocDetails.pocName
                            order.transferType = "Supplier";
                        }
                    })
                } else {
                    this.transferList = new Array<BBCartItem>();
                    this.total = this.transferList.length;
                    this.dataMsg = 'No data found';
                }
            });

    }

    getRefreshedorderList(): void {
        this.orderId = "";
        this.from = 0;
        this.transferList = new Array<BBCartItem>();
        this.getTransferList();
    }

    onPage(page: number) {
        this.from = this.total;
        this.getTransferList();
    }

    newTransferRequest() {
        this.router.navigate(['app/pharmacy/inventory/transferrequest']);
    }

    clickEventHandler(e) {
        if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        }
    }

    onButtonClicked(order) {
        this.pharmacyService.supplierAdviseTrack = order;
        this.router.navigate(['app/pharmacy/inventory/transferdetails']);
    }

    onSubmit() {
        this.from = 0;
        this.transferList = new Array<BBCartItem>();
        this.total = 0;
        this.from = 0;
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
        this.getTransferList();
    }

}