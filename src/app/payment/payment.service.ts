import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from './../base/appconstants';
import { PaymentDeskResponse } from './../model/payment/paymentDeskResponse';
import { BasketRequest } from './../model/basket/basketRequest';
import { CartItem } from '../model/basket/cartitem';
//import { BasketRequest } from './../model/basket/basketRequest';
@Injectable()
export class PaymentService {

    paymentDeskResponse: PaymentDeskResponse = new PaymentDeskResponse();
    procedureAdviseTrack: CartItem;
    admissionnoteAdviseTrack: CartItem;
    immunizationAdviseTrack: CartItem;
    miscellaneousOrderAdviseTrack: CartItem;
    public errorMessage: Array<string>;
    public isError: boolean;
    public showMessage: boolean;
    constructor(private httpService: HttpService, private auth: AuthService, private receptionStringFormatter: URLStringFormatter) {
    }

    getPaymentDeskList(requestList): Promise<any> {
        //  console.log("request12345");
        return this.httpService.httpPostPromise(this.httpService.getPaths().GETPAYMENTDESKLIST, JSON.stringify(requestList), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("data" + JSON.stringify(data));
            return Promise.resolve(data);

        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getPaymentDetailOfProfile(profilePaymentDetail) {
        this.paymentDeskResponse = profilePaymentDetail;
        console.log("from service-->" + JSON.stringify(this.paymentDeskResponse));
    }
    getPaymentDeskResponseForPerson() {
        return this.paymentDeskResponse;
    }
    payNow(requestList): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PAYMENT_STATUS_AT_COUNTER, JSON.stringify(requestList), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    notifyCustomer(requestBody): Promise<any> {
        console.log("req body" + JSON.stringify(requestBody));
        return this.httpService.httpPostPromise(this.httpService.getPaths().NOTIFYCUSTOMER, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("data" + JSON.stringify(data));
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    reNotifyCustomer(invoiceId, digiManager = false): Promise<any> {
        console.log(AppConstants.POZ_BASE_URL_INDEX + this.httpService.getPaths().RESEND_PUSH_NOTIFICATION + "?digiManager=" + digiManager + "?invoiceId=" + invoiceId + "&source=" + 3);
        return this.httpService.httpGetPromise(this.httpService.getPaths().RESEND_PUSH_NOTIFICATION + "?invoiceId=" + invoiceId + "&source=" + 3 + "&digiManager=" + digiManager, AppConstants.POZ_BASE_URL_INDEX)
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

    initiatePayment(basketRequest: BasketRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT, JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getProcedureListMiscellaneous(pocId: any, time: any, offset: any, scrollPosition: any, mobileNumber: any): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_MISCELLANEOUS_LIST + "?pocId=" + pocId + "&scrollPosition=" + scrollPosition + "&time=" + time + "&offset=" + offset + "&mobileNumber=" + mobileNumber, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getImmunizationList(pocId: any, time: any, offset: any, scrollPosition: any, mobileNumber: any): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_IMMUNIZATION_LIST + "?pocId=" + pocId + "&scrollPosition=" + scrollPosition + "&time=" + time + "&offset=" + offset + "&mobileNumber=" + mobileNumber, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getAdmissionNoteList(pocId: any, time: any, offset: any, scrollPosition: any, mobileNumber: any): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ADMISSIONNOTE_LIST + "?pocId=" + pocId + "&scrollPosition=" + scrollPosition + "&time=" + time + "&offset=" + offset + "&mobileNumber=" + mobileNumber, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSearchedProcedures(search: any, pocId: any) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PROCEDURE_SEARCH + "?search=" + search + "&pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSearchedImmunization(search: any, pocId: any) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_IMMUNIZATION_SEARCH + "?search=" + search + "&pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSearchedAdmissionNotes(search: any, pocId: any) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ADMISSIONNOTE_SEARCH + "?search=" + search + "&pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // } 
            });
    }

    getProceduresTestAmount(pocId: number, orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PROCEDURES_TEST_AMOUNT + "?pocId=" + pocId + "&orderId=" + orderId + "&invoiceId=" + invoiceId, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getImmunizationTestAmount(pocId: number, orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_IMMUNIZATIONS_TEST_AMOUNT + "?pocId=" + pocId + "&orderId=" + orderId + "&invoiceId=" + invoiceId, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getAdmissionNoteTestAmount(pocId: number, orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ADMISSIONNOTE_TEST_AMOUNT + "?pocId=" + pocId + "&orderId=" + orderId + "&invoiceId=" + invoiceId, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    readProcedureExcel(readProcedureExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_PROCEDURE_EXCEL,
            JSON.stringify(readProcedureExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from readProcedureExcelRequest:" + JSON.stringify(data));
                return data;

            });
    }
    readImmunizationExcel(readImmunizationExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_IMMUNIZATION_EXCEL,
            JSON.stringify(readImmunizationExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from readImmunizationExcelRequest:" + JSON.stringify(data));
                return data;

            });
    }

    readAdmissionNoteExcel(readAdmissionNoteExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_ADMISSIONNOTE_EXCEL,
            JSON.stringify(readAdmissionNoteExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from readAdmissionNoteExcelRequest:" + JSON.stringify(data));
                return data;

            });
    }

    getMiscellaneousPaymentsOrdersList(pocId: number, from: number, size: number, orderId, mobileNo) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_MISC_ORDERS + "?pocId=" + pocId + "&from=" + from + "&size=" + size + "&orderId=" + orderId + "&contactNo=" + mobileNo, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

}
