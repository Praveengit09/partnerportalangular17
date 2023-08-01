import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { Nvd3ChartModule } from './../../components/nvd3/nvd3.module';
import { supplierRevenueComponent } from './component/reports/revenue/supplierrevenue.component';
import { SupplierOrderPerDay } from './component/reports/totalorderreports/supplierorderperday.component';
import { StockInformationComponent } from './component/stockdetails/stock.component';
import { EditSupplierInvoice } from './component/supplierinvoice/edit-invoice/edit-invoice.component';
import { InvoiceDetailsComponent } from './component/supplierinvoice/invoicedetails/invoicedetails.component';
import { InvoiceList } from './component/supplierinvoice/invoicelist/invoiceList.component';
import { ListSupplierOrder } from './component/supplierorder/listing/ListSupplierOrderComponent.component';
import { SupplierOrderDetailsComponent } from './component/supplierorder/orderdetails/orderdetails.component';

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { Ng2CompleterModule } from "ng2-completer";

//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { UtilsModule } from '../../layout/utils/utils.module';
import { WidgetModule } from '../../layout/widget/widget.module';

import { MatInputModule } from '@angular/material/input';
import { SupplierReportsDashboardComponent } from './component/reports/dashboard/dashboard.component';
import { UploadInventoryComponent } from './component/uploadinventory/uploadinventory.component';
import { InventoryComponent } from './component/inventory/inventory.component';

export const routes: Routes = [
  { path: '', redirectTo: 'orderlist', pathMatch: 'full' },
  { path: 'orderlist', component: ListSupplierOrder },
  { path: 'orderdetails', component: SupplierOrderDetailsComponent },
  { path: 'invoicelist', component: InvoiceList },
  { path: 'invoicedetails', component: InvoiceDetailsComponent },
  { path: 'editinvoice', component: EditSupplierInvoice },
  { path: 'reports', component: SupplierReportsDashboardComponent },
  { path: 'stock', component: StockInformationComponent },
  { path: 'uploadinventory', component: UploadInventoryComponent },
  { path: 'inventorymanagement', component: InventoryComponent }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2CompleterModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    MatInputModule,
    Nvd3ChartModule,
    NgxDaterangepickerMd.forRoot()
  ],
  declarations: [
    ListSupplierOrder,
    SupplierOrderDetailsComponent,
    InvoiceList,
    InvoiceDetailsComponent,
    EditSupplierInvoice,
    SupplierReportsDashboardComponent,
    SupplierOrderPerDay,
    supplierRevenueComponent,
    StockInformationComponent,
    UploadInventoryComponent,
    InventoryComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SupplierOrdersModule {
  static routes = routes;
}