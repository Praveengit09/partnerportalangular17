import { BarCodeScannerUtilModule } from './../../layout/utils/components/barcodescanner/barcode.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { WidgetModule } from '../../layout/widget/widget.module';
import { UtilsModule } from '../../layout/utils/utils.module';
import { MedicineSalesComponent } from './medicinesales.component';
import { MatInputModule } from '@angular/material/input';
import { PaySummaryCommponent } from './rx-pay-summary/pay-summary.component';

@NgModule({
    imports: [
        CommonModule,
        WidgetModule,
        UtilsModule,
        FormsModule,
        MatInputModule,
        BarCodeScannerUtilModule
    ],
    declarations: [
        MedicineSalesComponent,
        PaySummaryCommponent
    ],
    exports: [
        MedicineSalesComponent,
        PaySummaryCommponent
    ]
})
export class MedicineSalesModule { }