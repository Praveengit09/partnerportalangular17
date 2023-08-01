 
import {HSMargin} from "./margin";
 

export class HSAgreement {

    public static PARTICIPATION_NO = 0;
    public static PARTICIPATION_YES = HSAgreement.PARTICIPATION_NO + 1;
    public consultationFee: number;
    public subscriptionFee: number;
    public hsMargin: number;
    public participation: number = HSAgreement.PARTICIPATION_NO;
    public margin: HSMargin = new HSMargin();
    public appUserMargin: HSMargin = new HSMargin();
    public packageIdList: Array<any> = new Array();
    public digiMargin:number;
    public hsPackageMargin:number;

}

