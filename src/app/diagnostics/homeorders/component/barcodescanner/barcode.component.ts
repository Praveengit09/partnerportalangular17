import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { InvestigationTestDetails } from '../../../../model/diagnostics/investigationTestDetails';
import { AuthService } from "./../../../../auth/auth.service";
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { DiagnosticsService } from './../../../diagnostics.service';
// tslint:disable-next-line:no-var-requires

@Component({
    selector: 'barcode-component',
    templateUrl: './barcode.template.html',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./barcode.style.scss']
})
export class BarCodeScannerComponent implements AfterViewInit {

    constructor(private diagnosticsService: DiagnosticsService, private router: Router,
        private authService: AuthService, 
        private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService) {

    }

    @ViewChild(BarcodeScannerLivestreamComponent, { static: false })
    barecodeScanner: BarcodeScannerLivestreamComponent;

    barcodeValue;
    serviceItem: InvestigationTestDetails;

    ngAfterViewInit() {
        this.barecodeScanner.start();
    }

    onValueChanges(result) {
        this.diagnosticsService.serviceItem.sampleId = JSON.parse(JSON.stringify(result.codeResult.code));
        this.onClose();
    }

    onClose() {
        this.barecodeScanner.stop();
        this.router.navigate(['app/diagnostics/orderresults']);
    }
}
