import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { CartItem } from './../../../../model/basket/cartitem';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ReceptionService } from '../../reception.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { PaymentService } from '../../../../payment/payment.service';

@Component({
  selector: '[miscorderinvoicecomponent]',
  templateUrl: './miscorderinvoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./miscorderinvoice.style.scss']
})
export class MiscOrderInvoiceComponent {

  
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "Successfully Updated";
  miscellaneousOrderAdviseTrack:CartItem;
  cartItem: CartItem;
  paymentModeIndex: number = 1;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  errorMessage: Array<string>;
  
  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Product Name',
      variable: 'productName',
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

 

  constructor(private spinnerService: SpinnerService, 
    private auth: AuthService, private router: Router,private paymentService  : PaymentService) {
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.miscellaneousOrderAdviseTrack = paymentService.miscellaneousOrderAdviseTrack;
   }

  ngOnInit(): void {
    this.showMessage = true;
    this.isError = false;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
    if (this.miscellaneousOrderAdviseTrack) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('miscellaneousOrderAdviseTrack', cryptoUtil.encryptData(JSON.stringify(this.miscellaneousOrderAdviseTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.miscellaneousOrderAdviseTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('miscellaneousOrderAdviseTrack')));
      if (!this.miscellaneousOrderAdviseTrack) {
        setTimeout(() => {
          this.spinnerService.stop();
          this.gotoMiscellaneousOrderList();
        }, 30000)
        }
    }
    console.log('miscellaneousOrderAdviseTrack'+JSON.stringify(this.miscellaneousOrderAdviseTrack));
 
  }

  gotoMiscellaneousOrderList(): void {
    this.router.navigate(['/app/payment/miscellaneouspaymentslisting']);
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.auth.openPDF(this.miscellaneousOrderAdviseTrack.pdfUrlWithHeader);
    } else {
      this.auth.openPDF(this.miscellaneousOrderAdviseTrack.pdfUrlWithoutHeader);
    }
  }

  onBackButtonClick() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    setTimeout(() => {
      this.spinnerService.stop();
      this.gotoMiscellaneousOrderList();
    }, 15000)
  }
}
