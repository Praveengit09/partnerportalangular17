import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { PharmacyService } from '../../../pharmacy.service';
import { AuthService } from './../../../../auth/auth.service';
import { MonthpickerComponent } from './../../../../layout/widget/monthpicker/monthpicker.component';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { City } from './../../../../model/base/city';
import { State } from './../../../../model/base/state';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { StockReportRequest } from './../../../../model/inventory/stockReportRequest';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { PharmacyInventoryDetail } from './../../../../model/pharmacy/pharmacyProductsDetailsList';
import { UpdateSupplierOrderListRequest } from './../../../../model/pharmacy/updateSupplierOrderListRequest';
import { Address } from './../../../../model/poc/address';

@Component({
  selector: 'stock',
  templateUrl: './stock.template.html',
  styleUrls: ['./stock.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class StockInformationComponent implements OnInit {

  @ViewChild(MonthpickerComponent, { static: false })
  private monthPickerComponent: MonthpickerComponent;

  config: any;
  datepicker: any;

  expiryDate: Date;
  quantity: number = 0;
  protected searchStr: string;
  supplierResultLength = 0;
  searchProductLength = 0;
  docTypeIndex: number = 1;
  productName: string;
  pdfUrl: string;
  errorMessage: Array<string>;
  isErrorCheck: boolean = false;
  isError: boolean;
  showMessage: boolean;
  pocAddress: Address = new Address();
  pocMobile: any;
  pocEmail: string;
  pocState: State = new State();
  pocCity: City = new City();
  pdfHeaderType: number;
  pharmacyName: string;
  productId: number;
  supplierName: string = "";
  dataMsg: string = ' ';
  isNoDataFound: boolean = false;
  placeOrder: boolean = false;
  supplierResult: any;
  searchResult: PharmacyInventoryDetail[] = new Array();
  productDetail: PharmacyInventoryDetail = new PharmacyInventoryDetail();

  stockReportRequest: StockReportRequest = new StockReportRequest();
  stockReportResponseList: Array<StockOrder> = new Array();

  updateSupplierOrderListRequest: UpdateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();

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
  perPage: number = 10;
  listLength: number = 1;
  columns: any[] = [
    {
      display: 'S.No',
      variable: 'arraySize',
      filter: 'text',
      sort: true
    },
    {
      display: 'Medicine Name',
      variable: 'productName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Quantity Left',
      variable: 'totalAvailableQuantity',
      filter: 'text',
      sort: false
    },
    {
      display: 'Medicine Strength',
      variable: 'medicineStrength',
      filter: 'text',
      sort: false
    },
    {
      display: 'Expiring On',
      variable: 'expiryDate',
      filter: 'datemmyy',
      sort: false
    },
    {
      display: 'Form Of Drug',
      variable: 'drugForm',
      filter: 'text',
      sort: false
    },
    {
      display: 'Price',
      variable: 'netPrice',
      filter: 'text',
      sort: false
    }
  ];

  sorting: any = {
    column: 'arraySize',
    descending: false,
    ascending: true,
  };

  constructor(config: AppConfig, private router: Router, private authService: AuthService,
    private pharmacyService: PharmacyService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.pharmacyName = this.authService.userAuth.pocName;
  }

  ngOnInit() {
    window.localStorage.removeItem('stockOrderData');
    this.pharmacyService.supplierDetails = new UpdateSupplierOrderListRequest();
    this.getStockSummaryReportList();
  }

  searchSupplier(key: string) {
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 3;
    searchRequest.id;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.pocName = key;
    this.supplierName = key
    this.updateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();
    // this.updateSupplierOrderListRequest.supplierEmail = '';
    // this.updateSupplierOrderListRequest.supplierAddress = '';
    // this.updateSupplierOrderListRequest.suppilerMobile = '';
    if (key == '0') {
      return;
    }
    if (key.length > 2) {
      this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
        this.supplierResult = supplierResult;
        // this.getSupplierId(this.supplierResult[0].supplierName);
        this.supplierResultLength = this.supplierResult.length;
        console.log('searchResult in for--' + key + "---" + JSON.stringify(supplierResult));
      });
    }
  }


  getProductId(productName) {
    this.productId = 0;
    this.updateSupplierOrderListRequest.productName = productName;
    if (this.searchResult != undefined) {
      if (this.searchResult.length > 0) {
        for (let i = 0; i < this.searchResult.length; i++) {
          if (this.searchResult[i].productName == this.updateSupplierOrderListRequest.productName) {
            this.productId = this.searchResult[i].productId;
            this.productName = this.searchResult[i].productName;
            this.updateSupplierOrderListRequest.productId = this.searchResult[i].productId;
          }
        }
      }
    }
  }

  searchProduct(key: string, searchCriteria) {
    console.log("key: " + key);
    var searchRequest = new SearchRequest();
    this.productName = "";
    searchRequest.aliasSearchType = 1;
    searchRequest.id;
    searchRequest.searchCriteria = searchCriteria;
    searchRequest.searchTerm = key;
    if (key.length > 2) {
      console.log(JSON.stringify(searchRequest.searchTerm));
      this.pharmacyService.searchProduct(searchRequest).then(searchResult => {
        this.searchResult = searchResult;
        // if (searchResult.productName) {
        //   this.getProductId(searchResult[0].productName);
        // }
        this.searchProductLength = this.searchResult.length;

        this.errorMessage = new Array();
        this.errorMessage[0] = "Please enter correct medicine";
        this.showMessage = this.searchProductLength <= 0 || !this.searchProductLength;
        this.isError = this.searchProductLength <= 0 || !this.searchProductLength;

        console.log('searchResult in for--' + key + '---' + JSON.stringify(searchResult));
      });
    }
  }

  getStockSummaryReportList() {
    this.stockReportRequest.pocId = this.authService.userAuth.pocId;
    this.stockReportRequest.empId = this.authService.userAuth.employeeId;
    console.log("StockReportRequest ===>>>" + JSON.stringify(this.stockReportRequest));
    this.spinnerService.start();
    this.pharmacyService.getSupplierStockSummaryReportList(this.stockReportRequest).then((stockReportResponseList) => {
      this.spinnerService.stop();
      let index = 0;
      if (stockReportResponseList != null) {
        if (stockReportResponseList.length <= 0) {
          this.dataNotFoundError();
        } else {
          this.stockReportResponseList = new Array();
          this.listLength = 1;
          this.stockReportResponseList = stockReportResponseList.filter((e) => {
            if (e.totalAvailableQuantity > 0) {
              e.arraySize = this.listLength++;
              return true;
            }
            return false;
          });
          if (this.stockReportResponseList.length <= 0) {
            this.dataNotFoundError();
          }
        }
        this.pharmacyService.productStockList = stockReportResponseList;
        if (this.placeOrder) {
          this.pharmacyService.supplierDetails = new UpdateSupplierOrderListRequest();
          this.router.navigate(['app/pharmacy/inventory/stockorder']);
        }
      }
      else this.dataNotFoundError();
    });
  }
  dataNotFoundError() {
    this.stockReportResponseList = new Array();
    this.isNoDataFound = true;
    console.log("Response List is empty");
    this.isError = true;
    this.errorMessage = new Array();
    this.errorMessage[0] = this.dataMsg = "No data found.";
    this.showMessage = true;
    return;
  }

  onPage(event) {

  }

  onPlaceOrderClick(): void {
    this.onResetFilterButtonClick();
    this.placeOrder = true;
  }

  onSearchButtonClick(): void {
    let searchField: boolean = false;
    if (this.productName != "" && this.productName && this.productName.trim() != "") {
      searchField = true;
    }

    if (this.expiryDate != undefined) {
      searchField = true;
      this.stockReportRequest.expiryDate = this.expiryDate.getTime();
    }
    if (this.quantity) {
      searchField = true;
    }
    if (searchField) {
      this.stockReportRequest.productName = this.productName;
      this.stockReportRequest.quantity = this.quantity;

      this.showMessage = false;
      this.isError = false;
      this.getStockSummaryReportList();
    }
    else {
      // this.onResetFilterButtonClick();
      this.isNoDataFound = false;
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Provide Search Criteria";
      this.showMessage = true;
      return;
    }
  }

  onResetFilterButtonClick() {
    this.updateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();
    $(".hs-select").val('');
    this.quantity = 0;
    this.expiryDate = undefined;
    this.productName = "";
    this.monthPickerComponent.resetDateField();
    this.docTypeIndex = 1;
    this.stockReportRequest = new StockReportRequest();
    this.isError = false;
    this.showMessage = false;
    this.getStockSummaryReportList();
  }

  onDateSubmit(selectedDate: Date) {
    this.expiryDate = selectedDate;
  }

  ngOnDestroy(): void {
    if (this.stockReportRequest != undefined && this.stockReportRequest != null) {
      this.pharmacyService.medicineSearchTrack = this.stockReportRequest;
    }
    this.pharmacyService.productStockList = new Array();
  }

}
