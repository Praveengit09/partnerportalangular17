import { Product } from "../product/product";

export class PocSubscriptionDetails {
    public  createdTimestamp : number;
    public  updatedTimestamp : number;
    public  empId : number;
    public  pocId : number;
    public  txnToken : String;
    public  subscriptionId : number;
    public  planDetails : Product;
    public  cancelled : boolean;
    public  validTo : number;
    public  subscriptionStatus :number;
    public paymentActivation : number;
    
   
    
    }