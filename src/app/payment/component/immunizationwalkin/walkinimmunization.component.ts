import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../base/util/common-util';
import { Config } from '../../../base/config';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { Taxes } from '../../../model/basket/taxes';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { DiscountType } from '../../../model/package/discountType';
import { BaseGenericMedicine } from '../../../model/pharmacy/baseGenericMedicine';
import { Pharmacy } from '../../../model/pharmacy/pharmacy';
import { PackageService } from '../../../packages/package.service';
import { AuthService } from './../../../auth/auth.service';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { CartItem } from './../../../model/basket/cartitem';
import { Payment } from './../../../model/basket/payment';
import { DoctorDetails } from './../../../model/employee/doctordetails';
import { PaymentType } from './../../../model/payment/paymentType';
import { SelectedRegisteredProfile } from './../../../model/profile/selectedRegisteredProfile';
import { PaymentService } from './../../payment.service';


@Component({
  selector: 'walkinimmunization_component',
  templateUrl: './walkinimmunization.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./walkinimmunization.style.scss']
})
export class WalkinImmunizationComponent implements OnInit, OnDestroy {
  immunizationAdviseTrack: BasketRequest;
  startdate: Date;
  datepickerOpts = {
    startDate: new Date(2016, 5, 10),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'D, d MM yyyy'
  }
  otherDiscountAmount: number = 0;
  otherDiscountAmountPer: number = 0;
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  componentId: string = 'myModal1';
  errorMessage: Array<string>;
  selectedUserPackageId: number = 0;
  isOtherDiscountFullPaymentHide: boolean = false;
  isOtherDiscountEditBoxHide: boolean = true;
  isError: boolean;
  showMessage: boolean;
  showMessage1: boolean;
  brandId: number;
  searchTerm: string;
  cartItemList: CartItem[] = new Array<CartItem>();
  cartItemSearchList: any[] = new Array<any>();
  searchItemsTotal: number;
  cartItem: CartItem = new CartItem();
  selectedCartItem: any;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  totalAmount: number;
  discountAmount: number = 0;
  selectedGlobalPackageId: number = 0;
  discountPercent: number = 0;
  paymentModeIndex: number = 2;
  empId: any;
  searchedTests: any;
  searchedTestAmount: any = null;
  immunizationName: string;
  pocId: any;
  bookingSource: any;
  pdfHeaderType: number;
  isErrorCheck: boolean = false;
  pocName: string;
  doctorFirstName: string
  doctorLastName: string;
  cgst: number = 0;
  sgst: number = 0;
  igst: number = 0;
  selectOthers: boolean = true;

  sgstAmount: number = 0;
  cgstAmount: number = 0;
  igstAmount: number = 0;
  totalTaxationAmount: number = 0;
  tot_taxes: number = 0;
  amtWithotTaxes: number = 0;
  isOtherDiscountCashPaymentHide: boolean = false;
  selectedPackageId: number = 0;
  dropDownIndex: number = 0;
  packageNames: string[];
  key: any;
  packageNamesShow: Boolean = false;
  bookedPackageList: BookedPackageResponse[] = new Array();
  basketResponse: BasketRequest;
  transactionId: any;
  selectColumns: any[] = [
    {
      variable: 'genericMedicine.genericMedicineName',
      filter: 'text'
    }
  ];
  discountType: number = DiscountType.TYPE_IMMUNIZATION;
  currencySymbol: string = '';

  constructor(private paymentService: PaymentService, private router: Router,
    private auth: AuthService, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private packageService: PackageService,
    private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
    this.isError = this.paymentService.isError;
    this.errorMessage = this.paymentService.errorMessage;
    this.showMessage = this.paymentService.showMessage;
    this.pocId = auth.userAuth.pocId;
    this.pocName = auth.userAuth.pocName;
    this.brandId = auth.userAuth.brandId;
    this.immunizationAdviseTrack = new BasketRequest();
    this.immunizationAdviseTrack.cartItemList = new Array<CartItem>();
    this.immunizationAdviseTrack.cartItemList[0] = new CartItem();
    this.immunizationAdviseTrack.cartItemList[0].pocId = this.pocId;
    this.immunizationAdviseTrack.cartItemList[0].bookingSource = this.immunizationAdviseTrack.bookingSource = 3; // public static final int BOOKING_SOURCE_PARTNER_PORTAL = 3;
    this.immunizationAdviseTrack.cartItemList[0].paymentSource = 3;
    this.immunizationAdviseTrack.cartItemList[0].cartItemType = CartItem.CART_ITEM_TYPE_IMMUNISATION;
    this.immunizationAdviseTrack.cartItemList[0].empId = auth.userAuth.employeeId;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.searchedTests = new Array();
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
  }

  ngOnInit() {
    this.disableMouseScroll();
  }

  remove(index: number): void {
    this.cartItemList[0].pharmacyList.splice(index, 1);
    this.immunizationAdviseTrack.cartItemList[0].pharmacyList = this.cartItemList[0].pharmacyList;
    let tempCart = this.immunizationAdviseTrack.cartItemList[0];
    this.immunizationAdviseTrack.cartItemList[0] = { ...tempCart };

    this.searchedTestAmount = 0;
  }

  onFinalSubmit(): void {
    this.isErrorCheck = false;
    if (!this.selectedRegisteredProfile.selfProfile.fName) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select a Patient First";
      this.showMessage = true;
      return;
    }
    if (!this.doctorFirstName) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Doctor Name First";
      this.showMessage = true;
      return;
    }

    if (this.immunizationAdviseTrack.cartItemList.length > 0) {
      if (this.immunizationAdviseTrack.cartItemList[0].pharmacyList == undefined || this.immunizationAdviseTrack.cartItemList[0].pharmacyList.length <= 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Add atleast one test";
        this.showMessage = true;
        return;
      }
      if (this.immunizationAdviseTrack.cartItemList[0].pharmacyList && this.immunizationAdviseTrack.cartItemList[0].pharmacyList.length > 0) {
        this.immunizationAdviseTrack.cartItemList[0].pharmacyList.forEach(service => {
          if (service.grossPrice == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Amount cannot be zero";
            this.showMessage = true;
            return;
          }
        })
      }
      else {
        this.immunizationAdviseTrack.cartItemList[0].pharmacyList = this.cartItemList[0].pharmacyList;
      }

      if (this.isErrorCheck) {
        return;
      }
      if (this.otherDiscountAmountPer > 100 || this.otherDiscountAmountPer < 0) {
        return;
      }
      this.immunizationAdviseTrack.cartItemList[0].doctorDetail = new DoctorDetails();
      this.immunizationAdviseTrack.cartItemList[0].doctorDetail.firstName = this.doctorFirstName;
      this.immunizationAdviseTrack.cartItemList[0].doctorDetail.lastName = this.doctorLastName;
      this.immunizationAdviseTrack.cartItemList[0].doctorId = 0;
      if (this.paymentModeIndex == 1) {
        if (!this.immunizationAdviseTrack.transactionType) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }

        this.immunizationAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType;
        this.immunizationAdviseTrack.transactionId = this.immunizationAdviseTrack.cartItemList[0].payment.transactionId = this.transactionId;
      } else if (this.paymentModeIndex == 2) {
        this.immunizationAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.immunizationAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      this.immunizationAdviseTrack.cartItemList[0].brandId = this.brandId;
      this.immunizationAdviseTrack.createdTimestamp = new Date().getTime();
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.spinnerService.start();
      this.diagnosticService.initiatePayment(this.immunizationAdviseTrack).then(
        response => {
          this.spinnerService.stop();
          if (response != null && response != undefined) {
            this.immunizationAdviseTrack = response;
            if (this.paymentModeIndex == 5) {
              if (response.statusCode == 200) {
                this.gotoImmunizationOrderList();
              }
            } else {
              this.gotoImmunizationInvoice();
            }
          } else {
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = 'Error occurred while updating the payment status!';
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
      this.isErrorCheck = true;
    }
  }

  gotoImmunizationOrderList(): void {
    this.router.navigate(['/app/payment/immunization']);
  }

  gotoImmunizationInvoice() {
    this.router.navigate(['/app/payment/immuneinvoice']);
  }

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.immunizationAdviseTrack.transactionType = this.immunizationAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_UPI;
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

  searchTests(key) {
    this.key = key;
    if (key.length > 2) {
      this.paymentService.getSearchedImmunization(key, this.pocId).then((cartItemImmunization) => {
        this.cartItemSearchList = cartItemImmunization;
        this.searchItemsTotal = this.cartItemSearchList.length;
        this.searchedTests = cartItemImmunization;
        this.commonUtil.sleep(700);
        if (this.searchedTests.length < 1) {
          this.selectedCartItem = new Pharmacy();
          this.selectedCartItem.genericMedicine = new BaseGenericMedicine;
          this.selectedCartItem.genericMedicine.genericMedicineName = this.key;
        }
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      })

    }

  }

  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.genericMedicine.genericMedicineName == this.cartItemSearchList[i].genericMedicine.genericMedicineName) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }
    this.key = this.selectedCartItem.genericMedicine.genericMedicineName;

  }

  onChangeAmount(): void {
    let tempCart = this.immunizationAdviseTrack.cartItemList[0];
    tempCart.pharmacyList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.immunizationAdviseTrack.cartItemList[0] = { ...tempCart }
  }

  onChangeTest(): void {
    (<any>$("#myModal2")).modal("show");
    $(".modal-backdrop").not(':first').remove();
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage1 = false;
    if (this.cartItemList[0] != undefined || this.cartItemList[0] == undefined) {
      this.searchedTestAmount = null;
      $("hs-select>div>input").val("");
    }
  }
  onKeydown(event) {
    this.key = "";
  }

  addNewTest(): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage1 = false;
    if (this.key == undefined || this.key == null || this.key == "" || this.key.length < 2) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Immunization Name";
      this.showMessage1 = true;
      return;
    }
    else if (this.searchedTestAmount == undefined || this.searchedTestAmount == null || this.searchedTestAmount == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Amount";
      this.showMessage1 = true;
      return;
    }
    else if (this.cartItemList[0] != undefined) {
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length] = new Pharmacy();
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].genericMedicine = new BaseGenericMedicine();
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].genericMedicine.genericMedicineId = this.selectedCartItem.genericMedicine.genericMedicineId;
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].genericMedicine.genericMedicineName = this.key;
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].quantity = 1;
      this.cartItemList[0].pharmacyList[this.cartItemList[0].pharmacyList.length - 1].netPrice = this.searchedTestAmount;
    } else {
      this.cartItemList[0] = new CartItem();
      this.cartItemList[0].pharmacyList = new Array<Pharmacy>();
      this.cartItemList[0].pharmacyList[0] = new Pharmacy();
      this.cartItemList[0].pharmacyList[0].genericMedicine = new BaseGenericMedicine();
      this.cartItemList[0].pharmacyList[0].genericMedicine.genericMedicineId = this.selectedCartItem.genericMedicine.genericMedicineId;
      this.cartItemList[0].pharmacyList[0].genericMedicine.genericMedicineName = this.selectedCartItem.genericMedicine.genericMedicineName = this.key;
      this.cartItemList[0].pharmacyList[0].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].pharmacyList[0].netPrice = this.searchedTestAmount;
      this.cartItemList[0].pharmacyList[0].quantity = 1;

    }

    //making object mutable to update in child component
    let tempCartItem = this.immunizationAdviseTrack.cartItemList[0];
    tempCartItem.isReset = true;
    this.immunizationAdviseTrack.cartItemList[0] = { ...tempCartItem };

    this.cartItem = new CartItem();
    for (let i = 0; i < this.cartItemList[0].pharmacyList.length; i++) {
      this.cartItemList[0].pharmacyList[i].taxes = new Taxes();
      this.cartItemList[0].pharmacyList[i].taxes.sgst = this.sgst;
      this.cartItemList[0].pharmacyList[i].taxes.cgst = this.cgst;
      this.cartItemList[0].pharmacyList[i].taxes.igst = this.igst;
      this.cartItemList[0].pharmacyList[i].taxes.sgstAmount = this.sgstAmount;
      this.cartItemList[0].pharmacyList[i].taxes.cgstAmount = this.cgstAmount;
      this.cartItemList[0].pharmacyList[i].taxes.igstAmount = this.igstAmount;
    }
    this.immunizationAdviseTrack.cartItemList[0].pharmacyList = this.cartItemList[0].pharmacyList;

    this.key = "";
    (<any>$('#myModal2')).modal('hide');
    this.cd.detectChanges();
  }

  checkPaymentModeSelection(index: number) {
    if (index == 1) {
      this.selectOthers = true;
    }
    else {
      this.selectOthers = false;
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    this.paymentModeIndex = index;
  }

  saveSelectedProfile() {
    this.immunizationAdviseTrack.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.immunizationAdviseTrack.cartItemList[0].parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.immunizationAdviseTrack.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.immunizationAdviseTrack.cartItemList[0].patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
  }

  onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    this.saveSelectedProfile();
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

  ngOnDestroy(): void {
    if (this.immunizationAdviseTrack != undefined && this.immunizationAdviseTrack != null) {
      this.paymentService.immunizationAdviseTrack = this.immunizationAdviseTrack.cartItemList[0];

    }
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

  closeModel(id: string) {
    $(id).on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    (<any>$(id)).modal('hide');
  }
}
