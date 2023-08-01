import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../base/util/common-util';
import { ValidationUtil } from '../../../base/util/validation-util';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { DiscountType } from '../../../model/package/discountType';
import { ServiceItem } from '../../../model/service/serviceItem';
import { PackageService } from '../../../packages/package.service';
import { PaymentService } from "../../payment.service";
import { AuthService } from "./../../../auth/auth.service";
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { HsLocalStorage } from './../../../base/hsLocalStorage.service';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { CartItem } from './../../../model/basket/cartitem';
import { Payment } from './../../../model/basket/payment';
import { PaymentType } from './../../../model/payment/paymentType';
import { Config } from '../../../base/config';


@Component({
  selector: 'miscadvice',
  templateUrl: './miscadvicedetail.template.html',
  styleUrls: ['./miscadvicedetail.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MiscAdviceDetailComponent implements OnInit {
  procedureAdviseTrack: CartItem;
  cartItemSearchList: ServiceItem[] = new Array<ServiceItem>();
  searchItemsTotal: number;
  item: ServiceItem = new ServiceItem();
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
  searchTestsTotal: number = 0;
  key: string;
  empId: any;
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  isOtherDiscountCashPaymentHide: boolean = false;
  isOtherDiscountFullPaymentHide: boolean = false;
  isOtherDiscountEditBoxHide: boolean = true;
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
  discountType: number = DiscountType.TYPE_PROCEDURE;
  procedurePrescriptionLabel: string = null;

  selectColumns: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];

  constructor(private paymentService: PaymentService, private authService: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private packageService: PackageService, private validation: ValidationUtil,
    private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
    this.procedureAdviseTrack = paymentService.procedureAdviseTrack;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.pocId = this.authService.userAuth.pocId;
    this.brandId = this.authService.userAuth.brandId;
    this.empId = authService.userAuth.employeeId;
    this.validation = validation;
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
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
    if (this.procedureAdviseTrack != undefined) {
      window.localStorage.setItem('procedureAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.procedureAdviseTrack)));
    } else {
      this.procedureAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('procedureAdviseTrack')));
      if (!this.procedureAdviseTrack) {
        this.gotoProducersOrderList();
      }
      this.paymentService.procedureAdviseTrack = this.procedureAdviseTrack;
    }

    this.procedureAdviseTrack.cartItemType = this.procedureAdviseTrack.cartItemType ? this.procedureAdviseTrack.cartItemType : CartItem.CART_ITEM_TYPE_PROCEDURE;

    if (this.procedureAdviseTrack.payment.paymentStatus == 1 || this.procedureAdviseTrack.payment.paymentStatus == 2) {
      this.isSecond = true;
      this.settingSavedData();
    } else {
      this.isSecond = false;
      this.getProcedurePOCTestAmount();
      this.settingSavedData();
    }
    // this.getDiagnosticsPackages();
  }

  settingSavedData() {
    /* if (this.procedureAdviseTrack.payment.otherDiscountAmount) {
      this.otherDiscountAmount = this.procedureAdviseTrack.payment.otherDiscountAmount;
    } */
    /* if (this.procedureAdviseTrack.basketDiscount != undefined && this.procedureAdviseTrack.basketDiscount != null && this.procedureAdviseTrack.basketDiscount.length > 0) {
      this.otherDiscountAmountPer = parseFloat((this.procedureAdviseTrack.basketDiscount[0].percent).toFixed(2));
    } */
    if (this.procedureAdviseTrack.payment.packageDiscountAmount) {
      this.discountAmount = this.procedureAdviseTrack.payment.packageDiscountAmount;
    }
    if (this.procedureAdviseTrack.serviceList && this.procedureAdviseTrack.serviceList.length > 0) {
      this.cartItemSearchList = this.procedureAdviseTrack.serviceList;
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem("tempCartItemSearchList", cryptoUtil.encryptData(JSON.stringify(this.procedureAdviseTrack.serviceList)));
    }
  }

  getProcedurePOCTestAmount() {
    if (this.procedureAdviseTrack.serviceList != undefined && this.procedureAdviseTrack.serviceList != null && this.procedureAdviseTrack.serviceList.length > 0) {
      this.paymentService.getProceduresTestAmount(this.pocId, this.procedureAdviseTrack.orderId, this.procedureAdviseTrack.invoiceId).then(data => {
        let tempItem = this.procedureAdviseTrack;
        let itemList: Array<ServiceItem> = tempItem.serviceList;
        for (let i = 0; i < itemList.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (itemList[i].serviceId == data[j].serviceId) {
              itemList[i].grossPrice = data[j].grossPrice;
              itemList[i].netPrice = data[j].netPrice;
              itemList[i].finalAmount = data[j].netPrice;
              itemList[i].quantity = 1;
            }
          }
        }
        this.procedureAdviseTrack = { ...tempItem };
        this.cd.detectChanges();
      });
    }
  }

  remove(index: number): void {
    let tempCart = this.procedureAdviseTrack;
    tempCart.serviceList.splice(index, 1);
    this.procedureAdviseTrack = { ...tempCart };

    this.searchTestsTotal = 0;
  }

  onChangeAmount(): void {
    let tempCart = this.procedureAdviseTrack;
    tempCart.serviceList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.procedureAdviseTrack = { ...tempCart }
    this.cd.detectChanges();
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
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_UPI;
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
    if (this.procedureAdviseTrack.serviceList.length > 0) {
      this.procedureAdviseTrack.serviceList.forEach(service => {
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
        if (this.selectOthers == true && (this.procedureAdviseTrack.payment.transactionType == 2 || this.procedureAdviseTrack.payment.transactionType == 5)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }
        this.procedureAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.procedureAdviseTrack.payment.transactionId = this.transactionId
      } else if (this.paymentModeIndex == 2) {
        this.procedureAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.procedureAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.procedureAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      if (!this.procedureAdviseTrack.createdTimestamp) {
        this.procedureAdviseTrack.createdTimestamp = new Date().getTime();
      }
      this.procedureAdviseTrack.updatedTimestamp = new Date().getTime();
      this.procedureAdviseTrack.empId = this.empId;
      this.procedureAdviseTrack.cartItemType = CartItem.CART_ITEM_TYPE_PROCEDURE;
      let basketRequest: BasketRequest = new BasketRequest();
      basketRequest.transactionType = this.procedureAdviseTrack.payment.transactionType;
      basketRequest.transactionId = this.procedureAdviseTrack.payment.transactionId;

      basketRequest.parentProfileId = this.procedureAdviseTrack.parentProfileId;
      basketRequest.orderId = this.procedureAdviseTrack.orderId;
      this.procedureAdviseTrack.brandId = this.brandId;
      basketRequest.cartItemList = new Array<CartItem>();
      basketRequest.cartItemList.push(this.procedureAdviseTrack);

      basketRequest.createdTimestamp = this.procedureAdviseTrack.createdTimestamp;
      basketRequest.updatedTimestamp = new Date().getTime();

      basketRequest.totalOriginalAmount = this.procedureAdviseTrack.payment.originalAmount;

      basketRequest.totalOtherDiscountAmount = this.procedureAdviseTrack.payment.otherDiscountAmount;
      basketRequest.totalFinalAmount = this.procedureAdviseTrack.payment.finalAmount;


      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.diagnosticService.initiatePayment(basketRequest).then(
        response => {
          this.spinnerService.stop();
          if (response != null && response != undefined && response.cartItemList != undefined
            && response.cartItemList != null && response.cartItemList.length > 0) {
            this.procedureAdviseTrack = response.cartItemList[0];
            if (this.paymentModeIndex == 5) {
              this.spinnerService.start();
              if (response.statusCode == 200) {
                setTimeout(() => {
                  this.spinnerService.stop();
                  this.gotoProducersOrderList();
                }, 12000)
              }
            } else {
              this.spinnerService.stop();
              this.gotoProducersInvoice();
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
    if (this.procedureAdviseTrack != undefined && this.procedureAdviseTrack != null) {
      this.paymentService.procedureAdviseTrack = this.procedureAdviseTrack;
    }
  }

  gotoProducersOrderList(): void {
    this.router.navigate(['/app/payment/misc']);
  }

  gotoProducersInvoice() {
    this.router.navigate(['/app/payment/miscinvoice']);
  }

  addNewTest(): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (this.key == undefined || this.key == null || this.key.length < 0 || this.key == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Procedure Name";
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
    // this.item = this.selectedCartItem;
    this.item.grossPrice = this.item.netPrice = this.searchedTestAmount;
    this.item.serviceName = this.key;
    this.item.quantity = 1;
    if (this.cartItemSearchList[0] != undefined) {
      this.item.serviceId = this.cartItemSearchList[0].serviceId;
      this.item.categoryId = this.cartItemSearchList[0].categoryId;
      this.item.categoryName = this.cartItemSearchList[0].categoryName;
    }
    else if (window.localStorage.getItem("tempCartItemSearchList") != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      let tempCartItemSearchList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('tempCartItemSearchList')));
      this.item.serviceId = tempCartItemSearchList[0].serviceId;
      this.item.categoryId = tempCartItemSearchList[0].categoryId;
      this.item.categoryName = tempCartItemSearchList[0].categoryName;
    }
    this.procedureAdviseTrack.serviceList.push(this.item);
    this.procedureAdviseTrack.serviceList[0].originalAmount = this.searchedTestAmount;

    //making object mutable to update in child component
    let tempCartItem = this.procedureAdviseTrack;
    tempCartItem.isReset = true;
    this.procedureAdviseTrack = { ...tempCartItem };

    this.item = new ServiceItem();
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

  searchTests(key) {
    this.key = key;
    if (key.length > 2) {
      this.paymentService.getSearchedProcedures(key, this.pocId).then((cartItemProcedure) => {
        this.searchTestsTotal = cartItemProcedure.length;
        this.cartItemSearchList = cartItemProcedure;
        this.commonUtil.sleep(700);
      })
    }
  }

  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.serviceId == this.cartItemSearchList[i].serviceId) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }
    this.key = this.selectedCartItem.serviceName;
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

  /* calculateTotalCost(): void {
    this.procedureAdviseTrack.payment = new Payment();
    this.procedureAdviseTrack.payment.originalAmount = 0;
    this.procedureAdviseTrack.payment.packageDiscountAmount = 0;
    this.procedureAdviseTrack.payment.otherDiscountAmount = 0;
    this.procedureAdviseTrack.payment.finalAmount = 0;
    this.procedureAdviseTrack.payment.taxationAmount = 0;
    this.procedureAdviseTrack.userPackageId = 0;
    let totalAmount: number = 0;
    let itemsList: Array<ServiceItem> = this.procedureAdviseTrack.serviceList;
    for (let i = 0; i < itemsList.length; i++) {
      var amount: string = itemsList[i].grossPrice + "";
      itemsList[i].netPrice = +amount;
      console.log("=======>>> " + JSON.stringify(itemsList[i]))
  
      if (amount.length > 0) {
        totalAmount = totalAmount + parseFloat(amount);
      }
    }
    this.procedureAdviseTrack.payment.originalAmount = this.procedureAdviseTrack.payment.finalAmount = parseFloat(totalAmount.toFixed(2));
    console.log("discnt:" + this.discountAmount);
    if (this.discountAmount >= 0) {
      this.procedureAdviseTrack.payment.finalAmount = parseFloat((this.procedureAdviseTrack.payment.originalAmount - this.discountAmount - this.otherDiscountAmount).toFixed(2));
  
    }
    if (this.bookedPackageList != undefined && this.bookedPackageList != null && this.bookedPackageList.length > 0 && this.discountAmount > 0) {
      for (let i: number = 0; i < this.bookedPackageList.length; i++) {
        this.packageNames[i + 1] = this.bookedPackageList[i].packageName;
        if (this.procedureAdviseTrack.userPackageId > 0) {
          if (this.procedureAdviseTrack.userPackageId ==
            this.bookedPackageList[i].userPackageId) {
            this.procedureAdviseTrack.packageName = this.bookedPackageList[i].packageName;
            this.discountPercent = this.bookedPackageList[i].discountPercent;
          }
        }
      }
      if (this.discountPercent > 0) {
        this.procedureAdviseTrack.payment.packageDiscountAmount = this.procedureAdviseTrack.payment.originalAmount * (this.discountPercent / 100);
      } else if (this.discountAmount > 0) {
        let discPercent = this.discountAmount / this.procedureAdviseTrack.payment.originalAmount;
        this.procedureAdviseTrack.payment.packageDiscountAmount = this.procedureAdviseTrack.payment.originalAmount * (discPercent);
      }
    }
  
    // Check if other discounts is applied
    if (this.otherDiscountAmountPer > 0 && this.otherDiscountAmountPer <= 100) {
      this.procedureAdviseTrack.payment.otherDiscountAmount = (this.procedureAdviseTrack.payment.originalAmount - this.procedureAdviseTrack.payment.packageDiscountAmount) * (this.otherDiscountAmountPer / 100);
    }
  
    // this.diagnosticsAdviseTrack.cartItemList[0].payment.finalAmount = this.diagnosticsAdviseTrack.cartItemList[0].payment.originalAmount + this.diagnosticsAdviseTrack.cartItemList[0].payment.taxationAmount - this.diagnosticsAdviseTrack.cartItemList[0].payment.packageDiscountAmount - this.diagnosticsAdviseTrack.cartItemList[0].payment.otherDiscountAmount;
  
  } */

  onAmountChange(value: any): void {
    this.selectedGlobalPackageId = 0;
    this.selectedUserPackageId = 0;
    this.isOtherDiscountFullPaymentHide = false;
    this.isOtherDiscountEditBoxHide = true;
    this.procedureAdviseTrack.userPackageId = 0;
  }

}
