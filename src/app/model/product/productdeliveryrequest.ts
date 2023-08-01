export class ProductDeliveryRequest {
    public orderId: string;
    public invoiceId: string;
    public mobile: string;
    public email: string = "";
    public isExcel: boolean = false;
    public toEmail: string = "";
    public emailReportId: number;
    public empId: number;
    public pocId: number;
    public state: number;
    public city: number;
    public area: number;
    public pinCode: string;
    public pageSize: number = 50;
    public fromIndex: number;
    public returnRequest: boolean;

    public centralRequest: boolean;
    public centralHomeOders: boolean;
    public toDate: number;
    public fromDate: number;
    public searchTerm: string;
    public bookingSource: number;
    public invoiceCompletionStatus: number;
    public sampleCollectionStatus: number;
    public paymentPendingRequest: boolean;
    public cancelledOrderRequest: boolean;
    public rescheduled: boolean;

    public orderRequest: number;
    public limit: number;
    public skip: number;
    public pocIdList: Array<number>;

}