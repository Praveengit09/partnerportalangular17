import { Injectable } from '@angular/core';

@Injectable()
export class URLStringFormatter {

    format(...args: any[]) {
        var theString = args[0];
        for (var i = 1; i < args.length; i++) {
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            theString = theString.replace(regEx, args[i]);
        }
        console.log("URL: " + theString);
        return theString;
    }

    getFormatedUrlForLogout(baseUrl: string, empId: string): string {
        let url: string;
        url = baseUrl + "?empId=" + empId;
        console.log(url);
        return url;
    }

    getFormattedUrlForReport(baseUrl: string, pocId: string, startDate: string, endDate: string): string {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&startDate=" + startDate + "&endDate=" + endDate;

        return url;
    }

    getFormattedUrlForExcel(baseUrl: string, pocId: string, fromDate: string, toDate: string): string {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&fromDate=" + fromDate + "&toDate=" + toDate;

        return url;
    }

    getFormatedUrlForPackages(baseUrl: string, profileId: string, serviceId: string, doctorId: string, discountType: string) {
        let url: string;
        url = baseUrl + "?profileId=" + profileId + "&serviceId=" + serviceId + "&doctorId=" + doctorId + "&discountType=" + discountType;
        console.log("url :" + url);
        return url;
    }

    getFormatedUrlForSearchAdvise(baseUrl: string, pocId: string, scrollPosition: string, time: string, startDate: string,
        endDate: string, adviseId: string, contactNo: string) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&scrollPosition=" + scrollPosition + "&time=" + time + "&offset=50&startDate=" + startDate + "&endDate="
            + endDate + "&adviseId=" + adviseId + "&contactNo=" + contactNo;
        return url;
    }

    getFormatedUrlForSearchDiagnosticOrder(baseUrl: string, pocId: string, scrollPosition: string, time: string, startDate: string,
        endDate: string, orderId: string, contactNo: string) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&scrollPosition=" + scrollPosition + "&time=" + time + "&offset=50&startDate=" + startDate + "&endDate="
            + endDate + "&orderId=" + orderId + "&contactNo=" + contactNo;
        return url;
    }

    // getFormatedUrlForUserSearch(baseUrl: string, mobile: string) {
    //     let url: string;
    //     url = baseUrl + "?mobile=" + mobile;
    //     return url;
    // }
    getFormatedUrlForUserRegistration(baseUrl: string) {
        let url: string;
        url = baseUrl;
        return url;
    }

    getPackageDoctorsURL(baseUrl: string, serviceId: string, packageId: number) {
        let url: string;
        url = baseUrl + "?serviceId=" + serviceId + "&packageId=" + packageId + "&longitude=77.62853129999999&latitude=12.9151695";
        return url;
    }
    getPocDetailsForPocIdUrl(baseUrl: string, pocId: string) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId;
        return url;
    }
    getPhrInvasive(baseUrl: string, profileId: string) {
        let url: string;
        url = baseUrl + "?profileId=" + profileId;
        return url;
    }

    /* getSlotForMultipleTest(baseUrl: string, pocId: number, scheduleId: number) {
        let url: string;
        url = baseUrl + "?diagnosticPocId=" + pocId + "&scheduleId=" + scheduleId;
        return url;
    } */

    getWalkInSlots(baseUrl: string, pocId: number, scheduleId: number, serviceIdList: Array<number>) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&scheduleId=" + scheduleId + "&serviceIdList=" + serviceIdList;
        return url;
    }

    getDiagWalkInSlots(baseUrl: string, pocId: number, scheduleId: number, serviceIdList: Array<number>, profileId: number, date: number) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&scheduleId=" + scheduleId + "&serviceIdList=" + serviceIdList + "&profileId=" + profileId + "&date=" + date;
        return url;
    }

    getHomeCollectionSlot(baseUrl: string, pocId: number, scheduleId: number, pinCode: string, areaId: number, serviceIdList: Array<number>, profileId: number, date: number) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&scheduleId=" + scheduleId + "&pinCode=" + pinCode + (areaId > 0 ? ("&areaId=" + areaId) : "")  + "&serviceIdList=" + serviceIdList + "&profileId=" + profileId + "&date=" + date;
        return url;
    }

    getReportRanges(baseUrl: string, pocId: number, serviceId: string) {
        let url: string;
        url = baseUrl + "?pocId=" + pocId + "&serviceIds=" + serviceId;
        return url;
    }

}