import { BaseResponse } from '../base/baseresponse';
export class SupplierOrderResponse extends BaseResponse {
    
    public cartItemType: number;
    public productId: number;
    public productCount: number;
    public productQantity: number;
    public productName: string;
    public totalOrderRaised: number;
    public totalOrdersFulfilled: number;
    public totalOrdersPending: number;
    public totalRevenueGenerated: number;
    public totalOrdersRejected: number;
    public date: string;
    public timeStamp: number;
}