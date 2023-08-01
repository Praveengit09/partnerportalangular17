export class PaymentGatewayParameters {
    public static PayUBiz=0;
    public static PayUMoney=1+PaymentGatewayParameters.PayUBiz;
    public static PayTM=PaymentGatewayParameters.PayUMoney+1;    
    public static RazorPay = PaymentGatewayParameters.PayTM + 1;

    // PayU
    public  key:string;
    // PayU and PayTM
    public  hash:string;
    // PayU and PayTM
    public  merchantId:string;
    // 0 - PayUBiz, 1 - PayUMoney, 2 - PayTM
    public paymentGateway:number;
    
    // PayU and PayTM
    public  surl:string;
    
    public  curl:string;

    
    // PayU
    public  furl:string;
    
    // PayU - Profile ID is set in UDF1
    public  udf1:string;
    
    // PayU
    public  configHash:string;
    // PayU
    public  vasHash:string;
    // PayU
    public  deleteCardHash:string;
    
    // PayU
    public  message:string;
    // PayU
    public  productInfo:string;
    
    // PayU and PayTM
    public  amount:string;
    
    // PayU & PayTM
    public  firstName:string;
    // PayU & PayTM
    public  email:string;
    // PayU & PayTM
    public  mobile:string;
    // PayU & PayTM
    public  orderId:string;
    // PayU - MerchientKey:ParentProfileId
    public  userCredentials:string;
    
    // PayTM
    public  webSite:string;
    // PayTM
    public  transactionURL:string;
    // PayTM
    public  industryTypeId:string;
    // PayTM
    public  channelId:string;
    // PayTM
    public profileId:number;

}
    