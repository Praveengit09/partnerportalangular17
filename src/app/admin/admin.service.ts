import { BasketConstants } from './../constants/basket/basketconstants';
import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { HttpService } from "../base/http.service";
import { CommonUtil } from '../base/util/common-util';
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { CartItem } from '../model/basket/cartitem';
import { CentralOrderInteraction } from '../model/common/centralorderinteraction';
import { Product } from '../model/product/product';
import { ProductDeliveryTrack } from '../model/product/productdeliverytrack';
import { AppConstants } from './../base/appconstants';
import { OrderHistoryRemark } from "./../model/basket/orderHistoryRemark";
import { OrderListRequest } from "./../model/basket/orderListRequest";
import { LocationModeResponse } from './../model/common/locationmoderesponse';
import { StockOrder } from './../model/inventory/stockReportResponse';

@Injectable({ providedIn: 'root' })
export class AdminService {

    orderHistoryRemarkList: OrderHistoryRemark[] = new Array<OrderHistoryRemark>();
    public productListService: any[] = [];
    public productDeliveryTrack: ProductDeliveryTrack;
    public tempProductDeliveryTrack: ProductDeliveryTrack;
    setDate: any;
    public selectedProfileId;
    public selectedProfile;


    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private commonUtil: CommonUtil
    ) {
        // Creating a singleton admin service to access admin service data from all modules
        if (!(<any>window).adminService) {
            (<any>window).adminService = this;
        }
        return (<any>window).adminService;
    }


    getLocation(empId: number, stateId: number, cityId: number): Promise<LocationModeResponse[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMP_LOCATION, empId, stateId, cityId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    readPackagesExcel(readPackagesExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_PACKAGES_EXCEL,
            JSON.stringify(readPackagesExcelRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                console.log("data from readProcedureExcelRequest:" + JSON.stringify(data));
                return data;

            });
    }

    getCancelOrderListByUser(orderReqList: OrderListRequest): Promise<OrderHistoryRemark[]> {

        let reportResponse: OrderHistoryRemark[] = new Array<OrderHistoryRemark>();
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ORDER_CANCELLATION_REMARK,
            JSON.stringify(orderReqList), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                return Promise.resolve(reportResponse);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getCentralDoctorOrder(fromDate: number, toDate: number, pocId: number, empId: number, from: number, size: number,
        mobile: string, patientName: string, doctorName: string, paymentStatus: number, invoiceCompletionStatus: number, cancellationStatus: number, email: string, isExcel: boolean, toEmail: string, orderId: string, invoiceId: string): Promise<any> {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CENTRAL_DOCTOR_BOOKINGS,
            fromDate, toDate, pocId, empId, from, size, mobile, patientName, doctorName, paymentStatus, invoiceCompletionStatus, cancellationStatus, email, isExcel, toEmail, orderId, invoiceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                let homeOrders = data;
                homeOrders.forEach(homeOrder => {
                    if (homeOrder.bookingSource == BasketConstants.BOOKING_SOURCE_PARTNER_PORTAL) {
                        if (homeOrder.employeeDetail && homeOrder.employeeDetail.empId && homeOrder.employeeDetail.empId > 0) {
                            homeOrder.creatorName = homeOrder.employeeDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.employeeDetail) : "";
                        }
                        else if (homeOrder.doctorDetail && homeOrder.doctorDetail.empId && homeOrder.doctorDetail.empId > 0) {
                            homeOrder.creatorName = homeOrder.doctorDetail.firstName ? this.commonUtil.getFormattedName(homeOrder.doctorDetail) : "";
                        }
                    } else if (homeOrder.userBooking) {
                        homeOrder.creatorName = "Self";
                    }
                    homeOrder.formattedConsumerInteraction = null;
                    homeOrder.formattedDoctorInteraction = null;

                    if (homeOrder.consumerInteractionHistory && homeOrder.consumerInteractionHistory.length > 0) {
                        homeOrder.formattedConsumerInteraction = this.commonUtil.getFormattedConsumerInteractionData(homeOrder.consumerInteractionHistory[homeOrder.consumerInteractionHistory.length - 1]);
                    }
                    if (homeOrder.doctorInteractionHistory && homeOrder.doctorInteractionHistory.length > 0) {
                        homeOrder.formattedDoctorInteraction = this.commonUtil.getFormattedDoctorInteractionData(homeOrder.doctorInteractionHistory[homeOrder.doctorInteractionHistory.length - 1]);
                    }
                    homeOrder.products = '';
                    if (homeOrder.serviceList && homeOrder.serviceList.length > 0) {
                        for (var i = 0; i < homeOrder.serviceList.length; i++) {
                            homeOrder.products += "" + homeOrder.serviceList[i].serviceName + " - " + homeOrder.serviceList[i].quantity;
                            if (i != homeOrder.serviceList.length - 1)
                                homeOrder.products += ", \n ";
                        }
                    }
                });
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getProductDeliveries(productReqlist: any): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PRODUCT_DELIVERIES,
            JSON.stringify(productReqlist), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateProductDeliveries(productDeliveryTrack: ProductDeliveryTrack): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PRODUCT_DELIVERIES, JSON.stringify(productDeliveryTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getRemarkSubmit(orderHistoryRemark: OrderHistoryRemark): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REMARK_SUBMIT,
            JSON.stringify(orderHistoryRemark), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    searchProduct(searchRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SEARCH_PRODUCT, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((error) => {
            console.log(error);
            return Promise.resolve(new Array<Product>());
        });
    }

    getReturnOrderDetails(orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ORDER_DETAILS, orderId, invoiceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateProductReturn(productDeliveryTrack: ProductDeliveryTrack): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PRODUCT_RETURN, JSON.stringify(productDeliveryTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    calculateProductDeliveries(cartItem: CartItem): Promise<CartItem> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CALCULATE_PHARMACY_DELIVERIES, JSON.stringify(cartItem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getPOCForEmployeeByBrandFilter(empId: number, brandFilter: boolean): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMP_POC_BY_BRAND, empId, brandFilter),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getStockSummaryReportList(stockReportRequest: any): Promise<StockOrder[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().PRODUCT_INVENTORY_STOCK_REPORT,
            JSON.stringify(stockReportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from stock report service::" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAbandonedDoctorBookings(requestBody: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ABANDONED_DOCTOR_BOOKINGS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    updateReviewForCentralBookings(requestBody: CentralOrderInteraction): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_REVIEW_FOR_CETRAL_BOOKINGS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateReviewForAbandonedDoctorBookings(requestBody: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_INTERACTION_STATUS_FOR_ABANDONED_DOCTOR_BOOKINGS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPackageBookings(brandId: number, fromDate: number, toDate: number, from: number, mobileNo: string, pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_CENTRAL_PACKAGE_BOOKINGS,
            brandId, fromDate, toDate, from, mobileNo, pocId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getPostWalletDetails(mobileNo: string, amount: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_POST_WALLET_DETAILS,
            mobileNo, amount), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getNonBuyingUsers(fromDate: number, toDate: number, from: number, size: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().NON_BUYING_USERS,
            fromDate, toDate, from, size), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDoctorConsultationTime(orderId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().DOCTOR_CONSULT_TIME, orderId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getOrderHistoryRevenues(mobileNo: string = "", fromdate: number, todate: number, profileId: number = 0): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_ORDER_HISTORY_BY_MOBILE, mobileNo, fromdate, todate, profileId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getOrderHistory(mobileNo: string = "", fromdate: number, todate: number, from: number, size: number, profileId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_ALL_ORDERS_HISTORY_BY_MOBILE, mobileNo, fromdate, todate, from, size, profileId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getOrderHistoryNotes(profileId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_ORDER_HISTORY_NOTES, profileId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateOrderHistoryNotes(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_ORDER_HISTORY_NOTES,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getRegisteredUser(mobile: string) {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().UserSearch, mobile), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPHRForProfileId(profileId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PROFILE_DETAILS_BY_PROFILE_ID, profileId),
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    sendFinancialReport(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SEND_FINANCIAL_REPORTS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
}
