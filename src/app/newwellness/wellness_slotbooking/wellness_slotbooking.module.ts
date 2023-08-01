import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UtilsModule } from '../../layout/utils/utils.module';
import { WidgetModule } from '../../layout/widget/widget.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { WellnessSlotQueueComponent } from './component/wellness_slotqueue/wellness_slotqueue.component';
import { WellnessSlotSelectionComponent } from './component/wellness_slotselection/wellness_slotselection.component';
import { WellnessSlotSummaryComponent } from './component/wellness_slotsummary/wellness_slotsummary.component';
import { WellnessSlotBookingService } from './wellness_slotbooking.service';

export const routes = [
  { path: '', component: WellnessSlotQueueComponent },
  { path: 'wellness_slotqueue', component: WellnessSlotQueueComponent },
  { path: 'wellness_slotsummary', component: WellnessSlotSummaryComponent },
  { path: 'wellness_slotselection', component: WellnessSlotSelectionComponent }
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
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    DoctorSearchModule
  ],
  declarations: [
    WellnessSlotQueueComponent,
    WellnessSlotSummaryComponent,
    WellnessSlotSelectionComponent
  ],
  providers: [WellnessSlotBookingService]
})
export class WellnessSlotBookingModule {
  static routes = routes;
}