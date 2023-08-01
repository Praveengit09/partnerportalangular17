import { POCPermission } from './../../model/employee/pocpermission';
import { BaseResponse } from "./../../model/base/baseresponse";
import { Doctor } from "./../../model/employee/doctor";

export class LoginResponse extends BaseResponse {
  public employee: Doctor;
  public pocPermissionsList: Array<POCPermission>;
  public sessionToken: string;
  //public statesAndCities: any;
  public newUser:boolean;
}
