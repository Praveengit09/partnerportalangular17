import { Address } from '../../profile/address';
import { PocDetail } from '../../poc/pocDetails';
export class PurchaseDetails {
    public purchaseType: number;
    public address: Address;
    public pocDetail: PocDetail;
    public pharmacyAdviceList: Array<any>=new Array();
    public investigationList: Array<any> = new Array();
}