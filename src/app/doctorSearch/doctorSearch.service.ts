import { Injectable } from "@angular/core";
import { HttpService } from '../base/http.service';
import { AuthService } from '../auth/auth.service';
import { URLStringFormatter } from '../base/util/url-string-formatter';
import { AppConstants } from '../base/appconstants';
import { Doctor } from '../model/employee/doctor';
import { SearchRequest } from '../model/common/searchRequest';
import { DoctorDetails } from '../model/employee/doctordetails';

@Injectable()

export class DoctorSearchService{
    

    constructor(
        private httpService: HttpService,
        private auth: AuthService
    
    ) {
    }

    // getDoctorList(pocId: number, empId: number, roleId: number): Promise<Doctor[]> {
    //     return this.httpService.httpGetPromise(this.httpService.getPaths().GETLISTFORDOCTORSEARCH + "?pocId=" + pocId + "&empId=" + empId + "&roleId=" + roleId, AppConstants.POZ_BASE_URL_INDEX)
    //         .then((data) => {
    //             console.log("datacheck>>>>" + JSON.stringify(data));
    //             return Promise.resolve(data);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }

    getSearchedDoctorsList(searchRequest: SearchRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GETLISTFORDOCTORSEARCH, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    addNewDoctorToServer(doctor:DoctorDetails) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_NEW_DOCTOR, JSON.stringify(doctor), AppConstants.POZ_BASE_URL_INDEX)
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