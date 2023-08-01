import { InvestigationPrice } from './../../../model/diagnostics/investigationPrice';
import { ProcedurePriceDetail } from './../../../model/procedure/procedurePriceDetail';
import { CommonUtil } from './../../../base/util/common-util';
import { SlotBookingDetails } from './../../../model/basket/slotBookingDetails';
import { DiagnosticsService } from './../../diagnostics.service';
import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';



@Component({
  selector: 'testcreation',
  templateUrl: './testcreation.template.html',
  styleUrls: ['./testcreation.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class TestCreationComponent implements OnInit {
  pocId: number;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  diagnosticsAdviseTrack: any;
  serviceName: string;
  serviceNameSearchList: any[] = new Array<any>();
  diagnosticTestList: any[] = new Array<any>();
  searchKeyword: string;

  selectTestName: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];
  selectedTest: any;
  searchTestName: string;
  searchTestTotal: number = 0;
  serviceTestList: any;
  @Input()
  procedurePriceDetail: ProcedurePriceDetail;
  testPrice: boolean = true;

  isErrorTest: boolean;
  showMessageTest: boolean;
  errorMessageTest: Array<string>;
  isTestVisible: boolean = true;


  constructor(private authService: AuthService, private diagnosticsService: DiagnosticsService,
    private spinnerService: SpinnerService, private commonUtil: CommonUtil,) {
  }

  ngOnInit() {
  }
  searchTests(searchKeyword) {
    alert("ok")
    this.searchKeyword = searchKeyword;
    this.pocId = this.authService.selectedPocDetails.pocId
    this.serviceName = this.searchKeyword;
    if (searchKeyword.length > 2) {
      this.diagnosticsService.getDiagnosticTestsList(this.pocId, this.serviceName).then((data) => {
        this.searchTestTotal = data.length;
        this.serviceNameSearchList = data;
        this.commonUtil.sleep(700);
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      });
    }

  }
  getSearchTestName(searchTestName) {
    for (let i = 0; i < this.serviceNameSearchList.length; i++) {
      if (searchTestName.pocId == this.serviceNameSearchList[i].pocId && searchTestName.serviceName == this.serviceNameSearchList[i].serviceName)
        this.selectedTest = this.serviceNameSearchList[i];
    }

    this.procedurePriceDetail = new ProcedurePriceDetail();
    this.procedurePriceDetail.pocId = this.selectedTest.pocId;
    this.procedurePriceDetail.serviceName = this.selectedTest.serviceName;
    this.searchKeyword = this.selectedTest.serviceName;
  }
  validateNumberInputOnly(event) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  onEnterPressed(event: any) {
    if (event == null || event == '') {
      event = 0;
    }

  }
  onEnterPressedWalkIn(event: any) {

    if (event == null || event == '') {
      event = 0;
    }
    this.isTestVisible = false;


  }
  onEnterPressedTest(event: any) {
    if (event == null || event == '') {
      event = 0;
    }
    this.isTestVisible = true;


  }
  onEnterdownTest(event: any) {
    if (event == null || event == '') {
      event = 0;
    }
    this.isTestVisible = true;

  }
  updateTestCreation() {
    if (this.selectedTest.walkinOrderPriceDetails.grossPrice < this.selectedTest.walkinOrderPriceDetails.netPrice) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "MRP should be greater than or Sale Price";
      this.showMessageTest = true;
      return;
    }
    if (this.selectedTest.homeOrderPriceDetails.grossPrice < this.selectedTest.homeOrderPriceDetails.netPrice) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "MRP should be greater than or Sale Price";
      this.showMessageTest = true;
      return;
    }
    this.spinnerService.start();
    let testCreation: ProcedurePriceDetail = new ProcedurePriceDetail();
    testCreation.pocId = this.selectedTest.pocId;
    testCreation.serviceName = this.selectedTest.serviceName;
    testCreation.serviceId = this.selectedTest.serviceId;
    testCreation.walkinOrderPriceDetails = new InvestigationPrice();
    testCreation.homeOrderPriceDetails = new InvestigationPrice();
    if (this.isTestVisible == true) {
      testCreation.grossPrice = this.selectedTest.grossPrice;
      testCreation.netPrice = this.selectedTest.netPrice;
    }
    if (this.isTestVisible == false) {
      testCreation.grossPrice = this.selectedTest.walkinOrderPriceDetails.grossPrice;
      testCreation.netPrice = this.selectedTest.walkinOrderPriceDetails.netPrice;
    }


    testCreation.homeOrderPriceDetails.grossPrice = this.selectedTest.homeOrderPriceDetails.grossPrice;
    testCreation.homeOrderPriceDetails.netPrice = this.selectedTest.homeOrderPriceDetails.netPrice;
    testCreation.homeOrderPriceDetails.discountPrice = this.selectedTest.homeOrderPriceDetails.discountPrice;
    testCreation.walkinOrderPriceDetails.grossPrice = this.selectedTest.walkinOrderPriceDetails.grossPrice;
    testCreation.walkinOrderPriceDetails.netPrice = this.selectedTest.walkinOrderPriceDetails.netPrice;
    testCreation.walkinOrderPriceDetails.discountPrice = this.selectedTest.walkinOrderPriceDetails.discountPrice;
    testCreation.discountPrice = this.selectedTest.walkinOrderPriceDetails.grossPrice - this.selectedTest.walkinOrderPriceDetails.netPrice;
    testCreation.homeCollections = this.selectedTest.homeCollections;
    
    if (this.selectedTest.serviceName != undefined || this.selectedTest.serviceName != null) {
      this.diagnosticsService.updatediagnostictestprice(testCreation).then((data) => {
        this.spinnerService.stop();
        if (data.statusCode == 200) {
          alert(data.statusMessage);
          location.reload();
        }
      });
    }
  }
  updatesCancel() {
    this.spinnerService.start();
    alert("Search and Update Price is Cancelled");
    this.spinnerService.stop();
    location.reload();

  }

}



