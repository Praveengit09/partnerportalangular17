import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { PastPrescriptionsBoxModule } from './../doctor/prescription/pastprescriptionsbox/pastprescriptionsbox.module';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HsRevenuesChartOnboardedComponent } from './../onboarding/component/hsrevenueschartonboarded/hsrevenueschartonboarded.component'
import { PendingUsersChartOnboardedComponent } from './../onboarding/component/pendinguserschartonboarded/pendinguserschartonboarded.component'
import { TotalRevenueChartOnboardedComponent } from './../onboarding/component/totalrevenuechartonboarded/totalrevenuechartonboarded.component'
import { ConsumerOnboardedChartComponent } from './../onboarding/component/consumeronboardedchart/consumeronboardedchart.component';
import { Nvd3ChartModule } from './../components/nvd3/nvd3.module';
import { OnboardingDashboardComponent } from './../onboarding/component/dashboard/onboardingdashboard.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { OnboardingComponent } from './onboarding.component';
import { PersonalComponent } from './component/personal/personal.component';
import { AddFamilyComponent } from './component/addfamilymember/addfamilymember.component';
import { PhysicalComponent } from './component/physicals/physical.component';
import { UpdatelabtestComponent } from './component/updatelabtest/updatelabtest.component';
import { OnboardingRequestGuard } from '../auth/guard/onboardingrequest-guard.service';
import { OnboardingAdminComponent } from './component/onboardingadmin/onboardingadmin.component';
import { PhrComponent } from './component/phr/phr.component';
import { SummaryComponent } from './component/summary/summary.component';
import { OnboardingService } from './onboarding.service';
import { PatientRegisterService } from './../patientregister/patientregister.service'

import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { DiagnosticsService } from '../diagnostics/diagnostics.service';
import { BusinessAdminService } from '../businessadmin/businessadmin.service';
import { UploadModule } from '../doctor/uploadcard/upload.module';
import { DoctorSearchModule } from '../doctorSearch/doctorSearch.module';
import { PrescriptionSummaryModule } from '../doctor/prescription/prescriptionsummary/pastprescriptionsbox.module';
import { UploadUsersComponent } from './component/uploadusers/uploadusers.component';
import { CentralOnboardingUsers } from './component/centralonboardingusers/centralonboardingusers.component';
import { CustomerReviewModalModule } from '../layout/widget/customerreviewmodal/customer_review_modal.module';
import { CouponUserComponent } from './component/coupon/couponuser.component';
import { MatInputModule } from '@angular/material/input';
import { NgOtpInputModule } from 'ng-otp-input';
import { RequestConsentModule } from '../doctor/requestconsent/requestconsent.module';
import { NurseGuard } from '../auth/guard/nurse-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: 'onboardingdashboard', pathMatch: 'full' },
  { path: 'onboardingdashboard', component: OnboardingDashboardComponent },
  { path: 'user', canActivate: [OnboardingRequestGuard], component: OnboardingComponent },
  { path: 'personal/:profileId', canActivate: [OnboardingRequestGuard], component: PersonalComponent },
  { path: 'personal/:profileId/:userType', canActivate: [NurseGuard], component: PersonalComponent },
  { path: 'addfamily/:profileId', canActivate: [OnboardingRequestGuard], component: AddFamilyComponent },
  { path: 'physical/:profileId', canActivate: [OnboardingRequestGuard], component: PhysicalComponent },
  { path: 'updatelabtest/:profileId', canActivate: [OnboardingRequestGuard], component: UpdatelabtestComponent },
  { path: 'requests', canActivate: [OnboardingRequestGuard], component: OnboardingAdminComponent },
  { path: 'phr', canActivate: [OnboardingRequestGuard], component: PhrComponent },
  { path: 'summary/:profileId', canActivate: [OnboardingRequestGuard], component: SummaryComponent },
  { path: 'uploadusers', canActivate: [OnboardingRequestGuard], component: UploadUsersComponent },
  { path: 'centralOnboardingUsers', canActivate: [OnboardingRequestGuard], component: CentralOnboardingUsers },
  { path: 'coupon', canActivate: [OnboardingRequestGuard], component: CouponUserComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    UploadModule,
    PastPrescriptionsBoxModule,
    PrescriptionSummaryModule,
    ReactiveFormsModule,
    FormsModule,
    PatientRegisterModule,
    HSDatePickerModule,
    DoctorSearchModule,
    Nvd3ChartModule,
    CustomerReviewModalModule,
    MatInputModule,
    NgOtpInputModule,
    RequestConsentModule

  ],
  declarations: [
    OnboardingDashboardComponent,
    OnboardingComponent,
    AddFamilyComponent,
    PersonalComponent,
    PhysicalComponent,
    UpdatelabtestComponent,
    OnboardingAdminComponent,
    ConsumerOnboardedChartComponent,
    TotalRevenueChartOnboardedComponent,
    PendingUsersChartOnboardedComponent,
    HsRevenuesChartOnboardedComponent,
    PhrComponent,
    SummaryComponent,
    UploadUsersComponent,
    CentralOnboardingUsers,
    CouponUserComponent

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    FormsModule
  ],
  providers: [
    OnboardingService,
    PatientRegisterService,
    DiagnosticsService,
    BusinessAdminService
  ],
  exports: [
    PersonalComponent,
    SummaryComponent
  ]
})
export class OnboardingModule {
  static routes = routes;
}
