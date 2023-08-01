import { OnboardTests } from "./onboardTests";
export class OnboardingTypeResponse{
    public profileId:number;
    public pocId:number;
    public type:string;
    public name:string;
    public pocName:string;
    public amount:number;
    public tests:Array<OnboardTests>;
}