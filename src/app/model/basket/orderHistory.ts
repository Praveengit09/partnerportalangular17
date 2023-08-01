import { BasketRequest } from "./../../model/basket/basketRequest"
import { TransactionHistory } from "./../../model/basket/transactionHistory"

export class OrderHistory {
    public orderId: string;
    public invoiceId: string;
    public profileId: number;
    public transactionId: string;
    public status: number;
    public basketType: number;
    public transactionType: number;
    public amount: number;
    public orderDate: number;
    public lastUpdatedDate: number;
    public basketRequest: BasketRequest;
    public transactionHistoryList: TransactionHistory[] = new Array<TransactionHistory>();
    public cancellationExpiryDate: number;
    public billPdfUrl: string;
}
