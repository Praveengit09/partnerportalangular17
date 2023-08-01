import { BasePhrAnswer } from './basePhrAnswer';
export class InvasiveTestDetails extends BasePhrAnswer {

    public parentId: number;
    public parentName: string;

    public unit: string;
    public normalRangeValues: string;
    public minRangeValue: number;
    public maxRangeValue: number;
    public rangeUnit: number;

    public diagnosticName: string;

    public sampleId: string;
    public reportedDate: number;
    public reportId: number;

    //local use
    public isSelected: boolean;

}
