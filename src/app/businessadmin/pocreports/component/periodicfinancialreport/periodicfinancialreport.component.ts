import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AdminService } from '../../../../admin/admin.service';
import { Router } from '@angular/router';
import { InvoiceTypeEnum, InvoiceTypeConstant } from '../../../../constants/report/invoicetypeconstants';
import { POCInvoiceSummary } from '../../../../model/report/pocInvoiceSummary';
import { Component, ViewEncapsulation, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { FinancialSummaryReport } from '../../../../model/report/financialsummaryreport';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DateUtil } from '../../../../base/util/dateutil';
import { BusinessAdminService } from '../../../businessadmin.service';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';

@Component({
  selector: 'periodicfinancialreport',
  templateUrl: './periodicfinancialreport.template.html',
  styleUrls: ['./periodicfinancialreport.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PeriodicFinancialReportComponent implements OnInit {
  // @Input() pageSizeOptions = [5, 10, 25, 100];
  // @Input() perPage: number = 10;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  isShow: boolean = false;
  config: any;
  invoiceTypeEnum = InvoiceTypeEnum;
  pocIds: number;
  pocID: number;
  //financialSummaryReport: FinancialSummaryReport;
  pocInvoiceSummary: POCInvoiceSummary = new POCInvoiceSummary();
  //pocInvoiceSummary:Array<POCInvoiceSummary>;
  pocRolesList: Array<PocAdviseData>;
  selectedPOC: PocAdviseData;
  dateList: Array<any>;
  startDate: number;
  endDate: number;
  setDateIndex: any = 0;
  invoiceReport: any = new Array<any>();
  downloadReport: any;
  fromIndex: number = 0;
  toIndex: number = 50;
  columns: any[] = [
    {
      display: 'From',
      variable: 'invoiceFromDate',
      filter: 'date',
      sort: true
    },
    {
      display: 'To',
      variable: 'invoiceToDate',
      filter: 'date',
      sort: true
    },
    {
      display: 'PocName',
      variable: 'pocName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Revenues',
      variable: 'totalRevenue',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Payables',
      variable: 'totalPayableAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Receivables',
      variable: 'totalReceivableAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Settled Amount',
      variable: 'reconciledAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Pending Payment',
      variable: 'reconciliationPendingAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Type',
      variable: 'invoiceType',
      filter: 'number',
      sort: true
    },
    {
      display: 'Invoice',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: '',
      // style: 'orderId_txt',
      conditions: [
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_read.png',
        }
      ]
    },
    {
      display: 'View',
      label: 'VIEW',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'editButton',
      type: 'button',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
    }
  ];
  sorting: any = {
    column: 'invoiceFromDate',
    descending: true,
    ascending: false,
  };
  perPage: number = 10;
  total: number = 0;


  constructor(config: AppConfig,
    private adminService: BusinessAdminService,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.dateList = new Array();
    //this.dateList.push(DateUtil.getMonthsList((new Date().getFullYear() - 1)));
    this.dateList = DateUtil.getMonthsList((new Date().getFullYear() - 1));
    this.invoiceTypeEnum = InvoiceTypeEnum;
  }

  ngOnInit(): void {
    this.pocRolesList = this.authService.employeePocMappingList;
    console.log("55555555555=>" + JSON.stringify(this.pocRolesList))
    // this.pocRolesList = this.authService.employeePocMappingList;
    // console.log('this.pocRolesList' + JSON.stringify(this.pocRolesList));
    var index: any;
    if (this.adminService.setDate != undefined) {
      index = this.setDateIndex = this.adminService.setDate;
      this.dateChoosen(this.setDateIndex);
    }
    this.dateChoosen(index ? this.setDateIndex : 0);
    this.getFinancialReportForPoc();

    // console.log('@@@setdate'+this.setDate);
    console.log("data123" + JSON.stringify(this.dateChoosen[0]));
    console.log("data1" + JSON.stringify(this.pocInvoiceSummary))
    
  }

  private convertIdtoNames(): void {
    this.invoiceReport && this.invoiceReport.forEach(element => {
      element.invoiceType = InvoiceTypeConstant.getInvoiveType(element.invoiceType);
    });
  }
  onPage(event): void {
    //this.fromIndex = +event * +this.perPage;
    console.log('From is >>' + JSON.stringify(this.total));

    this.fromIndex = this.total;
    if (this.fromIndex % this.toIndex == 0) { this.getFinancialReportForPoc(); }


  }
  removeDuplicates(arr: any): any {

    const result = [];
    const duplicatesIndices = [];

    // Loop through each item in the original array
    arr.forEach((current, index) => {

      if (duplicatesIndices.includes(index)) return;

      result.push(current);

      // Loop through each other item on array after the current one
      for (let comparisonIndex = index + 1; comparisonIndex < arr.length; comparisonIndex++) {

        const comparison = arr[comparisonIndex];
        const currentKeys = Object.keys(current);
        const comparisonKeys = Object.keys(comparison);

        // Check number of keys in objects
        if (currentKeys.length !== comparisonKeys.length) continue;
        const currentKeysString = currentKeys.sort().join("").toLowerCase();
        const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();
        if (currentKeysString !== comparisonKeysString) continue;

        // Check values
        let valuesEqual = true;
        for (let i = 0; i < currentKeys.length; i++) {
          const key = currentKeys[i];
          if (current[key] !== comparison[key]) {
            valuesEqual = false;
            break;
          }
        }
        if (valuesEqual) duplicatesIndices.push(comparisonIndex);

      } // end for loop

    }); // end arr.forEach()

    return result;
  }

  async getFinancialReportForPoc() {
    console.log('totalcheck' + this.fromIndex)
    this.spinnerService.start();
    this.showMessage = false;
    this.pocInvoiceSummary = new POCInvoiceSummary();
    let reportRequest: ReportRequest = new ReportRequest();
    reportRequest.fromDate = this.startDate;
    reportRequest.toDate = this.endDate;
    reportRequest.skip = this.fromIndex;
    reportRequest.limit = this.toIndex;
    reportRequest.pocIds = new Array<number>();
    console.log("gjjkk" + JSON.stringify(reportRequest.skip))
    if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
      reportRequest.pocIds.push(this.selectedPOC.pocId);
    } else {
      reportRequest.pocIds = this.authService.employeeDetails.pocIdList;
    }

    await this.adminService.getFinancialSummaryReport(reportRequest).then(response => {
      this.spinnerService.stop();

      if (response.periodicFinancialStatementList == undefined || response.periodicFinancialStatementList == null || response.periodicFinancialStatementList.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.message = new Array();
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
        this.invoiceReport = new Array<any>();
        this.pocInvoiceSummary = new POCInvoiceSummary();
      } else {
        this.pocInvoiceSummary = response;
        
        if (this.total > 0) {
          this.invoiceReport.push.apply(this.invoiceReport, this.pocInvoiceSummary.periodicFinancialStatementList);

        } else {
          this.invoiceReport = new Array<any>();
          this.invoiceReport = this.pocInvoiceSummary.periodicFinancialStatementList;
          console.log("bye" + JSON.stringify(this.invoiceReport))

        }
        //this.total = this.invoiceReport.length;
        this.convertIdtoNames();
        console.log("dsdsd==>" + JSON.stringify(this.total))

      }
    });
  }

  async onPOCSelect(index: number) {
    console.log('Selected POC is' + index);
    this.showMessage = false;
    this.invoiceReport = new Array<any>();
    this.total = this.fromIndex = this.invoiceReport.length;
    if (index >= 0) {
      this.selectedPOC = this.pocRolesList[index];
    }
    await this.getFinancialReportForPoc();
  }

  async dateChoosen(index: number) {
    this.spinnerService.start();
    let dateObj = this.dateList[index];

    console.log("data" + JSON.stringify(this.dateList[index]));
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var now = new Date();//MM/DAY/YEAR
    var currentMonth = months[now.getMonth()] + ' ' + now.getFullYear();
    var validate = (dateObj.displayDate).localeCompare(currentMonth);

    this.startDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month, dateObj.year);
    this.endDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month + 1, dateObj.year) - 1;
    this.invoiceReport = new Array<any>();
    this.total = this.fromIndex = 0;
    console.log('totalcheck' + this.fromIndex);
    await this.getFinancialReportForPoc();
    this.adminService.setDate = index;
    //console.log(this.getFinancialReportForPoc)
  }
  clickEventHandler(e) {
    if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
    if (e.event == 'editButton') {
      this.actionButton(e.val);
    }
  }
  onImageClicked(invoiceReport) {
    if (invoiceReport.pdfUrl != undefined) {
      this.authService.openPDF(invoiceReport.pdfUrl);
    }
  }
  actionButton(item) {
    this.adminService.periodicFinanceAction = this.pocInvoiceSummary;
    this.adminService.selectedFinancePeriodic = item;
    this.router.navigate(['/app/finance/poc/periodicdetails']);
    console.log("financiakl" + JSON.stringify(item))
  }
  exlDownload() {
    let pocId, fromDate, toDate;
    fromDate = this.startDate,
      toDate = this.endDate,
      pocId = new Array<number>();
    if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
      pocId = new Array<number>();
      pocId.push(this.selectedPOC.pocId);
    } else {
      pocId = this.authService.employeeDetails.pocIdList;
    }
    this.adminService.getmonthlyTransactionReportsXsl(pocId, fromDate, toDate).then(response => {
      if (response == undefined || response == null || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.message = new Array();
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
      } else {
        this.downloadReport = response;
        console.log("download" + JSON.stringify(this.downloadReport))
        if (response.statusCode == 200) {
          window.location.href = response.data;
        }
      }
    })

  }
}
