import { NgModule, Component, ViewEncapsulation } from "@angular/core";
import { AppConfig } from "../app.config";
import { NgForm } from "@angular/forms";
import { Router } from '@angular/router';
import { OnboardingService } from './onboarding.service';
import { OnboardingTypeResponse } from './../model/onboarding/onboardingTypeResponse';
import { OnboardingCustomTypePackage } from './../model/onboarding/onboardingCustomTypePackage';
import { AuthService } from './../auth/auth.service';
import { RegistrationVO } from './../model/profile/registrationVO';
import { RegistrationResponseVo } from './../model/profile/registrationResponseVo';
import { OtpVo } from './../model/profile/otpVo';
import { PatientRegisterService } from './../patientregister/patientregister.service';
import { ReportResponse } from './../model/common/reportResponse';
import { OnboardTests } from './../model/onboarding/onboardTests';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { CommonUtil } from './../base/util/common-util';
import { ValidationUtil } from './../base/util/validation-util';
import { SelectedDoctorDetail } from './../model/onboarding/selectedDoctorDetail';
import { DoctorDetails } from '../model/employee/doctordetails';
import { BasketRequest } from '../model/basket/basketRequest';
import { CartItem } from '../model/basket/cartitem';
import { Payment } from '../model/basket/payment';
import { Taxes } from '../model/basket/taxes';
import { Product } from '../model/product/product';
import { Config } from '../base/config';
import { ToasterService } from '../layout/toaster/toaster.service';

@Component({
  selector: "onboarding",
  templateUrl: "./onboarding.template.html",
  // pipes: [OrderByPipe],
  styleUrls: ["./onboarding.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class OnboardingComponent {
  config: any;
  onboardingTypeResponse: any;
  onboardSelectedTest: any;
  onboardSelectedTestId: any;
  onboardingCustomTypePackage = new Array();
  onboardingType: OnboardingTypeResponse = new OnboardingTypeResponse();
  onboardingCustomPackage: OnboardingCustomTypePackage = new OnboardingCustomTypePackage();
  onboardTests: OnboardTests = new OnboardTests();
  sendTest: any;
  sendDefinedPackage: any;
  onboardingTypeTests: any;
  pocId: number;
  pocName: string;
  responseMsg: any;
  empId: number;
  city: number;
  paymentMode: string = 'cash';
  registeredProfileList: RegistrationVO[] = new Array<RegistrationVO>();
  registerUser: RegistrationVO = new RegistrationVO();
  otpVo: OtpVo;
  registrationResponseVo: RegistrationResponseVo;
  customResponse: ReportResponse;
  isSent: boolean = false;
  isActive: boolean = true;
  wrongOtp: boolean = false;
  isEnterOtp: boolean = false;
  searchedTests: any;
  unit: any;
  transactionId: any = '';
  customPackageName: any;
  profileId: number;
  selfProfileId: number;
  SELF: number = 0;
  mobile: string;
  phrCompletionType: number;
  errorMessage: string;
  insertResponse: any;
  showTests = new Array();
  isLength: boolean = false;
  mobileValidation: string;
  registeredPeopleList: RegistrationVO[] = new Array<RegistrationVO>();
  testName: any;
  memberDate: Date;
  isDOB: boolean = false;
  isAge: boolean = true;
  ageYears: number = null;
  ageMonths: number = null;
  isGenSelect: boolean = false;
  validation: any;
  userErrorMsg: string = "";
  doctorListSearchResults = new Array();
  selectedDoctorDetails: SelectedDoctorDetail = new SelectedDoctorDetail();
  doctorName: string;
  doctorSelectTotal: number = 0;
  toDate: string;
  fromDate: string;
  downloadMessage: string;
  selectOthers: boolean = false;
  hasTitle: boolean;
  currencyCode: string = '';

  //pagination 
  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  displayRegisteredProfileList: Array<RegistrationVO> = Array<RegistrationVO>();
  currentIndex = -1;
  otherTransactionType: number;

  otpNotRequired: boolean = false;
  datepickerOpts = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };
  datepickertoDate = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };
  datepickerFromDate = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };
  pdfUrl: string;
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
  constructor(
    config: AppConfig,
    private onboardingService: OnboardingService,
    private common: CommonUtil,
    private patientregisterservice: PatientRegisterService,
    private router: Router,
    private validationUtil: ValidationUtil,
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {
    this.config = config.getConfig();
    this.onboardingCustomTypePackage = new Array();
    this.onboardingTypeTests = new Array();
    this.onboardingCustomPackage.customTests = new Array();
    this.pocId = authService.userAuth.pocId;
    this.pocName = authService.userAuth.pocName;
    this.empId = authService.userAuth.employeeId;
    this.city = authService.selectedPocDetails.address.city;
    this.onboardingCustomPackage.modeOfPayment = "2";
    this.showTests = new Array();
    this.registeredProfileList = new Array<RegistrationVO>();
    this.validation = validationUtil;
    this.currencyCode = Config.portal.currencyCode;
    console.log("pocId" + JSON.stringify(authService.userAuth));
  }
  selectColumns: any[] = [
    {
      variable: "firstName",
      filter: "text"
    },
    {
      variable: "lastName",
      filter: "text"
    }
  ];
  ngOnInit(): void {
    var reset = this;
    $(".modal").on("hidden.bs.modal", function (e) {
      reset.resetForm();
      reset.resetUpdateField();
      reset.resetdownloadModal();
    });
    (<any>$)("#registration").hide();
    (<any>$)("#consumerList").hide();
    this.sendTest = "0";

    this.registeredProfileList = new Array<RegistrationVO>();
    $("input[type=number]").on("mousewheel.disableScroll", function (e) {
      e.preventDefault();
    });
    $("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });
    $("#searchBox").on("input", function () {
      $(this).val(($(this).val() as any).replace(/ /g, ""));
    });
  }

  resetdownloadModal() {
    this.toDate = null;
    this.fromDate = null;
    this.downloadMessage = null;
  }

  onTitleChange(event) {
    this.registerUser.title = event;
  }
  setSelectedDoctorDetails(doctorDetails: DoctorDetails) {
    this.doctorSelectTotal = 1;
    this.selectedDoctorDetails = doctorDetails;
  }
  resetForm() {
    this.sendTest = "0";
    this.showTests = new Array();
    this.onboardingCustomPackage.amount = 0;
    $("#modeOfPayment").val("0");
    (<any>$("#showForCustom1")).hide();
    (<any>$("#showForCustom2")).hide();
    (<any>$("#showForCustom3")).hide();
    (<any>$("#showForCustom4")).hide();
    (<any>$("#showForCustom6")).hide();
    (<any>$("#showForCustom7")).hide();
    (<any>$("h4#showForCustom5")).show();
  }

  getProfileSearchByMobile(mobile: string) {
    this.hasTitle = false;
    if ((mobile + '').length < 10) {
      (<any>$)('#registration').hide();
      (<any>$)('#consumerList').hide();
      this.isLength = true;
      this.mobileValidation = 'Enter valid mobile number';
      return;
    }
    this.mobileValidation = '';
    this.isLength = false;
    this.registeredProfileList = new Array<RegistrationVO>();
    this.responseMsg = "";
    this.registerUser = new RegistrationVO();

    this.isAge = true;
    this.isDOB = false;
    this.ageYears = null;
    this.ageMonths = null;
    this.memberDate = new Date();

    this.mobile = mobile;
    this.spinnerService.start();
    this.onboardingService.getProfileSearchByMobile(mobile, this.pocId).then(profileList => {
      this.spinnerService.stop();
      console.log("profilelisttttt: " + JSON.stringify(profileList[0]));
      // this.registeredProfileList = profileList;

      if (mobile.length < 10) {
        this.mobileValidation = "Please enter 10 digit mobile number"
        this.isLength = true;
        (<any>$)('#registration').hide();
        (<any>$)('#consumerList').hide();
      }

      if (profileList.length == 0 && mobile.length == 10) {
        this.isLength = false;
        this.registerUser.contactInfo.mobile = this.mobile;
        (<any>$)('#registration').show();
        (<any>$)('#consumerList').hide();
      }
      else if (profileList.length > 0 && profileList[0].statusCode != 409) {
        (<any>$)('#registration').hide();
        (<any>$)('#consumerList').show();
        this.isLength = false;
        this.registeredPeopleList = profileList;

        //for pagination
        this.registeredProfileList = JSON.parse(JSON.stringify(profileList));
        this.indexOfPage = 1;
        this.displayRegisteredProfileList = JSON.parse(JSON.stringify(this.registeredPeopleList.slice(0, this.noOfReportsPerPage)));

        for (let i = 0; i < this.registeredProfileList.length; i++) {
          if (isNaN(parseInt(this.common.getAge(this.registeredProfileList[i].dob).split(",")[0] + (this.common.getAge(this.registeredProfileList[i].dob).split(",")[1])))) {
            this.registeredProfileList[i].age = 0 + ' ' + "Years";
          }
          else {
            this.registeredProfileList[i].age = this.common.getAge(this.registeredProfileList[i].dob).split(",")[0] + this.common.getAge(this.registeredProfileList[i].dob).split(",")[1];
          }
          if (this.registeredProfileList[i].title) {
            this.hasTitle = true;
          }
          if (this.registeredProfileList[i].relationShip == this.SELF) {
            this.selfProfileId = this.registeredProfileList[i].profileId;
          }
        }
      }
      else if (profileList[0].statusCode == 409) {
        this.mobileValidation = profileList[0].statusMessage;
        this.isLength = true;
        (<any>$)('#registration').hide();
        (<any>$)('#consumerList').hide();
      }
      else {
        (<any>$)('#registration').hide();
        (<any>$)('#consumerList').hide();
      }
    });
  }

  onEnterPressed(e, contactNo: string) {
    if (e.keyCode == 13) {
      this.getProfileSearchByMobile(contactNo);
    }
  }

  updateProfile(profile) {
    this.isAge = true;
    console.log(JSON.stringify(profile));
    this.registerUser = new RegistrationVO();
    this.registerUser = profile;
    // this.registerUser.lName=profile.lName;
    // this.registerUser.contactInfo.email=profile.contactInfo.email;
    (<any>$("#updateProfile")).modal({
      show: true,
      escapeClose: false,
      clickClose: false,
      showClose: false,
      backdrop: "static",
      keyboard: false
    });
  }
  UpdateUsersProfile(registeruser) {
    if (
      this.registerUser.fName == "" || this.registerUser.fName == null || this.registerUser.fName == undefined) {
      this.userErrorMsg = "Name Field can't be empty"
      return;
    }
    if (this.isAge) {
      if ((!this.ageYears && !this.ageMonths) || (this.ageYears == 0 && this.ageMonths == 0)) {
        this.userErrorMsg = "Please provide Age ";
        return;
      } else {
        this.registerUser.dob = this.common.getDobFromAge(
          this.ageYears,
          this.ageMonths
        );
      }
    } else {
      if (this.memberDate == null || this.memberDate == undefined || this.memberDate.toString() == "Invalid Date") {
        this.userErrorMsg = "Please provide DOB ";
        return;
      } else {
        this.registerUser.dob = this.common.convertOnlyDateToTimestamp(
          this.memberDate
        );
      }
    }
    if (
      this.registerUser.gender == null ||
      this.registerUser.gender == undefined ||
      this.registerUser.gender == ""
    ) {
      this.userErrorMsg = "Please provide Gender ";
      return;
    }
    delete this.registerUser["age"];
    if (this.registerUser.relationShip == 0) {
      console.log("Shelf--" + JSON.stringify(registeruser));
      this.onboardingService.updateProfile(this.registerUser).then(data => {
        if (data.statusCode == 200 || data.statusCode == 201) {
          console.log("response" + JSON.stringify(data));
          (<any>$("#updateProfile")).modal("hide");
          this.resetUpdateField();
          for (var i = 0; i < this.registeredProfileList.length; i++) {
            if (
              this.registeredProfileList[i].profileId ==
              this.registerUser.profileId
            ) {
              this.registeredProfileList[i].age = this.common.getAge(
                this.registerUser.dob
              );
            }
          }
        } else {
          this.userErrorMsg = "Details has Updated";
        }
      });
    } else {
      console.log("family--" + JSON.stringify(registeruser));
      this.patientregisterservice
        .updateFamilyMemberToServer(this.registerUser)
        .then(data => {
          if (data.statusCode == 200 || data.statusCode == 201) {
            console.log("response" + JSON.stringify(data));
            (<any>$("#updateProfile")).modal("hide");
            this.resetUpdateField();
            for (var i = 0; i < this.registeredProfileList.length; i++) {
              if (
                this.registeredProfileList[i].profileId ==
                this.registerUser.profileId
              ) {
                this.registeredProfileList[i].age = this.common.getAge(
                  this.registerUser.dob
                );
              }
            }
          } else {
            this.userErrorMsg = "Family member details cannot Updated";
          }
        });
    }
  }
  resetUpdateField() {
    this.registerUser = new RegistrationVO();
    this.ageYears = null;
    this.ageMonths = null;
    this.memberDate = null;
    this.registerUser.contactInfo.email = null;
  }
  checkAgeSelection(index: number) {
    console.clear();
    console.log(index);
    if (index == 0) {
      console.log("if of age change");

      this.isAge = false;
      this.isDOB = true;
      this.registerUser.providedOnlyAge = false;
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
      console.log("else of age change");
      this.isDOB = false;
      this.isAge = true;
      this.registerUser.providedOnlyAge = true;
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
    } else {
      this.ageMonths = ageMonth;
    }
  }

  generateOtp(value: number, isValid: boolean, otpServiceType: number): void {
    console.log("Check if form is valid..." + isValid);

    if (this.isAge) {
      if (this.ageYears == null && this.ageMonths == null) {
        this.responseMsg = "Age is mandatory";
        return;
      } else {
        this.registerUser.dob = this.common.getDobFromAge(
          this.ageYears,
          this.ageMonths
        );
      }
    }
    if (this.isDOB) {
      if (this.memberDate == null) {
        this.responseMsg = "DOB is mandatory";
      } else {
        this.registerUser.dob = this.memberDate.getTime();
      }
    }
    if (
      this.registerUser.gender == null &&
      this.registerUser.gender == undefined
    ) {
      this.responseMsg = "Gender is mandatory";
      return;
    }

    let referralString = "";
    if (
      this.registerUser.referralCode != undefined ||
      this.registerUser.referralCode != null
    ) {
      referralString = this.registerUser.referralCode;
    }

    if (referralString.length > 0) {
      console.log(referralString);
      this.patientregisterservice
        .getCorporateReferral(
          referralString,
          this.registerUser.contactInfo.mobile
        )
        .then(response => {
          console.log(JSON.stringify(response));
          this.registerUser.brandId = response.brandId;
          if (response.statusCode == 200) {
            this.generateOTPafterVefification(
              this.registerUser,
              otpServiceType
            );
          } else {
            this.responseMsg =
              "Provided Referralcode doesn't exist, please provide valid OTP to get referral benefits or Register without any referral code.";
          }
        });
    } else {
      this.generateOTPafterVefification(this.registerUser, otpServiceType);
    }
  }

  generateOTPafterVefification(registerUser, otpServiceType) {
    this.registerUser = registerUser;
    console.log("generateOtp:" + JSON.stringify(this.registerUser));
    if (
      (this.registerUser.contactInfo.email != "" ||
        this.registerUser.contactInfo.mobile != "") &&
      this.registerUser.fName != "" &&
      this.registerUser.lName != ""
    ) {
      this.otpVo = new OtpVo();
      this.otpVo.email = this.registerUser.contactInfo.email;
      this.otpVo.type = OtpVo.EMAIL_MOBILE;
      this.otpVo.mobile = this.registerUser.contactInfo.mobile;
      this.otpVo.otpServiceType = otpServiceType;
      console.log("otp objectttttt" + JSON.stringify(this.otpVo));
      console.log("for register bodyyyy" + JSON.stringify(this.registerUser));

      this.patientregisterservice.generateOtp(this.otpVo).then(response => {
        this.customResponse = response;
        console.log("looooooooooooooooooog:" + JSON.stringify(response));
        //alert(response.statusMessage);
        this.responseMsg = response.statusMessage;
        if (this.customResponse.statusCode == 201) {
          this.isActive = false;
          this.isEnterOtp = true;
          this.isSent = true; // display msg of otp sent successfully

          (<any>$)("#generate").hide();
          //  console.log("value+++++++++++++++++++" + JSON.stringify(response));
        }
      });
    }
  }

  registerNewUser() {
    console.log('registernewuser');
    if (this.registerUser.title == null && this.registerUser.title == undefined) {
      this.responseMsg = "Title is mandatory";
      return
    }
    if (this.registerUser.fName == null && this.registerUser.fName == undefined) {
      this.responseMsg = "First Name is mandatory";
      return;
    }
    if (
      this.registerUser.lName == null ||
      this.registerUser.lName == undefined
    ) {
      this.registerUser.lName = "";
    }

    if (this.isAge) {
      if (this.ageYears == null && this.ageMonths == null) {
        this.responseMsg = "Age is mandatory";
        return;
      } else {
        this.registerUser.dob = this.common.getDobFromAge(
          this.ageYears,
          this.ageMonths
        );
      }
    }
    if (this.isDOB) {
      if (this.memberDate == null) {
        this.responseMsg = "DOB is mandatory";
      } else {
        this.registerUser.dob = this.memberDate.getTime();
      }
    }
    if (
      this.registerUser.gender == null &&
      this.registerUser.gender == undefined
    ) {
      this.responseMsg = "Gender is mandatory";
      return;
    }

    this.responseMsg = "";
    this.registerUser.pocId = this.pocId;
    this.registerUser.loginType = 4;
    this.registerUser.portal = true;
    this.registerUser.otpNotRequired = true;
    console.log("new registration bodyy" + JSON.stringify(this.registerUser));
    if (
      this.registerUser.fName != "" &&
      this.registerUser.contactInfo.mobile != "" &&
      this.registerUser.fName != null &&
      this.registerUser.contactInfo.mobile != null &&
      this.registerUser.gender != null
    ) {
      $("html, body").animate({ scrollTop: "0px" }, 300);
      this.spinnerService.start();
      this.patientregisterservice
        .registration(this.registerUser)
        .then(response => {
          this.spinnerService.stop();
          if (response.statusCode != 200 && response.statusCode != 201) {
            alert(response.statusMessage);
            return;
          }
          this.registrationResponseVo = response;
          console.log("responseeeeeeeeeeee:" + JSON.stringify(response));

          if (
            response != undefined &&
            response != null &&
            response.statusCode != 406
          ) {
            this.responseMsg = response.statusMessage;
            //alert(response.statusMessage);
            // this.registeredProfileList = new Array<RegistrationResponseVo>();
            this.registeredProfileList.push(this.registrationResponseVo);
            //  console.log("New user-->"+JSON.stringify(this.registeredProfileList));
            for (let i = 0; i < this.registeredProfileList.length; i++) {
              if (
                isNaN(
                  parseInt(
                    this.common
                      .getAge(this.registeredProfileList[i].dob)
                      .split(",")[0] +
                    this.common
                      .getAge(this.registeredProfileList[i].dob)
                      .split(",")[1]
                  )
                )
              ) {
                this.registeredProfileList[i].age = 0 + " " + "Years";
              } else {
                this.registeredProfileList[i].age =
                  this.common
                    .getAge(this.registeredProfileList[i].dob)
                    .split(",")[0] +
                  this.common
                    .getAge(this.registeredProfileList[i].dob)
                    .split(",")[1];
              }
            }
            this.profileId = this.registrationResponseVo.profileId;
            this.selfProfileId = this.profileId;
            this.registeredPeopleList = this.registeredProfileList;
            this.indexOfPage = 1;
            this.displayRegisteredProfileList = JSON.parse(JSON.stringify(this.registeredPeopleList.slice(0, this.noOfReportsPerPage)));
            (<any>$)('#registration').hide();
            (<any>$)('#consumerList').show();
          }
          else {
            // alert("hello"+response.statusMessage);
            this.responseMsg = response.statusMessage;
          }
        });
    }
  }

  // validateNumberInputOnly(event) {
  //   var key = window.event ? event.keyCode : event.which;
  //   if (event.keyCode == 8 || event.keyCode == 46
  //     || event.keyCode == 37 || event.keyCode == 39) {
  //     return true;
  //   }
  //   else if (key < 48 || key > 57) {
  //     return false;
  //   }
  //   else return true;
  // }
  _keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
  onpersonal(profileId): void {
    console.log("onpersonal");
    this.router.navigate(["/app/onboarding/personal/" + profileId]);
  }
  onphysical(profileId): void {
    console.log("onphysical");
    console.log("physical profile iddddd" + profileId);

    this.router.navigate(["/app/onboarding/physical/" + profileId]);
  }
  onaddfamily(): void {
    this.router.navigate(["/app/onboarding/addfamily/" + this.selfProfileId]);
  }
  onupdatelab(profileId): void {
    console.log("lab  profile iddddd" + profileId);
    this.router.navigate(["/app/onboarding/updatelabtest/" + profileId]);
  }
  getOnboardingType(item) {
    $("div#search-component input").val("");
    this.phrCompletionType = item.phrCompletionType;
    this.profileId = item.profileId;
    this.onboardingService.getOnboardingType().then(onboardingTypeResponse => {
      this.onboardingTypeResponse = onboardingTypeResponse;
      console.log(JSON.stringify(this.onboardingTypeResponse));
      (<any>$("#myModal2")).modal("show");
      $("hs-select>div>input").val("");
    });
  }
  sendOnboardingType() {
    this.onboardSelectedTest = this.sendTest.tests;
    this.onboardSelectedTestId = this.sendTest.id;
    this.onboardingCustomPackage.amount = this.sendTest.amount;
    console.log(JSON.stringify(this.sendTest));
    if (this.onboardSelectedTest.length < 1 && this.sendTest.name == "Custom") {
      console.log("coming here");
      this.onboardingCustomTypePackage = new Array();
      this.onboardingType.tests = new Array();
      this.customPackageName = "";
      this.showTests = new Array();
      (<any>$("#showForCustom1")).show();
      (<any>$("#showForCustom2")).show();
      (<any>$("#showForCustom3")).show();
      (<any>$("#showForCustom4")).show();
      (<any>$("#showForCustom6")).show();
      (<any>$("#showForCustom7")).show();
      (<any>$("h4#showForCustom5")).hide();
      for (var i = 0; i < this.onboardingTypeResponse.length; i++) {
        if (this.onboardingTypeResponse[i].id != 4) {
          console.log(JSON.stringify(this.onboardingTypeResponse[i]));
          this.onboardingCustomTypePackage.push(this.onboardingTypeResponse[i]);
        }
      }
    } else {
      this.showTests = this.sendTest.tests;
      (<any>$("#showForCustom1")).hide();
      (<any>$("#showForCustom2")).hide();
      (<any>$("#showForCustom3")).hide();
      (<any>$("#showForCustom4")).hide();
      (<any>$("#showForCustom6")).hide();
      (<any>$("#showForCustom7")).hide();
      (<any>$("h4#showForCustom5")).show();
    }
  }
  sendDefinedPackagesType() {
    this.onboardingType = this.sendDefinedPackage;
    this.onboardingType.amount = this.onboardingType.amount;
    this.onboardingTypeTests = new Array();
    console.log(JSON.stringify(this.onboardingType));
  }
  selectTests(tests) {
    if ((<any>$("#" + tests.id + ":checked")).length > 0) {
      this.onboardingTypeTests.push(tests);
    } else {
      var index = this.onboardingTypeTests.indexOf(tests);
      this.onboardingTypeTests.splice(index, 1);
    }
    console.log(JSON.stringify(this.onboardingTypeTests));
  }
  searchforTests(key) {
    if (key.length > 2) {
      this.onboardingService
        .getSearchedTests(key, this.empId)
        .then(searchedTests => {
          this.searchedTests = searchedTests;
        });
    }
  }
  getTestId(testname, unit) {
    console.log("testName: " + testname + ">>>>> " + unit);
    // if (this.searchedTests.length == 0) {
    //   this.onboardTests.name = testname;
    //   this.onboardTests.unit = unit;
    //   this.onboardingCustomPackage.customTests.push(this.onboardTests);
    //   (<any>$("#search-box")).val("");
    //   (<any>$("#unit-box")).val("");
    //   this.onboardTests = new OnboardTests();
    // }
    for (var i = 0; i < this.searchedTests.length; i++) {
      if (this.searchedTests[i].serviceName == testname) {
        this.onboardTests.name = testname;
        this.onboardTests.unit = unit;
        this.onboardTests.id = this.searchedTests[i].serviceId;
        this.onboardingCustomPackage.customTests.push(this.onboardTests);
        (<any>$("#search-box")).val("");
        (<any>$("#unit-box")).val("");
        this.onboardTests = new OnboardTests();
      }
    }
  }
  removeTest(tests) {
    console.log(JSON.stringify(tests));
    var index = this.onboardingCustomPackage.customTests.indexOf(tests);
    this.onboardingCustomPackage.customTests.splice(index, 1);
  }
  insertTestForPOC() {

    if (this.sendTest == "0") {
      this.errorMessage = "Choose Onboarding Type";
      return;
    }

    // if (this.onboardingCustomPackage.amount == undefined || this.onboardingCustomPackage.amount == null) {
    //   this.errorMessage = "Enter the Amount";
    //   return;
    // }
    // if (this.onboardingCustomPackage.modeOfPayment == "0") {
    //   this.errorMessage = "Choose the Mode of Payment";
    //   return;
    // }

    this.onboardingCustomPackage.doctorId = this.selectedDoctorDetails.empId;
    this.onboardingCustomPackage.type = this.sendTest.type;
    this.onboardingCustomPackage.id = this.sendTest.id;
    this.onboardingCustomPackage.profileId = this.profileId;
    this.onboardingCustomPackage.pocId = this.pocId;
    this.onboardingCustomPackage.pocName = this.pocName;
    this.onboardingCustomPackage.mobile = this.mobile;
    this.onboardingCustomPackage.transactionId = this.transactionId;
    console.log("modeOfPayment" + this.onboardingCustomPackage.modeOfPayment);
    if (!this.onboardingCustomPackage.modeOfPayment) {
      this.errorMessage = "Please Select payment mode";
      return;
    }
    // if (this.paymentMode == 'cash') {
    //   this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_CASH.toString();
    // } else if (this.paymentMode == 'Others') {
    //   if (!this.otherTransactionType) {
    //     this.errorMessage = "Please Select payment mode";
    //     return;
    //   }
    //   this.onboardingCustomPackage.modeOfPayment = this.otherTransactionType.toString();
    // } else {
    //   this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_MOBILE.toString();
    // }
    if (this.onboardingCustomPackage.type == 'Custom') {
      if ((this.customPackageName == '' || this.customPackageName == null || this.customPackageName == undefined) && this.sendTest.name == 'Custom') {
        this.errorMessage = "Please provide custom package name."
        return;
      }

      if (
        this.customPackageName == "Custom" ||
        this.customPackageName == "Basic" ||
        this.customPackageName == "Standard" ||
        this.customPackageName == "Premium"
      ) {
        this.errorMessage =
          "Test name 'Basic', 'Standard', 'Premium' and 'Custom' are not allowed";
        return;
      }

      this.onboardingCustomPackage.tests =
        this.onboardingTypeTests.length > 0
          ? this.onboardingTypeTests
          : this.onboardSelectedTest;
      this.onboardingCustomPackage.name = this.customPackageName;
      console.log(
        "insertttttrequesttt" + JSON.stringify(this.onboardingCustomPackage)
      );
      // if (!(this.onboardingCustomPackage.tests.length > 0 || this.onboardingCustomPackage.customTests.length > 0)) {
      //   this.errorMessage = "Please select test type having atleast 1 test"
      //   return;
      // }
      this.spinnerService.start();
      this.onboardingService.insertCustomPackageDetail(this.onboardingCustomPackage).then((insertResponse) => {
        this.spinnerService.stop();
        this.insertResponse = insertResponse;
        if (this.insertResponse.statusCode == 200) {
          this.updatepaymentstatusForPackage();
          this.onboardingCustomPackage = new OnboardingCustomTypePackage();
          if (!this.onboardingCustomPackage.modeOfPayment)
            this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_CASH + "";
          this.onboardingType.tests = new Array();
          this.sendDefinedPackage = "";
          this.onboardingType = new OnboardingTypeResponse();
          this.customPackageName = "";
          (<any>$("#myModal2")).modal("hide");
          (<any>$("#showForCustom1")).hide();
          (<any>$("#showForCustom2")).hide();
          (<any>$("#showForCustom3")).hide();
          (<any>$("#showForCustom4")).hide();
          (<any>$("#showForCustom6")).hide();
          (<any>$("#showForCustom7")).hide();
          (<any>$("#showForCustom5")).show();
          // this.router.navigate(['/app/onboarding/physical/' + this.profileId]);
        }
      }).then((err) => {
        console.log(err);
        this.spinnerService.stop();
      });

    } else {
      this.onboardingCustomPackage.name = this.onboardingCustomPackage.type;
      this.onboardingCustomPackage.tests = this.sendTest.tests;
      this.spinnerService.start();
      this.onboardingService.insertCustomPackageDetail(this.onboardingCustomPackage).then((insertResponse) => {
        this.spinnerService.stop();
        this.insertResponse = insertResponse;
        if (this.insertResponse.statusCode == 200) {
          this.updatepaymentstatusForPackage();
          this.onboardingCustomPackage = new OnboardingCustomTypePackage();
          if (!this.onboardingCustomPackage.modeOfPayment)
            this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_CASH + "";
          this.onboardingType.tests = new Array();
          this.sendDefinedPackage = "";
          this.onboardingType = new OnboardingTypeResponse();
          this.customPackageName = "";
          (<any>$("#myModal2")).modal("hide");
          (<any>$("#showForCustom1")).hide();
          (<any>$("#showForCustom2")).hide();
          (<any>$("#showForCustom3")).hide();
          (<any>$("#showForCustom4")).hide();
          (<any>$("#showForCustom6")).hide();
          (<any>$("#showForCustom7")).hide();
          (<any>$("#showForCustom5")).show();
          // this.router.navigate(['/app/onboarding/physical/' + this.profileId]);
        }
      }).then((err) => {
        console.log(err);
        this.spinnerService.stop();
      });
    }
    //console.log(JSON.stringify(this.onboardingCustomPackage));
  }

  onGenderSelect() {
    this.isGenSelect = true;
  }
  doctorSearchTrigger(key) {
    console.log(key);
    if (key.length > 2) {
      this.onboardingService
        .getDoctorSearchedList(this.pocId, key)
        .then(doctorListSearchResults => {
          this.doctorListSearchResults = doctorListSearchResults;
          console.log(JSON.stringify(this.doctorListSearchResults));
        });
    }
  }
  // selectedDoctor(selectedDoctor) {
  //   console.log("selected--" + JSON.stringify(selectedDoctor));
  //   this.doctorSelectTotal = 1;
  //   this.selectedDoctorDetails = selectedDoctor;
  //   //this.doctorName=this.selectedDoctorDetails.firstName;
  // }
  downloadUsers(fromdate, todate) {
    fromdate = new Date(fromdate);
    fromdate.setHours(0);
    fromdate.setMinutes(0);
    fromdate.setSeconds(0);
    fromdate.setMilliseconds(0);

    todate = new Date(todate);
    todate.setHours(0);
    todate.setMinutes(0);
    todate.setSeconds(0);
    todate.setMilliseconds(0);

    if (todate.getTime() < fromdate.getTime()) {
      this.downloadMessage = "To-date should not be less than From-date";
      return;
    }

    if (fromdate != null && todate != null) {
      console.log(fromdate.getTime() + "--< from to---->" + todate.getTime())
      this.onboardingService.getOnboardedUsersDatewise(fromdate.getTime(), todate.getTime(), this.pocId).then((onboardeduserList) => {
        if (onboardeduserList.statusCode == 200) {
          //  window.open(onboardeduserList.pdfUrlWithHeader);
          this.onClickPrint(onboardeduserList.pdfUrlWithHeader);
          (<any>$("#downloadModal")).modal("hide");
        } else {
          this.downloadMessage = onboardeduserList.statusMessage;
        }
      });
    } else {
      this.downloadMessage = "Please enter From-date and To-date";
    }
  }

  updatepaymentstatusForPackage() {
    let index: number = -1;
    for (let i = 0; i < this.registeredProfileList.length; i++) {
      if (this.registeredProfileList[i].profileId == this.profileId) {
        index = i;
        break;
      }
    }
    console.log(this.registeredProfileList[index]);

    let basketRequest: BasketRequest = new BasketRequest();
    basketRequest.bookingSource = 3;
    basketRequest.parentProfileId = this.registeredProfileList[
      index
    ].parentProfileId;

    basketRequest.cartItemList = new Array<CartItem>();
    basketRequest.cartItemList[0] = new CartItem();
    if (
      this.registeredProfileList[index].brandId != null &&
      this.registeredProfileList[index].brandId != undefined
    ) {
      basketRequest.cartItemList[0].brandId = this.registeredProfileList[
        index
      ].brandId;
    }
    basketRequest.cartItemList[0].doctorId = this.selectedDoctorDetails.empId;
    (basketRequest.cartItemList[0].cartItemType =
      CartItem.CART_ITEM_TYPE_ONBOARDING),
      (basketRequest.cartItemList[0].empId = this.authService.employeeDetails.empId);
    if (
      this.registeredProfileList[index].parentProfileId != null &&
      this.registeredProfileList[index].parentProfileId != undefined
    ) {
      basketRequest.cartItemList[0].parentProfileId = this.registeredProfileList[
        index
      ].parentProfileId;
    }
    else if (this.registeredProfileList[index].relationShipId != null && this.registeredProfileList[index].relationShipId != undefined) {
      basketRequest.cartItemList[0].parentProfileId = this.registeredProfileList[index].relationShipId;
    }
    if (this.registeredProfileList[index] != null && this.registeredProfileList[index] != undefined) {
      basketRequest.cartItemList[0].patientProfileId = this.registeredProfileList[index].profileId;
      basketRequest.cartItemList[0].patientRelationship = this.registeredProfileList[index].relationShip;
    }
    basketRequest.cartItemList[0].paymentSource = 3;
    basketRequest.cartItemList[0].pocId = this.authService.selectedPOCMapping.pocId;

    basketRequest.cartItemList[0].payment = new Payment();
    // basketRequest.cartItemList[0].payment.transactionType = isNaN(parseInt("" + $("#modeOfPayment").val())) ? null : parseInt("" + $("#modeOfPayment").val());
    basketRequest.cartItemList[0].payment.transactionType = Number(this.onboardingCustomPackage.modeOfPayment);
    basketRequest.cartItemList[0].payment.transactionId = this.transactionId;
    basketRequest.cartItemList[0].payment.paymentStatus = Payment.PAYMENT_STATUS_PAID;
    basketRequest.cartItemList[0].payment.taxes = new Taxes();
    basketRequest.cartItemList[0].payment.originalAmount = this.onboardingCustomPackage.amount;
    basketRequest.cartItemList[0].payment.finalAmount = this.onboardingCustomPackage.amount;

    basketRequest.cartItemList[0].productList = new Array<Product>();
    basketRequest.cartItemList[0].productList[0] = new Product();
    basketRequest.cartItemList[0].productList[0].grossPrice = this.onboardingCustomPackage.amount;
    basketRequest.cartItemList[0].productList[0].discountPrice;
    basketRequest.cartItemList[0].productList[0].netPrice = this.onboardingCustomPackage.amount;
    basketRequest.cartItemList[0].productList[0].quantity = 1;
    basketRequest.cartItemList[0].productList[0].originalAmount = this.onboardingCustomPackage.amount;
    basketRequest.cartItemList[0].productList[0].packageDiscountAmount = 0;
    basketRequest.cartItemList[0].productList[0].otherDiscountAmount = 0;
    basketRequest.cartItemList[0].productList[0].taxationAmount = 0;
    basketRequest.cartItemList[0].productList[0].finalAmount = this.onboardingCustomPackage.amount;

    if (this.onboardingCustomPackage.type != "Custom") {
      basketRequest.cartItemList[0].productList[0].productId = parseInt(
        this.sendTest.id + ""
      );
      basketRequest.cartItemList[0].productList[0].productName =
        this.sendTest.name + "";
    } else {
      // basketRequest.cartItemList[0].productList[0].productId =0;
      basketRequest.cartItemList[0].productList[0].productName = this.customPackageName;
    }
    console.log(basketRequest);
    this.spinnerService.start();
    this.onboardingService
      .updatepaymentstatusForPackage(basketRequest)
      .then(data => {
        console.log(data);
        this.spinnerService.stop();
        if (data != null && data.statusCode == 200) {
          if (data.cartItemList != null && data.cartItemList != undefined) {
            if (
              data.cartItemList[0] != null &&
              data.cartItemList[0] != undefined
            ) {
              this.pdfUrl = data.cartItemList[0].pdfUrlWithHeader;
              this.pdfUrl = data.cartItemList[0].pdfUrlWithHeader
              if (this.authService.selectedPOCMapping) {
                if (this.authService.selectedPOCMapping.participationSettings.pdfHeaderType == 0)
                  this.pdfUrl = data.cartItemList[0].pdfUrlWithHeader;
                else if (this.authService.selectedPOCMapping.participationSettings.pdfHeaderType == 1)
                  this.pdfUrl = data.cartItemList[0].pdfUrlWithoutHeader;
              }
              this.openPrintView();
            } else {
              this.openPrintView();
            }
          }
        }
      })
      .catch(err => {
        console.log(err);
        this.openPrintView();
        this.spinnerService.stop();
      });
  }

  private openPrintView() {
    (<any>$("#myModal2")).modal("hide");
    (<any>$("#showForCustom1")).hide();
    (<any>$("#showForCustom2")).hide();
    (<any>$("#showForCustom3")).hide();
    (<any>$("#showForCustom4")).hide();
    (<any>$("#showForCustom6")).hide();
    (<any>$("#showForCustom7")).hide();
    (<any>$("#printPDFWizardModel")).modal({
      show: true,
      escapeClose: false,
      clickClose: false,
      showClose: false,
      backdrop: "static",
      keyboard: false
    });
  }

  onClickPrint(pdfUrl = this.pdfUrl) {
    //  window.open(this.pdfUrl);
    this.authService.openPDF(pdfUrl);
  }

  closePrintView() {
    (<any>$("#myModal2")).modal("hide");
    (<any>$("#showForCustom1")).hide();
    (<any>$("#showForCustom2")).hide();
    (<any>$("#showForCustom3")).hide();
    (<any>$("#showForCustom4")).hide();
    (<any>$("#showForCustom6")).hide();
    (<any>$("#showForCustom7")).hide();
    (<any>$("#printPDFWizardModel")).modal("hide");
    if (this.phrCompletionType == 2) {
      this.router.navigate(["/app/onboarding/physical/" + this.profileId]);
    } else {
      this.router.navigate(["/app/onboarding/personal/" + this.profileId]);
    }
  }
  openModal(id: string) {
    (<any>$(id)).modal("show");
    $(".modal-backdrop")
      .not(":first")
      .remove();
  }

  changePageIndex(index: number) {
    console.log(index);
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    this.displayRegisteredProfileList = JSON.parse(
      JSON.stringify(
        this.registeredPeopleList.slice(
          (this.indexOfPage - 1) * this.noOfReportsPerPage,
          this.indexOfPage * this.noOfReportsPerPage
        )
      )
    );
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.registeredPeopleList.length == 0) return Array(1).fill(1);

    return Array(
      Math.ceil(this.registeredPeopleList.length / this.noOfReportsPerPage)
    ).fill(1);
  }


  onPaymentModeChange(paymentMode: string): void {

    if (paymentMode === 'Others') {
      this.selectOthers = true;
    }
    else {
      // this.selectOthers = false;
      // this.isError = false;
      // this.errorMessage2 = new Array();
      // this.showMessage = false;
      this.errorMessage = '';
    }
    this.paymentMode = paymentMode;
  }

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (this.selectOthers == true && index == 0) {
      this.errorMessage = "Please Select Correct payment mode";
      return;
    } else {
      this.errorMessage = ' ';
    }
  }

}
