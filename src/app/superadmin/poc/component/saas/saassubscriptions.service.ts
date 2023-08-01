import { Injectable } from "@angular/core";
import { AppConstants } from "../../../../../app/base/appconstants";
import { HttpService } from "../../../../../app/base/http.service";
import { URLStringFormatter } from "../../../../../app/base/util/url-string-formatter";
import { BaseResponse } from "../../../../../app/model/base/baseresponse";
import { BBCartItem } from "../../../../../app/model/basket/b2bcartitem";
import { PocSubscriptionDetails } from "../../../../../app/model/saas/pocsubscriptiondetails";
import { ProductDetails } from "../../../../model/product/productdetails";

@Injectable()
export class saasSubscriptionsService {

    currentSubscriptionDetails: PocSubscriptionDetails = new PocSubscriptionDetails();
    paytmform = null;
    subscriptionAddedToCart: PocSubscriptionDetails = new PocSubscriptionDetails();
    cartItem: BBCartItem;

    constructor(
        private httpService: HttpService, private urlStringFormatter: URLStringFormatter


    ) {

    }

    getSubscriptionDetails(pocId): Promise<PocSubscriptionDetails> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_SUBSCRIBED_SUBSCRIPTION_DETAILS, pocId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    cancelSubscription(pocId): Promise<BaseResponse> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().CANCEL_SUBSCRIPTION, pocId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    changeSubscription(requestBody): Promise<BBCartItem> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CHANGE_SUBSCRIPTION_PLAN, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getPastSubscriptionsInvoices(pocId): Promise<BBCartItem[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PAST_SUBSCRIPTIONS_INVOICES, pocId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getAbandonedSubscriptions(): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ABANDONED_SUBSCRIPTIONS, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getAllSubscriptions(): Promise<ProductDetails[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ALL_SUBSCRIPTIONS), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    // GET_CANCELLED_ORDERS

    getCancelledSaasOrders(searchTerm): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CANCELLED_ORDERS
            , searchTerm), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }


    //service for making payment
    initiateSubscriptonPurchaseService(requestBody: BBCartItem): Promise<BBCartItem> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_SUBSCIPTIONS_PURCHASE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    //service for renewing
    renewService(requestBody: BBCartItem): Promise<BBCartItem> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().RENEW_SUBSCRIPTION_PLAN, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getB2BOrderDetails(orderId, invoiceId): Promise<BBCartItem[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_B2B_ORDER_DETAILS, orderId, invoiceId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
} 