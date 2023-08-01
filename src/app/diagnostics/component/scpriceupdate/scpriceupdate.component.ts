import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PocCollectionCharges } from '../../../model/common/poccollectioncharges';
import { Config } from '../../../base/config';

@Component({
    selector: 'scpriceupdate',
    templateUrl: './scpriceupdate.template.html',
    styleUrls: ['./scpriceupdate.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SCPriceUpdateComponent implements OnInit {

    type: number = PocCollectionCharges.DIAGNOSTICS;
    brandId: number;

    constructor() {
        if (Config.portal)
            this.brandId = Config.portal.appId;
    }

    ngOnInit() {

    }
}