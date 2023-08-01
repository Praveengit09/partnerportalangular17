import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AppConfig } from '../../../../app.config';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { AdminService } from './../../../../admin/admin.service';


@Component({
  templateUrl: './list.template.html',
  styleUrls: ['./list.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class ReturnListComponent {

  config: any;
  perPage: number = 10;
  total: number = 0;
  searchCriteria: string = 'orderId';

  productDeliveryResponseList: Array<ProductDeliveryTrack> = new Array<ProductDeliveryTrack>();
  selectedProductDeliveryTrack: ProductDeliveryTrack;

  errorMessage: Array<string>;
  isEnter: boolean = false;
  isError: boolean;
  showMessage: boolean;

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

  adminProductDeliveryRequest: ProductDeliveryRequest;

  cityResponseforTooltip: string = "";
  isNoDataFoundVisible = false;

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Customer Information',
      variable: 'cartItem.patientProfileDetails.title cartItem.patientProfileDetails.fName cartItem.patientProfileDetails.lName , cartItem.patientProfileDetails.age  cartItem.patientProfileDetails.gender , cartItem.patientProfileDetails.contactInfo.mobile ',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Collection Address',
      variable: 'address',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      label: 'View',
      filter: 'text',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'actionStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Collected',
          style: 'hide_btn hide_btntxt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Pending Approval',
          style: ' done_txt pending_txt'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Approved',
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
          value: '10',
          condition: 'lte',
          label: 'Return Requested',
          style: 'processorder_styletxt'
        },
        {
          value: '11',
          condition: 'eq',
          label: 'Collection Initiated',
          style: 'done_txt pending_txt'
        },
        {
          condition: 'default',
          label: 'Return Requested',
          style: 'btn btn-danger width-100 mb-xs botton_txt'
        }
      ]
    },
    {
      display: 'Date',
      variable: 'updatedTime',
      filter: 'date',
      sort: true
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

      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      filter: 'action',
      event: 'viewButton',
      type: 'button',
      sort: false,
    }
  ];

  sorting: any = {
    column: 'updatedTime',
    descending: true
  };
  isFilter: boolean = false;

  constructor(config: AppConfig, private adminService: AdminService, private validation: ValidationUtil,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.empId = this.authService.userAuth.employeeId;
    this.pocId = authService.userAuth.pocId;
    this.fromIndex = 0;
  }

  ngOnInit(): void {
    this.getState();
    this.getProductDeliveryList();
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
      this.cityResponseforTooltip = this.cityResponse[index - 1].name
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
    if (this.adminProductDeliveryRequest != undefined) {
      this.adminProductDeliveryRequest.orderId = this.adminProductDeliveryRequest.mobile = "";
    }
    this.searchCriteria = search;
  }

  onSearchButtonClick(str: string): void {
    this.total = 0;
    this.adminProductDeliveryRequest = new ProductDeliveryRequest();
    this.adminProductDeliveryRequest.empId = this.empId;
    this.adminProductDeliveryRequest.pocId = this.pocId;
    this.adminProductDeliveryRequest.fromIndex = this.total;
    let searchStr = str.trim();
    if (this.searchCriteria == 'orderId') {
      this.adminProductDeliveryRequest.orderId = searchStr;
    } else if (this.searchCriteria == 'mobile') {
      if (searchStr.length < 10 || searchStr.length > 10) {
        this.isCorrectMobile = true;
        return;
      } else {
        this.adminProductDeliveryRequest.mobile = searchStr;
        this.isCorrectMobile = false;
      }
    }
    this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
    this.adminProductDeliveryRequest.state = this.stateId;
    this.adminProductDeliveryRequest.city = this.cityId;
    this.adminProductDeliveryRequest.pinCode = this.pincode;
    this.isFilter = true;
    this.searchProductDeliveryList();
  }

  getProductListStateOrCityOrAreaBased() {
    this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
    this.total = 0;
    if (this.adminProductDeliveryRequest == undefined) {
      this.adminProductDeliveryRequest = new ProductDeliveryRequest();
    }
    this.adminProductDeliveryRequest.state = this.stateId;
    this.adminProductDeliveryRequest.city = this.cityId;
    this.adminProductDeliveryRequest.pinCode = this.pincode;
    this.isFilter = false;
    this.searchProductDeliveryList();
  }

  onPage(page: number) {
    this.fromIndex = this.total + 1;
    this.getProductDeliveryList();
  }

  getProductDeliveryList() {
    this.adminProductDeliveryRequest = new ProductDeliveryRequest();
    this.adminProductDeliveryRequest.fromIndex = this.fromIndex;
    this.adminProductDeliveryRequest.empId = this.empId;
    this.adminProductDeliveryRequest.pocId = this.pocId;
    this.isFilter = false;
    this.searchProductDeliveryList();
  }

  searchProductDeliveryList() {
    this.adminProductDeliveryRequest.returnRequest = true;
    this.isNoDataFoundVisible = false;
    this.spinnerService.start();
    this.isNoDataFoundVisible = this.isFilter;
    this.adminService.getProductDeliveries(this.adminProductDeliveryRequest).then(deliveryList => {
      this.spinnerService.stop();
      this.productDeliveryResponseList = [...this.productDeliveryResponseList, ...deliveryList];
      console.log("productDeliveryResponseList:: " + JSON.stringify(this.productDeliveryResponseList));
      if ((this.productDeliveryResponseList.length == 0 || deliveryList.length == 0) && this.isFilter) {
        // this.productDeliveryResponseList = new Array<ProductDeliveryTrack>();
        // this.total = this.productDeliveryResponseList.length;
        // this.isError = true;
        // this.errorMessage = new Array();
        // this.errorMessage[0] = "No data found.";
        // this.showMessage = true;
        // this.isNoDataFoundVisible = true;
      } else {
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
                stateString = "," + stateString + state.state;
              }
              if (!city) {
                cityString = "";
              } else {
                cityString = "," + cityString + city.city + " - " + element1.cartItem.deliveryAddress.pinCode;
              }
              element1.address = element1.cartItem.deliveryAddress.address1 + "," + element1.cartItem.deliveryAddress.address2 + cityString + stateString
            }

            if (element1.cartItem != undefined && element1.cartItem.cancellationStatus != undefined && element1.cartItem.cancellationStatus == BasketConstants.USER_CANCELLED) {
              // Setting a temporary action status as User cancelled
              element1.actionStatus = 5;
            }

          });
        }
        this.total = this.productDeliveryResponseList.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      }
    }).catch(error => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Error occurred while processing request. Please try again!";
      this.showMessage = true;
      this.spinnerService.stop();
    });
  }

  onButtonClicked(selectedProductDeliveryTrack: ProductDeliveryTrack) {
    this.selectedProductDeliveryTrack = selectedProductDeliveryTrack;
    this.router.navigate(['/app/product/returns/order']);
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

}
