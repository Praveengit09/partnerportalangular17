import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { PharmacyService } from "../../../pharmacy.service";
import { InventorySupplierDetail } from './../../../../model/inventory/inventorySupplierDetail';
import { PharmacyInventoryDetail } from './../../../../model/pharmacy/pharmacyProductsDetailsList';
import { PharmacySelectedProductsDetailsList } from './../../../../model/pharmacy/PharmacySelectedProductsDetailsList';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { GetProductRequest } from './../../../../model/pharmacy/getProductRequest';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { MonthpickerComponent } from './../../../../layout/widget/monthpicker/monthpicker.component';
import { StockDetails } from './../../../../model/product/stockdetails';
import { BaseGenericMedicine } from './../../../../model/pharmacy/baseGenericMedicine';
import { PackingInformation } from './../../../../model/product/packinginformation';
import { Taxes } from './../../../../model/basket/taxes';
import { SupplierDetails } from '../../../../model/inventory/supplierDetails';
import { Config } from '../../../../base/config';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.template.html',
  styleUrls: ['./inventory.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class InventoryComponent implements OnInit {
  config: any;
  month: any;
  year: any;
  startdate: Date;
  datepickerOpts1 = {
    autoclose: true,
    endDate: new Date(),
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }
  datepickerOpts = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }
  expiryDatee: any;

  searchResult: any;
  genericNameSearchResults: any;
  productNameSearchResults: any;
  productCodeSearchResults: any;

  productNameHardReset: boolean = false;
  productCodeHardReset: boolean = false;
  genericNameHardReset: boolean = false;

  supplierResult: any;
  supplierResultLength = 0;
  supplierId: any;

  insertResult: any;
  successMessage: any;
  subTotal: any;
  total: number;
  totalAvg: number = 0;
  totalAll: number = 0;
  totalPrice: number = 0;
  marginPer: string;
  index: number = 0;
  vat: any;
  vatvalue: any;
  supplierError: any;
  addProductError: any;
  addPercentError: any;
  addGstPercentError: any;
  subTotalArr: number[] = new Array();
  inventorySupplierDetail: InventorySupplierDetail = new InventorySupplierDetail();
  pharmacyProductDetailsList: any[];
  tempPharmacyDetailList: any[] = new Array();
  pharmacyProductDisplayList: PharmacySelectedProductsDetailsList[];
  pharmacyProducts: PharmacyInventoryDetail = new PharmacyInventoryDetail();
  productDetail: any;
  pharmacySelectedProductsDetailsList: PharmacySelectedProductsDetailsList = new PharmacySelectedProductsDetailsList();

  vatArray: number[] = new Array();
  priceForVat: number[] = new Array();
  perForVat: number[] = new Array();
  pVat: any = 0;
  perVat: any = 0;
  totalVatCal: number = 0;
  vatCalculate: number = 0;

  //vatCal: VatCal[] = new Array();
  todayDate: any;
  taxAmount: number = 0;
  grandTotal: number = 0;
  grandTotalArr = new Array();
  restrict: any;
  validation: ValidationUtil;
  productNameSelectTotal: number = 0;
  productCodeSelectTotal: number = 0;
  genericNameSelectTotal: number = 0;
  hsSelectBoolean: boolean = true;

  selectColumns: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    },
    {
      variable: 'genericMedicine.genericMedicineName',
      filter: 'text'
    },
    {
      variable: 'brandName',
      filter: 'text'
    }, {
      variable: 'productCode',
      filter: 'text'
    },
    {
      variable: 'drugForm',
      filter: 'text'
    },
    {
      variable: 'medicineStrength',
      filter: 'text'
    }
  ];
  selectSupplierColumns: any[] = [
    {
      variable: 'pocName',
      filter: 'text'
    },
    {
      variable: 'productName',
      filter: 'text'
    }
  ];

  @ViewChild(MonthpickerComponent, { static: false })
  private monthPickerComponent: MonthpickerComponent;
  isPSError: boolean;
  errorPSMessages: any[];
  showPSMessage: boolean;
  isPSErrorCheck: boolean;
  pharmacySelectedProductsDetailsList2: PharmacySelectedProductsDetailsList;
  isMatEnable: boolean = true;

  constructor(private router: Router, private pharmacyService: PharmacyService, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private tValidation: ValidationUtil) {
    this.validation = tValidation;
    console.log("inventory--" + JSON.stringify(this.inventorySupplierDetail));
    this.pharmacyProductDetailsList = new Array();
    this.pharmacyProductDisplayList = new Array();
  }
  onInventoryproduct(): void {
    this.router.navigate(['/app/pharmacy/inventoryproduct'])
  }


  updateInventory() {
    // console.log("supplierInvoicNo: " + this.inventorySupplierDetail.supplierInvoicNo ? this.inventorySupplierDetail.supplierInvoicNo.trim() == "" : false)
    if (this.inventorySupplierDetail.supplierDetails && this.inventorySupplierDetail.supplierDetails.pocName && this.inventorySupplierDetail.supplierDetails.pocName.trim() != ""
      && this.pharmacyProductDetailsList.length > 0 && this.inventorySupplierDetail.type
      && this.inventorySupplierDetail.type != 0 && this.inventorySupplierDetail.supplierInvoicNo && this.inventorySupplierDetail.supplierInvoicNo.trim() != ""
      && this.inventorySupplierDetail.entryNo) {

      this.inventorySupplierDetail.pharmacyInventoryDetails = this.pharmacyProductDetailsList;
      this.inventorySupplierDetail.netAmount = this.totalAvg;
      this.inventorySupplierDetail.invoiceDate = this.commonUtil.convertDateToTimestamp(this.inventorySupplierDetail.invoiceDate);
      this.inventorySupplierDetail.entryDate = this.commonUtil.convertDateToTimestamp(this.inventorySupplierDetail.entryDate);
      console.log("update inventory" + JSON.stringify(this.inventorySupplierDetail));
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.pharmacyService.insertProductDetails(this.inventorySupplierDetail).then(insertResult => {
        this.spinnerService.stop();
        this.insertResult = insertResult;
        if (this.insertResult.statusCode = 200) {
          this.supplierError = "";
          this.totalAvg = 0;
          this.totalAll = 0;
          this.taxAmount = 0;
          this.grandTotal = 0;
          this.vatCalculate = 0;
          this.vatArray = new Array();
          // this.vatCal = new Array();
          this.inventorySupplierDetail = new InventorySupplierDetail();
          this.pharmacyProductDisplayList = new Array();
          this.inventorySupplierDetail.pharmacyInventoryDetails = new Array();
          this.pharmacyProducts = new PharmacyInventoryDetail();
          this.pharmacyProducts.stockDetails = new StockDetails();
          this.pharmacyProducts.genericMedicine = new BaseGenericMedicine();
          this.pharmacyProducts.packingInformation = new PackingInformation();
          this.pharmacyProducts.supplierTaxes = new Taxes();
          this.pharmacyProducts.stockDetails.taxes = new Taxes();

          this.pharmacyProductDetailsList = new Array();
          this.inventorySupplierDetail.type = 0;
          this.supplierId = undefined;
          this.monthPickerComponent.resetDateField();
          (<any>$("#successMessage")).modal("show");
          this.successMessage = "Data Inserted Successfully !!!";
          this.inventorySupplierDetail = new InventorySupplierDetail();
        } else {
          (<any>$("#successMessage")).modal("show");
          this.successMessage = "Data is not inserted successfully !!!";
          //setTimeout(function() { $("#failureMessage").hide(); }, 5000);
        }
      });
    } else if (!this.inventorySupplierDetail.supplierDetails || !this.inventorySupplierDetail.supplierDetails.pocName || this.inventorySupplierDetail.supplierDetails.pocName.trim() == ""
      || !this.inventorySupplierDetail.supplierInvoicNo || this.inventorySupplierDetail.type == 0
      || !this.inventorySupplierDetail.invoiceDate || !this.inventorySupplierDetail.entryDate || !this.inventorySupplierDetail.entryNo) {
      this.supplierError = "Please add supplier details";
    } else if (this.pharmacyProductDetailsList.length < 1 || this.inventorySupplierDetail.type != 0) {
      this.supplierError = "Please add atleast one product";
    } else if (this.inventorySupplierDetail.type == 0) {
      this.supplierError = "Please add Payment Type";
    } else {
      this.supplierError = "All fields are mandatory, Please fill all the fields";
    }
  }


  onMarginCalculate() {
    let margin = parseFloat((((this.pharmacyProducts.stockDetails.packageNetPrice - this.pharmacyProducts.purchaseRate) / this.pharmacyProducts.stockDetails.packageNetPrice) * 100).toFixed(2));
    this.pharmacyProducts.marginPercentage = margin ? margin : 0;
    console.log("BSCheck: ", this.pharmacyProducts.marginPercentage)
  }

  onDateSubmit(selectedDate: Date) {
    console.log("SelectedDate in onDateSubmit::" + selectedDate);
    this.expiryDatee = selectedDate;
  }
  product() {
    this.addProductError = "";
    this.total = this.pharmacyProducts.purchaseRate * this.pharmacyProducts.stockDetails.purchasedQuantity;
    this.totalAvg = this.totalAvg + this.total;
    this.pharmacySelectedProductsDetailsList2 = new PharmacySelectedProductsDetailsList();//for local use
    this.pharmacySelectedProductsDetailsList = new PharmacySelectedProductsDetailsList();
    this.pharmacySelectedProductsDetailsList.selectedProductCode = this.pharmacySelectedProductsDetailsList.selectedProductCode = this.pharmacyProducts.productCode;
    this.pharmacySelectedProductsDetailsList.selectedProductname = this.pharmacyProducts.productName;
    this.pharmacySelectedProductsDetailsList.selectedBatchNumber = this.pharmacyProducts.stockDetails.batchNo;
    this.pharmacySelectedProductsDetailsList.selectedExpiry = new Date(this.expiryDatee).toString();
    this.pharmacySelectedProductsDetailsList.selectedNetPrice = this.pharmacyProducts.stockDetails.packageNetPrice;
    this.pharmacySelectedProductsDetailsList.selectedPurchaseRate = this.pharmacyProducts.purchaseRate;
    this.pharmacySelectedProductsDetailsList.selectedMarginPercent = this.pharmacyProducts.marginPercentage;
    this.pharmacySelectedProductsDetailsList.cgst = this.pharmacyProducts.stockDetails.taxes.cgst;
    this.pharmacySelectedProductsDetailsList.sgst = this.pharmacyProducts.stockDetails.taxes.sgst;
    this.pharmacySelectedProductsDetailsList.igst = this.pharmacyProducts.stockDetails.taxes.igst;
    this.pharmacySelectedProductsDetailsList.selectedQuantity = this.pharmacyProducts.stockDetails.purchasedQuantity + this.pharmacyProducts.freeProductCount;
    this.pharmacySelectedProductsDetailsList.selectedValue = this.pharmacyProducts.quantity;
    this.pharmacySelectedProductsDetailsList.selectedTotalAmount = this.total;
    this.pharmacyProducts.finalAmount = this.total;
    this.pharmacySelectedProductsDetailsList.selectedPackingInformation = this.pharmacyProducts.packingInformation;
    this.pharmacySelectedProductsDetailsList.selectedPackingInformation.packageType = this.pharmacyProducts.packingInformation.packageType;
    this.pharmacySelectedProductsDetailsList.selectedPackingInformation.unitsInPackage = this.pharmacyProducts.packingInformation.unitsInPackage;
    // this.pharmacySelectedProductsDetailsList.selectedPackingInformation=this.pharmacyProducts.packingInformation;

    this.pharmacyProductDisplayList.push(this.pharmacySelectedProductsDetailsList);
    console.log("selected-->" + JSON.stringify(this.pharmacyProductDisplayList));
    this.pharmacyProducts.stockDetails.expiryDate = new Date(this.expiryDatee).getTime();
    this.pharmacyProducts.stockDetails.totalAvailableQuantity = this.pharmacySelectedProductsDetailsList.selectedQuantity

    this.pharmacyProductDetailsList.push(this.pharmacyProducts);
    /* Local Use */

    this.pharmacySelectedProductsDetailsList2.selectedFreeQuantity = this.pharmacyProducts.freeProductCount;
    this.pharmacySelectedProductsDetailsList2.selectedSuppliercgst = this.pharmacyProducts.supplierTaxes.cgst;
    this.pharmacySelectedProductsDetailsList2.selectedSuppliersgst = this.pharmacyProducts.supplierTaxes.sgst;
    this.pharmacySelectedProductsDetailsList2.selectedSupplierigst = this.pharmacyProducts.supplierTaxes.igst;
    this.pharmacySelectedProductsDetailsList2.selectedUnitsInPackage = this.pharmacyProducts.packingInformation.unitsInPackage;
    this.pharmacySelectedProductsDetailsList2.selectedSchedule = this.pharmacyProducts.schedule;
    this.pharmacySelectedProductsDetailsList2.selectedRackNo = this.pharmacyProducts.stockDetails.rackNo;
    this.pharmacySelectedProductsDetailsList2.selectedDrugForm = this.pharmacyProducts.drugForm;
    this.pharmacySelectedProductsDetailsList2.selectedGenericMedicineName = this.pharmacyProducts.genericMedicine.genericMedicineName;
    this.pharmacySelectedProductsDetailsList2.selectedBrandName = this.pharmacyProducts.brandName;
    this.pharmacySelectedProductsDetailsList2.marketedBy = this.pharmacyProducts.marketedBy;


    this.tempPharmacyDetailList.push(this.pharmacySelectedProductsDetailsList2);


    // this.addProductError = "";
    console.log('marketedby', this.pharmacySelectedProductsDetailsList2.marketedBy);
    //GST Calculation starts
    if (this.pharmacyProducts.supplierTaxes.igst > 0 && this.pharmacyProducts.supplierTaxes.igst != undefined && this.pharmacyProducts.supplierTaxes.igst != null) {
      this.taxAmount = (this.totalAvg * this.pharmacyProducts.supplierTaxes.igst / 100);
      console.log("igst" + this.taxAmount);
    } else {
      this.taxAmount = ((this.totalAvg * this.pharmacyProducts.supplierTaxes.cgst / 100)) + ((this.totalAvg * this.pharmacyProducts.supplierTaxes.sgst / 100))
      console.log("sgst" + this.taxAmount);
    }
    this.totalAll = this.total + this.taxAmount;
    this.grandTotalArr.push(this.totalAll);
    this.grandTotal = 0;
    for (let i = 0; i < this.grandTotalArr.length; i++) {
      this.grandTotal = this.grandTotal + this.grandTotalArr[i];
    }

    //GST Calculation End

    console.log(JSON.stringify(this.pharmacyProductDetailsList));
    this.pharmacySelectedProductsDetailsList = null;
    this.pharmacyProducts = new PharmacyInventoryDetail();
    this.pharmacyProducts.stockDetails = new StockDetails();
    this.pharmacyProducts.genericMedicine = new BaseGenericMedicine();
    this.pharmacyProducts.packingInformation = new PackingInformation();
    this.pharmacyProducts.supplierTaxes = new Taxes();
    this.pharmacyProducts.stockDetails.taxes = new Taxes();
    this.expiryDatee = '';
    this.monthPickerComponent.resetDateField();
    $("hs-select>div>input").val("");

  }
  addProduct() {
    this.addProductError = " ";
    /* console.log("batch No-->" + this.pharmacyProducts.stockDetails.batchNo);
    console.log("TopCheck: " + this.expiryDatee);
    console.log("GenericName:" + this.pharmacyProducts.genericMedicine.genericMedicineName ); */
    console.log("Check: ", this.pharmacyProducts.stockDetails.taxes.sgst);
    console.log("SupplierName: " + this.inventorySupplierDetail.supplierDetails.pocName + "-----" + this.inventorySupplierDetail.supplierInvoicNo
      + "-----" + this.inventorySupplierDetail.invoiceDate + "-----" + this.inventorySupplierDetail.type
      + "-----" + this.inventorySupplierDetail.entryNo + "-----" + this.inventorySupplierDetail.entryDate)
    console.log("ProductDetails: " + this.pharmacyProducts.productName + "-----" + this.pharmacyProducts.productCode
      + "-----" + this.pharmacyProducts.stockDetails.purchasedQuantity + "-----" + this.pharmacyProducts.freeProductCount
      + "-----" + this.pharmacyProducts.genericMedicine.genericMedicineName + "-----" + this.expiryDatee
      + "-----" + this.pharmacyProducts.stockDetails.batchNo + "-----" + this.pharmacyProducts.brandName
      + "-----" + this.pharmacyProducts.packingInformation.unitsInPackage + "-----" + this.pharmacyProducts.schedule
      + "-----" + this.pharmacyProducts.stockDetails.rackNo + "-----" + this.pharmacyProducts.stockDetails.packageNetPrice
      + "-----" + this.pharmacyProducts.purchaseRate + "-----" + this.pharmacyProducts.drugForm)
    // && this.pharmacyProducts.stockDetails.packageNetPrice >= 0 &&
    // this.pharmacyProducts.purchaseRate >= 0

    console.log("Boolean: ", this.expiryDatee != 0 + " >>>>: ", this.pharmacyProducts.purchaseRate + ">>>: ",
      (this.pharmacyProducts.freeProductCount != undefined) + ">>>: ", this.pharmacyProducts.stockDetails.packageNetPrice
    + ">>>>: ", this.pharmacyProducts.marginPercentage >= 0);

    if (this.inventorySupplierDetail.supplierDetails.pocName && this.inventorySupplierDetail.supplierDetails.pocName.trim() != "" && this.inventorySupplierDetail.supplierInvoicNo
      && this.inventorySupplierDetail.supplierInvoicNo.trim() != "" && this.inventorySupplierDetail.type > 0 && this.inventorySupplierDetail.entryNo && this.inventorySupplierDetail.entryNo.trim() != "") {
      if (this.pharmacyProducts.stockDetails.batchNo && this.pharmacyProducts.stockDetails.batchNo.trim() != ''
        && this.expiryDatee && this.pharmacyProducts.stockDetails.purchasedQuantity &&
        this.pharmacyProducts.freeProductCount != undefined && this.pharmacyProducts.productName && this.pharmacyProducts.productName.trim() != ''
        && this.pharmacyProducts.productName.length > 3 && this.pharmacyProducts.genericMedicine.genericMedicineName && this.pharmacyProducts.genericMedicine.genericMedicineName.trim() != ''
        && (this.pharmacyProducts.genericMedicine.genericMedicineName.length > 3 || this.pharmacyProducts.genericMedicine.genericMedicineName.trim() == 'NA') && this.pharmacyProducts.productCode && this.pharmacyProducts.productCode.trim() != ''
        && this.pharmacyProducts.packingInformation.unitsInPackage
        && this.pharmacyProducts.packingInformation.unitsInPackage >= 1 &&
        this.pharmacyProducts.schedule && this.pharmacyProducts.schedule.trim() != '' &&
        this.pharmacyProducts.stockDetails.rackNo && this.pharmacyProducts.stockDetails.rackNo.trim() != ''
        && this.expiryDatee && this.expiryDatee != 0 && this.pharmacyProducts.marginPercentage >= 0 &&
        this.pharmacyProducts.stockDetails.packageNetPrice && this.pharmacyProducts.stockDetails.packageNetPrice >= 0 &&
        this.pharmacyProducts.purchaseRate >= 0) {
        if (((this.pharmacyProducts.stockDetails.taxes.sgst != undefined && this.pharmacyProducts.stockDetails.taxes.sgst >= 0 && this.pharmacyProducts.stockDetails.taxes.sgst <= 100
          && this.pharmacyProducts.stockDetails.taxes.cgst != undefined && this.pharmacyProducts.stockDetails.taxes.cgst >= 0 && this.pharmacyProducts.stockDetails.taxes.cgst <= 100)
          || (this.pharmacyProducts.stockDetails.taxes.igst != undefined && this.pharmacyProducts.stockDetails.taxes.igst >= 0 && this.pharmacyProducts.stockDetails.taxes.igst <= 100)
        ) && ((this.pharmacyProducts.supplierTaxes.cgst != undefined && this.pharmacyProducts.supplierTaxes.cgst >= 0 && this.pharmacyProducts.supplierTaxes.cgst <= 100
          && this.pharmacyProducts.supplierTaxes.sgst != undefined && this.pharmacyProducts.supplierTaxes.sgst >= 0 && this.pharmacyProducts.supplierTaxes.sgst <= 100)
          || (this.pharmacyProducts.supplierTaxes.igst != undefined && this.pharmacyProducts.supplierTaxes.igst >= 0 && this.pharmacyProducts.supplierTaxes.igst <= 100)
          )) {
          if (this.pharmacyProducts.packingInformation && this.pharmacyProducts.packingInformation.unitsInPackage >= 1) {
            this.pharmacyProducts.stockDetails.netPrice = +this.pharmacyProducts.stockDetails.packageNetPrice;
            this.pharmacyProducts.stockDetails.unitNetPrice =
              +this.pharmacyProducts.stockDetails.packageNetPrice / +this.pharmacyProducts.packingInformation.unitsInPackage;
          }
          // if (this.pharmacyProducts.packingInformation.unitsInPackage >= 1) {
          // this.pharmacyProducts.stockDetails.packageNetPrice = this.pharmacyProducts.stockDetails.netPrice;
          // this.pharmacyProducts.stockDetails.netPrice = this.pharmacyProducts.stockDetails.unitNetPrice
          //   = +this.pharmacyProducts.stockDetails.packageNetPrice / +this.pharmacyProducts.packingInformation.unitsInPackage;
          this.product();
          // }
        }
        else {
          this.addProductError = "Please fill all the GST related field also. You need to fill either CGST and SGST or IGST for seller and supplier both";
        }
      } else {
        let productName = this.pharmacyProducts.productName,
          genericName = this.pharmacyProducts.genericMedicine.genericMedicineName;
        if ((!productName || productName.trim() == '') && !this.expiryDatee && (!genericName || genericName.trim() == '')) {
          this.addProductError = "Please Add Atleast One Product";
        } else if (!productName || productName.length <= 3 || productName.trim() == '') {
          this.addProductError = "Medicine Name length should be greater than 3";
        } else if (!this.expiryDatee) {
          this.addProductError = "Please add valid Expiry Date";
        } else if (!genericName || genericName.trim() == '' || genericName.length <= 3) {
          this.addProductError = "Please Check Composition";
        } else if (!this.pharmacyProducts.packingInformation || !this.pharmacyProducts.packingInformation.unitsInPackage || this.pharmacyProducts.packingInformation.unitsInPackage < 1) {
          this.addProductError = " Units Per Package Can't be Zero";
        } else {
          console.log("CheckProductName " + productName);
          console.log("batch Noo-->" + this.pharmacyProducts.stockDetails.batchNo);
          console.log('free quantity-->' + this.pharmacyProducts.freeProductCount);
          this.addProductError = "All fields are mandatory, Please fill all the fields";
        }
      }
    } else {
      this.addProductError = "Please fill supplier's information first";
    }
    this.getGrandTotal();
  }

  genericNameSearchTrigger(searchTerm: string) {
    this.searchProduct(searchTerm, 3);
  }

  productNameSearchTrigger(searchTerm: string) {
    this.searchProduct(searchTerm, 2);
  }

  productCodeSearchTrigger(searchTerm: string) {
    this.searchProduct(searchTerm, 1);
  }

  resetSearch() {
    this.searchResult = null;
    this.productCodeSearchResults = null;
    this.productNameSearchResults = null;
    this.genericNameSearchResults = null;
    this.productCodeSelectTotal = 0;
    this.productNameSelectTotal = 0;
    this.genericNameSelectTotal = 0;
  }

  selectTrigger(selected: any) {

    if (!selected.stockDetails) {
      selected.stockDetails = new StockDetails();
    }
    if (!selected.genericMedicine) {
      selected.genericMedicine = new BaseGenericMedicine();
    }
    if (!selected.packingInformation) {
      selected.packingInformation = new PackingInformation();
    }
    if (!selected.supplierTaxes) {
      selected.supplierTaxes = new Taxes();
    }
    if (!selected.stockDetails.taxes) {
      selected.stockDetails.taxes = new Taxes();
    }


    this.resetSearch();
    this.productCodeSelectTotal = 1;
    this.productNameSelectTotal = 1;
    this.genericNameSelectTotal = 1;
    this.pharmacyProducts = selected;
    this.productNameHardReset = true;
    this.productCodeHardReset = true;
    this.genericNameHardReset = true;
    console.log('Triggerring hard reset');
    if (this.supplierId != undefined) {
      var productRequest = new GetProductRequest();
      productRequest.supplierId = this.supplierId;
      productRequest.productCode = this.pharmacyProducts.productCode;
      productRequest.productId = this.pharmacyProducts.productId;
      this.getProduct(productRequest);
    }
    this.productCodeSelectTotal = 0;
    this.productNameSelectTotal = 0;
    this.genericNameSelectTotal = 0;
  }

  searchProduct(key: string, searchCriteria: number) {


    switch (searchCriteria) {
      case 1:
        $("#search-productcode-result").show();
        $("#search-productname-result").hide();
        $("#search-genericname-result").hide();
        this.pharmacyProducts.productCode = key;
        break;
      case 2:
        $("#search-productname-result").show();
        $("#search-productcode-result").hide();
        $("#search-genericname-result").hide();
        this.pharmacyProducts.productName = key;
        break;
      case 3:
        $("#search-genericname-result").show();
        $("#search-productname-result").hide();
        $("#search-productcode-result").hide();
        this.pharmacyProducts.genericMedicine = new BaseGenericMedicine();
        this.pharmacyProducts.genericMedicine.genericMedicineName = key;
        break;
      default:
        $("#search-productcode-result").hide();
        $("#search-productname-result").hide();
        $("#search-genericname-result").hide();
    }
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 1;
    searchRequest.searchCriteria = searchCriteria;
    searchRequest.searchTerm = key;
    searchRequest.size = 1000;
    if (key.length > 2) {
      console.log(JSON.stringify(searchRequest.searchTerm));
      this.productCodeSelectTotal = 0;
      this.productCodeSearchResults = new Array();
      this.productNameSelectTotal = 0;
      this.productNameSearchResults = new Array();
      this.genericNameSelectTotal = 0;
      this.genericNameSearchResults = new Array();
      this.productNameHardReset = false;
      this.productCodeHardReset = false;
      this.genericNameHardReset = false;
      console.log("SearchRequ==>" + JSON.stringify(searchRequest));
      this.pharmacyService.searchProduct(searchRequest).then(searchResult => {
        this.searchResult = searchResult;
        console.log("searchResult==>" + JSON.stringify(searchResult));
        if (searchCriteria == 1) {
          this.productCodeSelectTotal = 0;
          this.productCodeSelectTotal = this.searchResult.length;
          this.productCodeSearchResults = this.searchResult;
          if (this.searchResult.length < 1) {
            this.pharmacyProducts.productCode = searchRequest.searchTerm;
          }
        } else if (searchCriteria == 2) {
          this.productNameSelectTotal = 0;
          this.productNameSelectTotal = this.searchResult.length;
          this.productNameSearchResults = this.searchResult;
          if (this.searchResult < 1) {
            this.pharmacyProducts.productName = searchRequest.searchTerm.trim();
          }
        } else if (searchCriteria == 3) {
          this.genericNameSelectTotal = 0;
          this.genericNameSelectTotal = this.searchResult.length;
          this.genericNameSearchResults = this.searchResult;
          if (this.searchResult < 1) {
            this.pharmacyProducts.genericMedicine.genericMedicineName = searchRequest.searchTerm.trim();
          }
        }

      });
    }
  }
  getProduct(productRequest) {

    this.pharmacyService.getProductDetails(productRequest).then(productDetail => {
      console.log("prd::" + JSON.stringify(productDetail));
      this.productDetail = productDetail;

      if (!this.productDetail.stockDetails) {
        this.productDetail.stockDetails = new StockDetails();
      }
      if (!this.productDetail.genericMedicine) {
        this.productDetail.genericMedicine = new BaseGenericMedicine();
      }
      if (!this.productDetail.packingInformation) {
        this.productDetail.packingInformation = new PackingInformation();
      }
      if (!this.productDetail.supplierTaxes) {
        this.productDetail.supplierTaxes = new Taxes();
      }
      if (!this.productDetail.stockDetails.taxes) {
        this.productDetail.stockDetails.taxes = new Taxes();
      }
      this.pharmacyProducts.stockDetails.batchNo = this.productDetail.stockDetails.batchNo;
      // this.pharmacyProducts.totalQuantity=this.productDetail.totalQuantity;
      // this.pharmacyProducts.freeProductCount=this.productDetail.freeProductCount;
      this.pharmacyProducts.packingInformation.unitsInPackage = this.productDetail.packingInformation.unitsInPackage;
      this.pharmacyProducts.schedule = this.productDetail.schedule;
      this.pharmacyProducts.stockDetails.rackNo = this.productDetail.stockDetails.rackNo;
      this.pharmacyProducts.marginPercentage = this.productDetail.marginPercentage;
      this.pharmacyProducts.purchaseRate = this.productDetail.purchaseRate;
      this.productDetail.brandName ? this.pharmacyProducts.brandName = this.productDetail.brandName : '';
      this.pharmacyProducts.stockDetails.packageNetPrice = this.productDetail.stockDetails.packageNetPrice;
      this.pharmacyProducts.supplierTaxes.sgst = this.productDetail.supplierTaxes.sgst;
      this.pharmacyProducts.supplierTaxes.cgst = this.productDetail.supplierTaxes.cgst;
      this.pharmacyProducts.supplierTaxes.igst = this.productDetail.supplierTaxes.igst;
      this.pharmacyProducts.stockDetails.taxes.sgst = this.productDetail.stockDetails.taxes.sgst;
      this.pharmacyProducts.stockDetails.taxes.cgst = this.productDetail.stockDetails.taxes.cgst;
      this.pharmacyProducts.stockDetails.taxes.igst = this.productDetail.stockDetails.taxes.igst;

      if (this.pharmacyProducts.drugFormId == undefined || this.pharmacyProducts.drugFormId == null) {
        this.pharmacyProducts.drugFormId = this.productDetail.drugFormId;
        this.pharmacyProducts.drugForm = this.productDetail.drugForm;
      }
      if (this.pharmacyProducts.marketedBy == undefined || this.pharmacyProducts.marketedBy == null) {
        this.pharmacyProducts.marketedBy = this.productDetail.marketedBy
      }
      if (this.productDetail.stockDetails.expiryDate != undefined) {
        this.expiryDatee = new Date(this.productDetail.stockDetails.expiryDate);
        this.pharmacyProducts.stockDetails.expiryDate = this.productDetail.stockDetails.expiryDate;
        this.monthPickerComponent.resultmonthandyear = ((this.expiryDatee.getMonth() + 1) + '/' +
          (this.expiryDatee.getFullYear()));
        console.log(this.expiryDatee);
      }
    });
  }
  selectedProduct(product, changeCriteria) {
    this.pharmacyProducts.stockDetails = new StockDetails();
    this.pharmacyProducts.genericMedicine = new BaseGenericMedicine();
    this.pharmacyProducts.packingInformation = new PackingInformation();
    this.pharmacyProducts.supplierTaxes = new Taxes();
    this.pharmacyProducts.stockDetails.taxes = new Taxes();

    if (this.searchResult != undefined) {
      console.log("SearchResult::" + JSON.stringify(this.searchResult));
      switch (changeCriteria) {
        //1 is for Product Code search, 2 is for Product Name search and 3 is for Composition search
        case 1:
          this.pharmacyProducts.productCode = product;
          for (var i = 0; i < this.searchResult.length; i++) {
            if (this.searchResult[i].productCode == this.pharmacyProducts.productCode) {
              this.pharmacyProducts.productId = this.searchResult[i].productId;
              this.pharmacyProducts.productName = this.searchResult[i].productName;
              this.pharmacyProducts.genericMedicine.genericMedicineName = this.searchResult[i].genericMedicine.genericMedicineName;
              this.pharmacyProducts.genericMedicine.genericMedicineId = this.searchResult[i].genericMedicine.genericMedicineId;
              this.pharmacyProducts.stockDetails.expiryDate = this.searchResult[i].stockDetails.expiryDate;
              this.pharmacyProducts.stockDetails.purchasedQuantity = this.searchResult[i].stockDetails.purchasedQuantity;
              this.pharmacyProducts.stockDetails.batchNo = this.searchResult[i].stockDetails.batchNo;
              this.pharmacyProducts.brandName = this.searchResult[i].brandName;
              this.pharmacyProducts.stockDetails.packageNetPrice = this.searchResult[i].stockDetails.packageNetPrice;
              this.pharmacyProducts.drugForm = this.searchResult[i].drugForm;
              this.pharmacyProducts.drugFormId = this.searchResult[i].drugFormId;
              this.pharmacyProducts.marketedBy = this.searchResult[i].marketedBy
              if (this.supplierId != undefined) {
                var productRequest = new GetProductRequest();
                productRequest.supplierId = this.supplierId;
                productRequest.pocId;
                productRequest.productCode = this.searchResult[i].productCode;
                productRequest.productId = this.searchResult[i].productId;
                this.getProduct(productRequest);
              }
            }
          }
          break;
        case 2:
          this.pharmacyProducts.productName = product;
          for (var i = 0; i < this.searchResult.length; i++) {
            if (this.searchResult[i].productName == this.pharmacyProducts.productName) {
              this.pharmacyProducts.productCode = this.searchResult[i].productCode;
              this.pharmacyProducts.productId = this.searchResult[i].productId;
              this.pharmacyProducts.genericMedicine.genericMedicineName = this.searchResult[i].genericMedicine.genericMedicineName;
              this.pharmacyProducts.genericMedicine.genericMedicineId = this.searchResult[i].genericMedicine.genericMedicineId;
              this.pharmacyProducts.stockDetails.purchasedQuantity = this.searchResult[i].stockDetails.purchasedQuantity;
              this.pharmacyProducts.stockDetails.expiryDate = this.searchResult[i].stockDetails.expiryDate;
              this.pharmacyProducts.stockDetails.batchNo = this.searchResult[i].stockDetails.batchNo;
              this.pharmacyProducts.stockDetails.packageNetPrice = this.searchResult[i].stockDetails.packageNetPrice;
              this.pharmacyProducts.brandName = this.searchResult[i].brandName;
              this.pharmacyProducts.drugForm = this.searchResult[i].drugForm;
              this.pharmacyProducts.drugFormId = this.searchResult[i].drugFormId;
              this.pharmacyProducts.marketedBy = this.searchResult[i].marketedBy;

              if (this.supplierId != undefined) {
                var productRequest = new GetProductRequest();
                productRequest.supplierId = this.supplierId;
                productRequest.pocId;
                productRequest.productCode = this.searchResult[i].productCode;
                productRequest.productId = this.searchResult[i].productId;
                this.getProduct(productRequest);
              }
            }
          }
          break;
        case 3:
          this.pharmacyProducts.genericMedicine.genericMedicineName = product;
          for (var i = 0; i < this.searchResult.length; i++) {
            if (this.searchResult[i].genericMedicine.genericMedicineName == this.pharmacyProducts.genericMedicine.genericMedicineName) {
              this.pharmacyProducts.genericMedicine.genericMedicineId = this.searchResult[i].genericMedicine.genericMedicineId;
              this.pharmacyProducts.productCode = this.searchResult[i].productCode;
              this.pharmacyProducts.productId = this.searchResult[i].productId;
              this.pharmacyProducts.productName = this.searchResult[i].productName;
              this.pharmacyProducts.stockDetails.purchasedQuantity = this.searchResult[i].stockDetails.purchasedQuantity;
              this.pharmacyProducts.brandName = this.searchResult[i].brandName;
              this.pharmacyProducts.stockDetails.expiryDate = this.searchResult[i].stockDetails.expiryDate;
              this.pharmacyProducts.stockDetails.batchNo = this.searchResult[i].stockDetails.batchNo;
              this.pharmacyProducts.stockDetails.packageNetPrice = this.searchResult[i].stockDetails.packageNetPrice;
              this.pharmacyProducts.drugForm = this.searchResult[i].drugForm;
              this.pharmacyProducts.drugFormId = this.searchResult[i].drugFormId;
              this.pharmacyProducts.marketedBy = this.searchResult[i].marketedBy;

              if (this.supplierId != undefined) {
                var productRequest = new GetProductRequest();
                productRequest.supplierId = this.supplierId;
                productRequest.pocId;
                productRequest.productCode = this.searchResult[i].productCode;
                productRequest.productId = this.searchResult[i].productId;
                this.getProduct(productRequest);
              }
            }
          }
          break;
        default:
          this.pharmacyProducts.productName = "";
          this.pharmacyProducts.genericMedicine.genericMedicineName = "";
          this.pharmacyProducts.stockDetails.purchasedQuantity = null;
          this.pharmacyProducts.stockDetails.packageNetPrice = null;
      }
    }
  }
  protected searchStr: string;
  //protected supplierResult = [{}];
  searchSupplier(key: string) {
    $("#search-result").show();
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 3;
    searchRequest.id;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.pocName = key;
    delete this.inventorySupplierDetail.supplierDetails;
    this.inventorySupplierDetail.supplierDetails = new SupplierDetails();

    if (key && key.length > 2) {
      this.inventorySupplierDetail.supplierDetails.pocName = key;
      // setTimeout(function(){
      this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
        this.supplierResult = supplierResult;
        this.supplierResultLength = this.supplierResult.length;
        // this.inventorySupplierDetail.supplierName = "";
        if (this.supplierResult && this.supplierResult.length > 0) {
          let idList = new Array();
          this.supplierResult = this.supplierResult.filter(e => {
            if (!idList.includes(e.pocId)) {
              idList.push(e.pocId);
              return true;
            } else return false;
          })
        }

        console.log('searchResult in for--' + key + "---" + JSON.stringify(supplierResult));
      });
      // },300);

    }
  }

  getSupplierId(event) {
    let supplierName = event.pocName;
    supplierName.trim() ? this.inventorySupplierDetail.supplierDetails.pocName = supplierName.trim() : '';
    if (this.supplierResult != undefined) {
      if (this.supplierResult.length > 0) {
        for (let i = 0; i < this.supplierResult.length; i++) {
          if (this.supplierResult[i].pocName == this.inventorySupplierDetail.supplierDetails.pocName) {
            this.supplierId = this.supplierResult[i].pocId;
            this.inventorySupplierDetail.supplierDetails = this.supplierResult[i];
          }
        }
      }
    }
  }
  ngOnInit() {
    this.inventorySupplierDetail.type = 0;
    this.todayDate = new Date();
    this.validation.noMouseScrollforNumberTextBox();
    this.validation.noMouseScrollforNumberTextBox();

    this.pharmacyProducts.stockDetails = new StockDetails();
    this.pharmacyProducts.genericMedicine = new BaseGenericMedicine();
    this.pharmacyProducts.packingInformation = new PackingInformation();
    this.pharmacyProducts.supplierTaxes = new Taxes();
    this.pharmacyProducts.stockDetails.taxes = new Taxes();
  }
  hideSearchResult() {
    $("#search-result").hide();
    $("#search-productcode-result").hide();
    $("#search-productname-result").hide();
    $("#search-genericname-result").hide();
  }

  onKeydown(event) {

  }

  remove(index: number): void {
    this.isPSError = false;
    this.errorPSMessages = new Array();
    this.showPSMessage = false;
    this.isPSErrorCheck = false;
    this.pharmacyProductDisplayList.splice(index, 1);
    this.tempPharmacyDetailList.splice(index, 1);
    this.pharmacyProductDetailsList.splice(index, 1);
    this.grandTotalArr.splice(index, 1);
    this.getGrandTotal();
  }
  editproduct(index: number) {
    this.pharmacyProducts.productName = this.pharmacyProductDisplayList[index].selectedProductname;
    this.pharmacyProducts.productCode = this.pharmacyProductDisplayList[index].selectedProductCode;
    this.pharmacyProducts.stockDetails.purchasedQuantity = this.pharmacyProductDisplayList[index].selectedQuantity - this.tempPharmacyDetailList[index].selectedFreeQuantity;
    this.expiryDatee = new Date(this.pharmacyProductDisplayList[index].selectedExpiry).getTime();
    this.pharmacyProducts.stockDetails.batchNo = this.pharmacyProductDisplayList[index].selectedBatchNumber;
    this.pharmacyProducts.stockDetails.packageNetPrice = this.pharmacyProductDisplayList[index].selectedNetPrice;
    this.pharmacyProducts.purchaseRate = this.pharmacyProductDisplayList[index].selectedPurchaseRate;
    this.pharmacyProducts.marginPercentage = this.pharmacyProductDisplayList[index].selectedMarginPercent;
    this.pharmacyProducts.stockDetails.taxes.cgst = this.pharmacyProductDisplayList[index].cgst;
    this.pharmacyProducts.stockDetails.taxes.sgst = this.pharmacyProductDisplayList[index].sgst;
    this.pharmacyProducts.stockDetails.taxes.igst = this.pharmacyProductDisplayList[index].igst;
    this.pharmacyProducts.packingInformation = this.pharmacyProductDisplayList[index].selectedPackingInformation;
    //local used details
    this.pharmacyProducts.freeProductCount = this.tempPharmacyDetailList[index].selectedFreeQuantity;
    this.pharmacyProducts.supplierTaxes.cgst = this.tempPharmacyDetailList[index].selectedSuppliercgst;
    this.pharmacyProducts.supplierTaxes.sgst = this.tempPharmacyDetailList[index].selectedSuppliersgst;
    this.pharmacyProducts.supplierTaxes.igst = this.tempPharmacyDetailList[index].selectedSupplierigst;
    this.pharmacyProducts.packingInformation.unitsInPackage = this.tempPharmacyDetailList[index].selectedUnitsInPackage;
    this.pharmacyProducts.schedule = this.tempPharmacyDetailList[index].selectedSchedule;
    this.pharmacyProducts.stockDetails.rackNo = this.tempPharmacyDetailList[index].selectedRackNo;
    this.pharmacyProducts.drugForm = this.tempPharmacyDetailList[index].selectedDrugForm;
    this.pharmacyProducts.genericMedicine.genericMedicineName = this.tempPharmacyDetailList[index].selectedGenericMedicineName;
    this.pharmacyProducts.brandName = this.tempPharmacyDetailList[index].selectedBrandName;
    this.pharmacyProducts.marketedBy = this.tempPharmacyDetailList[index].marketedBy;


    this.total = this.pharmacyProducts.purchaseRate * this.pharmacyProducts.stockDetails.purchasedQuantity;
    this.totalAvg = this.totalAvg - this.total;
    this.remove(index);
    this.grandTotal = 0;
    for (var i = 0; i < this.grandTotalArr.length; i++) {
      this.grandTotal = this.grandTotal + this.grandTotalArr[i];
    }
    this.hsSelectBoolean = false;
    setTimeout(() => { this.hsSelectBoolean = true }, 100)
    // this.hsSelectBoolean = !this.hsSelectBoolean;
    this.getGrandTotal();
  }
  getDate(d): string {
    return this.commonUtil.convertToDate(d);
  }
  getGrandTotal() {
    let total: number = 0;
    this.taxAmount = 0;
    for (let i = 0; i < this.pharmacyProductDisplayList.length; i++) {
      let taxAmount: number = 0;
      if (this.pharmacyProductDisplayList[i] &&
        this.pharmacyProductDisplayList[i].igst > 0 &&
        this.pharmacyProductDisplayList[i].igst != undefined &&
        this.pharmacyProductDisplayList[i].igst != null) {
        taxAmount = (this.pharmacyProductDisplayList[i].selectedTotalAmount * this.pharmacyProductDisplayList[i].igst / 100);
      } else {
        taxAmount = ((this.pharmacyProductDisplayList[i].selectedTotalAmount * this.pharmacyProductDisplayList[i].cgst / 100)) + ((this.pharmacyProductDisplayList[i].selectedTotalAmount * this.pharmacyProductDisplayList[i].sgst / 100));
      }
      this.taxAmount += taxAmount;
      total = total + parseFloat(this.pharmacyProductDisplayList[i].selectedTotalAmount) + taxAmount;
    }
    // if (this.inventorySupplierDetail.discountPercentage && this.inventorySupplierDetail.discountPercentage != undefined && this.inventorySupplierDetail.discountPercentage != null && this.inventorySupplierDetail.discountPercentage > 0) {
    //   total = total - (total * this.inventorySupplierDetail.discountPercentage) / 100;
    // }
    // if (this.inventorySupplierDetail.additionalDiscount && this.inventorySupplierDetail.additionalDiscount != undefined && this.inventorySupplierDetail.additionalDiscount != null && this.inventorySupplierDetail.additionalDiscount > 0) {
    //   total = total - this.inventorySupplierDetail.additionalDiscount;
    // }
    this.grandTotal = total;
  }
  validPercent() {
    this.addPercentError = " ";
    if (this.inventorySupplierDetail.discountPercentage > 100 || this.inventorySupplierDetail.additionalDiscount > 100 || this.inventorySupplierDetail.zeroPercValue > 100) {
      this.addPercentError = "Enter valid data";
    }
  }
  validGst() {
    this.addGstPercentError = " ";
    if (this.pharmacyProducts.stockDetails.taxes.sgst > 100 || this.pharmacyProducts.stockDetails.taxes.cgst > 100 || this.pharmacyProducts.stockDetails.taxes.igst > 100
      || this.pharmacyProducts.supplierTaxes.cgst > 100 || this.pharmacyProducts.supplierTaxes.sgst > 100 || this.pharmacyProducts.supplierTaxes.igst > 100) {
      this.addGstPercentError = "Enter valid GST value";
    }
  }
}
