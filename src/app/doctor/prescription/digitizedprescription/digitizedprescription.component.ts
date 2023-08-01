import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../../../auth/auth.service";
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { CommonUtil } from "../../../base/util/common-util";
import { DoctorUtil } from '../../../base/util/doctor-util';
import { Config } from './../../../base/config';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { BasePocDetails } from '../../../model/reception/basePocDetails';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { DoctorService } from '../../doctor.service';
import { Router } from "@angular/router";

const PRESCRIPTION_GENERATED = "Prescription Generated";
@Component({
  selector: "digitizedprescription",
  templateUrl: "./digitizedprescription.template.html",
  styleUrls: ["./digitizedprescription.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})

export class DigitizedPrescriptionComponent implements OnInit {

  patientAge: string;
  displayMedicalAdvice: PatientMedicalAdvise = new PatientMedicalAdvise();
  errorMessage: string = "";
  pdfUrl: string;
  digitizationManagerComments: string;
  empId: number;

  constructor(
    private spinnerService: SpinnerService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private toast: ToasterService
  ) {
    this.empId = this.authService.employeeDetails.empId;
  }



  ngOnInit() {

    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('displayMedicalAdvice') != null && window.localStorage.getItem('displayMedicalAdvice').length > 0) {
      this.displayMedicalAdvice = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('displayMedicalAdvice')));
      console.log(this.displayMedicalAdvice);

    }
    if (this.displayMedicalAdvice.advisePdfUrlWithHeader || this.displayMedicalAdvice.advisePdfUrlWithoutHeader)
      this.doctorService.getPdfUrl((this.authService.selectedPocDetails.pdfHeaderType == 0) ? this.displayMedicalAdvice.advisePdfUrlWithHeader : this.displayMedicalAdvice.advisePdfUrlWithoutHeader).then(xdata => {
        let h = window.innerHeight;
        $('#digitized_prescription').attr({ data: xdata + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100, overflow: 'auto' });
        console.log(xdata);
      });

    if (this.displayMedicalAdvice.scannedAdvisePdfUrlWithHeader || this.displayMedicalAdvice.scannedAdvisePdfUrlWithoutHeader)
      this.doctorService.getPdfUrl((this.authService.selectedPocDetails.pdfHeaderType == 0) ? this.displayMedicalAdvice.scannedAdvisePdfUrlWithHeader : this.displayMedicalAdvice.scannedAdvisePdfUrlWithoutHeader).then(xdata => {
        let h = window.innerHeight;
        $('#scanned_prescription').attr({ data: xdata + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100, overflow: 'auto' });
        console.log(xdata);
      });
    console.log(this.displayMedicalAdvice.advisePdfUrlWithHeader);

    let commonUtil = new CommonUtil();
    this.patientAge = commonUtil.getAge(this.displayMedicalAdvice.patientDOB);
    this.patientAge = this.patientAge.includes(',') ? this.patientAge.substring(0, this.patientAge.length - 1) : this.patientAge;
  }


  async generateAdvice() {
    this.closeModals();
    let medicalAdvice = this.displayMedicalAdvice;

    console.log('medicalAdvice is >>>', medicalAdvice);

    // Check if routedTo is set or not. If not, set the current poc by default
    if (medicalAdvice.pharmacyAdvises && medicalAdvice.pharmacyAdvises.pharmacyAdviceList
      && medicalAdvice.pharmacyAdvises.pharmacyAdviceList.length > 0
      && (!medicalAdvice.pharmacyAdvises.routedToPoc || medicalAdvice.pharmacyAdvises.routedToPoc.length == 0)) {
      let basePoc: BasePocDetails = new BasePocDetails();
      basePoc.pocId = this.authService.selectedPocDetails.pocId;
      basePoc.pocName = this.authService.selectedPocDetails.pocName;
      basePoc.email = this.authService.selectedPocDetails.email;
      basePoc.contactList = this.authService.selectedPocDetails.contactList;
      basePoc.address = this.authService.selectedPocDetails.address;

      medicalAdvice.pharmacyAdvises.routedToPoc = [];
      medicalAdvice.pharmacyAdvises.routedToPoc[0] = basePoc;
    }

    if (medicalAdvice.investigationAdvises && medicalAdvice.investigationAdvises.investigationList
      && medicalAdvice.investigationAdvises.investigationList.length > 0
      && (!medicalAdvice.investigationAdvises.routedToPoc || medicalAdvice.investigationAdvises.routedToPoc.length == 0)) {
      let basePoc: BasePocDetails = new BasePocDetails();
      basePoc.pocId = this.authService.selectedPocDetails.pocId;
      basePoc.pocName = this.authService.selectedPocDetails.pocName;
      basePoc.email = this.authService.selectedPocDetails.email;
      basePoc.contactList = this.authService.selectedPocDetails.contactList;
      basePoc.address = this.authService.selectedPocDetails.address;

      medicalAdvice.investigationAdvises.routedToPoc = [];
      medicalAdvice.investigationAdvises.routedToPoc[0] = basePoc;
    }

    medicalAdvice.prescriptionDigitizationStatus = PatientMedicalAdvise.DIGITIZATION_STATUS_COMPLETED;
    medicalAdvice.approvedDigitizeMangerEmpId = this.empId;

    console.log("medicalAdvice ==> ", medicalAdvice);

    this.doctorService.generatePatientMedicalPresciption(medicalAdvice).then(data => {
      this.spinnerService.start();
      if (data.statusCode == 201 || data.statusCode == 200) {
        alert(data.statusMessage);
        //cleverTap
        this.pushCleverTapEvent(medicalAdvice);

        this.spinnerService.stop();
        console.log("advice generated");
        this.doctorService.uploadFilesList = new Array();
        window.localStorage.removeItem("displayMedicalAdvise");
        window.localStorage.removeItem("patientQueue");
        this.doctorService.isPrescriptionGenerated = true;
        console.log(this.doctorService.isPrescriptionGenerated + "----this.doctorService.isPrescriptionGenerated");
        this.closeModals();

        if (this.authService.selectedPocDetails) {
          if (this.authService.selectedPocDetails.pdfHeaderType == 0)
            this.doctorService.pdfUrl = data.advisePdfUrlWithHeader;
          else
            this.doctorService.pdfUrl = data.advisePdfUrlWithoutHeader;
        }
        console.log("ghsdhfjsdjsdkd" + JSON.stringify(this.authService.selectedPocDetails));
        this.router.navigate(['./app/doctor/digitizationmanager']);
      }
      else {
        alert(data.statusMessage);
        this.doctorService.uploadFilesList = new Array();
        this.spinnerService.stop();
        this.router.navigate(['./app/doctor/digitizationmanager']);
      }
    }).catch((error) => {
      this.spinnerService.stop();
    });
  }

  async rejectAdvice() {
    this.closeModals();
    let medicalAdvice = this.displayMedicalAdvice;

    if (medicalAdvice.digitizationManagerComments == null || medicalAdvice.digitizationManagerComments == undefined || medicalAdvice.digitizationManagerComments.length <= 0) {
      this.toast.show("Add Comments to Reject the Advice", "bg-danger text-white font-weight-bold", 3000);
    }

    if (medicalAdvice.digitizationManagerComments && medicalAdvice.digitizationManagerComments != null &&
      medicalAdvice.digitizationManagerComments != undefined && medicalAdvice.digitizationManagerComments.length > 0) {

      medicalAdvice.prescriptionDigitizationStatus = PatientMedicalAdvise.DIGITIZATION_STATUS_REJECTED;
      medicalAdvice.uploadedPrescription = false;

      this.doctorService.generatePatientMedicalPresciption(medicalAdvice).then(data => {
        this.spinnerService.start();
        if (data.statusCode == 201 || data.statusCode == 200) {
          alert(data.statusMessage);
          this.spinnerService.stop();
          window.localStorage.removeItem("displayMedicalAdvise");
          window.localStorage.removeItem("patientQueue");
          console.log("advice rejected");
          this.router.navigate(['./app/doctor/digitizationmanager']);
        }
        else {
          alert(data.statusMessage);
          this.doctorService.uploadFilesList = new Array();
          this.spinnerService.stop();
          this.router.navigate(['./app/doctor/digitizationmanager']);
        }
      }).catch((error) => {
        this.spinnerService.stop();
      });
    }
  }

  pushCleverTapEvent(item) {
    if (Config.portal.clevertapId && Config.portal.clevertapId.length > 0) {
      //Handling Error due to 'patientQueue.payment' getting undefined in some uneven cases
      try {
        let commonUtil = new CommonUtil();
        let patientQueue: PatientQueue = new PatientQueue;
        patientQueue.serviceId = item.serviceId;
        patientQueue.visitedTime = item.adviseGeneratedTime;
        patientQueue.bookingType = item.bookingType;
        patientQueue.bookingSubType = item.bookingSubType;
        patientQueue.patientProfileId = item.patientId;
        patientQueue.parentProfileId = item.parentProfileId;
        /* patientQueue.visitDetails = item.visitDetail;
        patientQueue.typeOfAppointment = item.typeOfAppointment; */
        patientQueue.localDOBYear = commonUtil.getAge(item.patientDOB);
        patientQueue.pdfUrlWithHeader = item.advisePdfUrlWithHeader;
        patientQueue.pdfUrlWithoutHeader = item.advisePdfUrlWithoutHeader;
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
          "Original Amount": patientQueue.payment.originalAmount ? patientQueue.payment.originalAmount : 0,
          "Package DIscount": patientQueue.payment.packageDiscountAmount ? patientQueue.payment.packageDiscountAmount : 0,
          "Other Discount": patientQueue.payment.otherDiscountAmount ? patientQueue.payment.otherDiscountAmount : 0,
          "Final Amount": patientQueue.payment.finalAmount ? patientQueue.payment.finalAmount : 0
        });
        console.log("generateAdviceLogin: ", (<any>window).clevertap.onUserLogin);
        console.log("generateAdviceEvent: ", (<any>window).clevertap.event);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private closeModals() {
    (<any>$("#modelapproveprescription")).modal("hide");
    (<any>$("#modelrejectprescription")).modal("hide");
    $('.modal-backdrop').remove();
  }

  openUrlInNewTab(url) {
    this.authService.openPDF(url);
  }

  hideModel(id: string) {
    (<any>$(id)).modal('hide');
  }

  addNoteForAdvice(): void {
    this.digitizationManagerComments = this.getStringValue("#prescription_notes");
    this.displayMedicalAdvice.digitizationManagerComments = this.digitizationManagerComments;
  }

  saveAdviceAsTemplate() {
    this.closeModals();
    this.errorMessage = '';
    let title = this.displayMedicalAdvice.diagnosisList[0].name + "_template";
    (<any>$("#modelapproveprescription")).modal({
      show: true,
      escapeClose: true,
      clickClose: true,
      showClose: true,
      backdrop: true,
      keyboard: false
    });
    setTimeout(() => $("#saveTemplateTitle").val(title), 3);
  }
  hideModal(id: string) {
    (<any>$(id)).modal('hide');
  }
  openModal(id: string) {
    (<any>$(id)).modal('show');
  }

  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
  }

  getFileExtensionFromUrl(url: string) {
    return DoctorUtil.getFileExtensionFromUrl(url);
  }
}
