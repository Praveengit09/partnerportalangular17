import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';

import { DiagnosticGuard } from '../../auth/guard/diagnostic-guard.service';
import { DiagnosticsAdviceDetailComponent } from './component/advicedetail/advicedetail.component';
import { DiagnosticsInvoiceComponent } from './component/invoice/invoice.component';
import { TestResultsComponent } from './component/testresults/testresults.component';
import { WalkInReportsComponent } from './component/walkinreports/walkinreports.component';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { MatInputModule } from '@angular/material/input';

export const routes = [
  { path: 'advicedetail', canActivate: [DiagnosticGuard], component: DiagnosticsAdviceDetailComponent },
  { path: 'invoice', component: DiagnosticsInvoiceComponent },
  { path: 'testuploadresults', canActivate: [DiagnosticGuard], component: TestResultsComponent },
  { path: 'walkinreports', canActivate: [DiagnosticGuard], component: WalkInReportsComponent }
  ]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),    
    WidgetModule,
    UtilsModule,
    FormsModule,
    DoctorSearchModule,
    PatientRegisterModule,
    HSDatePickerModule,
    MatInputModule
  ],
  declarations: [
    DiagnosticsAdviceDetailComponent,
    DiagnosticsInvoiceComponent,
    TestResultsComponent,
    WalkInReportsComponent
  ]
})
export class DiagnosticsAdviceModule {
  static routes = routes;
}