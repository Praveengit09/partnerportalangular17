// import {EmployeePOC} from './employeepoc';
// import {RoleBasedAddress} from './roleBasedAddress';
// import { ServiceItem } from '../service/serviceItem';
// import {ContactInfo} from '../profile/contactInfo';
// import { PocAdviseData } from '../poc/poc-advise-data';
import { Person } from './person';
import { EmployeePocMapping } from './employeepocmapping';
export class Employee extends Person {
	public static override serialVersionUID: number = -4290319318632188625;
	public type: number;
	public superAdmin: boolean;
	public multiBrandUser: boolean;
	public employeePocMappingList: Array<EmployeePocMapping> = new Array();

	// public pocId:number;
	// public empId: number;
	// public firstName: string;
	// public lastName: string;
	// public contactList:Array<string> = new Array<string>();
	// public serviceList: Array<ServiceItem>;
	// public emailId: string;
	// public gender: string;
	// public description: string;
	// public updatedTime: number;
	// public city: number;
	// public state: number;
	// public profileImageData: string;
	// public imageUrl: string;
	// public title: string;
	// public signatureImageData: string;
	// public signatureImageUrl: string;
	// // public type: number;
	// // public superAdmin: boolean;
	// public pocRolesList: Array<EmployeePOC>;
	// public roleBasedAddressList: Array<RoleBasedAddress>;
	// public empPersonalPocInfo:PocAdviseData;
	// public overRidePDFHeader:boolean;
	// //temporaray variable
	// public isModify:boolean;


}