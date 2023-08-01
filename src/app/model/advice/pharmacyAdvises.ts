import { SubTypeAdvise } from '../reception/subTypeAdvise';
import { Pharmacy } from '../pharmacy/pharmacy';
import { AdviceFollowup } from './adviceFollowUp';

export class PharmacyAdvises extends SubTypeAdvise {
 
    public pharmacyAdviceList: Array<Pharmacy>=new Array();
    public days:AdviceFollowup[]=new Array();


}