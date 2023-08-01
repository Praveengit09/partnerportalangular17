import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgOtpInputModule } from 'ng-otp-input';
import { UtilsModule } from '../layout/utils/utils.module';
import { WidgetModule } from '../layout/widget/widget.module';
import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { ReceptionService } from '../reception/reception.service';
import { ReportGraphModule } from "./../doctor/prescription/reports/reportgraph.module";
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NGTableModule } from './../layout/widget/ngtable/ngtable.module';
import { PreConsultationQuestionnaireComponent } from './component/preconsultationquestionnaire/preconsultationquestionnaire.component';
import { VitalsreadingComponent } from './component/vitalsreading/vitalsreading.component';
import { StaticVitalsreadingComponent } from './component/vitalsreadingstatic/vitalsreadingstatic.component';
import { NurseComponent } from './nurse.component';
import { NurseRoute } from './nurse.routing';
import { SBRComponent } from './SBR/Sbr.component';
import { SBRAdviceComponent } from './SBR/SbrAdvices/SbrAdvice.component';





@NgModule({
  imports: [
    CommonModule,
    NurseRoute,
    FormsModule,
    WidgetModule,
    UtilsModule,
    NGTableModule,
    HSDatePickerModule,
    FormsModule,
    PatientRegisterModule,
    ReportGraphModule,
    MatInputModule,
    NgOtpInputModule
  ],
  declarations: [
    NurseComponent,
    VitalsreadingComponent,
    StaticVitalsreadingComponent,
    SBRComponent,
    SBRAdviceComponent,
    PreConsultationQuestionnaireComponent
  ],
  providers: [
    ReceptionService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    VitalsreadingComponent
  ]
})
export class NurseModule {
}
