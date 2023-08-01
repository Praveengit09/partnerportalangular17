import {InventoryProductSearchResp} from './inventoryProductSearchResp';

export class PharmacyInventoryProductDetail extends InventoryProductSearchResp{
    public batchNo: String;
	public expiryDate: Number;
	public quantity: Number;
	public freeProductCount: Number;
	public schedule: String;
	public rackNumber: String;
	public purchaseRate: Number;
	public marginPercentage: Number;
	public vat: Number;
	public totalAmount: Number;
}