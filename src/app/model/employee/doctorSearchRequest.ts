export class DoctorSearchRequest {

    public static MAX_SIZE: number = 50;

    public isDigi: boolean;
    public searchTerm: string;
    public indexName: string;
    public specialityName: string;

    public from: number;
    public size: number = DoctorSearchRequest.MAX_SIZE;
}
