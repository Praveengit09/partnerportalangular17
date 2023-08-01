import { AuthService } from './../../../../auth/auth.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    selector: 'vieworder',
    templateUrl: './vieworder.template.html',
    styleUrls: ['./vieworder.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class ViewOrderComponent implements OnInit {


    diagnosticAdminOrderDetails: DiagnosticDeliveryAdviceTrack;
    crouselSelectedImage: String;
    prescriptionType = "";


    constructor(private diagnosticsService: DiagnosticsService, private router: Router,private auth: AuthService,
               private hsLocalStorage: HsLocalStorage) {
        this.diagnosticAdminOrderDetails = this.diagnosticsService.orderDetailAdviceTrack;
    }
    ngOnInit(): void {
        this.diagnosticAdminOrderDetails = this.diagnosticsService.orderDetailAdviceTrack;
        console.log("ngOnit:>>>>>> " + JSON.stringify(this.diagnosticAdminOrderDetails));
        if (this.diagnosticAdminOrderDetails) {
            let data = { 'diagnosticsAdminDetails': this.diagnosticAdminOrderDetails };
            this.hsLocalStorage.saveComponentData(data);
        } else {
            this.diagnosticAdminOrderDetails = this.hsLocalStorage.getComponentData().diagnosticsAdminDetails;
            if (!this.diagnosticAdminOrderDetails) {
                this.onGenerateBack();
            }
        }

        this.diagnosticAdminOrderDetails.convertedDocumentUrlList = new Array();
        if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.proofDocumentUrlList && this.diagnosticAdminOrderDetails.proofDocumentUrlList.length > 0) {
            this.diagnosticAdminOrderDetails.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
                }
                else {
                    if (url.includes("pdf"))
                        this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
                    else {
                        this.diagnosticsService.getPdfUrl(url).then(xdata => {
                            this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
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

    hideToolBar(e) {
        $('.toolbar').css('display', 'none');
        return false;
    }

    onGenerateBack() {
        this.router.navigate(['/app/diagnostics/homeorders/managehomeorderlist']);
    }
}