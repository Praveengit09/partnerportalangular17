import { Component, ViewEncapsulation } from "@angular/core";
import { Config } from '../../../../../base/config';
import { AppConfig } from "../../../../../../app/app.config";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../auth/auth.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";

@Component({
    selector: 'confirmationpage',
    templateUrl: './confirmation.template.html',
    styleUrls: ['./confirmation.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ConfirmationComponent {
    brandName: string = '';
    subscriptionDetails: any;
    noOfDays: number;
    employeeName: string;
    currencySymbol: string = '';

    constructor(private activatedRoute: ActivatedRoute, config: AppConfig, private spinner: SpinnerService,
        private router: Router, private auth: AuthService, private saasService: saasSubscriptionsService) {
        this.employeeName = auth.employeeDetails.firstName + ' ' + auth.employeeDetails.lastName;
        this.currencySymbol = Config.portal.currencySymbol;
        if (Config.portal)
            this.brandName = Config.portal.name;

    }

    ngOnInit(): void {
        let orderId = null;
        let invoiceId = null;
        this.activatedRoute.params.subscribe(params => {
            if (params['orderId'] != null && params['orderId'] != undefined && params['orderId'] != '') {
                orderId = params['orderId'] + '';
            }
            if (params['invoiceId'] != null && params['invoiceId'] != undefined && params['invoiceId'] != '') {
                invoiceId = params['invoiceId'] + '';
            }
            this.getOrderDetails(orderId, invoiceId);
        });
    }

    getOrderDetails(orderId, invoiceId) {
        this.spinner.start();
        this.saasService.getB2BOrderDetails(orderId, invoiceId).then(res => {
            if (res[0].payment.paymentStatus != 3 && res[0].payment.paymentStatus == 1) {
                if (res && res.length > 0) {
                    this.subscriptionDetails = res[0];
                }
                console.log(res);
            }
            else {
                this.router.navigate(['/app/master/poc/saas-subscriptions/saas']);
            }

        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            this.spinner.stop();
        })
    }

    onBackToHome() {
        this.router.navigate(['/app/master/poc/saas-subscriptions/saas']);
    }



}
