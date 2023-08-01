import { BaseMedicineDetails } from './basemedicinedetails';
import { Dose } from '../pharmacy/dose';
import { Duration } from '../pharmacy/duration';

export class PrescriptionMedicineDetails extends BaseMedicineDetails {

    public doses: Array<Dose>;
    public doseUnit: string;
    public doseLabel: string;
    public emergency : boolean;

    public duration: Duration;

    public takenWhenFood: string;

    public symptomKey: string;
    public preference: string ;


    public addedByDoctor: boolean;
    public doseUnitId: string;
    public isSOS: boolean;
    
    public stockAvailable:boolean;

}
