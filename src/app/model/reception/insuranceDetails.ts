import { Relationship } from "../profile/relationships";
export class InsuranceDetails {
    public fName: string
    public profileId: string;
    public parentProfileId: string;
    public payerName: string;
    public payerId: string;
    public planName: string;
    public planId: string;
    public relationToInsured: Relationship;
    public insuranceId: string;
    public insuranceType: InsuranceType;
    public groupId: string;
    public dateEffectiveFrom: number;
    public dateEffectiveTo: number;
    public copayType: CopayType;
    public copayAmount: DoubleRange;
    public frontUrl: string;
    public rearUrl: string;
}

export enum InsuranceType {
    Primary, Secondary, Tertiary, Others
}

export enum CopayType {
    Fixed, Percentage
}

