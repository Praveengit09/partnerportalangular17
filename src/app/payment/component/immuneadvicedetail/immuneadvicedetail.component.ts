import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../base/util/common-util';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { DiscountType } from '../../../model/package/discountType';
import { BaseGenericMedicine } from '../../../model/pharmacy/baseGenericMedicine';
import { Pharmacy } from '../../../model/pharmacy/pharmacy';
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
  selector: 'immuneadvice',
  templateUrl: './immuneadvicedetail.template.html',
  styleUrls: ['./immuneadvicedetail.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ImmuneAdviceDetailComponent implements OnInit {
  immunizationAdviseTrack: CartItem;
  cartItemSearchList: any[] = new Array<any>();
  searchItemsTotal: number;
  item: Pharmacy = new Pharmacy();
  paymentModeIndex: number = 2;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  pdfHeaderType: number;
  pocId: number;
  searchedTests: any;
  otherDiscountAmount: number = 0;
  otherDiscountAmountPer: number = 0;
  isSecond: boolean;
  key: string;
  selectedCartItem: any;
  searchedTestAmount: any = null;
  searchTestsTotal: number = 0;
  brandId: number;
  investigationList: Array<Pharmacy> = new Array<Pharmacy>();
  empId: any;
  isOtherDiscountFullPaymentHide: boolean = false;
  isOtherDiscountEditBoxHide: boolean = true;
  isOtherDiscountCashPaymentHide: boolean = false;
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
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  selectOthers: boolean = true;
  transactionId: any;
  discountType: number = DiscountType.TYPE_IMMUNIZATION;
  currencySymbol: string = '';

  selectColumns: any[] = [
    {
      variable: 'genericMedicine.genericMedicineName',
      filter: 'text'
    }
  ];

  constructor(private paymentService: PaymentService, private authService: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private packageService: PackageService,
    private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
    this.immunizationAdviseTrack = paymentService.immunizationAdviseTrack;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.pocId = this.authService.userAuth.pocId;
    this.brandId = this.authService.userAuth.brandId;
    this.empId = authService.userAuth.employeeId;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
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
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.immunizationAdviseTrack != undefined) {
      window.localStorage.setItem('immunizationAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.immunizationAdviseTrack)));
    } else {
      this.immunizationAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('immunizationAdviseTrack')));
      if (!this.immunizationAdviseTrack) {
        this.gotoImmunizationOrderList();
      }
      this.paymentService.immunizationAdviseTrack = this.immunizationAdviseTrack;
    }
    if (this.immunizationAdviseTrack.payment.otherDiscountAmount) {
      this.otherDiscountAmount = this.immunizationAdviseTrack.payment.otherDiscountAmount;
    }

    this.immunizationAdviseTrack.cartItemType = this.immunizationAdviseTrack.cartItemType ? this.immunizationAdviseTrack.cartItemType : CartItem.CART_ITEM_TYPE_IMMUNISATION;

    if (this.immunizationAdviseTrack.payment.paymentStatus == 1 || this.immunizationAdviseTrack.payment.paymentStatus == 2) {
      this.isSecond = true;
      this.settingSavedData();
    } else {
      this.isSecond = false;
      this.getImmunizationPOCTestAmount();
      this.settingSavedData();
    }
  }


  settingSavedData() {
    if (this.immunizationAdviseTrack.payment.otherDiscountAmount) {
      this.otherDiscountAmount = this.immunizationAdviseTrack.payment.otherDiscountAmount;
    }
    if (this.immunizationAdviseTrack.basketDiscount != undefined && this.immunizationAdviseTrack.basketDiscount != null && this.immunizationAdviseTrack.basketDiscount.length > 0 && this.immunizationAdviseTrack.basketDiscount[0] && this.immunizationAdviseTrack.basketDiscount[0].percent > 0) {
      this.otherDiscountAmountPer = parseFloat((this.immunizationAdviseTrack.basketDiscount[0].percent).toFixed(2));
    }
  }

  getImmunizationPOCTestAmount() {
    if (this.immunizationAdviseTrack.pharmacyList != undefined && this.immunizationAdviseTrack.pharmacyList != null && this.immunizationAdviseTrack.pharmacyList.length > 0) {
      this.paymentService.getImmunizationTestAmount(this.pocId, this.immunizationAdviseTrack.orderId, this.immunizationAdviseTrack.invoiceId).then(data => {
        let tempItem = this.immunizationAdviseTrack;
        let itemList: Array<Pharmacy> = this.immunizationAdviseTrack.pharmacyList;
        for (let i = 0; i < itemList.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (itemList[i].genericMedicine.genericMedicineId == data[j].genericMedicine.genericMedicineId) {
              itemList[i].grossPrice = data[j].grossPrice;
              itemList[i].finalAmount = data[j].amount;
              itemList[i].quantity = 1;
            }
          }
        }
        this.immunizationAdviseTrack = { ...tempItem };
        this.cd.detectChanges();
      });
    }
  }

  remove(index: number): void {
    let tempCart = this.immunizationAdviseTrack;
    tempCart.pharmacyList.splice(index, 1);
    this.immunizationAdviseTrack = { ...tempCart };
    this.searchTestsTotal = 0;

  }

  onAmountChange(value: any): void {
    this.selectedGlobalPackageId = 0;
    this.selectedUserPackageId = 0;
    this.isOtherDiscountFullPaymentHide = false;
    this.isOtherDiscountEditBoxHide = true;
    this.onChangeAmount();
  }

  onChangeAmount(): void {
    let tempCart = this.immunizationAdviseTrack;
    tempCart.pharmacyList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.immunizationAdviseTrack = { ...tempCart }
  }

  onChangeTest(): void {
    if (this.item != undefined) {
      this.searchedTestAmount = null;
      $("hs-select>div>input").val("");
    }
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
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_UPI;
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
    if (this.immunizationAdviseTrack.pharmacyList.length > 0) {
      this.immunizationAdviseTrack.pharmacyList.forEach(service => {
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
      if (this.otherDiscountAmountPer > 100 || this.otherDiscountAmountPer < 0) {
        return;
      }
      if (this.paymentModeIndex == 1) {
        if (this.selectOthers == true && (this.immunizationAdviseTrack.payment.transactionType == 2 || this.immunizationAdviseTrack.payment.transactionType == 5)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }
        this.immunizationAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.immunizationAdviseTrack.payment.transactionId = this.transactionId
      } else if (this.paymentModeIndex == 2) {
        this.immunizationAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.immunizationAdviseTrack.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.immunizationAdviseTrack.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      if (!this.immunizationAdviseTrack.createdTimestamp) {
        this.immunizationAdviseTrack.createdTimestamp = new Date().getTime();
      }
      this.immunizationAdviseTrack.updatedTimestamp = new Date().getTime();
      this.immunizationAdviseTrack.empId = this.empId;
      let basketRequest: BasketRequest = new BasketRequest();
      basketRequest.transactionType = this.immunizationAdviseTrack.payment.transactionType;
      basketRequest.transactionId = this.immunizationAdviseTrack.payment.transactionId;

      basketRequest.parentProfileId = this.immunizationAdviseTrack.parentProfileId;
      basketRequest.orderId = this.immunizationAdviseTrack.orderId;
      this.immunizationAdviseTrack.brandId = this.brandId;
      basketRequest.cartItemList = new Array<CartItem>();
      basketRequest.cartItemList.push(this.immunizationAdviseTrack);

      basketRequest.createdTimestamp = this.immunizationAdviseTrack.createdTimestamp;
      basketRequest.updatedTimestamp = new Date().getTime();

      basketRequest.totalOriginalAmount = this.immunizationAdviseTrack.payment.originalAmount;
      basketRequest.totalOtherDiscountAmount = this.immunizationAdviseTrack.payment.otherDiscountAmount;
      basketRequest.totalFinalAmount = this.immunizationAdviseTrack.payment.finalAmount;

      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();

      this.diagnosticService.initiatePayment(basketRequest).then(
        response => {
          this.spinnerService.stop();
          if (response != null && response != undefined && response.cartItemList != undefined
            && response.cartItemList != null && response.cartItemList.length > 0) {
            this.immunizationAdviseTrack = response.cartItemList[0];
            if (this.paymentModeIndex == 5) {
              if (response.statusCode == 200) {
                this.gotoImmunizationOrderList();
              } else {
                this.gotoImmunizationOrderList();
              }
            } else {
              this.gotoImmunizationInvoice();
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
    if (this.immunizationAdviseTrack != undefined && this.immunizationAdviseTrack != null) {
      this.paymentService.immunizationAdviseTrack = this.immunizationAdviseTrack;
    }
  }

  gotoImmunizationOrderList(): void {
    this.router.navigate(['/app/payment/immunization']);
  }

  gotoImmunizationInvoice() {
    this.router.navigate(['/app/payment/immuneinvoice']);
  }

  addNewTest(): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (this.key == undefined || this.key == null || this.key.length < 0 || this.key == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Immunization Name";
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
    this.item.genericMedicine = new BaseGenericMedicine();
    this.item.genericMedicine.genericMedicineId = this.cartItemSearchList[0].genericMedicine.genericMedicineId;
    this.item.genericMedicine.genericMedicineName = this.key;
    this.item.quantity = 1;
    this.immunizationAdviseTrack.pharmacyList.push(this.item);

    //making object mutable to update in child component
    let tempCartItem = this.immunizationAdviseTrack;
    tempCartItem.isReset = true;
    this.immunizationAdviseTrack = { ...tempCartItem };

    this.item = new Pharmacy();
    this.key = "";
    $('#myModal2').on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    (<any>$('#myModal2')).modal('hide');
    this.cd.detectChanges();
  }

  searchTests(key) {
    this.key = key;
    if (key.length > 2) {
      this.paymentService.getSearchedImmunization(key, this.pocId).then((cartItemImmunization) => {
        this.searchTestsTotal = cartItemImmunization.length;
        this.cartItemSearchList = cartItemImmunization;
        this.commonUtil.sleep(700);
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      })
    }
  }

  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.genericMedicine.genericMedicineId == this.cartItemSearchList[i].genericMedicine.genericMedicineId) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }
    this.key = this.selectedCartItem.genericMedicine.genericMedicineName;
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

  calculateTotalCost(): void {
    this.immunizationAdviseTrack.payment = new Payment();
    this.immunizationAdviseTrack.payment.originalAmount = 0;
    this.immunizationAdviseTrack.payment.packageDiscountAmount = 0;
    this.immunizationAdviseTrack.payment.otherDiscountAmount = 0;
    this.immunizationAdviseTrack.payment.finalAmount = 0;
    this.immunizationAdviseTrack.payment.taxationAmount = 0;
    this.immunizationAdviseTrack.userPackageId = 0;
    let totalAmount: number = 0;
    let itemsList: Array<Pharmacy> = this.immunizationAdviseTrack.pharmacyList;
    for (let i = 0; i < itemsList.length; i++) {
      var amount: string = itemsList[i].grossPrice + "";
      itemsList[i].netPrice = +amount;
      if (amount.length > 0) {
        totalAmount = totalAmount + parseFloat(amount);
      }
    }
    this.immunizationAdviseTrack.payment.originalAmount = this.immunizationAdviseTrack.payment.finalAmount = parseFloat(totalAmount.toFixed(2));
    console.log("discnt:" + this.discountAmount);
    if (this.discountAmount >= 0) {
      this.immunizationAdviseTrack.payment.finalAmount = parseFloat((this.immunizationAdviseTrack.payment.originalAmount - this.discountAmount - this.otherDiscountAmount).toFixed(2));
    }
  }
}