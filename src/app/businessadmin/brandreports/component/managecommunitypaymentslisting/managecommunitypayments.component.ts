import { ViewEncapsulation, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';
import { BulkPackage } from '../../../../model/package/bulkPackage';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { BusinessAdminService } from '../../../businessadmin.service';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FileUtil } from '../../../../base/util/file-util';

@Component({
  selector: 'managecommunitypaymentslisting',
  templateUrl: './managecommunitypayments.template.html',
  styleUrls: ['./managecommunitypayments.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class ManageCommunityPaymentsComponent implements OnInit {

  config: any;
  month: any;
  year: any;
  startDate: Date;
  endDate: Date;
  endingDate: Date;
  empId: number;
  checkDate: boolean = false;
  isDate: boolean = false;
  isDisplay: boolean = false;
  checkEndDate: boolean = false;
  pocList: Array<EmployeePocMapping> = new Array<EmployeePocMapping>();
  fileUploadData: string;
  uploadFilesList: any;
  hasCheckBoxValidation: boolean = false;
  checkBoxValidationMessage: string;
  errorMessage: Array<string>;
  errorMessage1: Array<string>;
  message: Array<string>;
  isError: boolean;
  selectedPackageDetails: BulkPackage;
  showMessage: boolean;
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  stateId: number = 0;
  cityId: number = 0;
  pocId: number = 0;
  areaId: number = 0;
  selectedOrders: number[] = new Array<number>();
  selectedPocId: number = 0;
  url: string;
  pdfHeaderType: number;
  managePaymentExcelResponse: BulkPackage = new BulkPackage();
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];
  managepaymentsList: BulkPackage[] = new Array<BulkPackage>();
  restoreCommunityPayments: BulkPackage = new BulkPackage();
  paymentIndexFrom: number = 0;
  paymentIndexSize: number = 50;

  @ViewChild('managePaymentsFileUpload', { static: false })
  displayedColumns = new Array();
  // , 'view'
  dataSource: MatTableDataSource<BulkPackage>;


  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) matSort: MatSort;
  pageSizeOptions = [5, 10, 20, 50];
  pageEvent: any;
  perPage: number = 10;

  myInputVariable: any;
  date = new Date();

  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    endDate: this.addDays(new Date(), 1),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',

  };
  columns: any[] = [
    //   {
    //   display: '#',
    //   filter: 'index',
    //   type: 'index',
    //   sort: false
    // },
    {
      display: 'Community',
      variable: 'pocDetails.pocName \n pocDetails.address.address1 \n pocDetails.address.pinCode',
      filter: 'text',
      sort: false
    },
    {
      display: 'Managed by',
      variable: 'fName lName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Package Name',
      variable: 'packageName',
      filter: 'text',
      sort: false
    }, {
      display: 'From Date',
      variable: 'fromDate',
      filter: 'date',
      sort: false
    }, {
      display: 'To Date',
      variable: 'toDate',
      filter: 'date',
      sort: false
    }, {
      display: 'Phone',
      variable: 'mobile',
      filter: 'text',
      sort: false
    }, {
      display: 'Payment Status',
      variable: 'paymentStatus',
      filter: 'text',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Paid',
        },
        {
          value: '0',
          condition: 'eq',
          label: 'Pending',
        }
      ],
      sort: false
    }, {
      display: 'Amount',
      variable: 'amount',
      filter: "currency",
      sort: false
    }, {
      display: 'Invoice',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: 'pdfUrlWithHeader',
      conditions: [
        {
          value: '',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_read.png',
        }
      ]
    }, {
      display: '',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
    },
  ];

  constructor(private authService: AuthService, private router: Router,
    private businessAdminService: BusinessAdminService, private common: CommonUtil,
    private spinnerService: SpinnerService, private fileUtil: FileUtil) {
    this.empId = this.authService.userAuth.employeeId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
  }

  ngOnInit() {
    // this.checkEndDate1 = false;
    this.endDate = new Date(this.common.convertOnlyDateToTimestamp(new Date));
    this.getPocList(this.empId);
    this.getState();
    $("datepickerOptEnd").css("pointer-events", "none");
    this.dataSource = new MatTableDataSource(this.managepaymentsList);
    this.displayedColumns = ['checkbox', 'Community', 'Managed_by', 'Package_Name',
      'From_Date', 'To_Date', 'Phone', 'Payment_Status', 'Amount', 'Invoice', 'view'];

    if (this.businessAdminService.restoreData == true) {
      if (this.businessAdminService.restoreCommunityPaymentsTrack != undefined || this.businessAdminService.restoreCommunityPaymentsTrack != null) {
        this.restoreCommunityPayments = this.businessAdminService.restoreCommunityPaymentsTrack;
        this.startDate = new Date(this.restoreCommunityPayments.fromDate);
        this.endingDate = new Date(this.restoreCommunityPayments.toDate);
        this.startDateChoosen(this.startDate);
        this.endDateChoosen(this.endingDate);
        this.pocId = this.restoreCommunityPayments.pocId ? this.restoreCommunityPayments.pocId : 0;
        this.onPOCSelect(this.pocId);
        if (this.restoreCommunityPayments.stateId > 0) {
          this.indexForState = this.restoreCommunityPayments.stateId;
          this.onStateChange(this.indexForState);
          if (this.restoreCommunityPayments.cityId > 0) {
            this.indexForCity = this.restoreCommunityPayments.cityId;
            this.onCityChange(this.indexForCity);
            if (this.restoreCommunityPayments.areaId > 0) {
              this.indexForLoc = this.restoreCommunityPayments.areaId;
              this.onLocationChange(this.indexForLoc);
            }
          }

        }
      }
    }

  }
  clickEventHandler(e) {
    if (e.event == 'pdfButton') {
      this.invoiceClick(e.val)
    }
    else if (e.event == 'viewButton') {
      this.onViewClick(e.val)
    } else if (e.event == 'onChecked') {
      this.updateSelectedDocuments(e.val);
      // console.log(e.val)
    }
  }
  updateSelectedDocuments(selectedList) {
    this.selectedOrders = new Array<number>();
    selectedList.forEach(e => {
      this.selectedOrders.push(e.orderId);
    });
  }
  getPage(pageEvent: PageEvent): void {
    // console.log(JSON.stringify(pageEvent));
    this.pageEvent = pageEvent;
    // if (pageEvent.pageIndex >= ((pageEvent.length / pageEvent.pageSize) / 2)) {
    if (pageEvent.pageIndex + 2 >= (pageEvent.length / pageEvent.pageSize) && pageEvent.length % pageEvent.pageSize == 0) {
      this.paymentIndexFrom += this.paymentIndexSize;
      this.getManagePayments(this.stateId, this.cityId, this.areaId);
    }
    else if (pageEvent.pageSize > pageEvent.length) {
      this.paymentIndexFrom += this.paymentIndexSize;
      this.paymentIndexSize += pageEvent.pageSize;
      this.getManagePayments(this.stateId, this.cityId, this.areaId);
    }
  }
  resetPageIndex() {
    this.paymentIndexFrom = 0;
    // this.paymentIndexSize=50;
    this.managepaymentsList = new Array();
  }

  // onAllCheckBoxClick(event) {
  //   if (event.target.checked) {
  //     this.isError = false;
  //     this.errorMessage = new Array();
  //     this.showMessage = false;
  //     this.managepaymentsList.forEach(element => {
  //       $("#" + element.orderId).prop("checked", true);
  //     });
  //   } else {
  //     this.managepaymentsList.forEach(element => {
  //       $("#" + element.orderId).prop("checked", false);
  //     });
  //   }
  // }

  // downloadSelected(item) {
  // if ((<any>$("#" + item.orderId + ":checked")).length > 0) {
  //   this.isError = false;
  //   this.errorMessage = new Array();
  //   this.showMessage = false;
  // this.selectedOrders.push(item.orderId);
  // }
  // else {
  //   this.selectedOrders.forEach((element3, index) => {
  //     if (item.orderId == element3) {
  //       this.selectedOrders.splice(index, 1);
  //     }
  //   });
  // }
  // }
  onSelectedDownload() {
    if (this.selectedOrders.length == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Select Atleast One Community.";
      this.showMessage = true;
      return;
    }
    else {
      this.spinnerService.start();
      this.businessAdminService.getSelectedPaymentExcelSheet(this.selectedOrders).then(response => {
        this.spinnerService.stop();
        this.managePaymentExcelResponse = response;
        this.url = this.managePaymentExcelResponse.excelUrl;
        this.authService.openPDF(this.url)
      });
    }
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
    this.hasCheckBoxValidation = false;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;

    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    } else if (this.uploadFilesList.length > 1) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select only one file at one time.';
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {

        }
        else {
          this.hasCheckBoxValidation = true;
          this.checkBoxValidationMessage = 'Only xls, xlsx files are supported';
          return;
        }
      }
    }
  }

  onUploadButtonClick() {
    this.hasCheckBoxValidation = false;
    this.isError = false;
    this.errorMessage = undefined;
    // this.showMessage = false;

    if (this.hasCheckBoxValidation) {
      return;
    }

    if (this.uploadFilesList === undefined || this.uploadFilesList === null ||
      this.uploadFilesList[0] === undefined || this.uploadFilesList[0] === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    }

    console.log(this.uploadFilesList[0]);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3("temp/employee/" + this.empId + "/uploads", this.uploadFilesList[0], 0, false, false).then((awsS3FileResult) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
        console.log("Something went wrong. Please try again later.");
        return;
      }
      this.businessAdminService.readManagePaymentsExcel({
        excelUrl: awsS3FileResult.Location,
        empId: this.empId
      }).then((data) => {
        this.getManagePayments(this.stateId, this.cityId, this.areaId);
        this.spinnerService.stop();
        if (data.statusCode == 201 || data.statusCode == 200) {
          this.myInputVariable.nativeElement.value = "";
          window.alert(data.statusMessage);
        } else {
          window.alert(data.statusMessage);
          return;
        }
      });
    }).catch(error => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Error occurred while processing request. Please try again!";
      this.showMessage = true;

    });
  }

  onPOCSelect(pocId: number): void {
    this.checkDate = true;
    this.restoreCommunityPayments.pocId = pocId;
    this.resetErrorMessage();
    if (pocId == 0) {
      this.resetErrorMessage();
      this.selectedPocId = 0;
    }
    if (pocId > 0) {
      this.selectedPocId = pocId;
    }
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);

  }

  getPocList(empId: number): void {
    this.businessAdminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
      if (response && response.length > 0) {
        this.pocList = response;
      }
    })
      .catch(error => {
        console.error('Error occurred while fetching the employee POCs', error);
      });
  }

  getManagePayments(stateId: number, cityId: number, areaId: number): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    console.log('startDate1');
    if (this.startDate == null && this.endingDate == null) {
      if (this.checkDate == true) {
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = true;
        this.message = new Array();
        this.message[0] = "Please Select Date";
      }
    }
    else if (this.endingDate == null) {
      if (this.checkEndDate == true) {
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = true;
        this.message = new Array();
        this.message[0] = "Please Select End Date";
      }

    }
    else if (this.startDate == null) {
      console.log('startDate3');
      this.errorMessage = new Array();
      this.isDate = false;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select Start Date";
    }
    else if (this.startDate.getDate() > this.endingDate.getDate()) {
      this.errorMessage = new Array();
      this.managepaymentsList = new Array();
      this.isDate = false;
      this.isDisplay = true;
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.message = new Array();
      this.message[0] = "Please Select valid Date";

    }
    else {
      console.log('startDate4');
      let reportRequest: BulkPackage = new BulkPackage();
      reportRequest.empId = this.empId;

      this.startDate.setHours(0);
      this.startDate.setMinutes(0);
      this.startDate.setSeconds(0);
      reportRequest.fromDate = this.startDate.getTime();
      reportRequest.toDate = this.endingDate.getTime();

      if (this.selectedPocId > 0)
        reportRequest.pocId = this.selectedPocId;
      if (stateId > 0) {
        reportRequest.stateId = this.stateId;
        if (cityId > 0) {
          reportRequest.cityId = this.cityId;
          if (areaId > 0) {
            reportRequest.areaId = this.areaId;
          }
        }
      } else {
        this.resetDropdowns();
      }

      this.paymentIndexFrom == 0 ? this.spinnerService.start() : "";
      this.businessAdminService.getManagePaymentsRecords(reportRequest.empId, this.selectedPocId,
        reportRequest.fromDate, reportRequest.toDate, this.stateId, this.cityId, this.areaId,
        this.paymentIndexFrom, this.paymentIndexSize).then(response => {
          this.spinnerService.stop();
          if (response.length > 0) {
            // this.managepaymentsList = new Array();
            this.managepaymentsList.push.apply(this.managepaymentsList, response);
            this.isError = false;
            this.showMessage = false;
            this.errorMessage = new Array();
          }
          else {
            // this.managepaymentsList = new Array();
            this.isError = true;
            this.showMessage = true;
            this.errorMessage1 = new Array();
            this.errorMessage = new Array();
            this.errorMessage[0] = "No Data Found";

          }
          this.dataSource = new MatTableDataSource(this.managepaymentsList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.matSort;
        });

    }
  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.businessAdminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
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

    this.errorMessage1 = new Array();
    this.errorMessage = new Array();
  }



  onStateChange(index: number): void {
    this.checkDate = true;
    this.resetErrorMessage();
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.cityId = 0;
    this.areaId = 0;
    // this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);

    this.restoreCommunityPayments.stateId = this.stateId = index;
    this.indexForCity = 0;
    this.indexForLoc = 0;
    if (index != 0) {
      this.businessAdminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.cityResponse = this.sortLocationResponseList(locationResponse);
        console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
      });
    }
    console.log('index' + this.indexForCity);
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);
  }

  onCityChange(index: number): void {
    this.resetErrorMessage();

    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.indexForLoc = 0;
    // this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
    this.restoreCommunityPayments.cityId = this.cityId = index;
    this.areaId = 0;
    if (index != 0) {
      this.businessAdminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.localityResponse = this.sortLocationResponseList(locationResponse);
        console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
      });
    }
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);
  }

  onLocationChange(index: number): void {
    this.checkDate = true;
    this.resetErrorMessage();
    // this.indexForLoc = 0;
    console.log("locationm");
    // this.areaId = (index > 0 ? this.localityResponse[index - 1].id : index);
    this.restoreCommunityPayments.areaId = this.areaId = index;
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);
  }

  sortLocationResponseList(res: LocationModeResponse[]): LocationModeResponse[] {

    res.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    return res;
  }

  startDateChoosen(event) {
    this.message = new Array();
    this.isDate = false;
    this.isDisplay = false;
    this.restoreCommunityPayments.fromDate = event;
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);

  }

  endDateChoosen(event) {

    this.message = new Array();
    this.isDate = false;
    this.isDisplay = false;
    this.checkEndDate = true;
    this.restoreCommunityPayments.toDate = event;
    this.resetPageIndex();
    this.getManagePayments(this.stateId, this.cityId, this.areaId);
  }

  onDownloadButtonClick() {
    let request: BulkPackage = new BulkPackage();
    request.empId = this.empId;
    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.startDate.setSeconds(0);
    request.fromDate = this.startDate.getTime();
    request.toDate = this.endingDate.getTime();

    if (this.selectedPocId > 0)
      request.pocId = this.selectedPocId;
    if (this.stateId > 0) {
      request.stateId = this.stateId;
      if (this.cityId > 0) {
        request.cityId = this.cityId;
        if (this.areaId > 0) {
          request.areaId = this.areaId;
        }
      }
    }
    else {
      this.resetDropdowns();
    }
    this.spinnerService.start();
    let from, size;
    from = this.pageEvent ? ((this.pageEvent.pageIndex ? this.pageEvent.pageIndex : 0) * (this.pageEvent.pageSize ? this.pageEvent.pageSize : 10)) : 0;
    size = this.pageEvent ? this.pageEvent.pageSize : 10;
    this.businessAdminService.getManagePaymentExcelSheet(request.empId, this.selectedPocId, request.fromDate, request.toDate, this.stateId, this.cityId, this.areaId, from, size).then(response => {
      this.spinnerService.stop();
      this.managePaymentExcelResponse = response;
      this.url = this.managePaymentExcelResponse.excelUrl;
      this.authService.openPDF(this.url)
      console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
    });
  }

  invoiceClick(invoice: any) {
    if (invoice.pdfUrlWithHeader)
      if (this.pdfHeaderType == 0 || this.pdfHeaderType == undefined) {
        this.authService.openPDF(invoice.pdfUrlWithHeader);
      }
      else {
        this.authService.openPDF(invoice.pdfUrlWithoutHeader);
      }
  }

  addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  onViewClick(selectedPackageDetails: BulkPackage) {
    this.selectedPackageDetails = selectedPackageDetails;
    this.router.navigate(['app/finance/brand/communitypaymentinformation']);

  }

  ngOnDestroy(): void {
    this.businessAdminService.communityPaymentsTrack = this.selectedPackageDetails;
    this.businessAdminService.restoreCommunityPaymentsTrack = this.restoreCommunityPayments;
    console.log('track' + JSON.stringify(this.businessAdminService.communityPaymentsTrack));
  }

}

