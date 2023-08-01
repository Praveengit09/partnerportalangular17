import { TextAdvise } from '../advice/textAdvise';

export class FollowUpDiscount extends TextAdvise{
    public  discountPercent:number;
    public  validityDays : number;
    public  startDate:number;
    public  endDate:number;
}