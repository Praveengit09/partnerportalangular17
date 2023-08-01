import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { Router } from '@angular/router';
import { CommonUtil } from '../../base/util/common-util';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../auth/auth.service';
import { ToasterService } from './../../layout/toaster/toaster.service';
import { PatientMedicalAdvise } from './../../model/advice/patientMedicalAdvise';
import { PatientQueue } from './../../model/reception/patientQueue';
import { PaymentService } from './../../payment/payment.service';
import { DoctorService } from './../doctor.service';
import { Config } from '../../base/config';
import { FileUtil } from "../../base/util/file-util";

const PRESCRIPTION_GENERATED = "Prescription Generated";
@Component({
  selector: "uploadcard",
  templateUrl: "./uploadcard.template.html",
  styleUrls: ["./uploadcard.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class UploadCardComponent implements OnInit, OnDestroy {

  @Input("fromDoctorQueue") fromDoctorQueue: boolean = false;
  @Output("isNgOnItTriggered") isNgOnItTriggered = new EventEmitter();

  successMsg: string;
  hasCheckBoxValidation: boolean = false;
  checkBoxValidationMessage: string;
  successColor: string = 'black';
  uploadFilesList: any[] = new Array();
  disabledUpload: boolean = false;
  patientMedicalAdvise: PatientMedicalAdvise = new PatientMedicalAdvise();;
  queue: PatientQueue;
  url: string = '';
  pdfUrl: string;
  isUploadView: boolean = true;
  printView: boolean = false;

  MAX_FILES_COUNT: number = 5;
  uploadPercentage: number = 0;

  constructor(private spinnerService: SpinnerService,
    private authService: AuthService,
    private router: Router,
    private toast: ToasterService,
    private doctorService: DoctorService,
    private fileUtil: FileUtil,
    private paymentService: PaymentService) {
    this.patientMedicalAdvise.uploadedFileList = new Array<string>();
    this.queue = this.doctorService.patientQueue;
  }

  ngOnInit() {
    this.queue = this.doctorService.patientQueue;
    $('#uploadPrescription').on('hidden.bs.modal', (e) => {
      console.log("uploadPrescription closed")
      this.isUploadView = true;
      this.printView = false;
      $("input[type=file]").val("");
      this.successMsg = "";
      this.uploadFilesList = new Array();
      this.patientMedicalAdvise = new PatientMedicalAdvise();
      this.patientMedicalAdvise.uploadedFileList = new Array<string>();
    });
  }

  ngOnDestroy() {

  }

  fileUpload(event) {

    this.uploadFilesList = event.target.files;

    for (let i = 0; i < this.uploadFilesList.length; i++) {
      if (this.uploadFilesList[i].size >= 5000000) {
        alert("select files less then 5MB");
        this.uploadFilesList = new Array();
        return;
      }
    }

    if ((this.patientMedicalAdvise.uploadedFileList.length + event.target.files.length) > this.MAX_FILES_COUNT) {
      alert("Only " + this.MAX_FILES_COUNT + " files are allowed.");
      return;
    }

    if (event.target.files.length >= 0) {

      for (let i = 0; i < event.target.files.length; i++) {
        if (event.target.files[i].name.toLowerCase().endsWith('.jpg') || event.target.files[i].name.toLowerCase().endsWith('.pdf') || event.target.files[i].name.toLowerCase().endsWith('.png') || event.target.files[i].name.toLowerCase().endsWith('.jpeg')) {

        }
        else {
          alert('Only jpg, png, jpeg and pdf are allowed.');
          event.target.files.splice(i, 1);
        }
      }
      this.uploadFilesList = event.target.files;

    }
    else {
      this.uploadFilesList = new Array();
    }
    console.log(this.uploadFilesList);
    this.upload();
  }

  upload() {
    if (this.hasCheckBoxValidation) {
      return;
    }
    if (this.uploadFilesList === undefined || this.uploadFilesList === null ||
      this.uploadFilesList[0] === undefined || this.uploadFilesList[0] === null) {
      this.hasCheckBoxValidation = true;
      // this.onCreateBrand();
      this.checkBoxValidationMessage = "Please select atleast one file.";
      return;
    }

    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();
    for (let i = 0; i < this.uploadFilesList.length; i++) {
      this.fileUtil.fileUploadToAwsS3(null, this.uploadFilesList[i], this.doctorService.patientQueue.parentProfileId, false, false).then(
        (awsS3FileResult: any) => {
          if (!awsS3FileResult) {
            this.spinnerService.stop();
            return;
          } else {
            this.spinnerService.stop();
            let url = awsS3FileResult.Location;
            this.patientMedicalAdvise.uploadedFileList.push(url);
          }
        }).catch(err => {
          this.spinnerService.stop();
        });
    }
  }

  update_patient_medical_advice() {
    this.queue = this.doctorService.patientQueue;
    this.patientMedicalAdvise.doctorId = this.queue.doctorId;
    this.patientMedicalAdvise.doctorTitle = this.queue.doctorTitle;
    this.patientMedicalAdvise.doctorFirstName = this.queue.doctorFirstName;
    this.patientMedicalAdvise.doctorLastName = this.queue.doctorLastName ? this.queue.doctorLastName : '';
    this.patientMedicalAdvise.doctorProfilePic = this.authService.employeeDetails.imageUrl;
    this.patientMedicalAdvise.parentProfileId = this.queue.parentProfileId;
    this.patientMedicalAdvise.patientTitle = this.queue.patientTitle;
    this.patientMedicalAdvise.patientFirstName = this.queue.patientFirstName;
    this.patientMedicalAdvise.patientTitle = this.queue.patientTitle;
    this.patientMedicalAdvise.patientLastName = this.queue.patientLastName ? this.queue.patientLastName : '';
    this.patientMedicalAdvise.patientId = this.queue.patientProfileId;
    this.patientMedicalAdvise.patientGender = this.queue.patientGender;
    this.patientMedicalAdvise.patientDOB = this.queue.patientDOB;
    this.patientMedicalAdvise.patientProfilePic = this.queue.patientProfilePic;
    this.patientMedicalAdvise.patientContactNumber = this.queue.patientContactNumber;

    this.patientMedicalAdvise.invoiceId = this.queue.invoiceId;
    this.patientMedicalAdvise.pocId = this.authService.selectedPocDetails.pocId;
    this.patientMedicalAdvise.orderId = this.queue.orderId;
    this.patientMedicalAdvise.serviceId = this.queue.serviceId;
    this.patientMedicalAdvise.bookingType = this.queue.bookingType;
    this.patientMedicalAdvise.bookingSubType = this.queue.bookingSubType;
    this.patientMedicalAdvise.uploadedPrescription = true;

    this.isUploadView = false;


    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    this.patientMedicalAdvise.date = date.getTime();
    this.patientMedicalAdvise.time = this.queue.time;
    this.patientMedicalAdvise.adviseGeneratedTime = new Date().getTime() - date.getTime();
    this.patientMedicalAdvise.bookingSource = 3; // for portal

    console.log("patientMedicalAvice-->" + JSON.stringify(this.patientMedicalAdvise));
    this.spinnerService.start();

    this.doctorService.uploadPatientAdvise(this.patientMedicalAdvise).then(resp => {
      console.log("resp uploadPatientAdvise ===>" + JSON.stringify(resp));
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        //cleverTap
        let patientQueue: PatientQueue = this.doctorService.patientQueue;
        let commonUtil = new CommonUtil();

        this.spinnerService.stop();
        // (<any>$("#uploadPrescription")).modal("hide");
        this.isUploadView = false;
        if (this.doctorService.isFrom != "doctorhomeconsult") {
          this.notifyCustomerForUpload(this.queue);
        }
        if (this.authService.selectedPocDetails) {
          if (this.authService.selectedPocDetails.pdfHeaderType == 0)
            this.pdfUrl = resp.advisePdfUrlWithHeader;
          else if (this.authService.selectedPocDetails.pdfHeaderType == 1)
            this.pdfUrl = resp.advisePdfUrlWithoutHeader;
        }
        this.printView = true;
        (<any>$("#printViewModel")).modal({
          show: true,
          escapeClose: false,
          clickClose: false,
          showClose: false,
          backdrop: "static",
          keyboard: false
        });
        console.log("Prescription generated successfully.");
        alert(resp.statusMessage);
        this.doctorService.uploadFilesList = new Array();
        window.localStorage.removeItem("patientMedicalAdvise");
        this.doctorService.isPrescriptionGenerated = true;

        console.log(this.doctorService.isPrescriptionGenerated + "----this.doctorService.isPrescriptionGenerated");
        console.log("Queue: ", patientQueue);

        if (Config.portal.clevertapId && Config.portal.clevertapId.length > 0) {
          (<any>window).clevertap.onUserLogin.push({
            "Site": {
              "Name": (patientQueue.patientTitle ? patientQueue.patientTitle + "." : "") + patientQueue.patientFirstName
                + " " + (patientQueue.patientLastName ? patientQueue.patientLastName : ""),
              "Gender": (patientQueue.patientGender && patientQueue.patientGender == "Female") ? "F" : "M",
              "Age": (commonUtil.getYearOnlyAgeForall(patientQueue.patientDOB)).replace(/\D/g, ""),
              "Identity": patientQueue.parentProfileId,
              "Phone": "+91" + patientQueue.patientContactNumber
            }
          });

          (<any>window).clevertap.event.push(PRESCRIPTION_GENERATED, patientQueue.orderId, {
            "Doctor Name": (patientQueue.doctorTitle ? patientQueue.doctorTitle : "" + ".") + patientQueue.doctorFirstName ? patientQueue.doctorFirstName : "" + " " +
              patientQueue.doctorLastName ? patientQueue.doctorLastName : "",
            "Poc Id": patientQueue.pocId,
            "patient id": patientQueue.parentProfileId,
            "patient name": (patientQueue.patientFirstName ? patientQueue.patientFirstName : "")
              + " " + (patientQueue.patientLastName ? patientQueue.patientLastName : ""),
            "Event SubType": patientQueue.bookingSubType,
            "Slot Date": patientQueue.slotDate,
            "Slot Time": patientQueue.time,
            "Original Amount": patientQueue.payment.originalAmount,
            "Package DIscount": patientQueue.payment.packageDiscountAmount ? patientQueue.payment.packageDiscountAmount : 0,
            "Other Discount": patientQueue.payment.otherDiscountAmount,
            "Final Amount": patientQueue.payment.finalAmount
          });
        }
      }
      else {
        alert(resp.statusMessage);
        this.successColor = 'red';
        this.isUploadView = true;
        this.successMsg = "Something went wrong. Prescription not uploaded.";
        this.spinnerService.stop();
      }
    }).catch((error) => {
      this.isUploadView = true;
      this.spinnerService.stop();
    });;
  }
  openUrlInNewTab(url) {
    this.authService.openPDF(url);
  }
  onClickUploadFiles(id: string) {
    $(id).click();
  }
  closePrintView() {
    if (true) {
      (<any>$("#printViewModel")).modal("hide");

      (<any>$("#uploadPrescription")).modal("hide");
      (<any>$("#doctordashboardUploadPrescription")).modal("hide");
      (<any>$("#homeCounsultUploadPrescription")).modal("hide");
      this.printView = false;
      (<any>$(".model")).modal("hide");
      if (this.fromDoctorQueue) {
        if (this.doctorService.isFrom == "doctorhomeconsult") {
          this.router.navigate(["./app/doctor/doctorhomeconsult/listing"]);
        }
        else if (this.doctorService.isFrom == "doctordashboard") {
          this.router.navigate(["./app/doctor/dashboard"]);

        }
        else {
          this.router.navigate(["./app/doctor/queue"]);
        }
      }
    }
  }
  notifyCustomerForUpload(queue: PatientQueue) {

    //for doctor always 6 for success
    console.log("Queue in notifyCustomer-->" + JSON.stringify(queue));
    let patientStatus: number = 6;
    let digiQueue: boolean = false;
    let pocId: number = this.authService.userAuth.pocId;
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

    let isDoctorInitiated = (queue.doctorId == this.authService.userAuth.employeeId);

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
      "pocId": this.authService.selectedPocDetails.pocId,
      "time": queue.time,
      "doctorInitiated": isDoctorInitiated
    }
    this.paymentService.notifyCustomer(notifyCustomerRequest).then((response) => {
      if (response.statusCode == 201) {
        this.spinnerService.stop();
        this.successColor = 'green';
        this.isNgOnItTriggered.emit();
      } else {
        this.successColor = 'red';
        alert(response.statusMessage);
      }
    })
  }
  getNameFromUrl(url: string) {
    return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
  }
  removeFile(index: number) {
    this.patientMedicalAdvise.uploadedFileList.splice(index, 1);
    this.uploadFilesList = new Array();
    $("#chooseFilePatientMedicalAdvise").val("");
  }
}