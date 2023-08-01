import { CountDiscount } from "./countDiscount";
import { ValueDiscount } from "./valueDiscount";
import { OtherDiscount } from "./otherDiscount";
import { FreeTreatmentInstance } from "./freeTreatmentInstancesList";
import { ValueTreatmentInstance } from "./valueTreatmentInstancesList";
import { DiscountTreatmentInstance } from "./discountTreatmentInstancesList";
export class PackageBenefitList{
public serviceTypeId:number;
public serviceTypeName:string;
public typeName:string;
public serviceList:Array<number>;
public subServiceList:Array<number>;
public serviceName:string;
public countDiscount:CountDiscount;
public valueDiscount:ValueDiscount;
public otherDiscount:OtherDiscount;
public totalFreeTreatmentCount:number;
public totalCompletedTreatmentCount:number;
public totalValueTreatmentLimit:number;
public totalUsedValueTreatmentLimit:number;
public freeTreatmentInstancesList:Array<FreeTreatmentInstance> ;
public valueTreatmentInstancesList:Array<ValueTreatmentInstance>;
public discountTreatmentInstancesList:Array<DiscountTreatmentInstance>;
public totalAmountUsed:number;
public discountType:number;
}