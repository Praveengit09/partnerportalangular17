import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../../auth/auth.service';
import { CommonUtil } from './../../../../../base/util/common-util';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { ProductDeliveryRequest } from './../../../../../model/product/productdeliveryrequest';
import { DiagnosticsService } from './../../../../diagnostics.service';

@Component({
  selector: 'cashbyagentlist',
  templateUrl: './listing.template.html',
  styleUrls: ['./listing.style.scss'],
  encapsulation: ViewEncapsulation.None,

})

export class CashDetailsListingComponent {

  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  isError1: boolean;
  showMessage1: boolean;
  errorMessage1: Array<string>;
  perPage: number = 10;
  total: number = 0;
  pocId: number;
  cashAmount: number = 0;
  mobileNo: string = '';
  searchTerm: string = '';
  pinCode: string = ''
  fromIndex: number = 0;
  selectedId: number = 0;
  dataMsg: string = ' ';
  agentCashResponse: any[] = [];
  agentResponse: any = [];
  agentReq: any;

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
    private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
    private router: Router, private spinnerService: SpinnerService) {
    this.pocId = this.authService.userAuth.pocId;
    this.pinCode = this.authService.selectedPocDetails.address.pinCode;
  }

  ngOnInit(): void {
    this.getAgentList();
    this.getAllAgetnListByPoc();
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
      this.showMessage = false;
      let productDeliveryReq = new ProductDeliveryRequest();
      productDeliveryReq.pocId = this.pocId;
      productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
      productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
      productDeliveryReq.fromIndex = this.fromIndex;
      productDeliveryReq.centralHomeOders = false;
      productDeliveryReq.searchTerm = this.searchTerm;

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
    this.router.navigate(['/app/diagnostics/homeorders/cashagentdetails']);
  }

  onNewReq() {
    this.agentReq = {
      empId: 0,
      empName: '',
      pocId: this.pocId,
      empMobileNo: '',
      cashCollectedStatus: 1,
      cashAmount: 0
    };
    this.cashAmount = 0;
    this.mobileNo = '';
    this.selectedId = 0;
    (<any>$("#cashreq")).modal("show");
  }

  sendRequest() {

    if (this.cashAmount <= 0) {
      this.isError1 = true;
      this.showMessage1 = true;
      this.errorMessage1 = new Array();
      this.errorMessage1[0] = "Please Enter a valid amount";
      return;
    }

    if (this.mobileNo.length < 10) {
      this.isError1 = true;
      this.showMessage1 = true;
      this.errorMessage1 = new Array();
      this.errorMessage1[0] = "Please Enter a valid mobile no";
      return;
    }
    else {
      this.isError1 = false;
      this.showMessage1 = false;
      this.errorMessage1 = new Array();
    }

    (<any>$("#cashreq")).modal("hide");
    console.log("request", JSON.stringify(this.agentReq));

    this.agentReq.cashAmount = +this.cashAmount;
    this.agentReq.empMobileNo = this.mobileNo;
    this.diagnosticsService.updateCashAgentDetails(this.agentReq).then(
      response => {
        if (response.statusCode == 200) {
          alert("Successfully added");
          this.getAgentList();
        }
        else
          alert(response.statusMessage);
      })
  }

  getAllAgetnListByPoc() {
    this.spinnerService.start();
    this.diagnosticsService.getAllAgetnListByPoc(this.pocId, this.pinCode).then(response => {
      this.spinnerService.stop();
      console.log("resposne", JSON.stringify(response));
      this.agentResponse = response;
    });
  }

  setSeletedAgent(id: number) {
    if (id > 0) {
      let temp = this.agentResponse[id - 1];
      this.agentReq.empId = temp.empId;
      this.agentReq.empName = temp.fullName;
    }
    else {
      this.agentReq.empId = 0;
      this.agentReq.empName = '';
    }
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
}