import { BasePhrAnswer } from './basePhrAnswer';

export class NonInvasiveTestDetails extends BasePhrAnswer {

	public normalRangeValues: string;
	public minRangeValue: number;
    public maxRangeValue: number;
	public rangeUnit: number;
	
	public unit: string;
	public ans: string;

	public choices: any;
	public componentId: number;
	public inputType: number;
	public maxLength: number;

	//local
	public ansList:any;
	public isDisabled: boolean;
}