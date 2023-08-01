import { TransferOrderDetails } from './component/transferorderdetails/orderdetails.component';
import { TransferRequestComponent } from './component/transferrequest/transferrequest.component';
import { TransferComponent } from './component/transferlist/transfer.component';
// import { Payment_UI_Module } from './../../layout/utils/components/payment/payment.module';
import { InvoiceDetails } from './component/invoicedetails/invoicedetails.component';
import { PharmacySupplierOrderList } from './component/orderlist/pharmacySupplierOrderList.component';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';

import { InventoryComponent } from './component/inventory/inventory.component';
import { UploadInventoryComponent } from './component/uploadinventory/uploadinventory.component';
import { StockinformationComponent } from './component/stock/stock.component';
import { StockOrderinformationComponent } from './component/stockorder/stockorder.component'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { PharmacyResultsComponent } from './component/pharmacyresults/pharmacyresults.component';
import { UploadDeliveryChargesComponent } from './component/uploaddeliverycharges/uploaddeliverycharges.component';

export const routes = [
  //{path: '', redirectTo: 'inventorymanagement', pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventorymanagement', component: InventoryComponent },
  { path: 'stock', component: StockinformationComponent },
  { path: 'uploadinventory', component: UploadInventoryComponent },
  { path: 'stockorder', component: StockOrderinformationComponent },
  { path: 'orderlist', component: PharmacySupplierOrderList },
  { path: 'invoicedetails', component: InvoiceDetails },
  { path: 'invoicedetails/:orderId/:invoiceId', component: InvoiceDetails },
  { path: 'results', component: PharmacyResultsComponent },
  { path: 'transfer', component: TransferComponent },
  { path: 'transferrequest', component: TransferRequestComponent },
  { path: 'transferdetails', component: TransferOrderDetails },
  { path: 'uploaddeliverycharge', component: UploadDeliveryChargesComponent },
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
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    PatientRegisterModule,
    // Payment_UI_Module,
  ],
  declarations: [
    DashboardComponent,
    InventoryComponent,
    UploadInventoryComponent,
    StockinformationComponent,
    StockOrderinformationComponent,
    PharmacySupplierOrderList,
    InvoiceDetails,
    PharmacyResultsComponent,
    TransferRequestComponent,
    TransferComponent,
    TransferOrderDetails,
    UploadDeliveryChargesComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class InventoryModule {
  static routes = routes;
}