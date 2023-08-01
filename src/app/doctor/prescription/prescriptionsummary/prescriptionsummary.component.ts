import { Question } from './../../../model/phr/question';
import { PHR } from './../../../model/phr/phr';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "../../../app.config";
import { AuthService } from "../../../auth/auth.service";
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { CommonUtil } from "../../../base/util/common-util";
import { DoctorUtil } from '../../../base/util/doctor-util';
import { Config } from './../../../base/config';
import { PrescriptionConstants } from '../../../constants/doctor/prescriptionConstants';
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { BaseDiagnosis } from '../../../model/advice/baseDiagnosis';
import { DoctorPrescriptionTemplate } from "../../../model/advice/doctorPrescriptionTemplate";
import { InvestigationAdvises } from '../../../model/advice/investigationAdvises';
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { PharmacyAdvises } from '../../../model/advice/pharmacyAdvises';
import { TextAdvise } from '../../../model/advice/textAdvise';
import { WellnessAdvise } from '../../../model/advice/wellnessAdvice';
import { FavouritePartners } from "../../../model/employee/favouritePartners";
import { BasePocDetails } from '../../../model/reception/basePocDetails';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { ServiceItem } from '../../../model/service/serviceItem';
import { DoctorService } from '../../doctor.service';
import { ToasterService } from './../../../layout/toaster/toaster.service';
import { Immunization } from './../../../model/advice/immunization';
import { Symptoms } from './../../../model/advice/symptoms';
import { MedicalNote } from './../../../model/pharmacy/medicalNote';
import { VideoCardService } from './../videocard/videocard.service';
import { FileUtil } from '../../../base/util/file-util';
import { AdmissionNote } from '../../../model/advice/admissioNote';
import { ReferralDoctor } from './../../../model/advice/referralDoctor';
import { DoctorDetails } from './../../../model/employee/doctordetails';


const PRESCRIPTION_GENERATED = "Prescription Generated";
@Component({
  selector: "prescriptionsummary",
  templateUrl: "./prescriptionsummary.template.html",
  styleUrls: ["./prescriptionsummary.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})

export class PrescriptionSummaryComponent implements OnInit, OnDestroy {
  patientMedicalAdviseModelId: string;
  @Output("patientMedicalAdviseOutput")
  patientMedicalAdviseOutput = new EventEmitter();

  @Output("minMaxVideo") minMaxVideo = new EventEmitter<boolean>();
  @Input("pastPrescription") pastPrescription: PatientMedicalAdvise;
  @Input("patientQueue") patientQueue: PatientQueue;
  @Input("isFrom") isFrom: string = '';
  @Input("isFooterHidden")
  isFooterHidden: boolean = false;
  @Output("wizardView") wizardView = new EventEmitter<string>();
  @Output("postConsultVideoMaxView") postConsultVideoMaxView = new EventEmitter<string>();

  patientAge: string;

  displayMedicalAdvice: PatientMedicalAdvise = new PatientMedicalAdvise();

  // fileUploadData: string;
  // hasCheckBoxValidation: boolean = false;
  // checkBoxValidationMessage: string;

  uploadPercentage: number = 0;

  modelView: string = '';
  errorMessage: string = "";
  pharmacyPartners: FavouritePartners[] = new Array<FavouritePartners>();;

  investigationPartners: FavouritePartners[] = new Array<FavouritePartners>();


  imageExtentions = ['.jpg', '.png', '.jpeg']
  pdfUrl: string;
  textAdvise: MedicalNote = new MedicalNote();
  doctorTextAdvise: MedicalNote = new MedicalNote();
  isVideo: boolean;
  MAX_FILES_COUNT_CLINICAL: number = 3;//for upload clinical examination
  MAX_FILES_COUNT_ADVICE: number = 5;//for upload Advice
  canRouteToMultiple: boolean = false;
  empId: number;
  isFromDigitization: boolean;
  enableInvestigationNotes: boolean;
  enableDoctorNotes: boolean;
  disableImmunization: boolean = false;
  procedurePrescriptionLabel: string = null;
  nonMedicationPrescriptionLabel: string = null;
  admissionNotePrescriptionLabel: string = null;
  pharmacyIdList: Array<number> = new Array<number>();
  WHOPhr: PHR = new PHR();
  question: Question[] = new Array<Question>();
  checkedWHOPhr: boolean = false;
  savedWHOPhr: boolean = false;

  constructor(
    config: AppConfig,
    private toast: ToasterService,
    private commonUtil: CommonUtil,
    private spinnerService: SpinnerService,
    private videoCardService: VideoCardService,
    private doctorService: DoctorService,
    private router: Router,
    private authService: AuthService,
    private fileUtil: FileUtil
  ) {
    this.enableInvestigationNotes = Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableInvestigationNotes ? Config.portal.doctorOptions.enableInvestigationNotes : false;
    this.enableDoctorNotes = Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorNotes ? Config.portal.doctorOptions.enableDoctorNotes : false;
    this.disableImmunization = Config.portal.doctorOptions && Config.portal.doctorOptions.disableImmunization ? Config.portal.doctorOptions.disableImmunization : false;
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
    this.nonMedicationPrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel && Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.nonMedicationLabel : null;
    this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
    this.patientMedicalAdviseModelId =
      "patientMedicalAdviseModel" + Math.floor(Math.random() * 1000 + 1);
    this.empId = this.authService.employeeDetails.empId;
  }



  ngOnInit() {
    console.log('isFrom >>' + this.isFrom);
    let commonUtil = new CommonUtil();
    this.isFromDigitization = false;

    if (this.doctorService.isFrom == 'digitizationqueue')
      this.isFromDigitization = true;

    if (this.isFrom == '') {
      // this.getDataFromLocalStorage();
      this.displayMedicalAdvice = JSON.parse(JSON.stringify(this.doctorService.patientMedicalAdvise));
      if (!this.displayMedicalAdvice.uploadedClinicalExaminationFileList) this.displayMedicalAdvice.uploadedClinicalExaminationFileList = []
    }
    else if (this.isFrom == 'pastPrescription') {
      this.displayMedicalAdvice = JSON.parse(JSON.stringify(this.pastPrescription));
    }
    else if (this.isFrom == 'templateView') {
      this.displayMedicalAdvice = JSON.parse(JSON.stringify(this.pastPrescription));
    }
    else if (this.isFrom == 'videoprescription') {
      this.displayMedicalAdvice = new PatientMedicalAdvise();
      if (this.patientQueue) {
        this.displayMedicalAdvice.patientFirstName = this.patientQueue.patientFirstName;
        this.displayMedicalAdvice.patientTitle = this.patientQueue.patientTitle;
        this.displayMedicalAdvice.patientLastName = this.patientQueue.patientLastName ? this.patientQueue.patientLastName : '';
        this.displayMedicalAdvice.patientGender = this.patientQueue.patientGender;
        this.displayMedicalAdvice.patientDOB = this.patientQueue.patientDOB;
        this.displayMedicalAdvice.patientContactNumber = this.patientQueue.patientContactNumber;
      }
      let onUpdatePrescriptionEvent = this.videoCardService.onUpdatePrescription()
        .subscribe((prescription) => {
          if (this.isFrom == 'videoprescription') {
            console.log(prescription);
            this.displayMedicalAdvice = prescription;
            this.patientAge = commonUtil.getAge(this.displayMedicalAdvice.patientDOB);
            if (this.displayMedicalAdvice.noteList.length > 0) {
              if (this.displayMedicalAdvice.noteList[0] && this.displayMedicalAdvice.noteList[0].title != null &&
                this.displayMedicalAdvice.noteList[0].title != undefined) {
                this.textAdvise.title = this.displayMedicalAdvice.noteList[0].title;
              }
              else this.textAdvise.title = "";
            } else this.textAdvise.title = "";
            if (this.displayMedicalAdvice.doctorNoteList && this.displayMedicalAdvice.doctorNoteList.length > 0) {
              if (this.displayMedicalAdvice.doctorNoteList[0] && this.displayMedicalAdvice.doctorNoteList[0].title != null &&
                this.displayMedicalAdvice.doctorNoteList[0].title != undefined) {
                this.doctorTextAdvise.title = this.displayMedicalAdvice.doctorNoteList[0].title;
              }
              else this.doctorTextAdvise.title = "";
            } else this.doctorTextAdvise.title = "";

          } else {
            onUpdatePrescriptionEvent.unsubscribe();
          }
        })
    }

    this.patientAge = commonUtil.getAge(this.displayMedicalAdvice.patientDOB);
    if (this.authService.employeeDetails.partners) {
      this.pharmacyPartners = this.authService.employeeDetails.partners.filter(
        (pharmacyPartners) => {
          console.log(pharmacyPartners.subTypeId);
          console.log(PrescriptionConstants.DOCTOR_FAVOURATE_SUBTYPEID_PHARMACY);
          return pharmacyPartners.subTypeId == 22;
        }
      );
      if (this.doctorService.patientQueue)
        this.patientAge = this.doctorService.patientQueue.localDOBYear;

    }
    this.patientAge = this.patientAge.includes(',') ? this.patientAge.substring(0, this.patientAge.length - 1) : this.patientAge;

    console.log("Login data of POC");
    console.log(this.authService.employeeDetails.partners);
    console.log("pharmacyPartners");

    console.log(this.pharmacyPartners);


    //filter 22
    if (this.pharmacyPartners) {
      for (let index = 0; index < this.pharmacyPartners.length; index++) {
        if (this.pharmacyPartners[index].preferred) {
          let temppharmacyPartners = this.pharmacyPartners[index];
          this.pharmacyPartners.splice(index, 1);
          this.pharmacyPartners.unshift(temppharmacyPartners);
        }
      }
      let currentPoc = new FavouritePartners();
      currentPoc.details = this.authService.selectedPocDetails;
      if (currentPoc.details) {
        let isPresent: boolean = false;
        for (let i = 0; i < this.pharmacyPartners.length; i++) {
          if (this.pharmacyPartners[i].details.pocId == currentPoc.details.pocId)
            isPresent = true;
        }
        if (!isPresent)
          this.pharmacyPartners.unshift(currentPoc);
      }

      // this.selectedPharmacyPartners[0] = this.pharmacyPartners[0];
      let basePoc: BasePocDetails = new BasePocDetails();
      basePoc.pocId = this.pharmacyPartners[0].details.pocId;
      basePoc.pocName = this.pharmacyPartners[0].details.pocName;
      basePoc.email = this.pharmacyPartners[0].details.email;
      if (this.pharmacyPartners[0].details != null) {
        basePoc.contactList = this.pharmacyPartners[0].details.contactList;
        basePoc.address = this.pharmacyPartners[0].details.address;
      }
      console.log(this.displayMedicalAdvice.pharmacyAdvises);
      if (!this.displayMedicalAdvice.pharmacyAdvises) {
        this.displayMedicalAdvice.pharmacyAdvises = new PharmacyAdvises();
      }

      if (!this.displayMedicalAdvice.pharmacyAdvises.routedToPoc ||
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc == undefined ||
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc == null
      ) {
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc = new Array<BasePocDetails>();
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc.unshift(basePoc);
        console.log(this.displayMedicalAdvice.pharmacyAdvises);

      }
    }
    //poc id match with current pocid
    this.authService.selectedPOCMapping.roleIdList;

    //serviceTypeMap.pharm id
    //1st

    //2nd preferred in partners;
    if (this.authService.employeeDetails.partners) {
      this.investigationPartners = this.authService.employeeDetails.partners.filter(
        investigationPartners => {
          return investigationPartners.subTypeId == 23;
        }
      );
    }

    for (let i = 0; i < this.investigationPartners.length; i++) {
      console.log(this.investigationPartners[i].details.pocName);
    }
    if (this.investigationPartners) {
      for (let index = 0; index < this.investigationPartners.length; index++) {
        if (this.investigationPartners[index].preferred) {
          let tempinvestigationPartner = this.investigationPartners[index];
          this.investigationPartners.splice(index, 1);
          this.investigationPartners.unshift(tempinvestigationPartner);

        }
      }
    }

    // for (let index = 0; index < this.authService.employeeDetails.pocRolesList.length; index++) {
    //   if (this.authService.employeeDetails.pocRolesList[index].serviceTypeMap.hasOwnProperty("Laboratory Investigations")) {
    //     let pocDetails: FavouritePartners = new FavouritePartners();
    //     pocDetails.details = this.authService.selectedPocDetails;
    //     pocDetails.subTypeId = PrescriptionConstants.DOCTOR_FAVOURATE_SUBTYPEID_INVESTIGATION;
    //     if (this.investigationPartners) {
    //       this.investigationPartners.unshift(pocDetails);
    //     }

    //   }
    // }
    // filter 23




    //doctor--pocRoles 
    // serivice type map(string,long) in pocEoles
    // pharmacyID --long value-9889 self display true
    // dygnosits  - long value - 1 or 2 or 3 self display true
    // 
    //    
    let currentPoc = new FavouritePartners();
    currentPoc.details = this.authService.selectedPocDetails;
    if (currentPoc.details) {
      let isPresent: boolean = false;
      for (let i = 0; i < this.investigationPartners.length; i++) {
        if (this.investigationPartners[i].details.pocId == currentPoc.details.pocId)
          isPresent = true;
      }
      if (!isPresent)
        this.investigationPartners.unshift(currentPoc);
    }
    let basePoc: BasePocDetails = new BasePocDetails();
    basePoc.pocId = this.investigationPartners[0].details.pocId;
    basePoc.pocName = this.investigationPartners[0].details.pocName;
    basePoc.email = this.investigationPartners[0].details.email;
    if (this.investigationPartners[0].details != null) {
      basePoc.contactList = this.investigationPartners[0].details.contactList;
      basePoc.address = this.investigationPartners[0].details.address;
    }
    console.log(this.displayMedicalAdvice.investigationAdvises);
    if (!this.displayMedicalAdvice.investigationAdvises ||
      this.displayMedicalAdvice.investigationAdvises == undefined ||
      this.displayMedicalAdvice.investigationAdvises == null
    ) {
      this.displayMedicalAdvice.investigationAdvises = new InvestigationAdvises();
    }

    if (!this.displayMedicalAdvice.investigationAdvises.routedToPoc ||
      this.displayMedicalAdvice.investigationAdvises.routedToPoc == undefined ||
      this.displayMedicalAdvice.investigationAdvises.routedToPoc == null
    ) {
      this.displayMedicalAdvice.investigationAdvises.routedToPoc = new Array<BasePocDetails>();
      this.displayMedicalAdvice.investigationAdvises.routedToPoc.unshift(basePoc);
      console.log(this.displayMedicalAdvice.investigationAdvises);

    }


    if (this.displayMedicalAdvice.noteList && this.displayMedicalAdvice.noteList.length > 0) {
      if (this.displayMedicalAdvice.noteList[0] && this.displayMedicalAdvice.noteList[0].title != null &&
        this.displayMedicalAdvice.noteList[0].title != undefined) {
        this.textAdvise.title = this.displayMedicalAdvice.noteList[0].title;
      }
      else this.textAdvise.title = "";
    } else this.textAdvise.title = "";

    if (this.displayMedicalAdvice.doctorNoteList && this.displayMedicalAdvice.doctorNoteList.length > 0) {
      if (this.displayMedicalAdvice.doctorNoteList[0] && this.displayMedicalAdvice.doctorNoteList[0].title != null &&
        this.displayMedicalAdvice.doctorNoteList[0].title != undefined) {
        this.doctorTextAdvise.title = this.displayMedicalAdvice.doctorNoteList[0].title;
      }
      else this.doctorTextAdvise.title = "";
    } else this.doctorTextAdvise.title = "";

    //investi 3 any prefered

    this.isVideo = this.doctorService.isVideo;
    if ((this.pastPrescription == undefined || this.pastPrescription == null) && this.isFrom == '') {
      // this.setDataToLocalStorage() ;
    }
    if (this.isFrom == '') {
      this.videoCardService.updatePrescription(this.displayMedicalAdvice);
    }
    if (!this.displayMedicalAdvice.uploadedFileList)
      this.displayMedicalAdvice.uploadedFileList = [];
  }


  ngOnDestroy() {
    if (this.isFrom == '') {
      // this.setDataToLocalStorage();
      this.doctorService.patientMedicalAdvise = this.displayMedicalAdvice;
      // window.localStorage.removeItem("patientMedicalAdvise");
      // window.localStorage.removeItem("patientQueue");
      // this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
      // this.doctorService.patientQueue = new PatientQueue();
    }
    // console.log("Track Bug 10: ", this.doctorService.patientMedicalAdvise);
    this.doctorService.phrWHOCheck = false;
  }

  setDataToLocalStorage() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    //patientMedicalAdvise
    this.doctorService.patientMedicalAdvise = this.displayMedicalAdvice;
    window.localStorage.removeItem("patientMedicalAdvise");
    var obj = this.displayMedicalAdvice;
    window.localStorage.setItem("patientMedicalAdvise", cryptoUtil.encryptData(JSON.stringify(obj)));
    //patientQueue
    window.localStorage.removeItem("patientQueue");
    window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
  }


  isCaseSheet() { return this.doctorService.caseSheet }
  copyAdviceFromQueue() {
    let doctorAdvice: PatientMedicalAdvise = JSON.parse(JSON.stringify(this.displayMedicalAdvice));
    this.displayMedicalAdvice = new PatientMedicalAdvise();
    //copy from previous data
    this.displayMedicalAdvice.symptomList = doctorAdvice.symptomList;
    this.displayMedicalAdvice.clinicalExaminationList = doctorAdvice.clinicalExaminationList;
    this.displayMedicalAdvice.diagnosisList = doctorAdvice.diagnosisList;
    this.displayMedicalAdvice.pharmacyAdvises = doctorAdvice.pharmacyAdvises;
    this.displayMedicalAdvice.investigationAdvises = doctorAdvice.investigationAdvises;
    this.displayMedicalAdvice.procedureList = doctorAdvice.procedureList;
    this.displayMedicalAdvice.nonMedicationAdvises = doctorAdvice.nonMedicationAdvises;
    this.displayMedicalAdvice.admissionNote = doctorAdvice.admissionNote;
    this.displayMedicalAdvice.immunizationAdvices = doctorAdvice.immunizationAdvices;
    this.displayMedicalAdvice.referralDoctorList = doctorAdvice.referralDoctorList;
    this.displayMedicalAdvice.followupAdvices = doctorAdvice.followupAdvices;
    this.displayMedicalAdvice.noteList = doctorAdvice.noteList;
    this.displayMedicalAdvice.uploadedFileList = doctorAdvice.uploadedFileList;
    this.displayMedicalAdvice.uploadedClinicalExaminationFileList = doctorAdvice.uploadedClinicalExaminationFileList;
    //fromQueue
    this.displayMedicalAdvice.doctorId = this.doctorService.patientQueue.doctorId;
    this.displayMedicalAdvice.doctorFirstName = this.doctorService.patientQueue.doctorFirstName;
    this.displayMedicalAdvice.doctorLastName = this.doctorService.patientQueue.doctorLastName ? this.doctorService.patientQueue.doctorLastName : '';
    this.displayMedicalAdvice.doctorTitle = this.doctorService.patientQueue.doctorTitle;
    this.displayMedicalAdvice.pocId = this.doctorService.patientQueue.pocId;
    this.displayMedicalAdvice.serviceId = this.doctorService.patientQueue.serviceId;
    this.displayMedicalAdvice.doctorProfilePic = this.authService.employeeDetails.imageUrl;
    this.displayMedicalAdvice.bookingType = this.doctorService.patientQueue.bookingType;
    this.displayMedicalAdvice.bookingSubType = this.doctorService.patientQueue.bookingSubType;
    this.displayMedicalAdvice.patientId = this.doctorService.patientQueue.patientProfileId;
    this.displayMedicalAdvice.patientFirstName = this.doctorService.patientQueue.patientFirstName;
    this.displayMedicalAdvice.patientTitle = this.doctorService.patientQueue.patientTitle;
    this.displayMedicalAdvice.patientLastName = this.doctorService.patientQueue.patientLastName ? this.doctorService.patientQueue.patientLastName : '';
    this.displayMedicalAdvice.patientDOB = this.doctorService.patientQueue.patientDOB;
    this.displayMedicalAdvice.patientGender = this.doctorService.patientQueue.patientGender;
    this.displayMedicalAdvice.patientProfilePic = this.doctorService.patientQueue.patientProfilePic;
    this.displayMedicalAdvice.patientContactNumber = this.doctorService.patientQueue.patientContactNumber;
    this.displayMedicalAdvice.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    this.displayMedicalAdvice.invoiceId = this.doctorService.patientQueue.invoiceId;
    this.displayMedicalAdvice.orderId = this.doctorService.patientQueue.orderId;
    this.displayMedicalAdvice.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    this.displayMedicalAdvice.time = this.doctorService.patientQueue.time;
    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    this.displayMedicalAdvice.date = date.getTime();

    this.displayMedicalAdvice.adviseGeneratedTime = new Date().getTime() - date.getTime();
  }
  onClickUploadFiles(id: string) {
    $(id).click();
  }

  async checkWHOConditionsAndGeneratePrescription(modelView) {
    this.pharmacyIdList = new Array<number>();
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableWHOQuestionnaire) {
      this.displayMedicalAdvice.pharmacyAdvises.pharmacyAdviceList.forEach(doc => {
        this.pharmacyIdList.push(doc.productId)
      })
      try {
        this.spinnerService.start();
        let data = await this.doctorService.getWHOPhrQuestions(this.pharmacyIdList);
        this.spinnerService.stop();
        if (data != null && data != undefined && data.phr && data.phr[0].activities
          && data.phr[0].activities[0].question) {
          this.WHOPhr = data;
          this.question = this.WHOPhr.phr[0].activities[0].question;
          this.WHOPhr.orderId = this.displayMedicalAdvice.orderId;
          this.WHOPhr.doctorId = this.displayMedicalAdvice.doctorId;
          this.WHOPhr.profileId = this.displayMedicalAdvice.patientId;
          this.WHOPhr.createdTime = this.displayMedicalAdvice.date;
          this.doctorService.phrWHOCheck = this.checkedWHOPhr = true;
          // this.closeModals();
          (<any>$("#modelwhophrquestions")).modal({
            show: true,
            escapeClose: true,
            clickClose: true,
            showClose: true,
            backdrop: true,
            keyboard: false
          });
        }
      } catch (error) {
        this.spinnerService.stop();
        console.log("Failed to retrieve questions", error);
      }
      if (!this.checkedWHOPhr) {
        this.generateAdvice(modelView);
      }
    } else {
      this.generateAdvice(modelView);
    }
  }

  saveWHOPhrAnswers() {
    this.WHOPhr.phr[0].activities[0].question = this.question;
    console.log("answer-->", JSON.stringify(this.question));
    let check: boolean = false;
    this.question.forEach(doc => {
      if (doc.ans == "") {
        check = true;
      }
    });
    if (check) {
      alert("Please answer all questions")
      return;
    }
    this.spinnerService.start();
    this.doctorService.saveWHOPhrAnswers(this.WHOPhr).then(data => {
      this.spinnerService.stop();
      if (data.statusCode == 200) {
        this.savedWHOPhr = true;
        this.doctorService.phrWHOCheck = false;
        this.hideModal('#modelwhophrquestions');
        this.toast.show("Successfully submitted", data.statusCode == 200 ? "bg-success text-white font-weight-bold" : "bg-warning text-white font-weight-bold", 5000);
        this.generateAdvice();
      }
    }).catch((error) => {
      console.log("Failed to retrieve questions")
    });
  }

  onValueChecked(i): void {

    if ((<any>$("#" + i + ":checked")).length > 0)
      this.question[i].ans = "Yes";
    else
      this.question[i].ans = "No";
  }

  onRadioChange(i, ans) {
    if (ans == 'yes') {
      this.question[i].ans = "Yes";
    }
    else if (ans == 'no') {
      this.question[i].ans = "No";
    }
  }

  async generateAdvice(caseSheet = false) {
    this.modelView = "";
    if (this.isVideo && this.doctorService.isVideo
      && Config.portal && Config.portal.doctorOptions
      && Config.portal.doctorOptions.disablePrintVideoPresc
      && this.isFrom == 'templateView') {
      // Disable the print and close popup if the mode is video and disablePrintVideoPresc is true
      this.postConsultVideoMaxView.emit("full screen");
    }
    this.closeModals();
    // this.upload();
    this.spinnerService.start();
    if (this.doctorService.uploadFilesList &&
      this.doctorService.uploadFilesList[0] &&
      this.doctorService.uploadFilesList[0].url &&
      this.doctorService.uploadFilesList[0].url != undefined &&
      this.doctorService.uploadFilesList[0].url != null &&
      this.doctorService.uploadFilesList.length > 0
    )
      for (let i = 0; i < this.doctorService.uploadFilesList.length; i++)
        this.displayMedicalAdvice.uploadedFileList[i] = this.doctorService.uploadFilesList[i].url;

    let medicalAdvice: PatientMedicalAdvise = this.displayMedicalAdvice;
    console.log("isFrom: ", this.doctorService.isFrom);

    if (this.isFrom != '') {
      console.log("InsideFrom: ", this.displayMedicalAdvice);
      this.copyAdviceFromQueue();
      console.log("InsideFrom: ", this.displayMedicalAdvice);


      //reset of 2nd page data
      let newAdvice: PatientMedicalAdvise = new PatientMedicalAdvise();
      this.doctorService.patientMedicalAdvise.pharmacyAdvises = newAdvice.pharmacyAdvises;
      this.doctorService.patientMedicalAdvise.investigationAdvises = newAdvice.investigationAdvises;
      this.doctorService.patientMedicalAdvise.procedureList = newAdvice.procedureList;
      this.doctorService.patientMedicalAdvise.nonMedicationAdvises = newAdvice.nonMedicationAdvises;
      this.doctorService.patientMedicalAdvise.admissionNote = newAdvice.admissionNote;
      this.doctorService.patientMedicalAdvise.immunizationAdvices = newAdvice.immunizationAdvices;
      this.doctorService.patientMedicalAdvise.referralDoctorList = newAdvice.referralDoctorList;
      this.doctorService.patientMedicalAdvise.followupAdvices = newAdvice.followupAdvices;
      this.doctorService.patientMedicalAdvise.noteList = newAdvice.noteList;
      this.doctorService.patientMedicalAdvise.uploadedFileList = newAdvice.uploadedFileList;
      this.doctorService.patientMedicalAdvise.uploadedClinicalExaminationFileList = newAdvice.uploadedClinicalExaminationFileList;
      console.log('patienttt', this.doctorService.patientMedicalAdvise);


      //copy of 1st page data
      this.pastPrescription = this.displayMedicalAdvice;
      this.copyPastPrescription();

      medicalAdvice = this.doctorService.patientMedicalAdvise;


      /* if (this.doctorService.isFrom == "digitizationqueue") {
        medicalAdvice.prescriptionDigitizationStatus = PatientMedicalAdvise.DIGITIZATION_STATUS_COMPLETED;
        medicalAdvice.digitizationEmpId = this.empId;
      } */

    }

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


    if (this.doctorService.isFrom == "digitizationqueue") {
      medicalAdvice.prescriptionDigitizationStatus = PatientMedicalAdvise.DIGITIZATION_STATUS_SENT_FOR_APPROVAL;
      medicalAdvice.digitizationEmpId = this.empId;
    }
    medicalAdvice.digitizationManagerComments = "";
    medicalAdvice.caseSheet = caseSheet;

    if (medicalAdvice && (!medicalAdvice.patientId || medicalAdvice.patientId == 0) && this.doctorService.patientQueue && this.doctorService.patientQueue.patientProfileId) {
      medicalAdvice.patientId = this.doctorService.patientQueue.patientProfileId;
    }

    console.log("medicalAdvice ==> ", medicalAdvice);
    let refferalDoctor = JSON.parse(localStorage.getItem('referalDoctorDetails'))
    console.log(refferalDoctor);
    let updateRefferalDoctor: ReferralDoctor = new ReferralDoctor()

    updateRefferalDoctor.doctorDetail = new DoctorDetails()

    if (refferalDoctor != null) {
      updateRefferalDoctor.doctorDetail.firstName = refferalDoctor.firstName
      updateRefferalDoctor.doctorDetail.serviceId = refferalDoctor.serviceList.serviceId
      updateRefferalDoctor.doctorDetail.serviceName = refferalDoctor.serviceList.serviceName
      updateRefferalDoctor.doctorDetail.doctorCenterName = refferalDoctor.Clinic
      updateRefferalDoctor.doctorDetail.contactList = refferalDoctor.contactList
      updateRefferalDoctor.doctorDetail.addedByReferralDoctor = true
      updateRefferalDoctor.doctorDetail.title = 'Dr.'
      updateRefferalDoctor.doctorDetail.type = 0
      updateRefferalDoctor.doctorDetail.serviceList.push(refferalDoctor.serviceList)
      console.log(updateRefferalDoctor.doctorDetail.serviceList);
      medicalAdvice.referralDoctorList.push(updateRefferalDoctor)
    }

    this.doctorService.generatePatientMedicalPresciption(medicalAdvice).then(data => {

      if (data.statusCode == 201) {
        //cleverTap
        this.pushCleverTapEvent();

        this.spinnerService.stop();
        console.log("advice generated");
        //    alert("Advice Generated ");
        this.doctorService.uploadFilesList = new Array();
        window.localStorage.removeItem("patientMedicalAdvise");
        this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
        this.doctorService.isPrescriptionGenerated = true;
        console.log(this.doctorService.isPrescriptionGenerated + "----this.doctorService.isPrescriptionGenerated");
        // this.modelView = "printPrescription";
        this.closeModals();

        (<any>$("#printPDFWizardModel")).modal({
          show: true,
          escapeClose: false,
          clickClose: false,
          showClose: false,
          backdrop: "static",
          keyboard: false
        });

        if (this.authService.selectedPocDetails) {
          if (this.authService.selectedPocDetails.pdfHeaderType == 0)
            this.doctorService.pdfUrl = data.advisePdfUrlWithHeader;
          else
            this.doctorService.pdfUrl = data.advisePdfUrlWithoutHeader;
        }
        console.log("ghsdhfjsdjsdkd" + JSON.stringify(this.authService.selectedPocDetails));
      }
      else {
        alert(data.statusMessage);
        this.doctorService.uploadFilesList = new Array();
        this.spinnerService.stop();
        this.backToQueue();
      }
    }).catch((error) => {
      this.spinnerService.stop();
    });
  }
  pushCleverTapEvent() {
    if (Config.portal.clevertapId && Config.portal.clevertapId.length > 0) {
      //Handling Error due to 'patientQueue.payment' getting undefined in some uneven cases
      try {
        let patientQueue: PatientQueue = this.doctorService.patientQueue;
        let commonUtil = new CommonUtil();
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
    (<any>$("#modelprescriptionsummary")).modal("hide");
    (<any>$("#modelIdprescriptiontemplatesbox")).modal("hide");
    (<any>$("#modelIdwizardpastprescription")).modal("hide");
    (<any>$("#modelIdprescriptiontemplate")).modal("hide");
    (<any>$("#printPDFWizardModel")).modal("hide");
    (<any>$("#videQuestionModel")).modal("hide");
    $('.modal-backdrop').remove();
  }

  onClickPrint() {
    this.authService.openPDF(this.pdfUrl);
  }
  openUrlInNewTab(url) {
    this.authService.openPDF(url);
  }
  closePrintView() {
    console.log(' closePrintView isVideo---' + this.isVideo);
    if (this.isVideo && this.doctorService.isVideo) {
      this.closeModals();
      $(".fullScreeVideoBtn").hide();
      this.minMaxVideo.emit(true);
    }
    else {
      this.backToQueue();
    }
  }
  hideModel(id: string) {
    this.modelView = '';
    (<any>$(id)).modal('hide');
  }
  backToQueue() {
    console.log('**form' + this.doctorService.isFrom);
    this.closeModals();

    this.modelView = "";
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

  addNoteForAdvice(): void {
    this.textAdvise.title = this.getStringValue("#prescription_notes");
    this.displayMedicalAdvice.noteList[0] = this.textAdvise;
    // console.log(this.textAdvise);
    if (this.isFrom == '') {
      this.videoCardService.updatePrescription(this.displayMedicalAdvice);
    }
  }

  addDoctorNoteForAdvice(): void {

    this.doctorTextAdvise.title = this.getStringValue("#docprescription_notes");
    this.displayMedicalAdvice.doctorNoteList = new Array();
    this.displayMedicalAdvice.doctorNoteList.push(this.doctorTextAdvise);
    this.videoCardService.updatePrescription(this.displayMedicalAdvice);
  }

  fileUpload(event, uploadedFileList: any[] = [], MAX_FILES_COUNT = 5, fileExtentionsAllowed = this.imageExtentions) {
    let uploadingFilesList = event.target.files;

    for (let i = 0; i < uploadingFilesList.length; i++) {
      if (uploadingFilesList[i].size >= 5000000) {
        this.toast.show("Select files less than 5MB", "bg-warning text-white font-weight-bold", 5000);
        // alert("select files less then 5MB");
        uploadingFilesList = new Array();
        return;
      }
    }

    if ((uploadedFileList.length + event.target.files.length) > MAX_FILES_COUNT) {
      this.toast.show("Only " + MAX_FILES_COUNT + " files are allowed", "bg-warning text-white font-weight-bold", 5000);
      return;
    }

    if (event.target.files.length >= 0) {

      for (let i = 0; i < event.target.files.length; i++) {
        let isValid = false;
        for (let allowedFilesIndex = 0; allowedFilesIndex < fileExtentionsAllowed.length; allowedFilesIndex++) {
          if (event.target.files[i].name.toLowerCase().endsWith(fileExtentionsAllowed[allowedFilesIndex])) {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          this.toast.show('Only jpg,png,jpeg files allowed', "bg-warning text-white font-weight-bold", 5000);
          event.target.files.splice(i, 1);
        }
      }
      uploadingFilesList = event.target.files;

    }
    else {
      uploadingFilesList = new Array();
      // uploadedFileList = [];
      if (this.isFrom == '') {
        this.videoCardService.updatePrescription(this.displayMedicalAdvice);
      }
    }
    console.log(event.target.files);
    this.upload(uploadingFilesList, uploadedFileList, MAX_FILES_COUNT);
  }
  upload(uploadingFilesList, uploadedFileList: any[] = [], MAX_FILES_COUNT = 5) {
    if (uploadingFilesList === undefined || uploadingFilesList === null ||
      uploadingFilesList[0] === undefined || uploadingFilesList[0] === null) {
      return;
    }

    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();

    for (let i = 0; i < uploadingFilesList.length; i++) {
      this.fileUtil.fileUploadToAwsS3(null, uploadingFilesList[i], this.doctorService.patientQueue.parentProfileId, false, false).then(
        (awsS3FileResult: any) => {
          if (!awsS3FileResult) {
            this.spinnerService.stop();
            return;
          } else {
            this.spinnerService.stop();
            let url = awsS3FileResult.Location;
            uploadedFileList.push(url);
            if (this.isFrom == '') {
              this.videoCardService.updatePrescription(this.displayMedicalAdvice);
            }
          }
        }
      ).catch(err => {
        this.spinnerService.stop();
      });
    }
  }

  getContentType(fileName: string): string {
    let contentType: string = "";
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
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        contentType = "application/octet-stream";
      }
    return contentType;
  }

  saveAdviceAsTemplate() {
    this.closeModals();
    this.errorMessage = '';
    let title = this.displayMedicalAdvice.diagnosisList[0].name + "_template";
    this.modelView = "saveTemplate";
    (<any>$("#modelprescriptionsummary")).modal({
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
  saveTemplate() {
    let title = this.getStringValue("#saveTemplateTitle");
    let template: DoctorPrescriptionTemplate = new DoctorPrescriptionTemplate();
    template.pharmacyAdvises = this.displayMedicalAdvice.pharmacyAdvises;
    template.investigationAdvises = this.displayMedicalAdvice.investigationAdvises;
    template.diagnosisList = this.displayMedicalAdvice.diagnosisList;
    template.noteList = this.displayMedicalAdvice.noteList;
    template.doctorNoteList = this.displayMedicalAdvice.doctorNoteList;
    template.doctorId = this.authService.userAuth.employeeId;
    template.createdTimestamp = new Date().getTime();
    template.title = title;


    if (title == "" || title == null || title == undefined) {
      this.errorMessage = "Enter Valid title";
      return;
    }
    if ((template.diagnosisList == null) ||
      (template.diagnosisList == undefined) ||
      (template.diagnosisList.length == 0)) {
      this.errorMessage = "Select Diagnosis to create template";
      return;
    }

    this.errorMessage = "";
    this.closeModals();
    this.modelView = '';
    this.spinnerService.start();
    this.doctorService.createTemplateForDoctor(template).then(data => {
      this.spinnerService.stop();
      this.toast.show(data.statusMessage, data.statusCode == 200 ? "bg-success text-white font-weight-bold" : "bg-warning text-white font-weight-bold", 5000);
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.checkWHOConditionsAndGeneratePrescription(null);
      }
      console.log(data);
    }).catch((err) => {
      this.spinnerService.stop();
      this.toast.show("Something went wrong. Please try again", "bg-warning text-white font-weight-bold", 5000);
    });
  }

  getStringValue(id: string): string {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? $(id).val().toString()
      : "";
  }
  getNameFromUrl(url: string) {
    return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
  }

  changeOfSelectedInvestigationPartners(index: number, poc: FavouritePartners) {
    console.clear();
    let basePoc: BasePocDetails = new BasePocDetails();
    basePoc.pocId = poc.details.pocId;
    basePoc.pocName = poc.details.pocName;
    basePoc.email = poc.details.email;
    if (poc.details != null) {
      basePoc.contactList = poc.details.contactList;
      basePoc.address = poc.details.address;
    }
    let i = this.indexOfFavPOCListWithBasePOC(this.displayMedicalAdvice.investigationAdvises.routedToPoc, basePoc)
    console.log(this.displayMedicalAdvice.investigationAdvises.routedToPoc[i]);
    console.log(i);
    if (i == -1) {
      if (!this.displayMedicalAdvice.investigationAdvises.routedToPoc) {
        this.displayMedicalAdvice.investigationAdvises.routedToPoc = new Array<BasePocDetails>();
      }
      console.log('push');
      if (this.canRouteToMultiple) {
        this.displayMedicalAdvice.investigationAdvises.routedToPoc.push(basePoc);
      }
      else {
        this.displayMedicalAdvice.investigationAdvises.routedToPoc[0] = basePoc;
      }
    } else {
      console.log('splice');
      this.displayMedicalAdvice.investigationAdvises.routedToPoc.splice(i, 1);
    }
    if (this.isFrom == '') {
      this.videoCardService.updatePrescription(this.displayMedicalAdvice);
    }
    console.log(this.displayMedicalAdvice.investigationAdvises.routedToPoc);
  }
  changeOfSelectedPharmacyPartners(index: number, poc: FavouritePartners) {
    let basePoc: BasePocDetails = new BasePocDetails();
    basePoc.pocId = poc.details.pocId;
    basePoc.pocName = poc.details.pocName;
    basePoc.email = poc.details.email;
    if (poc.details != null) {
      basePoc.contactList = poc.details.contactList;
      basePoc.address = poc.details.address;
    }
    let i = this.indexOfFavPOCListWithBasePOC(this.displayMedicalAdvice.pharmacyAdvises.routedToPoc, basePoc);
    console.log(this.displayMedicalAdvice.pharmacyAdvises.routedToPoc[i]);
    if (i == -1) {
      if (!this.displayMedicalAdvice.pharmacyAdvises.routedToPoc) {
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc = new Array<BasePocDetails>();
      }
      if (this.canRouteToMultiple) {
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc.push(basePoc);
      }
      else {
        this.displayMedicalAdvice.pharmacyAdvises.routedToPoc[0] = basePoc;
      }
    } else {
      this.displayMedicalAdvice.pharmacyAdvises.routedToPoc.splice(i, 1);
    }

    if (this.isFrom == '') {
      this.videoCardService.updatePrescription(this.displayMedicalAdvice);
    }
  }

  indexOfFavPOCListWithBasePOC(listOfPoc: BasePocDetails[], poc: BasePocDetails) {
    console.log('index of');
    console.log(listOfPoc);
    console.log(poc);

    for (let i = 0; i < listOfPoc.length; i++) {
      if (listOfPoc[i].pocId == poc.pocId) {
        console.log(poc.pocId);
        return i;

      }
    }
    return -1;
  }

  getSelectedInvestigationAdvisesPOCName(): string {
    let selectedInvestigationAdvisesPOCName: string = '';
    if (!this.displayMedicalAdvice.investigationAdvises.routedToPoc) {
      return "No POC Selected";
    }

    for (let i = 0; i < this.displayMedicalAdvice.investigationAdvises.routedToPoc.length; i++) {
      if (i != 0) {
        selectedInvestigationAdvisesPOCName = selectedInvestigationAdvisesPOCName + ', '
      }
      selectedInvestigationAdvisesPOCName = selectedInvestigationAdvisesPOCName + this.displayMedicalAdvice.investigationAdvises.routedToPoc[i].pocName;

    }
    if (selectedInvestigationAdvisesPOCName == '') {
      return "No POC Selected";
    }
    if (selectedInvestigationAdvisesPOCName.length >= 32) {
      return this.displayMedicalAdvice.investigationAdvises.routedToPoc.length + " POC Selected";
    }

    return selectedInvestigationAdvisesPOCName;
  }
  getSelectedPharmacyAdvisesPOCName(): string {
    let selectedPharmacyAdvisesPOCName: string = '';
    if (!this.displayMedicalAdvice.pharmacyAdvises.routedToPoc) {
      return "No POC Selected";
    }

    for (let i = 0; i < this.displayMedicalAdvice.pharmacyAdvises.routedToPoc.length; i++) {
      if (i != 0) {
        selectedPharmacyAdvisesPOCName = selectedPharmacyAdvisesPOCName + ', '
      }
      selectedPharmacyAdvisesPOCName = selectedPharmacyAdvisesPOCName + this.displayMedicalAdvice.pharmacyAdvises.routedToPoc[i].pocName.slice(0, 32);

    }
    if (selectedPharmacyAdvisesPOCName == '') {
      return "No POC Selected";
    }
    if (selectedPharmacyAdvisesPOCName.length >= 32) {
      return this.displayMedicalAdvice.pharmacyAdvises.routedToPoc.length + " POC Selected";
    }

    return selectedPharmacyAdvisesPOCName;
  }

  indexOfPOCWithRouteToInvestigation(routedToPoc: BasePocDetails[], poc: FavouritePartners) {
    if (!routedToPoc) {
      return -1;
    }
    for (let i = 0; i < routedToPoc.length; i++) {
      if (routedToPoc[i].pocId == poc.details.pocId)
        return i;
    }
    return -1;
  }

  copyAndModify() {
    this.doctorService.isCopied = true;
    (<any>$("#modelIdprescriptiontemplatesbox")).modal("hide");
    if (this.isFrom == 'pastPrescription') {
      (<any>$("#modelIdpastprescription")).modal("hide");
    }
    else if (this.isFrom == 'templateView') {
      (<any>$("#modelIdprescriptiontemplate")).modal("hide");
    }
    this.copyPastPrescription();
    this.wizardView.emit("symptomPrescription");
    this.videoCardService.updatePrescription(this.doctorService.patientMedicalAdvise);
  }

  copyPastPrescription() {
    this.copyClinicalExaminations();
    // else this.doctorService.patientMedicalAdvise.clinicalExaminationList =new Array();

    if (this.pastPrescription.pharmacyAdvises) {
      // this.doctorService.patientMedicalAdvise.pharmacyAdvises = this.pastPrescription.pharmacyAdvises;

      if (!this.doctorService.patientMedicalAdvise.pharmacyAdvises) {
        this.doctorService.patientMedicalAdvise.pharmacyAdvises = new PharmacyAdvises()
      }
      for (let i = 0; i < this.pastPrescription.pharmacyAdvises.pharmacyAdviceList.length; i++) {
        if (
          this.indexOfObjectWithPharmacy(this.doctorService.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList,
            this.pastPrescription.pharmacyAdvises.pharmacyAdviceList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.pharmacyAdvises.pharmacyAdviceList.push(
            this.pastPrescription.pharmacyAdvises.pharmacyAdviceList[i]
          )
        }
      }
    }
    // else  this.doctorService.patientMedicalAdvise.pharmacyAdvises =new PharmacyAdvises();

    if (this.pastPrescription.investigationAdvises) {
      // this.doctorService.patientMedicalAdvise.investigationAdvises = this.pastPrescription.investigationAdvises;

      if (!this.doctorService.patientMedicalAdvise.investigationAdvises) {
        this.doctorService.patientMedicalAdvise.investigationAdvises = new InvestigationAdvises();
      }
      for (let i = 0; i < this.pastPrescription.investigationAdvises.investigationList.length; i++) {
        if (
          this.indexOfObjectWithServiceId(this.doctorService.patientMedicalAdvise.investigationAdvises.investigationList,
            this.pastPrescription.investigationAdvises.investigationList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.investigationAdvises.investigationList.push(
            this.pastPrescription.investigationAdvises.investigationList[i]
          )
        }
      }
    }
    // else this.doctorService.patientMedicalAdvise.investigationAdvises=new InvestigationAdvises();

    if (this.pastPrescription.procedureList) {
      // this.doctorService.patientMedicalAdvise.procedureList = this.pastPrescription.procedureList;
      if (!this.doctorService.patientMedicalAdvise.procedureList) {
        this.doctorService.patientMedicalAdvise.procedureList = new Array<ServiceItem>();
      }
      for (let i = 0; i < this.pastPrescription.procedureList.length; i++) {
        if (
          this.indexOfObjectWithServiceId(this.doctorService.patientMedicalAdvise.procedureList,
            this.pastPrescription.procedureList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.procedureList.push(
            this.pastPrescription.procedureList[i]
          )
        }
      }

    }
    // else     this.doctorService.patientMedicalAdvise.procedureList =new Array();

    if (this.pastPrescription.wellnessAdvises) {
      // this.doctorService.patientMedicalAdvise.wellnessAdvises = this.pastPrescription.wellnessAdvises;
      if (!this.doctorService.patientMedicalAdvise.wellnessAdvises) {
        this.doctorService.patientMedicalAdvise.wellnessAdvises = new Array<WellnessAdvise>();
      }
      for (let i = 0; i < this.pastPrescription.wellnessAdvises.length; i++) {
        this.doctorService.patientMedicalAdvise.wellnessAdvises.push(
          this.pastPrescription.wellnessAdvises[i]
        )
      }

    }
    // else  this.doctorService.patientMedicalAdvise.wellnessAdvises =new Array();
    if (this.pastPrescription.referralDoctorList) {
      //  this.doctorService.patientMedicalAdvise.referralDoctorList = this.pastPrescription.referralDoctorList;

      if (!this.doctorService.patientMedicalAdvise.referralDoctorList) {
        this.doctorService.patientMedicalAdvise.referralDoctorList = new Array();
      }
      for (let i = 0; i < this.pastPrescription.referralDoctorList.length; i++) {
        if (
          this.indexOfObjectWithEmpId(this.doctorService.patientMedicalAdvise.referralDoctorList,
            this.pastPrescription.referralDoctorList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.referralDoctorList.push(
            this.pastPrescription.referralDoctorList[i]
          )
        }
      }

    }



    if (this.pastPrescription.nonMedicationAdvises) {
      // this.doctorService.patientMedicalAdvise.nonMedicationAdvises = this.pastPrescription.nonMedicationAdvises;
      if (!this.doctorService.patientMedicalAdvise.nonMedicationAdvises) {
        this.doctorService.patientMedicalAdvise.nonMedicationAdvises = new Array<TextAdvise>();
      }
      for (let i = 0; i < this.pastPrescription.nonMedicationAdvises.length; i++) {
        if (
          this.indexOfObjectWithId(this.doctorService.patientMedicalAdvise.nonMedicationAdvises,
            this.pastPrescription.nonMedicationAdvises[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.nonMedicationAdvises.push(
            this.pastPrescription.nonMedicationAdvises[i]
          )
        }
      }


    }

    if (this.pastPrescription.admissionNote) {
      if (!this.doctorService.patientMedicalAdvise.admissionNote) {
        this.doctorService.patientMedicalAdvise.admissionNote = new AdmissionNote();
      }
      for (let i = 0; i < this.pastPrescription.admissionNote.procedureList.length; i++) {
        if (
          this.indexOfObjectWithServiceId(this.doctorService.patientMedicalAdvise.admissionNote.procedureList,
            this.pastPrescription.admissionNote.procedureList[i])
          == -1) {

          this.doctorService.patientMedicalAdvise.admissionNote.procedureList.push(
            this.pastPrescription.admissionNote.procedureList[i]
          )
        }
      }
      this.doctorService.patientMedicalAdvise.admissionNote.note = this.pastPrescription.admissionNote.note


    }
    // else  this.doctorService.patientMedicalAdvise.nonMedicationAdvises =new Array();

    if (this.pastPrescription.immunizationAdvices) {
      // this.doctorService.patientMedicalAdvise.immunizationAdvices = this.pastPrescription.immunizationAdvices;
      if (!this.doctorService.patientMedicalAdvise.immunizationAdvices) {
        this.doctorService.patientMedicalAdvise.immunizationAdvices = new Array<Immunization>();
      }
      for (let i = 0; i < this.pastPrescription.immunizationAdvices.length; i++) {
        if (
          this.indexOfObjectWithGenericMedicineId(this.doctorService.patientMedicalAdvise.immunizationAdvices,
            this.pastPrescription.immunizationAdvices[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.immunizationAdvices.push(
            this.pastPrescription.immunizationAdvices[i]
          )
        }
      }
      for (let i = 0; i < this.doctorService.patientMedicalAdvise.immunizationAdvices.length; i++) {
        if (this.doctorService.patientMedicalAdvise.immunizationAdvices[i].followupDate < (new Date().getTime()))
          this.doctorService.patientMedicalAdvise.immunizationAdvices[i].followupDate = (new Date().getTime());
      }
      // this.doctorService.patientMedicalAdvise.followupAdvices = this.pastPrescription.followupAdvices;
    }
    // else this.doctorService.patientMedicalAdvise.immunizationAdvices =new Array();
    //removing uploadedFileList to be copied form past pre
    // if (this.pastPrescription.uploadedFileList) {
    //   // this.doctorService.patientMedicalAdvise.uploadedFileList = this.pastPrescription.uploadedFileList;
    //   if (!this.doctorService.patientMedicalAdvise.uploadedFileList) {
    //     this.doctorService.patientMedicalAdvise.uploadedFileList = new Array<string>();
    //   }
    //   for (let i = 0; i < this.pastPrescription.uploadedFileList.length; i++) {
    //     if (!this.doctorService.patientMedicalAdvise.uploadedFileList.includes(this.pastPrescription.uploadedFileList[i])) {
    //       this.doctorService.patientMedicalAdvise.uploadedFileList.push(
    //         this.pastPrescription.uploadedFileList[i]
    //       )
    //     }

    //   }
    // }
    // else  this.doctorService.patientMedicalAdvise.uploadedFileList =new Array<string>();



    if (this.pastPrescription.noteList) {
      this.doctorService.patientMedicalAdvise.noteList = this.pastPrescription.noteList;
      // if(!this.doctorService.patientMedicalAdvise.noteList){
      //   this.doctorService.patientMedicalAdvise.noteList= new Array<MedicalNote>();
      // }
      // for (let i = 0; i < this.pastPrescription.noteList.length; i++) {
      //   this.doctorService.patientMedicalAdvise.noteList.push(
      //     this.pastPrescription.noteList[i]
      //   )
      // }


    }
    if (this.pastPrescription.doctorNoteList) {
      this.doctorService.patientMedicalAdvise.doctorNoteList = this.pastPrescription.doctorNoteList;
    }

    if (this.pastPrescription.followupAdvices) {
      this.doctorService.patientMedicalAdvise.followupAdvices = this.pastPrescription.followupAdvices;
    }
    // else this.doctorService.patientMedicalAdvise.noteList =new Array();

    if (this.pastPrescription.illnessSymptomList) {
      // this.doctorService.patientMedicalAdvise.illnessSymptomList = this.pastPrescription.illnessSymptomList;
      if (!this.doctorService.patientMedicalAdvise.illnessSymptomList) {
        this.doctorService.patientMedicalAdvise.illnessSymptomList = new Array<Symptoms>();
      }
      for (let i = 0; i < this.pastPrescription.illnessSymptomList.length; i++) {
        this.doctorService.patientMedicalAdvise.illnessSymptomList.push(
          this.pastPrescription.illnessSymptomList[i]
        )
      }

    }
    $(window).scrollTop(0);
    // else   this.doctorService.patientMedicalAdvise.illnessSymptomList =new Array();
  }


  copyClinicalExaminations() {
    console.log("copyClinicalExaminations initiated")
    if (this.pastPrescription.diagnosisList) {
      //this.doctorService.patientMedicalAdvise.diagnosisList = this.pastPrescription.diagnosisList;
      if (this.doctorService.patientMedicalAdvise.diagnosisList == null || this.doctorService.patientMedicalAdvise.diagnosisList == undefined) {
        //if(!this.doctorService.patientMedicalAdvise.diagnosisList){     
        this.doctorService.patientMedicalAdvise.diagnosisList = new Array<BaseDiagnosis>();
      }
      for (let i = 0; i < this.pastPrescription.diagnosisList.length; i++) {
        if (this.indexOfObjectWithId(this.doctorService.patientMedicalAdvise.diagnosisList,
          this.pastPrescription.diagnosisList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.diagnosisList.push(
            this.pastPrescription.diagnosisList[i]
          );
        }
      }


      this.doctorService.patientMedicalAdvise.finalDiagnosisCount = 0;
      this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount = 0;

      for (let i = 0; i < this.doctorService.patientMedicalAdvise.diagnosisList.length; i++) {
        if (this.doctorService.patientMedicalAdvise.diagnosisList[i].finalDiagnosis)
          this.doctorService.patientMedicalAdvise.finalDiagnosisCount++;
        else
          this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount++;
      }
    }
    // else this.doctorService.patientMedicalAdvise.diagnosisList = new Array();
    if (this.pastPrescription.symptomList) {
      // this.doctorService.patientMedicalAdvise.symptomList = this.pastPrescription.symptomList;
      if (!this.doctorService.patientMedicalAdvise.symptomList) {
        this.doctorService.patientMedicalAdvise.symptomList = new Array();
      }
      for (let i = 0; i < this.pastPrescription.symptomList.length; i++) {
        if (this.indexOfObjectWithId(this.doctorService.patientMedicalAdvise.symptomList,
          this.pastPrescription.symptomList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.symptomList.push(
            this.pastPrescription.symptomList[i]
          );
        }
      }
    }
    // else this.doctorService.patientMedicalAdvise.symptomList =new Array();
    if (this.pastPrescription.clinicalExaminationList) {
      // this.doctorService.patientMedicalAdvise.clinicalExaminationList = this.pastPrescription.clinicalExaminationList;
      if (!this.doctorService.patientMedicalAdvise.clinicalExaminationList) {
        this.doctorService.patientMedicalAdvise.clinicalExaminationList = new Array();
      }
      for (let i = 0; i < this.pastPrescription.clinicalExaminationList.length; i++) {
        if (this.indexOfObjectWithId(this.doctorService.patientMedicalAdvise.clinicalExaminationList,
          this.pastPrescription.clinicalExaminationList[i])
          == -1) {
          this.doctorService.patientMedicalAdvise.clinicalExaminationList.push(
            this.pastPrescription.clinicalExaminationList[i]
          );
        }
      }
    }
    console.log("copyClinicalExaminations completed")

  }

  indexOfObjectWithId(obj1: any[], obj2): number {
    //for non medication,clinical exami...,Symptoms,Diagnosis.......
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].id == obj2.id) {
        return i;
      }
    }
    return -1;
  }
  // indexOfObjectWithProductId(obj1: any[], obj2): number {
  //   for (let i = 0; i < obj1.length; i++) {
  //     if (obj1[i].productId == obj2.productId) {
  //       return i;
  //     }
  //   }
  //   return -1;
  // }
  indexOfObjectWithPharmacy(obj1: any[], obj2): number {
    //for medicine
    for (let i = 0; i < obj1.length; i++) {
      if ((obj1[i].productId + obj1[i].productName) == (obj2.productId + obj2.productName)) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithServiceId(obj1: any[], obj2): number {
    //for procedures , investigations
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].serviceId == obj2.serviceId) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithEmpId(obj1: any[], obj2): number {
    //for referal
    for (let i = 0; i < obj1.length; i++) {
      if (obj1[i].empId == obj2.empId) {
        return i;
      }
    }
    return -1;
  }
  indexOfObjectWithGenericMedicineId(obj1: any[], obj2): number {
    //for immunization
    for (let i = 0; i < obj1.length; i++) {
      if (
        obj1[i].genericMedicine.genericMedicineId ==
        obj2.genericMedicine.genericMedicineId
      ) {
        return i;
      }
    }
    return -1;
  }
  toggleDropdown(id: string) {
    (<any>$(id)).dropdown();
  }
  removeAdviceFile(index: number) {
    this.displayMedicalAdvice.uploadedFileList.splice(index, 1);
    // this.uploadFilesList = new Array();
    $("#chooseFileForAdvice").val("");
  }
  removeClinicalExamination(index: number) {
    this.displayMedicalAdvice.uploadedClinicalExaminationFileList.splice(index, 1);
    // this.uploadFilesList = new Array();
    $("#chooseFileForClinicalExamination").val("");
  }
  getFileExtensionFromUrl(url: string) {
    return DoctorUtil.getFileExtensionFromUrl(url);
  }
}
