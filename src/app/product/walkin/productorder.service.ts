import { Injectable } from '@angular/core';
import { HttpService } from '../../base/http.service';
import { AuthService } from '../../auth/auth.service';
import { URLStringFormatter } from '../../base/util/url-string-formatter';
import { AppConstants } from '../../base/appconstants';
import { CartItem } from '../../model/basket/cartitem';
import { ProductDetails } from '../../model/product/productdetails';

@Injectable()
export class ProductService {

    isError: boolean;
    errorMessage: string[];
    showMessage: boolean;
    productAdviseTrack: CartItem;
    pocId: number;
    scrollPosition: number;
    time: number;
    startDate: number;
    endDate: number;
    orderId: string;
    invoiceId: string;
    contactNo: string;
    productAdviseList: any;
    productList: any[];
    cartItem: CartItem;
    isUpdate: boolean;

    constructor(private httpService: HttpService, private auth: AuthService, private urlStringFormatter: URLStringFormatter) { }

    getProductAdvisesForPocBasedOnPhnNoId(search: string, value: string): Promise<CartItem[]> {
        this.pocId = this.auth.userAuth.pocId;
        this.scrollPosition = 0;
        this.time = 0;
        this.startDate = 0;
        this.endDate = 0;
        this.orderId = "";
        this.contactNo = "";
        this.invoiceId = "";
        if (search === 'orderId' || search === undefined) {
            if (value.substring(0, 2) == 'OR')
                this.orderId = value;
            if (value.substring(0, 2) == 'IN')
                this.invoiceId = value;
        }
        else { this.contactNo = value };

        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().SEARCH_PRODUCT_LIST,
            this.pocId + "", this.orderId + "", this.contactNo + "", this.scrollPosition + "", 0 + "", 50 + "", this.invoiceId + ""), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                this.productAdviseList = data;
                return Promise.resolve(this.productAdviseList);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getProduct(getProduct): Promise<ProductDetails[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_PRODUCT_STOCK, JSON.stringify(getProduct), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((error) => {
                console.log(error);
                return Promise.resolve(new Array<ProductDetails>());
            });
    }
}