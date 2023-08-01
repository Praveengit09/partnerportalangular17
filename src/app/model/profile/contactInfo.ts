import { Address } from './address';

export class ContactInfo {
    public mobile: string;
    public email: string;
    public addresses: Array<Address> = new Array();
    public alternateMobile: string;
}