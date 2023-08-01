import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from '../../../node_modules/rxjs';
import { AppConfig } from '../app.config';
import { HsLocalStorage } from '../base/hsLocalStorage.service';
import { CommonUtil } from '../base/util/common-util';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { DiagnosticAdminRequest } from '../model/diagnostics/diagnosticAdminRequest';
import { DiagnosticDeliveryAdviceTrack } from '../model/diagnostics/diagnosticListForAdmin';
import { AuthService } from './../auth/auth.service';
import { StatusDiagnosticsAdviseTrack } from './../model/diagnostics/statusDiagnosticsAdviseTrack';
import { DiagnosticsService } from "./diagnostics.service";
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';

@Component({
  selector: 'diagnostics',
  templateUrl: './diagnostics.template.html',
  styleUrls: ['./diagnostics.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DiagnosticsComponent implements OnDestroy, OnInit {

  config: any;
  month: any;
  year: any;
  selectedDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack;
  errorMessage: Array<string>;
  // autoRefreshInterval:AutoRefreshInterval;
  isError: boolean;
  showMessage: boolean;
  paymentListRefresh: Subscription;
  refreshTime: number;
  unsubscribe: number;
  searchCriteria: string = 'orderId';
  // diagnosticsList: SlotBookingDetails[] = new Array<SlotBookingDetails>();
  // selectedProcedureAdvise:CartItem;
  diagnosticsList: DiagnosticDeliveryAdviceTrack[] = new Array<DiagnosticDeliveryAdviceTrack>();
  diagnosticsListIndex: string = 'diagnosticsListIndex';
  autoRefreshChange: boolean = false;
  perPage: number = 10;
  total: number = 0;
  pocId: number;
  search: any;
  date: any = 0;
  pdfHeaderType: number;
  dropDownIndex1: number = 0;
  dropDownOptions = new Array();
  timeList = new Array();
  statusDiagnosticsAdviselist: StatusDiagnosticsAdviseTrack[] = [];
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria.";
  defaultMsgForWrongPhoneNumber: string = "Entered phone number is not valid. Please try valid phone number.";
  defaultMsgForSearchTerm: string = "Entered value is not valid. Please check and try again.";
  dataMsg: string = "";
  diagnoAdminRequest: DiagnosticAdminRequest;
  empId: number;


  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Patient Name',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile , patientProfileDetails.age , patientProfileDetails.gender',
      filter: 'nametitle',
      filler: ',',
      sort: true
    },
    {
      display: 'Doctor Name',
      variable: 'doctorDetail.title doctorDetail.firstName doctorDetail.lastName',
      filter: 'nametitle',
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
      /* display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button', */
      display: 'PAYMENT STATUS',
      sort: false,
      variable: 'payment.paymentStatus',
      filter: 'text',
      // event: 'viewButton',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Paid',
          // style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Not Paid',
          // style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          condition: 'default',
          label: 'View',
          // style: 'btn btn-danger width-100 mb-xs botton_txtdigo'
        }
      ]
    },
    {
      display: 'Action',
      label: 'MARK COLLECTEED',
      style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'sampleCollectionStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'MARK AS DELIVERED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'MODIFIED',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'REJECTED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '9',
          condition: 'eq',
          label: 'SAMPLES UPDATED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          condition: 'default',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt'
        }
      ]
    },
    {
      display: 'Action By',
      variable: 'empFirstName empLastName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Receipt',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        }
      ]
    }
  ];

  constructor(config: AppConfig,
    private diagnosticsService: DiagnosticsService, private auth: AuthService, private router: Router,
    private spinnerService: SpinnerService, private localStorage: HsLocalStorage, private commonUtil: CommonUtil,
    private authService: AuthService) {
    this.config = config.getConfig();
    this.pocId = auth.userAuth.pocId;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.empId = this.authService.userAuth.employeeId;
    // this.paymentListRefresh = Observable.interval(this.refreshTime).subscribe((val) => { this.pageRefresh(); });

  }

  ngOnInit(): void {
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    /* this.isError = this.diagnosticsService.isError;
    this.errorMessage = this.diagnosticsService.errorMessage;
    this.showMessage = this.diagnosticsService.showMessage; */
    this.getDiagnosticAdvisesForPoc(0);
    console.log("NgOnInit:");
  }

  onSearchChange(search: string) {
    this.searchCriteria = search;
  }

  pageRefresh(event) {
    this.total = 0;
    if (this.search == undefined || this.search.length == 0 || this.search == " ") {
      this.diagnoAdminRequest.date = this.date;
      /* this.diagnosticsService.getDiagnosticsAdvisesForPoc(this.date, "", "").then(adviseListData => {
        this.diagnosticsList = (adviseListData);
      }); */
      this.getDiagnosticWalkinList(this.date, "", "");

    }
    else {
      /* this.diagnosticsService.getDiagnosticsAdvisesForPoc(0, this.searchCriteria, this.search)
        .then(diagnosticsAdviseList => {
          this.diagnosticsList = diagnosticsAdviseList;

        }); */
      this.getDiagnosticWalkinList(0, this.searchCriteria, this.search);
    }
  }

  getDiagnosticWalkinList(lastTime: number, searchCriteria: string, search: string) {
    this.diagnoAdminRequest = new DiagnosticAdminRequest();
    if (searchCriteria == 'orderId') {
      this.diagnoAdminRequest.orderId = search;
    } else if (searchCriteria == 'contactNo') {
      this.diagnoAdminRequest.mobile = search;
    }
    this.diagnoAdminRequest.pocIdList.push(this.pocId);
    this.diagnoAdminRequest.fromIndex = this.total;
    this.diagnoAdminRequest.empId = this.empId;
    this.diagnoAdminRequest.date = this.commonUtil.convertOnlyDateToTimestamp(new Date());
    this.diagnoAdminRequest.employeeRequest = DiagnosticAdminRequest.WALKIN_ORDERS;
    this.spinnerService.start();
    this.diagnosticsService.getDiagnosticListForAdmin(this.diagnoAdminRequest).then(adviseListData => {
      console.log('adviceListData',adviseListData);
      
      this.spinnerService.stop();
      this.diagnosticsList = new Array<DiagnosticDeliveryAdviceTrack>();
      if (adviseListData && adviseListData.length > 0) {
        this.diagnosticsList = (adviseListData);
        this.total = this.diagnosticsList.length;
      } else if (adviseListData.length == 0) {
        this.dataMsg = "No Data found";
        this.total = this.diagnosticsList.length;
        /* this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
        this.showMessage = true; */
      }

      this.diagnosticsList.forEach(element => {
        if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
          element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
        }
      });
    })
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
    }
  }

  getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(search: any = ''): void {
    search = $('#search').val().toString();
    if (isNaN(parseInt(search))) {
      this.searchCriteria = 'orderId';
    } else {
      this.searchCriteria = 'contactNo';
      if (search.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
    }
    this.search = search;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.diagnosticsList = new Array<DiagnosticDeliveryAdviceTrack>();
    this.total = 0;
    this.dataMsg = "Loading...";
    /* this.diagnosticsService.getDiagnosticsAdvisesForPoc(0, 0, this.searchCriteria, search)
      .then(diagnosticsAdviseList => {
        this.diagnosticsList = diagnosticsAdviseList;
        this.diagnosticsList.forEach(element => {
          element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
        });
        if (this.diagnosticsList.length > 0) {
          this.diagnosticsList = diagnosticsAdviseList;
          this.total = this.diagnosticsList.length;
        } else if (this.diagnosticsList.length == 0) {
          this.dataMsg = "No Data found";
          this.diagnosticsList = new Array<SlotBookingDetails>();
          this.total = this.diagnosticsList.length;
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
          this.showMessage = true;
        }
      }); */
    this.getDiagnosticWalkinList(0, this.searchCriteria, search)
  }

  getRefreshedorderList(search: string): void {
    $('#search').val('');
    (<any>$)("#orderId").prop("checked", true);
    this.searchCriteria = 'orderId';
    this.search = search;
    /* this.diagnosticsService.isError = false;
    this.diagnosticsService.errorMessage = undefined;
    this.diagnosticsService.showMessage = false; */
    this.diagnosticsList = new Array<DiagnosticDeliveryAdviceTrack>();
    this.total = 0;
    this.getDiagnosticAdvisesForPoc(0);
  }

  /* onButtonClicked(item: DiagnosticsAdviseTrack): void {
    this.selectedDiagnosticsAdvise = item;
    console.log("Item1: ", this.selectedDiagnosticsAdvise);
    this.diagnosticsService.newAdviceDetail = false;
    if (this.selectedDiagnosticsAdvise.payment.paymentStatus != 1)
      this.router.navigate(['/app/diagnostics/advice/advicedetail']);
  } */

  onButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
    console.log("status-->" + JSON.stringify(statusDiagnosticsAdvise));
    this.selectedDiagnosticsAdvise = statusDiagnosticsAdvise;
    if (this.selectedDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
      && this.selectedDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED
      && this.selectedDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED) {
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING;
      this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    } else if (this.selectedDiagnosticsAdvise.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.COLLECTED) {
      this.spinnerService.start();
      statusDiagnosticsAdvise.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.DELIVERED;
      this.diagnosticsService.updateDiagnosticAdminRemarks(statusDiagnosticsAdvise).then(data => {
        this.spinnerService.stop();
        if (data.statusCode == 200 || data.statusCode == 201) {
          alert('Status Updated Successfully');
          this.getDiagnosticAdvisesForPoc(this.diagnosticsList[this.total - 1].updatedTimestamp);
        } else {
          alert('Something went wrong.Please try after sometime');
        }
      })
    }
  }

  clickEventHandler(e) {
    /* if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    } */
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
    else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }

  onGenerateNewAdvise(): void {
    this.diagnosticsService.diagnosticsAdviseTrack = null;
    this.diagnosticsService.newAdviceDetail = true;
    console.log("onGenerateNewAdvise: " + this.diagnosticsService.newAdviceDetail);
    this.localStorage.removeData('diagnosticsAdviseTrack');
    this.router.navigate(['/app/diagnostics/advice/advicedetail']);
  }

  onImageClicked(item: DiagnosticDeliveryAdviceTrack): void {
    this.selectedDiagnosticsAdvise = item;
    if (this.selectedDiagnosticsAdvise.payment.paymentStatus == 1) {
      if (this.pdfHeaderType == 0) {
        this.auth.openPDF(this.selectedDiagnosticsAdvise.pdfUrlWithHeader)
      } else {
        this.auth.openPDF(this.selectedDiagnosticsAdvise.pdfUrlWithoutHeader)
      }
    }

  }

  getDiagnosticAdvisesForPoc(date: number): void {
    this.date = date;
    /* this.isError = this.diagnosticsService.isError;
    this.errorMessage = this.diagnosticsService.errorMessage;
    this.showMessage = this.diagnosticsService.showMessage; */
    // this.spinnerService.start();
    /* this.diagnosticsService.getDiagnosticsAdvisesForPoc(date, "", "").then(adviseListData => {
      this.spinnerService.stop();
      // this.diagnosticsList.push.apply(this.diagnosticsList, adviseListData);
      this.diagnosticsList = adviseListData;
      if (this.diagnosticsList.length != this.total) {
        this.total = this.diagnosticsList.length;
      }
      this.diagnosticsList.forEach(element => {
        element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
      });
      console.log("this.diagnosticsList: " + JSON.stringify(this.diagnosticsList[0]));
    }); */
    this.getDiagnosticWalkinList(date, "", "");

  }


  onPage(page: number) {
    this.getDiagnosticAdvisesForPoc(this.diagnosticsList[this.total - 1].updatedTimestamp);
  }

  ngOnDestroy(): void {
    /* this.diagnosticsService.isError = false;
    this.diagnosticsService.showMessage = false; 
    this.diagnosticsService.diagnosticsAdviseTrack = this.selectedDiagnosticsAdvise;*/
    this.diagnosticsService.orderDetailAdviceTrack = this.selectedDiagnosticsAdvise;
    this.diagnosticsService.centralAdminModify = false;
    this.localStorage.removeData('diagnosticsAdviseTrack');
    this.localStorage.removeData('newAdviceDetail');
    console.log("Item2: ", JSON.stringify(this.diagnosticsService.orderDetailAdviceTrack));
  }
}

$(document).ready(function () {
  $('.modal').on('hidden.bs.modal', function (e) {
    if ($('.modal').hasClass('in')) {
      $('body').addClass('modal-open');
    }
  });

});
