import { DoctorDetails } from './../../model/employee/doctordetails';
import { Qualification } from './../../model/employee/qualification';
import { Role } from './../../model/employee/role';
import { ServiceDetail } from './../../model/employee/servicedetail';
import { BaseResponse } from './../../model/base/baseresponse';

export class DoctorLoginResponse extends BaseResponse {
    public doctor: DoctorDetails;
    public specialityList: Array<Qualification>;
    public qualificationList: Array<Qualification>;
    public roles: Array<Role>;
    public currentTime: number;
    public wellnessServiceList: Array<ServiceDetail>;
    public statesAndCities: any;
}
