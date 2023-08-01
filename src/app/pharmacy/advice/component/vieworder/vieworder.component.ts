import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentType } from '../../../../model/payment/paymentType';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { Payment } from '../../../../model/basket/payment';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../auth/auth.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { DiscountType } from '../../../../model/package/discountType';
import { PharmacyService } from '../../../pharmacy.service';
import { Config } from '../../../../base/config.js';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
  selector: 'view-order',
  templateUrl: './vieworder.template.html',
  styleUrls: ['./vieworder.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ViewOrderComponent implements OnInit {

  cartItem: CartItem = new CartItem();
  pdfHeaderType: number;
  brandId: number;
  configAppId: number;
  otherDiscountAmountPer: number = 0;
  selectedPackageId: number = 0;
  empId: any;
  isOtherDiscountCashPaymentHide: boolean = false;
  paymentModeIndex = 0;
  isError = false;
  showMessage = false;
  errorMessage = new Array();
  pocId = 0;
  transactionId: string = '';
  reportResponse: any;
  modalMessage: string = '';
  _isMounted: boolean = false;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
  basketRequest: BasketRequest = new BasketRequest();

  constructor(private pharmacyService: PharmacyService,
    private authService: AuthService, private router: Router,
    private diagnosticService: DiagnosticsService, private spinnerService: SpinnerService) {

    this.brandId = authService.userAuth.brandId;
    this.configAppId = Config.portal.appId;
  }

  ngOnInit() {

    this.pocId = this.authService.userAuth.pocId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;

    this.cartItem = this.pharmacyService.pharmacyAdviseTrack;;
    if (this.cartItem != undefined && this.cartItem != null && this.cartItem.parentProfileId != null && this.cartItem.parentProfileId != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('cartItem') != null) {
        this.cartItem = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('cartItem')));
      }
    }

    this.checkPaymentModeSelection(2);
    this.spinnerService.start();
    setTimeout(() => { this._isMounted = true; this.spinnerService.stop() }, 1000)

  }
  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
  }

  checkFinalAmount() {
    return this.cartItem.payment.finalAmount > 0 && this.isOtherDiscountCashPaymentHide == false;
  }

  confirmOrder() {
    window.scroll(0, 0);
    this.errorMessage = new Array<string>();
    this.isError = false;
    this.showMessage = false;
    if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
      || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
      this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
      this.cartItem.payment.transactionType = this.paymentModeIndex;
      this.cartItem.payment.transactionId = this.transactionId;
    } else if (this.paymentModeIndex == 5) {
      this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
      this.cartItem.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
    }

    let basketRequest: BasketRequest = new BasketRequest();
    basketRequest.cartItemList = new Array<CartItem>();
    basketRequest.cartItemList[0] = this.cartItem;
    basketRequest.orderId = this.cartItem.orderId;
    if (this.basketRequest.bookingSource == undefined || this.basketRequest.bookingSource <= 0) {
      basketRequest.bookingSource = this.basketRequest.bookingSource = 3;
    } else {
      basketRequest.bookingSource = this.basketRequest.bookingSource;
    }
    basketRequest.transactionId = this.cartItem.payment.transactionId;
    basketRequest.transactionType = this.cartItem.payment.transactionType;
    basketRequest.parentProfileId = this.cartItem.parentProfileId;

    basketRequest.totalOriginalAmount = this.cartItem.payment.originalAmount;
    basketRequest.totalPackageDiscountAmount = this.cartItem.payment.packageDiscountAmount;
    basketRequest.totalOtherDiscountAmount = this.cartItem.payment.otherDiscountAmount;
    basketRequest.totalTaxationAmount = this.cartItem.payment.taxationAmount;
    basketRequest.totalFinalAmount = this.cartItem.payment.finalAmount;
    basketRequest.cartItemList[0].orderId = this.cartItem.orderId;
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.diagnosticService.initiatePayment(basketRequest).then(reportResponse => {
      this.spinnerService.stop();
      if (reportResponse.statusCode == 201 || reportResponse.statusCode == 200) {
        this.reportResponse = reportResponse;
        this.basketRequest.cartItemList = reportResponse.cartItemList;
        if (this.pdfHeaderType == 0) {
          this.basketRequest.pdfUrlWithHeader = reportResponse.pdfUrlWithHeader;
        }
        else {
          this.basketRequest.pdfUrlWithoutHeader = reportResponse.pdfUrlWithoutHeader;
        }
        this.pharmacyService.errorMessage = new Array<string>();
        this.pharmacyService.errorMessage[0] = this.reportResponse.cartItemList[0].statusMessage;
        this.pharmacyService.isError = false;
        this.pharmacyService.showMessage = false;
        if (this.paymentModeIndex == 5) {
          alert('Raised pharmacy bill successfully and sent payment link to the patient.')
          this.gotoPharmacyOrderList();
        }
        else {
          alert('Raised pharmacy bill successfully.');
          this.gotoPharmacyInvoice();
        }
      } else {
        this.reportResponse = reportResponse;
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = this.reportResponse.statusMessage;
        this.isError = true;
        this.showMessage = true;
      }
    }).catch(error => {
      console.error('Error occurred while getting the advice details', error);
      this.isError = true;
      this.showMessage = true;
      this.errorMessage[0] = 'Something went wrong. Please try again.';
    });
  }

  gotoPharmacyOrderList(): void {
    this.router.navigate(['/app/pharmacy/orders']);
  }

  onBackButtonClick() {
    this.pharmacyService.showMessage = true;
    this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
    this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
    this.router.navigate(['/app/pharmacy/advice/newadvice']);
  }

  onEditOrderClickHandler() {
    this.pharmacyService.showMessage = true;
    this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
    this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
    this.router.navigate(['/app/pharmacy/advice/newadvice']);
  }

  async gotoPharmacyInvoice() {
    await this.onSummary();
    this.router.navigate(['/app/pharmacy/advice/invoice']);
  }

  calculateBasket() {
    let basketRequest = new BasketRequest();
    if (!this.cartItem.empId || this.cartItem.empId == 0) {
      this.cartItem.empId = this.authService.userAuth.employeeId;
    }
    if (!this.cartItem.bookingSource || this.cartItem.bookingSource == 0) {
      this.cartItem.bookingSource = 3;
    }
    basketRequest.parentProfileId = this.cartItem.parentProfileId;
    basketRequest.cartItemList = new Array<CartItem>();
    basketRequest.cartItemList[0] = this.cartItem;

    this.cartItem.actualDate = 11111;
    this.spinnerService.start();
    this.diagnosticService.calculateBasket(basketRequest).then((basketResponse) => {
      this.spinnerService.stop();
      this.cartItem = basketResponse.cartItemList[0];
      console.log('calculateBasket', JSON.stringify(basketResponse));
    });
  }

  onSummary() {
    this.pharmacyService.isError = false;
    this.pharmacyService.showMessage = false;
    if (this.basketRequest != undefined && this.basketRequest != null) {
      this.pharmacyService.pharmacyAdviseTrack = this.basketRequest.cartItemList[0];
    }
    this.pharmacyService.pharmacyList = null;
  }

}
