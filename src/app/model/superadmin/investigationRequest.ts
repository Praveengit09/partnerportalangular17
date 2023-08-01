import { InvestigationDayTime } from './investigationDayTime';
import { InvestigationDetails } from '../diagnostics/investigationDetails';
import { InvestigationPrecautionRequest } from './investigationPrecautionRequest';

export class InvestigationRequest {

    public static HOME_COLLECTION_SCHEDULE = 1;
    public static WALKIN_SCHEDULE = InvestigationRequest.HOME_COLLECTION_SCHEDULE + 1;

    public precautionList: Array<InvestigationPrecautionRequest> = new Array<InvestigationPrecautionRequest>();
    public scheduleList: Array<InvestigationDayTime> = new Array<InvestigationDayTime>();
    public pocId: number;
    public fromDate: number;
    public toDate: number;
    // public precaution: string;
    public serviceList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    public scheduleName: string;
    public scheduleId: number = 0;
    public groupId: number;//for Redis
    public scheduleType: number;
    
    public serviceIdList: Array<number> = new Array<number>();   //for diagnostic slot

}
