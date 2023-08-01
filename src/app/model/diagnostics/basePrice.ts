import { Taxes } from '../basket/taxes';

export class BasePrice {
    public grossPrice: number;
    public discountPrice: number;
    public taxes: Taxes;
    public netPrice: number;
}