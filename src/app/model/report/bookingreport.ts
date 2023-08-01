import { DoctorDetails } from './../../model/employee/doctordetails';

export class BookingReport {
    public pocId: number;
    public pocName: string;
    public doctorId: number;
    public doctorFirstName: string;
    public doctorLastName: string;
    public date: number;
    public bookedSlots: number;
    public totalSlots: number;
    public notAppearedSlots: number;
    public videoSlotsTotal: number;
    public inPersionSlotsTotal: number;
    public digiSlotsTotal: number;
}

export class DaywiseSummary {

}
