import { DoctorService } from './../../../../doctor/doctor.service';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { ProductCentralService } from './../../../productCentral.service';
import { ProductDeliveryRequest } from './../../../../model/product/productdeliveryrequest';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { AuthService } from './../../../../auth/auth.service'
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { CommonUtil } from './../../../../base/util/common-util';
import { Config } from './../../../../base/config';
import { AdminService } from '../../../../admin/admin.service';

@Component({
  selector: 'listing',
  templateUrl: './listing.template.html',
  styleUrls: ['./listing.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListCentralHomeOrderComponent implements OnInit, OnDestroy {
  config: any;
  perPage: number = 10;
  total: number = 0;
  searchCriteria: string = 'orderId';
  productDeliveryResponseList = new Array();
  selectedAdminproductDeliveryResponse: any = null;
  errorMessage: Array<string>;
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
  searchTerm: string = '';
  productDeliveryRequest: ProductDeliveryRequest;
  cityResponseforTooltip: string = "";
  isFilterVisible: boolean = false;
  modalTitle: string = '';
  formattedDataString: string = '';
  email: string = '';
  toEmail: string = '';
  dataMsg: string = '';
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
  // intervalId: any;

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'action',
      style: 'patientLink',
      event: 'hyperlink',
      type: 'hyperlink',
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
      variable: 'cartItem.patientProfileDetails.title cartItem.patientProfileDetails.fName cartItem.patientProfileDetails.lName , cartItem.patientProfileDetails.age  cartItem.patientProfileDetails.gender , cartItem.patientProfileDetails.contactInfo.mobile,  cartItem.patientProfileDetails.contactInfo.email',
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
      variable: 'billAddress',
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
      display: 'Centre Name',
      variable: 'cartItem.pocDetails.pocName cartItem.pocDetails.contactList[0]',
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
          label: 'Approved By Vendor',
          style: 'done_txt pending_txt'
        },
        {
          value: '9',
          condition: 'eq',
          label: 'Rejected By Vendor',
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
      display: 'Processed Date',
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
      event: "viewButton",
      type: 'button',
      sort: false,
    },
    {
      display: 'Order Creator',
      variable: 'creatorName',
      filter: 'text',
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
    },
    {
      display: 'Rating',
      variable: 'userRating.userRating',
      filter: 'htmlContent',
      sort: false,
      event: 'showUserRating',
      eventLabel: 'View Details',
      eventVisibleWhenEmpty: false
    },
    {
      display: 'No of orders',
      variable: 'noOfVisits',
      filter: 'text',
      sort: false
    }, {
      display: 'revenue',
      variable: 'revenue',
      filter: 'text',
      sort: false
    }
  ];

  sorting: any = {
    column: 'updatedTime',
    descending: true
  };

  constructor(config: AppConfig, private businessadminService: BusinessAdminService, private productService: ProductCentralService, private toast: ToasterService, private doctorService: DoctorService,
    private authService: AuthService, private adminService: AdminService, private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil) {
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
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.showPatientDeviceInfo) {
      this.columns.push({
        display: 'Dial User',
        variable: 'orderId',
        filter: 'action',
        type: 'button',
        sort: false,
        event: 'callingUser',
        conditions: [
            {
                condition: 'default',
                label: 'Call Now',
                style: 'btn btn-primary width-100 mb-xs botton_txtdigo done_txt'
            }
        ]
    })
  }
    this.startDate = new Date((new Date()).valueOf() - 86400000 * 3);
    this.endingDate = new Date();
    this.onSubmit();
  }

  ngOnInit(): void {
    this.getState();
    //this.getProductDeliveryList();
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
    console.log("onSubmit")
    this.reset();
    this.onSearchButtonClick();
  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = locationResponse.length > 0 ? this.sortTheResponse(locationResponse) : new Array();
    });
  }
  // getProductDeliveryList() {
  //   this.productDeliveryRequest = new ProductDeliveryRequest;
  //   this.productDeliveryRequest.fromIndex = this.fromIndex;
  //   this.productDeliveryRequest.empId = this.empId;
  //   if (this.startDate != null && this.startDate != undefined && this.endingDate != null && this.endingDate != undefined) {
  //     if (this.startDate > this.endingDate) {
  //       this.isError = true;
  //       this.showMessage = true;
  //       this.errorMessage = new Array();
  //       this.errorMessage[0] = "End date must be greater than start date";
  //       return;
  //     } else {
  //       this.productDeliveryRequest.fromDate = this.startDate.getTime();
  //       this.productDeliveryRequest.toDate = this.endingDate.getTime() + 86400000;
  //     }
  //   } else {
  //     this.isError = true;
  //     this.showMessage = true;
  //     this.errorMessage = new Array();
  //     this.errorMessage[0] = "please select both dates";
  //     return;
  //   }
  //   this.productDeliveryRequest.centralRequest = true;
  //   this.searchproductDeliveryList();
  // }
  searchproductDeliveryList() {
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
    this.isError = this.showMessage = false;
    this.errorMessage = new Array();
    this.productService.getproductdeliveries(this.productDeliveryRequest).then(deliveryList => {
      this.spinnerService.stop();
      // this.productDeliveryResponseList.splice(0);
      this.productDeliveryResponseList.push.apply(this.productDeliveryResponseList, deliveryList);
      console.log("productDeliveryResponse:: " + JSON.stringify(this.productDeliveryResponseList));
      if (!this.productDeliveryResponseList.length) {
        this.productDeliveryResponseList = new Array();
        this.total = this.productDeliveryResponseList.length;
        this.isError = this.showMessage = true;
        this.errorMessage[0] = "No data found.";
        this.dataMsg = "No data found";
      } else {
        if (this.productDeliveryResponseList != null && this.productDeliveryResponseList != undefined) {
          this.productDeliveryResponseList.forEach(element1 => {
            if (element1.cartItem) {
              element1.cartItem.payment.taxationAmount = this.roundToTwo(element1.cartItem.payment.taxationAmount);
              element1.cartItem.payment.otherDiscountAmount = this.roundToTwo(element1.cartItem.payment.otherDiscountAmount);
              let eleAddress = element1.cartItem.deliveryAddress;
              if (eleAddress) {
                let state: any;
                let city: any;
                if (eleAddress.state != undefined && eleAddress.state != null) {
                  state = this.authService.getStateById(eleAddress.state);
                  city = this.authService.getCityById(state, eleAddress.city);
                }
                console.log("state", JSON.stringify(state));
                console.log("city", JSON.stringify(city));
                let stateString: any = !state ? '' : ` ${state.state}`,
                  cityString: any = !city ? '' : `, ${city.city} - ${eleAddress.pinCode}`;
                element1.address = (eleAddress.doorNo ? (eleAddress.doorNo + ", ") : '') + eleAddress.address1 + "," + eleAddress.address2 + cityString + "," + stateString
                stateString != undefined ? element1.state = stateString : "";
                city != undefined ? element1.city = city.city : "";
              }
              let billAddress = element1.cartItem.billingAddress;
              if (billAddress) {
                let state: any;
                let city: any;
                if (billAddress.state != undefined && billAddress.state != null) {
                  state = this.authService.getStateById(billAddress.state);
                  city = this.authService.getCityById(state, billAddress.city);
                }
                let stateString: any = !state ? '' : ` ${state.state}`,
                  cityString: any = !city ? '' : `, ${city.city} - ${billAddress.pinCode}`;
                element1.billAddress = (billAddress.doorNo ? (billAddress.doorNo + ", ") : '') + billAddress.address1 + "," + billAddress.address2 + cityString + "," + stateString;
              }
              element1.creatorName = "";
              if (element1.cartItem.userBooking)
                element1.creatorName = "Self";
              else if (element1.cartItem.employeeDetail != null && element1.cartItem.employeeDetail != undefined) {
                element1.creatorName = (element1.cartItem.employeeDetail.title ? element1.cartItem.employeeDetail.title : '') + ' ' +
                  (element1.cartItem.employeeDetail.firstName ? element1.cartItem.employeeDetail.firstName : '') + " " +
                  (element1.cartItem.employeeDetail.lastName ? element1.cartItem.employeeDetail.lastName : '');
              }
              let products = '';
              for (var i = 0; i < element1.cartItem.productList.length; i++) {
                products += "" + element1.cartItem.productList[i].productName + " - " + element1.cartItem.productList[i].quantity
                if (i != element1.cartItem.productList.length - 1)
                  products += ", \n "
              }
              element1.products = products;
              if (element1.cartItem.cancellationStatus != undefined && element1.cartItem.cancellationStatus == BasketConstants.USER_CANCELLED) {
                // Setting a temporary action status as User cancelled
                element1.actionStatus = 5;
              }
            }

          });
        }
        this.total = this.productDeliveryResponseList.length;
      }
    }).catch(error => {
      if (error) {
        this.isError = this.showMessage = true;
        this.errorMessage[0] = "Error occurred while processing request. Please try again!";
        console.log(error);

      }
      this.spinnerService.stop();
    });
  }

  sortTheResponse(res: LocationModeResponse[]): LocationModeResponse[] {
    res.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    return res;
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
          this.getproductListStateOrCityOrAreaBased();
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
          this.getproductListStateOrCityOrAreaBased();
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
          this.getproductListStateOrCityOrAreaBased();
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
    this.productDeliveryResponseList = new Array<any>();
    this.total = 0;
    this.searchproductDeliveryList();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearchButtonClick();
    }
  }

  onSearchButtonClick(str: string = ''): void {

    if ($('#searchCentral').val() != undefined)
    str = $('#searchCentral').val().toString();
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
    this.productDeliveryRequest = new ProductDeliveryRequest;
    this.productDeliveryRequest.empId = this.empId;
    this.productDeliveryRequest.centralRequest = true;
    this.productDeliveryRequest.fromIndex = this.total;
    let searchStr = str.trim();
    if (this.searchCriteria == 'orderId') {
      if(searchStr.substring(0,2) == 'OR')
      this.productDeliveryRequest.orderId = searchStr;
      if(searchStr.substring(0,2) == 'IN')
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
    this.productDeliveryResponseList = new Array<any>();
    this.productDeliveryRequest.state = this.stateId;
    this.productDeliveryRequest.city = this.cityId;
    this.productDeliveryRequest.pinCode = this.pincode;
    this.searchproductDeliveryList();
  }

  getproductListStateOrCityOrAreaBased(total = 0) {
    this.productDeliveryResponseList = new Array<any>();
    this.total = total;
    if (this.productDeliveryRequest == undefined) {
      this.productDeliveryRequest = new ProductDeliveryRequest();
    }
    this.productDeliveryRequest.fromIndex = 0;
    this.productDeliveryRequest.state = this.stateId;
    this.productDeliveryRequest.city = this.cityId;
    this.productDeliveryRequest.pinCode = this.pincode;
    this.searchproductDeliveryList();
  }

  onPage(page: number) {
    if (this.total < 50 || (+this.total % 50) > 0) {
      return;
    }
    this.fromIndex = this.total + 1;
    if (this.searchTerm != '') {
      this.productDeliveryRequest.fromIndex = this.fromIndex;
      this.searchproductDeliveryList();
    } else if (this.stateId || this.cityId || this.pincode) {
      this.total = this.productDeliveryResponseList.length;
      let pageSize = this.productDeliveryRequest.pageSize;
      this.productDeliveryRequest.fromIndex = this.total + 1;
      // if (this.total % pageSize == 0)
      this.searchproductDeliveryList();
    }
    // else {
    // //   this.getProductDeliveryList();
    // // }

  }
  clickEventHandler(e) {
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    } else if (e.event == "showUserRating") {
      this.showUserRating(e.val);
    } else if (e.event == 'hyperlink') {
      this.gotoPatientDetails(e.val);
    } else if(e.event == 'callingUser') {
      this.callUser(e.val);
  }
  }


  gotoPatientDetails(data) {
    this.adminService.selectedProfileId = data.cartItem.parentProfileId;
    this.router.navigate(['/app/admin/orderhistory']);
  }

  onButtonClicked(selectedAdminproductDeliveryResponse: any) {
    this.selectedAdminproductDeliveryResponse = selectedAdminproductDeliveryResponse;
    this.router.navigate(['/app/product/centralhomeorder/orderdetails']);
  }

  ngOnDestroy(): void {
    if (this.selectedAdminproductDeliveryResponse != undefined && this.selectedAdminproductDeliveryResponse != null) {
      this.productService.productDeliveryDetails = this.selectedAdminproductDeliveryResponse;
    }
  }

  filterBtnClicked() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  getWidth() {
    return $(window).width();
  }

  showUserRating(data: any) {
    (<any>$("#viewmoremodal")).modal("show");
    this.modalTitle = 'User Rating';
    let userRating = null;
    if (data && data.userRating) {
      userRating = data.userRating;
    }
    this.formattedDataString = this.commonUtil.getFormattedFeedbackDetails(userRating);
  }

  onSendEmail() {
    (<any>$("#mailmodal")).modal("show");
  }

  onMailSubmit() {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emailCheck = re.test(this.toEmail);
    if (!emailCheck) {
      alert("Please enter a valid email address");
      return;
    }

    this.productDeliveryRequest = new ProductDeliveryRequest;
    this.productDeliveryRequest.fromIndex = this.fromIndex;
    this.productDeliveryRequest.empId = this.empId;
    if (this.startDate != null && this.startDate != undefined && this.endingDate != null && this.endingDate != undefined) {
      if (this.startDate > this.endingDate) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "End date must be greater than start date";
        return;
      } else {
        this.productDeliveryRequest.fromDate = this.startDate.getTime();
        this.productDeliveryRequest.toDate = this.endingDate.getTime() + 86400000;
      }
    }
    else {
      this.errorMessage = new Array();
      (<any>$)("#mailmodal").modal("hide");
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "please select dates to continue";
      return;
    }
    this.productDeliveryRequest.centralRequest = true;
    this.productDeliveryRequest.toEmail = this.toEmail;
    this.productDeliveryRequest.isExcel = true;
    (<any>$)("#mailmodal").modal("hide");
    this.spinnerService.start();
    this.productService.getproductdeliveries(this.productDeliveryRequest).then(deliveryList => {
      this.toEmail = '';
      try {
        this.spinnerService.stop();
        this.toast.show('successfully email sent', "bg-success text-white font-weight-bold", 3000);
      }
      catch (error) {
        console.error(error);
      }
    })

  }

  callUser(data) {
    let order = data
        this.doctorService.placeClickCallRequest(order.cartItem.patientProfileId, this.empId, order.orderId).then(resp => {
            if (resp && (resp.statusCode == 200 || resp.statusCode == 201)) {
                this.toast.show(resp.statusMessage, "bg-success text-white font-weight-bold", 2000);
            } else {
                this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
            }
        }).catch(err => {
            this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
        });
  }

  roundToTwo(num) {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }

}
