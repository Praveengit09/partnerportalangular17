import { InvestigationDetails } from "./investigationDetails";
import { UpdatedByEmpInfo } from "./../../model/employee/updatedByEmpInfo";

export class InvestigationTestDetails extends InvestigationDetails {

    public override sampleId: string;
    public override sampleCollectionDate: any;
    public partnerProcessedSample: boolean;

    public testResultDataValue: string;
    public testResultDataUnit: string;

    public normalResultDataValue: string;
    public minRangeValue: number;
    public maxRangeValue: number;
    public rangeUnit: number;
    public status: number;
    public timeStamp: number;
    private updatedBy: UpdatedByEmpInfo;

    //Local
    public checkSampleIdExist: boolean;
    public isDisabled: boolean;
}
