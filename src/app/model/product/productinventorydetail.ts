import { ProductDetails } from './productdetails';
import { Taxes } from '../basket/taxes';

export class ProductInventoryDetail extends ProductDetails {

    public freeProductCount: number;
    public override purchaseRate: number;
    public override marginPercentage: number;
    public supplierTaxes: Taxes;
}