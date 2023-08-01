import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, CanActivate, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';
import { BusinessAdminService } from "./businessadmin.service";
import { Nvd3ChartModule } from '../components/nvd3/nvd3.module';
import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { SuperAdminService } from '../superadmin/superadmin.service';
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';

export const routes: Routes = [
  { path: '', redirectTo: 'poc', pathMatch: 'full' },
  { path: 'poc', loadChildren: () => import('./pocreports/pocreports.module').then(x => x.POCReportsModule) },
  { path: 'platform', loadChildren: () => import('./platformreports/platformreports.module').then(x => x.PlatformReportsModule) },
  { path: 'brand', loadChildren: () => import('./brandreports/brandreports.module').then(x => x.BrandReportsModule) },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    FormsModule,
    RickshawChartModule,
    HSDatePickerModule,
    Nvd3ChartModule,
    PatientRegisterModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    NgxDaterangepickerMd.forRoot()
  ],
  declarations: [
    // DefaultBusinessDashboardComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    //NO_ERRORS_SCHEMA

  ],
  providers: [
    BusinessAdminService,
    SuperAdminService
  ]
})
export class BusinessAdminModule {
  static routes = routes;
}
