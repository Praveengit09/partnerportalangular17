import { AgmKeyModule } from './../../layout/widget/agmkey.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { RickshawChartModule } from '../../components/rickshaw/rickshaw.module';
import { Nvd3ChartModule } from '../../components/nvd3/nvd3.module';
import { HSDatePickerModule } from '../../layout/widget/datetimepicker/datetimepicker.module';
import { MatInputModule } from '@angular/material/input';
import { UserReportDashboardComponent } from './component/dashboard/userreportdashboard.component';
import { UserReportService } from './userreports.service';
import { GenderGraphDetails } from './gendergraphdetails/gendergraphdetails.component';
import { AgeGraphDetails } from './agegraphdetail/agegraphdetails.component';
import { HealthScoreGraphDetails } from './healthscoregraphdetails/healthscoregraphdetails.component';
import { RiskProfileGraphDetails } from './riskprofilegraphdetails/riskprofilegraphdetails.component';
import { HypertensionComponent } from './phrgraphdetailscomponent/hypertension/hypertension.component';
import { BusinessAdminService } from './../../businessadmin/businessadmin.service';
import { IschemicheartDiseaseComponent } from './phrgraphdetailscomponent/ischemicheartdisease/ischemicheartdisease.component';
import { DiabetesComponent } from './phrgraphdetailscomponent/diabetes/diabetes.component';
import { COPDComponent } from './phrgraphdetailscomponent/copd/copd.component';
import { AsthmaComponent } from './phrgraphdetailscomponent/asthma/asthma.component';
import { EpilepsyComponent } from './phrgraphdetailscomponent/epilepsy/epilepsy.component';
import { ChronicKidneyDiseaseComponent } from './phrgraphdetailscomponent/chronickidneydisease/chronickidneydisease.component';
import { ObesityComponent } from './phrgraphdetailscomponent/obesity/obesity.component';
import { HeatmapComponent } from './../heatmapmodule/heatmap.component';
import { SleepDisorderComponent } from './phrgraphdetailscomponent/sleepdisorder/sleepdisorder.component';




export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: UserReportDashboardComponent },
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        WidgetModule,
        UtilsModule,
        FormsModule,
        HSDatePickerModule,
        RickshawChartModule,
        ReactiveFormsModule,
        Nvd3ChartModule,
        MatInputModule,
        AgmKeyModule
    ],
    declarations: [
        UserReportDashboardComponent,
        AgeGraphDetails,
        GenderGraphDetails,
        HealthScoreGraphDetails,
        RiskProfileGraphDetails,
        HypertensionComponent,
        IschemicheartDiseaseComponent,
        DiabetesComponent,
        COPDComponent,
        AsthmaComponent,
        EpilepsyComponent,
        ChronicKidneyDiseaseComponent,
        HeatmapComponent,
        ObesityComponent,
        SleepDisorderComponent

    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        UserReportService,
        BusinessAdminService
    ]
})
export class UserReportsModule {
    static routes = routes;
}
