import { FollowUpDiscount } from "../../model/followup/followupdiscount";
import { CDSSOptions } from './CDSSOptions';

export class DoctorParticipationData {

    public doctorPhysicallyAvailable: boolean;
    public doctorVideoNowAvailable: boolean;
    public doctorDigiAvailable: boolean;
    public doctorVideoLaterAvailable: boolean;
    public homeConsultationAvailable: boolean;
    public participateInPackages: boolean;
    public doctorFollowupDiscountEditable: boolean;

    public followupDiscountList: Array<FollowUpDiscount>;
    public pdfHeaderType: number;
    public overridePdfHeader: boolean;
    public enableNotification: boolean;
    public scanAndUploadPrescriptions: boolean;
    public digitalPrescriptionAvailable: boolean;

    public canEditPackages: boolean;
    public packageIdList: Array<number>;
    public cdssOptions: CDSSOptions;

    // Local field
    public packageNameList: Array<any> = new Array();


    // public  participateDigi:boolean;
    // public  participateLive:boolean;
    // public  participateHSPackages:boolean;
    // public  participateHomeConsultation :boolean;
    // public  participateWalkin:boolean;
    // public  participatePharmacy:boolean;
    // public  participateWelness:boolean;
    // public  participateImmunization:boolean;
    // public  participateInvestigation:boolean;
    // public  participateDiagnostics:boolean;
}








