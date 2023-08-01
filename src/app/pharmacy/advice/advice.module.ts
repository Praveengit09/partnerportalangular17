import { NewOrderSummaryComponent } from './component/summary/ordersummary.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';

import { NewPharmacyAdviceDetailComponent } from './component/newadvicedetails/newadvicedetails.component';
import { PharmacyAdviceDetailComponent } from './component/advicedetails/advicedetail.component';
import { ViewOrderComponent } from './component/vieworder/vieworder.component';
import { PharmacyInvoiceComponent } from './component/invoice/invoice.component';
import { MedicineSalesModule } from '../medicinesales/medicinesales.module';
import { DoctorSearchModule } from '../../doctorSearch/doctorSearch.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export const routes = [
  { path: 'newadvice', component: NewPharmacyAdviceDetailComponent },
  { path: 'advicedetail', component: PharmacyAdviceDetailComponent },
  { path: 'invoice', component: PharmacyInvoiceComponent },
  { path: 'ordersummary', component: NewOrderSummaryComponent },
  { path: 'vieworder', component: ViewOrderComponent }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    //Ng2CompleterModule,

    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule,
    DoctorSearchModule,
    MedicineSalesModule,
    MatInputModule,
    MatButtonModule

  ],
  declarations: [
    NewPharmacyAdviceDetailComponent,
    PharmacyAdviceDetailComponent,
    PharmacyInvoiceComponent,
    NewOrderSummaryComponent,
    ViewOrderComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PharmacyAdviceModule {
  static routes = routes;
}