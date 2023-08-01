import { SlotBookingDetails } from '../basket/slotBookingDetails';

export class CentralOrderInteraction extends SlotBookingDetails {
    public profileId: number;
    public patientName: string;
    public consumerInteractedEmpId: number;
    public consumerInteractedEmployeeName: string;
    public doctorInteractedEmpId: number;
    public doctorInteractedEmployeeName: string;
    public consumerInteractionStatus: string;
    public consumerInteractionDate: number;
    public consumerInteractedComments: string;
    public doctorInteractedStatus: string;
    public doctorInteractionDate: number;
    public doctorInteractionComments: string;
    public interactionType: number;
    public phlebotomistName: string;
    public consumerInteractionHistory: ConsumerInteractionHistory[];
    public doctorInteractionHistory: DoctorInteractionHistory[];
    public consultationInitiatedTime: number;
	public consultationEndTime: number;
    public advertisementId;
    public imei;

    //local
    public formattedConsumerInteraction: string[];
    public formattedDoctorInteraction: string[];
    public creatorName: string;
    public consultationTime: string;
    public patientDetails: string;
    public rowStyle: any;
}

export class ConsumerInteractionHistory {
    public consumerInteractedEmpId: number;
    public consumerInteractedEmployeeName: string;
    public consumerInteractionStatus: string;
    public consumerInteractionDate: number;
    public consumerInteractedComments: string;
}

class DoctorInteractionHistory {
    public doctorInteractedEmpId: number;
    public doctorInteractedEmployeeName: string;
    public doctorInteractedStatus: string;
    public doctorInteractionDate: number;
    public doctorInteractionComments: string;
}
