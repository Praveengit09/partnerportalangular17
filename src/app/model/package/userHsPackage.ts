import { Doctor } from './../../model/employee/doctor';
import { PackageBenefitList } from "./packageBenefitList";
export class UserHsPackage {
    //generated on server like orderId
    public userPackageId: number;
    public profileId: number;
    public packageId: number;
    public name: string;
    public consultationsCompleted: Array<ConsultationsCompleted>;
    public packageValidFrom: number;
    public packageValidTo: number;
    public packagePurchaseDate: number;
    public orderId: string;
    public invoiceId: string;
    public isEmiPackage: number;
    public personalDoctor: Doctor;
    public packageUserId: Array<number>;
    public validityDays: number;
    public packageBenefitLists:Array<PackageBenefitList> ;
}

export class ConsultationsCompleted {
    public serviceId: number;
    public completed: number;
}
