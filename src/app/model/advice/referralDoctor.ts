import { DoctorDetails } from '../employee/doctordetails';

export class ReferralDoctor {
    public serviceId: number;
    public serviceName: string;
    public pocId: number;
    public pocName: string;

    public categoryId: string;
    public categoryName: string;

    public doctorDetail: DoctorDetails;
    public showReferralDoctor: number;

    //local use
    public isSelected:boolean=false;

}