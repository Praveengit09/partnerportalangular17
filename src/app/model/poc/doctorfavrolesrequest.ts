import { RolesForDoctorsList } from './rolesfordoctorslist';


export class DoctorFavRolesRequest {
    public pocId: number;
    public empId: number;
    public roleId: number;
    public title: string;
    public firstName: String;
    public lastName: String;
    public doctorTag: DoctorTag;
}

export class DoctorTag {
    public doctorId: number;
    public title: string;
    public firstName: String;
    public lastName: String;
    public imageUrl: String;
}
    // public pocId: number;
    // public rolesForDoctorsList: RolesForDoctorsList[] = new Array<RolesForDoctorsList>();
