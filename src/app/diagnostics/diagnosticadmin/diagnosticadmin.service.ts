import { DeliveryDetailsOfAllEmployees } from './../../model/diagnostics/deliveryDetailsOfAllEmployees';
import { Injectable } from '@angular/core';
import { CommonUtil } from './../../base/util/common-util';
import { AppConstants } from './../../base/appconstants';
import { HttpService } from './../../base/http.service';
import { Config } from './../../base/config';
import { URLStringFormatter } from './../../base/util/url-string-formatter';
import { ProductDeliveryRequest } from './../../model/product/productdeliveryrequest';

@Injectable()
export class DiagnosticAdminService {

    public phleboOrder: DeliveryDetailsOfAllEmployees;
    public date: Date = new Date();
    isVdc: boolean = false;

    constructor(
        private httpService: HttpService,
        private urlStringFormatter: URLStringFormatter,
        private commonUtil: CommonUtil
    ) {
        if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName)
            this.isVdc = true;
    }

    getDiagnosticCentralOrders(requestbody: ProductDeliveryRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().
            GET_DIAGNOSTIC_CENTRAL_ORDERS, JSON.stringify(requestbody),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data==> " + JSON.stringify(data));
                let homeOrders = data;
                if(homeOrders && homeOrders.length>0){
                homeOrders.forEach(homeOrder => {

                    if (homeOrder.userBooking) {
                        homeOrder.creatorName = "Self";
                        if (this.isVdc) {
                            if (homeOrder.doctorId && homeOrder.doctorId > 0 && homeOrder.doctorDetail && homeOrder.doctorDetail.firstName)
                                homeOrder.doctorName = homeOrder.doctorDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.doctorDetail) : "";
                            else
                                homeOrder.doctorName = "Self";
                        }
                        else {
                            if (homeOrder.doctorDetail && homeOrder.doctorDetail.firstName)
                                homeOrder.doctorName = homeOrder.doctorDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.doctorDetail) : "";
                            else
                                homeOrder.doctorName = "Self";
                        }
                    }
                    else {
                        if (homeOrder.employeeDetail && homeOrder.employeeDetail.firstName)
                            homeOrder.creatorName = homeOrder.employeeDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.employeeDetail) : "";
                        if (this.isVdc) {
                            if (homeOrder.doctorId && homeOrder.doctorId > 0)
                                homeOrder.doctorName = homeOrder.doctorDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.doctorDetail) : "";
                            else
                                homeOrder.doctorName = "Self";
                        }
                        else {
                            if (homeOrder.doctorDetail && homeOrder.doctorDetail.firstName)
                                homeOrder.doctorName = homeOrder.doctorDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.doctorDetail) : "";
                        }
                    }

                    if (homeOrder.patientProfileDetails.contactInfo != null && homeOrder.patientProfileDetails.contactInfo != undefined) {
                        homeOrder.patientDetails = homeOrder.patientProfileDetails.contactInfo.mobile;
                        if (homeOrder.patientProfileDetails.contactInfo.alternateMobile && homeOrder.patientProfileDetails.contactInfo.alternateMobile.length > 0)
                            homeOrder.patientDetails = homeOrder.patientDetails + ", " + homeOrder.patientProfileDetails.contactInfo.alternateMobile;
                        if (homeOrder.patientProfileDetails.contactInfo.email && homeOrder.patientProfileDetails.contactInfo.email.length > 0)
                            homeOrder.patientDetails = homeOrder.patientDetails + ", " + homeOrder.patientProfileDetails.contactInfo.email;
                    }
                    if (homeOrder.deliveryAddress != null && homeOrder.deliveryAddress != undefined) {
                        homeOrder.addressDetails = homeOrder.deliveryAddress.address1;
                        if (homeOrder.deliveryAddress.address2)
                            homeOrder.addressDetails = homeOrder.addressDetails + ", " + homeOrder.deliveryAddress.address2;
                        if (homeOrder.deliveryAddress.landmark)
                            homeOrder.addressDetails = homeOrder.addressDetails + ", " + homeOrder.deliveryAddress.landmark;
                        homeOrder.addressDetails = homeOrder.addressDetails + ", " + homeOrder.deliveryAddress.areaName + ", " + homeOrder.deliveryAddress.cityName + ", " + homeOrder.deliveryAddress.stateName + ", " + homeOrder.deliveryAddress.pinCode;
                    }
                    homeOrder.formattedConsumerInteraction = null;
                    homeOrder.formattedDoctorInteraction = null;

                    if (homeOrder.consumerInteractionHistory && homeOrder.consumerInteractionHistory.length > 0) {
                        homeOrder.formattedConsumerInteraction = this.commonUtil.getFormattedConsumerInteractionData(homeOrder.consumerInteractionHistory[homeOrder.consumerInteractionHistory.length - 1]);
                    }
                    if (homeOrder.doctorInteractionHistory && homeOrder.doctorInteractionHistory.length > 0) {
                        homeOrder.formattedDoctorInteraction = this.commonUtil.getFormattedDoctorInteractionData(homeOrder.doctorInteractionHistory[homeOrder.doctorInteractionHistory.length - 1]);
                    }
                    console.log('homeOrder' + (homeOrder.formattedConsumerInteraction));
                });
            }
                return Promise.resolve(homeOrders);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    vendorDetails(pocId: number): Promise<any> {
        console.log(this.httpService.getPaths().GET_PHLEBO_VENDORLIST_LIST, pocId);
        console.log(this.urlStringFormatter.format(this.httpService.getPaths().GET_PHLEBO_VENDORLIST_LIST, pocId));
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PHLEBO_VENDORLIST_LIST, pocId),
        AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getEmailReportTypeLIst(type: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_EMAIL_REPORT_TYPE, type), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticAbandonedOrders(requestBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_ABANDONED_ORDERS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSampleInfo(fromDate: number, toDate: number, pocId: any): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getFormattedUrlForExcel(this.httpService.getPaths().GET_SAMPLES_INFO,
            pocId + "", fromDate + "", toDate + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("Data: ", data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    uploadexcelInfo(uploadInventoryExcelRequest) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPLOAD_INVESTIGATION_REPORT_EXCEL,
            JSON.stringify(uploadInventoryExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateInteractionStatusOfAbandonedDiagnosticOrders(uploadInventoryExcelRequest) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_INTERACTION_STATUS_FOR_ABANDONED_DIAGNOSTIC_BOOKINGS,
            JSON.stringify(uploadInventoryExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPhlemotomistCollectionData(productDeliveryRequest) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().PLEBOTOMIST_COLLECTION_INFO,
            JSON.stringify(productDeliveryRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPhlebomistlist(pocId: number, empId: number, stateId: number, cityId: number, date: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().PHLEBOS_LIST_UNDER_ADMIN}` +
            `?empId=${empId}&pocId=${pocId}&stateId=${stateId}&cityId=${cityId}&date=${date}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPhlebomistOrders(empId: number, date: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().PHLEBO_ORDERS}` +
            `?empId=${empId}&date=${date}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    changeCashCollectStatusForPhlebo(empId: number, date: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().PHLEBO_CASH_COLLECTON_STATUS}` +
            `?empId=${empId}&date=${date}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getCentralDiagnosticBookingReports(productDeliveryReq: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CENTRAL_DIAGNOSTIC_BOOKING_REPORTS,
            JSON.stringify(productDeliveryReq), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getCentralDiagnosticOrderDetails(invoiceId: string): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTIC_ORDER_DETAILS,
            invoiceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getCentralDiagnosticOrdersCount(productDeliveryReq: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CENTRAL_DIAGNOSTIC_BOOKINGS_COUNT,
            JSON.stringify(productDeliveryReq), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getEnquiryDetails(mobileNo, startDateInMillis, endDateInMillis, fromIndex, type, sourceapp) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ENQUIRY_DETAILS, startDateInMillis, endDateInMillis, fromIndex, mobileNo, type, sourceapp)
            , AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getEnquiryDetailsCount(startDateInMillis, endDateInMillis, mobileNo, type) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ENQUIRY_DETAILS_COUNTS, startDateInMillis, endDateInMillis, mobileNo, type)
            , AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    postEnquiryDetails(data){
        return this.httpService.httpPostPromise('consumercontroller/lead',JSON.stringify(data), AppConstants.POZ_BASE_URL_INDEX).then((responce)=>{
            return Promise.resolve(responce);
        }).catch((err)=>{
            console.log(err);
            return Promise.reject(err);
        })
    }

    updateEnquiryStatus(data){
        return this.httpService.httpPostPromise('consumercontroller/secure/leadstatus',JSON.stringify(data),AppConstants.POZ_BASE_URL_INDEX).then((responce)=>{
            return Promise.resolve(responce);
        }).catch((err)=>{
            console.log(err);
            return Promise.reject(err);
        })
    }

}
