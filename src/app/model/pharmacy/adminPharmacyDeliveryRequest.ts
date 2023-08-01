export class AdminPharmacyDeliveryRequest {
    public orderId: string;
    public mobile: string;
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
}