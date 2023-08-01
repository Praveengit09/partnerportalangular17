import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BusinessAdminService } from '../../../businessadmin.service';
import { AuthService } from '../../../../auth/auth.service';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { Permissions } from "../../../../constants/auth/permissions";
import { ReportConstants } from '../../../../constants/report/reportconstants';
import { CartItem } from '../../../../model/basket/cartitem';

@Component({
    selector: 'brandDetailedTransaction',
    templateUrl: './brandDetailedTransaction.template.html',
    styleUrls: ['./brandDetailedTransaction.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BrandDetailedTransactionComponent implements OnInit {
    brandDetailedtransaction = new Array<any>();
    errorMessage = new Array<string>();
    message = new Array<string>();
    isDisplay: boolean;
    isDate: boolean;
    isError: boolean;
    showMessage: boolean;
    perPage: number = 10;
    total: number = 0;
    fromIndex: number = 0;
    toIndex: number = 50;
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
    startDate: Date;
    checkEndDate: boolean = false;
    toDate: Date;
    permissionId: number;
    brandList: Array<BrandDetailsWithReferralCode>;
    brandId: number;
    empId: number;
    downloadReport: any;
    columns: any[] = [
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: true
        },
        {
            display: 'Center',
            variable: 'pocName',
            filter: 'text',
            sort: true
        },
        {
            display: 'Revenue',
            variable: 'totalRevenue',
            filter: 'text',
            sort: true
        },
        {
            display: 'Payables',
            variable: 'totalPayables',
            filter: 'indcurrency',
            sort: true
        },
        {
            display: 'Receivables',
            variable: 'totalReceivables',
            filter: 'indcurrency',
            sort: true
        },
        {
            display: 'Per Service',
            variable: 'basketType , totalRevenue',
            filter: 'text',
            sort: true
        },


    ]


    constructor(private spinnerService: SpinnerService, private adminService: BusinessAdminService,
        private authService: AuthService) {
        this.empId = this.authService.userAuth.employeeId;



    }
    ngOnInit() {
        let toDay = new Date()
        let dateOffset = (24 * 60 * 60 * 1000) * 30;
        this.startDate = new Date(toDay.getTime() - dateOffset);
        this.toDate = toDay;
        this.getBrandDetailedTransactionReport();

    }
    onPage(event) {
        this.fromIndex = this.total;
        if (this.fromIndex % this.toIndex == 0) {
            this.getBrandDetailedTransactionReport();
        }

    }
    resetErrorMessage() {
        this.isError = false;
        this.showMessage = false;
        this.message = new Array();
        this.errorMessage = new Array();
    }
    startDateChoosen(event) {
        this.resetErrorMessage();
        if (this.toDate == null && this.startDate == null) {
            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Date";
        }
        else if (this.startDate > this.toDate) {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "End date can not be less than start date";
        }
    }
    endDateChoosen(event) {
        this.resetErrorMessage();
        if (this.toDate == null) {
            if (this.checkEndDate == true) {
                this.errorMessage = new Array();
                this.isDate = true;
                this.isDisplay = true;
                this.message = new Array();
                this.message[0] = "Please Select End Date";
            }

        }

        if (this.startDate > this.toDate) {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "End date can not be less than start date";
        }
    }

    getBrandDetailedTransactionReport() {
        this.spinnerService.start();
        if (this.toDate.toString() == 'Invalid Date' || this.startDate.toString() == 'Invalid Date' || this.toDate == null || this.startDate == null) {

            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Date";
        }
        else if (this.toDate.toString() == 'Invalid Date' || this.toDate == null) {
            if (this.checkEndDate == true) {
                this.errorMessage = new Array();
                this.isDate = true;
                this.isDisplay = true;
                this.message = new Array();
                this.message[0] = "Please Select End Date";
            }

        }
        else if (this.startDate == null || this.startDate.toString() == 'Invalid Date') {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = false;
            this.message = new Array();
            this.message[0] = "Please Select Start Date";
        }
        else if (this.startDate > this.toDate) {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "End date can not be less than start date";
        }
        let reportrequest: ReportRequest = new ReportRequest;
        reportrequest.fromDate = this.startDate.getTime();
        reportrequest.toDate = this.toDate.getTime();
        reportrequest.brandIds = new Array<number>();
        this.authService.employeePocMappingList.forEach(element => {
            reportrequest.brandIds.push(element.brandId);
        });
        console.log("reportrequest" + JSON.stringify(reportrequest))
        this.adminService.getBrandDetailedTransactionReport(reportrequest).then(response => {
            this.spinnerService.stop();
            this.brandDetailedtransaction = response;
            console.log("response" + JSON.stringify(response))
            this.convertIdtoNames();
            if (response.length > 0) {
                this.total = this.brandDetailedtransaction.length;
            }
            else {
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Report Found";
                this.total = this.brandDetailedtransaction.length;
            }
        })
    }
    private convertIdtoNames(): void {
        Array.prototype.forEach.call(this.brandDetailedtransaction, element => {

            element.basketType = ReportConstants.getBasketType(element.basketType);
            element.totalRevenue = element.totalRevenue.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
            });
        });
    }
    getDownloadReport() {
        this.endDateChoosen(event);
        let fromDate, toDate, brandIds, empId;
        this.spinnerService.start();
        fromDate = this.startDate.getTime();
        toDate = this.toDate.getTime();
        brandIds = new Array<number>();
        this.authService.employeePocMappingList.forEach(element => {
            brandIds.push(element.brandId)
        });
        empId = this.empId;
        this.adminService.getDownloadBrandReport(fromDate, toDate, brandIds, empId).then(response => {
            if (response == undefined || response == null || response.length <= 0) {
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
            } else {
                this.downloadReport = response;
                if (response.statusCode == 200) {
                    window.location.href = response.data;
                }
            }
        })
    }
}