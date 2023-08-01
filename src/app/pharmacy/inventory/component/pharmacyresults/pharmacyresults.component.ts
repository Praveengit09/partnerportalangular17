import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { UpdateSupplierOrderListRequest } from './../../../../model/pharmacy/updateSupplierOrderListRequest';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { PharmacyInventoryDetail } from './../../../../model/pharmacy/pharmacyProductsDetailsList';
import { PharmacyService } from './../../../pharmacy.service';

@Component({
  selector: 'results',
  templateUrl: './pharmacyresults.template.html',
  styleUrls: ['./pharmacyresults.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PharmacyResultsComponent implements OnInit, OnDestroy {

  pocId: number;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  searchTerm: string;
  searchProductLength = 0;
  searchResult: PharmacyInventoryDetail[] = new Array();
  searchRequest: SearchRequest = new SearchRequest();
  productList: Array<StockOrder> = new Array();
  productIds: Array<number> = new Array();

  constructor(private pharmacyService: PharmacyService, private router: Router,
    private authService: AuthService, private spinnerService: SpinnerService) {
    this.pocId = this.authService.userAuth.pocId;
    this.searchRequest.aliasSearchType = 1;
    this.searchRequest.searchCriteria = 2;
    this.searchRequest.id = this.pocId;

  }

  ngOnInit() {
    this.searchRequest.searchTerm = this.searchTerm =this.pharmacyService.orderIdMail;
    if (this.searchRequest.searchTerm.length > 2)
      this.searchProduct();
    if (this.pharmacyService.productStockList) {
      this.productList = this.pharmacyService.productStockList;
    }
    if (this.productList != undefined || this.productList != null) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      this.productList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('productList')));
      this.productIds = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('productIds')));
    }
  }


  getProductSearch() {
    this.searchRequest.searchTerm = this.searchTerm;
    if (this.searchTerm.length > 2) {
      this.searchProduct()
    }
    else {
      this.isError = true;
      this.errorMessage = new Array();
      this.showMessage = true;
      this.errorMessage.push("Medicine name must be at least 3 characters");
      return;
    }
  }
  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getProductSearch();
    }
  }

  searchProduct() {

    this.spinnerService.start();
    this.pharmacyService.searchProduct(this.searchRequest).then(searchResult => {
      this.spinnerService.stop();
      this.searchResult = searchResult;
      this.searchProductLength = this.searchResult.length;

      this.searchResult.forEach( item => item.netPrice = 0);
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter correct medicine";
      this.showMessage = this.searchProductLength <= 0 || !this.searchProductLength;
      this.isError = this.searchProductLength <= 0 || !this.searchProductLength;
    });

  }

  onBackButtonClick() {
    this.router.navigate(['/app/pharmacy/inventory/dashboard']);
  }

  addToCart(index: number) {
    let inList: boolean = false;
    let temp = this.searchResult[index];
    this.productList.filter(product => {
      if (product.productId == temp.productId)
        inList = true;
    });
    if (!inList) {
      let product = new StockOrder();
      product.productId = temp.productId;
      product.productName = temp.productName;
      product.requiredQuantity = 1;
      this.productList.push(product);
    }
     let tem = this.searchResult;
    tem[index].netPrice = 1;
    this.searchResult = tem;
  }

  remove(id: number,index: number){
    this.productList = this.productList.filter(e => e.productId !== id)
    this.productIds = this.productIds.filter(e => e !== id)
    let temp = this.searchResult;
    temp[index].netPrice = 0;
    this.searchResult = temp;    
  }

  onNext() {

    this.pharmacyService.productStockList = this.productList;
    this.pharmacyService.supplierDetails = new UpdateSupplierOrderListRequest();
    this.router.navigate(['/app/pharmacy/inventory/stockorder']);
  }


  ngOnDestroy(): void {
    this.pharmacyService.productStockList = this.productList;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.productList != undefined || this.productList != null) {
      window.localStorage.setItem('productList', cryptoUtil.encryptData(JSON.stringify(this.productList)));
      window.localStorage.setItem('productIds', cryptoUtil.encryptData(JSON.stringify(this.productIds)));
    }
  }

}