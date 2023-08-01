import { Employee } from './employee';
import { IdName } from './idName';
import { FavouritePartners } from './favouritePartners';
import { HSMargin } from '../poc/margin';
import { DoctorServiceDetail } from './doctorServiceDetail';
import { DoctorScheduleDetails } from './doctorscheduledetails';
import { PocAdviseData } from '../poc/poc-advise-data';


export class DoctorDetails extends Employee {
    public static override serialVersionUID: number = -1976642955467237994;
    public qualificationId: number;
    public qualificationName: string;
    public experience: number;
    public registrationNumber: string;
    public languages: Array<IdName> = new Array();
    public medicationTypeId: number;
    public serviceId: number;
    public serviceName: string;
    public serviceList: Array<DoctorServiceDetail> = new Array();
    public scheduleList: Array<DoctorScheduleDetails> = new Array();
    public empPersonalPocInfo: PocAdviseData;
    public pocIdList: Array<number> = new Array();
    public brandIdList: Array<number> = new Array();
    public digitalPrescriptionUser: boolean = false;
    public overridePdfHeader: boolean = false;
    public doctorStatus: number;
    public partners: Array<FavouritePartners>;
    public liveNowFee: number;
    public defaultMargin: HSMargin = new HSMargin;
    public imageUrlList: Array<String>;
    public reviewList: Array<any> = new Array();
    public ratingbar: String;
    public invitedDoctorForChat: number;
    public invitedFriendChatType: number;

    public digitizationQueueEnabled: boolean;
    public sendDigitizedPrescriptionOnly: boolean;
    public employeeBlacklisted: boolean;

    public nextAvailableSlotDate: number;

    // //Local use
    public isSelected: boolean = false;
    public addedByReferralDoctor: boolean = false;
    public doctorCenterName: String;

}