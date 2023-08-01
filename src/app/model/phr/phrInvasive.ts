import { ReportResponse } from './../../model/report/reportresponse';
import { NonInvasiveTestDetails } from './noninvasivetestdetails';
import { InvasiveTestDetails } from './invasivetestdetails';
export class PhrInvasive extends ReportResponse {
    public profileId: number;
    public createdTime: number;
    public updateTime: number;
    public userType: number;
    public userId: number;
    public modeOfPayment: string;
    public amount: number;
    public override pocId: number;
    public labsnoninvasive: Array<NonInvasiveTestDetails>;
    public labsinvasive: Array<InvasiveTestDetails>;
    public isAuthentic: number;
    public phrVersion: string;
    public relationShipId: number;
    public sampleId: string;
}
