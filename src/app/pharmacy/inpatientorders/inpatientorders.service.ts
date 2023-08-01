import { AuthService } from '../../auth/auth.service';
import { HttpService } from '../../base/http.service';
import { Injectable } from '@angular/core';
import { AppConstants } from '../../base/appconstants';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { CartItem } from '../../model/basket/cartitem';

@Injectable()
export class InpatientOrdersService {
    public selectedInpatientOrders = new Array<CartItem>();
    public isSingleOrder = false;
    public isPaymentSummary = false;
    constructor(private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,


    ) { }


    getinPatientOrdersList(pocId: number, from: number, size: number, orderId: string, mobileNo: string, paymentStatus: number, fromDate?: number, toDate?: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_INPATIENT_PHARMACY_ORDER, pocId,
            from, size, orderId, mobileNo, paymentStatus, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                //this.pharmacyAdviseList = data;
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    getConsolidatedBillDetails(billNoList: string[]): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CONSOLIDATED_BILL_FOR_INPATIENT_PHARMACY_ORDER, billNoList), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                //this.pharmacyAdviseList = data;
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }

}
