import { Taxes } from './../../model/basket/taxes';

export class BaseMedicalAdvises {
    public id: number;
    public name: string;
    public originalAmount: number;
    public packageDiscountAmount: number;
    public otherDiscountAmount: number;
    public taxationAmount: number;
    public finalAmount: number;
    public taxes: Taxes;
}