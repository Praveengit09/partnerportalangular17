import { Address } from '../poc/address';

export class BasePocDetails {
    public pocId: number;
    public pocName: string;
    // public PocType pocType;
    public address: Address = new Address();
    public email: string;
    public contactList: Array<String>;
    // public transient boolean isPharmacy;
}