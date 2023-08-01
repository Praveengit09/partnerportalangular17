import { TransactionHistory } from './../../model/basket/transactionHistory';
import { CartItem } from './../../model/basket/cartitem';
import { SlotBookingDetails } from './../../model/basket/slotBookingDetails';

export class InvoiceTypeConstant {
    public static INVOICE_TYPE_REVENUE_TRANSACTIONS: number = 1;
    public static INVOICE_TYPE_APP_INCENTIVES: number = 2;
    public static INVOICE_TYPE_REVENUE_INCENTIVES: number = 3;

    public static REVENUE_TRANSACTIONS_LABEL: string = 'REVENUE TRANSACTIONS';
    public static APP_INCENTIVES_LABEL: string = 'APP INCENTIVES';
    public static REVENUE_INCENTIVES_LABEL: string = 'REVENUE INCENTIVES';

    public static PAYMENTSTATUS_TYPE_INITATED: number = 1;
    public static PAYMENTSTATUS_TYPE_PENDING: number = 2;
    public static PAYMENTSTATUS_TYPE_FAIL: number = 3;
    public static PAYMENTSTATUS_TYPE_SUCCESS: number = 4;

    public static PAYMENTSMODE_TYPE_CASH: number = 1;
    public static PAYMENTSMODE_TYPE_ONLINE: number = 2;

    public static getLabel(summaryTransaction: any): string {

        let summaryLabel: string = "";

        if (summaryTransaction.bookingType == SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT || summaryTransaction.bookingType == SlotBookingDetails.BOOKING_TYPE_WELLNESS) {
            if (summaryTransaction.bookingType == SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT) {
                summaryLabel = "Doctor purchases";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.BOOKING_TYPE_WELLNESS) {
                summaryLabel = "Wellness purchases";
            }
            if (summaryTransaction.bookingType == SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC) {
                summaryLabel = summaryLabel + "(POC)";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_DIGIROOM) {
                summaryLabel = summaryLabel + "(Digiroom)";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT) {
                summaryLabel = summaryLabel + "(Video Chat)";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN) {
                summaryLabel = summaryLabel + "(Walkin)";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_HOME) {
                summaryLabel = summaryLabel + "(Home)";
            }
        } else if (summaryTransaction.bookingType == SlotBookingDetails.BOOKING_TYPE_INVESTIGATION) {
            summaryLabel = "Diagnostic purchases";
            if (summaryTransaction.bookingType == SlotBookingDetails.DIAGNOSTICS_BOOKING_SUB_TYPE_POC
                || summaryTransaction.bookingType == SlotBookingDetails.DIAGNOSTICS_BOOKING_SUB_TYPE_WALK_IN_BILLING) {
                summaryLabel = summaryLabel + "(POC)";
            } else if (summaryTransaction.bookingType == SlotBookingDetails.DIAGNOSTICS_BOOKING_SUB_TYPE_HOME) {
                summaryLabel = summaryLabel + "(Home)";
            }
        }
        else if (summaryTransaction.cartItemType > 0) {
            if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_APP_INCENTIVE) {
                summaryLabel = "App Incentives";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_PACKAGE) {
                summaryLabel = "Package purchases";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_INVESTIGATIONS) {
                summaryLabel = "Diagnostic  purchases(POC)";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_PHARMACY) {
                summaryLabel = "Pharmacy purchases";
                if (summaryTransaction.deliveryType == SlotBookingDetails.DELIVERY_TYPE_NONE)
                    summaryLabel = summaryLabel + "(Walk in)";
                else if (summaryTransaction.deliveryType == SlotBookingDetails.DELIVERY_TYPE_HOME)
                    summaryLabel = summaryLabel + "(Home)";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_PROCEDURE) {
                summaryLabel = "Procedure purchases";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_IMMUNISATION) {
                summaryLabel = "Immuisation purchases";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_PRODUCT) {
                summaryLabel = "Product purchases";
            } else if (summaryTransaction.cartItemType == SlotBookingDetails.CART_ITEM_TYPE_ONBOARDING_PACKAGE) {
                summaryLabel = "Onboarding Package purchases";
            }
        }
        return summaryLabel;
    }
    public static getInvoiveType(invoiceType: number): string {
        let invoiceTypeString: string = "";
        switch (invoiceType) {
            case InvoiceTypeConstant.INVOICE_TYPE_REVENUE_TRANSACTIONS: {
                invoiceTypeString = InvoiceTypeConstant.REVENUE_TRANSACTIONS_LABEL;
                break;
            };
            case InvoiceTypeConstant.INVOICE_TYPE_APP_INCENTIVES: {
                invoiceTypeString = InvoiceTypeConstant.APP_INCENTIVES_LABEL;
                break;
            };
            case InvoiceTypeConstant.INVOICE_TYPE_REVENUE_INCENTIVES: {
                invoiceTypeString = InvoiceTypeConstant.REVENUE_INCENTIVES_LABEL;
                break;
            };

        }
        return invoiceTypeString;
    }

}
export enum InvoiceTypeEnum {
    REVENUE_TRANSACTIONS = 1,
    APP_INCENTIVES = 2,
    REVENUE_INCENTIVES = 3,
}
export enum InvoiceReconcilationConstant {
    Null = 0,
    Completed = 1,
    Parcial = 2,
}
export enum TransactionType {
    Card = 1,
    Cash = 2,
    Online = 3,
    Package = 4,
    Mobile = 5,
    GooglePay = 6,
    PayTM = 7,
    PhonePe = 8,
    DD = 9,
    Cheque = 10,
    Neft = 11,
    Upi = 12
}
export enum PaymentStatusTypeEnum {
    PAYMENTSTATUS_NULL = 0,
    PAYMENTSTATUS_INITATED = 1,
    PAYMENTSTATUS_PENDING = 2,
    PAYMENTSTATUS_FAIL = 3,
    PAYMENTSTATUS_SUCCESS = 4
}
export enum PaymentModeTypeEnum {
    PAYMENT_PANDING = 0,
    PAYMENTSMODE_CASH = 1,
    PAYMENTSMODE_ONLINE = 2,
}




