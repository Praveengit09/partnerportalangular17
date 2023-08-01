import { AddressDropdownModule } from './../../layout/utils/components/HsPatientAddressDropdown/addressdropdown.module';
// import { PocSearchModule } from './../../layout/utils/components/pocsearch/pocsearch.module';
import { HomeOrderSummaryComponent } from './component/neworder/summary/summary.component';
// import { UtilComponentsModule } from './../../layout/utils/components/utilcomponent.module';
import { EditHomeOrderComponent } from './component/neworder/editorder/editorder.component';
import { HomeInvoiceComponent } from './component/neworder/invoice/invoice.component';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { ProductGuard } from '../../auth/guard/product-guard.service';
import { OrderListComponent } from './component/orderlist/orderlist.component';
import { ViewOrderComponent } from './component/vieworder/vieworder.component';
import { EditOrderComponent } from './component/editorder/editorder.component';
import { SummaryComponent } from './component/summary/summary.component';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { ProdsalesModule } from '../productsales/prodsales.module';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', canActivate: [ProductGuard], component: OrderListComponent },
  { path: 'view', component: ViewOrderComponent },
  { path: 'edit', component: EditOrderComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'neworder', component: EditHomeOrderComponent },
  { path: 'ordersummary', component: HomeOrderSummaryComponent },
  { path: 'invoice', component: HomeInvoiceComponent },
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2CompleterModule,
    // NKDatetimeModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    PatientRegisterModule,
    ProdsalesModule,
    MatInputModule,
    // UtilComponentsModule
    // PocSearchModule,
    AddressDropdownModule
  ],
  declarations: [
    OrderListComponent,
    ViewOrderComponent,
    EditOrderComponent,
    SummaryComponent,
    HomeInvoiceComponent,
    EditHomeOrderComponent,
    HomeOrderSummaryComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class HomeOrdersModule {
  static routes = routes;
}