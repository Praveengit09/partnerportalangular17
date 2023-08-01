import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { OutPatientOrdersService } from '../../outpatientorders.service';
import { Config } from '../../../../base/config.js';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { OtPatientOrdersService } from '../../otpatientorders.service';


@Component({
    selector: 'otpatientordersummary',
    templateUrl: './ordersummary.template.html',
    styleUrls: ['./ordersummary.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class OtPatientOrderSummaryComponent implements OnInit {

    cartItem: CartItem;
    pdfHeaderType: number;
    brandId: number;
    configAppId: number;
    otherDiscountAmountPer: number = 0;
    selectedPackageId: number = 0;
    empId: any;
    isOtherDiscountCashPaymentHide: boolean = false;
    paymentModeIndex = 0;
    isError = false;
    showMessage = false;
    errorMessage = new Array();
    pocId = 0;
    transactionId: string = '';
    reportResponse: any;
    modalMessage: string = '';
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    basketRequest: BasketRequest = new BasketRequest();
    selectedOtpatientOrdersBillNoList;
    consolidatedBillCartItem = new CartItem();
    otPatientAdviceDetails = new CartItem();
    showIndividualOrderSummary: boolean = false;//to differentiate whether the show particular order details or consolidated summary
    showConsolidatedSummary: boolean = false;
    invoicePdf: string = '';
    isEditOrder: boolean = false;

    constructor(private otPatientOrdersService: OtPatientOrdersService, private pharmacyService: PharmacyService,
        private authService: AuthService, private router: Router, private spinner: SpinnerService, private toast: ToasterService,

        private hsLocalStorage: HsLocalStorage) {

        this.brandId = authService.userAuth.brandId;
        this.configAppId = Config.portal.appId;
        this.isEditOrder = this.otPatientOrdersService.isEditOrder;


    }

    ngOnInit() {
        console.log('otPatientOrdersService', this.otPatientOrdersService.selectedOtpatientOrdersBillNoList);

        this.pocId = this.authService.userAuth.pocId;
        this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
        this.selectedOtpatientOrdersBillNoList = [...this.otPatientOrdersService.selectedOtpatientOrdersBillNoList];
        this.otPatientAdviceDetails = { ...this.otPatientOrdersService.otPatientAdviceDetails }

        if (this.selectedOtpatientOrdersBillNoList != undefined && this.selectedOtpatientOrdersBillNoList.length !== 0 && this.otPatientOrdersService.isMultipleOrdersEdit == true) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('selectedOtpatientOrdersBillNoList', cryptoUtil.encryptData(JSON.stringify(this.selectedOtpatientOrdersBillNoList)));
        } else if (this.otPatientOrdersService.isMultipleOrdersEdit == true) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('selectedOtpatientOrdersBillNoList') != null) {
                this.selectedOtpatientOrdersBillNoList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedOtpatientOrdersBillNoList')));
            }
        }


        if (this.otPatientAdviceDetails != undefined && Object.keys(this.otPatientAdviceDetails).length !== 0
            && this.otPatientAdviceDetails.constructor === Object && this.otPatientOrdersService.isMultipleOrdersEdit == false
            && this.otPatientAdviceDetails.pharmacyList != undefined) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('otPatientAdviceDetails', cryptoUtil.encryptData(JSON.stringify(this.otPatientAdviceDetails)));
        } else if (this.otPatientOrdersService.isMultipleOrdersEdit == false) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('otPatientAdviceDetails') != null) {
                this.otPatientAdviceDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('otPatientAdviceDetails')));
            }
        }
        console.log('otPatientAdviceDetails***', JSON.stringify(this.otPatientAdviceDetails));

        if (this.selectedOtpatientOrdersBillNoList.length > 0) {
            this.showConsolidatedSummary = true;
            this.showIndividualOrderSummary = false;
            this.getConsolidatedSummaryOfOtpatientOrders();
        }
        else if (JSON.stringify(this.otPatientAdviceDetails) != '{}' || this.otPatientAdviceDetails != undefined) {
            this.showIndividualOrderSummary = true;
            this.showConsolidatedSummary = false;
            this.cartItem = this.otPatientAdviceDetails
        }



    }

    async getConsolidatedSummaryOfOtpatientOrders() {
        this.spinner.start();
        await this.otPatientOrdersService.getOtPatientConsolidatedBillDetails(this.selectedOtpatientOrdersBillNoList).then((billSummary) => {
            if (billSummary != null && billSummary != undefined && JSON.stringify(billSummary) != '{}') {
                this.consolidatedBillCartItem = { ...billSummary };

            }
            else {
                this.toast.show("Something went wrong,Plese try again", "bg-danger text-white font-weight-bold", 3000);
                this.consolidatedBillCartItem = new CartItem();
            }
        }).catch((err) => {
            this.toast.show("Something went wrong,Plese try again", "bg-danger text-white font-weight-bold", 3000);
            console.log(err)

        }).finally(() => {
            this.getOtPateintInvoice(this.consolidatedBillCartItem);
            this.cartItem = this.consolidatedBillCartItem;
            this.spinner.stop();

        })


    }

    async getOtPateintInvoice(billSummary) {

        this.spinner.start()
        await this.otPatientOrdersService.createOtPatientOrder(billSummary).then((response) => {
            if (response.statusCode === 200 || response.statusCode === 201) {
                let pdfUrl;
                if (this.pdfHeaderType == 0) {
                    pdfUrl = response.pdfUrlWithHeader;
                } else {
                    pdfUrl = response.pdfUrlWithoutHeader;
                }
                this.invoicePdf = pdfUrl;
                // this.pharmacyService.openPDF(this.invoicePdf);
            } else {
                this.toast.show(response.statusCode, "bg-danger text-white font-weight-bold", 3000);

            }

        }).catch((err) => {
            this.toast.show("Something went wrong,Please try again", "bg-danger text-white font-weight-bold", 3000);


        }).finally(() => {
            this.spinner.stop()
        })

    }

    gotoOtPatientPharmacyOrderList(): void {
        this.router.navigate(['/app/pharmacy/otpatientorders/list']);
    }

    onEditbuttonClickHandler() {
        this.otPatientOrdersService.otPatientAdviceDetailsForEdit = this.otPatientAdviceDetails;
        this.otPatientOrdersService.isEditOrder = true;
        this.otPatientOrdersService.otPatientAdviceDetailsForEdit && this.router.navigate(['/app/pharmacy/otpatientorders/neworder']);
    }


    onViewPdfClickHandler() {
        // this.getOtPateintInvoice(this.cartItem);
        this.invoicePdf && this.pharmacyService.openPDF(this.invoicePdf);
    }


}