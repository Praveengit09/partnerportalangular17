import { Timing } from '../employee/timing';
export class DoctorSchedule {
    public static NO_CONFLICT: number = 0;
    public static NON_CONFLICT_STATE: number = 0;
    public static CONFLICT_STATE: number = DoctorSchedule.NON_CONFLICT_STATE + 1;
    public date: number;
    public slotDuration: number;
    public validTo: number;
    public validFrom: number;
    public consultationFee: number;
    public dateTiming: Array<number>;
    public conflictingHours: Array<number>;
    public roomNumber: string;
    public firstName: string;
    public lastName: string;
    public specialityId: number;
    public doctorId: number;
    public serviceId: number;
    public pocId: number;
    // identification
    public scheduleId: number;

}


