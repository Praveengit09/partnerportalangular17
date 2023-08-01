import { DoctorPrescriptionModule } from './prescription/doctorprescription.module';
import { OnboardingModule } from './../onboarding/onboarding.module';
import { DoctorPHRSummary } from './phrsummary/doctorphrsummary.component';
import { DoctorRoute } from './doctor.routing';
import { NurseModule } from './../nurse/nurse.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { DoctorQueueComponent } from './queue/doctorqueue.component';
import { PaymentService } from '../payment/payment.service';
import { UploadModule } from './uploadcard/upload.module';
import { SuperAdminService } from '../superadmin/superadmin.service';
import { EmployeeService } from '../superadmin/employee/employee.service';
import { DoctorHomeConsultationModule } from './homeconsultation/doctorhomeconsultation.module';
import { DoctorDashboardComponent } from './dashboard/doctordashboard.component';
import { DoctorPrescriptionListModule } from './prescriptionlist/prescriptionlist.module';
import { ReportGraphModule } from './prescription/reports/reportgraph.module';
import { POCReportsModule } from '../businessadmin/pocreports/pocreports.module';
import { NgOtpInputModule } from 'ng-otp-input';
import { RequestConsentComponent } from './requestconsent/requestconsent.component';
import { RequestConsentModule } from './requestconsent/requestconsent.module';
import { PrescriptionQuestionnaireModule } from './prescriptionQuestionnaire/prescriptionQuestionnaire.module';
import { PreconsultationSummaryComponent } from './prescription/preconsultationsummary/preconsultationsummary.component';
import { PrescriptionSummaryModule } from './prescription/prescriptionsummary/pastprescriptionsbox.module';
import { PreconsultationSummaryModule } from './prescription/preconsultationsummary/preconsultationsummary.module';
import { DoctorDashboardV1Component } from './dashboardv1/doctordashboardv1.component';

@NgModule({
    imports: [
        CommonModule,
        DoctorRoute,
        NurseModule,
        WidgetModule,
        UtilsModule,
        FormsModule,
        OnboardingModule,
        UploadModule,
        DoctorPrescriptionModule,
        DoctorHomeConsultationModule,
        DoctorPrescriptionListModule,
        ReportGraphModule,
        POCReportsModule,
        NgOtpInputModule,
        RequestConsentModule,
        PrescriptionQuestionnaireModule,
        PrescriptionSummaryModule,
        PreconsultationSummaryModule
    ],
    declarations: [
        DoctorQueueComponent,
        DoctorPHRSummary,
        DoctorDashboardComponent,
        // RequestConsentComponent
        DoctorDashboardV1Component,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA

    ],
    providers: [
        PaymentService,
        SuperAdminService,
        EmployeeService
    ],
    exports: [

    ]
})

export class DoctorModule {
}