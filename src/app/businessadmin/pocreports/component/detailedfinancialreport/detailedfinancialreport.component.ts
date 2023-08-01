import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { ReportConstants } from "../../../../constants/report/reportconstants";
import { BusinessAdminService } from '../../../businessadmin.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';


@Component({
  selector: 'detailedfinancialreport',
  templateUrl: './detailedfinancialreport.template.html',
  styleUrls: ['./detailedfinancialreport.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DetailedFinancialReportComponent implements OnInit {
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  todaysDate: number;
  config: any;
  checkEndDate: boolean = false;
  month: any;
  year: any;
  startDate: Date;
  endDate: Date;
  endDatevalue: number;


  financialReportList: ReportResponse[] = new Array<ReportResponse>();
  pocRolesList: Array<PocAdviseData>;
  selectedPOC: PocAdviseData;
  downloadReport: any;

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
  endingDate: Date;
  columns: any[] = [
    {
      display: 'Date',
      variable: 'date',
      filter: 'date',
      sort: true
    },
    {
      display: 'Centre',
      variable: 'pocName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Doctor',
      variable: 'doctorFirstName doctorLastName',
      filter: 'text',
      sort: true
    },
    // {
    //   display: 'Transactions',
    //   variable: 'count',
    //   filter: 'number',
    //   sort: true
    // },
    {
      display: 'Purchase Type',
      variable: 'basketType',
      filter: 'text',
      sort: true
    },
    {
      display: 'Payment Mode',
      variable: 'transactionType',
      filter: 'text',
      sort: true
    },
    {
      display: 'Booking Source',
      variable: 'bookingSource',
      filter: 'text',
      sort: true
    },
    {
      display: 'Revenue Type',
      variable: 'transactionPartnerType',
      filter: 'text',
      sort: true
    },
    {
      display: 'Paid Amount',
      variable: 'finalAmount',
      filter: 'number',
      sort: true
    },
    {
      display: 'Revenue',
      variable: 'totalRevenue',
      filter: 'number',
      sort: true
    },
    {
      display: 'Order Id',
      variable: 'orderId',
      filter: 'text',
      sort: true
    },
    {
      display: 'Invoice Id',
      variable: 'invoiceId referenceId',
      filter: 'text',
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
    }
  ];
  sorting: any = {
    column: 'date',
    descending: true
  };

  perPage: number = 10;
  total: number = 0;

  constructor(config: AppConfig,
    private adminService: BusinessAdminService,
    private authService: AuthService, private common: CommonUtil) {
    this.config = config.getConfig();

  }

  ngOnInit(): void {

    let dateOffset = (24 * 60 * 60 * 1000) * 30;
    this.startDate = new Date();
    this.startDate.setTime(this.startDate.getTime() - dateOffset);
    this.endDate = new Date(this.common.convertOnlyDateToTimestamp(new Date));
    this.getFinancialReportForPoc();
    //this.getDownloadReport();
    this.pocRolesList = this.authService.employeePocMappingList;
    $("datepickerOptEnd").css("pointer-events", "none");
  }

  // startDateChoosen($event): void {


  // }

  endDateChoosen(event) {
    this.errorMessage = new Array();
    this.isDate = false;
    this.isDisplay = false;
    this.checkEndDate = true;
    this.endDatevalue = new Date(this.endingDate).getTime();

    console.log("==========>Date" + JSON.stringify(this.endingDate))
  }

  getFinancialReportForPoc(): void {

    this.todaysDate = new Date().getTime();
    console.log("todaysdate:" + this.todaysDate);
    if (this.endingDate == null && this.startDate == null) {
      this.errorMessage = new Array();
      this.isDate = false;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select Date";
    }
    else if (this.endingDate == null) {
      if (this.checkEndDate == true) {
        this.errorMessage = new Array();
        this.isDate = true;
        this.isDisplay = true;
        this.message = new Array();
        this.message[0] = "Please Select End Date";
      }

    }
    else if (this.startDate == null) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = false;
      this.message = new Array();
      this.message[0] = "Please Select Start Date";
    }
    else if (this.startDate > this.endingDate) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "End date must be greater than start date";
    }

    else {
      this.showMessage = false;
      let reportRequest: ReportRequest = new ReportRequest();
      reportRequest.fromDate = this.startDate.getTime();
      reportRequest.toDate = this.endingDate.getTime();
      //reportRequest.perBookingSource = true;
      if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
        reportRequest.pocIds = new Array<number>();
        reportRequest.pocIds.push(this.selectedPOC.pocId);
      } else {
        reportRequest.pocIds = this.authService.employeeDetails.pocIdList;
      }
      //reportRequest.doctorId = this.authService.userAuth.employeeId;
      this.adminService.getFinancialReport(reportRequest).then(reponse => {
        this.financialReportList = reponse;
        this.convertIdtoNames();
        if (reponse.length > 0) {
          this.total = this.financialReportList.length;
        }
        else {
          this.isError = true;
          this.showMessage = true;
          this.message = new Array();
          this.errorMessage = new Array();
          this.errorMessage[0] = "No Report Found";
          this.total = this.financialReportList.length;
        }
      });
      console.log("=========>" + JSON.stringify(this.financialReportList))
    }

  }

  onPOCSelect(index: number): void {
    console.log('Selected POC is' + index);
    this.showMessage = false;
    if (index >= 0) {
      this.selectedPOC = this.pocRolesList[index];
      let reportRequest: ReportRequest = new ReportRequest();
      reportRequest.fromDate = this.startDate.getTime();
      reportRequest.toDate = this.endingDate.getTime();
      reportRequest.pocIds = new Array<number>();
      //reportRequest.perBookingSource = true;
      reportRequest.pocIds.push(this.pocRolesList[index].pocId);
      this.adminService.getFinancialReport(reportRequest).then(reponse => {
        this.financialReportList = reponse;
        this.convertIdtoNames();
        if (reponse.length > 0) {
          this.total = this.financialReportList.length;
        }
        else {
          this.isError = true;
          this.showMessage = true;
          this.message = new Array();
          this.errorMessage = new Array();
          this.errorMessage[0] = "No Data Found";
          this.total = this.financialReportList.length;
        }
      });
    } else {
      this.selectedPOC = null;
      this.getFinancialReportForPoc();

    }


  }

  private convertIdtoNames(): void {
    Array.prototype.forEach.call(this.financialReportList, element => {
      element.transactionType = ReportConstants.getTransactionType(element.transactionType);
      element.basketType = ReportConstants.getBasketType(element.basketType);
      element.bookingSource = ReportConstants.getBookingSource(element.bookingSource);
      element.transactionPartnerType = ReportConstants.gettransactionPartnerType(element.transactionPartnerType)
    });
  }
  clickEventHandler(e) {
    if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }
  onImageClicked(financialReportList) {
    if (financialReportList.pdfUrl != undefined) {
      this.authService.openPDF(financialReportList.pdfUrl);
    }
    console.log("=========>" + JSON.stringify(financialReportList.pdfUrl))
  }
  getDownloadReport() {
    this.endDateChoosen(event);
    //console.log(JSON.stringify(this.endDatevalue))
    let fromDate, toDate, pocId, empId;
    fromDate = this.startDate.getTime();
    toDate = this.endDatevalue;
    if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
      pocId = new Array<number>();
      pocId.push(this.selectedPOC.pocId);
    } else {
      pocId = this.authService.employeeDetails.pocIdList;
    }
    empId = this.authService.userAuth.employeeId;
    //console.log("===+++[[["+JSON.stringify(pocId))

    this.adminService.getdetailedTransactionReportsXsl(fromDate, toDate, pocId, empId).then(response => {
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
