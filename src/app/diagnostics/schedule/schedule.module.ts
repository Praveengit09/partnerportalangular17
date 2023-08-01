import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule,Routes } from '@angular/router';


import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { DiagnosticSchedulesComponent } from './component/listing/diagnosticschedule.component';
import { CreateNewDiagnosticScheduleComponent } from './component/createnewdiagnosticschedule/createnewdiagnosticschedule.component';
import { SelectedTestComponent } from './component/selectedtest/selectedtest.component';
import { SavedTestComponent } from './component/savedTest/savedtest.component';
import { PrecautionComponent } from './component/precaution/precaution.component';
import { DiagnosticScheduleService } from './schedule.service';
import { DiagnosticScheduleLocationComponent } from './component/locations/diagnosticschedulelocation.component';
import { SampleCollectionModalModule } from './../../layout/widget/samplecollectionmodal/samplecollectionmodal.module';

export const routes:Routes = [
  { path: '', redirectTo: 'diagnosticschedule', pathMatch: 'full' },
  { path: 'diagnosticschedule', component: DiagnosticSchedulesComponent },
  { path: 'createnewdiagnosticschedule', component: CreateNewDiagnosticScheduleComponent },
  { path: 'selectedtest/:pocId', component: SelectedTestComponent },
  { path: 'savedtest', component: SavedTestComponent },
  { path: 'precautions', component: PrecautionComponent },
  { path: 'diagnosticschedulelocation', component: DiagnosticScheduleLocationComponent }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule,
    HSDatePickerModule,
    
  ],
  declarations: [
    DiagnosticSchedulesComponent,
    CreateNewDiagnosticScheduleComponent,
    SelectedTestComponent,
    PrecautionComponent,
    SavedTestComponent,
    DiagnosticScheduleLocationComponent
  ],
  providers:[
    DiagnosticScheduleService
  ]
})
export class DiagnosticScheduleModule {
  static routes = routes;
}