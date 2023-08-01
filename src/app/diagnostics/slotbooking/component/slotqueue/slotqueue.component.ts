import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DiagnosticAdminRequest } from '../../../..//model/diagnostics/diagnosticAdminRequest';
import { AppConfig } from '../../../../app.config';
import { Config } from '../../../../base/config';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { DiagnosticDeliveryAdviceTrack } from '../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from '../../../diagnostics.service';

@Component({
  selector: 'slot-queue',
  templateUrl: './slotqueue.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./slotqueue.style.scss']
})

export class SlotQueueComponent implements OnDestroy, OnInit {

  config: any;
  month: any;
  year: any;
  errorMessage: Array<string>;
  perPage: number = 10;
  total: number = 0;
  slotBookingDetails: any[] = new Array<SlotBookingDetails>();
  adviceDetails: DiagnosticDeliveryAdviceTrack;
  isError: boolean;
  showMessage: boolean;
  dataMsg: string = ' ';
  autoRefreshChange: boolean = false;
  refreshSubscription: Subscription;
  refreshTime: number;
  unsubscribe: number;
  refreshIndex: number = 0;
  isVdc: boolean = false;

  searchCriteria: number = 1;

  pocId: number;
  search: any;

  date: any = 0;
  diagnosticAdminRequest: DiagnosticAdminRequest;
  empId: number;

  pdfHeaderType: number;
  startDate: Date = new Date();
  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  /* defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria.";
  defaultMsgForWrongPhoneNumber: string = "Entered phone number is not valid. Please try valid phone number.";
  defaultMsgForSearchTerm: string = "Entered value is not valid. Please check and try again."; */


  columns: any[] = [
    {
      display: 'ORDER ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Invoice Id',
      variable: 'baseInvoiceId',
      filter: 'text',
      sort: false
    },
    {
      display: 'PATIENT INFORMATION',
      variable:
        `patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName, \n 
      patientProfileDetails.gender, \n
      age,\n 
      patientProfileDetails.contactInfo.mobile`,
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Slot Date',
      variable: 'pickupDate',
      filter: 'date',
      sort: true
    },
    {
      display: 'TEST INFORMATION',
      variable: 'serviceList',
      displayVariable: 'serviceName',
      breakFill: ', ',
      filter: 'array-to-string',
      sort: false
    },
    {
      display: 'PAYMENT STATUS',
      // style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      // filter: 'action',
      // event: 'paymentStatusButton',
      sort: false,
      variable: 'payment.paymentStatus',
      filter: 'text',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Not Paid',
          // style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Paid',
          // style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Pending',
          // style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          condition: 'default',
          label: 'Not Paid',
          // style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        }
      ]
    },
    {
      display: 'Action',
      label: 'MARK COLLECTEED',
      style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'markCollectedButton',
      sort: false,
      variable: 'sampleCollectionStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'MARK AS DELIVERED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'MODIFIED',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'REJECTED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '9',
          condition: 'eq',
          label: 'DELIVERED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          condition: 'default',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'pickupDate',
    descending: true
  };

  constructor(config: AppConfig,
    private diagnosticsService: DiagnosticsService,
    private auth: AuthService, private router: Router,
    private spinnerService: SpinnerService, private common: CommonUtil = new CommonUtil()) {
    this.config = config.getConfig();
    this.pocId = auth.userAuth.pocId;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.empId = this.auth.userAuth.employeeId;
    // this.commonUtil = common;
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.lisIntegrated) {
      this.isVdc = true;
      this.columns.splice(5, 0, {
        display: 'Lab ID',
        variable: 'referenceId',
        filter: 'text',
        sort: false
      });
      this.columns.splice(4, 0, {
        display: 'Slot Time',
        variable: 'slotDurationLable',
        filter: 'text',
        sort: true
      });
    }
    else {
      this.columns.splice(8, 0, {
        display: 'Receipt',
        label: 'assets/img/partner/pdf_icon_read.png',
        filter: 'action',
        type: 'image',
        event: 'pdfButton',
        sort: false,
        variable: 'payment.paymentStatus',
        conditions: [
          {
            value: '0',
            condition: 'lte',
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

      });
      this.columns.splice(4, 0, {
        display: 'Slot Time',
        variable: 'pickupTime',
        filter: 'time',
        sort: true
      });

      this.columns.splice(9, 0, {
        display: 'Action By',
        variable: 'empFirstName empLastName',
        filter: 'text',
        sort: true
      });
      this.columns.splice(10, 0, {
        display: 'CANCEL',
        filter: 'action',
        type: 'button',
        event: 'cancelButton',
        sort: false,
        variable: 'enableCancel',
        conditions: [
          {
            value: '1',
            condition: 'eq',
            label: 'Cancel',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
          },
          {
            value: '2',
            condition: 'eq',
            label: 'Cancelled',
            style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
          },
          {
            condition: 'default',
            label: 'Cancel',
            style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
          }
        ]
      });
    }
  }

  ngOnInit(): void {
    this.getAppoinmentDataByDate();
  }

  startDateChoosen($event): void {
    this.startDate = $event;
    this.total = 0;
    this.slotBookingDetails = new Array<SlotBookingDetails>();
    this.getAppoinmentDataByDate();
  }

  convertingTimeDuration(value: number) {

    let date = new Date(parseInt("" + value));
    let hr: string = "" + date.getHours();
    let amPm = "AM"
    if (+hr >= 12) {
      amPm = "PM";
      hr = '' + ((+hr) - 12);
    }
    if (hr.length == 1) {
      hr = "0" + hr;
      hr == "00" ? hr = "12" : "";
    }
    let min: string = "" + date.getMinutes();
    if (min.length == 1) {
      min = "0" + min;
    }
    console.log(hr + ":" + min + " " + amPm);
    let time = hr + ":" + min + " " + amPm;

    let sec = value + (3600000 * 4);
    let durationDate = new Date(parseInt("" + sec));
    let hr1: string = "" + durationDate.getHours();
    let amPm1 = "AM"
    if (+hr1 >= 12) {
      amPm1 = "PM";
      hr1 = '' + ((+hr1) - 12);
    }
    if (hr1.length == 1) {
      hr1 = "0" + hr1;
      hr1 == "00" ? hr1 = "12" : "";
    }
    let min1: string = "" + durationDate.getMinutes();
    if (min1.length == 1) {
      min1 = "0" + min1;
    }
    console.log(hr1 + ":" + min1 + " " + amPm1);
    let time1 = hr1 + ":" + min1 + " " + amPm1;

    let timeWithDuration = time + " - " + time1;
    return timeWithDuration;
  }

  getAppoinmentDataByDate(): void {
    this.dataMsg = 'Loading....';
    this.spinnerService.start();
    this.diagnosticAdminRequest = new DiagnosticAdminRequest();
    this.diagnosticAdminRequest.fromIndex = this.total;
    this.diagnosticAdminRequest.pocIdList.push(this.pocId);
    this.diagnosticAdminRequest.empId = this.empId;
    console.log(this.startDate);

    this.diagnosticAdminRequest.date = this.common.convertDateToTimestamp(this.startDate);
    console.log(this.diagnosticAdminRequest.date);

    this.diagnosticAdminRequest.pageSize = 50;
    this.diagnosticAdminRequest.employeeRequest = DiagnosticAdminRequest.APPOINTMENTS;
    this.diagnosticsService.getDiagnosticListForAdmin(this.diagnosticAdminRequest).then(appointmentInfo => {
      /* this.diagnosticsService.getAppoinmentDetails(this.pocId, this.common.convertDateToTimestamp(this.startDate), this.total, 50, 
      '', '').then(appointmentInfo => { */
      this.spinnerService.stop();
      console.log("appointmentInfo: " + JSON.stringify(appointmentInfo));
      if (this.isVdc) {
        for (let i = 0; i < appointmentInfo.length; i++) {
          appointmentInfo[i].slotDurationLable = this.convertingTimeDuration(appointmentInfo[i].pickupTime)
        }
      }
      if (this.total > 0) {
        this.slotBookingDetails.push.apply(this.slotBookingDetails, appointmentInfo);
      }
      else {
        this.slotBookingDetails = appointmentInfo;
      }

      this.total = this.slotBookingDetails.length;
      if (this.slotBookingDetails.length > 0) {
        console.log('totalcheck==> ' + this.total + '==>list ' + JSON.stringify(this.slotBookingDetails));

        for (let i = 0; i < this.slotBookingDetails.length; i++) {
          console.log(this.slotBookingDetails[i].slotDurationLable);

          if (this.isVdc) {
            if (this.slotBookingDetails[i].referenceId == null || this.slotBookingDetails[i].referenceId == undefined || this.slotBookingDetails[i].referenceId.length <= 0) {
              this.slotBookingDetails[i].referenceId = "Not placed in LIS";
            }
          }
          if (this.slotBookingDetails[i].cancellationStatus == 0 && this.slotBookingDetails[i].invoiceCompletionStatus == 1)
            this.slotBookingDetails[i].diagnosticSlotStatus = 0;
          else if (this.slotBookingDetails[i].cancellationStatus == 1 || this.slotBookingDetails[i].cancellationStatus == 2)
            this.slotBookingDetails[i].diagnosticSlotStatus = 1;

          if (this.slotBookingDetails[i].patientProfileDetails)
            this.slotBookingDetails[i].age = this.common.getAgeForall(this.slotBookingDetails[i].patientProfileDetails.dob);
          else console.log(i + ' is invalid dob')

        }

      }
      else {
        this.dataMsg = 'No Data Found';
      }



      if (this.search) {
        if (this.slotBookingDetails.length == 0) {
          this.slotBookingDetails = new Array<SlotBookingDetails>();
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = this.dataMsg = 'No Data Found';
          this.showMessage = true;
        } else {
          this.isError = false;
          this.errorMessage = undefined;
          this.showMessage = false;
        }
      }

    });
  }

  onGenerateNewAppointment(): void {
    this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
    this.diagnosticsService.receptionPriscriptionDetails = undefined;
    this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
  }

  onSearchChange(searchIndex: number) {
    this.searchCriteria = searchIndex;
  }

  onPage(page: number): void {

    this.total = this.total + 1;
    this.getAppoinmentDataByDate();

  }

  getRefreshedorderList(search: string): void {
    console.log("getRefreshedorderListSQ");
    $('#search').val('');
    (<any>$)("#orderId").prop("checked", true);
    this.searchCriteria = 1;
    this.search = search;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.total = 0;
    this.slotBookingDetails = new Array<SlotBookingDetails>();
    // if (search != undefined && search.length < 1) {
    this.getAppoinmentDataByDate();
    // }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
    }
  }

  getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(search: any = ''): void {
    search = $('#search').val().toString();
    this.diagnosticAdminRequest = new DiagnosticAdminRequest();
    if (isNaN(parseInt(search))) {
      this.searchCriteria = 1;
      this.diagnosticAdminRequest.orderId = search;
    } else {
      this.searchCriteria = 2;
      if (search.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
      this.diagnosticAdminRequest.mobile = search;
    }
    console.log("getDiagnosticAdvisesForPocBasedOnPhoneNumberOrIdSQ");
    this.search = search;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.slotBookingDetails = new Array<SlotBookingDetails>();
    this.total = 0;
    this.dataMsg = 'Loading.....';
    /* this.diagnosticsService.getAppoinmentDetails(this.pocId, this.common.convertDateToTimestamp(this.startDate), 
    this.total, 50,
      (this.searchCriteria == 1 ? search : ''), (this.searchCriteria == 2 ? search : '')) */
    this.diagnosticAdminRequest.fromIndex = this.total;
    this.diagnosticAdminRequest.pocIdList.push(this.pocId);
    this.diagnosticAdminRequest.empId = this.empId;
    this.diagnosticAdminRequest.date = this.common.convertDateToTimestamp(this.startDate);
    this.diagnosticAdminRequest.pageSize = 50;
    this.diagnosticAdminRequest.employeeRequest = DiagnosticAdminRequest.APPOINTMENTS;
    this.diagnosticsService.getDiagnosticListForAdmin(this.diagnosticAdminRequest).then(data => {
      console.log("getSearchResults");
      if (this.total > 0) {
        this.slotBookingDetails.push.apply(this.slotBookingDetails, data);
      }
      else {
        this.slotBookingDetails = data;
      }

      for (let i = 0; i < this.slotBookingDetails.length; i++) {
        if (this.slotBookingDetails[i].patientProfileDetails)
          this.slotBookingDetails[i].age = this.common.getAgeForall(this.slotBookingDetails[i].patientProfileDetails.dob);

      }
      if (this.slotBookingDetails.length > 0) {
        this.total = this.slotBookingDetails.length;
      } else if (this.slotBookingDetails.length == 0) {
        this.slotBookingDetails = new Array<SlotBookingDetails>();
        this.dataMsg = 'No Data Found';
        /* this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
        this.showMessage = true; */
      }
    });
  }

  // pageRefresh() {
  //   this.diagnosticsService.getAppoinmentDetails(this.pocId, 0, 0, 50, (this.searchCriteria == 1 ? this.search : ''), (this.searchCriteria == 2 ? this.search : ''))
  //     .then(diagnosticsAdviseList => {
  //       this.slotBookingDetails = diagnosticsAdviseList;
  //       this.total = this.slotBookingDetails.length;
  //     });
  // }

  /* paymentClick(bookingDetail: SlotBookingDetails) {
    console.log("bookingDetail: " + JSON.stringify(bookingDetail));
    this.adviceDetails = bookingDetail;
    if (bookingDetail.cancellationStatus <= 0 && bookingDetail.payment.paymentStatus != 1) {
      this.diagnosticsService.slotBookingDetails = bookingDetail;
      this.diagnosticsService.onlyPayment = true;
      this.router.navigate(['/app/diagnostics/slotbooking/slotsummary']);
    } else if (bookingDetail.cancellationStatus == 1) {
      alert('Order is cancelled. Cannot proceed to payment');
    }
  } */

  onButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
    console.log("status-->" + JSON.stringify(statusDiagnosticsAdvise));
    this.adviceDetails = statusDiagnosticsAdvise;
    if (this.isVdc) {
      this.diagnosticsService.isReception = true;
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
      this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
      return;
    }
    if (this.adviceDetails.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
      && this.adviceDetails.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED
      && this.adviceDetails.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED) {
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
      this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    } else if (this.adviceDetails.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.COLLECTED) {
      this.spinnerService.start();
      statusDiagnosticsAdvise.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.DELIVERED;
      this.diagnosticsService.updateDiagnosticAdminRemarks(statusDiagnosticsAdvise).then(data => {
        this.spinnerService.stop();
        if (data.statusCode == 200 || data.statusCode == 201) {
          alert('Status Updated Successfully');
          this.getAppoinmentDataByDate();
        } else {
          alert('Something went wrong.Please try after sometime');
        }
      })
    }
  }

  clickEventHandler(e) {
    console.log("event: " + e.event);
    /* if (e.event == "paymentStatusButton") {
      this.paymentClick(e.val);
    } */
    if (e.event == "markCollectedButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    }
    else if (e.event == 'cancelButton') {
      this.cancelAppoinment(e.val);
    } else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }

  onImageClicked(item: SlotBookingDetails): void {
    console.log("Item: ", item);
    if (item.payment.paymentStatus == 1) {
      if (this.pdfHeaderType == 0) {
        this.auth.openPDF(item.pdfUrlWithHeader)
      } else {
        this.auth.openPDF(item.pdfUrlWithoutHeader)
      }
    }

  }

  cancelAppoinment(bookingDetail: DiagnosticDeliveryAdviceTrack) {
    console.log("bookingDetail: " + JSON.stringify(bookingDetail));
    this.adviceDetails = bookingDetail;
    if (this.adviceDetails.cancellationStatus == 0 && this.adviceDetails.enableCancel == 1)
      (<any>$("#cancel_confirm")).modal("show");
  }

  cancelSlot() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.adviceDetails.cancellationStatus = 2;
    this.adviceDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.REJECTED;
    this.diagnosticsService.updateDiagnosticAdminRemarks(this.adviceDetails).then(data => {
      /* });
      this.diagnosticsService.cancelBookedSlot(this.adviceDetails.orderId, this.adviceDetails.invoiceId, 0,
        this.adviceDetails.patientProfileDetails.profileId)
        .then(data => { */
      this.spinnerService.stop();

      if (data.statusCode == 405) {
        $('#cancelError').show();
        alert(data.statusMessage);

        (<any>$("#cancel_confirm")).modal("hide");
        this.getRefreshedorderList('');
      }
      else {
        alert(data.statusMessage);
        (<any>$("#cancel_confirm")).modal("hide");

        this.getRefreshedorderList('');
      }
      setTimeout(function () {
        $('#cancelError').fadeOut();
      }, 60000);
    }).catch((err) => {
      alert('Something went wrong please try again');
      this.spinnerService.stop();
    });
  }

  ngOnDestroy(): void {
    this.diagnosticsService.orderDetailAdviceTrack = this.adviceDetails;
    this.diagnosticsService.centralAdminModify = false;
  }
}

