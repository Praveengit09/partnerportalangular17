import { ProductCentralService } from './../../../productCentral.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../auth/auth.service'
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AdminService } from '../../../../admin/admin.service';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';

@Component({
    selector: 'summary',
    templateUrl: './summary.template.html',
    styleUrls: ['./summary.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class SummaryComponent implements OnInit {
    processOrderDetails: ProductDeliveryTrack;
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
    invoiceDetailList: any;
    crouselSelectedImage: String;

    constructor(private adminService: AdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService , private productService: ProductCentralService ) {
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    }

    ngOnInit() {
        this.processOrderDetails = this.adminService.productDeliveryTrack;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else {
            if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
                this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
            }
        }

        if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.proofDocumentUrlList && this.processOrderDetails.cartItem.proofDocumentUrlList.length > 0) {
            this.processOrderDetails.cartItem.convertedDocumentUrlList = new Array<String>();
            this.processOrderDetails.cartItem.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.processOrderDetails.cartItem.convertedDocumentUrlList.push(url);
                }
                else {
                    this.productService.getPdfUrl(url).then(xdata => {
                        this.processOrderDetails.cartItem.convertedDocumentUrlList.push(this.productService.tempPdfUrl);
                        // alert(this.pharmacyService.tempPdfUrl);
                    });
                }
            });
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/product/homeorder/edit']);
    }

    onSubmitChanges(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.processOrderDetails.actionStatus = ProductDeliveryTrack.CUSTOMER_APPROVED;
        this.spinnerService.start();
        this.adminService.updateProductDeliveries(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Succesfully submited";
                this.showMessage = true;
                this.router.navigate(['/app/product/homeorder/list']);
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