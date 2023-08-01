import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { PharmacyService } from './../../../pharmacy.service';

import { CommonUtil } from '../../../../base/util/common-util';
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';
import { Taxes } from '../../../../model/basket/taxes';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { CartItem } from '../../../../model/basket/cartitem';

@Component({
    selector: 'editreturn',
    templateUrl: './edit.template.html',
    styleUrls: ['./edit.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class EditReturnComponent implements OnInit {

    processOrderDetails: AdminPharmacyDeliveryResponse;

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    showMessagetxt: boolean;
    isErrorCheck: boolean = false;

    genericNameSearchResults: any;
    productNameSearchResults: any;
    productNameSelectTotal: number = 0;
    genericNameSelectTotal: number = 0;
    productNameHardReset: boolean = false;
    genericNameHardReset: boolean = false;

    imageSources: String[];

    validation: any;

    selectColumns: any[] = [
        {
            variable: 'productName',
            filter: 'text'
        },
        {
            variable: 'genericMedicine.genericMedicineName',
            filter: 'text'
        },
        {
            variable: 'medicineStrength',
            filter: 'text'
        }
    ];

    constructor(config: AppConfig,
        private pharmacyService: PharmacyService,
        private router: Router, private spinnerService: SpinnerService,
        private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
        this.validation = validationUtil;
        if (this.pharmacyService && this.pharmacyService.pharmacyDeliveryDetails) {
            this.processOrderDetails = JSON.parse(JSON.stringify(this.pharmacyService.pharmacyDeliveryDetails));
        }
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
            this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
        }
        if (this.processOrderDetails.cartItem == undefined || this.processOrderDetails.cartItem == null) {
            this.processOrderDetails.cartItem = new CartItem();
        }
        if (this.processOrderDetails.cartItem.pharmacyList == undefined || this.processOrderDetails.cartItem.pharmacyList == null) {
            this.processOrderDetails.cartItem.pharmacyList = new Array<Pharmacy>();
        }

        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            this.imageSources = this.processOrderDetails.cartItem.proofDocumentUrlList;
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/returns/order']);
    }

    remove(index: number): void {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        this.processOrderDetails.cartItem.pharmacyList.splice(index, 1);
        this.onQuantityChange();
    }

    onQuantityChange(): void {
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();

        if (this.processOrderDetails.cartItem.pharmacyList != null && this.processOrderDetails.cartItem.pharmacyList.length > 0) {
            this.processOrderDetails.cartItem.pharmacyList.forEach(element => {
                if (element == undefined || element == null) {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = "Something went wrong!";
                    this.showMessage = true;
                    return;
                } else {
                    if (element.productId == undefined || element.productId <= 0) {
                        this.isError = true;
                        this.errorMessage = new Array();
                        this.errorMessage[0] = "Please add medicine to proceed further";
                        console.log('Product Code error ' + element.productId);
                        this.showMessage = true;
                        return;
                    }
                    else if (+element.quantity <= 0) {
                        console.log('Quantity error ' + element.productName);
                        this.isError = true;
                        this.errorMessage = new Array();
                        this.errorMessage[0] = "Please enter the quantity correctly!";
                        this.showMessage = true;
                        return;
                    }
                    else if (+element.grossPrice <= 0) {
                        console.log('Gross price error ' + element.productName);
                        this.isError = true;
                        this.errorMessage = new Array();
                        this.errorMessage[0] = "Please enter the gross price correctly!";
                        this.showMessage = true;
                        return;
                    }
                    this.calculateCost();

                }
            });
        } else {
            this.processOrderDetails.cartItem.payment.originalAmount = 0;
            this.processOrderDetails.cartItem.payment.taxationAmount = 0;
            this.processOrderDetails.cartItem.payment.finalAmount = 0;
        }
    }

    calculateCost() {
        let originalAmount: number = 0;
        let taxationAmount: number = 0;
        let finalAmount: number = 0;
        this.processOrderDetails.cartItem.pharmacyList.forEach(element => {
            let tax: number = 0;
            if (element.grossPrice > 0 && element.quantity > 0) {

                element.totalTaxes = new Taxes();
                if (element.taxes != undefined && element.taxes != null) {
                    element.totalTaxes.cgst = element.taxes.cgst != undefined && element.taxes.cgst > 0 ? element.taxes.cgst : 0;
                    element.totalTaxes.sgst = element.taxes.sgst != undefined && element.taxes.sgst > 0 ? element.taxes.sgst : 0;
                    element.totalTaxes.igst = element.taxes.igst != undefined && element.taxes.igst > 0 ? element.taxes.igst : 0;
                    element.taxes.cgstAmount = this.roundToTwo(element.grossPrice * element.totalTaxes.cgst / 100);
                    element.taxes.sgstAmount = this.roundToTwo(element.grossPrice * element.totalTaxes.sgst / 100);
                    element.taxes.igstAmount = this.roundToTwo(element.grossPrice * element.totalTaxes.igst / 100);
                    tax = element.totalTaxes.cgst + element.totalTaxes.sgst + element.totalTaxes.igst;
                }

                let taxAmountPerUnit: number = element.taxes.cgstAmount + element.taxes.sgstAmount + element.taxes.igstAmount;
                element.netPrice = +element.grossPrice + +taxAmountPerUnit;
                console.log('Gross Price is ' + element.grossPrice);
                console.log('Net Price is ' + element.netPrice);
                console.log('Tax Amount Per Unit is ' + taxAmountPerUnit);

                element.originalAmount = element.grossPrice * element.quantity;
                originalAmount = +originalAmount + +element.originalAmount;

                element.totalTaxes.cgstAmount = (element.quantity * element.taxes.cgstAmount);
                element.totalTaxes.sgstAmount = (element.quantity * element.taxes.sgstAmount);
                element.totalTaxes.igstAmount = (element.quantity * element.taxes.igstAmount);

                element.taxationAmount = (element.totalTaxes.cgstAmount + element.totalTaxes.sgstAmount + element.totalTaxes.igstAmount);
                taxationAmount = +taxationAmount + +element.taxationAmount;

                element.finalAmount = +element.originalAmount + +element.taxationAmount;
            }
        });
        this.processOrderDetails.cartItem.payment.originalAmount = originalAmount;
        this.processOrderDetails.cartItem.payment.taxationAmount = taxationAmount;
        //     this.processOrderDetails.cartItem.payment.packageDiscountAmount = this.processOrderDetails.cartItem.payment.originalAmount * 0.1;
        this.processOrderDetails.cartItem.payment.finalAmount = originalAmount + taxationAmount
            + (this.processOrderDetails.cartItem.deliveryAmount ? this.processOrderDetails.cartItem.deliveryAmount : 0)
            - (this.processOrderDetails.cartItem.payment.packageDiscountAmount ? this.processOrderDetails.cartItem.payment.packageDiscountAmount : 0)
            - (this.processOrderDetails.cartItem.payment.otherDiscountAmount ? this.processOrderDetails.cartItem.payment.otherDiscountAmount : 0);
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    onSubmitForCalculation() {
        window.scroll(0, 0);
        console.log('Submitted the prescription');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        let hasErrors = false;
        if (!this.processOrderDetails.cartItem.pharmacyList || this.processOrderDetails.cartItem.pharmacyList.length <= 0) {
            this.errorMessage[0] = "Please add pharmacy to proceed.";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        this.processOrderDetails.cartItem.pharmacyList.forEach(item => {
            if (item.grossPrice <= 0) {
                this.errorMessage.push("Pricing not found for " + item.productName);
                this.isError = true;
                this.showMessage = true;
                hasErrors = true;
            }
            if (item.quantity <= 0) {
                this.errorMessage.push("Quantity not set for " + item.productName);
                this.isError = true;
                this.showMessage = true;
                hasErrors = true;
            }
        });
        if (hasErrors) {
            return;
        }
        this.spinnerService.start();
        this.pharmacyService.calculatePharmacyDeliveries(this.processOrderDetails.cartItem).then(cartItemResponse => {
            this.spinnerService.stop();
            if (cartItemResponse.statusCode == 200 || cartItemResponse.statusCode == 201) {
                this.processOrderDetails.cartItem = cartItemResponse;
                this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
                this.router.navigate(['/app/pharmacy/returns/summary']);
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
}