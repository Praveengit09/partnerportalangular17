import { AuthService } from '../../../../auth/auth.service';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { Component, OnInit } from '@angular/core';
import { TransferPriceRevenueStatement } from '../../../../model/report/TransferPriceRevenueStatement';
import { BusinessAdminService } from '../../../businessadmin.service';

@Component({
    selector: 'poctransferprice',
    templateUrl: './poctransferprice.template.html',
    styleUrls: ['./poctransferprice.style.scss']
})
export class PocTransferPriceComponent implements OnInit {

    size: number = 100;
    from: number = 0;

    transferPriceRevenueList: TransferPriceRevenueStatement[] = null;

    startDate = null;
    endingDate = null;
    datepickerOpts = {
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    datepickerOptEnd = {
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy',

    };

    columns: any[] = [
        {
            display: 'CENTRE',
            variable: 'pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Invoice Id',
            variable: 'invoiceId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Order Id',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: true
        },
        {
            display: 'Service Details',
            variable: 'serviceName actualPrice transferPrice hsRevenue pocRevenue',
            filter: 'multiLine',
            style: "multiLine",
            nameList: 'Service_Name Actual_Price Transfer_Price HS_Revenue POC_Revenue',
            isMultiRow: true,
            mainVar: 'serviceList',
            sort: false
        },
        {
            display: 'Transfer Price',
            variable: 'totalTransferPrice',
            filter: 'number',
            sort: false
        },
        {
            display: 'HS Revenue',
            variable: 'totalHsRevenue',
            filter: 'number',
            sort: false
        },
        {
            display: 'POC Revenue',
            variable: 'totalPocRevenue',
            filter: 'number',
            sort: false
        }
    ];

    sorting: any = {
        column: 'date',
        descending: true
    };
    perPage: number = 10;
    total: number = 0;


    pocRolesList: Array<PocAdviseData>;
    showMessage: boolean;
    selectedPOC: PocAdviseData;
    financialReportList: any;
    isError: boolean;
    errorMessage: any[];
    message: any[];
    isDate: boolean = false;
    isDisplay: boolean = false;


    constructor(private adminService: BusinessAdminService,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.pocRolesList = this.authService.employeePocMappingList;
        // this.getPocTranferRevenue();
    }

    dateChoosen(event) {
        this.isDate = false;
        this.isDisplay = false;    
        console.log("==========>Date" + JSON.stringify(this.endingDate))
      }


    getPocTranferRevenue() {
        if (!this.endingDate && !this.startDate) {
            this.message = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message[0] = "Please Select Start and End Date";
        }
        else if (!this.endingDate) {

            this.message = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message[0] = "Please Select End Date";

        }
        else if (!this.startDate) {
            this.message = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message[0] = "Please Select Start Date";
        }
        else if (this.startDate > this.endingDate) {
            this.message = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message[0] = "End date must be greater than start date";
        }
        else {
            let pocidList = this.pocRolesList.map((poc) => poc.pocId);
            if (this.selectedPOC && this.selectedPOC.pocId) {
                pocidList = [this.selectedPOC.pocId];
            }
            let startDate = new Date(this.startDate).getTime();
            let endingDate = new Date(this.endingDate).getTime();
            this.transferPriceRevenueList = [];
            this.adminService.getPocTransferPriceRevenueList(pocidList, startDate, endingDate, this.from, this.size).then(res => {
                this.transferPriceRevenueList = res;
                this.total = this.transferPriceRevenueList.length;
                console.log("getPocTranferRevenue :- ", this.transferPriceRevenueList)
            });
        }
    }

    onPOCSelect(index: number): void {
        console.log('Selected POC is' + index);
        this.showMessage = false;
        if (index >= 0) {
            this.selectedPOC = this.pocRolesList[index];
            let pocIdList: number[] = [this.selectedPOC.pocId];
            let startDate = this.startDate.getTime();
            let endDate = this.endingDate.getTime();
            this.adminService.getPocTransferPriceRevenueList(pocIdList, startDate, endDate, this.from, this.size).then(res => {
                this.transferPriceRevenueList = res;
                this.total = this.transferPriceRevenueList.length;
            }
            )
        } else {
            this.selectedPOC = null;
            this.getPocTranferRevenue();
        }
    }

    onPage(page: number) {
        //this.getpharmacyAdvisesForPoc(this.total, '', '');
    }

}