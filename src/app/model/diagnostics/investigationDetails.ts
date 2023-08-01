import { DisplayDescription } from './../product/displaydescription';
import { SymptomNote } from "./../../model/advice/symptomNote";
import { ServiceItem } from '../service/serviceItem';

export class InvestigationDetails extends ServiceItem {
    public phrTestId: number;
    public note: Array<SymptomNote>;

    public doctorId: number;
    public doctorServiceId: number;
    public pocId: number;
    public homeCollections: number;
    public isUpdated: boolean;
    public displayDescriptionList: Array<DisplayDescription>;
    public sample: string;
    public methodology: string;
    public tat: string;
    public tags: string;

    public displayName: string;
    public override precaution: string;
    public override description: string;
    public referenceId: number;

    public remarks: string;

    public serviceIdList: Array<number>;
    public homeCollection: boolean;
    // local use
    public isFirstCome: boolean = false;
    public override isSelected: boolean = false;
}
