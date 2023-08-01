import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../../auth/auth.service';
import { PharmacyService } from './../../../../pharmacy.service';
import { BBCartItem } from './../../../../../model/basket/b2bcartitem';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'orderdetails',
  templateUrl: './orderdetails.template.html',
  styleUrls: ['./orderdetails.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class SupplierOrderDetailsComponent {

  supplierAdviseTrack: BBCartItem;

  supplierNote: string = '';

  constructor(private pharmacyService: PharmacyService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService) {
    this.supplierAdviseTrack = this.pharmacyService.getSupplierAdviseTrack();
    console.log('oninit==>', this.supplierAdviseTrack);

  }
  onGenerateBack(): void {
    this.router.navigate(['/app/pharmacy/supplier/orderlist']);
  }

  onSubmit(status: number) {
    let req = {
      "orderId": this.supplierAdviseTrack.orderId,
      "invoiceCompletionStatus": status,
      "supplierNote": this.supplierNote
    }
    this.pharmacyService.updateSuplierStatusOrder
      (JSON.stringify(req)).then((res) => {
        console.log('onacceptRes==>', res);
        if (status == 2) { this.updateOrder(); }
        if (status == 21) {
          this.pharmacyService.orderIdMail = this.supplierAdviseTrack.orderId;
          alert('Order has been rejected');
          this.onGenerateBack();
        }
      });
  }

  updateOrder() {
    this.pharmacyService.supplierAdviseTrack = this.supplierAdviseTrack;
    this.router.navigate(['/app/pharmacy/supplier/editinvoice']);
  }

}