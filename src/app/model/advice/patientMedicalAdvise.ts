import { MedicalNote } from './../pharmacy/medicalNote';
import { ServiceItem } from '../service/serviceItem';
import { FollowUpDiscount } from '../followup/followupdiscount';
import { VitalDetail } from '../phr/vitalDetail';
import { Symptoms } from './symptoms';
import { Immunization } from './immunization';
import { ReferralDoctor } from './referralDoctor';
import { InvestigationAdvises } from './investigationAdvises';
import { PharmacyAdvises } from './pharmacyAdvises';
import { WellnessAdvise } from './wellnessAdvice';
import { TextAdvise } from './textAdvise';
import { BaseDiagnosis } from './baseDiagnosis';
import { Ophthalmology } from './ophthalmology/ophthalmology';
import { AdmissionNote } from './admissioNote';


export class PatientMedicalAdvise {

    public static DIGITIZATION_STATUS_INIT = 0;
    public static DIGITIZATION_STATUS_COMPLETED = 1;
    public static DIGITIZATION_STATUS_SKIP = 2;
    public static DIGITIZATION_STATUS_ASSGINED_TO_DIGITIIZER = 3;
    public static DIGITIZATION_STATUS_SENT_FOR_APPROVAL = 4;
    public static DIGITIZATION_STATUS_REJECTED = 5;

    //public long doctorPocId;
    public adviceId: number;
    public orderId: string;
    public bookingType: number;
    public bookingSubType: number;
    public invoiceId: string;
    public templateId: number;
    public referredprescriptionId: number;
    public pocId: number;  //doctorPocId
    public serviceId: number;
    public time: number;
    public date: number;
    public adviseGeneratedTime: number;

    public vitalStatus: number;

    public patientId: number;
    public patientFirstName: string;
    public patientTitle: string;
    public patientLastName: string;
    public patientDOB: number;
    public patientGender: string;
    public patientProfilePic: string;
    public patientContactNumber: string;
    public parentProfileId: number;

    public doctorId: number;
    public doctorTitle: string;
    public doctorFirstName: string;
    public doctorLastName: string;
    public doctorProfilePic: String;
    public prescriptionSource: number = 3;

    public vitalDetail: VitalDetail;
    public diagnosisList: Array<BaseDiagnosis> = new Array();
    public symptomList: Array<Symptoms> = new Array();
    public pharmacyAdvises: PharmacyAdvises = new PharmacyAdvises();
    public procedureList: Array<ServiceItem> = new Array();
    public wellnessAdvises: Array<WellnessAdvise> = new Array();
    public admissionNote: AdmissionNote = new AdmissionNote();
    public investigationAdvises: InvestigationAdvises = new InvestigationAdvises();
    public referralDoctorList: Array<ReferralDoctor> = new Array();
    public nonMedicationAdvises: Array<TextAdvise> = new Array();
    public immunizationAdvices: Array<Immunization> = new Array();
    public illnessSymptomList: Array<Symptoms> = new Array();
    public clinicalExaminationList: Array<Symptoms> = new Array();
    public followupAdvices: Array<FollowUpDiscount> = new Array();
    public noteList: Array<MedicalNote> = new Array();
    public doctorNoteList: Array<MedicalNote> = new Array();
    public ophthalmology: Ophthalmology = new Ophthalmology();

    public uploadedClinicalExaminationFileList: Array<string> = new Array();

    public uploadedFileList: Array<string> = new Array();
    public uploadedPrescription: boolean;
    public prescriptionDigitizationStatus: number;
    public digitizationEmpId: number;
    public digitizationManagerComments: string;
    public digitizationPocId: number;
    public approvedDigitizeMangerEmpId: number;


    public scannedAdvisePdfUrlWithHeader: string;
    public scannedAdvisePdfUrlWithoutHeader: string;

    public advisePdfUrlWithHeader: string;
    public advisePdfUrlWithoutHeader: string;
    public bookingSource: number;

    //local use
    public finalDiagnosisCount: number = 0;
    public nonFinalDiagnosisCount: number = 0;
    public localDOBYear: string;

    public caseSheet: boolean;
    public caseSheetUrlWithHeader: string;
    public caseSheetUrlWithoutHeader: string;

    public annotatedImageUrl: string;

}