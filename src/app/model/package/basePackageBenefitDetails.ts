import { Instance } from './instance';
import { Services } from './services';
// import { Services } from '@angular/core/src/view';


export class BasePackageBenefitDetails{
    public serviceTypeId:number;
	public subServiceTypeId:number;
	public serviceTypeName:string;
	public  serviceIdList:Array<number>;
	public subServiceIdList:Array<number>;
	public serviceList:Array<Services>;
	public instanceList:Array<Instance>;
	public  freeCount:number;
	public  usedFreeCount:number;
	public  daysLimit:number;
	public  walletAmount:number;
	public  usedWalletAmount:number;
	public  maxAmountLimit:number;
	public  noTimesLimit:number;
	public  discountPercent:number;
	public  utilizedAmout:number;
}