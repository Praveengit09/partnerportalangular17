import { BBCartItem } from './../../../../model/basket/b2bcartitem';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../auth/auth.service';
import { PharmacyService } from './../../../pharmacy.service';
import { Router } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'transferdetails',
    templateUrl: './orderdetails.template.html',
    styleUrls: ['./orderdetails.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class TransferOrderDetails {

    transferOrder: BBCartItem;
    pocId: number = 0;
    pocName: string = '';

    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
        this.transferOrder = this.pharmacyService.getSupplierAdviseTrack();
        this.pocId = this.auth.selectedPocDetails.pocId;
        if (this.pocId == this.transferOrder.purchaserPocId)
            this.pocName = this.transferOrder.pocDetails.pocName;
        else
            this.pocName = this.transferOrder.purchaserPocDetails.pocName
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/inventory/transfer']);
    }

    onSubmit(status: number) {
        let req = {
            "orderId": this.transferOrder.orderId,
            "invoiceCompletionStatus": status
        }
        this.spinnerService.start();
        this.pharmacyService.updateTransferPharmaList
            (req).then((res) => {
                this.spinnerService.stop();
                if (status == 2) {
                    alert('Order accepted successfully');
                    this.onGenerateBack();
                }
                if (status == 21) {
                    alert('Order has been rejected');
                    this.onGenerateBack();
                }
            });
    }

    updateOrder(status) {
        this.transferOrder.invoiceCompletionStatus = status;
        this.spinnerService.start();
        this.pharmacyService.completeTransferPharmaList
            (this.transferOrder).then((res) => {
                this.spinnerService.stop();
                if (status == 4)
                    alert('Order Dispatched');
                if (status == 5)
                    alert('Inventory updated successfully');
                this.onGenerateBack();
            });
    }

}