import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../../../../model/basket/cartitem';
import { AuthService } from '../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { ProductService } from '../../productorder.service';

@Component({
  selector: '[invoice-component]',
  templateUrl: './invoice.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./invoice.style.scss']
})
export class WalkInInvoiceComponent implements OnInit {

  cartItem: CartItem;
  pdfHeaderType: number;

  constructor(private productService: ProductService, private authService: AuthService, private router: Router, private hsLocalStorage: HsLocalStorage) {
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    console.log("pdf type" + this.pdfHeaderType);
  }

  ngOnInit() {
    this.cartItem = this.productService.cartItem;

    console.log("json-->" + JSON.stringify(this.cartItem));
    if (this.cartItem) {
      let data = { 'productAdviceTrack': this.cartItem };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.cartItem = this.hsLocalStorage.getComponentData().productAdviceTrack;
      if (!this.cartItem) {
        this.onBackButtonClick();
      }
    }
  }

  onPrintButtonClick() {
    console.log("cartItem in onPrintButtonClick()-->" + JSON.stringify(this.cartItem));
    if (this.pdfHeaderType == 0) {
      this.authService.openPDF(this.cartItem.pdfUrlWithHeader);
    } else {
      this.authService.openPDF(this.cartItem.pdfUrlWithoutHeader);
    }
  }

  onBackButtonClick() {
    this.router.navigate(['/app/product/walkin/list']);
  }
}
