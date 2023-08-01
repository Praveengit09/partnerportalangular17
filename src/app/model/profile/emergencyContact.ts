import { Address } from './address';
export class EmergencyContact {
    public name: string;
    public email: string;
    public mobile: string;
    public address: Address = new Address();
}