import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { PocSubscriptionDetails } from "../../../../../model/saas/pocsubscriptiondetails";
import { HsLocalStorage } from "../../../../../base/hsLocalStorage.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../../../auth/auth.service";
import { ToasterService } from "../../../../../layout/toaster/toaster.service";
import { Config } from '../../../../../base/config';
import { Payment } from "../../../../../model/basket/payment";
import { BBCartItem } from "../../../../../model/basket/b2bcartitem";
 

@Component({
    selector: 'sucbscriptioncart',
    templateUrl: './cart.template.html',
    styleUrls: ['./cart.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class SubscriptionCartComponent implements OnInit {


    pocId: number;
    paytmform: any = {};
    cartItem: BBCartItem = new BBCartItem();
    enable = false;
    userDetails: any = {};
    noOfDays: number = 0;
    currencySymbol: string = '';

    constructor(private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService, private router: Router,
        private saasService: saasSubscriptionsService, private authService: AuthService, private toast: ToasterService) {
        this.userDetails.fName = this.authService.employeeDetails.firstName;
        this.userDetails.lName = this.authService.employeeDetails.lastName;
        this.userDetails.pocName = this.authService.selectedPocDetails.pocName;
        this.userDetails.email = this.authService.employeeDetails.emailId;
        this.userDetails.mobile = this.authService.employeeDetails.contactList[0];
        this.currencySymbol = Config.portal.currencySymbol;

    }

    ngOnInit() {

        if (this.saasService.cartItem != undefined) {
            this.cartItem = this.saasService.cartItem;
            this.hsLocalStorage.setData('cartItem', this.cartItem);
        } else if (this.hsLocalStorage.getData('cartItem')) {
            this.cartItem = this.hsLocalStorage.getData('cartItem');
            this.saasService.cartItem = this.cartItem;
        }


        let date = new Date();
        let time = new Date(date.getTime());
        time.setMonth(date.getMonth() + 1);
        time.setDate(0);
        this.noOfDays = time.getDate() > date.getDate() ? time.getDate() - date.getDate() : 0;

    }



    onPayNowButtonCickHandler() {
        // this.saasService.cartItem = this.cartItem;
        // this.router.navigate(['/app/master/poc/saas-subscriptions/checkout']);
        this.enable = true;
        (<any>$)("#checkout").modal("show");
    }



}


