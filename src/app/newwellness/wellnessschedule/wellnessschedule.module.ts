import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { FormsModule } from '@angular/forms';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { HSDatePickerModule } from '../../layout/widget/datetimepicker/datetimepicker.module';
import { WellnessScheduleService } from './wellnessSchedule.service';
import { WellnessSchedulesListingComponent } from './component/listing/wellnessschedulelisting.component';
import { CreateNewWellnessScheduleComponent } from './component/createwellnessschedule/createwellnessschedule.component';
import { SelectedServicesComponent } from './component/selectedservices/selectedservices.component';
import { SavedServicesComponent } from './component/savedservices/savedservices.component';
import { DiagnosticScheduleService } from './../../diagnostics/schedule/schedule.service';


export const routes = [
  { path: '', component: WellnessSchedulesListingComponent },
  { path: 'schedulelistingofwellness', component: WellnessSchedulesListingComponent },
  { path: 'createscheduleforwellness', component: CreateNewWellnessScheduleComponent },
  { path: 'wellness_selectedservices/:pocId', component: SelectedServicesComponent },
  { path: 'savedwellness_services', component: SavedServicesComponent }

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
    WellnessSchedulesListingComponent,
    CreateNewWellnessScheduleComponent,
    SelectedServicesComponent,
    SavedServicesComponent

  ],
  providers: [
    WellnessScheduleService,
    DiagnosticScheduleService
  ]
})
export class WellnessScheduleModule {
  static routes = routes;
}