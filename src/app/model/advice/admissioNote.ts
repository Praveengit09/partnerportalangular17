import { ServiceItem } from "../service/serviceItem";
import { TextAdvise } from "./textAdvise";

export class AdmissionNote extends ServiceItem {
    public admissionDateFrom: number;
    public admissionDateTo: number;
    public procedureList: Array<ServiceItem> = new Array();
    public note: string;
}