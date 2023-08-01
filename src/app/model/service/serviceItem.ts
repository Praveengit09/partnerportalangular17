import { ServiceDetail } from '../employee/servicedetail';

export class ServiceItem extends ServiceDetail {

    public override packageSplitTest: boolean;
    //local use
    public override isSelected:boolean =false;

}