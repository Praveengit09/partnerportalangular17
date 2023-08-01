import { CommonUtil } from './../../../../base/util/common-util';
import { Component, ViewEncapsulation, ElementRef, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';

import { ValidationUtil } from '../../../../base/util/validation-util';
import { AdminService } from '../../../../admin/admin.service';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { Config } from '../../../../base/config';

@Component({
  templateUrl: './orderlist.template.html',
  styleUrls: ['./orderlist.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class OrderListComponent implements OnInit {
  config: any;
  perPage: number = 10;
  total: number = 0;
  searchCriteria: string = 'orderId';
  productDeliveryResponseList: Array<ProductDeliveryTrack> = new Array<ProductDeliveryTrack>();
  productDeliveryTrack: ProductDeliveryTrack = new ProductDeliveryTrack();
  selectedProductDeliveryTrack: ProductDeliveryTrack;
  errorMessage: Array<string>;
  isEnter: boolean = false;
  isError: boolean;
  showMessage: boolean;
  dataMsg: string = ' ';

  // new variables......
  pocId: number;
  empId: number;
  stateId: number = 0;
  cityId: number = 0;
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  pincode: string = null;
  isCorrectMobile: boolean = false;
  fromIndex: number;
  stateIndex: number;
  cityIndex: number;
  productDeliveryRequest: ProductDeliveryRequest;
  cityResponseforTooltip: string = "";
  isFilter: boolean = false;
  searchTerm: string = '';
  email: string = '';
  startDate: Date;
  endDate: Date;
  endingDate: Date;
  futureDate = new Date().setMonth(new Date().getMonth() + 1);
  pastDate = new Date().setMonth(new Date().getMonth() - 12);

  datepickerOpts = {
    startDate: new Date(this.pastDate),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    startDate: new Date(this.pastDate),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',
  };

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
      display: 'Order Type',
      variable: 'orderType',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Doctor Adviced'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Offline Prescription'
        },
        {
          condition: 'default',
          label: 'MCommerce'
        }
      ]
    },
    {
      display: 'Customer Information',
      variable: 'cartItem.patientProfileDetails.title cartItem.patientProfileDetails.fName cartItem.patientProfileDetails.lName , cartItem.patientProfileDetails.age cartItem.patientProfileDetails.gender , cartItem.patientProfileDetails.contactInfo.mobile , cartItem.patientProfileDetails.contactInfo.email',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Delivery Address',
      variable: 'address',
      filter: 'text',
      sort: false
    },
    {
      display: 'Billing Address',
      variable: 'billingAddress',
      filter: 'text',
      sort: false
    },
    {
      display: 'City',
      variable: 'city',
      filter: 'text',
      sort: false
    },
    {
      display: 'State',
      variable: 'state',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      label: 'View',
      filter: 'text',
      type: 'button',
      sort: false,
      event: 'viewButton',
      variable: 'actionStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Process Order',
          style: 'processorder_styletxt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Delivered',
          style: 'hide_btn hide_btntxt'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Order Confirmed',
          style: 'done_txt pending_txt'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'Rejected',
          style: 'hide_btn hide_btntxt'
        },
        {
          value: '5',
          condition: 'eq',
          label: 'Cancelled',
          style: 'hide_btn hide_btntxt'
        },
        {
          value: '6',
          condition: 'eq',
          label: 'Delivery Initiated',
          style: 'done_txt pending_txt'
        },
        {
          value: '8',
          condition: 'eq',
          label: 'Approved',
          style: 'done_txt pending_txt'
        },
        {
          value: '12',
          condition: 'eq',
          label: 'Out For Delivery',
          style: 'done_txt pending_txt'
        },
        {
          value: '13',
          condition: 'eq',
          label: 'Delivered',
          style: 'done_txt pending_txt'
        },
        {
          value: '15',
          condition: 'eq',
          label: 'Delivery Initiated',
          style: 'done_txt pending_txt'
        },
        {
          condition: 'default',
          label: 'Process Order',
          style: 'btn btn-danger width-100 mb-xs botton_txt'
        }
      ]
    },
    {
      display: 'Ordered Date',
      variable: 'cartItem.orderPlacedTimestamp',
      filter: 'date',
      sort: true
    },
    {
      display: 'Updated Date',
      variable: 'updatedTime',
      filter: 'date',
      sort: true
    },
    {
      display: 'Products - Quantity',
      variable: 'products',
      filter: 'text',
      sort: false
    },
    {
      display: 'GST',
      variable: 'cartItem.payment.taxationAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Discount Amount',
      variable: 'cartItem.payment.otherDiscountAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Shipping Charges',
      variable: 'cartItem.deliveryAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Total Bill Value',
      variable: 'cartItem.payment.finalAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Payment Status',
      variable: 'cartItem.payment.paymentStatus',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Unpaid'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          condition: 'default',
          label: 'Unpaid'
        }
      ]
    },
    {
      display: 'Payment Id',
      variable: 'cartItem.payment.paymentId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      filter: 'action',
      event: 'viewButton',
      type: 'button',
      sort: false
    },
    {
      display: 'Had Consultation',
      variable: 'cartItem.afterPrescriptionGeneration',
      filter: 'text',
      conditions: [
        {
          value: 'true',
          condition: 'eq',
          label: 'Yes'
        },
        {
          value: 'false',
          condition: 'eq',
          label: 'No'
        },
        {
          condition: 'default',
          label: 'No'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'updatedTime',
    descending: true
  };
  isNoDataFoundVisible: boolean = false;

  constructor(config: AppConfig, elementRef: ElementRef, private commonUtil: CommonUtil,
    private validation: ValidationUtil, private adminService: AdminService,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.empId = this.authService.userAuth.employeeId;
    this.pocId = authService.userAuth.pocId;
    this.fromIndex = 0;
    if (Config.portal.productOptions && Config.portal.productOptions.showPatientDeviceInfo) {
      this.columns.push({
        display: 'AdvertisementId',
        variable: 'advertisementId',
        filter: 'text',
        sort: false
      }, {
        display: 'IMEI',
        variable: 'imei',
        filter: 'text',
        sort: false
      });
    }
  }

  ngOnInit(): void {
    this.getState();
    //this.getProductDeliveryList();
    this.ngOnChanges();
    $(".modal-backdrop").not(':first').remove();
    localStorage.removeItem("homeorderCart");
    this.startDate = new Date((new Date()).valueOf() - 86400000 * 3);
    this.endingDate = new Date();
    this.onSubmit();
  }
  ngOnChanges(): void {
    // if ($(".modal-backdrop").length > 1) {
    //   alert(1);
    //   $(".modal-backdrop").not(':first').remove();
    // }
  }

  startDateChoosen($event): void {
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
      this.startDate.getDate(), 0, 0, 0)
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

  endDateChoosen(event) {
    this.endingDate = new Date(this.endingDate.getFullYear(), this.endingDate.getMonth(),
      this.endingDate.getDate(), 0, 0, 0)
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

  reset() {
    this.total = 0;
    this.fromIndex = 0;
    this.productDeliveryResponseList = new Array();
  }

  onSubmit() {
    this.reset();
    this.onSearchButtonClick('');
  }

  sortTheResponse(res: LocationModeResponse[]): LocationModeResponse[] {
    res.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    return res;
  }
  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = this.sortTheResponse(locationResponse);
    });
  }

  onStateChange(index: number): void {
    this.stateIndex = index;
    if (index == 0) {
      this.getRefreshedorderList();
    }
    else {
      if (this.isCorrectMobile != true) {
        while (this.cityResponse.length > 0) {
          this.cityResponse.pop();
        }
        while (this.localityResponse.length > 0) {
          this.localityResponse.pop();
        }
        this.cityId = 0;
        this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
        this.pincode = null;
        this.indexForCity = 0;
        this.indexForLoc = 0;
        if (index != 0) {
          this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.cityResponse = this.sortTheResponse(locationResponse);
            console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
          });
          this.getProductListStateOrCityOrAreaBased();
        }
      }
    }
  }

  onCityChange(index: number): void {
    this.cityIndex = index;
    if (index == 0) {
      this.onStateChange(this.stateIndex);
    } else {
      this.cityResponseforTooltip = this.cityResponse[index - 1].name;
      if (this.isCorrectMobile != true) {
        while (this.localityResponse.length > 0) {
          this.localityResponse.pop();
        }
        this.indexForLoc = 0;
        this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
        this.pincode = null;
        if (index != 0) {
          this.adminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.localityResponse = this.sortTheResponse(locationResponse);
            console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
          });
          this.getProductListStateOrCityOrAreaBased();
        }
      }
    }
  }

  onLocationChange(index: number): void {
    if (index == 0) {
      this.onCityChange(this.cityIndex);
    }
    else {
      if (this.isCorrectMobile != true) {
        this.pincode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);
        if (index != 0) {
          this.getProductListStateOrCityOrAreaBased();
        }
      }
    }
  }

  getRefreshedorderList(): void {
    $('#search').val('');
    this.cityResponseforTooltip = "";
    (<any>$)("#searchBox").val("");
    (<any>$)("#checkOrderId").prop("checked", true);
    this.searchCriteria = 'orderId';
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.indexForCity = 0;
    this.indexForLoc = 0;
    this.indexForState = 0;
    this.pincode = null;
    this.stateId = 0;
    this.cityId = 0;
    this.fromIndex = 0;
    this.isCorrectMobile = false;
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
    this.total = 0;
    this.getProductDeliveryList();
  }

  onSearchChange(search: string) {
    (<any>$)("#searchBox").val("");
    this.isCorrectMobile = false;
    if (this.productDeliveryRequest != undefined) {
      this.productDeliveryRequest.orderId = this.productDeliveryRequest.mobile = "";
    }
    this.searchCriteria = search;
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearchButtonClick();
    }
  }

  onSearchButtonClick(str: string = ''): void {
    str = $('#search').val().toString();
    this.searchTerm = str;
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emailCheck = re.test(str);

    if (emailCheck) {
      this.email = str;
      this.searchCriteria = "mail"
    }
    else {
      if (isNaN(parseInt(str))) {
        this.searchCriteria = 'orderId';
      } else {
        this.searchCriteria = 'mobile';
        if (str.length != 10) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage.push('Please Enter valid mobile number');
          this.showMessage = true;
          return;
        }
      }
    }
    this.total = 0;
    this.productDeliveryRequest = new ProductDeliveryRequest();
    this.productDeliveryRequest.empId = this.empId;
    this.productDeliveryRequest.pocId = this.pocId;
    this.productDeliveryRequest.fromIndex = this.total;
    let searchStr = str.trim();
    if (this.searchCriteria == 'orderId') {
      if (searchStr.substring(0, 2) == 'OR')
        this.productDeliveryRequest.orderId = searchStr;
      if (searchStr.substring(0, 2) == 'IN')
        this.productDeliveryRequest.invoiceId = searchStr;
    } else if (this.searchCriteria == 'mobile') {
      if (searchStr.length < 10 || searchStr.length > 10) {
        this.isCorrectMobile = true;
        return;
      } else {
        this.productDeliveryRequest.mobile = searchStr;
        this.isCorrectMobile = false;
      }
    } else if (this.searchCriteria == 'mail') {
      this.productDeliveryRequest.email = searchStr;
    }
    this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
    this.productDeliveryRequest.state = this.stateId;
    this.productDeliveryRequest.city = this.cityId;
    this.productDeliveryRequest.pinCode = this.pincode;
    this.isFilter = true;
    this.searchProductDeliveryList();
  }

  getProductListStateOrCityOrAreaBased() {
    this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
    this.total = 0;
    if (this.productDeliveryRequest == undefined) {
      this.productDeliveryRequest = new ProductDeliveryRequest();
    }
    this.productDeliveryRequest.state = this.stateId;
    this.productDeliveryRequest.city = this.cityId;
    this.productDeliveryRequest.pinCode = this.pincode;
    this.isFilter = false;
    this.searchProductDeliveryList();
  }

  onPage(page: number) {
    this.fromIndex = this.total + 1;
    this.getProductDeliveryList();
  }

  getProductDeliveryList() {
    this.productDeliveryRequest = new ProductDeliveryRequest();
    this.productDeliveryRequest.fromIndex = this.fromIndex;
    this.productDeliveryRequest.empId = this.empId;
    this.productDeliveryRequest.pocId = this.pocId;
    this.isFilter = false;
    this.searchProductDeliveryList();
  }

  searchProductDeliveryList() {
    this.isNoDataFoundVisible = this.isFilter;
    if (this.startDate != null && this.startDate != undefined && this.endingDate != null && this.endingDate != undefined) {
      if (this.startDate > this.endingDate) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "End date must be greater than start date";
        return;
      } else {
        this.productDeliveryRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate)
        this.productDeliveryRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endingDate) + 86400000;
      }
    } else {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "please select both dates";
      return;
    }
    this.dataMsg = 'Loading...';
    this.spinnerService.start();
    this.adminService.getProductDeliveries(this.productDeliveryRequest).then(deliveryList => {
      this.spinnerService.stop();
      this.productDeliveryResponseList.push.apply(this.productDeliveryResponseList, deliveryList);
      if (deliveryList.length > 0) {
        this.dataMsg = '';
        if (this.productDeliveryResponseList != null && this.productDeliveryResponseList != undefined) {
          this.productDeliveryResponseList.forEach(element1 => {
            if (element1.cartItem.deliveryAddress != undefined && element1.cartItem.deliveryAddress != null) {

              let state = this.authService.getStateById(element1.cartItem.deliveryAddress.state);
              let city = this.authService.getCityById(state, element1.cartItem.deliveryAddress.city);
              let stateString: any = "";
              let cityString: any = "";
              if (!state) {
                stateString = "";
              } else {
                stateString = stateString + state.state;
              }
              if (!city) {
                cityString = "";
              } else {
                cityString = "," + cityString + (city ? city.city : "") + " - " + element1.cartItem.deliveryAddress.pinCode;
              }
              element1.address = (element1.cartItem.deliveryAddress.doorNo ? (element1.cartItem.deliveryAddress.doorNo + ", ") : '') + element1.cartItem.deliveryAddress.address1 + "," + element1.cartItem.deliveryAddress.address2 + cityString + "," + stateString
              element1.state = stateString;
              element1.city = city ? city.city : '';
            }
            let billAddress = element1.cartItem.billingAddress;
            if (billAddress) {
              let state = this.authService.getStateById(billAddress.state);
              let city = this.authService.getCityById(state, billAddress.city);
              let stateString: any = !state ? '' : ` ${state.state}`,
                cityString: any = !city ? '' : `, ${city.city} - ${billAddress.pinCode}`;
              element1.billingAddress = (billAddress.doorNo ? (billAddress.doorNo + ", ") : '') + billAddress.address1 + "," + billAddress.address2 + cityString + "," + stateString;
            }
            let products = '';
            for (var i = 0; i < element1.cartItem.productList.length; i++) {
              products += "" + element1.cartItem.productList[i].productName + " - " + element1.cartItem.productList[i].quantity
              if (i != element1.cartItem.productList.length - 1)
                products += ", \n "
            }
            element1.products = products;
            if (element1.cartItem != undefined && element1.cartItem.cancellationStatus != undefined && element1.cartItem.cancellationStatus == BasketConstants.USER_CANCELLED) {
              // Setting a temporary action status as User cancelled
              element1.actionStatus = 5;
            }
            element1.cartItem.payment.taxationAmount = this.roundToTwo(element1.cartItem.payment.taxationAmount);
            element1.cartItem.payment.otherDiscountAmount = this.roundToTwo(element1.cartItem.payment.otherDiscountAmount);

          });
        }
        this.total = this.productDeliveryResponseList.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      } else {
        this.dataMsg = 'No Data Found';
      }
    }).catch(error => {
      console.log(error);
      this.isError = true;
      this.errorMessage = new Array();
      this.dataMsg = 'No Data Found';;
      this.errorMessage[0] = "Error occurred while processing request. Please try again!";
      this.showMessage = true;
      this.spinnerService.stop();
    });
  }

  onButtonClicked(selectedProductDeliveryTrack: ProductDeliveryTrack) {
    this.selectedProductDeliveryTrack = selectedProductDeliveryTrack;
    this.router.navigate(['/app/product/homeorder/view']);
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    }
  }

  ngOnDestroy(): void {
    if (this.selectedProductDeliveryTrack != undefined && this.selectedProductDeliveryTrack != null) {
      this.adminService.productDeliveryTrack = this.selectedProductDeliveryTrack;
    }
  }
  validateWithCriteria(value?, evt?) {
    // if (value.length >= 10) {
    //   return false
    // }
    // else
    if (this.searchCriteria == 'mobile' && value.length < 10) {
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
  newOrder() {
    this.router.navigate(['/app/product/homeorder/neworder']);
  }

  roundToTwo(num) {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }

}
