import { ToasterService } from "./../../../layout/toaster/toaster.service";
import { Question } from "./../../../model/phr/question";
import { NonInvasiveTestDetails } from "./../../../model/phr/noninvasivetestdetails";
import { DoctorService } from "../../../doctor/doctor.service";
import { Location } from '@angular/common';
import { NgModule, Component, ViewEncapsulation, Injector, OnDestroy, OnInit, NgZone, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AppConfig } from '../../../app.config';
import { NurseService } from '../../nurse.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { UpdatedByEmpInfo } from '../../../model/employee/updatedByEmpInfo';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { RoleConstants } from '../../../constants/auth/roleconstants';
import { VitalDetail } from '../../../model/phr/vitalDetail';
import { CommonUtil } from "../../../base/util/common-util";
import { element } from '@angular/core/src/render3';
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { ConsentRequestConstants } from "../../../constants/doctor/consentrequestconstants";
import { NgOtpInputComponent } from "ng-otp-input";
import { Config } from '../../../base/config';
import { SlotBookingDetails } from "../../../model/basket/slotBookingDetails";
import { PhrAnswer } from "../../../model/phr/phrAnswer";

@Component({
  selector: 'vitalsReadingComponent',
  templateUrl: './vitalsreading.template.html',
  styleUrls: ['./vitalsreading.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VitalsreadingComponent {

  @Input() patientQue: PatientQueue;
  modelView = "";
  QuestionConstants = Question;
  errorMessage: string;

  requestConsentForPatient: string = '';
  selectedPatient: PatientQueue = new PatientQueue();
  consentOtp: string = '';
  consentVerified: boolean = false;
  profileId: number;
  graphIntervalsIndex = 1;
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;
  // 1 week, 1 month, 6 months, 1 yr
  // default 1 month
  graphIntervals = [
    {
      label: "1 Week",
      step: 1000 * 60 * 60 * 24,// One Day -- > 6 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 6 // 6 days ago
    },
    {
      label: "1 Month",
      step: 1000 * 60 * 60 * 24 * 2,// Two Day --> 15 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 // 30 days ago
    },
    {
      label: "6 Months",
      step: 1000 * 60 * 60 * 24 * 30,// One Month --> 6 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6 // 6 months ago
    },
    {
      label: "1 Year",
      step: 1000 * 60 * 60 * 24 * 30,// One Month --> 12 lines
      startingDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 12 // 1 year ago
    }
  ];

  reportResponse: any = [];
  report: any = {};
  common: CommonUtil;
  enableVitals: boolean = false;
  enableQuestionnaire: boolean = false;


  vitalInputList: NonInvasiveTestDetails[] = [];
  heightIndex = -1;
  weightIndex = -1;
  bmiIndex = -1;


  @Input() isFromDoctor: boolean;
  @Input() canNavigate: boolean = true;
  @Output() onSubmitEmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(injector: Injector, private router: Router,
    private nurseService: NurseService, private activatedRoute: ActivatedRoute,
    private doctorService: DoctorService,
    private toast: ToasterService,
    private _common: CommonUtil,
    private location: Location,
    private authService: AuthService, private spinnerService: SpinnerService) {
    this.common = _common;


    this.patientQue = this.nurseService.patientQ;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.nurseService.patientQ != undefined && this.nurseService.patientQ != null && JSON.stringify(this.nurseService.patientQ) != '{}') {
      window.localStorage.setItem('selectedPatientDetailsForVitals', cryptoUtil.encryptData(JSON.stringify(this.nurseService.patientQ)));
    }
    else if (this.nurseService.patientQ == undefined || this.nurseService.patientQ == null || JSON.stringify(this.nurseService.patientQ) == '{}') {
      this.patientQue = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedPatientDetailsForVitals')));
    }
    if (this.patientQue)
      this.profileId = this.patientQue.patientProfileId;
    console.log('isfromdoctor', this.isFromDoctor)
    console.log("patientqueue----->" + JSON.stringify(this.patientQue));
    console.log('activeroute@custom', router.url);

  }

  ngOnInit(): void {
    this.preventDefault();
    if (this.router.url == '/app/nurse/questionnaire') {
      this.getQuestinnaireData();
      this.enableQuestionnaire = true;
      this.enableVitals = false;
      this.consentVerified = true;
    }
    else {
      this.enableQuestionnaire = false;
      this.enableVitals = true;
      if (this.isFromDoctor == true && Config.portal.doctorOptions.enableOtpBasedConsent == true) {

        this.checkConsent();
      } else {
        this.consentVerified = true;
        this.getVitalReadings();

      }
    }
    console.log("PATIENT QUE in ngOnInit():: " + JSON.stringify(this.patientQue));

  }

  checkConsent() {
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
    requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
    requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.consentContentType = 3;
    this.spinnerService.start();
    this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
      this.spinnerService.stop();
      if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
        this.consentVerified = true;
        this.getVitalReadings();
      }
      else if (consentStatus.statusCode == 412) {
        this.onConsentRequestClickHandler()
      }

    })
  }



  private preventDefault() {
    let self = this;
    $(document).on("wheel", "input[type=number]", function (e) {
      $(this).blur();
    });
    $('input[type=number]').on('mousewheel.disableScroll', function (e) {
      e.preventDefault();
    });
    $('#dvital_modelView').on('hidden.bs.modal', (e) => {
      console.log("dvital_modelView hidden log_model");
      $('#vital-readings').removeClass('vital_modelView_bg');
      self.modelView = '';
      self.reportResponse = undefined;
    });
    $('#dvital_modelView').on('show.bs.modal', function (e) {
      console.log("dvital_modelView show  log_model");
      $('#vital-readings').addClass('vital_modelView_bg');
    });
    $('#vitalsReadingComponentModel').on('show.bs.modal', function (e) {
      console.log("vitalsReadingComponentModel show log_model");
      (<any>$("#vital_modelView")).modal("hide");
    });
    $('#vitalsReadingComponentModel').on('hidden.bs.modal', function (e) {
      console.log("vitalsReadingComponentModel hidden log_model");
      $('.modal-backdrop').remove();
    });
    // $('#vitalsReadingComponentModel').on('hidden.bs.model', (e) => {
    //   console.log("vitalsReadingComponentModel closed");
    //   (<any>$("#vital_modelView")).modal("hide");//vitalsReadingComponentModel
    // });
    $("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });
  }

  getPHRGraphplots(report: any = this.report) {
    this.report = report;
    let reportId = this.report.reportId;
    this.reportResponse = undefined;
    this.spinnerService.start();
    this.doctorService.getPHRTestReportGraphplots(
      this.patientQue.patientProfileId,
      this.patientQue.parentProfileId,
      reportId, this.graphIntervals[this.graphIntervalsIndex].startingDate, new Date().getTime()
    ).then((data) => {
      this.spinnerService.stop();
      if (data) {
        console.log(data);
        (<any>$("#dvital_modelView")).modal("show");
        this.modelView = "reportGraph";
        this.reportResponse = data;
        $('#vitalsReadingComponentModel').scrollTop(0);
        $('#wizardvitalsReadingComponentModel').scrollTop(0);
      }
      else {
        this.reportResponse = new Array();
      }
    }).catch((e) => {
      this.spinnerService.stop();
      console.log(e);
      this.reportResponse = new Array();
    });

  }
  closeModal(id: string) {
    (<any>$(id)).modal("hide");
    $('<div class="modal-backdrop in"></div>').appendTo(document.body);
  }



  async getVitalReadings() {
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    if (this.patientQue == undefined) {
      // this.consentVerified = true;
      if (!this.isFromDoctor && this.patientQue.bookingSubType != 1)
        this.router.navigate(['./app/nurse']);
      else if (!this.isFromDoctor && this.patientQue.bookingSubType == 1)
        this.router.navigate(['./app/reception/digiqueue/vital']);
      else
        this.router.navigate(['./app/doctor/patientphrsummary']);
    } else {
      // this.spinnerService.start();
      await this.nurseService.getVitalsDetails(date, this.patientQue.patientProfileId).then(res => {
        // this.spinnerService.stop();
        if (res.statusCode == 200 || res.statusCode == 201) {
          this.vitalInputList = res.phrAns;
          // this.consentVerified = true;
          this.setInputValuesFromPHRAns(this.vitalInputList);
        }
        // else if (res.statusCode == 412 && this.consentVerified == false && this.isFromDoctor == true) {
        //   this.onConsentRequestClickHandler()
        // }

      });
    }


  }

  setInputValuesFromPHRAns(phrAns: NonInvasiveTestDetails[]) {
    phrAns.forEach((phr, index) => {
      if (phr.componentId == Question.COMPONENT_OPTIONS) {
        if (!phr.ans) phr.ans = '';
        let ansList = phr.ans.split(".");
        if (ansList.length == 0)
          ansList = ['', '']
        if (ansList.length == 1)
          ansList = [ansList[0], '']
        phr.ansList = ansList;
      }
      if (phr.id == 1)
        this.heightIndex = index;
      else if (phr.id == 3)
        this.weightIndex = index;
      else if (phr.id == 45) {
        this.bmiIndex = index;
        phr.isDisabled = true;
      }
    })
  }
  getPhrAnsFromInputValue(phrAns: NonInvasiveTestDetails[]) {
    phrAns.forEach(phr => {
      if (phr.componentId == Question.COMPONENT_OPTIONS) {
        let ansList: any[] = phr.ansList;
        phr.ans = ansList.join('.');
        phr.value = ansList.join('.');
      }
      if (phr.inputType == 2) {
        if (this.enableVitals == true) {
          phr.ans = isNaN(parseFloat(phr.value)) ? undefined : phr.value;
          phr.value = phr.ans;
        }
        else {
          phr.ans = phr.value;
        }


      }
    });
    console.log(phrAns);
  }



  onChangeInput(event, phrAns: NonInvasiveTestDetails, choiceIndex = 0) {
    // phrAns.value =  
    console.log('');
    if (phrAns.inputType == 2) {
      if (this.enableVitals == true)
        phrAns.value = !Number.isNaN(parseFloat(phrAns.value)) ? (phrAns.value) + '' : '';
      else
        phrAns.value = (phrAns.value);
      console.log('onChangeInput', phrAns.value);
    }
    if (phrAns.id == 3) {//weight
      if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
    }
    else if (phrAns.id == 59) {//Temperature
      if (!this.minMaxValidator(event, phrAns, 0, 110)) return;
    }
    else if (phrAns.id == 13) {//Pulse Rate
      if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
    }
    else if (phrAns.id == 14) {//Sys BP
      if (!this.minMaxValidator(event, phrAns, 0, 300)) return;
    }
    else if (phrAns.id == 19) {//Dia BP
      if (!this.minMaxValidator(event, phrAns, 0, 300)) return;
    }
    else if (phrAns.id == 15) {//Resp Rate
      if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
    }
    else if (phrAns.id == 12) {//SpO2
      if (!this.minMaxValidator(event, phrAns, 0, 100)) return;
    }
    else if (phrAns.id == 16) {//Waist
      if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
    }
    else if (phrAns.id == 17) {//Breath Hold
      if (!this.minMaxValidator(event, phrAns, 0, 200)) return;
    } else if (phrAns.id == 1) {//height
      let feet = choiceIndex == 0 ? +event.target.value : +this.vitalInputList[this.heightIndex].ansList[0];
      let inch = choiceIndex == 1 ? +event.target.value : +this.vitalInputList[this.heightIndex].ansList[1];
      let weight = +this.vitalInputList[this.weightIndex].value;
      this.calculateBMI(+feet, +inch, +weight);
    }
  }
  minMaxValidator(event: any, phrAns: NonInvasiveTestDetails, min: number, max: number) {
    if (phrAns.inputType == 2 && isNaN(+event.target.value)) {
      phrAns.value = '';
      this.toast.show(`Enter a valid ${phrAns.unit ? phrAns.unit : 'unit'}`);
      // return;
    }
    else if (+event.target.value > max) {
      event.preventDefault();
      phrAns.value = '';
      this.toast.show(`${phrAns.name} can't exceed ${max} ${phrAns.unit ? phrAns.unit : ''}`);
      return false;
    }
    else if (+event.target.value < min) {
      event.preventDefault();
      phrAns.value = '';
      this.toast.show(`${phrAns.name} can't be lesser then ${min} ${phrAns.unit ? phrAns.unit : ''}`);
      return false;
    }
    else if ((+event.target.value) < min) {
      event.preventDefault();
      phrAns.value = '';
      this.toast.show(`${phrAns.name} can't be lesser then ${min} ${phrAns.unit ? phrAns.unit : ''}`);
      return false;
    }
    else if (event.target.value && event.target.value.length > 0 && !this.decimalNoValidater(event.target.value)) {
      event.preventDefault();
      phrAns.value = '';
      this.toast.show(`Decimal value should not exceed more than two digits`);
      return false;
    }
    return true;
  }

  decimalNoValidater(number) {
    var regexp = /^\d+(?:\.\d{0,2})?$/;
    return regexp.test(number);
  }

  onKeyUp(event, phrAns: NonInvasiveTestDetails, choiceIndex = 0) {
    // console.log(JSON.stringify(phrAns))
    if (phrAns.id == 3) {//weight
      let feet = +this.vitalInputList[this.heightIndex].ansList[0];
      let inch = +this.vitalInputList[this.heightIndex].ansList[1];
      let weight = +event.target.value;
      this.calculateBMI(+feet, +inch, +weight);
    }
    this.onChangeInput(event, phrAns, choiceIndex);
  }


  calculateBMI(feet, inch, weight) {

    let heightInMeter = parseFloat((((+feet * 30.48) + (+inch * 2.54)) / 100).toFixed(2));
    let bmi = Math.round(+(weight / (heightInMeter * heightInMeter)) * 100) / 100;

    console.log(bmi, feet, inch, weight);
    this.vitalInputList[this.bmiIndex].value = bmi.toString();
    console.log(bmi, this.vitalInputList[this.bmiIndex])
  }

  updatedVitals() {
    let patientVitalInfo: any = {};
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.getPhrAnsFromInputValue(this.vitalInputList);
    patientVitalInfo.updatedBy = new UpdatedByEmpInfo();
    patientVitalInfo.updatedBy.empId = this.authService.employeeDetails.empId;
    patientVitalInfo.updatedBy.firstName = this.authService.employeeDetails.firstName;
    patientVitalInfo.updatedBy.lastName = this.authService.employeeDetails.lastName ? this.authService.employeeDetails.lastName : '';
    patientVitalInfo.updatedBy.title = this.authService.employeeDetails.title;
    if (this.isFromDoctor) {
      patientVitalInfo.updatedBy.roleId = RoleConstants.doctorRoleId; //for vitals
      patientVitalInfo.updatedBy.roleName = RoleConstants.doctorRoleName;
    }
    else {
      patientVitalInfo.updatedBy.roleId = RoleConstants.nurseRoleId; //for vitals
      patientVitalInfo.updatedBy.roleName = RoleConstants.nurseRoleName;
    }
    patientVitalInfo.vitalStatus = 1; // for complete
    patientVitalInfo.orderId = this.patientQue.orderId;
    patientVitalInfo.invoiceId = this.patientQue.invoiceId;
    //patientVitalInfo.patientAge = this.patientQue.patientAge;
    patientVitalInfo.patientGender = this.patientQue.patientGender;
    patientVitalInfo.patientFirstName = this.patientQue.patientFirstName;
    patientVitalInfo.patientTitle = this.patientQue.patientTitle;
    patientVitalInfo.patientLastName = this.patientQue.patientLastName ? this.patientQue.patientLastName : '';
    patientVitalInfo.patientProfileId = this.patientQue.patientProfileId;
    patientVitalInfo.parentProfileId = this.patientQue.parentProfileId;
    patientVitalInfo.doctorId = this.patientQue.doctorId;
    patientVitalInfo.doctorFirstName = this.patientQue.doctorFirstName;
    patientVitalInfo.doctorLastName = this.patientQue.doctorLastName ? this.patientQue.doctorLastName : '';
    patientVitalInfo.doctorTitle = this.patientQue.doctorTitle;
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    patientVitalInfo.date = date;
    patientVitalInfo.phrAns = this.vitalInputList;
    if (this.patientQue.bookingSubType == 1) {
      patientVitalInfo.digiQueue = true;
    }

    this.nurseService.updateVitalsToServer(patientVitalInfo).then(data => {

      if (data.statusCode == 200 || data.statusCode == 201) {
        this.onSubmitEmit.emit("SUBMITTED");
        if (this.isFromDoctor) {
          // this.isSubmit = false;
          (<any>$("#vitalsReadingComponentModel")).modal("hide");
        }
        setTimeout(() => { this.navigatetoNurse(); this.spinnerService.stop() }, 500);// setting timer..go after 2andHalf sec

      } else {
        this.toast.show(`${data.statusMessage}`);
      }

    }).catch(() => {
      this.spinnerService.stop();
    });

  }
  navigatetoNurse() {

    if (!this.canNavigate) {
      return;
    }
    if (!this.isFromDoctor && this.patientQue.bookingSubType != 1) {
      this.router.navigate(['./app/nurse']);
    }
    else if (!this.isFromDoctor && this.patientQue.bookingSubType == 1) {
      this.router.navigate(['./app/reception/digiqueue/vital']);
    }
    else {
      this.router.navigate(['./app/doctor/patientphrsummary']);
    }
  }

  validateNumber(event) {
    return event.charCode == 46 || (event.charCode >= 48 && event.charCode <= 57)
  }

  /* validateNumberFormat(number: any, param: string) {
    var re = /^\d{0,3}(\.\d{1,6})?$/;
    var found = number.match(re);
    if (found === null) {
      window.alert('Please enter valid' + " " + param);
      this.vitals.forEach(element => {
        if (element.name === param)
          element.value = -1;
      });
    }
    else {
      this.vitals.forEach(element => {
        if (element.name === param)
          element.value = number;
 */

  toggleDropdown(id: string) {
    (<any>$(id)).dropdown();
  }


  async onConsentRequestClickHandler() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();

    this.selectedPatient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientQueue')));
    this.requestConsentForPatient = `${this.selectedPatient.patientTitle ? this.selectedPatient.patientTitle + '. ' : ''} ${('' + this.selectedPatient.patientFirstName).slice(0, 22)} ${this.selectedPatient.patientLastName ? ('' + this.selectedPatient.patientLastName).slice(0, 22) : ''}`;
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0 };
    requestBody.parentProfileId = this.selectedPatient.parentProfileId;
    requestBody.patientProfileId = this.selectedPatient.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    await this.doctorService.requestPatientConsent(requestBody).then((response) => {
      if (response.statusCode == 401) {
        this.toast.show("Something went wrong,please try again", "bg-warning text-white font-weight-bold", 3000);
      }

    });

  }


  verifyConsentOtpHandler() {
    let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "otp": '' };
    requestBody.parentProfileId = this.selectedPatient.parentProfileId;
    requestBody.patientProfileId = this.selectedPatient.patientProfileId;
    requestBody.empId = this.authService.employeeDetails.empId;
    requestBody.otp = this.consentOtp;
    this.doctorService.verifyConsentOtp(requestBody).then((response) => {
      if (response.statusCode == 200 || response.statusCode == 201) {
        this.doctorService.consentOtpVerified = true;
        this.consentVerified = true;
        this.toast.show("Consent request succesful", "bg-success text-white font-weight-bold", 3000);
        this.getVitalReadings();
      }
      else if (response.statusCode == 401) {
        this.onOtpChange(' ');
        this.toast.show(response.statusMessage, "bg-warning text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      this.ngOtpInput.setValue('');
      this.consentOtp = '';

    });;
  }

  onOtpChange(event) {
    console.log('onOtpChange', event)
    this.consentOtp = event;
  }

  getQuestinnaireData() {
    console.log('patientQue', JSON.stringify(this.patientQue))
    let bookingType = this.patientQue.bookingType;
    let bookingSubType = this.patientQue.bookingSubType;
    if (`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT}`
      || `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_VIDEO}_0` || `${bookingType}_${bookingSubType}` === `0_2`
    ) {
      this.getVideoConsultationQuestinnaire();
    }
    else if ((`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN}` ||
      `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC}`
      || `${bookingType}_${bookingSubType}` === `0_0` || `${bookingType}_${bookingSubType}` === `0_3`
    )) {
      this.getWalkinConsultationQuestinnaire();
    }
  }

  async getWalkinConsultationQuestinnaire() {
    let profileId = this.patientQue.patientProfileId;
    this.spinnerService.start();
    await this.nurseService.getWalkinBookingQuestions(profileId).then((res) => {
      this.spinnerService.stop();
      if (res.statusCode == 200 || res.statusCode == 201) {
        this.setQuestionnaireData(res)
      }
    })
  }

  getVideoConsultationQuestinnaire() {
    this.spinnerService.start();
    this.doctorService.getAnsOfVideoBooking(this.profileId).then((res) => {
      this.spinnerService.stop();
      if (res.statusCode == 200 || res.statusCode == 201) {
        this.setQuestionnaireData(res)
      }
    })
  }

  setQuestionnaireData(response) {
    let bookingQuestions: any[];
    if (response && response.activities && response.activities.length && response.activities[0].question) {
      bookingQuestions = response.activities[0].question;
      bookingQuestions.forEach((question) => {
        if (question.text != undefined || question.text != null) {
          question.name = question.text;
        }
        else if (question.desc != undefined || question.desc != null) {
          question.name = question.desc;
        }

        if ((question.componentId == 0 || question.componentId == 1 || question.componentId == 4 || question.componentId == 5) && (question.choices == undefined || question.choices == null)) {
          question.choices = [];
          let x = [{ 'count': 0, 'id': "", 'option': "SELECT" }];
          question.choices[0] = x;
        }
        question.unit = '';
        question.value = question.ans;
        // if (question.componentId == 4) {
        //   question.choices[0].forEach((choice) => {
        //     console.log('bookingQuestions', choice);
        //     (choice.id == question.ans) ? question.value = choice.option : '';
        //   })
        // }
        question.phrAns = {
          "id": question.id,
          "value": question.value,
          "userId": this.profileId,
          "historyGraphDisabled": false,
        }
      });

    }
    this.vitalInputList = bookingQuestions;
    this.setInputValuesFromPHRAns(this.vitalInputList);

  }

  updateWalkinConsultationQuestinnaire() {
    this.getPhrAnsFromInputValue(this.vitalInputList);
    this.nurseService.updateWalkinBookingQuestions({
      "parentProfileId": this.patientQue.parentProfileId,
      "createdTime": new Date().getTime(),
      "profileId": this.profileId,
      "addedToOnboarding": true,
      "phrAns": this.vitalInputList,
      "phrType": PhrAnswer.PHR_TYPE_WALKIN
    }).then((res) => {
      if (res.statusCode == 200 || res.statusCode == 201) {
        this.toast.show("Updated Successfully", "bg-success text-white font-weight-bold", 3000);
        this.router.navigate(['./app/nurse']);
      } else {

      }
    }).catch(error => {
    });
  }

  updateVideoConsultationQuestinnaire() {
    this.getPhrAnsFromInputValue(this.vitalInputList);
    this.nurseService.updateVideoBookingQuestions({
      "parentProfileId": this.patientQue.parentProfileId,
      "profileId": this.profileId,
      "addedToOnboarding": false,
      "phrPdfGenerated": false,
      "phrAns": this.vitalInputList,
      "phrType": PhrAnswer.PHR_TYPE_VIDEO
    }).then((res) => {
      if (res.statusCode == 200 || res.statusCode == 201) {
        this.toast.show("Updated Successfully", "bg-success text-white font-weight-bold", 3000);
        this.router.navigate(['./app/nurse']);
      } else {

      }
    }).catch(error => {
    });
  }

}

