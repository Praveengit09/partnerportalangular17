import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../../auth/auth.service';
import { PharmacyService } from './../../../../pharmacy.service';
import { AppConfig } from './../../../../../app.config';
import { BBCartItem } from './../../../../../model/basket/b2bcartitem';
import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeePocMapping } from './../../../../../model/employee/employeepocmapping';
import { AdminService } from './../../../../../admin/admin.service';

@Component({
  selector: 'orderlist',
  templateUrl: './ListSupplierOrder.template.html',
  styleUrls: ['./ListSupplierOrder.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ListSupplierOrder implements OnDestroy, OnInit {
  config: any;
  supplierList: BBCartItem[] = new Array<BBCartItem>();
  selectedSupplierAdvise: BBCartItem;
  tempList: BBCartItem[];
  orderIdList: string[] = new Array<string>();
  errorMessage: Array<string> = new Array();
  isError: boolean;
  showMessage: boolean;
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria.";
  from: number;
  size: number;
  searchCriteria: string = '';
  orderId: string = "";
  pocName: string = "";
  dataMsg: string = "";
  perPage: number = 10;
  total: number = 0;
  supplierPocId: number = 0;
  suppliersList: Array<EmployeePocMapping>;
  status: number = 0;
  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Centre Name',
      variable: 'pocDetails.pocName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Status',
      variable: 'invoiceCompletionStatus',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '2',
          condition: 'eq',
          label: 'Order Accepted'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Invoiced'
        },
        {
          value: '21',
          condition: 'eq',
          label: 'Order Rejected'
        }, {
          value: '1',
          condition: 'eq',
          label: 'Quotation Raised'
        },
        {
          value: '6',
          condition: 'eq',
          label: 'Quotation Accepted'
        }, {
          value: '23',
          condition: 'eq',
          label: 'Quotation Rejected'
        },
        {
          value: '0',
          condition: 'default',
          label: 'Quotation Requested'
        }
      ]
    },
    {
      display: 'Date',
      variable: 'updatedTimestamp',
      filter: 'date',
      sort: true
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
    },
    {
      display: 'Mail',
      filter: 'action',
      type: 'button',
      event: 'clickmail',
      sort: false,
      variable: 'consolidatedMailStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Add',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Remove',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo mailaction'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Mailed',
          style: 'btn width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          condition: 'default',
          label: 'Not Available',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        }
      ]
    }
  ];

  constructor(config: AppConfig, private adminService: AdminService,
    private pharmacyService: PharmacyService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {

    this.getRefreshedorderList();
    this.orderIdList = this.pharmacyService.orderIdList;
    this.pharmacyService.cleanSupplierOrdersLocalstore();
    this.getPocList();
  }
  getSupplierOrderList() {
    this.isError = this.pharmacyService.isError;
    this.errorMessage = this.pharmacyService.errorMessage;
    this.showMessage = this.pharmacyService.showMessage;
    this.spinnerService.start();
    this.dataMsg = 'Loading.....';
    let pocId = this.supplierPocId == 0 ? this.auth.selectedPOCMapping.pocId : this.supplierPocId;
    this.pharmacyService.getsupplierAdvisesForPoc(pocId, this.from, this.size,
      this.orderId, this.pocName).then(supplierOrderList => {
        this.spinnerService.stop();
        if (supplierOrderList && supplierOrderList.length > 0) {
          this.supplierList.push.apply(this.supplierList, supplierOrderList);
          console.log(supplierOrderList);

          if (this.supplierList.length != this.total) {
            this.total = this.supplierList.length;
          }
          this.checkingAddToMail();
        } else {
          this.supplierList = new Array<BBCartItem>();
          this.total = this.supplierList.length;
          if (this.searchCriteria) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
          }
          this.showMessage = true;
          this.dataMsg = 'No data found';
        }
      })
  }

  async getPocList() {

    await this.pharmacyService.getSupplierPoc(true).then(response => {
      if (response && response.length > 0) {
        this.suppliersList = response;
      }
    })
      .catch(error => {
        console.error('Error occurred while fetching the employee POCs', error);
      });
  }

  getRefreshedorderList(): void {
    this.orderIdList = [];
    this.searchCriteria = '';
    this.orderId = '';
    this.pharmacyService.isError = false;
    this.pharmacyService.errorMessage = undefined;
    this.pharmacyService.showMessage = false;
    this.supplierList = new Array<BBCartItem>();
    this.total = 0;
    this.from = 0;
    this.size = 50;
    this.supplierPocId = 0
    this.status = -1;
    this.getSupplierOrderList();
  }



  onPOCSelect(pocId) {
    this.supplierPocId = pocId;
    if (pocId != 0) {
      this.supplierList = this.supplierList.filter((list) => {
        return list.purchaserPocId == pocId;
      })
      if (this.supplierList.length == 0 || this.supplierList == null || this.supplierList == undefined) {
        this.dataMsg = 'No data found';
      }
    }
    else {
      this.supplierList = new Array<BBCartItem>();
      this.total = 0;
      this.from = 0;
      this.size = 50;
      this.getSupplierOrderList();
    }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getsupplierAdviceBasedOnOrderId();
    }
  }
  getsupplierAdviceBasedOnOrderId(): void {
    this.orderId = this.searchCriteria.trim();
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.supplierList = (!this.searchCriteria) ? this.supplierList : new Array<BBCartItem>();
    this.total = 0;
    if (!this.orderId) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage.push('Please Enter search query');
      this.showMessage = true;
      return;
    }
    this.getSupplierOrderList();
  }

  clickEventHandler(e) {
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
    if (e.event == "clickmail") {
      this.addToMail(e.val);
    }
  }

  checkingAddToMail() {
    this.supplierList.forEach(list => {
      if (list.invoiceCompletionStatus <= 2 && list.consolidatedMailStatus != 3)
        list.consolidatedMailStatus = 1;
    })
    this.tempList = this.supplierList;
    this.checkOrderIdList();
  }

  checkOrderIdList() {
    let temp = this.supplierList;
    if (this.orderIdList.length) {
      if (this.pharmacyService.orderIdMail) {
        temp.forEach(item => {
          if (item.orderId == this.pharmacyService.orderIdMail && item.invoiceCompletionStatus == 21) {
            this.orderIdList = this.orderIdList.filter(e => e !== item.orderId);
          }
        })
      }
    }
    if (this.orderIdList.length) {
      temp.forEach(item => {
        this.orderIdList.forEach(id => {
          if (id == item.orderId) {
            item.consolidatedMailStatus = 2;
          }
        })
      }
      )
    }
  }
  addToMail(order: any) {
    if (order.consolidatedMailStatus != 1 && order.consolidatedMailStatus != 2) return;

    let temp = this.supplierList.slice();
    let i = 0;
    for (; i < temp.length; i++) {
      if (temp[i].orderId == order.orderId)
        break;
    }

    if (order.consolidatedMailStatus == 1) {
      temp[i].consolidatedMailStatus = 2;
      this.orderIdList.push(order.orderId);
    }
    else {
      temp[i].consolidatedMailStatus = 1;
      this.orderIdList = this.orderIdList.filter(e => e !== order.orderId);
    }
    this.supplierList = temp;
  }

  sendMailOrders() {
    if (this.orderIdList.length == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage.push('Please Add Orders');
      this.showMessage = true;
      return;
    }
    this.spinnerService.start();
    this.pharmacyService.sendMailConsolidateOrders(this.auth.selectedPOCMapping.pocId, this.orderIdList).then(response => {
      this.spinnerService.stop();
      if (response.statusCode == 200) {
        alert("Successfully sent");
        this.getRefreshedorderList();
      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Error occurred while processing request. Please try again!";
        this.showMessage = true;
      }

    })
  }

  onFilterChanged(value) {
    this.status = value;
    if (value == -1) {

      this.supplierList = this.tempList;
      return;
    }
    let list;
    this.tempList && (list = this.tempList.filter(list => list.invoiceCompletionStatus == value));

    if (list && list.length > 0) {
      this.supplierList = list;
    }
    else {
      this.supplierList = [];
      this.dataMsg = 'No data found';
    }
  }

  // onFilterChanged(value) {
  //   this.status = value;
  //   this.supplierList = new Array<BBCartItem>();
  //   this.total = 0;
  //   this.from = 0;
  //   this.size = 50;
  //   this.getSupplierOrderList();
  // }



  onButtonClicked(supplierAdvise: any): void {
    this.pharmacyService.supplierAdviseTrack = supplierAdvise;
    // let crypto = new CryptoUtil();
    // localStorage.setItem('supplierAdvise', crypto.encryptData(JSON.stringify(supplierAdvise)));
    this.pharmacyService.saveSupplierOrdersLocalstore();
    this.pharmacyService.supplierBackPageLoc = '/app/pharmacy/supplier/orderlist';
    this.router.navigate(['/app/pharmacy/supplier/orderdetails']);
  }

  onPage(page: number) {
    this.from = this.total;
    this.getSupplierOrderList();
  }

  ngOnDestroy(): void {
    this.pharmacyService.orderIdList = this.orderIdList;
    this.pharmacyService.isError = false;
    this.pharmacyService.showMessage = false;
    if (this.selectedSupplierAdvise != undefined && this.selectedSupplierAdvise != null) {
      this.pharmacyService.supplierAdviseTrack = this.selectedSupplierAdvise;
    }
  }

  validateAlphaNumberInputOnly(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (48 <= charCode && charCode <= 57)
      return true;
    if (65 <= charCode && charCode <= 90)
      return true;
    if (97 <= charCode && charCode <= 122)
      return true;
    return false;
  }

}
