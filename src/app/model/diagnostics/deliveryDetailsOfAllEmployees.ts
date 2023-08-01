import { DiagnosticDeliveryAdviceTrack } from './diagnosticListForAdmin';
import { Address } from './../profile/address';
export class DeliveryDetailsOfAllEmployees {
    public empId: number;
    public firstName: string;
    public lastName: string;
    public totalSampleDelivered: number;
    public noOfTubesAvailable: number;
    public totalSampleToBeDelievered: number;
    public totalSampleToBeCollected: number;
    public pocName: string;
    public pocId: number;
    public cashCollected: number;
    public noOfOrderAcceptedByThisEmployee: number;
    public noOfOrderCollectedByThisEmployee: number;
    public contactList: Array<String>;
    public addressList: Array<Address>;
    public employeeAcceptedName: string;
    public phleboAcceptedOrders: Array<DiagnosticDeliveryAdviceTrack>;
    public date : number;
    public cashCollectedStatus: boolean;

    //local
    // public totalDeliveriesPending: number;
}