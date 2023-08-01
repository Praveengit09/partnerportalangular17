import { CustomerOnboardingComponent } from './component/customeronboarding/customeronboarding.component';
import { DoctorsOrderManagementComponent } from './component/doctorsordermanagement/doctorsordermanagement.component';
import { DiagnosticsOrderManagementComponent } from './component/diagnosticsordermanagement/diagnosticsordermanagement.component';
import { TurnAroundTimeComponent } from './component/turnaroundtime/turnaroundtime.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { OpsComponent } from './ops.component';
import { SuperAdminService } from '../superadmin/superadmin.service';
import { OpsService } from './ops.service';
import { CentralOrdersTotalCount } from './component/centralorderstotalcount/centralorderstotalcount.component';


export const routes: Routes = [
  { path: '', redirectTo: 'opsdashboard', pathMatch: 'full' },
  { path: 'opsdashboard', component: OpsComponent },
  { path: 'onboardingdacustomeronboardingshboard', component: CustomerOnboardingComponent },
  { path: 'diagnosticsordermanagement', component: DiagnosticsOrderManagementComponent },
  { path: 'doctorsordermanagement', component: DoctorsOrderManagementComponent },
  { path: 'turnaroundtime', component: TurnAroundTimeComponent },
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,


  ],
  declarations: [
    OpsComponent,
    CustomerOnboardingComponent,
    DiagnosticsOrderManagementComponent,
    DoctorsOrderManagementComponent,
    TurnAroundTimeComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    FormsModule
  ],
  providers: [
    SuperAdminService,
    OpsService
  ],
  exports: [

  ]
})
export class OpsModule {
  static routes = routes;
}
