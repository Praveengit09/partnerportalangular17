import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Routes } from '@angular/router';
import { DiagnosticGuard } from '../auth/guard/diagnostic-guard.service';
import { DiagnosticManagerGuard } from '../auth/guard/diagnosticmanager-guard.service';
import { DiagnosticReportGuard } from '../auth/guard/diagnosticreport-guard.service';
import { BusinessAdminService } from '../businessadmin/businessadmin.service';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { WidgetModule } from '../layout/widget/widget.module';
import { PatientRegisterModule } from '../patientregister/patientregister.module';
import { Nvd3ChartModule } from './../components/nvd3/nvd3.module';
import { HomeOrderFulfilledComponent } from './../diagnostics/component/homeorderfulfilled/homeorderfulfilled.component';
import { OrderFulfilledDiagnosticChartComponent } from './../diagnostics/component/orderfulfilleddiagnosticchart/orderfulfilleddiagnosticchart.component';
import { PartiallyfulfilledChartDiagnosticComponent } from './../diagnostics/component/partiallyfulfilledchartdiagnostic/partiallyfulfilledchartdiagnostic.component';
import { RevenueForDoctorDiagnosticComponent } from './../diagnostics/component/revenuefordoctordiagnostic/revenuefordoctordiagnostic.component';
import { RevenuesPerDayChartDiagnosticComponent } from './../diagnostics/component/revenuesperdaychartdiagnostic/revenuesperdaychartdiagnostic.component';
import { UpdatePricingComponent } from './../diagnostics/component/updatepricing/updatepricing.component';
import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { AddAndUpdateTestComponent } from './component/addandupdatetest/addandupdatetest.component';
import { DiagnosticDashBoardComponent } from './component/dashboard/diagnosticdashboard.component';
import { OrderResultsComponent } from './component/ordertestresults/ordertestresults.component';
import { DiagnosticsReportComponent } from './component/report/report.component';
import { SCPriceUpdateComponent } from './component/scpriceupdate/scpriceupdate.component';
import { TestCreationComponent } from './component/testcreation/testcreation.component';
import { DiagnosticAdminModule } from './diagnosticadmin/diagnosticadmin.module';
import { DiagnosticsComponent } from './diagnostics.component';


export const routes: Routes = [
  { path: '', redirectTo: 'diagnosticdashboard', pathMatch: 'full' },
  { path: 'diagnosticdashboard', component: DiagnosticDashBoardComponent },
  { path: 'orderresults', component: OrderResultsComponent },
  { path: 'orders', canActivate: [DiagnosticGuard], component: DiagnosticsComponent },
  { path: 'diagnosticsreports', canActivate: [DiagnosticReportGuard], component: DiagnosticsReportComponent },
  { path: 'mydiagnostics', canActivate: [DiagnosticReportGuard], component: DiagnosticsReportComponent },
  { path: 'testupdatepricing', canActivate: [DiagnosticReportGuard], component: UpdatePricingComponent },
  { path: 'collectionpriceupdate', canActivate: [DiagnosticManagerGuard], component: SCPriceUpdateComponent },
  { path: 'testcreation', canActivate: [DiagnosticReportGuard], component: TestCreationComponent },
  { path: 'addandupdatetest', canActivate: [DiagnosticReportGuard], component: AddAndUpdateTestComponent },
  { path: 'schedule', loadChildren: () => import('./schedule/schedule.module').then(x => x.DiagnosticScheduleModule) },
  { path: 'slotbooking', loadChildren: () => import('./slotbooking/slotbooking.module').then(x => x.SlotBookingModule) },
  { path: 'advice', loadChildren: () => import('./advice/diagnosticsadvice.module').then(x => x.DiagnosticsAdviceModule) },
  { path: 'homeorders', loadChildren: () => import('./homeorders/homeorder.module').then(x => x.HomeOrderModule) },
  { path: 'vdc', loadChildren: () => import('./vdc/vdcuserprivilege.module').then(x => x.VdcUserPrivilegeModule) },
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    PatientRegisterModule,
    FormsModule,
    HSDatePickerModule,
    RickshawChartModule,
    Nvd3ChartModule,
    MatInputModule,
    DiagnosticAdminModule
    //PaginationModule.forRoot()
  ],
  declarations: [
    DiagnosticsComponent,
    DiagnosticDashBoardComponent,
    DiagnosticsReportComponent,
    OrderFulfilledDiagnosticChartComponent,
    RevenuesPerDayChartDiagnosticComponent,
    PartiallyfulfilledChartDiagnosticComponent,
    HomeOrderFulfilledComponent,
    RevenueForDoctorDiagnosticComponent,
    UpdatePricingComponent,
    OrderResultsComponent,
    SCPriceUpdateComponent,
    TestCreationComponent,
    AddAndUpdateTestComponent

  ],
  providers: [
    BusinessAdminService
  ]
})
export class DiagnosticsModule {
  static routes = routes;
}
