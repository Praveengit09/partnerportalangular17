import { NgModule, Component, ViewEncapsulation, Injector, OnDestroy, OnInit, NgZone } from '@angular/core';
import { AppConfig } from './../../../app.config';
import { NurseService } from './../../../nurse/nurse.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from './../../../auth/auth.service';
import { PatientVitalInfo } from './../../../model/phr/patientVitalInfo';
import { NgForm } from "@angular/forms";
import { PatientQueue } from './../../../model/reception/patientQueue';
import { UpdatedByEmpInfo } from './../../../model/employee/updatedByEmpInfo';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { RoleConstants } from './../../../constants/auth/roleconstants';
import { VitalDetail } from './../../../model/phr/vitalDetail';
import { CommonUtil } from "../../../base/util/common-util";


@Component({
  selector: 'digivitalreadings',
  templateUrl: './vitalsreading.template.html',
  styleUrls: ['./vitalsreading.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DigiVitalsReadingComponent {
  config: any;
  month: any;
  year: any;
  isAge: boolean = false;
  isDOB: boolean = true;
  emptyStr: string = " ";
  empId: number;
  empName: string;
  patientId: number;
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
  patientQue: PatientQueue;
  patientVitalInfo: PatientVitalInfo = new PatientVitalInfo;
  common: CommonUtil;
  errorMessage: string = ' ';
  checkVitals: boolean;
  vitals = [{ name: 'temperature', value: 0 }, { name: 'pulseRate', value: 0 }, { name: 'systolicbp', value: 0 }, { name: 'diastolicbp', value: 0 },
  { name: 'respiratoryRate', value: 0 }, { name: 'headcircumference', value: 0 },{name:'spo2',value:0}];
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  constructor(config: AppConfig, injector: Injector, private router: Router,
    private nurseService: NurseService, private activatedRoute: ActivatedRoute,
    private _common: CommonUtil,
    private authService: AuthService, private spinnerService: SpinnerService) {
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
    // this.isSubmit = false;
    // this.dropDownIndexForFeet = '0';
    // this.dropDownIndexForInch = '-1';
    // this.dropDownIndexForHeightUnit = 0;
    // this.dropDownIndexForWeightUnit = 0;
  }
  
  


  ngOnInit(): void {
    // $('input[type=number]').on('mousewheel.disableScroll', function (e) {
    //   e.preventDefault()
    // })
    // $("input[type=number]").on("focus", function () {
    //   $(this).on("keydown", function (event) {
    //     if (event.keyCode === 38 || event.keyCode === 40) {
    //       event.preventDefault();
    //     }
    //   });
    // });
    // console.log("PATIENT QUE in ngOnInit():: " + JSON.stringify(this.patientQue));
    // this.getVitalReadings();
  }

  onSubmitEmit(){
    
  }

  // checkAgeSelection(index: number) {
  //   if (index == 0) {
  //     this.isAge = false;
  //     this.isDOB = true;
  //     // this.registrationVo.providedOnlyAge = false;
  //   }
  //   else {
  //     this.isDOB = false;
  //     this.isAge = true;
  //     // this.registrationVo.providedOnlyAge = true;
  //   }
  // }

  // getVitalReadings() {
  //   let currentDate: Date = new Date();
  //   currentDate.setHours(0);
  //   currentDate.setMinutes(0);
  //   currentDate.setSeconds(0);
  //   currentDate.setMilliseconds(0);
  //   let date = currentDate.getTime();
  //   if (this.patientQue == undefined) {
  //     this.router.navigate(['/app/nurse']);
  //   } else {
  //     this.spinnerService.start();
  //     this.nurseService.getVitalsDetails(date, this.patientQue.patientProfileId).then(patientVitalsDetails => {
  //       this.spinnerService.stop();
  //       this.patientVitalInfo = patientVitalsDetails;
  //       console.log("PatientVitalsDetails in getVitalReadings():: " + JSON.stringify(this.patientVitalInfo));
  //       if (this.patientVitalInfo.vitalStatus == 1 && this.patientVitalInfo.vitalDetail != undefined && this.patientVitalInfo.vitalDetail != null) {
  //         // this.heightCms = parseFloat(this.patientVitalInfo.vitalDetail.height);
  //         if (this.patientVitalInfo.vitalDetail.height != undefined && this.patientVitalInfo.vitalDetail.height != null) {
  //           let ht: string = parseFloat(this.patientVitalInfo.vitalDetail.height).toFixed(1);
  //           this.dropDownIndexForFeet = ht.split('.')[0];
  //           this.feet = parseInt(this.dropDownIndexForFeet);
  //           this.dropDownIndexForInch = ht.split('.')[1];
  //           this.inch = parseInt(this.dropDownIndexForInch);
  //         }
  //         this.weightKgs = this.weight = parseFloat(this.patientVitalInfo.vitalDetail.weight.toFixed(2));
  //         this.bmi = parseFloat((this.patientVitalInfo.vitalDetail.bMI).toFixed(2));
  //         this.temperature = parseFloat(this.patientVitalInfo.vitalDetail.bodyTemperature.toFixed(2));
  //         this.pulseRate = parseFloat(this.patientVitalInfo.vitalDetail.pulseRate.toFixed(2));
  //         this.respiratoryRate = parseFloat(this.patientVitalInfo.vitalDetail.respiratoryRate.toFixed(2));
  //         this.systolicbp = parseFloat(this.patientVitalInfo.vitalDetail.systolicBP.toFixed(2));
  //         this.diastolicbp = parseFloat(this.patientVitalInfo.vitalDetail.diastolicBP.toFixed(2));
  //         this.spo2 = parseFloat(this.patientVitalInfo.vitalDetail.spO2.toFixed(2));
  //         if (this.checkAge < 14) {
  //           this.headcircumference = parseFloat(this.patientVitalInfo.vitalDetail.headcircumference.toFixed(2));
  //         }
  //         //this.onHeightCmChange(this.heightCms);
  //       } else {
  //         this.patientVitalInfo.vitalDetail = new VitalDetail();
  //       }
  //     });
  //   }
  // }

  // onFeetDropDownChange(feet: string) {
  //   if (feet != "Select Feet") {
  //     this.feet = parseInt(feet);
  //     console.log("FEET in  onFeetDropDownChange()::" + this.feet);
  //   }
  // }

  // onInchDropDownChange(inch: string) {
  //   if (inch != "Select Inch") {
  //     this.inch = parseInt(inch);
  //     console.log("INCH in onInchDropDownChange()::" + this.inch);
  //   }
  // }

  // onHeightUnitDropDownChange(index: number) {
  //   this.heightCms = parseFloat(((this.feet * 30.48) + (this.inch * 2.54)).toFixed(2));
  //   if (index == 0) {
  //     this.heightUnitBoolean = true;
  //     this.onHeightCmChange(this.heightCms);
  //   } else {
  //     this.heightUnitBoolean = false;
  //   }
  //   console.log("HEIGHT in cms in onHeightUnitDropDownChange()::" + this.heightCms);
  // }

  // onHeightCmChange(heightInCm: number) {
  //   console.log("HEIGHT in cms in onHeightCmChange()::" + heightInCm);
  //   let feet: string = ((heightInCm / 30.48) + "").split(".")[0];
  //   let inches: string = Math.ceil(Math.ceil(heightInCm / 2.54) - (parseInt(feet) * 12)) + "";
  //   this.feet = parseInt(feet);
  //   this.inch = parseInt(inches);
  //   console.log("FEET INCH in onHeightCmChange()::" + this.feet + " " + this.inch);
  //   this.dropDownIndexForFeet = feet + "";
  //   this.dropDownIndexForInch = inches + "";
  // }

  // onWeightUnitDropDownChange(index: number) {
  //   this.dropDownIndexForWeightUnit = index;
  //   if (index == 0) {
  //     this.weight = this.weightKgs = Math.round((this.weightLbs * this.KGS_CONST) * 100) / 100;
  //   } else {
  //     this.weight = this.weightLbs = Math.round((this.weightKgs * this.LBS_CONST) * 100) / 100;
  //   }
  //   console.log("Weight in  onWeightUnitDropDownChange():: " + this.weight);
  // }

  // onWeightChange(weight: number) {
  //   if (this.dropDownIndexForWeightUnit == 0) {
  //     this.weightKgs = weight;
  //     console.log("Weight in Kgs in onWeightChange()::" + this.weightKgs);
  //   } else {
  //     this.weightLbs = weight;
  //     console.log("Weight in Lbs in onWeightChange()::" + this.weightLbs);
  //   }
  // }

  // calculateBMI() {
  //   let heightInMeter = parseFloat((((this.feet * 30.48) + (this.inch * 2.54)) / 100).toFixed(2));
  //   let weight: number;
  //   if (this.dropDownIndexForWeightUnit == 0) {
  //     weight = this.weight;
  //   }
  //   else if (this.dropDownIndexForWeightUnit == 1) {
  //     weight = Math.round((this.weight * this.KGS_CONST) * 100) / 100;
  //   }
  //   else { }
  //   console.log("Height and Weight in calculateBMI()::" + heightInMeter + " " + weight);
  //   this.bmi = Math.round((weight / (heightInMeter * heightInMeter)) * 100) / 100;
  //   console.log("Perfect_BMI in calculateBMI()::" + this.bmi);
  // }

  // updatedVitals() {
  //   this.errorMessage = ' ';
  //   var str = '';
  //   this.vitals.forEach(element => {
  //       if (element.value === -1) {
  //       str === '' ? str = str + element.name : str = str + ',' + element.name;
  //       this.checkVitals = false;
  //     }

  //   });

  //   if (this.checkVitals === false) {
  //     window.alert('Please enter valid' + " " + str);
  //     return;
  //   }
  //   if (this.patientVitalInfo == undefined || this.patientVitalInfo == null)
  //     return;
  //   //let heightUpdate = parseFloat(((this.feet * 30.48) + (this.inch * 2.54)).toFixed(2));
  //   // this.patientVitalInfo.vitalDetail.height = heightUpdate + "";
  //   console.log("1Request Sending in  updatedVitals()::" + JSON.stringify(this.patientVitalInfo));
  //   if (this.patientVitalInfo.vitalDetail == null || this.patientVitalInfo.vitalDetail == undefined)
  //     this.patientVitalInfo.vitalDetail = new VitalDetail();
  //   this.patientVitalInfo.vitalDetail.height = this.feet + "." + this.inch;
  //   this.patientVitalInfo.vitalDetail.weight = this.weightKgs;
  //   if (this.bmi > 0) {
  //     this.patientVitalInfo.vitalDetail.bMI = this.bmi;
  //   }
  //   this.patientVitalInfo.vitalDetail.bodyTemperature = this.temperature;
  //   this.patientVitalInfo.vitalDetail.pulseRate = this.pulseRate;
  //   this.patientVitalInfo.vitalDetail.respiratoryRate = this.respiratoryRate;
  //   if (this.spo2 >= 0 && this.spo2 <= 100) {
  //     this.patientVitalInfo.vitalDetail.spO2 = this.spo2;
  //   }
  //   else {
  //     this.errorMessage = 'spo2 value must be less than 100%'
  //     return;
  //   }
  //   this.patientVitalInfo.vitalDetail.systolicBP = this.systolicbp;
  //   this.patientVitalInfo.vitalDetail.diastolicBP = this.diastolicbp;
  //   if (this.checkAge < 14) {
  //     this.patientVitalInfo.vitalDetail.headcircumference = this.headcircumference;

  //   }
  //   this.patientVitalInfo.updatedBy = new UpdatedByEmpInfo();
  //   this.patientVitalInfo.updatedBy.empId = this.empId;
  //   this.patientVitalInfo.updatedBy.firstName = this.empName.split(" ")[0];
  //   this.patientVitalInfo.updatedBy.lastName = this.empName.split(" ")[1];
  //   this.patientVitalInfo.updatedBy.title = null;
  //   this.patientVitalInfo.updatedBy.roleId = RoleConstants.nurseRoleId; //for vitals
  //   this.patientVitalInfo.updatedBy.roleName = RoleConstants.nurseRoleName;
  //   this.patientVitalInfo.vitalStatus = 1; // for complete
  //   this.patientVitalInfo.orderId = this.patientQue.orderId;
  //   this.patientVitalInfo.invoiceId = this.patientQue.invoiceId;
  //   this.patientVitalInfo.patientGender = this.patientQue.patientGender;
  //   this.patientVitalInfo.patientTitle = this.patientQue.patientTitle;
  //   this.patientVitalInfo.patientFirstName = this.patientQue.patientFirstName;
  //   this.patientVitalInfo.patientLastName = this.patientQue.patientLastName ? this.patientQue.patientLastName : '';
  //   this.patientVitalInfo.patientTitle = this.patientQue.patientTitle;
  //   this.patientVitalInfo.patientProfileId = this.patientQue.parentProfileId;
  //   this.patientVitalInfo.doctorId = this.patientQue.doctorId;
  //   this.patientVitalInfo.doctorFirstName = this.patientQue.doctorFirstName;
  //   this.patientVitalInfo.doctorLastName = this.patientQue.doctorLastName ? this.patientQue.doctorLastName : '';
  //   this.patientVitalInfo.doctorTitle = this.patientQue.doctorTitle;
  //   this.patientVitalInfo.digiQueue = true;
  //   let currentDate: Date = new Date();
  //   currentDate.setHours(0);
  //   currentDate.setMinutes(0);
  //   currentDate.setSeconds(0);
  //   currentDate.setMilliseconds(0);
  //   let date = currentDate.getTime();
  //   this.patientVitalInfo.date = date;

  //   $('html, body').animate({ scrollTop: '0px' }, 300);
  //   this.spinnerService.start();
  //   this.nurseService.updateVitalsToServer(this.patientVitalInfo).then(data => {
  //     this.spinnerService.stop();
  //     if (data.statusCode == 200 || data.statusCode == 201) {
  //       this.errorMsg = data.statusMessage;
  //       window.alert(this.errorMsg);
  //       this.spinnerService.start();
  //       setTimeout(() => this.navigatetoNurse(), 2500);// setting timer..go after 2andHalf sec
  //     } else {
  //       this.errorMsg = "Something Went Wrong...!!!";
  //       window.alert(this.errorMsg);
  //     }
  //   });
  // }
  // navigatetoNurse() {
  //   this.spinnerService.stop();
  //   this.router.navigate(['/app/reception/digiqueue/vital'])
  // }

  // validateNumber(event) {
  //   return event.charCode == 46 || (event.charCode >= 48 && event.charCode <= 57)
  // }

  // validateNumberFormat(number: any, param: string) {
  //   var re = /^\d{0,3}(\.\d{1,6})?$/;
  //   var found = number.match(re);
  //   if (found === null) {
  //     window.alert('Please enter valid' + " " + param);
  //     this.vitals.forEach(element => {
  //       if (element.name === param)
  //         element.value = -1;
  //     });
  //   }
  //   else {
  //     this.vitals.forEach(element => {
  //       if (element.name === param)
  //         element.value = number;

  //     });
  //   }
  //   this.checkVitals = true;
  // }

}
