import { MedicineSalesModule } from './../medicinesales/medicinesales.module';
import { PocSearchModule } from './../../layout/utils/components/pocsearch/pocsearch.module';
import { UtilComponentsModule } from './../../layout/utils/components/utilcomponent.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';

import { ListCentralHomeOrderComponent } from './component/listing/listing.component';
import { CentralHomeOrderDetailsComponent } from './component/orderdetails/orderdetails.component';
import { MatInputModule } from '@angular/material/input';

export const routes: Routes = [
  { path: '', redirectTo: 'listing', pathMatch: 'full' },
  { path: 'listing', component: ListCentralHomeOrderComponent },
  { path: 'details', component: CentralHomeOrderDetailsComponent }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2CompleterModule,
    // NKDatetimeModule,
    WidgetModule,
    UtilsModule,
    FormsModule,
    MatInputModule,
    MedicineSalesModule,
    // UtilComponentsModule,
    PocSearchModule

  ],
  declarations: [
    ListCentralHomeOrderComponent,
    CentralHomeOrderDetailsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CentralHomeOrdersModule {
  static routes = routes;
}