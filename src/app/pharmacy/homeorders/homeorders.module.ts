import { NewOrderSummaryComponent } from './component/advise/ordersummary/ordersummary.component';
import { NewOrderInvoiceComponent } from './component/advise/invoice/invoice.component';
import { EditNewOrderComponent } from './component/advise/editorder/editorder.component';

import { AddressDropdownModule } from './../../layout/utils/components/HsPatientAddressDropdown/addressdropdown.module';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatInputModule } from '@angular/material/input';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';

import { PharmacyHomeOrderComponent } from './component/homeorders/homeorder.component';
import { PharmacyPrescriptionComponent } from './component/prescription/prescription.component';
import { PharmacyEditPrescriptionComponent } from './component/editprescription/editprescription.component';
import { CheckoutSummaryComponent } from './component/checkoutsummary/checkoutsummary.component';
import { EditStockPrescriptionComponent } from './component/editstockprescription/editstockprescription.component';
import { MedicineSalesModule } from '../medicinesales/medicinesales.module';

export const routes: Routes = [
  { path: '', redirectTo: 'homeorders', pathMatch: 'full' },
  { path: 'homeorders', component: PharmacyHomeOrderComponent },
  { path: 'prescription', component: PharmacyPrescriptionComponent },
  { path: 'edit', component: PharmacyEditPrescriptionComponent },
  { path: 'editstock', component: EditStockPrescriptionComponent },
  { path: 'checkout', component: CheckoutSummaryComponent },
  { path: 'new-order', component: EditNewOrderComponent },
  { path: 'new-invoice', component: NewOrderInvoiceComponent },
  { path: 'new-summary', component: NewOrderSummaryComponent },
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    //Ng2CompleterModule,
    AddressDropdownModule,
    HSDatePickerModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule,
    MedicineSalesModule,
    MatInputModule,
    //UtilComponentsModule
  ],
  declarations: [
    PharmacyHomeOrderComponent,
    PharmacyPrescriptionComponent,
    PharmacyEditPrescriptionComponent,
    EditStockPrescriptionComponent,
    CheckoutSummaryComponent,
    EditNewOrderComponent,
    NewOrderInvoiceComponent,
    NewOrderSummaryComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class HomeOrdersModule {
  static routes = routes;
}