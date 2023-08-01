import { BasePrice } from './basePrice';
import { InvestigationTimePriceDetails } from './investigationTimePriceDetails';

export class InvestigationDayPriceDetails extends BasePrice {
    public dayOfWeek: number;
    public timeBasedPricing: Array<InvestigationTimePriceDetails> = new Array<InvestigationTimePriceDetails>();
}