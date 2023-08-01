import { Injectable } from '@angular/core';
import { HttpService } from '../base/http.service';
import { AuthService } from '../auth/auth.service';
import { URLStringFormatter } from '../base/util/url-string-formatter';
import { AppConstants } from '../base/appconstants';
import { CentralDashboardTotalCountView } from '../model/common/centraldashboardtotalcountview';
import { TotalCentralOrdersAndPaidCount } from '../model/common/totalcentralordersandpaidcount';
import { Config } from '../base/config';

@Injectable()
export class OpsService {
    constructor(private httpService: HttpService, private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) { }


    getOpsDashboardData(checkFiled: number, brandId: number, fromDate: number, toDate: number): Promise<CentralDashboardTotalCountView> {
        let url: any;
        if (Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_OPS_DASHBOARD_DETAILS2, checkFiled, fromDate, toDate)
        }
        else {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_OPS_DASHBOARD_DETAILS, checkFiled, brandId, fromDate, toDate);
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

    getTurnAroundTime(brandId: number, fromDate: number, toDate: number) {
        let url: any;
        if (Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_TURN_AROUND_TIME2, fromDate, toDate)
        }
        else {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_TURN_AROUND_TIME, brandId, fromDate, toDate);
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

    getTotalOrdersCountList(brandId: number, fromDate: number, toDate: number): Promise<TotalCentralOrdersAndPaidCount> {
        let url: any;
        if (Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
            url = this.urlStringFormatter.format(this.httpService.getPaths().GET_TOTAL_ORDERS_COUNT2, fromDate, toDate)
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