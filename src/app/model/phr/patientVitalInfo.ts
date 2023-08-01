import { UpdatedByEmpInfo } from './../../model/employee/updatedByEmpInfo'
import { VitalDetail } from './../../model/phr/vitalDetail'

export class PatientVitalInfo {

    public static VITAL_NOT_COMPLETED = 0;
    public static VITAL_COMPLETED = PatientVitalInfo.VITAL_NOT_COMPLETED + 1;

    public timeStamp: number;
    public updatedBy: UpdatedByEmpInfo;
    public parentProfileId: number;
    public patientProfileId: number;
    public patientTitle: string;
    public patientFirstName: string;
    public patientLastName: string;
    public date: number;
    public pocId: number;
    public serviceId: number;
    public orderId: any;
    public invoiceId: string;
    public time: number;
    public doctorId: number;
    public vitalStatus: number;
    public vitalDetail: VitalDetail;
    public patientProfilePic: any;
    public patientAge: number;
    public patientDOB: number;
    public doctorTitle: any;
    public doctorLastName: any;
    public patientGender: any;
    public doctorFirstName: any;
    public bookingType: number;
    public bookingSubType: number;
    public digiQueue: boolean;
}
