import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { SlotBookingDetails } from './../../../../model/basket/slotBookingDetails';
import { ServiceItem } from './../../../../model/service/serviceItem';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    selector: 'orderdetails',
    templateUrl: './orderdetails.template.html',
    styleUrls: ['./orderdetails.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class OrderDetailsComponent implements OnInit, OnDestroy {

    slotBookingDetails: SlotBookingDetails;
    crouselSelectedImage: String;
    prescriptionType = "";
    check: boolean = false;
    update: boolean = false;

    constructor(private diagnosticsService: DiagnosticsService, private router: Router, private auth: AuthService,
        private hsLocalStorage: HsLocalStorage) {   
    }

    ngOnInit(): void {
        this.slotBookingDetails = this.diagnosticsService.receptionPriscriptionDetails;
        console.log("ngOnit:>>>>>> " + JSON.stringify(this.slotBookingDetails));
        if (this.slotBookingDetails) {
            let data = { 'diagnosticsAdminDetails': this.slotBookingDetails };
            this.hsLocalStorage.saveComponentData(data);
        } else {
            this.slotBookingDetails = this.hsLocalStorage.getComponentData().diagnosticsAdminDetails;
        }
        if (this.slotBookingDetails.payment)
            this.slotBookingDetails.payment.finalAmount > 0 ? "" : this.update = true;
        if (!this.slotBookingDetails.serviceList)
            this.slotBookingDetails.serviceList = new Array<ServiceItem>();
        this.slotBookingDetails.convertedDocumentUrlList = new Array();
        if (this.slotBookingDetails && this.slotBookingDetails.proofDocumentUrlList && this.slotBookingDetails.proofDocumentUrlList.length > 0) {
            this.slotBookingDetails.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.slotBookingDetails.convertedDocumentUrlList.push(url);
                }
                else {
                    if (url.includes("pdf"))
                        this.slotBookingDetails.convertedDocumentUrlList.push(url);
                    else {
                        this.diagnosticsService.getPdfUrl(url).then(xdata => {
                            this.slotBookingDetails.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
                        });
                    }
                }
            });
        }
    }


    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        if (type == "pdf") {
            this.auth.openPDF(imageSrc)
        } else {
            $('#prescription-modal').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }

    }

    onGenerateBack() {
        this.router.navigate(['/app/diagnostics/diagnosticadmin/requestorders']);
    }

    onUpdateOrder() {
        this.check = true;
        this.diagnosticsService.centralCheckForPaymentStatus = true;
        this.diagnosticsService.tempPdfUrl = '/app/diagnostics/diagnosticadmin/requestorders'
        this.diagnosticsService.isFromPriscription = false;
        this.diagnosticsService.isCentralBooking = true;
        this.diagnosticsService.slotBookingSubType = this.slotBookingDetails && this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME ? SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME : SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
        this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
    }

    ngOnDestroy() {
        this.check ?
            this.diagnosticsService.receptionPriscriptionDetails = this.slotBookingDetails :
            this.diagnosticsService.receptionPriscriptionDetails = null;
    }
}
