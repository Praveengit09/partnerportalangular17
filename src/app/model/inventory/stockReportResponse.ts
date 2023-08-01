import { StockDetails } from './../product/stockdetails';
import { SupplierDetails } from '../inventory/supplierDetails';
import { PackingInformation } from '../product/packinginformation';

export class StockOrder {
	public genericMedicineName: string;
	public productName: string;
	public batchNo: string;
	public productId: number;
	public totalAvailableQuantity: number;
	public requiredQuantity: number;
	public expiryDate: number;
	public drugForm: string;

	public isEditText: boolean;
	public isChecked: boolean;
	public arraySize: number;
	/** local var */
	public isErrorFound: boolean = false;
	public isErrorMsg = new Array<string>();
	public netPrice: number;
	public packageNetPrice: number;
	public packingInformation: PackingInformation;
	public stockDetails: StockDetails = new StockDetails();

	public supplierDetails: SupplierDetails = new SupplierDetails();
}