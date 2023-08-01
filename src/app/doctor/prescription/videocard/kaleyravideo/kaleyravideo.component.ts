import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../../../doctor/doctor.service';
import { PaymentService } from '../../../../payment/payment.service';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
@Component({
    selector: "kaleyravideo",
    templateUrl: "./kaleyravideo.template.html",
    styleUrls: ["./kaleyravideo.style.scss"],
    encapsulation: ViewEncapsulation.Emulated
})
export class KaleyraVideoComponent implements OnInit {
    notifyCustomerDetails: any;
    @Input()
    id: string;
    urlSafe: SafeResourceUrl;
    constructor(private localStorage: HsLocalStorage, private paymentService: PaymentService, private doctorService: DoctorService, public sanitizer: DomSanitizer) { }
    ngOnInit() {
        this.onNotifyCustomerDetails();
    }
    onNotifyCustomerDetails() {
        this.paymentService.reNotifyCustomer(this.doctorService.patientQueue.invoiceId).then((resp) => {
            this.notifyCustomerDetails = resp
            console.log("notifyResp-List" + JSON.stringify(this.notifyCustomerDetails.session.sessionId))
            this.id = this.notifyCustomerDetails.session.sessionId
            this.localStorage.setData(' id', this.id);
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.id);

            console.log("notifyResp--1111" + JSON.stringify(this.urlSafe))

        })
    }
}