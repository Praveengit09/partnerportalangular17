import { DoctorTag } from './doctorfavrolesrequest';

export class EmployeeLocal {
    public doctor: DoctorTag;
    public receptionist: Array<MappingEmployee> = new Array<MappingEmployee>();
    public vital: Array<MappingEmployee> = new Array<MappingEmployee>();
    public cashier: Array<MappingEmployee> = new Array<MappingEmployee>();
    public scheduleManager: Array<MappingEmployee> = new Array<MappingEmployee>();
    public printPrescription: Array<MappingEmployee> = new Array<MappingEmployee>();
}

export class MappingEmployee {
    public empId: number;
    public firstName: String;
    public lastName: String;
    public title: string
    public roleid: number
    public id: number;
    public itemName: string;
}