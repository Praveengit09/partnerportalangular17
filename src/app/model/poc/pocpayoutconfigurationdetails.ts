export class PocPayoutConfigurationDetails {
    public pocId: number;
    public payoutDuration: number;
    public payoutEnabled: boolean;
    public payoutMode: string;
    public bankAccountDetails: BankAccountDetails;
    public upiAccountDetails: string;
    public paytmAccountNo: string;
    public notificationEmails: Array<string> = new Array<string>();
    public notificationContactNos: Array<string> = new Array<string>();
}

export class BankAccountDetails {
    public accountHolderName: string;
    public accountNo: string;
    public ifscCode: string;
}