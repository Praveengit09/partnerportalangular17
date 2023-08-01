import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { WidgetModule } from '../layout/widget/widget.module';
import { PocPopupComponent } from './pocpopup.component';
import { SpinnerComponent } from '../layout/widget/spinner/spinner.component';

export const routes: Routes = [
  { path: '', component: PocPopupComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    PocPopupComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    // WidgetModule
  ]
})
export class PocPopupModule {
  static routes = routes;
}
