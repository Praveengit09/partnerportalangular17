import { PharmacyInventoryDetail } from './../../model/pharmacy/pharmacyProductsDetailsList';
import { SupplierDetails } from './supplierDetails';
import { ProductInventoryDetail } from '../product/productinventorydetail';

export class InventorySupplierDetail {

	public supplierInvoicNo: string;
	public invoiceDate: number;
	public type: number;
	public entryNo: string;
	public entryDate: number;
	public pharmacyInventoryDetails: Array<PharmacyInventoryDetail>;
	public productInventoryDetails: Array<ProductInventoryDetail>;
	public discountPercentage: number;
	public exciseDuty: number;
	public additionalDiscount: number;
	public crNote: string;
	public adTax: number;
	public cst: number;
	public schDiscount: number;
	public otherAmount: number;
	public drNote: string;
	public zeroPercValue: number;
	public netAmount: number;
	public timeStamp: number;

	public supplierDetails: SupplierDetails = new SupplierDetails();

	public empId: number;
}
