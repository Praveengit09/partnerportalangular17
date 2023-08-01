import { BaseResponse } from './../base/baseresponse';
import { CorporateDetails } from './corporatedetails';
import { ContactInfo } from './contactInfo';
import { EmergencyContact } from './emergencyContact';
import { ProfileDetails_others } from './profileDetails_others';
import { Labcertifiedpdf } from './../../model/phr/labcertifiedpdf';
import { Social } from './social'
import { UpdatedBy } from './updatedby';
export class ProfileDetailsVO extends BaseResponse {
	public age: string;
	public title: string;
	public contactInfo: ContactInfo = new ContactInfo();
	public emergencyContact: EmergencyContact = new EmergencyContact();
	public dob: number;
	public displayName: string;
	public fName: string;
	public gender: string;
	public imageData: string;
	public profilePic: string;
	public relationShip: number;
	public relationShipId: number;
	public healthScore: number;
	public referenceId: string;
	public height: Map<String, String> = new Map<String, String>();
	public profileId: number;
	public parentProfileId: number;
	public lName: string;
	public others: ProfileDetails_others = new ProfileDetails_others();
	public social: Social = new Social();
	public weight: Map<String, String> = new Map<String, String>();
	public createdTime: number = Date.now();
	public portal: boolean;
	public updateMobile: boolean;
	public updateEmail: boolean;
	public otpNumber: string;
	public orgCode: string;
	public alcholic: boolean;
	public profileCompletion: number;
	public healthscorepdf: string;
	public labcertifiedpdf: Array<Labcertifiedpdf>;
	public providedOnlyAge: boolean;
	public referralCode: string;
	public otpNotRequired: boolean;
	public brandId: number;
	public privilegeType: Array<number>;

	public corporateDetailsList: Array<CorporateDetails> = new Array<CorporateDetails>();
	public source: number;

	public updatedBy: UpdatedBy;
	public uhid: string;
	public proofDocumentUrlList: Array<string>;
    public onboardingStatus: number;
}
