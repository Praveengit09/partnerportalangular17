import { IdValue } from './idValue';
export class PhrAnswer{
    public profileId:number;
    public phrAns:Array<IdValue> = new Array();
    public phrType:number;
    public phrVersion:string

    //updateBy Id 
    public userId:number;
    public updatedTime:number;

    public static PHR_TYPE_WALKIN = 104;
    public static PHR_TYPE_VIDEO = 100;
    public static PHR_TYPE_ONBOARDING = 105;
}