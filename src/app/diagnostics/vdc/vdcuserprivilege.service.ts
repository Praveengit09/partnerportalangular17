import { Injectable } from "@angular/core";
import { AppConstants } from "../../base/appconstants";
import { AuthService } from "../../auth/auth.service";
import { HttpService } from "../../base/http.service";
import { CommonUtil } from "../../base/util/common-util";
import { URLStringFormatter } from "../../base/util/url-string-formatter";
import { ToasterService } from "../../layout/toaster/toaster.service";
import { SpinnerService } from "../../layout/widget/spinner/spinner.service";
@Injectable()
export class VdcUserPrivilegeService {
    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private commonUtil: CommonUtil,
        private spinnerService: SpinnerService,
        private toast: ToasterService,
    ) { }
    getUserPrivileges(type: number, status: number, fromDate: number, toDate: number, mobileNo: String, from: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
            GET_USER_PRIVILEGES, type, status, fromDate, toDate, mobileNo, from),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data" + JSON.stringify(data))
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return data;
                } else {
                    return data;
                }
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });

    }
    updateuserprivilegetype(request: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_UPDATEUSER_PRIVILEGE_TYPE_AND_STATUS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return data;
                } else {
                    return data;
                }
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });

    }
}