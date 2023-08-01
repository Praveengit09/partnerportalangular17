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
  selector: '[admissionnoteinvoicecomponent]',
  templateUrl: './admissionnoteinvoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./admissionnoteinvoice.style.scss']
})
export class AdmissionNoteInvoiceComponent {

  discountAmount: number = 0;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "Successfully Updated";
  admissionnoteAdviseTrack: CartItem;
  cartItem: CartItem;
  paymentModeIndex: number = 1;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  currencySymbol: string = '';
  admissionNotePrescriptionLabel: string = null;

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
    this.admissionnoteAdviseTrack = paymentService.admissionnoteAdviseTrack;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
    this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
  }

  ngOnInit(): void {
    this.showMessage = true;
    this.isError = false;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
    if (this.admissionnoteAdviseTrack) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('admissionnoteAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.admissionnoteAdviseTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.admissionnoteAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('admissionnoteAdviseTrack')));
      if (!this.admissionnoteAdviseTrack) {
        // setTimeout(() => {
        this.spinnerService.stop();
        this.gotoAdmissionNotesOrderList();
        // }, 30000)
      }
    }
  }

  gotoAdmissionNotesOrderList(): void {
    this.router.navigate(['/app/payment/admissionnote']);
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(this.admissionnoteAdviseTrack.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(this.admissionnoteAdviseTrack.pdfUrlWithoutHeader);
    }
  }

  onBackButtonClick() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    // setTimeout(() => {
    this.spinnerService.stop();
    this.gotoAdmissionNotesOrderList();
    // }, 15000)
  }
}
