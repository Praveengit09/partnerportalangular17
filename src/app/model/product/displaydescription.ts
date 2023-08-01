import { FormArray } from '@angular/forms';
export class DisplayDescription {
    public title: string;
    public content: Array<String>;
    public imageUrl: string;
    public descDetails: Array<DisplayDescription>;
}