import { SymptomNote } from "./../../model/advice/symptomNote";

export class DiagnosticsInfo {
    public skuId: string;
    public id: number;
    public type: number;
    public typeName: string;
    public title: string;
    public dosage: string;
    public amount: number;
    public brandName: string;
    public quantityToHave: string;
    public totalQuantity: number;
    public goToKart: number;
    public iconType: string;
    public iconUrl: string;
    public note: Array<SymptomNote>;
    public times: Array<number>;
    public doses: Array<number>;
    public takenWhen: string;
    public duration: string;
    public customDose: string;
    public customDuration: string;
    public batchNumber: string;
    public expiryDate: number;
    public price: number;
    public durationValue: number;
    public route: string;
    public addedByDoctor: boolean;
}
