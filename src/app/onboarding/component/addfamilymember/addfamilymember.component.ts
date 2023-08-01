import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { Calendar } from 'primeng/primeng';
import { NgModule } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker';
import { OnboardingService } from './../../../onboarding/onboarding.service';
import { PatientRegisterService } from './../../../patientregister/patientregister.service';
import { ProfileDetailsVO } from './../../../model/profile/profileDetailsVO';
import { RegistrationVO } from './../../../model/profile/registrationVO';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { OnboardingTypeResponse } from './../../../model/onboarding/onboardingTypeResponse';
import { OnboardingCustomTypePackage } from './../../../model/onboarding/onboardingCustomTypePackage';
import { OnboardTests } from './../../../model/onboarding/onboardTests';
import { AuthService } from './../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { ValidationUtil } from '../../../base/util/validation-util';
import { Payment } from './../../../model/basket/payment';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { CartItem } from './../../../model/basket/cartitem';
import { Taxes } from './../../../model/basket/taxes';
import { Product } from './../../../model/product/product';

@Component({
  selector: "onboarding",
  templateUrl: "./addfamilymember.template.html",
  styleUrls: ["./addfamilymember.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class AddFamilyComponent {
  config: any;
  familyMember: ProfileDetailsVO = new ProfileDetailsVO();
  registeredProfileList: RegistrationVO[] = new Array<RegistrationVO>();
  profileId: number;
  isGenderChoose: boolean = true;
  isChoose: boolean = true;
  newMemberDate: Date;
  newFamilyMemberRelationShip: number = 0;
  messageForEmptyFields: string;
  isEmpty: boolean = true;
  space: string = " ";
  dropDownIndex: number = 0;
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
  showTests = new Array();
  empId: number;
  searchedTests: any;
  errorMessage: string;
  customPackageName: any;
  pocId: number;
  pocName: string;
  transactionId: string = '';
  insertResponse: any;
  unit: any;
  testName: any;
  isAge: boolean = false;
  isDOB: boolean = true;
  ageYears: number = 0;
  ageMonths: number = 0;
  validation: any;
  selectOthers: boolean = false;
  otherTransactionType: number;
  paymentMode: string = 'cash';
  phrCompletionType:number;
  titlesList: Array<string> = ['Mr', 'Miss', 'Mrs', 'Master', 'Baby', 'Baby of', 'Baby Boy', 'Baby Girl', 'Dr', 'Prof', 'Capt'];
  pdfUrl: string;
  datepickerOpts = {
    startDate: new Date(-2209008600000),
    endDate: new Date(),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "dd/mm/yyyy"
  };
  constructor(
    config: AppConfig,
    private patientregisterservice: PatientRegisterService,
    private common: CommonUtil,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private onboardingService: OnboardingService,
    private router: Router,
    private spinnerService: SpinnerService,
    private validationUtil: ValidationUtil
  ) {
    this.config = config.getConfig();
    this.onboardingCustomTypePackage = new Array();
    this.onboardingTypeTests = new Array();
    this.onboardingCustomPackage.customTests = new Array();
    this.pocId = authService.userAuth.pocId;
    this.pocName = authService.userAuth.pocName;
    this.empId = authService.userAuth.employeeId;
    this.onboardingCustomPackage.modeOfPayment = "0";
    this.showTests = new Array();
    this.validation = validationUtil;
  }

  ngOnInit(): void {
    var reset = this;
    $(".modal").on("hidden.bs.modal", function (e) {
      reset.resetForm();
    });
    this.sendTest = "0";
    this.activatedRoute.params.subscribe((params: Params) => {
      this.profileId = params["profileId"];
      //console.log("kalia"+this.profileId);
    });
    this.getFamilyDetails();
  }
  onRelationShipDropDownChange(index: number) {
    console.log("indexxx" + index);
    if (index > 0) {
      this.newFamilyMemberRelationShip = index;
    } else {
    }
  }
  checkAgeSelection(index: number) {
    if (index == 0) {
      this.isAge = false;
      this.isDOB = true;
      this.familyMember.providedOnlyAge = false;
      console.log(this.ageYears + "AGE-->" + this.ageMonths);
      if (
        this.common.getDobFromAge(this.ageYears, this.ageMonths) <
        -2209008600000
      ) {
        this.ageYears = parseInt(this.common.getAgeForall(-2209008600000));
        this.ageMonths = 0;
        this.newMemberDate = new Date(
          this.common.getDobFromAge(this.ageYears, this.ageMonths)
        );
      } else {
        this.newMemberDate = new Date(
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
      this.familyMember.providedOnlyAge = true;
      this.ageYears = null;
      this.ageMonths = null;
      if (
        isNaN(
          parseInt(
            this.newMemberDate && this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[0]
          )
        )
      ) {
        this.ageYears = 0;
      } else {
        this.ageYears = parseInt(
          this.newMemberDate && this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[0]
        );
      }

      if (
        isNaN(
          parseInt(
            this.newMemberDate &&  this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[1]
          )
        )
      ) {
        this.ageMonths = 0;
      } else {
        this.ageMonths = parseInt(
          this.common.getAgeForall(this.newMemberDate.getTime()).split(",")[1]
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

  onTitleChange(event) {
    this.familyMember.title = event;
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
    (<any>$("h4#showForCustom5")).hide();
  }
  onAddFamilyMember() {
    console.log("comingggggg");

    this.familyMember.relationShipId = this.profileId;
    if ((this.familyMember.fName == "" || this.familyMember.fName == null || this.familyMember.fName == undefined)
      || (this.familyMember.title == null || this.familyMember.title == undefined || this.familyMember.title == "") ||
      (this.familyMember.gender == undefined || this.familyMember.gender == null) || (this.newFamilyMemberRelationShip == 0 ||
        this.familyMember.relationShip == 0)) {
      this.isEmpty = false;
      this.messageForEmptyFields = "Please fill the required fields";
      return;
    }
    if (this.isAge) {
      if (this.ageYears > 120) {
        this.ageYears = 120;
        this.isEmpty = false;
        this.messageForEmptyFields = "Years should not be greater than 120";
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
      console.log(this.ageYears + " " + this.ageMonths)
      if ((this.ageYears == null && this.ageMonths == null) || (this.ageYears == 0 && this.ageMonths == 0)) {
        this.isEmpty = false;
        this.messageForEmptyFields = "Age field can't be left blank";
        return;
      } else {
        this.familyMember.dob = this.common.getDobFromAge(
          this.ageYears,
          this.ageMonths
        );
      }
    }
    if (this.isDOB) {
      console.log(this.newMemberDate)
      if (!this.newMemberDate || this.newMemberDate.toString() == "Invalid Date") {
        this.isEmpty = false;
        this.messageForEmptyFields = "DOB field can't be left blank";
        return;
      } else {
        this.familyMember.dob = this.newMemberDate.getTime();
      }
    }

    if (this.newFamilyMemberRelationShip > 0) {
      this.familyMember.relationShip = this.newFamilyMemberRelationShip;
    }
    if (this.familyMember.lName == null || this.familyMember.lName == undefined) {
      this.familyMember.lName = "";
    }
    console.log("familymemberbodyyyy" + JSON.stringify(this.familyMember));
    this.familyMember.onboardingStatus=0
    this.updateFamilyMember(this.familyMember);
  }

  editFamilyMember(familyProfileId: number) {
    this.profileId = familyProfileId;
    console.log("family iddd" + this.profileId);
    this.router.navigate(["/app/onboarding/personal/" + this.profileId]);
  }

  updateFamilyMember(familyMember: ProfileDetailsVO) {
    $("html, body").animate({ scrollTop: "0px" }, 300);
    this.spinnerService.start();
    this.patientregisterservice
      .updateFamilyMemberToServer(this.familyMember)
      .then(response => {
        console.log("family member response" + JSON.stringify(response));
        this.spinnerService.stop();
        // this.familyMember = new ProfileDetailsVO();
        //  this.newFamilyMemberRelationShip = 0;
        // this.newMemberDate = new Date();
        if (response != undefined && response != null) {
          this.isEmpty = true;
          this.familyMember = new ProfileDetailsVO();
          this.newFamilyMemberRelationShip = 0;
          this.newMemberDate = new Date();
          this.dropDownIndex = 0;
          this.isAge = false;
          this.isDOB = true;
          this.ageMonths = null;
          this.ageYears = null;
          this.newMemberDate = null;
          alert(response.statusMessage);
          this.getFamilyDetails();
        }
      });
  }
  getFamilyDetails() {
    this.spinnerService.start();
    this.onboardingService.getFamilyDetails(this.profileId).then(familyList => {
      this.spinnerService.stop();
      this.registeredProfileList = familyList;

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
            this.common.getAge(this.registeredProfileList[i].dob).split(",")[1];
        }
      }

      console.log(
        "familylistttttt" + JSON.stringify(this.registeredProfileList)
      );
    }).catch((err) => {
      this.spinnerService.stop();
    });
  }
  onGenderChange() {
    this.isGenderChoose = true;
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
  onupdatelab(profileId): void {
    console.log("lab  profile iddddd" + profileId);
    this.router.navigate(["/app/onboarding/updatelabtest/" + profileId]);
  }
  getOnboardingType(item) {
    console.log("profileiddddddd" + item.profileId);
    this.phrCompletionType = item.phrCompletionType;
    this.profileId = item.profileId;
    this.onboardingService.getOnboardingType().then(onboardingTypeResponse => {
      this.onboardingTypeResponse = onboardingTypeResponse;
      console.log(JSON.stringify(this.onboardingTypeResponse));
      (<any>$("#myModal2")).modal("show");
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
    console.log(testname + " " + unit);

    for (var i = 0; i < this.searchedTests.length; i++) {
      if (this.searchedTests[i].serviceName == testname) {
        this.onboardTests.name = testname;
        this.onboardTests.unit = unit;
        this.onboardTests.id = this.searchedTests[i].serviceId;
        this.onboardingCustomPackage.customTests.push(this.onboardTests);
        (<any>$("#search-box")).val("");
        (<any>$("#unit-box")).val("");
        this.onboardTests = new OnboardTests();
        console.log(JSON.stringify(this.onboardingCustomPackage.customTests));
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

    if (
      this.onboardingCustomPackage.amount == undefined ||
      this.onboardingCustomPackage.amount == null
    ) {
      this.errorMessage = "Enter the Amount";
      return;
    }
    this.onboardingCustomPackage.transactionId = this.transactionId;
    if (this.paymentMode == 'cash') {
      this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_CASH.toString();
    } else if (this.paymentMode == 'Others') {
      if (!this.otherTransactionType) {
        this.errorMessage = "Please Select payment mode";
        return;
      }
      this.onboardingCustomPackage.modeOfPayment = this.otherTransactionType.toString();
    } else {
      this.onboardingCustomPackage.modeOfPayment = Payment.PAYMENT_TYPE_MOBILE.toString();
    }

    this.onboardingCustomPackage.type = this.sendTest.type;
    this.onboardingCustomPackage.id = this.sendTest.id;
    this.onboardingCustomPackage.profileId = this.profileId;
    this.onboardingCustomPackage.pocId = this.pocId;
    this.onboardingCustomPackage.pocName = this.pocName;
    this.onboardingCustomPackage.mobile = "0"; //this.mobile;
    if (this.onboardingCustomPackage.type == "Custom") {
      if (
        (this.customPackageName == "" ||
          this.customPackageName == null ||
          this.customPackageName == undefined) &&
        this.sendTest.name == "Custom"
      ) {
        this.errorMessage = "Please provide custom package name.";
      } else {
        if (
          this.customPackageName == "Custom" ||
          this.customPackageName == "Basic" ||
          this.customPackageName == "Standard" ||
          this.customPackageName == "Premium"
        ) {
          this.errorMessage =
            "Test name 'Basic', 'Standard', 'Premium' and 'Custom' are not allowed";
        } else {
          this.onboardingCustomPackage.tests =
            this.onboardingTypeTests.length > 0
              ? this.onboardingTypeTests
              : this.onboardSelectedTest;
          this.onboardingCustomPackage.name = this.customPackageName;
          console.log(
            "insertttttrequesttt" + JSON.stringify(this.onboardingCustomPackage)
          );
          this.spinnerService.start();
          this.onboardingService
            .insertCustomPackageDetail(this.onboardingCustomPackage)
            .then(insertResponse => {
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
                // this.router.navigate([
                //   "/app/onboarding/physical/" + this.profileId
                // ]);
              }
            });
        }
      }
    } else {
      this.onboardingCustomPackage.name = this.onboardingCustomPackage.type;
      this.onboardingCustomPackage.tests = this.sendTest.tests;
      this.spinnerService.start();
      this.onboardingService
        .insertCustomPackageDetail(this.onboardingCustomPackage)
        .then(insertResponse => {
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
            // this.router.navigate([
            //   "/app/onboarding/physical/" + this.profileId
            // ]);
          }
        });
    }
    //console.log(JSON.stringify(this.onboardingCustomPackage));
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
    // basketRequest.cartItemList[0].doctorId = this.selectedDoctorDetails.empId;
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


}
