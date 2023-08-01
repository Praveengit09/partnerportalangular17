import { DoctorPackage } from "./doctorPackage";
export class DoctorSelectedPackageResponse {
    public pocId: number;
    public doctorPackages:Array<DoctorPackage>;
}