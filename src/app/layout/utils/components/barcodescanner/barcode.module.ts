import { BarCodeScannerUtilComponent } from './barcodescannerutil.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// import { BrowserModule } from "@angular/platform-browser";
// import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";
import { UtilComponentsService } from '../uticomponent.service';
import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';
// BarcodeScannerLivestreamModule
@NgModule({
    imports: [CommonModule,BarcodeScannerLivestreamModule ],
    declarations: [BarCodeScannerUtilComponent],
    exports: [BarCodeScannerUtilComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [UtilComponentsService]
})
export class BarCodeScannerUtilModule { }
