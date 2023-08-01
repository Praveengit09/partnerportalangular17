import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../auth/auth.service';
import { BBCartItem } from '../../../../../model/basket/b2bcartitem';
import { PharmacyService } from '../../../../pharmacy.service';
import { PaymentConnst } from './../../../../../model/basket/payment';


@Component({
    selector: 'invoicedetails',
    templateUrl: './invoicedetails.template.html',
    styleUrls: ['./invoicedetails.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class InvoiceDetailsComponent {

    supplierAdviseTrack: BBCartItem;
    paymentMode :string = "NA";

    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router) {
        this.supplierAdviseTrack = this.pharmacyService.getSupplierAdviseTrack();
        console.log('oninit==>', this.supplierAdviseTrack);
        if(this.supplierAdviseTrack.payment.paymentStatus) {
           let paymentType = PaymentConnst.filter(item => item.value === this.supplierAdviseTrack.payment.transactionType)
           if(paymentType && paymentType.length > 0)
           this.paymentMode =paymentType[0].type;
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/supplier/invoicelist']);
    }

    dispatchOrder(status: number) {
        this.pharmacyService.updateSupplierInvoiceStatus
            ({ orderId: this.supplierAdviseTrack.orderId, empId: this.auth.userAuth.employeeId, invoiceCompletionStatus: status }).then((res) => {
                console.log('onacceptRes==>', res);
                if(status == 22) alert("Order has been rejected");
                if(status == 4) alert("Order has been dispatched");
                this.onGenerateBack();
            });
    }
    editOrder() {
         this.pharmacyService.supplierAdviseTrack = this.supplierAdviseTrack;
        this.router.navigate(['/app/pharmacy/supplier/editinvoice']);
    }

    onPrintButtonClick() {
        if (this.supplierAdviseTrack.payment.paymentStatus == 1) {
          let pdfUrl = '';
          if (this.auth.userAuth.pdfHeaderType == 0) {
            pdfUrl = this.supplierAdviseTrack.pdfUrlWithHeader;
          } else {
            pdfUrl = this.supplierAdviseTrack.pdfUrlWithoutHeader;
          }
          this.pharmacyService.openPDF(pdfUrl);
        }
      }

}