import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { ProductComponent } from './component/listing/productorder.component';
import { WalkInInvoiceComponent } from './component/invoice/invoice.component';
// import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { DiagnosticsService } from '../../diagnostics/diagnostics.service';
import { BusinessAdminService } from '../../businessadmin/businessadmin.service';
import { ProductService } from './productorder.service';
import { EditOrderComponent } from './component/editorder/editorder.component';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { ProdsalesModule } from '../productsales/prodsales.module';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ProductComponent },
  { path: 'newadvice', component: EditOrderComponent },
  { path: 'invoice', component: WalkInInvoiceComponent },

]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // WidgetModule,
    UtilsModule,
    FormsModule,
    Ng2CompleterModule,
    // NKDatetimeModule,
    DoctorSearchModule,
    PatientRegisterModule,
    ReactiveFormsModule,
    ProdsalesModule,
    MatInputModule
  ],
  declarations: [
    ProductComponent,
    WalkInInvoiceComponent,
    EditOrderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DiagnosticsService,
    BusinessAdminService,
    ProductService
  ]
})
export class WalkInModule {
  static routes = routes;
}
