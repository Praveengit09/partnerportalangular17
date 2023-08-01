import { Config } from './../../base/config';
export class OrderListRequest {
    public orderId: string;
    public mobileNumber: string;
    public empId: number;
    public stateId: number;
    public cityId: number;
    public areaId: number;
    public pincode: string;
    public limit: number = 50;
    public skip: number;
    public pocId: number;
    public fromDate: number;
    public toDate: number;
    public brandId: number = Config.portal.appId;
}