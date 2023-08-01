import { Symptoms } from "./symptoms";

export class GetCDSSClinicalAndDiagnosisListRequest {
    public  symptomList: Array<Symptoms>=new Array();
    public  clinicalExaminationList: Array<Symptoms>=new Array();
    public  doctorId:number;
    public  pocBrandId:number;

    public  doctorSpecific:boolean;
    public  brandSpecific:boolean;
    public  brandDefaults:boolean;

}

