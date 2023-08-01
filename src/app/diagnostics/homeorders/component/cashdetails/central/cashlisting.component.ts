import { CryptoUtil } from './../../../../../auth/util/cryptoutil';
import { AuthService } from './../../../../../auth/auth.service';
import { BusinessAdminService } from './../../../../../businessadmin/businessadmin.service';
import { LocationModeResponse } from './../../../../../model/common/locationmoderesponse';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from './../../../../../base/util/common-util';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { ProductDeliveryRequest } from './../../../../../model/product/productdeliveryrequest';
import { DiagnosticsService } from './../../../../diagnostics.service';

@Component({
  selector: 'centralcashagentlist',
  templateUrl: './cashlisting.template.html',
  styleUrls: ['./cashlisting.style.scss'],
  encapsulation: ViewEncapsulation.None,

})

export class CentralCashListingComponent {

  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  isError1: boolean;
  showMessage1: boolean;
  errorMessage1: Array<string>;
  perPage: number = 10;
  total: number = 0;
  empId: number;
  cashAmount: number = 0;
  mobileNo: string = '';
  searchTerm: string = '';
  fromIndex: number = 0;
  selectedId: number = 0;
  dataMsg: string = ' ';
  agentCashResponse: any[] = [];
  pinCode: string = null;
  stateId: number;
  cityId: number;
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];

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
      display: 'Amount',
      variable: 'cashAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Date',
      variable: 'createdTimestamp',
      filter: 'datetime',
      sort: false
    },
    {
      display: 'Status',
      variable: 'cashCollectedStatus',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Initiated'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Delivered'
        },
        {
          condition: 'default',
          label: 'Initiated'
        }
      ]
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
    private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private businessadminService: BusinessAdminService,
    private router: Router, private spinnerService: SpinnerService) {
    this.empId = this.authService.userAuth.employeeId;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('centralcashstartDate') != null && window.localStorage.getItem('centralcashstartDate') != undefined) {
      this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('centralcashstartDate'))));
      this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('centralcashendDate'))));
    }
    this.getState();
    this.getAgentList();
  }

  getAgentList() {
    this.agentCashResponse = [];
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
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('centralcashstartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
      window.localStorage.setItem('centralcashendDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));
      this.showMessage = false;
      let productDeliveryReq = new ProductDeliveryRequest();
      productDeliveryReq.pocId = 0;
      productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
      productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
      productDeliveryReq.fromIndex = this.fromIndex;
      productDeliveryReq.centralHomeOders = false;
      productDeliveryReq.searchTerm = this.searchTerm;
      productDeliveryReq.state = this.stateId;
      productDeliveryReq.city = this.cityId;
      productDeliveryReq.pinCode = this.pinCode;

      this.diagnosticsService.getAgentList(productDeliveryReq).then(response => {
        this.spinnerService.stop();
        console.log("resposne", JSON.stringify(response));
        this.agentCashResponse = response;
        this.total = this.agentCashResponse.length;
        if (this.total == 0)
          this.dataMsg = 'No Data Found';
      });
    }
  }

  getRefreshedorderList() {
    this.searchTerm = '';
    this.indexForCity = 0;
    this.indexForLoc = 0;
    this.indexForState = 0;
    this.pinCode = null;
    this.stateId = 0;
    this.cityId = 0;
    this.fromIndex = 0;
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
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
    this.diagnosticsService.diagnosticsAdviseTrack = true; //for central 
    this.router.navigate(['/app/diagnostics/homeorders/cashagentdetails']);
  }



  onPage(page: number) {
    this.fromIndex = this.total + 1;
    this.getAgentList();
  }

  getBasedOnAgentName() {
    this.searchTerm = $('#search').val().toString();
    this.getAgentList();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getBasedOnAgentName();
    }
  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = locationResponse;
      this.stateResponse.sort(this.compare);
      console.log("stateresponse: " + JSON.stringify(this.stateResponse));
    });
  }

  onStateChange(index: number): void {
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.cityId = 0;
    this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
    this.pinCode = null;
    this.indexForCity = 0;
    this.indexForLoc = 0;
    if (index != 0) {
      this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.cityResponse = locationResponse;
        this.cityResponse.sort(this.compare);
        console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
      });
      this.getAgentList();
    }
  }

  onCityChange(index: number): void {
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.indexForLoc = 0;
    this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
    this.pinCode = null;
    if (index != 0) {
      this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
        this.localityResponse = locationResponse;
        this.localityResponse.sort(this.compare);
        console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
      });
      this.getAgentList();
    }
  }

  onLocationChange(index: number): void {
    this.pinCode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);
    if (index != 0) {
      this.getAgentList();
    }
  }


  compare(a, b): number {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }

}