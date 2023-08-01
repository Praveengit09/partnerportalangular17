import { PrescriptionSummaryModule } from './../prescriptionsummary/pastprescriptionsbox.module';
import { PastPrescriptionsBoxComponent } from './pastprescriptionsbox.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestConsentModule } from '../../requestconsent/requestconsent.module';



@NgModule({
    imports: [
        CommonModule,
        PrescriptionSummaryModule,
        RequestConsentModule
    ],
    declarations: [
        PastPrescriptionsBoxComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [

    ],
    exports: [
        PastPrescriptionsBoxComponent
    ]
})
export class PastPrescriptionsBoxModule {
}