import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DiagnosticAppointmentGuard } from '../../auth/guard/diagnostic-appointment-guard.service';
import { UtilsModule } from '../../layout/utils/utils.module';
import { WidgetModule } from '../../layout/widget/widget.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { SlotQueueComponent } from './component/slotqueue/slotqueue.component';
import { SlotSelectionComponent } from './component/slotselection/slotselection.component';
import { SlotSummaryComponent } from './component/slotsummary/slotsummary.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { AddressDropdownModule } from '../../layout/utils/components/HsPatientAddressDropdown/addressdropdown.module';

export const routes = [
  { path: 'slotqueue', canActivate: [DiagnosticAppointmentGuard], component: SlotQueueComponent },
  { path: 'slotselection/:subType/:cb', component: SlotSelectionComponent },
  { path: 'slotselection', component: SlotSelectionComponent },
  { path: 'slotsummary', component: SlotSummaryComponent }
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
    DoctorSearchModule,
    AddressDropdownModule
  ],
  declarations: [
    SlotQueueComponent,
    SlotSelectionComponent,
    SlotSummaryComponent
  ]
})
export class SlotBookingModule {
  static routes = routes;
}