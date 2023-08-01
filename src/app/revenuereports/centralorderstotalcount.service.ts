
import { Injectable } from '@angular/core';
import { HttpService } from '../base/http.service';
import { AuthService } from '../auth/auth.service';
import { URLStringFormatter } from '../base/util/url-string-formatter';
import { AppConstants } from '../base/appconstants';
import { TotalCentralOrdersAndPaidCount } from '../model/common/totalcentralordersandpaidcount';
import { Config } from '../base/config';

@Injectable()
export class CentralOrdersTotalCountService {
    constructor(private httpService: HttpService, private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) { }

    getTotalOrdersCountList(brandId: number, fromDate: number, toDate: number): Promise<TotalCentralOrdersAndPaidCount> {
        let url: any;
        console.log('brandid' + brandId);
        if (Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_TOTAL_ORDERS_COUNT2, fromDate, toDate);
        }
        else {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_TOTAL_ORDERS_COUNT, brandId, fromDate, toDate);
        }
        return this.httpService.httpGetPromise(url, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {

                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
}
