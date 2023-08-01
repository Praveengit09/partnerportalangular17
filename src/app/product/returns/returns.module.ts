import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';

import { ReturnListComponent } from './component/list/list.component';
import { ReturnOrderComponent } from './component/order/order.component';
import { EditReturnComponent } from './component/edit/edit.component';
import { ReturnSummaryComponent } from './component/summary/summary.component';
import { AdminService } from './../../admin/admin.service';


export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ReturnListComponent },
  { path: 'order', component: ReturnOrderComponent },
  { path: 'edit', component: EditReturnComponent },
  { path: 'summary', component: ReturnSummaryComponent },
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    //Ng2CompleterModule,

    HSDatePickerModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule
  ],
  declarations: [
    ReturnListComponent,
    ReturnOrderComponent,
    EditReturnComponent,
    ReturnSummaryComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    AdminService,

  ]
})
export class ReturnsOrdersModule {
  static routes = routes;
}