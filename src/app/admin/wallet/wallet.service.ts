import { Injectable } from "@angular/core";
import { AppConstants } from "../../base/appconstants";
import { HttpService } from "../../base/http.service";
import { URLStringFormatter } from "../../base/util/url-string-formatter";


@Injectable({ providedIn: 'root' })
export class WalletService {

    constructor(
        private httpService: HttpService,
        private urlStringFormatter: URLStringFormatter
    ) {

    }

    checkWalletAmount(profileId: number, finalAmount, usedWalletAmount, packageSelected): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().CHECK_WALLET_AMOUNT, profileId, finalAmount, usedWalletAmount, packageSelected),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateWalletUsage(walletUpdateRequest: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_WALLET_USED_AMOUNT, JSON.stringify(walletUpdateRequest),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
}
