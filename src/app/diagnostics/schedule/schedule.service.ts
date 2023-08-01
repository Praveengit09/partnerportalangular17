import { Injectable } from "@angular/core";
import { AuthService } from '../../auth/auth.service';
import { AppConstants } from '../../base/appconstants';
import { HttpService } from '../../base/http.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { Region } from '../../model/employee/getRegion';
import { InvestigationDayTime } from '../../model/superadmin/investigationDayTime';
import { LocationModeResponse } from '../../model/common/locationmoderesponse';
import { PocCollectionCharges } from '../../model/common/poccollectioncharges';

@Injectable()
export class DiagnosticScheduleService {

    selectedAreaList: LocationModeResponse[] = [];
    allAreasofCity: LocationModeResponse[] = [];
    editDiagnosticSchedule: InvestigationDayTime = new InvestigationDayTime();
    isScheduleEdit: boolean = false;
    selectedCity: LocationModeResponse = new LocationModeResponse();
    pocId: number;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter) {

    }

    createDiagnosticSchedule(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_DIAGNOSTIC_SCHEDULE,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getdiagnosticSchedulelist(pocId) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTIC_SCHEDULE_LIST, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    insertPrecautionInDiagnostic(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_PRECAUTION_IN_DIAGNOSTIC,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("repsonse" + data);
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getDiagnosticListBasedOnFirstChar(scheduleId: number, pocId: number, firstChar: string, scheduleType: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTICLIST_BASEDON_FIRSTCHAR,
            scheduleId, pocId, firstChar, scheduleType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getRegion(region: Region): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REGION, JSON.stringify(region), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    getDiagnosticListForOtherChar(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTICLIST_FOR_OTHER_CHARS, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticCollectionCharges(brandId: number, type: number, pocId: number): Promise<any> {
        // this.pocId = this.auth.userAuth.pocId;
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_COLLECTION_CHARGES,
            pocId, brandId, type),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updatedeliveryCharges(request: PocCollectionCharges): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DELIVERY_CHARGES,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

}