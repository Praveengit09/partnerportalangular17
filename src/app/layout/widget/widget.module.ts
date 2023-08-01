import { HSDatePickerModule } from './datetimepicker/datetimepicker.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageComponent } from './message/message.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { SpinnerService } from './spinner/spinner.service';
import { MonthpickerComponent } from './monthpicker/monthpicker.component';
import { HSTableModule } from './table/hstable.module';
import { HSWaitComponent } from './wait/hswait.component';
import { HSDatePipe } from './util/hsdate';
import { DefaultImagePipe } from "../pipes/defaultimage.pipe";
import { HSSelectModule } from './dropdowntable/hs-select.module';
import { HsMapAutoCompleteModule } from './hsMapAutoComplete/hsMapAutoComplete.module';
import { RefreshModule } from './autorefresh/refresh.module';
import { NGTableModule } from './ngtable/ngtable.module';
import { Days2Year } from './pipes/day2yearPipe';
import { DiscountModule } from './slotbookingdiscount/slotbookingdiscount.module';
import { CartDiscountModule } from './cartdiscount/cartdiscount.module';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ChartsGraph } from './charts/charts.component';
import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';
import { SampleCollectionModalModule } from './samplecollectionmodal/samplecollectionmodal.module';

@NgModule({
  imports: [
    CommonModule,
    HSTableModule,
    HSSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HsMapAutoCompleteModule,
    RefreshModule,
    DiscountModule,
    CartDiscountModule,
    MatInputModule,
    MatFormFieldModule,
    SampleCollectionModalModule
  ],
  declarations: [
    // Widget,
    MessageComponent,
    SpinnerComponent,
    MonthpickerComponent,
    HSWaitComponent,
    HSDatePipe,
    DefaultImagePipe,
    Days2Year,
    ChartsGraph
  ],
  providers: [SpinnerService],
  exports: [
    // Widget,
    MessageComponent,
    SpinnerComponent,
    HSTableModule,
    NGTableModule,
    HSDatePickerModule,
    HSWaitComponent,
    HSDatePipe,
    MonthpickerComponent,
    HSSelectModule,
    DefaultImagePipe,
    HsMapAutoCompleteModule,
    RefreshModule,
    DiscountModule,
    CartDiscountModule,
    Days2Year,
    ChartsGraph,
    BarcodeScannerLivestreamModule,
    SampleCollectionModalModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WidgetModule {
}
