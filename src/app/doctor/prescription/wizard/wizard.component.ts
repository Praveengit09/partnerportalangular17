import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { PhrCategory } from '../../../model/phr/phrCategory';
import { AuthService } from './../../../auth/auth.service';
import { CryptoUtil } from "./../../../auth/util/cryptoutil";
import { CommonUtil } from './../../../base/util/common-util';
import { NotificationsService } from './../../../layout/notifications/notifications.service';
import { DoctorPrescriptionTemplate } from './../../../model/advice/doctorPrescriptionTemplate';
import { PatientMedicalAdvise } from "./../../../model/advice/patientMedicalAdvise";
import { BaseResponse } from './../../../model/base/baseresponse';
import { FollowUpDiscount } from './../../../model/followup/followupdiscount';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { UserReport } from './../../../model/report/userReport';
import { DoctorService } from "./../../doctor.service";
import { VideoCardService } from './../videocard/videocard.service';
import { Config } from './../../../base/config';
import { FileUtil } from "./../../../base/util/file-util";

@Component({
  selector: "wizard",
  templateUrl: "./wizard.template.html",
  styleUrls: ["./wizard.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class WizardComponent implements OnInit, OnDestroy {
  wizardView: string = "symptomPrescription";
  @Input("isVideo")
  isVideo: boolean = false;

  @Input("isVideoMax")
  isVideoMax: boolean = false;
  patientMedicalAdvise: PatientMedicalAdvise;

  videoQuestion: PhrCategory = new PhrCategory();
  videQuestionView: boolean;

  caseSheet: boolean = false;
  caseSheetUrl: string = '';

  templateAdvice: any = new PatientMedicalAdvise();
  modelView: string;
  hasPrescriptionTemplates: boolean;
  hasPastPrescriptions: boolean;
  pastTests: Array<UserReport> = new Array<UserReport>();
  hasPastTests: boolean;
  pastPrescription: PatientMedicalAdvise = new PatientMedicalAdvise();
  noOfTemplates: number;
  followUpIndex: number;
  AUTO_FOLLOW_UP_DAYS = 3;
  patientQueue: PatientQueue;
  isFrom: string;
  empId: number;
  enableClickCall: boolean;
  showQuestionnaire: boolean = false;
  enableKaleyraVideo: boolean = false;
  mandatoryDiagnosisType: boolean = false;
  showImageAnnotator: boolean = false;

  // dummyPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";


  constructor(private doctorService: DoctorService,
    private notificationsService: NotificationsService,
    private videoCardService: VideoCardService,
    private commonUtil: CommonUtil, private fileUtil: FileUtil,
    private toast: ToasterService, private authService: AuthService, private activatedRoute: ActivatedRoute,
    private router: Router) {
    // if(this.doctorService.patientQueue.bookingSubType==1||this.doctorService.patientQueue.bookingSubType==2)
    // this.isVideo=true;
    let self = this;

    this.doctorService.isVideoMax = false;
    this.empId = this.authService.employeeDetails.empId;
    window.addEventListener("load", function () {
      self.windowOnLoad();
    });
    $(window).resize(() => {
      self.addModal(self, "template-pastprescription");
    });

    window.addEventListener("beforeunload", function (event) {
      event.preventDefault();
      let msg = self.windowBeforeUnload();
      event.returnValue(msg);
      return msg;
    });



    this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
    this.getDataFromLocalStorage();
    if (this.patientMedicalAdvise == undefined || this.patientMedicalAdvise == null) {
      this.patientMedicalAdvise = new PatientMedicalAdvise();
    }
    if (
      this.doctorService.patientQueue.bookingType == 1 ||
      (this.doctorService.patientQueue.bookingType == 3 &&
        (this.doctorService.patientQueue.bookingSubType == 1 ||
          this.doctorService.patientQueue.bookingSubType == 2))
    ) {
      this.doctorService.isVideo = true;
      this.isVideo = this.doctorService.isVideo;
      if (this.doctorService.isNetworkQualityTested == false) {
        this.videoCardService.updateSessionStatus('Doctor Navigated for precall network Test', 0);
        this.routeToPage('./app/doctor/prescription/precalltest');
        return;
      } else {
        this.videoCardService.updateSessionStatus('Doctor waiting in prescription screen for establishing connection', 0);
      }
    }
    else {
      this.doctorService.isVideo = false;
      this.isVideo = this.doctorService.isVideo;
    }
    if (
      this.doctorService.patientQueue.bookingType &&
      this.doctorService.patientQueue.bookingType == 3 &&
      this.doctorService.patientQueue.bookingSubType &&
      this.doctorService.patientQueue.bookingSubType == 1
    ) {
      //digi
      this.doctorService.isVideoQuestionShow = true;
    }
    console.log("bookingType " + this.doctorService.patientQueue.bookingType);
    console.log(
      "bookingSubType " + this.doctorService.patientQueue.bookingSubType
    );

    console.log("isVideo " + this.isVideo);
    this.isVideoMax = this.doctorService.isVideoMax;
    // if (this.isVideo && !this.doctorService.isVideoQuestionShow) {
    //   console.log("video show logic");
    //   this.doctorService.isVideoQuestionShow = true;
    //   this.doctorService.getAnsOfVideoBooking(this.doctorService.patientQueue.patientProfileId).then(data => {
    //     this.videoQuestion = JSON.parse(JSON.stringify(data));
    //     this.videQuestionView = true;
    //     if (data) {
    //       for (let i = 0; i < this.videoQuestion.activities.length; i++) {
    //         for (let j = 0; j < this.videoQuestion.activities[i].question.length; j++) {
    //           if (this.videoQuestion.activities[i].question[j].componentId == 0) {
    //             for (let k = 0; k < this.videoQuestion.activities[i].question[j].choices.length; k++) {
    //               for (let l = 0; l < this.videoQuestion.activities[i].question[j].choices[k].length; l++) {
    //                 if (this.videoQuestion.activities[i].question[j].choices[k][l].id == this.videoQuestion.activities[i].question[j].ans && (this.videoQuestion.activities[i].question[j].ans != '')) {
    //                   this.videoQuestion.activities[i].question[j].calcuatedAnswer = this.videoQuestion.activities[i].question[j].choices[k][l].option;
    //                   break;
    //                 }
    //               }
    //             }
    //           }
    //           else if (this.videoQuestion.activities[i].question[j].componentId == 2) {
    //             this.videoQuestion.activities[i].question[j].calcuatedAnswer = this.videoQuestion.activities[i].question[j].ans;
    //           }
    //         }
    //       }
    //     }
    //     console.log(this.videoQuestion.activities[0]);
    //     (<any>$("#videQuestionModel")).modal("show");
    //   });
    // }
    this.setPatientMedicalAdvise(this.doctorService.patientQueue);
    $(document).ready(function () {
      self.addParentClass();
    });

    $(window).resize(function () {
      self.addParentClass();
    });
    this.initSocketEvents();
    // console.log(JSON.parse(JSON.stringify(this.doctorService.patientMedicalAdvise)), "patientMedicalAdvise", this.doctorService.patientMedicalAdvise.caseSheet)

    this.caseSheet = this.doctorService.caseSheet = this.patientMedicalAdvise.caseSheet;
    if (this.caseSheet)
      this.caseSheetUrl = this.doctorService.caseSheetUrl = (this.authService.selectedPocDetails.pdfHeaderType == 0) ? this.patientMedicalAdvise.caseSheetUrlWithHeader : this.patientMedicalAdvise.caseSheetUrlWithoutHeader;
    else
      this.caseSheetUrl = this.doctorService.caseSheetUrl = '';
    // alert(this.doctorService.caseSheet)

    this.patientQueue = this.doctorService.patientQueue;
    this.isFrom = this.doctorService.isFrom;
    console.log("isFrom: ", this.doctorService.isFrom);

    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableClickCall) {
      this.enableClickCall = true;
    }

    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableKaleyraVideo) {
      this.enableKaleyraVideo = true;
    }
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableMandatoryDiagnosisType) {
      this.mandatoryDiagnosisType = true;
    }

  }

  initSocketEvents() {
    if (this.patientMedicalAdvise.bookingType &&
      this.patientMedicalAdvise.bookingType == 3 &&
      this.patientMedicalAdvise.bookingSubType &&
      this.patientMedicalAdvise.bookingSubType == 1) { //digi
      this.videoCardService
        .onStatusUpdate()
        .subscribe((status) => {
          console.log(status)
          this.toast.show(status.msg, "bg-success text-white font-weight-bold", 2000);
        })
    }
    this.videoCardService.updatePrescription(this.patientMedicalAdvise);
  }

  addParentClass() {
    if (+($(window).width()) > 1199) {
      if (!$('.video-sec,.template-pastprescription').parent().hasClass('videotemplateparent')) {
        $('.video-sec,.template-pastprescription').wrapAll('<div class="videotemplateparent"></div>');
      }
    }
    else {
      if ($('.video-sec,.template-pastprescription').parent().hasClass('videotemplateparent')) {
        $('.video-sec,.template-pastprescription').unwrap();
      }
    }
  }

  addModalClass(child, parentClassName: string = 'parent', attr = '', id = '', width: number = 1200, parentStyle: string = '', parentClasses = "") {
    if (+($(window).width()) < width) {
      if (!(child.parent().hasClass(parentClassName))) {
        child.wrapAll("<div id='" + id + "' class='" + parentClassName + " " + parentClasses + "' style='" + parentStyle + "' " + attr + "></div>");
      }
    } else {
      if (child.parent().hasClass(parentClassName)) {
        child.unwrap();
      }
    }
  }

  addModal(self = this, child, width = 1200) {
    if (+($(window).width()) < width) {
      if ($(".doctor-prescription #template-pastprescription").length > 1) {
        $(".doctor-prescription #template-pastprescription").not(':first').remove();
      }
      self.addModalClass($('.' + child), 'modal-body');
      self.addModalClass($('.' + child).parent(), 'modal-content');
      if ($("#" + child + " .modal-header").length == 0)
        setTimeout(() =>
          $("<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'>Close <span aria-hidden='true'>&times;</span></button></div>").insertBefore("#" + child + " .modal-body"), 2);
      self.addModalClass($('.' + child).parent().parent(), 'modal-dialog', "role='document'");
      self.addModalClass($('.' + child).parent().parent().parent(), 'modal', "tabindex='-1' role='dialog' aria-labelledby='modelLabel' aria-hidden='true'", child, width, "", "right");
    }
    else {
      $('#' + child).on('hidden.bs.modal', function (e) {
        $('.modal-backdrop').remove();
      });
      (<any>$('#' + child)).modal('hide');
    }
    $(".modal").on("shown.bs.modal", function () {
      if ($(".modal-backdrop").length > 1) {
        $(".modal-backdrop").not(':first').remove();
      }
    })
  }
  windowOnLoad() {
    let url = window.location.href;
    console.log(url);
    console.log(url.includes("doctor/prescription/generate"));
  }

  windowBeforeUnload(): string {
    this.setDataToLocalStorage();
    console.log("windowBeforeUnload");


    return "Data not saved! Do want to colse/refresh page?"
  }

  getIsVideo(): boolean {
    this.isVideo = this.doctorService.isVideo;
    return this.doctorService.isVideo;
  }


  setPatientMedicalAdvise(patientQueue: PatientQueue) {
    this.patientMedicalAdvise.doctorId = patientQueue.doctorId;
    this.patientMedicalAdvise.doctorFirstName = patientQueue.doctorFirstName;
    this.patientMedicalAdvise.doctorLastName = patientQueue.doctorLastName ? patientQueue.doctorLastName : '';
    this.patientMedicalAdvise.doctorTitle = patientQueue.doctorTitle;
    this.patientMedicalAdvise.pocId = patientQueue.pocId;
    this.patientMedicalAdvise.serviceId = patientQueue.serviceId;
    this.patientMedicalAdvise.doctorProfilePic = this.authService.employeeDetails.imageUrl;
    this.patientMedicalAdvise.bookingType = patientQueue.bookingType;
    this.patientMedicalAdvise.bookingSubType = patientQueue.bookingSubType;
    this.patientMedicalAdvise.patientId = patientQueue.patientProfileId;
    this.patientMedicalAdvise.patientFirstName = patientQueue.patientFirstName;
    this.patientMedicalAdvise.patientTitle = patientQueue.patientTitle;
    this.patientMedicalAdvise.patientLastName = patientQueue.patientLastName ? patientQueue.patientLastName : '';
    this.patientMedicalAdvise.patientDOB = patientQueue.patientDOB;
    this.patientMedicalAdvise.patientGender = patientQueue.patientGender;
    this.patientMedicalAdvise.patientProfilePic = patientQueue.patientProfilePic;
    this.patientMedicalAdvise.patientContactNumber = patientQueue.patientContactNumber;
    this.patientMedicalAdvise.parentProfileId = patientQueue.parentProfileId;
    this.patientMedicalAdvise.invoiceId = patientQueue.invoiceId;
    this.patientMedicalAdvise.orderId = patientQueue.orderId;
    this.patientMedicalAdvise.parentProfileId = patientQueue.parentProfileId;
    this.patientMedicalAdvise.time = patientQueue.time;
    this.patientMedicalAdvise.scannedAdvisePdfUrlWithHeader = patientQueue.advisePdfUrlWithHeader;
    this.patientMedicalAdvise.scannedAdvisePdfUrlWithoutHeader = patientQueue.advisePdfUrlWithoutHeader;
    this.patientMedicalAdvise.prescriptionDigitizationStatus = patientQueue.prescriptionDigitizationStatus;
    // if (patientQueue.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_REJECTED) {
    this.patientMedicalAdvise.symptomList = patientQueue.symptomList;
    this.patientMedicalAdvise.diagnosisList = patientQueue.diagnosisList;
    this.patientMedicalAdvise.pharmacyAdvises = patientQueue.pharmacyAdvises;
    this.patientMedicalAdvise.procedureList = patientQueue.procedureList;
    this.patientMedicalAdvise.wellnessAdvises = patientQueue.wellnessAdvises;
    this.patientMedicalAdvise.investigationAdvises = patientQueue.investigationAdvises;
    this.patientMedicalAdvise.referralDoctorList = patientQueue.referralDoctorList;
    this.patientMedicalAdvise.nonMedicationAdvises = patientQueue.nonMedicationAdvises;
    this.patientMedicalAdvise.immunizationAdvices = patientQueue.immunizationAdvices;
    this.patientMedicalAdvise.illnessSymptomList = patientQueue.illnessSymptomList;
    this.patientMedicalAdvise.clinicalExaminationList = patientQueue.clinicalExaminationList;
    this.patientMedicalAdvise.followupAdvices = patientQueue.followupAdvices;
    this.patientMedicalAdvise.noteList = patientQueue.noteList;
    this.patientMedicalAdvise.doctorNoteList = patientQueue.doctorNoteList;
    this.patientMedicalAdvise.uploadedFileList = patientQueue.uploadedFileList;
    this.patientMedicalAdvise.uploadedClinicalExaminationFileList = patientQueue.uploadedClinicalExaminationFileList;
    // }
    if (patientQueue.digitizationManagerComments && patientQueue.digitizationManagerComments != undefined && patientQueue.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_REJECTED) {
      this.patientMedicalAdvise.digitizationManagerComments = patientQueue.digitizationManagerComments;
    }
    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    this.patientMedicalAdvise.date = date.getTime();
    this.patientMedicalAdvise.adviseGeneratedTime = new Date().getTime() - date.getTime();
  }
  ngOnInit() {
    // (<any>$("#requestConsentModel")).modal("show");


    let self = this;
    if ((Config.portal.doctorOptions && Config.portal.doctorOptions.enablePrescriptionQuestionnaire == true) || (this.isVideo && !this.doctorService.isVideoQuestionShow)) {
      this.showQuestionnaire = true;
    }
    $("#modelIdwizardpastprescription").on("hidden.bs.modal", function () {
      self.modelView = "";
      self.hasPastPrescriptions = false;
      self.hasPastTests = false;
      $('.modal-backdrop').remove();
      console.log("modelIdwizardpastprescription closed")
    });
    $("#wizardvitalsReadingComponentModel").on("hidden.bs.modal", function () {
      self.modelView = "";
      self.hasPastPrescriptions = false;
      self.hasPastTests = false;
      $('.modal-backdrop').remove();
      console.log("modelIdwizardpastprescription closed")
    });
    $("#modelIdprescriptiontemplatesbox").on("hidden.bs.modal", function () {
      self.modelView = "";
      self.hasPastPrescriptions = false;
      self.hasPrescriptionTemplates = false;
      self.hasPastTests = false;
      $('.modal-backdrop').remove();
      console.log("modelIdprescriptiontemplatesbox closed")
    });
    $("#modelIdprescriptiontemplate").on("hidden.bs.modal", function () {
      self.modelView = "";
      self.hasPastPrescriptions = false;
      self.hasPrescriptionTemplates = false;
      self.hasPastTests = false;
      $('.modal-backdrop').remove();
      console.log("modelIdprescriptiontemplate closed")
    });
    $("#wizardOtherReportsModel").on("hidden.bs.modal", function () {
      self.modelView = "";
      self.hasPastPrescriptions = false;
      self.hasPastTests = false;
      $('.modal-backdrop').remove();
      console.log("wizardOtherReportsModel closed")
    });
    console.log(this.authService.selectedPocDetails)
    setTimeout(() =>
      this.addModal(this, "template-pastprescription"), 1);
    // this.isVideoMax=this.doctorService.isVideoMax;
    // this.minMaxVideo();
    this.doctorService.isPrescriptionGenerated = false;
    // if (this.doctorService.isPrescriptionGenerated == true) {
    //   this.backToQueue();
    // }
    console.log(this.activatedRoute);
    this.activatedRoute.params.subscribe(params => {
      this.patientMedicalAdvise = this.doctorService.patientMedicalAdvise;
      // console.log('Track Bug 3: ', this.patientMedicalAdvise)
      this.setDataToLocalStorage();
      if (params['wizardView'] == null || params['wizardView'] == undefined || params['wizardView'] == '') {
        this.wizardView = 'symptomPrescription';
      }
      else if (params['wizardView'] == 'symptomPrescription') {
        this.wizardView = 'symptomPrescription';
      }
      else if (params['wizardView'] == 'medicalPrescription') {
        this.wizardView = 'medicalPrescription';
      }
      else if (params['wizardView'] == 'prescriptionSummary') {
        this.wizardView = 'prescriptionSummary';
      }
      else {
        this.wizardView = 'symptomPrescription';
      }
    });
    this.authService.setPreventNavigation(true);
    this.notificationsService.avaliableStatus = false;
    for (
      let index = 0;
      index < this.authService.employeeDetails.employeePocMappingList.length;
      index++
    ) {
      if (
        (this.authService.employeeDetails.employeePocMappingList[
          index
        ].pocId = this.authService.userAuth.pocId)
      ) {
        console.log("pocId=" + this.authService.userAuth.pocId);
        this.followUpIndex = index;
        break;
      }
    }
    if (this.patientMedicalAdvise.followupAdvices &&
      this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
        .participationSettings.followupDiscountList &&
      this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
        .participationSettings.followupDiscountList[0]
    ) {
      if (
        this.patientMedicalAdvise.followupAdvices.length == 0
      ) {
        this.patientMedicalAdvise.followupAdvices = [new FollowUpDiscount()];
        this.patientMedicalAdvise.followupAdvices[0].validityDays = this.AUTO_FOLLOW_UP_DAYS;
        this.calDiscountWithDays(this.AUTO_FOLLOW_UP_DAYS);
      }
    }
    if (this.doctorService.patientQueue && this.isFrom == "digitizationqueue")
      this.doctorService.getPdfUrl((this.authService.selectedPocDetails.pdfHeaderType == 0) ? this.doctorService.patientQueue.advisePdfUrlWithHeader : this.doctorService.patientQueue.advisePdfUrlWithoutHeader).then(xdata => {
        let h = window.innerHeight;
        $('#scanned_prescription').attr({ data: xdata + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100, overflow: 'auto' });
        console.log(xdata);
      });
    console.log(this.doctorService.patientQueue);

  }


  setDataToLocalStorage() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    //patientMedicalAdvise
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
    window.localStorage.removeItem("patientMedicalAdvise");
    var obj = this.patientMedicalAdvise;
    window.localStorage.setItem("patientMedicalAdvise", cryptoUtil.encryptData(JSON.stringify(obj)));
    //patientQueue
    window.localStorage.removeItem("patientQueue");
    window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
    // console.log("Track Bug 2: ", this.patientMedicalAdvise);
  }
  getDataFromLocalStorage() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem("patientQueue") != undefined &&
      window.localStorage.getItem("patientQueue") != null) {
      this.doctorService.patientQueue = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("patientQueue")));
    }
    if (window.localStorage.getItem("patientMedicalAdvise") != undefined &&
      window.localStorage.getItem("patientMedicalAdvise") != null) {
      this.doctorService.patientMedicalAdvise = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("patientMedicalAdvise")));
    }
    if (window.localStorage.getItem("isFromDigitization") != undefined &&
      window.localStorage.getItem("isFromDigitization") != null) {
      this.doctorService.isFrom = cryptoUtil.decryptData(window.localStorage.getItem("isFromDigitization"));
    }
    // console.log("Track Bug 1: ", this.doctorService.patientMedicalAdvise);
  }
  ngOnDestroy() {
    (<any>$('.modal')).modal('hide')
    console.log("isFrom: ", this.isFrom);
    this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
    // this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
    // console.log("Track Bug 4: ", this.doctorService.patientMedicalAdvise);
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enablePrescriptionAutoSave && !this.doctorService.isPrescriptionGenerated) {
      this.savePrescriptionsOfPatient(this.patientMedicalAdvise, true);
    }
    if (this.doctorService.isNetworkQualityTested == true) {
      if (
        this.doctorService.patientQueue.bookingType &&
        this.doctorService.patientQueue.bookingType == 3 &&
        this.doctorService.patientQueue.bookingSubType &&
        this.doctorService.patientQueue.bookingSubType == 1
      ) {
        //digi
        this.videoCardService.updateSessionStatus('Doctor Video got disconnected', 0);
        this.videoCardService.unSubscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
      }
    }
    this.doctorService.isNetworkQualityTested = true;
    this.authService.setPreventNavigation(false);
    this.notificationsService.avaliableStatus = true;
  }
  closeModals() {
    (<any>$("#modelprescriptionsummary")).modal("hide");
    (<any>$("#wizardvitalsReadingComponentModel")).modal("hide");
    (<any>$("#modelIdprescriptiontemplatesbox")).modal("hide");
    (<any>$("#modelIdwizardpastprescription")).modal("hide");
    (<any>$("#modelIdprescriptiontemplate")).modal("hide");
    (<any>$("#printPDFWizardModel")).modal("hide");
    // (<any>$("#videQuestionModel")).modal("hide");
    (<any>$("wizardOtherReportsModel")).modal("hide");
    // (<any>$("requestConsentModel")).modal("hide");

    $('.modal-backdrop').remove();
  }
  nextPageButton() {


    this.closeModals();
    this.setDataToLocalStorage();
    if (this.wizardView) {

      if (this.wizardView == "") {
        this.router.navigate(['./app/doctor/prescription/generate/symptomPrescription']);
        this.wizardView = "symptomPrescription";
      }
      else if (this.wizardView == "symptomPrescription") {
        this.router.navigate(['./app/doctor/prescription/generate/medicalPrescription']);
        this.wizardView = "medicalPrescription";
      } else if (this.wizardView == "medicalPrescription") {
        this.router.navigate(['./app/doctor/prescription/generate/prescriptionSummary']);
        this.wizardView = "prescriptionSummary";
      }
    }
    this.doctorService.wizardView = this.wizardView;
  }
  calDiscountWithDays(days: number) {
    console.log("days=" + days);
    if (days <= 0) {
      this.patientMedicalAdvise.followupAdvices = new Array();
      return;
    }
    let length = this.authService.employeeDetails.employeePocMappingList[this.followUpIndex]
      .participationSettings.followupDiscountList.length;
    for (let i = 0; i < length; i++) {
      if (
        (days <=
          this.authService.employeeDetails.employeePocMappingList[
            this.followUpIndex
          ].participationSettings.followupDiscountList[i].validityDays) && (
          this.authService.employeeDetails.employeePocMappingList[
            this.followUpIndex
          ].participationSettings.followupDiscountList[i].validityDays > 0
        )
      ) {
        if (!this.patientMedicalAdvise.followupAdvices[0]) {
          this.patientMedicalAdvise.followupAdvices = [];
        }
        this.patientMedicalAdvise.followupAdvices[0].discountPercent = this.authService.employeeDetails.employeePocMappingList[
          this.followUpIndex
        ].participationSettings.followupDiscountList[i].discountPercent
        return;
      }
    }
    // this.patientMedicalAdvise.followupAdvices = new Array();
  }
  openTempletListView() {
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
    if (this.doctorService.daignosticTestList && this.mandatoryDiagnosisType) {
      for (var i = 0; i < this.doctorService.daignosticTestList.length; i++) {
        if (this.doctorService.daignosticTestList[i].isFinalSelected == undefined || this.doctorService.daignosticTestList[i].isProvisionalSelected == null) {
          alert("Please select Diagnosis Type");
          return;
        }

        if (this.doctorService.daignosticTestList[i].isFinalSelected == false && this.doctorService.daignosticTestList[i].isProvisionalSelected == false) {
          alert("Please select Diagnosis  Type");
          return;
        }
      }
    }

    if (this.doctorService.patientMedicalAdvise.admissionNote.procedureList.length > 0) {
      if (this.doctorService.patientMedicalAdvise.admissionNote.admissionDateFrom == null || this.doctorService.patientMedicalAdvise.admissionNote.admissionDateFrom == undefined) {
        this.toast.show('Please select the admission date', "bg-danger text-white font-weight-bold", 3000); return;
      }
    }
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enablePrescriptionAutoSave) {
      this.savePrescriptionsOfPatient(this.patientMedicalAdvise, true);
    }
    if (this.noOfTemplates > 0 && this.wizardView == "symptomPrescription") {
      this.modelView = "templatesbox";
      (<any>$("#modelIdprescriptiontemplatesbox")).modal("show");
    } else {
      this.nextPageButton();
    }
  }
  routeToPage(url: string) {
    this.setDataToLocalStorage();
    this.doctorService.patientMedicalAdvise = this.patientMedicalAdvise;
    // console.log("Track Bug 6: ", this.doctorService.patientMedicalAdvise);
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enablePrescriptionAutoSave) {
      this.savePrescriptionsOfPatient(this.patientMedicalAdvise, true);
    }
    if (url == 'symptomPrescription') {
      this.router.navigate(['./app/doctor/prescription/generate/symptomPrescription']);
    } else if (url == 'medicalPrescription') {
      this.router.navigate(['./app/doctor/prescription/generate/medicalPrescription']);
    }
    else if (url == 'prescriptionSummary') {
      this.router.navigate(['./app/doctor/prescription/generate/prescriptionSummary']);
    }
    else {
      this.router.navigate([url]);
    }
  }
  setAdviceFromTemplate(template) {
    if (!template) {
      this.nextPageButton();
      return;
    }
    this.hasPrescriptionTemplates = false;
    this.templateAdvice = new PatientMedicalAdvise();
    this.templateAdvice.title = template.title;
    this.templateAdvice.pharmacyAdvises = template.pharmacyAdvises;
    this.templateAdvice.investigationAdvises = template.investigationAdvises;
    this.templateAdvice.diagnosisList = template.diagnosisList;
    this.templateAdvice.noteList = template.noteList;
    this.templateAdvice.doctorNoteList = template.doctorNoteList;
    this.hasPrescriptionTemplates = true
  }
  maxVideo() {
    this.isVideoMax = true;
    this.doctorService.isVideoMax = true;
    let elem = document.getElementById("videoCard");
    if (elem && (<any>elem).requestFullscreen) {
      (<any>elem).requestFullscreen();
    } else if (elem && (<any>elem).mozRequestFullScreen) { /* Firefox */
      (<any>elem).mozRequestFullScreen();
    } else if (elem && (<any>elem).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      (<any>elem).webkitRequestFullscreen();
    } else if (elem && (<any>elem).msRequestFullscreen) { /* IE/Edge */
      (<any>elem).msRequestFullscreen();
    }
    setTimeout(() => {
      let id = window;
      let width: number = Math.floor(parseInt($(id).width() + ''));
      console.log(width);
      let height: number = Math.floor(parseFloat($(id).height() + '')) - 2 * $(".videoCard .card-footer").height() - 15;
      console.log(height);
      $(".OT_root.OT_subscriber.OT_fit-mode-cover")
        .css('width', width + 'px');
      $(".OT_root.OT_subscriber.OT_fit-mode-cover")
        .css('min-height', height + 'px');

      $(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover")
        .css('width', (width * 0.30) + 'px');
      $(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover")
        .css('height', ((height * 0.25) + 'px'));
      $(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover")
        .css('margin-top',
          '-' +
          (parseInt($(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover").height() + '') +
            parseInt($(".videoCard .card-footer").height() - 30 + '')
          ) + 'px');
    }, 300);
  }

  onClickPrint(pdfUrl = this.doctorService.pdfUrl) {
    this.authService.getTempUrl(pdfUrl).then((url: BaseResponse) => {
      if ((url.statusCode == 201 || url.statusCode == 200)) {
        this.authService.openPDF(url.data);
      } else {
        this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
    })
  }
  closePrintView() {
    console.log(' closePrintView isVideo---' + this.isVideo);
    if (this.isVideo && this.doctorService.isVideo) {
      (<any>$("#modelprescriptionsummary")).modal("hide");

      (<any>$("#printPDFWizardModel")).modal("hide");

      (<any>$("#modelIdpastprescription")).modal("hide");


      (<any>$("#modelIdprescriptiontemplate")).modal("hide");


      $(".fullScreeVideoBtn").hide();
      this.maxVideo();
    }
    else {
      this.backToQueue();
    }
  }
  backToQueue() {

    (<any>$("#printPDFWizardModel")).modal("hide");

    (<any>$("#template-pastprescription")).modal("hide");
    $('.modal-backdrop').remove();

    (<any>$("#modelprescriptionsummary")).modal("hide");

    (<any>$("#modelIdpastprescription")).modal("hide");

    (<any>$("#modelIdprescriptiontemplate")).modal("hide");

    console.log('@@@@check routing' + this.doctorService.isFrom);
    window.localStorage.removeItem("patientMedicalAdvise");
    window.localStorage.removeItem("patientQueue");
    window.localStorage.removeItem("component_data");
    this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();

    if (this.doctorService.isFrom == "doctorhomeconsult") {
      this.router.navigate(["./app/doctor/doctorhomeconsult/listing"]);
    }
    else if (this.doctorService.isFrom == "doctordashboard") {
      this.router.navigate(["./app/doctor/dashboard"]);
    } else if (this.doctorService.isFrom == "digitizationqueue") {
      this.router.navigate(["./app/doctor/prescriptiondigitizationqueue"]);
    } else {
      this.router.navigate(["./app/doctor/queue"]);
    }
  }
  getSessionId() {
    console.log("ok12-->" + JSON.stringify(this.doctorService.SESSION_ID))
    return this.doctorService.SESSION_ID;
  }
  savePrescriptionsOfPatient(patientMedicalAdvise = this.doctorService.patientMedicalAdvise, isAutoSave: boolean = false) {
    if (this.doctorService.daignosticTestList && this.mandatoryDiagnosisType) {
      for (var i = 0; i < this.doctorService.daignosticTestList.length; i++) {
        if (this.doctorService.daignosticTestList[i].isFinalSelected == undefined || this.doctorService.daignosticTestList[i].isProvisionalSelected == null) {
          alert("Please select Diagnosis  Type");
          return;
        }

        if (this.doctorService.daignosticTestList[i].isFinalSelected == false && this.doctorService.daignosticTestList[i].isProvisionalSelected == false) {
          alert("Please select Diagnosis Type");
          return;
        }
      }
    }
    if (this.doctorService.isFrom == "digitizationqueue") {
      // patientMedicalAdvise.prescriptionDigitizationStatus = PatientMedicalAdvise.DIGITIZATION_STATUS_SENT_FOR_APPROVAL;
      patientMedicalAdvise.digitizationEmpId = this.empId;
    }
    this.doctorService
      .updatePrePrescriptionDetails(patientMedicalAdvise)
      .then(data => {
        if (data) {
          console.log("updatePrePrescriptionDetails");
          console.log(data);
          if (data.statusCode == 201 || data.statusCode == 200) {
            if (!isAutoSave) {
              this.toast.show('Successfully Saved', "bg-success text-white font-weight-bold", 5000);
            }
          }
          if (!isAutoSave && this.doctorService.isFrom == "digitizationqueue") {
            this.backToQueue();
          }
        }
      });
  }
  hideModel(id: string) {
    this.modelView = '';
    (<any>$(id)).modal('hide');
  }
  setIsVideo(isVideo: boolean) {
    this.doctorService.isVideo = isVideo;
    this.isVideo = isVideo;
  }
  isVideoConsultation() {
    if (
      this.doctorService.patientQueue.bookingType == 1 ||
      (this.doctorService.patientQueue.bookingType == 3 &&
        (this.doctorService.patientQueue.bookingSubType == 1 ||
          this.doctorService.patientQueue.bookingSubType == 2))
    ) {
      return true;
    }
    return false
  }

  onClickTemplateDetails(template: DoctorPrescriptionTemplate) {
    this.templateAdvice.title = template.title;
    this.templateAdvice.pharmacyAdvises = template.pharmacyAdvises;
    this.templateAdvice.investigationAdvises = template.investigationAdvises;
    this.templateAdvice.diagnosisList = template.diagnosisList;
    this.templateAdvice.noteList = template.noteList;
    this.templateAdvice.doctorNoteList = template.doctorNoteList;
    if (this.modelView != 'templatesbox')
      this.modelView = "prescriptiontemplate";
    this.doctorService.prescriptionTemplate = template;
    this.hasPrescriptionTemplates = false;
    setTimeout(() => { this.hasPrescriptionTemplates = true; }, 10)
    // this.prescriptionTemplate= this.doctorService.prescriptionTemplate;
    // this.hasPrescriptionTemplates = true;
    if (this.doctorService.prescriptionTemplate && this.modelView != 'templatesbox') {
      (<any>$("#template-pastprescription")).modal("hide");
      (<any>$("#modelIdprescriptiontemplate")).modal("show");
    }
  }
  onClickPastPrescription(pastPrescription: PatientMedicalAdvise) {
    console.log("143");
    console.log(pastPrescription);
    let self = this;
    if (pastPrescription) {

      if (pastPrescription.uploadedPrescription) {
        this.authService.openPDF((this.authService.selectedPocDetails.pdfHeaderType == 0) ? pastPrescription.advisePdfUrlWithHeader : pastPrescription.advisePdfUrlWithoutHeader);
        return;
      }


      console.log("154");
      console.log(pastPrescription);

      this.doctorService.pastPrescription = pastPrescription;
      this.pastPrescription = this.doctorService.pastPrescription;

      this.pastPrescription.localDOBYear = this.commonUtil.getAge(pastPrescription.patientDOB).split(",")[0] + this.commonUtil.getAge(pastPrescription.patientDOB).split(",")[1];
      this.hasPastPrescriptions = true;
      if (this.doctorService.pastPrescription) {
        console.log("163");
        console.log(pastPrescription);
        this.modelView = "pastprescription";
        (<any>$("#template-pastprescription")).modal("hide");
        (<any>$("#modelIdwizardpastprescription")).modal("show");
      }
    }
  }

  onClickTest(pastPrescription) {
    let self = this;
    this.doctorService
      .getPastPatientTests(pastPrescription)
      .then(data => {
        if (data) {
          console.log("updatePrePrescriptionDetails");
          console.log(data);
          this.hasPastTests = true;
          this.pastTests = JSON.parse(JSON.stringify(data));
          self.modelView = "pastprescriptionTest";
          $("#modelIdwizardpastprescription").on("hidden.bs.modal", function () {
            self.modelView = "";
            self.hasPastPrescriptions = false;
            self.hasPastTests = false;
            $('.modal-backdrop').remove();
            console.log("modelIdwizardpastprescription closed")
          });
          (<any>$("#template-pastprescription")).modal("hide");
          (<any>$("#modelIdwizardpastprescription")).modal("show");
        }
      });
  }
  openURLInNewTab(url) {
    console.log(url)
    this.authService.openPDF(url);
  }

  minMaxVideo(eventVal) {
    this.isVideoMax = eventVal;
  }

  raisePostConsultVideo(event) {
    this.isVideoMax = true;
    this.wizardView = 'prescriptionSummary';
  }

  placeCall() {
    this.doctorService.placeClickCallRequest(this.patientMedicalAdvise.parentProfileId, this.patientMedicalAdvise.doctorId, this.patientMedicalAdvise.orderId).then(resp => {
      if (resp && (resp.statusCode == 200 || resp.statusCode == 201)) {
        this.toast.show(resp.statusMessage, "bg-success text-white font-weight-bold", 2000);
      } else {
        this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch(err => {
      this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
    });
  }

  onOtpChange() {

  }

  onCloseModalPreQuestionnaire() {
    this.showQuestionnaire = false;
  }

  onClickImageAnnotator() {
    this.showImageAnnotator = true;
    if (this.showImageAnnotator) {
      (<any>$("#imageAnnotator")).modal("show");
    }
  }

  onCloseImageAnnotator() {
    this.showImageAnnotator = false;
    (<any>$("#imageAnnotator")).modal("hide");
  }

  addAnnotatedImage(annotatedImage: string) {
    this.patientMedicalAdvise.annotatedImageUrl = annotatedImage;
  }
}
