export class SessionBean {
	public pocId: number;
	public patientFirstName: string;
	public patientLastName: string;
	public patientTitle: string;
	public patientDOB: number;
	public time: number;
	public patientProfileId: number;
	public doctorId: number;
	public doctorTitle: string;
	public doctorFirstName: string;
	public doctorLastName: string;
	public patientId: number;
	public profileId: number;
	public patientName: string;
	public patientAge: number;
	public patientGender: string;
	public serviceId: number;
	public type: number;
	public sessionId: string;
	public tokenId: string;
	public message: string;
	public startTime: number;
	public endTime: number;
	public availableStatus: number;
	public currentTime: number;
	public orderId: string;
	public invoiceId: string;
	public parentProfileId: number;
	public apiKey: any;// = OpenTokSessionUtil.OPENTOK_API_KEY;
	//adding consultationType 
	public consultationType: number;
	public patientProfilePic: string;
	public patientContactNumber: string;
	public bookingSubType: number;
	public bookingType: number;
	public doctorImageUrl: string;
	public bookingPocId: number;

	//socket use
	public userType: number;//0 doc //1 consumer //2digi manager
	public to: number;//0 doc //1 consumer //2digi manager
}