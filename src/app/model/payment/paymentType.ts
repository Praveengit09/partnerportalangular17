export class PaymentType {
    public static PAYMENT_STATUS_NOT_PAID: number = 0;
    public static PAYMENT_STATUS_PAID: number = PaymentType.PAYMENT_STATUS_NOT_PAID + 1;
    public static PAYMENT_STATUS_PENDING: number = PaymentType.PAYMENT_STATUS_PAID + 1;
    public static PAYMENT_STATUS_FAILED: number = PaymentType.PAYMENT_STATUS_PENDING + 1;
}