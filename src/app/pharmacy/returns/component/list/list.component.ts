import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';

import { PharmacyService } from './../../../pharmacy.service'

import { AuthService } from './../../../../auth/auth.service'
import { AdminPharmacyDeliveryRequest } from "./../../../../model/pharmacy/adminPharmacyDeliveryRequest";
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { BasketConstants } from '../../../../constants/basket/basketconstants';

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
  noDataFoundShow = false;
  dataMsg: string = ' ';
  pharmacyDeliveryResponseList: Array<AdminPharmacyDeliveryResponse> = new Array<AdminPharmacyDeliveryResponse>();
  selectedAdminPharmacyDeliveryResponse: AdminPharmacyDeliveryResponse;

  errorMessage: Array<string> = new Array();
  isEnter: boolean = false;
  isError: boolean = false;
  showMessage: boolean = false;

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
  searchTerm: string;
  isCorrectMobile: boolean = false;
  fromIndex: number;
  stateIndex: number;
  cityIndex: number;

  adminPharmacyDeliveryRequest: AdminPharmacyDeliveryRequest;

  cityResponseforTooltip: string = "";
  isFilterVisible: boolean = false;

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

  constructor(config: AppConfig, private businessadminService: BusinessAdminService,
    private pharmacyService: PharmacyService, private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.empId = this.authService.userAuth.employeeId;
    this.pocId = authService.userAuth.pocId;
    this.fromIndex = 0;
  }

  ngOnInit(): void {
    this.getState();
    this.getPharmacyDeliveryList();
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
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = locationResponse.length > 0 ? this.sortTheResponse(locationResponse) : new Array();
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
          this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.cityResponse = this.sortTheResponse(locationResponse);
            console.log("LocationDetails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
          });
          this.getPharmacyListStateOrCityOrAreaBased();
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
          this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.localityResponse = this.sortTheResponse(locationResponse);
            console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
          });
          this.getPharmacyListStateOrCityOrAreaBased();
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
          this.getPharmacyListStateOrCityOrAreaBased();
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
    this.pharmacyDeliveryResponseList = new Array<AdminPharmacyDeliveryResponse>();
    this.total = 0;
    this.getPharmacyDeliveryList();
  }

  onSearchChange(search: string) {
    (<any>$)("#searchBox").val("");
    this.isCorrectMobile = false;
    if (this.adminPharmacyDeliveryRequest != undefined) {
      this.adminPharmacyDeliveryRequest.orderId = this.adminPharmacyDeliveryRequest.mobile = "";
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
    this.total = 0;
    this.adminPharmacyDeliveryRequest = new AdminPharmacyDeliveryRequest;
    this.adminPharmacyDeliveryRequest.empId = this.empId;
    this.adminPharmacyDeliveryRequest.pocId = this.pocId;
    this.adminPharmacyDeliveryRequest.fromIndex = this.total;
    let searchStr = str.trim();
    this.searchTerm = str.trim();
    if (this.searchCriteria == 'orderId') {
      this.adminPharmacyDeliveryRequest.orderId = searchStr;
    } else if (this.searchCriteria == 'mobile') {
      if (searchStr.length < 10 || searchStr.length > 10) {
        this.isCorrectMobile = true;
        return;
      } else {
        this.adminPharmacyDeliveryRequest.mobile = searchStr;
        this.isCorrectMobile = false;
      }
    }
    this.pharmacyDeliveryResponseList = new Array<AdminPharmacyDeliveryResponse>();
    this.adminPharmacyDeliveryRequest.state = this.stateId;
    this.adminPharmacyDeliveryRequest.city = this.cityId;
    this.adminPharmacyDeliveryRequest.pinCode = this.pincode;
    this.searchPharmacyDeliveryList();
    if (this.pharmacyDeliveryResponseList.length == 0) {
      this.noDataFoundShow = true;
    }
  }

  getPharmacyListStateOrCityOrAreaBased() {
    this.pharmacyDeliveryResponseList = new Array<AdminPharmacyDeliveryResponse>();
    this.total = 0;
    if (this.adminPharmacyDeliveryRequest == undefined) {
      this.adminPharmacyDeliveryRequest = new AdminPharmacyDeliveryRequest();
    }
    this.adminPharmacyDeliveryRequest.state = this.stateId;
    this.adminPharmacyDeliveryRequest.city = this.cityId;
    this.adminPharmacyDeliveryRequest.pinCode = this.pincode;
    this.searchPharmacyDeliveryList();
  }

  onPage(page: number) {
    this.fromIndex = this.total + 1;
    this.getPharmacyDeliveryList();
  }

  getPharmacyDeliveryList() {
    this.adminPharmacyDeliveryRequest = new AdminPharmacyDeliveryRequest;
    this.adminPharmacyDeliveryRequest.fromIndex = this.fromIndex;
    this.adminPharmacyDeliveryRequest.empId = this.empId;
    this.adminPharmacyDeliveryRequest.pocId = this.pocId;
    this.searchPharmacyDeliveryList();
  }

  searchPharmacyDeliveryList() {
    this.adminPharmacyDeliveryRequest.returnRequest = true;
    this.spinnerService.start();
    this.dataMsg = 'Loading.....';
    this.pharmacyService.getpharmacydeliveries(this.adminPharmacyDeliveryRequest).then(deliveryList => {
      this.spinnerService.stop();
      this.pharmacyDeliveryResponseList.push.apply(this.pharmacyDeliveryResponseList, deliveryList);
      console.log("PharmacyDeliveryResponseList:: " + JSON.stringify(this.pharmacyDeliveryResponseList));
      // if (this.searchTerm) {

      if (this.pharmacyDeliveryResponseList.length == 0) {
        this.pharmacyDeliveryResponseList = new Array<AdminPharmacyDeliveryResponse>();
        this.total = this.pharmacyDeliveryResponseList.length;
        this.dataMsg = 'No data found';
        // this.isError = true;
        // this.errorMessage = new Array();
        // this.showMessage = true;
        // this.errorMessage[0] = "No data found.";
      } else {
        if (this.pharmacyDeliveryResponseList != null && this.pharmacyDeliveryResponseList != undefined) {
          this.noDataFoundShow = false;
          this.pharmacyDeliveryResponseList.forEach(element1 => {
            if (element1.cartItem.deliveryAddress != undefined && element1.cartItem.deliveryAddress != null) {
              console.log("=========>>>")
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
              console.log("=======>>" + JSON.stringify(element1.address))
            }

            if (element1.cartItem != undefined && element1.cartItem.cancellationStatus != undefined && element1.cartItem.cancellationStatus == BasketConstants.USER_CANCELLED) {
              // Setting a temporary action status as User cancelled
              element1.actionStatus = 5;
            }

          });
        }
        this.total = this.pharmacyDeliveryResponseList.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;

      }
      // }

    }).catch(error => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Error occurred while processing request. Please try again!";
      this.showMessage = true;
      this.spinnerService.stop();
    });
  }

  onButtonClicked(selectedAdminPharmacyDeliveryResponse: AdminPharmacyDeliveryResponse) {
    this.selectedAdminPharmacyDeliveryResponse = selectedAdminPharmacyDeliveryResponse;
    this.router.navigate(['/app/pharmacy/returns/order']);
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    }
  }

  ngOnDestroy(): void {
    this.pharmacyService.isError = false;
    this.pharmacyService.showMessage = false;
    if (this.selectedAdminPharmacyDeliveryResponse != undefined && this.selectedAdminPharmacyDeliveryResponse != null) {
      this.pharmacyService.pharmacyDeliveryDetails = this.selectedAdminPharmacyDeliveryResponse;
    }
  }

  filterBtnClicked() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  getWidth() {
    return $(window).width();
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
