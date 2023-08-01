import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { DiagnosticsService } from './../../../diagnostics.service';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service'
import { AuthService } from './../../../../auth/auth.service';
import { CartItem } from './../../../../model/basket/cartitem';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { BasketRequest } from './../../../../model/basket/basketRequest';

@Component({
  selector: '[invoice-component]',
  templateUrl: './invoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./invoice.style.scss']
})
export class DiagnosticsInvoiceComponent {
  diagnosticsAdviseTrack: CartItem;
  cartItem: BasketRequest;
  discountAmount: number = 0;

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "Successfully Updated";

  constructor(private diagnosticsService: DiagnosticsService, private auth: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage) {
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.diagnosticsAdviseTrack = diagnosticsService.diagnosticsAdviseTrack;
  }

  ngOnInit(): void {
    this.showMessage = true;
    this.isError = false;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;

    //local storage , save all your data here
    if (this.diagnosticsAdviseTrack) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('diagnosticsAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.diagnosticsAdviseTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.diagnosticsAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('diagnosticsAdviseTrack')));
      if (!this.diagnosticsAdviseTrack) {
        this.gotoDiagnosticsOrderList();
      }
    }
  }

  gotoDiagnosticsOrderList(): void {
    this.router.navigate(['/app/diagnostics/orders']);
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(this.diagnosticsAdviseTrack.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(this.diagnosticsAdviseTrack.pdfUrlWithoutHeader);
    }
  }

  onBackButtonClick() {
    this.gotoDiagnosticsOrderList();
  }
}
