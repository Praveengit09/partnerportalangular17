import { Option } from './symptomQuestionnaireItemResponse';

export class SymptomAdviceRequest {
    public profileId: string;
    public genderId: number = 1;
    public key: string;
    public symptomAnswers: Array<Option>;
    public exerciseAnswers: Array<Option>;
    public symptomId: number = 0;
    public medicationId: number = 0;
}