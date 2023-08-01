import { Address } from '../poc/address';

export class SupplierDetails{

	public pocId: number;
	public pocName: string;
	public address: Address =new Address();
	public email: string;
	public contactList: string[] =new Array<string>();
	public brandId: number;

}