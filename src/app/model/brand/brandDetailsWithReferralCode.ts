import { BaseResponse } from '../base/baseresponse';
import { BrandConfiguration } from './brandConfiguration';

export class BrandDetailsWithReferralCode extends BaseResponse {

    public brandId: number;
    public brandName: string;
    public brandImageData: string;
    public brandImageurl: string;
    public organisation: string;
    public referralCode: string;
    public validFrom: number;
    public validTo: number;
    public managerName: string;
    public mobileNumber: string;
    public emailId: string;
    public referralCreationDate: number
    public partnerPortalDisabled: boolean;
    public hasBrandApp: boolean;
}