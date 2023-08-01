import { PartnerIncentives } from './partnerIncentives ';
import { Ranges } from './ranges';
export class HSMargin {
	public brandId: number;
	public defaultMargin: number;
	public homeConsultationMargin: number;
	public walkinConsultationMargin: number;
	public videoConsultationMargin: number;
	public videoLaterConsultationMargin: number;
	public digiConsultationMargin: number;
	public digiBookingMargin: number;
	public homePharmacyMargin: number;
	public walkinPharmacyMargin: number;
	//public diagnosticsMargin: number;
	public homeCollectionInvestigationMargin: number;
	public walkinInvestigationMargin: number;
	public immunizationMargin: number;
	public welnessMargin: number;
	public packageMargin: number;
	public onboardingMargin: number;
	public onboardingPackageMargin: number;
	public otherReferralMargin: number;
	public otherMargin: number;
	public procedureMargin: number;

	public appInstallationIncentiveMargin: number;
	public homeCollectionInvestigationIncentiveMargin: number;

	public doctorBookingMargin: number;
	public investigationBookingMargin: number;
	public pharmacyBookingMargin: number;
	public homeProductMargin: number;
	public walkinProductMargin: number;

	public defaultMarginFee: number;
	public homeConsultationMarginFee: number;
	public walkinConsultationMarginFee: number;
	public videoConsultationMarginFee: number;
	public videoLaterConsultationMarginFee: number;
	public digiConsultationMarginFee: number;
	public digiBookingMarginFee: number;
	public homePharmacyMarginFee: number;
	public walkinPharmacyMarginFee: number;
	//public diagnosticsMarginFee: number;
	public homeCollectionInvestigationMarginFee: number;
	public walkinInvestigationMarginFee: number
	public immunizationMarginFee: number;
	public welnessMarginFee: number;
	public packageMarginFee: number;
	public onboardingMarginFee: number;
	public onboardingPackageMarginFee: number;
	public otherReferralMarginFee: number;
	public otherMarginFee: number;
	public procedureMarginFee: number;
	public appInstallationIncentiveFee: number;

	public doctorBookingMarginFee: number;
	public investigationBookingMarginFee: number;
	public pharmacyBookingMarginFee: number;
	public homeProductMarginFee: number;
	public walkinProductMarginFee: number;

	public homeCollectionInvestigationIncentiveFee: number;
	public appInstallationPayoutDuration: number;
	public partnerIncentives: PartnerIncentives = new PartnerIncentives();

	// sell HS packages
	public hsPackageIncentiveMargin: number;
	public hsPackageIncentiveFee: number;

	public brandPocId:number;
}