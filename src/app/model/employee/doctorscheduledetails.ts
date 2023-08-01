import { ServiceDetail } from '../employee/servicedetail';
import { Doctor } from '../employee/doctor';
import { Timing } from '../employee/timing';
export class DoctorScheduleDetails {
    public pocId: number;
    public roomNumber: string;
    public serviceDetailList: Array<ServiceDetail>;
    public doctorId: number;
    public validFrom: number;
    public validTo: number;
    public scheduleId: number;
    public dateTiming: Array<Timing> = new Array<Timing>();
    public slotDuration: number;
    public consultationFee: number;
    public displaySlotDays: number;
    public proceedWithConflict: boolean;
    public conflictFrom: number;
    public conflictTo: number;
}