import { Schedules } from './schedules';
import { PocDetail } from "../../model/poc/pocDetails";

export class DashboardItem {
    public pocDetail: PocDetail;
    public serviceTypeList: Array<number>;
    public schedules: Array<Schedules>;
}
