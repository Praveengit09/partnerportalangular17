import { Injectable } from '@angular/core';
import { LocationModeResponse } from '../../model/common/locationmoderesponse';
import { InvestigationDayTime } from '../../model/superadmin/investigationDayTime';
import { HttpService } from '../../base/http.service';
import { AuthService } from '../../auth/auth.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { AppConstants } from '../../base/appconstants';
import { Region } from '../../model/employee/getRegion';

@Injectable()
export class WellnessScheduleService {

    editWellnessSchedule: InvestigationDayTime = new InvestigationDayTime();
    isScheduleEdit: boolean = false;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter) {

    }

    createWellnessSchedule(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_WELLNESS_SCHEDULE,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    //service to get wellness schedule details list.
    getWellnessScheduleList(pocId) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_WELLNESS_SCHEDULE_LIST, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    //service for adding precautions to services.
    insertPrecautionInWellness(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_PRECAUTION_IN_WELLNESS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("repsonse" + data);
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getRegion(region: Region): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REGION, JSON.stringify(region), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }


    getWellnessListBasedOnFirstChar(pocId: number, firstChar: string,scheduleId:number,scheduleType:number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_WELLNESSLIST_BASEDON_FIRSTCHAR,
            pocId, firstChar,scheduleId,scheduleType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getWellnessListForOtherChar(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_WELLNESS_FOR_OTHER_CHARS, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }




}