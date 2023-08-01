import { BasePrice } from './basePrice';
import { InvestigationDayPriceDetails } from './investigationDayPriceDetails';

export class InvestigationPrice extends BasePrice{
    public dayBasedPricing: Array<InvestigationDayPriceDetails> = new Array<InvestigationDayPriceDetails>();
}