import { ViewEncapsulation, OnInit, Component } from '@angular/core';
import { AuthService } from "../../../../auth/auth.service";
import { BusinessAdminService } from '../../../businessadmin.service';

import { ReportRequest } from '../../../../model/report/reportrequest';
import { OrderListRequest } from '../../../../model/basket/orderListRequest';
import { CommonUtil } from '../../../../base/util/common-util';

import { PocCashCollection } from '../../../../model/report/poccashcollection';
import { FinancialTransactionReport } from '../../../../model/report/financialtransactionreport';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { CartItem } from '../../../../model/basket/cartitem';
import { ReportConstants } from '../../../../constants/report/reportconstants';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';

@Component({
  selector: 'accounting',
  templateUrl: './accounting.template.html',
  styleUrls: ['./accounting.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountingComponent implements OnInit {

  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  displayReports: Array<FinancialTransactionReport> = Array<FinancialTransactionReport>();


  currentIndex = -1;

  startDate: Date;
  endDate: Date;
  endingDate: Date;
  status: number = 0;
  errorMessage: Array<string>
  isError: boolean;
  showMessage: boolean;
  message: Array<string>;
  remarks: string = '';
  totalCollectionAmountReset: number = 0;
  isDate: boolean = false;
  isDisplay: boolean = false;
  checkEndDate: boolean = false;
  showMessage1: boolean = false;
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
  pocList: Array<EmployeePocMapping>;
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  selectedPocId: number = 0;
  empId: number;
  dropDownIndex: number = 0
  stateId: number = 0;
  cityId: number = 0;
  pocId: number = 0;
  fromDate: number;
  toDate: number;
  brandId: number;
  financialReportList: FinancialTransactionReport[] = new Array<FinancialTransactionReport>();
  financialBasketRequest: BasketRequest[] = new Array<BasketRequest>();
  detailedAccountSummary: PocCashCollection = new PocCashCollection();
  accountingSummary: PocCashCollection = new PocCashCollection();
  areaId: number = 0;
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];

  accountingReportList: PocCashCollection[] = new Array<PocCashCollection>();

  columns: any[] = [
    {
      display: 'Date',
      variable: 'date',
      filter: 'date',
      sort: true
    },
    {
      display: 'Centre Name',
      variable: 'pocName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Cash Transaction Amount',
      variable: 'cashTransactionAmount',
      filter: 'number',
      sort: true
    },
    {
      display: 'No Of Cash Transactions',
      variable: 'numberOfCashTransactions',
      filter: 'number',
      sort: true
    },
    {
      display: 'Other Transaction Amount',
      variable: 'otherTransactionAmount',
      filter: 'number',
      sort: true
    },
    {
      display: 'No Of Other Transactions ',
      variable: 'numberOfOtherTransactions',
      filter: 'number',
      sort: true
    },
    {
      display: 'Collection Status',
      label: 'Remarks',
      style: 'btn btn-danger mb-xs done_txt',
      filter: 'action',
      type: 'button',
      event: 'remarksButton',
      sort: false,
      variable: 'collectedOrNot',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Mark as Collected',
          style: 'btn btn-danger mb-xs done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Collected',
          style: 'btn mb-xs botton_txtdigo hide_btndigo hide_btn disabled ',

        },
        {
          value: '2',
          condition: 'lte',
          label: 'Partially Collected',
          style: 'btn btn-danger mb-xs  done_txt'
        },
        {
          condition: 'default',
          label: 'Remarks',
          style: 'btn btn-danger mb-xs '
        }
      ]
    },
    {
      display: 'Collected By',
      variable: 'firstName lastName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Collected Amount',
      variable: 'totalCollectedAmount',
      filter: 'number',
      sort: true
    },
    {
      display: 'Comments',
      variable: 'remarks',
      filter: 'text',
      sort: true
    },

    {
      display: 'Transactions',
      label: 'View Transactions',
      filter: 'action',
      event: 'viewTransactionsLink',
      type: 'hyperlink',
      style: 'btn btn-danger mb-xs done_txt',
      sort: false,
      variable: 'collectedOrNot',
      conditions: [
        {
          condition: 'default',
          label: 'View Transactions',
          style: 'btn btn-danger mb-xs  done_txt'
        }
      ]
    },

  ];
  // sorting: any = {
  //   column: 'date',
  //   descending: true
  // };

  perPage: number = 10;
  total: number = 0;

  constructor(
    private adminService: BusinessAdminService,
    private authService: AuthService, private common: CommonUtil
  ) {
    this.empId = this.authService.userAuth.employeeId;
  }

  ngOnInit() {
    this.endDate = new Date(this.common.convertOnlyDateToTimestamp(new Date));
    this.getState();
    this.getPocList(this.empId);
    $("datepickerOptEnd").css("pointer-events", "none");
  }

  getAccountingRecords(stateId: number, cityId: number, areaId: number, from: number): void {
    this.resetErrorMessage();
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
      this.message[0] = "End date can not be less than start date";
    }
    else {
      let reportRequest: OrderListRequest = new OrderListRequest();
      reportRequest.empId = this.empId;

      this.startDate.setHours(0);
      this.startDate.setMinutes(0);
      this.startDate.setSeconds(0);
      reportRequest.fromDate = this.startDate.getTime();
      reportRequest.toDate = this.endingDate.getTime();
      reportRequest.skip = from;
      reportRequest.limit = 50;
      if (this.selectedPocId > 0)
        reportRequest.pocId = this.selectedPocId;
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

      this.adminService.getAccountingReports(reportRequest).then(response => {
        this.total = 0;
        if (from > 0) {
          this.accountingReportList.push.apply(this.accountingReportList, response);
          
          console.log('array' + JSON.stringify(this.accountingReportList));
        } else {
          this.accountingReportList = new Array();
          this.accountingReportList = this.removeDuplicates(response);
        }
        if (response.length > 0) {
          this.total = this.accountingReportList.length;
          console.log('array' + JSON.stringify(this.accountingReportList));
     
        }
        else {
          this.isError = true;
          this.showMessage = true;
          this.message = new Array();
          this.errorMessage = new Array();
          this.accountingReportList.length <= 0 && (this.errorMessage[0] = "No Data Found");
          this.total = this.accountingReportList.length;
        }
      });

    }

  }

  onPage(event): void {
    console.log('Page size is >>' + event);
    // let nextPageRecords = +event * +this.perPage;
    let nextPageRecords =  this.total + 50;
    console.log('From is >>' + nextPageRecords);
    this.getAccountingRecords(this.stateId, this.cityId, this.areaId, nextPageRecords);
  }

  onPOCSelect(pocId: number): void {
    console.log('Selected POC is' + pocId);
    if (pocId == 0) {
      this.resetErrorMessage();
    }
    this.selectedPocId = pocId;
    this.getAccountingRecords(this.stateId, this.cityId, this.areaId, 0);
  }

  getPocList(empId: number): void {
    this.adminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
      if (response && response.length > 0) {
        this.pocList = response;
      }
    })
      .catch(error => {
        console.error('Error occurred while fetching the employee POCs', error);
      });
  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = this.sortLocationResponseList(locationResponse);
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

  resetErrorMessage() {
    this.isError = false;
    this.showMessage = false;
    this.message = new Array();
    this.errorMessage = new Array();
  }
  onStateChange(index: number): void {
    this.resetErrorMessage();
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
    if (index != 0) {
      this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.cityResponse = this.sortLocationResponseList(locationResponse);
        console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
      });
    }
    console.log('index' + this.indexForCity);
    this.getAccountingRecords(this.stateId, this.cityId, this.areaId, 0);
  }

  onCityChange(index: number): void {
    this.resetErrorMessage();

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
    this.getAccountingRecords(this.stateId, this.cityId, this.areaId, 0);
  }

  onLocationChange(index: number): void {
    this.resetErrorMessage();
    this.indexForLoc = 0;
    console.log("locationm");
    this.areaId = (index > 0 ? this.localityResponse[index - 1].id : index);
    this.getAccountingRecords(this.stateId, this.cityId, this.areaId, 0);
  }

  sortLocationResponseList(res: LocationModeResponse[]): LocationModeResponse[] {

    res.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    return res;
  }


  endDateChoosen(event) {
    this.errorMessage = new Array();
    this.isDate = false;
    this.isDisplay = false;
    this.checkEndDate = true;
  }

  startDateChoosen(event) {

  }

  onButtonClicked(accountingSummary: PocCashCollection): void {
    this.accountingSummary = accountingSummary;
    this.dropDownIndex = 0;
    this.remarks = '';
    this.totalCollectionAmountReset = 0;
    this.showMessage1 = false;
    this.isError = false;
    this.errorMessage = new Array<string>();
    if (this.accountingSummary.collectedOrNot != 1)
      (<any>$)("#modal-2").modal("show");
  }

  onRemarkSubmit(totalCollectionAmount: number, remarks: string, status: number) {
    this.status = status;
    this.resetErrorMessage();
    this.isError = false;
    this.showMessage1 = false;
    this.errorMessage = new Array<string>();

    if (!totalCollectionAmount) {

      if (this.status && status != 0) {
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = 'Please Add TotalCollectionAmount';
        this.isError = true;
        this.showMessage1 = true;
      }

    }
    else if (status == 1 && totalCollectionAmount < (this.accountingSummary.cashTransactionAmount - this.accountingSummary.totalCollectedAmount)) {
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'Amount collected and the total amount to be collected do not match';
      this.isError = true;
      this.showMessage1 = true;
      return;
    }
    else if (status == 0 && totalCollectionAmount) {
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'Please change the status';
      this.isError = true;
      this.showMessage1 = true;
      return;
    }
    else if (remarks == undefined || remarks == null || remarks == '') {
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'Please Add Remarks';
      this.isError = true;
      this.showMessage1 = true;
      return;
    }

    else {

      let updateRemarks: PocCashCollection = new PocCashCollection();

      updateRemarks.pocId = this.accountingSummary.pocId;
      updateRemarks.remarks = remarks;
      updateRemarks.empIdCollectedBy = this.accountingSummary.empIdCollectedBy = this.empId;
      updateRemarks.firstName = this.accountingSummary.firstName = this.authService.employeeDetails.firstName;
      updateRemarks.lastName = this.accountingSummary.lastName = this.authService.employeeDetails.lastName;
      updateRemarks.date = this.accountingSummary.date;
      updateRemarks.collectedOrNot = this.accountingSummary.collectedOrNot = +status;
      this.accountingSummary.totalCollectedAmount = this.accountingSummary.totalCollectedAmount + totalCollectionAmount;
      updateRemarks.totalCollectedAmount = totalCollectionAmount;
      this.adminService.updateAccountingRemarks(updateRemarks).then(response => {
        if (response.statusCode == 201 || response.statusCode == 200) {
          this.getAccountingRecords(this.stateId, this.cityId, this.areaId, 0);
        }
      });
      (<any>$)("#modal-2").modal("hide");
      alert('Remarks Added Successfully');
    }
  }



  onHyperLinkClicked(detailedAccountSummary: PocCashCollection) {
    console.log("View Reports");
    this.detailedAccountSummary = detailedAccountSummary;
    this.showMessage = false;
    let reportRequest: ReportRequest = new ReportRequest();
    reportRequest.pocIds = new Array<number>();
    reportRequest.fromDate = reportRequest.toDate = this.detailedAccountSummary.date;

    reportRequest.pocIds.push(this.detailedAccountSummary.pocId);

    let fromDate = new Date(this.detailedAccountSummary.date);
    fromDate.setMinutes(0);
    fromDate.setHours(0);
    fromDate.setMilliseconds(0);

    let toTime = new Date(fromDate.getTime() + (60000 * 60 * 24) - 1);
    this.displayReports = new Array<FinancialTransactionReport>();
    this.financialBasketRequest = new Array<BasketRequest>();
    this.financialReportList = new Array<FinancialTransactionReport>();

    this.adminService.getOrderHistory(fromDate.getTime(), toTime.getTime(), this.detailedAccountSummary.pocId).then(reponse => {
      console.log(reponse);
      this.financialBasketRequest = JSON.parse(JSON.stringify(reponse));
      this.getFinancialReportListFromBasket(this.financialBasketRequest);

      (<any>$)("#myfinancial").modal("show");
    });
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


  getFinancialReportListFromBasket(basketRequest: BasketRequest[]) {
    this.financialReportList = new Array<FinancialTransactionReport>();
    for (let i = 0; i < basketRequest.length; i++) {
      let financialTransactionReport = new FinancialTransactionReport();
      financialTransactionReport.purchaseType = this.getPurchaseTypeFromBasket(basketRequest[i]);
      financialTransactionReport.transactionType = this.getTransactionTypeFromBasket(basketRequest[i]);
      financialTransactionReport.customerName = this.getCustomerNameFromBasket(basketRequest[i]);
      financialTransactionReport.doctorName = this.getDoctorNameFromBasket(basketRequest[i]);
      financialTransactionReport.totalAmount = this.getFinalAmountFromBasket(basketRequest[i]);
      financialTransactionReport.invoiceId = this.getInvoiceIdFromBasket(basketRequest[i]);
      financialTransactionReport.pdf = this.getPDFFromBasket(basketRequest[i]);
      this.financialReportList.push(financialTransactionReport);
      this.financialReportList = this.removeDuplicates(this.financialReportList);
    }
    this.indexOfPage = 1;
    this.displayReports = JSON.parse(JSON.stringify(this.financialReportList.slice(0, this.noOfReportsPerPage)));
  }
  getFinalAmountFromBasket(basketRequest: BasketRequest): number {
    let finalAmount: number;
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {

      if (basketRequest.slotBookingDetailsList[0].payment != null &&
        basketRequest.slotBookingDetailsList[0].payment != undefined &&
        basketRequest.slotBookingDetailsList[0].payment.finalAmount != null &&
        basketRequest.slotBookingDetailsList[0].payment.finalAmount != undefined) {
        finalAmount = basketRequest.slotBookingDetailsList[0].payment.finalAmount;
      }
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].payment != null &&
        basketRequest.cartItemList[0].payment != undefined &&
        basketRequest.cartItemList[0].payment.finalAmount != null &&
        basketRequest.cartItemList[0].payment.finalAmount != undefined) {
        finalAmount = basketRequest.cartItemList[0].payment.finalAmount;
      }
    }
    return finalAmount;
  }
  getCustomerNameFromBasket(basketRequest: BasketRequest): string {
    let title: string = "";
    let firstName: string = "";
    let lastName: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {

      if (basketRequest.slotBookingDetailsList[0].patientProfileDetails != null &&
        basketRequest.slotBookingDetailsList[0].patientProfileDetails != undefined &&
        basketRequest.slotBookingDetailsList[0].patientProfileDetails.fName != null &&
        basketRequest.slotBookingDetailsList[0].patientProfileDetails.fName != undefined &&
        basketRequest.slotBookingDetailsList[0].patientProfileDetails.fName != "") {
        firstName = basketRequest.slotBookingDetailsList[0].patientProfileDetails.fName;
        lastName = basketRequest.slotBookingDetailsList[0].patientProfileDetails.lName ? basketRequest.slotBookingDetailsList[0].patientProfileDetails.lName : '';
        title = basketRequest.slotBookingDetailsList[0].patientProfileDetails.title ? basketRequest.slotBookingDetailsList[0].patientProfileDetails.title : ''
        console.log(firstName + " " + lastName);
      }
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].patientProfileDetails != null &&
        basketRequest.cartItemList[0].patientProfileDetails != undefined &&
        basketRequest.cartItemList[0].patientProfileDetails.fName != null &&
        basketRequest.cartItemList[0].patientProfileDetails.fName != undefined &&
        basketRequest.cartItemList[0].patientProfileDetails.fName != "") {
        firstName = basketRequest.cartItemList[0].patientProfileDetails.fName;
        lastName = basketRequest.cartItemList[0].patientProfileDetails.lName ? basketRequest.cartItemList[0].patientProfileDetails.lName : '';
        title = basketRequest.cartItemList[0].patientProfileDetails.title ? basketRequest.cartItemList[0].patientProfileDetails.title : ''
      }
    }

    return title + ". " + firstName + " " + lastName;
  }
  getInvoiceIdFromBasket(basketRequest: BasketRequest): string {
    let invoiceId: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {
      invoiceId = basketRequest.slotBookingDetailsList[0].invoiceId;
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      invoiceId = basketRequest.cartItemList[0].invoiceId;
    }
    return invoiceId;
  }
  getPDFFromBasket(basketRequest: BasketRequest): string {
    let pdf: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {
      if (basketRequest.slotBookingDetailsList[0].pdfUrlWithHeader != null &&
        basketRequest.slotBookingDetailsList[0].pdfUrlWithHeader != undefined
      ) {

        pdf = basketRequest.slotBookingDetailsList[0].pdfUrlWithHeader;

      }
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].pdfUrlWithHeader != null &&
        basketRequest.cartItemList[0].pdfUrlWithHeader != undefined
      ) {
        pdf = basketRequest.cartItemList[0].pdfUrlWithHeader;

      }
    }
    return pdf;
  }

  getDoctorNameFromBasket(basketRequest: BasketRequest): string {

    let firstName: string = "";
    let lastName: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {

      if (basketRequest.slotBookingDetailsList[0].doctorDetail != null &&
        basketRequest.slotBookingDetailsList[0].doctorDetail != undefined &&
        basketRequest.slotBookingDetailsList[0].doctorDetail.firstName != null &&
        basketRequest.slotBookingDetailsList[0].doctorDetail.firstName != undefined &&
        basketRequest.slotBookingDetailsList[0].doctorDetail.firstName != "") {
        firstName = basketRequest.slotBookingDetailsList[0].doctorDetail.firstName;
        lastName = basketRequest.slotBookingDetailsList[0].doctorDetail.lastName ? basketRequest.slotBookingDetailsList[0].doctorDetail.lastName : '';
        console.log(firstName + " " + lastName);
      }
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].doctorDetail != null &&
        basketRequest.cartItemList[0].doctorDetail != undefined &&
        basketRequest.cartItemList[0].doctorDetail.firstName != null &&
        basketRequest.cartItemList[0].doctorDetail.firstName != undefined &&
        basketRequest.cartItemList[0].doctorDetail.firstName != "") {
        firstName = basketRequest.cartItemList[0].doctorDetail.firstName;
        lastName = basketRequest.cartItemList[0].doctorDetail.lastName ? basketRequest.cartItemList[0].doctorDetail.lastName:'';
      }
    }

    return firstName + " " + lastName;
  }

  getPurchaseTypeFromBasket(basketRequest: BasketRequest): string {
    // CartItem
    let purchaseType: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {
      if (basketRequest.slotBookingDetailsList[0].bookingType != null &&
        basketRequest.slotBookingDetailsList[0].bookingType != undefined) {
        let type = basketRequest.slotBookingDetailsList[0].bookingType;

        purchaseType = SlotBookingDetails.getSlotBookingType(type);
      }
      return purchaseType;
    } else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].cartItemType != null &&
        basketRequest.cartItemList[0].cartItemType != undefined) {
        let type = basketRequest.cartItemList[0].cartItemType;
        purchaseType = CartItem.getcartItemType(type);
      }
      return purchaseType;
    }
    else return purchaseType;
  }

  getTransactionTypeFromBasket(basketRequest: BasketRequest): string {
    let transactionType: string = "";
    if (!this.isSlotBookingDetailsListNull(basketRequest)) {
      if (basketRequest.slotBookingDetailsList[0].payment != null &&
        basketRequest.slotBookingDetailsList[0].payment != undefined &&
        basketRequest.slotBookingDetailsList[0].payment.transactionType != null &&
        basketRequest.slotBookingDetailsList[0].payment.transactionType != undefined) {
        let type = basketRequest.slotBookingDetailsList[0].payment.transactionType;
        transactionType = ReportConstants.getTransactionType(type);
        return transactionType + "";
      }
    }
    else if (!this.isCartItemListNull(basketRequest)) {
      if (basketRequest.cartItemList[0].payment != null &&
        basketRequest.cartItemList[0].payment != undefined &&
        basketRequest.cartItemList[0].payment.transactionType != null &&
        basketRequest.cartItemList[0].payment.transactionType != undefined) {
        let type = basketRequest.cartItemList[0].payment.transactionType;
        transactionType = ReportConstants.getTransactionType(type);

        return transactionType + "";
      }
    }

    return transactionType;
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewTransactionsLink") { // event in cloumn object event {....., event:"editButton"  }
      this.onHyperLinkClicked(e.val);
    } else if (e.event == "remarksButton") { // event in cloumn object event {....., event:"manageButton"  }
      this.onButtonClicked(e.val);
    }
  }

  isSlotBookingDetailsListNull(basketRequest: BasketRequest): boolean {
    if (basketRequest.slotBookingDetailsList == undefined)
      return true;
    else if (basketRequest.slotBookingDetailsList == null) {
      return true
    }
    else if (basketRequest.slotBookingDetailsList.length == 0) {
      return true;
    }
    else if (basketRequest.slotBookingDetailsList[0] == null) {
      return true;
    } else if (basketRequest.slotBookingDetailsList[0] == undefined) {
      return true;
    } else {
      return false;
    }
  }

  isCartItemListNull(basketRequest: BasketRequest): boolean {
    if (basketRequest.cartItemList == undefined)
      return true;
    else if (basketRequest.cartItemList == null) {
      return true
    }
    else if (basketRequest.cartItemList.length == 0) {
      return true;
    }
    else if (basketRequest.cartItemList[0] == null) {
      return true;
    } else if (basketRequest.cartItemList[0] == undefined) {
      return true;
    } else {
      return false;
    }
  }


  validateNumberInputOnly(event) {
    console.log("validateNumberInputOnly: " + event);
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

  openURLInNewTab(url) {
    this.authService.openPDF(url);
  }

  getNameFromUrl(url: string) {
    return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
  }

  changePageIndex(index: number) {
    console.log(index)
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    this.displayReports = JSON.parse(JSON.stringify(
      this.financialReportList.slice(
        (this.indexOfPage - 1) * this.noOfReportsPerPage, this.indexOfPage * this.noOfReportsPerPage
      )));
  }
  
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.financialReportList.length == 0) return Array(1).fill(1);


    return Array(
      Math.ceil(this.financialReportList.length / this.noOfReportsPerPage)
    ).fill(1);
  }
  exlDownload() {
    let reportRequest: OrderListRequest = new OrderListRequest();
    reportRequest.empId = this.empId;

    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.startDate.setSeconds(0);
    reportRequest.fromDate = this.startDate.getTime();
    reportRequest.toDate = this.endingDate.getTime();
    if (this.selectedPocId > 0)
      reportRequest.pocId = this.selectedPocId;
    if (this.stateId > 0) {
      reportRequest.stateId = this.stateId;
      if (this.cityId > 0) {
        reportRequest.cityId = this.cityId;
        if (this.areaId > 0) {
          reportRequest.areaId = this.areaId;
        }
      }
    }
    this.adminService.getCashCollectionDetailsForPocXL(reportRequest).then(response => {
      if (response == undefined || response == null || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.message = new Array();
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
      } else {
        if (response.statusCode == 0) {
          window.location.href = response.data;
        }
      }
    })
  }


}