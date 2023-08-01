import { Taxes } from './taxes';

export class Payment {
    public static PAYMENT_TYPE_NOT_DEFINED = 0;
    public static PAYMENT_TYPE_CARD = Payment.PAYMENT_TYPE_NOT_DEFINED + 1;
    public static PAYMENT_TYPE_CASH = Payment.PAYMENT_TYPE_CARD + 1;
    public static PAYMENT_TYPE_ONLINE = Payment.PAYMENT_TYPE_CASH + 1;
    public static PAYMENT_TYPE_PACKAGE = Payment.PAYMENT_TYPE_ONLINE + 1;
    public static PAYMENT_TYPE_MOBILE = Payment.PAYMENT_TYPE_PACKAGE + 1;
    public static PAYMENT_TYPE_GOOGLE_PAY = Payment.PAYMENT_TYPE_MOBILE + 1;
    public static PAYMENT_TYPE_PAYTM = Payment.PAYMENT_TYPE_GOOGLE_PAY + 1;
    public static PAYMENT_TYPE_PHONEPE = Payment.PAYMENT_TYPE_PAYTM + 1;
    public static PAYMENT_TYPE_NEFT = Payment.PAYMENT_TYPE_PHONEPE + 3;
    public static PAYMENT_TYPE_UPI = Payment.PAYMENT_TYPE_NEFT + 1;

    public static PAYMENT_STATUS_NOT_PAID: number = 0;
    public static PAYMENT_STATUS_PAID: number = Payment.PAYMENT_STATUS_NOT_PAID + 1;
    public static PAYMENT_STATUS_PENDING: number = Payment.PAYMENT_STATUS_PAID + 1;
    public static PAYMENT_STATUS_FAILED: number = Payment.PAYMENT_STATUS_PENDING + 1;

    public paymentStatus: number;
    public transactionId: string;
    public transactionType: number;
    public originalAmount: number;
    public packageDiscountAmount: number;
    public otherDiscountAmount: number;
    public taxationAmount: number;
    public finalAmount: number;
    public paymentId: string;
    public setPaymentDate: number;
    public setpaymentTime: number;
    public amountPaid: number; // - This field is added to indicate how much amount has been partially paid for an invoice
    public partialPayment: Payment;//- This field is added to store details of partial payment
    public amountToBePaid: number;
    public taxes: Taxes;
    public usedWalletAmount: number;
    public usedPostWalletAmount: number;
    public totalCashbackAmount: number;
    public walletPaidAmount: number;
    public packageCashBackAmount: number;
    public platformCharges: number;
    public privilegeCardCharges: number;
    public roundOffDifference: number;
    public creditUser: number;
    public insuranceClaimAmount: number;
}

export const PaymentConnst = [
    { type: "Card", value: 1 },
    { type: "Cash", value: 2 },
    { type: "Online", value: 3 },
    { type: "Package", value: 4 },
    { type: "Mobile", value: 5 },
    { type: "GooglePay", value: 6 },
    { type: "PayTM", value: 7 },
    { type: "PhonePe", value: 8 },
    { type: "DD", value: 9 },
    { type: "Cheque", value: 10 },
    { type: "NEFT", value: 11 },
    { type: "UPI", value: 12 },
];
