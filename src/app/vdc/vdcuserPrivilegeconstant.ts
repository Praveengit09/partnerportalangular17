import { ProfileDetailsVO } from "../model/profile/profileDetailsVO";

export class VDCUserPrivilegeResponse {

    // Special Test Price types
    public static PRIVILEDGE_CARD_TYPE = 1;
    public static SENIOR_CITIZON_CARD_TYPE = 2;
    public static CGSH_CARD_TYPE = 3;
    public static COMMUNITY_TYPE = 4;

    // VDC Card Status
    public static ACTIVE = 1;
    public static APPROVAL_PENDING = 2;
    public static REJECTED_APPROVAL = 3;
    public static PAYMENT_PENDING = 4;

    public parentProfileId: number;
    public patientProfileId: number;
    public validFrom: number;
    public validTo: number;
    public type: number;
    public status: number;
    public orderId: string;
    public invoiceId: string;
    public createdTimestamp: number;
    public updatedTimestamp: number;
    public profileIds: Array<number>;
    public patientProfileDetails: ProfileDetailsVO;
    public typeName: string;
    public statusName: string;
    public pdfImage: boolean;
    public lable: string;
    public empId:number;
    public remarks:string;

}
