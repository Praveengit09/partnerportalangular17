import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProdsalesComponent } from './prodsales.component';
import { WidgetModule } from '../../layout/widget/widget.module';
import { MatInputModule } from '@angular/material/input';
import { PaySummaryCommponent } from './prod-pay-summary/pay-summary.component';

@NgModule({
  imports: [
    CommonModule,
    Ng2CompleterModule,
    FormsModule,
    WidgetModule,
    MatInputModule
  ],
  declarations: [
    ProdsalesComponent,
    PaySummaryCommponent
  ],
  exports: [
    ProdsalesComponent,
    PaySummaryCommponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ProdsalesModule {

}