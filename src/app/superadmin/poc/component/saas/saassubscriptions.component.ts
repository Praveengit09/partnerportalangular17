import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { PocSubscriptionDetails } from "../../../../model/saas/pocsubscriptiondetails";
import { AuthService } from "../../../../auth/auth.service";
import { HsLocalStorage } from "../../../../base/hsLocalStorage.service";
import { SpinnerService } from "../../../../layout/widget/spinner/spinner.service";
import { saasSubscriptionsService } from "./saassubscriptions.service";
import { ToasterService } from "../../../../layout/toaster/toaster.service";
import { BBCartItem } from "../../../../model/basket/b2bcartitem";
import { Router } from "@angular/router";
import { Payment } from "../../../../model/basket/payment";
import { PaymentGatewayParameters } from "../../../../model/payment/paymentGatewayParameters";
import { Config } from '../../../../base/config';
import { Product } from "../../../../model/product/product";

@Component({
  selector: 'saassubscriptions',
  templateUrl: './saassubscriptions.template.html',
  styleUrls: ['./saassubscriptions.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class SassSubscriptionsComponent implements OnInit {

  subscriptionDetails: PocSubscriptionDetails = new PocSubscriptionDetails();
  pastInvoicesDetails: BBCartItem[] = new Array<BBCartItem>();
  errorMsg: string = '';
  pocId: number;
  pdfHeaderType: number;
  perPage: number = 10;
  dataMsg: string = ' ';
  total: number = 0;
  paytmform: any = {};

  columns: any[] = [
    {
      display: 'Order Id',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Subscription Name',
      variable: 'productList[0].productName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Date',
      variable: 'createdTimestamp',
      filter: 'date',
      sort: true
    },
    {
      display: 'Amount Paid',
      variable: 'payment.finalAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      variable: 'payment.paymentStatus',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          value: '0',
          condition: 'lte',
          label: 'Not Paid'
        },

        {
          condition: 'default',
          label: 'Not Paid'
        }
      ]
    },
    {
      display: 'Action',
      style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'payNow',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Pay Now',
          style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'lte',
          label: 'Paid',
          style: 'width-200 mb-xs botton_txtdigo disabled done_txt'
        },
        {
          value: '3',
          condition: 'lte',
          label: 'Pay Now',
          style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
        }

      ]
    },
    {
      display: 'Receipt',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btndigo disabled'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'orderId',
    descending: true
  };

  constructor(private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService, private router: Router,
    private saasService: saasSubscriptionsService, private authService: AuthService, private toast: ToasterService) {
    this.pocId = this.authService.selectedPocDetails.pocId;
  }

  ngOnInit() {

    this.getSubscriptionDetails();
    this.getPastInvoices();

  }


  async getSubscriptionDetails() {

    this.spinnerService.start();
    await this.saasService.getSubscriptionDetails(this.pocId).then((res) => {
      if (Object.entries(res).length != 0 && res != undefined && res != null) {
        this.subscriptionDetails = res;
        this.spinnerService.stop();
      } else {
        this.errorMsg = 'You do not have any current subscriptions'
      }
    }).catch((err) => {
      this.spinnerService.stop();
    })
  }

  clickEventHandler(e) {
    if (e.event == "payNow") {
      if (e.val.payment.paymentStatus != 1)
        this.onPayNowButtonCickHandler(e.val);
    }
    else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }

  onImageClicked(cartItem: BBCartItem): void {

    let pdfHeaderType = this.authService.userAuth.pdfHeaderType;
    if (cartItem.payment.paymentStatus == 1) {
      if (pdfHeaderType == 0) {
        this.authService.openPDF(cartItem.pdfUrlWithHeader)
      } else {
        this.authService.openPDF(cartItem.pdfUrlWithoutHeader)
      }

    }

  }


  onCancelSubscriptionButtonClickHandler() {
    this.closeCancelSubscriptionModal();
    let pocId: number = this.subscriptionDetails.pocId;
    this.spinnerService.start();
    this.saasService.cancelSubscription(pocId).then((res) => {
      if (Object.entries(res).length != 0 && res != undefined && res != null) {
        this.toast.show(res.statusMessage, "bg-success text-white font-weight-bold", 3000);
        this.spinnerService.stop();
      } else {
        this.errorMsg = 'You do not have any current subscriptions';
      }
    }).catch((err) => {
      this.toast.show('Something went wrong. Please try again', "bg-danger text-white font-weight-bold", 3000);

    }).finally(() => {
      this.getSubscriptionDetails();
      this.spinnerService.stop();
    })
  }

  onRenewPlanButtonClickHandler() {
    this.spinnerService.start();
    let selectedSubscription: Product = this.subscriptionDetails.planDetails;
    let requestBody = new BBCartItem();
    requestBody.purchaserPocId = this.authService.employeeDetails.employeePocMappingList[0].pocId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.purchaserEmpId = this.authService.employeeDetails.empId;
    requestBody.brandId = this.authService.selectedPocDetails.brandId;
    requestBody.appId = this.authService.userAuth.brandId;
    requestBody.purchaserPocDetails = this.authService.selectedPocDetails;
    requestBody.bookingSource = 3;
    requestBody.cartItemType = 103;
    requestBody.pocDetails = this.authService.selectedPocDetails;
    let product = new Product();
    product = selectedSubscription;
    requestBody.productList = new Array<Product>();
    requestBody.productList.push(product);
    this.saasService.renewService(requestBody).then((response) => {
      this.spinnerService.stop();
      if (response.statusCode == 200) {
        // Initiate payment
        this.saasService.cartItem = response;
        this.router.navigate(['/app/master/poc/saas-subscriptions/cart']);
      } else {
        this.toast.show('Something went wrong. Please try again', "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      this.spinnerService.stop();
      this.toast.show('Something went wrong. Please try again', "bg-danger text-white font-weight-bold", 3000);
    })
  }

  onOpenModal() {
    (<any>$)("#cancelSubscription").modal("show");
  }

  onViewBilling() {
    (<any>$)("#viewBillingHistory").modal("show");
  }

  closeViewBillingModal() {
    (<any>$)("#viewBillingHistory").modal("hide");
  }


  closeCancelSubscriptionModal() {
    (<any>$)("#cancelSubscription").modal("hide");
  }

  onChangePlanButtonClickHandler() {

    this.saasService.currentSubscriptionDetails = this.subscriptionDetails;
    this.router.navigate(['/app/master/poc/saas-subscriptions/modifySubscription']);

  }

  async getPastInvoices() {
    this.spinnerService.start();
    await this.saasService.getPastSubscriptionsInvoices(this.pocId).then((res) => {
      if (res.length > 0 && res != undefined && res != null) {
        this.pastInvoicesDetails = res;
        this.total = this.pastInvoicesDetails.length;
      }
      else {
        if (this.pastInvoicesDetails.length == 0) {
          this.dataMsg = 'No Data Found'
        }

      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      this.spinnerService.stop();
    })
  }



  onPayNowButtonCickHandler(item) {
    let requestBody: BBCartItem = new BBCartItem();
    requestBody = item;
    requestBody.purchaserPocId = this.pocId;
    requestBody.purchaserEmpId = this.authService.employeeDetails.empId;
    requestBody.purchaserPocDetails = this.authService.selectedPocDetails;
    requestBody.paymentSource = 3;
    requestBody.subscriptionRenewal = true;
    if (!requestBody.baseInvoiceId)
      requestBody.baseInvoiceId = requestBody.invoiceId;
    if (!requestBody.parentInvoiceId)
      requestBody.parentInvoiceId = requestBody.invoiceId;

    if (!requestBody.payment) {
      requestBody.payment = new Payment();
    }

    if (requestBody.payment.originalAmount && requestBody.payment.originalAmount > 0 && requestBody.payment.finalAmount == 0) {
      requestBody.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
    } else {
      requestBody.payment.transactionType = Payment.PAYMENT_TYPE_ONLINE;
    }

    this.spinnerService.start();
    // let response: any = { data: {} };
    this.saasService.initiateSubscriptonPurchaseService(requestBody).then(response => {
      this.spinnerService.stop();
      if (response.statusCode == 200) {
        const { paymentGatewayParameters, payment: { transactionType } } = response;
        if (paymentGatewayParameters && paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.PayTM) {
          console.log(JSON.stringify(response));
          this.makePaymentWithPaytm(response);
        } else if (paymentGatewayParameters && paymentGatewayParameters.paymentGateway == PaymentGatewayParameters.RazorPay) {
          console.log(JSON.stringify(response));
          this.makePaymentWithRazorPay(response);
        }
      }
      else {
        this.toast.show(response.statusMessage, "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch(error => {
      this.spinnerService.stop();
      console.error('Error occurred while subscribing', error);
    });
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
    const { merchantId, subscriptionId, orderId, firstName, mobile, email } = razorPayForm;
    const options = {
      key: merchantId,
      subscription_id: subscriptionId,
      currency: "INR",
      name: Config.portal.name,
      description: orderId,
      callback_url: "https://api-qa.healthsignz.net/QAPOZAppServices/payment/partnersubscribe",
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

  makePaymentWithPaytm(b2bCartItem: BBCartItem) {
    if (b2bCartItem.paymentGatewayParameters) {
      let paytmform: PaymentGatewayParameters = b2bCartItem.paymentGatewayParameters;
      if (paytmform) {
        if (!paytmform.transactionURL) {
          if (Config.TEST_TYPE >= Config.LIVE) {
            paytmform.transactionURL = "https://securegw.paytm.in/theia/api/v1/showPaymentPage?mid=" + paytmform.merchantId + "&orderId=" + paytmform.orderId;
          } else {
            paytmform.transactionURL = "https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=" + paytmform.merchantId + "&orderId=" + paytmform.orderId;
          }
        }

        this.getPaymentForm(paytmform);
      }
    } else {
      this.toast.show("Something went wrong.", "bg-danger text-white font-weight-bold", 3000);
    }
  }

  getPaymentForm(paytmform) {
    this.paytmform = paytmform;
    console.log('paytmform', this.paytmform);
    if (paytmform) {
      setTimeout(() => {
        $('#paytmForm').submit();
      }, 10);

    }
  }

}
