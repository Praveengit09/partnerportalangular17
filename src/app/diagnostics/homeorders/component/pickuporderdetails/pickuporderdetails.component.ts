import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
    selector: 'pickuporderdetails',
    templateUrl: './pickuporderdetails.template.html',
    styleUrls: ['./pickuporderdetails.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PickupOrderDetailsComponent {

    orderDetails: any = [];
    orderId: string = "";
    baseInvoiceId:string = "";
    timeCheck: boolean = false;
    dataCheck: boolean = false;
    convertedDocumentUrlList: Array<String> = new Array();
    crouselSelectedImage: String;
    prescriptionType = "";

    constructor(private diagnosticsService : DiagnosticsService, private router: Router, private authService: AuthService,
        private spinnerService: SpinnerService) {
        let  temp = this.diagnosticsService.order;
        console.log("orderDetails",JSON.stringify(temp));
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (temp != undefined || temp != null) {
            window.localStorage.setItem('pickorderDetails', cryptoUtil.encryptData(JSON.stringify(temp)));
        } else if (window.localStorage.getItem('pickorderDetails') != null && window.localStorage.getItem('pickorderDetails').length > 0) {
            temp = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pickorderDetails')));
        }
        this.orderId = temp.orderId;
        this.baseInvoiceId = temp.baseInvoiceId;
        this.getOrderBasedOnId();
    }


    getOrderBasedOnId() {
        this.timeCheck = false;
        this.dataCheck = false;
        this.spinnerService.start();
        this.diagnosticsService.getPickUpOrder(this.orderId,this.baseInvoiceId).then(response => {
            this.spinnerService.stop();
            if(response != undefined) {
                this.dataCheck = true;
                this.orderDetails = response;
            }
            if(this.dataCheck && this.orderDetails.pickupDate != 0 || this.orderDetails.pickupTime != 0)
                this.timeCheck = true;
            
            let temp = response.proofs;
                this.convertedDocumentUrlList = new Array();
                if (temp != undefined && temp != null && temp != "" && temp.length > 0) {
                    temp.forEach((url) => {
                        if (url.includes("https:")) {
                            this.authService.getTempFileURLFromSecureURL(url).then((resp) => {
                                if (resp.statusCode == 200 || resp.statusCode == 201)
                                    this.convertedDocumentUrlList.push(resp.data);
                            })
                        }
                    })
                }
                (<any>$("#sliderimage")).modal("show");
                        
        });
    }

    onGenerateBack() {
        this.router.navigate(['/app/diagnostics/homeorders/pickuporderlist']);
    }

    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        if (type == "pdf") {
            this.authService.openPDF(imageSrc)
        } else {
            $('#prescription-modal').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }
    }
    
}