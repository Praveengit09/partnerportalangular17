import { Payment } from './../../model/basket/payment';

import { from } from 'rxjs/observable/from';
export class BookSlotRequest {
    public pocId: number;
    public digiPocId: number;

    public slotTime: number;
    public slotDate: number;
    public roomNumber: string;
    public digiRoomNumber: string;
    public slotExpireTime:number;
    public slotStatus: number;
    public userId: number;
    public serviceId: number;
    public serviceName: string;
    public transactionId: string;
    public timeZone:string;
    public categoryId:number;

    public bookingType: number;
    public bookingId: string;
    public digiQueue: boolean;
    public bookingSubType:number;
    public typeofAppointment:number;
    public isDigiQueue:boolean;
    public addToConsultationQueue:boolean;
    
    public doctorId: number;
    public doctorTitle: string;
    public doctorFirstName: string;
    public doctorLastName: string;
   
    public patientProfileId: number;
    public patientDOB: number;
    public patientAge:number;
    public profilePic: string;
    public patientName: string;
    public parentProfileId: number;
    public patientGender: string;
    public patientEmailId: string;
    public patientContactNumber: string;

    public payment: Payment = new Payment();

   // public bookingSubType: number;
  
    public revenue:number;
    public noOfVisits:number;
    public lastVisitedDate: number;
    public typeOfAppointment: number;

   // public addToConsultationQueue: boolean;
}
