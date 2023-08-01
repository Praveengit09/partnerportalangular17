export class PaytmParameters {
    public merchantId: string;
    public webSite: string;
    public profileId: number;
    public transactionURL: string;
    public industryTypeId: string;
    public channelId: string;
    public amount: string;
    public callbackUrl: string;

    // Parent first name, Parent email, Parent mobile
    public email: string;
    public mobile: string;
    public orderId: string;

    public paytmChecksum: string;

}