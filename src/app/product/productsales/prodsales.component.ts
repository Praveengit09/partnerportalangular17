import { Component, ViewEncapsulation, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../model/basket/cartitem';
import { ProductService } from '../walkin/productorder.service';
import { AuthService } from '../../auth/auth.service';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
import { Product } from '../../model/product/product';
import { Taxes } from '../../model/basket/taxes';
import { StockDetails } from '../../model/product/stockdetails';
import { SearchRequest } from '../../model/common/searchRequest';

import { CommonUtil } from '../../base/util/common-util';
import { PackingInformation } from '../../model/product/packinginformation';
import { ValidationUtil } from '../../base/util/validation-util';
import { GetProductRequest } from '../../model/pharmacy/getProductRequest';
import { BasketDiscount } from '../../model/package/basketDiscount';
import { BasketConstants } from '../../constants/basket/basketconstants';
import { Config } from '../../base/config';
import { AdminService } from './../../admin/admin.service';


@Component({
  selector: 'prodsales-component',
  templateUrl: './prodsales.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./prodsales.style.scss']
})
export class ProdsalesComponent implements OnInit {

  @Input() cartItem: CartItem;
  @Output('changeValue') cartItemChange: EventEmitter<any> = new EventEmitter();
  pdfHeaderType: number;
  productNameSearchResults: any;
  productNameSelectTotal: number = 0;
  productNameHardReset: boolean = false;
  selectColumns: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    }
  ];
  isError: boolean;
  showMessage: boolean;
  errorMessage: any[];
  isErrorCheck: boolean;
  validation: any;

  errorPSMessages: Array<string> = new Array();
  isPSError: boolean;
  showPSMessage: boolean;

  selectedProduct: Product;
  selectProductError: string;
  selectedProductIndex: number;
  moreProductAvailable: boolean;

  constructor(private adminService: AdminService, private commonUtil: CommonUtil,
    private productService: ProductService, private authService: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private validationUtil: ValidationUtil) {
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.validation = validationUtil;
  }

  ngOnInit() {
    if (this.cartItem && this.cartItem.productList && this.cartItem.productList.length > 0) {
      this.cartItem.productList.forEach(element => {
        if (!element.stockList) {
          element.stockList = new Array();
        }
        if (!element.taxes) {
          element.taxes = new Taxes();
        } if (!element.totalTaxes)
          element.totalTaxes = new Taxes();
        if (!element.stockDetails)
          element.stockDetails = new StockDetails();
        if (!element.stockDetails.taxes)
          element.stockDetails.taxes = new Taxes();
        let request: GetProductRequest = new GetProductRequest();
        request.productId = element.productId;
        request.pocId = this.authService.userAuth.pocId;
        this.productService.getProduct(request).then(productList => {
          if (productList && productList.length > 0) {
            element.stockList = productList;
            if (productList.length == 1 && productList[0] && productList[0].stockDetails) {
              let tempSelected = this.clone(productList[0]);
              element.stockDetails = tempSelected.stockDetails;
              element.grossPrice = tempSelected.stockDetails.grossPrice;
              element.netPrice = tempSelected.stockDetails.netPrice;
              element.taxes = tempSelected.stockDetails.taxes;
            }
          }
        });
      });
    }
  }

  addNewMedicineRow() {
    $("hs-select").find(".search_table").css("display", "none !important");
    // Reset the search results if any so that the dropdown is not shown in the new row
    this.resetSearch();
    // Add new row
    let product = new Product();
    product.taxes = new Taxes();
    product.totalTaxes = new Taxes();
    product.stockDetails = new StockDetails();
    product.stockDetails.taxes = new Taxes();
    product.stockList = new Array();
    if (!this.cartItem.productList) {
      this.cartItem.productList = new Array<Product>();
    }
    this.cartItem.productList.push(product);
    this.resetDiscount();
  }

  resetSearch() {
    this.productNameSearchResults = null;
    this.productNameSelectTotal = 0;
    this.productNameHardReset = false;
  }

  resetDiscount() {
    let tempCartItem = this.cartItem;
    tempCartItem.isReset = true;
    this.cartItem = { ...tempCartItem };
  }

  productNameSearchTrigger(searchTerm: string) {
    this.resetSearch();
    var searchRequest = new SearchRequest();
    searchRequest.searchTerm = searchTerm;
    searchRequest.brandId = Config.portal.brandId;
    searchRequest.from = 0;
    searchRequest.size = 1000;
    if (searchTerm.length > 2) {
      console.log("Search Term >> " + JSON.stringify(searchRequest.searchTerm));
      this.adminService.searchProduct(searchRequest).then(searchResult => {
        this.productNameSelectTotal = searchResult.length;
        this.productNameSearchResults = searchResult;
        this.commonUtil.sleep(700);
      });
    }
  }

  selectTrigger(selected: any, index: number) {
    console.log("selectTrigger: " + selected + ">>>" + index);
    this.resetSearch();
    this.resetDiscount();

    this.productNameSelectTotal = 1;
    this.productNameHardReset = true;

    if (!selected.taxes) {
      selected.taxes = new Taxes();
    }
    if (!selected.totalTaxes) {
      selected.totalTaxes = new Taxes();
    }
    if (!selected.stockDetails) {
      selected.stockDetails = new StockDetails();
    }
    if (!selected.stockDetails.taxes) {
      selected.stockDetails.taxes = new Taxes();
    }
    if (!selected.packingInformation) {
      selected.packingInformation = new PackingInformation();
    }
    if (!selected.discountPrice) {
      selected.discountPrice = 0;
    }
    this.cartItem.productList[index] = selected;

    let request: GetProductRequest = new GetProductRequest();
    request.productId = selected.productId;
    request.pocId = this.authService.userAuth.pocId;
    this.productService.getProduct(request).then(productList => {
      if (productList && productList.length > 0) {
        this.cartItem.productList[index].stockList = productList;
        if (productList.length == 1 && productList[0] && productList[0].stockDetails) {
          this.cartItem.productList[index].stockDetails = productList[0].stockDetails;
          this.cartItem.productList[index].grossPrice = productList[0].stockDetails.grossPrice;
          this.cartItem.productList[index].netPrice = productList[0].stockDetails.netPrice;
          this.cartItem.productList[index].taxes = productList[0].stockDetails.taxes;
          this.onQuantityChange();
        }
      } else {
        this.setOutOfstockDetails(index);
      }
    });
    this.productNameSelectTotal = 0;
    this.onQuantityChange();
  }

  setOutOfstockDetails(index) {
    delete this.cartItem.productList[index].stockDetails.totalAvailableQuantity;
    delete this.cartItem.productList[index].stockDetails.rackNo;
    delete this.cartItem.productList[index].stockDetails.batchNo;
    delete this.cartItem.productList[index].stockDetails.expiryDate;
    this.onQuantityChange();
  }

  onProductChange(): void {
    this.isError = false;
    this.showMessage = false;
  }

  onQuantityChange(): void {

    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    if (this.cartItem.productList != null
      && this.cartItem.productList.length > 0) {
      this.calculateCost(this.cartItem.productList);
    } else {
      this.cartItem.payment.originalAmount = 0;
      this.cartItem.payment.taxationAmount = 0;
      this.cartItem.payment.finalAmount = 0;
      this.cartItemChange.emit(this.cartItem);
    }
  }

  // calculateCost() {
  //   let originalAmount: number = 0;
  //   let taxationAmount: number = 0;
  //   let otherDiscountAmount: number = 0;
  //   this.cartItem.productList.forEach(element => {
  //     if (element.stockDetails && element.stockDetails.grossPrice > 0) {
  //       element.netPrice = this.setValueOr0(+element.stockDetails.netPrice);
  //       // element.grossPrice = this.setValueOr0(+element.stockDetails.grossPrice);
  //       element.taxes = element.stockDetails.taxes;
  //       element.discountPrice = 0;
  //     }
  //     let isDeci = ('' + this.setValueOr0(element.netPrice)).includes('.');
  //     element.netPrice = isDeci ? element.netPrice : +element.netPrice;
  //     element.grossPrice = element.netPrice;
  //     element.quantity = !isNaN(+element.quantity) ? +element.quantity : undefined;
  //     if (element.grossPrice >= 0 && element.quantity >= 0) {
  //       element.totalTaxes = new Taxes();
  //       if (element.taxes != undefined && element.taxes != null) {
  //         element.taxes.cgst = element.taxes.cgst != undefined && element.taxes.cgst > 0 ? element.taxes.cgst : 0;
  //         element.taxes.sgst = element.taxes.sgst != undefined && element.taxes.sgst > 0 ? element.taxes.sgst : 0;
  //         element.taxes.igst = element.taxes.igst != undefined && element.taxes.igst > 0 ? element.taxes.igst : 0;
  //         element.taxes.cgstAmount = this.roundToTwo(element.grossPrice * element.taxes.cgst / 100);
  //         element.taxes.sgstAmount = this.roundToTwo(element.grossPrice * element.taxes.sgst / 100);
  //         element.taxes.igstAmount = this.roundToTwo(element.grossPrice * element.taxes.igst / 100);
  //       }

  //       let taxAmountPerUnit: number = 0;
  //       if ((element.taxes.cgstAmount || element.taxes.sgstAmount) && +element.taxes.cgstAmount + +element.taxes.sgstAmount > 0) {
  //         taxAmountPerUnit = +element.taxes.cgstAmount + +element.taxes.sgstAmount;
  //       } else if (element.taxes.igstAmount && +element.taxes.igstAmount > 0) {
  //         taxAmountPerUnit = +element.taxes.igstAmount;
  //       }
  //       // element.netPrice = +element.grossPrice + +taxAmountPerUnit - +element.discountPrice;
  //       element.grossPrice = element.netPrice - taxAmountPerUnit;

  //       element.originalAmount = element.grossPrice * element.quantity;
  //       element.otherDiscountAmount = element.discountPrice * element.quantity;

  //       // Original Amount For All Product
  //       originalAmount = +originalAmount + +element.originalAmount;
  //       otherDiscountAmount = +otherDiscountAmount + element.otherDiscountAmount;

  //       //taxation Amount For All Products
  //       element.totalTaxes.cgstAmount = (element.quantity * element.taxes.cgstAmount);
  //       element.totalTaxes.sgstAmount = (element.quantity * element.taxes.sgstAmount);
  //       element.totalTaxes.igstAmount = (element.quantity * element.taxes.igstAmount);
  //       if (+element.totalTaxes.cgstAmount + +element.totalTaxes.sgstAmount > 0) {
  //         element.taxationAmount = +element.totalTaxes.cgstAmount + +element.totalTaxes.sgstAmount;
  //       } else if (+element.totalTaxes.igstAmount > 0)
  //         element.taxationAmount = +element.totalTaxes.igstAmount;
  //       else
  //         element.taxationAmount = 0
  //       taxationAmount = +taxationAmount + +element.taxationAmount;
  //       element.finalAmount = +element.originalAmount + +element.taxationAmount - +element.otherDiscountAmount;
  //       this.cartItem.payment.originalAmount = +originalAmount;
  //       this.cartItem.payment.taxationAmount = +taxationAmount;
  //       this.cartItem.payment.finalAmount = +originalAmount + +taxationAmount - +otherDiscountAmount;
  //       this.resetDiscount();
  //       console.log("333333" + JSON.stringify(element));
  //     }
  //     else {
  //       element.netPrice = 0;
  //       element.originalAmount = 0;
  //       element.taxationAmount = 0;
  //       element.finalAmount = 0;
  //     }
  //   });
  //   this.cartItem.payment.originalAmount = originalAmount;
  //   this.cartItem.payment.taxationAmount = taxationAmount;
  //   this.cartItem.payment.otherDiscountAmount = otherDiscountAmount;
  //   this.cartItem.payment.finalAmount = originalAmount + taxationAmount
  //     + (this.cartItem.deliveryAmount ? this.cartItem.deliveryAmount : 0)
  //     - (this.cartItem.payment.otherDiscountAmount ? this.cartItem.payment.otherDiscountAmount : 0);

  //   this.cartItem.basketDiscount = new Array();
  //   if (otherDiscountAmount > 0) {
  //     let tmpBasketDiscount: BasketDiscount = new BasketDiscount();
  //     tmpBasketDiscount.type = BasketConstants.DISCOUNT_TYPE_PROMOTIONAL;
  //     tmpBasketDiscount.discountAmount = otherDiscountAmount;
  //     tmpBasketDiscount.percent = (otherDiscountAmount * 100) / this.cartItem.payment.finalAmount;
  //   }
  //   this.cartItemChange.emit(this.cartItem);
  // }

  roundToTwo(num) {
    num = num + "e+2";
    return +(Math.round(num) + "e-2");
  }

  setValueOr0(value): number {
    return value ? value : 0;
  }

  remove(index: number): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.isErrorCheck = false;
    this.cartItem.productList.splice(index, 1);
    this.onQuantityChange();
  }

  updateExpiryDate(product: Product, selectedItemIndex?): void {
    (<any>$("#productStockManualUpdate")).modal("show");
    $("#productStockManualUpdate").on("hidden.bs.modal", function () {
      (<any>$("#myModal89")).modal("hide");
    });
    $(".modal-backdrop").not(':first').remove();
    this.selectedProductIndex = selectedItemIndex;
    this.selectedProduct = product;
    if (!this.selectedProduct.stockDetails) {
      this.selectedProduct.stockDetails = new StockDetails();
      this.selectedProduct.stockDetails.netPrice = product.netPrice;
      this.selectedProduct.stockDetails.taxes = new Taxes();
    }
  }

  onDateSubmit(expiryDate) {
    this.selectedProduct.stockDetails.expiryDate = undefined;
    this.selectedProduct.stockDetails.expiryDate = expiryDate.getTime();
  }

  updateProductBatchDetails(): void {

    if (this.selectedProduct.stockDetails.taxes && this.selectedProduct.stockDetails.taxes.cgst && (!this.checkIfNumber(this.selectedProduct.stockDetails.taxes.cgst) || this.selectedProduct.stockDetails.taxes.cgst > 100)) {
      this.isPSError = true;
      this.errorPSMessages = new Array();
      this.errorPSMessages[0] = "Please enter a valid CGST";
      this.showPSMessage = true;
    }

    if (this.selectedProduct.stockDetails.taxes && this.selectedProduct.stockDetails.taxes.sgst && (!this.checkIfNumber(this.selectedProduct.stockDetails.taxes.sgst) || this.selectedProduct.stockDetails.taxes.sgst > 100)) {
      this.isPSError = true;
      this.errorPSMessages = new Array();
      this.errorPSMessages[0] = "Please enter a valid SGST";
      this.showPSMessage = true;
    }

    if (this.selectedProduct.stockDetails.taxes && this.selectedProduct.stockDetails.taxes.sgst
      && this.selectedProduct.stockDetails.taxes.cgst && ((this.selectedProduct.stockDetails.taxes.cgst + this.selectedProduct.stockDetails.taxes.sgst >= 100) || (this.selectedProduct.stockDetails.taxes.cgst + this.selectedProduct.stockDetails.taxes.sgst < 0))) {
      this.isPSError = true;
      this.errorPSMessages = new Array();
      this.errorPSMessages[0] = "Please enter a valid CGST and SGST";
      this.showPSMessage = true;
    }

    this.selectedProduct.stockDetails.taxes.igst = +0;
    this.selectedProduct.taxes = this.clone(this.selectedProduct.stockDetails.taxes);
    (<any>$)('#productStockManualUpdate').modal('hide');
    this.selectedProduct.taxes.cgst = this.roundToTwo(+this.selectedProduct.taxes.cgst);
    this.selectedProduct.taxes.sgst = this.roundToTwo(+this.selectedProduct.taxes.sgst);
    this.selectedProduct.taxes.igst = this.roundToTwo(+this.selectedProduct.taxes.igst);
    // let index = this.cartItem.productList.findIndex(item => { return item.productId == this.selectedProduct.productId });
    let index = this.selectedProductIndex;
    this.cartItem.productList[index] = this.selectedProduct;
    this.selectedProduct = null;
    let tempCartItem = this.cartItem;
    // tempCartItem.isReset = true;
    this.cartItem = { ...tempCartItem };
    this.onQuantityChange();
  }

  checkIfNumber(value) {
    let check = /^[+]?(?=.)(?:\d+,)*\d*(?:\.\d+)?$/.test(value);
    if (!check) {
      return false;
    } else {
      return true;
    }
  }

  onMoreBatchNumberClick(i: number) {
    this.selectedProductIndex = i;
    if (i >= 0 && this.cartItem.productList.length > i) {
      this.selectedProduct = this.clone(this.cartItem.productList[i]);
      this.selectedProduct.stockList.sort(function (a, b) {
        if ((a.stockDetails.expiryDate) > (b.stockDetails.expiryDate)) return 1;
        if ((a.stockDetails.expiryDate) < (b.stockDetails.expiryDate)) return -1;
        return 0;
      });
      (<any>$)('#batchSelectionModal').modal('show');
    } else {
      return;
    }
  }

  onFinalProductSelection() {
    if (this.selectedProduct && this.selectedProduct.stockList) {
      let selectedList = this.selectedProduct.stockList.filter(item => { return item.selectedProduct });
      if (!selectedList || selectedList.length == 0) {
        this.selectProductError = "Please select atleast one batch";
        return;
      }
      else {
        // Idenfify the required quantity and selected items.
        // let index = this.cartItem.productList.findIndex(item => { return item.productId == this.selectedProduct.productId });
        let index = this.selectedProductIndex;
        if (this.selectedProduct.quantity > 0) {
          if (this.selectedProduct.quantity <= selectedList[0].stockDetails.totalAvailableQuantity) {
            // If quantity is set, and the first item in the batch is satisfying the quantity, 
            // then ignore the second selection
            let tempSelected = this.clone(selectedList[0]);
            this.selectedProduct.stockDetails = tempSelected.stockDetails;
            this.selectedProduct.grossPrice = tempSelected.stockDetails.grossPrice;
            this.selectedProduct.netPrice = tempSelected.stockDetails.netPrice;
            this.selectedProduct.taxes = tempSelected.stockDetails.taxes;
            this.cartItem.productList[index] = this.selectedProduct;
          } else if (this.selectedProduct.quantity > selectedList[0].stockDetails.totalAvailableQuantity) {
            // If the quantity is set, and the first item is not satisfying the quantity, 
            // then choose the other batches and split the quantity accordingly
            let totalRequired = this.selectedProduct.quantity;
            this.cartItem.productList.splice(index, 1);
            selectedList.forEach(element => {
              if (totalRequired > 0) {
                let tempSelectedStock = this.clone(element);
                let tempProduct = this.clone(this.selectedProduct);
                tempProduct.stockDetails = tempSelectedStock.stockDetails;
                tempProduct.grossPrice = tempSelectedStock.stockDetails.grossPrice;
                tempProduct.netPrice = tempSelectedStock.stockDetails.netPrice;
                tempProduct.taxes = tempSelectedStock.stockDetails.taxes;
                if (totalRequired < tempSelectedStock.stockDetails.totalAvailableQuantity) {
                  tempProduct.quantity = totalRequired;
                  totalRequired = 0;
                } else {
                  tempProduct.quantity = tempSelectedStock.stockDetails.totalAvailableQuantity;
                  totalRequired -= tempSelectedStock.stockDetails.totalAvailableQuantity;
                }
                this.cartItem.productList.push(tempProduct);
              }
            });
          }
        } else {
          // If quantity is not set, then allow only one batch to be selected
          let tempSelected = this.clone(selectedList[0]);
          this.selectedProduct.stockDetails = tempSelected.stockDetails;
          this.selectedProduct.grossPrice = tempSelected.stockDetails.grossPrice;
          this.selectedProduct.netPrice = tempSelected.stockDetails.netPrice;
          this.selectedProduct.taxes = tempSelected.stockDetails.taxes;
          this.cartItem.productList[index] = this.selectedProduct;
        }
      }
      this.onQuantityChange();
    }
    (<any>$)('#batchSelectionModal').modal('hide');
  }
  calculateFinalPayment(cartItem: CartItem) {
    return this.roundToTwo(cartItem.payment.originalAmount
      + cartItem.payment.taxationAmount
      + (cartItem.deliveryAmount ? cartItem.deliveryAmount : 0)
      - (cartItem.payment.usedWalletAmount ? cartItem.payment.usedWalletAmount : 0)
      - cartItem.payment.packageDiscountAmount
      - cartItem.payment.otherDiscountAmount);
  }
  calculateCost(itemList: Array<Product>) {
    console.log("calculateCost");
    let originalAmount: number = 0;
    let taxationAmount: number = 0;
    let finalAmount: number = 0;
    let otherDiscountAmount: number = 0;
    itemList ? itemList.forEach(element => {
      let calItem = this.calculateItem(element);
      originalAmount = +originalAmount + +calItem.originalAmount;
      taxationAmount = +taxationAmount + +calItem.taxationAmount;
      otherDiscountAmount = +otherDiscountAmount + calItem.otherDiscountAmount;
      finalAmount = +finalAmount + +calItem.finalAmount;
    }) : '';
    let payDiscountAmt = 0;
    // this.cartItem.basketDiscount = 
    this.cartItem.basketDiscount && this.cartItem.basketDiscount.forEach((item: BasketDiscount) => {
      if (item.type == BasketConstants.DISCOUNT_TYPE_PROMOTIONAL) {
        item.discountAmount = otherDiscountAmount;
        item.percent = (otherDiscountAmount * 100) / originalAmount;
      }
      if (item.type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
        item.discountAmount = (originalAmount - otherDiscountAmount) * (item.percent / 100);
      }
      payDiscountAmt += item.discountAmount;
    });
    if (otherDiscountAmount > 0 && !this.cartItem.basketDiscount.length) {
      let item: BasketDiscount = new BasketDiscount();
      item.type = BasketConstants.DISCOUNT_TYPE_PROMOTIONAL;
      item.discountAmount = otherDiscountAmount;
      item.percent = (otherDiscountAmount * 100) / this.cartItem.payment.finalAmount;
      payDiscountAmt += item.discountAmount;
      this.cartItem.basketDiscount.push(item);
    }
    this.cartItem.payment.otherDiscountAmount = payDiscountAmt;
    this.cartItem.payment.originalAmount = originalAmount;
    this.cartItem.payment.taxationAmount = taxationAmount;
    this.cartItem.payment.finalAmount = this.calculateFinalPayment(this.cartItem);

    this.cartItemChange.emit(this.cartItem);
  }
  calculateItem(element: Product) {
    element.netPrice = element.netPrice ? +element.netPrice : 0;
    element.quantity = element.quantity ? +element.quantity : 0;
    !element.discountPrice ? element.discountPrice = 0 : 0;
    if (+element.netPrice >= 0 && +element.quantity >= 0) {
      let taxAmtPerUnit: number = 0;
      element.totalTaxes = new Taxes();
      if (element.taxes) {
        element.taxes.cgst = element.totalTaxes.cgst = element.taxes.cgst && element.taxes.cgst >= 0 ? +element.taxes.cgst : 0;
        element.taxes.sgst = element.totalTaxes.sgst = element.taxes.sgst && element.taxes.sgst >= 0 ? +element.taxes.sgst : 0;
        element.taxes.igst = element.totalTaxes.igst = element.taxes.igst && element.taxes.igst >= 0 ? +element.taxes.igst : 0;
      }
      let totalTaxPer = element.totalTaxes.igst > 0 ? (+element.totalTaxes.igst) : (+element.totalTaxes.cgst + +element.totalTaxes.sgst);
      element.grossPrice = this.roundToTwo(this.calculateGrossprice(element.netPrice, element.discountPrice, +totalTaxPer));
      element.stockDetails ? element.stockDetails.grossPrice = this.roundToTwo(this.calculateGrossprice(element.stockDetails.netPrice, element.discountPrice, +totalTaxPer)) : '';
      if (element.taxes) {
        element.taxes.cgstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.cgst / 100);
        element.taxes.sgstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.sgst / 100);
        element.taxes.igstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.igst / 100);
        element.grossPrice = +element.netPrice + (element.discountPrice ? +element.discountPrice : 0) - ((element.taxes.igstAmount && element.taxes.igstAmount > 0) ? (+element.taxes.igstAmount) : (+element.taxes.cgstAmount + +element.taxes.sgstAmount));
        if (element.stockDetails) {
          element.stockDetails.taxes.cgstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.cgst / 100);
          element.stockDetails.taxes.sgstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.sgst / 100);
          element.stockDetails.taxes.igstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.igst / 100);
          element.stockDetails.grossPrice = +element.stockDetails.netPrice + (element.discountPrice ? +element.discountPrice : 0) - ((element.stockDetails.taxes.igstAmount && +element.stockDetails.taxes.igstAmount > 0) ? (+element.stockDetails.taxes.igstAmount) : (+element.stockDetails.taxes.cgstAmount + +element.stockDetails.taxes.sgstAmount));
        }

        console.log(element, '<<>>' + element.totalTaxes.sgst + '<<>>' + element.totalTaxes.igst + '<<>>' + element.taxes.cgstAmount + '<<>>' + element.taxes.sgstAmount + '<<>>' + element.taxes.igstAmount);
      } else {
        element.taxes = new Taxes();
        element.taxes.cgstAmount = 0;
        element.taxes.sgstAmount = 0;
        element.taxes.igstAmount = 0;
      }
      element.totalTaxes.cgstAmount = this.roundToTwo(+element.quantity * +element.taxes.cgstAmount);
      element.totalTaxes.sgstAmount = this.roundToTwo(+element.quantity * +element.taxes.sgstAmount);
      element.totalTaxes.igstAmount = this.roundToTwo(+element.quantity * +element.taxes.igstAmount);

      if (element.taxes.igstAmount && element.taxes.igstAmount > 0) {
        taxAmtPerUnit = +element.taxes.igstAmount;
      } else {
        taxAmtPerUnit = +element.taxes.cgstAmount + +element.taxes.sgstAmount;
      }
      element.taxationAmount = taxAmtPerUnit * +element.quantity;
      element.originalAmount = +element.grossPrice * +element.quantity;
      element.otherDiscountAmount = +element.discountPrice * +element.quantity;
      element.finalAmount = +element.originalAmount + +element.taxationAmount - +element.otherDiscountAmount;
      let calData = {
        'originalAmount': element.originalAmount, 'otherDiscountAmount': element.otherDiscountAmount,
        'taxationAmount': +element.taxationAmount, 'finalAmount': +element.finalAmount
      };
      return calData;
    }
    return null;
  }

  calculateGrossprice(netprice: number, discountPrice: number, totalTaxPer = 0) {
    totalTaxPer = !totalTaxPer ? 0 : +totalTaxPer;
    netprice = !netprice ? 0 : +netprice;
    console.log((discountPrice ? +discountPrice : 0) + netprice / (1 + (+totalTaxPer / 100)));
    // let x= netprice / (1 + (+totalTaxPer / 100));
    // debugger;
    return ((discountPrice ? +discountPrice : 0) + netprice / (1 + (+totalTaxPer / 100)));
  }
  onClosingPopUp() {
    this.selectedProduct = null;
    (<any>$)('#batchSelectionModal').modal('hide');
  }

  clone(original: any) {
    return JSON.parse(JSON.stringify(original));
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

}
