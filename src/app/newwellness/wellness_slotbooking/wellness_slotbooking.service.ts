import { Injectable } from '@angular/core';
import { HttpService } from '../../base/http.service';
import { AuthService } from '../../auth/auth.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { SearchRequest } from '../../model/common/searchRequest';
import { AppConstants } from '../../base/appconstants';
import { SlotBookingDetails } from '../../model/basket/slotBookingDetails';

@Injectable()
export class WellnessSlotBookingService {
    public wellnessSlotBookingDetails: any;
    public slotBookingDetails: any;
 
    public onlyPayment: boolean = false;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter) {

    }

    searchWellnessScheduleTests(searchRequest: SearchRequest): Promise<any> {
        console.log('searchrequest'+JSON.stringify(searchRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().WELLNESS_SEARCH_SCHEDULE_SERVICES, JSON.stringify(searchRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getWellnessServiceWalkInSlots(pocId: number, scheduleId: number, serviceIdList: Array<number>) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getWalkInSlots(this.httpService.getPaths().
            GET_WELLNESS_WALKIN_SLOT, pocId, scheduleId, serviceIdList), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getWellnessAppoinmentDetails(pocId: number,from: number, size: number, orderId: string, contactNo: string,date:number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
            GET_WELLNESS_WALKIN_APPOINTMENTS, pocId,from, size, contactNo, orderId,date),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                data.forEach(bookingDetail => {
                    if ((new Date().getTime()) < bookingDetail.cancellationExpiryDate && bookingDetail.cancellationStatus == 0 && bookingDetail.invoiceCompletionStatus < 5) {
                      
                        bookingDetail.enableCancel = 1;
                    } else if ((bookingDetail.cancellationStatus == 1 || bookingDetail.cancellationStatus == 2 ||
                        bookingDetail.cancellationStatus == 3 ) && bookingDetail.invoiceCompletionStatus < 5) {
                            
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

    initiatePayment(diagnosticsAdviseTrack: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT_FOR_WELLNESS,
            JSON.stringify(diagnosticsAdviseTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return reportResponse;
                // }
            });
    }

   
    updateOrderCompletion(orderId:string,invoiceCompletionStatus:number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
        MARK_ORDER_AS_COMPLETED,orderId,invoiceCompletionStatus),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
             return Promise.resolve(data);
            }).catch((error) => {
                // if (error) {
                    console.log(error);
                    return Promise.reject(error);
                // }
            });
    }

    

    
}