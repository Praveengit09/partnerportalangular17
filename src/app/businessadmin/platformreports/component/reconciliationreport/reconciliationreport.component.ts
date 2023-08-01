import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ReconciliationSummaryStatement } from '../../../../model/report/reconciliationsummarystatement';
import { AppConfig } from '../../../../app.config';
import { FinancialSummaryReport } from '../../../../model/report/financialsummaryreport';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { ReconciliationReportRequest } from '../../../../model/report/reconciliationreportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DateUtil } from '../../../../base/util/dateutil';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { BusinessAdminService } from '../../../businessadmin.service';
import { Config } from '../../../../base/config';
import { PeriodcFinancialStatement } from '../../../../model/report/periodicfinancialstatement ';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';

@Component({
  selector: 'reconciliationreport',
  templateUrl: './reconciliationreport.template.html',
  styleUrls: ['./reconciliationreport.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReconciliationReportComponent implements OnInit {
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };
  remarks: string;
  dateList: Array<any>;
  startDate: number;
  endDate: number;
  from: number;
  to: number;
  config: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  downloadReport: any;
  //financialReport: FinancialSummaryReport;
  //financialSummary: FinancialSummaryReport = new FinancialSummaryReport();
  //financialSummaryReport: Array<FinancialSummaryReport> = new Array();
  sumOfTotalCashFlow: number = 0;
  sumOfHsCashFlow: number = 0;
  sumOfPayableOrReceiver: number = 0;
  sumOfTotalRevenue: number = 0;
  sumOfHsRevenue: number = 0;

  empId: number;
  stateId: number = 0;
  cityId: number = 0;
  areaId: number = 0;
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  fromIndex: number = 0;
  toIndex: number = 50;
  selectedPOC: PocAdviseData;
  //////////////////reconcillation//////////////
  reconciliationReport: ReconciliationSummaryStatement;
  periodicFinancial: PeriodcFinancialStatement;
  periodicFinancialStatement: Array<PeriodcFinancialStatement> = new Array();
  reconcillationSummary = new Array<any>();
  columns: any[] = [
    {
      display: 'POC',
      variable: 'pocName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Partner Revenue',
      variable: 'totalRevenue',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Revenue',
      variable: 'hsRevenue',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Payable',
      variable: 'totalPayableAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Receivable',
      variable: 'totalReceivableAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Settle Payment',
      variable: 'reconciliationAmount',
      filter: 'indcurrency',
      sort: true
    },
    {
      display: 'Action',
      label: 'VIEW',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'editButton',
      type: 'button',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
    }
  ];
  // sorting: any = {
  //   column: 'invoiceFromDate',
  //   descending: true,
  //   ascending: false,
  // };
  perPage: number = 10;
  total: number = 0;

  environment: string = Config.portal.name || 'MyMedic';

  constructor(config: AppConfig,
    private adminService: BusinessAdminService,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.dateList = DateUtil.getMonthsList((new Date().getFullYear() - 1));
  }

  ngOnInit(): void {


    this.empId = this.authService.userAuth.employeeId;
    this.dateChoosen(0);
    console.log("date" + JSON.stringify(this.dateChoosen))
    this.getState();
  }

  async getPocsReconciliationReport(stateId: number, cityId: number, areaId: number) {
    console.log('reconcialation');
    this.spinnerService.start();
    this.reconciliationReport = new ReconciliationSummaryStatement();
    let reportRequest: ReconciliationReportRequest = new ReconciliationReportRequest();
    reportRequest.employeeId = this.empId;
    reportRequest.fromDate = this.startDate;
    reportRequest.toDate = this.endDate;
    reportRequest.skip = this.fromIndex;
    reportRequest.limit = this.toIndex;
    if (stateId > 0) {
      reportRequest.stateId = stateId;
      if (cityId > 0) {
        reportRequest.cityId = cityId;
        if (areaId > 0) {
          reportRequest.areaId = areaId;
        }
      }
    } else {
      this.resetDropdowns();
    }
    await this.adminService.getReconciliationReports(reportRequest).then(response => {
      this.spinnerService.stop();
      if (!response || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.message = new Array();
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
        this.reconcillationSummary = [];
      } else {
        this.reconciliationReport = response;
        if (this.total > 0) {
          if(this.reconciliationReport.periodicSummaryFinancialStatementList==undefined||this.reconciliationReport.periodicSummaryFinancialStatementList==null){
            this.reconcillationSummary = new Array<any>();
            this.reconcillationSummary.push.apply(this.reconcillationSummary, this.reconciliationReport.periodicSummaryFinancialStatementList)
          }
          else{
            this.reconcillationSummary.push.apply(this.reconcillationSummary, this.reconciliationReport.periodicSummaryFinancialStatementList)
          }
          
          
        } else {
          this.reconcillationSummary = new Array<any>();
          this.reconcillationSummary = this.reconciliationReport.periodicSummaryFinancialStatementList;

        }
        this.total = this.reconcillationSummary.length;
      }
    });


  }
  clickEventHandler(e) {
    if (e.event == "editButton")
      this.settleAmount(e.val);
  }
  onPage(event) {
    this.fromIndex = this.total;
    if (this.fromIndex % this.toIndex == 0) {
      this.getPocsReconciliationReport(0, 0, 0);
    }

  }
  async dateChoosen(index: number) {
    console.log("date");
    this.periodicFinancialStatement = new Array();
    let dateObj = this.dateList[index];
    this.startDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month, dateObj.year);
    this.endDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month + 1, dateObj.year) - 1;
    this.total = this.fromIndex = 0;
    this.reconcillationSummary = [];
    await this.getPocsReconciliationReport(0, 0, 0);
    console.log('reconcialation123' + JSON.stringify(this.reconciliationReport))
  }


  getState(): void {
    // console.log()
    this.stateId = 0;
    this.cityId = 0;
    this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = this.sortLocationResponseList(locationResponse);
      console.log("LocationDetails for State For Login Emp:: " + JSON.stringify(this.stateResponse));
    });
  }

  resetDropdowns() {
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.stateId = 0;
    this.cityId = 0;
    this.areaId = 0;
    this.indexForState = 0;
    this.indexForCity = 0;
    this.indexForLoc = 0;
  }

  onStateChange(index: number): void {
    console.log("atate");
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.cityId = 0;
    this.areaId = 0;
    this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
    this.indexForCity = 0;
    this.indexForLoc = 0;
    //this.total = 0;
    if (index != 0) {
      this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.cityResponse = this.sortLocationResponseList(locationResponse);
        console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
      });
    }
    this.getPocsReconciliationReport(this.stateId, this.cityId, this.areaId);
  }

  onCityChange(index: number): void {
    console.log("city");
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.indexForLoc = 0;
    this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
    this.areaId = 0;
    if (index != 0) {
      this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.localityResponse = this.sortLocationResponseList(locationResponse);
        console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
      });
    }
    this.getPocsReconciliationReport(this.stateId, this.cityId, this.areaId);
  }

  onLocationChange(index: number): void {
    console.log("locationm");
    this.areaId = (index > 0 ? this.localityResponse[index - 1].id : index);
    this.getPocsReconciliationReport(this.stateId, this.cityId, this.areaId);
  }

  sortLocationResponseList(res: LocationModeResponse[]): LocationModeResponse[] {
    res.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    return res;
  }
  /////////////////Reconciliation/////////////////
  settleAmount(item) {
    this.adminService.periodicFinanceAction = this.reconciliationReport;
    this.adminService.selectedFinancePeriodic = item;
    this.adminService.startTime = this.startDate;
    this.adminService.endTime = this.endDate;
    this.router.navigate(['/app/finance/platform/settlepayment']);
    console.log("financiakl" + JSON.stringify(this.adminService.periodicFinanceAction))
  }
  exlDownload() {
    let reportRequest: ReconciliationReportRequest = new ReconciliationReportRequest();
    this.spinnerService.start();
    reportRequest.employeeId = this.empId;
    reportRequest.stateId = this.stateId;
    reportRequest.cityId = this.cityId;
    reportRequest.areaId = this.areaId;
    reportRequest.fromDate = this.startDate;
    reportRequest.toDate = this.endDate;
    reportRequest.skip = this.fromIndex;
    reportRequest.limit = this.toIndex;
    this.adminService.getReconcilationSummaryReport(reportRequest).then(response => {
      this.spinnerService.stop();
      if (response == undefined || response == null || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.message = new Array();
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
      } else {
        this.reconciliationReport = response;
        if (response.statusCode == 0) {
          window.location.href = response.data;
        }
      }


    });
  }
}
