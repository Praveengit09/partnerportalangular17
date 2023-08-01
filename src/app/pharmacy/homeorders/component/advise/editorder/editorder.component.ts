import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../../auth/auth.service';
import { CryptoUtil } from './../../../../../auth/util/cryptoutil';
import { Config } from './../../../../../base/config';
import { DiagnosticsService } from './../../../../../diagnostics/diagnostics.service';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from './../../../../../model/basket/basketRequest';
import { CartItem } from './../../../../../model/basket/cartitem';
import { Payment } from './../../../../../model/basket/payment';
import { Pharmacy } from './../../../../../model/pharmacy/pharmacy';
import { Address } from './../../../../../model/profile/address';
import { SelectedRegisteredProfile } from './../../../../../model/profile/selectedRegisteredProfile';
import { PharmacyService } from './../../../../pharmacy.service';

@Component({
    selector: 'editorder',
    templateUrl: './editorder.template.html',
    styleUrls: ['./editorder.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditNewOrderComponent implements OnInit, OnDestroy {

    cartItem: CartItem = new CartItem();
    errorMessage: Array<string> = new Array();
    isError: boolean;
    showMessage: boolean;

    selectedRegisteredProfile: SelectedRegisteredProfile;
    selectedProfileAddress: Array<any> = new Array();
    selectedId = -1;
    pocId: number;
    empId: number;
    city: number;
    brandId: number;
    reportResponse: any;
    pdfHeaderType: number;
    paymentModeIndex: number;
    configAppId: number;

    Package4Original: number;
    transactionId: string = '';
    otherDiscountAmountInput: number;
    otherDiscountAmountOutput: number;
    isOldRecord: boolean = false;

    cryptoUtil: CryptoUtil = new CryptoUtil();
    deliveryAddress = new Address();

    constructor(private pharmacyService: PharmacyService,
        private authService: AuthService,
        private router: Router,
        private spinnerService: SpinnerService,
        private diagnosticService: DiagnosticsService) {
        this.configAppId = Config.portal.appId;
    }
    ngOnInit() {
        let cart = localStorage.getItem("homeorderCart");
        cart = cart && this.cryptoUtil.decryptData(cart);
        this.cartItem = cart && JSON.parse(cart);
        this.pocId = this.authService.userAuth.pocId;
        this.empId = this.authService.userAuth.employeeId;
        this.brandId = this.authService.userAuth.brandId;
        this.paymentModeIndex = Payment.PAYMENT_TYPE_CASH;
        if (!this.cartItem) {
            this.cartItem = new CartItem();
            this.cartItem.pocId = this.pocId;
            this.cartItem.brandId = this.brandId;
            this.cartItem.empId = this.empId;
            this.cartItem.cartItemType = CartItem.CART_ITEM_TYPE_PHARMACY;
            this.cartItem.bookingSource = 3;
            this.cartItem.paymentSource = 3;
            this.cartItem.payment = new Payment();
            this.cartItem.pharmacyList = new Array<Pharmacy>();
            this.cartItem.basketDiscount = new Array();
            this.cartItem.deliveryType = 2;
        }
        this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
    }

    ngOnDestroy() {
        if (this.cartItem != undefined || this.cartItem != null) {
            window.localStorage.setItem('homeorderCart', this.cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
        }
    }

    cartUpdate(event) {
        this.cartItem = event;
        this.Package4Original = this.cartItem.payment.originalAmount;
        // this.applyOtherDiscount(this.otherDiscountAmountInput);
    }
    onCalculateEvent(e) {
        this.cartItem = { ...this.cartItem, ...e };
        console.log(e);
    }

    onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
        this.selectedRegisteredProfile = selectedRegisteredProfile;
        this.cartItem.patientProfileDetails = selectedRegisteredProfile.selectedProfile;
        this.cartItem.patientProfileId = selectedRegisteredProfile.selectedProfile.profileId;
        this.cartItem.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.cartItem.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
        //console.log(selectedRegisteredProfile);

    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    onSubmitForCalculation() {
        window.scroll(0, 0);
        this.errorMessage = new Array();
        this.isError = this.showMessage = false;
        if (!this.cartItem.patientProfileId || this.cartItem.patientProfileId <= 0) {
            this.errorMessage[0] = "Add Patient Details";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        if (!this.deliveryAddress || !this.deliveryAddress.addressId) {
            this.errorMessage[0] = "Please Select Delivery Address";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        //console.log('Submitted the prescription');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        if (!this.cartItem.pharmacyList || this.cartItem.pharmacyList.length <= 0) {
            this.errorMessage[0] = "Please add medicines to proceed.";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        let hasError: boolean;
        this.cartItem.pharmacyList.forEach((item, i) => {
            item.isErrorFound = false;
            item.isErrorMsg = new Array<string>();
            if (!item.productName || item.productName == null || item.productName == undefined || item.productName == "") {
                item.isErrorMsg.push("Medicine not found ");
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (+item.grossPrice <= 0 || item.grossPrice == null || item.grossPrice == undefined) {
                item.isErrorMsg.push("Pricing not found for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            if (+item.quantity <= 0) {
                item.isErrorMsg.push("Quantity not set for " + item.productName);
                item.isErrorFound = this.isError = true;
                hasError = true;
                return;
            }
            let enableStockValidation = false;
            if (Config.portal && Config.portal.pharmacyOptions && Config.portal.pharmacyOptions.enableStockValidation) {
                enableStockValidation = true;
            }
            if (enableStockValidation && (!item.stockDetails.batchNo || item.stockDetails.batchNo.trim() == "")) {
                item.isErrorFound = this.isError = true;
                item.isErrorMsg.push("Please Select Batch Number");
                hasError = true;
                return;
            }
            if (enableStockValidation && (!item.stockDetails || !item.stockDetails.expiryDate || item.stockDetails.expiryDate < new Date().getTime())) {
                item.isErrorFound = this.isError = true;
                item.isErrorMsg.push("Please Check Medicine Expiry");
                hasError = true;
                return;
            }
        });
        if (hasError) {
            return;
        }
        let basketRequest: BasketRequest = new BasketRequest();

        if (!this.cartItem.empId || this.cartItem.empId == 0) {
            this.cartItem.empId = this.authService.userAuth.employeeId;
        }
        if (!this.cartItem.bookingSource || this.cartItem.bookingSource == 0) {
            this.cartItem.bookingSource = 3;
        }
        this.cartItem.deliveryAddress = this.deliveryAddress;
        basketRequest.parentProfileId = this.cartItem.parentProfileId;
        basketRequest.cartItemList = new Array<CartItem>();
        basketRequest.cartItemList[0] = this.cartItem;
        this.spinnerService.start();
        this.diagnosticService.calculateBasket(basketRequest).then(reportResponse => {
            // this.diagnosticService.initiatePayment(basketRequest)
            this.spinnerService.stop();
            if (reportResponse.statusCode == 201 || reportResponse.statusCode == 200) {
                this.spinnerService.stop();
                this.reportResponse = reportResponse;
                this.cartItem = reportResponse.cartItemList[0];
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = this.reportResponse.statusMessage;
                this.isError = false;
                this.showMessage = true;
                this.gotoProductInvoice();
            } else {
                this.spinnerService.stop();
                this.reportResponse = reportResponse;
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = this.reportResponse.statusMessage;
                this.isError = true;
                this.showMessage = true;
            }
        }).catch(error => {
            this.spinnerService.stop();
            console.error('Error occurred while getting the order details', error);
        });
    }

    gotoProductOrderList(): void {
        this.spinnerService.stop();
        this.router.navigate(['/app/pharmacy/homeorder']);
    }

    gotoProductInvoice() {
        this.spinnerService.stop();
        this.pharmacyService.pharmacyDeliveryDetails = this.reportResponse;
        this.pharmacyService.cartItem = this.cartItem;
        this.router.navigate(['/app/pharmacy/homeorder/new-summary']);
    }

    closeModel(id: string) {
        $(id).on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
        (<any>$(id)).modal('hide');
    }

    onSelectAddress(e) {
        //console.log('selected_address', address);
        // this.cartItem.deliveryAddress 
        this.deliveryAddress = e.selectedAddress;
        if (e.isListUpdated && this.cartItem.patientProfileDetails && this.cartItem.patientProfileDetails.contactInfo) {
            this.cartItem.patientProfileDetails.contactInfo.addresses = e.profileAddresses;
        }
    }

}