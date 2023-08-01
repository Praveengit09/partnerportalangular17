import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';

import { PrescriptionComponent } from './component/prescriptionlist/prescription.component';
import { ApprovePrescriptionComponent } from './component/approveprescription/approveprescription.component';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
  { path: '', redirectTo: 'prescription', pathMatch: 'full' },
  { path: 'approveprescription', component: ApprovePrescriptionComponent },
  { path: 'prescription', component: PrescriptionComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // WidgetModule,
    UtilsModule,
    FormsModule,
    HSDatePickerModule,
    MatInputModule
  ],
  declarations: [
    PrescriptionComponent,
    ApprovePrescriptionComponent
  ]
})
export class PrescriptionModule {
  static routes = routes;
}