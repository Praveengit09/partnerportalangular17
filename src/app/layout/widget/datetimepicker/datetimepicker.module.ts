import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HSDatePickerComponent } from './datetimepicker.component';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
// import { AmazingTimePickerModule } from 'amazing-time-picker';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // AmazingTimePickerModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule,
    MatInputModule
  ],
  declarations: [
    HSDatePickerComponent
  ],
  exports: [HSDatePickerComponent]
})

export class HSDatePickerModule {
}