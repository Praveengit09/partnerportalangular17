import { BaseResponse } from './../model/base/baseresponse';
import { SpinnerService } from './../layout/widget/spinner/spinner.service';
import { ToasterService } from './../layout/toaster/toaster.service';
import { URLStringFormatter } from './../base/util/url-string-formatter';
import { AuthService } from './../auth/auth.service';
import { AppConstants } from './../base/appconstants';
import { ProductDeliveryRequest } from './../model/product/productdeliveryrequest';
import { HttpService } from './../base/http.service';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class ProductCentralService {

    tempPdfUrl = "";
    productDeliveryDetails: any;

    cartItem: any = null;
    isUpdate = false;
    constructor(private httpService: HttpService, private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private toast: ToasterService,
        private spinnerService: SpinnerService) {

    }

    getproductdeliveries(centraProductDeliveryRequest: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CENTRAL_PRODUCT_DELIVERIESLIST,
            JSON.stringify(centraProductDeliveryRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getOrderDetails(orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ORDER_DETAILS, orderId, invoiceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    async getPdfUrl(pdfUrl) {
        this.spinnerService.start();
        await this.auth.getTempUrl(pdfUrl).then((url: BaseResponse) => {
            this.spinnerService.stop();
            if ((url.statusCode == 201 || url.statusCode == 200)) {
                this.tempPdfUrl = url.data;
                return url.data;
            } else {
                this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
                return false;
            }
        }).catch((err) => {
            this.spinnerService.stop();
            this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
            return false;
        })
    }
    pincodeSearch(pinCode) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_STATE_CITY_BY_PINCODE, pinCode),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    saveAddress(address) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATEADDRESS, JSON.stringify(address), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

}