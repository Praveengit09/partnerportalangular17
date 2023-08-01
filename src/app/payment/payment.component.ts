import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from '../app.config';
import { Router } from '@angular/router';
import { AuthService } from "../auth/auth.service";
import { PaymentDeskRequest } from "./../model/payment/paymentDeskRequest";
import { PaymentService } from "./payment.service";
import { Location } from '@angular/common';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { RoleConstants } from './../constants/auth/roleconstants';
import { BasketRequest } from '../model/basket/basketRequest';
import { SearchPipe } from '../layout/pipes/search.pipe';
import { ToasterService } from '../layout/toaster/toaster.service';

@Component({
  selector: 'payment',
  templateUrl: './payment.template.html',
  styleUrls: ['./payment.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class PaymentComponent {
  config: any;
  month: any;
  year: any;
  paymentDeskRequest: PaymentDeskRequest = new PaymentDeskRequest();
  paymentDeskList: BasketRequest[] = new Array<BasketRequest>();
  waitTimeinTimestamp: any;
  searchCondition: number;
  isError: boolean;
  dataMsg: string = ' ';
  showMessage: boolean;
  errorMessage: Array<string>;
  searchList = new Array();
  searchQuery: any;
  pdfHeaderType: number;
  date: Date = new Date();
  empId: any;
  BookingPatients = new Array();
  total: number = 0;
  searchPipe: SearchPipe;
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Patient Name',
      variable: 'slotBookingDetailsList[0].patientProfileDetails.title slotBookingDetailsList[0].patientProfileDetails.fName slotBookingDetailsList[0].patientProfileDetails.lName cartItemList[0].patientProfileDetails.title cartItemList[0].patientProfileDetails.fName cartItemList[0].patientProfileDetails.lName',
      filter: 'nametitle',
      sort: true
    },
    {
      display: 'Type',
      variable: 'Type',
      filter: 'text',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'slotBookingDetailsList[0].patientProfileDetails.contactInfo.mobile cartItemList[0].patientProfileDetails.contactInfo.mobile',
      filter: 'text',
      sort: false
    },
    {
      display: 'Doctor',
      variable: 'slotBookingDetailsList[0].doctorDetail.firstName slotBookingDetailsList[0].doctorDetail.lastName cartItemList[0].doctorDetail.firstName cartItemList[0].doctorDetail.lastName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Amount',
      variable: 'totalFinalAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      variable: 'paymentStatus',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Pending'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Paid'
        },
        {
          condition: 'default',
          label: 'Pending'
        }
      ]
    },
    {
      display: 'Action',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Pay Now',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          condition: 'default',
          label: 'Completed',
          style: 'width-100 disabled',
        }
      ]
    },
    {
      display: 'Receipt',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: 'paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        }
      ]
    }
  ];

  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
  };

  constructor(config: AppConfig, private router: Router, private auth: AuthService,
    private location: Location, private toast: ToasterService,
    private paymentservice: PaymentService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.searchCondition = 1;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.empId = auth.userAuth.employeeId;
  }

  proceedPayment(paymentObject) {
    console.log("payment" + JSON.stringify(paymentObject));
    if (paymentObject.paymentStatus == 0) {
      if (paymentObject != undefined && paymentObject != null
        && paymentObject.cartItemList != undefined && paymentObject.cartItemList != null
        && paymentObject.cartItemList.length > 0) {
        paymentObject.cartItemList[0].empId = this.empId;
      } else if (paymentObject != undefined && paymentObject != null
        && paymentObject.slotBookingDetailsList != undefined && paymentObject.slotBookingDetailsList != null
        && paymentObject.slotBookingDetailsList.length > 0) {
        paymentObject.slotBookingDetailsList[0].empId = this.empId;
      }
      this.paymentservice.getPaymentDetailOfProfile(paymentObject);
      this.router.navigate(['/app/payment/invoice']);
    }
  }

  ngOnInit() {
    this.getPaymentList();
  }

  getPaymentList() {
    $('#search').val('');
    this.searchCondition = 1;
    (<any>$("#doctor")).prop('checked', true);
    this.paymentDeskList = new Array();
    this.searchQuery = "";
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.paymentDeskRequest.pocId = this.auth.userAuth.pocId;
    this.paymentDeskRequest.empId = this.auth.userAuth.employeeId;
    this.paymentDeskRequest.roleId = RoleConstants.cashierRoleId;
    this.paymentDeskRequest.digiQueue = true;
    this.paymentDeskRequest.doctorId = 0;
    var d = this.date;
    this.paymentDeskRequest.date = d.setHours(0, 0, 0, 0);
    this.dataMsg = 'Loading';
    console.log(this.paymentDeskRequest.pocId + "calling payment list" + this.paymentDeskRequest.empId + " " + this.paymentDeskRequest.date);
    this.spinnerService.start();
    this.paymentservice.getPaymentDeskList(this.paymentDeskRequest).then(paymentDeskList => {
      this.spinnerService.stop();
      if (paymentDeskList.length > 0) {
        this.paymentDeskList = paymentDeskList;
        this.total = this.paymentDeskList.length;
      }
      else {
        this.dataMsg = 'No Data Found';
      }



      for (let i = 0; i < this.paymentDeskList.length; i++) {
        if (this.paymentDeskList[i].slotBookingDetailsList && this.paymentDeskList[i].slotBookingDetailsList.length > 0) {
          this.paymentDeskList[i].paymentStatus = this.paymentDeskList[i].slotBookingDetailsList[0].payment.paymentStatus;
          this.paymentDeskList[i].Type = "Consultation";
        }
        if (this.paymentDeskList[i].cartItemList && this.paymentDeskList[i].cartItemList.length > 0) {
          this.paymentDeskList[i].paymentStatus = this.paymentDeskList[i].cartItemList[0].payment.paymentStatus;
          this.paymentDeskList[i].Type = "HS Package";
        }
      }
    });
  }

  doctorNameSearch() {
    this.searchCondition = 1;
  }
  mobileNumberSearch() {
    this.searchCondition = 2;
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") {
      this.proceedPayment(e.val);
    }
    else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }

  onImageClicked(event) {
    console.log("event" + JSON.stringify(event));
    let pdfUrl = '';
    if (event.paymentStatus == 1) {
      if (!event.cartItemList || event.cartItemList.length <= 0) {
        if (this.pdfHeaderType == 0) {

          pdfUrl = event.slotBookingDetailsList[0].pdfUrlWithHeader;
        }
        else {
          pdfUrl = event.slotBookingDetailsList[0].pdfUrlWithoutHeader;
        }
      } else {
        if (this.pdfHeaderType == 0) {
          pdfUrl = event.cartItemList[0].pdfUrlWithHeader
        }
        else {
          pdfUrl = event.cartItemList[0].pdfUrlWithoutHeader;
        }
      }
      this.spinnerService.start();
      this.auth.getTempUrl(pdfUrl).then((url) => {
        this.spinnerService.stop();
        if ((url.statusCode == 201 || url.statusCode == 200)) {
          this.auth.openPDF(url.data);
        } else {
          this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
        }
      }).catch((err) => {
        this.spinnerService.stop();
        this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
      })
    }
  }




}
