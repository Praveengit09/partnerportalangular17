import { DeliveryCharges } from './deliverycharges';

export class PocCollectionCharges {

    public static DIAGNOSTICS = 0;
    public static PHRAMACY = PocCollectionCharges.DIAGNOSTICS + 1;
    public static PRODUCT = PocCollectionCharges.PHRAMACY + 1;

    public pocId: number;
    public brandId: number;
    public type: number;
    public deliveryCharges: Array<DeliveryCharges>;
    public brandSpecific: boolean;
    public cityId: number;

    //local
    public isIncludeDistance: boolean;
}