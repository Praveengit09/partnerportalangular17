import { Taxes } from '../basket/taxes';
import { Pharmacy } from './pharmacy';
export class PharmacyInventoryDetail extends Pharmacy {
    public freeProductCount: number;
    public override purchaseRate: number;
    public override marginPercentage: number;
    public supplierTaxes: Taxes;


    public isEditText: boolean;
    public isChecked: boolean;
    public marketedBy: string;
}   