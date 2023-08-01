import { Injectable } from "@angular/core";
import { HttpService } from '../../base/http.service';
import { AuthService } from '../../auth/auth.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { AppConstants } from '../../base/appconstants';
import * as OT from '@opentok/client';
import { BasketRequest } from '../../model/basket/basketRequest';
import { PatientQueue } from '../../model/reception/patientQueue';


@Injectable()
export class DigiQueueService {

    session: OT.Session;
    token: string;
    queue: PatientQueue;
    API_KEY: any;
    SESSION_ID: any;
    TOKEN: any;

    videoConnectionStatus: string = '';
    isNetworkQualityTested: boolean = true;
    audioSupported = false;
    videoSupported = false;

    public basketRequest: BasketRequest;


    constructor(
        private httpService: HttpService,
        private auth: AuthService, private urlStringFormatter: URLStringFormatter
    ) { }

    getDoctorsConsultationQueue(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_CONSULATATION_QUEUE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    generateTestVideoSessionid(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GENERATE_TEST_VIDEO_SESSIONID, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getOT() {
        return OT;
    }

    setOpenTokCredential(api_key: any, session_id: string, token: string) {
        this.API_KEY = api_key;
        this.SESSION_ID = session_id;
        this.TOKEN = token;
    }

    initSession() {

        if (this.API_KEY && this.TOKEN && this.SESSION_ID) {
            this.session = this.getOT().initSession(this.API_KEY, this.SESSION_ID);
            this.token = this.TOKEN;
            return Promise.resolve(this.session);
        } else {
            return Promise.reject("Session not initiated");
            // return fetch(CONSTS.SAMPLE_SERVER_BASE_URL + '/session')
            //     .then((data) => data.json())
            //     .then((json) => {
            //         this.session = this.getOT().initSession(json.apiKey, json.sessionId);
            //         this.token = json.token;
            //         return this.session;
            //     });
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.session.connect(this.token, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.session);
                }
            })
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            window.localStorage.removeItem("tokenId");
            window.localStorage.removeItem("apiKey");
            window.localStorage.removeItem("tokenId");
            this.session.disconnect();
        });
    }
}