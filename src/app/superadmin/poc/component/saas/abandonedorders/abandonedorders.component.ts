import { Component, ViewEncapsulation } from "@angular/core";
import { AppConfig } from "../../../../../app.config";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";

@Component({
    selector: 'abandonedsubscriptionorders',
    templateUrl: './abandonedorders.template.html',
    styleUrls: ['./abandonedorders.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AbandonedSubscriptionsComponent {

    

    constructor(config: AppConfig,
        private spinnerService: SpinnerService, private saasService: saasSubscriptionsService) {


    }

    ngOnInit(): void {
        this.getAbandonedOrders();
    }

    getAbandonedOrders() {
        this.saasService.getAbandonedSubscriptions().then((response) => {
            console.log('abandonedorders', JSON.stringify(response));
        }).catch((err) => {
            console.log(err);
        })
    }

}
