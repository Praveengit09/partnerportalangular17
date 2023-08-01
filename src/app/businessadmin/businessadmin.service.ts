import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { HttpService } from "../base/http.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { BulkPackage } from '../model/package/bulkPackage';
import { PocCashCollection } from '../model/report/poccashcollection';
import { AppConstants } from './../base/appconstants';
import { OrderListRequest } from "./../model/basket/orderListRequest";
import { LocationModeResponse } from './../model/common/locationmoderesponse';
import { FinancialSummaryReport } from './../model/report/financialsummaryreport';
import { EmployeePocMapping } from '../model/employee/employeepocmapping';
import { ReportRequest } from '../model/report/reportrequest';
import { ReportResponse } from '../model/report/reportresponse';
import { SlotsResponse } from '../model/report/slotsResponse';
import { ReconciliationReportRequest } from '../model/report/reconciliationreportrequest';
import { UpdateReconciliationStatement } from './../model/report/updatereconciliationstatement';
import { Promise } from 'firebase';
import { TransferPriceRevenueStatement } from '../model/report/TransferPriceRevenueStatement';
import { BrandDetailsWithReferralCode } from '../model/brand/brandDetailsWithReferralCode';

@Injectable({ providedIn: 'root' })
export class BusinessAdminService {

    communityPaymentsTrack: BulkPackage;
    restoreData: boolean = false;
    restoreCommunityPaymentsTrack: BulkPackage;
    periodicFinanceAction: any;
    selectedFinancePeriodic: any;
    reconciliationDeatilList: any;
    viewFinanceTransactionsList: any;
    viewReconciliationDetail: any;
    setDate: any;
    checkRoutingParameter: string;
    startTime: number;
    endTime: number;
    // reconciledDeatilList:any;
    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) { }


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


    getDoctorAvgTimeConsultationsList(reportRequest: ReportRequest): Promise<ReportResponse[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_AVG_CONSULTATION_TIME,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service:: " + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getDoctorPrescriptionSummaryList(reportRequest: ReportRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTR_PRESCRIPTION_SUMMARY_REPORT_LIST,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service:: " + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDoctorPendingPrescriptionCount(reportRequest: ReportRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_PENDING_PRESCRIPTION_COUNT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service:: " + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getFinancialReport(reportRequest: ReportRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().FINANCIAL_REPORT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service:: " + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getOrderHistory(fromDate: number, toDate: number, pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ORDER_HISTORY, fromDate, toDate, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getRevenueReport(reportRequest: ReportRequest): Promise<ReportResponse[]> {
        console.log(reportRequest)
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ADMIN_REVENUES,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPocPerformance(reportRequest: ReportRequest): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_POC_PERFORMANCE + "?pocId=" + reportRequest.pocIds + "&fromDate=" + reportRequest.fromDate + "&toDate=" + reportRequest.toDate,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service::" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSlotsStatusinPoc(reportRequest: ReportRequest): Promise<SlotsResponse[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SLOTS_STATUS_IN_POC,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getBookingReport(reportRequest: ReportRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().BOOKINGS_REPORT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from booking report service:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getReportSessionData(sPocId: number, sFromDate: number, sToDate: number, doctorId) {
        doctorId = doctorId == undefined ? '' : doctorId;
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_SESSION_TIME, sPocId, sFromDate, sToDate, doctorId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getFinancialSummaryReport(reportRequest: ReportRequest): Promise<any> {
        console.log("recoilsummaryreportreqst" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_FINANCIAL_SUMMARY_REPORT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from financial summary report:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getReconciliationReports(reportRequest: ReconciliationReportRequest): Promise<any> {
        console.log("recoilsummaryreportreqst" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_RECONCILIATION_REPORTS,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getViewFinancialTransactions(invoiceId, bookingType, bookingSubType, cartItemType): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_SEND_TRANSACTION_DETAILS, invoiceId, bookingType, bookingSubType, cartItemType), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }
    getdetailedTransactionReportsXsl(fromDate, toDate, pocId, empId): Promise<any> {
        //console.log("=============>+++"+JSON.stringify(pocId))
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DETAILED_TRANSACTION_REPORTSXSL, fromDate, toDate, pocId, empId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }
    getmonthlyTransactionReportsXsl(pocId, fromDate, toDate): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_RECONCILATION_REPORTS_FOR_PARTICULARPOCXSL, pocId, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }
    getmonthlyParticularPocReportsXSL(invoiceId): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MONTHLY_PARTICULAR_POCREPORTXSL, invoiceId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getReconcilationReportsForParticularPocXSL(pocId, fromDate, toDate): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_RECONCILATION_REPORTS_FOR_PARTICULARPOCXSL, pocId, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getReconcilationSummaryReportXL(pocId, fromDate, toDate): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_RECONCILATION_SUMMARY_REPORT_XL, pocId, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getCashCollectionDetailsForPocXL(reportRequest: OrderListRequest): Promise<any> {
        console.log("reportRequest" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CASH_COLLECTION_DETAILS_FORPOC_XL,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getReconcilationSummaryReport(reportRequest): Promise<any> {
        console.log("Accountsummaryreportreqst" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_RECONCILATION_SUMMARY_REPORT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }





    // method to get accounting reports
    getAccountingReports(reportRequest: OrderListRequest): Promise<any> {
        console.log("Accountsummaryreportreqst" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ACCOUNTING_REPORTS,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }



    updateReconciliationReport(financialRequest: FinancialSummaryReport): Promise<any> {
        console.log("recoilsummaryreportreqst" + JSON.stringify(financialRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_RECONCILIATION_REPORT,
            JSON.stringify(financialRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    //method to update reconciliation Amount
    updateReconciliationAmount(updateReconciliationStatement: UpdateReconciliationStatement): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_RECONCILIATION_AMOUNT,
            JSON.stringify(updateReconciliationStatement), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                return Promise.reject(err);
            })
    }


    //method to update accounting remarks
    updateAccountingRemarks(accountingRequest: PocCashCollection): Promise<any> {
        console.log("recoilsummaryreportreqst" + JSON.stringify(accountingRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_ACCOUNTING_REMARKS,
            JSON.stringify(accountingRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPOCForEmployeeByLocationMapping(empId: number, pharmacyFilter: boolean): Promise<EmployeePocMapping[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMP_POC_BY_LOCATION_MAPPING, empId, pharmacyFilter),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getBrandsBasedonPermissionId(empId: number, permissionId: number): Promise<BrandDetailsWithReferralCode[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_BRANDS_BASED_ON_PERMISSION_ID, empId, permissionId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getBrandRevenueReport(reportRequest: ReportRequest): Promise<any> {
        console.log("Brandrevenuereport" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_BRAND_REVENUE_REPORT,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getTotalRevenues(reportRequest: ReportRequest): Promise<any> {
        console.log("Brandrevenues" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_TOTAL_REVENUES,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    readManagePaymentsExcel(managepaymentsExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().MANAGE_PAYMENTS_EXCEL,
            JSON.stringify(managepaymentsExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from managepaymentsExcelRequest:" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getManagePaymentExcelSheet(empId: number, pocId: number, fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number, from: number, size: number): Promise<BulkPackage> {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().DOWNLOAD_MANAGE_PAYMENTS_EXCEL,
            empId, pocId, fromDate, toDate, stateId, cityId, areaId, from, size),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getSelectedPaymentExcelSheet(list): Promise<BulkPackage> {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().DOWNLOAD_PAYMENTS_EXCEL_BY_ORDERID + "?orderId=" + list
        ),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getManagePaymentsRecords(empId: number, pocId: number, fromDate: number, toDate: number, stateId: number, cityId: number, areaId: number, from: number, size: number): Promise<any> {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MANAGE_PAYMENTS_RECORDS,
            empId, pocId, fromDate, toDate, stateId, cityId, areaId, from, size),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }


    getBrandRevenue(brandId: number, fromDate: number, toDate: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_BRAND_REVENUE,
            brandId, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getBrandRevenueByPoc(brandId: number, fromDate: number, toDate: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_BRAND_REVENUE_PER_POC,
            brandId, fromDate, toDate), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getBrandDetailedTransactionReport(reportRequest): Promise<any> {
        console.log("getBrandDetailed" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_BRAND_FINANCIAL_REPORTS,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
   
    getDownloadBrandReport(fromDate, toDate, brandIds, empId): Promise<any> {
        //console.log("=============>+++"+JSON.stringify(pocId))
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().BRAND_DETAILED_TRANSACTION_REPORTS_XSL, fromDate, toDate, brandIds, empId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("=============>+++" + JSON.stringify(data))
            return data;
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    getPocTransferPriceRevenueList(pocIdList: number[], fromDate: number, toDate: number, skip: number, limit: number): Promise<TransferPriceRevenueStatement[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_POC_TRANSFER_PRICE_REVENUE_LIST, pocIdList, fromDate, toDate, skip, limit),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
            
    }

    getTopfiveBottomfivePerformingCenters(reportRequest: ReportRequest): Promise<any> {
        console.log("Brandrevenuereport" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_TOP5_BOTTOM5_PERFORMING_CENTRE,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }  

    getBrandRevenueCXO(reportRequest: ReportRequest): Promise<any> {
        console.log("Brandrevenuereport" + JSON.stringify(reportRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_BRAND_REVENUE_CXO,
            JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log(data);
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }  
    getPocCount(reportRequest: ReportRequest): Promise<any> {
       console.log("getPocCount",JSON.stringify(reportRequest));
            return this.httpService.httpPostPromise(this.httpService.getPaths().GET_POCCOUNT,JSON.stringify(reportRequest),AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


}
