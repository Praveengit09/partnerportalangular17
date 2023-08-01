import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { PocSubscriptionDetails } from "../../../../../model/saas/pocsubscriptiondetails";
import { HsLocalStorage } from "../../../../../base/hsLocalStorage.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../../../auth/auth.service";
import { Product } from "../../../../../model/product/product";
import { ProductDetails } from "../../../../../model/product/productdetails";
import { ToasterService } from "../../../../../layout/toaster/toaster.service";
import { BBCartItem } from "../../../../../model/basket/b2bcartitem";

@Component({
    selector: 'modifysubscription',
    templateUrl: './modifysubscription.template.html',
    styleUrls: ['./modifysubscription.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class ModifySubscriptionComponent implements OnInit {

    // subscriptionsList: ProductDetails[] = new Array<ProductDetails>();
    currentSubscription = new PocSubscriptionDetails();
    subscriptionPlansCategoryList = new Array();
    fiteredSubscriptionsBasedOnCategory = new Array();
    subscriptionsList = new Array();

    constructor(private hsLocalStorage: HsLocalStorage, private saasService: saasSubscriptionsService,
        private spinner: SpinnerService, private authService: AuthService, private router: Router,
        private toast: ToasterService) {

    }

    ngOnInit() {
        if (this.saasService.currentSubscriptionDetails != undefined) {
            this.currentSubscription = this.saasService.currentSubscriptionDetails;
            this.hsLocalStorage.setData('currentSubscription', this.currentSubscription);
        } else if (this.hsLocalStorage.getData('currentSubscription')) {
            this.currentSubscription = this.hsLocalStorage.getData('currentSubscription');
            this.saasService.currentSubscriptionDetails = this.currentSubscription;
        }
        this.getAllSubscriptions();


        $(document).on('click', '.modify-heading', function () {
        localStorage.setItem("activeSubMenu", $(this).text());
        if ($(this).hasClass('activebg')) {
          $('.modify-heading').removeClass('activebg');
          $(this).addClass('normalbg');
        }
        else if ($('.modify-heading').hasClass('activebg')) {
          $('.modify-heading').removeClass('activebg');
          $(this).addClass('activebg');
        }
        else {
          $(this).addClass('activebg');
        }

        if ($(this).parent().hasClass('keep-opensubmenu')) {
          $('.dropdown').removeClass('keep-opensubmenu');
          $(this).parent().addClass('hidesubmenu');
        }
        else if ($('.dropdown').hasClass('keep-opensubmenu')) {
          $('.dropdown').removeClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
          $(this).parent().addClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
        }
        else {
          $(this).parent().removeClass('hidesubmenu');
          $(this).parent().addClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
        }
      });
      if ($(".dropdown").hasClass("keep-opensubmenu")) {
        $('.modify-heading').addClass('activebg');
      }

      $('ul.keep-open').click(function (e) {
        $(this).parent(".dropdown").addClass("keep-opensubmenu");
      });

    }
    

    async getAllSubscriptions() {
        this.spinner.start();
        await this.saasService.getAllSubscriptions().then((response) => {
            if (response && response.length > 0) {
                if (this.currentSubscription && this.currentSubscription.planDetails && this.currentSubscription.planDetails.productId) {

                    this.subscriptionsList = response.filter(item => item.productId != this.currentSubscription.planDetails.productId);
                } else {
                    this.subscriptionsList = response;
                }
                this.fiterCategoriesFromList();
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.spinner.stop();

        });

    }

    async fiterCategoriesFromList() {

        let subscriptionPlanListDetails = this.subscriptionsList.slice();
        let packagesBasedOnCategoryList = new Array<any>();
        packagesBasedOnCategoryList.push({
            categoryId: subscriptionPlanListDetails[0].categoryId,
            categoryName: subscriptionPlanListDetails[0].categoryName,
            isSelected: true
            //you may need to add description also
        });

        subscriptionPlanListDetails.forEach((subscription, i) => {
            for (let j = 0; j < packagesBasedOnCategoryList.length; j++) {
                if (subscription.categoryId == packagesBasedOnCategoryList[j].categoryId) {
                    return;
                }
                else {
                    packagesBasedOnCategoryList.push({
                        categoryId: subscription.categoryId,
                        categoryName: subscription.categoryName,
                        isSelected: false
                        //you may need to add description also
                    });
                }
            }

        });

        this.subscriptionPlansCategoryList = packagesBasedOnCategoryList;
        console.log('subscriptionPlansCategoryList', this.subscriptionPlansCategoryList);
        this.onSassSubscriptionPlansClickHandler(0);

    }

    onSassSubscriptionPlansClickHandler(index) {

        let tempsubscriptionPlans = this.subscriptionPlansCategoryList.slice();
        let categoryId = tempsubscriptionPlans[index].categoryId;
        tempsubscriptionPlans.forEach((element, i) => {
            if (index == i) {
                element.isSelected = true;
            }
            else {
                element.isSelected = false;
            }
        });
        let fiteredSubscriptionsBasedOnCategory = this.subscriptionsList.filter((ele, i) => {
            return ele.categoryId == categoryId;
        });
        this.fiteredSubscriptionsBasedOnCategory = fiteredSubscriptionsBasedOnCategory;

    }




    onSubscriptionSelectHandler(item) {
        this.spinner.start();
        let selectedSubscription: ProductDetails = item;
        let requestBody = new BBCartItem();
        requestBody.purchaserPocId = this.authService.employeeDetails.employeePocMappingList[0].pocId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.purchaserEmpId = requestBody.empId;
        requestBody.brandId = this.authService.selectedPocDetails.brandId;
        requestBody.appId = this.authService.userAuth.brandId;
        requestBody.bookingSource = 3;
        requestBody.cartItemType = 103;
        requestBody.pocDetails = this.authService.selectedPocDetails;
        let product = new Product();
        product = selectedSubscription;
        requestBody.productList = new Array<Product>();
        requestBody.productList.push(product);
        this.saasService.changeSubscription(requestBody).then((response) => {
            this.spinner.stop();
            //add success toast as subscription modified
            if (response.statusCode == 201) {
                this.toast.show('Plan changed successfully.', "bg-success text-white font-weight-bold", 3000);
                this.router.navigate(['/app/master/poc/saas-subscriptions/saas']);
            } else if (response.statusCode == 200) {
                // Initiate payment
                this.saasService.cartItem = response;
                this.router.navigate(['/app/master/poc/saas-subscriptions/cart']);


                // this.router.navigate(['/app/master/poc/saas-subscriptions/checkout']);
            } else {
                this.toast.show('Something went wrong. Please try again', "bg-danger text-white font-weight-bold", 3000);
            }
        }).catch((err) => {
            this.spinner.stop();
            this.toast.show('Something went wrong. Please try again', "bg-danger text-white font-weight-bold", 3000);
        })
    }




}


