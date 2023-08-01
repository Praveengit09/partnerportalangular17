import { DateSummery } from './dateSummery';
export class SlotsResponse{
      public pocId:number;
    public pocName:string;
    public doctorId:number;
    public doctorFirstName:string;
    public doctorLastName:string;
    public dateSummery:DateSummery[] = new Array<DateSummery>();
}