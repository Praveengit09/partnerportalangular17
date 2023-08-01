import { BaseItem } from "../product/baseItem";
import { ServiceConstants } from "../common/serviceconstants";
import { InvestigationPrice } from '../diagnostics/investigationPrice';

export class ServiceDetail extends BaseItem {
  public serviceId: number;
  public serviceName: string;
  public subServiceList: Array<ServiceDetail>;
  public parentServiceId: number;
  public parentServiceName: string;
  public categoryId: number;
  public categoryName: string;
  public imageUrl: string;
  public precaution: string;

  public homeOrderPriceDetails: InvestigationPrice;
  public walkinOrderPriceDetails: InvestigationPrice;

  public packageSplitTest: boolean;

  //local use
  public serviceConstants: ServiceConstants = new ServiceConstants();
  public description: string;
  public serviceType: number;
  public serviceTypeName: string;
  public discountedPrice: number;
  public hasSchedule: boolean;
  public profileImageData: string;
  public override discountPrice: number;
  public originalPrice: number;
  public offerPrice : number;
  public hasPersonalSchedule: boolean;
  public reviewCount: number;
  public wellness_suggest: any;
  public reviewMap: any;
  public userReviewList: any;
  public isSelected:boolean=false;
  public walkinConsultationFee: number;
	public digiConsultationFee: number;
	public videoConsultationFee: number;
	public homeConsultationFee: number;
  public sampleId: string;
  public sampleCollectionDate: any;
  public srfTest: boolean;
  public paymentStatusPerTest: number = 0;
}
