import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SupplierDetails } from '../../../../model/inventory/supplierDetails';
import { PharmacyService } from '../../../pharmacy.service';
import { AuthService } from './../../../../auth/auth.service';
import { MonthpickerComponent } from './../../../../layout/widget/monthpicker/monthpicker.component';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { City } from './../../../../model/base/city';
import { State } from './../../../../model/base/state';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { StockReportRequest } from './../../../../model/inventory/stockReportRequest';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { GetProductRequest } from './../../../../model/pharmacy/getProductRequest';
import { PharmacyInventoryDetail } from './../../../../model/pharmacy/pharmacyProductsDetailsList';
import { UpdateSupplierOrderListRequest } from './../../../../model/pharmacy/updateSupplierOrderListRequest';
import { Address } from './../../../../model/poc/address';
import { POCService } from './../../../../poc/poc.service';

@Component({
    templateUrl: './stockorder.template.html',
    styleUrls: ['./stockorder.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class StockOrderinformationComponent implements OnInit, OnDestroy {

    @ViewChild(MonthpickerComponent, { static: false })
    private monthPickerComponent: MonthpickerComponent;

    config: any;
    pdfHeaderType: number;
    pharmacyName: string;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    supplierId: number;
    supplierResultLength = 0;
    searchResultLength = 0;
    supplierResult: any;
    expiryDate: Date;
    quantity: number = 0;
    productName: string;
    docTypeIndex: number = 1;
    pdfUrl: string;
    isErrorCheck: boolean = false;
    pocAddress: Address = new Address();
    pocMobile: any;
    pocEmail: string;
    pocState: State = new State();
    pocCity: City = new City();

    searchResult: PharmacyInventoryDetail[] = new Array();
    medicineSearchTrack: StockReportRequest;
    stockReportRequest: StockReportRequest = new StockReportRequest();
    stockReportResponseList: Array<StockOrder> = new Array();
    updateSupplierOrderListRequest: UpdateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();
    noOfReportsPerPage: number = 10;
    indexOfPage: number = 1;
    currentIndex = -1;
    supplierMobileNum = "";
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

    constructor(config: AppConfig, private router: Router, private authService: AuthService,
        private pharmacyService: PharmacyService, private pocService: POCService, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        this.pharmacyName = this.authService.userAuth.pocName;
    }

    ngOnInit() {
        if (this.pharmacyService.productStockList) {
            this.stockReportResponseList = this.pharmacyService.productStockList;
            this.updateSupplierOrderListRequest = this.pharmacyService.supplierDetails;
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem("productStockList") != undefined &&
                window.localStorage.getItem("productStockList") != null) {
                this.stockReportResponseList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("productStockList")));
                window.localStorage.removeItem("productStockList");
            }
        } else {
            if (this.pharmacyService.supplierId && this.pharmacyService.supplierId != 0) {
                this.stockReportResponseList = this.pharmacyService.productStockList;
                let supplierData = this.pharmacyService.supplierDetails;
                this.supplierId = supplierData.supplierDetails.pocId;
                this.updateSupplierOrderListRequest = supplierData;
                this.updateSupplierOrderListRequest.supplierDetails = new SupplierDetails();
                this.updateSupplierOrderListRequest.supplierDetails.address = new Address();
                this.updateSupplierOrderListRequest.supplierDetails.contactList = [];
                this.stockReportRequest = this.pharmacyService.medicineSearchTrack;
            }
            if (this.stockReportResponseList != undefined && this.pharmacyService.supplierId && this.pharmacyService.supplierId != 0) {
                let cryptoUtil: CryptoUtil = new CryptoUtil();
                this.getStockSummaryReportList();
                let dataTemp = {
                    stockReportResponseList: this.stockReportResponseList,
                    updateSupplierOrderListRequest: this.updateSupplierOrderListRequest
                }
                window.localStorage.setItem('stockOrderData', cryptoUtil.encryptData(JSON.stringify(dataTemp)));
            } else {
                let cryptoUtil: CryptoUtil = new CryptoUtil();
                let data = window.localStorage.getItem('stockOrderData');
                if (data) {
                    this.stockReportResponseList = JSON.parse(cryptoUtil.decryptData(data)).stockReportResponseList;
                    this.updateSupplierOrderListRequest = JSON.parse(cryptoUtil.decryptData(data)).updateSupplierOrderListRequest;
                } else {
                    this.getStockSummaryReportList();
                }
            }
            console.log("ContactList: ", this.updateSupplierOrderListRequest.supplierDetails.contactList);
            if (this.updateSupplierOrderListRequest.supplierDetails.contactList && this.updateSupplierOrderListRequest.supplierDetails.contactList[0])
                this.supplierMobileNum = this.updateSupplierOrderListRequest.supplierDetails.contactList[0];
        }
        $("#purchase_order_template").hide();
    }

    async getStockSummaryReportList() {
        this.stockReportRequest.pocId = this.authService.userAuth.pocId;
        if (this.supplierId) {
            this.stockReportRequest.supplierId = this.supplierId;
        }
        console.log("StockReportRequest ===>>>" + JSON.stringify(this.stockReportRequest));
        this.spinnerService.start();
        await this.pharmacyService.getStockSummaryReportList(this.stockReportRequest).then((updateSupplierOrderListRequest) => {
            this.spinnerService.stop();
            if (updateSupplierOrderListRequest != null) {
                if (updateSupplierOrderListRequest.length == 0) {
                    this.stockReportResponseList = new Array();
                    console.log("Response List is empty");
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = "No data found.";
                    this.showMessage = true;
                    return;
                } else {
                    this.stockReportResponseList = updateSupplierOrderListRequest;
                    this.showMessage = false;
                }
                this.indexOfPage = 1;
            }
        });
    }

    searchSupplier(key: string) {
        var searchRequest = new SearchRequest();
        searchRequest.aliasSearchType = 3;
        searchRequest.id;
        searchRequest.searchCriteria = 0;
        searchRequest.searchTerm = key;
        searchRequest.pocName = key;

        this.supplierId = 0;
        this.updateSupplierOrderListRequest.supplierDetails.pocName = key;
        this.updateSupplierOrderListRequest.supplierDetails.email = '';
        this.updateSupplierOrderListRequest.supplierDetails.address = new Address();
        this.updateSupplierOrderListRequest.supplierDetails.contactList = [];

        if (key.length > 2) {
            this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
                this.supplierResult = supplierResult;
                this.supplierResultLength = this.supplierResult.length;
                console.log('searchResult in for--' + key + "---" + JSON.stringify(supplierResult));
            });
        }
    }

    getSupplierId(event) {
        this.supplierId = 0;
        this.updateSupplierOrderListRequest.supplierDetails.pocName = event.pocName;
        if (this.supplierResult != undefined) {
            if (this.supplierResult.length > 0) {
                for (let i = 0; i < this.supplierResult.length; i++) {
                    if (this.supplierResult[i].pocName == event.pocName) {
                        this.supplierId = this.supplierResult[i].pocId;
                        this.updateSupplierOrderListRequest.supplierDetails = this.supplierResult[i];
                        if (!this.updateSupplierOrderListRequest.supplierDetails.address) { this.updateSupplierOrderListRequest.supplierDetails.address = new Address(); }
                        if (!this.updateSupplierOrderListRequest.supplierDetails.contactList) { this.updateSupplierOrderListRequest.supplierDetails.contactList = []; }
                        console.log("List" + JSON.stringify(this.updateSupplierOrderListRequest));
                        break;
                    }
                }
                // this.getStockSummaryReportList();
            }
        }
    }

    addNewMedicineRow() {
        this.searchResult = new Array();
        console.log("Check: " + this.updateSupplierOrderListRequest.supplierDetails.pocName)
        if (!this.updateSupplierOrderListRequest.supplierDetails.pocName) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please fill supplier's details";
            this.showMessage = true;
            return;
        } else {
            this.isError = false;
            this.showMessage = false;
        }
        let pharmacyProductsDetailsList: StockOrder = new StockOrder();
        pharmacyProductsDetailsList.isEditText = true;
        this.stockReportResponseList.unshift(pharmacyProductsDetailsList);
    }

    validateNumberInputOnly(event) {
        var key = window.event ? event.keyCode : event.which;
        console.log("kajkohah" + event.keyCode);

        if (event.keyCode == 46) {
            return true;
        }
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var key2 = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key2)) {
            return false;
        }
        if (event.keyCode == 8 || event.keyCode == 46
            || event.keyCode == 37 || event.keyCode == 39) {
            return true;
        } else if (key < 48 || key > 57) {
            return false;
        } else return true;
    }

    validateEmailId(email: string) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    onBackPressClick(pageNo: number) {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        if (pageNo == 2) {
            this.router.navigate(['app/pharmacy/inventory/dashboard']);
        } else {
            this.router.navigate(['app/pharmacy/inventory/stock']);
            this.onResetFilterButtonClick();
        }
    }

    onResetFilterButtonClick() {
        $('div#search-result_supplier').hide();
        $('div#search-result_medicine').hide();
        this.updateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();
        this.quantity = 0;
        this.expiryDate = undefined;
        this.productName = "";
        this.monthPickerComponent ? this.monthPickerComponent.resetDateField() : "";
        this.supplierId = 0;
        this.docTypeIndex = 1;
        this.stockReportRequest = new StockReportRequest();
        this.getStockSummaryReportList();
    }

    onPrintButtonClick() {
        this.authService.openPDF(this.pdfUrl);
        //  window.open(this.pdfUrl, '_blank');
    }

    onPurchaseOrder() {
        this.updateSupplierOrderList();
    }

    updateSupplierOrderList() {
        window.scroll(0, 0)
        this.showMessage = false;
        this.isErrorCheck = false;
        this.isError = false;
        this.updateSupplierOrderListRequest.orderFormat = this.docTypeIndex;
        this.errorMessage = new Array();
        let newStockReportResponseList = new Array();
        this.stockReportResponseList.forEach(element => {

            element.isErrorMsg = new Array();
            if (!element.productName || element.productName.trim() == "") {
                element.isErrorMsg.push("Fill Required Medicine")
            } else if (!element.requiredQuantity || element.requiredQuantity <= 0) {
                element.isErrorMsg.push("Fill Required Quantity")
            } else if (element.productId <= 0) {
                element.isErrorMsg.push("Select a medicine from searched list. You cannot add a new medicine from here. Please go to Inventory for adding new medicine.");
            } else if (!element.requiredQuantity || element.requiredQuantity <= 0 || element.productId <= 0) {
                console.log(element.requiredQuantity);
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please fill required quantity";
                this.showMessage = false;
                this.isErrorCheck = true;
            }
            if (element.isErrorMsg && element.isErrorMsg.length > 0) {
                element.isErrorFound = true;
                this.isErrorCheck = true;
            } else {
                delete element.isErrorFound;
                delete element.isErrorMsg;
            }
            newStockReportResponseList.push(element);

        });

        if (!this.updateSupplierOrderListRequest.supplierDetails.pocName || !this.updateSupplierOrderListRequest.supplierDetails.pocName.trim()) {
            this.errorMessage[0] = "Please fill supplier's details";
            this.isError = true;
        } else if (!this.updateSupplierOrderListRequest.supplierDetails.email) {
            this.errorMessage[0] = "Please fill supplier's email id.";
            this.isError = true;
        } else if (!this.validateEmailId(this.updateSupplierOrderListRequest.supplierDetails.email)) {
            this.errorMessage[0] = "Supplier's Email Id is not valid.";
            this.isError = true;
        }
        // else if (!this.updateSupplierOrderListRequest.supplierDetails.contactList || this.updateSupplierOrderListRequest.supplierDetails.contactList.length == 0) {
        //     this.errorMessage[0] = "Please fill supplier's mobile number.";
        //     this.isError = true;
        // } else if (this.updateSupplierOrderListRequest.supplierDetails.contactList && this.updateSupplierOrderListRequest.supplierDetails.contactList.length > 0
        //     && this.updateSupplierOrderListRequest.supplierDetails.contactList[0].length != 10) {
        //     this.errorMessage[0] = "Supplier's Contact number is not valid.";
        //     this.isError = true;
        // } 
        else if (this.supplierMobileNum == "") {
            this.errorMessage[0] = "Please fill supplier's mobile number.";
            this.isError = true;
        } else if (this.supplierMobileNum != "" && this.supplierMobileNum.length > 0
            && this.supplierMobileNum.length != 10) {
            this.errorMessage[0] = "Supplier's Contact number is not valid.";
            this.isError = true;
        }
        else if (newStockReportResponseList.length <= 0) {
            this.errorMessage[0] = "Please select atleast one medicine";
            this.isError = true;
        }
        if (this.isError) {
            this.showMessage = true;
            return;
        } else if (this.isErrorCheck) {
            return
        }
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();

        console.log("Place Order: ",this.supplierMobileNum + ">>>: ",this.authService.selectedPocDetails.contactList ? this.authService.selectedPocDetails.contactList[0] : "");
        this.updateSupplierOrderListRequest.supplierDetails.contactList = new Array<string>();
        this.updateSupplierOrderListRequest.supplierDetails.contactList.push(this.supplierMobileNum)
        this.updateSupplierOrderListRequest.productList = newStockReportResponseList;
        this.updateSupplierOrderListRequest.pocId = this.authService.userAuth.pocId;
        this.updateSupplierOrderListRequest.itemType = true; //true for pharmacy
        console.log("updateSupplierOrderListRequest ===>>>" + JSON.stringify(this.updateSupplierOrderListRequest));

        this.pocEmail = this.authService.selectedPocDetails.email;
        this.pocMobile = this.authService.selectedPocDetails.contactList ? this.authService.selectedPocDetails.contactList[0] : "";
        if (this.authService.selectedPocDetails.address) {
            this.pocAddress = this.authService.selectedPocDetails.address;
            this.pocState = this.authService.getStateById(this.authService.selectedPocDetails.address.state);
            this.pocCity.city = this.authService.selectedPocDetails.address.cityName;
        } else {
            this.pocAddress = new Address();
            console.log("hiiii 333" + this.authService.selectedPocDetails.address.state);
            this.pocState = new State();
            this.pocCity = new City();
        }
        this.pharmacyService.updateSupplierOrderList(this.updateSupplierOrderListRequest).then((data) => {
            if (data.statusCode == 200) {
                //check this condition
                if (this.pdfHeaderType == 0 || this.pdfHeaderType == 1) {
                    this.pdfUrl = data.pdfUrlWithHeader;
                } else {
                    this.pdfUrl = data.pdfUrlWithoutHeader;
                }
                $("#initiate_order_template").hide();
                $("#purchase_order_template").show();
                this.isError = false;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Order placed successfully";
                this.showMessage = true;
                console.log("Stock list successfully added");
                window.localStorage.removeItem('productList');
                window.localStorage.removeItem('productIds');
                window.localStorage.removeItem('orderIds');
                this.pharmacyService.productStockList = this.stockReportResponseList = new Array();
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = data.statusMessage;
                this.showMessage = true;
                console.log("failed.......................");
            }
            this.spinnerService.stop();
        });
        this.pharmacyService.supplierDetails = new UpdateSupplierOrderListRequest();
        this.pharmacyService.productStockList = [];
    }

    private remove(stockOrder) {
        const INDEX: number = this.stockReportResponseList.indexOf(stockOrder);
        this.stockReportResponseList.splice(INDEX, 1);
    }

    selectedProduct(product: PharmacyInventoryDetail, stockOrder: StockOrder) {
        if (product != undefined && product.productId > 0) {
            stockOrder.drugForm = product.drugForm;
            stockOrder.productId = product.productId;
            stockOrder.productName = product.productName;

            var productRequest = new GetProductRequest();
            productRequest.supplierId = this.supplierId;
            productRequest.pocId;
            productRequest.productCode = product.productCode;
            productRequest.productId = product.productId;
            this.pharmacyService.getProductDetails(productRequest).then(productDetail => {
                if (productDetail != undefined && productDetail.stockDetails != undefined && productDetail.stockDetails.totalAvailableQuantity > 0) {
                    stockOrder.totalAvailableQuantity = productDetail.stockDetails.totalAvailableQuantity;
                    stockOrder.expiryDate = productDetail.stockDetails.expiryDate;
                    stockOrder.batchNo = productDetail.stockDetails.batchNo;
                    stockOrder.packingInformation = productDetail.packingInformation;
                    stockOrder.netPrice = productDetail.purchaseRate;
                    stockOrder.stockDetails=productDetail.stockDetails;
                }
            });

        }
        $("#search-productname-result").hide();
    }

    onAllCheckBoxClick(event) {
        if (event.target.checked) {
            this.stockReportResponseList.forEach(element => {
                element.isChecked = true;
            });
        } else {
            this.stockReportResponseList.forEach(element => {
                element.isChecked = false;
            });
        }
    }

    onDocTypeChange(index: number) {
        if (index > 1) {
            this.docTypeIndex = index;
        }
    }

    searchProduct(key: string, searchCriteria, item?) {
        // this.showProductDropDown();
        var searchRequest = new SearchRequest();
        searchRequest.aliasSearchType = 1;
        searchRequest.id;
        searchRequest.searchCriteria = searchCriteria;
        searchRequest.searchTerm = key;
        if (item) item.productName = key;
        if (key.length > 2) {
            console.log(JSON.stringify(searchRequest.searchTerm));
            this.pharmacyService.searchProduct(searchRequest).then(searchResult => {
                this.searchResult = searchResult;
                this.searchResultLength = searchResult.length
                console.log('searchResult in for--' + key + '---' + JSON.stringify(searchResult));
            });
        } else {
            $('#search-result_medicine').hide();
        }
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
    ngOnDestroy() {
        if (this.stockReportResponseList.length > 0) {
            this.pharmacyService.productStockList = this.stockReportResponseList;
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('productList', cryptoUtil.encryptData(JSON.stringify(this.stockReportResponseList)));
        }
    }
}
