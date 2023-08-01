import { DoctorSchedule } from './doctorschedule';

export class DoctorScheduleResponse {

    public static NO_CONFLICT: number = 0;
    public static CONFLICT_WITH_OTHER_POC: number = DoctorScheduleResponse.NO_CONFLICT + 1;
    public static CONFLICT_WITHIN_POC: number = DoctorScheduleResponse.CONFLICT_WITH_OTHER_POC + 1;
    public validFrom: number;
    public validTo: number;
    public imageUrl: string;
    public firstName: string;
    public lastName: string;
    public empId: number;
    public slotDuration: number;
    public consultationFee: number;
    public specialityId: number;
    public conflictList = Array<DoctorSchedule>();
    public resolvedList = Array<DoctorSchedule>();
    public conflictType: number;
    public conflictFrom: number;
    public conflictTo: number;
}