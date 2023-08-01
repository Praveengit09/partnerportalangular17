import { CentralOrdersAndPaidCount } from './centralordersandpaidcount';


export class TotalCentralOrdersAndPaidCount {
    public totalOrdersRaised : number;
    public totalOrdersPaid  : number;
    public  totalOrdersRevenue  : number;
    public  totalPaidRevenue  : number;
    public centralOrdersAndPaidCount: CentralOrdersAndPaidCount[] = new Array<CentralOrdersAndPaidCount>();
}