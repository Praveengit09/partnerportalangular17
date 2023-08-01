import { PocAdviseData } from '../poc/poc-advise-data';
import { DoctorDetails } from '../employee/doctordetails';
import { ProductDeliveryTrack } from '../product/productdeliverytrack';

export class AdminPharmacyDeliveryResponse extends ProductDeliveryTrack {

    public static DOCTOR_ADVICE: number = 1;
    public static SBR_ADVICE: number = 2;
    public static PRESCRIPTION_ADVICE: number = 3;
    public static MCOMMERCE: number = 4;

    public orderType: number;
    public reportId: number;

    public pocDetails: PocAdviseData;
    public doctorDetail: DoctorDetails;
    public override orderRequest: number;
    public override employeeAccepted: any;

    //local use
    public orderPrice: number;

}
