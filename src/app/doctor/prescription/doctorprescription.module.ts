import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Nvd3ChartModule } from '../../components/nvd3/nvd3.module';
import { RickshawChartModule } from '../../components/rickshaw/rickshaw.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { WidgetModule } from '../../layout/widget/widget.module';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NurseModule } from "./../../nurse/nurse.module";
import { OnboardingModule } from './../../onboarding/onboarding.module';
import { DigitizationQueueComponent } from './digitizationqueue/digitizationqueue.component';
import { DoctorPrescriptionRoute } from './doctorprescription.routing';
import { ImagePointerModule } from "./imagepointer/imagepointer.module";
import { MedicalPrescriptionComponent } from './medicalprescription/medicalprescription.component';
import { OphthalmologyPrescriptionComponent } from './ophthalmology/ophthalmologyprescription.component';
import { PastPrescriptionsBoxModule } from './pastprescriptionsbox/pastprescriptionsbox.module';
import { PatientPHR } from './patientphr/patientphr.component';
import { PrescriptionSummaryModule } from './prescriptionsummary/pastprescriptionsbox.module';
import { ReportGraphModule } from "./reports/reportgraph.module";
import { ShortSummaryComponent } from './shortsummary/shortsummary.component';
import { SymptomPrescriptionComponent } from './symptomprescription/symptomprescription.component';
import { TemplatesBoxComponent } from './templatesbox/templatesbox.component';
import { PreCallTestComponent } from './videocard/precalltest/precalltest.component';
import { PublisherComponent } from './videocard/publisher/publisher.component';
import { SubscriberComponent } from './videocard/subscriber/subscriber.component';
import { VideoCardComponent } from './videocard/videocard.component';
import { WizardComponent } from './wizard/wizard.component';
import { MatInputModule } from '@angular/material/input';
import { DigitizationManagerComponent } from './digitizationmanager/digitizationmanager.component';
import { DigitizedPrescriptionComponent } from './digitizedprescription/digitizedprescription.component';
import { ImageDrawingModule } from './imagedrawing/imagedrawing.module';


// import { NgOtpInputModule } from 'ng-otp-input';
import { NgOtpInputModule } from 'ng-otp-input';
import { RequestConsentModule } from '../requestconsent/requestconsent.module';
import { PrescriptionQuestionnaireModule } from '../prescriptionQuestionnaire/prescriptionQuestionnaire.module';
import { KaleyraVideoComponent } from './videocard/kaleyravideo/kaleyravideo.component';
// import { PreconsultationSummaryComponent } from './preconsultationsummary/preconsultationsummary.component';
import { PreconsultationSummaryModule } from './preconsultationsummary/preconsultationsummary.module';

@NgModule({
  imports: [
    CommonModule,
    DoctorPrescriptionRoute,
    PastPrescriptionsBoxModule,
    PrescriptionSummaryModule,
    OnboardingModule,
    NurseModule,
    ReportGraphModule,
    ImagePointerModule,
    //Ng2CompleterModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    WidgetModule,
    UtilsModule,
    HSDatePickerModule,
    RickshawChartModule,
    Nvd3ChartModule,
    FormsModule,
    MatInputModule,
    NgOtpInputModule,
    RequestConsentModule,
    PrescriptionQuestionnaireModule,
    PreconsultationSummaryModule,
    ImageDrawingModule

  ],
  declarations: [
    SymptomPrescriptionComponent,
    OphthalmologyPrescriptionComponent,
    MedicalPrescriptionComponent,
    PatientPHR,
    ShortSummaryComponent,
    TemplatesBoxComponent,
    PreCallTestComponent,
    VideoCardComponent,
    KaleyraVideoComponent,
    WizardComponent,
    PublisherComponent,
    SubscriberComponent,
    DigitizationQueueComponent,
    DigitizationManagerComponent,
    DigitizedPrescriptionComponent
    // PreconsultationSummaryComponent

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    PatientPHR

  ]
})
export class DoctorPrescriptionModule {
}