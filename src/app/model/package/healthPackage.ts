import { Consultation } from "./consultation";
import { Investigation } from "./investigation";
import { InvestigationDiscount } from "./invetigationDiscount";
import { PharmacyDiscount } from "./pharmacyDiscount";
import { WellnessDiscount } from "./wellnessDiscount";
import { DoctorDetails } from "./../../model/employee/doctordetails";
import { PackageDisplayDescription } from "./packageDisplayDescription";
import { ServiceDetail } from "./../../model/employee/servicedetail";
import { DoctorChatService } from "./doctorChatService";
import { NewPackageDisplayDescription } from "./newPackageDisplayDescription";
import { DisplayDetails } from "./displayDetails";
import { PackageBenefitList } from "./packageBenefitList";
import { BasePackageBenefitDetails } from './basePackageBenefitDetails';

export class HealthPackage {

    public packageId: number;
    public name: string;
    public description: string;
    public packageType: number;
    public packageSubType: number;
    public maxProfiles: number;
    // public consultations: Array<Consultation>;
    public totalFreeConsultationsCount: number;
    public totalConsultationDiscountsCount: number;
    public totalConsultationsCount: number;
    // public investigations: Array<Investigation>;
    // public investigationDiscount: Array<InvestigationDiscount>;
    // public pharmacyDiscount: PharmacyDiscount;
    // public wellnessDiscount: WellnessDiscount;
    public personalDoctor: DoctorDetails;
    public doctorChatService: DoctorChatService
    public validityDays: number;
    public packageSoldFrom: number;
    public packageSoldTo: number;
    public actualPrice: number;
    public finalPrice: number;
    public discountPrice: number;
    public emiPrice: number;
    public emiMonths: number;
    public thumbnailImageUrl: string;
    public bannerImageUrl: string;
    public detailsImageUrl: string;
    public portalBannerUrl: string;
    public portalThumbnailUrl: string;
    public portalDetailsUrl: string;
    public doctorIdList: Array<number>;
    public serviceLine: string;
    public serviceType: Array<ServiceDetail>;
    public freeConsultationsList: Array<BasePackageBenefitDetails>;
    public walletDiscountsList: Array<BasePackageBenefitDetails>;
    public discountsList: Array<BasePackageBenefitDetails>;
    // public packageDisplayDescription: PackageDisplayDescription;
    public packageDisplayDescription: Array<NewPackageDisplayDescription>;
    public isRecommendedPackage: boolean;
    public displayDetails: Array<DisplayDetails>;
    public personalDoctorType: number;
    public packageBenefitList: Array<PackageBenefitList>;
    public benefitList: Array<PackageBenefitList>;


}
