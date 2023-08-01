import { SubTypeAdvise } from './subTypeAdvise';
import { PocDetail } from "../poc/pocDetails";

export class WellnessAdvise extends SubTypeAdvise {
    public message: string;
    public name: string;
    public pocDetails: PocDetail;
    public adviceList:WellnessAdvise[]=new Array();
    //local use
    public id: number;
}