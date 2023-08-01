import { Duration } from '@fullcalendar/core';
import { Taxes } from '../basket/taxes';
import { Address } from '../poc/address';
import { DisplayDescription } from '../product/displaydescription';
import { PackingInformation } from '../product/packinginformation';
import { StockDetails } from '../product/stockdetails';
import { BaseGenericMedicine } from './baseGenericMedicine';
import { MedicalNote } from './medicalNote';
import { PrescriptionMedicineDetails } from './prescriptionMedicineDetails';

export class Pharmacy extends PrescriptionMedicineDetails {

	public pharmacyStockList: Array<Pharmacy>;

	public cityId: number = 0;
	public stateId: number = 0;
	public brandId: number = 0;
	public hsFavroite: boolean = false;

	// for local use
	public isMultiMedicineSelect: boolean = false;
	public batchNumberTemp: string = '';
	public override isSelected: boolean = false;
	public dosePerDay: number = 0;
	public isPriceChanged: boolean = false;

	public override isErrorFound: boolean = false;
	public override isErrorMsg = new Array();
	public isPriceEditable: boolean = false;
	// public doses: Array<Dose>;

	public override doseUnit: string;
	public override doseLabel: string;
	public override emergency: boolean;
	public override takenWhenFood: string;
	public override symptomKey: string;
	public override preference: string;

	public override addedByDoctor: boolean;
	public override doseUnitId: string;
	public override isSOS: boolean;
	public override purchaseEnabled: boolean = false;

	// public doses: Array<Dose>;
	public override genericMedicine: BaseGenericMedicine;
	public override drugFormId: number;
	public override drugForm: string;
	public override medicineStrength: string;
	public override intakeRoute: string;
	public override system: string;
	public override drugGroups: string;
	public override hsnCode: String;
	public override notes: Array<MedicalNote>;
	public override doctorId: number;
	public override serviceId: number;

	// public parentCategory:ProductParentCategory;

	public override productCode: string;


	public override pocId: number;
	public override brandName: string;
	public override manufacturerName: string;
	public override manufacturerAddress: Address;
	public override schedule: string;
	public override detailedDescriptionList: Array<DisplayDescription>;
	public override otherInformationList: Array<DisplayDescription>;
	public override packingInformation: PackingInformation;
	public override warrantyDetails: Array<DisplayDescription>;
	public override disclaimers: Array<DisplayDescription>;
	public override unitNetPrice: number;
	public override rating: number;
	public override adviceId: number;

	public override prescriptionStatus: number;
	public override proofDocumentUrlList: Array<String>;

	public override categoryId: number;
	public override categoryName: string;

	public override productId: number;

	public override productName: string;
	public override productDescription: string;
	public override attributesMap: Map<String, Object>;
	public override referenceId: string;
	public override totalRevenue: number;
	public override stockDetails: StockDetails;

	public override packageSoldLoose: boolean;
	public override looseQuantity: number;
	public override flag: boolean;

	public override rxDrug: boolean;

	public override grossPrice: number;

	public override discountPrice: number;
	public override taxes: Taxes;

	public override netPrice: number;


	public override quantity: number;
	public returnQuantity: number = 0;
	public returnPackageStatus: number = 1;
	public returnType: string;


	public override originalAmount: number;

	public override packageDiscountAmount: number;

	public override couponDiscountAmount: number;

	public override otherDiscountAmount: number;

	public override packageCashBackDiscountAmount: number;

	public override couponCashBackDiscountAmount: number;
	public override taxationAmount: number;
	public override totalTaxes: Taxes;
	public override finalAmount: number;

}