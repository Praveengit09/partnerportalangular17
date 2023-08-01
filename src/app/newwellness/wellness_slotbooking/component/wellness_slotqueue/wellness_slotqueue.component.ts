import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { WellnessService } from '../../../../newwellness/wellness.service';
import { WellnessSlotBookingService } from '../../wellness_slotbooking.service';
import { DiagnosticsService } from './../../../../diagnostics/diagnostics.service';




@Component({
  selector: 'wellness-slot-queue',
  templateUrl: './wellness_slotqueue.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./wellness_slotqueue.style.scss']
})

export class WellnessSlotQueueComponent implements OnDestroy, OnInit {

  config: any;
  month: any;
  year: any;
  errorMessage: Array<string>;
  perPage: number = 10;
  total: number = 0;
  slotBookingDetails: any[] = new Array<SlotBookingDetails>();
  adviceDetails: any;
  isError: boolean;
  showMessage: boolean;
  dataMsg: string = ' ';
  autoRefreshChange: boolean = false;
  refreshSubscription: Subscription;
  refreshTime: number;
  unsubscribe: number;
  refreshIndex: number = 0;
  searchCriteria: number = 1;
  pocId: number;
  search: any;
  date: any = 0;
  pdfHeaderType: number;
  userData: SlotBookingDetails;
  modalId: string = '';
  
  defaultMsgForNoMacthingRecord: string = "No records found";
  defaultMsgForWrongPhoneNumber: string = "Entered phone number is not valid. Please try valid phone number.";
  defaultMsgForSearchTerm: string = "Entered value is not valid. Please check and try again.";
  startDate: Date = new Date();
  modifieddate: number = new Date().setHours(0, 0, 0);
  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };
  columns: any[] = [
    {
      display: 'ORDER ID',
      variable: 'orderId',
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
      display: 'SLOT DATE',
      variable: 'slotDate',
      filter: 'date',
      sort: false
    },
    {
      display: 'SLOT TIME',
      variable: 'slotTime',
      filter: 'time',
      sort: false
    },
    {
      display: 'SERVICE INFORMATION',
      variable: 'serviceList',
      displayVariable: 'serviceName',
      breakFill: ', ',
      filter: 'array-to-string',
      sort: false
    },
    {
      display: 'PAYMENT STATUS',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'paymentStatusButton',
      sort: false,
      variable: 'payment.paymentStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Not Paid',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Paid',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Pending',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          condition: 'default',
          label: 'Not Paid',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        }
      ]
    },
    {
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
    },
    {
      display: 'MARK ADDRESSED',
      filter: 'action',
      type: 'button',
      event: 'markAddressedButton',
      sort: false,
      variable: 'enableMarkAddressButton',
      conditions: [
        {
          value: '2',
          condition: 'eq',
          label: 'Addressed',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Mark Addressed',
          style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '0',
          condition: 'eq',
          label: 'Mark Addressed',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        
        {
          condition: 'default',
          label: 'Mark Addressed',
          style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
        }
        // {
        //   condition: 'default',
        //   label: 'Mark Addressed',
        //   style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        // }
      ]
    },
    {
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
    }
  ];

  sorting: any = {
    column: 'slotDate',
    descending: true
  };

  constructor(config: AppConfig,
    private diagnosticService: DiagnosticsService,
    private wellnessSlotBookingService: WellnessSlotBookingService,
    private wellnessService: WellnessService,
    private auth: AuthService, private router: Router,
    private spinnerService: SpinnerService, private common: CommonUtil = new CommonUtil()) {
    this.config = config.getConfig();
    this.pocId = auth.userAuth.pocId;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
  }

  ngOnInit(): void {
    this.getWellnessAdvisesForPocBasedOnPhoneNumberOrId();

  }


  

  onGenerateNewAppointment(): void {
    this.router.navigate(['/app/wellness/wellness_slotbooking/wellness_slotselection']);
  }

  onSearchChange(searchIndex: number) {
    this.searchCriteria = searchIndex;
  }

  onPage(event): void {

    this.total = this.total + 1;
    // this.getAppoinmentDataByDate();
    this.getWellnessAdvisesForPocBasedOnPhoneNumberOrId();
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
      this.getWellnessAdvisesForPocBasedOnPhoneNumberOrId();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getWellnessAdvisesForPocBasedOnPhoneNumberOrId();
    }
  }

  getWellnessAdvisesForPocBasedOnPhoneNumberOrId(search: any = ''): void {
    search = $('#search').val().toString();
    if (isNaN(parseInt(search))) {
      this.searchCriteria = 1;
    } else {
      this.searchCriteria = 2;
      if (search.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
    }

    this.search = search;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.slotBookingDetails = new Array<SlotBookingDetails>();
    this.total = 0;
    this.dataMsg = 'Loading.....';
    this.wellnessSlotBookingService.getWellnessAppoinmentDetails(this.pocId, this.total, 50,
      (this.searchCriteria == 1 ? search : ''), (this.searchCriteria == 2 ? search : ''), this.modifieddate)
      .then(data => {
        console.log("getSearchResults");
        if (this.total > 0) {
          this.slotBookingDetails.push.apply(this.slotBookingDetails, data);
        }
        else {
          this.slotBookingDetails = data;
        }

        for (let i = 0; i < this.slotBookingDetails.length; i++) {
          if (this.slotBookingDetails[i].cancellationStatus == 0 && this.slotBookingDetails[i].invoiceCompletionStatus == 1)
            this.slotBookingDetails[i].diagnosticSlotStatus = 0;
          else if (this.slotBookingDetails[i].cancellationStatus == 1 || this.slotBookingDetails[i].cancellationStatus == 2)
            this.slotBookingDetails[i].diagnosticSlotStatus = 1;
            
            if(this.slotBookingDetails[i].payment.paymentStatus === 1 && this.slotBookingDetails[i].invoiceCompletionStatus === 5 && 
              this.slotBookingDetails[i].cancellationStatus === 0){
              this.slotBookingDetails[i].enableMarkAddressButton = 2;
            }
            else if((this.slotBookingDetails[i].payment.paymentStatus === 1 && this.slotBookingDetails[i].invoiceCompletionStatus < 5) 
           && this.slotBookingDetails[i].cancellationStatus === 0){
              this.slotBookingDetails[i].enableMarkAddressButton = 1;
            }
            else{
              this.slotBookingDetails[i].enableMarkAddressButton = 0;
            }


          if (this.slotBookingDetails[i].patientProfileDetails)
            this.slotBookingDetails[i].age = this.common.getAgeForall(this.slotBookingDetails[i].patientProfileDetails.dob);

        }
        if (this.slotBookingDetails.length > 0) {
          this.total = this.slotBookingDetails.length;
        } else if (this.slotBookingDetails.length == 0) {
          this.slotBookingDetails = new Array<SlotBookingDetails>();
          this.dataMsg = 'No Data Found';
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
          this.showMessage = true;
        }
      });
  }


  paymentClick(bookingDetail: SlotBookingDetails) {
    console.log("bookingDetail: " + JSON.stringify(bookingDetail));
    this.adviceDetails = bookingDetail;
    if (bookingDetail.cancellationStatus <= 0 && bookingDetail.payment.paymentStatus != 1) {
      this.wellnessService.wellnessSlotBookingDetails = bookingDetail;
      this.wellnessService.onlyPayment = true;
      this.router.navigate(['/app/wellness/wellness_slotbooking/wellness_slotsummary']);
    } else if (bookingDetail.cancellationStatus == 1) {
      alert('Order is cancelled. Cannot proceed to payment');
    }
  }


  startDateChoosen($event): void {
    this.startDate = $event;
    this.modifieddate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
      this.startDate.getDate(), 0, 0, 0).getTime();
    this.total = 0;
    this.slotBookingDetails = new Array<SlotBookingDetails>();
    // this.getAppoinmentDataByDate();
    this.getWellnessAdvisesForPocBasedOnPhoneNumberOrId();

  }

  clickEventHandler(e) {
    console.log("event: " + e.event);
    if (e.event == "paymentStatusButton") {
      this.paymentClick(e.val);
    }
    else if (e.event == 'cancelButton') {
      this.cancelAppoinment(e.val);
    } else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
    else if (e.event == 'markAddressedButton') {
      this.updateOrderCompletionStatus(e.val);
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

  updateOrderCompletionStatus(bookingDetail: SlotBookingDetails) {
    this.adviceDetails = new SlotBookingDetails();
    this.adviceDetails = bookingDetail;
    this.adviceDetails.invoiceCompletionStatus = 5;
    this.modalId = 'complete_order';
    if(this.adviceDetails.enableMarkAddressButton === 1)
    (<any>$("#modalId")).modal("show");

  }

  markAddressed() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.wellnessSlotBookingService.updateOrderCompletion(this.adviceDetails.orderId, this.adviceDetails.invoiceCompletionStatus)
      .then(data => {
        this.spinnerService.stop();

        if (data.statusCode == 405) {
          $('#cancelError').show();
          alert(data.statusMessage);

          (<any>$("#modalId")).modal("hide");
        }
        else {
          alert(data.statusMessage);
          (<any>$("#modalId")).modal("hide");

          this.getRefreshedorderList('');
        }
        setTimeout(function () {
          $('#cancelError').fadeOut();
        }, 60000);
      });
  }

  cancelAppoinment(bookingDetail: SlotBookingDetails) {
    this.modalId = 'cancel_confirm';
    console.log("bookingDetail: " + JSON.stringify(bookingDetail));
    this.adviceDetails = bookingDetail;
    if (this.adviceDetails.cancellationStatus == 0 && this.adviceDetails.enableCancel == 1)
      (<any>$("#modalId")).modal("show");
  }

  cancelSlot() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.diagnosticService.cancelBookedSlot(this.adviceDetails.orderId, this.adviceDetails.invoiceId, 0, this.adviceDetails.patientProfileDetails.profileId)
      .then(data => {
        this.spinnerService.stop();

        if (data.statusCode == 405) {
          $('#cancelError').show();
          alert(data.statusMessage);

          (<any>$("#modalId")).modal("hide");
        }
        else {
          alert(data.statusMessage);
          (<any>$("#modalId")).modal("hide");

          this.getRefreshedorderList('');
        }
        setTimeout(function () {
          $('#cancelError').fadeOut();
        }, 60000);
      }).catch((err)=>{
        alert('Something went wrong please try again');
        this.spinnerService.stop();
      });
  }

  ngOnDestroy(): void {
    this.wellnessService.wellnessSlotBookingDetails = this.adviceDetails;
  }
}

