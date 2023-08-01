import { Component, Input, ViewEncapsulation } from "@angular/core";
import { AppConfig } from "../../../../../../app/app.config";
import { AuthService } from "../../../../../auth/auth.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";
import { BBCartItem } from "../../../../../model/basket/b2bcartitem";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";
import { ToasterService } from "../../../../../layout/toaster/toaster.service";
import { PaymentGatewayParameters } from "../../../../../model/payment/paymentGatewayParameters";
import { Config } from '../../../../../base/config';
import { Payment } from "../../../../../model/basket/payment";

@Component({
    selector: 'subscriptioncheckout',
    templateUrl: './checkout.template.html',
    styleUrls: ['./checkout.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SubscriptionCheckoutComponent {

    paytmform: any = {};
    // @Input() cartItem = new BBCartItem();

    constructor(private spinnerService: SpinnerService, config: AppConfig,
        private toast: ToasterService, private authService: AuthService, private saasService: saasSubscriptionsService) {

    }

    ngOnInit(): void {
        let cartItem = this.saasService.cartItem;
        cartItem.purchaserPocId = this.authService.selectedPocDetails.pocId;
        cartItem.purchaserEmpId = this.authService.employeeDetails.empId;
        cartItem.purchaserPocDetails = this.authService.selectedPocDetails;
        cartItem.paymentSource = 3;
        cartItem.subscriptionRenewal = true;
        if (!cartItem.baseInvoiceId)
            cartItem.baseInvoiceId = cartItem.invoiceId;
        if (!cartItem.parentInvoiceId)
            cartItem.parentInvoiceId = cartItem.invoiceId;

        if (!cartItem.payment) {
            cartItem.payment = new Payment();
        }

        if (cartItem.payment.originalAmount && cartItem.payment.originalAmount > 0 && cartItem.payment.finalAmount == 0) {
            cartItem.payment.transactionType = Payment.PAYMENT_TYPE_CASH;
        } else {
            cartItem.payment.transactionType = Payment.PAYMENT_TYPE_ONLINE;
        }
        this.initiatePayment(this.saasService.cartItem);
    }

    initiatePayment(requestBody) {

        this.spinnerService.start();
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