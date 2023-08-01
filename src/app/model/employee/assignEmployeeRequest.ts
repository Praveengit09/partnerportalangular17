export class AssignEmployeeRequest {
    public pocIdList:number[] = new Array<number>();
    public roleId:number;
    public superAdmin:boolean;
    public serviceId:number;
    public name:string;
    public mobileNumber:string;
}