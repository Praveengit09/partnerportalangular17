import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { Config } from '../../../../base/config';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { CartItem } from '../../../../model/basket/cartitem';
import { Payment } from '../../../../model/basket/payment';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { PaymentType } from '../../../../model/payment/paymentType';
import { PackageService } from '../../../../packages/package.service';
import { PharmacyService } from '../../../pharmacy.service';
import { DiscountType } from './../../../../model/package/discountType';

@Component({
    selector: 'advicedetail-component',
    templateUrl: './advicedetail.template.html',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./advicedetail.style.scss']
})

export class PharmacyAdviceDetailComponent implements OnInit {

    componentId: string = 'modal-1';
    errorMessage: Array<string>;
    isErrorCheck: boolean = false;
    isEnter: boolean = false;
    isError: boolean;
    showMessage: boolean;

    brandId: number;
    productDetail: any;
    cartItem: CartItem = new CartItem();

    bookedPackageList: BookedPackageResponse[] = new Array();
    totalAmount: number;
    packageNames: string[];
    discountAmount: number = 0;
    otherDiscountAmountPer: number = 0;
    selectedPackageId: number = 0;
    discountPercent: number = 0;
    paymentModeIndex: number = 2;
    pocId: any;
    t: any;
    dropDownIndex: number = 0;
    totalTaxationAmount: number = 0;
    pdfHeaderType: number;
    isOtherDiscountCashPaymentHide: boolean = false;
    otherDiscountAmount: number = 0;
    empId: any;
    selectedGlobalPackageId: number = 0;
    transactionId: string = '';
    triggerCount: number = 0;
    isValue: boolean = false;
    isPercent: boolean = true;
    isValue1: boolean;
    isPercent1: boolean;
    Package4Original: number;
    tempCalculatedValueOfOrder: any;
    oldRecord: boolean = true;
    validation: ValidationUtil;
    discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
    configAppId: number;

    constructor(private pharmacyService: PharmacyService, private packageService: PackageService,
        private authService: AuthService, private router: Router, private validationUtil: ValidationUtil,
        private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
        private diagnosticService: DiagnosticsService, private cd: ChangeDetectorRef) {
        pharmacyService.isEditedOrder = true;
        this.validation = validationUtil;
        this.pharmacyService.pharmacyList = new Array();
        this.isError = this.pharmacyService.isError;
        this.errorMessage = this.pharmacyService.errorMessage;
        this.showMessage = this.pharmacyService.showMessage;
        this.pocId = authService.userAuth.pocId;
        this.brandId = authService.userAuth.brandId;
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        this.empId = authService.userAuth.employeeId;
        this.cartItem = this.pharmacyService.pharmacyAdviseTrack;
        if (this.cartItem && this.cartItem.pharmacyList) {
            this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
            this.triggerCount = new Date().getTime();
        }
        this.configAppId = Config.portal.appId;
    }

    ngOnInit() {
        this.oldRecord = true;
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
        this.validation = this.validation;
        // saving and getting from local.....
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.cartItem.adviceId != undefined) {
            window.localStorage.setItem('pharmacyAdviceTrack', cryptoUtil.encryptData(JSON.stringify(this.cartItem)));
        } else {
            if (window.localStorage.getItem('pharmacyAdviceTrack') != null && window.localStorage.getItem('pharmacyAdviceTrack').length > 0) {
                this.cartItem = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pharmacyAdviceTrack')));
            }
            this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
            this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;
            if (!this.cartItem.adviceId) {
                this.gotoPharmacyOrderList();
            }
        }

        if (this.cartItem && this.cartItem.payment != undefined &&
            this.cartItem.payment.paymentStatus != 2) {
            this.getMedicineDetailList();
            this.oldRecord = false;
        }
        if (this.cartItem.payment.paymentStatus == 2) {
            this.settingSavedData();
        }

        this.cartItem.cartItemType = this.cartItem.cartItemType ? this.cartItem.cartItemType : CartItem.CART_ITEM_TYPE_PHARMACY;
        this.paymentModeIndex = this.cartItem.payment.transactionType;

    }

    getMedicineDetailList() {
        this.pharmacyService.getMedicineDetailList(this.cartItem.orderId).then(pharmacyMedicineList => {
            this.pharmacyService.pharmacyList = pharmacyMedicineList;
            this.triggerCount = new Date().getTime();
        });
    }

    settingSavedData() {
        if (this.cartItem.basketDiscount && this.cartItem.basketDiscount.length > 0
            && this.cartItem.basketDiscount[0] != undefined) {
            this.otherDiscountAmountPer = this.cartItem.basketDiscount[0].percent;
        }
        if (this.cartItem.payment.packageDiscountAmount) {
            this.discountAmount = this.cartItem.payment.packageDiscountAmount;
        }
        if (this.cartItem.payment.taxationAmount) {
            this.totalTaxationAmount = this.cartItem.payment.taxationAmount;
        }
    }

    onCalculateEvent(calculatedValue): void {
        this.tempCalculatedValueOfOrder = calculatedValue;
        this.cartItem.pharmacyList = this.pharmacyService.pharmacyList;
        let cartItemList = this.cartItem;
        cartItemList.isReset = this.tempCalculatedValueOfOrder.reset;
        this.cartItem = { ...cartItemList };
        this.cd.detectChanges();
    }

    gotoPharmacyOrderList(): void {
        this.router.navigate(['/app/pharmacy/orders']);
    }

    gotoPharmacyInvoice() {
        this.router.navigate(['/app/pharmacy/advice/invoice']);
    }

    checkPaymentModeSelection(index: number) {
        this.paymentModeIndex = index;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
    }

    onPayNowClick(): void {
        window.scroll(0, 0);
        this.isErrorCheck = false;
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
        this.cartItem.pharmacyList = this.pharmacyService.pharmacyList;
        this.cartItem.brandId = this.brandId;
        if (this.cartItem.pharmacyList.length < 1) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "You haven't added any medicines to your advice. Please add a medicine to create your advice.";
            this.showMessage = true;
            this.isErrorCheck = true;
            return;
        }

        this.cartItem.pharmacyList.forEach(element => {

            if (!element.quantity || element.quantity <= 0) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Quantity cannot be zero";
                this.showMessage = true;
                this.isErrorCheck = true;
                return;
            }
            if (!element.grossPrice || element.grossPrice <= 0) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Price cannot be zero";
                this.showMessage = true;
                this.isErrorCheck = true;
                return;
            }

            let enableStockValidation = false;
            if (Config.portal && Config.portal.pharmacyOptions && Config.portal.pharmacyOptions.enableStockValidation) {
                enableStockValidation = true;
            }

            // if (!element.productCode && enableStockValidation) {
            //     this.isError = true;
            //     this.errorMessage = new Array();
            //     this.errorMessage[0] = "Please fill all Product Codes";
            //     this.showMessage = true;
            //     this.isErrorCheck = true;
            //     return;
            // }
            if (!element.productName && enableStockValidation) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please fill all Product Names";
                this.showMessage = true;
                this.isErrorCheck = true;
                return;
            }
            // if ((!element.productId || element.productId <= 0) && enableStockValidation) {
            //     this.isError = true;
            //     this.errorMessage = new Array();
            //     this.errorMessage[0] = element.productName + " does not exist";
            //     this.showMessage = true;
            //     this.isErrorCheck = true;
            //     return;
            // }
        });

        // this.cartItem.pharmacyList.forEach(element => {
        //     if (element.stockDetails.totalAvailableQuantity > 0 && element.quantity > element.stockDetails.totalAvailableQuantity) {
        //         this.isError = true;
        //         this.errorMessage = new Array();
        //         this.errorMessage[0] = "Don't have enough items in stock for " + element.productName;
        //         this.showMessage = true;
        //         this.isErrorCheck = true;
        //         return;
        //     }
        // });
        if (this.otherDiscountAmountPer < 0 || this.otherDiscountAmountPer > 100) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Discount has to be in the range of 0 to 100%";
            this.showMessage = true;
            this.isErrorCheck = true;
            return;
        }
        if (this.paymentModeIndex == 0 || this.paymentModeIndex == 9) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select a payment mode";
            this.showMessage = true;
            this.isErrorCheck = true;
            return;
        }
        if (this.isErrorCheck && this.errorMessage && this.errorMessage[0] && this.showMessage) {
            return;
        } else if (this.isErrorCheck) {
            this.isError = true;
            if (this.errorMessage[0])
                this.errorMessage = new Array();
            this.errorMessage[0] = "Error occcurred while processing";
            this.showMessage = true;
            this.isErrorCheck = true;
            return;
        }

        this.cartItem.pharmacyList.forEach(element => {
            if (element.stockDetails.expiryDate) {
                if (element.stockDetails.expiryDate instanceof Date)
                    element.stockDetails.expiryDate = element.stockDetails.expiryDate.getTime();
            }
        });

        if (this.selectedPackageId > 0) {
            this.cartItem.userPackageId = this.selectedPackageId;
        }

        if (this.paymentModeIndex == Payment.PAYMENT_TYPE_CARD
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_CASH
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PHONEPE
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_PAYTM
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_NEFT
            || this.paymentModeIndex == Payment.PAYMENT_TYPE_UPI) {
            this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
            this.cartItem.payment.transactionType = this.paymentModeIndex;
            this.cartItem.payment.transactionId = this.transactionId;
        } else if (this.paymentModeIndex == 5) {
            this.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PENDING;
            this.cartItem.payment.transactionType = Payment.PAYMENT_TYPE_MOBILE;
        }

        this.cartItem.cartItemType = CartItem.CART_ITEM_TYPE_PHARMACY;

        let basketRequest: BasketRequest = new BasketRequest();
        basketRequest.cartItemList = new Array<CartItem>();
        basketRequest.orderId = this.cartItem.orderId;

        if (this.cartItem.bookingSource == undefined || this.cartItem.bookingSource <= 0) {
            basketRequest.bookingSource = this.cartItem.bookingSource = 3;
        } else {
            basketRequest.bookingSource = this.cartItem.bookingSource;
        }
        this.cartItem.paymentSource = 3;
        this.cartItem.empId = this.empId;
        basketRequest.transactionId = this.cartItem.payment.transactionId;
        basketRequest.transactionType = this.cartItem.payment.transactionType;
        basketRequest.parentProfileId = this.cartItem.parentProfileId;
        // basketRequest.cartItemList[0] = this.cartItem;
        basketRequest.totalOriginalAmount = this.cartItem.payment.originalAmount;
        basketRequest.totalPackageDiscountAmount = this.cartItem.payment.packageDiscountAmount;
        basketRequest.totalOtherDiscountAmount = this.cartItem.payment.otherDiscountAmount;
        basketRequest.totalTaxationAmount = this.cartItem.payment.taxationAmount;
        basketRequest.totalFinalAmount = this.cartItem.payment.finalAmount;
        basketRequest.cartItemList.push(this.cartItem);
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.diagnosticService.initiatePayment(basketRequest).then(basketResponse => {
            this.spinnerService.stop();
            if (basketResponse.cartItemList[0].statusCode == 201 || basketResponse.cartItemList[0].statusCode == 200) {
                if (basketResponse.cartItemList != undefined && basketResponse.cartItemList != null && basketResponse.cartItemList.length > 0) {
                    this.cartItem = basketResponse.cartItemList[0];
                    this.pharmacyService.errorMessage = new Array<string>();
                    this.pharmacyService.errorMessage[0] = basketResponse.statusMessage;
                    this.pharmacyService.isError = false;
                    this.pharmacyService.showMessage = true;
                    if (this.paymentModeIndex == 5) {
                        this.gotoPharmacyOrderList();
                    } else {
                        this.gotoPharmacyInvoice();
                    }
                }
            } else {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = basketResponse.statusMessage;
                this.isError = true;
                this.showMessage = true;
            }
        });
    }

    ngOnDestroy(): void {
        this.pharmacyService.isError = false;
        this.pharmacyService.showMessage = false;
        if (this.cartItem != undefined && this.cartItem != null) {
            this.pharmacyService.pharmacyAdviseTrack = this.cartItem;
        }
    }

    roundToTwo(num) {
        num = num + "e+2";
        return +(Math.round(num) + "e-2");
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

}