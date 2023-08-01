import { AppConstants } from './../base/appconstants';
import { Injectable } from '@angular/core';
import { HttpService } from '../base/http.service';

@Injectable({ providedIn: 'root' })
export class ProductDeliveryService {

    private deliveryType = '';
    constructor(private httpService: HttpService) {
        this.deliveryType = localStorage.getItem('deliveryType');
        console.log('productDeliveryService onInit==>' + this.deliveryType);
    }
    setDeliveryType(type) {
        this.deliveryType = type;
        localStorage.setItem('deliveryType', this.deliveryType)
    }
    getDeliveryType(): string {
        return this.deliveryType;
    }
    // GET_ASSIGNED_ORDERS_FOR_DELIVERY_AGENT
    getOrdersForDelivery(reqBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ASSIGNED_ORDERS_FOR_DELIVERY_AGENT,
            reqBody, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => { if (err) { return err; } });
    }
    updatehomeordersfordelivery(reqBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().POST_HOMEORDER_FOR_DELIVERY,
            JSON.stringify(reqBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => { if (err) { return err; } });
    }
}