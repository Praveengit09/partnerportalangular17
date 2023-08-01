import { DoctorService } from "../../../doctor/doctor.service";
import { Location } from '@angular/common';
import { NgModule, Component, ViewEncapsulation, Injector, OnDestroy, OnInit, NgZone, Input, Output, EventEmitter } from "@angular/core";
import { AppConfig } from '../../../app.config';
import { NurseService } from '../../nurse.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { PatientVitalInfo } from '../../../model/phr/patientVitalInfo';
import { NgForm } from "@angular/forms";
import { PatientQueue } from '../../../model/reception/patientQueue';
import { UpdatedByEmpInfo } from '../../../model/employee/updatedByEmpInfo';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { RoleConstants } from '../../../constants/auth/roleconstants';
import { VitalDetail } from '../../../model/phr/vitalDetail';
import { CommonUtil } from "../../../base/util/common-util";
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'staticvitalsReadingComponent',
  templateUrl: './vitalsreadingstatic.template.html',
  styleUrls: ['./vitalsreadingstatic.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StaticVitalsreadingComponent {
  config: any;
  month: any;
  year: any;
  error: any;
  isAge: boolean = false;
  isDOB: boolean = true;
  emptyStr: string = " ";
  empId: number;
  empName: string;
  patientId: number;
  errorMessage: string;
  heightUnitBoolean: Boolean = true;
  dropDownIndexForFeet: string;
  dropDownIndexForInch: string;
  dropDownIndexForHeightUnit: number;
  dropDownIndexForWeightUnit: number;
  heightUnit: string[] = ["feet-inch", "cms"];
  weightUnit: string[] = ["Kgs", "lbs"];
  feet: number = 0;
  inch: number = 0;
  heightCms: number = 0;
  weightKgs: number = 0;
  weightLbs: number = 0;
  weight: number = 0;
  bmi: number = 0;
  temperature: number = 0;
  pulseRate: number = 0;
  systolicbp: number = 0;
  diastolicbp: number = 0;
  headcircumference: number = 0;
  checkAge: number = 0;
  // orderId : string = null;
  respiratoryRate: number = 0;
  spo2: number = 0;
  FEET_CONST: number = 30.48;
  INCH_CONST: number = 2.54;
  KGS_CONST: number = 0.45359237;
  LBS_CONST: number = 2.2046226218487757;
  errorMsg: string;
  isSubmit: boolean;
  @Input() patientQue: PatientQueue;
  modelView = "";
  toDate: number = new Date().getTime();

  graphIntervalsIndex = 1;
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
  patientVitalInfo: PatientVitalInfo = new PatientVitalInfo;
  common: CommonUtil;
  checkVitals: boolean;
  vitals = [{ name: 'temperature', value: 0 }, { name: 'pulseRate', value: 0 }, { name: 'systolicbp', value: 0 }, { name: 'diastolicbp', value: 0 },
  { name: 'respiratoryRate', value: 0 }, { name: 'headcircumference', value: 0 }, { name: 'spo2', value: 0 }];

  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  @Input() isFromDoctor: boolean;
  @Input() canNavigate: boolean = true;
  @Output() onSubmitEmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(config: AppConfig, injector: Injector, private router: Router,
    private nurseService: NurseService, private activatedRoute: ActivatedRoute,
    private doctorService: DoctorService,
    private _common: CommonUtil,
    private location: Location,
    private authService: AuthService, private spinnerService: SpinnerService) {
    $(document).on("wheel", "input[type=number]", function (e) {
      $(this).blur();
    });
    this.common = _common;
    this.config = config.getConfig();
    this.empId = authService.userAuth.employeeId;
    this.empName = authService.userAuth.employeeName;
    this.patientQue = this.nurseService.patientQ;
    console.log("patientqueue----->" + JSON.stringify(this.patientQue));
    if (this.patientQue != undefined) {
      if (isNaN(parseInt(this.common.getAge(this.patientQue.patientDOB).split(",")[0]))) {
        this.checkAge = 0;
      } else {
        this.checkAge = parseInt(this.common.getAge(this.patientQue.patientDOB).split(",")[0]);
        if (this.checkAge == 13 && (parseInt(this.common.getAge(this.patientQue.patientDOB).split(",")[1]) > 0)) {
          this.checkAge = 14;
        }
      }
    }
    this.isSubmit = false;
    this.dropDownIndexForFeet = '0';
    this.dropDownIndexForInch = '0';
    this.dropDownIndexForHeightUnit = 0;
    this.dropDownIndexForWeightUnit = 0;
  }

  ngOnInit(): void {
    let self = this;
    $('input[type=number]').on('mousewheel.disableScroll', function (e) {
      e.preventDefault()
    });
    $('#vital_modelView').on('hidden.bs.modal', (e) => {
      console.log("vital_modelView hidden log_model");
      $('#vital-readings').removeClass('vital_modelView_bg');
      self.modelView = '';
      self.reportResponse = undefined;
    });
    $('#vital_modelView').on('show.bs.modal', function (e) {
      console.log("vital_modelView show  log_model");
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
    console.log("PATIENT QUE in ngOnInit():: " + JSON.stringify(this.patientQue));
    this.getVitalReadings();
  }

  getPHRGraphplots(report: any = this.report) {
    this.report = report;
    let reportId = this.report.reportId;
    this.reportResponse = undefined;
    this.spinnerService.start();
    this.doctorService.getPHRTestReportGraphplots(
      this.patientQue.patientProfileId,
      this.patientQue.parentProfileId,
      reportId, this.graphIntervals[this.graphIntervalsIndex].startingDate, this.toDate
    ).then((data) => {
      this.spinnerService.stop();
      if (data) {
        console.log(data);
        (<any>$("#vital_modelView")).modal("show");
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
  }

  checkAgeSelection(index: number) {
    if (index == 0) {
      this.isAge = false;
      this.isDOB = true;
      // this.registrationVo.providedOnlyAge = false;
    }
    else {
      this.isDOB = false;
      this.isAge = true;
      // this.registrationVo.providedOnlyAge = true;
    }
  }

  getVitalReadings() {
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    if (this.patientQue == undefined) {
      if (!this.isFromDoctor)
        this.router.navigate(['/app/nurse']);
      else
        this.router.navigate(['/app/doctor/patientphrsummary']);
    } else {
      this.spinnerService.start();
      this.nurseService.getVitalsDetails(date, this.patientQue.patientProfileId).then(patientVitalsDetails => {
        this.spinnerService.stop();
        this.patientVitalInfo = patientVitalsDetails;
        console.log("PatientVitalsDetails in getVitalReadings():: " + JSON.stringify(this.patientVitalInfo));
        if (this.patientVitalInfo.vitalStatus == 1 && this.patientVitalInfo.vitalDetail != undefined && this.patientVitalInfo.vitalDetail != null) {
          // this.heightCms = parseFloat(this.patientVitalInfo.vitalDetail.height);
          if (this.patientVitalInfo.vitalDetail.height != undefined && this.patientVitalInfo.vitalDetail.height != null) {
            let ht: string = '' + parseFloat(this.patientVitalInfo.vitalDetail.height);
            this.dropDownIndexForFeet = ht.split('.')[0];
            this.feet = parseInt(this.dropDownIndexForFeet);
            this.dropDownIndexForInch = ht.split('.')[1] ? ht.split('.')[1] : '0';
            this.inch = parseInt(this.dropDownIndexForInch);
          }
          this.weightKgs = this.weight = parseFloat(this.patientVitalInfo.vitalDetail.weight.toFixed(2));
          this.bmi = parseFloat((this.patientVitalInfo.vitalDetail.bMI).toFixed(2));
          this.temperature = parseFloat(this.patientVitalInfo.vitalDetail.bodyTemperature.toFixed(2));
          this.pulseRate = parseFloat(this.patientVitalInfo.vitalDetail.pulseRate.toFixed(2));
          this.respiratoryRate = parseFloat(this.patientVitalInfo.vitalDetail.respiratoryRate.toFixed(2));
          this.systolicbp = parseFloat(this.patientVitalInfo.vitalDetail.systolicBP.toFixed(2));
          this.diastolicbp = parseFloat(this.patientVitalInfo.vitalDetail.diastolicBP.toFixed(2));
          this.spo2 = parseFloat(this.patientVitalInfo.vitalDetail.spO2.toFixed(2));
          if (this.checkAge < 14) {
            this.headcircumference = parseFloat(this.patientVitalInfo.vitalDetail.headcircumference.toFixed(2));
          }
          //this.onHeightCmChange(this.heightCms);
        } else {
          this.patientVitalInfo.vitalDetail = new VitalDetail();
        }
      });
    }
  }

  onFeetDropDownChange(feet: string) {
    if (feet != "Select Feet") {
      this.feet = parseInt(feet);
      console.log("FEET in  onFeetDropDownChange()::" + this.feet);
    }
  }

  onInchDropDownChange(inch: string) {
    if (inch != "Select Inch") {
      this.inch = parseInt(inch);
      console.log("INCH in onInchDropDownChange()::" + this.inch);
    }
  }

  onHeightUnitDropDownChange(index: number) {
    this.heightCms = parseFloat(((this.feet * 30.48) + (this.inch * 2.54)).toFixed(2));
    if (index == 0) {
      this.heightUnitBoolean = true;
      this.onHeightCmChange(this.heightCms);
    } else {
      this.heightUnitBoolean = false;
    }
    console.log("HEIGHT in cms in onHeightUnitDropDownChange()::" + this.heightCms);
  }

  onHeightCmChange(heightInCm: number) {
    console.log("HEIGHT in cms in onHeightCmChange()::" + heightInCm);
    let feet: string = ((heightInCm / 30.48) + "").split(".")[0];
    let inches: string = Math.ceil(Math.ceil(heightInCm / 2.54) - (parseInt(feet) * 12)) + "";
    this.feet = parseInt(feet);
    this.inch = parseInt(inches);
    console.log("FEET INCH in onHeightCmChange()::" + this.feet + " " + this.inch);
    this.dropDownIndexForFeet = feet + "";
    this.dropDownIndexForInch = inches + "";
  }

  onWeightUnitDropDownChange(index: number) {
    this.dropDownIndexForWeightUnit = index;
    if (index == 0) {
      this.weight = this.weightKgs = Math.round((this.weightLbs * this.KGS_CONST) * 100) / 100;
    } else {
      this.weight = this.weightLbs = Math.round((this.weightKgs * this.LBS_CONST) * 100) / 100;
    }
    console.log("Weight in  onWeightUnitDropDownChange():: " + this.weight);
  }

  onWeightChange(weight: number) {
    if (this.dropDownIndexForWeightUnit == 0) {
      this.weightKgs = weight;
      this.weightLbs = 0;
      console.log("Weight in Kgs in onWeightChange()::" + this.weightKgs);
    } else {
      this.weightLbs = weight;
      this.weightKgs = 0;
      console.log("Weight in Lbs in onWeightChange()::" + this.weightLbs);
    }
  }

  calculateBMI() {
    let heightInMeter = parseFloat((((this.feet * 30.48) + (this.inch * 2.54)) / 100).toFixed(2));
    let weight: number;
    if (this.dropDownIndexForWeightUnit == 0) {
      weight = this.weight;
    }
    else if (this.dropDownIndexForWeightUnit == 1) {
      weight = Math.round((this.weight * this.KGS_CONST) * 100) / 100;
    }
    else { }
    console.log("Height and Weight in calculateBMI()::" + heightInMeter + " " + weight);
    this.bmi = Math.round((weight / (heightInMeter * heightInMeter)) * 100) / 100;
    console.log("Perfect_BMI in calculateBMI()::" + this.bmi);
  }

  updatedVitals() {
    this.errorMessage = ' ';
    var str = '';
    this.vitals.forEach(element => {
      if (element.value === -1) {
        str === '' ? str = str + element.name : str = str + ',' + element.name;
        this.checkVitals = false;
      }

    });

    if (this.checkVitals === false) {
      window.alert('Please enter valid' + " " + str);
      return;
    }


    if (this.patientVitalInfo == undefined || this.patientVitalInfo == null)
      return;
    //let heightUpdate = parseFloat(((this.feet * 30.48) + (this.inch * 2.54)).toFixed(2));
    // this.patientVitalInfo.vitalDetail.height = heightUpdate + "";
    console.log("1Request Sending in  updatedVitals()::" + JSON.stringify(this.patientVitalInfo));
    console.log('patient que' + JSON.stringify(this.patientQue));
    if (this.patientVitalInfo.vitalDetail == null || this.patientVitalInfo.vitalDetail == undefined)
      this.patientVitalInfo.vitalDetail = new VitalDetail();
    if (this.feet > 0 || this.inch > 0)
      this.patientVitalInfo.vitalDetail.height = this.feet + "." + this.inch;
    if (this.weightKgs > 0 || this.weightLbs > 0) {
      if (this.weightKgs) {
        this.patientVitalInfo.vitalDetail.weight = this.weightKgs;
        if (this.weightLbs > 0) {
          console.log("=====>>>>>>>00000 " + this.weightLbs)
          this.weightKgs = Math.round((this.weightLbs * this.KGS_CONST) * 100) / 100;
          this.patientVitalInfo.vitalDetail.weight = this.weightKgs;
        }
      }
      else if (this.weightLbs) {
        this.weightKgs = Math.round((this.weightLbs * this.KGS_CONST) * 100) / 100;
        this.patientVitalInfo.vitalDetail.weight = this.weightKgs;
        if (this.weightKgs > 0) {
          this.patientVitalInfo.vitalDetail.weight = this.weightKgs;
        }
      }
    }
    if (this.bmi > 0) {
      this.patientVitalInfo.vitalDetail.bMI = this.bmi;
    }
    this.patientVitalInfo.vitalDetail.bodyTemperature = this.temperature;
    this.patientVitalInfo.vitalDetail.pulseRate = this.pulseRate;
    this.patientVitalInfo.vitalDetail.respiratoryRate = this.respiratoryRate;
    if (this.spo2 >= 0 && this.spo2 <= 100) {
      this.patientVitalInfo.vitalDetail.spO2 = this.spo2;
    }
    else {
      this.errorMessage = 'spo2 value must be less than or equal 100%'
      return;
    }
    this.patientVitalInfo.vitalDetail.systolicBP = this.systolicbp;
    this.patientVitalInfo.vitalDetail.diastolicBP = this.diastolicbp;
    if (this.checkAge < 14) {
      this.patientVitalInfo.vitalDetail.headcircumference = this.headcircumference;

    }
    this.patientVitalInfo.updatedBy = new UpdatedByEmpInfo();
    this.patientVitalInfo.updatedBy.empId = this.authService.employeeDetails.empId;
    this.patientVitalInfo.updatedBy.firstName = this.authService.employeeDetails.firstName;
    this.patientVitalInfo.updatedBy.lastName = this.authService.employeeDetails.lastName ? this.authService.employeeDetails.lastName : '';
    this.patientVitalInfo.updatedBy.title = this.authService.employeeDetails.title;
    if (this.isFromDoctor) {
      this.patientVitalInfo.updatedBy.roleId = RoleConstants.doctorRoleId; //for vitals
      this.patientVitalInfo.updatedBy.roleName = RoleConstants.doctorRoleName;
    }
    else {
      this.patientVitalInfo.updatedBy.roleId = RoleConstants.nurseRoleId; //for vitals
      this.patientVitalInfo.updatedBy.roleName = RoleConstants.nurseRoleName;
    }

    this.patientVitalInfo.vitalStatus = 1; // for complete
    this.patientVitalInfo.orderId = this.patientQue.orderId;
    this.patientVitalInfo.invoiceId = this.patientQue.invoiceId;
    //this.patientVitalInfo.patientAge = this.patientQue.patientAge;
    this.patientVitalInfo.patientGender = this.patientQue.patientGender;
    this.patientVitalInfo.patientFirstName = this.patientQue.patientFirstName;
    this.patientVitalInfo.patientTitle = this.patientQue.patientTitle;
    this.patientVitalInfo.patientLastName = this.patientQue.patientLastName ? this.patientQue.patientLastName : '';
    this.patientVitalInfo.patientProfileId = this.patientQue.patientProfileId;
    this.patientVitalInfo.parentProfileId = this.patientQue.parentProfileId;
    this.patientVitalInfo.doctorId = this.patientQue.doctorId;
    this.patientVitalInfo.doctorFirstName = this.patientQue.doctorFirstName;
    this.patientVitalInfo.doctorLastName = this.patientQue.doctorLastName ? this.patientQue.doctorLastName : '';
    this.patientVitalInfo.doctorTitle = this.patientQue.doctorTitle;
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    this.patientVitalInfo.date = date;
    console.log("PATIENT QUE in updatedVitals():: " + JSON.stringify(this.patientQue));
    console.log("Request Sending in  updatedVitals()::" + JSON.stringify(this.patientVitalInfo));

    // if ((this.patientQue.patientAge == undefined || this.patientQue.patientAge == null || this.patientQue.patientAge == 0) || (this.patientQue.patientGender == undefined ||
    //   this.patientQue.patientGender == null || this.patientQue.patientGender == '')) {
    //    this.nurseService.getMandatoryPhrProfile(this.patientQue.patientId).then(response => {
    //      console.log("Response during save::" + JSON.stringify(response));
    //      if (response.statusCode == 200 || response.statusCode == 201) {
    //        (<any>$)('#vitalModal').modal('show');
    //      } else {
    //      }
    //    });
    // } else {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.nurseService.updateVitalsToServer(this.patientVitalInfo).then(data => {
      this.spinnerService.stop();
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.errorMsg = data.statusMessage;
        window.alert(this.errorMsg);
        this.onSubmitEmit.emit("SUBMITTED");
        if (this.isFromDoctor) {
          // this.isSubmit = false;
          (<any>$("#vitalsReadingComponentModel")).modal("hide");
        }
        this.spinnerService.start();
        setTimeout(() => this.navigatetoNurse(), 2500);// setting timer..go after 2andHalf sec
      } else {
        this.errorMsg = "Something Went Wrong...!!!";
        window.alert(this.errorMsg);

        // this.isSubmit = true;
      }
    });
    //}
  }
  navigatetoNurse() {
    this.spinnerService.stop();
    if (!this.canNavigate) {
      return;
    }
    if (!this.isFromDoctor)
      this.router.navigate(['/app/nurse']);
    else
      this.router.navigate(['/app/doctor/patientphrsummary']);

  }
  validateNumber(event) {
    return event.charCode == 46 || (event.charCode >= 48 && event.charCode <= 57)
  }

  validateNumberFormat(number: any, param: string) {
    var re = /^\d{0,3}(\.\d{1,3})?$/;
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

      });
    }
    this.checkVitals = true;
  }

  toggleDropdown(id: string) {
    (<any>$(id)).dropdown();
  }


}

