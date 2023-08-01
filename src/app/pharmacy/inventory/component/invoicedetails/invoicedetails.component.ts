import { UpdateSupplierOrderListRequest } from './../../../../model/pharmacy/updateSupplierOrderListRequest';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { PaymentGatewayParameters } from './../../../../model/payment/paymentGatewayParameters';
import { Payment, PaymentConnst } from './../../../../model/basket/payment';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../../auth/auth.service';
import { BBCartItem } from '../../../../model/basket/b2bcartitem';
import { PharmacyService } from '../../../pharmacy.service';
import { Config } from "../../../../base/config"
import { BasketConstants } from '../../../../constants/basket/basketconstants';


@Component({
  selector: 'invoicedetails',
  templateUrl: './invoicedetails.template.html',
  styleUrls: ['./invoicedetails.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class InvoiceDetails implements OnInit {

  supplierAdviseTrack: BBCartItem;
  showPayment: boolean = false;
  paymentModeIndex: number = 3;
  paymentStatus: number = 0;
  isPaymentRequired = false;
  transactionId: string = '';
  paytmform: any = {};
  payuform: any = {};
  payUPaymentUrl = '';
  paymentMode: string = "Online";
  pharmacyNote: string = '';

  paymentOrderId: string = "";
  paymentInvoiceId: string = "";
  isPaymentError = false;
  paymentErrMsg = [''];
  productList: Array<StockOrder> = new Array();
  stockOrder: StockOrder = new StockOrder();
  updateSupplierOrderListRequest: UpdateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();

  constructor(private pharmacyService: PharmacyService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(params => {
      console.log(params);
      this.paymentOrderId = params['orderId'];
      this.paymentInvoiceId = params['invoiceId'];
    });
  }

  ngOnInit() {
    this.supplierAdviseTrack = this.pharmacyService.getSupplierAdviseTrack();
    console.log('oninit==>', this.supplierAdviseTrack);

    this.payUPaymentUrl = (Config.TEST_TYPE == Config.LIVE) ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";
    if (this.paymentOrderId) {
      this.pharmacyService.getB2bOrderDetails(this.paymentOrderId, this.paymentInvoiceId).then(res => {
        if (res && res.length) {
          this.supplierAdviseTrack = { ...this.supplierAdviseTrack, ...res[0] }
          this.isPaymentError = false;
          if (this.supplierAdviseTrack.payment.paymentStatus != 0) {
            this.paymentErrMsg = ['Payment Successfully Done !!'];
          } else {
            this.paymentErrMsg = ['Payment Failed Try Again !!'];
            this.isPaymentError = true;
          }
        }
        console.log(res);
      })
    }
    this.checkBasket();
    if (this.supplierAdviseTrack.payment.paymentStatus) {
      let paymentType = PaymentConnst.filter(item => item.value === this.supplierAdviseTrack.payment.transactionType)
      if (paymentType && paymentType.length > 0)
        this.paymentMode = paymentType[0].type;
    }
  }

  onGenerateBack(): void {
    this.router.navigate(['/app/pharmacy/inventory/orderlist']);
  }

  onSubmit(status: number) {
    this.pharmacyService.updateSupplierInvoiceStatus
      ({ orderId: this.supplierAdviseTrack.orderId, purchaserEmpId: this.auth.userAuth.employeeId, invoiceCompletionStatus: status }).then((res) => {
        alert("Products has been updated successfully");
        this.onGenerateBack();
      });
  }

  onUpdate(status: number) {

    this.pharmacyService.updateQuotationStatus
      ({ payment: { finalAmount: this.supplierAdviseTrack.payment.finalAmount }, pharmacyNote: this.pharmacyNote, orderId: this.supplierAdviseTrack.orderId, invoiceCompletionStatus: status }).then((res) => {
        alert("Quatation has been updated successfully");
        this.onGenerateBack();
      });
  }
  selectPayMode(type: number = Payment.PAYMENT_TYPE_ONLINE) { this.paymentModeIndex = type; }
  // initiatePaymentRequest.transactionType = Payment.PAYMENT_TYPE_ONLINE;

  RedirectPayment() {
    this.showPayment = true;
  }

  confirmOrder() {
    //selectpaymode is used bcz only online payment is there
    this.selectPayMode(3);
    let isError = false;
    this.supplierAdviseTrack.bookingSource = BasketConstants.BOOKING_SOURCE_PARTNER_PORTAL;
    if (this.paymentModeIndex != Payment.PAYMENT_TYPE_ONLINE) {
      if (!this.transactionId.trim()) {
        isError = true;
        alert('Please Update Transaction Details');
      }
      else {
        this.supplierAdviseTrack.payment.transactionId = this.transactionId;
        this.supplierAdviseTrack.payment.paymentStatus = Payment.PAYMENT_STATUS_PAID;
      }
    } else if (this.paymentModeIndex == Payment.PAYMENT_TYPE_ONLINE) {
      this.supplierAdviseTrack.paymentSource = BasketConstants.PAYMENT_SOURCE_PARTNER_PORTAL;
      this.isPaymentRequired = true;
    }

    this.supplierAdviseTrack.payment.transactionType = this.paymentModeIndex;
    if (!isError)
      this.pharmacyService.supplierInitiatePayment(this.supplierAdviseTrack).then((basketRequest) => {
        if (basketRequest && basketRequest.statusCode == 200) {
          const { paymentGatewayParameters, payment: { transactionType } } = basketRequest;
          if (transactionType != Payment.PAYMENT_TYPE_ONLINE) {
            alert('Order Confirmed');
            this.onGenerateBack();
          }
          if (paymentGatewayParameters && (paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.PayUBiz
            || paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.PayUMoney)) {
            this.makePaymentWithPayYou(basketRequest);
          } else if (paymentGatewayParameters && paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.PayTM) {
            console.log(JSON.stringify(basketRequest))
            this.makePaymentWithPaytm(basketRequest);
          } else if (paymentGatewayParameters && paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.RazorPay) {
            console.log(JSON.stringify(basketRequest))
            this.makePaymentWithRazorPay(basketRequest);
          }
        }
        else {
          console.log("something went wrong");
          // this.goTopaymentLogin();
        }
      }).catch(
        (error1) => {
          console.log(error1);
          // this.goTopaymentLogin();
        }
      );

    // this.pharmacyService.supplierInitiatePayment(this.supplierAdviseTrack).then(res => {
    //   console.log('initiate payment',res);

    //   alert('Payment Successful');
    //   // this.router.navigate(['/app/pharmacy/inventory/orderlist']);
    // });
  }


  onPrintButtonClick() {
    if (this.supplierAdviseTrack.payment.paymentStatus == 1) {
      let pdfUrl = '';
      if (this.auth.userAuth.pdfHeaderType == 0) {
        pdfUrl = this.supplierAdviseTrack.pdfUrlWithHeader;
      } else {
        pdfUrl = this.supplierAdviseTrack.pdfUrlWithoutHeader;
      }
      this.pharmacyService.openPDF(pdfUrl);
    }
  }

  onRepeatOrder() {

    const { pharmacyList, productList, pocDetails } = this.supplierAdviseTrack
    let list: Array<any> = pharmacyList && pharmacyList.length ? pharmacyList : productList;
    this.productList = list.map((pharma, index) => {
      return { ...this.stockOrder, ...pharma, requiredQuantity: pharma.quantity }
    })

    this.updateSupplierOrderListRequest.supplierDetails = { ...pocDetails }
    this.pharmacyService.supplierDetails = this.updateSupplierOrderListRequest;
    this.pharmacyService.productStockList = this.productList;

    if (pharmacyList && pharmacyList.length) { this.router.navigate(['/app/pharmacy/inventory/stockorder']); }
    else { this.router.navigate(['/app/product/inventory/stockorder']); }
  }


  makePaymentWithPaytm(basketRequest: any) {
    console.log(basketRequest.paymentGatewayParameters);
    const { merchantId, transactionURL, amount, surl, orderId, hash } = basketRequest.paymentGatewayParameters;
    this.paytmform = {
      merchantId, transactionURL,
      amount, orderId, paytmChecksum: hash, callbackUrl: surl
    };
    console.log(JSON.stringify(this.paytmform))

    if (+this.paytmform.amount > 0) {
      setTimeout(() => {
        $('#paytmForm').submit();
      }, 1);
    }
  }
  makePaymentWithPayYou(basketRequest: any) {
    console.log(basketRequest.paymentGatewayParameters);
    const { amount, email, mobile, orderId, key, udf1,
      productInfo, firstName, surl, furl, hash } = basketRequest.paymentGatewayParameters;
    this.payuform = {
      amount, email, phone: mobile, txnid: orderId, key, udf1,
      productinfo: productInfo, firstname: firstName, surl, furl, hash
    };

    if (+this.payuform.amount > 0) {
      console.log(this.payuform);
      setTimeout(() => {
        $('#payUForm').submit();
      }, 200);
    }
  }
  makePaymentWithRazorPay(basketRequest: any) {
    const { paymentGatewayParameters } = basketRequest;
    let options = this.getRazorPayOptions(paymentGatewayParameters);
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    setTimeout(() => {
      var rzp1 = (window as any).Razorpay(options);
      rzp1.open();
    }, 1000);
  }
  getRazorPayOptions(razorPayForm) {
    const { merchantId, amount, orderId, firstName, hash, email, mobile } = razorPayForm;
    let call = this;
    const options = {
      key: merchantId,
      amount: amount,
      currency: "INR",
      name: Config.portal.name,
      description: orderId,
      order_id: hash,
      // image: 'https://cdn.razorpay.com/logos/7K3b6d18wHwKzL_medium.png',
      handler: function (response) {
        console.log(response);
        if (response && response.razorpay_payment_id && response.razorpay_payment_id != "") {
          let reqBody = {
            razorpay_payment_id: '', razorpay_order_id: razorPayForm.orderId,
            transactionId: razorPayForm.description, ...response
          }

          call.pharmacyService.updateRazorPayPayment(reqBody).then(response => {
            if (response.statusCode == 200) {
              call.router.navigate(['app/pharmacy/inventory/orderlist']);
            }
            else
              console.log("update razorpay ", response);
          })

        }

      },
      prefill: {
        name: firstName,
        contact: mobile,
        email: email
      },
      notes: {
        address: 'some address'
      },
      theme: {
        color: 'blue',
        hide_topbar: true
      }
    }
    return options;
  }


  checkBasket() {
    if (!this.supplierAdviseTrack.payment)
      this.supplierAdviseTrack.payment = new Payment();
  }
}