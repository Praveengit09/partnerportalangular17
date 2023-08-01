import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { Config } from '../../../../base/config';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { ProfileDetailsVO } from '../../../../model/profile/profileDetailsVO';
import { AuthService } from './../../../../auth/auth.service';
import { BasketRequest } from './../../../../model/basket/basketRequest';
import { CartItem } from './../../../../model/basket/cartitem';
import { Payment } from './../../../../model/basket/payment';
import { ReportResponse } from './../../../../model/common/reportResponse';
import { Doctor } from './../../../../model/employee/doctor';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { DiscountType } from './../../../../model/package/discountType';
import { BaseGenericMedicine } from './../../../../model/pharmacy/baseGenericMedicine';
import { Pharmacy } from './../../../../model/pharmacy/pharmacy';
import { PocAdviseData } from './../../../../model/poc/poc-advise-data';
import { SelectedRegisteredProfile } from './../../../../model/profile/selectedRegisteredProfile';
import { PackageService } from './../../../../packages/package.service';
import { PharmacyService } from './../../../pharmacy.service';
import { Taxes } from './../../../../model/basket/taxes';





@Component({
  selector: 'newadvicedetails-component',
  templateUrl: './newadvicedetails.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./newadvicedetails.style.scss']
})

export class NewPharmacyAdviceDetailComponent implements OnInit, OnDestroy {

  @Input('inPatient') public inPatient!: boolean;

  errorMessage: Array<string>;
  isError: boolean;
  // isErrorCheck: boolean = false;
  showMessage: boolean;
  label: string = '';
  priceChange: boolean = false;

  basketRequest: BasketRequest = new BasketRequest();

  bookedPackageList: BookedPackageResponse[] = new Array();
  reportResponse: ReportResponse;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();

  packageNames: string[];

  discountAmount: number = 0;
  selectedGlobalPackageId: number = 0;

  selectedPackageId: number = 0;
  discountPercent: number = 0;
  paymentModeIndex: number = 2;
  transactionId: string = '';
  pocId: any;
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  dropDownIndex: number = 0;
  city: number;
  brandId: number;
  doctorName: string;
  pdfHeaderType: number;
  otherDiscountAmount: number = 0;
  otherDiscountAmountPer: number = 0;
  isOtherDiscountCashPaymentHide: boolean = false;
  totalTaxationAmount: number = 0;
  empId: any;
  packageNamesShow: Boolean = false;
  tempCalculatedValueOfOrder: any;
  isDiscountError: boolean = false;
  discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
  isReset: boolean = false;
  cartItemType: number = CartItem.CART_ITEM_TYPE_PHARMACY;
  configAppId: number;
  triggerCount: number;
  doctorDetails: Doctor = new Doctor();
  enableInPatientBilling: boolean = false;



  constructor(private pharmacyService: PharmacyService, private packageService: PackageService,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService, private validation: ValidationUtil,
    private commonUtil: CommonUtil, private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
    this.pharmacyService.pharmacyList = new Array();
    this.validation = validation;
    this.isError = this.pharmacyService.isError;
    this.errorMessage = this.pharmacyService.errorMessage;
    this.showMessage = this.pharmacyService.showMessage;
    if (authService.selectedPocDetails && authService.selectedPocDetails.pocId && authService.selectedPocDetails.address) {
      this.city = authService.selectedPocDetails.address.city;
    }
    if (authService.selectedPOCMapping && authService.selectedPOCMapping.pocId && authService.selectedPOCMapping) {
      this.pocId = authService.selectedPOCMapping.pocId;
    }
    this.brandId = authService.userAuth.brandId;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.empId = authService.userAuth.employeeId;
    this.configAppId = Config.portal.appId;

    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.enableInPatientBilling) {
      this.enableInPatientBilling = Config.portal.specialFeatures.enableInPatientBilling;
    }



  }

  ngOnInit() {

    let cryptoUtil: CryptoUtil = new CryptoUtil();

    if (this.showMessage) {
      console.log("checking -----", this.showMessage, JSON.stringify(this.pharmacyService.pharmacyAdviseTrack));
      this.basketRequest.cartItemList.push(this.pharmacyService.pharmacyAdviseTrack);
      this.pharmacyService.pharmacyList = this.basketRequest.cartItemList[0].pharmacyList;
      this.triggerCount = new Date().getTime();
      this.showMessage = !this.showMessage;
      this.doctorPatientDetailsChanged();
    }
    else if (window.localStorage.hasOwnProperty('cartItem') == true) {
      this.basketRequest.cartItemList[0] = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('cartItem')));
      this.pharmacyService.pharmacyList = this.basketRequest.cartItemList[0].pharmacyList;
      this.triggerCount = new Date().getTime();
      this.showMessage = !this.showMessage;
      this.doctorPatientDetailsChanged();
      console.log("basketrequest---", JSON.stringify(this.basketRequest.cartItemList[0]));
    }
    else {
      let pharmacy = new Pharmacy();
      pharmacy.genericMedicine = new BaseGenericMedicine();
      let cartItem = new CartItem();
      cartItem.pharmacyList = new Array<Pharmacy>();
      cartItem.pharmacyList.push(pharmacy);
      cartItem.doctorDetail = new DoctorDetails();
      cartItem.patientProfileDetails = new ProfileDetailsVO();
      cartItem.pharmacyList = new Array<Pharmacy>()

      this.basketRequest.cartItemList = new Array<CartItem>();
      this.basketRequest.cartItemList.push(cartItem);
      this.basketRequest.cartItemList[0].cartItemType = CartItem.CART_ITEM_TYPE_PHARMACY;
      this.pharmacyService.pharmacyList = cartItem.pharmacyList;
      this.paymentModeIndex = cartItem.payment.transactionType || Payment.PAYMENT_TYPE_CASH;
      this.inPatient == true ? this.InPatientChanged() : "";
    }

  }



  getPopUp(item) {
    alert(item);
  }
  async checkEmptyMedicineName() {
    let ret_value: boolean = true;
    let emptyArray = new Array();
    await this.basketRequest.cartItemList[0].pharmacyList.forEach((e, i) => {
      if (!e.batchNumberTemp && !e.originalAmount) {
        // && charCode == 8
        emptyArray.push(i);
        ret_value = false;
      }
      else if (!e.batchNumberTemp) {
        alert('Select batch of ' + e.productName);
        ret_value = false;
      }
    });
    if (!ret_value) {
      let temp;
      for (let i = emptyArray.length; i > 0; i--) {
        temp = this.basketRequest.cartItemList[0].pharmacyList.splice(emptyArray[i - 1], 1);
      }
      this.pharmacyService.pharmacyList = this.basketRequest.cartItemList[0].pharmacyList = temp;
    }
    return ret_value;
  }

  validateItem(event, type?) {
    event = (event) ? event : window.event;
    var charCode = (event.which) ? event.which : event.keyCode;
    if (type == 'decimal') {
      return this.validation.decimalValueforTwoCharacters(event)
    }
    else if (type == 'numbers') {
      return this.validation.onlyNumbers(event)
    }
    else
      return false;
  }

  setSelectedDoctorDetails(doctorDetails: DoctorDetails) {
    this.basketRequest.cartItemList[0].doctorDetail.firstName = doctorDetails.firstName;
    this.basketRequest.cartItemList[0].doctorDetail.lastName = doctorDetails.lastName;
    this.basketRequest.cartItemList[0].doctorDetail.title = doctorDetails.title ? doctorDetails.title : "";
  }

  doctorPatientDetailsChanged() {
    this.selectedRegisteredProfile.selectedProfile.title = this.basketRequest.cartItemList[0].patientProfileDetails.title;
    this.selectedRegisteredProfile.selectedProfile.fName = this.basketRequest.cartItemList[0].patientProfileDetails.fName;
    this.selectedRegisteredProfile.selectedProfile.lName = this.basketRequest.cartItemList[0].patientProfileDetails.lName;
    this.doctorDetails.title = this.basketRequest.cartItemList[0].doctorDetail.title
    this.doctorDetails.doctorName = this.basketRequest.cartItemList[0].doctorDetail.title + " " + this.basketRequest.cartItemList[0].doctorDetail.firstName + " " + this.basketRequest.cartItemList[0].doctorDetail.lastName;
    this.doctorDetails.lastName = this.basketRequest.cartItemList[0].doctorDetail.lastName;
  }
  async onCalculateEvent(calculatedValue) {
    this.tempCalculatedValueOfOrder = calculatedValue;
    let cartItemList = this.basketRequest.cartItemList[0];
    cartItemList.isReset = this.tempCalculatedValueOfOrder.reset;

    this.basketRequest.cartItemList[0] = { ...cartItemList };
    this.priceChange = true;

    await this.cd.detectChanges();
  }

  // InPatientChanged() {
  //   if (this.basketRequest.cartItemList[0].inPatientBilling) this.checkPaymentModeSelection(5);
  //   else this.checkPaymentModeSelection(2);
  //   this.basketRequest.cartItemList[0].inPatientBilling = !this.basketRequest.cartItemList[0].inPatientBilling;
  // }

  InPatientChanged() {
    this.basketRequest.cartItemList[0].inPatientBilling = true;
    this.checkPaymentModeSelection(5);

  }

  onclickNext() {
    window.scroll(0, 0);
    if (this.priceChange)
      this.basketRequest.cartItemList[0].pharmacyList = this.pharmacyService.pharmacyList.slice();
    this.basketRequest.cartItemList[0].brandId = this.brandId;

    if (this.basketRequest.cartItemList[0].pharmacyList.length < 1) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "You haven't added any medicines to your advice. Please add a medicine to create your advice.";
      this.showMessage = true;
      return;
    }
    if (!this.selectedRegisteredProfile.selectedProfile.fName) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter patient details";
      this.showMessage = true;
      return;
    }
    if (!this.basketRequest.cartItemList[0].doctorDetail.firstName) {
      this.isError = true;
      this.errorMessage = new Array();
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.errorMessage[0] = "Please enter doctor name";
      this.showMessage = true;
      return;
    }
    if (this.paymentModeIndex == 0 || this.paymentModeIndex == 9) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select a payment mode";
      this.showMessage = true;
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    let isErrorFound: boolean = false;
    this.basketRequest.cartItemList[0].pharmacyList.forEach((element, i) => {
      element.isErrorMsg = this.errorMessage = new Array();
      if (!element.productName && !element.productId && !element.genericMedicine.genericMedicineName) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Please Provide Medicine Details";
        return;
      }
      // if (!element.productId || element.productId <= 0) {
      //   isErrorFound = element.isErrorFound = true;
      //   element.isErrorMsg[0] = element.productName + " does not exist";
      //   return;
      // }

      if (!element.quantity || element.quantity <= 0) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Quantity cannot be zero";
        return;
      }

      if (!Config.portal.specialFeatures.enableZeroPriceBilling && (!element.grossPrice || element.grossPrice <= 0)) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Price cannot be zero";
        return;
      }

      let enableStockValidation = false;
      if (Config.portal && Config.portal.pharmacyOptions && Config.portal.pharmacyOptions.enableStockValidation) {
        enableStockValidation = true;
      }

      if (enableStockValidation && (!element.stockDetails.batchNo || element.stockDetails.batchNo.trim() == "")) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Please Select Batch Number";
        return;
      }
      if (enableStockValidation && (!element.stockDetails || !element.stockDetails.expiryDate || element.stockDetails.expiryDate < new Date().getTime())) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Please Check Medicine Already Expired";
        return;
      }
      // if (enableStockValidation && (!element.productCode)) {
      //   isErrorFound = element.isErrorFound = true;
      //   element.isErrorMsg[0] = "Please fill all Product Codes";
      //   return;
      // }
      if (!element.productName) {
        isErrorFound = element.isErrorFound = true;
        element.isErrorMsg[0] = "Please fill all Product Names";
        return;
      }
      // if (!element.genericMedicine.genericMedicineName) {
      //   isErrorFound = element.isErrorFound = true;
      //   element.isErrorMsg[0] = "Please fill all Compositions";
      //   return;
      // }

      // if (element.stockDetails.totalAvailableQuantity > 0 && element.quantity > element.stockDetails.totalAvailableQuantity) {
      //   isErrorFound = element.isErrorFound = true;
      //   element.isErrorMsg[0] = "Don't have enough items in stock for " + element.productName;
      //   return;
      // }

    });
    if (isErrorFound) {
      return;
    }
    if (this.isError && this.showMessage) {
      return;
    }

    this.basketRequest.cartItemList[0].pharmacyList.forEach((element, i) => {
      delete element.isErrorFound;
      delete element.isErrorMsg;
    });

    if (this.otherDiscountAmountPer < 0 || this.otherDiscountAmountPer > 100) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Discount has to be in the range of 0 to 100%";
      this.showMessage = true;
      return;
    }

    this.basketRequest.cartItemList[0].pharmacyList.forEach(element => {
      if (element.stockDetails.expiryDate) {
        if (element.stockDetails.expiryDate instanceof Date)
          element.stockDetails.expiryDate = element.stockDetails.expiryDate.getTime();
      }
    });

    let pocAdviseData: PocAdviseData = new PocAdviseData();
    pocAdviseData.pocId = this.authService.selectedPocDetails.pocId;
    pocAdviseData.pocName = this.authService.selectedPocDetails.pocName;

    this.basketRequest.cartItemList[0].pocId = this.authService.selectedPocDetails.pocId;
    this.basketRequest.cartItemList[0].doctorDetail.title = "Dr.";
    this.basketRequest.cartItemList[0].actualDate = new Date().getTime();
    this.basketRequest.cartItemList[0].empId = this.empId;

    if (this.selectedPackageId > 0) {
      this.basketRequest.cartItemList[0].userPackageId = this.selectedPackageId;
    }

    this.pharmacyService.pharmacyAdviseTrack = { ...this.basketRequest.cartItemList[0] };
    console.log('inPatient', this.inPatient);
    this.inPatient == true ? this.router.navigate(['/app/pharmacy/inpatientorders/ordersummary']) : this.router.navigate(['/app/pharmacy/advice/ordersummary']);
  }

  gotoPharmacyOrderList(): void {

    this.inPatient == true ? this.router.navigate(['/app/pharmacy/inpatientorders/list']) : this.router.navigate(['/app/pharmacy/orders']);


  }

  gotoPharmacyInvoice() {
    this.router.navigate(['/app/pharmacy/advice/invoice']);
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
  }

  onPaymentChange(index: number) {
    console.log('Value is ' + index)
  }

  onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    console.log("Selected profile in onRegisterNewUser--->" + JSON.stringify(this.selectedRegisteredProfile));
    this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.basketRequest.cartItemList[0].patientProfileId =
      this.selectedRegisteredProfile.selectedProfile.profileId;
    if (this.selectedRegisteredProfile.selectedProfile.contactInfo != undefined
      && this.selectedRegisteredProfile.selectedProfile.contactInfo != null
      && this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile != undefined
      && this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile != null) {
      this.basketRequest.cartItemList[0].patientProfileDetails.contactInfo.mobile =
        this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile;
    } else {
      this.basketRequest.cartItemList[0].patientProfileDetails.contactInfo.mobile =
        this.selectedRegisteredProfile.selfProfile.contactInfo.mobile;
    }
    this.basketRequest.cartItemList[0].patientRelationship =
      this.selectedRegisteredProfile.selectedProfile.relationShip;
    this.basketRequest.cartItemList[0].patientProfileDetails.title =
      this.selectedRegisteredProfile.selectedProfile.title;
    this.basketRequest.cartItemList[0].patientProfileDetails.fName =
      this.selectedRegisteredProfile.selectedProfile.fName;
    this.basketRequest.cartItemList[0].patientProfileDetails.title =
      this.selectedRegisteredProfile.selectedProfile.title;
    this.basketRequest.cartItemList[0].patientProfileDetails.lName =
      this.selectedRegisteredProfile.selectedProfile.lName ? this.selectedRegisteredProfile.selectedProfile.lName : '';
    this.basketRequest.cartItemList[0].patientProfileDetails.gender =
      this.selectedRegisteredProfile.selectedProfile.gender;
    this.basketRequest.cartItemList[0].patientProfileDetails.age =
      this.selectedRegisteredProfile.selectedProfile.age;
    this.basketRequest.cartItemList[0].parentProfileId =
      this.selectedRegisteredProfile.selfProfile.relationShipId;
    // this.getPharmacyPackages();
  }

  validateDecimalValue(evt) {
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
    return false;
  }

  ngOnDestroy(): void {
    this.pharmacyService.isError = false;
    this.pharmacyService.showMessage = false;

    if (this.basketRequest != undefined && this.basketRequest != null) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();

      this.pharmacyService.pharmacyAdviseTrack = this.basketRequest.cartItemList[0];
      if (Config.portal.specialFeatures.enableZeroPriceBilling) {
        this.pharmacyService.pharmacyAdviseTrack.pharmacyList.forEach(element => {
          element.taxes = new Taxes();
          element.totalTaxes.cgst = 0;
          element.totalTaxes.sgst = 0;
          element.totalTaxes.igst = 0;
          element.taxes.igstAmount = 0;
          element.taxes.cgstAmount = 0;
          element.taxes.sgstAmount = 0;
        });
      }
      window.localStorage.setItem('cartItem', cryptoUtil.encryptData(JSON.stringify(this.pharmacyService.pharmacyAdviseTrack)));
      console.log("ngOnDestroy: ", this.pharmacyService.pharmacyAdviseTrack);
    }
    this.pharmacyService.pharmacyList = null;
  }

  roundToTwo(num) {
    num = num + "e+2";
    return +(Math.round(num) + "e-2");
  }

  closeModel(id: string) {
    $(id).on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    (<any>$(id)).modal('hide');
  }
  checkFinalAmount() {
    return this.basketRequest.cartItemList[0].payment.finalAmount > 0 && this.isOtherDiscountCashPaymentHide == false;
  }

  setInpatientNumber(event) {
    this.basketRequest.cartItemList[0].inPatientNo = event.target.value
  }

  onclickNex() {
    this.pharmacyService.cartItem = this.basketRequest.cartItemList[0];
    this.router.navigate(['/app/pharmacy/advice/ordersummary']);
  }

}
