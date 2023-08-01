import { Employee } from './../../model/employee/employee';
import { AppConstants } from './../../base/appconstants';
import { Injectable } from '@angular/core';
import { URLStringFormatter } from './../../base/util/url-string-formatter';
import { AuthService } from './../../auth/auth.service';
import { HttpService } from './../../base/http.service';

@Injectable()
export class UserReportService {
    healthscore = [
        // {
        //     key: "HealthScore",
        //     values: [
        {
            "x": "0",
            "y": "103"
        },
        {
            "x": "10",
            "y": "72"
        },
        {
            "x": "20",
            "y": "1"
        },
        {
            "x": "30",
            "y": "2"
        },
        {
            "x": "40",
            "y": "2"
        },
        {
            "x": "80",
            "y": "1"
        }
        //     ]
        // }
    ];





    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) { }


    getAgeGraphReport(fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_AGE_DASHBOARD_GRAPH_DETAILS, fromDate, toDate, stateId, cityId, areaId), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++age" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getGenderScoreGraphReport(fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_GENDER_DASHBOARD_GRAPH_DETAILS, fromDate, toDate, stateId, cityId, areaId), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getHealthScoreGraphReport(fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().HEALTH_SCORE_DASHBOARD_GRAPHDETAILS, fromDate, toDate, stateId, cityId, areaId), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getRiskProfileeGraphReport(fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().RISK_PROFILE_DASHBOARD_GRAPH_DETAILS, fromDate, toDate, stateId, cityId, areaId), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getPHRGraphReport(fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number, listOfQuetionIds: number): Promise<any> {
        console.log("=============>+++" + JSON.stringify(listOfQuetionIds))
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PHR_DASHBOARD_GRAPH_DETAILS, fromDate, toDate, stateId, cityId, areaId, listOfQuetionIds), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getHEATLH_SCORE_AVG_MAP_DATA(type: string, latlng: Array<number>): Promise<any> {
        let req = {
            "type": type,
            "latlng": { "latitude": latlng[0], "longitude": latlng[1] }
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().HEATLH_SCORE_AVG_MAP_DATA,
            JSON.stringify(req), AppConstants.CONQUEST_BASE_URL_INDEX).then((res: [any]) => {
                console.log(res);
                return Promise.resolve(res);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                //  }
            });
    }//PHR_DASHBOARD_MAP_DATA
    getPHR_DASHBOARD_MAP_DATA(type: string, latlng: Array<number>, phrIdList: Array<number>): Promise<any> {
        let req = {
            "type": type,
            "latlng": { "latitude": latlng[0], "longitude": latlng[1] },
            "questionIds": phrIdList
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().PHR_DASHBOARD_MAP_DATA,
            JSON.stringify(req), AppConstants.CONQUEST_BASE_URL_INDEX).then((res: [any]) => {
                console.log(res);
                return Promise.resolve(res);
            }).catch((err) => {
                // if (err) { 
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
}