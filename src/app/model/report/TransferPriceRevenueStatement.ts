import { TransferPriceServiceDetails } from './TransferPriceServiceDetails';

export class TransferPriceRevenueStatement {
    public pocId: number;
    public pocName: string;
    public invoiceId: string;
    public orderId: string;
    public date: number;
    public totalPocRevenue: number;
    public totalHsRevenue: number;
    public totalTransferPrice: number;
    public totalActualPrice: number;
    public serviceList: TransferPriceServiceDetails[] = new Array<TransferPriceServiceDetails>();

}