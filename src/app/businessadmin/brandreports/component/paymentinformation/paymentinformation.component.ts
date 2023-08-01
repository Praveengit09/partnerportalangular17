import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { BulkPackage } from '../../../../model/package/bulkPackage';
import { BusinessAdminService } from '../../../businessadmin.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { CartItem } from '../../../../model/basket/cartitem';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { Product } from '../../../../model/product/product';
import { Payment } from '../../../../model/basket/payment';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';

@Component({
    selector: 'paymentinformation',
    templateUrl: './paymentinformation.template.html',
    styleUrls: ['./paymentinformation.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class ManageCommunityPaymentInformationComponent implements OnInit {

    communityPaymentsTrack: BulkPackage;
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    showManagerDetails: boolean = false;
    showManager: boolean = false;
    paymentStatusIndex: number;
    transactionType: number = 2;
    basketRequest: BasketRequest;
    response: BasketRequest;
    dropDownIndexValue: number;
    isError: boolean = false;
    errorMessage: Array<string>;
    showMessage: boolean = false;

    constructor(private businessAdminService: BusinessAdminService, private diagnosticService: DiagnosticsService, private router: Router,
        private spinnerService: SpinnerService) {
    }

    ngOnInit() {
        this.communityPaymentsTrack = this.businessAdminService.communityPaymentsTrack;

        if (this.communityPaymentsTrack != undefined) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('communityPaymentsTrack', cryptoUtil.encryptData(JSON.stringify(this.communityPaymentsTrack)));
        } else {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('communityPaymentsTrack') != null) {
                this.communityPaymentsTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('communityPaymentsTrack')));
            }
        }

        if (this.communityPaymentsTrack != undefined || this.communityPaymentsTrack != null) {
            if (this.communityPaymentsTrack.profileId != 0)
                this.showManagerDetails = true;
            this.paymentStatusIndex = this.communityPaymentsTrack.paymentStatus;

            if (this.communityPaymentsTrack.transactionType != 0) {
                this.transactionType = this.dropDownIndexValue = this.communityPaymentsTrack.transactionType;
            }
        }
    }


    addManager() {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
    }

    onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {

        this.selectedRegisteredProfile = selectedRegisteredProfile;
        this.showManager = true;
        this.showManagerDetails = true;

    }

    closeModel(id: string) {
        console.log(id + " closed");
        $(id).on('hidden.bs.modal', function (e) {
            if ($('body').hasClass('modal-open')) {

            } else {
                $('.modal-backdrop').remove();
            }
        });
        (<any>$(id)).modal('hide');
    }


    checkPaymentModeSelection(paymentMode: number) {
        this.transactionType = this.dropDownIndexValue = paymentMode;
        if (this.transactionType == 5) {
            this.communityPaymentsTrack.paymentStatus = this.paymentStatusIndex = 0;
        }
    }

    checkPaymentStatus(paymentStatus: any) {

    }

    onUpdate() {

        if (this.communityPaymentsTrack.profileId == 0) {
            if (this.selectedRegisteredProfile == undefined || this.selectedRegisteredProfile == null) {
                console.log('error');
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please Add Manager";
                this.showMessage = true;
                return;
            }

        }

        this.basketRequest = new BasketRequest();
        this.basketRequest.orderId = this.communityPaymentsTrack.orderId;
        this.basketRequest.bookingSource = 3;
        this.basketRequest.transactionType = this.transactionType;
        this.basketRequest.updatedTimestamp = this.basketRequest.createdTimestamp = new Date().getTime();

        this.basketRequest.totalOriginalAmount = this.basketRequest.totalFinalAmount = this.communityPaymentsTrack.amount;

        if (this.communityPaymentsTrack.profileId == 0) {
            this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selectedProfile.relationShipId;
        }
        else {
            this.basketRequest.parentProfileId = this.communityPaymentsTrack.profileId;
        }

        if (this.basketRequest.parentProfileId == undefined || this.basketRequest.parentProfileId == null) {

            console.log('error');
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Add Manager";
            this.showMessage = true;
            return;

        }

        this.basketRequest.cartItemList = new Array<CartItem>();
        this.basketRequest.cartItemList[0] = new CartItem();
        this.basketRequest.cartItemList[0].cartItemType = CartItem.CART_ITEM_TYPE_PACKAGE;
        this.basketRequest.cartItemList[0].paymentSource = 3;
        this.basketRequest.cartItemList[0].bookingSource = 3;
        this.basketRequest.cartItemList[0].pocId = this.communityPaymentsTrack.pocId;
        this.basketRequest.cartItemList[0].orderId = this.communityPaymentsTrack.orderId;
        this.basketRequest.cartItemList[0].createdTimestamp = this.basketRequest.cartItemList[0].updatedTimestamp = new Date().getTime();
        this.basketRequest.cartItemList[0].productList = new Array<Product>();
        this.basketRequest.cartItemList[0].productList[0] = new Product();
        this.basketRequest.cartItemList[0].productList[0].productId = this.communityPaymentsTrack.packageId;
        this.basketRequest.cartItemList[0].productList[0].productName = this.communityPaymentsTrack.packageName;
        this.basketRequest.cartItemList[0].productList[0].originalAmount =
            this.basketRequest.cartItemList[0].productList[0].finalAmount =
            this.basketRequest.cartItemList[0].productList[0].grossPrice
            = this.basketRequest.cartItemList[0].productList[0].netPrice = this.communityPaymentsTrack.amount;
        this.basketRequest.cartItemList[0].productList[0].quantity = 1;
        this.basketRequest.cartItemList[0].productList[0].attributesMap = new Object();
        this.basketRequest.cartItemList[0].productList[0].attributesMap = { 'bulkPackage': 'bulkpackage' }
        this.basketRequest.cartItemList[0].payment.finalAmount = this.basketRequest.cartItemList[0].payment.originalAmount = this.communityPaymentsTrack.amount;
        this.basketRequest.cartItemList[0].payment.paymentStatus = this.paymentStatusIndex;
        this.basketRequest.cartItemList[0].payment.transactionType = this.transactionType;
        if (this.communityPaymentsTrack.profileId == 0) {
            this.basketRequest.cartItemList[0].parentProfileId = this.basketRequest.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.relationShipId;
        }
        else {
            this.basketRequest.cartItemList[0].parentProfileId = this.basketRequest.cartItemList[0].patientProfileId = this.communityPaymentsTrack.profileId;
        }
        this.basketRequest.cartItemList[0].excelPackage = true;


        if (this.transactionType == Payment.PAYMENT_TYPE_CARD
            || this.transactionType == Payment.PAYMENT_TYPE_CASH
            || this.transactionType == Payment.PAYMENT_TYPE_PHONEPE
            || this.transactionType == Payment.PAYMENT_TYPE_GOOGLE_PAY
            || this.transactionType == Payment.PAYMENT_TYPE_PAYTM
            || this.transactionType == Payment.PAYMENT_TYPE_NEFT
            || this.transactionType == Payment.PAYMENT_TYPE_UPI) {
            this.basketRequest.transactionType = this.basketRequest.cartItemList[0].payment.transactionType = this.transactionType;


        }
        else if (this.transactionType == Payment.PAYMENT_TYPE_MOBILE) {
            this.basketRequest.transactionType = this.basketRequest.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
        }

        console.log('basketrequest' + JSON.stringify(this.basketRequest));
        this.spinnerService.start();
        this.diagnosticService.initiatePayment(this.basketRequest).then((data) => {
            this.spinnerService.stop();
            this.response = new BasketRequest();
            this.response = data;

            console.log('basketreq--->' + JSON.stringify(this.basketRequest));
            if (this.basketRequest != null || (this.basketRequest != undefined)) {
                alert('successfully updated');
                this.router.navigate(['app/finance/brand/communitypayments']);
            }
            else {
                window.alert("Something went wrong please try again...!!")
            }

        });
    }
    ngOnDestroy(): void {
        this.businessAdminService.restoreData = true;
    }
}


