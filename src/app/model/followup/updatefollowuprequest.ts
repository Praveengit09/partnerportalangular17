import { Doctor } from '../../model/employee/doctor';
import { FollowUpDiscount } from './followupdiscount';

export class UpdateFollowUpRequest extends Doctor{
    public pocId: number;
    public applicableToAll:boolean;
    public editableByAll:boolean;
    public pocFollowUpDiscountList: FollowUpDiscount[]= new Array<FollowUpDiscount>();
    public doctorList : Doctor[] = new Array<Doctor>();
}