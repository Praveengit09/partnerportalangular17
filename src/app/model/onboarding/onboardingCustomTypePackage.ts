import { OnboardTests } from "./onboardTests";
export class OnboardingCustomTypePackage{
    public profileId:number;
    public id:number;
    public pocId:number;
    public type:string;
    public name:string;
    public pocName:string;
    public amount:number;
    public tests:Array<OnboardTests>;
    public mobile:string;
    public modeOfPayment:string;
    public customTests:Array<OnboardTests>;
    public transactionId : string;
    public doctorId:number;
}