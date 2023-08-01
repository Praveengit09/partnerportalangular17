import { CartItem } from '../../../model/basket/cartitem';
import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';


@Component({
    selector: 'view-pay-summary',
    templateUrl: './pay-summary.template.html',
    encapsulation: ViewEncapsulation.Emulated,
    styles: [`
    .total_txt {
        font-weight: 500;
    }
    .process_original {
        line-height: 30px;
    }
    .process_original .col-md-6{
        line-height: 45px;
        padding:0 !important;
    }
    .with_txt{
        line-height: 0px;
        margin-bottom: 0px;
        font-size: 11px;
    }
    `]
})
export class PaySummaryCommponent implements OnInit {

    @Input() cartItem: CartItem;
    @Input() showCartPaid: boolean = true;
    @Input() showCartPayable: boolean = true;
    @Input() isInvoice: boolean = false;

    ngOnInit(): void { }
}