import { CryptoUtil } from './../auth/util/cryptoutil';
import { BaseResponse } from './../model/base/baseresponse';
import { Taxes } from './../model/basket/taxes';
import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { PharmaReport } from './../model/pharmacy/pharmareport';
import { Pharmacy } from './../model/pharmacy/pharmacy';
import { PaymentType } from "./../model/payment/paymentType";
import { ReportResponse } from './../model/common/reportResponse';
import { BookedPackageResponse } from "./../model/package/bookedPackageResponse";
import { AppConstants } from './../base/appconstants';
import { PharmacyInventoryDetail } from './../model/pharmacy/pharmacyProductsDetailsList';
import { InventorySupplierDetail } from './../model/inventory/inventorySupplierDetail';
import { AdminPharmacyDeliveryRequest } from "./../model/pharmacy/adminPharmacyDeliveryRequest";
import { AdminPharmacyDeliveryResponse } from "./../model/pharmacy/adminPharmacyDeliveryResponse";
import { DashBoardChartReq } from './../model/chart/dashBoardChartReq';
import { StockReportRequest } from './../model/inventory/stockReportRequest';
import { StockOrder } from './../model/inventory/stockReportResponse'
import { UpdateSupplierOrderListRequest } from './../model/pharmacy/updateSupplierOrderListRequest';
import { StatusType } from './../model/common/statusType';
import { CartItem } from '../model/basket/cartitem';
import { PocPharmacyDetailsRequest } from '../model/centralinventory/pocpharmacydetailsrequest';
import { PocDetail } from '../model/poc/pocDetails';
import { ToasterService } from '../layout/toaster/toaster.service';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { PackingInformation } from '../model/product/packinginformation';
import { BBCartItem } from '../model/basket/b2bcartitem';
import { Config } from '../base/config';

@Injectable()
export class PharmacyService {

    pocId: number;
    scrollPosition: number;
    time: number;
    startDate: number;
    endDate: number;
    orderId: string;
    contactNo: string;

    public errorMessage: Array<string>;
    public isError: boolean;
    public showMessage: boolean;

    public pharmacyAdviseTrack: CartItem = new CartItem();
    public supplierAdviseTrack: BBCartItem = null;
    public orderIdList: string[] = new Array<string>();
    public orderIdMail: string;
    public searchResult: PharmacyInventoryDetail[] = new Array();
    pharmacyAdviseList: CartItem[] = new Array();
    pharmacyReportList: PharmaReport[] = new Array();
    ReportResponse: ReportResponse;
    bookedPackageList: BookedPackageResponse[] = new Array();
    pharmacyDeliveryDetails: AdminPharmacyDeliveryResponse;
    tempPharmacyDeliveryDetails: any = undefined;
    pharmacyList: Array<Pharmacy>;
    medicineSearchTrack: StockReportRequest;
    supplierDetails: UpdateSupplierOrderListRequest;
    supplierId: number;
    productStockList: any;
    pocPharmacyDetailsRequest: PocPharmacyDetailsRequest;
    pocProductdetails: PocDetail = new PocDetail();
    isFromProduct: boolean = false;
    isEditedOrder: boolean = false;
    isHomeOrder: boolean = false;

    tempPdfUrl: string;
    cartItem: CartItem;
    isUpdate: boolean;
    supplierOrderDetails: any;
    isBBCartCalculated: boolean = false;
    supplierBackPageLoc = '';

    constructor(private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private toast: ToasterService,
        private spinnerService: SpinnerService
    ) { }

    getpharmacyAdvisesForPoc(pocId: number, from: number, size: number, orderId: string, mobileNo: string, startDate?: number, endDate?: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PHARMACYADVISES, pocId,
            from, size, orderId, mobileNo, startDate, endDate), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                //this.pharmacyAdviseList = data;
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSpeciality(type: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_SPECIALITY + "?type=" + type, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getsupplierAdvisesForPoc(pocId: number, from: number, size: number, orderId: string, pocName: string): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().GET_SUPPLIER_ORDERLIST}` +
            `?pocId=${pocId}&from=${from}&size=${size}&orderId=${orderId ? orderId : ''}${pocName ? '&pocName=' + pocName : ''}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    sendMailConsolidateOrders(pocId: number, orderIdList: Array<String>): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().CONSOLIDATED_ORDERS_MAIL}` +
            `?pocId=${pocId}&orderList=${orderIdList}`, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getInVoicesList(pocId: number, empId: number, from: number, size: number, orderId: string, fromDate: number, toDate: number, status?: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().GET_SUPPLIER_ORDERS_INVOICELIST}` +
            `?pocId=${pocId}&empId=${empId}&from=${from}&size=${size}&orderId=${orderId}&fromDate=${fromDate}&toDate=${toDate}&status=${status}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getB2bOrderDetails(orderId: string, invoiceId: string): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().GET_SUPPLIER_ORDERS_INVOICELIST}/${orderId}?invoiceId=${invoiceId}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPharmacyInVoicesList(pocId: number, empId: number, from: number, size: number, orderId: string, fromDate: number, toDate: number, status: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().GET_SUPPLIER_ORDERS_INVOICELIST}` +
            `?purchaserPocId=${this.auth.selectedPOCMapping.pocId}&supplierPocId=${pocId}&empId=${empId}&from=${from}&size=${size}&orderId=${orderId}&fromDate=${fromDate}&toDate=${toDate}&status=${status}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getOrderDetails(orderId: string, invoiceId: string): Promise<any> {
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
    getPharmacyDetailsAccordingToCondition(request: PocPharmacyDetailsRequest): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PHARMACY_DETAILS_WITH_CONDITION,
            request.pocId,
            request.suplierName,
            request.genericMedicineName,
            request.drugForm,
            request.brandName,
            request.expiryDate,
            request.quantityLess,
            request.quantityEquals,
            request.quantityGreater
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
    getDownloadExcellLinkPharmacyDetailsAccordingToCondition(request: PocPharmacyDetailsRequest): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOWNLOAD_LINK_OF_EXCELL_WITH_STOCK_OF_POC,
            request.pocId,
            request.suplierName,
            request.genericMedicineName,
            request.drugForm,
            request.brandName,
            request.expiryDate,
            request.quantityLess,
            request.quantityEquals,
            request.quantityGreater
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
    getPOCPharmacyDetailsAccordingToCondition(request: PocPharmacyDetailsRequest): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_POC_PHARMACY_DETAILS_WITH_CONDITION,
            request.pocId,
            request.suplierName,
            request.genericMedicineName,
            request.drugForm,
            request.brandName,
            request.expiryDate,
            request.quantityLess,
            request.quantityEquals,
            request.quantityGreater
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

    getpharmacydeliveries(adminPharmacyDeliveryRequest: AdminPharmacyDeliveryRequest): any {
        let adminPharmacyDeliveryResponseList: Array<AdminPharmacyDeliveryResponse>;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PHARMACY_DELIVERIES, JSON.stringify(adminPharmacyDeliveryRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            adminPharmacyDeliveryResponseList = data;
            return Promise.resolve(adminPharmacyDeliveryResponseList);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updatepharmacydeliveries(adminPharmacyDelivery: AdminPharmacyDeliveryResponse): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PHARMACY_DELIVERIES, JSON.stringify(adminPharmacyDelivery), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    calculatePharmacyDeliveries(cartItem: CartItem): Promise<CartItem> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CALCULATE_PHARMACY_DELIVERIES, JSON.stringify(cartItem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updatePharmacyReturn(adminPharmacyDelivery: AdminPharmacyDeliveryResponse): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PHARMACY_RETURN, JSON.stringify(adminPharmacyDelivery), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getMedicineDetailList(orderId: string): Promise<Array<Pharmacy>> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_MEDICINE_DETAILS_LIST, orderId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPharmacyReport(startDate: number, endDate: number): Promise<PharmaReport[]> {
        this.pocId = this.auth.userAuth.pocId;
        this.time = 0;
        this.pharmacyReportList = new Array<PharmaReport>();
        endDate = endDate + 86400000;
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PHARMACYREPORTS, this.pocId, startDate, endDate), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                // console.log("start Date:" + startDate);
                //console.log("end Date:" + endDate);
                console.log("getting from server:" + JSON.stringify(data));
                let reportArray: CartItem[] = data;
                let reportDate: Date;
                if (this.pharmacyReportList.length <= 0 && reportArray != undefined && reportArray != null && reportArray.length > 0) {
                    let pharmacyReport: PharmaReport = new PharmaReport();
                    // for the first record from server.

                    reportDate = new Date(reportArray[0].updatedTimestamp);
                    reportDate.setHours(0);
                    reportDate.setMinutes(0);
                    reportDate.setSeconds(0);
                    reportDate.setMilliseconds(0);
                    pharmacyReport.recorddate = reportDate.getTime();
                    console.log("date:" + pharmacyReport.recorddate);

                    // pharmacyReport.recorddate = reportArray[0].date;
                    pharmacyReport.totalrecords = 1;
                    pharmacyReport.amount = 0;
                    pharmacyReport.newrecord = 0;
                    pharmacyReport.visited = 0;
                    pharmacyReport.paid = 0;
                    if (reportArray[0].invoiceCompletionStatus == StatusType.PHARMCY_INVOICE_COMPLETION_STATUS_COMPLETE) {
                        pharmacyReport.visited = 1;
                        pharmacyReport.amount = reportArray[0].payment.finalAmount;
                    }
                    else if (reportArray[0].payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                        pharmacyReport.paid = 1;
                        pharmacyReport.amount = reportArray[0].payment.finalAmount;
                    }
                    else {
                        pharmacyReport.newrecord = 1;
                    }

                    this.pharmacyReportList.push(pharmacyReport);
                }

                //  console.log("Printing the transformed reports length -- " + this.pharmacyReportList.length);
                //from the second record from server
                for (let i = 1; i < reportArray.length; i++) {   //list from service


                    var flag: number;
                    flag = 0;
                    for (let j = 0; j < this.pharmacyReportList.length; j++) {  // report list
                        reportDate = new Date(reportArray[i].updatedTimestamp);
                        reportDate.setHours(0);
                        reportDate.setMinutes(0);
                        reportDate.setSeconds(0);
                        reportDate.setMilliseconds(0);
                        reportArray[i].updatedTimestamp = reportDate.getTime();


                        if (this.pharmacyReportList[j].recorddate === reportArray[i].updatedTimestamp) {
                            flag = 1;
                            if (reportArray[i].invoiceCompletionStatus == StatusType.PHARMCY_INVOICE_COMPLETION_STATUS_COMPLETE) {
                                this.pharmacyReportList[j].visited++;
                                this.pharmacyReportList[j].amount += reportArray[i].payment.finalAmount;
                            }
                            else if (reportArray[i].payment.paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                                this.pharmacyReportList[j].paid++;
                                this.pharmacyReportList[j].amount += reportArray[i].payment.finalAmount;
                            }
                            else {
                                this.pharmacyReportList[j].newrecord++;
                            }

                            this.pharmacyReportList[j].totalrecords++;
                            /*if (reportArray[i].discountedPrice != null && reportArray[i].discountedPrice > 0) {
                                this.pharmacyReportList[j].amount += reportArray[i].discountedPrice;
                            }*/
                            //
                            this.pharmacyReportList.splice(j, 1, this.pharmacyReportList[j]);//for freplace
                            console.log("new:" + JSON.stringify(this.pharmacyReportList));

                            break;
                        }
                    }

                    if (flag == 0) {

                        let pharmacyReport: PharmaReport = new PharmaReport();
                        //pharmacyReport.recorddate = reportArray[i].timeStamp;
                        reportDate = new Date(reportArray[i].updatedTimestamp);
                        reportDate.setHours(0);
                        reportDate.setMinutes(0);
                        reportDate.setSeconds(0);
                        reportDate.setMilliseconds(0);
                        pharmacyReport.recorddate = reportDate.getTime();
                        pharmacyReport.totalrecords = 1;
                        pharmacyReport.amount = 0;
                        pharmacyReport.paid = 0;
                        pharmacyReport.newrecord = 0;
                        pharmacyReport.visited = 0;
                        if (data[i].adviseStatus == StatusType.PHARMCY_INVOICE_COMPLETION_STATUS_COMPLETE) {
                            pharmacyReport.visited = 1;
                            pharmacyReport.amount = reportArray[i].payment.finalAmount;
                        }
                        else if (data[i].paymentStatus == PaymentType.PAYMENT_STATUS_PAID) {
                            pharmacyReport.paid = 1;
                            pharmacyReport.amount = reportArray[i].payment.finalAmount;
                        }
                        else {
                            pharmacyReport.newrecord = 1;
                        }
                        this.pharmacyReportList.push(pharmacyReport);
                    }
                }
                console.log("resolveeeeeeeeeee" + JSON.stringify(this.pharmacyReportList));

                return Promise.resolve(this.pharmacyReportList);
            }

            ).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    searchSupplier(searchRequest): Promise<any> {
        searchRequest.id = this.auth.userAuth.pocId;
        const { pocName, searchTerm } = searchRequest;
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUPPLIER_SEARCH, JSON.stringify({ pocName, searchTerm }), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((error) => {
            console.log(error);
            return Promise.resolve(new Array<PharmacyInventoryDetail>());
        });
    }
    searchProduct(searchRequest): Promise<any> {
        if (!searchRequest.id || searchRequest.id == 0) {
            searchRequest.id = this.auth.userAuth.pocId;
        }
        searchRequest.brandId = +Config.portal.appId;
        return this.httpService.httpPostPromise(this.httpService.getPaths().SEARCH_PHARMACY, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((error) => {
            console.log(error);
            return Promise.resolve(new Array<PharmacyInventoryDetail>());
        });
    }

    getPharamacyStockDetails(productidList): Promise<any> {
        let requestBody = {
            pocId: this.auth.userAuth.pocId,
            productIdList: productidList
        }

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PHARMACY_STOCK_DETAILS, JSON.stringify(requestBody),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                console.log(err)
            })
    }

    getPharamacySuggestedmedicine(genericMedicineName, pocId): Promise<any> {
        let requestBody = {
            genericMedicineName: genericMedicineName,
            pocId: pocId
        }
        return this.httpService.httpPostPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_PHARMACY_SUGESSTED_MEDICINES, requestBody.genericMedicineName, requestBody.pocId), JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getProductDetails(getProductRequest): Promise<PharmacyInventoryDetail> {
        getProductRequest.pocId = this.auth.userAuth.pocId;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PRODUCT_DETAIL, JSON.stringify(getProductRequest), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((error) => {
                console.log(error);
                return Promise.resolve(new Array<PharmacyInventoryDetail>());
            });
    }

    getPharmacyRevenueBasedOnDay(request: DashBoardChartReq): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PHARMACY_REVENUE_BASED_ON_DAY,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getProduct(getProduct): Promise<Pharmacy[]> {
        getProduct.pocId = this.auth.userAuth.pocId;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PHARMACY_STOCK, JSON.stringify(getProduct), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((error) => {
                console.log(error);
                return Promise.resolve(new Array<Pharmacy>());
            });
    }

    getAltProduct(genericMedicineName: string): Promise<Pharmacy[]> {
        let pocId = this.auth.userAuth.pocId;
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ALT_PHARMACY_STOCK, pocId,
            genericMedicineName), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((error) => {
                console.log(error);
                return Promise.resolve(new Array<Pharmacy>());
            });
    }

    insertProductDetails(insertRequest): Promise<InventorySupplierDetail[]> {
        insertRequest.empId = this.auth.userAuth.employeeId;
        for (var i = 0; i < insertRequest.pharmacyInventoryDetails.length; i++) {
            insertRequest.pharmacyInventoryDetails[i].pocId = this.auth.userAuth.pocId;
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_PHARMACY_STOCK_DETAIL, JSON.stringify(insertRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    insertSupplierProductDetails(insertRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_SUPPLIER_PRODUCT, JSON.stringify(insertRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    // getRevenueReport(reportRequest: ReportRequest): Promise<any> {
    //     return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ADMIN_REVENUES,
    //         JSON.stringify(reportRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
    //             //console.log("data from report service::"+JSON.stringify(data));
    //             return data;
    //         }).catch((error) => {
    //             console.log(error);
    //             return Promise.reject(error);
    //         });
    // }

    getStockSummaryReportList(stockReportRequest: StockReportRequest): Promise<StockOrder[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INVENTORY_STOCK_REPORT,
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

    getSupplierStockSummaryReportList(stockReportRequest: StockReportRequest): Promise<StockOrder[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUPPLIER_INVENTORY_STOCK_REPORT,
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

    updateSupplierOrderList(updateSupplierOrderListRequest: UpdateSupplierOrderListRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_SUPPLIER_ORDER_LIST,
            JSON.stringify(updateSupplierOrderListRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("data from updateSupplierOrderListRequest:" + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    readInventoryExcel(readInventoryExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_INVENTORY_EXCEL,
            JSON.stringify(readInventoryExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                return err;
                // }
            });
    }

    readDeliveryChargesExcel(readDeliveryChargesExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_DELIVERY_CHARGES_EXCEL,
            JSON.stringify(readDeliveryChargesExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                return err;
                // }
            });
    }

    readSupplierInventoryExcel(readInventoryExcelRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().READ_SUPPLIER_INVENTORY_EXCEL,
            JSON.stringify(readInventoryExcelRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                return err;
                // }
            });
    }

    getFileUrl(pocId: number, orderId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().READ_PRICE_UPLOAD_EXCEL,
            pocId + "", orderId + ""), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                return err;
                // }
            });
    }

    getPharmacyDeliveryReport(fromDate: number, toDate: number, pocId: number): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PHARMACY_DELIVERY_REPORT, fromDate + "",
            toDate + "", pocId + ""), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateHomeOrderForDelivery(reqBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().POST_HOMEORDER_FOR_DELIVERY,
            JSON.stringify(reqBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                return err;
                // }
            });
    }

    getEmployeeToAssignForDelivery(orderId: any, pocId: number): any {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMPLOYEE_FOR_PRODUCT_DELIVERY, orderId + "",
            pocId + ""), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    openPDF(pdfUrl) {
        this.spinnerService.start();
        this.auth.getTempUrl(pdfUrl).then((url) => {
            this.spinnerService.stop();
            if ((url.statusCode == 201 || url.statusCode == 200)) {
                this.auth.openPDF(url.data);
                // this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
            } else {
                this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
            }
        }).catch((err) => {
            this.spinnerService.stop();
            this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
        })
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
    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }
    calculateCost(itemList) {
        console.log("calculateCost");
        let originalAmount: number = 0;
        let taxationAmount: number = 0;
        let finalAmount: number = 0;
        itemList ? itemList.forEach(element => {
            let calItem = this.calculateItem(element);
            originalAmount = +originalAmount + +calItem.originalAmount;
            taxationAmount = +taxationAmount + +calItem.taxationAmount;
            finalAmount = +finalAmount + +calItem.finalAmount;
        }) : '';
        let calData = {
            'originalAmount': this.roundToTwo(originalAmount), 'pharmacyList': itemList,
            'taxationAmount': this.roundToTwo(taxationAmount), 'finalAmount': this.roundToTwo(finalAmount)
        };
        return calData;
    }
    calculateItem(element: Pharmacy) {
        element.netPrice = element.netPrice ? +element.netPrice : 0;
        element.quantity = element.quantity ? +element.quantity : 0;
        element.discountPrice = +element.discountPrice ? +element.discountPrice : 0;
        // element.packingInformation.unitsInPackage = element.packingInformation && element.packingInformation.unitsInPackage ? element.packingInformation.unitsInPackage : 1;
        if (+element.netPrice >= 0 && +element.quantity >= 0) {
            let taxAmtPerUnit: number = 0;
            element.totalTaxes = new Taxes();
            if (!element.packingInformation || !element.packingInformation.unitsInPackage) {
                element.packingInformation = new PackingInformation();
                element.packingInformation.unitsInPackage = 0;
            }
            element.looseQuantity = element.packageSoldLoose ? +element.quantity : +element.quantity * +element.packingInformation.unitsInPackage;
            if (element.taxes) {
                element.taxes.cgst = element.totalTaxes.cgst = element.taxes.cgst && element.taxes.cgst >= 0 ? +element.taxes.cgst : 0;
                element.taxes.sgst = element.totalTaxes.sgst = element.taxes.sgst && element.taxes.sgst >= 0 ? +element.taxes.sgst : 0;
                element.taxes.igst = element.totalTaxes.igst = element.taxes.igst && element.taxes.igst >= 0 ? +element.taxes.igst : 0;
            }
            let totalTaxPer = element.totalTaxes.igst > 0 ? (+element.totalTaxes.igst) : (+element.totalTaxes.cgst + +element.totalTaxes.sgst);
            element.grossPrice = this.roundToTwo(this.calculateGrossprice(element.netPrice, element.discountPrice, +totalTaxPer));
            element.stockDetails ? element.stockDetails.grossPrice = this.roundToTwo(this.calculateGrossprice(element.stockDetails.netPrice, element.discountPrice, +totalTaxPer)) : '';
            if (element.taxes) {
                element.taxes.cgstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.cgst / 100);
                element.taxes.sgstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.sgst / 100);
                element.taxes.igstAmount = this.roundToTwo(+(+element.grossPrice - +element.discountPrice) * +element.taxes.igst / 100);

                // element.taxes.cgstAmount = this.roundToTwo(+element.grossPrice * +element.taxes.cgst / 100);
                // element.taxes.sgstAmount = this.roundToTwo(+element.grossPrice * +element.taxes.sgst / 100);
                // element.taxes.igstAmount = this.roundToTwo(+element.grossPrice * +element.taxes.igst / 100);
                element.grossPrice = +element.netPrice + (element.discountPrice ? +element.discountPrice : 0) - ((element.taxes.igstAmount && element.taxes.igstAmount > 0) ? (+element.taxes.igstAmount) : (+element.taxes.cgstAmount + +element.taxes.sgstAmount));
                if (element.stockDetails) {
                    element.stockDetails.taxes.cgstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.cgst / 100);
                    element.stockDetails.taxes.sgstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.sgst / 100);
                    element.stockDetails.taxes.igstAmount = this.roundToTwo(+element.stockDetails.grossPrice * +element.stockDetails.taxes.igst / 100);
                    element.stockDetails.grossPrice = +element.stockDetails.netPrice + (element.discountPrice ? +element.discountPrice : 0) - ((element.stockDetails.taxes.igstAmount && +element.stockDetails.taxes.igstAmount > 0) ? (+element.stockDetails.taxes.igstAmount) : (+element.stockDetails.taxes.cgstAmount + +element.stockDetails.taxes.sgstAmount));
                }

                console.log(element.totalTaxes.cgst + '<<>>' + element.totalTaxes.sgst + '<<>>' + element.totalTaxes.igst + '<<>>' + element.taxes.cgstAmount + '<<>>' + element.taxes.sgstAmount + '<<>>' + element.taxes.igstAmount);
            } else {
                element.taxes = new Taxes();
                element.taxes.cgstAmount = 0;
                element.taxes.sgstAmount = 0;
                element.taxes.igstAmount = 0;
            }
            element.totalTaxes.cgstAmount = this.roundToTwo(+element.quantity * +element.taxes.cgstAmount);
            element.totalTaxes.sgstAmount = this.roundToTwo(+element.quantity * +element.taxes.sgstAmount);
            element.totalTaxes.igstAmount = this.roundToTwo(+element.quantity * +element.taxes.igstAmount);

            if (element.taxes.igstAmount && element.taxes.igstAmount > 0) {
                taxAmtPerUnit = +element.taxes.igstAmount;
            } else {
                taxAmtPerUnit = +element.taxes.cgstAmount + +element.taxes.sgstAmount;
            }
            element.taxationAmount = taxAmtPerUnit * +element.quantity;
            element.originalAmount = +element.grossPrice * +element.quantity;
            element.otherDiscountAmount = +element.discountPrice * +element.quantity;
            element.finalAmount = +element.originalAmount + +element.taxationAmount - +element.otherDiscountAmount;
            let calData = {
                'originalAmount': element.originalAmount,
                'taxationAmount': +element.taxationAmount,
                'otherDiscountAmount': +element.otherDiscountAmount,
                'finalAmount': +element.finalAmount
            };
            return calData;
        }
        return null;
    }

    calculateGrossprice(netprice: number, discountPrice: number, totalTaxPer = 0) {
        totalTaxPer = !totalTaxPer ? 0 : +totalTaxPer;
        netprice = !netprice ? 0 : +netprice;
        return ((discountPrice ? +discountPrice : 0) + netprice / (1 + (+totalTaxPer / 100)));
    }

    updateSuplierStatusOrder(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUPPLIER_ORDER, requestBody, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updateSupplierInvoiceStatus(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_SUPPLIER_INVOICE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    updateQuotationStatus(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_QUOTATION, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getSupplierProductSuggestion(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUPPLIER_INVOICE_SUGGESTION, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    supplierCalculateBasket(requestBody: BBCartItem): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUPPLIER_CALCULATE_BASKET, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    supplierInitiatePayment(requestBody: BBCartItem): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUPPLIER_INITIATE_PAYMENT, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    supplierSendQuotation(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUPPLIER_INITIATE_QUOTATION, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    saveSupplierOrdersLocalstore(isCalculated = false) {
        let crypto = new CryptoUtil();
        !isCalculated ? this.supplierOrderDetails = null : '';
        this.isBBCartCalculated = isCalculated;
        let orders = { supplierAdvise: this.supplierAdviseTrack, supplierAdviseRes: this.supplierOrderDetails, isCalculated }
        localStorage.setItem('supplierAdvise', crypto.encryptData(JSON.stringify(orders)));
    }
    cleanSupplierOrdersLocalstore() {
        this.supplierAdviseTrack = null;
        this.supplierDetails = null;
        localStorage.removeItem('supplierAdvise');
    }
    getSupplierOrderFromLocalstore() {
        let crypto = new CryptoUtil();
        let localData: any = localStorage.getItem('supplierAdvise');
        localData = localData && JSON.parse(crypto.decryptData(localData));
        return localData;
    }
    getSupplierAdviseTrack() {
        let adviseData = this.getSupplierOrderFromLocalstore();
        if (this.supplierAdviseTrack) { return this.supplierAdviseTrack; }
        else if (adviseData) { return adviseData && adviseData.supplierAdvise }
    }
    getSupplierCalculatedAdvise() {
        let adviseData = this.getSupplierOrderFromLocalstore();
        if (this.supplierOrderDetails) { return this.supplierOrderDetails; }
        else if (adviseData) { return adviseData && adviseData.supplierAdviseRes }
    }
    isBasketCalculated() {
        let adviseData = this.getSupplierOrderFromLocalstore();
        !this.isBBCartCalculated ? this.isBBCartCalculated = adviseData && adviseData.isCalculated : '';
        return this.isBBCartCalculated;
    }

    updateRazorPayPayment(b2bcartitem: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_RAZORPAY_PAYMENT, JSON.stringify(b2bcartitem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getTotalOrdersCountList(pocId: number, fromDate: number, toDate: number, periodType: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().SUPPLIER_ORDER_PERDAY_REPORT}` +
            `?pocId=${pocId}&fromDate=${fromDate}&toDate=${toDate}&periodType=${periodType}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSupplierMedicineOrderCountList(pocId: number, fromDate: number, toDate: number, periodType: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().SUPPLIER_ORDE_MEDICINES_REPORT}` +
            `?pocId=${pocId}&fromDate=${fromDate}&toDate=${toDate}&periodType=${periodType}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getTotalOrdersCount(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().INVENTORY_ORDERS_COUNT}` +
            `?pocId=${pocId}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getFastMovingMedicineList(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().FAST_MOVING_MEDICINE_LIST}` +
            `?pocId=${pocId}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    getSupplierPoc(brandFilter) {
        return this.httpService.httpGetPromise(`${this.httpService.getPaths().GET_SUPPLIER_POC}` +
            `?brandFilter =${brandFilter}`, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }


    getTransferPharmaList(pocId: number, fromDate: number, toDate: number, status: number, from: number, size: number, orderId: string, pocName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_TRANSFER_PHARMA_LIST, pocId, fromDate, toDate, status, from, size, orderId, pocName), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    raiseTransferPharmaList(bbcartitem: BBCartItem): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().RAISE_NEW_TRANSFER_REQUEST, JSON.stringify(bbcartitem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updateTransferPharmaList(reqBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_TRANSFER_REQUEST, JSON.stringify(reqBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    completeTransferPharmaList(bbcartitem: BBCartItem): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().COMPLETE_TRANSFER_REQUEST, JSON.stringify(bbcartitem), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getMedicinesBasedOnStock(pocId: number, productName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_STOCK_BASED_MEDICINE, pocId, productName), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getPocDetailsBasedOnName(pocName: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_POCNAME_BASED_SEARCH, pocName), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    completePharmacyWalkinReturn(reqbody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().PHAMRACY_WALKIN_RETURN, JSON.stringify(reqbody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
}

