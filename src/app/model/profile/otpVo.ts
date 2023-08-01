
	export class OtpVo{

	public static EMAIL : number = 1;
    public static MOBILE : number = OtpVo.EMAIL+1;
    public static EMAIL_MOBILE : number = OtpVo.MOBILE+1;
	public static ONBOARD:number = OtpVo.EMAIL_MOBILE+1;
	public  email:string;
	public  mobile:string;
	public  orgCode:string;
	public  type:number;
	public 	otpServiceType:number;
	}