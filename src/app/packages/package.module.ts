import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UtilsModule } from '../layout/utils/utils.module';
import { WidgetModule } from '../layout/widget/widget.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';

import { PatientRegisterModule } from '../patientregister/patientregister.module';

import { PackageComponent } from "./package.component";
import { PaymentService } from '../payment/payment.service';
import { ViewSpecialistComponent } from './viewspecialist/viewspecialist.component';
import { AssignPackagesComponent } from './assignpackages/assignpackages.component';
import { AdminService } from '../admin/admin.service';


export const routes: Routes = [
  { path: '', component: PackageComponent, pathMatch: 'full' },
  { path: 'specialists', component: ViewSpecialistComponent },
  { path: 'assignpackages', component: AssignPackagesComponent },

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UtilsModule,
    WidgetModule,
    FormsModule,
    HSDatePickerModule,
    RickshawChartModule,
    PatientRegisterModule
  ],
  declarations: [
    PackageComponent,
    ViewSpecialistComponent,
    AssignPackagesComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    PaymentService,
    AdminService
  ]
})
export class PackageModule {
  static routes = routes;
}