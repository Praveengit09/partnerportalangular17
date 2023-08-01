import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
  templateUrl: './homeorderlogistics.template.html',
  styleUrls: ['./homeorderlogistics.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class HomeOrderLogisticComponent {


  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  isError1: boolean;
  showMessage1: boolean;
  errorMessage1: Array<string>;
  perPage: number = 10;
  total: number = 0;
  pocId: number;
  sampleCount: number = 0;
  mobileNo: string = '';
  searchTerm: string = '';
  pinCode: string = ''
  address: any;
  fromIndex: number = 0;
  dataMsg: string = ' ';
  response: any = [];
  fromDate: number = 0;
  toDate: number = 0;
  pocAddress: string = '';

  startDate: Date = new Date();
  endDate: Date = new Date();
  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };


  columns: any[] = [
    {
      display: 'Agent Name',
      variable: 'empName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Active Samples',
      variable: 'totalSamplesForPickup',
      filter: 'text',
      sort: false
    },
    {
      display: 'Samples Picked',
      variable: 'totalSamplesPickedup',
      filter: 'text',
      sort: false
    },
    {
      display: 'Date',
      variable: 'date',
      filter: 'date',
      sort: false
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewOrder',
      sort: false
    }
  ];

  constructor(private authService: AuthService,
    private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
    private router: Router, private spinnerService: SpinnerService) {
    this.pocId = this.authService.userAuth.pocId;
    this.pinCode = this.authService.selectedPocDetails.address.pinCode;
    this.address = this.authService.selectedPocDetails.address;
    console.log("address", JSON.stringify(this.address))
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('logstartDate') != null && window.localStorage.getItem('logstartDate') != undefined) {
        this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logstartDate'))));
        this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('logendDate'))));
    }
    this.pocAddress = this.address.address1 + ', ' + this.address.address2 + ', ' + this.address.areaName + ', ' + this.address.cityName + ', ' + this.address.stateName + '- ' + this.address.pinCode;
  }

  ngOnInit(): void {
    this.getAgentList();
  }

  getAgentList() {
    this.response = [];
    this.spinnerService.start();
    this.dataMsg = 'Loading...';

    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      this.spinnerService.stop();
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Start Date should always be greater than end date';
      this.isError = true;
      this.showMessage = true;
      return;
    }
    else {
      this.showMessage = false;
      this.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
      this.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;

      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('logstartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
      window.localStorage.setItem('logendDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

      this.diagnosticsService.getSampleOfAgentList(this.pocId, this.fromIndex, 50, this.fromDate, this.toDate, this.searchTerm, 0, 0, '').then(response => {
        this.spinnerService.stop();
        console.log("resposne", JSON.stringify(response));
        this.response = response;
        this.total = this.response.length;
        if (this.total == 0)
          this.dataMsg = 'No Data Found';
      });
    }
  }

  getRefreshedorderList() {
    this.searchTerm = '';
    $('#search').val('');
    this.getAgentList();
  }

  endDateChoosen($event): void {
    this.endDate = $event;
    this.getAgentList();
  }

  startDateChoosen($event): void {
    this.startDate = $event;
    this.getAgentList();
  }

  clickEventHandler(e) {
    if (e.event == 'viewOrder') {
      this.viewOrderDetails(e.val);
    }
  }

  viewOrderDetails(val) {
    this.diagnosticsService.order = val;
    this.diagnosticsService.diagnosticsAdviseTrack = false;
    this.router.navigate(['/app/diagnostics/homeorders/viewagentdetails']);
  }

  onNewReq() {
    this.sampleCount = 0;
    (<any>$("#samplereq")).modal("show");
  }

  sendRequest() {

    if (this.sampleCount <= 0) {
      this.isError1 = true;
      this.showMessage1 = true;
      this.errorMessage1 = new Array();
      this.errorMessage1[0] = "Please Enter a valid count";
      return;
    }
    else {
      this.isError1 = false;
      this.showMessage1 = false;
      this.errorMessage1 = new Array();
    }
    this.spinnerService.start();
    (<any>$("#samplereq")).modal("hide");

    this.diagnosticsService.sendSampleRequest(this.pocId, this.commonUtil.convertOnlyDateToTimestamp(new Date()), this.sampleCount, this.pinCode).then(
      response => {
        this.spinnerService.stop();
        if (response.statusCode == 200) {
          alert(response.statusMessage);
          this.getAgentList();
        }
        else
          alert(response.statusMessage);
      })
  }


  onPage(page: number) {
    this.fromIndex = this.total + 1;
    this.getAgentList();
  }


  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getBasedOnAgentName();
    }
  }
  getBasedOnAgentName() {
    this.searchTerm = $('#search').val().toString();
    this.getAgentList();
  }
}