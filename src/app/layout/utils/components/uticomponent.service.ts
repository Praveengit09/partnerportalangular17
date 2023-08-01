import { Injectable } from '@angular/core';
import { URLStringFormatter } from './../../../base/util/url-string-formatter';
import { AppConstants } from './../../../base/appconstants';
import { HttpService } from './../../../base/http.service';
import { PocSearch } from './../../../model/poc/pocSearch';


@Injectable({ providedIn: 'root' })
export class UtilComponentsService {

    constructor(private httpService: HttpService, private urlStringFormatter: URLStringFormatter) { }
    getPocDetails(request: PocSearch): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_POC_DETAILS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
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