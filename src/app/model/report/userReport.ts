import { InvasiveTestDetails } from '../phr/invasivetestdetails';
import { ReportFile } from '../phr/reportFile';

export class UserReport {

    public static STATUS_INACTIVE: number = 1;
    public static STATUS_ACTIVE: number = 0;

    public profileId: number;
    public reportId: number;
    public type: number;
    public status: number;
    
    public testDetailList: Array<InvasiveTestDetails>;
    public fileUrlList: Array<ReportFile>;
    public proofDocumentUrlList: Array<String>;

    public reportedDate: number;
    public referenceId: string;

    public userType: number;
    public userId: number;
    
    public name: string;
    public specialization: string;
    
    public hasFiles: boolean;

}
