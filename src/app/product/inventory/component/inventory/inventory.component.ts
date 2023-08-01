import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { MonthpickerComponent } from '../../../../layout/widget/monthpicker/monthpicker.component';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Taxes } from '../../../../model/basket/taxes';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { InventorySupplierDetail } from '../../../../model/inventory/inventorySupplierDetail';
import { GetProductRequest } from '../../../../model/pharmacy/getProductRequest';
import { ProductInventoryDetail } from '../../../../model/product/productinventorydetail';
import { StockDetails } from '../../../../model/product/stockdetails';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { ProductInventoryService } from '../../productinventory.service';
import { Config } from '../../../../base/config';
import { AdminService } from './../../../../admin/admin.service';
import { SupplierDetails } from '../../../../model/inventory/supplierDetails';


@Component({
  selector: 'inventory',
  templateUrl: './inventory.template.html',
  styleUrls: ['./inventory.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class ProductInventoryComponent implements OnInit {

  inventoryDetail: InventorySupplierDetail = new InventorySupplierDetail();
  selectedProduct: ProductInventoryDetail;
  config: any;
  productNameSearchResults: any;
  productNameHardReset: boolean = false;
  productNameSelectTotal: number = 0;
  resetProductNameComponent: boolean = true;
  supplierResult: any;
  supplierResultLength = 0;
  successMessage: any;
  supplierError: any;
  addProductError: any;
  addPercentError: any;
  addGstPercentError: any;
  validation: ValidationUtil;
  insertResult = undefined;
  isSupplierFefresh: boolean = false;
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

  selectColumns: any[] = [
    {
      variable: 'productName',
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

  subTotal: number;
  taxAmount: number;
  isMatEnable: boolean = true;

  @ViewChild(MonthpickerComponent, { static: false })
  private monthPickerComponent: MonthpickerComponent;

  constructor(private router: Router, private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService, private adminService: AdminService,
    private productInventoryService: ProductInventoryService,
    private commonUtil: CommonUtil, private tValidation: ValidationUtil) {
    this.validation = tValidation;

    this.inventoryDetail.productInventoryDetails = new Array();

    this.selectedProduct = new ProductInventoryDetail();
    this.selectedProduct.stockDetails = new StockDetails();
    this.selectedProduct.stockDetails.taxes = new Taxes();
    this.selectedProduct.supplierTaxes = new Taxes();
  }

  ngOnInit() {
    this.inventoryDetail.type = 0;
    this.validation.noMouseScrollforNumberTextBox();
    this.validation.noMouseScrollforNumberTextBox();
  }

  onInventoryproduct(): void {
    this.router.navigate(['/app/pharmacy/inventoryproduct'])
  }

  onMarginCalculate() {
    this.selectedProduct.marginPercentage = parseFloat((((this.selectedProduct.stockDetails.netPrice - this.selectedProduct.purchaseRate) / this.selectedProduct.stockDetails.netPrice) * 100).toFixed(2));
  }

  onDateSubmit(selectedDate: Date) {
    this.selectedProduct.stockDetails.expiryDate = selectedDate.getTime();
  }

  addProduct() {
    this.addProductError = "";
    if (this.inventoryDetail.supplierDetails && this.inventoryDetail.supplierDetails.pocName && this.inventoryDetail.supplierDetails.pocName.trim() != ""
      && this.inventoryDetail.supplierInvoicNo && this.inventoryDetail.supplierInvoicNo.trim() != ""
      && this.inventoryDetail.type && this.inventoryDetail.type > 0
      && this.inventoryDetail.entryNo && this.inventoryDetail.entryNo.trim() != "") {

      if (this.selectedProduct.stockDetails.batchNo && this.selectedProduct.stockDetails.batchNo.trim() != ''
        && this.selectedProduct.stockDetails.expiryDate && this.selectedProduct.stockDetails.expiryDate > 0
        && this.selectedProduct.stockDetails.purchasedQuantity && this.selectedProduct.stockDetails.purchasedQuantity > 0
        && (this.selectedProduct.freeProductCount || this.selectedProduct.freeProductCount == 0) && this.selectedProduct.productName
        && this.selectedProduct.productName.trim() != '' && this.selectedProduct.productName.length > 3
        && this.selectedProduct.stockDetails.rackNo && this.selectedProduct.stockDetails.rackNo.trim() != ''
        && this.selectedProduct.stockDetails.netPrice
        && this.selectedProduct.purchaseRate && this.selectedProduct.purchaseRate != 0) {

        if (((this.selectedProduct.stockDetails.taxes.sgst != undefined && this.selectedProduct.stockDetails.taxes.sgst >= 0 && this.selectedProduct.stockDetails.taxes.sgst <= 100
          && this.selectedProduct.stockDetails.taxes.cgst != undefined && this.selectedProduct.stockDetails.taxes.cgst >= 0 && this.selectedProduct.stockDetails.taxes.cgst <= 100)
          || (this.selectedProduct.stockDetails.taxes.igst != undefined && this.selectedProduct.stockDetails.taxes.igst >= 0 && this.selectedProduct.stockDetails.taxes.igst <= 100)
        ) && ((this.selectedProduct.supplierTaxes.cgst != undefined && this.selectedProduct.supplierTaxes.cgst >= 0 && this.selectedProduct.supplierTaxes.cgst <= 100
          && this.selectedProduct.supplierTaxes.sgst != undefined && this.selectedProduct.supplierTaxes.sgst >= 0 && this.selectedProduct.supplierTaxes.sgst <= 100)
          || (this.selectedProduct.supplierTaxes.igst != undefined && this.selectedProduct.supplierTaxes.igst >= 0 && this.selectedProduct.supplierTaxes.igst <= 100)
          )) {

          this.processAddedProduct();

        }
        else {
          this.addProductError = "Please fill all the GST related field also. You need to fill either CGST and SGST or IGST for seller and supplier both";
        }

      } else {
        if (!this.selectedProduct.productName || this.selectedProduct.productName.length <= 3 || this.selectedProduct.productName.trim() == '') {
          this.addProductError = "Product Name should be greater than 3 characters";
        } else if (!this.selectedProduct.stockDetails.expiryDate) {
          this.addProductError = "Please add valid expiry date";
        } else {
          this.addProductError = "Please fill all the mandatory fields";
        }
      }

    } else {
      this.addProductError = "Please fill supplier's information first";
    }

    this.getGrandTotal();

  }
  refreshSuplierFields() {
    this.isSupplierFefresh = true;
    setTimeout(() => {
      this.isSupplierFefresh = false;
    }, 100)
  }

  processAddedProduct() {
    this.addProductError = "";

    this.calculateGrossPrice(this.selectedProduct.stockDetails);
    this.selectedProduct.finalAmount = +this.selectedProduct.purchaseRate * +this.selectedProduct.stockDetails.purchasedQuantity;
    this.selectedProduct.stockDetails.totalAvailableQuantity = (this.selectedProduct.stockDetails.totalAvailableQuantity && this.selectedProduct.stockDetails.totalAvailableQuantity > 0 ? +this.selectedProduct.stockDetails.totalAvailableQuantity : 0) + +this.selectedProduct.stockDetails.purchasedQuantity + +this.selectedProduct.freeProductCount;

    // Add the product to the list
    if (this.inventoryDetail.productInventoryDetails==undefined) {
      this.inventoryDetail.productInventoryDetails = new Array();
    }
    this.inventoryDetail.productInventoryDetails.push(this.selectedProduct);

    // Initialize the product
    this.selectedProduct = new ProductInventoryDetail();
    this.selectedProduct.stockDetails = new StockDetails();
    this.selectedProduct.stockDetails.taxes = new Taxes();
    this.selectedProduct.supplierTaxes = new Taxes();

    this.monthPickerComponent.resetDateField();
    $("hs-select>div>input").val("");

  }

  calculateGrossPrice(stockDetails: StockDetails) {
    if (stockDetails.netPrice > 0 && stockDetails.taxes && (
      (stockDetails.taxes.cgst && stockDetails.taxes.cgst > 0)
      || (stockDetails.taxes.sgst && stockDetails.taxes.sgst > 0)
      || (stockDetails.taxes.igst && stockDetails.taxes.igst > 0))) {

      let totalTaxes = +stockDetails.taxes.cgst + +stockDetails.taxes.sgst;

      if (totalTaxes <= 0) {
        totalTaxes = stockDetails.taxes.igst;
      }

      let grossAmount = +stockDetails.netPrice / (1 + +totalTaxes / 100);

      stockDetails.taxes.cgstAmount = this.roundToTwo(+grossAmount * (+stockDetails.taxes.cgst / 100));
      stockDetails.taxes.sgstAmount = this.roundToTwo(+grossAmount * (+stockDetails.taxes.sgst / 100));
      stockDetails.taxes.igstAmount = this.roundToTwo(+grossAmount * (+stockDetails.taxes.igst / 100));

      let totalTaxesAmount = stockDetails.taxes.cgstAmount + stockDetails.taxes.sgstAmount;

      if (totalTaxesAmount == 0 && stockDetails.taxes.igstAmount > 0) {
        totalTaxesAmount = stockDetails.taxes.igstAmount;
      }
      stockDetails.grossPrice = +stockDetails.netPrice - +totalTaxes;

    } else {
      stockDetails.grossPrice = stockDetails.netPrice;
    }
  }

  roundToTwo(num) {
    num = num + "e+2";
    return +(Math.round(num) + "e-2");
  }

  productNameSearchTrigger(searchTerm: string) {
    this.searchProduct(searchTerm, 2);
  }

  resetSearch() {
    this.productNameSearchResults = null;
    this.productNameSelectTotal = 0;
  }

  selectTrigger(selected: any) {

    this.selectedProduct = selected;

    this.resetSearch();
    this.productNameSelectTotal = 1;
    this.productNameHardReset = true;

    if (!this.selectedProduct.stockDetails) {
      this.selectedProduct.stockDetails = new StockDetails();
    }
    if (!this.selectedProduct.supplierTaxes) {
      this.selectedProduct.supplierTaxes = new Taxes();
    }
    if (!this.selectedProduct.stockDetails.taxes) {
      this.selectedProduct.stockDetails.taxes = new Taxes();
    }

    if (this.inventoryDetail.supplierDetails && this.inventoryDetail.supplierDetails.pocId && this.selectedProduct
      && this.selectedProduct.productId > 0) {
      var productRequest = new GetProductRequest();
      productRequest.supplierId = this.inventoryDetail.supplierDetails.pocId;
      productRequest.productId = this.selectedProduct.productId;
      this.getProductMetaInformation(productRequest);
    }
    this.productNameSelectTotal = 0;
  }

  getProductMetaInformation(productRequest) {
    this.productInventoryService.getProductDetails(productRequest).then(productDetail => {
      if (productDetail && productDetail.stockDetails) {
        this.selectedProduct.supplierTaxes = productDetail.supplierTaxes ? productDetail.supplierTaxes : new Taxes();
        this.selectedProduct.marginPercentage = productDetail.marginPercentage;
        this.selectedProduct.purchaseRate = productDetail.purchaseRate;
        this.selectedProduct.stockDetails.grossPrice = productDetail.stockDetails.grossPrice;
        this.selectedProduct.stockDetails.netPrice = productDetail.stockDetails.netPrice;
        this.selectedProduct.stockDetails.taxes = productDetail.stockDetails.taxes ? productDetail.stockDetails.taxes : new Taxes();
        this.selectedProduct.stockDetails.batchNo = productDetail.stockDetails.batchNo;
        this.selectedProduct.stockDetails.rackNo = productDetail.stockDetails.rackNo;
        this.selectedProduct.stockDetails.expiryDate = productDetail.stockDetails.expiryDate;
      }
    });
  }

  searchProduct(key: string, searchCriteria: number) {
    $("#search-productname-result").show();
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 1;
    searchRequest.id;
    searchRequest.searchCriteria = searchCriteria;
    searchRequest.searchTerm = key;
    searchRequest.size = 1000;
    searchRequest.brandId = Config.portal.brandId;
    if (key.length > 2) {
      console.log(JSON.stringify(searchRequest.searchTerm));
      this.productNameSelectTotal = 0;
      this.productNameSearchResults = new Array();
      this.productNameHardReset = false;
      this.adminService.searchProduct(searchRequest).then(searchResult => {
        this.productNameSearchResults = searchResult;
        this.productNameSelectTotal = 0;
        this.productNameSelectTotal = searchResult.length;
        if (searchResult < 1) {
          this.selectedProduct.productName = searchRequest.searchTerm.trim();
        }
      });
    }
  }

  searchSupplier(key: string) {
    $("#search-result").show();
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 3;
    searchRequest.id;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.pocName=key;
    delete this.inventoryDetail.supplierDetails;
    this.inventoryDetail.supplierDetails = new SupplierDetails();
    if (key.length > 2) {
      this.inventoryDetail.supplierDetails.pocName = key;
      this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
        this.supplierResult = supplierResult;
        this.supplierResultLength = this.supplierResult.length;
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
    } else this.supplierResult = undefined;
  }

  getSupplierId(event) {
    let supplierName = event.pocName;
    supplierName.trim() ? this.inventoryDetail.supplierDetails.pocName = supplierName.trim() : '';
    if (this.supplierResult != undefined) {
      if (this.supplierResult.length > 0) {
        for (let i = 0; i < this.supplierResult.length; i++) {
          if (this.supplierResult[i].pocName == this.inventoryDetail.supplierDetails.pocName) {
            this.inventoryDetail.supplierDetails.pocId = this.supplierResult[i].pocId;
          }
        }
      }
    }
  }

  hideSearchResult() {
    $("#search-productname-result").hide();
  }

  onKeydown(event) {

  }

  remove(index: number): void {
    this.inventoryDetail.productInventoryDetails.splice(index, 1);
    this.getGrandTotal();
  }

  editproduct(index: number) {
    this.resetProductNameComponent = false;
    setTimeout(() => { this.resetProductNameComponent = true; }, 500)
    this.selectedProduct = this.inventoryDetail.productInventoryDetails[index];

    this.inventoryDetail.productInventoryDetails.splice(index, 1);
    this.getGrandTotal();
  }

  getDate(d): string {
    return this.commonUtil.convertToDate(d);
  }

  getGrandTotal() {
    this.subTotal = 0;
    this.taxAmount = 0;
    for (let i = 0; i < this.inventoryDetail.productInventoryDetails.length; i++) {
      let product = this.inventoryDetail.productInventoryDetails[i];
      if (product) {
        if ((product.supplierTaxes.cgst && product.supplierTaxes.cgst > 0)
          || (product.supplierTaxes.sgst && product.supplierTaxes.sgst > 0)
          || (product.supplierTaxes.igst && product.supplierTaxes.igst > 0)) {
          let tax = 0;
          if (tax <= 0 && +product.supplierTaxes.cgst > 0) {
            tax = (+product.supplierTaxes.cgst / 100) + (+product.supplierTaxes.sgst / 100);
          }
          if (tax <= 0 && product.supplierTaxes.igst > 0) {
            tax = (+product.supplierTaxes.igst / 100)
          } else if (tax <= 0) {
            tax = 0;
          }
          console.log('Tax% is3 ' + tax + "//" + this.subTotal);
          let totalTaxAmt = this.roundToTwo(+product.finalAmount * +tax);
          this.taxAmount = this.roundToTwo(+this.taxAmount + +totalTaxAmt);
        }
        this.subTotal = this.roundToTwo(+this.subTotal + +product.finalAmount);
      }
    }
    this.inventoryDetail.netAmount = +this.subTotal + +this.taxAmount;
  }

  validPercent() {
    this.addPercentError = " ";
    if (this.inventoryDetail.discountPercentage > 100 || this.inventoryDetail.additionalDiscount > 100 || this.inventoryDetail.zeroPercValue > 100) {
      this.addPercentError = "Enter valid data";
    }
  }
  validGst() {
    this.addGstPercentError = " ";
    if (this.selectedProduct.stockDetails.taxes.sgst > 100 || this.selectedProduct.stockDetails.taxes.cgst > 100 || this.selectedProduct.stockDetails.taxes.igst > 100
      || this.selectedProduct.supplierTaxes.cgst > 100 || this.selectedProduct.supplierTaxes.sgst > 100 || this.selectedProduct.supplierTaxes.igst > 100) {
      this.addGstPercentError = "Enter valid GST value";
    }
  }
  updateInventory() {

    if (this.inventoryDetail.supplierDetails && this.inventoryDetail.supplierDetails.pocName && this.inventoryDetail.supplierDetails.pocName.trim() != ""
      && this.inventoryDetail.supplierInvoicNo && this.inventoryDetail.supplierInvoicNo.trim() != ""
      && this.inventoryDetail.type && this.inventoryDetail.type > 0
      && this.inventoryDetail.entryNo && this.inventoryDetail.entryNo.trim() != "") {

      if (this.inventoryDetail.productInventoryDetails && this.inventoryDetail.productInventoryDetails.length > 0) {
        this.inventoryDetail.invoiceDate = this.commonUtil.convertDateToTimestamp(this.inventoryDetail.invoiceDate);
        this.inventoryDetail.entryDate = this.commonUtil.convertDateToTimestamp(this.inventoryDetail.entryDate);
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.productInventoryService.insertProductDetails(this.inventoryDetail).then(response => {
          this.insertResult = response;
          this.spinnerService.stop();
          if (response.statusCode == 200) {
            this.supplierError = "";
            this.taxAmount = 0;
            this.subTotal = 0;
            this.inventoryDetail = new InventorySupplierDetail();
            this.inventoryDetail.productInventoryDetails = new Array<ProductInventoryDetail>();
            this.refreshSuplierFields();
            this.selectedProduct = new ProductInventoryDetail();
            this.selectedProduct.stockDetails = new StockDetails();
            this.selectedProduct.stockDetails.taxes = new Taxes();
            this.selectedProduct.supplierTaxes = new Taxes();
            this.monthPickerComponent.resetDateField();
            (<any>$("#successMessage")).modal("show");
            this.successMessage = "Stock updated Successfully!";
            this.inventoryDetail = new InventorySupplierDetail();
          } else {
            (<any>$("#successMessage")).modal("show");
            this.successMessage = "Problem occurred updating the stock information!";
          }
        });
      } else {
        this.supplierError = "Please add atleast one product";
      }

    } else {
      this.supplierError = "Please add supplier details";
    }
  }
}
