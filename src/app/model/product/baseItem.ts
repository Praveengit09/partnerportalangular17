import { Taxes } from '../basket/taxes';

export class BaseItem {
    public quantity: number;
    public grossPrice: number;
    public taxes: Taxes=new Taxes();
;
    public netPrice: number;
    public originalAmount: number;
    public packageDiscountAmount: number;
    public otherDiscountAmount: number;
    public taxationAmount: number;
    public totalTaxes: Taxes;
    public finalAmount: number;
    public discountPrice: number;
    public discountType: number;
    // pharmacy looseQuantity
    public looseQuantity: number;
}