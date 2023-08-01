import { PaymentInfo } from './payment-info'
export class Payment extends PaymentInfo{

    public times: Array<number>;
    public doses: Array<number>;
    public dose: number;
    public takenWhen: string;
    public duration: string;
    public durationValue: number;
    public route: string;
    public addedByDoctor: boolean;
    public productDetailList: Array<Payment> = new Array();
}