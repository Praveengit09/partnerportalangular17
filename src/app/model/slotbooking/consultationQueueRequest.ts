
export class ConsultationQueueRequest {
    public pocId: number;
    public doctorId: number;
    public empId: number;
    public roleId: number;
    public date: number;
    public digiQueue: boolean;    
    public filterStatus:number;
    public searchByName: string;
}