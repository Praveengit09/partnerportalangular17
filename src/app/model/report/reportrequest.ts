export class ReportRequest {
    public fromDate: number;
    public daysInterval: number;
    public toDate: number;
    public pocIds: Array<number>;
    public perPOC: boolean;
    public perDoctor: boolean;
    public perService: boolean;
    public basketType: number;
    public doctorId: number; //either diagnostics,pharmacy,booking
    public perBookingSource: boolean;
    public skip: number;
    public limit: number;
    public forGraph: boolean;
    public key: string;
    public brandIds: Array<number> = new Array();
    public basketTypes: Array<number> = new Array();
    public stateWise: boolean;
    public state: number;
    public topFive: boolean;
    public serviceId: number
    public serviceType: number
    public pocState: number;
    //public pageSize: number = 50;

    // public daysInterval: number;

    public static DAYS_INTERVAL_TYPE_PER_DAY = 1;
    public static DAYS_INTERVAL_TYPE_PER_WEEK = 2;
    public static DAYS_INTERVAL_TYPE_PER_MONTH = 3;
}
export enum PaymentModeTypeEnum {
    DAYS_INTERVAL_TYPE_PER_DAY = 1,
    DAYS_INTERVAL_TYPE_PER_WEEK = 2,
    DAYS_INTERVAL_TYPE_PER_MONTH = 3,
}

