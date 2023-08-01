import { DiscountType } from './../../../../../model/package/discountType';
import { PaymentType } from './../../../../../model/payment/paymentType';
import { Payment } from './../../../../../model/basket/payment';
import { BasketRequest } from './../../../../../model/basket/basketRequest';
import { DiagnosticsService } from './../../../../../diagnostics/diagnostics.service';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { Location } from '@angular/common';
import { ProductCentralService } from '../../../../productCentral.service';

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../../../../model/basket/cartitem';
import { AuthService } from '../../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../../base/hsLocalStorage.service';


@Component({
  selector: '[summary-homeorder-component]',
  templateUrl: './summary.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./summary.style.scss']
})
export class HomeOrderSummaryComponent implements OnInit {

  cartItem: CartItem;
  pdfHeaderType: number;

  paymentModeIndex = 0;
  isError = false;
  showMessage = false;
  errorMessage = new Array();
  pocId = 0;
  transactionId: string = '';
  reportResponse: any;
  modalMessage: string = '';
  discountType = DiscountType.TYPE_MISCELLANEOUS;

  constructor(private productService: ProductCentralService,
    private authService: AuthService, private router: Router,
    private diagnosticService: DiagnosticsService,
    private _location: Location, private spinnerService: SpinnerService,
    private hsLocalStorage: HsLocalStorage) {
    //console.log("pdf type" + this.pdfHeaderType);
  }

  ngOnInit() {
    this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH
    this.pocId = this.authService.userAuth.pocId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
    this.cartItem = this.productService.cartItem;
    //console.log('sending_summary', this.cartItem);
    // console.log("json-->" + JSON.stringify(this.cartItem));
    if (this.cartItem) {
      let data = { 'productAdviceTrack': this.cartItem };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.cartItem = this.hsLocalStorage.getComponentData().productAdviceTrack;
      if (!this.cartItem) {
        this.onBackButtonClick();
      }
    }
    this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
  }
  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
  }

  checkPaymentStatusSelection(index: number) {
    if (index == 1) {
      this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
    } else {
      this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
    }
  }

  checkFinalAmount() {
    return this.cartItem.payment.finalAmount > 0;
  }
  ConfirmOrder() {
    let basketRequest: BasketRequest = new BasketRequest();
    if (!this.cartItem.empId || this.cartItem.empId == 0) {
      this.cartItem.empId = this.authService.userAuth.employeeId;
      basketRequest.empId = this.authService.userAuth.employeeId;
    }
    if (!this.cartItem.bookingSource || this.cartItem.bookingSource == 0) {
      this.cartItem.bookingSource = 3;
    }
    if (this.paymentModeIndex != Payment.PAYMENT_TYPE_CASH && this.transactionId) {
      this.cartItem.payment.transactionId = this.transactionId;
    }
    this.cartItem.payment.transactionType = this.paymentModeIndex;
    if( this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE)
    this.cartItem.payment.paymentStatus = this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE ? Payment.PAYMENT_STATUS_NOT_PAID : Payment.PAYMENT_STATUS_PAID;
    basketRequest.orderId = this.cartItem.orderId;
    basketRequest.cartItemList = new Array();
    basketRequest.cartItemList.push(this.cartItem);
    basketRequest.bookingSource = this.cartItem.bookingSource;
    basketRequest.transactionType = this.cartItem.payment.transactionType;
    basketRequest.parentProfileId = this.cartItem.parentProfileId;
    basketRequest.totalOriginalAmount = this.cartItem.payment.originalAmount;
    basketRequest.totalTaxationAmount = this.cartItem.payment.taxationAmount;
    basketRequest.totalOtherDiscountAmount = this.cartItem.payment.otherDiscountAmount;
    basketRequest.totalFinalAmount = this.cartItem.payment.finalAmount;
    basketRequest.pocId = this.pocId;
    this.spinnerService.start();
    basketRequest = { ...this.productService.productDeliveryDetails, ...basketRequest }
    // this.diagnosticService.deliveryAmount(basketRequest)
    this.diagnosticService.initiatePayment(basketRequest).then(reportResponse => {
      this.spinnerService.stop();
      if (reportResponse.statusCode == 201 || reportResponse.statusCode == 200) {
        this.spinnerService.stop();
        this.reportResponse = reportResponse;
        // by updating cartItem cart-discount recalcuting everything
        // this.cartItem = reportResponse.cartItemList[0];
        this.productService.cartItem = { ...reportResponse.cartItemList[0] };
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = this.reportResponse.statusMessage;
        this.isError = false;
        this.showMessage = true;
        if( this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE)
        this.modalMessage = this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE ? 'Order Initiated Successfully. Payment Pending!!' : 'Payment Done Successfully';
        
        this.modalMessage = this.cartItem.payment.paymentStatus == 0 ? 'Order Initiated Successfully. Payment Pending!!' : 'Payment Done Successfully';
        (<any>$)('#messageModal').modal('show');
        // this.gotoProductInvoice();
      } else {
        this.spinnerService.stop();
        this.reportResponse = reportResponse;
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = this.reportResponse.statusMessage;
        this.isError = true;
        this.showMessage = true;
      }
    }).catch(error => {
      this.spinnerService.stop();
      console.error('Error occurred while getting the order details', error);
    });
  }
  gotoProductInvoice() {
    this.spinnerService.stop();
    // this.productService.cartItem = this.cartItem;
    if (this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE) this.router.navigate(['/app/product/homeorder']);
    else this.router.navigate(['/app/product/homeorder/invoice']);
  }

  onBackButtonClick() {
    this._location.back();
    // this.router.navigate(['/app/product/homeorder']);
  }
}
