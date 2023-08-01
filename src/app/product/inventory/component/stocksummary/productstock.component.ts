import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { Config } from '../../../../base/config';
import { MonthpickerComponent } from '../../../../layout/widget/monthpicker/monthpicker.component';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { City } from '../../../../model/base/city';
import { State } from '../../../../model/base/state';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { StockReportRequest } from '../../../../model/inventory/stockReportRequest';
import { StockOrder } from '../../../../model/inventory/stockReportResponse';
import { SupplierDetails } from '../../../../model/inventory/supplierDetails';
import { UpdateSupplierOrderListRequest } from '../../../../model/pharmacy/updateSupplierOrderListRequest';
import { Address } from '../../../../model/poc/address';
import { ProductInventoryDetail } from '../../../../model/product/productinventorydetail';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { ProductInventoryService } from '../../productinventory.service';

@Component({
  selector: 'productstock',
  templateUrl: './productstock.template.html',
  styleUrls: ['./productstock.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ProductStockComponent implements OnInit {

  @ViewChild(MonthpickerComponent, { static: false })
  private monthPickerComponent: MonthpickerComponent;

  config: any;
  datepicker: any;
  listLength: number = 1;
  expiryDate: Date;
  quantity: number = 0;
  protected searchStr: string;
  supplierResultLength = 0;
  searchProductLength = 0;
  docTypeIndex: number = 1;
  supplierId: number;
  productName: string;
  pdfUrl: string;
  errorMessage: Array<string>;
  isErrorCheck: boolean = false;
  isError: boolean;
  showMessage: boolean;
  noDataFoundShow: boolean = true;
  pocAddress: Address = new Address();
  pocMobile: any;
  pocEmail: string;
  pocState: State = new State();
  pocCity: City = new City();
  pdfHeaderType: number;
  pharmacyName: string;
  productId: number;
  supplierName: string = "";
  isNoDataFound: boolean = false;

  supplierResult: any;
  searchResult: ProductInventoryDetail[] = new Array();
  productDetail: ProductInventoryDetail = new ProductInventoryDetail();

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
  columns: any[] = [
    {
      display: 'S.No',
      variable: 'arraySize',
      filter: 'text',
      sort: false
    },
    {
      display: 'Product Name',
      variable: 'productName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Supplier Information',
      variable: 'supplierDetails.pocName',
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
      display: 'Expiring On',
      variable: 'expiryDate',
      filter: 'datemmyy',
      sort: false,
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
    descending: false
  };

  constructor(config: AppConfig, private router: Router, private authService: AuthService,
    private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService, private productInventoryService: ProductInventoryService) {
    this.config = config.getConfig();
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.pharmacyName = this.authService.userAuth.pocName;
  }

  ngOnInit() {
    this.getStockSummaryReportList();
    window.localStorage.removeItem('stockOrderData');
    this.productInventoryService.supplierDetails = new SupplierDetails();
    if (!this.updateSupplierOrderListRequest.supplierDetails) {
      this.updateSupplierOrderListRequest.supplierDetails = new SupplierDetails();
    }
  }

  searchSupplier(key: string) {
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 3;
    searchRequest.id;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.pocName = key;
    this.supplierName = key;

    this.updateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();
    this.supplierId = 0;
    // this.updateSupplierOrderListRequest.supplierEmail = '';
    // this.updateSupplierOrderListRequest.supplierAddress = '';
    // this.updateSupplierOrderListRequest.suppilerMobile = '';

    if (key.length > 2) {
      this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
        this.supplierResult = supplierResult;
        this.supplierResultLength = this.supplierResult.length;
      });
    }
  }

  getSupplierId(supplierName) {
    this.supplierId = 0;
    this.updateSupplierOrderListRequest.supplierDetails.pocName = supplierName;
    if (this.supplierResult != undefined) {
      if (this.supplierResult.length > 0) {
        for (let i = 0; i < this.supplierResult.length; i++) {
          if (this.supplierResult[i].pocName == this.updateSupplierOrderListRequest.supplierDetails.pocName) {
            this.supplierId = this.supplierResult[i].pocId;
            this.productInventoryService.supplierDetails = this.supplierResult[i];
          }
        }
      }
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

  searchProduct(key: string) {
    console.log("key: " + key);
    var searchRequest = new SearchRequest();
    searchRequest.searchTerm = key;
    searchRequest.from = 0;
    searchRequest.size = 1000;
    searchRequest.brandId = Config.portal.brandId;
    this.productName = "";
    if (key.length > 2) {
      console.log(JSON.stringify(searchRequest.searchTerm));
      this.productInventoryService.searchProduct(searchRequest).then(searchResult => {
        this.searchResult = searchResult;
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
    console.log("StockReportRequest ===>>>" + JSON.stringify(this.stockReportRequest));
    this.spinnerService.start();
    this.productInventoryService.getStockSummaryReportList(this.stockReportRequest).then((stockReportResponseList) => {
      this.spinnerService.stop();
      if (stockReportResponseList != null) {
        if (stockReportResponseList.length <= 0) {
          this.dataNotFoundError();
        } else {
          this.stockReportResponseList = new Array();
          this.listLength = 1;
          this.stockReportResponseList = stockReportResponseList.filter((e) => {
            if (e.totalAvailableQuantity != 0) {
              e.arraySize = this.listLength++;
              return true;
            }
            return false;
          });
          if (this.stockReportResponseList.length <= 0) {
            this.dataNotFoundError();
          }
        }
        this.productInventoryService.productStockList = stockReportResponseList;
      }
    });
  }
  dataNotFoundError() {
    this.stockReportResponseList = new Array();
    console.log("Response List is empty");
    this.isNoDataFound = true;
    this.isError = true;
    this.errorMessage = new Array();
    this.errorMessage[0] = "No data found.";
    this.showMessage = true;
    return;
  }

  onPlaceOrderClick(): void {
    this.stockReportRequest = new StockReportRequest();
    this.stockReportRequest.pocId = this.authService.userAuth.pocId;
    this.pharmacyService.productStockList = null;
    this.router.navigate(['app/product/inventory/stockorder']);
  }

  onSearchButtonClick(): void {
    let searchField: boolean = false;
    if (this.productName != "" && this.productName && this.productName.trim() != "") {
      searchField = true;
    }
    if (this.supplierId && this.supplierId != 0) {
      searchField = true;
    }
    else {
      this.supplierId = 0;
    }
    if (this.expiryDate != undefined) {
      searchField = true;
      this.stockReportRequest.expiryDate = this.expiryDate.getTime();
    }
    if (this.quantity) {
      searchField = true;
    }
    if (searchField) {
      this.productInventoryService.supplierId = this.stockReportRequest.supplierId = this.supplierId;
      this.stockReportRequest.productName = this.productName;
      this.stockReportRequest.quantity = this.quantity;

      console.log("Nameee: " + JSON.stringify($("hs-select>div>input")));

      // if (!(this.supplierName == "" || this.supplierName.length == 0 || this.supplierName == undefined || this.supplierName == null)
      //   && (this.supplierId == null || this.supplierId == undefined || this.supplierId == 0)) {
      //   this.stockReportResponseList = new Array();
      //   this.isError = true;
      //   this.errorMessage = new Array();
      //   this.errorMessage[0] = "No data found.";
      //   this.showMessage = true;
      //   return;
      // }

      // this.supplierName = "";
      // this.supplierId = 0;
      // this.productName = "";
      this.showMessage = false;
      this.isError = false;
      this.getStockSummaryReportList();
    }
    else {
      this.productInventoryService.supplierId = 0
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
    this.supplierId = 0;
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
      this.productInventoryService.productSearchTrack = this.stockReportRequest;
    }
  }
  onPage(page: number) {
    this.getStockSummaryReportList();
  }
}