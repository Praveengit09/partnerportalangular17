export class DoctorLeaveRequest {
    public doctorId: number;
    public startDate: number;
    public endDate: number;
    public startTime: number;
    public endTime: number;
    public proceed: boolean;
    public pocId: number;
    public leaveCancellationStatus: boolean;
	public cancellable: boolean;
}