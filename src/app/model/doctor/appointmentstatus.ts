export class AppointmentStatus {
    public  PERIOD_TYPE_TODAY: number = 0;
    public PERIOD_TYPE_WEEKLY: number = 1;

    public type: number;
    public waitingInQueue: number;
    public prePaid: number;
    public payOnVisit: number;
    public videoConsultation: number;
    public empty: number;

}