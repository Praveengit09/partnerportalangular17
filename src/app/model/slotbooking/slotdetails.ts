import { Payment } from './../../model/basket/payment';

export class SlotDetail {
    public time: number;
    public status: number;
    public slotType: number;
    public patientFirstName: string;
    public patientTitle: string;
    public patientLastName: string;
    public patientProfileId: number;
    public patientDOB: number;
    public patientGender: string;
    public bookingId: string;
    public bookingPocId: number;
    public roomNumber: string;
    public payment: Payment;
    public orderId: string;
    public invoiceId: string;
    public parentProfileId: number;
    public doctorId: number;
    public serviceId: number;
    public doctorName: string;
    public expireTime: number;
    public pocId: number;
    public digiPocId: number;
    public doctorFirstName: string;
    public doctorLastName: string;
    public doctorTitle: string;
    public profilePic: string;
    public patientContactNumber: string;
    public bookingSubType: number;
    public vacantSlots: number;
}