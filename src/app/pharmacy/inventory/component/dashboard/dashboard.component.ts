import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { BBCartItem } from './../../../../model/basket/b2bcartitem';
import { StockReportRequest } from './../../../../model/inventory/stockReportRequest';
import { StockOrder } from './../../../../model/inventory/stockReportResponse';
import { UpdateSupplierOrderListRequest } from './../../../../model/pharmacy/updateSupplierOrderListRequest';
import { Product } from './../../../../model/product/product';
import { SupplierOrderResponse } from './../../../../model/report/supplierordersreport';
import { PharmacyService } from './../../../pharmacy.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.template.html',
  styleUrls: ['./dashboard.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DashboardComponent implements OnInit, OnDestroy {

  pocId: number;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  expiryDate: Date;
  quantity: number = 0;
  from: number = 0;
  size: number;
  total: number = 0;
  productName: string = '';
  productId: number;

  invoiceList: BBCartItem[] = new Array<BBCartItem>();
  ordersCount: SupplierOrderResponse = new SupplierOrderResponse();

  stockReportRequest: StockReportRequest = new StockReportRequest();
  expiryRequest: StockReportRequest = new StockReportRequest();

  lowStockResponse: Array<StockOrder> = new Array();
  expiryStockResponse: Array<StockOrder> = new Array();
  fastMovingResponse: Array<Product> = new Array();
  productList: Array<StockOrder> = new Array();
  productIds: Array<number> = new Array();
  orderIds: Array<string> = new Array();

  updateSupplierOrderListRequest: UpdateSupplierOrderListRequest = new UpdateSupplierOrderListRequest();

  constructor(private pharmacyService: PharmacyService, private router: Router,
    private authService: AuthService, private spinnerService: SpinnerService) {
    this.pocId = this.authService.userAuth.pocId;
    this.stockReportRequest.quantity = 400;
    this.stockReportRequest.empId = this.expiryRequest.empId = this.authService.userAuth.employeeId;
    let dateValue: Date = new Date();
    dateValue.setFullYear(new Date().getFullYear(), new Date().getMonth() + 4, 1);
    dateValue.setHours(0, 0, 0, 0);
    this.expiryRequest.expiryDate = dateValue.getTime();
  }

  ngOnInit() {
    this.getTotalOrdersCount();
    this.getLowStockAlert();
    this.getExpiredMedicineList();
    this.getFastMovingMedicineList();
    this.getOrderList();
    if (this.pharmacyService.productStockList)
      this.productList = this.pharmacyService.productStockList;

    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.productList.length) {
      this.productList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('productList')));
      this.productIds = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('productIds')));
      this.orderIds = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('orderIds')));
    }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getPharmacyResults();
    }
  }

  getPharmacyResults() {
    this.productName = $('#search').val().toString();
    if(this.productName.length < 3)
    {
      this.isError = true;
      this.errorMessage = new Array();
      this.showMessage = true;
      this.errorMessage.push("Medicine name must be at least 3 characters");
      return;
    }
    this.pharmacyService.orderIdMail = this.productName;
    this.pharmacyService.productStockList = this.productList;
    this.router.navigate(['/app/pharmacy/inventory/results']);
  }

  addToCart(productName: string, productId: number, list: number, index: number) {
    let inList: boolean = false;
    this.productList.filter(product => {
      if (product.productId == productId)
        inList = true;
    });

    if (!inList) {
      let product = new StockOrder();
      product.productId = productId;
      product.productName = productName;
      product.requiredQuantity = 1;
      this.productList.push(product);
      this.productIds.push(product.productId);
      this.changeBoolean(list, index, 1);
    }
  }

  removeFromCart(productName: string, productId: number, list: number, index: number) {
    this.productList = this.productList.filter(e => e.productId !== productId);
    this.productIds = this.productIds.filter(e => e !== productId)
    this.changeBoolean(list, index, 0);
  }


  changeBoolean(num: number, index: number, bol: number) {
    if (num == 1) {
      let temp = this.lowStockResponse.slice();
      temp[index].netPrice = bol;
      this.lowStockResponse = temp;
    }
    else if (num == 2) {
      let temp = this.fastMovingResponse.slice();
      temp[index].netPrice = bol;
      this.fastMovingResponse = temp;
    }
    else {
      let temp = this.expiryStockResponse.slice();
      temp[index].netPrice = bol;
      this.expiryStockResponse = temp;
    }
  }

  repeatOrder(list: any, orderId: string, index: number) {

    list.forEach(doc => {
      let inList: boolean = false;
      this.productList.filter(product => {
        if (product.productId == doc.productId)
          inList = true;
      });

      if (!inList) {
        let product = new StockOrder();
        product.productId = doc.productId;
        product.productName = doc.productName;
        product.requiredQuantity = doc.quantity;
        this.productList.push(product);
      }
    })
    this.orderIds.push(orderId);
    let temp = this.invoiceList.slice();
    temp[index].consolidatedMailStatus = 1;
    this.invoiceList = temp;
  }

  removeOrder(list: any, orderId: string, index: number) {

    list.forEach(item =>
      this.productList = this.productList.filter(e => e.productId !== item.productId)
    )
    this.orderIds = this.orderIds.filter(e => e !== orderId)

    let temp = this.invoiceList.slice();
    temp[index].consolidatedMailStatus = 0;
    this.invoiceList = temp;
  }

  onNext() {
    this.pharmacyService.productStockList = this.productList;
    this.pharmacyService.supplierDetails = new UpdateSupplierOrderListRequest();
    this.router.navigate(['/app/pharmacy/inventory/stockorder']);
  }

  getTotalOrdersCount() {
    this.pharmacyService.getTotalOrdersCount(this.pocId).then(response => {
      if (response.length > 0)
        this.ordersCount = response[0];
    }).catch((err) => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Failed to fetch orders count";
      this.showMessage = true;
    });
  }

  onQuantityChange() {
    this.stockReportRequest.quantity = this.quantity;
    this.getLowStockAlert();
  }


  getLowStockAlert() {
    this.stockReportRequest.pocId = this.pocId;
    this.spinnerService.start();
    this.pharmacyService.getStockSummaryReportList(this.stockReportRequest).then((response) => {
      this.spinnerService.stop();
      if (response.length > 0) {
        this.lowStockResponse = response;
        this.lowStockResponse.forEach(doc => doc.netPrice = 0);
        let temp = this.lowStockResponse.slice();
        this.lowStockResponse.forEach((list, index) => {
          this.productIds.forEach(product => {
            if (product == list.productId) {
              temp[index].netPrice = 1;
              this.productIds = this.productIds.filter(id => product !== id);
            }
          })
        });
        this.lowStockResponse = temp;
      }
    }).catch((err) => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Failed to fetch low stock medicine";
      this.showMessage = true;
    });
  }

  onDateSubmit(selectedDate: Date) {
    this.expiryRequest.expiryDate = selectedDate.getTime();
    this.getExpiredMedicineList();
  }

  getExpiredMedicineList() {
    this.expiryRequest.pocId = this.pocId;
    this.pharmacyService.getStockSummaryReportList(this.expiryRequest).then((response) => {
      if (response.length > 0) {
        this.expiryStockResponse = response;
        this.expiryStockResponse.forEach(doc => doc.netPrice = 0);
        let temp = this.expiryStockResponse.slice();
        this.expiryStockResponse.forEach((list, index) => {
          this.productIds.forEach(product => {
            if (product == list.productId) {
              temp[index].netPrice = 1;
              this.productIds = this.productIds.filter(id => product !== id);
            }
          })
        });
        this.expiryStockResponse = temp;
      }
    }).catch((err) => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Failed to fetch expiry stock medicine";
      this.showMessage = true;
    });
  }

  getFastMovingMedicineList() {
    this.pharmacyService.getFastMovingMedicineList(this.pocId).then((response) => {
      if (response.length > 0) {
        this.fastMovingResponse = response;
        this.fastMovingResponse.forEach(doc => doc.netPrice = 0);
        let temp = this.fastMovingResponse.slice();
        this.fastMovingResponse.forEach((list, index) => {
          this.productIds.forEach(product => {
            if (product == list.productId) {
              temp[index].netPrice = 1;
              this.productIds = this.productIds.filter(id => product !== id);
            }
          })
        });
        this.fastMovingResponse = temp;
      }
    }).catch((err) => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Failed to fetch fast moving medicine";
      this.showMessage = true;
    });
  }

  getOrderList() {
    this.pharmacyService.getPharmacyInVoicesList(0, 0, this.from, 10,
      '', 0, 0, -1).then(invoiceListResult => {
        if (invoiceListResult && invoiceListResult.length > 0) {
          invoiceListResult = invoiceListResult.filter(doc => doc.cartItemType == 101);
          this.invoiceList.push.apply(this.invoiceList, invoiceListResult);
          this.invoiceList.forEach(doc => doc.consolidatedMailStatus = 0);
          if (this.invoiceList.length != this.total) {
            this.total = this.invoiceList.length;
          }
          this.changeAsPerList();
        } else {
          this.invoiceList = new Array<BBCartItem>();
          this.total = this.invoiceList.length;
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Failed to fetch records";
        }
      })
  }

  changeAsPerList() {
    let temp = this.invoiceList.slice();
    this.invoiceList.forEach((invoice, index) => {
      this.orderIds.forEach(orderId => {
        if (orderId == invoice.orderId)
          temp[index].consolidatedMailStatus = 1;
      })
    })
    this.invoiceList = temp;
  }



  ngOnDestroy(): void {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.productList != undefined || this.productList != null) {
      window.localStorage.setItem('productList', cryptoUtil.encryptData(JSON.stringify(this.productList)));
      window.localStorage.setItem('productIds', cryptoUtil.encryptData(JSON.stringify(this.productIds)));
      window.localStorage.setItem('orderIds', cryptoUtil.encryptData(JSON.stringify(this.orderIds)));
      console.log("stored!!")
    }
  }

}