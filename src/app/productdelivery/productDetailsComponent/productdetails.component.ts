import { ProductDeliveryTrack } from './../../model/product/productdeliverytrack';

import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
    selector: 'delivery-product-details',
    styleUrls: ['./product-details.style.scss'],
    templateUrl: './product-details.template.html',
    encapsulation: ViewEncapsulation.Emulated
})
export class DeliveryProductDetailsComponent {

    @Input() selectedOrder: any = null;
    @Input() cartType = '';
    actionStatus = ProductDeliveryTrack;
}