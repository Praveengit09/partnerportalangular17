import { PocDetail } from './../poc/pocDetails';
import { HSMargin } from "../../model/poc/margin";
//import {} from "../../model/employee/doctorparticipationdata";
import { DoctorParticipationData } from './doctorparticipationdata';
import { DoctorServiceDetail } from './doctorServiceDetail';

export class EmployeePocMapping {
    public pocId: number
    public pocName: string;
    public brandId: number;

    public roleIdList: Array<number> = new Array<number>();

    public participationSettings: DoctorParticipationData = new DoctorParticipationData();

    public serviceList: Array<DoctorServiceDetail> = new Array<DoctorServiceDetail>();
    public slotDateList: Array<number>;

    public margin: HSMargin = new HSMargin;

    //Local field
    public roleIdName: Array<string> = new Array<string>();
    public pocDetail: PocDetail;
}