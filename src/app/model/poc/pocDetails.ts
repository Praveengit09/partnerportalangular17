import { PocAdviseData } from "./poc-advise-data";
import { Employee } from "./../../model/employee/employee";
import { ServiceDetail } from "./../../model/employee/servicedetail";
import { HSAgreement } from "./hsAgreement";
import { CDSSOptions } from "./cdss";
import { FollowUp } from "../followup/followUp";


export class PocDetail extends PocAdviseData {

	public static POC_TYPE_GENERAL: number = 0;
	public static POC_TYPE_SUPPLIER: number = 8;
	public static POC_TYPE_NEARBY_HOSPITAL: number = 11;
	public static POC_TYPE_NEARBY_DIAGNOSTIC: number = 12;
	public static POC_TYPE_NEARBY_WELLNESS: number = 13;
	public static POC_TYPE_NEARBY_HOTEL: number = 14;
	public static POC_TYPE_NEARBY_CLINIC: number = 15;
	public static POC_TYPE_NEARBY_PHARMACY: number = 16;

	public licenseInfo: string;
	public GSTIN: string;
	public override pocId: number;
	public override pdfHeaderType: number;
	public agreement: HSAgreement = new HSAgreement();

	public serviceList: Array<ServiceDetail>;

	public locality: string;

	public fromDate: number;
	public toDate: number;

	public reviewCount: number;
	public reviewMap: any;
	public userReviewList: Array<any>;

	public digiStartTime: number;
	public digiEndTime: number;

	public followUp: FollowUp = new FollowUp();

	public scheduleList: Array<any> = new Array<any>();
	public updatedTime: number;
	public manager: Employee;
	public distance: number;
	public areaName: string;
	public description: string;

	public centralPoc: boolean;
	public pocType: number;
	public pharmacyHomeDeliveryAvailable: boolean;
	public diagnosticSampleCollectionAvailable: boolean;
	public payOnDeliveryAvailable: boolean;

	public scanAndUploadPrescriptions: boolean;

	public brandName: string;
	public brandChanged: boolean;
	public cdssOptions: CDSSOptions = new CDSSOptions();
	public pharmacyWalkinAvailable: boolean;
	public productWalkinAvailable: boolean;
	public productHomeDeliveryAvailable: boolean;
	public diagnosticWalkinAvailable: boolean;
	public specialDiagnosticPartner: boolean;
	public localDiagnosticPartner: boolean;
	public localPharmacyPartner: boolean;

	public creditLimit: number;
	public invoiceGenerationDays: number;

	public participateInTransferPricing: boolean;
	public disablePOC: boolean;
	public receptionistAvailable: boolean


	public referralPocId: number;
	public referralPocName: string;

	public displayDescriptionList: any;
	public tokenGenerationBookingTime: boolean;

	private discountText: string;

}
//For Local Use
export class ReferredPoc {
	referredPocId: number = 0;
	pocId: number = 0;
	pocName: string = '';
}
