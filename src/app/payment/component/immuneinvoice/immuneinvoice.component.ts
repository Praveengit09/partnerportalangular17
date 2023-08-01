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
  selector: '[immuneinvoicecomponent]',
  templateUrl: './immuneinvoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./immuneinvoice.style.scss']
})
export class ImmuneInvoiceComponent {

  discountAmount: number = 0;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "Successfully Updated";
  immunizationAdviseTrack: CartItem;
  cartItemList: CartItem[];
  cartItem: CartItem;
  paymentModeIndex: number = 1;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  currencySymbol: string = '';

  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Immunization Name',
      variable: 'genericMedicine.genericMedicineName',
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
    this.immunizationAdviseTrack = paymentService.immunizationAdviseTrack;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
  }

  ngOnInit(): void {
    this.showMessage = true;
    this.isError = false;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
    if (this.immunizationAdviseTrack) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('immunizationAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.immunizationAdviseTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.immunizationAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('immunizationAdviseTrack')));
      if (!this.immunizationAdviseTrack) {
        setTimeout(() => {
          this.spinnerService.stop();
          this.gotoImmunizationOrderList();
        }, 15000)
      }
    }

    console.log("immunizationAdviseTrack::" + JSON.stringify(this.immunizationAdviseTrack));
    // this.cartItemList = this.immunizationAdviseTrack.cartItemList;
  }

  gotoImmunizationOrderList(): void {
    this.router.navigate(['/app/payment/immunization']);
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(this.immunizationAdviseTrack.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(this.immunizationAdviseTrack.pdfUrlWithoutHeader);
    }

  }

  onBackButtonClick() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    setTimeout(() => {
      this.spinnerService.stop();
      this.gotoImmunizationOrderList();
    }, 500)
  }
}
