import { Address } from "./address";

export class PocAdviseData {
    public pocId: number;
    public pocName: string;
    public brandId: number;
    public address: Address = new Address();
    public email: string;
    public contactList: Array<string> = new Array<string>();
    public homeConsultationContactNo: string;
    public pocLogo: string;
    public pocImageUrls: Array<string>;
    public pocCode: string;
    public saasSubscriber : boolean;

    public pdfHeaderType: number;
    //local use
    public hasDigi: boolean;
}