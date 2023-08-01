import { ReportResponse } from "./../../model/report/reportresponse";
import { SessionBean } from "./../../model/slotbooking/sesssionBean";

export class PaymentResponse extends ReportResponse {
	public sessionBean: SessionBean;
	public bookingId: string;
	public paymentSuccess: boolean;
	public expireTime: number;
}
