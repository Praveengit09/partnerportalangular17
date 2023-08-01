import { DiagnosticsAdviseTrack } from "./../../model/diagnostics/diagnosticsAdviseTrack";
import { DiagnosticOrderHistory } from "./diagnosticOrderHistory";

export class DiagnosticDeliveryAdviceTrack extends DiagnosticsAdviseTrack {

    //sampleCollectionStatus
    public static NA: number = 0;//
    public static COLLECTSAMPLE: number = DiagnosticDeliveryAdviceTrack.NA + 1;//1
    public static COLLECTED: number = DiagnosticDeliveryAdviceTrack.COLLECTSAMPLE + 1;//2
    public static MODIFIED: number = DiagnosticDeliveryAdviceTrack.COLLECTED + 1;//3
    public static REJECTED: number = DiagnosticDeliveryAdviceTrack.MODIFIED + 1;//4
    public static COLLECTION_PENDING: number = DiagnosticDeliveryAdviceTrack.REJECTED + 1;//5
    public static UPDATE_SAMPLE: number = DiagnosticDeliveryAdviceTrack.COLLECTION_PENDING + 1;//6
    public static ACCEPTED: number = DiagnosticDeliveryAdviceTrack.UPDATE_SAMPLE + 1;//7
    public static NOT_ACCEPTED: number = DiagnosticDeliveryAdviceTrack.ACCEPTED + 1;//8
    public static DELIVERED: number = DiagnosticDeliveryAdviceTrack.NOT_ACCEPTED + 1;//9
    public static PHLEBO_REACHED: number = DiagnosticDeliveryAdviceTrack.DELIVERED + 1;//10
    public static STARTED: number = DiagnosticDeliveryAdviceTrack.PHLEBO_REACHED + 1;//11
    public static SPOTBOOKING: any[] = [{ "label": "6:00 - 7:00", "timeValue": 1800000 }, { "label": "7:00 - 8:00", "timeValue": 5400000 }, { "label": "8:00 - 9:00", "timeValue": 9000000 }, { "label": "9:00 - 10:00", "timeValue": 12600000 }, { "label": "10:00 - 11:00", "timeValue": 16200000 }, { "label": "11:00 - 12:00", "timeValue": 19800000 }, { "label": "12:00 - 13:00", "timeValue": 23400000 }, { "label": "13:00 - 14:00", "timeValue": 27000000 }, { "label": "14:00 - 15:00", "timeValue": 30600000 }, { "label": "15:00 - 16:00", "timeValue": 34200000 }, { "label": "16:00 - 17:00", "timeValue": 37800000 }, { "label": "17:00 - 18:00", "timeValue": 41400000 }, { "label": "18:00 - 19:00", "timeValue": 45000000 }, { "label": "19:00 - 20:00", "timeValue": 48600000 }, { "label": "20:00 - 21:00", "timeValue": 52200000 }, { "label": "21:00 - 22:00", "timeValue": 55800000 }];

    //local
    public static PHLEBO_RAISED_CANCELREQ = 14;
    public static PHLEBO_CASH_COLLECTED = 29;
    public static PHLEBO_DLEIVERY_ACCEPTED = 15;

    public sampleCollectionStatus: number;
    public pickupDate: number;
    public pickupTime: number;
    public override empId: number;
    public empFirstName: string;
    public empLastName: string;
    public remarks: string;
    public orderDate: number;
    public cashCollectedStatus: boolean;
    public vendorPocId: number;
    public vendorPocName: string;
    public rescheduledOrder: boolean;
    public rescheduleStatus: number;
    public checkStatus: boolean;
    public phleboOrderCancelRequest: PhleboOrderCancelRequest;
    public orderStatus: number;
    public transactionHistory: Array<DiagnosticOrderHistory>;
    public consumablesInventoryDetails: any;
    public actionPerformed: number;
    public privilegeCardType: number;
    public clientName: string;
    public creditUser: number;
    public postPrandialSplitting: boolean;
    public orderRemarks: string;
    public discountRemarks: string;

    //local use
    public isAdminHomeOrder: boolean;
    public convertedDocumentUrlList: Array<String>;
    public rowStyle: any;
    public lisMessage: string;
    public slotDurationLable:string
    public slotTime: number;
    public slotDate :number;
    public yodaDeliveryAccepted: number = 0;
    public patientinfo: string = "";
    public phleboDeliveryAccepted : boolean = false;
}

class PhleboOrderCancelRequest {
    public comments: string;
}
