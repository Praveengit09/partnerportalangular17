import { DoctorService } from "./../../../doctor/doctor.service";
import {
  Component,
  ViewEncapsulation,
  Injector,
  OnInit,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { AuthService } from "./../../../auth/auth.service";
import { OnboardingService } from "../../onboarding.service";
import { RegistrationVO } from "./../../../model/profile/registrationVO";
import { Address } from "./../../../model/profile/address";
import { PHR } from "./../../../model/phr/phr";
import { PhrCategory } from "./../../../model/phr/phrCategory";
import { AreaOfInterest } from "./../../../model/phr/areaOfInterest";
import { State } from "./../../../model/base/state";
import { City } from "./../../../model/base/city";
import { PinCodeStateCity } from "./../../../model/base/pincodestatecity";
import { Social } from "./../../../model/profile/social";
import { ProfileDetails_others } from "./../../../model/profile/profileDetails_others";
import { Question } from "./../../../model/phr/question";
import { EmergencyContact } from "./../../../model/profile/emergencyContact";
import { ContactInfo } from "./../../../model/profile/contactInfo";
import { PhrAnswer } from "./../../../model/phr/phrAnswer";
import { IdValue } from "./../../../model/phr/idValue";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { CommonUtil } from "../../../base/util/common-util";
import { ValidationUtil } from "../../../base/util/validation-util";
import { PatientRegisterService } from "../../../patientregister/patientregister.service";
import { Config } from '../../../base/config';

@Component({
  selector: "onboardingPersonal",
  templateUrl: "./personal.template.html",
  styleUrls: ["./personal.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class PersonalComponent implements OnInit {
  config: any;
  date4: Date = new Date(2016, 5, 10);
  profileId: any;
  registrationVo: RegistrationVO = new RegistrationVO();
  isAge: boolean = false;
  isDOB: boolean = true;
  finalErrorCheck: boolean = false;

  isOfficeAddressVisible: boolean = false;
  isEmergencyAddressVisible: boolean = false;
  isResidencialAddressVisible: boolean = false;

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;

  pageIndex: number = 0;

  residencialAddress: Address = new Address();
  officeAddress: Address = new Address();
  phr: PHR = new PHR();
  phrCategoryList: Array<PhrCategory> = new Array();
  memberDate: Date;
  socialHandle: any;
  aboutMe: any;

  dataVisibility: boolean = false;

  //bmi calculation

  heightUnitBoolean: Boolean = true;
  dropDownIndexForFeet: string = "0";
  dropDownIndexForInch: string = "0";
  dropDownIndexForHeightUnit: number = 0;
  dropDownIndexForWeightUnit: number = 0;
  weightIndex: number;
  heightUnit: string[] = ["feet-inch", "cms"];
  weightUnit: string[] = ["Kgs", "lbs"];
  feet: number = 0;
  inch: number = 0;
  heightCms: number = 0;
  weightKgs: number = null;
  weightLbs: number = null;
  weight: number = null;
  bmi: string;
  temperature: number;
  pulseRate: number;
  systolicbp: number;
  diastolicbp: number;
  respiratoryRate: number;
  spo2: number;
  FEET_CONST: number = 30.48;
  INCH_CONST: number = 2.54;
  KGS_CONST: number = 0.45359237;
  LBS_CONST: number = 2.2046226218487757;
  ageYears: number = 0;
  ageMonths: number = 0;

  datepickerOpts = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };

  stateList: Array<State> = new Array();
  residencialCityList: Array<City> = new Array();
  officeCityList: Array<City> = new Array();
  emergencyCityList: Array<City> = new Array();
  areaOfInterestList: Array<AreaOfInterest> = new Array();
  statecityList: Array<PinCodeStateCity> = new Array<PinCodeStateCity>();

  feetInchValue: string = "0.0";
  feetInchQuestionId: number;

  isWellnessExpert: boolean = false;
  validation: any;
  common: any;
  titlesList: Array<string> = [
    "Mr",
    "Miss",
    "Mrs",
    "Master",
    "Baby",
    "Baby of",
    "Baby Boy",
    "Baby Girl",
    "Dr",
    "Prof",
    "Capt"
  ];

  @Input() isFromDoctor: boolean;
  @Output("refresh") refresh = new EventEmitter();
  isNurse: boolean;

  ngOnInit() {
    if (this.isFromDoctor) {
      this.pageIndex = 1;
    }
    if (this.isFromDoctor) {
      if (
        this.doctorService.patientQueue &&
        this.doctorService.patientQueue.patientProfileId
      ) {
        this.profileId = this.doctorService.patientQueue.patientProfileId;
        console.log(this.profileId);
      }
    } else
      this.activatedRoute.params.subscribe((params: Params) => {
        this.profileId = params["profileId"];
        let userType = params["userType"];
        if (userType == 'nurse') {
          this.isNurse = true;
          this.pageIndex = 1;
        }
      });
    if (!this.isFromDoctor) {
      this.getPHRForProfileId(this.profileId);
    }
    this.getPHRDetailsForProfileId(this.profileId);
    this.authService.getStatesAndCities().forEach(element => {
      this.stateList.push(element);
      this.stateList = this.sortTheResponseState(this.stateList);
    });

    jQuery("input[type=number]").on("mousewheel.disableScroll", function (e) {
      e.preventDefault();
    });
    jQuery("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });
    //this.physicaldata.heightUnit=this.heightUnit[0];
    // this.validation.restrictArrowKeyforNumberTextBox();
    // this.validation.restrictMouseScrollforNumberTextBox();
  }

  constructor(
    private onboardingService: OnboardingService,
    private activatedRoute: ActivatedRoute,
    private _validation: ValidationUtil,
    injector: Injector,
    private router: Router,
    private _common: CommonUtil,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private patientregisterservice: PatientRegisterService,
    private doctorService: DoctorService
  ) {
    this.validation = _validation;

    this.common = _common;
  }

  sortTheResponseState(res: any): any {
    res.sort(function (a, b) {
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;
      return 0;
    });
    return res;
  }

  sortTheResponseCity(res: any): any {
    res.sort(function (a, b) {
      if (a.city < b.city) return -1;
      if (a.city > b.city) return 1;
      return 0;
    });
    return res;
  }
  onTitleChange(event) {
    this.registrationVo.title = event;
  }
  getPHRForProfileId(profileId: any) {
    this.spinnerService.start();
    this.onboardingService.getPHRForProfileId(profileId).then(data => {
      this.registrationVo = data;
      if (
        this.registrationVo.gender != "Male" &&
        this.registrationVo.gender != "Female" &&
        this.registrationVo.gender != "Others"
      ) {
        this.registrationVo.gender =
          this.registrationVo.gender[0].toUpperCase() +
          this.registrationVo.gender
            .slice(1, this.registrationVo.gender.length)
            .toLowerCase();
      }
      if (
        this.registrationVo.social != undefined &&
        this.registrationVo.social != null
      ) {
        this.socialHandle = this.registrationVo.social.handle;
        this.aboutMe = this.registrationVo.social.about;
      }
      this.onboardingService.getAreaOfInterest().then(data2 => {
        this.spinnerService.stop();
        this.areaOfInterestList = data2;

        for (let i = 0; i < this.areaOfInterestList.length; i++) {
          if (this.registrationVo.others != undefined) {
            for (
              let j = 0;
              j < this.registrationVo.others.areaOfInterest.length;
              j++
            ) {
              if (
                this.areaOfInterestList[i].categoryId ==
                this.registrationVo.others.areaOfInterest[j]
              ) {
                this.areaOfInterestList[i].isChecked = true;
              }
            }
          }
        }
      });
      if (
        isNaN(
          parseInt(this.common.getAge(this.registrationVo.dob).split(",")[0])
        )
      ) {
        this.ageYears = 0;
      } else {
        this.ageYears = parseInt(
          this.common.getAge(this.registrationVo.dob).split(",")[0]
        );
      }

      if (
        isNaN(
          parseInt(this.common.getAge(this.registrationVo.dob).split(",")[1])
        )
      ) {
        this.ageMonths = 0;
      } else {
        this.ageMonths = parseInt(
          this.common.getAge(this.registrationVo.dob).split(",")[1]
        );
      }
      if (!this.registrationVo.emergencyContact) {
        this.isEmergencyAddressVisible = false;
        this.registrationVo.emergencyContact = new EmergencyContact();
      } else if (
        this.registrationVo.emergencyContact.email ||
        this.registrationVo.emergencyContact.mobile ||
        this.registrationVo.emergencyContact.name
      ) {
        this.isEmergencyAddressVisible = true;
      }
      if (!this.registrationVo.contactInfo) {
        this.registrationVo.contactInfo = new ContactInfo();
      }

      if (!this.registrationVo.contactInfo.addresses) {
        this.isOfficeAddressVisible = false;
        this.isResidencialAddressVisible = false;
      }

      // this.ageYears = parseInt(this.common.getAge(this.registrationVo.dob).split(",")[0]);
      // this.ageMonths = parseInt(this.common.getAge(this.registrationVo.dob).split(",")[1]);

      if (this.registrationVo.providedOnlyAge == null) {
        this.registrationVo.providedOnlyAge = false;
      }

      if (!this.registrationVo.emergencyContact.address) {
        this.registrationVo.emergencyContact.address = new Address();
      }
      this.memberDate = new Date(this.registrationVo.dob);
      if (!this.registrationVo.social) {
        this.registrationVo.social = new Social();
      }
      if (!this.registrationVo.others) {
        this.registrationVo.others = new ProfileDetails_others();
      }
      if (
        this.registrationVo.emergencyContact &&
        this.registrationVo.emergencyContact.address &&
        this.registrationVo.emergencyContact.address.state
      ) {
        this.emergencyCityList = this.authService.getStateById(
          this.registrationVo.emergencyContact.address.state
        ).cities;
        this.emergencyCityList = this.sortTheResponseCity(
          this.emergencyCityList
        );
      }
      if (
        this.registrationVo.contactInfo.addresses &&
        this.registrationVo.contactInfo.addresses.length > 0
      ) {
        this.registrationVo.contactInfo.addresses.forEach(element => {
          if (element.addressType == Address.ADDRESS_HOME) {
            this.residencialAddress = element;
            if (
              element.address1 ||
              element.address2 ||
              element.city ||
              element.state
            ) {
              this.isResidencialAddressVisible = true;
            }
            if (element.state) {
              this.residencialCityList = this.authService.getStateById(
                element.state
              ).cities;
              this.residencialCityList = this.sortTheResponseCity(
                this.residencialCityList
              );
            }
          } else if (element.addressType == Address.ADDRESS_OFFICE) {
            this.officeAddress = element;
            if (
              element.address1 ||
              element.address2 ||
              element.city ||
              element.state
            ) {
              this.isOfficeAddressVisible = true;
            }
            if (element.state) {
              this.officeCityList = this.authService.getStateById(
                element.state
              ).cities;
              this.officeCityList = this.sortTheResponseCity(
                this.officeCityList
              );
            }
          }
        });
      }
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  checkAgeSelection(index: number) {
    if (index == 0) {
      this.isAge = false;
      this.isDOB = true;
      this.registrationVo.providedOnlyAge = false;
      console.log(this.ageYears + "AGE-->" + this.ageMonths);
      if (
        this.common.getDobFromAge(this.ageYears, this.ageMonths) <
        -2209008600000
      ) {
        this.ageYears = parseInt(this.common.getAgeForall(-2209008600000));
        this.ageMonths = 0;
        this.memberDate = new Date(
          this.common.getDobFromAge(this.ageYears, this.ageMonths)
        );
      } else {
        this.memberDate = new Date(
          this.common.getDobFromAge(this.ageYears, this.ageMonths)
        );
      }

      console.log(
        this.common.getAgeForall(
          this.common.getDobFromAge(this.ageYears, this.ageMonths)
        )
      );
    } else {
      this.isDOB = false;
      this.isAge = true;
      this.registrationVo.providedOnlyAge = true;
      console.log("DOB-->" + this.memberDate.getTime());
      this.ageYears = null;
      this.ageMonths = null;
      if (
        isNaN(
          parseInt(
            this.common.getAgeForall(this.memberDate.getTime()).split(",")[0]
          )
        )
      ) {
        this.ageYears = 0;
      } else {
        this.ageYears = parseInt(
          this.common.getAgeForall(this.memberDate.getTime()).split(",")[0]
        );
      }

      if (
        isNaN(
          parseInt(
            this.common.getAgeForall(this.memberDate.getTime()).split(",")[1]
          )
        )
      ) {
        this.ageMonths = 0;
      } else {
        this.ageMonths = parseInt(
          this.common.getAgeForall(this.memberDate.getTime()).split(",")[1]
        );
      }
    }
  }

  checkAgeYearvalidation(ageYear) {
    this.ageYears = ageYear;
    //console.log(this.ageYears+" "+this.common.getDobFromAge(this.ageYears,0)+" "+(this.common.getDobFromAge(this.ageYears,0)<-2209008600000));

    if (this.common.getDobFromAge(this.ageYears, 0) < -2209008600000) {
      this.ageYears = parseInt(this.common.getAgeForall(-2209008600000));
      this.ageMonths = null;
    } else {
      this.ageYears = ageYear;
    }
  }

  checkAgeMonthvalidation(ageMonth) {
    if (ageMonth > 12) {
      this.ageMonths = 12;
      console.log(ageMonth);
    }
  }

  getPHRDetailsForProfileId(profileId: number) {
    this.spinnerService.start();
    this.onboardingService.getPHRDetailsForProfileId(profileId).then(data => {
      this.spinnerService.stop();
      if (data.statusCode != 404) {
        this.dataVisibility = true;
        this.phr = data;
        console.log("phr details" + JSON.stringify(data));

        this.phr.phr.forEach(element1 => {
          element1.activities.forEach(activity => {
            activity.question.forEach(element2 => {
              if (activity.taskId == 101) {
                this.weight = parseFloat(element2.ans);
                this.weightKgs = this.weight;
              }
              if (
                element2.componentId == Question.COMPONENT_OPTIONS &&
                element2.desc == "Height"
              ) {
                this.feetInchValue = element2.ans;
                this.feetInchQuestionId = element2.id;
              }
              if (element2.componentId == Question.COMPONENT_SWITCH) {
                element2.choices.forEach(element3 => {
                  element3.forEach(element4 => {
                    if (element4.id == element2.ans) {
                      if (element4.option == "Yes") {
                        element2.isChecked = true;
                      }
                    }
                  });
                });
              }
              if (element2.componentId == Question.COMPONENT_MULTI_SELECTION) {
                let multipleSelectedOptionsArray = element2.ans.split(",");
                console.log(
                  "array " + JSON.stringify(multipleSelectedOptionsArray)
                );

                element2.choices.forEach(element3 => {
                  multipleSelectedOptionsArray.forEach(element => {
                    element3.forEach(element4 => {
                      if (element == element4.id) {
                        element4.isChecked = true;
                        console.log("yesss");
                      }
                    });
                  });
                });
              }
            });
          });
        });
        if (
          this.feetInchValue == undefined ||
          this.feetInchValue == ".undefined" ||
          this.feetInchValue == "undefined.undefined" ||
          this.feetInchValue == "undefined." ||
          this.feetInchValue == ""
        ) {
          this.feetInchValue = "0.0";
        }
        this.dropDownIndexForFeet = this.feetInchValue.split(".")[0];
        this.dropDownIndexForInch = this.feetInchValue.split(".")[1];
        this.feet = parseInt(this.dropDownIndexForFeet);
        this.inch = parseInt(this.dropDownIndexForInch);
        this.calculateBMI();
        console.log("heeeeeeeeee" + this.feetInchValue);
      } else {
        this.dataVisibility = false;
      }
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }

  //>>>>>>>>>>>>>>>>>>>ONCLICK Methods <<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  onWellnessExpertCheckBoxClick() {
    this.isWellnessExpert = !this.isWellnessExpert;
  }

  onNextClick() {
    this.pageIndex = this.pageIndex + 1;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  onUpdateClick() {
    let phrAnswers: PhrAnswer = new PhrAnswer();
    phrAnswers.phrType = this.phr.phrType;
    phrAnswers.profileId = this.phr.profileId;
    phrAnswers.phrVersion = this.phr.phrVersion;
    phrAnswers.phrAns = new Array();
    this.phr.phr.forEach(element => {
      element.activities.forEach(activity => {
        activity.question.forEach(element => {
          if (activity.taskId == 101) {
            if (
              this.weight == undefined ||
              this.weight == null ||
              this.weight + "" == "NaN" ||
              this.weight == 0
            ) {
              this.weight = 0;
            }
            // element.ans = this.weight + "";
            if (this.dropDownIndexForWeightUnit == 0) {
              this.weight = this.weight;
            } else if (this.dropDownIndexForWeightUnit == 1) {
              this.weight =
                (parseFloat((this.weight * this.KGS_CONST).toFixed(2)) * 100) /
                100;
            }
            element.ans = this.weight + "";
            console.log(
              "weightin Kgs::::::::" + this.weight + "  " + this.weightKgs
            );
          }
          if (
            element.componentId != Question.COMPONENT_OPTIONS &&
            element.desc != "Height" &&
            element.componentId != Question.COMPONENT_SWITCH &&
            element.componentId != Question.COMPONENT_MULTI_SELECTION
          ) {
            let idValue: IdValue = new IdValue();
            idValue.id = element.id;
            idValue.value = element.ans;
            console.log("Updating updatedTime ");
            if (element.updatedTime && element.updatedTime != 0) {
              console.log("Updating updatedTime ", element);
              idValue.updatedTime = element.updatedTime;
            }
            if (element.userId) {
              console.log("Updating userId ", element);
              idValue.userId = element.userId;
            }
            phrAnswers.phrAns.push(idValue);
          }
        });
      });
    });

    /*  if (this.feet == undefined || this.feet == "Select") {
             this.feet = "0";
         }

         if (this.inch == undefined || this.inch == "Select") {
             this.inch = "0";
         } */
    this.phr.phr.forEach(element1 => {
      element1.activities.forEach(activity => {
        activity.question.forEach(element2 => {
          if (
            element2.componentId == Question.COMPONENT_OPTIONS &&
            element2.desc == "Height"
          ) {
            if (
              this.dropDownIndexForFeet == undefined ||
              this.dropDownIndexForFeet == "undefined." ||
              this.dropDownIndexForFeet == ""
            ) {
              this.dropDownIndexForFeet = "0";
            }

            if (
              this.dropDownIndexForInch == undefined ||
              this.dropDownIndexForInch == ".undefined" ||
              this.dropDownIndexForFeet == ""
            ) {
              this.dropDownIndexForInch = "0";
            }
            let ftValue =
              this.dropDownIndexForFeet + "." + this.dropDownIndexForInch;
            let idValue: IdValue = new IdValue();
            idValue.id = element2.id;
            idValue.value = ftValue;
            phrAnswers.phrAns.push(idValue);
          }
          if (element2.componentId == Question.COMPONENT_SWITCH) {
            if (element2.isChecked) {
              let idValue: IdValue = new IdValue();
              element2.choices.forEach(element3 => {
                element3.forEach(element4 => {
                  if (element4.option == "Yes") {
                    idValue.value = element4.id;
                  }
                });
              });
              idValue.id = element2.id;
              phrAnswers.phrAns.push(idValue);
            } else {
              let idValue: IdValue = new IdValue();
              element2.choices.forEach(element3 => {
                element3.forEach(element4 => {
                  if (element4.option == "No") {
                    idValue.value = element4.id;
                  }
                });
              });
              idValue.id = element2.id;
              phrAnswers.phrAns.push(idValue);
            }
          }
          if (element2.componentId == Question.COMPONENT_MULTI_SELECTION) {
            let idValue: IdValue = new IdValue();
            idValue.id = element2.id;
            let b = false;
            let value = "";
            element2.choices.forEach(element3 => {
              element3.forEach(element4 => {
                if (element4.isChecked) {
                  value = value + "," + element4.id;
                  b = true;
                }
              });
            });

            if (b) {
              value = value.replace(/^,/, "");
              idValue.value = value;
              phrAnswers.phrAns.push(idValue);
            } else {
              idValue.value = "";
              phrAnswers.phrAns.push(idValue);
            }
          }
        });
      });
    });

    console.log("phrAnswers" + JSON.stringify(phrAnswers));
    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();
    this.onboardingService.submitPhrDetails(phrAnswers).then(data => {
      this.spinnerService.stop();
      console.log("data 0988988------------=>" + JSON.stringify(data));
      if (this.isFromDoctor) {
        alert("Updated Successfully");
        this.refresh.emit();
        $(".modal-backdrop").remove();
        (<any>$("#patientPHRModel")).modal("hide");
      } else if (this.isNurse) {
        alert("Updated Successfully");
        this.router.navigate(["/app/nurse"]);
      } else
        this.router.navigate([
          "/app/onboarding/summary" + "/" + this.profileId
        ]);
    });
  }

  onSaveAndContinueClick() {
    this.finalErrorCheck = false;
    //update index
    if (
      this.registrationVo.social != undefined &&
      this.registrationVo.social != null
    ) {
      this.registrationVo.social = new Social();
      this.registrationVo.social.handle = this.socialHandle;
      this.registrationVo.social.about = this.aboutMe;
    }

    if (!this.registrationVo.fName) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "First name can't be left blank.";
      this.showMessage = true;
      this.finalErrorCheck = true;
      return;
    }

    if (!this.registrationVo.gender) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Gender can't be left blank.";
      this.showMessage = true;
      this.finalErrorCheck = true;
      return;
    }

    if (this.isAge) {
      if (this.ageYears > 120) {
        this.ageYears = 120;
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Years should not be greater than 120";
        this.showMessage = true;
        this.finalErrorCheck = true;
        return;
      }
      //     if((this.ageMonths > 11)){
      //         this.ageMonths=11;
      //         this.isError = true;
      //         this.errorMessage = new Array();
      //         this.errorMessage[0] = "Months should not be greater than 11";
      //         this.showMessage = true;
      //         this.finalErrorCheck = true;
      //         return;
      //    }
      if (this.ageYears == null && this.ageMonths == null) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Age field can't be left blank";
        this.showMessage = true;
        this.finalErrorCheck = true;
        return;
      } else {
        this.registrationVo.dob = this.common.getDobFromAge(
          this.ageYears,
          this.ageMonths
        );
      }
    }
    if (this.isDOB) {
      if (this.memberDate == null) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "DOB field can't be left blank";
        this.showMessage = true;
        this.finalErrorCheck = true;
      } else {
        this.registrationVo.dob = this.memberDate.getTime();
      }
    }

    // if (this.registrationVo.dob != undefined) {
    // if (this.memberDate == undefined || this.memberDate == null) {
    //     this.registrationVo.dob = this.common.getDobFromAge(this.ageYears, this.ageMonths);
    // }

    console.log("office" + JSON.stringify(this.officeAddress));

    this.residencialAddress.addressType = Address.ADDRESS_HOME;
    this.officeAddress.addressType = Address.ADDRESS_OFFICE;
    this.registrationVo.contactInfo.addresses = new Array();
    this.registrationVo.contactInfo.addresses.push(this.residencialAddress);
    this.registrationVo.contactInfo.addresses.push(this.officeAddress);

    if (this.registrationVo.contactInfo) {
      if (
        !this.registrationVo.contactInfo.mobile &&
        this.registrationVo.relationShip == 0
      ) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Residential Contact number is not valid.";
        this.showMessage = true;
        this.finalErrorCheck = true;
        return;
      }

      if (
        this.registrationVo.contactInfo.mobile != null &&
        this.registrationVo.contactInfo.mobile.length != 0 &&
        this.registrationVo.contactInfo.mobile.length != 10
      ) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Residential Contact number is not valid.";
        this.showMessage = true;
        this.finalErrorCheck = true;
        return;
      }

      if (this.registrationVo.contactInfo.email) {
        if (!this.validateEmailId(this.registrationVo.contactInfo.email)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Residential Contact email Id is not valid.";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }
    // }
    if (this.registrationVo.emergencyContact) {
      if (this.registrationVo.emergencyContact.mobile) {
        if (this.registrationVo.emergencyContact.mobile.length != 10) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Emergency Contact number is not valid.";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
      if (this.registrationVo.emergencyContact.email) {
        if (!this.validateEmailId(this.registrationVo.emergencyContact.email)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Emergency Contact email Id is not valid.";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    console.log(this.residencialAddress.address1 !== undefined);

    if (
      this.residencialAddress.address1 !== undefined ||
      this.residencialAddress.address2 !== undefined
    ) {
      if (
        this.residencialAddress.address1 !== "" ||
        this.residencialAddress.address2 !== ""
      ) {
        if (this.residencialAddress.state == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Residencial Address's State is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    if (
      this.residencialAddress.address1 !== undefined ||
      this.residencialAddress.address2 !== undefined
    ) {
      if (
        this.residencialAddress.address1 !== "" ||
        this.residencialAddress.address2 !== ""
      ) {
        if (this.residencialAddress.city == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Residencial Address's City is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    if (
      this.officeAddress.address1 !== undefined ||
      this.officeAddress.address2 !== undefined
    ) {
      if (
        this.officeAddress.address1 !== "" ||
        this.officeAddress.address2 !== ""
      ) {
        if (this.officeAddress.state == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Office Address's State is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    if (
      this.officeAddress.address1 !== undefined ||
      this.officeAddress.address2 !== undefined
    ) {
      if (
        this.officeAddress.address1 !== "" ||
        this.officeAddress.address2 !== ""
      ) {
        if (this.officeAddress.city == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Office Address's City is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    if (
      this.registrationVo.emergencyContact.address.address1 !== undefined ||
      this.registrationVo.emergencyContact.address.address2 !== undefined
    ) {
      if (
        this.registrationVo.emergencyContact.address.address1 !== "" ||
        this.registrationVo.emergencyContact.address.address2 !== ""
      ) {
        if (this.registrationVo.emergencyContact.address.state == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Emergency Address's State is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    console.log(
      "---->><<" + this.registrationVo.emergencyContact.address.address1
    );

    if (
      this.registrationVo.emergencyContact.address.address1 !== undefined ||
      this.registrationVo.emergencyContact.address.address2 !== undefined
    ) {
      if (
        this.registrationVo.emergencyContact.address.address1 !== "" ||
        this.registrationVo.emergencyContact.address.address2 !== ""
      ) {
        if (this.registrationVo.emergencyContact.address.city == undefined) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Emergency Address's City is required";
          this.showMessage = true;
          this.finalErrorCheck = true;
          return;
        }
      }
    }

    if (this.finalErrorCheck) {
      return;
    }
    if (this.registrationVo.lName == null || this.registrationVo.lName == undefined) {
      this.registrationVo.lName = "";
    }

    //area of interest update
    if (this.registrationVo.others != undefined) {
      this.registrationVo.others = new ProfileDetails_others();

      this.registrationVo.others.areaOfInterest = new Array();
      this.areaOfInterestList.forEach(element => {
        if (element.isChecked) {
          this.registrationVo.others.areaOfInterest.push(element.categoryId);
        }
      });
    }

    //update date only
    if (this.memberDate == undefined || this.memberDate == null) {
      this.registrationVo.dob = this.common.getDobFromAge(
        this.ageYears,
        this.ageMonths
      );
    }

    let referralString = "";
    if (
      this.registrationVo.referralCode != undefined ||
      this.registrationVo.referralCode != null
    ) {
      referralString = this.registrationVo.referralCode;
    }
    if (referralString.length > 0) {
      this.spinnerService.start();
      this.patientregisterservice
        .getCorporateReferral(
          referralString,
          this.registrationVo.contactInfo.mobile
        )
        .then(response => {
          console.log(JSON.stringify(response));
          this.registrationVo.brandId = response.brandId;
          if (response.statusCode == 200) {
            this.updatePHRAfterVerification(this.registrationVo);
            this.onNextClick();
          } else if (response.statusCode == 406) {
            this.updatePHRAfterVerification(this.registrationVo);
            this.onNextClick();
          } else {
            this.spinnerService.stop();
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] =
              "Provided Referralcode doesn't exist, please provide valid OTP to get referral benefits or Register without any referral code.";
            this.showMessage = true;
            this.finalErrorCheck = true;
          }
        });
    } else {
      this.onNextClick();
      this.updatePHRAfterVerification(this.registrationVo);
    }
  }

  updatePHRAfterVerification(registrationVo) {
    this.registrationVo = registrationVo;
    //updating profile
    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();
    console.log(
      "updating profile------====>" + JSON.stringify(this.registrationVo)
    );
    if (this.registrationVo.relationShip == 0) {
      this.onboardingService.updateProfile(this.registrationVo).then(data => {
        this.spinnerService.stop();
        console.log("succes 111-----=====>" + JSON.stringify(data));
        this.isError = false;
        this.showMessage = false;
        this.getPHRDetailsForProfileId(this.profileId);
      });
    } else {
      this.patientregisterservice
        .updateFamilyMemberToServer(this.registrationVo)
        .then(data => {
          this.spinnerService.stop();
          console.log("succes 222-----=====>" + JSON.stringify(data));
          this.isError = false;
          this.showMessage = false;
          this.getPHRDetailsForProfileId(this.profileId);
        });
    }
  }
  convertDateToTimestamp(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    var dateString = [day, mnth, date.getFullYear()].join("-");
    var newDate = new Date(
      dateString
        .split("-")
        .reverse()
        .join("-")
    ).getTime();
    return newDate;
  }
  onAreaOfInterestCheckboxChange(id: number, isChecked: boolean) {
    if (this.registrationVo.others != undefined) {
      if (isChecked) {
        this.registrationVo.others.areaOfInterest.push(id);
      } else {
        for (
          let i = 0;
          i < this.registrationVo.others.areaOfInterest.length;
          i++
        ) {
          if (this.registrationVo.others.areaOfInterest[i] == id) {
            this.registrationVo.others.areaOfInterest.splice(i);
          }
        }
      }
      console.log(
        "catttt" + JSON.stringify(this.registrationVo.others.areaOfInterest)
      );
    }
  }

  onStateChange(addressType: number, selectedStateId: any) {
    if (selectedStateId != "Please select") {
      switch (addressType) {
        case 0:
          this.residencialCityList = this.authService.getStateById(
            selectedStateId
          ).cities;
          this.residencialCityList = this.sortTheResponseCity(
            this.residencialCityList
          );
          break;
        case 1:
          this.officeCityList = this.authService.getStateById(
            selectedStateId
          ).cities;
          this.officeCityList = this.sortTheResponseCity(this.officeCityList);
          break;
        case 3:
          this.emergencyCityList = this.authService.getStateById(
            selectedStateId
          ).cities;
          this.emergencyCityList = this.sortTheResponseCity(
            this.emergencyCityList
          );
          break;
      }
    } else {
      switch (addressType) {
        case 0:
          this.residencialCityList = new Array();
          break;
        case 1:
          this.officeCityList = new Array();
          break;
        case 3:
          this.emergencyCityList = new Array();
          break;
      }
    }
  }
  onHeaderClick(pageIndex: number) {
    this.pageIndex = pageIndex;
    if (this.pageIndex == 0) {
      if (
        isNaN(
          parseInt(
            this.common.getAgeForall(this.registrationVo.dob).split(",")[0]
          )
        )
      ) {
        this.ageYears = 0;
      } else {
        this.ageYears = parseInt(
          this.common.getAgeForall(this.registrationVo.dob).split(",")[0]
        );
      }

      if (
        isNaN(
          parseInt(
            this.common.getAgeForall(this.registrationVo.dob).split(",")[1]
          )
        )
      ) {
        this.ageMonths = 0;
      } else {
        this.ageMonths = parseInt(
          this.common.getAgeForall(this.registrationVo.dob).split(",")[1]
        );
      }
    }
  }
  onOfficeAddressCheckBoxClick() {
    this.isOfficeAddressVisible = !this.isOfficeAddressVisible;
  }

  onResidencialAddressCheckBoxClick() {
    this.isResidencialAddressVisible = !this.isResidencialAddressVisible;
  }
  onEmergencyAddressCheckBoxClick() {
    this.isEmergencyAddressVisible = !this.isEmergencyAddressVisible;
  }
  ///// check box show  and hide code start here ///////

  validateWeightNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    //alert("hello"+JSON.stringify(key));
    if (event.keyCode === 38 || event.keyCode === 40) {
      return false;
    } else {
      return true;
    }
    // var key = window.event ? event.keyCode : event.which;
    // console.log("kajkohah" + event.keyCode);

    // if (event.keyCode == 46) {
    //     return true;
    // }
    // var regex = new RegExp("^[a-zA-Z0-9]+$");
    // var key2 = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    // if (!regex.test(key2)) {
    //     return false;
    // }
    // if (event.keyCode == 8 || event.keyCode == 46
    //     || event.keyCode == 37 || event.keyCode == 39) {
    //     return true;
    // } else if (key < 48 || key > 57) {
    //     return false;
    // } else return true;
  }

  validateEmailId(email: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    console.log("kajkohah" + event.keyCode);

    if (event.keyCode == 46) {
      return true;
    }
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var key2 = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );
    if (!regex.test(key2)) {
      return false;
    }
    if (
      event.keyCode == 8 ||
      event.keyCode == 46 ||
      event.keyCode == 37 ||
      event.keyCode == 39
    ) {
      return true;
    } else if (key < 48 || key > 57) {
      return false;
    } else return true;
  }

  onFamilyHeaderCheckboxChange(question: Question) {
    question.choices[0].forEach(choice => {
      choice.isChecked = false;
    });
  }

  //BMI calculation

  onFeetDropDownChange(feet: string) {
    if (feet != "Select Feet") {
      this.feet = parseInt(feet);
      console.log("FEET::" + this.feet);
    }
  }

  onInchDropDownChange(inch: string) {
    if (inch != "Select Inch") {
      this.inch = parseInt(inch);
      console.log("INCH::" + this.inch);
    }
  }

  onHeightUnitDropDownChange(index: number) {
    if (index == 0) {
      this.heightUnitBoolean = true;
      this.onHeightCmChange(this.heightCms);
    } else {
      this.heightUnitBoolean = false;
      let hStr: any = parseFloat(this.feet + "." + this.inch);
      console.log("HEIGHT in cms::" + this.feet + "." + this.inch);
      this.heightCms = Math.round(hStr * 12 * 2.54 * 100) / 100;
      // let hStr: any = parseFloat(this.feet + "." + this.inch);
      //this.heightCms = Math.round(((this.feet * 30.48) + (this.inch * 2.54)) * 100) / 100;
      console.log("HEIGHT in cms::" + this.feet + "." + this.inch);
      // this.heightCms = Math.round((((this.feet * 12) + this.inch) * 2.54) * 100) / 100;
      console.log("HEIGHT in cms::" + this.heightCms);
    }
  }

  onHeightCmChange(heightInCm: number) {
    console.log("HEIGHT in cms in onHeightCmChange::" + heightInCm);
    let feetInchvalue: number =
      Math.round((heightInCm / this.FEET_CONST) * 100) / 100;
    console.log("feetInchvalue in onHeightCmChange::" + feetInchvalue);
    let feetInch: string = feetInchvalue.toFixed(2) + "";
    let feet = feetInch.split(".")[0];
    let inch = feetInch.split(".")[1];
    if (inch[1] >= "5") {
      inch = parseFloat(inch[0]) + 1 + "";
    } else {
      inch = inch[0];
    }
    this.feet = parseInt(feet);
    this.inch = parseInt(inch);
    console.log("FEET INCH::" + this.feet + " " + this.inch);
    this.dropDownIndexForFeet = feet;
    this.dropDownIndexForInch = inch;
  }

  onWeightUnitDropDownChange(index: number) {
    this.dropDownIndexForWeightUnit = index;
    if (index == 0) {
      this.weight = Math.round(this.weightKgs * 100) / 100;
      console.log("111111--->" + this.weightKgs);
    } else {
      this.weight = this.weightLbs =
        Math.round(this.weightKgs * this.LBS_CONST * 100) / 100;
      console.log("112222--->" + this.weight);
    }
  }

  onWeightChange(weight: number) {
    console.log("in onWeightChange" + weight);
    //this.weight = weight;
    if (this.dropDownIndexForWeightUnit == 0) {
      this.weightKgs = weight;
    } else {
      this.weightLbs = weight;
    }
  }

  validateDecimalValue(evt) {
    var keyCode = evt.keyCode
      ? evt.keyCode
      : evt.charCode
        ? evt.charCode
        : evt.which;
    if (!(keyCode >= 48 && keyCode <= 57)) {
      if (
        !(
          keyCode == 8 ||
          keyCode == 9 ||
          keyCode == 35 ||
          keyCode == 36 ||
          keyCode == 37 ||
          keyCode == 39 ||
          keyCode == 46
        )
      ) {
        return false;
      } else {
        return true;
      }
    }
    var velement = evt.target || evt.srcElement;
    var fstpart_val = velement.value;
    var fstpart = velement.value.length;
    if (fstpart.length == 2) return false;
    var parts = velement.value.split(".");
    if (parts[0].length >= 14) return false;
    if (parts.length == 2 && parts[1].length >= 2) return false;
    else return true;
  }

  calculateBMI() {
    //if (this.feet > 0) {
    // let hStr: any = parseFloat(this.feet + "." + this.inch);
    // let heightInMeter = ((this.feet * 30.48) + (this.inch * 2.54)) / 100;
    // let heightInMeter = (((this.feet * 12) + this.inch) * 2.54) / 100;

    let heightInMeter =
      (parseFloat(this.dropDownIndexForFeet) * this.FEET_CONST +
        parseFloat(this.dropDownIndexForInch) * this.INCH_CONST) /
      100;
    let wt = this.weight;
    let weight: number;
    if (wt == undefined || wt == null || isNaN(wt)) {
      wt = 0;
    }
    console.log("aaa::" + this.weight);
    if (this.dropDownIndexForWeightUnit == 0) {
      weight = parseFloat(wt.toFixed(2));
    } else if (this.dropDownIndexForWeightUnit == 1) {
      weight = parseFloat(
        ((parseFloat(wt.toFixed(2)) * this.KGS_CONST * 100) / 100).toFixed(2)
      );
    } else {
    }
    console.log("Height and Weight::" + heightInMeter + " " + weight);
    this.bmi = (weight / (heightInMeter * heightInMeter)).toFixed(2);
    console.log("Perfect_BMI::" + this.bmi);
  } // }

  onPhysicalClick() {
    this.router.navigate(["/app/onboarding/physical/" + this.profileId]);
  }

  onLabTestsClick() {
    this.router.navigate(["/app/onboarding/updatelabtest/" + this.profileId]);
  }

  getStateCityByPinCode(pinCode: number, citytype): void {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.toString().length == Config.portal.pincodeLength) || pinCode.toString().length == 6) {
      this.onboardingService.getStateCityByPinCode(pinCode).then(data => {
        this.statecityList = data;
        console.log("StatelisttCitylistt" + JSON.stringify(data));
        if (citytype == 1) {
          this.residencialAddress.cityName = data[0].cityName;
          this.residencialAddress.stateName = data[0].stateName;
          this.residencialAddress.city = data[0].cityId;
          this.residencialAddress.state = data[0].stateId;
        }
        if (citytype == 2) {
          this.officeAddress.cityName = data[0].cityName;
          this.officeAddress.stateName = data[0].stateName;
          this.officeAddress.city = data[0].cityId;
          this.officeAddress.state = data[0].stateId;
        }
        if (citytype == 3) {
          this.registrationVo.emergencyContact.address.cityName =
            data[0].cityName;
          this.registrationVo.emergencyContact.address.city = data[0].cityId;
          this.registrationVo.emergencyContact.address.stateName =
            data[0].stateName;
          this.registrationVo.emergencyContact.address.state = data[0].stateId;
        }
      });
    } else if (pinCode.toString().length == 0 && citytype == 1) {
      this.residencialAddress.cityName = null;
      this.residencialAddress.stateName = null;
      this.residencialAddress.city = null;
      this.residencialAddress.state = null;
    } else if (pinCode.toString().length == 0 && citytype == 2) {
      this.officeAddress.cityName = null;
      this.officeAddress.stateName = null;
      this.officeAddress.city = null;
      this.officeAddress.state = null;
    } else if (pinCode.toString().length == 0 && citytype == 3) {
      this.registrationVo.emergencyContact.address.cityName = null;
      this.registrationVo.emergencyContact.address.city = null;
      this.registrationVo.emergencyContact.address.stateName = null;
      this.registrationVo.emergencyContact.address.state = null;
    }
  }
  manageCheckofFamilyQues(question: Question, choice) {
    choice.isChecked = !choice.isChecked;
    if (choice.isChecked) {
      if (!question.ans.includes(choice.id)) {
        if (question.ans != "") question.ans = question.ans + "," + choice.id;
        else {
          question.ans = choice.id;
        }
      }
    } else {
      question.ans = question.ans.replace(choice.id + ",", "");
      question.ans = question.ans.replace("," + choice.id, "");
      question.ans = question.ans.replace(choice.id, "");
    }
  }

  updateUpdatedBy(question: Question) {
    console.log(question);
    if (
      this.authService.employeeDetails &&
      this.authService.employeeDetails.empId
    ) {
      question.userId = this.authService.employeeDetails.empId;
      question.updatedTime = new Date().getTime();
    }
  }
}
