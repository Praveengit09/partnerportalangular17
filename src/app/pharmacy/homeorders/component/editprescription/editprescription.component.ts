import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { PharmacyService } from './../../../pharmacy.service';

import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';
import { StockDetails } from '../../../../model/product/stockdetails';
import { Taxes } from '../../../../model/basket/taxes';
import { PackingInformation } from '../../../../model/product/packinginformation';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { BaseGenericMedicine } from '../../../../model/pharmacy/baseGenericMedicine';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { CartItem } from '../../../../model/basket/cartitem';

@Component({
    selector: 'editprescription',
    templateUrl: './editprescription.template.html',
    styleUrls: ['./editprescription.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PharmacyEditPrescriptionComponent implements OnInit {

    processOrderDetails: AdminPharmacyDeliveryResponse;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    clickedItem: any;
    showMessagetxt: boolean;
    isErrorCheck: boolean = false;
    genericNameSearchResults: any;
    productNameSearchResults: any;
    productNameSelectTotal: number = 0;
    genericNameSelectTotal: number = 0;
    productNameHardReset: boolean = false;
    genericNameHardReset: boolean = false;
    imageSources: String[];
    crouselSelectedImage: String;
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
        private pharmacyService: PharmacyService, private auth: AuthService,
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
        console.log('==>>>>' + JSON.stringify(this.pharmacyService.tempPharmacyDeliveryDetails));
        if (!this.pharmacyService.tempPharmacyDeliveryDetails) {
            this.pharmacyService.tempPharmacyDeliveryDetails = JSON.parse(JSON.stringify(this.processOrderDetails));
        }
    }

    onGenerateBack(): void {
        this.pharmacyService.pharmacyDeliveryDetails = new AdminPharmacyDeliveryResponse();
        this.pharmacyService.pharmacyDeliveryDetails = JSON.parse(JSON.stringify(this.pharmacyService.tempPharmacyDeliveryDetails));
        this.router.navigate(['/app/pharmacy/homeorder/prescription']);
    }

    remove(index: number): void {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.isErrorCheck = false;
        this.processOrderDetails.cartItem.pharmacyList.splice(index, 1);
        this.onQuantityChange();
    }

    addNewMedicineRow() {
        $("hs-select").find(".search_table").css("display", "none !important");
        // Reset the search results if any so that the dropdown is not shown in the new row
        this.resetSearch();
        // Add new row
        let stockDetails = new StockDetails();
        let pharmacy = new Pharmacy();
        pharmacy.genericMedicine = new BaseGenericMedicine();
        pharmacy.taxes = new Taxes();
        pharmacy.totalTaxes = new Taxes();
        pharmacy.stockDetails = new StockDetails();
        pharmacy.stockDetails.taxes = new Taxes();
        pharmacy.packingInformation = new PackingInformation();
        if (this.processOrderDetails.cartItem.pharmacyList == undefined || this.processOrderDetails.cartItem.pharmacyList == null) {
            this.processOrderDetails.cartItem.pharmacyList = new Array<Pharmacy>();
        }
        this.processOrderDetails.cartItem.pharmacyList.push(pharmacy);
    }

    onProductChange(): void {
        this.isError = false;
        this.showMessage = false;
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
                    else if (element.quantity <= 0) {
                        console.log('Quantity error ' + element.productName);
                        this.isError = true;
                        this.errorMessage = new Array();
                        this.errorMessage[0] = "Please enter the quantity correctly!";
                        this.showMessage = true;
                        return;
                    }
                    else if (element.grossPrice <= 0) {
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

    productNameSearchTrigger(searchTerm: string) {
        this.searchProduct(searchTerm, 2);
    }

    genericNameSearchTrigger(searchTerm: string) {
        this.searchProduct(searchTerm, 3);
    }

    resetSearch() {
        this.productNameSearchResults = null;
        this.genericNameSearchResults = null;
        this.productNameSelectTotal = 0;
        this.genericNameSelectTotal = 0;
        this.productNameHardReset = false;
        this.genericNameHardReset = false;
    }

    selectTrigger(selected: any, index: number) {
        this.resetSearch();

        this.productNameSelectTotal = 1;
        this.genericNameSelectTotal = 1;
        this.productNameHardReset = true;
        this.genericNameHardReset = true;

        if (!selected.taxes) {
            selected.taxes = new Taxes();
        }
        if (!selected.totalTaxes) {
            selected.totalTaxes = new Taxes();
        }
        if (!selected.stockDetails) {
            selected.stockDetails = new StockDetails();
        }
        if (!selected.stockDetails.taxes) {
            selected.stockDetails.taxes = new Taxes();
        }
        if (!selected.packingInformation) {
            selected.packingInformation = new PackingInformation();
        }

        this.processOrderDetails.cartItem.pharmacyList[index] = selected;
        this.productNameSelectTotal = 0;
        this.genericNameSelectTotal = 0;
    }

    searchProduct(key: string, searchCriteria) {
        this.resetSearch();
        var searchRequest = new SearchRequest();
        searchRequest.aliasSearchType = 1;
        searchRequest.id= this.auth.employeeDetails.empId;
        searchRequest.searchCriteria = searchCriteria;
        searchRequest.searchTerm = key;
        if (key.length > 2) {
            console.log(JSON.stringify(searchRequest.searchTerm));
            //this.spinnerService.start();
            this.pharmacyService.searchProduct(searchRequest).then(searchResult => {
                //this.spinnerService.stop();
                if (searchCriteria == 2) {
                    this.productNameSelectTotal = searchResult.length;
                    this.productNameSearchResults = searchResult;
                } else if (searchCriteria == 3) {
                    this.genericNameSelectTotal = searchResult.length;
                    this.genericNameSearchResults = searchResult;
                }
                this.commonUtil.sleep(700);
            });
        }
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
            this.errorMessage[0] = "Please add medicines to proceed further.";
            this.isError = true;
            this.showMessage = true;
            return;
        }
        this.processOrderDetails.cartItem.pharmacyList.forEach(item => {
            if (+item.grossPrice <= 0) {
                this.errorMessage.push("Pricing not found for " + item.productName);
                this.isError = true;
                this.showMessage = true;
                hasErrors = true;
            }
            if (+item.quantity <= 0) {
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
                this.processOrderDetails.cartItem = { ...this.processOrderDetails.cartItem, ...cartItemResponse };
                this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
                this.router.navigate(['/app/pharmacy/homeorder/checkout']);
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

    sliderImage(imageSrc) {
        if (imageSrc.substring((imageSrc.lastIndexOf('.') + 1)).toString() == "pdf") {
            this.auth.openPDF(imageSrc)
        } else {
            this.crouselSelectedImage = imageSrc;
        }
    }
}