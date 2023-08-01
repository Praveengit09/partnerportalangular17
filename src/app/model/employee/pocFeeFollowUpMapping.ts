import { FollowUpDiscount } from '../followup/followupdiscount';
import { ServiceDetail } from './servicedetail';
import { HSMargin } from '../poc/margin';
import { DoctorServiceDetail } from './doctorServiceDetail';


export class PocFeeFollowUpMapping {
        public pocId: number;
        //public serviceList: Array<ServiceDetail>;
        public followupDiscountList: Array<FollowUpDiscount> = new Array();
        public doctorPhysicallyAvailable: boolean;
        public doctorFollowupDiscountEditable: boolean;
        public originalPrice:number;
	public doctorDigiAvailable:boolean;
	public doctorVideoLaterAvailable:boolean;
	public homeConsultationAvailable:boolean;

	public serviceList: Array<DoctorServiceDetail> = new Array();

	public margin:HSMargin = new HSMargin;
}