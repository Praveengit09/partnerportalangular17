import { PharmacyDashboardGuard } from './../auth/guard/pharmacy-dash-guard';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';

import { WidgetModule } from '../layout/widget/widget.module';
import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { PharmacyReportComponent } from './component/report/report.component';
import { PharmacyGuard } from '../auth/guard/pharmacy-guard.service';
import { PharmacyReportGuard } from '../auth/guard/pharmareport-guard.service';
import { InventoryGuard } from '../auth/guard/inventory-guard.service';
import { PharmacyHomeOrderGuard } from '../auth/guard/pharmacyhomeorder-guard.service';
import { PharmacyDashboardComponent } from './../pharmacy/component/dashboard/pharmacydashboard.component';
import { Nvd3ChartModule } from './../components/nvd3/nvd3.module';
import { OrderPerdayPharmacyChartComponent } from './../pharmacy/component/orderperdaypharmacychart/orderperdaypharmacychart.component';
import { RevenuePerdayPharmacyChartComponent } from './../pharmacy/component/revenueperdaypharmacychart/revenueperdaypharmacychart.component';
import { RevenuePerDocPerDayPharmacyChartComponent } from './../pharmacy/component/revenueperdocperdaypharmacychart/revenueperdocperdaypharmacychart.component';
import { HomeDeliveryChartComponent } from './../pharmacy/component/homedeliverychart/homedeliverychart.component';
import { DiagnosticsService } from '../diagnostics/diagnostics.service';
import { BusinessAdminService } from '../businessadmin/businessadmin.service';
import { CentralPharmacyHomeOrderGuard } from '../auth/guard/centralpharmacyhomeorder-guard.service';
import { MatInputModule } from '@angular/material/input';
import { PharmacyComponent } from './advice/component/listing/pharmacy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pharmacydashboard', pathMatch: 'full' },
  { path: 'pharmacydashboard', canActivate: [PharmacyDashboardGuard], component: PharmacyDashboardComponent },
  { path: 'orders', canActivate: [PharmacyGuard], component: PharmacyComponent },
  { path: 'mypharmacy', canActivate: [PharmacyReportGuard], component: PharmacyReportComponent },
  { path: 'advice', loadChildren: () => import('./advice/advice.module').then(x => x.PharmacyAdviceModule) },
  { path: 'inventory', canActivate: [InventoryGuard], loadChildren: () => import('./inventory/inventory.module').then(x => x.InventoryModule) },
  { path: 'homeorder', canActivate: [PharmacyHomeOrderGuard], loadChildren: () => import('./homeorders/homeorders.module').then(x => x.HomeOrdersModule) },
  { path: 'returns', canActivate: [PharmacyHomeOrderGuard], loadChildren: () => import('./returns/pharmacyreturnsorders.module').then(x => x.PharmacyReturnsOrdersModule) },
  { path: 'centralhomeorder', canActivate: [CentralPharmacyHomeOrderGuard], loadChildren: () => import('./centralhomeorders/centralhomeorders.module').then(x => x.CentralHomeOrdersModule) },
  { path: 'centralinventory', loadChildren: () => import('./centralinventory/centralinventory.module').then(x => x.CentralInventoryModule) },
  { path: 'pharmacyDelivery', loadChildren: () => import('../productdelivery/productdelivery.module').then(x => x.ProductDeliveryModule) },
  { path: 'supplier', loadChildren: () => import('./supplier/supplierorders.module').then(x => x.SupplierOrdersModule) },
  { path: 'inpatientorders', loadChildren: () => import('./inpatientorders/inpatientorders.module').then(x => x.InPatientOrdersModule) },
  { path: 'otpatientorders', loadChildren: () => import('./operationtheatrepatientorders/otpatientorders.module').then(x => x.OtPatientOrdersModule) }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    //Ng2CompleterModule,

    HSDatePickerModule,
    RickshawChartModule,
    PatientRegisterModule,
    ReactiveFormsModule,
    Nvd3ChartModule,
    MatInputModule
  ],
  declarations: [
    PharmacyDashboardComponent,
    PharmacyComponent,
    PharmacyReportComponent,
    OrderPerdayPharmacyChartComponent,
    RevenuePerdayPharmacyChartComponent,
    RevenuePerDocPerDayPharmacyChartComponent,
    HomeDeliveryChartComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    DiagnosticsService,
    BusinessAdminService
  ]
})
export class PharmacyModule {
  static routes = routes;
}
