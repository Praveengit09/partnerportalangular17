import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { Pharmacy } from './../../../../model/pharmacy/pharmacy';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { CartItem } from './../../../../model/basket/cartitem';
import { PharmacyService } from './../../../pharmacy.service';
@Component({
    selector: 'walkin',
    templateUrl: './walkinreturns.template.html',
    styleUrls: ['./walkinreturns.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class WalkinReturnComponent {

    orderDetails: CartItem;
    pharmacyList: Array<Pharmacy>;
    showList: Array<Pharmacy>;
    editCheck: boolean = true;

    isError: boolean;
    errorMessage: Array<string>;

    constructor(private pharmacyService: PharmacyService,
        private router: Router, private spinnerService: SpinnerService) {
        this.orderDetails = this.pharmacyService.pharmacyAdviseTrack;
        this.pharmacyList = JSON.parse(JSON.stringify(this.orderDetails.pharmacyList));
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.orderDetails != undefined || this.orderDetails != null) {
            window.localStorage.setItem('orderDetails', cryptoUtil.encryptData(JSON.stringify(this.orderDetails)));
        } else {
            if (window.localStorage.getItem('orderDetails') != null && window.localStorage.getItem('orderDetails').length > 0) {
                this.orderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('orderDetails')));
            }
        }
        this.pharmacyList.forEach(doc => {
            doc.returnPackageStatus = 1;
            doc.returnType = 'Package';
            if (doc.packageSoldLoose)
                doc.returnType = "loose";
            else
                doc.packingInformation.packageType != undefined ? doc.returnType = doc.packingInformation.packageType : '';
        });
    }

    validateNumberInputOnly(event) {
        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    onNext() {

        let req = false;
        this.isError = false;
        this.errorMessage = new Array();
        this.pharmacyList.forEach(doc => {
            if (doc.returnQuantity > 0) {
                req = true;
                return;
            }
            else
                doc.returnQuantity = 0;
        });

        if (!req) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push("Enter alteast one quantity");
            $('html, body').animate({ scrollTop: '0px' }, 300);
            return;
        }

        let check: boolean = false;
        this.pharmacyList.forEach(item => {
            if (item.packageSoldLoose) {
                if (+item.returnQuantity > item.quantity) {
                    check = true;
                    item.isErrorFound = true;
                    item.isErrorMsg = new Array();
                    item.isErrorMsg.push("Enter proper quantity");
                }
                else {
                    item.isErrorMsg = new Array();
                    item.isErrorFound = false;
                }
            }
            else {
                if (item.returnPackageStatus == 1) {
                    if (+item.returnQuantity > item.quantity) {
                        check = true;
                        item.isErrorFound = true;
                        item.isErrorMsg = new Array();
                        item.isErrorMsg.push("Enter proper quantity");
                    }
                    else {
                        item.isErrorMsg = new Array();
                        item.isErrorFound = false;
                    }
                }
                if (item.returnPackageStatus == 2) {
                    if (+item.returnQuantity > item.looseQuantity) {
                        check = true;
                        item.isErrorFound = true;
                        item.isErrorMsg = new Array();
                        item.isErrorMsg.push("Enter proper quantity");
                    }
                    else {
                        item.isErrorMsg = new Array();
                        item.isErrorFound = false;
                    }
                }
            }
        })
        if (check)
            return;
        this.spinnerService.start();
        this.pharmacyList.forEach((item, i) => {
            if (item.packageSoldLoose) {
                this.orderDetails.pharmacyList[i].quantity = +item.returnQuantity;
            }
            else {
                if (item.returnPackageStatus == 1) {
                    let unitsInPackage = item.packingInformation.unitsInPackage;
                    this.orderDetails.pharmacyList[i].quantity =  +item.returnQuantity;
                    if (!item.stockDetails.packageNetPrice && item.netPrice) {
                        this.orderDetails.pharmacyList[i].stockDetails.packageNetPrice = item.stockDetails.unitNetPrice * unitsInPackage;
                    }
                    this.orderDetails.pharmacyList[i].stockDetails.netPrice = this.orderDetails.pharmacyList[i].netPrice = this.roundToTwo(+this.orderDetails.pharmacyList[i].stockDetails.packageNetPrice);
                    this.orderDetails.pharmacyList[i].grossPrice = 0;
                    this.orderDetails.pharmacyList[i].packageSoldLoose = false;
                }
                else if (item.returnPackageStatus == 2) {
                    let unitsInPackage = item.packingInformation.unitsInPackage;
                    this.orderDetails.pharmacyList[i].quantity = +item.returnQuantity;
                    this.orderDetails.pharmacyList[i].packageSoldLoose = true;
                    this.orderDetails.pharmacyList[i].netPrice = this.roundToTwo(+this.orderDetails.pharmacyList[i].stockDetails.packageNetPrice / unitsInPackage);
                    this.orderDetails.pharmacyList[i].stockDetails.netPrice = this.orderDetails.pharmacyList[i].stockDetails.unitNetPrice = this.roundToTwo(+this.orderDetails.pharmacyList[i].stockDetails.packageNetPrice / unitsInPackage);
                    this.orderDetails.pharmacyList[i].grossPrice = 0;
                }
            }
        });

        let temp = this.pharmacyService.calculateCost(this.orderDetails.pharmacyList);
        this.orderDetails.pharmacyList = temp.pharmacyList;
        
        this.showList = this.orderDetails.pharmacyList.filter(doc => doc.quantity > 0);

        this.pharmacyService.calculatePharmacyDeliveries(this.orderDetails).then(cartItemResponse => {
            this.spinnerService.stop();
            if (cartItemResponse.statusCode == 200 || cartItemResponse.statusCode == 201) {
                this.orderDetails = cartItemResponse;
                this.editCheck = false;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error occurred while processing request. Please try again!";
                return;
            }
        });
    }

    onSubmit() {
        console.log('onSubmit', JSON.stringify(this.pharmacyList));
        console.log('onSubmit', JSON.stringify(this.orderDetails));
        let requestBody: any = {};
        requestBody.actionStatus = 1;
        requestBody.cartItem = this.orderDetails;
        this.spinnerService.start();
        this.pharmacyService.completePharmacyWalkinReturn(requestBody).then(response => {
            this.spinnerService.stop();
            alert(response.statusMessage);
            this.router.navigate(['/app/pharmacy/orders']);
        });
    }

    onGenerateBack() {
        if (this.editCheck)
            this.router.navigate(['/app/pharmacy/orders']);
        else
            this.editCheck = true;
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

}