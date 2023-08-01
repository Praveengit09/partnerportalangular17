import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DiagnosticsAdviseTrack } from '../../../../model/diagnostics/diagnosticsAdviseTrack';
import { Subscription } from 'rxjs';
import { CartItem } from '../../../../model/basket/cartitem';
import { StatusDiagnosticsAdviseTrack } from '../../../../model/diagnostics/statusDiagnosticsAdviseTrack';
import { AppConfig } from '../../../../app.config';
import { DiagnosticsService } from '../../../diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { Payment } from '../../../../model/basket/payment';

@Component({
  selector: 'walkinreports-component',
  templateUrl: './walkinreports.template.html',
  styleUrls: ['./walkinreports.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class WalkInReportsComponent implements OnDestroy, OnInit {

  config: any;
  month: any;
  year: any;
  dataMsg: string = ' ';
  selectedDiagnosticsAdvise: DiagnosticsAdviseTrack;
  errorMessage: Array<string>;
  // autoRefreshInterval:AutoRefreshInterval;
  isError: boolean;
  showMessage: boolean;
  paymentListRefresh: Subscription;
  refreshTime: number;
  unsubscribe: number;
  searchCriteria: string = 'orderId';
  diagnosticsList: CartItem[] = new Array<CartItem>();
  // selectedProcedureAdvise:CartItem;
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
  fileUrlList: any = new Array();
  timeList = new Array();
  statusDiagnosticsAdviselist: StatusDiagnosticsAdviseTrack[] = [];
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria.";
  defaultMsgForWrongPhoneNumber: string = "Entered phone number is not valid. Please try valid phone number.";
  defaultMsgForSearchTerm: string = "Entered value is not valid. Please check and try again.";
  isFilterVisible: boolean = false;
  crouselSelectedImage: String;
  prescriptionType = "";


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
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'invoiceCompletionStatus',
      conditions: [
        {
          value: '1',
          condition: 'lte',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Partial',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '5',
          condition: 'eq',
          label: 'Completed',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          condition: 'default',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo'
        }
      ]
    },
    {
      display: 'Reports',
      variable: 'fileCount',
      filter: 'action',
      type: 'button',
      event: 'reports',
      sort: false,
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Not Available',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          condition: 'default',
          label: 'Available',
          style: 'btn width-100 mb-xs botton_txtdigo done_txt'
        }
      ]
    }

    /* ,
    {
      display: 'Payment Receipt',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btn'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
          style: ''
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btn'
        }
      ]
    } */
  ];

  col = [
    {
      display: 'Tests',
      variable: 'fileName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Report',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      sort: false,
      event: 'openfile',
      variable: 'contentType',
      conditions: [
        {
          value: '2',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/image_icon_read.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btn'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
  };

  constructor(config: AppConfig,
    private diagnosticsService: DiagnosticsService, private auth: AuthService, private router: Router,
    private spinnerService: SpinnerService, private localStorage: HsLocalStorage, private commonUtil: CommonUtil) {
    this.config = config.getConfig();
    this.pocId = auth.userAuth.pocId;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    // this.paymentListRefresh = Observable.interval(this.refreshTime).subscribe((val) => { this.pageRefresh(); });

  }

  ngOnInit(): void {
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.getDiagnosticAdvisesForPoc(0);
  }

  onSearchChange(search: string) {
    this.searchCriteria = search;
  }
  pageRefresh(event) {

    if (this.search == undefined || this.search.length == 0 || this.search == " ") {
      this.diagnosticsService.getDiagnosticsAdvisesForPoc(this.date, "", "").then(adviseListData => {
        this.diagnosticsList = (adviseListData);
      });
      console.log("##REfresh" + JSON.stringify(this.diagnosticsList));

    }
    else {
      this.diagnosticsService.getDiagnosticsAdvisesForPoc(0, this.searchCriteria, this.search)
        .then(diagnosticsAdviseList => {
          this.diagnosticsList = diagnosticsAdviseList;

        });
    }
    console.log("##paymentListRefresh" + JSON.stringify(this.diagnosticsList));
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
    console.log("CheckSearch: " + search);
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.diagnosticsList = new Array<CartItem>();
    this.total = 0;
    this.dataMsg = 'Loading....';
    this.diagnosticsService.getDiagnosticsAdvisesForPoc(0, this.searchCriteria, search)
      .then(diagnosticsAdviseList => {
        this.diagnosticsList = diagnosticsAdviseList;
        this.diagnosticsList.forEach(element => {
          if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
            element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
          }
        });
        if (this.diagnosticsList.length > 0) {
          this.diagnosticsList = diagnosticsAdviseList;
          this.total = this.diagnosticsList.length;
        } else if (this.diagnosticsList.length == 0) {
          this.diagnosticsList = new Array<CartItem>();
          this.total = this.diagnosticsList.length;
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
          this.showMessage = true;
          this.dataMsg = 'No Data Found';
        }
      });
  }

  getRefreshedorderList(search: string): void {
    $('#search').val('');
    this.searchCriteria = 'orderId';
    this.search = search;
    this.diagnosticsList = new Array<CartItem>();
    this.total = 0;
    // if (search != undefined && search.length < 1) {
    this.getDiagnosticAdvisesForPoc(0);
    //}
  }

  onButtonClicked(item: DiagnosticsAdviseTrack): void {
    this.selectedDiagnosticsAdvise = item;
    // if (this.selectedDiagnosticsAdvise.invoiceCompletionStatus != 5)
    this.router.navigate(['/app/diagnostics/advice/testuploadresults']);
  }

  onImageClicked(item: DiagnosticsAdviseTrack): void {
    this.selectedDiagnosticsAdvise = item;
    if (this.selectedDiagnosticsAdvise.payment.paymentStatus == Payment.PAYMENT_STATUS_PAID) {
      if (this.pdfHeaderType == 0) {
        this.auth.openPDF(this.selectedDiagnosticsAdvise.pdfUrlWithHeader)
      } else {
        this.auth.openPDF(this.selectedDiagnosticsAdvise.pdfUrlWithoutHeader)
      }
    }

  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
    if (e.event == "reports") {
      this.fileUrlList = e.val.fileUrlList;
      if(e.val.fileCount > 0) 
        this.onReportsClicked();
    }
    if (e.event == "openfile") {
      this.openPdf(e);
    }
  }

  openPdf(e) {
    console.log("pdf", e)
    let imageSrc = '';

    this.diagnosticsService.getPdfUrl(e.val.fileUrl).then(xdata => {
      imageSrc = this.diagnosticsService.tempPdfUrl;
      if (e.val.contentType == 2)
        this.prescriptionType = 'pdf';
      else
        this.prescriptionType = 'img';
      this.crouselSelectedImage = undefined;
      if (this.prescriptionType == "pdf") {
        this.auth.openPDF(imageSrc);
      } else {
        $('#prescription-modal').css('height', 'none');
        this.crouselSelectedImage = imageSrc;
        (<any>$("#sliderimagepopup")).modal("show");
      }
    });
  }

  onReportsClicked() {
    this.fileUrlList.forEach(file => {
      let temp = '';
      file.testList.forEach((test, index) => {
        temp = temp + test.name;
        if (index != file.testList.length - 1)
          temp = temp + ", ";
      })
      file.fileName = temp;
    });
    (<any>$("#reports")).modal("show");
  }

  getDiagnosticAdvisesForPoc(date: number): void {
    this.date = date;
    this.spinnerService.start();
    //when walkinReports 1 has to be sent
    this.diagnosticsService.getDiagnosticsAdvisesForPoc(date, "", "").then(adviseListData => {
      this.spinnerService.stop();
      adviseListData.forEach(element => {
        if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
          element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
        }
        element.fileCount = element.fileUrlList.length;
      });

      this.diagnosticsList.push.apply(this.diagnosticsList, adviseListData);
      // if (this.diagnosticsList.length != this.total) {
      this.total = this.diagnosticsList.length;
      // }

    });
  }


  onPage(page: number) {
    this.getDiagnosticAdvisesForPoc(this.diagnosticsList[this.total - 1].updatedTimestamp);
  }

  ngOnDestroy(): void {
    this.diagnosticsService.diagnosticsAdviseTrack = this.selectedDiagnosticsAdvise;
  }

  filterBtnClicked() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  getWidth() {
    return $(window).width();
  }
}

$(document).ready(function () {
  $('.modal').on('hidden.bs.modal', function (e) {
    if ($('.modal').hasClass('in')) {
      $('body').addClass('modal-open');
    }
  });

});
