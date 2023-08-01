import { BaseResponse } from './../model/base/baseresponse';
import { ToasterService } from './../layout/toaster/toaster.service';
import { SpinnerService } from './../layout/widget/spinner/spinner.service';
import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { AppConstants } from '../base/appconstants';
import { HttpService } from "../base/http.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';
import { InvestigationTestDetails } from '../model/diagnostics/investigationTestDetails';
import { UserReport } from '../model/report/userReport';
import { BasketRequest } from './../model/basket/basketRequest';
import { CartItem } from './../model/basket/cartitem';
import { DashBoardChartReq } from './../model/chart/dashBoardChartReq';
import { ReportResponse } from './../model/common/reportResponse';
import { SearchRequest } from './../model/common/searchRequest';
import { StatusType } from "./../model/common/statusType";
import { DiagnoReport } from './../model/diagnostics/diagnoreport';
import { DiagnosticAdminRequest } from './../model/diagnostics/diagnosticAdminRequest';
import { DiagnosticDeliveryAdviceTrack } from './../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsAdviseTrack } from "./../model/diagnostics/diagnosticsAdviseTrack";
import { StatusDiagnosticsAdviseTrack } from './../model/diagnostics/statusDiagnosticsAdviseTrack';
import { ServiceDetail } from './../model/employee/servicedetail';
import { BookedPackageResponse } from "./../model/package/bookedPackageResponse";
import { DiscountResponse } from "./../model/package/discountResponse";
import { PaymentType } from "./../model/payment/paymentType";
import { CommonUtil } from '../base/util/common-util';
import { DeliveryDetailsOfAllEmployees } from '../model/diagnostics/deliveryDetailsOfAllEmployees';
import { CentralOrderInteraction } from '../model/common/centralorderinteraction';
import { ProductDeliveryRequest } from '../model/product/productdeliveryrequest';

@Injectable()
export class DiagnosticsService {

    pocId: number;
    scrollPosition: number;
    time: number;
    startDate: number;
    endDate: number;
    orderId: string;
    contactNo: string;
    selectedDiagnosticService: ServiceDetail;
    selectedDiagnosticTest: ServiceDetail;
    isNotReloaded: boolean = false;
    public order: any;

    /* public errorMessage: Array<string>;
    public isError: boolean;
    public showMessage: boolean; */
    public reportDate: Date;
    tempPdfUrl: string;

    public diagnosticsAdviseTrack: any;
    diagnosticsAdviseList: CartItem[] = new Array();
    diagnosticListAdmin: DiagnosticDeliveryAdviceTrack[] = new Array();

    diagnosticsReportList: DiagnoReport[] = new Array();
    statusList: StatusDiagnosticsAdviseTrack[] = new Array<StatusDiagnosticsAdviseTrack>();
    bookedPackageList: BookedPackageResponse[] = new Array();
    discountPackageList: DiscountResponse;

    public orderDetailAdviceTrack: DiagnosticDeliveryAdviceTrack;
    subServiceDiagnosticsOrderAdmin: DiagnosticDeliveryAdviceTrack;

    slotBookingDetails: SlotBookingDetails;
    onlyPayment: boolean = false;
    slotBookingSubType: number;
    newAdviceDetail: boolean;
    serviceItem: InvestigationTestDetails;
    isCentralBooking: boolean = false;
    isOnboardingBooking: boolean = false;
    centralAdminModify: boolean = false;
    centralCheckForPaymentStatus: boolean = false;
    isReception: boolean = false;

    deliveryEmp: DeliveryDetailsOfAllEmployees;
    selectedTimeStamp: number;
    diagBookingSubType: number;

    receptionPriscriptionDetails: any;
    isFromPriscription: boolean = false;
    cancelOrder: boolean = false;
    scheduleId: number = 0; //using for routing back
    clientDocumentList: any = [];

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private commonUtil: CommonUtil,
        private spinnerService: SpinnerService,
        private toast: ToasterService,
    ) {


    }

    getAppoinmentDetails(pocId: number, date: number, from: number, size: number, orderId: string, mobileNo: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().
            GET_DIAGNOSTIC_WALKIN_APPOINTMENTS, pocId, date, from, size, mobileNo, orderId),
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

    getDiagnosticAwsCognitoCredentials(userReport: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_AWS_COGNITO_CREDENTIALS,
            JSON.stringify(userReport), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return data;
                } else {
                    return data;
                }
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });
    }

    getVendorAssignedOrderCount(request: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_VENDOR_ASSIGNEDORDER_COUNT,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });
    }

    getCreditLimit(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(
            `${this.httpService.getPaths().GET_CREDIT_LIMIT}?pocId=${pocId}`,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                if (data.statusCode == 200) {
                    return data;
                } else {
                    return data;
                }
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });
    }

    async getPdfUrl(pdfUrl) {
        this.spinnerService.start();
        await this.auth.getTempUrl(pdfUrl).then((url: BaseResponse) => {
            this.spinnerService.stop();
            if ((url.statusCode == 201 || url.statusCode == 200)) {
                this.tempPdfUrl = url.data;
                return url.data;
            } else {
                this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
                return false;
            }
        }).catch((err) => {
            this.spinnerService.stop();
            this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
            return false;
        })
    }

    UpdateDiagnosticFileUrls(uploadFileStatusRequest: UserReport): Promise<ReportResponse> {
        let reportResponse: ReportResponse;
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DIAGNOSTICS_FILE_URLS,
            JSON.stringify(uploadFileStatusRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                console.log("Diagnostic file upload urls response >>>>>>>>>>>" + JSON.stringify(reportResponse));
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
            });
    }

    getDiagnosticsReport(startDate: number, endDate: number): Promise<DiagnoReport[]> {
        this.diagnosticsReportList = new Array<DiagnoReport>();
        this.pocId = this.auth.userAuth.pocId;
        endDate += 86400000;
        this.time = 0;

        return this.httpService.httpGetPromise(this.urlStringFormatter.getFormattedUrlForReport(
            this.httpService.getPaths().DIAGNOSTICSREPORTS, this.pocId + "", startDate + "", endDate + ""),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                let reportArray: DiagnosticsAdviseTrack[] = data;

                //To insert first record in diagnosticsReportList from server data
                if (this.diagnosticsReportList.length < 0 && reportArray != undefined &&
                    reportArray != null && reportArray.length > 0) {
                    let diagnosticsReport: DiagnoReport = new DiagnoReport();
                    this.reportDate = new Date(reportArray[0].updatedTimestamp);
                    this.reportDate.setHours(0);
                    this.reportDate.setMinutes(0);
                    this.reportDate.setSeconds(0);
                    this.reportDate.setMilliseconds(0);

                    diagnosticsReport.recorddate = this.reportDate.getTime();
                    diagnosticsReport.totalrecords = 1
                    diagnosticsReport.visited = 0
                    diagnosticsReport.amount = 0

                    if (reportArray[0].invoiceCompletionStatus == StatusType.NEW) {
                        if (reportArray[0].payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                            diagnosticsReport.newrecord = 0;
                            diagnosticsReport.paid = 1;
                            diagnosticsReport.partial = 0;
                            diagnosticsReport.completed = 0;
                            diagnosticsReport.amount = reportArray[0].payment.finalAmount;
                        } else {
                            diagnosticsReport.newrecord = 1;
                            diagnosticsReport.paid = 0;
                            diagnosticsReport.partial = 0;
                            diagnosticsReport.completed = 0;
                        }
                    } else if (reportArray[0].invoiceCompletionStatus == StatusType.FULL_REPORT) {
                        diagnosticsReport.newrecord = 0;
                        diagnosticsReport.paid = 0;
                        diagnosticsReport.partial = 0;
                        diagnosticsReport.completed = 1;
                        diagnosticsReport.amount = reportArray[0].payment.finalAmount;
                    } else {
                        diagnosticsReport.newrecord = 0;
                        diagnosticsReport.paid = 0;
                        diagnosticsReport.partial = 1;
                        diagnosticsReport.completed = 0;
                        diagnosticsReport.amount = reportArray[0].payment.finalAmount;
                    }

                    this.diagnosticsReportList.push(diagnosticsReport);
                }

                // To group based on date
                for (let i = 1; i < reportArray.length; i++) {
                    var flag: number; //to identify if record is of new date in reportarray
                    flag = 0;
                    for (let j = 0; j < this.diagnosticsReportList.length; j++) {
                        this.reportDate = new Date(reportArray[i].updatedTimestamp);
                        this.reportDate.setHours(0);
                        this.reportDate.setMinutes(0);
                        this.reportDate.setSeconds(0);
                        this.reportDate.setMilliseconds(0);
                        reportArray[i].date = this.reportDate.getTime();
                        if (this.diagnosticsReportList[j].recorddate === reportArray[i].date) {
                            flag = 1;
                            if (reportArray[i].invoiceCompletionStatus == StatusType.NEW) {
                                if (reportArray[i].payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                                    this.diagnosticsReportList[j].paid++;
                                    if (reportArray[i].payment.finalAmount != null && reportArray[i].payment.finalAmount != undefined) {
                                        if (this.diagnosticsReportList[j].amount == undefined)
                                            this.diagnosticsReportList[j].amount = 0;
                                        this.diagnosticsReportList[j].amount += reportArray[i].payment.finalAmount;
                                    }
                                }
                                else {
                                    this.diagnosticsReportList[j].newrecord++;
                                }
                            } else if (reportArray[i].invoiceCompletionStatus == StatusType.FULL_REPORT) {
                                this.diagnosticsReportList[j].completed++;
                                this.diagnosticsReportList[j].visited++;
                                if (reportArray[i].payment.finalAmount != null && reportArray[i].payment.finalAmount != undefined) {
                                    if (this.diagnosticsReportList[j].amount == undefined)
                                        this.diagnosticsReportList[j].amount = 0;
                                    this.diagnosticsReportList[j].amount += reportArray[i].payment.finalAmount;
                                }
                            } else {
                                this.diagnosticsReportList[j].partial++;
                                this.diagnosticsReportList[j].visited++;
                                if (reportArray[i].payment.finalAmount != null && reportArray[i].payment.finalAmount != undefined) {
                                    if (this.diagnosticsReportList[j].amount == undefined)
                                        this.diagnosticsReportList[j].amount = 0;
                                    this.diagnosticsReportList[j].amount += reportArray[i].payment.finalAmount;
                                }
                            }
                            this.diagnosticsReportList[j].totalrecords++;
                            this.diagnosticsReportList.splice(j, 1, this.diagnosticsReportList[j]);

                            break;
                        }
                    }
                    if (flag == 0) {
                        let diagnosticsReport: DiagnoReport = new DiagnoReport();
                        this.reportDate = new Date(reportArray[i].updatedTimestamp);
                        this.reportDate.setHours(0);
                        this.reportDate.setMinutes(0);
                        this.reportDate.setSeconds(0);
                        this.reportDate.setMilliseconds(0);
                        diagnosticsReport.recorddate = this.reportDate.getTime();
                        diagnosticsReport.amount = 0;
                        diagnosticsReport.visited = 0;
                        if (reportArray[i].invoiceCompletionStatus == StatusType.NEW) {
                            if (reportArray[0].payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                                diagnosticsReport.newrecord = 0;
                                diagnosticsReport.paid = 1;
                                diagnosticsReport.partial = 0;
                                diagnosticsReport.completed = 0;
                                diagnosticsReport.amount = reportArray[i].payment.finalAmount;
                            } else {
                                diagnosticsReport.newrecord = 1;
                                diagnosticsReport.paid = 0;
                                diagnosticsReport.partial = 0;
                                diagnosticsReport.completed = 0;
                            }
                        }
                        else if (reportArray[i].invoiceCompletionStatus == StatusType.FULL_REPORT) {
                            diagnosticsReport.newrecord = 0;
                            diagnosticsReport.paid = 0;
                            diagnosticsReport.partial = 0;
                            diagnosticsReport.completed = 1;
                            diagnosticsReport.visited = 1;
                            diagnosticsReport.amount = reportArray[i].payment.finalAmount;
                        }
                        else {
                            diagnosticsReport.newrecord = 0;
                            diagnosticsReport.paid = 0;
                            diagnosticsReport.partial = 1;
                            diagnosticsReport.completed = 0;
                            diagnosticsReport.visited = 1;
                            diagnosticsReport.amount = reportArray[i].payment.finalAmount;

                        }
                        diagnosticsReport.totalrecords = 1;
                        this.diagnosticsReportList.push(diagnosticsReport);
                    }
                }

                return Promise.resolve(this.diagnosticsReportList);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });


    }

    getTestResults(pocId: number, serviceId: string): Promise<InvestigationTestDetails[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getReportRanges(
            this.httpService.getPaths().DIAGNOSTICTTESTRANGES, pocId, serviceId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(search: string, value: string): Promise<CartItem[]> {
        this.pocId = this.auth.userAuth.pocId;
        this.scrollPosition = 0;
        this.time = 0;
        this.startDate = 0;
        this.endDate = 0;
        this.orderId = 0 + "";
        this.contactNo = "";
        if (search === undefined) search = 'orderId';
        if (search === 'orderId') {
            this.orderId = value;
        }
        else this.contactNo = value;

        return this.httpService.httpGetPromise(this.urlStringFormatter.getFormatedUrlForSearchAdvise(
            this.httpService.getPaths().DIAGNOSTICADVISESFORPHNORADVISEID, this.pocId + "", this.scrollPosition + "",
            this.time + "", this.startDate + "", this.endDate + "", this.orderId, this.contactNo),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data::: " + JSON.stringify(data));
                this.diagnosticsAdviseList = data;
                return Promise.resolve(this.diagnosticsAdviseList);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getDiagnosticsAdvisesForPoc(lastTime: number, search: string, value: string): Promise<any> {
        this.pocId = this.auth.userAuth.pocId;
        this.scrollPosition = 1;
        this.time = lastTime;

        // this.scrollPosition = 0;
        this.startDate = 0;
        this.endDate = 0;
        this.orderId = 0 + "";
        this.contactNo = "";
        if (search === undefined) search = 'orderId';
        if (search === 'orderId') {
            this.orderId = value;
        }
        else this.contactNo = value;

        return this.httpService.httpGetPromise(this.urlStringFormatter.getFormatedUrlForSearchDiagnosticOrder(this.httpService.getPaths().
            DIAGNOSTICSADVISES, this.pocId + "", this.scrollPosition + "",
            this.time + "", this.startDate + "", this.endDate + "", this.orderId, this.contactNo), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                this.diagnosticsAdviseList = data;
                console.log("Service1");
                return Promise.resolve(this.diagnosticsAdviseList);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    console.log("Service2");
                    return Promise.reject(err);
                // }
            });
    }

    uploadDiagnosticsTestReports(diagnosticsAdviseTrack: DiagnosticsAdviseTrack): Promise<ReportResponse> {
        let reportResponse: ReportResponse;
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPLOAD_DIAGNOSTIC_TEST_RESULTS,
            JSON.stringify(diagnosticsAdviseTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                console.log("upload test results response >>>>>>>>>>>" + JSON.stringify(reportResponse));
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

    initiatePayment(diagnosticsAdviseTrack: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT,
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

    calculateBasket(basketRequest: BasketRequest): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().CALCULATE_BASKET,
            JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return reportResponse;
                }
            });
    }

    addNewTest(InvestigationTestDetails): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_NEW_TEST,
            JSON.stringify(InvestigationTestDetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return reportResponse;
                }
            });
    }

    updateDiagnosticInvestigationDetail(diagnosticsAdviseTrack: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DIAGNOSTICS_ORDER_DETAILS,
            JSON.stringify(diagnosticsAdviseTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return reportResponse;
                }
            });
    }


    // updateBookAppointmentSlot(basketRequest: BasketRequest): Promise<BasketResponse> {
    //     console.log("request body"+JSON.stringify(basketRequest));
    //     let basketResponse: BasketResponse;
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT, JSON.stringify(basketRequest),
    //         AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //             basketResponse = data;
    //             return basketResponse;

    //         }).catch((err) => {
    //             if (err) {
    //                 console.log(err);
    //                 return basketResponse;
    //             }
    //         });
    // }

    updatePaymentStatusAtCounter(basketRequest: BasketRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INITIATE_PAYMENT,
            JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    cancelBookedSlot(orderId: string, invoiceId: string, type: number, empId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().CANCEL_SLOT + "?invoiceId=" + invoiceId + "&orderId=" + orderId + "&type=" + type + "&empId=" + empId,
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data oc cancel: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getDiagnosticListForAdmin(diagnosticAdminRequest: DiagnosticAdminRequest): Promise<DiagnosticDeliveryAdviceTrack[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().DIAGNOSTICLISTFORADMIN, JSON.stringify(diagnosticAdminRequest),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data::: " + JSON.stringify(data));
                data.forEach(bookingDetail => {
                    bookingDetail.orderStatus = bookingDetail.invoiceCompletionStatus;
                    if ((/* new Date().getTime()) < bookingDetail.cancellationExpiryDate && */ bookingDetail.cancellationStatus == 0)) {
                        bookingDetail.enableCancel = 1;
                        bookingDetail.tempStatus = bookingDetail.sampleCollectionStatus;
                        // Tracking Status 
                        if(bookingDetail.sampleCollectionStatus == 7 && !bookingDetail.phleboAccepted ) 
                            bookingDetail.tempStatus = 15;
                    } else if (bookingDetail.cancellationStatus == 1 || bookingDetail.cancellationStatus == 2 ||
                        bookingDetail.cancellationStatus == 3) {
                        bookingDetail.enableCancel = 2;
                        //temp purpose
                        bookingDetail.orderStatus = 30;
                        bookingDetail.tempStatus = bookingDetail.cancellationStatus + 11;
                    }
                    if (bookingDetail.sampleCollectionStatus == 9) {
                        bookingDetail.enableCancel = 0;
                    }

                });
                this.diagnosticListAdmin = data;
                return Promise.resolve(this.diagnosticListAdmin);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateDiagnosticAdminRemarks(diagnosticsOrderAdmin: DiagnosticDeliveryAdviceTrack): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().DIAGNOSTICADMINREMARKS,
            JSON.stringify(diagnosticsOrderAdmin), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getLogisticsDistance(diagnosticAdminRequest: DiagnosticAdminRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_LOGISTIC_DISTANCE,
            JSON.stringify(diagnosticAdminRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPickUpRaisedOrders(diagnosticAdminRequest: DiagnosticAdminRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().PICKUP_ORDERS_LIST,
            JSON.stringify(diagnosticAdminRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPickUpOrder(orderId: string, baseInvoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_PICKUP_ORDER, orderId, baseInvoiceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    raisePickupRequest(slotBookingDetails: SlotBookingDetails): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().RAISE_PICKUP_REQ,
            JSON.stringify(slotBookingDetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticTestsList(pocId: number, serviceName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_DIAGNOSTIC_TESTS_LIST, pocId, serviceName),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getBaseTestList(serviceName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_BASE_TEST_LIST, serviceName),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }






    getDiagnosticPartialOrderFulfilled(request: DashBoardChartReq): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_PARTIAL_FULFILL_ORDER,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service::" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getDiagnosticHomeOrderFulfilled(request: DashBoardChartReq): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_HOME_ORDER,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from report service::" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    readTestPriceExcel(readInventoryExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_TEST_PRICE_EXCEL,
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

    getSearchedTestsList(searchRequest: SearchRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_SEARCH_TEST, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    searchScheduleTests(searchRequest: SearchRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().DIAGNOSTIC_SEARCH_SCHEDULE_TEST, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    searchB2BClientScheduleTests(searchRequest: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_B2B_CLIENT_TEST, JSON.stringify(searchRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

    /* getSlotForMultipleTests(pocId: number, scheduleId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getSlotForMultipleTest(this.httpService.getPaths().
            GET_DIAGNOSTIC_SLOT_MULTIPLE_TESTS, pocId, scheduleId), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                if (err) {
                    console.log(err);
                    return Promise.reject(err);
                }
            });
    } */

    getWalkInSlots(pocId: number, scheduleId: number, serviceIdList: Array<number>, profileId: number, date: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getDiagWalkInSlots(this.httpService.getPaths().
            GET_DIAGNOSTIC_WALKIN_SLOT, pocId, scheduleId, serviceIdList, profileId, date), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getHomeCollectionSlots(pocId: number, scheduleId: number, pincode: string, areaId: number, serviceIdList: Array<number>, profileId: number, date: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.getHomeCollectionSlot(this.httpService.getPaths().
            GET_DIAGNOSTIC_HOMECOLLECTION_SLOT, pocId, scheduleId, pincode, areaId, serviceIdList, profileId, date), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getTestAmount(testId: number, pocId: number, homeCollection: boolean): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_TEST_AMOUNT, testId, pocId, homeCollection),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticTestAmount(pocId: number, adviceId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTIC_TEST_AMOUNT, pocId, adviceId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("Dtat1: " + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getEmployeeListWithPOC(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_POC_BASED_EMPLOYEE_LIST, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    geVendorListWithPOC(pocId: number): Promise<any> {
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

    getDeliveryDetailsOfAllEmployees(date: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_DELIVERY_DETAILS_OF_ALL_EMPLOYEES, date),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDeliveryDetailsOfSpecificEmployees(date: number, empId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_DELIVERY_DETAILS_OF_SPECIFIC_EMPLOYEES, date, empId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    diagnosticAddInventory(empId: number, pocId: number, noOfTubes: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().DIAGNOSTIC_ADD_INVENTORY, empId, pocId, noOfTubes),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSamplesDeliveredToLabCount(date: number, empId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_SAMPLES_DELIVERED_TO_LABS_COUNT, empId, date),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSpecificPriceTemplate(excelType: number, scheduleType: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_SPECIFIC_PRICE_TEMPLATE, excelType, scheduleType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticHomeOrderRequests(req: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_HOME_ORDER_REQUESTS,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getTestTypeCategory(brandId: number, homeCollections: boolean) {
        console.log("category===>" + JSON.stringify(brandId))
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_TEST_TYPE_CATEGORY, brandId, homeCollections),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateRequesAtCS(centralOrderInteraction: CentralOrderInteraction): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_REQUEST_HOME_ORDER_AT_CS,
            JSON.stringify(centralOrderInteraction), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticPocs(request: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_POCS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    updatediagnostictestprice(procedurePriceDetail: any): Promise<any> {
        console.log(procedurePriceDetail)
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DIAGNOSTIC_TEST_PRICE,
            JSON.stringify(procedurePriceDetail), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updatebasetest(testDetails: any): Promise<any> {
        console.log(JSON.stringify(testDetails) + JSON.stringify(testDetails))
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_BASE_TEST,
            JSON.stringify(testDetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getCancelledOrders(pocId: number, empId: number, fromDate: number, toDate: number, orderId: string, mobileNo: string, fromIndex: number, toIndex: number, cancellationStatus: number) {

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_CANCELLED_HOMEORDERS, pocId, empId, fromDate, toDate, orderId, mobileNo, fromIndex, toIndex, cancellationStatus),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateDiagnosticVendorAssignment(diagnosticsOrderAdmin: DiagnosticDeliveryAdviceTrack): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PHLEBO_VENDOR,
            JSON.stringify(diagnosticsOrderAdmin), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data:: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAdminDiagnosticOrdersCount(diagnoAdminRequest: DiagnosticAdminRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_ADMIN_HOME_ORDERS_COUNT,
            JSON.stringify(diagnoAdminRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDiagnosticOrderRequestsCount(req: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_HOME_ORDER_REQUESTS_COUNT,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAgentList(req: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_AGENT_LIST_FOR_CASH,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPackageSuggestionsAsPerTests(serviceIds: Array<number>, pincode: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_PACKAGE_SUGGESTION_AS_PER_TEST, serviceIds, pincode), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSampleOfAgentList(pocId: number, skip: number, limit: number, fromDate: number, toDate: number, searchTerm: string, stateId: number, cityId: number, pinCode: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_SAMPLES_BY_AGENT, pocId, skip, limit, fromDate, toDate, searchTerm, stateId, cityId, pinCode), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPhleboLoginHistory(pocId: number, skip: number, limit: number, fromDate: number, toDate: number, empName: string, mobile: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_PHLEBO_LOGIN_HISTORY, pocId, skip, limit, fromDate, toDate, empName, mobile), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    sendSampleRequest(pocId: number, date: number, count: number, pinCode: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().UPDATE_SAMPLE_REQUEST, pocId, date, count, pinCode), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAgentOrdersList(req: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_AGENT_CASH_LIST,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getLogisticAgentOrdersList(req: ProductDeliveryRequest): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_LOGISTIC_AGENT_ORDER_DETAILS,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateCashAgentDetails(req: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_CASH_BY_AGENT,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    
    getDiagnosticClients(type: number): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTIC_CLIENTS,type),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    splitOrder(slotBookingDetails: SlotBookingDetails): any {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SPLIT_ORDER,
            JSON.stringify(slotBookingDetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAllAgetnListByPoc(pocId: number, pinCode: string): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_AGENT_LIST_BY_POC, pocId, pinCode), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSlotSummaryList(pocId: number, date: number, type: number): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(
            this.httpService.getPaths().GET_SLOT_SUMMARY_DASHBOARD, pocId, date, type), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    

    placeClickCallRequest(parentProfileId: number, callAlt: boolean): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().DOCTOR_CLICK_CALL, parentProfileId, 0, '', callAlt), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    repostOrderIntoLIS(req: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().REPOST_ORDER_INTO_LIS,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

}