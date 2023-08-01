import { PaymentResponse } from "./../../model/payment/paymentResponse";
import { SlotBookingDetails } from './slotBookingDetails';
export class BasketResponse extends PaymentResponse {
    public override orderId: string;
    public override invoiceId: string;
    public amount: number;
    public merchantId: string;
    public override transactionId: string;
    public furl: string;
    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;
    public surl: string;
    public key: string;
    public hash: string;
    public udf1: string;
    public configHash: string;
    public vasHash: string;
    public message: string;
    public productInfo: string;
    public  slotBookingDetailsList: Array<SlotBookingDetails>=[];
}
