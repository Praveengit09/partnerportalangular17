import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonUtil } from '../../../../base/util/common-util';
import { CentralInventryService } from '../../centralinventory.service';
import { ProcedurePriceDetail } from '../../../../model/procedure/procedurePriceDetail';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';

@Component({
  selector: 'searchanndupdateprice',
  templateUrl: './searchandupdateprice.templete.html',
  styleUrls: ['./searchandupdateprice.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class SearchAndUpdateComponent implements OnInit {
  serviceNameSearchList: any[] = new Array<any>();
  selectTestName: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    }
  ];
  searchKeyword: string;
  pocId: number;
  serviceName: string;
  productName: string;
  productType: number = 1;
  searchTestTotal: number = 0;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  selectedTest: any;
  isproductVisible: boolean = true;
  @Input()
  procedurePriceDetail: ProcedurePriceDetail;
  isErrorTest: boolean;
  showMessageTest: boolean;
  errorMessageTest: Array<string>;
  isTestVisible: boolean = true;
  pharmacyTest: Array<any>;
  pharmacyAdviseInfoList: Array<Pharmacy>;
  purchaseEnabled: boolean = false;
  dataMessage : any;
  constructor(private pharmacyService: CentralInventryService, private commonUtil: CommonUtil, private spinnerService: SpinnerService) { }
  ngOnInit(): void {

  }
  searchTests(searchKeyword) {
    this.searchKeyword = searchKeyword;
    //this.pocId = this.authService.selectedPocDetails.pocId
    this.productName = this.searchKeyword;
    this.spinnerService.start();
    if (searchKeyword.length > 2) {
      this.pharmacyService.getPharmacyDetailsByName(this.productName, this.productType).then((data) => {
        console.log("ok-------->" + JSON.stringify(data))
        this.spinnerService.stop();
        this.dataMessage = data;
        if (data != null || data != undefined) {
          this.searchTestTotal = data.data.pharmacy.length;
          this.serviceNameSearchList = data.data.pharmacy;
        }
        this.commonUtil.sleep(700);
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      });
    }

  }
  getSearchTestName(searchTestName) {


    for (let i = 0; i < this.serviceNameSearchList.length; i++) {

      if (searchTestName.pocId == this.serviceNameSearchList[i].pocId && searchTestName.productName == this.serviceNameSearchList[i].productName)

        this.selectedTest = this.serviceNameSearchList[i];


    }

    this.procedurePriceDetail = new ProcedurePriceDetail();
    this.procedurePriceDetail.pocId = this.selectedTest.pocId;
    this.procedurePriceDetail.serviceName = this.selectedTest.productName;
    this.searchKeyword = this.selectedTest.productName;
    console.log("get----" + JSON.stringify(this.searchKeyword))
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
    this.isproductVisible = false;


  }
  onEnterPressedTest(event: any) {
    if (event == null || event == '') {
      event = 0;
    }
    this.isproductVisible = true;


  }
  onEnterdownTest(event: any) {
    if (event == null || event == '') {
      event = 0;
    }
    this.isproductVisible = true;

  }
  changeData(type, isValue?) {
    if (type == 'purchaseEnabled') {
      this.selectedTest.purchaseEnabled = !this.selectedTest.purchaseEnabled;
    }

  }
  updateTestCreation(i: number) {
    if (this.selectedTest.grossPrice < this.selectedTest.netPrice) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "MRP should be greater than or Sale Price";
      this.showMessageTest = true;
      return;
    }
    this.spinnerService.start();

    let testCreation = new Pharmacy();
    testCreation.pharmacyStockList = Array<Pharmacy>();
    testCreation.pocId = this.selectedTest.pocId;
    testCreation.pharmacyStockList.push(this.selectedTest)
    testCreation.pharmacyStockList[0].pocId = this.selectedTest.pocId;
    testCreation.pharmacyStockList[0].productName = this.selectedTest.productName;
    testCreation.pharmacyStockList[0].productId = this.selectedTest.productId;
    testCreation.pharmacyStockList[0].purchaseEnabled = this.selectedTest.purchaseEnabled;
    console.log("data999---->", JSON.stringify(testCreation.pharmacyStockList))
    if (this.selectedTest.productName != undefined || this.selectedTest.productName != null) {
      this.pharmacyService.updatebasepharmacy(testCreation.pharmacyStockList).then((data) => {
        console.log("data---->", JSON.stringify(data))
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

