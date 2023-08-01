import { Config } from './../../../base/config';
import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { OrderHistoryRemark } from "../../../model/basket/orderHistoryRemark";
import { AdminService } from "../../../admin/admin.service";
import { OrderListRequest } from "../../../model/basket/orderListRequest";
import { AuthService } from "../../../auth/auth.service"
import { Employee } from "../../../model/employee/employee";
import { LocationModeResponse } from '../../../model/common/locationmoderesponse';
import { Payment } from '../../../model/basket/payment';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
@Component({
  selector: 'ordercancellation',
  templateUrl: './ordercancellation.template.html',
  styleUrls: ['./ordercancellation.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class OrderCancellationComponent {
  config: any;
  total: number = 0;
  perPage: number = 10;
  searchString: string = 'orderId';
  isError: boolean = false;
  showMessage: boolean = false;
  errorMessage: Array<string>;
  scrollPos: number;
  emptyString: string = "";

  orderHistoryRemarkList: OrderHistoryRemark[] = new Array<OrderHistoryRemark>();
  orderHistoryRemark: OrderHistoryRemark = new OrderHistoryRemark();
  orderListRequest: OrderListRequest;

  orderId_Hyper: string;
  customerDetails_Hyper: any;
  pocs_Hyper: string;
  docName_Hyper: string;
  bookingDates_Hyper: number;
  payStatus_Hyper: string;
  payType_Hyper: string;
  slotDate_Hyper: number;
  slotTime_Hyper: number;

  // new variables......
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

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'action',
      event: 'orderidlink',
      style: 'orderId',
      type: 'hyperlink',
      sort: false
    },
    {
      display: 'Customer Details',
      variable: 'slotBookingDetailsList[0].patientProfileDetails.title slotBookingDetailsList[0].patientProfileDetails.fName slotBookingDetailsList[0].patientProfileDetails.lName  , slotBookingDetailsList[0].patientProfileDetails.contactInfo.mobile , slotBookingDetailsList[0].patientProfileDetails.contactInfo.email',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Center Details',
      variable: 'slotBookingDetailsList[0].pocDetails.pocName',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Doctor Details',
      variable: 'slotBookingDetailsList[0].doctorDetail.firstName slotBookingDetailsList[0].doctorDetail.lastName',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Booking Type',
      variable: 'slotBookingDetailsList[0].bookingType',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Doctor - Connect Now'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Doctor'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'Wellness'
        },
        {
          value: '5',
          condition: 'eq',
          label: 'Diagnostics'
        },
        {
          condition: 'default',
          label: 'NA',
        }
      ]
    },
    {
      display: 'Booking Dates',
      variable: 'slotBookingDetailsList[0].slotDate',
      filter: 'date',
      sort: true
    },
    {
      display: 'Payment Status',
      variable: 'slotBookingDetailsList[0].payment.paymentStatus',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          condition: 'default',
          label: 'Unpaid',
        }
      ]
    },
    {
      display: 'Action',
      label: 'Mark Addressed',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'markaddressedbutton',
      sort: false,
      variable: 'remarkStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Mark Addressed',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Addressed',
          style: 'btn width-100 mb-xs   hide_btntxt'
        },
        {
          condition: 'default',
          label: 'Mark Addressed',
          style: 'btn btn-danger width-100 mb-xs botton_txt'
        }
      ]
    },
    {
      display: 'Actioned By',
      variable: 'employee.firstName employee.lastName',
      filler: ',',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Remarks',
      variable: 'remark',
      filter: 'text',
      sort: false
    }
  ];

  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
  };

  constructor(config: AppConfig,
    private adminService: AdminService, private authService: AuthService,private spinnerService:SpinnerService) {
    this.config = config.getConfig();
    this.scrollPos = 0;
  }

  ngOnInit(): void {
    this.empId = this.authService.userAuth.employeeId;
    this.getState();
    this.getCancelOrderListByUser();
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
      console.log("LocationDeatails for State For Login Emp:: " + JSON.stringify(this.stateResponse));
    });
  }

  onStateChange(index: number): void {
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
          console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
        });
        this.getCancelOrderListStateOrCityOrAreaBased();
      }
    }
  }

  onCityChange(index: number): void {
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
        this.getCancelOrderListStateOrCityOrAreaBased();
      }
    }
  }

  onLocationChange(index: number): void {
    if (this.isCorrectMobile != true) {
      this.pincode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);
      if (index != 0) {
        this.getCancelOrderListStateOrCityOrAreaBased();
      }
    }
  }

  getCancelOrderListStateOrCityOrAreaBased() {
    this.orderHistoryRemarkList = new Array<OrderHistoryRemark>();
    this.total = 0;
    if (this.orderListRequest == undefined) {
      this.orderListRequest = new OrderListRequest();
    }
    this.orderListRequest.stateId = this.stateId;
    this.orderListRequest.cityId = this.cityId;
    this.orderListRequest.pincode = this.pincode;
    this.orderListRequest.skip = 0;
    this.searchCancellationList();
  }

  getCancelOrderListByUser() {
    this.orderListRequest = new OrderListRequest;
    this.orderListRequest.skip = this.scrollPos;
    this.orderListRequest.empId = this.empId;
    this.searchCancellationList();
  }

  onButtonClicked(orderHisRemark: OrderHistoryRemark): void {
    this.orderHistoryRemark = orderHisRemark;
    console.log("OrderHistoryRemark:: " + JSON.stringify(this.orderHistoryRemark));
    (<any>$)("#modal-2").modal("show");
  }

  onHyperLinkClicked(orderHisRemark: OrderHistoryRemark): void {
    (<any>$)("#modal-1").modal("show");
    this.orderId_Hyper = orderHisRemark.orderId;
    this.customerDetails_Hyper = (orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.title ? orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.title + ". " : '') + orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.fName + " " + (orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.lName ? orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.lName : '') + "," + orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.contactInfo.mobile + "," + orderHisRemark.slotBookingDetailsList[0].patientProfileDetails.contactInfo.email;
    this.pocs_Hyper = (orderHisRemark.slotBookingDetailsList[0].pocDetails != undefined ? orderHisRemark.slotBookingDetailsList[0].pocDetails.pocName : "") + " " + (orderHisRemark.slotBookingDetailsList[0].pocDetails != undefined ? (orderHisRemark.slotBookingDetailsList[0].pocDetails.address != undefined ? orderHisRemark.slotBookingDetailsList[0].pocDetails.address.address1 : "") : "") + " " + (orderHisRemark.slotBookingDetailsList[0].pocDetails != undefined ? (orderHisRemark.slotBookingDetailsList[0].pocDetails.address != undefined ? orderHisRemark.slotBookingDetailsList[0].pocDetails.address.address2 : "") : "") + " " + (orderHisRemark.slotBookingDetailsList[0].pocDetails != undefined ? (orderHisRemark.slotBookingDetailsList[0].pocDetails.address != undefined ? orderHisRemark.slotBookingDetailsList[0].pocDetails.address.cityName : "") : "");
    this.docName_Hyper = (orderHisRemark.slotBookingDetailsList[0].doctorDetail.title != undefined ? orderHisRemark.slotBookingDetailsList[0].doctorDetail.title : "") + " " + (orderHisRemark.slotBookingDetailsList[0].doctorDetail.firstName != undefined ? orderHisRemark.slotBookingDetailsList[0].doctorDetail.firstName : "") + " " + (orderHisRemark.slotBookingDetailsList[0].doctorDetail.lastName != undefined ? orderHisRemark.slotBookingDetailsList[0].doctorDetail.lastName : "");
    //  console.log("dateeee"+this.orderHistoryRemark.orderDate);
    //this.bookingDates_Hyper = orderHisRemark.orderDate;
    this.bookingDates_Hyper = orderHisRemark.slotBookingDetailsList[0].slotDate;
    this.slotDate_Hyper = orderHisRemark.slotBookingDetailsList[0].slotDate;
    this.slotTime_Hyper = orderHisRemark.slotBookingDetailsList[0].slotTime;
    if (orderHisRemark.slotBookingDetailsList[0].payment.paymentStatus == 1) {
      this.payStatus_Hyper = "Paid";
    } else {
      this.payStatus_Hyper = "Unpaid";
    }
    if (orderHisRemark.slotBookingDetailsList[0].payment.transactionType == Payment.PAYMENT_TYPE_CARD) {
      this.payType_Hyper = "Card";
    } else if (orderHisRemark.slotBookingDetailsList[0].payment.transactionType == Payment.PAYMENT_TYPE_CASH) {
      this.payType_Hyper = "Cash";
    } else if (orderHisRemark.slotBookingDetailsList[0].payment.transactionType == Payment.PAYMENT_TYPE_ONLINE
      || orderHisRemark.slotBookingDetailsList[0].payment.transactionType == Payment.PAYMENT_TYPE_MOBILE) {
      this.payType_Hyper = "Online";
    }
    console.log("OrderHistoryRemark in onHyperLinkClicked:: " + JSON.stringify(orderHisRemark));
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "orderidlink") { // event in cloumn object event {....., event:"editButton"  }
      this.onHyperLinkClicked(e.val);
    } else if (e.event == "markaddressedbutton") { // event in cloumn object event {....., event:"manageButton"  }
      this.onButtonClicked(e.val);
    }
  }

  onPage(page: number): void {
    this.scrollPos = this.total + 1;
    this.getCancelOrderListByUser();
  }

  onSearchChange(search: string) {
    (<any>$)("#searchBox").val(this.emptyString);
    this.isCorrectMobile = false;
    if (this.orderListRequest != undefined) {
      this.orderListRequest.orderId = this.orderListRequest.mobileNumber = this.emptyString;
    }
    this.searchString = search;
  }

  getRefreshedorderList(): void {
    $('#search').val('');
    (<any>$)("#searchBox").val(this.emptyString);
    (<any>$)("#checkOrderId").prop("checked", true);
    this.searchString = 'orderId';
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.indexForCity = 0;
    this.indexForLoc = 0;
    this.indexForState = 0;
    this.pincode = null;
    this.stateId = 0;
    this.cityId = 0;
    this.scrollPos = 0;
    this.isCorrectMobile = false;
    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.orderHistoryRemarkList = new Array<OrderHistoryRemark>();
    this.getCancelOrderListByUser();
  }

  onRemarkSubmit(remark: string) {
    let orderRemark: OrderHistoryRemark = new OrderHistoryRemark();
    orderRemark.orderId = this.orderHistoryRemark.orderId;
    orderRemark.invoiceId = this.orderHistoryRemark.slotBookingDetailsList[0].invoiceId;
    orderRemark.empId = this.authService.userAuth.employeeId;
    this.orderHistoryRemark.employee = new Employee();
    // orderRemark.employee = new Employee();
    //  orderRemark.employee.firstName = this.authService.userAuth.employeeName;
    this.orderHistoryRemark.employee.firstName = this.authService.userAuth.employeeName;
    orderRemark.remarkStatus = this.orderHistoryRemark.remarkStatus = OrderHistoryRemark.REMARK_TAKEN;
    orderRemark.remark = this.orderHistoryRemark.remark = remark;
    this.adminService.getRemarkSubmit(orderRemark).then(data => {
      if (data.statusCode == 201 || data.statusCode == 200) {
        console.log('success-------------')
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = data.statusMessage;
        this.isError = false;
        this.showMessage = true;
        this.gotoCancellationlist();
      }
      else {
        console.log('fails-------------')
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = data.statusMessage;
        this.isError = true;
        this.showMessage = true;
      }
    });
    (<any>$)("#remarkArea").val(this.emptyString);
  }

  gotoCancellationlist() {
    (<any>$)("#modal-2").modal("hide");
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getCancellationListBasedOnPhnNoOrId();
    }
  }

  getCancellationListBasedOnPhnNoOrId(str: string = ''): void {
    str = $('#search').val().toString();
    if (isNaN(parseInt(str))) {
      this.searchString = 'orderId';
    } else {
      this.searchString = 'contactNo';
      if (str.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
    }
    this.total = 0;
    
    this.orderListRequest = new OrderListRequest;
    this.orderListRequest.empId = this.empId;
    this.orderListRequest.limit = 50;
    this.orderListRequest.skip = 0;
    let searchStr = str.trim();
    console.log("SearchString length::" + searchStr.length);
    if (str.length == 0 || !searchStr) {
      console.log("enter in return loop");
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter OrderId or Mobile No. for searching";
      // 'Entered value is not valid. Please check and try again.';
      this.showMessage = true;
      return;
    }
    if (this.searchString == 'orderId') {
      this.orderListRequest.orderId = searchStr;
    } else if (this.searchString == 'contactNo') {
      if (searchStr.length < 10 || searchStr.length > 10) {

        this.isCorrectMobile = true;
        this.isError = false;
        this.errorMessage = new Array();

        return;
      }
      // else if (this.searchString == 'contactNo') {
      //   var code, i;

      //   for (i = 0; i < searchStr.length; i++) {
      //     code = searchStr.charCodeAt(i);
      //     if (!(code >= 48 && code <= 57)) {
      //       this.errorMessage = new Array();
      //       //this.errorMessage[0]='Please enter valid mobile number';
      //       this.isError = true;
      //     }
      //   }
      // }
      else {
        this.orderHistoryRemarkList = new Array<OrderHistoryRemark>();
        this.orderListRequest.mobileNumber = searchStr;
        this.isCorrectMobile = false;
      }
    }
    this.orderListRequest.stateId = this.stateId;
    this.orderListRequest.cityId = this.cityId;
    this.orderListRequest.pincode = this.pincode;
    this.orderListRequest.brandId = Config.portal.appId;
    this.orderHistoryRemarkList = new Array<OrderHistoryRemark>();
    this.searchCancellationList();
  }

  searchCancellationList() {
    
     if (this.orderHistoryRemarkList == undefined || this.orderHistoryRemarkList == null) {
      this.orderHistoryRemarkList = new Array();
    }
    this.spinnerService.start();
    this.adminService.getCancelOrderListByUser(this.orderListRequest).then(orderHisRemarkList => {
      this.spinnerService.stop();
      this.orderHistoryRemarkList.push.apply(this.orderHistoryRemarkList, orderHisRemarkList);
      if (this.orderHistoryRemarkList.length == 0) {
        this.orderHistoryRemarkList = new Array<OrderHistoryRemark>();
        this.total = this.orderHistoryRemarkList.length;
        this.isError = true;
        this.errorMessage = new Array();
        if (this.orderListRequest.orderId != undefined) {
          this.errorMessage[0] = "OrderId is not Found...!!!";
        } else if (this.orderListRequest.mobileNumber != undefined) {
          this.errorMessage[0] = "Mobile number is not registered...!!!";
        } else {
          this.errorMessage[0] = "No data is there...!!!";
        }
        this.showMessage = true;
      } else {
        this.total = this.orderHistoryRemarkList.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      }
    });
  }

}
