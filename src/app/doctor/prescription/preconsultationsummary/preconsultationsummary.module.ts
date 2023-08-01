import { PrescriptionSummaryModule } from './../prescriptionsummary/pastprescriptionsbox.module';

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DoctorService } from '../../doctor.service';
import { NurseService } from '../../../nurse/nurse.service';
import { PreconsultationSummaryComponent } from './preconsultationsummary.component';
import { RouterModule } from '@angular/router';
import { WidgetModule } from '../../../layout/widget/widget.module';
import { UtilsModule } from '../../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
import { HSDatePickerModule } from '../../../layout/widget/datetimepicker/datetimepicker.module';
import { PatientRegisterModule } from '../../../patientregister/patientregister.module';
import { MatInputModule } from '@angular/material/input';
import { NgOtpInputModule } from 'ng-otp-input';


@NgModule({
    imports: [

        MatProgressSpinnerModule,
        CommonModule,
        NgOtpInputModule,
        WidgetModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule,
        PatientRegisterModule,
        MatInputModule,
        PrescriptionSummaryModule
    ],
    declarations: [
        PreconsultationSummaryComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        NurseService,
        DoctorService
    ],
    exports: [
        PreconsultationSummaryComponent
    ]
})
export class PreconsultationSummaryModule {
}