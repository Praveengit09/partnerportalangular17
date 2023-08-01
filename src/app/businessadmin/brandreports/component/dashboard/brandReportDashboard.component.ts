import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { Permissions } from "../../../../constants/auth/permissions";
import { ReportRequest } from '../../../../model/report/reportrequest';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';

@Component({
  selector: 'brandreportdashboard',
  templateUrl: './brandReportDashboard.template.html',
  styleUrls: ['./brandReportDashboard.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrandReportDashboardComponent implements OnInit {
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;

  isDate1: boolean = false;
  isDisplay1: boolean = false;
  message1: Array<string>;
  errorMessage1: Array<string>;

  userErrorMsg: string = '';
  selectedBrandId: number = 0;
  empId: number;
  brandList: Array<BrandDetailsWithReferralCode>;
  permissionId: number;
  indexBrandId: number = 0;
  startDate: number;
  checkEndDate: boolean = false;
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
  @Input()
  dropDownIndexForPastDate;
  @Input()
  selectDate: any = new Object;
  selectedDates: any = new Object;
  brandId: number;
  brandGraphList: Array<any>;
  totalRevenues: any;
  nvd31Data: any;
  hasBusinessAdminRole: boolean;
  toDate: number;



  constructor(
    private adminService: BusinessAdminService,
    private authService: AuthService, private common: CommonUtil, private spinnerService: SpinnerService
  ) {
    this.empId = this.authService.userAuth.employeeId;
    this.permissionId = Permissions.BrandFinancialReports;
    this.hasBusinessAdminRole = authService.userAuth.hasBusinessAdminRole;
  }

  ngOnInit() {
    let toDay = new Date()
    let dateOffset = (24 * 60 * 60 * 1000) * 30;
    this.getBrandList(this.empId);
    this.selectDate.startDate = new Date(toDay.getTime() - dateOffset);
    this.selectDate.endDate = toDay;
    this.dropDownIndexForPastDate = 1;
    this.getTotalRevenues();

  }
  onBrandSelect(brandId: number): void {
    if (brandId == -1) {
      this.selectedBrandId = brandId;
      this.getTotalRevenues();
      const { startDate, endDate } = this.selectDate;
      let date1 = new Date(startDate),
        date2 = new Date(endDate);
      this.nvd31Data = undefined;
      let request: ReportRequest = new ReportRequest();
      request.fromDate = date1.getTime();
      request.toDate = date2.getTime();
      request.brandIds = new Array<number>();
      request.brandIds.push(this.selectedBrandId);
      request.perPOC = true;
      request.perService = true;
      request.daysInterval = parseInt(this.dropDownIndexForPastDate);
      this.selectedDates = { date1, date2 };
    }

    else {
      this.selectedBrandId = brandId;
      this.getTotalRevenues();
      const { startDate, endDate } = this.selectDate;
      let date1 = new Date(startDate),
        date2 = new Date(endDate);
      this.nvd31Data = undefined;
      let request: ReportRequest = new ReportRequest();
      request.fromDate = date1.getTime();
      request.toDate = date2.getTime();
      request.brandIds = new Array<number>();
      request.brandIds.push(this.selectedBrandId);
      request.perPOC = true;
      request.perService = true;
      request.daysInterval = parseInt(this.dropDownIndexForPastDate);
      this.selectedDates = { date1, date2 };
    }

  }

  getBrandList(empId: number): void {
    this.adminService.getBrandsBasedonPermissionId(empId, this.permissionId).then(response => {
      if (response && response.length > 0) {
        this.brandList = response;
        this.brandList && this.brandList.forEach(ex => {
          this.brandId = ex.brandId;
        })
        console.log("this.brandList" + JSON.stringify(this.brandId))
      }
    })
      .catch(error => {
        console.error('Error occurred while fetching the employee POCs', error);
      });
  }



  startDateChoosen(event) {
    this.getTotalRevenues();
    // this.resetErrorMessage();
    const { startDate, endDate } = this.selectDate;
    let date1 = new Date(startDate),
      date2 = new Date(endDate);
    // this.resetErrorMessage();

    if (this.selectDate.startDate == 'Invalid Date') {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = false;
      this.message = new Array();
      this.message[0] = "Please Select Start Date";
    }
    else if (this.selectDate.startDate > this.selectDate.endDate) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "End date can not be less than start date";
    }

    this.nvd31Data = undefined;
    let request: ReportRequest = new ReportRequest();
    request.fromDate = date1.getTime();
    request.toDate = date2.getTime();
    request.brandIds = new Array<number>();
    if (this.brandId == undefined || this.brandId == null) {
      this.authService.employeePocMappingList.forEach(element => {
        request.brandIds.push(element.brandId);
      });
    }
    else {
      request.brandIds.push(this.brandId);
    }
    request.perPOC = true;
    request.perService = true;
    request.daysInterval = parseInt(this.dropDownIndexForPastDate);
    this.selectedDates = { date1, date2 };

  }
  endDateChoosen(event) {
    this.getTotalRevenues();
    const { startDate, endDate } = this.selectDate;
    let date1 = new Date(startDate),
      date2 = new Date(endDate);
    //this.resetErrorMessage();
    if (this.selectDate.endDate == null) {
      if (this.checkEndDate == true) {
        this.errorMessage = new Array();
        this.isDate = true;
        this.isDisplay = true;
        this.message = new Array();
        this.message[0] = "Please Select End Date";
      }

    }

    else if (this.selectDate.startDate > this.selectDate.endDate) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select End Date";
    }
    this.nvd31Data = undefined;
    let request: ReportRequest = new ReportRequest();
    request.fromDate = date1.getTime();
    request.toDate = date2.getTime();
    request.brandIds = new Array<number>();
    if (this.brandId == undefined || this.brandId == null) {
      this.authService.employeePocMappingList.forEach(element => {
        request.brandIds.push(element.brandId);
      });
    }
    else {
      request.brandIds.push(this.brandId);
    }
    request.perPOC = true;
    request.perService = true;
    request.daysInterval = parseInt(this.dropDownIndexForPastDate);
    this.selectedDates = { date1, date2 };
  }

  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);

  }

  getTotalRevenues() {
    this.spinnerService.start();
    let reportRequest: ReportRequest = new ReportRequest;
    if (this.selectDate.startDate.toString() == 'Invalid Date' || this.selectDate.startDate == null || this.selectDate.startDate == undefined) {
      this.errorMessage1 = new Array();
      this.isDate1 = true;
      this.isDisplay1 = true;
      this.message1 = new Array();
      this.message1[0] = "Please Select Start Date";
    }
    if (this.selectDate.endDate == 'Invalid Date' || this.selectDate.endDate == null || this.selectDate.endDate == undefined) {
      this.errorMessage1 = new Array();
      this.isDate1 = true;
      this.isDisplay1 = true;
      this.message1 = new Array();
      this.message1[0] = "Please Select End Date";
    }
    reportRequest.fromDate = this.selectDate.startDate.getTime();
    reportRequest.toDate = this.selectDate.endDate.getTime();
    reportRequest.brandIds = new Array<number>();

    if (this.selectedBrandId == -1 || this.selectedBrandId == null || this.selectedBrandId == undefined) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select Brand Name";
    }
    else if (this.selectedBrandId == undefined || this.selectedBrandId == null) {
      this.authService.employeePocMappingList.forEach(element => {
        reportRequest.brandIds.push(element.brandId);
      });
    }
    else {
      reportRequest.brandIds.push(this.selectedBrandId);
    }
    console.log("reportRequestre" + JSON.stringify(reportRequest))
    this.adminService.getTotalRevenues(reportRequest).then(response => {
      this.spinnerService.stop();
      this.totalRevenues = response;
      console.log("ooooooooooooooooo" + JSON.stringify(this.totalRevenues))
    })

  }


}