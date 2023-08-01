import { Taxes } from './../../model/basket/taxes';
import { BaseGenericMedicine } from './baseGenericMedicine'
import { ProductDetails } from '../product/productdetails';
import { MedicalNote } from './medicalNote';
export class BaseMedicineDetails extends ProductDetails {

	public genericMedicine: BaseGenericMedicine = new BaseGenericMedicine();

	public override productCode: string = '';

	public override drugFormId: number = 0;
	public override drugForm: string = '';

	public medicineStrength: String = '';
	public intakeRoute: String = '';

	public hsnCode: String = '';
	public system: String = '';
	public drugGroups: String = '';
	public notes: Array<MedicalNote>;
	public override purchaseEnabled: boolean = false;

	public doctorId: number = 0;
	public serviceId: number = 0;

}

