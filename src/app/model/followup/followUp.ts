
import { FollowUpDiscount } from './followupdiscount';

export class FollowUp {
    public followupDiscountList: Array<FollowUpDiscount> = new Array();
    public applicableToAll: boolean;
    public editableByAll: boolean;
}