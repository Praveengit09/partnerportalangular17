import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HSDatePickerModule } from './../../layout/widget/datetimepicker/datetimepicker.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../superadmin/superadmin.service';
import { BusinessAdminService } from '../businessadmin.service';
import { AccountingComponent } from './component/accounting/accounting.component';
import { BrandReportDashboardComponent } from './component/dashboard/brandReportDashboard.component';
import { BrandDetailedTransactionComponent } from './component/detailedtransactions/brandDetailedTransaction.component';
import { ManageCommunityPaymentsComponent } from './component/managecommunitypaymentslisting/managecommunitypayments.component';
import { ManageCommunityPaymentInformationComponent } from './component/paymentinformation/paymentinformation.component';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { RickshawChartModule } from '../../components/rickshaw/rickshaw.module';
import { Nvd3ChartModule } from '../../components/nvd3/nvd3.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { RevenueComponent } from './component/revenue/revenue.component';
import { RevenuePerPocComponent } from './component/revenueperpoc/revenueperpoc.component';
import { RevenuePerServiceComponent } from './component/revenueperservice/revenueperservice.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { PatientRegisterModule } from '../../patientregister/patientregister.module';
import { MyMedicRevenueComponent } from './component/mymedicrevenue/mymedicrevenue.component';
import { PocServiceComponent } from '../cxoDashboard/components/pocservice/pocservice.component';
import { PocRevenueComponent } from '../cxoDashboard/components/pocrevenue/pocrevenue.component';
import { StatePocComponent } from '../cxoDashboard/components/statepoc/statepoc.component';
export const routes:Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: BrandReportDashboardComponent },
    { path: 'detailedreport', component: BrandDetailedTransactionComponent },
    { path: 'accounting', component: AccountingComponent },
    { path: 'communitypayments', component: ManageCommunityPaymentsComponent },
    { path: 'communitypaymentinformation', component: ManageCommunityPaymentInformationComponent },
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
        PatientRegisterModule,
        MatPaginatorModule,
        NgxDaterangepickerMd.forRoot(),
    ],
    declarations: [
        BrandReportDashboardComponent,
        BrandDetailedTransactionComponent,
        AccountingComponent,
        ManageCommunityPaymentsComponent,
        ManageCommunityPaymentInformationComponent,
        RevenueComponent,
        RevenuePerPocComponent,
        RevenuePerServiceComponent,
        MyMedicRevenueComponent,
        PocRevenueComponent,
        PocServiceComponent,
        StatePocComponent

    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        BusinessAdminService,
        SuperAdminService
    ]
})
export class BrandReportsModule {
    static routes = routes;
}
