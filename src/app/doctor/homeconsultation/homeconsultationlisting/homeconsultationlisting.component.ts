import { PatientQueue } from './../../../model/reception/patientQueue';
import { PatientMedicalAdvise } from './../../../model/advice/patientMedicalAdvise';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { AuthService } from '../../../auth/auth.service';
import { AppConfig } from '../../../app.config';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { ReceptionService } from '../../../reception/reception.service';
import { DoctorService } from '../../doctor.service';
import { CommonUtil } from '../../../base/util/common-util';
import { CryptoUtil } from '../../../auth/util/cryptoutil';
import { ToasterService } from '../../../layout/toaster/toaster.service';

@Component({
   selector: 'homeconsultationlisting',
   templateUrl: './homeconsultationlisting.template.html',
   styleUrls: ['./homeconsultationlisting.style.scss'],
   encapsulation: ViewEncapsulation.None,
})


export class HomeConsultationListing implements OnInit {

   pdfHeaderType: number;
   config: any;
   doctorHomeConsultList: Array<SlotBookingDetails>;
   tempdoctorHomeConsultList: Array<SlotBookingDetails>;
   empId: number;
   doctorId: number;
   pocId: number;
   skip: number = 0;
   total: number = 0;
   selectedRequest: SlotBookingDetails;
   scanAndUploadPrescriptions: boolean;
   modalView: string = '';
   perPage: number = 10;
   queue: PatientQueue;

   columns: any[] = [
      {
         display: 'Order Id',
         variable: 'orderId',
         filter: 'text',
         sort: false
      },
      {
         display: 'Patient Information',
         variable:
            `patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName, \n 
          deliveryAddress.address1,deliveryAddress.address2, \n 
          deliveryAddress.cityName, \n 
          deliveryAddress.stateName, \n 
          deliveryAddress.cityName deliveryAddress.pinCode, \n 
          patientProfileDetails.contactInfo.mobile`,
         filter: 'nametitle',
         sort: false
      },

      // {
      //     display: 'Doctor Name',
      //     variable: 'doctorDetail.firstName doctorDetail.lastName',
      //     filter: 'text',
      //     sort: false
      // },
      {
         display: 'Date',
         variable: 'slotDate',
         filter: 'date',
         sort: false
      },
      {
         display: 'Time',
         variable: 'slotTime',
         filter: 'time',
         sort: false
      },
      {
         display: 'Status',
         variable: 'payment.paymentStatus',
         filter: 'text',
         sort: false,
         conditions: [
            {
               value: '1',
               condition: 'eq',
               label: 'Paid'
            },
            {
               value: '0',
               condition: 'lte',
               label: 'Not Paid'
            },
            {
               value: '2',
               condition: 'eq',
               label: 'Pending'
            },
            {
               condition: 'default',
               label: 'Not Paid'
            }
         ]
      },
      {
         display: 'Action',
         label: 'View',
         style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
         filter: 'action',
         type: 'button',
         event: 'viewButton',
         sort: false,
         variable: 'homeConsultStatus',
         conditions: [
            {
               value: '2',
               condition: 'lte',
               label: 'Pending',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '3',
               condition: 'lte',
               label: 'Reached Patient',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '4',
               condition: 'lte',
               label: 'Started Consultation',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '5',
               condition: 'eq',
               label: 'Completed',
               style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
            },
            {
               value: '20',
               condition: 'eq',
               label: 'Completed',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '19',
               condition: 'eq',
               label: 'Cancelled',
               style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
            },
            {
               value: '10',
               condition: 'eq',
               label: 'Waiting For Doctor Approval',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '11',
               condition: 'eq',
               label: 'Approved',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            {
               value: '12',
               condition: 'eq',
               label: 'Rejected',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            }

         ]
      },
      {
         display: 'Engage',
         // label: 'View',
         // style: 'btn btn-danger mb-xs botton_txtdigo d',
         filter: 'action',
         type: 'button',
         event: 'engageButton',
         sort: false,
         variable: 'homeConsultStatus',
         conditions: [
            {
               value: '4',
               condition: 'eq',
               label: 'Engage',
               style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
            },
            // {
            //    value: '19',
            //    condition: 'eq',
            //    label: 'Engage',
            //    style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
            // },
            {
               condition: 'default',
               label: 'Engage',
               style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'

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
         variable: 'payment.paymentStatus',
         conditions: [
            {
               value: '1',
               condition: 'eq',
               label: 'assets/img/partner/pdf_icon_read.png',
            },
            {
               value: '0',
               condition: 'eq',
               label: 'assets/img/partner/pdf_icon_disabled.png',
               style: ' hide_btndigo disabled'
            },
            {
               condition: 'default',
               label: 'assets/img/partner/pdf_icon_disabled.png',
               style: 'hide_btndigo disabled'
            }
         ]
      }
   ];

   sorting: any = {
      column: 'orderId',
      descending: true
   };

   constructor(config: AppConfig,
      private receptionService: ReceptionService, private toast: ToasterService,
      private authService: AuthService, private location: Location,
      private doctorService: DoctorService, private router: Router, private spinnerService: SpinnerService) {
      this.config = config.getConfig();
      this.pocId = this.authService.userAuth.pocId;
      this.doctorId = this.authService.userAuth.employeeId;
      this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
      if (this.authService.selectedPocDetails == null
         || this.authService.selectedPocDetails == undefined ||
         this.authService.selectedPocDetails.scanAndUploadPrescriptions == null ||
         this.authService.selectedPocDetails.scanAndUploadPrescriptions == undefined) {
         this.scanAndUploadPrescriptions = false;
      } else {
         this.scanAndUploadPrescriptions = this.authService.selectedPocDetails.scanAndUploadPrescriptions;
      }
   }

   ngOnInit() {
      this.getHomeConsultations();
      let self = this;
      $('#uploadPrescription').on('hidden.bs.modal', (e) => {
         $("input[type=file]").val("");
         self.modalView = '';
      });
   }

   getHomeConsultations() {
      this.spinnerService.start();
      this.receptionService.getDoctorHomeConsultationList(this.doctorId, 0, this.pocId, "", "", this.skip).then((response) => {
         this.spinnerService.stop();
         if (this.skip > 0) {
            this.doctorHomeConsultList.push.apply(this.doctorHomeConsultList, response)
         } else {
            this.doctorHomeConsultList = new Array();
            this.doctorHomeConsultList = response;
         }
         // this.doctorHomeConsultList = response;
         this.total = this.skip = this.doctorHomeConsultList.length;
         for (let i = 0; i < this.doctorHomeConsultList.length; i++) {
            if (this.doctorHomeConsultList[i].cancellationStatus == 0) {
               this.doctorHomeConsultList[i].homeConsultStatus = this.doctorHomeConsultList[i].invoiceCompletionStatus;
            }
            else {
               this.doctorHomeConsultList[i].homeConsultStatus = 19;
            }

            if (this.doctorHomeConsultList[i].invoiceCompletionStatus == 5 && this.doctorHomeConsultList[i].payment.paymentStatus == 0) {
               this.doctorHomeConsultList[i].homeConsultStatus = 20;
            }

         }
      });
   }
   engageQueue(item: SlotBookingDetails) {

      if (item.homeConsultStatus == 4) {
         let queue = this.queue = this.doctorService.patientQueue = this.generatePatientQueueFromSlotBookinfDetails(item);
         window.localStorage.removeItem('patientQueue');
         window.localStorage.removeItem("patientMedicalAdvise");
         this.doctorService.isFrom = "doctorhomeconsult";
         this.doctorService.uploadFilesList = new Array();
         this.doctorService.isPrescriptionGenerated = false;
         let cryptoUtil: CryptoUtil = new CryptoUtil();
         window.localStorage.setItem('patientQueue', cryptoUtil.encryptData(JSON.stringify(queue)));
         this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();

         if (this.scanAndUploadPrescriptions == true) {
            this.modalView = "uploadOrEngage";
            console.log('****');
            this.openModelWithOutClose('#homeCounsultUploadPrescription');
         } else {
            this.routeToPrescription(queue);
         }
      }
      else {
         return;
      }

   }
   openModelWithOutClose(id: string) {
      (<any>$(id)).modal({
         show: true,
         escapeClose: false,
         clickClose: false,
         showClose: false,
         backdrop: "static",
         keyboard: false
      });
   }

   routeToPrescription(queue: PatientQueue) {
      (<any>$("#homeCounsultUploadPrescription")).modal('hide');
      this.doctorService.getSavePrescriptionsForPatient(queue.invoiceId).then(data => {
         if (data) {
            if (data.statusCode != 200 && data.statusCode != 201) {
               this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
               return;
            }
            if (data.invoiceId == queue.invoiceId) {
               this.doctorService.patientMedicalAdvise = JSON.parse(JSON.stringify(data));
               if (this.doctorService.patientMedicalAdvise.diagnosisList) {
                  this.doctorService.patientMedicalAdvise.finalDiagnosisCount = 0;
                  this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount = 0;
                  for (let i = 0; i < this.doctorService.patientMedicalAdvise.diagnosisList.length; i++) {
                     if (this.doctorService.patientMedicalAdvise.diagnosisList[i].finalDiagnosis)
                        this.doctorService.patientMedicalAdvise.finalDiagnosisCount++;
                     else
                        this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount++;
                  }
               }
            }
            this.router.navigate(['./app/doctor/prescription']);
         }
      }).catch((err) => {
         console.log(err);
         this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
      });
   }
   generatePatientQueueFromSlotBookinfDetails(item: SlotBookingDetails) {
      let patientQueue = new PatientQueue();
      let commonUtil = new CommonUtil();
      patientQueue = JSON.parse(JSON.stringify(item));
      // patientQueue.order =item.order;//
      // patientQueue.exitTime= item.slotExpireTime;//
      patientQueue.serviceId = item.serviceId;
      // patientQueue.vitalStatus = item.vitalStatus;//
      patientQueue.visitedTime = item.slotTime; //
      // patientQueue.doctorEngTime = item.doctorEngTime;//
      patientQueue.bookingType = item.bookingType;
      patientQueue.bookingSubType = item.bookingSubType;
      patientQueue.patientProfileId = item.patientProfileId;
      patientQueue.parentProfileId = item.parentProfileId;
      // patientQueue.patientProfilePic= item.patientProfileDetails.patientProfilePic;//
      patientQueue.visitDetails = item.visitDetail; //
      patientQueue.typeOfAppointment = item.typeOfAppointment;
      // patientQueue.doctorPocDetails= item.doctorPocDetails;//
      patientQueue.pocDetails = JSON.parse(JSON.stringify(item.pocDetails));
      // patientQueue.localAppointmentTime= item.localAppointmentTime;//
      patientQueue.localDOBYear = commonUtil.getAge(item.patientProfileDetails.dob);
      patientQueue.waitingTime = item.slotDuration; //
      patientQueue.sessionBean = item.sessionBean;
      // patientQueue.advisePdfUrlWithHeader= item.advisePdfUrlWithHeader;//
      // patientQueue.advisePdfUrlWithoutHeader= item.advisePdfUrlWithoutHeader;//
      patientQueue.pdfUrlWithHeader = item.pdfUrlWithHeader;
      patientQueue.pdfUrlWithoutHeader = item.pdfUrlWithoutHeader;
      patientQueue.time = item.slotTime; //
      // patientQueue.status= item.status;//
      // patientQueue.slotType= item.slotType;//
      patientQueue.patientTitle = item.patientProfileDetails.title ? item.patientProfileDetails.title : "";
      patientQueue.patientFirstName = item.patientProfileDetails.fName;
      patientQueue.patientLastName = item.patientProfileDetails.lName ? item.patientProfileDetails.lName : '';
      patientQueue.patientProfileId = item.patientProfileId;
      patientQueue.patientDOB = item.patientProfileDetails.dob;
      patientQueue.patientGender = item.patientProfileDetails.gender;
      // patientQueue.bookingId= item.bookingId;//
      patientQueue.bookingPocId = item.bookingPocId;
      // patientQueue.roomNumber= item.roomNumber;//
      patientQueue.payment = item.payment;
      patientQueue.orderId = item.orderId;
      patientQueue.invoiceId = item.invoiceId;
      patientQueue.parentProfileId = item.parentProfileId;
      patientQueue.doctorId = item.doctorId;
      patientQueue.serviceId = item.serviceId;
      patientQueue.doctorName = item.doctorDetail.firstName; //
      patientQueue.expireTime = item.slotExpireTime; //
      patientQueue.pocId = item.pocId;
      // patientQueue.digiPocId= item.digiPocId;//
      patientQueue.doctorFirstName = item.doctorDetail.firstName; //
      patientQueue.doctorLastName = item.doctorDetail.lastName ? item.doctorDetail.lastName : ''; //
      patientQueue.doctorTitle = item.doctorDetail.title; //
      patientQueue.profilePic = item.patientProfileDetails.profilePic; //
      patientQueue.patientContactNumber = item.patientProfileDetails.contactInfo.mobile; //
      patientQueue.bookingSubType = item.bookingSubType;

      return patientQueue;
   }

   onButtonClicked(item: SlotBookingDetails) {
      this.selectedRequest = item;
      if (this.selectedRequest.invoiceCompletionStatus == 10 && this.selectedRequest.cancellationStatus != 2 && this.selectedRequest.cancellationStatus != 1) {
         this.router.navigate(['app/doctor/doctorhomeconsult/edit']);//if not yet approved or rejected
      }
      else if (this.selectedRequest.cancellationStatus == 2 || this.selectedRequest.cancellationStatus == 1) {
         this.router.navigate(['app/doctor/doctorhomeconsult/listing']);
      }
      else if (this.selectedRequest.invoiceCompletionStatus == 5 && this.selectedRequest.payment.paymentStatus == 1) {
         this.router.navigate(['app/doctor/doctorhomeconsult/listing']);
      }
      else {
         this.router.navigate(['app/doctor/doctorhomeconsult/update']);//if approved
      }
   }

   clickEventHandler(e) {
      console.log(e);
      if (e.event == "viewButton") {
         this.onButtonClicked(e.val);
      }
      else if (e.event == 'pdfButton') {
         this.invoiceClick(e.val);
      }
      else if (e.event == 'engageButton') {

         this.engageQueue(e.val);
      }
   }

   nextPage() {
      this.router.navigate(['app/doctor/doctorhomeconsult/centralhomeconsult']);//if approved
   }


   onPage(page: number): void {

      // this.skip = +page * +this.perPage;
      this.getHomeConsultations();

   }

   invoiceClick(item: SlotBookingDetails): void {
      this.selectedRequest = item;
      if (this.selectedRequest.payment.paymentStatus == 1) {
         if (this.pdfHeaderType == 0) {
            this.authService.openPDF(this.selectedRequest.pdfUrlWithHeader)
         }
         else {
            this.authService.openPDF(this.selectedRequest.pdfUrlWithoutHeader)
         }
      }
   }

   ngOnDestroy(): void {
      if (this.selectedRequest != undefined && this.selectedRequest != null) {
         this.doctorService.doctorHomeConsultTrack = this.selectedRequest;
      }
   }
}