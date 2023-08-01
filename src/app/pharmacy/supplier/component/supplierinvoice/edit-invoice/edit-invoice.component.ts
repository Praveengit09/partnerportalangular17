import { PackingInformation } from './../../../../../model/product/packinginformation';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../../app.config';
import { Config } from '../../../../../base/config';
import { AuthService } from '../../../../../auth/auth.service';
import { SupplierInvoiceStatus } from '../../../../../constants/supplier/supllierInvoiceCompletion';
import { SpinnerService } from '../../../../../layout/widget/spinner/spinner.service';
import { BBCartItem } from '../../../../../model/basket/b2bcartitem';
import { CartItem } from '../../../../../model/basket/cartitem';
import { Payment } from '../../../../../model/basket/payment';
import { Taxes } from '../../../../../model/basket/taxes';
import { Product } from '../../../../../model/product/product';
import { StockDetails } from '../../../../../model/product/stockdetails';
import { PharmacyService } from "../../../../pharmacy.service";
import { AdminService } from './../../../../../admin/admin.service';
import { ValidationUtil } from './../../../../../base/util/validation-util';
import { BasketConstants } from './../../../../../constants/basket/basketconstants';
import { SearchRequest } from './../../../../../model/common/searchRequest';
import { BasketDiscount } from './../../../../../model/package/basketDiscount';
import { FileUtil } from '../../../../../base/util/file-util';

@Component({
  selector: 'editinvoice',
  templateUrl: './edit-invoice.template.html',
  styleUrls: ['./edit-invoice.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class EditSupplierInvoice implements OnDestroy, OnInit {

  config: any;
  orderDetails: BBCartItem = null;
  prodList: Product[] = [];

  selectedProdIndex: number = 0;
  selectedProduct: Product = null;

  supplierAdviseTrack: BBCartItem;

  tempTax = new Taxes();
  tempStockDetails: StockDetails = new StockDetails();
  tempPackingInformation: PackingInformation = new PackingInformation();
  isBasketCalculated = false;
  transactionId: string = '';
  paymentModeIndex: number = 2;
  paymentStatus: number = 0;
  cartType = 'pharmacyList';
  selectColumns: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    }
  ];
  searchResult: any[] = [];
  searchResultLength = 0;
  otherDiscountMode = 0;
  otherDiscountAmountPercent: number = 0;
  otherDiscountAmount: number = 0;
  debounceFn = null;
  month: any;
  year: any;
  startdate: Date;
  fileUploadData: string;
  fileDownloadData: any;
  uploadFilesList: any;
  hasCheckBoxValidation: boolean = false;
  checkBoxValidationMessage: string;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  showPackingInfo: boolean;
  productId: Array<number> = new Array<number>();
  productList: Array<Product> = new Array<Product>();

  @ViewChild('productFileUpload', { static: false })
  myInputVariable: any;

  constructor(config: AppConfig, private location: Location, public validation: ValidationUtil,
    private pharmacyService: PharmacyService, private authService: AuthService, private adminService: AdminService,
    private router: Router, private spinnerService: SpinnerService, private fileUtil: FileUtil) {
    this.supplierAdviseTrack = this.pharmacyService.getSupplierAdviseTrack();
    console.log('oninit==>', this.supplierAdviseTrack);
    this.config = config.getConfig();
    this.debounceFn = this.debouncing();
  }

  debouncing() {
    var timer = setTimeout(() => { }, 100);
    return (fn, delay = 200) => {
      clearTimeout(timer);
      timer = setTimeout(() => { fn() }, delay);
    };
  }

  ngOnInit(): void {
    this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH;
    this.isBasketCalculated = this.pharmacyService.isBasketCalculated();
    let localData = this.isBasketCalculated ?
      this.pharmacyService.getSupplierCalculatedAdvise() : this.pharmacyService.getSupplierAdviseTrack();
    if (localData) { this.orderDetails = localData; }
    else { this.router.navigate([this.pharmacyService.supplierBackPageLoc]); }
    console.log(localData);

    if (this.orderDetails) {
      let cartItemType = this.orderDetails.cartItemType;
      if (cartItemType === CartItem.B2B_CART_ITEM_TYPE_PHARMACY) {
        this.cartType = 'pharmacyList';
        this.showPackingInfo = true;
      } else if (cartItemType === CartItem.B2B_CART_ITEM_TYPE_PRODUCT) {
        this.cartType = 'productList';
        this.showPackingInfo = false;
      }
      this.prodList = this.orderDetails.pharmacyList ? this.orderDetails.pharmacyList : this.orderDetails.productList;
      this.prodList.forEach(prod => { this.calculateProd(prod); this.productId.push(prod.productId); });
      this.getSupplierProductSug(this.productId);
    }


    this.pharmacyService.getFileUrl(this.authService.selectedPocDetails.pocId, this.orderDetails.orderId).then(res => {

      this.fileDownloadData = res.data;
      console.log("file ---", this.fileDownloadData);
    });

  }
  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');F
  }
  async searchProduct(key: string, searchCriteria, item?) {
    // this.showProductDropDown();
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 1;
    searchRequest.id;
    searchRequest.searchCriteria = searchCriteria;
    searchRequest.searchTerm = key;
    searchRequest.brandId = Config.portal.brandId;

    if (item) item.productName = key;
    if (key.length > 2) {
      console.log(JSON.stringify(searchRequest.searchTerm));
      let searchResult = null;
      if (this.cartType == 'pharmacyList') {
        searchResult = await this.pharmacyService.searchProduct(searchRequest);
      } else if (this.cartType == 'productList') {
        searchResult = await this.adminService.searchProduct(searchRequest);
      }
      this.searchResult = searchResult;
      this.searchResultLength = searchResult.length
      console.log('searchResult in for--' + key + '---' + JSON.stringify(searchResult));
    }
    // else {
    //   $('#search-result_medicine').hide();
    // }
  }
  selectProduct(product: any, stockOrder: Product) {
    const INDEX = this.prodList.findIndex((item: Product) => item.productId == stockOrder.productId)

    if (product != undefined && product.productId > 0) {
      this.prodList[INDEX] = { ...product };
      this.calculateProd(this.prodList[INDEX]);
    }
    // $("#search-productname-result").hide();
    let temp = [];
    temp.push(product.productId);
    this.getSupplierProductSug(temp);
  }
  applyOtherDiscount(val) {
    let originalAmount: number = 0;
    this.prodList.forEach(prod => {
      this.calculateProd(prod);
      originalAmount += prod.originalAmount;
    });

    if (!this.otherDiscountMode || this.otherDiscountMode == 0) {
      //percent to value
      this.otherDiscountAmountPercent = val;
      this.otherDiscountAmount = originalAmount * (val / 100);
    } else {
      this.otherDiscountAmount = val;
      this.otherDiscountAmountPercent = (val / originalAmount) * 100;
    }
    this.otherDiscountAmountPercent = this.pharmacyService.roundToTwo(this.otherDiscountAmountPercent);
    this.otherDiscountAmount = this.pharmacyService.roundToTwo(this.otherDiscountAmount);
    this.debounceFn(() => {
      let otherDis = new BasketDiscount();
      otherDis.discountAmount = this.otherDiscountAmount;
      otherDis.percent = this.otherDiscountAmountPercent;
      otherDis.type = BasketConstants.DISCOUNT_TYPE_PARTNER;
      let datalist = this.orderDetails.basketDiscount.filter(d => d.type != otherDis.type);
      datalist.push(otherDis);
      this.orderDetails.basketDiscount = datalist;
      this.onNext();
    }, 500);
  }
  checkDiscountSelection(type) {
    this.otherDiscountMode = type;
  }
  updateStockDetails(index) {
    this.selectedProdIndex = index;
    this.selectedProduct = this.prodList[index];
    this.tempStockDetails = { ... new StockDetails(), ...this.selectedProduct.stockDetails };
    if (this.showPackingInfo)
      this.tempPackingInformation = { ...new PackingInformation(), ...this.selectedProduct.packingInformation };
    (<any>$)('#updateStockdetails').modal('show');
  }
  updateTax(index) {
    this.selectedProdIndex = index;
    this.selectedProduct = this.prodList[index];
    this.tempTax = { ...this.selectedProduct.taxes };
    (<any>$)('#updateTaxation').modal('show');
  }
  updateItem(type) {
    if (type === 'tax') {
      this.prodList[this.selectedProdIndex].taxes = { ...this.tempTax };
      this.calculateProd(this.prodList[this.selectedProdIndex]);
    }
    else if (type === 'stock') {
      this.prodList[this.selectedProdIndex].stockDetails = { ...this.tempStockDetails };
      this.prodList[this.selectedProdIndex].packingInformation = { ...this.tempPackingInformation };
      console.log("pavan-----", JSON.stringify(this.tempPackingInformation))
      this.calculateProd(this.prodList[this.selectedProdIndex].stockDetails);
      // let selectedProds: any = this.prodList.filter(prod => prod.isSelected);
      // this.isValidList(this.prodList);
    }
    console.log(this.prodList[this.selectedProdIndex]);

  }

  remove(stockOrder) {
    const INDEX: number = this.prodList.indexOf(stockOrder);
    this.prodList.splice(INDEX, 1);
  }
  addProduct() {
    this.prodList.unshift(new Product());
  }
  onGenerateBack() {
    if (this.isBasketCalculated) {
      this.isBasketCalculated = false;
      this.pharmacyService.saveSupplierOrdersLocalstore(this.isBasketCalculated);
    }
    else { this.location.back(); }
  }

  selectPayMode(type: number) { this.paymentModeIndex = type; }
  selectPaymentStatus(type: number) { this.paymentStatus = type; }
  onNext() {
    let selectedProds: any = this.prodList
    // .filter(prod => prod.isSelected);
    if (this.isValidList(selectedProds)) {
      let basket = new BBCartItem();
      basket = {
        ...this.orderDetails,
      };
      console.log(basket);

      basket[this.cartType] = selectedProds;
      this.pharmacyService.supplierCalculateBasket(basket).then((basketRes) => {
        if (basketRes.statusCode >= 200 && basketRes.statusCode < 400) {
          this.prodList = basketRes[this.cartType];
          // : selectedProds,
          this.orderDetails = this.pharmacyService.supplierOrderDetails = { ...basket, ...basketRes };
          this.isBasketCalculated = true;
          this.pharmacyService.saveSupplierOrdersLocalstore(this.isBasketCalculated);
          // this.router.navigate(['/app/pharmacy/supplier/summary']);
        }
      });

    }
  }
  confirmOrder() {
    let basket = new BBCartItem();
    basket = { ...this.orderDetails, };
    basket.payment.transactionType = this.paymentModeIndex;
    basket.payment.paymentStatus = this.paymentStatus;
    basket.invoiceCompletionStatus = SupplierInvoiceStatus.B2B_PHARMACY_ICS_INVOICED;
    // SupplierInvoiceStatus
    this.pharmacyService.supplierInitiatePayment(basket).then(res => {
      if (this.paymentStatus == 1)
        alert("Payment Updated Successfully");
      else
        alert('Order Initiated Successfully,Payment is Pending');
      this.pharmacyService.cleanSupplierOrdersLocalstore();
      this.router.navigate(['/app/pharmacy/supplier/invoicelist']);
    });
  }
  SendQuotation() {
    console.log(this.orderDetails);

    let selectedProds: any = this.prodList
    if (this.isValidList(selectedProds)) {
      let basket = new BBCartItem();
      basket = {
        ...this.orderDetails,
      };
      basket[this.cartType] = selectedProds;
      basket.invoiceCompletionStatus = 1

      this.pharmacyService.supplierSendQuotation(basket).then(res => {
        alert("Quatation Generated Successfully");
        this.router.navigate(['/app/pharmacy/supplier/orderlist']);
      }
      )
    }
  }

  isValidList(productlist: Product[]) {
    let isError = false;
    this.prodList.forEach(prod => {
      prod.isErrorFound = false;

      if (!prod.netPrice) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ["Please Update Price !! Price can't be zero !!"];
      } else if (!prod.quantity) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ['Please Update Quantity'];
      }
      else if (!prod.stockDetails) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ['Please Update Stock Details'];
      } else if (!prod.stockDetails.netPrice) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ['Please Update Stock Details MRP'];
      } else if (!prod.stockDetails.batchNo || !prod.stockDetails.batchNo.trim()) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ['Please Update Stock Details Batch No'];
      } else if (!prod.stockDetails.expiryDate) {
        prod.isErrorFound = true;
        prod.isErrorMsg = ['Please Update Stock Details Expiry Date'];
      } else if (this.showPackingInfo) {
        if (prod.packingInformation.packageType == 'package') {
          prod.isErrorFound = true;
          prod.isErrorMsg = ['Please Update Package Type'];
        }
        if (!prod.packingInformation.unitsInPackage || prod.packingInformation.unitsInPackage <= 0) {
          prod.isErrorFound = true;
          prod.isErrorMsg = ['Please Update Units in Package'];
        }
      }
      let filteredProd = productlist.find(dt => dt.productId == prod.productId);
      if (!filteredProd) {
        prod.isErrorFound = false;
      }
    });
    isError = this.prodList.some(prod => prod.isErrorFound);
    if (!isError && !productlist.length) {
      isError = true;
      alert('Please Select at least one item !!')
    }
    // this.prodList[0].discountPrice
    return !isError;
  }
  onDateSubmit(dt) { this.tempStockDetails.expiryDate = +dt.getTime(); }
  isNumber(e) {
    let numberRegex = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;
    let val = e.target.value;
    console.log(val, e.key);
    return numberRegex.test(val + e.key) || (!val && numberRegex.test(e.key + 0));
  }
  isAllSelected() { return this.prodList.length && this.prodList.every(prod => prod.isSelected); }
  selectAll() {
    let doSelect = !this.isAllSelected();
    this.prodList.forEach(prod => { prod.isSelected = doSelect });
  }
  selectItem(i) { this.prodList[i].isSelected = !this.prodList[i].isSelected; }

  restrictingToOnlyNumberInputes(event) {
    var key = window.event ? event.keyCode : event.which;
    return (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39) ?
      true : (key < 48 || key > 57 ? false : true); //number(0-9), .(dot), backspace, leftShif, rightShift
  }

  checkQuantity(event, item) {
    if (item.stockDetails && item.stockDetails.totalAvailableQuantity && event.target.value > item.stockDetails.totalAvailableQuantity) {
      item.quantity = item.stockDetails.totalAvailableQuantity;
    }
    else {
      item.quantity = event.target.value;
    }
    this.calculateProd(item)
  }

  calculateProd(element) {
    element.netPrice = element.netPrice ? +element.netPrice : 0;
    element.quantity = element.quantity ? +element.quantity : 0;
    element.discountPrice = +element.discountPrice ? +element.discountPrice : 0;
    if (+element.netPrice >= 0 && +element.quantity >= 0) {
      let taxAmtPerUnit: number = 0;

      //tax calculation
      element.totalTaxes = new Taxes();
      // if (!element.taxes) { element.taxes = new Taxes(); }
      // else {
      if (element.taxes) {
        element.taxes.cgst = element.totalTaxes.cgst = element.taxes.cgst && element.taxes.cgst >= 0 ? +element.taxes.cgst : 0;
        element.taxes.sgst = element.totalTaxes.sgst = element.taxes.sgst && element.taxes.sgst >= 0 ? +element.taxes.sgst : 0;
        element.taxes.igst = element.totalTaxes.igst = element.taxes.igst && element.taxes.igst >= 0 ? +element.taxes.igst : 0;
      }
      let totalTaxPer = element.totalTaxes.igst > 0 ? (+element.totalTaxes.igst) : (+element.totalTaxes.cgst + +element.totalTaxes.sgst);

      //calculated grossprice
      element.grossPrice = this.pharmacyService.calculateGrossprice(element.netPrice, element.discountPrice, +totalTaxPer);
      if (element.taxes) {
        element.taxes.cgstAmount = +(+element.grossPrice - +element.discountPrice) * +element.taxes.cgst / 100;
        element.taxes.sgstAmount = +(+element.grossPrice - +element.discountPrice) * +element.taxes.sgst / 100;
        element.taxes.igstAmount = +(+element.grossPrice - +element.discountPrice) * +element.taxes.igst / 100;
      } else {
        element.taxes = new Taxes();
        element.taxes.cgstAmount = 0;
        element.taxes.sgstAmount = 0;
        element.taxes.igstAmount = 0;
      }
      element.totalTaxes.cgstAmount = +element.quantity * +element.taxes.cgstAmount;
      element.totalTaxes.sgstAmount = +element.quantity * +element.taxes.sgstAmount;
      element.totalTaxes.igstAmount = +element.quantity * +element.taxes.igstAmount;

      if (element.taxes.igstAmount && element.taxes.igstAmount > 0) {
        taxAmtPerUnit = +element.taxes.igstAmount;
      } else {
        taxAmtPerUnit = +element.taxes.cgstAmount + +element.taxes.sgstAmount;
      }
      element.taxationAmount = taxAmtPerUnit * +element.quantity;
      element.originalAmount = +element.grossPrice * +element.quantity;
      element.otherDiscountAmount = +element.discountPrice * +element.quantity;
      element.finalAmount = +element.originalAmount + +element.taxationAmount - +element.otherDiscountAmount;

    }
    element.netPrice = this.pharmacyService.roundToTwo(element.netPrice);
    return element;
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
    this.hasCheckBoxValidation = false;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;

    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    } else if (this.uploadFilesList.length > 1) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select only one file at one time.';
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {

        }
        else {
          this.hasCheckBoxValidation = true;
          this.checkBoxValidationMessage = 'Only xls, xlsx files are supported';
          return;
        }
      }
    }
  }

  onUploadButtonClick() {

    if (this.hasCheckBoxValidation) {
      return;
    }
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();

    this.fileUtil.fileUploadToAwsS3(null, this.uploadFilesList[0], 0, false, false).then((awsS3FileResult) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
        return;
      }
      this.orderDetails.orderFileDetails = awsS3FileResult.Location;
      this.orderDetails.payment = new Payment();
      this.orderDetails.payment.transactionType = this.paymentModeIndex;
      this.orderDetails.payment.paymentStatus = this.paymentStatus;
      this.orderDetails.invoiceCompletionStatus = 0;
      // SupplierInvoiceStatus
      this.pharmacyService.supplierInitiatePayment(this.orderDetails).then(res => {
        this.spinnerService.stop();
        if (res.statusCode == 201 || res.statusCode == 200) {
          alert('Invoice Generated Successfully');
          this.pharmacyService.cleanSupplierOrdersLocalstore();
          this.router.navigate(['/app/pharmacy/supplier/invoicelist']);
        }
        else {
          this.myInputVariable.nativeElement.value = "";
          this.errorMessage = new Array();
          this.showMessage = true;
          this.isError = true;
          this.errorMessage[0] = res.statusMessage ? res.statusMessage : "Please try again";
          var $el = $('#files');
          (<any>$el.wrap('<form>').closest('form').get(0)).reset();
          $el.unwrap();
        }
      }).catch(error => {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
      });
    }).catch(err => {
      this.spinnerService.stop();
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Something went wrong. Please try again later.";
      this.showMessage = true;
    });

  }

  getSupplierProductSug(productIds) {
    let req: any = {};
    req.pocId = this.authService.selectedPocDetails.pocId;
    req.productId = productIds;
    this.spinnerService.start();
    this.pharmacyService.getSupplierProductSuggestion(req).then(res => {
      this.spinnerService.stop();
      this.productList = res;
      if (this.productList.length > 0)
        this.assignValues();
    });
  }

  assignValues() {
    this.prodList.forEach(prod => {
      this.productList.forEach(product => {
        if (product.productId == prod.productId) {
          prod.stockDetails = product.stockDetails;
          prod.packingInformation = product.packingInformation;
          prod.stockDetails.netPrice = this.roundToTwo(product.stockDetails.netPrice * product.packingInformation.unitsInPackage);
          prod.marginPercentage = product.marginPercentage;
          prod.taxes = new Taxes();
          prod.netPrice = product.purchaseRate;
          prod.stockDetails.discountPrice = this.roundToTwo((product.stockDetails.netPrice * product.marginPercentage) / 100);
        }
      })
    });
    this.prodList.forEach(prod => { this.calculateProd(prod); })
  }

  roundToTwo(num) {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }

}
