import { PharmacyAdvises } from './pharmacyAdvises';
import { InvestigationAdvises } from './investigationAdvises';
import { BaseDiagnosis } from './baseDiagnosis';
import { MedicalNote } from "../pharmacy/medicalNote";
export class DoctorPrescriptionTemplate {
    public id: number;
    public title: string;
    public diagnosisList: BaseDiagnosis[];
    public pharmacyAdvises: PharmacyAdvises;
    public investigationAdvises: InvestigationAdvises;
    public noteList: Array<MedicalNote>;
    public doctorNoteList: Array<MedicalNote>;
    public doctorId: number;
    public createdTimestamp: number;
    public updatedTimestamp: number;
}