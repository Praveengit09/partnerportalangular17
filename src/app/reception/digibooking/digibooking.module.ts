import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// import { WidgetModule } from './../../layout/widget/widget.module';
import { UtilsModule } from './../../layout/utils/utils.module';

import { DigiRoomSlotsComponent } from './component/digiroomslots/digiroomslots.component';
import { DoctorSearchComponent } from './component/doctorsearch/doctorsearch.component';
import { CalendarBookingComponent } from './component/calendar/calendarBooking.component';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export const routes = [
  { path: 'doctorsearch', component: DoctorSearchComponent },
  { path: 'digiroomslots', component: DigiRoomSlotsComponent },
  { path: 'calendarbooking', component: CalendarBookingComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // WidgetModule,
    UtilsModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    HSDatePickerModule,
    PatientRegisterModule
  ],
  declarations: [
    DigiRoomSlotsComponent,
    DoctorSearchComponent,
    CalendarBookingComponent
  ]
})
export class DigiBookingModule {
  static routes = routes;
}