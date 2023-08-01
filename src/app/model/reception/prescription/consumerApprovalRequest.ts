import { PurchaseDetails } from './purchaseDetails';

export class ConsumerApprovalRequest {
    public adviceId:number;    
    public pharmacyPurchase:PurchaseDetails;
    public diagnosticPurchase:PurchaseDetails;
}