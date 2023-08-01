import { MappingEmployee } from './employeelocal';
import { DoctorTag } from './doctorfavrolesrequest';

export class DoctorFavRolesResponse extends MappingEmployee{
    public pocId: number;
    public roleId: number;
    public doctorTagList: DoctorTag[] = new Array<DoctorTag>();
}