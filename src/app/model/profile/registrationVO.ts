import {ProfileDetailsVO} from './profileDetailsVO';
export class RegistrationVO extends ProfileDetailsVO{
    public  loginType:number;
	public  password:string;
	public  deviceId:string;
	public  excelReg:number;
	public  phrCompletionType:number;
	public  physicalCompletionType:number;
	public  labTestCompletionType:number;
	public override onboardingStatus:number;
	public  pocId:number;
	public doctorId:number;

	public override referralCode:string;
	public employerName:string;
	public consumerEmployeeId:number;
	public selectPrimaryUser: boolean;
	public primaryUser: boolean;
}