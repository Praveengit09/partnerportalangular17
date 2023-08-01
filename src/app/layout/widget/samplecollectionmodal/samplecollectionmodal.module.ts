import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SampleCollectionModal } from './samplecollectionmodal.component';
import { DiagnosticScheduleService } from '../../../diagnostics/schedule/schedule.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule
    ],
    declarations: [
        SampleCollectionModal
    ],
    exports: [SampleCollectionModal],
    providers: [
        DiagnosticScheduleService
    ]
})

export class SampleCollectionModalModule {
}