import { ReferralDoctor } from '../advice/referralDoctor';
import { SymptomQuestionnaireItemResponse } from './symptomQuestionnaireItemResponse';


export class SymptomMedicationResponse {
    public serviceId: String;
    public serviceName: String;
    public referralDoctor: ReferralDoctor;
    public symptomId: number = 0;
    public symptomType: String;
    public medicationId: number = 0;
    public medicationType: String;
    public symptomQuestion: SymptomQuestionnaireItemResponse;
}