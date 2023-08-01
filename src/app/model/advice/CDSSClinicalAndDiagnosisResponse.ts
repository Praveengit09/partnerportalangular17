import { Diagnosis } from './diagnosis';
import { Symptoms } from './symptoms';

export class CDSSClinicalAndDiagnosisResponse {
    public clinicalExaminationMap:Map<number,Symptoms>=new Map<number,Symptoms>();
    public diagnosisMap:Map<number, Diagnosis>=new Map<number, Diagnosis>();
}


