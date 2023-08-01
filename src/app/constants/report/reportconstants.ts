import { Payment } from '../../model/basket/payment';

export class ReportConstants {

    public static TRANSACTION_TYPE_CARD: string = 'CARD';
    public static TRANSACTION_TYPE_ONLINE: string = 'ONLINE';
    public static TRANSACTION_TYPE_CASH: string = 'CASH';
    public static TRANSACTION_TYPE_PACKAGE: string = 'PACAKGE';
    public static TRANSACTION_TYPE_GOOGLE_PAY: string = 'GOOGLE_PAY';
    public static TRANSACTION_TYPE_PHONEPE: string = 'PHONEPE';
    public static TRANSACTION_TYPE_PAYTM: string = 'PAYTM';
    public static TRANSACTION_TYPE_NEFT: string = 'NEFT';
    public static TRANSACTION_TYPE_UPI: string = 'UPI';



    public static BASKET_TYPE_PACKAGES: number = 1;
    public static BASKET_TYPE_DIAGNOSTICS: number = 2;
    public static BASKET_TYPE_PHARMACY: number = 3;
    public static BASKET_TYPE_PROCEDURE: number = 4;
    public static BASKET_TYPE_IMMUNIZATION: number = 5;
    public static BASKET_TYPE_PRODUCT: number = 6;
    public static BASKET_TYPE_ONBOARDING_PACKAGE: number = 7;
    public static BASKET_TYPE_DOCTOR_BOOKINGS: number = 11; // doctor_booking
    public static BASKET_TYPE_WELLNESS: number = 12;
    public static BASKET_TYPE_DOCTOR_PRESCRIPTIONS: number = 13;

    public static CART_ITEM_TYPE_PHARMACY = 101;
    public static CART_ITEM_TYPE_PRODUCT = 102;
    public static CARTITEM_TYPE_PHARMACY_LABEL: string = 'PHARMACY';
    public static CARTITEM_TYPE_PRODUCTS_LABEL: string = 'PRODUCTS';

    public static BASKET_TYPE_BOOKINGS_LABEL: string = 'BOOKINGS';
    public static BASKET_TYPE_PACKAGE_LABEL: string = 'PACKAGES';
    public static BASKET_TYPE_PHARMACY_LABEL: string = 'PHARMACY';
    public static BASKET_TYPE_DIAGNOSTICS_LABEL: string = 'DIAGNOSTIC SERVICES';
    public static BASKET_TYPE_WELLNESS_LABEL: string = 'WELLNESS SERVICES';
    public static BASKET_TYPE_PROCEDURE_LABEL: string = 'PROCEDURES';
    public static BASKET_TYPE_IMMUNIZATIONS_LABEL: string = 'IMMUNIZATIONS';
    public static BASKET_TYPE_ONBOARDING_PACKAGES_LABEL: string = 'ONBOARDING PACKAGE SALES';
    public static BASKET_TYPE_PRODUCT_LABEL: string = 'PRODUCTS';
    public static BASKET_TYPE_DOCTOR_PRESCRIPTIONS_LABEL: string = "DOCTOR PRESCRIPTIONS";

    public static BOOKING_SOURCE_NA = 0;
    public static BOOKING_SOURCE_ANDROID = 1;
    public static BOOKING_SOURCE_POZ_APP = 2;
    public static BOOKING_SOURCE_PARTNER_PORTAL = 3;
    public static BOOKING_SOURCE_IOS_APP = 4;
    public static BOOKING_SOURCE_CONSUMER_PORTAL = 5;

    public static TRANSACTION_PARTNER_TYPE_NA = 0;
    public static TRANSACTION_PARTNER_TYPE_HS = 1;
    public static TRANSACTION_PARTNER_TYPE_POC = 2;
    public static TRANSACTION_PARTNER_TYPE_BOOKING_POC = 3;
    public static TRANSACTION_PARTNER_TYPE_ONBOARDING_POC = 4;
    public static TRANSACTION_PARTNER_TYPE_BRAND_POC = 5;
    public static TRANSACTION_PARTNER_TYPE_DOCTOR_POC = 6;
    public static TRANSACTION_PARTNER_TYPE_APP_POC = 7;
    public static TRANSACTION_PARTNER_TYPE_PACKAGE_POC = 9;

    public static DISCOUNT_TYPE_NONE: number = 0;
    public static DISCOUNT_TYPE_PACKAGE: number = 1;
    public static DISCOUNT_TYPE_OTHER: number = 2;
    public static DISCOUNT_TYPE_PACKAGE_AND_OTHER: number = 3;

    public static getTransactionType(transactionType: number): string {
        let transactionTypeString: string = "";
        switch (transactionType) {
            case Payment.PAYMENT_TYPE_CARD: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_CARD;
                break;
            };
            case Payment.PAYMENT_TYPE_CASH: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_CASH;
                break;
            };
            case Payment.PAYMENT_TYPE_ONLINE: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_ONLINE;
                break;
            };
            case Payment.PAYMENT_TYPE_PACKAGE: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_PACKAGE;
                break;
            };
            case Payment.PAYMENT_TYPE_MOBILE: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_ONLINE;
                break;
            };
            case Payment.PAYMENT_TYPE_GOOGLE_PAY: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_GOOGLE_PAY;
                break;
            };
            case Payment.PAYMENT_TYPE_PAYTM: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_PAYTM;
                break;
            };
            case Payment.PAYMENT_TYPE_PHONEPE: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_PHONEPE;
                break;
            };
            case Payment.PAYMENT_TYPE_NEFT: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_NEFT;
                break;
            };
            case Payment.PAYMENT_TYPE_UPI: {
                transactionTypeString = ReportConstants.TRANSACTION_TYPE_UPI;
                break;
            };
        }
        return transactionTypeString;
    }


    public static getBasketType(basketType: number): string {
        let basketTypeString: string = "";
        switch (basketType) {
            case ReportConstants.BASKET_TYPE_PACKAGES: {
                basketTypeString = ReportConstants.BASKET_TYPE_PACKAGE_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_DIAGNOSTICS: {
                basketTypeString = ReportConstants.BASKET_TYPE_DIAGNOSTICS_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_PHARMACY: {
                basketTypeString = ReportConstants.BASKET_TYPE_PHARMACY_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_PROCEDURE: {
                basketTypeString = ReportConstants.BASKET_TYPE_PROCEDURE_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_WELLNESS: {
                basketTypeString = ReportConstants.BASKET_TYPE_WELLNESS_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_PROCEDURE: {
                basketTypeString = ReportConstants.BASKET_TYPE_PROCEDURE_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_IMMUNIZATION: {
                basketTypeString = ReportConstants.BASKET_TYPE_IMMUNIZATIONS_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_PRODUCT: {
                basketTypeString = ReportConstants.BASKET_TYPE_PRODUCT_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_ONBOARDING_PACKAGE: {
                basketTypeString = ReportConstants.BASKET_TYPE_ONBOARDING_PACKAGES_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_DOCTOR_BOOKINGS: {
                basketTypeString = ReportConstants.BASKET_TYPE_BOOKINGS_LABEL;
                break;
            };
            case ReportConstants.BASKET_TYPE_DOCTOR_PRESCRIPTIONS: {
                basketTypeString = ReportConstants.BASKET_TYPE_DOCTOR_PRESCRIPTIONS_LABEL;
                break;
            };
        }
        return basketTypeString;
    }

    public static getCartItemType(cartItemType: number): string {
        let cartItemTypeString: string = "";
        switch (cartItemType) {
            case ReportConstants.CART_ITEM_TYPE_PHARMACY: {
                cartItemTypeString = ReportConstants.CARTITEM_TYPE_PHARMACY_LABEL;
                break;
            };
            case ReportConstants.CART_ITEM_TYPE_PHARMACY: {
                cartItemTypeString = ReportConstants.CARTITEM_TYPE_PRODUCTS_LABEL
                break;
            };
        }
        return cartItemTypeString;
    }

    public static getBookingSource(bookingSource: number): string {
        let bookingSourceString: string = "";
        switch (bookingSource) {
            case ReportConstants.BOOKING_SOURCE_NA: {
                bookingSourceString = "NA";
                break;
            };
            case ReportConstants.BOOKING_SOURCE_ANDROID: {
                bookingSourceString = "Android App";
                break;
            };
            case ReportConstants.BOOKING_SOURCE_POZ_APP: {
                bookingSourceString = "POZ App";
                break;
            };
            case ReportConstants.BOOKING_SOURCE_PARTNER_PORTAL: {
                bookingSourceString = "Partner Portal";
                break;
            };
            case ReportConstants.BOOKING_SOURCE_IOS_APP: {
                bookingSourceString = "iOS App";
                break;
            };
            case ReportConstants.BOOKING_SOURCE_CONSUMER_PORTAL: {
                bookingSourceString = "Consumer Portal";
                break;
            };
            default: {
                bookingSourceString = "NA";
                break;
            }
        }
        return bookingSourceString;
    }
    public static gettransactionPartnerType(transactionPartnerType: number): string {
        let transactionPartnerTypeString: string = "";
        switch (transactionPartnerType) {
            case ReportConstants.TRANSACTION_PARTNER_TYPE_NA: {
                transactionPartnerTypeString = "NA";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_HS: {
                transactionPartnerTypeString = "HS Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_POC: {
                transactionPartnerTypeString = "POC Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_BOOKING_POC: {
                transactionPartnerTypeString = "Booking POC Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_ONBOARDING_POC: {
                transactionPartnerTypeString = "Onboarding POC Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_BRAND_POC: {
                transactionPartnerTypeString = "Brand Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_DOCTOR_POC: {
                transactionPartnerTypeString = "Doctor Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_APP_POC: {
                transactionPartnerTypeString = "App Revenue";
                break;
            };
            case ReportConstants.TRANSACTION_PARTNER_TYPE_PACKAGE_POC: {
                transactionPartnerTypeString = "Package Revenue";
                break;
            };
            default: {
                transactionPartnerTypeString = "NA";
                break;
            }
        }
        return transactionPartnerTypeString;
    }

}
