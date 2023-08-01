import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUtil } from '../../../base/util/file-util';
import { DoctorService } from '../../../doctor/doctor.service';
import { PatientMedicalAdvise } from '../../../model/advice/patientMedicalAdvise';
import { PaymentService } from '../../../payment/payment.service';
import { AppConfig } from './../../../app.config';
import { AuthService } from './../../../auth/auth.service';
import { Config } from './../../../base/config';
import { CommonUtil } from './../../../base/util/common-util';
import { RoleConstants } from './../../../constants/auth/roleconstants';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { Doctor } from './../../../model/employee/doctor';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { ConsultationQueueRequest } from './../../../model/slotbooking/consultationQueueRequest';
import { ReceptionService } from './../../../reception/reception.service';

@Component({
  selector: 'queue',
  templateUrl: './queue.template.html',
  styleUrls: ['./queue.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class QueueComponent implements OnInit {

  doctorId: number;
  roleId: number;
  config: any;
  patientConsultationQueueList = new Array();
  patientConsultationQueue: PatientQueue[];
  consultationQueueIndex: string = 'consultationQueueIndex';
  selectedDoctor: Doctor;
  currDate: Date;
  CHECKED_CONSTANT: number = 6;
  uploadFilesList: any;
  hasCheckBoxValidation: boolean = false;
  checkBoxValidationMessage: string;
  url: any;
  patientMedicalAdvice: PatientMedicalAdvise;
  queue: PatientQueue = new PatientQueue();
  successMsg: string;
  successColor: string = 'black';
  scanAndUploadPrescriptions: boolean = false;
  pocId: number;
  doctorServiceType = new Map();
  subType: string[] = ["POC", "DIGIROOM", "VIDEO-CHAT", "WALKIN"];
  waitingPatientDetailsList = new Array();
  currencySymbol: string = '';
  printBlankLetterHead:boolean;

  constructor(config: AppConfig, private common: CommonUtil, private activatedRoute: ActivatedRoute,
    private auth: AuthService, private receptionService: ReceptionService, private doctorService: DoctorService,
    private paymentService: PaymentService, private fileUtil: FileUtil, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.currDate = new Date();
    if (this.auth.loginResponse.employee.serviceList) {
      for (let index = 0; index < this.auth.loginResponse.employee.serviceList.length; index++) {
        this.doctorServiceType.set(this.auth.loginResponse.employee.serviceList[index].serviceId, this.auth.loginResponse.employee.serviceList[index]);
      }
    }
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
    if(Config.portal && Config.portal.customizations.printBlankLetterHead){
      this.printBlankLetterHead=Config.portal.customizations.printBlankLetterHead
    }
  }

  ngOnInit(): void {
    this.pocId = this.auth.userAuth.pocId;;
    $('.modal').on('hidden.bs.modal', (e) => {
      $("input[type=file]").val("");
      this.uploadFilesList = undefined;
      this.successMsg = "";
    });
    this.scanAndUploadPrescriptions = this.auth.selectedPocDetails.scanAndUploadPrescriptions;
    this.activatedRoute.params.subscribe(params => {
      this.doctorId = this.activatedRoute.snapshot.params['doctorId'];
      this.getConsultationList();
    });
    // this.load();
  }
  // load() {
  //   console.log("====>>>")
  //   setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
  //   // location.reload();
  //   }


  convertToPdf(item) {
    this.receptionService.patientDataToPdf = item

    this.router.navigate(['./app/reception/convertToPdf'])
  }




  getConsultationList() {
    this.patientConsultationQueueList = new Array();
    this.patientConsultationQueue = new Array<PatientQueue>();
    let request: ConsultationQueueRequest = new ConsultationQueueRequest();
    request.pocId = this.auth.userAuth.pocId;
    request.empId = 0;
    request.doctorId = this.doctorId;
    request.roleId = RoleConstants.queueRoleId;
    request.date = this.common.convertOnlyDateToTimestamp(new Date());
    request.digiQueue = false;
    this.spinnerService.start();
    this.receptionService.getDoctorConsultationQueueFromServer(request).then(patientQueueList => {
      this.spinnerService.stop();
      this.patientConsultationQueueList = new Array();

      if (patientQueueList.length > 0) {
        for (var i = 0; i < patientQueueList.length; i++) {
          if (patientQueueList[i].status != this.CHECKED_CONSTANT) {
            patientQueueList[i].patientAge = this.common.getAge(patientQueueList[i].patientDOB).split(",")[0] + this.common.getAge(patientQueueList[i].patientDOB).split(",")[1];

            patientQueueList[i].waitingTime = this.getWaitingTime(patientQueueList[i]);
            this.patientConsultationQueueList.push(patientQueueList[i]);
          }
        }
      }
    });
  }

  getWaitingPatientList() {
    this.pocId = this.auth.userAuth.pocId;
    this.spinnerService.start();
    this.getWaitingList();
    this.spinnerService.stop();
  }

  getWaitingList() {
    this.receptionService.getWaitingPatientDetails(this.pocId).then(response => {
      this.waitingPatientDetailsList = new Array();
      if (response.length > 0) {
        for (var i = 0; i < response.length; i++) {
          response[i].patientAge = this.common.getAge(response[i].patientDOB).split(",")[0] +
            this.common.getAge(response[i].patientDOB).split(",")[1];
          response[i].waitingTime = response[i].visitedTime / 60000;
          this.waitingPatientDetailsList.push(response[i]);
        }
      }
    });
  }

  getQueue(queue) {
    this.queue = queue;
    this.doctorService.patientQueue = queue;
  }

  getWaitingTime(item) {
    let time = new Date();
    time.setHours(0);
    time.setMinutes(-new Date().getTimezoneOffset());
    time.setSeconds(0);
    time.setMilliseconds(0);
    let now_time = new Date();
    let visitedTime = new Date(item.visitedTime).getTime() - time.getTime();
    let engageTime = new Date(item.doctorEngTime).getTime() - time.getTime();
    console.log(JSON.stringify(item));
    if (item.status == 4) {
      return (now_time.getTime() - time.getTime() - item.time) / 60000;
    }
    else if (item.status == 7) {
      return (now_time.getTime() - time.getTime() - visitedTime) / 60000;
    }
    else if (item.status == 7) {
      return (engageTime - visitedTime) / 60000;
    }
    return 0;
    // return needTime - item.time;
  }

  getContentType(fileName: string): string {
    let contentType: string = '';
    // fileName =fileName.replaceAll("\\s+","")
    if (fileName != null && fileName.length > 0)
      if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileName.endsWith(".png")) {
        contentType = "image/png";
      } else if (fileName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileName.endsWith(".xls")) {
        contentType = "application/vnd.ms-excel";
      } else if (fileName.endsWith(".xlsx")) {
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        contentType = "application/octet-stream";
      }
    return contentType;
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
  }

  upload() {
    if (this.hasCheckBoxValidation) {
      return;
    }
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3(null, this.uploadFilesList[0], this.queue.parentProfileId, false, false).then((awsS3FileResult: any) => {
      console.log("awsS3FileResult" + JSON.stringify(awsS3FileResult));
      //let url = awsS3FileResult.Location;
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        this.successColor = 'red';
        this.successMsg = "Something went wrong....Prescription not uploaded";
        return;
      }
      else {
        this.spinnerService.stop();
        console.log('File Path is ' + awsS3FileResult.Location);
        this.url = awsS3FileResult.Location;
        this.update_patient_medical_advice();
      }
    }).catch(err => {
      this.spinnerService.stop();
      this.successColor = 'red';
      this.successMsg = "Something went wrong....Prescription not uploaded";
    });

  }

  update_patient_medical_advice() {
    this.patientMedicalAdvice = new PatientMedicalAdvise();

    this.patientMedicalAdvice.doctorId = this.queue.doctorId;
    this.patientMedicalAdvice.doctorTitle = this.queue.doctorTitle;
    this.patientMedicalAdvice.doctorFirstName = this.queue.doctorFirstName;
    this.patientMedicalAdvice.doctorLastName = this.queue.doctorLastName ? this.queue.doctorLastName : '';
    this.patientMedicalAdvice.parentProfileId = this.queue.parentProfileId;
    this.patientMedicalAdvice.patientTitle = this.queue.patientTitle;
    this.patientMedicalAdvice.patientFirstName = this.queue.patientFirstName;
    this.patientMedicalAdvice.patientTitle = this.queue.patientTitle;
    this.patientMedicalAdvice.patientLastName = this.queue.patientLastName ? this.queue.patientLastName : '';
    this.patientMedicalAdvice.patientId = this.queue.patientProfileId;
    this.patientMedicalAdvice.patientGender = this.queue.patientGender;
    this.patientMedicalAdvice.patientDOB = this.queue.patientDOB;
    this.patientMedicalAdvice.patientContactNumber = this.queue.patientContactNumber;

    this.patientMedicalAdvice.invoiceId = this.queue.invoiceId;
    this.patientMedicalAdvice.pocId = this.pocId;
    this.patientMedicalAdvice.orderId = this.queue.orderId;

    this.patientMedicalAdvice.advisePdfUrlWithHeader = this.url;
    this.patientMedicalAdvice.advisePdfUrlWithoutHeader = this.url;

    this.patientMedicalAdvice.bookingSource = 3 // for portal

    console.log("patientMedicalAvice-->" + JSON.stringify(this.patientMedicalAdvice));
    this.doctorService.uploadPatientAdvise(this.patientMedicalAdvice).then(resp => {
      console.log("resp uploadPatientAdvise ===>" + JSON.stringify(resp));
      if (resp.statusCode == 201) {
        this.notifyCustomer(this.queue);
      } else {
        this.successColor = 'red';
        this.successMsg = "Something went wrong....Prescription not uploaded";
      }
    });
  }

  notifyCustomer(queue: PatientQueue) {

    //for doctor always 6 for success
    console.log("Queue in notifyCustomer-->" + JSON.stringify(queue));
    let patientStatus: number = 6;
    let digiQueue: boolean = false;
    let pocId: number = this.auth.userAuth.pocId;
    let digiManager: boolean = false;


    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (queue.bookingSubType == 1) {
      digiQueue = true;
      pocId = queue.pocId;
      digiManager = true;
    }

    let notifyCustomerRequest = {
      "date": queue.slotDate || date.getTime(),
      "bookingPocId": queue.bookingPocId,
      "notifyPartner": digiManager,
      "digiQueue": digiQueue,
      "doctorId": queue.doctorId,
      "invoiceId": queue.invoiceId,
      "orderId": queue.orderId,
      "patientId": queue.patientProfileId,
      "patientStatus": patientStatus,
      "pocId": this.pocId,
      "time": queue.time
    }
    this.paymentService.notifyCustomer(notifyCustomerRequest).then((response) => {
      if (response.statusCode == 201) {
        this.spinnerService.stop();
        this.successColor = 'green';
        this.successMsg = "Prescription uploaded Successfully";
        this.getConsultationList();
        setTimeout(() => {
          (<any>$("#uploadPrescription")).modal("hide");
        }, 2000);
      } else {
        this.successColor = 'red';
        this.successMsg = "Something went wrong....Prescription not uploaded";
      }
    })
  }
  openModelWithOutClose(id) {
    (<any>$("#" + id)).modal({
      show: true,
      escapeClose: false,
      clickClose: false,
      showClose: false,
      backdrop: "static",
      keyboard: false
    });
  }

  openModal(id: string) {
    (<any>$(id)).modal('show');
    $(".modal-backdrop").not(':first').remove();
    this.getWaitingPatientList();
  }

  pageRefresh() {
    this.getWaitingList();
  }

  getAssertsLogoPath(): string {
    return Config.portal.iconspath;
  }
}
