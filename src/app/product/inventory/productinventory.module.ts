import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { ProductInventoryComponent } from './component/inventory/inventory.component';
import { ProductInventoryService } from './productinventory.service';
import { ProductStockComponent } from './component/stocksummary/productstock.component';
import { ProductStockOrderComponent } from './component/stockorder/productstockorder.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminService } from './../../admin/admin.service';
import { UpdateProductInformation } from './component/updateproduct/updateproductinformation.component';

export const routes: Routes = [
  { path: '', redirectTo: 'add', pathMatch: 'full' },
  { path: 'add', component: ProductInventoryComponent },
  { path: 'stock', component: ProductStockComponent },
  { path: 'stockorder', component: ProductStockOrderComponent },
  { path: 'updateproduct', component: UpdateProductInformation }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    Ng2CompleterModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule
    // NKDatetimeModule
  ],
  declarations: [
    ProductInventoryComponent,
    ProductStockComponent,
    ProductStockOrderComponent,
    UpdateProductInformation
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    ProductInventoryService,
    AdminService
  ]
})
export class ProductInventoryModule {
  static routes = routes;
}
