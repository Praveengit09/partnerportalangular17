import { SpinnerService } from './../../layout/widget/spinner/spinner.service';
import { ToasterService } from './../../layout/toaster/toaster.service';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { AppConstants } from '../../base/appconstants';
import { HttpService } from '../../base/http.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { BaseResponse } from '../../model/base/baseresponse';
import { InventorySupplierDetail } from '../../model/inventory/inventorySupplierDetail';
import { GetProductRequest } from '../../model/pharmacy/getProductRequest';
import { ProductInventoryDetail } from '../../model/product/productinventorydetail';
import { StockReportRequest } from '../../model/inventory/stockReportRequest';
import { StockOrder } from '../../model/inventory/stockReportResponse';
import { Product } from '../../model/product/product';

@Injectable()
export class ProductInventoryService {
    productSearchTrack: StockReportRequest;
    supplierId: number;
    productStockList: any;
    supplierDetails: any;
    constructor(private httpService: HttpService, private spinnerService: SpinnerService,
        private auth: AuthService, private authService: AuthService, private toast: ToasterService,
        private urlStringFormatter: URLStringFormatter) {
    }

    insertProductDetails(insertRequest: InventorySupplierDetail): Promise<BaseResponse> {
        for (var i = 0; i < insertRequest.productInventoryDetails.length; i++) {
            insertRequest.productInventoryDetails[i].pocId = this.auth.userAuth.pocId;
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_PRODUCT_STOCK_DETAIL, JSON.stringify(insertRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getProductDetails(productRequest: GetProductRequest): Promise<ProductInventoryDetail> {
        productRequest.pocId = this.auth.userAuth.pocId;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PRODUCT_DETAIL_BY_SUPPLIER, JSON.stringify(productRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getStockSummaryReportList(stockReportRequest: StockReportRequest): Promise<StockOrder[]> {
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
    searchProduct(searchRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SEARCH_PRODUCT, JSON.stringify(searchRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((error) => {
            console.log(error);
            return Promise.resolve(new Array<Product>());
        });
    }
    getProductDetailsByName(productName: string, productType: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.
            getPaths().GET_PHARMACY_DETAILs_BY_NAME, productName, productType),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updatebaseproduct(procedurePriceDetail: any, appId): Promise<any> {
        let path = appId == 44 ? this.httpService.getPaths().UPDATE_BASE_PHARMACY : this.httpService.getPaths().UPDATE_PRODUCTS
        console.log(procedurePriceDetail)
        return this.httpService.httpPostPromise(path,

            JSON.stringify(procedurePriceDetail), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

}