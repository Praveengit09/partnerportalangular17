import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../base/util/common-util';
import { ValidationUtil } from '../../../base/util/validation-util';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { Taxes } from '../../../model/basket/taxes';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { ServiceItem } from '../../../model/service/serviceItem';
import { PackageService } from '../../../packages/package.service';
import { AuthService } from './../../../auth/auth.service';
import { BasketRequest } from './../../../model/basket/basketRequest';
import { CartItem } from './../../../model/basket/cartitem';
import { Payment } from './../../../model/basket/payment';
import { DoctorDetails } from './../../../model/employee/doctordetails';
import { DiscountType } from './../../../model/package/discountType';
import { PaymentType } from './../../../model/payment/paymentType';
import { SelectedRegisteredProfile } from './../../../model/profile/selectedRegisteredProfile';
import { PaymentService } from './../../payment.service';
import { Config } from '../../../base/config';

@Component({
  selector: 'walkinmiscellaneous_component',
  templateUrl: './walkinmiscellaneous.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./walkinmiscellaneous.style.scss']
})
export class WalkinMiscellaneousComponent implements OnInit, OnDestroy, AfterViewInit {
  procedureAdviseTrack: BasketRequest;
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
  componentId: string = 'myModal1';
  errorMessage: Array<string>;
  brandId: number;
  selectedUserPackageId: number = 0;
  totalTaxationAmount: number = 0;
  tot_taxes: number = 0;
  amtWithotTaxes: number = 0;
  isOtherDiscountFullPaymentHide: boolean = false;
  isOtherDiscountEditBoxHide: boolean = true;
  isError: boolean;
  showMessage: boolean;
  isOtherDiscountCashPaymentHide: boolean = false;
  selectedPackageId: number = 0
  packageNames: string[];
  packageNamesShow: Boolean = false;
  bookedPackageList: BookedPackageResponse[] = new Array();
  cartItemList: CartItem[] = new Array<CartItem>();
  cartItemSearchList: ServiceItem[] = new Array<ServiceItem>();
  cartItem: CartItem = new CartItem();
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  basketResponse: BasketRequest;
  response: BasketRequest;
  totalAmount: number;
  discountAmount: number = 0;
  selectedGlobalPackageId: number = 0;
  discountPercent: number = 0;
  paymentModeIndex: number = 2;
  empId: any;
  searchedTests: any;
  pocId: any;
  pdfHeaderType: number;
  isErrorCheck: boolean = false;
  pocName: string;
  doctorFirstName: string
  doctorLastName: string;
  selectedCartItem: ServiceItem = new ServiceItem();
  searchItemsTotal: number = 0;
  key: any;
  num: number;
  dropDownIndex: number = 0;
  cgst: number = 0;
  sgst: number = 0;
  igst: number = 0;
  sgstAmount: number = 0;
  cgstAmount: number = 0;
  igstAmount: number = 0;
  isValue: boolean = false;
  isPercent: boolean = true;
  isValue1: boolean;
  isPercent1: boolean;
  Package4Original: number;
  transactionId: any;
  searchedTestAmount: any = null;
  bookingSource: any;
  selectOthers: boolean = true;
  discountType: number = DiscountType.TYPE_PROCEDURE;
  currencySymbol: string = '';
  procedurePrescriptionLabel: string = null;
  selectColumns: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];


  constructor(private paymentService: PaymentService, private router: Router, private diagnosticsService: DiagnosticsService,
    private auth: AuthService, private spinnerService: SpinnerService, private packageService: PackageService,
    private validation: ValidationUtil, private commonUtil: CommonUtil, private diagnosticService: DiagnosticsService,
    private cd: ChangeDetectorRef) {
    this.isError = this.paymentService.isError;
    this.validation = validation
    this.errorMessage = this.paymentService.errorMessage;
    this.showMessage = this.paymentService.showMessage;
    this.pocId = auth.userAuth.pocId;
    this.pocName = auth.userAuth.pocName;
    this.procedureAdviseTrack = new BasketRequest();
    this.procedureAdviseTrack.cartItemList = new Array<CartItem>();
    this.procedureAdviseTrack.cartItemList[0] = new CartItem();
    this.procedureAdviseTrack.cartItemList[0].pocId = this.pocId;
    this.procedureAdviseTrack.cartItemList[0].bookingSource = this.procedureAdviseTrack.bookingSource = 3; // public static final int BOOKING_SOURCE_PARTNER_PORTAL = 3;
    this.procedureAdviseTrack.cartItemList[0].paymentSource = 3;
    this.procedureAdviseTrack.cartItemList[0].cartItemType = CartItem.CART_ITEM_TYPE_PROCEDURE;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    this.procedureAdviseTrack.cartItemList[0].empId = auth.userAuth.employeeId;
    this.searchedTests = new Array();
    this.brandId = auth.userAuth.brandId;
    this.isPercent1 = false;
    this.isValue1 = false;
    if (Config.portal && Config.portal.currencySymbol) {
      this.currencySymbol = Config.portal.currencySymbol;
    }
    this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
  }

  ngOnInit() {
    this.disableMouseScroll();
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    this.cd.detectChanges();
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
    if (this.procedureAdviseTrack.cartItemList.length > 0) {
      if (this.procedureAdviseTrack.cartItemList[0].serviceList == undefined || this.procedureAdviseTrack.cartItemList[0].serviceList.length <= 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Add atleast one test";
        this.showMessage = true;
        return;
      }
      if (this.procedureAdviseTrack.cartItemList[0].serviceList && this.procedureAdviseTrack.cartItemList[0].serviceList.length > 0) {
        this.procedureAdviseTrack.cartItemList[0].serviceList.forEach(service => {
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
        this.procedureAdviseTrack.cartItemList[0].serviceList = this.cartItemList[0].serviceList;
      }

      if (this.isErrorCheck) {
        console.log("isErrorCheck");
        return;
      }

      this.procedureAdviseTrack.cartItemList[0].doctorDetail = new DoctorDetails();
      this.procedureAdviseTrack.cartItemList[0].doctorDetail.firstName = this.doctorFirstName;
      this.procedureAdviseTrack.cartItemList[0].doctorDetail.lastName = this.doctorLastName;
      this.procedureAdviseTrack.cartItemList[0].doctorId = 0;
      this.procedureAdviseTrack.cartItemList[0].brandId = this.brandId;
      if (this.paymentModeIndex == 1) {
        if (!this.procedureAdviseTrack.transactionType) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }

        this.procedureAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType;
        this.procedureAdviseTrack.transactionId = this.procedureAdviseTrack.cartItemList[0].payment.transactionId = this.transactionId;
      } else if (this.paymentModeIndex == 2) {
        this.procedureAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.procedureAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType;
      this.procedureAdviseTrack.transactionId = this.procedureAdviseTrack.cartItemList[0].payment.transactionId = this.transactionId;

      this.procedureAdviseTrack.createdTimestamp = new Date().getTime();
      $('html, body').animate({ scrollTop: '0px' }, 300);

      this.spinnerService.start();
      this.diagnosticService.initiatePayment(this.procedureAdviseTrack).then(
        response => {
          this.spinnerService.stop();
          if (response != null && response != undefined) {
            this.procedureAdviseTrack = response;
            if (this.paymentModeIndex == 5) {
              this.spinnerService.start();
              if (response.statusCode == 200) {
                setTimeout(() => {
                  this.spinnerService.stop();
                  this.gotoProducersOrderList();
                }, 12000)
              }
            } else {
              this.spinnerService.stop();
              this.gotoProducersInvoice();
            }
          } else {
            this.spinnerService.stop();
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
    // }}
  }

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.procedureAdviseTrack.transactionType = this.procedureAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_UPI;
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

  gotoProducersOrderList(): void {
    this.router.navigate(['/app/payment/misc']);
  }

  gotoProducersInvoice() {
    this.router.navigate(['/app/payment/miscinvoice']);
  }

  searchTests(key) {
    this.key = key;
    if (key.length > 2) {
      this.paymentService.getSearchedProcedures(key, this.pocId).then((cartItemProcedure) => {
        this.cartItemSearchList = cartItemProcedure;
        this.searchItemsTotal = cartItemProcedure.length;
        this.searchedTests = cartItemProcedure;
        this.commonUtil.sleep(700);
        if (this.searchedTests < 1) {
          this.selectedCartItem.serviceName = this.key;
        }
        else if (this.selectedCartItem.serviceName == undefined) {
          this.selectedCartItem.serviceName = this.key;
        }
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      })
    }

  }

  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.serviceName == this.cartItemSearchList[i].serviceName) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.selectedCartItem.serviceName = this.cartItemSearchList[i].serviceName;
        this.key = this.selectedCartItem.serviceName;
        this.selectedCartItem.serviceId = this.cartItemSearchList[i].serviceId;
        this.selectedCartItem.categoryName = this.cartItemSearchList[i].categoryName;
        this.selectedCartItem.categoryId = this.cartItemSearchList[i].categoryId;
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }

  }

  onChangeAmount(): void {
    let tempCart = this.procedureAdviseTrack.cartItemList[0];
    tempCart.serviceList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.procedureAdviseTrack.cartItemList[0] = { ...tempCart }
  }

  onChangeTest(): void {
    (<any>$("#myModal2")).modal("show");
    $(".modal-backdrop").not(':first').remove();
    if (this.cartItemList[0] != undefined) {
      this.searchedTestAmount = null;
      $("hs-select>div>input").val("");
    }
  }

  addNewTest(): void {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (this.key == undefined || this.key == null || this.key.length < 2 || this.key == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Procedure Name";
      this.showMessage = true;
      return;
    }
    else if (this.searchedTestAmount == undefined || this.searchedTestAmount == null || this.searchedTestAmount == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Amount";
      this.showMessage = true;
      return;
    }
    else if (this.cartItemList[0] != undefined) {
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length] = new ServiceItem();
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].serviceId = this.selectedCartItem.serviceId;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].serviceName = this.selectedCartItem.serviceName = this.key;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].quantity = 1;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].netPrice = this.searchedTestAmount;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].categoryId = this.selectedCartItem.categoryId;
      this.cartItemList[0].serviceList[this.cartItemList[0].serviceList.length - 1].categoryName = this.selectedCartItem.categoryName;


    }
    else {
      this.cartItemList[0] = new CartItem();
      this.cartItemList[0].serviceList = new Array<ServiceItem>();
      this.cartItemList[0].serviceList[0] = new ServiceItem();
      this.cartItemList[0].serviceList[0].serviceId = this.selectedCartItem.serviceId;
      this.cartItemList[0].serviceList[0].serviceName = this.selectedCartItem.serviceName = this.key;
      this.cartItemList[0].serviceList[0].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].serviceList[0].netPrice = this.searchedTestAmount;
      this.cartItemList[0].serviceList[0].quantity = 1;
      this.cartItemList[0].serviceList[0].categoryId = this.selectedCartItem.categoryId;
      this.cartItemList[0].serviceList[0].categoryName = this.selectedCartItem.categoryName;
    }

    //making object mutable to update in child component
    let tempCartItem = this.procedureAdviseTrack.cartItemList[0];
    tempCartItem.isReset = true;
    this.procedureAdviseTrack.cartItemList[0] = { ...tempCartItem };

    this.cartItem = new CartItem();
    for (let i = 0; i < this.cartItemList[0].serviceList.length; i++) {
      this.cartItemList[0].serviceList[i].taxes = new Taxes();
      this.cartItemList[0].serviceList[i].taxes.sgst = this.sgst;
      this.cartItemList[0].serviceList[i].taxes.cgst = this.cgst;
      this.cartItemList[0].serviceList[i].taxes.igst = this.igst;
      this.cartItemList[0].serviceList[i].taxes.sgstAmount = this.sgstAmount;
      this.cartItemList[0].serviceList[i].taxes.cgstAmount = this.cgstAmount;
      this.cartItemList[0].serviceList[i].taxes.igstAmount = this.igstAmount;
    }
    this.procedureAdviseTrack.cartItemList[0].serviceList = this.cartItemList[0].serviceList;
    this.otherDiscountAmount = this.procedureAdviseTrack.cartItemList[0].payment.otherDiscountAmount = 0;
    this.otherDiscountAmountPer = 0;
    this.key = "";
    $("#myModal2").on("hidden.bs.modal", function () {
      if ($(".modal-backdrop").length > 1) {
        $(".modal-backdrop").not(':first').remove();
      }
    });
    (<any>$('#myModal2')).modal('hide');
    this.cd.detectChanges();
  }

  remove(index: number): void {
    this.cartItemList[0].serviceList.splice(index, 1);
    this.procedureAdviseTrack.cartItemList[0].serviceList = this.cartItemList[0].serviceList;
    let tempCart = this.procedureAdviseTrack.cartItemList[0];
    this.procedureAdviseTrack.cartItemList[0] = { ...tempCart };
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
    this.procedureAdviseTrack.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.procedureAdviseTrack.cartItemList[0].parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.procedureAdviseTrack.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.procedureAdviseTrack.cartItemList[0].patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
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
    if (this.procedureAdviseTrack != undefined && this.procedureAdviseTrack != null) {
      this.paymentService.procedureAdviseTrack = this.procedureAdviseTrack.cartItemList[0];
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
    console.log(id + " closed");
    $(id).on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    (<any>$(id)).modal('hide');
  }
}
