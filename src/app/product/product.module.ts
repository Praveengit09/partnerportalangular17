import { ProductDashboardGuard } from './../auth/guard/product-dash-guard';
import { ProductGuard } from './../auth/guard/product-guard.service';
import { ProductCentralService } from './productCentral.service';
import { CentralProductHomeOrderGuard } from './../auth/guard/centralproducthomeorder-guard.service';
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';
import { Nvd3ChartModule } from '../components/nvd3/nvd3.module';
import { ProductService } from './walkin/productorder.service';
import { WidgetModule } from '../layout/widget/widget.module';
import { AdminService } from '../admin/admin.service';

export const routes: Routes = [
  { path: '', canActivate: [ProductDashboardGuard], redirectTo: 'homeorder', pathMatch: 'full' },
  { path: 'homeorder', canActivate: [ProductDashboardGuard], loadChildren: () => import('./homeorder/homeorder.module').then(x => x.HomeOrdersModule) },
  { path: 'returns', canActivate: [ProductGuard], loadChildren: () => import('./returns/returns.module').then(x => x.ReturnsOrdersModule) },
  { path: 'walkin', loadChildren: () => import('./walkin/walkin.module').then(x => x.WalkInModule) },
  { path: 'inventory', loadChildren: () => import('./inventory/productinventory.module').then(x => x.ProductInventoryModule) },
  { path: 'centralhomeorder', canActivate: [CentralProductHomeOrderGuard], loadChildren: () => import('./centralhomeorders/centralhomeorder.module').then(x => x.CentralProductHomeOrdersModule) },
  { path: 'productDelivery', loadChildren: () => import('../productdelivery/productdelivery.module').then(x => x.ProductDeliveryModule) }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    RickshawChartModule,
    FormsModule,
    HSDatePickerModule,
    Nvd3ChartModule
  ],
  declarations: [
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    ProductService,
    AdminService,
    ProductCentralService
  ]
})
export class ProductModule {
  static routes = routes;
}
