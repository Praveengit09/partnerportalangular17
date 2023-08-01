import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PhrInvasive } from './../../../model/phr/phrInvasive';
import { OnboardingService } from '../../onboarding.service';
import { PhysicalData } from './../../../model/phr/physicalData';
import { PhrAnswer } from './../../../model/phr/phrAnswer';
import { IdValue } from './../../../model/phr/idValue';
import { AuthService } from './../../../auth/auth.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../base/util/common-util';
import { ValidationUtil } from '../../../base/util/validation-util';
import { RegistrationVO } from './../../../model/profile/registrationVO';
import { Config } from '../../../base/config';
import { NonInvasiveTestDetails } from '../../../model/phr/noninvasivetestdetails';

@Component({
  selector: 'onboardingPhysical',
  templateUrl: './physical.template.html',
  styleUrls: ['./physical.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PhysicalComponent implements OnInit {

  environment: string = Config.portal.name || 'MyMedic';

  config: any;
  phrInvasive: PhrInvasive;
  labsnoninvasive: Array<NonInvasiveTestDetails>;
  wtKgs: any;
  exactWeight: string;
  wtLbs: string;
  registrationVo: RegistrationVO = new RegistrationVO();
  details: NonInvasiveTestDetails[] = new Array<NonInvasiveTestDetails>();
  physicaldata = new PhysicalData();
  weightIndex: number = 0;
  choices: any[];
  heightCmChange: Boolean = false;
  heightUnit: string[] = ["feet-inch", "cms"];
  weightUnit: string[] = ["Kgs", "lbs"];
  idValueList: IdValue[] = new Array<IdValue>();
  updatedValueList: any[] = new Array<any>();
  heightUnitBoolean: Boolean = true;  // for cm textbox or feet-inch box display on template
  //hUnitChange: Boolean = false;           //dropdown used or not
  //wUnitChange: Boolean = false;
  dropDownIndex: number = 0;
  dropDownIndexForFeet: number = 0;
  dropDownIndexForInch: number = 0;
  dropDownIndexForHeightUnit: number = 0;
  dropDownIndexForWeightUnit: number = 0;
  dropDownIndexForWalkin: string;
  heightInFeet: number = 0;
  heightInInches: number = 0;
  profileId: number;
  hfeet: number = 30.48;
  hinch: number = 2.54;
  wkgs: number = 0.45359237;
  wlbs: number = 2.2046226218487757;
  checkAge: number = 0;
  headcircumference: any = 0;
  heightInCentimeter: string;
  bmi: string;
  weight: string;
  validation: any;

  constructor(config: AppConfig, private router: Router,
    private onboardingService: OnboardingService, private common: CommonUtil, private _validation: ValidationUtil,
    private activatedRoute: ActivatedRoute, private authService: AuthService,
    private spinnerService: SpinnerService) {

    this.config = config.getConfig();
    this.details = new Array<NonInvasiveTestDetails>();
    this.validation = _validation;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.profileId = params['profileId'];


      this.getPHRForProfileId(this.profileId);

    });

    this.physicaldata.weightUnit = 0;

  }
  getPHRForProfileId(profileId: any) {
    this.spinnerService.start();
    this.onboardingService.getPHRForProfileId(profileId).then(data => {
      this.registrationVo = data;
      this.getPhrInvasiveNonInvasive(this.profileId);
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  calculateBMI() {

    let heightInMeter = ((this.heightInFeet * this.hfeet) + (this.heightInInches * this.hinch)) / 100;

    let weight: number;
    this.weightIndex = 0;
    if (this.weightIndex == 0) {
      weight = parseFloat(this.weight);
    }
    else if (this.weightIndex == 1) {
      weight = parseFloat(((parseFloat(this.weight)) * this.wkgs).toFixed(2));
    }
    else { }
    this.bmi = (weight / (heightInMeter * heightInMeter)).toFixed(2);
    if (isNaN(parseInt(this.bmi))) {
      this.bmi = "0.0";
    }
    console.log("Perfect_BMI::" + this.bmi);

  }
  onWeightUnitDropDownChange(index: string) {
    this.weightIndex = parseInt(index);
    this.weight = this.onWeightChange(this.weightIndex);
  }
  onWeightChange(index: number) {
    let weight = '0.0';
    if (index == 0) {
      let weightInKgs = (parseFloat(this.weight) * this.wkgs).toFixed(2);
      this.wtKgs = weightInKgs + "";
      weight = this.wtKgs;
    } else if (index == 1) {
      let weightInLbs = (parseFloat(this.weight) * this.wlbs).toFixed(2);
      this.wtLbs = weightInLbs + "";
      weight = this.wtLbs;
    } else { }

    return weight;
  }


  onFeetDropDownChange(feet: string) {
    if (feet != "Select Feet") {
      this.physicaldata.heightFeet = feet;
    }
  }
  onInchDropDownChange(inch: string) {
    this.physicaldata.heightInch = inch;
  }

  onWalkDropDownChange(index: string) {
    for (let i = 0; i < this.choices.length; i++) {
      if (this.choices[i].id === index) {
        this.physicaldata.walkingValue = this.choices[i].id;
        break;
      }
    }
  }

  onHeightUnitDropDownChange(i) {
    let index = parseInt(i);
    let heightInCentimeter = (this.heightInFeet * this.hfeet) + (this.heightInInches * this.hinch);
    if (index == 0) {
      this.heightUnitBoolean = true;
      this.heightInFeet = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[0]);
      this.heightInInches = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[1]);
    } else {
      this.heightUnitBoolean = false;
      if (this.heightCmChange) {
        this.heightInFeet = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[0]);
        this.heightInInches = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[1]);
      }
      else {
        this.heightInCentimeter = heightInCentimeter + "";
      }
    }
  }

  onHeightCmChange(heightInCm: string) {

    this.heightCmChange = true;
    let feetInchvalue: number = parseFloat(heightInCm) / this.hfeet;
    let feetInch: string = feetInchvalue.toFixed(2) + "";
    let feet = feetInch.split(".")[0];
    let inch = feetInch.split(".")[1];

    if (inch[1] >= "5") {
      inch = parseFloat(inch[0]) + 1 + "";
    }
    else {
      inch = inch[0];
    }
    let height = feet + "," + inch;

    return height;
  }
  updatedPhrInvasiveNonInvasive(): void {
    let phrAnswer = new PhrAnswer();
    phrAnswer.profileId = this.profileId;

    phrAnswer.phrAns = new Array<IdValue>();
    let currentTime = (new Date()).getTime();
    for (var i = 0; i < this.labsnoninvasive.length; i++) {
      let idValue = new IdValue();
      switch (this.labsnoninvasive[i].id) {
        case 1:
          if (!this.heightUnitBoolean) {
            this.heightInFeet = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[0]);
            this.heightInInches = parseInt(this.onHeightCmChange(this.heightInCentimeter).split(",")[1]);
            idValue.id = this.labsnoninvasive[i].id;
            idValue.value = this.heightInFeet.toString() + "." + this.heightInInches.toString();
            idValue.userId = this.authService.employeeDetails.empId;
            idValue.updatedTime = currentTime;
          } else {
            idValue.id = this.labsnoninvasive[i].id;
            idValue.value = this.heightInFeet.toString() + "." + this.heightInInches.toString();
            idValue.userId = this.authService.employeeDetails.empId;
            idValue.updatedTime = currentTime;
          }
          break;

        case 3:
          if (this.weightIndex == 0) {
            idValue.id = this.labsnoninvasive[i].id;
            idValue.value = this.weight;
            idValue.userId = this.authService.employeeDetails.empId;
            idValue.updatedTime = currentTime;
          } else {
            idValue.id = this.labsnoninvasive[i].id;
            idValue.value = this.onWeightChange(0);
            idValue.userId = this.authService.employeeDetails.empId;
            idValue.updatedTime = currentTime;
          }
          break;
        case 16:
          idValue.id = this.labsnoninvasive[i].id;
          // idValue.value=(parseFloat(this.labsnoninvasive[i].value)/2.54).toString();
          idValue.value = (this.labsnoninvasive[i].value);
          idValue.userId = this.authService.employeeDetails.empId;
          idValue.updatedTime = currentTime;
          break;

        case 45:
          idValue.id = this.labsnoninvasive[i].id;
          idValue.value = this.bmi;
          idValue.userId = this.authService.employeeDetails.empId;
          idValue.updatedTime = currentTime;
          break;

        default:
          idValue.id = this.labsnoninvasive[i].id;
          idValue.value = this.labsnoninvasive[i].value;
          idValue.userId = this.authService.employeeDetails.empId;
          idValue.updatedTime = currentTime;
      }
      phrAnswer.phrAns.push(idValue);
    }

    console.log(this.heightInFeet + " phr Answer---> " + JSON.stringify(phrAnswer));
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.onboardingService.updatedPhrInvasiveNonInvasive(phrAnswer).then(data => {
      this.spinnerService.stop();
      alert(data.statusMessage);
      if (data.statusCode == 201 || data.statusCode == 200) {
        this.router.navigate(['/app/onboarding/updatelabtest/' + this.profileId])
      }
      if (data.statusCode == 410) {
        alert(data.statusMessage);
        this.router.navigate(['/app/onboarding/personal/' + this.profileId])
      }

    });
  }

  getPhrInvasiveNonInvasive(profileId: number): void {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.onboardingService.getPhrInvasiveNonInvasive(profileId).then(data => {
      this.spinnerService.stop();
      this.phrInvasive = data;
      this.labsnoninvasive = this.phrInvasive.labsnoninvasive;
      console.log("dataqwerty answer khulja" + parseFloat(this.labsnoninvasive[0].value));
      for (var i = 0; i < this.labsnoninvasive.length; i++) {
        switch (this.labsnoninvasive[i].id) {
          case 1:
            this.heightInFeet = parseInt((this.labsnoninvasive[i].value).split(".")[0]);
            if (isNaN(this.heightInFeet)) {
              this.heightInFeet = 0;
            }
            this.heightInInches = parseInt((this.labsnoninvasive[i].value).split(".")[1]);
            if (isNaN(this.heightInInches)) {
              this.heightInInches = 0;
            }
            break;

          case 3:
            this.weight = this.labsnoninvasive[i].value;
            break;

          case 45:
            this.bmi = this.labsnoninvasive[i].value;
            break;

          case 18:
            this.labsnoninvasive[i].value = this.labsnoninvasive[i].ans;
            break;
          default:
        }
      }

      if (this.registrationVo != undefined) {
        if (isNaN(parseInt(this.common.getAge(this.registrationVo.dob).split(",")[0]))) {
          this.checkAge = 0;
        } else {
          this.checkAge = parseInt(this.common.getAge(this.registrationVo.dob).split(",")[0]);
          if (this.checkAge == 13 && (parseInt(this.common.getAge(this.registrationVo.dob).split(",")[1]) > 0)) {
            this.checkAge = 14;
          }
        }
        console.log("here----" + this.checkAge)
      }
    });
  }


}
