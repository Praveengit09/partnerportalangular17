export class BaseResponse {
    public statusCode: number;
    public statusMessage: string;
    public packageValidFrom: number;
    public packageValidTo: number;
    public data: any;
}