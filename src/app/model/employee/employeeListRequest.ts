
export class EmployeeListRequest {
    public pocIds = new Array<number>();
    public contactNo: string;
    public name: string;
    public limit: number;
    public offset: number;
    public roleId: number;
}