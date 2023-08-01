import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../../../payment/payment.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { DiscountType } from '../../../../model/package/discountType';

import { PackageService } from '../../../../packages/package.service';

import { AuthService } from "./../../../../auth/auth.service";
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { CartItem } from './../../../../model/basket/cartitem';
import { Payment } from './../../../../model/basket/payment';
import { PaymentType } from './../../../../model/payment/paymentType';
import { Product } from './../../../../model/product/product';



@Component({
  selector: 'miscpaymentsadvicedetail',
  templateUrl: './miscpaymentsadvicedetail.template.html',
  styleUrls: ['./miscpaymentsadvicedetail.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MiscellaneousPaymentsAdviceDetailComponent implements OnInit {
  miscellaneousAdviseTrack: CartItem;
  cartItemSearchList: Product[] = new Array<Product>();
  searchItemsTotal: number;
  item: Product = new Product();
  paymentModeIndex: number = 2;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  pdfHeaderType: number;
  pocId: number;
  searchedTests: any;
  brandId: number;
  /* otherDiscountAmount: number = 0;
  otherDiscountAmountPer: number = 0; */
  isSecond: boolean;
  selectedCartItem: any;
  searchedTestAmount: any = null;
 
  key: string;
  empId: any;
 selectedPackageId: number = 0
  packageNames: string[];
  dropDownIndex: number = 0;
  discountAmount: number = 0;
  discountPercent: number = 0;
  selectedGlobalPackageId: number = 0;
  selectedUserPackageId: number = 0;
  basketResponse: BasketRequest;
  packageNamesShow: Boolean = false;
  bookedPackageList: BookedPackageResponse[] = new Array();
  totalTaxationAmount: number = 0;
  tot_taxes: number = 0;
  amtWithotTaxes: number = 0;
  selectOthers: boolean = true;
  transactionId: any;
  discountType: number = DiscountType.TYPE_MISCELLANEOUS;

  selectColumns: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    }
  ];

  constructor(private paymentService: PaymentService, private authService: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private packageService: PackageService, private validation: ValidationUtil,
    private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
    this.miscellaneousAdviseTrack = paymentService.miscellaneousOrderAdviseTrack;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.pocId = this.authService.userAuth.pocId;
    this.brandId = this.authService.userAuth.brandId;
    this.empId = authService.userAuth.employeeId;
    this.validation = validation;
  }

  disableMouseScroll() {
    $('input[type=number]').on('mousewheel.disableScroll', function (e) {
      e.preventDefault()
    })
    $("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });
  }

  initModal(): void {
    $("#mname").val('');
  }

  ngOnInit() {
    this.disableMouseScroll();
    // this.isSecond = false;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.miscellaneousAdviseTrack != undefined) {
      window.localStorage.setItem('miscellaneouspaymentsAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.miscellaneousAdviseTrack)));
    } else {
      this.miscellaneousAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('miscellaneouspaymentsAdviseTrack')));
      if (!this.miscellaneousAdviseTrack) {
        this.gotoProductOrderList();
      }
      this.paymentService.miscellaneousOrderAdviseTrack = this.miscellaneousAdviseTrack;
    }

    this.miscellaneousAdviseTrack.cartItemType = this.miscellaneousAdviseTrack.cartItemType ? this.miscellaneousAdviseTrack.cartItemType : CartItem.CART_ITEM_TYPE_MISCELLANEOUS_PAYMENTS;

    if (this.miscellaneousAdviseTrack.payment.paymentStatus == 1 || this.miscellaneousAdviseTrack.payment.paymentStatus == 2) {
      this.isSecond = true;
      this.settingSavedData();
    } else {
      this.isSecond = false;
      this.getProductPOCTestAmount();
      this.settingSavedData();
    }
   
  }

  settingSavedData() {
 
    if (this.miscellaneousAdviseTrack.payment.packageDiscountAmount) {
      this.discountAmount = this.miscellaneousAdviseTrack.payment.packageDiscountAmount;
    }
    if (this.miscellaneousAdviseTrack.productList.length > 0) {
      this.cartItemSearchList = this.miscellaneousAdviseTrack.productList;
    }
  }

  getProductPOCTestAmount() {
    if (this.miscellaneousAdviseTrack.productList != undefined && this.miscellaneousAdviseTrack.productList != null && this.miscellaneousAdviseTrack.productList.length > 0) {
      this.paymentService.getProceduresTestAmount(this.pocId, this.miscellaneousAdviseTrack.orderId, this.miscellaneousAdviseTrack.invoiceId).then(data => {
        let tempItem = this.miscellaneousAdviseTrack;
        let itemList: Array<Product> = tempItem.productList;
        for (let i = 0; i < itemList.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (itemList[i].productId == data[j].productId) {
              itemList[i].grossPrice = data[j].grossPrice;
              itemList[i].netPrice = data[j].netPrice;
              itemList[i].finalAmount = data[j].netPrice;
              itemList[i].quantity = 1;
            }
          }
        }
        this.miscellaneousAdviseTrack = { ...tempItem };
        this.cd.detectChanges();
      });
    }
  }

  remove(index: number): void {
    let tempCart = this.miscellaneousAdviseTrack;
    tempCart.productList.splice(index, 1);
    this.miscellaneousAdviseTrack = { ...tempCart };
  }

  onChangeAmount(): void {
    let tempCart = this.miscellaneousAdviseTrack;
    tempCart.productList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.miscellaneousAdviseTrack = { ...tempCart }
  }

  checkPaymentModeSelection(index: number) {
    if (index == 1) {
      this.selectOthers = true;
    }
    else {
      this.selectOthers = false;
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    this.paymentModeIndex = index;
  }

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_UPI;
    }
    if (this.selectOthers == true && index == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Correct payment mode";
      this.showMessage = true;
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
  }

  onFinalSubmit(): void {
    this.isErrorCheck = false;
    if (this.miscellaneousAdviseTrack.productList.length > 0) {
      this.miscellaneousAdviseTrack.productList.forEach(service => {
        if (service.grossPrice == 0) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Amount cannot be zero";
          this.showMessage = true;
          this.isErrorCheck = true;
          return;
        }
      })
      if (this.isErrorCheck) {
        return;
      }
      /* if (this.otherDiscountAmountPer > 100 || this.otherDiscountAmountPer < 0) {
        return;
      } */
      if (this.paymentModeIndex == 1) {
        if (this.selectOthers == true && (this.miscellaneousAdviseTrack.payment.transactionType == 2 || this.miscellaneousAdviseTrack.payment.transactionType == 5)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }
        this.miscellaneousAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.miscellaneousAdviseTrack.payment.transactionId = this.transactionId
      } else if (this.paymentModeIndex == 2) {
        this.miscellaneousAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.miscellaneousAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.miscellaneousAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      if (!this.miscellaneousAdviseTrack.createdTimestamp) {
        this.miscellaneousAdviseTrack.createdTimestamp = new Date().getTime();
      }
      this.miscellaneousAdviseTrack.updatedTimestamp = new Date().getTime();
      this.miscellaneousAdviseTrack.empId = this.empId;
      this.miscellaneousAdviseTrack.cartItemType = CartItem.CART_ITEM_TYPE_MISCELLANEOUS_PAYMENTS;
      let basketRequest: BasketRequest = new BasketRequest();
      basketRequest.transactionType = this.miscellaneousAdviseTrack.payment.transactionType;
      basketRequest.transactionId = this.miscellaneousAdviseTrack.payment.transactionId;

      basketRequest.parentProfileId = this.miscellaneousAdviseTrack.parentProfileId;
      basketRequest.orderId = this.miscellaneousAdviseTrack.orderId;
      this.miscellaneousAdviseTrack.brandId = this.brandId;
      basketRequest.cartItemList = new Array<CartItem>();
      basketRequest.cartItemList.push(this.miscellaneousAdviseTrack);

      basketRequest.createdTimestamp = this.miscellaneousAdviseTrack.createdTimestamp;
      basketRequest.updatedTimestamp = new Date().getTime();

      basketRequest.totalOriginalAmount = this.miscellaneousAdviseTrack.payment.originalAmount;

      basketRequest.totalOtherDiscountAmount = this.miscellaneousAdviseTrack.payment.otherDiscountAmount;
      basketRequest.totalFinalAmount = this.miscellaneousAdviseTrack.payment.finalAmount;


      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.diagnosticService.initiatePayment(basketRequest).then(
        response => {
          this.spinnerService.stop();
          if (response != null && response != undefined && response.cartItemList != undefined
            && response.cartItemList != null && response.cartItemList.length > 0) {
            this.miscellaneousAdviseTrack = response.cartItemList[0];
            if (this.paymentModeIndex == 5) {
              this.spinnerService.start();
              if (response.statusCode == 200) {
                setTimeout(() => {
                  this.spinnerService.stop();
                  this.gotoProductOrderList();
                }, 12000)
              }
            } else {
              this.spinnerService.stop();
              this.gotoProductInvoice();
            }
          } else {
            this.spinnerService.stop();
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Error occurred while updating the payment status!';
            this.isError = true;
            this.showMessage = true;
          }
        });
    }
    else {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Add atleast one test";
      this.showMessage = true;
      this.isErrorCheck = true;
    }
  }
  ngOnDestroy(): void {
    if (this.miscellaneousAdviseTrack != undefined && this.miscellaneousAdviseTrack != null) {
      this.paymentService.miscellaneousOrderAdviseTrack = this.miscellaneousAdviseTrack;
    }
  }

  gotoProductOrderList(): void {
    this.router.navigate(['/app/payment/miscellaneouspaymentslisting']);
  }

  gotoProductInvoice() {
    this.router.navigate(['/app/payment/miscellaneouspaymentsinvoice']);
  }

  addNewTest(): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (this.key == undefined || this.key == null || this.key.length < 0 || this.key == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Prodcut Name";
      this.showMessage = true;
      return;
    }
    else if (this.searchedTestAmount == undefined || this.searchedTestAmount == null || this.searchedTestAmount == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Amount";
      this.showMessage = true;
      return;
    }
    this.item = this.selectedCartItem;
    this.item.grossPrice = this.item.netPrice = this.searchedTestAmount;
    this.item.productId = this.cartItemSearchList[0].productId;
    this.item.productName = this.key;
    this.item.quantity = 1;
    this.item.categoryId = this.cartItemSearchList[0].categoryId;
    this.item.categoryName = this.cartItemSearchList[0].categoryName;
    this.miscellaneousAdviseTrack.productList.push(this.item);
    this.miscellaneousAdviseTrack.productList[0].originalAmount = this.searchedTestAmount;

    //making object mutable to update in child component
    let tempCartItem = this.miscellaneousAdviseTrack;
    tempCartItem.isReset = true;
    this.miscellaneousAdviseTrack = { ...tempCartItem };

    this.item = new Product();
    this.key = "";
    (<any>$('#myModal2')).modal('hide');
    this.cd.detectChanges();
  }

  onChangeTest(): void {
    if (this.item != undefined) {
      this.searchedTestAmount = null;
      $("hs-select>div>input").val("");
    }
    (<any>$("#myModal2")).modal("show");
    $(".modal-backdrop").not(':first').remove();
  }

  
  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.productId == this.cartItemSearchList[i].productId) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }
    this.key = this.selectedCartItem.productName;
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

  validateDecimalValue(evt) {
    var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
    if (!(keyCode >= 48 && keyCode <= 57)) {
      if (!(keyCode == 8 || keyCode == 9 || keyCode == 35 || keyCode == 36 || keyCode == 37 || keyCode == 39 || keyCode == 46)) {
        return false;
      }
      else {
        return true;
      }
    }
    var velement = evt.target || evt.srcElement
    var fstpart_val = velement.value;
    var fstpart = velement.value.length;
    if (fstpart.length == 2) return false;
    var parts = velement.value.split('.');
    if (parts[0].length >= 14) return false;
    if (parts.length == 2 && parts[1].length >= 3) return false;
    return false;
  }

 

  onAmountChange(value: any): void {
    this.selectedGlobalPackageId = 0;
    this.selectedUserPackageId = 0;
     this.miscellaneousAdviseTrack.userPackageId = 0;
  }

}
