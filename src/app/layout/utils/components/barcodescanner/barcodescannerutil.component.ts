import { SpinnerService } from './../../../widget/spinner/spinner.service';
import { AfterViewInit, Component, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';

@Component({
    selector: 'barcode-util-component',
    templateUrl: './barcode.template.html',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./barcode.style.scss']
})
export class BarCodeScannerUtilComponent implements AfterViewInit {

    constructor(private spinnerService: SpinnerService) { }

    @ViewChild(BarcodeScannerLivestreamComponent, { static: false })
    barecodeScanner: BarcodeScannerLivestreamComponent;
    @Output()
    onValueUpdate: EventEmitter<any> = new EventEmitter();
    @Output()
    onClose: EventEmitter<any> = new EventEmitter();

    barcodeValue;

    ngAfterViewInit() {
        this.barecodeScanner.start();
    }

    onValueChanges(result) {
        // this.diagnosticsService.serviceItem.sampleId = JSON.parse(JSON.stringify(result.codeResult.code));
        // console.log(JSON.parse(JSON.stringify(result.codeResult.code)));
        const { code } = result.codeResult;
        this.onValueUpdate.emit({ value: code, code });
        this.onCodeClose();
    }

    onCodeClose() {
        this.barecodeScanner.stop();
        this.onClose.emit(true);
        // this.router.navigate(['app/diagnostics/orderresults']);
    }
}
