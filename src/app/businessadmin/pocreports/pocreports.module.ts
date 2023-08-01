import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Nvd3ChartModule } from '../../components/nvd3/nvd3.module';

import { BusinessAdminGuard } from '../../auth/guard/businessadmin-guard.service';

import { SuperAdminService } from '../../superadmin/superadmin.service';
import { BusinessAdminService } from '../businessadmin.service';

import { BookingReportComponent } from './component/bookingreport/bookingreport.component';
import { PocTransferPriceComponent } from './component/poctransferprice/poctransferprice.component';
import { AverageConsultationTime } from './component/averageconsultationtime/averageconsultationtime.component';
import { AverageQueueTimeDiagnosticOrder } from './component/averagequeuetimeDiagsnoticsOrders/averagequeuetimeDiagsnoticsOrders.component';
import { AverageQueueTimePaymentQueue } from './component/averagequeuetimePaymentQueue/averagequeuetimePaymentQueue.component';
import { AverageQueueTimePharmacyOrders } from './component/averagequeuetimePharmacyOrders/averagequeuetimePharmacyOrders.component';
import { AverageTimeOfDoctorConsultation } from './component/averageTimeOfDoctorConsultation/averagetimeofdoctorconsultation.component';
import { AverageVisitTime } from './component/averagevisittime/averagevisittime.component';
import { AverageWaitingTime } from './component/averagewaitingtime/averagewaitingtime.component';
import { AmountBasedOnPaymentMode } from './component/basedonpaymentmode/basedonpaymentmode.component';
import { DetailedFinancialReportComponent } from './component/detailedfinancialreport/detailedfinancialreport.component';
import { DoctorPrescriptionSummary } from './component/leakages/doctorprescriptionsummary.component';
import { PeriodicFinancialDetailComponent } from './component/periodicfinancialdetails/periodicfinancialdetails.componet';
import { PeriodicFinancialReportComponent } from './component/periodicfinancialreport/periodicfinancialreport.component';
import { RevenuePerDay } from './component/revenueperday/revenueperday.component';
import { RevenuePerDoctor } from './component/revenueperdoc/revenueperdoc.component';
import { RevenuePerPoc } from './component/revenueperpoc/revenueperpoc.component';
import { RevenuePerService } from './component/revenueperservice/revenueperservice.component';
import { SlotsPerDay } from './component/slotsperday/slotsperday.component';
import { SlotsPerDayPerPoc } from './component/slotsperdayperpoc/slotsperdayperpoc.component';
import { TotalRevenueOfVideoWalkinConsultation } from './component/videowalkinconsultation/videowalkinconsultation.component';
import { HSDatePickerModule } from '../../layout/widget/datetimepicker/datetimepicker.module';
import { BusinessAdminDashboardComponent } from './component/dashboard/dashboard.component';
import { ViewFinanceTransactionsComponent } from './component/viewfinancetransactions/viewfinancetransactions.component';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { RickshawChartModule } from '../../components/rickshaw/rickshaw.module';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: BusinessAdminDashboardComponent },
    { path: 'monthlyreport', canActivate: [BusinessAdminGuard], component: PeriodicFinancialReportComponent },
    { path: 'periodicdetails', canActivate: [BusinessAdminGuard], component: PeriodicFinancialDetailComponent },
    { path: 'detailedreport', canActivate: [BusinessAdminGuard], component: DetailedFinancialReportComponent },
    { path: 'transferprice', canActivate: [BusinessAdminGuard], component: PocTransferPriceComponent },
    { path: 'bookingreport', canActivate: [BusinessAdminGuard], component: BookingReportComponent },
    { path: 'viewtransactions', canActivate: [BusinessAdminGuard], component: ViewFinanceTransactionsComponent },
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
        BusinessAdminDashboardComponent,
        RevenuePerDay,
        RevenuePerService,
        DoctorPrescriptionSummary,
        RevenuePerPoc,
        AverageTimeOfDoctorConsultation,
        RevenuePerDoctor,
        SlotsPerDay,
        SlotsPerDayPerPoc,
        AverageWaitingTime,
        AverageVisitTime,
        AverageConsultationTime,
        AverageQueueTimeDiagnosticOrder,
        AverageQueueTimePaymentQueue,
        AverageQueueTimePharmacyOrders,
        AmountBasedOnPaymentMode,
        TotalRevenueOfVideoWalkinConsultation,
        PeriodicFinancialReportComponent,
        PeriodicFinancialDetailComponent,
        DetailedFinancialReportComponent,
        PocTransferPriceComponent,
        BookingReportComponent,
        ViewFinanceTransactionsComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
    providers: [
        BusinessAdminService,
        SuperAdminService
    ], exports: [DoctorPrescriptionSummary]
})
export class POCReportsModule {
    static routes = routes;
}
