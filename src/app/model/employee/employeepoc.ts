import { CDSSOptions } from './../poc/cdss';
import { POCType } from './../../model/poc/poctype';

export class EmployeePOC {
    public pocId: number;
    public pocName: string;
    public pocType: POCType;
    public serviceTypeMap: any;
    public roleIdList: Array<number>;
    public pdfHeaderType: number;
    public brandId: number;
    public scanAndUploadPrescriptions:boolean;
    public cdssOptions:CDSSOptions;
    //temporary variable
    public roleIdName:Array<string>;
    public registrationCount:number=0;
    public onboardingCount:number=0;
    public appUserCount:number=0;

}
