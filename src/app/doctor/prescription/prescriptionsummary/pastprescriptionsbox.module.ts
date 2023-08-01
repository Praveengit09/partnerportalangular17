import { PrescriptionSummaryComponent } from './prescriptionsummary.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        PrescriptionSummaryComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        
    ],
    exports:[
        PrescriptionSummaryComponent
    ]
})
export class PrescriptionSummaryModule {
}