import { ProfileVisitedDetails } from './profilevisitedDetails';
import { PocDetail } from '../poc/pocDetails';
import { SessionBean } from '../slotbooking/sesssionBean';
import { SlotDetail } from '../slotbooking/slotdetails';
import { Symptoms } from '../advice/symptoms';
import { BaseDiagnosis } from '../advice/baseDiagnosis';
import { PharmacyAdvises } from '../advice/pharmacyAdvises';
import { Immunization } from '../advice/immunization';
import { InvestigationAdvises } from '../advice/investigationAdvises';
import { ReferralDoctor } from '../advice/referralDoctor';
import { TextAdvise } from '../advice/textAdvise';
import { WellnessAdvise } from '../advice/wellnessAdvice';
import { FollowUpDiscount } from '../followup/followupdiscount';
import { MedicalNote } from '../pharmacy/medicalNote';
import { ServiceItem } from '../service/serviceItem';


export class PatientQueue extends SlotDetail {

    //Order data
    public order: number;
    public slotDate: number;
    //public slotTime: number;
    public exitTime: number;
    //public orderId: string;
    //public invoiceId: string;
    public override serviceId: number;
    public vitalStatus: number;
    public visitedTime: number;
    public doctorEngTime: number;
    public bookingType: number;
    public override bookingSubType: number;

    //Doctor data
    // public doctorId: number;
    // public doctorTitle: string;
    // public doctorFirstName: string;
    // public doctorLastName: string;

    //Patient data
    public override patientProfileId: number;
    // public patientAge: string;
    // public patientDOB: number;
    // public patientStatus: number;
    // public patientFirstName: string;
    // public patientLastName: string;
    // public patientGender: string;
    public override parentProfileId: number;
    public patientProfilePic: string;
    // public patientContactNumber: string;
    public visitDetails: ProfileVisitedDetails;
    public typeOfAppointment: number;
    // public sessionBean: SessionBean = new SessionBean();

    //public bookingInitiatedPocId: number;//For server use for Digi bookings
    public doctorPocDetails: PocDetail;
    public pocDetails: PocDetail;
    //to be deleted
    public localAppointmentTime: number;
    public localDOBYear: string;
    public waitingTime: number;
    public sessionBean: SessionBean;
    public advisePdfUrlWithHeader: string;
    public advisePdfUrlWithoutHeader: string;
    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;
    public consultationType: string;
    public tempWaitingTime: string;
    public appointmentToken: string;
    public patientType: string;
    public noOfVisits: string;
    public patientDetails: string;
    public consultationStatus: string;
    public bookingTypeParam: string;
    public convertedtime: any;
    public convertedWaitingTime: any;
    public formattedPatientDetails: any;

    //to show manager comments for digitizer
    public digitizationManagerComments: string;
    public prescriptionDigitizationStatus: number;

    //to display previously added data to digitizer after reject of digitized prescription
    public diagnosisList: Array<BaseDiagnosis> = new Array();
    public symptomList: Array<Symptoms> = new Array();
    public pharmacyAdvises: PharmacyAdvises = new PharmacyAdvises();
    public procedureList: Array<ServiceItem> = new Array();
    public wellnessAdvises: Array<WellnessAdvise> = new Array();
    public investigationAdvises: InvestigationAdvises = new InvestigationAdvises();
    public referralDoctorList: Array<ReferralDoctor> = new Array();
    public nonMedicationAdvises: Array<TextAdvise> = new Array();
    public immunizationAdvices: Array<Immunization> = new Array();
    public illnessSymptomList: Array<Symptoms> = new Array();
    public clinicalExaminationList: Array<Symptoms> = new Array();
    public followupAdvices: Array<FollowUpDiscount> = new Array();
    public noteList: Array<MedicalNote> = new Array();
    public doctorNoteList: Array<MedicalNote> = new Array();
    public uploadedFileList: Array<string> = new Array();
    public uploadedClinicalExaminationFileList: Array<string> = new Array();
}  