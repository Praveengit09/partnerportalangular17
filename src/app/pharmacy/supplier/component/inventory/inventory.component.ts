import { AuthService } from './../../../../auth/auth.service';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PharmacyService } from "../../../pharmacy.service";
import { MonthpickerComponent } from './../../../../layout/widget/monthpicker/monthpicker.component';
import { Taxes } from './../../../../model/basket/taxes';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { BaseGenericMedicine } from './../../../../model/pharmacy/baseGenericMedicine';
import { PharmacyInventoryDetail } from './../../../../model/pharmacy/pharmacyProductsDetailsList';
import { PharmacySelectedProductsDetailsList } from './../../../../model/pharmacy/PharmacySelectedProductsDetailsList';
import { PackingInformation } from './../../../../model/product/packinginformation';
import { StockDetails } from './../../../../model/product/stockdetails';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.template.html',
  styleUrls: ['./inventory.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class InventoryComponent implements OnInit {
  
  expiryDatee: any;

  searchResult: any;
  genericNameSearchResults: any;
  productNameSearchResults: any;
  productCodeSearchResults: any;

  productNameHardReset: boolean = false;
  productCodeHardReset: boolean = false;
  genericNameHardReset: boolean = false;

  insertResult: any;
  successMessage: any;
  total: number;
  totalAvg: number = 0;
  marginPer: string;

  supplierError: any;
  addProductError: any;
  addGstPercentError: any;

  pharmacyProductDetailsList: any[]; //final update pojo
  tempPharmacyDetailList: any[] = new Array(); //stores all products
  pharmacyProductDisplayList: PharmacySelectedProductsDetailsList[]; // used for table display 
  pharmacyProducts: PharmacyInventoryDetail = new PharmacyInventoryDetail(); // product pojo which will insert in final
  productDetail: any;
  pharmacySelectedProductsDetailsList: PharmacySelectedProductsDetailsList = new PharmacySelectedProductsDetailsList();

  todayDate: any;
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

  @ViewChild(MonthpickerComponent, { static: false })
  private monthPickerComponent: MonthpickerComponent;
  isPSError: boolean;
  errorPSMessages: any[];
  showPSMessage: boolean;
  isPSErrorCheck: boolean;
  pharmacySelectedProductsDetailsList2: PharmacySelectedProductsDetailsList;

  constructor(private router: Router, private pharmacyService: PharmacyService, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private tValidation: ValidationUtil, private auth: AuthService) {
    this.validation = tValidation;
    this.pharmacyProductDetailsList = new Array();
    this.pharmacyProductDisplayList = new Array();
  }

  updateInventory() {
    if (this.pharmacyProductDetailsList.length < 1) {
      this.supplierError = "Please add atleast one product";
      return;
    } 
     let finalReq  = {
      "supplierInventoryDetails" : this.pharmacyProductDetailsList,
      "pocId" : this.auth.userAuth.pocId
     };

      $('html, body').animate({ scrollTop: '0px' }, 300);
     this.spinnerService.start();
     this.pharmacyService.insertSupplierProductDetails(finalReq).then(insertResult => {
      this.spinnerService.stop();
      this.insertResult = insertResult;
      if (this.insertResult.statusCode = 200) {
        this.totalAvg = 0;
        this.supplierError = "";
        this.pharmacyProductDisplayList = new Array();
        this.pharmacyProductDetailsList = new Array();
        this.monthPickerComponent.resetDateField();
        (<any>$("#successMessage")).modal("show");
        this.successMessage = "Data Inserted Successfully !!!";
      } else {
        (<any>$("#successMessage")).modal("show");
        this.successMessage = "Data is not inserted successfully !!!";
      }
    });
  }


  onMarginCalculate() {
    console.log("BSCheck")
    this.pharmacyProducts.marginPercentage = parseFloat((((this.pharmacyProducts.stockDetails.packageNetPrice - this.pharmacyProducts.purchaseRate) / this.pharmacyProducts.stockDetails.packageNetPrice) * 100).toFixed(2));
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
    this.supplierError = "";
    console.log("addProduct",JSON.stringify(this.pharmacyProducts));
    if (this.pharmacyProducts.stockDetails.batchNo && this.pharmacyProducts.stockDetails.batchNo.trim() != ''
      && this.pharmacyProducts.stockDetails.purchasedQuantity && this.pharmacyProducts.freeProductCount != undefined && this.pharmacyProducts.productName && this.pharmacyProducts.productName.trim() != ''
      && this.pharmacyProducts.productName.length > 3 && this.pharmacyProducts.genericMedicine.genericMedicineName && this.pharmacyProducts.genericMedicine.genericMedicineName.trim() != ''
      && (this.pharmacyProducts.genericMedicine.genericMedicineName.length > 3 || this.pharmacyProducts.genericMedicine.genericMedicineName.trim() == 'NA') && this.pharmacyProducts.productCode && this.pharmacyProducts.productCode.trim() != '' && this.pharmacyProducts.packingInformation.unitsInPackage
      && this.pharmacyProducts.packingInformation.unitsInPackage >= 1 && this.pharmacyProducts.schedule && this.pharmacyProducts.schedule.trim() != '' && this.pharmacyProducts.stockDetails.rackNo && this.pharmacyProducts.stockDetails.rackNo.trim() != ''
      && this.pharmacyProducts.stockDetails.packageNetPrice && this.pharmacyProducts.purchaseRate && this.pharmacyProducts.purchaseRate != 0 && this.pharmacyProducts.marginPercentage
      && this.pharmacyProducts.marginPercentage >= 0 && this.expiryDatee && this.expiryDatee != 0) {
      if (((this.pharmacyProducts.stockDetails.taxes.sgst != undefined && this.pharmacyProducts.stockDetails.taxes.sgst >= 0 && this.pharmacyProducts.stockDetails.taxes.sgst <= 100
        && this.pharmacyProducts.stockDetails.taxes.cgst != undefined && this.pharmacyProducts.stockDetails.taxes.cgst >= 0 && this.pharmacyProducts.stockDetails.taxes.cgst <= 100)
        || (this.pharmacyProducts.stockDetails.taxes.igst != undefined && this.pharmacyProducts.stockDetails.taxes.igst >= 0 && this.pharmacyProducts.stockDetails.taxes.igst <= 100)
      )) {
        if (this.pharmacyProducts.packingInformation && this.pharmacyProducts.packingInformation.unitsInPackage >= 1) {
          this.pharmacyProducts.stockDetails.netPrice = +this.pharmacyProducts.stockDetails.packageNetPrice;
          this.pharmacyProducts.stockDetails.unitNetPrice =
            +this.pharmacyProducts.stockDetails.packageNetPrice / +this.pharmacyProducts.packingInformation.unitsInPackage;
        }
        this.product();
      }
      else {
        this.addProductError = "Please fill all the GST related field also. You need to fill either CGST and SGST or IGST";
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

  ngOnInit() {
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

  remove(index: number): void {
    this.isPSError = false;
    this.errorPSMessages = new Array();
    this.showPSMessage = false;
    this.isPSErrorCheck = false;
    this.pharmacyProductDisplayList.splice(index, 1);
    this.tempPharmacyDetailList.splice(index, 1);
    this.pharmacyProductDetailsList.splice(index, 1);
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
    this.hsSelectBoolean = false;
    setTimeout(() => { this.hsSelectBoolean = true }, 100)
  }

  getDate(d): string {
    return this.commonUtil.convertToDate(d);
  }

  validGst() {
    this.addGstPercentError = " ";
    if (this.pharmacyProducts.stockDetails.taxes.sgst > 100 || this.pharmacyProducts.stockDetails.taxes.cgst > 100 || this.pharmacyProducts.stockDetails.taxes.igst > 100) {
      this.addGstPercentError = "Enter valid GST value";
    }
  }
}
