import { Injectable } from '@angular/core';
import { HttpService } from '../base/http.service';
import { AuthService } from '../auth/auth.service';
import { URLStringFormatter } from '../base/util/url-string-formatter';
import { AppConstants } from '../base/appconstants';
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';

@Injectable()
export class WellnessService {
    public wellnessSlotBookingDetails: any;
    public slotBookingSubType: number;
    public slotBookingDetails: any;
    public onlyPayment: boolean = false;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,

    ) { }

    readTestPriceExcel(readInventoryExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_SERVICE_PRICE_EXCEL,
            JSON.stringify(readInventoryExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from readInventoryExcelRequest:" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSpecificPriceTemplate(excelType: number, scheduleType: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_SPECIFIC_PRICE_TEMPLATE_FOR_WELLNESS, excelType, scheduleType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getAppoinmentDetails(pocId: number, date: number, from: number, size: number, orderId: string, mobileNo: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
            GET_WELLNESS_WALKIN_APPOINTMENTS, pocId, date, from, size, mobileNo, orderId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                data.forEach(bookingDetail => {
                    if ((new Date().getTime()) < bookingDetail.cancellationExpiryDate && bookingDetail.cancellationStatus == 0) {
                        bookingDetail.enableCancel = 1;
                    } else if (bookingDetail.cancellationStatus == 1 || bookingDetail.cancellationStatus == 2 ||
                        bookingDetail.cancellationStatus == 3) {
                        bookingDetail.enableCancel = 2;
                    }
                });
                return Promise.resolve(data);
            }).catch((error) => {
                // if (error) {
                console.log(error);
                return Promise.reject(error);
                // }
            });
    }

    getWellnessServicesList(pocId: number, serviceName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_WELLNESS_SERVICESLIST, pocId, serviceName),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateWellnessTestPrice(wellnessServiceDetail: any): Promise<any> {
        console.log(wellnessServiceDetail)
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_WELLNESS_SERVICE_PRICE,
            JSON.stringify(wellnessServiceDetail), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getCategories(pocId): Promise<any> {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_WELLNESS_CATEGORY, pocId),
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