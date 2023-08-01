import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConfig } from '../app.config';
import { AppConstants } from './../base/appconstants';
import { ConsultationQueueRequest } from './../model/slotbooking/consultationQueueRequest';
import { PatientQueue } from './../model/reception/patientQueue';
import { BaseResponse } from "../model/base/baseresponse";

@Injectable()
export class NurseService {

    config: AppConfig = new AppConfig();
    pocId: any;
    patientQ: PatientQueue;
    advicesResponse: any;


    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private nurseStringFormatter: URLStringFormatter
    ) { }

    getSbrAdvices(advices) {
        this.advicesResponse = advices;
    }
    getSBRAdvicesResponse() {
        return this.advicesResponse;
    }
    // getConsultationQueueFromServer(consultationQueueRequest: ConsultationQueueRequest): Promise<any[]> {
    //     let patientQueueList: Array<PatientQueue>
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CONSULTATION_QUEUE,
    //         JSON.stringify(consultationQueueRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //             patientQueueList = data;
    //             // console.log("ConsultationQueueFromServerList Response :: " + JSON.stringify(patientQueueList));
    //             return Promise.resolve(patientQueueList);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }

    getVitalsDetails(date: number, patientId: number): Promise<any> {
        console.log("GET_VITAL_DETAILS URL:: " + this.httpService.getPaths().GET_VITAL_DETAILS);
        return this.httpService.httpGetPromise(this.nurseStringFormatter.format(this.httpService.getPaths().GET_VITAL_DETAILS, date, patientId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updateVitalsToServer(request: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_VITAL_READING,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("updateVitalsToServer Response :: " + JSON.stringify(data));
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return Promise.resolve(data);
                }
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    // GET_SYMPTOM_BASED_ADVICELIST
    generateSymptomBasedAdvice(request: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SYMPTOM_BASED_ADVICELIST,
            JSON.stringify(request), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                console.log("updateVitalsToServer Response :: " + JSON.stringify(data));
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return Promise.resolve(data);
                }
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSymptomsList(): Promise<any> {
        console.log("GET_VITAL_DETAILS URL:: " + this.httpService.getPaths().GET_SYMPTOMS_LIST);
        return this.httpService.httpGetPromise(this.nurseStringFormatter.format(this.httpService.getPaths().GET_SYMPTOMS_LIST), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getSymptomsAdvices(medicationId: number, profileId: number, genderId: number, symptomId) {
        return this.httpService.httpGetPromise(this.nurseStringFormatter.format(this.httpService.getPaths().GET_SYMPTOMS_ADVICE, medicationId, profileId, genderId, symptomId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    getWalkinBookingQuestions(profileId, phrType = 104): Promise<any> {

        return this.httpService.httpGetPromise(this.nurseStringFormatter.format(this.httpService.getPaths().GET_WALKIN_BOOKING_QUESTIONS, profileId, phrType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateVideoBookingQuestions(request): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_VIDEO_BOOKING_QUESTIONS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }

    updateWalkinBookingQuestions(request): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_WALKIN_BOOKING_QUESTIONS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }


    // getMandatoryPhrProfile(patientId: number): Promise<any> {
    //     return this.httpService.httpGetPromise(this.httpService.getPaths().GET_MANDATORY_PHRPROFILE + "?profileId=" + patientId, AppConstants.CONQUEST_BASE_URL_INDEX)
    //         .then((data) => {
    //             return Promise.resolve(data);
    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return Promise.reject(err);
    //             }
    //         });
    // }
}
