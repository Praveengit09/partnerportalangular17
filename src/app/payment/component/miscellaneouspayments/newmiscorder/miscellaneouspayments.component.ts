import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CartItem } from '../../../../model/basket/cartitem';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { Payment } from '../../../../model/basket/payment';
import { Product } from '../../../../model/product/product';
import { Taxes } from '../../../../model/basket/taxes';
import { DoctorDetails } from '../../../model/employee/doctordetails';
import { AuthService } from '../../../../auth/auth.service';
import { PaymentType } from '../../../../model/payment/paymentType';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { Router } from '@angular/router';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { PaymentService } from '../../../../payment/payment.service';
import { DiscountType } from '../../../../model/package/discountType';


@Component({
  selector: 'miscellaneouspayments_component',
  templateUrl: './miscellaneouspayments.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./miscellaneouspayments.style.scss']
})
export class MiscellaneousPaymentsComponent implements OnInit {

  miscellaneusAdviseTrack: BasketRequest;
  doctorFirstName: string
  doctorLastName: string;
  startdate: Date;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  cartItemList: CartItem[] = new Array<CartItem>();
  cartItem: CartItem = new CartItem();
  cartItemSearchList: Product[] = new Array<Product>();
  selectedCartItem: Product = new Product();
  transactionId: any;
  searchedTestAmount: any = null;
  selectOthers: boolean = true;
  paymentModeIndex: number = 2;
  isError: boolean;
  isError1: boolean;
  showMessage: boolean;
  showMessage1: boolean;
  isErrorCheck: boolean = false;
  searchItemsTotal: number = 0;
  key: any;
  brandId: number;
  errorMessage: Array<string>;
  cgst: number = 0;
  sgst: number = 0;
  igst: number = 0;
  sgstAmount: number = 0;
  cgstAmount: number = 0;
  igstAmount: number = 0;
  otherDiscountAmount: number = 0;
  otherDiscountAmountPer: number = 0;
  discountType:number  = DiscountType.TYPE_MISCELLANEOUS;

  pocId: any;
  pocName: any;
  empId: any;
  searchedTests: any;
  pdfHeaderType: any;
  selectColumns: any[] = [
    {
      variable: 'productName',
      filter: 'text'
    }
  ];
  constructor(private paymentService: PaymentService, private cd: ChangeDetectorRef, private auth: AuthService, private spinnerService: SpinnerService,
    private diagnosticsService: DiagnosticsService, private router: Router, private validation: ValidationUtil) {
    this.isError = this.paymentService.isError;
    this.validation = validation;
    this.errorMessage = this.paymentService.errorMessage;
    this.showMessage = this.paymentService.showMessage;
    this.pocId = auth.userAuth.pocId;
    this.miscellaneusAdviseTrack = new BasketRequest();
    this.miscellaneusAdviseTrack.cartItemList = new Array<CartItem>();
    this.miscellaneusAdviseTrack.cartItemList[0] = new CartItem();
    this.miscellaneusAdviseTrack.cartItemList[0].pocId = this.pocId;
    this.miscellaneusAdviseTrack.cartItemList[0].bookingSource = this.miscellaneusAdviseTrack.bookingSource = 3; // public static final int BOOKING_SOURCE_PARTNER_PORTAL = 3;
    this.miscellaneusAdviseTrack.cartItemList[0].paymentSource = 3;
    this.miscellaneusAdviseTrack.cartItemList[0].cartItemType = CartItem.CART_ITEM_TYPE_MISCELLANEOUS_PAYMENTS;

    this.miscellaneusAdviseTrack.cartItemList[0].empId = auth.userAuth.employeeId;
    this.searchedTests = new Array();
    this.brandId = auth.userAuth.brandId;

  }

  ngOnInit() {
    // this.disableMouseScroll();
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    this.cd.detectChanges();
  }


  onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    this.saveSelectedProfile(); 
  }

  saveSelectedProfile() {
    this.miscellaneusAdviseTrack.cartItemList[0].patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.miscellaneusAdviseTrack.cartItemList[0].parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.miscellaneusAdviseTrack.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.miscellaneusAdviseTrack.cartItemList[0].patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
  }

  closeModel(id: string) {
    console.log(id + " closed");
    $(id).on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    (<any>$(id)).modal('hide');
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

  onChangeTest(): void {
    (<any>$("#myModal2")).modal("show");
    $(".modal-backdrop").not(':first').remove();
    if (this.cartItemList[0] != undefined) {
      this.searchedTestAmount = null;
      $("hs-select>div>input").val("");
    }
  }

  onChangeAmount(): void {
    let tempCart = this.miscellaneusAdviseTrack.cartItemList[0];
    tempCart.productList.forEach((item) => {
      item.netPrice = item.grossPrice;
    })
    tempCart.isReset = true;
    this.miscellaneusAdviseTrack.cartItemList[0] = { ...tempCart }
  }

  remove(index: number): void {
    this.cartItemList[0].productList.splice(index, 1);
    this.miscellaneusAdviseTrack.cartItemList[0].productList = this.cartItemList[0].productList;
    let tempCart = this.miscellaneusAdviseTrack.cartItemList[0];
    this.miscellaneusAdviseTrack.cartItemList[0] = { ...tempCart };
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

  onPaymentChange(index: number): void {
    if (index == 1) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CARD;
    };
    if (index == 2) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PHONEPE;
    };
    if (index == 3) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_GOOGLE_PAY;
    };
    if (index == 4) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_PAYTM;
    }
    if (index == 11) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_NEFT;
    };
    if (index == 12) {
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_UPI;
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

      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }

  }

  getTestName(infos) {
    for (let i = 0; i < this.cartItemSearchList.length; i++) {
      if (infos.productName == this.cartItemSearchList[i].productName) {
        this.selectedCartItem = this.cartItemSearchList[i];
        this.selectedCartItem.productName = this.cartItemSearchList[i].productName;
        this.key = this.selectedCartItem.productName;
        this.selectedCartItem.productId = this.cartItemSearchList[i].productId;
        this.selectedCartItem.categoryName = this.cartItemSearchList[i].categoryName;
        this.selectedCartItem.categoryId = this.cartItemSearchList[i].categoryId;
        this.searchedTestAmount = this.selectedCartItem.grossPrice;
      }
    }

  }

  gotoProductOrderList(): void {
    this.router.navigate(['/app/payment/miscellaneouspaymentslisting']);
  }

  gotoMiscOrderInvoice(){
    this.router.navigate(['/app/payment/miscellaneouspaymentsinvoice']);
  }

  addNewTest(): void {
    this.isError1 = false;
    this.errorMessage = new Array();
    this.showMessage1 = false;
    if (this.key == undefined || this.key == null || this.key.length < 2 || this.key == "") {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Product Name";
      this.showMessage1= true;
      return;
    }
    else if (this.searchedTestAmount == undefined || this.searchedTestAmount == null || this.searchedTestAmount == 0) {
      this.isError1 = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter Amount";
      this.showMessage1 = true;
      return;
    }
    else if (this.cartItemList[0] != undefined) {
      this.cartItemList[0].productList[this.cartItemList[0].productList.length] = new Product();
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].productId = this.selectedCartItem.productId;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].productName = this.selectedCartItem.productName = this.key;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].quantity = 1;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].netPrice = this.searchedTestAmount;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].categoryId = this.selectedCartItem.categoryId;
      this.cartItemList[0].productList[this.cartItemList[0].productList.length - 1].categoryName = this.selectedCartItem.categoryName;


    }
    else {
      this.cartItemList[0] = new CartItem();
      this.cartItemList[0].productList = new Array<Product>();
      this.cartItemList[0].productList[0] = new Product();
      this.cartItemList[0].productList[0].productId = this.selectedCartItem.productId;
      this.cartItemList[0].productList[0].productName = this.selectedCartItem.productName = this.key;
      this.cartItemList[0].productList[0].grossPrice = this.searchedTestAmount;
      this.cartItemList[0].productList[0].netPrice = this.searchedTestAmount;
      this.cartItemList[0].productList[0].quantity = 1;
      this.cartItemList[0].productList[0].categoryId = this.selectedCartItem.categoryId;
      this.cartItemList[0].productList[0].categoryName = this.selectedCartItem.categoryName;
    }

    //making object mutable to update in child component
    let tempCartItem = this.miscellaneusAdviseTrack.cartItemList[0];
    tempCartItem.isReset = true;
    this.miscellaneusAdviseTrack.cartItemList[0] = { ...tempCartItem };

    this.cartItem = new CartItem();
    for (let i = 0; i < this.cartItemList[0].productList.length; i++) {
      this.cartItemList[0].productList[i].taxes = new Taxes();
      this.cartItemList[0].productList[i].taxes.sgst = this.sgst;
      this.cartItemList[0].productList[i].taxes.cgst = this.cgst;
      this.cartItemList[0].productList[i].taxes.igst = this.igst;
      this.cartItemList[0].productList[i].taxes.sgstAmount = this.sgstAmount;
      this.cartItemList[0].productList[i].taxes.cgstAmount = this.cgstAmount;
      this.cartItemList[0].productList[i].taxes.igstAmount = this.igstAmount;
    }
    this.miscellaneusAdviseTrack.cartItemList[0].productList = this.cartItemList[0].productList;
    this.otherDiscountAmount = this.miscellaneusAdviseTrack.cartItemList[0].payment.otherDiscountAmount = 0;
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


  onFinalSubmit(): void {
    console.log('final submit');
    this.isErrorCheck = false;
    if (!this.selectedRegisteredProfile.selfProfile.fName) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select a Patient First";
      this.showMessage = true;
      return;
    }
  
    if (this.miscellaneusAdviseTrack.cartItemList.length > 0) {
      if (this.miscellaneusAdviseTrack.cartItemList[0].productList == undefined || this.miscellaneusAdviseTrack.cartItemList[0].productList.length <= 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Add atleast one product";
        this.showMessage = true;
        return;
      }
      if (this.miscellaneusAdviseTrack.cartItemList[0].productList && this.miscellaneusAdviseTrack.cartItemList[0].productList.length > 0) {
        this.miscellaneusAdviseTrack.cartItemList[0].productList.forEach(service => {
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
        this.miscellaneusAdviseTrack.cartItemList[0].productList = this.cartItemList[0].productList;
      }

      if (this.isErrorCheck) {
        console.log("isErrorCheck");
        return;
      }

      this.miscellaneusAdviseTrack.cartItemList[0].brandId = this.brandId;
      if (this.paymentModeIndex == 1) {
        if (!this.miscellaneusAdviseTrack.transactionType) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Please Select payment mode";
          this.showMessage = true;
          return;
        }

        this.miscellaneusAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType;
        this.miscellaneusAdviseTrack.transactionId = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionId = this.transactionId;
      } else if (this.paymentModeIndex == 2) {
        this.miscellaneusAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
        this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_CASH;
      } else if (this.paymentModeIndex == 5) {
        this.miscellaneusAdviseTrack.cartItemList[0].payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
        this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
      }
      this.miscellaneusAdviseTrack.transactionType = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionType;
      this.miscellaneusAdviseTrack.transactionId = this.miscellaneusAdviseTrack.cartItemList[0].payment.transactionId = this.transactionId;

      this.miscellaneusAdviseTrack.createdTimestamp = new Date().getTime();
      $('html, body').animate({ scrollTop: '0px' }, 300);
      console.log('final submit');

      this.spinnerService.start();
      this.diagnosticsService.initiatePayment(this.miscellaneusAdviseTrack).then(
        response => {
          console.log('final submit');

          this.spinnerService.stop();
          if (response != null && response != undefined) {
            this.miscellaneusAdviseTrack = response;
            if (this.paymentModeIndex == 5) {
              this.spinnerService.start();
              if (response.statusCode == 200) {
                setTimeout(() => {
                  this.spinnerService.stop();
                  window.alert('updated successfully');
                  this.gotoProductOrderList();
                }, 12000)
              }
            } else {
              this.spinnerService.stop();
              this.gotoMiscOrderInvoice();
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

  }

  ngOnDestroy(): void {
    if (this.miscellaneusAdviseTrack != undefined && this.miscellaneusAdviseTrack != null) {
        this.paymentService.miscellaneousOrderAdviseTrack = this.miscellaneusAdviseTrack.cartItemList[0];
    }
}
}