
export class BasketDiscount {
    public id: number;
    public type: number;
    public name: string;
    public discountAmount: number;
    public percent: number;
    public validFrom: number;
    public validTo: number;
    public profileId: number;
    public valueDiscount: boolean;
    public cashbackAmount: number;
}
