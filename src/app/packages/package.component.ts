import { Component, ChangeDetectorRef } from "@angular/core";
import { AppConfig } from "./../app.config";

import { HealthPackage } from "./../model/package/healthPackage";
import { PackageService } from "./package.service";
import { Doctor } from "./../model/employee/doctor";
import { SelectedRegisteredProfile } from "./../model/profile/selectedRegisteredProfile";
import { AuthService } from "../auth/auth.service";
import { State } from "./../model/base/state";
import { City } from "./../model/base/city";
import { BasketRequest } from "./../model/basket/basketRequest";
import { CartItem } from "./../model/basket/cartitem";
import { UserHsPackage } from "./../model/package/userHsPackage";
import { PocDetail } from "./../model/poc/pocDetails";
import { PaymentType } from "./../model/payment/paymentType";
import { Payment } from "./../model/basket/payment";
import { UserPermissions } from "./../model/auth/user-permissions";
import { DiagnosticsService } from "./../diagnostics/diagnostics.service";
import { Product } from "../model/product/product";
import { Router } from "@angular/router";
import { SpinnerService } from "../layout/widget/spinner/spinner.service";
import { Config } from "../../../src/app/base/config.js";
import { DiscountType } from "../model/package/discountType";

@Component({
  selector: "package",
  templateUrl: "./package.template.html",
  styleUrls: ["./package.style.scss"],
})
export class PackageComponent {
  // Package Constants
  public PACKAGE_SUB_TYPE_PERSONAL = 1;
  public PACKAGE_SUB_TYPE_FAMILY = 2;
  public PACKAGE_SUB_TYPE_OTHER = 3;
  public PACKAGE_PERSONAL_DOCTOR_NON_MANDATORY = 1;
  public PACKAGE_PERSONAL_DOCTOR_MANDATORY = 2;

  discountType: number = DiscountType.TYPE_PACKAGE;

  config: any;
  month: any;
  year: any;
  pdfHeaderType: number;
  consultation = new Array<any>();
  packageList: HealthPackage[] = new Array<HealthPackage>();
  selectedpackage: HealthPackage;
  selectedService: string = "0";
  doctorList: Doctor[] = new Array<Doctor>();
  cartItemList: CartItem[] = new Array<CartItem>();
  selectedRegisteredProfile: SelectedRegisteredProfile;
  selectedDoctor: Doctor;
  paymentMode: string = "cash";
  basketRequest: BasketRequest = new BasketRequest();
  brandId: number;
  userHsPackage: UserHsPackage;
  pocDetail: PocDetail;
  paymentResponse: any;
  permissionRole: UserPermissions;
  doctorMSG: string = "";
  startdate: Date;
  packagePurchaseDate: number;
  packageEndDate: number;
  milliSecondsForADay: number = 24 * 60 * 60 * 1000;
  // specialization: Array<any> = new Array();
  errorMessage: string[] = new Array();
  isError: boolean;
  showMessage: boolean;
  popupErrorMessage: string[] = new Array();
  popupIsError: boolean;
  popupShowMessage: boolean;
  receptionRole: string;
  hasReceptionRole: boolean = false;
  selectOthers: boolean = true;
  transactionId: any;
  otherTransactionType: number;
  pocId: number;
  displayBenefitList: Array<any>;

  offPercent: any;

  datepickerOpts = {
    startDate: new Date(2016, 5, 10),
    autoclose: true,
    todayBtn: "linked",
    todayHighlight: true,
    assumeNearbyYear: true,
    format: "D, d MM yyyy",
  };

  isMoreClicked: boolean = false;
  viewspecialists: any;
  lat: number;
  long: number;
  indexOfPage: number;
  noOfReportsPerPage: number = 10;
  empId: number;

  constructor(
    config: AppConfig,
    private packageService: PackageService,
    private diagnosticService: DiagnosticsService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private spinnerService: SpinnerService
  ) {
    this.config = config.getConfig();
    this.brandId = Config.portal.appId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
    this.pocId = this.authService.userAuth.pocId;
  }

  ngOnInit(): void {
    let now = new Date();
    let cartItem = new CartItem();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.gethealthPackages();
    this.permissionRole = this.authService.getSelectedRole();
    this.empId = this.authService.userAuth.employeeId;
    console.log("selectedRole" + JSON.stringify(this.permissionRole));
    this.receptionRole = "Reception";
    console.log("permissionRole" + JSON.stringify(this.permissionRole));
    console.log("enum permissions" + JSON.stringify(this.receptionRole));
    this.getPosition();
    this.basketRequest.cartItemList = new Array<CartItem>();
    this.basketRequest.cartItemList.push(cartItem);
    this.basketRequest.cartItemList[0].cartItemType =
      CartItem.CART_ITEM_TYPE_PACKAGE;
  }
  changePageIndex(index: number) {
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    if (this.selectedpackage.benefitList)
      this.displayBenefitList = JSON.parse(
        JSON.stringify(
          this.selectedpackage.benefitList.slice(
            (this.indexOfPage - 1) * this.noOfReportsPerPage,
            this.indexOfPage * this.noOfReportsPerPage
          )
        )
      );
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.selectedpackage.benefitList.length == 0) return Array(1).fill(1);
    return Array(
      Math.ceil(
        this.selectedpackage.benefitList.length / this.noOfReportsPerPage
      )
    ).fill(1);
  }

  gethealthPackages(): void {
    this.isError = this.packageService.isError;
    this.showMessage = this.packageService.showMessage;
    this.errorMessage = this.packageService.errorMessage;
    this.spinnerService.start();
    this.packageService
      .getpackageList()
      .then((packageList) => {
        this.spinnerService.stop();
        this.packageList = packageList;
        if (this.packageList.length == 0) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "No package found";
          this.showMessage = true;
        } else {
          this.isError = false;
          this.errorMessage = undefined;
          this.showMessage = false;
        }
        if (!this.packageList || this.packageList.length == 0) {
          return;
        }
        // this.selectedpackage = this.packageList[0];

        if (this.selectedpackage && this.selectedpackage.benefitList) {
          this.indexOfPage = 1;
          this.displayBenefitList = JSON.parse(
            JSON.stringify(
              this.selectedpackage.benefitList.slice(0, this.noOfReportsPerPage)
            )
          );
        }
        this.packageList.forEach((data) => {
          data.freeConsultationsList.forEach((element) => {
            if (element) {
              element.serviceList.forEach((e) => {
                if (e.imageUrl) {
                  e.imageUrl = e.imageUrl.split(".png")[0] + "xxxhdpi.png";
                }
              });
            }
          });
          data.discountsList.forEach((element) => {
            if (element) {
              element.serviceList.forEach((e) => {
                if (e.imageUrl) {
                  e.imageUrl = e.imageUrl.split(".png")[0] + "xxxhdpi.png";
                }
              });
            }
          });
        });
        this.onViewPackage(this.packageList[0], 0);
        $(document).ready(function () {
          $("#package0").addClass("active");
        });
      })
      .catch((error) => {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] =
          "Error occurred while processing request. Please try again!";
        this.showMessage = true;
        this.spinnerService.stop();
      });
  }

  viewSpecialists(selectedpackage: HealthPackage) {
    this.getPosition();
    this.packageService.selectedpackage = selectedpackage;
    this.router.navigate(["./app/package/specialists"]);
  }

  getPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude);
      this.lat = position.coords.latitude;
      console.log(position.coords.longitude);
      this.long = position.coords.longitude;
    });
  }

  // This method gets called on clicking the view package button on the pacakges list
  onViewPackage(
    selectedpackage: HealthPackage,
    index?,
    isScrollEnable: boolean = true
  ): void {
    if (isScrollEnable) {
      if ($(window).width() <= 767) {
        $("html, body").animate(
          {
            scrollTop: $(".package-listdetail").offset().top - 80,
          },
          2000
        );
      }
      if ($(window).width() >= 768) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    }

    $(document).ready((): void => {
      $(this).find(".packageCheckId").removeClass("active");
      $(this)
        .find("#package" + index)
        .addClass("active");
    });
    this.selectedpackage = selectedpackage;
    if (this.selectedpackage.benefitList) {
      this.indexOfPage = 1;
      this.displayBenefitList = JSON.parse(
        JSON.stringify(
          this.selectedpackage.benefitList.slice(0, this.noOfReportsPerPage)
        )
      );
    }
    console.log(
      "selected package----->" + JSON.stringify(this.selectedpackage)
    );
    this.selectedpackage.freeConsultationsList.forEach((element) => {
      // console.log('freecons--->'+JSON.stringify(element));
      if (element.serviceTypeId === 3) {
        // console.log('servicelist---->'+JSON.stringify(element.serviceList));
        const serviceList = new Array<any>();
        serviceList.push(element.serviceList);
        // this.consultation.push(element.serviceList);

        serviceList.forEach((element) => {
          element.forEach((ele) => {
            if (
              this.consultation.findIndex((e) => {
                return ele.serviceId == e.serviceId;
              }) == -1
            )
              this.consultation.push(ele);
          });
          // this.consultation.push(element);
          console.log("final here--->" + JSON.stringify(this.consultation));
        });
        // this.consultation.forEach(element => {
        //   console.log("dabbbaa----->"+JSON.stringify(element.serviceName));
        // });
      }
    });
    // console.log("packageSir"+JSON.stringify(this.selectedpackage));
    // console.log("length"+this.selectedpackage.packageBenefitList.length);
    // for(let i=0;i<this.selectedpackage.packageBenefitList.length;i++){
    //   if(this.selectedpackage.packageBenefitList[i].serviceTypeId==3){
    //     this.specialization.push(this.selectedpackage.packageBenefitList[i]);
    //   }
    // }
    // console.log("specilization"+JSON.stringify(this.specialization));
    this.packageService.selectedpackage = this.selectedpackage;
    this.offPercent =
      ((selectedpackage.actualPrice - selectedpackage.finalPrice) /
        selectedpackage.actualPrice) *
      100;
    this.offPercent = Math.round(this.offPercent);
    this.selectedDoctor = null;
    this.selectedService = "0";
    this.doctorList = null;
    this.packageService.selectedpackage = this.selectedpackage;
    this.offPercent =
      ((selectedpackage.actualPrice - selectedpackage.finalPrice) /
        selectedpackage.actualPrice) *
      100;
    this.offPercent = Math.round(this.offPercent);
    this.selectedDoctor = null;
    this.selectedService = "0";
    this.doctorList = null;
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
    this.resetPopupMessage();
    let payment = new Payment();
    payment.originalAmount = this.selectedpackage.finalPrice;
    payment.finalAmount = this.selectedpackage.finalPrice;
    this.basketRequest.cartItemList[0].payment = payment;

    this.basketRequest.cartItemList[0].productList = new Array<Product>();
    this.basketRequest.cartItemList[0].productList[0] = new Product();
    this.basketRequest.cartItemList[0].productList[0].productId = this.selectedpackage.packageId;
    this.basketRequest.cartItemList[0].productList[0].productName = this.selectedpackage.name;
    this.basketRequest.cartItemList[0].productList[0].quantity = 1;

    this.basketRequest.cartItemList[0].productList[0].grossPrice = this.selectedpackage.finalPrice;
    this.basketRequest.cartItemList[0].productList[0].netPrice = this.selectedpackage.actualPrice;

    this.basketRequest.cartItemList[0].productList[0].grossPrice = this.selectedpackage.actualPrice;
    this.basketRequest.cartItemList[0].productList[0].otherDiscountAmount = this.basketRequest.cartItemList[0].productList[0].discountPrice =
      this.selectedpackage.actualPrice - this.selectedpackage.finalPrice;
    this.basketRequest.cartItemList[0].productList[0].netPrice = this.selectedpackage.finalPrice;
    this.basketRequest.cartItemList[0].productList[0].finalAmount = this.selectedpackage.finalPrice;
    this.basketRequest.cartItemList[0].productList[0].originalAmount = this.selectedpackage.finalPrice;
  }

  moreClickChange(event) {
    this.isMoreClicked = !this.isMoreClicked;
  }
  // This method gets called when user clicks on buy package on package details
  buyPackage(): void {
    console.log("Buy Package");
    ($("#packageDetailsModal") as any).modal("hide");

    // $('.modal').on('hidden.bs.modal', function (e) {
    //   if ($('.modal').hasClass('in')) {
    //     $('body').addClass('modal-open');
    //   }

    // });
  }

  // This method gets called when the response from the register user component is emitted
  onRegisterNewUser(
    selectedRegisteredProfile: SelectedRegisteredProfile
  ): void {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    console.log(
      "Selected profile in onRegisterNewUser--->" +
      JSON.stringify(this.selectedRegisteredProfile)
    );

    this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.basketRequest.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    if (
      this.selectedRegisteredProfile.selectedProfile.contactInfo != undefined &&
      this.selectedRegisteredProfile.selectedProfile.contactInfo != null &&
      this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile !=
      undefined &&
      this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile != null
    ) {
      this.basketRequest.cartItemList[0].patientProfileDetails.contactInfo.mobile = this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile;
    } else {
      this.basketRequest.cartItemList[0].patientProfileDetails.contactInfo.mobile = this.selectedRegisteredProfile.selfProfile.contactInfo.mobile;
    }
    this.basketRequest.cartItemList[0].patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
    this.basketRequest.cartItemList[0].patientProfileDetails.title = this.selectedRegisteredProfile.selectedProfile.title;
    this.basketRequest.cartItemList[0].patientProfileDetails.fName = this.selectedRegisteredProfile.selectedProfile.fName;
    this.basketRequest.cartItemList[0].patientProfileDetails.title = this.selectedRegisteredProfile.selectedProfile.title;
    this.basketRequest.cartItemList[0].patientProfileDetails.lName = this
      .selectedRegisteredProfile.selectedProfile.lName
      ? this.selectedRegisteredProfile.selectedProfile.lName
      : "";
    this.basketRequest.cartItemList[0].patientProfileDetails.gender = this.selectedRegisteredProfile.selectedProfile.gender;
    this.basketRequest.cartItemList[0].patientProfileDetails.age = this.selectedRegisteredProfile.selectedProfile.age;
    this.basketRequest.cartItemList[0].parentProfileId = this.selectedRegisteredProfile.selfProfile.relationShipId;
    ($("#registerUserModal") as any).modal("hide");
    ($("#packageSummayModal") as any).modal("show");
    $("#packageSummayModal").on("hidden.bs.modal", function (e) {
      if (!$("#selectPersonalDoctorModal").hasClass("in")) {
        $(".modal-backdrop").remove();
      }
    });
    // $('.modal').on('hidden.bs.modal', function (e) {
    //   if ($('.modal').hasClass('in')) {
    //     $('body').addClass('modal-open');
    //   }
    // });
    this.packagePurchaseDate = new Date().getTime();
    this.packageEndDate =
      this.packagePurchaseDate +
      this.selectedpackage.validityDays * this.milliSecondsForADay;
    let tempCartItem = this.basketRequest.cartItemList[0];
    tempCartItem.isReset = true;
    this.basketRequest.cartItemList[0] = { ...tempCartItem };
  }

  // This method gets called when select personal doctor button is clicked on the package summary
  selectPersonalDoctor(): void {
    this.resetPopupMessage();
    ($("#selectPersonalDoctorModal") as any).modal("show");
    $("#selectPersonalDoctorModal").on("hidden.bs.modal", function (e) {
      $(".modal-backdrop").remove();
    });
  }

  onPesonalDoctorClick(selectedDoctor) {
    console.log("doclist" + JSON.stringify(selectedDoctor));
    this.selectPersonalDoctor();
    let docList;
    docList = this.doctorList.filter((doc) => {
      return doc.empId == selectedDoctor.empId;
    });
    console.log("doclist" + JSON.stringify(docList));
    this.selectedDoctor = docList[0];
  }

  // This method gets called when the service id is changed
  onChange(): void {
    // $("#selectPersonalDoctorModal").on("hidden.bs.modal", function (e) {
    //   $(".modal-backdrop").remove();
    // });
    this.doctorList = null;
    this.doctorMSG = null;
    this.selectedDoctor = null;
    if (this.selectedService != null && this.selectedService !== "0") {
      this.spinnerService.start();
      this.packageService
        .getPackageDoctors(this.selectedService, this.selectedpackage.packageId)
        .then((data) => {

          this.doctorList = data;

          this.doctorList.length > 0 &&
            (this.doctorMSG = "Select the Personal Doctor");
          this.spinnerService.stop();
        })
        .catch((err) => {
          console.log(err);
        });
      console.log("docotr" + JSON.stringify(this.doctorList));
    }
  }

  // On choosing a personal doctor on the personal doctor modal this method gets called
  updatePersonalDoctor(): void {
    this.resetPopupMessage();
    if (this.doctorList != null && this.doctorList.length > 0 && this.selectedDoctor == null) {
      this.popupErrorMessage = new Array<string>();
      // this.popupErrorMessage[0] =
      //   "No personal doctor available for this package";
      this.popupErrorMessage[0] =
        "Please Select a personal Doctor";
      this.popupIsError = true;
      this.popupShowMessage = true;

      return;
    }
    ($("#selectPersonalDoctorModal") as any).modal("hide");
    ($("#packageSummayModal") as any).modal("show");
  }

  resetPopupMessage(): void {
    this.popupErrorMessage = new Array<string>();
    this.popupIsError = false;
    this.popupShowMessage = false;
  }

  getCityNameById(stateId: number, cityId: number): string {
    let city: City = this.authService.getCityByIds(stateId, cityId);
    if (city != null) {
      return city.city;
    }
    return "";
  }

  getStateNameById(stateId: number): string {
    let state: State = this.authService.getStateById(stateId);
    if (state != null) {
      return state.state;
    }
    return "";
  }

  // This method gets called on toggling the payment mode
  onPaymentModeChange(paymentMode: string): void {
    if (paymentMode === "Others") {
      this.selectOthers = true;
    } else {
      this.selectOthers = false;
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    this.paymentMode = paymentMode;
  }

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_CARD;
    }
    if (index == 2) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_PHONEPE;
    }
    if (index == 3) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    }
    if (index == 4) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_NEFT;
    }
    if (index == 12) {
      this.otherTransactionType = Payment.PAYMENT_TYPE_UPI;
    }
    if (this.selectOthers == true && index == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Correct payment mode";
      this.showMessage = true;
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
  }

  onPrintButtonClick() {
    if (this.pdfHeaderType == 0) {
      this.authService.openPDF(
        this.basketRequest.cartItemList[0].pdfUrlWithHeader
      );
    } else {
      this.authService.openPDF(
        this.basketRequest.cartItemList[0].pdfUrlWithoutHeader
      );
    }
  }
  onCalculateDiscount(cartItem): void {
    this.cartItemList[0] = cartItem;
  }

  // This method gets called on purchasing the package.
  buyPackageForProfile(): void {
    $("html, body").animate({ scrollTop: "0px" }, 300);
    let paymentType: number;
    let paymentStatus: number;
    let hasReception: boolean = false;

    this.resetPopupMessage();
    // tslint:disable-next-line:max-line-length
    if (
      this.selectedpackage != null &&
      this.selectedpackage.personalDoctorType ===
      this.PACKAGE_PERSONAL_DOCTOR_MANDATORY &&
      this.selectedDoctor == null
    ) {
      console.log("====>>>> ");
      // if (this.selectedpackage != null && (this.selectedDoctor == null || this.selectedDoctor == undefined)) {
      this.popupErrorMessage = new Array<string>();
      // tslint:disable-next-line:max-line-length
      this.popupErrorMessage[0] =
        "Personal Doctor selection is mandatory. Please select a personal doctor";
      this.popupIsError = true;
      this.popupShowMessage = true;
      return;
    }

    if (this.receptionRole === this.permissionRole.label) {
      hasReception = true;
    }

    console.log("Payment mode is " + this.paymentMode);

    if (this.paymentMode === "cash") {
      paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
      paymentType = Payment.PAYMENT_TYPE_CASH;
    } else if (this.paymentMode === "Others") {
      if (!this.otherTransactionType) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Please Select payment mode";
        this.showMessage = true;
        return;
      }

      paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
      paymentType = this.otherTransactionType;
    } else {
      paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
      paymentType = Payment.PAYMENT_TYPE_MOBILE;
    }

    ($("#packageSummayModal") as any).modal("hide");

    this.basketRequest = new BasketRequest();
    this.basketRequest.bookingSource = 3;
    this.basketRequest.transactionType = paymentType;
    this.basketRequest.transactionId = this.transactionId;
    console.log(
      "PaymentStatus: " +
      paymentStatus +
      "----transactionType-----" +
      paymentType +
      "-----transactionId------" +
      this.basketRequest.transactionId
    );

    this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selectedProfile.relationShipId;

    this.basketRequest.cartItemList = new Array<CartItem>();
    this.basketRequest.cartItemList[0] = new CartItem();
    this.basketRequest.cartItemList[0] = this.cartItemList[0];
    this.basketRequest.cartItemList[0].paymentSource = 3;
    this.basketRequest.cartItemList[0].parentProfileId = this.basketRequest.parentProfileId;
    if (this.selectedpackage.packageSubType === this.PACKAGE_SUB_TYPE_FAMILY) {
      this.basketRequest.cartItemList[0].patientProfileId = this.basketRequest.parentProfileId;
    } else {
      this.basketRequest.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    }
    this.basketRequest.cartItemList[0].bookingPocId = this.pocId;
    this.basketRequest.cartItemList[0].pocId = this.pocId;
    this.basketRequest.cartItemList[0].brandId = this.brandId;
    if (this.selectedDoctor !== undefined && this.selectedDoctor != null) {
      this.basketRequest.cartItemList[0].doctorId = this.selectedDoctor.empId;
      // this.basketRequest.cartItemList[0].empId = this.empId;
      this.basketRequest.cartItemList[0].serviceId = this.selectedDoctor.serviceId;
    }

    if (!hasReception || paymentType === Payment.PAYMENT_TYPE_MOBILE) {
      this.basketRequest.cartItemList[0].addToConsultationQueue = true;

      // If the role is not reception role or if the payment type is mobile, call Initiate payment
      this.diagnosticService
        .initiatePayment(this.basketRequest)
        .then((data) => {
          this.basketRequest = new BasketRequest();
          this.basketRequest = data;

          console.log("basketreq--->" + JSON.stringify(this.basketRequest));
          if (
            data.cartItemList[0].statusCode === 201 ||
            data.cartItemList[0].statusCode === 200
          ) {
            this.errorMessage = new Array<string>();
            if (paymentType === Payment.PAYMENT_TYPE_MOBILE) {
              this.errorMessage[0] =
                "Mobile payment successfully initiated for the purchase.";
            } else {
              this.errorMessage[0] = data.cartItemList[0].statusMessage;
            }
            this.isError = false;
            this.showMessage = true;
          } else {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = data.cartItemList[0].statusMessage;
            this.isError = true;
            this.showMessage = true;
          }
        });
    } else if (
      hasReception &&
      (paymentType === Payment.PAYMENT_TYPE_CASH ||
        paymentType === Payment.PAYMENT_TYPE_CARD)
    ) {
      // If the role is reception and payment mode is cash, add to payment queue
      this.basketRequest.cartItemList[0].addToConsultationQueue = true;
      if (this.paymentMode === "cash" || this.paymentMode === "card") {
        this.diagnosticService
          .initiatePayment(this.basketRequest)
          .then((data) => {
            this.basketRequest = new BasketRequest();
            this.basketRequest = data;
            if (
              data.cartItemList[0].statusCode === 201 ||
              data.cartItemList[0].statusCode === 200
            ) {
              console.log("success-------------");
              this.errorMessage = new Array<string>();
              this.errorMessage[0] = "Add to Payment Queue.";
              this.isError = false;
              this.showMessage = true;
              ($("#packageSummayModal") as any).modal("hide");
            } else {
              console.log("fails-------------");
              this.errorMessage = new Array<string>();
              this.errorMessage[0] = this.paymentResponse.statusMessage;
              this.isError = true;
              this.showMessage = true;
              ($("#packageSummayModal") as any).modal("hide");
            }
          });
      }
    }
    ($("#myModal") as any).modal("show");
    let slPkgIndex = this.packageList.findIndex((e) => {
      return e.packageId == this.selectedpackage.packageId;
    });
    this.onViewPackage(this.selectedpackage, slPkgIndex, false);
  }
}

// $(document).ready(function () {
//   $('.modal').on('hidden.bs.modal', function (e) {
//     if ($('.modal').hasClass('in')) {
//       $('body').addClass('modal-open');
//     }
//   });

// });
