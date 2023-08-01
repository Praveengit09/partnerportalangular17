import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../superadmin/superadmin.service';
import { BrandRevenueComponent } from './component/brandrevenue/brandrevenue.component';
import { BusinessAdminService } from '../businessadmin.service';
import { BrandPocRevenueComponent } from './component/brandpocrevenue/brandpocrevenue.component';
import { SettlePaymentComponent } from './component/settlepayment/settlepayment.component';
import { ReconciliationPeriodicDetails } from './component/reconciliationperiodicdetails/reconciliationperiodicdetails.component';
import { ReconciliationReportComponent } from './component/reconciliationreport/reconciliationreport.component';
import { HSBusinessAdminGuard } from '../../auth/guard/hsbusinessadmin-guard.service';
import { HSDatePickerModule } from '../../layout/widget/datetimepicker/datetimepicker.module';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../../layout/widget/widget.module';
import { RickshawChartModule } from '../../components/rickshaw/rickshaw.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { Nvd3ChartModule } from '../../components/nvd3/nvd3.module';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

export const routes: Routes = [
    { path: '', redirectTo: 'brandreport', pathMatch: 'full' },
    { path: 'brandreport', canActivate: [HSBusinessAdminGuard], component: BrandRevenueComponent },
    { path: 'brandpocreport', canActivate: [HSBusinessAdminGuard], component: BrandPocRevenueComponent },
    { path: 'reconciliation', canActivate: [HSBusinessAdminGuard], component: ReconciliationReportComponent },
    { path: 'reconciliationdetails', canActivate: [HSBusinessAdminGuard], component: ReconciliationPeriodicDetails },
    { path: 'settlepayment', canActivate: [HSBusinessAdminGuard], component: SettlePaymentComponent }
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
        MatTableModule,
        MatInputModule,
        MatSortModule,
        MatPaginatorModule,
        NgxDaterangepickerMd.forRoot()
    ],
    declarations: [
        ReconciliationReportComponent,
        ReconciliationPeriodicDetails,
        BrandRevenueComponent,
        BrandPocRevenueComponent,
        SettlePaymentComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        BusinessAdminService,
        SuperAdminService
    ]
})
export class PlatformReportsModule {
    static routes = routes;
}
