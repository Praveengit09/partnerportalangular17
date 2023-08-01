import { Payment } from './../../model/basket/payment';
import { ProfileVisitedDetails } from './profilevisitedDetails';
export class TimeSlot {

	public time: number;
	public expireTime: number;
	public status: number;

	public payment: Payment;

	public roomNumber: string;

	public bookingType: number;
	public bookingSubType: number;
	public bookingSource: number;
	public typeOfAppointment: number;

	public orderId: string;
	public invoiceId: string;

	public patientProfileId: number;
	public patientTitle: string;
	public patientFirstName: string;
	public patientLastName: string;
	public patientDOB: number;
	public patientGender: string;
	public patientProfilePic: string;
	public parentProfileId: number;
	public patientContactNumber: string;

	public doctorId: number;
	public doctorTitle: string;
	public doctorFirstName: string;
	public doctorLastName: string;
	public brandId: number;
	public pocId: number;
	public serviceId: number;
	public digiPocId: number;

	public visitDetails: ProfileVisitedDetails;


	// Local variables
	public timeString: string;
	public age: string;
	public isDisabled: boolean;
	public appointmentToken: string;
}
