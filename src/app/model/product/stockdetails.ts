import { Taxes } from '../basket/taxes';
import { PocAdviseData } from '../poc/poc-advise-data';
import { PackingInformation } from './packinginformation';

export class StockDetails {
    public skuId: string;
    public barCode: string;

    public manufactureDate: number;
    public expiryDate: any;
    public batchNo: string;
    public rackNo: string;

    public purchasedQuantity: number;
    public totalAvailableQuantity: number;
    public totalSoldCount: number;

    public pocId: number;
    public supplierDetails: PocAdviseData;

    public grossPrice: number;
    public taxes: Taxes = new Taxes();
    public netPrice: number;
    public packageNetPrice: number;
    public unitNetPrice: number;
    public discountPrice: number;

    public packingInformation: PackingInformation;
}