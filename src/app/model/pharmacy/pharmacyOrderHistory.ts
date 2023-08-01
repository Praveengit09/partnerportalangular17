import { Pharmacy } from "./pharmacy";

export class PharmacyOrderHistory {
    public orderId: string = '';
    public billNo: string = '';
    public updatedTimestamp: number;
    public actionPerformed: number;
    public pharmacyList: Array<Pharmacy>;
    public empId: number;
    public empName: string = '';
    public paymentStatus: number;
    public remarks: string = '';

    //local
    public label: string = '';

}