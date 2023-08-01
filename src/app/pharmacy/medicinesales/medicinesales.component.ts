import { ToasterService } from './../../layout/toaster/toaster.service';
import { Component, OnInit, ViewEncapsulation, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Pharmacy } from '../../model/pharmacy/pharmacy';
import { AppConfig } from '../../app.config';
import { PharmacyService } from '../pharmacy.service';
import { AuthService } from '../../auth/auth.service';
import { CommonUtil } from '../../base/util/common-util';
import { StockDetails } from '../../model/product/stockdetails';
import { Taxes } from '../../model/basket/taxes';
import { GetProductRequest } from '../../model/pharmacy/getProductRequest';
import { BaseGenericMedicine } from '../../model/pharmacy/baseGenericMedicine';
import { PackingInformation } from '../../model/product/packinginformation';
import { SearchRequest } from '../../model/common/searchRequest';

@Component({
    selector: 'medicinesales',
    templateUrl: './medicinesales.template.html',
    styleUrls: ['./medicinesales.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class MedicineSalesComponent implements OnInit, OnChanges {

    pharmacyList: Array<Pharmacy> = new Array();

    @Input() triggerCount: number;
    @Input() disablePricing: boolean = false;
    @Output() calculateEvent: EventEmitter<any> = new EventEmitter();

    errorPSMessages: Array<string> = new Array();
    outofStockProductNames: Array<string> = new Array();
    itemOutOfstock: string;
    isPSError: boolean;
    showPSMessage: boolean;
    isReset: boolean = false;

    clickedItem: any;

    showPSMessagetxt: boolean;
    isPSErrorCheck: boolean = false;

    gstError: boolean = false;
    showgstMessage: boolean = false;
    errorgstMessages: Array<string> = new Array();

    genericNameSearchResults: any;
    productNameSearchResults: any;
    productCodeSearchResults: any;
    productNameSelectTotal: number = 0;
    genericNameSelectTotal: number = 0;
    productCodeSearchTotal: number = 0;
    productNameHardReset: boolean = false;
    genericNameHardReset: boolean = false;
    altPharmaMedicines: Array<Pharmacy> = new Array<Pharmacy>();
    genericMedicineName: string = '';
    altIndex: number = 0;

    morePharmacyMedicine: Array<Pharmacy>;
    morePharmacyMedicineBackUp: any;

    selectedPharmacy: Pharmacy = new Pharmacy();
    isEditedOrder: boolean;
    isHomeOrder: boolean = false;
    pharmacyDeliveryDetails: any;
    isTrue: boolean = false;
    isShowPriceSummury: boolean = false;

    // isErrorPro = ["Please Provide Medicine Details"];

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
    isRefreshGenericCode: boolean;
    isRefreshProdName: boolean;
    isRefreshProdCode: boolean;
    isScanning: boolean = false;

    constructor(config: AppConfig, private toast: ToasterService,
        private pharmacyService: PharmacyService, private auth: AuthService,
        private commonUtil: CommonUtil) {
        this.isEditedOrder = this.pharmacyService.isEditedOrder;
        this.isHomeOrder = pharmacyService.isHomeOrder;
        this.pharmacyDeliveryDetails = this.pharmacyService.pharmacyDeliveryDetails;
        this.initiatePharmacy();
    }

    ngOnInit() {
        console.log(JSON.stringify(this.pharmacyService.pharmacyList))
        this.initiatePharmacy();
        // this.isShowPriceSummury = this.pharmacyService.isShowPriceSummury;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['triggerCount']) {
            this.initiatePharmacy();
        }
    }

    private initiatePharmacy() {
        if (this.pharmacyService && this.pharmacyService.pharmacyList) {
            this.pharmacyList = this.pharmacyService.pharmacyList;
            if (this.pharmacyList) {

                this.pharmacyList.forEach(element => {
                    if (!(element.stockDetails && element.stockDetails.batchNo)) {
                        element.stockDetails = new StockDetails();
                        element.stockDetails.taxes = new Taxes();
                        if (!element.taxes) {
                            element.taxes = new Taxes();
                        }
                        if (!element.totalTaxes) {
                            element.totalTaxes = new Taxes();
                        }
                        if (!element.packingInformation) {
                            element.packingInformation = new PackingInformation();
                        }
                    } else {
                        // element.taxes = element.stockDetails.taxes;
                    }
                });
            }
            else {
                this.pharmacyList = new Array();
            }
            this.selectedPharmacy = new Pharmacy();
            this.selectedPharmacy.stockDetails = new StockDetails();
            this.selectedPharmacy.stockDetails.taxes = new Taxes();
            this.getMedicineDetails();
        }
    }

    getMedicineDetails() {
        console.log('==>suman' + console.log(this.pharmacyList));
        if (this.pharmacyList) {
            this.pharmacyList.forEach(element => {
                var productRequest = new GetProductRequest();
                productRequest.productCode = element.productCode;
                productRequest.productId = element.productId;
                productRequest.pocId = this.auth.selectedPocDetails.pocId;
                this.getProduct(element, productRequest)
                // .then(() => { this.calculateCost(); });
            });
        }
    }
    checkIsAvailable(item: Pharmacy) {
        if (!item.packingInformation) {
            item.packingInformation = new PackingInformation();
        }
        if (!item.taxes) {
            item.taxes = new Taxes();
            item.totalTaxes = new Taxes();
        }
        if (!item.stockDetails) {
            item.stockDetails = new StockDetails();
        }

    }
    async getProduct(item: Pharmacy, productRequest: GetProductRequest) {
        item.packageSoldLoose = item.packageSoldLoose ? true : false;
        await this.pharmacyService.getProduct(productRequest).then(productDetail => {
            productDetail = productDetail.filter(e => { return e.stockDetails.totalAvailableQuantity != 0 && e.productId != 0 });
            let isAlreadyExist: boolean = false;
            if (productDetail.length <= 1) {
                this.pharmacyList.forEach((e, i) => {
                    if (productDetail[0] && e.productId == productDetail[0].productId && e.stockDetails.batchNo &&
                        e.stockDetails.batchNo == productDetail[0].stockDetails.batchNo && (!productDetail[0].packingInformation.unitsInPackage || e.packingInformation.unitsInPackage == productDetail[0].packingInformation.unitsInPackage)) {
                        isAlreadyExist = true;
                    }
                });
                if (isAlreadyExist) {
                    item.isPriceEditable = true;
                    this.showOutOfStockError(item, productDetail);
                    return;
                }
            }
            if (productDetail.length > 0) {
                item.pharmacyStockList = new Array<Pharmacy>();
                item.pharmacyStockList = productDetail;
                if (productDetail.length > 1) {
                    item.grossPrice = 0;
                    item.netPrice = 0;
                    item.taxes = new Taxes();
                    item.totalTaxes = new Taxes();
                    item.batchNumberTemp = productDetail.length + "more batches available.";
                    if (item.stockDetails.batchNo) {
                        productDetail.forEach(e => {
                            if (e.stockDetails.batchNo == item.stockDetails.batchNo) {
                                item.stockDetails = e.stockDetails;
                                item.grossPrice = e.stockDetails.grossPrice;
                                item.netPrice = e.stockDetails.netPrice;
                                item.taxes = item.totalTaxes = e.stockDetails.taxes;
                                item.batchNumberTemp = e.stockDetails.batchNo;
                                item.stockDetails.unitNetPrice = +e.stockDetails.netPrice;
                                item.stockDetails.packageNetPrice = e.stockDetails.packageNetPrice ?
                                    +e.stockDetails.packageNetPrice : +e.stockDetails.netPrice;
                                item.netPrice = item.stockDetails.netPrice
                                    = +item.stockDetails.packageNetPrice;
                                item.stockDetails.packingInformation = new PackingInformation();
                                item.stockDetails.packingInformation = e.packingInformation;
                                // item.packageSoldLoose = false;
                                item.packageSoldLoose = item.packageSoldLoose ? true : false;
                                item.netPrice = item.packageSoldLoose ? item.stockDetails.unitNetPrice : item.stockDetails.packageNetPrice;
                                //  e.packingInformation && e.packingInformation.unitsInPackage && e.packingInformation.unitsInPackage > 0;
                            };
                            this.calculateCost();
                        });
                    }
                }
                else {
                    item.stockDetails = new StockDetails();
                    if (item.productId != productDetail[0].productId) {
                        item.productName = productDetail[0].productName;
                        item.productCode = productDetail[0].productCode;
                        item.genericMedicine = productDetail[0].genericMedicine;
                    }
                    if (productDetail[0].stockDetails) {
                        item.stockDetails = this.cloneObject(productDetail[0].stockDetails);
                        //item.grossPrice = this.cloneObject(productDetail[0].stockDetails.grossPrice);
                        item.netPrice = this.cloneObject(productDetail[0].stockDetails.netPrice);
                        item.taxes = this.cloneObject(item.totalTaxes = productDetail[0].stockDetails.taxes);
                        item.batchNumberTemp = this.cloneObject(productDetail[0].stockDetails.batchNo);
                        item.stockDetails.unitNetPrice = this.cloneObject(+productDetail[0].stockDetails.netPrice);
                        // productDetail[0].stockDetails.unitNetPrice ? +productDetail[0].stockDetails.unitNetPrice :
                        item.stockDetails.packageNetPrice = this.cloneObject(productDetail[0].stockDetails.packageNetPrice ?
                            +productDetail[0].stockDetails.packageNetPrice : +productDetail[0].stockDetails.netPrice);
                        // item.netPrice = this.cloneObject(+item.stockDetails.packageNetPrice);
                        //  = item.stockDetails.netPrice
                        item.stockDetails.packingInformation = new PackingInformation();
                        item.stockDetails.packingInformation = productDetail[0].packingInformation;
                        item.packingInformation = productDetail[0].packingInformation;
                        item.netPrice = this.cloneObject(item.packageSoldLoose ? item.stockDetails.unitNetPrice : item.stockDetails.packageNetPrice);
                    }
                    item.packingInformation = productDetail[0].packingInformation ? productDetail[0].packingInformation : new PackingInformation();
                    // item.genericMedicine = productDetail[0].genericMedicine && productDetail[0].genericMedicine.genericMedicineName ? productDetail[0].genericMedicine : new BaseGenericMedicine();
                    item.schedule = productDetail[0].schedule;
                    !this.isEditedOrder ? item.packageSoldLoose = false : '';
                    this.showOutOfStockError(item, productDetail);
                    // this.errorPSMessages.forEach(data => {
                    //     "Stock is not available for " + item.productName
                    // })
                    this.calculateCost();
                }
            } else {
                this.getGenericBasedAltProduct();
                item.isPriceEditable = true;
                if (item.taxes) {
                    item.stockDetails.taxes.cgst = item.taxes.cgst;
                    item.stockDetails.taxes.sgst = item.taxes.sgst;
                }
                this.calculateCost();
                this.showOutOfStockError(item, productDetail);
                return;
            }
        }).catch(error => {
            console.error('Error occurred while fetching the stock details', error);
        });
    }
    convertToUnitOrPackagePrice(item: Pharmacy, condition) {
        item.packageSoldLoose = JSON.parse(condition);
        let unitsInPackage = item.packingInformation.unitsInPackage;
        if (condition == 'true') {
            item.netPrice = this.roundToTwo(+item.stockDetails.packageNetPrice / unitsInPackage);
            item.stockDetails.netPrice = item.stockDetails.unitNetPrice = this.roundToTwo(+item.stockDetails.packageNetPrice / unitsInPackage);
            item.grossPrice = 0;
        }
        else {
            if (!item.stockDetails.packageNetPrice && item.netPrice) {
                item.stockDetails.packageNetPrice = item.stockDetails.unitNetPrice * unitsInPackage;
            }
            item.stockDetails.netPrice = item.netPrice = this.roundToTwo(+item.stockDetails.packageNetPrice);
            item.grossPrice = 0;
        }
        this.calculateCost();
    }

    showOutOfStockError(item, productDetail) {
        if (this.outofStockProductNames.includes(this.itemOutOfstock)) {
            for (var i = 0; i < this.outofStockProductNames.length - 1; i++) {
                // alert(this.itemOutOfstock + '.......' + this.outofStockProductNames[i]);
                if (this.outofStockProductNames[i] == this.itemOutOfstock) {
                    this.outofStockProductNames.splice(i, 1);
                    this.itemOutOfstock = null;
                }
            }
        }
        if (!(productDetail.length > 0) && !this.outofStockProductNames.includes(item.productName)) {
            this.outofStockProductNames.push(item.productName);
            item.outOfStockName = item.productName;
            // item.stockDetails = new StockDetails();
            item.stockDetails.taxes = new Taxes();
            item.stockDetails.totalAvailableQuantity = 0;
        }

        if (this.outofStockProductNames.length > 0) {
            this.isPSError = true;
            this.showPSMessage = true;
            this.isPSErrorCheck = true;
        } else {
            this.isPSError = false;
            this.showPSMessage = false;
            this.isPSErrorCheck = false;
        }
    }

    onMoreBatchNumberClick(i: number) {
        this.clickedItem = i;
        if (this.pharmacyList && this.pharmacyList[i] && this.pharmacyList[i].pharmacyStockList && this.pharmacyList[i].pharmacyStockList.length > 1) {
            this.morePharmacyMedicine = this.pharmacyList[i].pharmacyStockList;
            this.morePharmacyMedicine.sort(function (a, b) {
                if ((a.stockDetails.expiryDate) > (b.stockDetails.expiryDate)) return 1;
                if ((a.stockDetails.expiryDate) < (b.stockDetails.expiryDate)) return -1;
                return 0;
            });
            this.morePharmacyMedicineBackUp = new Array<Pharmacy>();
            this.morePharmacyMedicineBackUp = JSON.parse(JSON.stringify(this.morePharmacyMedicine));
            (<any>$)('#myModal').modal('show');
        } else {
            return;
        }
    }

    onClosingPopUp() {
        this.morePharmacyMedicine.splice(0);
        this.morePharmacyMedicine.push.apply(this.morePharmacyMedicine, this.morePharmacyMedicineBackUp);
        (<any>$)('#myModal').modal('hide');
    }

    onFinalMedicineSelection() {

        // if (this.pharmacyList[this.clickedItem] && (this.pharmacyList[this.clickedItem].quantity == undefined || this.pharmacyList[this.clickedItem].quantity == 0)) {
        //     this.pharmacyList[this.clickedItem].quantity = 1;
        // }

        // Identify if the batch is already set. If yes, then iterate and reset the earlier batch records
        // if (this.pharmacyList[this.clickedItem] && this.pharmacyList[this.clickedItem].stockDetails &&
        //     this.pharmacyList[this.clickedItem].stockDetails.batchNo && this.pharmacyList[this.clickedItem].stockDetails.batchNo.trim() != '') {
        //     let productId = this.pharmacyList[this.clickedItem].productId;
        //     let counter = this.clickedItem + 1;
        //     while (counter < this.pharmacyList.length) {
        //         if (this.pharmacyList[counter].productId == productId) {
        //             this.pharmacyList[this.clickedItem].quantity =
        //                 this.pharmacyList[this.clickedItem].quantity + this.pharmacyList[counter].quantity;
        //             this.pharmacyList.splice(counter, 1);
        //         } else {
        //             break;
        //         }
        //     }
        // }
        // // console.log("pharmacyList in finalMedicine:: " + JSON.stringify(this.pharmacyList));
        // this.pharmacyList[this.clickedItem].isPriceChanged = false;
        // // Find the total required medicines count
        // let requiredQuantity: number = this.pharmacyList[this.clickedItem].quantity;
        // // Identify the selected medicines based on the flag
        // if (this.morePharmacyMedicine != null && this.morePharmacyMedicine.length > 0) {
        //     let runningIndex: number = this.clickedItem;
        //     let isFirst: boolean = true;
        //     for (let index: number = 0; index < this.morePharmacyMedicine.length; index++) {
        //         let selItem = this.morePharmacyMedicine[index];
        //         if (selItem.isMultiMedicineSelect && selItem.stockDetails != undefined
        //             && selItem.stockDetails != null && selItem.stockDetails.totalAvailableQuantity > 0
        //             && requiredQuantity > 0) {
        //             //To Set PackagePrice ,UnitPrice And sale Package loose unit or else
        //             if (this.pharmacyList[this.clickedItem].pharmacyStockList) {
        //                 for (let item of this.pharmacyList[this.clickedItem].pharmacyStockList) {
        //                     item.packageSoldLoose = false;
        //                     item.stockDetails.unitNetPrice = +item.stockDetails.packageNetPrice / +item.packingInformation.unitsInPackage;
        //                     item.netPrice = item.stockDetails.netPrice
        //                         = item.stockDetails.packageNetPrice;
        //                 }
        //             }
        //             console.log(JSON.stringify(this.pharmacyList[this.clickedItem]))
        //             // alert(this.pharmacyList[this.clickedItem].netPrice);
        //             // For the first selected batch, set it on the original record in medicines list
        //             // For consecutive selected batches, insert duplicate row below the original, and set the batch details

        //             if (!isFirst) {
        //                 runningIndex += 1;
        //                 let newRecord = JSON.parse(JSON.stringify(this.pharmacyList[this.clickedItem]));
        //                 this.pharmacyList.splice(runningIndex, 0, newRecord);
        //                 this.pharmacyList.join();
        //             }
        //             // For the first index, since it is has the most recent expiry date, use as much as possible
        //             if (selItem.stockDetails.totalAvailableQuantity > requiredQuantity) {
        //                 this.setSelectedBatchDetails(selItem, requiredQuantity, runningIndex, isFirst);
        //                 requiredQuantity = 0;
        //             } else {
        //                 this.setSelectedBatchDetails(selItem, selItem.stockDetails.totalAvailableQuantity, runningIndex, isFirst);
        //                 requiredQuantity = requiredQuantity - selItem.stockDetails.totalAvailableQuantity;
        //             }

        //             isFirst = false;
        //         }
        //         if (requiredQuantity == 0) {
        //             break;
        //         }
        //     }

        // }
        //Resetting Pharmacy list If same product Exists 
        if (this.pharmacyList && this.pharmacyList.length > 0) {
            let productId = this.pharmacyList[this.clickedItem].productId;
            let counter = this.clickedItem + 1;
            while (counter < this.pharmacyList.length) {
                if (this.pharmacyList[counter].productId == productId) {
                    this.pharmacyList[this.clickedItem].quantity =
                        this.pharmacyList[this.clickedItem].quantity + this.pharmacyList[counter].quantity;
                    this.pharmacyList.splice(counter, 1);
                } else {
                    break;
                }
            }
        }
        //Setting quantity with 1 if quantity not there
        if (this.pharmacyList[this.clickedItem] && !this.pharmacyList[this.clickedItem].quantity) {
            this.pharmacyList[this.clickedItem].quantity = 1;
        }
        //To Set PackagePrice ,UnitPrice And sale Package loose unit or else
        if (this.pharmacyList[this.clickedItem] && this.pharmacyList[this.clickedItem].pharmacyStockList && this.pharmacyList[this.clickedItem].pharmacyStockList.length > 0) {
            for (let item of this.pharmacyList[this.clickedItem].pharmacyStockList) {
                item.packageSoldLoose = false;
                if (!item.stockDetails.packageNetPrice || item.stockDetails.packageNetPrice == 0) {
                    item.stockDetails.packageNetPrice = item.stockDetails.netPrice ? item.stockDetails.netPrice : 0;
                }
                if (!item.stockDetails.unitNetPrice || item.stockDetails.unitNetPrice == 0) {
                    item.stockDetails.unitNetPrice = item.stockDetails.netPrice ? item.stockDetails.netPrice : 0;
                }
                item.stockDetails.unitNetPrice = +item.stockDetails.packageNetPrice / (item.packingInformation.unitsInPackage ? +item.packingInformation.unitsInPackage : 1);
                item.netPrice = item.stockDetails.netPrice = item.stockDetails.packageNetPrice;
            }
        }
        this.pharmacyList[this.clickedItem].isPriceChanged = false;
        //Checking For Selected Medicines
        if (this.morePharmacyMedicine && this.morePharmacyMedicine.length > 0) {
            let pharmaIndex: number = +(this.clickedItem + '');
            let isFirst: boolean = true;
            let requiredQuantity = this.pharmacyList[this.clickedItem].quantity;
            this.morePharmacyMedicine.forEach((selItem, selIndex) => {
                const { totalAvailableQuantity } = selItem.stockDetails;
                const { unitsInPackage } = selItem.packingInformation;
                let avlPacks = !this.pharmacyList[this.clickedItem].packageSoldLoose ? totalAvailableQuantity / unitsInPackage : totalAvailableQuantity;
                let looseAvailable = true;
                selItem.packageSoldLoose = this.pharmacyList[this.clickedItem].packageSoldLoose
                if (selItem.packageSoldLoose) {
                    looseAvailable = Number.isInteger(avlPacks);
                }
                if (selItem.isMultiMedicineSelect && selItem.stockDetails && looseAvailable && avlPacks > 0) {
                    if (isFirst) {
                        requiredQuantity = this.multiBatchPriceSet(selItem, requiredQuantity, pharmaIndex, isFirst);
                        isFirst = !isFirst;
                    } else if (requiredQuantity) {
                        pharmaIndex += 1;
                        let newItem: Pharmacy = JSON.parse(JSON.stringify(this.pharmacyList[this.clickedItem]));
                        newItem.quantity = requiredQuantity;
                        this.pharmacyList.splice(pharmaIndex, 0, newItem);
                        requiredQuantity = this.multiBatchPriceSet(selItem, requiredQuantity, pharmaIndex, isFirst);

                    }
                    console.log(`element==>${selItem.stockDetails.batchNo},,${requiredQuantity + '' + selItem.stockDetails.totalAvailableQuantity},,Quantity==>${this.pharmacyList[pharmaIndex].quantity}`)
                }
            });
            let fxItem = this.pharmacyList[pharmaIndex];
            let locAvailQuantity = !fxItem.packageSoldLoose ? fxItem.stockDetails.totalAvailableQuantity / fxItem.packingInformation.unitsInPackage : fxItem.stockDetails.totalAvailableQuantity;
            if (requiredQuantity > 0 && fxItem.quantity >= locAvailQuantity) {
                let newItem: Pharmacy = JSON.parse(JSON.stringify(this.pharmacyList[this.clickedItem]));
                pharmaIndex += 1;
                newItem.quantity = requiredQuantity;
                this.pharmacyList.splice(pharmaIndex, 0, newItem);
                this.pharmacyList[pharmaIndex].pharmacyStockList = new Array();
                this.pharmacyList[pharmaIndex].stockDetails = new StockDetails();
                this.pharmacyList[pharmaIndex].isPriceEditable = true;
                this.pharmacyList[pharmaIndex].quantity = requiredQuantity;
                if (!this.pharmacyList[pharmaIndex].taxes) {
                    this.pharmacyList[pharmaIndex].taxes = new Taxes();
                    this.pharmacyList[pharmaIndex].totalTaxes = new Taxes();
                }
                this.pharmacyList[pharmaIndex].stockDetails.taxes = new Taxes();
                // requiredQuantity = this.multiBatchPriceSet(selItem, requiredQuantity, pharmaIndex, isFirst);
            }
        }

        this.calculateCost();
        (<any>$)('#myModal').modal('hide');
    }
    private multiBatchPriceSet(selItem: Pharmacy, requiredQuantity: number, pharmaIndex: number, isFirst: boolean) {
        let locAvailQuantity = !selItem.packageSoldLoose ? selItem.stockDetails.totalAvailableQuantity / selItem.packingInformation.unitsInPackage : selItem.stockDetails.totalAvailableQuantity;
        if (locAvailQuantity > requiredQuantity) {
            console.log(`element==>${selItem.stockDetails.batchNo},,${requiredQuantity + '' + selItem.stockDetails.totalAvailableQuantity},,Quantity1==>${this.pharmacyList[pharmaIndex].quantity}`)
            this.setSelectedBatchDetails(selItem, requiredQuantity, pharmaIndex, isFirst);
            requiredQuantity = 0;
        } else {
            this.setSelectedBatchDetails(selItem, locAvailQuantity, pharmaIndex, isFirst);
            requiredQuantity = requiredQuantity - locAvailQuantity;
        }
        return requiredQuantity;
    }
    private setSelectedBatchDetails(selectedBatch: Pharmacy, quantity: number, index: number, isFirst: boolean) {
        console.log("selected Batch in SetSelected---->" + JSON.stringify(selectedBatch));
        this.pharmacyList[index].stockDetails = new StockDetails();
        this.pharmacyList[index].batchNumberTemp = this.pharmacyList[index].stockDetails.batchNo = selectedBatch.stockDetails.batchNo;
        this.pharmacyList[index].schedule = selectedBatch.schedule;
        this.pharmacyList[index].medicineStrength = selectedBatch.medicineStrength;
        this.pharmacyList[index].genericMedicine = selectedBatch.genericMedicine;
        this.pharmacyList[index].packingInformation = selectedBatch.packingInformation;
        this.pharmacyList[index].stockDetails = selectedBatch.stockDetails;
        this.pharmacyList[index].quantity = quantity;
        this.pharmacyList[index].netPrice = +selectedBatch.stockDetails.netPrice;
        this.pharmacyList[index].grossPrice = +selectedBatch.stockDetails.grossPrice;
        this.pharmacyList[index].taxes = JSON.parse(JSON.stringify(selectedBatch.stockDetails.taxes));
        if (!isFirst) {
            this.pharmacyList[index].pharmacyStockList = new Array<Pharmacy>();
            this.pharmacyList[index].pharmacyStockList[0] = selectedBatch;
        }
        let item = this.pharmacyList[index].pharmacyStockList[0];
        item.netPrice = (item.packageSoldLoose ? (item.stockDetails.unitNetPrice ? item.stockDetails.unitNetPrice : item.stockDetails.netPrice) : (item.stockDetails.packageNetPrice ? item.stockDetails.packageNetPrice : item.stockDetails.netPrice));
        this.pharmacyList[index].netPrice = (this.pharmacyList[index].packageSoldLoose
            ? (this.pharmacyList[index].stockDetails.unitNetPrice ? this.pharmacyList[index].stockDetails.unitNetPrice : this.pharmacyList[index].stockDetails.netPrice)
            : (this.pharmacyList[index].stockDetails.packageNetPrice ? this.pharmacyList[index].stockDetails.packageNetPrice : this.pharmacyList[index].stockDetails.netPrice));
    }

    remove(index: number): void {
        this.isPSError = false;
        this.errorPSMessages = new Array();
        this.showPSMessage = false;
        this.isPSErrorCheck = false;
        this.pharmacyList.splice(index, 1);
        this.onQuantityChange();
        if (this.altIndex == index)
            this.altPharmaMedicines = new Array<Pharmacy>();
    }

    addNewMedicineRow() {
        $("hs-select").find(".search_table").css("display", "none !important");
        // Reset the search results if any so that the dropdown is not shown in the new row
        this.resetSearch();
        // Add new row

        if (this.pharmacyList == undefined || this.pharmacyList == null) {
            this.pharmacyList = new Array<Pharmacy>();
        }
        let pharmacy = new Pharmacy();
        pharmacy = new Pharmacy();
        this.pharmacyList.push(this.newMedicineResetDetails(pharmacy));
        this.isReset = true;
        console.log("addNewMedicineRow");
    }

    newMedicineResetDetails(pharmacy: Pharmacy) {
        pharmacy.genericMedicine = new BaseGenericMedicine();
        pharmacy.taxes = new Taxes();
        pharmacy.totalTaxes = new Taxes();
        pharmacy.packingInformation = new PackingInformation();
        pharmacy.productCode = '';
        pharmacy.productName = '';
        pharmacy.genericMedicine.genericMedicineName = '';
        pharmacy.productId = null;
        pharmacy.quantity = 0;
        pharmacy.looseQuantity = 0;
        pharmacy.grossPrice = 0;
        pharmacy.netPrice = 0;
        pharmacy.batchNumberTemp = null;
        pharmacy.stockDetails = new StockDetails();
        pharmacy.stockDetails.taxes = new Taxes();
        pharmacy.stockDetails.unitNetPrice = 0;
        pharmacy.stockDetails.packageNetPrice = 0;
        pharmacy.stockDetails.packingInformation = new PackingInformation();
        pharmacy.schedule = null;
        pharmacy.packageSoldLoose = false;
        pharmacy.pharmacyStockList = new Array<Pharmacy>();
        return pharmacy;
    }

    onProductChange(): void {
        this.isPSError = false;
        this.showPSMessage = false;
    }

    onPriceChange(price, index) {
        let nx = ('' + price).split('.');
        console.log("OnPriceChange: " + ('' + price).split('.')[1] + ">>>>" + index + ">>>>>" + this.pharmacyList.length);
        if (!nx[1] && nx.length == 2) {
            return true;
        }
        this.isPSError = false;
        this.showPSMessage = false;
        this.errorPSMessages = new Array();
        if (this.pharmacyList != null
            && this.pharmacyList.length > index
            && this.pharmacyList[index] && +price >= 0) {
            this.pharmacyList[index].isPriceChanged = true;
            this.pharmacyList[index].netPrice = +price;
            this.selectedPharmacy = this.pharmacyList[index];
            // this.pharmacyList[index].packageSoldLoose = false;
            if (!this.selectedPharmacy.packingInformation || !this.selectedPharmacy.packingInformation.unitsInPackage) {
                this.selectedPharmacy.packingInformation = new PackingInformation();
                this.selectedPharmacy.packingInformation.unitsInPackage = 1;
            }
            if (this.pharmacyList[index].packageSoldLoose) {
                this.pharmacyList[index].stockDetails.unitNetPrice = this.selectedPharmacy.netPrice;
                this.pharmacyList[index].stockDetails.packageNetPrice = this.selectedPharmacy.netPrice * +this.selectedPharmacy.packingInformation.unitsInPackage;
            } else {
                this.pharmacyList[index].stockDetails.packageNetPrice = this.selectedPharmacy.netPrice;
                this.pharmacyList[index].stockDetails.unitNetPrice = this.selectedPharmacy.netPrice / +this.selectedPharmacy.packingInformation.unitsInPackage;
            }
            // this.pharmacyList[index].stockDetails.packageNetPrice = price;
            // this.pharmacyList[index].stockDetails.unitNetPrice = price;
            let taxes = this.pharmacyList[index].taxes;
            let grossPrice = 0;
            price = this.roundToTwo(+price);
            if (taxes && +taxes.cgst + +taxes.sgst > 0) {
                grossPrice = +price / (1 + (+taxes.cgst + +taxes.sgst) / 100);
                let cgstAmount = this.roundToTwo(grossPrice * (+taxes.cgst) / 100);
                let sgstAmount = this.roundToTwo(grossPrice * (+taxes.sgst) / 100);
                this.pharmacyList[index].taxes.cgstAmount = cgstAmount;
                this.pharmacyList[index].taxes.sgstAmount = sgstAmount;
                let totalTaxes = cgstAmount + sgstAmount;
                grossPrice = +price - totalTaxes;
            }
            else if (taxes && +taxes.cgst > 0) {
                grossPrice = +price / (1 + (+taxes.igst) / 100);
                let igstAmount = this.roundToTwo(grossPrice * (+taxes.igst) / 100);
                this.pharmacyList[index].taxes.igstAmount = igstAmount;
                grossPrice = +price - igstAmount;
            } else {
                this.pharmacyList[index].taxes = new Taxes();
                this.pharmacyList[index].taxes.cgst = 0;
                this.pharmacyList[index].taxes.sgst = 0;
                this.pharmacyList[index].taxes.igst = 0;
                this.pharmacyList[index].taxes.cgstAmount = 0;
                this.pharmacyList[index].taxes.sgstAmount = 0;
                this.pharmacyList[index].taxes.igstAmount = 0;
                grossPrice = +price;
            }
            this.pharmacyList[index].grossPrice = +grossPrice;
            if (!this.pharmacyList[index].stockDetails || this.pharmacyList[index].stockDetails.totalAvailableQuantity > 0) {
                this.pharmacyList[index].stockDetails = new StockDetails();
            }

            this.pharmacyList[index].stockDetails.netPrice = this.pharmacyList[index].netPrice;//+price;
            this.pharmacyList[index].stockDetails.grossPrice = +grossPrice;
            this.pharmacyList[index].stockDetails.taxes = this.pharmacyList[index].taxes;

            console.log(JSON.stringify(this.pharmacyList[index]));
            this.onQuantityChange();
        } else if (this.pharmacyList != null && price == 0) {
            console.log("Update");
            this.pharmacyList[index].stockDetails.grossPrice = 0;
            this.pharmacyList[index].stockDetails.netPrice = 0;
            this.pharmacyList[index].grossPrice = 0;
            this.pharmacyList[index].netPrice = 0;
        }
        console.log("1111: " + JSON.stringify(this.pharmacyList[index]));
        return this.checkClaimValidation('zero', this.pharmacyList[index])
        // Product

    }

    onQuantityChange(): void {
        console.log("onQuantityChange");
        this.isPSError = false;
        this.showPSMessage = false;
        this.errorPSMessages = new Array();

        if (this.pharmacyList != null && this.pharmacyList.length > 0) {
            this.pharmacyList.forEach(element => {
                if (element == undefined || element == null) {
                    this.isPSError = true;
                    this.errorPSMessages = new Array();
                    this.errorPSMessages[0] = "Something went wrong while calculating!";
                    this.showPSMessage = true;
                    return;
                } else {
                    if (element.productId == undefined || +element.productId <= 0) {
                        this.isPSError = true;
                        this.errorPSMessages = new Array();
                        this.errorPSMessages[0] = "Please add medicine to proceed further";
                        console.log('Product Code error ' + element.productId);
                        this.showPSMessage = true;
                        return;
                    }
                    else if (+element.quantity <= 0) {
                        console.log('Quantity error ' + element.productName);
                        this.isPSError = true;
                        this.errorPSMessages = new Array();
                        this.errorPSMessages[0] = "Please enter the quantity correctly!";
                        this.showPSMessage = true;
                        return;
                    }
                    else if (+element.grossPrice <= 0) {
                        console.log('Gross price error ' + element.productName);
                        this.isPSError = true;
                        this.errorPSMessages = new Array();
                        this.errorPSMessages[0] = "Please enter the gross price correctly!";
                        this.showPSMessage = true;
                        return;
                    }
                    element.quantity = +element.quantity;
                }
            });
            this.calculateCost();
        } else {
            this.pharmacyService.pharmacyList = this.pharmacyList;
            this.calculateEvent.emit({ 'originalAmount': 0, 'taxationAmount': 0, 'finalAmount': 0, 'reset': this.isReset });
        }
    }
    checkObject(element) {
        if (!(element.packingInformation && element.packingInformation.unitsInPackage)) {
            element.packingInformation = new PackingInformation();
            element.packingInformation.unitsInPackage = 1;
            element.stockDetails.unitNetPrice = this.cloneObject(+element.netPrice);
            element.stockDetails.packageNetPrice = this.cloneObject(+element.netPrice);
        }
        if (element.stockDetails && !element.taxes) {
            element.taxes = element.stockDetails.taxes;
        } else {
            element.stockDetails.taxes = this.cloneObject(element.taxes);
        }
    }

    calculateCost() {
        console.log("calculateCost");
        let emitData = {
            'originalAmount': 0, 'taxationAmount': 0, 'finalAmount': 0, 'reset': this.isReset
        };
        let calcData = this.pharmacyService.calculateCost(this.pharmacyList);
        emitData = { ...emitData, ...calcData };
        this.pharmacyService.pharmacyList = calcData.pharmacyList;
        this.calculateEvent.emit(emitData);
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
    }

    productNameSearchTrigger(searchTerm: string, index?) {
        this.searchProduct(searchTerm, 2, index);
    }

    genericNameSearchTrigger(searchTerm: string, index?) {
        this.searchProduct(searchTerm, 3, index);
    }

    productCodeSearchTrigger(searchTerm: string, index?) {
        this.searchProduct(searchTerm, 1, index);
    }

    resetSearch() {
        this.productNameSearchResults = null;
        this.genericNameSearchResults = null;
        this.productNameSelectTotal = 0;
        this.genericNameSelectTotal = 0;
        this.productCodeSearchTotal = 0;
        this.productNameHardReset = false;
        this.genericNameHardReset = false;
    }

    async selectTrigger(selected: any, index: number) {
        this.resetSearch();
        // console.log(JSON.stringify(selected));
        this.genericMedicineName = selected.genericMedicine.genericMedicineName;
        this.altIndex = index;

        this.productNameSelectTotal = 1;
        this.genericNameSelectTotal = 1;
        this.productCodeSearchTotal = 1;
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
        let isSoldLoose: boolean;
        let selectedQuantity: number;
        if (this.isEditedOrder) {
            isSoldLoose = this.pharmacyList[index].packageSoldLoose;
            selectedQuantity = this.pharmacyList[index].quantity;
        }
        this.pharmacyList[index] = selected;
        this.pharmacyList[index].isErrorFound = false;
        this.pharmacyList[index].isPriceEditable = false;
        // this.pharmacyList[index].grossPrice = 0;
        // this.pharmacyList[index].netPrice = 0;
        this.pharmacyList[index].packageSoldLoose = isSoldLoose;
        this.pharmacyList[index].quantity = selectedQuantity;

        var productRequest = new GetProductRequest();
        productRequest.productCode = selected.productCode;
        productRequest.productId = selected.productId;
        productRequest.pocId = this.auth.selectedPocDetails.pocId;
        let proDetail = await this.getProduct(this.pharmacyList[index], productRequest).then(item => {
            console.log(JSON.stringify(this.pharmacyList[index]));
        });

        this.productNameSelectTotal = 0;
        this.genericNameSelectTotal = 0;
        this.productCodeSearchTotal = 0;
        this.checkClaimValidation('Product', this.pharmacyList[index])
    }

    searchProduct(key: string, searchCriteria, index) {
        this.resetSearch();
        var searchRequest = new SearchRequest();
        searchRequest.aliasSearchType = 1;
        searchRequest.id;
        searchRequest.searchCriteria = searchCriteria;
        searchRequest.searchTerm = key;

        this.pharmacyList[index].isPriceEditable = key.length > 2;
        if (key.length > 2) {
            if (searchCriteria == 2) {
                this.pharmacyList[index].productName = key;
            } else if (searchCriteria == 3) {
                this.pharmacyList[index].genericMedicine.genericMedicineName = key;
            }
            else if (searchCriteria == 1) {
                this.pharmacyList[index].productCode = key;
            }
            console.log(JSON.stringify(searchRequest.searchTerm));
            this.altPharmaMedicines = new Array<Pharmacy>();
            //this.spinnerService.start();
            this.pharmacyService.searchProduct(searchRequest).then(searchResult => {
                //this.spinnerService.stop();
                let isEmpty = searchResult.length <= 0;
                if (isEmpty) {
                    this.pharmacyList[index].isPriceEditable = true;
                    let selectedItem = this.pharmacyList[index];
                    if (selectedItem.productId || (selectedItem.netPrice && selectedItem.batchNumberTemp && selectedItem.stockDetails && selectedItem.stockDetails.batchNo)) {
                        // this.newMedicineResetDetails(this.pharmacyList[index]);
                        this.isRefreshProdCode = searchCriteria != 1;
                        this.isRefreshProdName = searchCriteria != 2;
                        this.isRefreshGenericCode = searchCriteria != 3;
                        setTimeout(() => {
                            this.isRefreshProdCode = false;
                            this.isRefreshProdName = false;
                            this.isRefreshGenericCode = false;
                        }, 10)
                    }
                }
                if (searchCriteria == 2) {
                    this.productNameSelectTotal = searchResult.length;
                    this.productNameSearchResults = searchResult;
                } else if (searchCriteria == 3) {
                    this.genericNameSelectTotal = searchResult.length;
                    this.genericNameSearchResults = searchResult;
                }
                else if (searchCriteria == 1) {
                    this.productCodeSearchTotal = searchResult.length;
                    this.productCodeSearchResults = searchResult;
                }
                this.commonUtil.sleep(700);
            }).catch(error => {
                console.error('Error occurred while searching product', error);
            });
        }
    }

    updateExpiryDate(pharmacy: Pharmacy): void {

        this.selectedPharmacy = pharmacy;
        pharmacy.netPrice = pharmacy.netPrice ? +pharmacy.netPrice : 0;
        pharmacy.quantity = pharmacy.quantity ? +pharmacy.quantity : 0;
        if (!this.selectedPharmacy.stockDetails) {
            this.selectedPharmacy.stockDetails = new StockDetails();
            this.selectedPharmacy.stockDetails.netPrice = +pharmacy.netPrice;
            this.selectedPharmacy.stockDetails.taxes = new Taxes();
        }
        if (!(this.selectedPharmacy.packingInformation
            && this.selectedPharmacy.packingInformation.unitsInPackage)) {
            this.selectedPharmacy.packingInformation = new PackingInformation();
            this.selectedPharmacy.packingInformation.unitsInPackage = 1;
            this.selectedPharmacy.packingInformation.packageType = "package";
            this.packingInformationUpdate();
        }
        (<any>$("#medicineUpdate")).modal("show");
        $(".modal-backdrop").not(':first').remove();
    }
    cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }


    updateMedicineBatchDetails(): void {
        if (this.selectedPharmacy.stockDetails.taxes && this.selectedPharmacy.stockDetails.taxes.cgst && (!this.checkIfNumber(this.selectedPharmacy.stockDetails.taxes.cgst) || this.selectedPharmacy.stockDetails.taxes.cgst > 100)) {
            this.gstError = true;
            this.showgstMessage = true;
            this.errorgstMessages = new Array();
            this.errorgstMessages[0] = "Please enter a valid CGST";
            return;
        }

        if (this.selectedPharmacy.stockDetails.taxes && this.selectedPharmacy.stockDetails.taxes.sgst && (!this.checkIfNumber(this.selectedPharmacy.stockDetails.taxes.sgst) || this.selectedPharmacy.stockDetails.taxes.sgst > 100)) {
            this.gstError = true;
            this.showgstMessage = true;
            this.errorgstMessages = new Array();
            this.errorgstMessages[0] = "Please enter a valid SGST";
            return;
        }

        if (this.selectedPharmacy.stockDetails.taxes && this.selectedPharmacy.stockDetails.taxes.sgst
            && this.selectedPharmacy.stockDetails.taxes.cgst && ((+this.selectedPharmacy.stockDetails.taxes.cgst + +this.selectedPharmacy.stockDetails.taxes.sgst >= 100) || (+this.selectedPharmacy.stockDetails.taxes.cgst + +this.selectedPharmacy.stockDetails.taxes.sgst < 0))) {
            this.gstError = true;
            this.showgstMessage = true;
            this.errorgstMessages = new Array();
            this.errorgstMessages[0] = "Please enter a valid CGST and SGST";
            return;
        } else {
            this.gstError = false;
            this.showgstMessage = false;
            this.errorgstMessages = new Array();
        }

        this.selectedPharmacy.stockDetails.taxes.igst = +0;
        this.selectedPharmacy.taxes = JSON.parse(JSON.stringify(this.selectedPharmacy.stockDetails.taxes));
        (<any>$)('#medicineUpdate').modal('hide');
        this.selectedPharmacy.taxes.cgst = +this.selectedPharmacy.taxes.cgst;
        this.selectedPharmacy.taxes.sgst = +this.selectedPharmacy.taxes.sgst;
        this.selectedPharmacy.taxes.igst = +this.selectedPharmacy.taxes.igst;
        let index = this.pharmacyList.findIndex(item => {
            return item.productId == this.selectedPharmacy.productId &&
                item.stockDetails.batchNo == this.selectedPharmacy.stockDetails.batchNo
        });
        this.packingInformationUpdate(index);
        this.isReset = true;
        console.log("updateMedicineBatchDetails");
        this.onPriceChange(this.selectedPharmacy.netPrice, index);
    }
    packingInformationUpdate(index?) {
        if (!index) {
            index = this.pharmacyList.findIndex(item => {
                return item.productId == this.selectedPharmacy.productId &&
                    item.stockDetails.batchNo == this.selectedPharmacy.stockDetails.batchNo
            });
        }
        let isPackSold = this.pharmacyList[index].packageSoldLoose;
        this.pharmacyList[index].packingInformation = this.selectedPharmacy.packingInformation;
        if (!this.selectedPharmacy.packingInformation.unitsInPackage || this.selectedPharmacy.packingInformation.unitsInPackage == 0) {
            this.selectedPharmacy.packingInformation.unitsInPackage = this.pharmacyList[index].packingInformation.unitsInPackage = 1;
        }

        if (this.pharmacyList[index].packageSoldLoose) {
            this.pharmacyList[index].stockDetails.packageNetPrice = this.roundToTwo(+this.selectedPharmacy.netPrice * +this.selectedPharmacy.packingInformation.unitsInPackage);
            this.pharmacyList[index].stockDetails.unitNetPrice = this.roundToTwo(+this.selectedPharmacy.netPrice);
            this.selectedPharmacy.netPrice = isPackSold ? this.pharmacyList[index].stockDetails.unitNetPrice : this.pharmacyList[index].stockDetails.packageNetPrice;
            this.pharmacyList[index].packageSoldLoose = isPackSold;
        } else {
            this.pharmacyList[index].stockDetails.packageNetPrice = this.roundToTwo(+this.selectedPharmacy.netPrice);
            this.pharmacyList[index].stockDetails.unitNetPrice = this.roundToTwo(+this.selectedPharmacy.netPrice / +this.selectedPharmacy.packingInformation.unitsInPackage);
            console.log('===>' + this.pharmacyList[index].stockDetails.packageNetPrice + this.pharmacyList[index].stockDetails.unitNetPrice + this.pharmacyList[index].packingInformation.unitsInPackage)
            this.selectedPharmacy.netPrice = this.pharmacyList[index].stockDetails.packageNetPrice;
            this.pharmacyList[index].packageSoldLoose = false;
        }
    }

    onDateSubmit(selectedDate: Date): void {
        this.selectedPharmacy.stockDetails.expiryDate = +selectedDate.getTime();
        this.checkClaimValidation('Expired', this.selectedPharmacy);

    }

    validateNumberInputOnly(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode == 8 || event.keyCode == 46
            || event.keyCode == 37 || event.keyCode == 39) {
            let val = event.target.value.split('.');
            if (val.length > 1 && event.keyCode == 46) {
                return false;
            }
            return true;
        }
        else if (key < 48 || key > 57) {
            return false;
        }
        else return true;
    }


    validateDecimalValue(evt) {
        var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
        if (!(keyCode >= 48 && keyCode <= 57) || keyCode != 190) {
            if (!(keyCode == 8 || keyCode == 9 || keyCode == 35 || keyCode == 36 || keyCode == 37 || keyCode == 39 || keyCode == 46)) {
                return false;
            }
            else {
                return true;
            }
        }

        var velement = evt.target || evt.srcElement
        var fstpart_val = velement.value;
        let check = this.checkIfNumber(fstpart_val);
        if (!check) {
            return false;
        }
        var fstpart = velement.value.length;
        if (fstpart.length == 2) return false;
        var parts = velement.value.split('.');
        if (parts[0].length >= 14) return false;
        if (parts.length == 2 && parts[1].length >= 3) return false;
        return false;
    }

    checkIfNumber(value) {
        let check = /^[+]?(?=.)(?:\d+,)*\d*(?:\.\d+)?$/.test(value);
        if (!check) {
            return false;
        } else {
            return true;
        }
    }
    checkClaimValidation(type, selectedMedicine) {
        if (selectedMedicine.isErrorFound) {
            let msg: string = selectedMedicine.isErrorMsg[0];
            if (msg.includes(type)) {
                selectedMedicine.isErrorFound = false;
            }
        }
    }
    scanBatchno() {
        if (this.selectedPharmacy) {
            (<any>$("#barscanner")).modal('show');
            this.isScanning = true;
        }
    }
    onScanCode(e) {
        console.log(e);
        const { value } = e;
        this.selectedPharmacy.stockDetails.batchNo = value;
    }
    onCloseModal(type) {
        this.isScanning = false;
        (<any>$("#" + type)).modal('show');
    }

    getGenericBasedAltProduct() {
        if (this.genericMedicineName.length >= 3) {
            this.pharmacyService.getAltProduct(this.genericMedicineName).then(response => {
                this.altPharmaMedicines = response;
                if (this.altPharmaMedicines.length > 0)
                    this.toast.show("Out of stock. Please select another alternate", "bg-danger text-white font-weight-bold", 3000);
            });
        }
    }

    onMedChange(product) {
        if (product == 0)
            return;
        let prod = new Pharmacy();
        this.altPharmaMedicines.forEach((item, index) => {
            if (item.productId == product)
                prod = this.altPharmaMedicines[index];
        })
        prod.packingInformation = new PackingInformation();
        this.selectTrigger(prod, this.altIndex);
        this.altPharmaMedicines = new Array<Pharmacy>();
    }

}