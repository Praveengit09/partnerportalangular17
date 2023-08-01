import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PharmacyService } from './../../../pharmacy.service';
import { AuthService } from './../../../../auth/auth.service'
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { round } from 'd3';

@Component({
    selector: 'returnorder',
    templateUrl: './order.template.html',
    styleUrls: ['./order.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class ReturnOrderComponent implements OnInit, OnDestroy {

    processOrderDetails: AdminPharmacyDeliveryResponse;

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    showMessagetxt: boolean;
    pocId: any;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;

    invoiceDetailList: any;
    modalMessage: string;

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
        this.processOrderDetails.onlinePaymentAmount ?
            this.processOrderDetails.onlinePaymentAmount = this.roundToTwo(this.processOrderDetails.onlinePaymentAmount):0;
        // this.roundToTwo(12);
    }
    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    ngOnDestroy() {
        if (this.processOrderDetails) {
            this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/returns/list']);
    }

    onGenerateEditOrder(): void {
        this.router.navigate(['/app/pharmacy/returns/edit']);
    }

    onReturnedClick() {
        (<any>$("#deliveryremarkspopup")).modal("show");
        $(".modal-backdrop").not(':first').remove();
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
    }

    onInvoiceClick() {
        this.orderId = this.processOrderDetails.orderId;
        this.invoiceId = this.processOrderDetails.baseInvoiceId;
        this.spinnerService.start();
        this.pharmacyService.getOrderDetails(this.orderId, this.invoiceId).then(baseResponse => {
            this.spinnerService.stop();

            this.invoiceDetailList = baseResponse.cartItemList;
            console.log("data" + JSON.stringify(this.invoiceDetailList));
        });
    }

    invoiceClick(invoice: any) {
        console.log("pdf" + JSON.stringify(this.invoiceDetailList));

        if (this.pdfHeaderType == 0) {
            this.auth.openPDF(invoice.pdfUrlWithHeader);
        }
        else {
            this.auth.openPDF(invoice.pdfUrlWithoutHeader);
        }
    }

    onRemarkSubmitClicked() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == "" || this.processOrderDetails.remarks == null) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Add Your Remark!!!";
            this.showMessage = true;
            return;
        }
        this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.COMPLETED;
        this.updatePharmacyReturns();
        (<any>$("#deliveryremarkspopup")).modal('hide');
    }

    onInitiateReturnClick() {
        let canProceed: boolean = true;
        if (this.processOrderDetails && this.processOrderDetails.cartItem
            && this.processOrderDetails.cartItem.pharmacyList
            && this.processOrderDetails.cartItem.pharmacyList.length > 0) {
            this.processOrderDetails.cartItem.pharmacyList.forEach(item => {
                if (item.quantity <= 0 || item.grossPrice <= 0) {
                    canProceed = false;
                }
            });
        } else {
            canProceed = false;
        }
        if (canProceed) {
            this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.VENDOR_RETURN_COLLECTION_INITIATED;
            this.updatePharmacyReturns();
        } else {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Cannot initiate return process for this order. Please check the order details.";
            this.showMessage = true;
            return;
        }
    }

    updatePharmacyReturns(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.spinnerService.start();
        this.pharmacyService.updatePharmacyReturn(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                if (this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.VENDOR_RETURN_COLLECTION_INITIATED || this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.COMPLETED) {
                    if (this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.COMPLETED) {
                        this.modalMessage = "Return items collected successfully.";
                        (<any>$("#messageModal")).modal("show");
                    } else {
                        this.errorMessage[0] = "Return initiated successfully.";
                        this.showMessage = true;
                    }
                } else if (this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.REJECTED) {
                    this.modalMessage = "Rejected the return order.";
                    (<any>$("#messageModal")).modal("show");
                }
                return;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error occurred while processing request. Please try again!";
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

    onRejectButtonSubmit() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == null || this.processOrderDetails.remarks == "") {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter the proper reason";
            this.showMessagetxt = true;
            return;
        }
        this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.REJECTED;
        this.updatePharmacyReturns();
        (<any>$("#rejectModal")).modal('hide');
    }

    onRejectButtonClick() {
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
        (<any>$("#rejectModal")).modal('show');
        if ($(".modal-backdrop").length > 1) {
            $(".modal-backdrop").not(':first').remove();
        }
    }

}