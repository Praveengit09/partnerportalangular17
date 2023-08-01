import { Component, OnInit } from '@angular/core';
import { ReceptionService } from '../reception.service';
import { InsuranceDetails } from '../../model/reception/insuranceDetails'
import { Router } from '@angular/router';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../base/util/common-util';
import { AuthService } from '../../auth/auth.service';
import { CryptoUtil } from '../../auth/util/cryptoutil';

@Component({
  selector: 'apprequestqueue',
  templateUrl: './apprequestqueue.template.html',
  styleUrls: ['./apprequestqueue.style.scss'],
})


export class AppRequestQueueComponent implements OnInit {


  displayList: any;
  pagingList: any;
  sorting: any;
  deliveryType: any;
  perPage: any;
  total: any;
  startDate: Date = new Date();
  dateFilter: number = 0;
  pocId: number = 0;
  empId: number = 0;
  orderId: string = ''
  date: number = 0
  // status: number = 0
  from: number = 0
  size: number = 50
  appointmentRequestId: string = ''

  // date: Date = new Date();
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  search: any;
  slotDetails: InsuranceDetails
  appointmentRequests: any
  remarks: any = ""


  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  constructor(private authService: AuthService, private receptionService: ReceptionService,
    private router: Router, private spinnerService: SpinnerService,
    private common: CommonUtil = new CommonUtil(),
  ) {
    this.pocId = this.authService.userAuth.pocId
  }

  columns: any[] = [
    {
      display: 'OrderId',
      variable: 'appointmentRequestId',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'Name',
      variable: "patientProfileDetails.fName",
      filter: 'text',
      sort: false
    },
    {
      display: 'ContactNumber',
      variable: 'patientProfileDetails.contactInfo.mobile',
      filter: 'text',
      sort: false
    },
    {
      display: 'Insurance details',
      variable: 'patientProfileDetails.consumerInsuranceDetails[0].insuranceId \n patientProfileDetails.consumerInsuranceDetails[0].insuranceType',
      filter: 'text',
      sort: false
    },
    {
      display: 'Remarks',
      variable: 'remarks',
      filter: 'text',
      sort: false
    },
    {
      display: 'Type',
      variable: 'bookingSubType',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Instant Walkin'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Video'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Walkin'
        },
      ]
    },
    {
      display: 'Preferred Slot',
      variable: 'slotDate',
      filter: 'date',
      sort: false
    },
    {
      display: 'Preferred Specialization',
      variable: 'serviceName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      variable: 'status',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'pending'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'fulfilled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'under-progress'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'rejected'
        },
      ]

    },
    {
      display: 'Action',
      filter: 'action',
      type: 'button',
      variable: 'status',
      event: 'scheduleButton',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Schedule',
          style: 'btn btn-success width-130 mb-xs'
        },
        {
          value: '1',
          condition: 'gte',
          label: 'Scheduled',
          style: 'btn btn-success width-130 mb-xs disabled'
        },
        {
          condition: 'default',
          label: 'Schedule',
          style: 'btn btn-success width-130 mb-xs'
        }
      ]
    },
    {
      display: 'Cancel',
      filter: 'action',
      type: 'button',
      variable: 'status',
      event: 'cancelButton',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Cancel',
          style: 'btn btn-danger width-130 mb-xs'
        },
        {
          value: '1',
          condition: 'gte',
          label: 'Cancel',
          style: 'btn btn-danger width-130 mb-xs disabled'
        },
        {
          condition: 'default',
          label: 'Cancel',
          style: 'btn btn-danger width-130 mb-xs'
        }
      ]
    },
  ]
  ngOnInit(): void {
    window.localStorage.removeItem('isFromAppReq');
    window.localStorage.removeItem('appReqPatDet');
    this.getRequests()
  }


  getRequests() {

    let search = $('#search').val().toString();
    let date = this.common.convertDateToTimestamp(this.startDate);

    this.spinnerService.start();
    this.receptionService.getAppoinmentRequests(this.pocId, this.empId, this.orderId, this.appointmentRequestId, this.date, this.from, this.size).then(data => {
      console.log("Data: ", data);
      if (data && data.length > 0)
        this.displayList = data;
      else {
        this.displayList = new Array<any>();
      }
      this.appointmentRequestId = ''
      this.spinnerService.stop();
    })
  }

  clickEventHandler(e) {
    console.log('event: ', e.event)
    if (e.event == 'scheduleButton') {
      if (e.val.status === 0)
        this.onScheduleClick(e.val);
    } else if (e.event == 'cancelButton') {
      if (e.val.status === 0) {
        (<any>$('#doctordashboardUploadPrescription')).modal({
          show: true,
          escapeClose: false,
          clickClose: false,
          showClose: false,
          backdrop: "static",
          keyboard: false
        });
        console.log(this.remarks);

        console.log(e);
        this.appointmentRequests = e.val
        this.updateAppointmentRequest()
      }
    }
  }

  onScheduleClick(item) {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('appReqPatDet', cryptoUtil.encryptData(JSON.stringify(item)));
    window.localStorage.setItem('isFromAppReq', cryptoUtil.encryptData(JSON.stringify(true)))

    this.router.navigate(['/app/reception/digibooking/doctorsearch']);
  }
  updateAppointmentRequest() {
    if (this.remarks != "") {
      let req = {
        parentProfileId: this.appointmentRequests.parentProfileId,
        patientProfileId: this.appointmentRequests.patientProfileId,
        orderId: this.appointmentRequests.orderId,
        status: 3,
        appointmentRequestId: this.appointmentRequests.appointmentRequestId,
        remarks: this.remarks
      }
      console.log(req);

      this.receptionService.updateAppointmentRequests(req).then(data => {
        console.log(data);
        if (data.statusCode === 201) {
          this.getRequests();
        } else {
          window.alert(data.statusMessage);
        }
      })
    } else {
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'Please Add Remarks';
      this.isError = true;
      this.showMessage = true;
      return;
    }

  }


  getConsultationsForSearch() {
    let search = $('#search').val().toString();
    console.log(search);
    this.spinnerService.start();
    this.appointmentRequestId = search
    this.getRequests()


    console.log("getDiagnosticAdvisesForPocBasedOnPhoneNumberOrIdSQ");
    this.search = search;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;

  }
  onEnterPressed(e) {

    if (e.keyCode == 13) {
      this.getConsultationsForSearch();
    }
  }

  startDateChoosen($event): void {
    let search = $('#search').val().toString();

    console.log($event);
    this.startDate = $event;
    this.total = 0
    console.log(this.startDate);

    this.date = this.common.convertOnlyDateToTimestamp(this.startDate);
    console.log(this.startDate);

    this.getRequests()

  }
  onPage(event: any) {

  }
  
}


