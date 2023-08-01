import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { PaymentService } from "../../payment.service";
import { AuthService } from './../../../auth/auth.service';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { HsLocalStorage } from './../../../base/hsLocalStorage.service';
import { CartItem } from './../../../model/basket/cartitem';
import { Config } from '../../../base/config';

@Component({
  selector: '[miscinvoicecomponent]',
  templateUrl: './miscinvoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./miscinvoice.style.scss']
})
export class MiscInvoiceComponent {

  discountAmount: number = 0;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "Successfully Updated";
  procedureAdviseTrack: CartItem;
  cartItem: CartItem;
  paymentModeIndex: number = 1;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  currencySymbol: string = '';
  procedurePrescriptionLabel: string = null;
  
  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Procedure Name',
      variable: 'serviceName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Amount',
      variable: 'grossPrice',
      filter: 'number',
      sort: false
    }
  
  ];

 

  constructor(private paymentService: PaymentService, private spinnerService: SpinnerService, private auth: AuthService, private router: Router,
    private hsLocalStorage: HsLocalStorage) {
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.procedureAdviseTrack = paymentService.procedureAdviseTrack;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
  }

  ngOnInit(): void {
    this.showMessage = true;
    this.isError = false;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
    if (this.procedureAdviseTrack) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('procedureAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.procedureAdviseTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.procedureAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('procedureAdviseTrack')));
      if (!this.procedureAdviseTrack) {
        setTimeout(() => {
          this.spinnerService.stop();
          this.gotoProceduresOrderList();
        }, 30000)
        }
    }
  }

  gotoProceduresOrderList(): void {
    this.router.navigate(['/app/payment/misc']);
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(this.procedureAdviseTrack.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(this.procedureAdviseTrack.pdfUrlWithoutHeader);
    }
  }

  onBackButtonClick() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    setTimeout(() => {
      this.spinnerService.stop();
      this.gotoProceduresOrderList();
    }, 15000)
  }
}
