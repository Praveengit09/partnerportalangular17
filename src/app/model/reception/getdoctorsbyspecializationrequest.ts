export class GetDoctorsBySpecializationRequest {

    public searchTerm: string;
    public serviceIdList: number[] = new Array<number>();
    public serviceName: string;
    public timeConsidered: boolean = true;
    public brandId: number;
    public from: number;
    public size: number = 30;
}