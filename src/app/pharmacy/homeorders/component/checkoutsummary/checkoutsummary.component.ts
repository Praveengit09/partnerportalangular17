import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PharmacyService } from './../../../pharmacy.service';
import { AuthService } from './../../../../auth/auth.service'
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';

@Component({
    selector: 'checkoutsummary',
    templateUrl: './checkoutsummary.template.html',
    styleUrls: ['./checkoutsummary.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class CheckoutSummaryComponent implements OnInit {
    processOrderDetails: AdminPharmacyDeliveryResponse;
    approved: any;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    showMessagetxt: boolean;
    pocId: any;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;
    packageNames: string[];
    bookedPackageList: BookedPackageResponse[] = new Array();
    crouselSelectedImage: String;
    invoiceDetailList: any;
    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    }

    ngOnInit() {
        this.processOrderDetails = this.pharmacyService.pharmacyDeliveryDetails;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else {
            if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
                this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
            }
        }
       
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/homeorder/editstock']);
    }

    onSubmitChanges(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.CUSTOMER_APPROVED;
        this.spinnerService.start();
        this.pharmacyService.updatepharmacydeliveries(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Succesfully submited";
                this.showMessage = true;
                this.router.navigate(['/app/pharmacy/homeorder/homeorders']);
                return;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error while processing request !!! Try Again!!!";
                this.showMessage = true;
                return;
            }
        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        });
    }

    sliderImage(imageSrc) {
        if (imageSrc.substring((imageSrc.lastIndexOf('.') + 1)).toString() == "pdf") {
            this.auth.openPDF(imageSrc)
        } else {
            this.crouselSelectedImage = imageSrc;
        }
    }

}