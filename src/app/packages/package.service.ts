import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { HttpService } from "../base/http.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from './../base/appconstants';
import { BasketRequest } from "./../model/basket/basketRequest";
import { Doctor } from "./../model/employee/doctor";
import { DiscountResponse } from './../model/package/discountResponse';
import { HealthPackage } from "./../model/package/healthPackage";
import { Config } from '../../../src/app/base/config.js';


@Injectable()
export class PackageService {

    packageList: HealthPackage[] = new Array<HealthPackage>();
    selectedpackage: HealthPackage;
    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;
    brandId: number;
    doctorId: number;
    viewspecialists: any;
    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) {
        console.log(JSON.stringify(Config.portal))
        this.brandId = Config.portal.appId;
    }

    getpackageList(): Promise<HealthPackage[]> {
        console.log("request" + this.brandId);
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PACKAGESLIST, this.brandId), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                this.packageList = data;
                console.log("lissttttpackage" + JSON.stringify(data));
                return Promise.resolve(this.packageList);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPackageDoctors(serviceId: string, packageId: number): Promise<Doctor[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getPackageDoctorsURL(this.httpService.getPaths().GET_PACKAGE_DOCTOR_BY_DISTANCE, serviceId, packageId), AppConstants.POZ_BASE_URL_INDEX).then(
            (data) => {
                console.log("docotrlist" + JSON.stringify(data));
                let doctorList: Array<Doctor> = data;
                return Promise.resolve(doctorList);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getpackagedoctorsbydistance(serviceId: string, packageId: number, latitude: number, longitude: number): Promise<Doctor[]> {
        return this.httpService.httpGetPromise((this.httpService.getPaths().GET_PACKAGE_DOCTOR_BY_DISTANCE + "?serviceId=" + serviceId + "&packageId=" + packageId + "&latitude=" + latitude + "&longitude=" + longitude), AppConstants.POZ_BASE_URL_INDEX).then(
            (data) => {
                console.log("docotrlist" + JSON.stringify(data));
                let doctorList: Array<Doctor> = data;
                return Promise.resolve(doctorList);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    // updatepaymentstatusForPackage(basketRequest: BasketRequest): Promise<PaymentResponse> {
    //     console.log("request"+JSON.stringify(basketRequest));
    //     let paymentResponse: PaymentResponse;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().UPADTE_PAYMENT_STATUS, JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //         paymentResponse = data;
    //         console.log("update Order response >>>>>>>>>>>" + JSON.stringify(paymentResponse));
    //         // if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
    //         return Promise.resolve(paymentResponse);
    //         //}
    //         // return reportResponse;
    //     }).catch((err) => {
    //         if (err) {
    //             console.log(err);
    //             return Promise.reject(paymentResponse);
    //         }
    //     });
    // }

    // updatePaymentProviderDetail(basketRequest: BasketRequest): Promise<any> {
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT, JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //         return Promise.resolve(data);
    //     });
    // }

    getBookedPackagesList(profileId: number, serviceId: number, doctorId: number, discountType: number, pocId: number, SlotDate?): Promise<DiscountResponse> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
            GET_BOOKED_PACKAGES, profileId, serviceId, doctorId, discountType, pocId, SlotDate ? SlotDate : 0, Config.portal.appId), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                let discountResponse: DiscountResponse = data;
                return Promise.resolve(discountResponse);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                let discountResponse: DiscountResponse = new DiscountResponse();
                return Promise.resolve(discountResponse);
                // }
            });;
    }


    checkPackageDiscount(basketRequest: BasketRequest): Promise<BasketRequest> {
        console.log("BasketRequestBodyToServer:: " + JSON.stringify(basketRequest));
        let basketResponse: BasketRequest;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PACKAGE_DISCOUNT, JSON.stringify(basketRequest),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                basketResponse = data;
                // console.log("BasketResponseFromServer::" + JSON.stringify(basketResponse));
                return basketResponse;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return basketResponse;
                // }
            });
    }

    getWalletAmount(profileId: number, postWallet): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_WALLET_AMOUNT, profileId, postWallet),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    // addPackageToPaymentDesk(basketRequest: BasketRequest): Promise<BasketRequest> {
    //     let basketResponse: BasketRequest;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().ADDPACKAGETOPAYMENTQUEUE, JSON.stringify(basketRequest),
    //         AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //             basketResponse = data;
    //             return basketResponse;
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return basketResponse;
    //             }
    //         });
    // }

}
