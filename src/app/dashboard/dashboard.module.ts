import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule,Routes } from '@angular/router';
//import 'bootstrap_calendar/bootstrap_calendar/js/bootstrap_calendar.js';

import { DashboardComponent } from './dashboard.component';
import { WidgetModule } from '../layout/widget/widget.module';
import { UtilsModule } from '../layout/utils/utils.module';
import { RickshawChartModule } from '../components/rickshaw/rickshaw.module';

export const routes :Routes= [
  { path: '', component: DashboardComponent, pathMatch: 'full' }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    WidgetModule,
    UtilsModule,
    RickshawChartModule
  ],
  declarations: [
    DashboardComponent
  ]
})
export class DashboardModule {
  static routes = routes;
}
