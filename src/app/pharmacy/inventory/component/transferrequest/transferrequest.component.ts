import { PackingInformation } from './../../../../model/product/packinginformation';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { BBCartItem } from './../../../../model/basket/b2bcartitem';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { Pharmacy } from './../../../../model/pharmacy/pharmacy';
import { PocDetail } from './../../../../model/poc/pocDetails';
import { PharmacyService } from './../../../pharmacy.service';

@Component({
    selector: 'transferrequest',
    templateUrl: './transferrequest.template.html',
    styleUrls: ['./transferrequest.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class TransferRequestComponent {

    stockReportResponseList: Array<StockOrder> = new Array();
    pharmacyList: Array<Pharmacy> = new Array();

    productResults: any = [];
    prodResultLength: number = 0;
    pocListTotal: number = 0;
    pocList: any = [];
    bbCartItem: BBCartItem = new BBCartItem();
    pocId: number = 0;
    brandId: number = 0;
    pocDetails: PocDetail = new PocDetail();

    noOfReportsPerPage: number = 10;
    indexOfPage: number = 1;
    currentIndex = -1;

    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string> = new Array();

    selectColumns: any[] = [
        {
            variable: 'pocName',
            filter: 'text'
        },
        {
            variable: 'productName',
            filter: 'text'
        }
    ];

    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
        this.pocId = this.auth.selectedPocDetails.pocId;
        this.brandId = this.auth.userAuth.brandId;
        this.pocDetails.pocId = 0;
    }

    getListOfPocs(searchTerm) {
        if (searchTerm.length <= 2)
            return;
        this.pharmacyService.getPocDetailsBasedOnName(searchTerm).then(response => {
            this.pocList = response.filter(p => p.brandId === this.brandId);
        })
    }

    searchProduct(searchTerm) {
        if (searchTerm.length <= 2)
            return;
        this.pharmacyService.getMedicinesBasedOnStock(this.pocId, searchTerm).then(response => {
            this.productResults = response;
        })
    }

    selectedProduct(prod, index) {
        console.log("selectedProduct", JSON.stringify(prod));
        console.log("index", index);
        this.stockReportResponseList[index].stockDetails = prod.stockDetails;
        this.stockReportResponseList[index].packingInformation = prod.packingInformation;
        this.stockReportResponseList[index].productId = prod.productId;
        this.stockReportResponseList[index].productName = prod.productName;
        this.stockReportResponseList[index].totalAvailableQuantity = (+prod.stockDetails.totalAvailableQuantity / +prod.packingInformation.unitsInPackage)

    }

    onPocSelect(poc) {
        this.pocDetails = poc;
    }


    addNewMedicineRow() {
        let temp: StockOrder = new StockOrder();
        temp.isEditText = true;
        temp.packingInformation = new PackingInformation();
        temp.packingInformation.packageType = "";
        this.stockReportResponseList.unshift(temp);
    }

    remove(stockOrder) {
        let INDEX: number = this.stockReportResponseList.indexOf(stockOrder);
        this.stockReportResponseList.splice(INDEX, 1);
    }

    onSubmit() {
        let isErrorCheck = false;
        console.log("pocDetails", JSON.stringify(this.pocDetails));
        if (this.pocDetails.pocId == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Select POC";
            $('html, body').animate({ scrollTop: '0px' }, 300);
            return;
        }

        if (this.stockReportResponseList.length == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please add atleast one stock";
            $('html, body').animate({ scrollTop: '0px' }, 300);
            return;
        }

        this.stockReportResponseList.forEach(element => {

            element.isErrorMsg = new Array();
            if (!element.productName || element.productName.trim() == "") {
                element.isErrorMsg.push("Fill Required Medicine");
            } else if (!element.requiredQuantity || element.requiredQuantity <= 0) {
                element.isErrorMsg.push("Fill Required Quantity");
            } else if (element.productId <= 0) {
                element.isErrorMsg.push("Select a medicine from searched list. You cannot add a new medicine from here.");
            } else if (element.totalAvailableQuantity < element.requiredQuantity)
                element.isErrorMsg.push("Quantity cant be more than Available Quantity");
            if (element.isErrorMsg && element.isErrorMsg.length > 0) {
                element.isErrorFound = true;
                isErrorCheck = true;
            } else {
                delete element.isErrorFound;
                delete element.isErrorMsg;
            }

        });

        if (isErrorCheck)
            return;

        this.stockReportResponseList.forEach(item => {
            let prod = new Pharmacy();
            prod.productId = item.productId;
            prod.productName = item.productName;
            prod.stockDetails = item.stockDetails;
            prod.packingInformation = item.packingInformation;
            prod.quantity = item.requiredQuantity;
            this.pharmacyList.push(prod);
        })

        this.bbCartItem.pharmacyList = this.pharmacyList;
        this.bbCartItem.purchaserPocDetails = this.pocDetails;
        this.bbCartItem.purchaserPocId = this.pocDetails.pocId;
        this.bbCartItem.pocDetails = this.auth.selectedPocDetails;
        this.bbCartItem.senderPocId = this.pocId;
        this.spinnerService.start();
        this.pharmacyService.raiseTransferPharmaList(this.bbCartItem).then((response) => {
            this.spinnerService.stop();
            console.log(response);
            alert("Request Raised Successfully");
            this.router.navigate(['app/pharmacy/inventory/transfer']);
        })
    }

    changePageIndex(index: number = 0) {
        this.indexOfPage = index;
    }
    getNumberOfPages() {
        if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
        if (this.stockReportResponseList.length == 0) return Array(1).fill(1);
        return Array(
            Math.ceil(this.stockReportResponseList.length / this.noOfReportsPerPage)
        ).fill(1);
    }

    validateNumberInputOnly(event) {
        var key = window.event ? event.keyCode : event.which;
        return (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39) ?
            true : (key < 48 || key > 57 ? false : true);
    }

}