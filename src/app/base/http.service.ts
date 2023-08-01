import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, throwError, map, catchError } from 'rxjs';
import { Config } from './config';
import { CryptoUtil } from './../auth/util/cryptoutil';
import 'rxjs/add/operator/toPromise';
import { URLConstants } from './urlconstants';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';

@Injectable()
export class HttpService extends URLConstants {

    constructor(private http: HttpClient) {
        super();
        let tempData = localStorage.getItem('qaChangeIP');
        this.qaChangeIp = tempData ? JSON.parse(tempData) : '';
    }

    public AWS_QA_BASE_URL: Array<string> =
        ["HSignzAppServices", "POZAppServices", "DEV_ELASTIC_URL", "DEV_CHAT_URL",
            "DEV_BYPASS_SESSION", "DEV_BYPASS_ENCRYPTION", "POZAppServices", "HSignzAppServices"];

    public qaChangeIp: Array<string> = new Array();

    httpGetPromise(path: string, urlIndex: number, reqOptions?: any): Promise<any> {
        let sessionId: string = this.getSessionId();
        let requestSignature: string = this.getRequestHash(path, null, sessionId, true);
        let hostUrl = this.hostDataUpdate(urlIndex);
        let apiUrl = `${hostUrl}${path}`;
        if (!reqOptions) {
            // Set header parameters
            reqOptions = { headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'sessionid': sessionId, 'request-signature': requestSignature, 'sourceapp': '3' } };
        }
        return this.http.get(apiUrl, reqOptions).pipe(
            timeout(25000)) // Setting the timeout to 25 seconds
            .toPromise()
            .then(data => {
                return this.extractResponse(data);
            }).catch(this.handleErrorForPromise);
    }

    httpPostPromise(path: string, reqBody: any, urlIndex: number, reqOptions?: any): Promise<any> {
        let hostUrl = this.hostDataUpdate(urlIndex);
        let apiUrl = `${hostUrl}${path}`;
        let byPassAuth: boolean = false;
        switch (path) {
            case 'account/login': {
                byPassAuth = true;
                break;
            }
            case 'account/otp': {
                byPassAuth = true;
                break;
            }
            case 'account/otp/password': {
                byPassAuth = true;
                break;
            }
            default: {
                byPassAuth = false;
                break;
            }
        }

        if (!reqOptions) {
            // Set header parameters
            if (byPassAuth) {
                reqOptions = { headers: { 'Content-Type': 'application/json; charset=utf-8', 'accept': 'application/json', 'sourceapp': '3' } };
            } else {
                let sessionId: string = this.getSessionId();
                let requestSignature: string = this.getRequestHash(path, reqBody, sessionId, false);
                reqOptions = { headers: { 'Content-Type': 'application/json; charset=utf-8', 'accept': 'application/json', 'sessionid': sessionId, 'request-signature': requestSignature, 'sourceapp': '3' } };
            }
        }

        return this.http.post(apiUrl, reqBody, reqOptions).pipe(
            timeout(25000))// Setting the timeout to 25 seconds
            .toPromise().then(data => {
                return this.extractResponse(data)
            }).catch(this.handleErrorForPromise);

    }

    httpGetObservable(path: string, urlIndex: number, reqOptions?: any): Observable<any> {
        let sessionId: string = this.getSessionId();
        let hostUrl = this.hostDataUpdate(urlIndex);
        let uri = `${hostUrl}${path}`;
        if (!reqOptions) {
            // Set header parameters
            reqOptions = { headers: { 'Content-Type': 'application/json; charset=utf-8', 'accept': 'application/json', 'sessionid': sessionId, 'sourceapp': '3' } };
        }
        // return this.http.get(uri).map(data => {
        //     this.extractResponse(data);
        // }).catch(this.handleErrorForObservable);
        return this.http.get(uri).pipe(
            timeout(25000),
            map(this.extractResponse), // Use map here
            catchError(this.handleErrorForObservable)
        );
    }

    httpPostObservable(path: string, reqBody: any, urlIndex: number, reqOptions?: any): Observable<any> {
        let sessionId: string = this.getSessionId();
        let hostUrl = this.hostDataUpdate(urlIndex);
        let uri = `${hostUrl}${path}`;
        if (!reqOptions) {
            // Set header parameters
            reqOptions = { headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'sessionid': sessionId, 'sourceapp': '3' } };
        }
        // return this.http.post(uri, reqBody, reqOptions).map(data => {
        //     this.extractResponse(data);
        // }).catch(this.handleErrorForObservable);
        return this.http.post(uri, reqBody, reqOptions).pipe(
            timeout(25000),
            map(this.extractResponse), // Use map here
            catchError(this.handleErrorForObservable)
        );
    }

    extractResponse(res: any): any {
        let assign = res ? res : {};
        return assign;
    }

    handleErrorForPromise(err: Response | any): any {
        console.log("Error ", JSON.stringify(err));
        if (err instanceof Response) {
            return Promise.reject(err);
        } else {
            return Promise.reject(err);
        }
    }

    handleErrorForObservable(err: Response | any): any {
        console.log("Error ", JSON.stringify(err));
        if (err instanceof Response) {
            return throwError(err);
        }
        else {
            return throwError(err);
        }
    }

    private hostDataUpdate(urlIndex) {
        let hosturl = null;
        if ((Config.TEST_TYPE < 0) || ((Config.TEST_TYPE == Config.BUG_FIX_MODE || Config.TEST_TYPE == 3)
            && (this.qaChangeIp && this.qaChangeIp.length > 0 && this.qaChangeIp[urlIndex]))) {
            if (this.AWS_QA_BASE_URL[urlIndex] == "POZAppServices" ||
                this.AWS_QA_BASE_URL[urlIndex] == "HSignzAppServices") {
                let addOn = this.qaChangeIp[urlIndex][4] == 's' ? 6 : 0;
                hosturl = this.qaChangeIp[urlIndex] + "/" + this.AWS_QA_BASE_URL[urlIndex + addOn] + "/";
            }
            else if (this.AWS_QA_BASE_URL[urlIndex] == "DEV_ELASTIC_URL" ||
                this.AWS_QA_BASE_URL[urlIndex] == "DEV_CHAT_URL") {
                hosturl = this.qaChangeIp[urlIndex] + "/";
            } else {
                if (Config.TEST_TYPE > -1) {
                    hosturl = this.getHostUrl(urlIndex)
                } else {
                    let configType = 3;
                    localStorage.removeItem('qaChangeIP');
                    Config.changeTestType(+configType);
                    localStorage.setItem('changeTestType', configType + '');
                    hosturl = this.getHostUrl(urlIndex);
                }
            }
        } else {
            hosturl = this.getHostUrl(urlIndex);
        }
        return hosturl;
    }

    private getHostUrl(urlIndex): String {
        let hosturl: String = null;
        switch (urlIndex) {
            case 0:
                hosturl = Config.URLS.HSIGNZ_SERVER_URL;
                break;
            case 1:
                hosturl = Config.URLS.POZ_SERVER_URL;
                break;
            case 2:
                hosturl = Config.URLS.SEARCH_SERVER_URL;
                break;
            case 3:
                hosturl = Config.URLS.CHAT_SERVER_URL;
                break;
            default:
                break;
        }
        return hosturl;
    }

    uploadFile(fileUrl: string, data): Promise<any> {
        return this.http.put(fileUrl, data).pipe(
            timeout(30000))// Setting the timeout to 30 seconds
            .toPromise()
            .then(data => {
                return data;
            }).catch(this.handleErrorForPromise);
    }

    private getSessionId(): string {
        let sessionId: string = null;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('raptor') != null && window.localStorage.getItem('raptor').length > 0) {
            sessionId = cryptoUtil.decryptData(window.localStorage.getItem('raptor'));
        }
        return sessionId;
    }

    private getRequestHash(path: string, requestBody: any, sessionToken, isGet): string {
        let request = requestBody ? requestBody : {};
        if (isGet) {
            let pathParams = this.getQueryParams(path);
            let tmp = {};
            for (var key in request) {
                tmp[key] = `${request[key]}`;
            }
            if (pathParams) {
                for (var key in pathParams) {
                    tmp[key] = `${pathParams[key]}`;
                }
            }
            request = tmp;
        } else {
            request = JSON.parse(requestBody);
        }
        if (sessionToken) {
            let salt = sessionToken.substring(1, 7) + sessionToken.substring(30, 46);
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            return cryptoUtil.generateHash(JSON.stringify(request), salt);
        } else {
            return null;
        }
    }

    private getQueryParams(path): any {
        let tmpPath = path.substring(path.indexOf('?'));
        const params = new URLSearchParams(tmpPath);
        let tmpObj = {};
        params.forEach((value: string, key: string, parent: URLSearchParams) => {
            tmpObj[key] = `${value}`;
        })
        return tmpObj;
    }

}