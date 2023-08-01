import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

//import 'bootstrap_calendar/bootstrap_calendar/js/bootstrap_calendar.js';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { PatientRegisterComponent } from './patientregister.component';
import { PatientRegisterService } from './patientregister.service'
import { MatInputModule } from '@angular/material/input';


@NgModule({
  imports: [
    CommonModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    HSDatePickerModule,
    MatInputModule
  ],
  declarations: [
    PatientRegisterComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [PatientRegisterService],
  exports: [
    PatientRegisterComponent
  ]
})
export class PatientRegisterModule { }
