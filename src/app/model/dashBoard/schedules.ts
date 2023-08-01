
export class Schedules {
    public date: number;
    public validFrom: number;
    public validTo: number;
    public dateTiming: Array<number>;
    public conflictingHours: Array<number>;
    public roomNumber: string;
    public firstName: string;
    public lastName: string;
    public specialityId: number;
    public doctorId: number;
    public serviceId: number;
    public scheduleId: number;
    public pocId: number;
    public displaySlotDays: number;
    public slotDuration: number;
    public inPersonBooked: number;
    public videoConsultationBooked: number;
}