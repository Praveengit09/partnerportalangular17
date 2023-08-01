import { BaseMedicalAdvises } from './basemedicalAdvises';

export class InvestigationReportInformation {
    public diagnosisId: number;
    public fileName: string;
    public diagnosisFileData: string;
    public fileUrl: string;
    public relatedTestList: Array<BaseMedicalAdvises>;
    public pdfUploadedTime: number;
}