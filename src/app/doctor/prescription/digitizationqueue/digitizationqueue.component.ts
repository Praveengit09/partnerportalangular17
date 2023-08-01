import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from '../../../app.config';
import { AuthService } from '../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { DoctorService } from '../../doctor.service';
import { PatientMedicalAdvise } from './../../../model/advice/patientMedicalAdvise';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { CryptoUtil } from '../../../auth/util/cryptoutil';

@Component({
   selector: 'digitizationqueue',
   templateUrl: './digitizationqueue.template.html',
   styleUrls: ['./digitizationqueue.style.scss'],
   encapsulation: ViewEncapsulation.None,
})


export class DigitizationQueueComponent implements OnInit {

   config: any;
   empId: number;
   doctorId: number;
   pocId: number;

   total: number = 0;
   perPage: number = 10;
   size: number = 50;
   from: number = 0;

   errorMessage: Array<string>;
   isError: boolean;
   showMessage: boolean;

   digitizationQueueList: Array<PatientMedicalAdvise>;
   selectedItem = new PatientQueue();
   dataMsg: string = ' ';

   searchTerm: string = '';
   isWrongMobile: boolean = false;
   searchCriteria: number = 0;

   futureDate = new Date().setMonth(new Date().getMonth() + 1);
   pastDate = new Date().setMonth(new Date().getMonth() - 3);

   startDate: Date = new Date();
   endDate: Date = new Date();
   datepickerOpts = {
      startDate: new Date(this.pastDate),
      endDate: new Date(this.futureDate),
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
      assumeNearbyYear: true,
      format: 'dd/mm/yyyy'
   };

   columns: any[] = [
      {
         display: 'Patient Information',
         variable: 'patientTitle patientFirstName patientLastName',
         filter: 'text',
         sort: false
      },
      {
         display: 'Doctor Name',
         variable: 'doctorTitle doctorFirstName doctorLastName',
         filter: 'text',
         sort: false
      },
      {
         display: 'Date',
         variable: 'date',
         filter: 'date',
         sort: false
      },
      {
         display: 'Time',
         variable: 'time',
         filter: 'time',
         sort: false
      },
      {
         display: 'Mobile',
         variable: 'patientContactNumber',
         filter: 'text',
         sort: false
      },
      {
         display: 'Action',
         label: 'Edit',
         style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
         filter: 'action',
         type: 'button',
         event: 'editButton',
         sort: false,
         variable: 'prescriptionDigitizationStatus',
         conditions: [
            {
               value: '0',
               condition: 'lte',
               label: 'Edit',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '1',
               condition: 'eq',
               label: 'Completed',
               style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
            },
            {
               value: '3',
               condition: 'eq',
               label: 'Edit',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '4',
               condition: 'eq',
               label: 'Sent for Approval',
               style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
            },
            {
               value: '5',
               condition: 'eq',
               label: 'Rejected',
               event: 'editButton',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },

         ]
      },
   ];

   sorting: any = {
      column: 'orderId',
      descending: true
   };

   constructor(config: AppConfig,
      private authService: AuthService, private location: Location,
      private doctorService: DoctorService, private router: Router,
      private spinnerService: SpinnerService, private commonUtil: CommonUtil,
      private activatedRoute: ActivatedRoute) {
      this.config = config.getConfig();
      this.pocId = this.authService.userAuth.pocId;
      this.doctorId = this.authService.userAuth.employeeId;
      this.empId = this.authService.userAuth.employeeId;

      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('presQueueStartDate') != null && window.localStorage.getItem('presQueueStartDate') != undefined) {
         this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('presQueueStartDate'))));
         this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('presQueueEndDate'))));
      }
   }

   ngOnInit() {
      this.from = 0;
      this.getDigitizationQueueList();
   }

   getDigitizationQueueList() {
      this.spinnerService.start();
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
         this.spinnerService.stop();
         this.errorMessage = new Array();
         this.errorMessage[0] = 'Start Date should always be greater than end date';
         this.isError = true;
         this.showMessage = true;
         return;
      }
      let mobileNo = "";
      let patientName = "";
      if (this.searchCriteria == 1) {
         patientName = this.searchTerm;
         mobileNo = "";
      } else if (this.searchCriteria == 2) {
         patientName = "";
         mobileNo = this.searchTerm;
      }

      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('presQueueStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
      window.localStorage.setItem('presQueueEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

      this.doctorService.getDigitizationQueueForDigitizer(this.empId, this.from, this.size,
         this.commonUtil.convertOnlyDateToTimestamp(this.startDate),
         this.commonUtil.convertOnlyDateToTimestamp(this.endDate), 0, mobileNo, patientName, this.empId).then((data) => {
            console.log("Data: ", data);
            this.digitizationQueueList = data;
            this.spinnerService.stop();

            if (this.digitizationQueueList.length > 0) {
               this.total = this.from = this.digitizationQueueList.length;
            } else {
               this.dataMsg = 'No Data Found';
            }
         })
   }

   startDateChoosen($event): void {
      this.startDate = $event;
      this.total = 0;
      this.from = 0;
      this.digitizationQueueList = new Array();
      this.getDigitizationQueueList();
   }

   endDateChoosen($event) {
      this.endDate = $event;
      this.total = 0;
      this.from = 0;
      this.digitizationQueueList = new Array();
      this.getDigitizationQueueList();
   }

   clickEventHandler(e) {
      console.log(e);
      if (e.event == "editButton") {
         this.onButtonClicked(e.val);
      }
   }

   onButtonClicked(item: PatientMedicalAdvise) {
      console.log("onButtonClicked: ", item);
      if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_ASSGINED_TO_DIGITIIZER ||
         item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_REJECTED)
         this.generatePatientQueueFromPatientMedicalAdvise(item)
   }

   generatePatientQueueFromPatientMedicalAdvise(item: PatientMedicalAdvise) {
      let patientQueue = new PatientQueue();
      let commonUtil = new CommonUtil();
      patientQueue = JSON.parse(JSON.stringify(item));
      patientQueue.serviceId = item.serviceId;
      patientQueue.visitedTime = item.adviseGeneratedTime;
      patientQueue.bookingType = item.bookingType;
      patientQueue.bookingSubType = item.bookingSubType;
      patientQueue.patientProfileId = item.patientId;
      patientQueue.parentProfileId = item.parentProfileId;
      /* patientQueue.visitDetails = item.visitDetail;
      patientQueue.typeOfAppointment = item.typeOfAppointment; */
      patientQueue.localDOBYear = commonUtil.getAge(item.patientDOB);
      if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_ASSGINED_TO_DIGITIIZER) {
         patientQueue.advisePdfUrlWithHeader = item.advisePdfUrlWithHeader;
         patientQueue.advisePdfUrlWithoutHeader = item.advisePdfUrlWithoutHeader;
      }
      if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_REJECTED) {
         patientQueue.advisePdfUrlWithHeader = item.scannedAdvisePdfUrlWithHeader;
         patientQueue.advisePdfUrlWithoutHeader = item.scannedAdvisePdfUrlWithoutHeader;
         patientQueue.symptomList = item.symptomList;
         patientQueue.diagnosisList = item.diagnosisList;
         patientQueue.pharmacyAdvises = item.pharmacyAdvises;
         patientQueue.procedureList = item.procedureList;
         patientQueue.wellnessAdvises = item.wellnessAdvises;
         patientQueue.investigationAdvises = item.investigationAdvises;
         patientQueue.referralDoctorList = item.referralDoctorList;
         patientQueue.nonMedicationAdvises = item.nonMedicationAdvises;
         patientQueue.immunizationAdvices = item.immunizationAdvices;
         patientQueue.illnessSymptomList = item.illnessSymptomList;
         patientQueue.clinicalExaminationList = item.clinicalExaminationList;
         patientQueue.followupAdvices = item.followupAdvices;
         patientQueue.noteList = item.noteList;
         patientQueue.doctorNoteList = patientQueue.doctorNoteList;
         patientQueue.uploadedFileList = item.uploadedFileList;
         patientQueue.uploadedClinicalExaminationFileList = item.uploadedClinicalExaminationFileList;
         if (item.digitizationManagerComments && item.digitizationManagerComments != undefined)
            patientQueue.digitizationManagerComments = item.digitizationManagerComments;
      }
      patientQueue.prescriptionDigitizationStatus = item.prescriptionDigitizationStatus;
      patientQueue.time = item.time;
      patientQueue.patientTitle = item.patientTitle ? item.patientTitle : "";
      patientQueue.patientFirstName = item.patientFirstName;
      patientQueue.patientLastName = item.patientLastName ? item.patientLastName : '';
      patientQueue.patientDOB = item.patientDOB;
      patientQueue.patientGender = item.patientGender;
      patientQueue.bookingPocId = item.pocId;
      // patientQueue.payment = item.payment;
      patientQueue.orderId = item.orderId;
      patientQueue.invoiceId = item.invoiceId;
      patientQueue.parentProfileId = item.parentProfileId;
      patientQueue.doctorId = item.doctorId;
      patientQueue.serviceId = item.serviceId;
      patientQueue.pocId = item.pocId;
      patientQueue.doctorFirstName = item.doctorFirstName;
      patientQueue.doctorLastName = item.doctorLastName ? item.doctorLastName : '';
      patientQueue.doctorTitle = item.doctorTitle;
      patientQueue.profilePic = item.patientProfilePic;
      patientQueue.patientContactNumber = item.patientContactNumber;
      patientQueue.bookingSubType = item.bookingSubType;

      this.doctorService.patientQueue = patientQueue;
      this.doctorService.isFrom = "digitizationqueue";

      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('isFromDigitization', cryptoUtil.encryptData(this.doctorService.isFrom));

      window.localStorage.removeItem('patientQueue');
      window.localStorage.removeItem("patientMedicalAdvise");
      window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
      this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();

      this.router.navigate(['./app/doctor/prescription']);
   }

   onPage(page: number): void {
      // this.skip = +page * +this.perPage;
      this.from = 0;
      this.getDigitizationQueueList();

   }

   onEnterPressed(e) {
      if (e.keyCode == 13) {
         this.onSearch();
      }
   }

   onSearch() {
      console.log("NameOrMob::" + this.searchTerm);
      this.searchTerm = this.searchTerm.trim();
      if (isNaN(parseInt(this.searchTerm))) {
         this.searchCriteria = 1;
      }
      else if (this.searchTerm.length < 10 || this.searchTerm.length > 10
         || !this.searchTerm || this.searchTerm.length < 3) {
         this.isWrongMobile = true;
      } else {
         this.searchCriteria = 2;
      }

      if (this.isWrongMobile) {
         this.errorMessage = new Array();
         this.errorMessage[0] = 'Enter valid mobile no.';
         this.isError = true;
         this.showMessage = true;
      }

      this.isWrongMobile = false;
      this.from = 0;
      this.digitizationQueueList = new Array<PatientMedicalAdvise>();
      this.dataMsg = "Loading...";
      this.getDigitizationQueueList();
   }

   onRefresh() {
      this.isWrongMobile = false;
      this.searchTerm = '';
      this.from = 0;
      this.digitizationQueueList = new Array<any>();
      this.total = 0;
      $('#search').val('');
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      this.getDigitizationQueueList();
   }

   ngOnDestroy(): void {

   }
}