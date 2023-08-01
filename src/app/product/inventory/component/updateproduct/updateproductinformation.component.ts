import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { Product } from '../../../../model/product/product';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ProcedurePriceDetail } from '../../../../model/procedure/procedurePriceDetail';
import { ProductInventoryService } from '../../productinventory.service';
import { Config } from '../../../../base/config';

@Component({
  selector: 'updateproduct',
  templateUrl: './updateproductinformation.template.html',
  styleUrls: ['./updateproductinformation.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class UpdateProductInformation implements OnInit {
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
  productType: number = 2;
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
  appId: number;
  dataMessage : any;
  constructor(private pharmacyService: ProductInventoryService, private commonUtil: CommonUtil, private spinnerService: SpinnerService) {
    if (Config.portal) {
      this.appId = Config.portal.appId;
    }
  }
  ngOnInit(): void {



  }
  searchTests(searchKeyword) {
    this.searchKeyword = searchKeyword;
    //this.pocId = this.authService.selectedPocDetails.pocId
    this.productName = this.searchKeyword;
    this.spinnerService.start();
    if (searchKeyword.length > 2) {
      this.pharmacyService.getProductDetailsByName(this.productName, this.productType).then((data) => {
        console.log(("ok--------->"), JSON.stringify(data))
        this.spinnerService.stop();
        this.dataMessage = data;
        this.searchTestTotal = data.data.product.length;
        this.serviceNameSearchList = data.data.product;
        console.log(("ok--------->"), JSON.stringify(data))
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

    let testCreation = new Product();
    testCreation.productStockList = Array<Product>();
    testCreation.pocId = this.selectedTest.pocId;
    testCreation.productStockList.push(this.selectedTest)
    testCreation.productStockList[0].pocId = this.selectedTest.pocId;
    testCreation.productStockList[0].productName = this.selectedTest.productName;
    testCreation.productStockList[0].productId = this.selectedTest.productId;
    testCreation.productStockList[0].purchaseEnabled = this.selectedTest.purchaseEnabled;
    if (this.selectedTest.productName != undefined || this.selectedTest.productName != null) {
      this.pharmacyService.updatebaseproduct(testCreation.productStockList, this.appId).then((data) => {
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