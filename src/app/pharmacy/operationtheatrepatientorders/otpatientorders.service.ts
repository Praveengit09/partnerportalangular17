import { AuthService } from '../../auth/auth.service';
import { HttpService } from '../../base/http.service';
import { Injectable } from '@angular/core';
import { AppConstants } from '../../base/appconstants';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { CartItem } from '../../model/basket/cartitem';

@Injectable()
export class OtPatientOrdersService {
    public selectedOtpatientOrdersBillNoList = new Array();
    public otPatientAdviceDetails = new CartItem();
    public otPatientAdviceDetailsForEdit = new CartItem();
    public isEditOrder = false;
    public isMultipleOrdersEdit = false;

    constructor(private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,


    ) { }


    getotPatientOrdersList(pocId: number, mobileNo: string, email: string, startDate, endDate, from: number, size: number, status: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PHARMACY_OT_PATIENT_ORDERS, pocId, mobileNo, email, startDate, endDate, from, size, status), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {

                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    getOtPatientConsolidatedBillDetails(billNoList: String[]): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CONSOLIDATED_BILL_FOR_OTPATIENT_PHARMACY_ORDER, billNoList), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }

    createOtPatientOrder(cartItem: CartItem): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_OT_PATIENT_PHARMACY_ORDER,
            JSON.stringify(cartItem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }

    editOtPatientOrder(cartItem: CartItem): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().EDIT_PAHRMACY_OT_PATIENT,
            JSON.stringify(cartItem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }

}
