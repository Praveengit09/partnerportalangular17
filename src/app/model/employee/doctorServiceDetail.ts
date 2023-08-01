import{ServiceDetail } from '../employee/servicedetail';
import { ServiceItem } from '../service/serviceItem';


export class DoctorServiceDetail extends ServiceItem{
    public override walkinConsultationFee: number;
	public override digiConsultationFee: number;
	public videoNowConsultationFee: number;
	public videoLaterConsultationFee: number;
	public override homeConsultationFee: number;
}