import { HSDatePickerModule } from './../layout/widget/datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';

import { WidgetModule } from '../layout/widget/widget.module';
import { Nvd3ChartModule } from './../components/nvd3/nvd3.module';
import { MatInputModule } from '@angular/material/input';
import { MISDashBoardComponent } from './dashboard/misdashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: MISDashBoardComponent },
    { path: 'users', loadChildren: () => import('./userreports/userreports.module').then(x => x.UserReportsModule) }
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
        MatInputModule
    ],
    declarations: [
        MISDashBoardComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
    ]
})
export class ManagementInformationSystemModule {
    static routes = routes;
}
