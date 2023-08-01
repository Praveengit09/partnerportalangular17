import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Taxes } from '../../../../model/basket/taxes';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { DiscountType } from '../../../../model/package/discountType';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { OnboardingService } from '../../../../onboarding/onboarding.service';
import { AuthService } from "./../../../../auth/auth.service";
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { Payment } from './../../../../model/basket/payment';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { InvestigationTestDetails } from './../../../../model/diagnostics/investigationTestDetails';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { PaymentType } from './../../../../model/payment/paymentType';
import { PackageService } from './../../../../packages/package.service';
import { DiagnosticsService } from './../../../diagnostics.service';
import { SlotBookingDetails } from './../../../../model/basket/slotBookingDetails';

@Component({
  selector: 'advicedetail-component',
  templateUrl: './advicedetail.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./advicedetail.style.scss']
})
export class DiagnosticsAdviceDetailComponent implements OnInit, OnDestroy {

  componentId: string = 'modal-1';

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;

  errorMessageTest: Array<string>;
  isErrorTest: boolean;
  showMessageTest: boolean;

  empId: number;
  pocId: number;
  brandId: number;
  pdfHeaderType: number;

  slotItem: SlotBookingDetails = new SlotBookingDetails();
  investigationInfo: ServiceItem = new ServiceItem();

  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean = false;
  isPercent1: boolean = false;

  dropDownIndex: number = 0;
  bookedPackageList: BookedPackageResponse[] = new Array();
  discountAmount: number = 0;
  discountPercent: number = 0;

  paymentModeIndex: number = 2;

  isPackageAppliedForFullDiscount: boolean = false;
  isOtherDiscountFullPaymentHide: boolean = false;
  isOtherDiscountEditBoxHide: boolean = true;
  isOtherDiscountCashPaymentHide: boolean = false;

  otherDiscountAmount: number;
  otherDiscountAmountPer: number = 0;
  promotionalDiscountAmount: number = 0;

  searchedTests: any;
  searchTestsTotal: number = 0;
  city: number;
  isNewInvoice: boolean = true;
  isPatientDetails: boolean;
  isPaidRecord: boolean = false;
  transactionId: any;
  isReadOnly: boolean = false;
  discountType: number = DiscountType.TYPE_DIAGNOSTIC_DISCOUNT;

  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  isReset: boolean = false;
  isOldRecord: boolean = false;
  TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();
  newAdvice: boolean = false;


  selectColumns: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];

  constructor(private diagnosticsService: DiagnosticsService, private packageService: PackageService, private onboardingService: OnboardingService,
    private authService: AuthService, private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private validation: ValidationUtil, private cd: ChangeDetectorRef) {
    this.validation = validation;
    this.pocId = authService.userAuth.pocId;
    this.city = (authService.selectedPocDetails && authService.selectedPocDetails.address ? authService.selectedPocDetails.address.city : 0);
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.empId = authService.userAuth.employeeId;
    this.brandId = authService.userAuth.brandId;
    this.searchedTests = new Array();
    this.initializeslotItem();
  }

  initModal(): void {
    $("#mname").val('');
  }

  disableMouseScroll() {
    $('input[type=number]').on('mousewheel.disableScroll', function (e) {
      e.preventDefault()
    })
    $("input[type=number]").on("focus", function () {
      $(this).on("keydown", function (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
          event.preventDefault();
        }
      });
    });
  }

  ngOnInit() {
    this.disableMouseScroll();

    if (this.diagnosticsService.newAdviceDetail != undefined) {
      this.newAdvice = this.diagnosticsService.newAdviceDetail;
      this.hsLocalStorage.setData('newAdviceDetail', this.newAdvice);
    }
    else if (this.hsLocalStorage.getData('newAdviceDetail')) {
      this.newAdvice = this.hsLocalStorage.getData('newAdviceDetail');
    }

    if (!this.newAdvice && this.diagnosticsService.diagnosticsAdviseTrack) {
      this.slotItem = this.diagnosticsService.diagnosticsAdviseTrack;
      this.hsLocalStorage.setData('diagnosticsAdviseTrack', this.slotItem);
    } else if (this.hsLocalStorage && this.hsLocalStorage.getData('diagnosticsAdviseTrack')) {
      this.slotItem = this.hsLocalStorage.getData('diagnosticsAdviseTrack');
      this.diagnosticsService.diagnosticsAdviseTrack = this.slotItem;
    } else {
      this.slotItem = new SlotBookingDetails();
    }

    /* if (this.newAdvice == true) {
      window.addEventListener("beforeunload", function (e) {
        var confirmationMessage = "\o/";
        e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
        return confirmationMessage;              // Gecko, WebKit, Chrome <34
      });
    } */

    if (!this.newAdvice && this.slotItem.patientProfileDetails)
      this.isPatientDetails = true;

    if (this.newAdvice) {
      this.isNewInvoice = true;
      this.isPaidRecord = false;
      this.isOldRecord = false;
      this.slotItem.doctorDetail = new DoctorDetails();
      // this.initializeslotItem();
    } else if (!this.newAdvice && this.slotItem.doctorId > 0
      && this.slotItem.payment.paymentStatus != 2) {
      this.isNewInvoice = true;
      this.isOldRecord = false;
    } else {
      this.isNewInvoice = false;
      this.isOldRecord = true;
    }

    if (!this.isNewInvoice) {
      if (this.slotItem.basketDiscount && this.slotItem.basketDiscount.length > 0) {
        this.slotItem.basketDiscount.forEach(element => {
          if (element.type != BasketConstants.DISCOUNT_TYPE_PROMOTIONAL) {
            this.otherDiscountAmount += +element.discountAmount;
          } else {
            this.promotionalDiscountAmount += +element.discountAmount;
          }
        });
      }

      if (this.slotItem.payment.packageDiscountAmount) {
        this.discountAmount = this.slotItem.payment.packageDiscountAmount;
      }

      /* this.slotItem.bookingType = this.slotItem.bookingType ? this.slotItem.bookingType :
        SlotBookingDetails.CART_ITEM_TYPE_INVESTIGATIONS; */
      this.slotItem.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
      this.slotItem.bookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING;

      console.log("this.slotItem.serviceList: " + JSON.stringify(this.slotItem.serviceList));
      if (this.slotItem.serviceList && this.slotItem.serviceList.length > 0) {
        this.slotItem.serviceList.forEach(element => {
          if (typeof element.grossPrice == "undefined") {
            element.grossPrice = 0;
            element.netPrice = 0;
          }
        });
      }

      if (this.slotItem.payment.paymentStatus &&
        this.slotItem.payment.paymentStatus == Payment.PAYMENT_STATUS_PAID) {
        this.isPaidRecord = true;
      } else {
        this.isPaidRecord = false;
        this.getDiagnosticPOCTestAmount();
      }
    }

    if (this.slotItem.doctorId > 0 && this.slotItem.payment.paymentStatus == Payment.PAYMENT_STATUS_NOT_PAID) {
      this.isPaidRecord = false;
      this.getDiagnosticPOCTestAmount();
    }
    this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
  }


  setSelectedDoctorDetails(doctorDetails: DoctorDetails) {
    this.slotItem.doctorDetail.firstName = doctorDetails.firstName;
    this.slotItem.doctorDetail.lastName = doctorDetails.lastName ? doctorDetails.lastName : "";
    this.slotItem.doctorDetail.title = doctorDetails.title ? doctorDetails.title : "";
  }


  private initializeslotItem() {
    this.slotItem = new SlotBookingDetails();
    this.slotItem.brandId = this.brandId;
    this.slotItem.pocId = this.pocId;
    this.slotItem.bookingSource = this.slotItem.bookingSource = 3; // public static final int BOOKING_SOURCE_PARTNER_PORTAL = 3;
    this.slotItem.paymentSource = 3;
    // this.slotItem.bookingType = SlotBookingDetails.CART_ITEM_TYPE_INVESTIGATIONS;
    this.slotItem.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
    this.slotItem.bookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING;
    this.slotItem.serviceList = new Array<ServiceItem>();
    this.slotItem.payment = new Payment();
    this.slotItem.payment.taxes = new Taxes();
    this.slotItem.doctorDetail = new DoctorDetails();
  }

  saveSelectedProfile() {
    this.slotItem.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.slotItem.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.slotItem.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
    this.slotItem.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
  }

  onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    this.saveSelectedProfile();
  }

  remove(index: number): void {
    let tempCart = this.slotItem;
    tempCart.serviceList.splice(index, 1);
    this.slotItem = { ...tempCart };

    this.searchTestsTotal = 0;
  }

  onChangeTest(): void {
    this.isErrorTest = false;
    this.errorMessageTest = new Array();
    this.showMessageTest = false;
    this.investigationInfo = new ServiceItem();
    $("form>div>hs-select>div>input").val("");
  }

  addNewTest(): void {
    if (!this.investigationInfo.serviceName || this.investigationInfo.grossPrice <= 0) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "Please enter valid data";
      this.showMessageTest = true;
      return;
    } else if (Number(this.investigationInfo.grossPrice) < Number(this.investigationInfo.netPrice)) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "OfferPrice should be less than OriginalPrice";
      this.showMessageTest = true;
      return;
    }

    if (this.investigationInfo && this.investigationInfo.serviceId && this.investigationInfo.serviceId > 0) {
      this.addTestToList(this.investigationInfo);
    } else {
      let testDetails: InvestigationTestDetails = new InvestigationTestDetails();
      testDetails.pocId = this.pocId;
      testDetails.serviceId = 0;
      testDetails.serviceName = this.investigationInfo.serviceName;
      this.diagnosticsService.addNewTest(testDetails).then(response => {
        response.grossPrice = this.investigationInfo.grossPrice;
        response.netPrice = this.investigationInfo.netPrice;
        this.addTestToList(response);
      });
    }
    this.cd.detectChanges();
  }

  addTestToList(response: any) {
    console.log("Response: " + JSON.stringify(response));
    if (!this.slotItem.serviceList) {
      this.slotItem.serviceList = new Array<ServiceItem>();
    }

    let isExist = false;
    if (this.slotItem.serviceList.length >= 1) {
      this.slotItem.serviceList.forEach(item => {
        if (item.serviceId == response.serviceId) {
          isExist = true;
        }
      });
    }

    if (isExist) {
      this.isErrorTest = true;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "Test already exist";
      this.showMessageTest = true;
      return;
    } else {

      this.isErrorTest = false;
      this.errorMessageTest = new Array();
      this.errorMessageTest[0] = "Test Added successfully";
      this.showMessageTest = true;

      //making object mutable to update in child component
      let tempslotItem = this.slotItem;
      tempslotItem.isReset = true;
      this.slotItem = { ...tempslotItem };

      let serviceItem = new ServiceItem();
      serviceItem.serviceId = response.serviceId;
      serviceItem.serviceName = response.serviceName;
      serviceItem.parentServiceId = response.parentServiceId;
      serviceItem.parentServiceName = response.parentServiceName;
      serviceItem.grossPrice = response.grossPrice ? response.grossPrice : 0;
      serviceItem.discountPrice = response.discountPrice ? response.discountPrice : 0;
      serviceItem.netPrice = response.netPrice > 0 ? response.netPrice : response.grossPrice;
      serviceItem.quantity = 1;
      serviceItem.originalAmount = serviceItem.grossPrice;
      serviceItem.otherDiscountAmount = serviceItem.discountPrice;
      serviceItem.finalAmount = serviceItem.netPrice;
      this.slotItem.serviceList.push(serviceItem);
      console.log("parentServiceId"+JSON.stringify(response.parentServiceId))
    }
    setTimeout(() => {
      this.onChangeTest();
    }, 500);

  }

  onAmountChanges(value: any, index: number, isGrossPrice: boolean) {
    console.log("value: " + index + ">>>" + value)
    let tempCart = this.slotItem;
    if (isGrossPrice)
      tempCart.serviceList[index].grossPrice = value;
    else
      tempCart.serviceList[index].netPrice = value;

    console.log("Gross Price: " + tempCart.serviceList[index].grossPrice + ">>>" + tempCart.serviceList[index].netPrice);

    if (Number(tempCart.serviceList[index].grossPrice) < Number(tempCart.serviceList[index].netPrice)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "OfferPrice should be less than OriginalPrice For " + tempCart.serviceList[index].serviceName;
      this.showMessage = true;
      $('html, body').animate({ scrollTop: '0px' }, 300);
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    tempCart.serviceList.forEach((item) => {
      item.originalAmount = item.grossPrice;
      item.finalAmount = item.netPrice;
      item.otherDiscountAmount = item.discountPrice = item.originalAmount - item.finalAmount

      tempCart.payment.originalAmount = +item.originalAmount;
      tempCart.payment.finalAmount = +item.finalAmount;
    })

    if (tempCart.basketDiscount && tempCart.basketDiscount.length > 0) {
      for (let i = 0; i < tempCart.basketDiscount.length; i++) {
        if (tempCart.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_PROMOTIONAL) {
          tempCart.basketDiscount.splice(i, 1);
        }
      }
    }

    tempCart.payment.otherDiscountAmount = tempCart.payment.originalAmount - tempCart.payment.finalAmount;
    console.log("this.slotItem.payment.originalAmount: " + tempCart.payment.originalAmount + ">>>>" +
      tempCart.payment.finalAmount);
    tempCart.isReset = true;
    this.slotItem = { ...tempCart };
    this.cd.detectChanges();
  }

  onAmountChange(value: number, index: number): void {
    console.log("onAmountChange: " + value + ">>>>" + index);
    if (index >= 0) {
      this.slotItem.payment.otherDiscountAmount = this.otherDiscountAmount = 0;
      this.slotItem.payment.packageDiscountAmount = this.discountAmount = 0;
      this.slotItem.userPackageId = this.dropDownIndex = 0;
      this.slotItem.serviceList[index].originalAmount = this.slotItem.serviceList[index].finalAmount =
        this.slotItem.serviceList[index].netPrice = value;
      this.slotItem.serviceList[index].discountPrice = this.slotItem.serviceList[index].otherDiscountAmount = 0;
    } else {
      if (index == -1) {
        this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = this.investigationInfo.finalAmount = value;
      } else {
        this.investigationInfo.netPrice = value;
      }
      this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = 0;
    }
  }

  onCalculateDiscount(slotItem): void {
    console.log("slotItem"+JSON.stringify(this.slotItem))
    this.slotItem = slotItem;
  }

  onSubmit(): void {
    console.log("onSubmit: " + JSON.stringify(this.slotItem));
    this.diagnosticsService.diagnosticsAdviseTrack = this.slotItem;
    $('html, body').animate({ scrollTop: '0px' }, 300); 
    if (!this.slotItem.patientProfileId || this.slotItem.patientProfileId <= 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select a patient first";
      this.showMessage = true;
      return;
    }

    if (!this.slotItem.doctorDetail || !this.slotItem.doctorDetail.firstName) {
      this.isError = true;
      this.errorMessage = new Array();
      // $('html, body').animate({ scrollTop: '0px' }, 300);
      this.errorMessage[0] = "Please enter Doctor name";
      this.showMessage = true;
      return;
    }

    if (this.slotItem.serviceList.length > 0) {
      let isAmountIssue = false;
      let issueMsg = "";
      this.slotItem.serviceList.forEach(element => {
        console.log("element: " + JSON.stringify(element));
        if (Number(element.grossPrice) <= 0) {
          isAmountIssue = true;
          issueMsg = "OriginalAmount cannot be Zero";
          return;
        } else if (Number(element.netPrice) <= 0) {
          isAmountIssue = true;
          issueMsg = "OfferPrice cannot be Zero";
          return;
        } else if (Number(element.grossPrice) < Number(element.netPrice)) {
          isAmountIssue = true;
          issueMsg = "OfferPrice should be less than OriginalPrice For " + element.serviceName;
          return;
        }
      });

      console.log("isAmountIssue: " + isAmountIssue);
      if (isAmountIssue) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = issueMsg;
        this.showMessage = true;
        return;
      }
      if (this.slotItem.payment.originalAmount == 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Amount cannot be Zero";
        this.showMessage = true;
        return;
      }

      //Change condition
      if (this.otherDiscountAmount > (this.slotItem.payment.originalAmount - this.slotItem.payment.packageDiscountAmount -
        this.promotionalDiscountAmount)) {
        return;
      }

      // for full discount...
      if (this.paymentModeIndex == 9 || this.paymentModeIndex == 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Please Select payment mode";
        this.showMessage = true;
        return;
      }

      if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
        || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
        this.slotItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.slotItem.payment.transactionType = this.paymentModeIndex;
        this.slotItem.payment.transactionId = this.transactionId;
      } else if (this.paymentModeIndex == Payment.PAYMENT_TYPE_MOBILE) {
        this.slotItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.slotItem.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      if (!this.slotItem.createdTimestamp) {
        this.slotItem.createdTimestamp = new Date().getTime();
      }
      this.slotItem.updatedTimestamp = new Date().getTime();
      // this.slotItem.bookingType = SlotBookingDetails.CART_ITEM_TYPE_INVESTIGATIONS;
      this.slotItem.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
      this.slotItem.bookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING;
      let basketRequest: BasketRequest = new BasketRequest();
      basketRequest.orderId = this.slotItem.orderId;
      basketRequest.transactionType = this.slotItem.payment.transactionType;
      basketRequest.transactionId = this.slotItem.payment.transactionId;
      if (this.slotItem.bookingSource == undefined
        || this.slotItem.bookingSource <= 0) {
        basketRequest.bookingSource = this.slotItem.bookingSource = 3;
      } else {
        basketRequest.bookingSource = this.slotItem.bookingSource;
      }
      this.slotItem.paymentSource = 3;
      basketRequest.parentProfileId = this.slotItem.parentProfileId;
      this.slotItem.brandId = this.brandId;
      this.slotItem.empId = this.empId;
      this.slotItem.slotDate = this.commonUtil.convertOnlyDateToTimestamp(new Date());
      this.slotItem.slotTime = this.commonUtil.convertOnlyTimeToTimestamp(new Date());
      basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
      basketRequest.slotBookingDetailsList.push(this.slotItem);
      basketRequest.createdTimestamp = this.slotItem.createdTimestamp;
      basketRequest.updatedTimestamp = new Date().getTime();
      basketRequest.totalOriginalAmount = this.slotItem.payment.originalAmount;
      basketRequest.totalPackageDiscountAmount = this.slotItem.payment.packageDiscountAmount;
      basketRequest.totalOtherDiscountAmount = this.slotItem.payment.otherDiscountAmount;
      basketRequest.totalFinalAmount = this.slotItem.payment.finalAmount;

      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.diagnosticsService.initiatePayment(basketRequest).then(
        response => {
          // this.slotItem = response.slotBookingDetailsList[0];
          if (response.statusCode == 200 || response.statusCode == 201) {
            console.log("Response: ", response);
            if (response != null && response != undefined && response.slotBookingDetailsList != undefined
              && response.slotBookingDetailsList != null && response.slotBookingDetailsList.length > 0) {
              console.log("ResponseIf: ", response);
              this.spinnerService.stop();
              this.slotItem = response.slotBookingDetailsList[0];

              if (this.paymentModeIndex == 0) {
                this.gotoDiagnosticsOrderList();
              } else {
                this.gotoDiagnosticsInvoice();
              }
            }
          } else {
            this.spinnerService.stop();
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = response.statusMessage;
            this.isError = true;
            this.showMessage = true;
          }
        });
    }
    else {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Add atleast one test";
      this.showMessage = true;
    }
  }

  gotoDiagnosticsOrderList(): void {
    this.router.navigate(['/app/diagnostics/orders']);
  }

  gotoDiagnosticsInvoice() {
    this.router.navigate(['/app/diagnostics/advice/invoice']);
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

  ngOnDestroy(): void {
    if (this.slotItem != undefined && this.slotItem != null) {
      this.diagnosticsService.diagnosticsAdviseTrack = this.slotItem;
    }
  }

  validateDecimalValue(evt):boolean {
    var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
    if (!(keyCode >= 48 && keyCode <= 57)) {
      if (!(keyCode == 8 || keyCode == 9 || keyCode == 35 || keyCode == 36 || keyCode == 37 || keyCode == 39 || keyCode == 46)) {
        return false;
      }
      else {
        return true;
      }
    }
    var velement = evt.target || evt.srcElement
    var fstpart_val = velement.value;
    var fstpart = velement.value.length;
    if (fstpart.length == 2) return false; 
    var parts = velement.value.split('.');
    if (parts[0].length >= 14) return false;
    if (parts.length == 2 && parts[1].length >= 3) return false;
    else return false;
  }

  searchTests(key) {
    this.isErrorTest = false;
    this.errorMessageTest = new Array();
    this.showMessageTest = false;

    let searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 1;
    searchRequest.from = 0;
    searchRequest.id = this.pocId;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    searchRequest.size = 500;
    searchRequest.brandId = this.brandId;

    if (key.length > 2) {
      this.diagnosticsService.getSearchedTestsList(searchRequest).then((searchedTests) => {
        this.searchTestsTotal = searchedTests.length;
        this.searchedTests = searchedTests;
        if (this.searchTestsTotal > 0) {
          this.investigationInfo.serviceName = searchRequest.searchTerm;
        } else {
          this.investigationInfo.grossPrice = this.investigationInfo.netPrice = 0
          this.investigationInfo.serviceName = key;
          this.investigationInfo.serviceId = 0;
        }
        this.commonUtil.sleep(700);
      })
    }
  }

  getTestName(selectedTest) {
    this.investigationInfo = selectedTest;
    console.log("Test Price: " + JSON.stringify(this.investigationInfo));
    this.diagnosticsService.getTestAmount(selectedTest.serviceId, this.pocId, false).then(data => {
      console.log("data"+JSON.stringify(data))
     if(!this.investigationInfo.parentServiceId && data.parentServiceId)
      this.investigationInfo['parentServiceId']=data.parentServiceId;
      //console.log("Test Price: " + JSON.stringify(this.investigationInfo));
      if (data && data.netPrice > 0) {
        if (data.walkinOrderPriceDetails.dayBasedPricing) {
          data.walkinOrderPriceDetails.dayBasedPricing.forEach(day => {
            
            let currentTime = this.commonUtil.convertTimeToUTC(new Date()) + this.TIME_CONSTANT;
            if (day.dayOfWeek == this.commonUtil.convertDateToDayOfWeek(new Date())) {
              day.timeBasedPricing.forEach(timeInterval => {
                if (currentTime >= timeInterval.fromTime && currentTime < timeInterval.toTime) {
                  console.log("timeInterval: " + JSON.stringify(timeInterval));
                  this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = timeInterval.grossPrice;
                  this.investigationInfo.netPrice = this.investigationInfo.finalAmount = timeInterval.netPrice;
                  this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = timeInterval.discountPrice;
                }
              })
            }
          })
        } else if (data.walkinOrderPriceDetails) {
          this.investigationInfo.grossPrice = this.investigationInfo.originalAmount = data.walkinOrderPriceDetails.grossPrice;
          this.investigationInfo.netPrice = this.investigationInfo.finalAmount = data.walkinOrderPriceDetails.netPrice;
          this.investigationInfo.discountPrice = this.investigationInfo.otherDiscountAmount = data.walkinOrderPriceDetails.discountPrice;
        }
      }
    });
  }

  getDiagnosticPOCTestAmount() {
    if (this.slotItem.serviceList != undefined && this.slotItem.serviceList != null && this.slotItem.serviceList.length > 0) {
      this.diagnosticsService.getDiagnosticTestAmount(this.pocId, this.slotItem.adviceId).then(data => {
        let tempslotItem = this.slotItem;
        for (let i = 0; i < tempslotItem.serviceList.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (tempslotItem.serviceList[i].serviceId == data[j].serviceId) {
              tempslotItem.serviceList[i].grossPrice = data[j].grossPrice;
              tempslotItem.serviceList[i].netPrice = data[j].netPrice;
              tempslotItem.serviceList[i].discountPrice = data[j].discountPrice;
              tempslotItem.serviceList[i].finalAmount = data[j].netPrice;
              tempslotItem.serviceList[i].originalAmount = data[j].grossPrice;
              tempslotItem.serviceList[i].otherDiscountAmount = data[j].discountPrice;
              tempslotItem.serviceList[i].quantity = 1;
            }
          }
        }
        this.slotItem = { ...tempslotItem };
        console.log('After getting the price information >> ' + JSON.stringify(this.slotItem.serviceList));
      });
    }
  }
  closeModel(id: string) {
    if (this.slotItem.patientProfileId  || this.slotItem.patientProfileId > 0) {
      this.isError = false;
      this.errorMessage = new Array();
      
    }
    
    $(id).on('hidden.bs.modal', function (e) {
      if ($('body').hasClass('modal-open')) {

      } else {
        $('.modal-backdrop').remove();
      }
    });
    (<any>$(id)).modal('hide');
  }
}
