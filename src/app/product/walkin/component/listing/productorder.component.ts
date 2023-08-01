import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { ProductService } from '../../productorder.service';
import { ValidationUtil } from '../../../../base/util/validation-util';

@Component({
  selector: 'product',
  templateUrl: './productorder.template.html',
  styleUrls: ['./productorder.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})


export class ProductComponent implements OnInit {

  config: any;
  month: any;
  year: any;
  dataMsg: string = ' '
  productList: CartItem[] = new Array<CartItem>();
  selectedproductAdvise: CartItem;
  errorMessage: Array<string> = new Array();
  isError: boolean;
  showMessage: boolean;
  searchCriteria: string = 'orderId';
  defaultDate: number = 0;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria."
  timer: any;
  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'InvoiceId',
      variable: 'baseInvoiceId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Patient Name',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName',
      filter: 'nametitle',
      sort: true
    },
    {
      display: 'Status',
      variable: 'payment.paymentStatus',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          value: '0',
          condition: 'lte',
          label: 'Not Paid'
        },
        {
          value: '2',
          condition: 'default',
          label: 'Pending'
        }
      ]
    },
    {
      display: 'Date',
      variable: 'updatedTimestamp',
      filter: 'date',
      sort: false
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      event: "viewButton",
      type: 'button',
      sort: false,
      variable: 'invoiceCompletionStatus',
      conditions: [
        {
          value: '5',
          condition: 'eq',
          label: 'Completed',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '0',
          condition: 'lte',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'pending',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'pending',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        }
      ]
    },
    {
      display: 'Payment Receipt',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      event: 'pdfClick',
      type: 'image',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
          style: ''
        },
        {
          value: '0',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btn'
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
          style: 'hide_btn'
        }
      ]
    }
  ];
  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
  };

  perPage: number = 10;
  total: number = 0;
  validation2;
  isNoDataFoundVisible: boolean = false;

  constructor(config: AppConfig, private validation: ValidationUtil,
    private productService: ProductService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService) {
    window.localStorage.removeItem("cartItem");
    this.validation2 = validation;
    this.pdfHeaderType = this.auth.userAuth.pdfHeaderType;
  }


  ngOnInit(): void {
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.isError = this.productService.isError;
    this.errorMessage = this.productService.errorMessage;
    this.showMessage = this.productService.showMessage;
    this.getProductAdvisesForPoc(this.defaultDate);
  }
  getProductAdvisesForPoc(date?: number): void {
    this.spinnerService.start();
    this.productService.getProductAdvisesForPocBasedOnPhnNoId(this.searchCriteria, "")
      .then(productAdviseList => {
        this.spinnerService.stop();
        this.productList = productAdviseList;
        if (this.productList.length > 0) {
          this.productList = productAdviseList;
          this.total = this.productList.length;
        } else if (this.productList.length == 0) {
          this.dataMsg = 'No data Found';
        }
      });
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getProductAdvisesForPocBasedOnPhnNoId();
    }
  }

  getProductAdvisesForPocBasedOnPhnNoId(search: string = ''): void {
    search = $('#search').val().toString();
    if (isNaN(parseInt(search))) {
      this.searchCriteria = 'orderId';
    } else {
      this.searchCriteria = 'contactNo';
      if (search.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
    }
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.productList = new Array<CartItem>();
    this.total = 0;
    // if (search == null || search == '') {
    //   this.isError = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage.push('Please Enter search query');
    //   this.showMessage = true;
    //   return;
    // }
    // else {
    //   this.isError = false;
    //   this.errorMessage = new Array();
    //   this.showMessage = false;
    // }
    this.dataMsg = 'Loading...';
    this.productService.getProductAdvisesForPocBasedOnPhnNoId(this.searchCriteria, search)
      .then(productAdviseList => {
        this.productList = productAdviseList;
        if (this.productList.length > 0) {
          this.productList = productAdviseList;
          this.total = this.productList.length;

        } else if (this.productList.length == 0) {
          this.isNoDataFoundVisible = true;
          this.dataMsg = 'No data found';
        }
      });
  }
  getRefreshedorderList(search: string): void {
    $('#search').val('');
    this.productService.isError = false;
    this.productService.errorMessage = undefined;
    this.productService.showMessage = false;
    this.defaultDate = 0;
    this.productList = new Array<CartItem>();
    this.isError = false;
    this.showMessage = false;
    this.isNoDataFoundVisible = false;
    if (search != undefined && search.length < 1) {
      this.getProductAdvisesForPoc(this.defaultDate);
    }
  }
  onButtonClicked(productAdvise: CartItem): void {
    this.selectedproductAdvise = productAdvise;
    this.productService.cartItem = this.selectedproductAdvise;
    this.productService.isUpdate = true;
    if (this.selectedproductAdvise.payment.paymentStatus !== 1)
      this.router.navigate(['/app/product/walkin/newadvice']);
  }
  onGenerateNewAdvise(): void {

    window.localStorage.removeItem('cartItem');
    this.productService.cartItem = new CartItem();
    this.productService.isUpdate = false;
    this.router.navigate(['/app/product/walkin/newadvice']);
  }
  onImageClicked(productAdvise: CartItem): void {
    this.selectedproductAdvise = productAdvise;
    if (this.selectedproductAdvise.payment.paymentStatus == 1) {
      if (this.pdfHeaderType == 0) {
        this.auth.openPDF(this.selectedproductAdvise.pdfUrlWithHeader)
      } else {
        this.auth.openPDF(this.selectedproductAdvise.pdfUrlWithoutHeader)
      }
    }
  }
  onPage(page: number) {
    this.getProductAdvisesForPoc(this.productList[this.total - 1].updatedTimestamp);
  }
  validateWithCriteria(value?, evt?) {

    if (this.searchCriteria == 'contactNo' && value.length < 10) {
      return this.validation.onlyNumbers(evt);
    }
    else if (this.searchCriteria == 'orderId') {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode >= 97 && charCode <= 122) || (charCode >= 65 && charCode <= 90) || (charCode >= 48 && charCode <= 57)) {
        return true;
      }
      return false;
    }
    else
      return false;
  }

  ngOnDestroy(): void {
    this.productService.isError = false;
    this.productService.showMessage = false;
    if (this.selectedproductAdvise != undefined && this.selectedproductAdvise != null) {
      this.productService.productAdviseTrack = this.selectedproductAdvise;
    }
  }


  onSearchChange(search: string) {
    this.searchCriteria = search;
  }

  clickEventHandler(e) {
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    } else if (e.event == "pdfClick") {
      this.onImageClicked(e.val)
    }
  }

}
