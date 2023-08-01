import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { AuthService } from './../../../auth/auth.service';
import { CommonUtil } from './../../../base/util/common-util';
import { DoctorService } from './../../../doctor/doctor.service';
import { ToasterService } from './../../../layout/toaster/toaster.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { CentralOrderInteraction, ConsumerInteractionHistory } from './../../../model/common/centralorderinteraction';
import { ProfileOrderHistory } from './../../../model/report/profileorderhistory';
import { SummaryTransactions } from './../../../model/report/summarytransactions';
import { AdminService } from './../../admin.service';
import { Config } from './../../../base/config';


@Component({
  selector: 'orderhistory',
  templateUrl: './orderhistory.template.html',
  styleUrls: ['./orderhistory.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderHistoryComponent implements OnInit, OnDestroy {

  startDate: Date = null;
  endDate: Date = null;

  mobileNo: string = '';
  fromdate: number = 0;
  todate: number = 0;
  from: number = 0;
  size: number = 50;
  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  revenueResponse: SummaryTransactions = null;
  ordersResponse: Array<BasketRequest> = new Array<BasketRequest>();
  orderList: Array<ProfileOrderHistory> = new Array<ProfileOrderHistory>();
  btncheckout: boolean = false;
  selectedProfileId: number = 0;
  profileId: number = 0;
  selectedProfile: any;
  formattedDataString: string = '';
  remark: string = '';
  orderId: string = '';
  dataMsg: string = '';
  perPage: number = 10;
  total: number = 0;
  noteResponse: Array<ConsumerInteractionHistory> = new Array<ConsumerInteractionHistory>();
  routedOrder: boolean = false;
  diagnoticColumn: boolean = false;

  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Order Type',
      variable: 'orderType',
      filter: 'text',
      sort: false
    },
    {
      display: 'Customer Details',
      variable: 'patientName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Doctor Details',
      variable: 'doctorName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Products - Quantity',
      variable: 'productList',
      filter: 'text',
      sort: false
    },
    {
      display: 'Booking Details',
      variable: 'slotDate',
      filter: 'date',
      sort: false
    },
    {
      display: 'Amount',
      variable: 'amount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Payment Status',
      variable: 'paymentStatus',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Not Paid'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Pending'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Failed'
        }
      ]
    },
    {
      display: 'Order Status',
      filter: 'text',
      sort: false,
      variable: 'invoiceCompletionStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Cancelled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Cancelled'
        },
        {
          value: '5',
          condition: 'eq',
          label: 'Completed'
        },
        {
          condition: 'default',
          label: 'In Progress'
        }
      ]
    }
  ]

  constructor(private adminService: AdminService, private auth: AuthService, private spinnerService: SpinnerService, private doctorService: DoctorService, private toast: ToasterService,
    private commonUtil: CommonUtil, private location: Location) {
    this.startDate = new Date((new Date()).valueOf() - 86400000 * 30);
    this.endDate = new Date();
    this.selectedProfileId = this.adminService.selectedProfileId;

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableDiagnosticProfileSearch) {
      this.diagnoticColumn = true;
      this.columns.splice(5, 0, {
        display: 'Tests Included',
        variable: 'serviceList',
        filter: 'text',
        sort: false
      });
    }
    if (this.selectedProfileId != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('selectedProfileId', cryptoUtil.encryptData(JSON.stringify(this.selectedProfileId)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('selectedProfileId') != null) {
        this.selectedProfileId = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedProfileId')));
      } else {
        this.selectedProfileId = 0;
      }
    }
  }

  ngOnInit(): void {
    if (this.selectedProfileId > 0) {
      this.routedOrder = true;
      this.getOrdersPerDate();
      this.getDetailsBasedOnProfileId();
      this.profileId = this.selectedProfileId;
      this.getNotes();
    }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13)
      this.getOrdersPerDate();
  }

  getOrders() {
    if (!this.selectedProfileId || this.selectedProfileId == 0) {
      this.mobileNo = $('#search').val().toString();
      if (this.mobileNo.length < 10 || this.mobileNo.length > 10) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Please Enter valid 10 digit mobile number";
        return;
      }
      else {
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
      }
      this.getDetailsBasedOnMobileNo();
    }

    this.orderList = new Array<ProfileOrderHistory>();
    this.revenueResponse = new SummaryTransactions();
    this.ordersResponse = new Array<BasketRequest>();
    this.btncheckout = false;
    this.profileId = 0;
    this.from = 0;
    this.total = 0;
    this.orderId = '';
    this.getRevenue();
    this.getOrderHistory();
  }

  getRevenue() {
    this.adminService.getOrderHistoryRevenues(this.mobileNo, this.fromdate, this.todate, this.selectedProfileId).then(response => {
      this.revenueResponse = response;
      console.log("response--->", JSON.stringify(response))
    });

  }

  getOrderHistory() {
    this.spinnerService.start();
    this.adminService.getOrderHistory(this.mobileNo, this.fromdate, this.todate, this.from, this.size, this.selectedProfileId).then(response => {
      this.ordersResponse = response;
      this.spinnerService.stop();
      if (this.ordersResponse != null && this.ordersResponse != undefined && this.ordersResponse.length) {
        this.ordersResponse.forEach(order => {
          let temp = new ProfileOrderHistory();
          if (order.slotBookingDetailsList != null && order.slotBookingDetailsList != undefined && order.slotBookingDetailsList.length > 0) {
            order.slotBookingDetailsList.forEach(slot => {
              temp.orderId = slot.orderId;
              temp.paymentStatus = slot.payment ? slot.payment.paymentStatus : 0;
              temp.doctorName = slot.doctorDetail.title + '' + (slot.doctorDetail.firstName ? slot.doctorDetail.firstName : '') + ' ' + (slot.doctorDetail.lastName ? slot.doctorDetail.lastName : '');
              temp.amount = slot.payment ? slot.payment.finalAmount : 0;
              temp.patientName = (slot.patientProfileDetails.title ? slot.patientProfileDetails.title : '') + ' ' + (slot.patientProfileDetails.fName ? slot.patientProfileDetails.fName : '') + ' ' + (slot.patientProfileDetails.lName ? slot.patientProfileDetails.lName : '');
              if (slot.serviceList.length) {
                temp.doctorName = !slot.doctorDetail.firstName && !slot.doctorDetail.lastName ? 'Self' : '';
                temp.orderType = slot.bookingSubType ? 'Home Collection' : 'Walk-in Diagnostics';
                temp.slotDate = slot.createdTimestamp;
                temp.invoiceCompletionStatus = (slot.cancellationStatus != 0 && slot.invoiceCompletionStatus != 5) ? 3 : (slot.cancellationStatus > 0) ? 1 : 3;
                let service = '';
                for (var i = 0; i < slot.serviceList.length; i++) {
                  service += "" + slot.serviceList[i].serviceName;
                  if (i != slot.serviceList.length - 1)
                    service += ", \n "
                }
                temp.serviceList = service;
              }
              else {
                temp.orderType = "Doctor Consultation"
                temp.slotDate = slot.slotDate;
                temp.invoiceCompletionStatus = slot.invoiceCompletionStatus;
                if (slot.cancellationStatus == 1 || slot.cancellationStatus == 2)
                  temp.invoiceCompletionStatus = slot.cancellationStatus;
              }
            })
          }

          if (order.cartItemList != null && order.cartItemList != undefined && order.cartItemList.length > 0) {
            order.cartItemList.forEach(slot => {
              temp.orderId = slot.orderId;
              temp.orderType = "Products";
              temp.doctorName = (slot.doctorDetail.title ? slot.doctorDetail.title : '') + ' ' + (slot.doctorDetail.firstName ? slot.doctorDetail.firstName : '') + ' ' + (slot.doctorDetail.lastName ? slot.doctorDetail.lastName : '');
              temp.slotDate = slot.orderPlacedTimestamp;
              let products = '';
              for (var i = 0; i < slot.productList.length; i++) {
                products += "" + slot.productList[i].productName + " - " + slot.productList[i].quantity
                if (i != slot.productList.length - 1)
                  products += ", \n "
              }
              temp.productList = products;
              temp.invoiceCompletionStatus = slot.invoiceCompletionStatus;
              if (slot.cancellationStatus == 1 || slot.cancellationStatus == 2)
                temp.invoiceCompletionStatus = slot.cancellationStatus;
              temp.paymentStatus = slot.payment.paymentStatus;
              temp.amount = slot.payment.finalAmount;
              temp.patientName = (slot.patientProfileDetails.title ? slot.patientProfileDetails.title : '') + ' ' + slot.patientProfileDetails.fName + ' ' + (slot.patientProfileDetails.lName ? slot.patientProfileDetails.lName : '');
            })
          }
          if (temp.invoiceCompletionStatus)
            this.orderList.push(temp);
        })
        this.orderList.sort(function (a, b) {
          if (a.slotDate > b.slotDate) return -1;
          if (a.slotDate < b.slotDate) return 1;
          return 0;
        });

        if (this.orderList.length > 0) {
          this.orderId = this.orderList[0].orderId;
          this.total = this.orderList.length;
        }
        else {
          this.dataMsg = 'No Data Found';
          this.total = 0;
        }
      }
    })
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

  startDateChoosen($event): void {
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
      this.startDate.getDate(), 0, 0, 0)
    this.getOrdersPerDate();
  }

  endDateChoosen(event) {
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(),
      this.endDate.getDate(), 0, 0, 0);
    this.getOrdersPerDate();
  }

  getOrdersPerDate() {
    if (this.startDate == null || this.endDate == null)
      return;
    if (this.startDate > this.endDate) {
      this.errorMessage = new Array();
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "End date must be greater than start date";
      return;
    }
    else
      this.reset();
    this.fromdate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
    this.todate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
    this.getOrders();
  }

  ngOnDestroy(): void {
    this.adminService.selectedProfileId = 0;
    this.adminService.selectedProfile = '';
    window.localStorage.removeItem('selectedProfileId');
  }

  onGenerateBack() {
    this.location.back();
  }


  onUpdateNote() {

    if (this.remark.length == 0) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "please enter remarks";
      return;
    }
    else {
      this.isError = false;
      this.showMessage = false;
      this.errorMessage = new Array();
    }

    let reqbody = new CentralOrderInteraction();
    reqbody.profileId = this.profileId;
    reqbody.consumerInteractionHistory = new Array<ConsumerInteractionHistory>();

    let data = new ConsumerInteractionHistory();
    data.consumerInteractedEmpId = this.auth.userAuth.employeeId;
    data.consumerInteractedEmployeeName = this.auth.userAuth.employeeName;
    data.consumerInteractionDate = this.commonUtil.convertCurrentDateToTimeStamp(new Date());
    data.consumerInteractedComments = this.remark;
    reqbody.consumerInteractionHistory.push(data);

    this.spinnerService.start();
    this.adminService.updateOrderHistoryNotes(reqbody).then(response => {
      this.spinnerService.stop();
      $("#updatenote").hide();
      $('.modal-backdrop').remove();
      if (response.statusCode == 200 || response.statusCode == 201)
        alert("Remarks updated");
      else
        alert(response.statusMessage);
      this.remark = '';
      this.getNotes();
    });
  }

  getNotes() {
    this.noteResponse = new Array<ConsumerInteractionHistory>();
    this.adminService.getOrderHistoryNotes(this.profileId).then(response => {
      this.noteResponse = response;
      this.formattedDataString = "";
      this.noteResponse.forEach(response => {
        this.formattedDataString = this.formattedDataString + this.getFormattedConsumerInteractionData(response);
      })
    });
  }

  getFormattedConsumerInteractionData(item) {
    let tempString = "";
    let name = item.consumerInteractedEmployeeName ? ('<b>Name: </b>' + item.consumerInteractedEmployeeName) : '';
    let date = item.consumerInteractionDate ? ('<b>Date: </b>' + this.commonUtil.convertTimeStampToDate(item.consumerInteractionDate)) : '';
    let comments = item.consumerInteractedComments ? ('<b>Comments: </b>' + item.consumerInteractedComments) : '';
    tempString = name + "<br>" + date + "<br>" + comments + "<br>" + "<br>";
    return tempString;
  }

  reset() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
  }

  callUser() {
    this.doctorService.placeClickCallRequest(this.selectedProfileId, this.auth.userAuth.employeeId, this.orderId).then(resp => {
      if (resp && (resp.statusCode == 200 || resp.statusCode == 201)) {
        this.toast.show(resp.statusMessage, "bg-success text-white font-weight-bold", 2000);
      } else {
        this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch(err => {
      this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
    });
  }

  getDetailsBasedOnMobileNo() {
    this.selectedProfile = '';
    this.adminService.getRegisteredUser(this.mobileNo).then(response => {
      if (response.length > 0) {
        this.selectedProfile = response[0];
        this.profileId = this.selectedProfile.profileId;
        this.getNotes();
      }
    });
  }

  getDetailsBasedOnProfileId() {
    this.adminService.getPHRForProfileId(this.selectedProfileId).then(response => {
      this.selectedProfile = response;
    });
  }

  onPage(page: number) {
    if (this.total < 50 || (+this.total % 50) > 0) {
      return;
    }
    this.from = this.total;
    this.getOrderHistory();
  }

}
