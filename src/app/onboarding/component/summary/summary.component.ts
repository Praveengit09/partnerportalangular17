import { DoctorService } from './../../../doctor/doctor.service';
import { Component, ViewEncapsulation, Injector, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from './../../../auth/auth.service';
import { OnboardingService } from '../../onboarding.service';
import { RegistrationVO } from './../../../model/profile/registrationVO';
import { Social } from './../../../model/profile/social'
import { ProfileDetails_others } from './../../../model/profile/profileDetails_others'
import { Question } from './../../../model/phr/question'
import { PHR } from './../../../model/phr/phr'
import { Address } from './../../../model/profile/address';
import { UserReport } from './../../../model/report/userReport';
import { FileType } from "./../../../model/common/fileType";
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../base/util/common-util';
import { PatientMedicalAdvise } from './../../../model/advice/patientMedicalAdvise';
import { Config } from '../../../base/config';

@Component({
  selector: 'phrsummary',
  templateUrl: './summary.template.html',
  styleUrls: ['./summary.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SummaryComponent implements OnInit {
  config: any;
  date4: Date = new Date(2016, 5, 10);
  profileId: any;
  registrationVo: RegistrationVO = new RegistrationVO();
  isAge: boolean = false;
  isDOB: boolean = true;
  isOfficeAddressVisible: boolean = false;
  isEmergencyAddressVisible: boolean = false;

  @Input("isFromDoctor") isFromDoctor: boolean = false;

  modelView: string;
  hasPrescriptionTemplates: boolean;
  hasPastPrescriptions: boolean;
  pastTests: Array<UserReport> = new Array<UserReport>();
  hasPastTests: boolean;
  pastPrescription: PatientMedicalAdvise = new PatientMedicalAdvise();

  @Input("isOnlyPHRView") isOnlyPHRView: boolean = false;
  scanAndUploadPrescriptions: boolean = false;
  isPHREditView: boolean = false;

  @Output("isEngage") isEngage = new EventEmitter();
  @Output("editVitals") editVitals = new EventEmitter();
  @Output("showUploadedRecords") showUploadedRecords = new EventEmitter();

  pageIndex: number = 0;
  phr: PHR = new PHR();
  memberDate: Date;

  familyMemberList: Array<RegistrationVO> = new Array();

  feetInchValue: string;
  feetInchQuestionId: number;
  feet: string;
  inch: string;

  type: any;
  userReportList: Array<UserReport> = new Array<UserReport>();
  fileUrlList: Array<FileType> = new Array();
  reportUrl: string;
  defaultProfileImgUrl: any;
  consentVerified: boolean = false;
  showConsenPopUp: boolean = false;
  isFromWizard: boolean = false;

  datepickerOpts = {
    startDate: new Date(2016, 5, 10),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'D, d MM yyyy'
  };
  verifyIndex: number;
  constructor(private onboardingService: OnboardingService,
    private activatedRoute: ActivatedRoute, injector: Injector,
    private commonUtil: CommonUtil,
    private router: Router, private authService: AuthService,
    private spinnerService: SpinnerService, private doctorService: DoctorService) {
    this.scanAndUploadPrescriptions = this.authService.selectedPocDetails.scanAndUploadPrescriptions;


  }
  ///// check box show  and hide code start here ///////

  ngOnInit(): void {
    let self = this;
    this.isPHREditView = false;

    $("#patientPHRModel").on("hidden.bs.modal", function () {
      self.isPHREditView = false;
      self.modelView = null;
      console.log("patientPHRModel closed");
    });
    let verifyIndex = self.verifyIndex = Math.random() * 10000;
    $("#vitalsReadingComponentModel").on("hidden.bs.modal", function () {
      if (verifyIndex == self.verifyIndex)
        self.ngOnInit();
    });

    console.log("SummaryComponenr: ", this.isFromDoctor + ">>>>>: ", this.doctorService.patientQueue);

    console.log("SummaryComponenr: ", this.isFromDoctor + ">>>>>: ", this.doctorService.patientQueue);
    if (this.isFromDoctor || this.doctorService.isFrom == "digitizationqueue") {
      if (this.doctorService.patientQueue && this.doctorService.patientQueue.patientProfileId) {
        this.profileId = this.doctorService.patientQueue.patientProfileId;
        console.log(this.profileId);
      }
    }
    else
      this.activatedRoute.params.subscribe((params: Params) => {
        this.profileId = params['profileId'];
      });
    this.getPHRForProfileId(this.profileId);
    this.getPHRDetailsForProfileId(this.profileId);
    this.getFamilyMembersProfile(this.profileId);
    this.type = new Array<number>();
    this.type[0] = 1;
    this.spinnerService.start();
    this.onboardingService.getUploadedReports(false, this.profileId, this.type, 0).then((data) => {
      this.spinnerService.stop();
      this.userReportList = data;
      this.userReportList.forEach(element => {
        element.fileUrlList.forEach(element => {
          this.fileUrlList.push(element);
        });
      });
      console.log("report list -=-=-=-=->" + JSON.stringify(data));

    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  getPHRForProfileId(profileId: any) {
    this.spinnerService.start();
    this.onboardingService.getPHRForProfileId(profileId).then(data => {
      this.spinnerService.stop();
      this.registrationVo = data;

      if (!this.registrationVo.profilePic) {
        if (this.registrationVo.gender === 'Male') {
          this.defaultProfileImgUrl = "assets/img/ic_radio_gender_male_inactive.png";
        } else if (this.registrationVo.gender === 'Female') {
          this.defaultProfileImgUrl = "assets/img/ic_radio_gender_female_inactive.png";
        } else {
          this.defaultProfileImgUrl = "assets/img/ic_radio_gender_others_inactive.png";
        }
      }

      if (this.registrationVo.emergencyContact && !this.registrationVo.emergencyContact.address) {
        this.registrationVo.emergencyContact.address = new Address();
      }
      this.memberDate = new Date(this.registrationVo.dob);
      if (!this.registrationVo.social) {
        this.registrationVo.social = new Social();
      }
      if (!this.registrationVo.others) {
        this.registrationVo.others = new ProfileDetails_others();
      }
    }).catch((err) => {
      this.spinnerService.stop();
    });;
  }

  getFamilyMembersProfile(profileId: number) {
    this.spinnerService.start();
    this.onboardingService.getFamilyDetails(profileId).then((data) => {

      this.familyMemberList = data
      this.spinnerService.stop();
      this.familyMemberList.forEach(element => {
        if (!element.imageData) {
          if (element.gender === 'Male') {
            element.imageData = "assets/img/ic_radio_gender_male_inactive.png";
          } else if (element.gender === 'Female') {
            element.imageData = "assets/img/ic_radio_gender_female_inactive.png";
          } else {
            element.imageData = "assets/img/ic_radio_gender_others_inactive.png";
          }
        }

      });
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }
  getAnswer(componentId: number, question: Question) {

    if (componentId == Question.COMPONENT_SWITCH) {
      let b = false;
      question.choices.forEach(element3 => {
        element3.forEach(element4 => {
          if (element4.id == question.ans) {
            if (element4.option == "Yes") {
              b = true;
            }
          }
        });
      });
      if (!b) {
        return "No";
      } else {
        return "Yes";
      }
    } else if (componentId == Question.COMPONENT_OPTION) {
      let b;
      question.choices.forEach(element3 => {
        element3.forEach(element4 => {
          if (element4.id == question.ans && (question.ans != "")) {
            b = element4.option;
          }
        });
      });
      if (b) {
        return b;
      }
    } else if (componentId == Question.COMPONENT_MULTI_SELECTION) {
      let b = false;
      let value = "";
      let multipleSelectedOptionsArray = question.ans.split(',');

      question.choices.forEach(element3 => {
        multipleSelectedOptionsArray.forEach(element => {
          element3.forEach(element4 => {
            if (element == element4.id) {
              value = value + ", " + element4.option;
              b = true;
            }
          });
        });
      });
      if (b) {
        value = value.replace(/^,/, '');
        return value;
      }
    }

  }

  getPHRDetailsForProfileId(profileId: number) {
    console.log('getPHRDetailsForProfileId');
    this.spinnerService.start();
    this.onboardingService.getPHRDetailsForProfileId(profileId).then(data => {
      console.log('getPHRDetailsForProfileId', data);
      this.spinnerService.stop();
      this.phr = data;
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  onViewReportClick() {
    (<any>$)('#myModal').modal('show');
  }
  getAge(dob: number): string {
    let ageYears: number = 0;
    let ageMonths: number = 0;

    if (isNaN(parseInt(this.commonUtil.getAgeForall(dob).split(",")[0]))) {
      ageYears = 0
    } else {
      ageYears = parseInt(this.commonUtil.getAgeForall(dob).split(",")[0]);
    }
    if (isNaN(parseInt(this.commonUtil.getAgeForall(dob).split(",")[1]))) {
      ageMonths = 0
    } else {
      ageMonths = parseInt(this.commonUtil.getAgeForall(dob).split(",")[1]);
    }
    let ageString: string = "";
    if (ageYears != null && ageYears != undefined && ageYears != 0) {
      ageString = ageYears + " Years ";
    }
    if (ageMonths != null && ageMonths != undefined && ageMonths != 0) {
      ageString = ageString + ageMonths + " Months ";
    }

    return ageString;
  }

  fileUpload() {
    let self = this;
    $('#chooseFile').bind('change', function () {
      let filename = self.getStringValue("#chooseFile");
      if (/^\s*$/.test(filename)) {
        $(".file-upload").removeClass('active');
        $("#noFile").text("No file chosen...");
      }
      else {
        $(".file-upload").addClass('active');
        $("#noFile").text(filename.replace("C:\\fakepath\\", ""));
      }
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

  convertToDate(str) {
    return this.commonUtil.convertToDate(str);
  }
  navigateTOFromWizard(index: number) {
    let url: string = '';
    switch (index) {
      case 0: url = '/app/onboarding/personal/';
        break;
      case 1: url = '/app/onboarding/physical/';
        break;
      case 2: url = '/app/onboarding/updatelabtest/';
        break;
    }
    this.router.navigate([url + this.profileId])
  }
  onClickPastPrescription(pastPrescription: PatientMedicalAdvise) {
    console.log("143");
    console.log(pastPrescription);
    let self = this;
    if (pastPrescription) {

      if (pastPrescription.uploadedPrescription) {
        this.authService.openPDF(pastPrescription.advisePdfUrlWithoutHeader);
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
        $("#modelIdphrpastprescription").on("hidden.bs.modal", function () {
          self.modelView = "";
          self.hasPastPrescriptions = false;
          self.hasPastTests = false;
          console.log("modelIdphrpastprescription closed")
        });
        (<any>$("#template-pastprescription")).modal("hide");
        (<any>$("#modelIdphrpastprescription")).modal("show");
      }
    }
  }

  openURLInNewTab(url) {
    console.log(url)
    this.authService.openPDF(url);
  }
  onClickTest(pastPrescription) {
    console.log(pastPrescription);
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
          $("#modelIdphrpastprescription").on("hidden.bs.modal", function () {
            self.modelView = "";
            self.hasPastPrescriptions = false;
            self.hasPastTests = false;
            console.log("modelIdphrpastprescription closed")
          });
          (<any>$("#template-pastprescription")).modal("hide");
          (<any>$("#modelIdphrpastprescription")).modal("show");
        }
      });
  }

  onEditPhrClickHandler() {
    this.isPHREditView = true;
    if (Config.portal.doctorOptions.enableOtpBasedConsent == true) {
      this.checkPatientConsent();
    }
    else {
      this.showConsenPopUp = true;
      this.consentVerified = true;
      this.modelView = 'onboardingPersonal';
      (<any>$("#patientPHRModel")).modal("show");
    }


  }

  checkPatientConsent() {
    // this.selectedPatient = this.doctorService.patientQueue;
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
    requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.consentContentType = 1;
    this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {

      if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
        this.showConsenPopUp = true;
        this.consentVerified = true;
        this.modelView = 'onboardingPersonal';
        (<any>$("#patientPHRModel")).modal("show");
      }
      else if (consentStatus.statusCode == 412) {
        this.showConsenPopUp = true;
        this.consentVerified = false;
        this.isFromWizard = true;
      }

    })
  }

  onModalClose(closeModal) {
    this.isFromWizard = false;
    if (closeModal == 'true') {
      console.log('togglemodal')
      this.isPHREditView = true;
      this.consentVerified = true;
      this.showConsenPopUp = true;
      this.modelView = 'onboardingPersonal';
      ((<any>$("#patientPHRModel")).modal("show"));//on otp verified
    }
    else {
      this.showConsenPopUp = false;
      this.consentVerified = false;
    }




  }

  toggleReportsModal() {
    console.log('togglemodal');
    this.modelView = 'onboardingPersonal';
    ((<any>$("#patientPHRModel")).modal("hide"));
  }
}
