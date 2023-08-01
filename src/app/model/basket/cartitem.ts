import { ReportFile } from './../phr/reportFile';

import { Pharmacy } from './../../model/pharmacy/pharmacy';
import { InvoiceBaseDetails } from './../../model/basket/invoicebasedetails';
import { Product } from '../product/product';
import { ServiceItem } from '../service/serviceItem';
import { PharmacyOrderHistory } from '../pharmacy/pharmacyOrderHistory';

export class CartItem extends InvoiceBaseDetails {

    public static CART_ITEM_TYPE_PACKAGE = 1;
    public static CART_ITEM_TYPE_INVESTIGATIONS = 2;
    public static CART_ITEM_TYPE_PHARMACY = 3;
    public static CART_ITEM_TYPE_PROCEDURE = 4;
    public static CART_ITEM_TYPE_IMMUNISATION = 5;
    public static CART_ITEM_TYPE_PRODUCT = 6;
    public static CART_ITEM_TYPE_ONBOARDING = 7;
    public static CART_ITEM_TYPE_APP_INCENTIVE = 21;
    public static CART_ITEM_TYPE_ADMISSION_NOTE = 10;
    public static CART_ITEM_TYPE_MISCELLANEOUS_PAYMENTS = 8;
    public static B2B_CART_ITEM_TYPE_PHARMACY = 101;
    public static B2B_CART_ITEM_TYPE_PRODUCT = 102;

    public cartItemType: number;
    public userBooking: boolean;

    public productList: Array<Product>;
    public serviceList: Array<ServiceItem>;
    public pharmacyList: Array<Pharmacy>;

    public proofDocumentUrlList: Array<String>;
    public couponApplied: boolean;
    public billNo: string;
    public billNoList: Array<String>
    public inPatientNo: String;

    public admissionFromDate: Date;
    public admissionToDate: Date;

    //transient variable
    public isReset: boolean;
    public convertedDocumentUrlList: Array<String>;
    public fileUrlList: Array<ReportFile> = new Array<ReportFile>();
    public fileCount: number;
    public orderHistoryList: Array<PharmacyOrderHistory> = new Array<PharmacyOrderHistory>();
    public actionPerformed: Number;
    //local
    public medicinesList: any
    public isEditOrder: boolean = false;


    public static getcartItemType(cartItemType: number): string {
        let cartItemTypeString: string = '';

        switch (cartItemType) {
            case CartItem.CART_ITEM_TYPE_PACKAGE: {
                cartItemTypeString = "PACKAGE";
                break;

            }
            case CartItem.CART_ITEM_TYPE_INVESTIGATIONS: {
                cartItemTypeString = "INVESTIGATIONS";
                break;
            }
            case CartItem.CART_ITEM_TYPE_PHARMACY: {
                cartItemTypeString = "PHARMACY";
                break;
            }
            case CartItem.CART_ITEM_TYPE_PROCEDURE: {
                cartItemTypeString = "PROCEDURE";
                break;

            }
            case CartItem.CART_ITEM_TYPE_IMMUNISATION: {
                cartItemTypeString = "IMMUNISATION";
                break;
            }
            case CartItem.CART_ITEM_TYPE_PRODUCT: {
                cartItemTypeString = "PRODUCT";
                break;
            }
            case CartItem.CART_ITEM_TYPE_ONBOARDING: {
                cartItemTypeString = "ONBOARDING";
                break;
            }
        }
        return cartItemTypeString;

    }

}