import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewEncapsulation, AfterViewInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ValidationUtil } from '../../../base/util/validation-util';
import { BasketConstants } from '../../../constants/basket/basketconstants';
import { ResponseConstants } from '../../../constants/common/responseconstants';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { CartItem } from '../../../model/basket/cartitem';
import { BasketDiscount } from '../../../model/package/basketDiscount';
import { Config } from '../../../base/config';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { PackageService } from '../../../packages/package.service';
import { SpinnerService } from '../spinner/spinner.service';
import { Taxes } from './../../../model/basket/taxes';
import { ReferredBy } from '../../../model/basket/referredBy';
import { PocSearch } from '../../../model/poc/pocSearch';
import { CommonUtil } from '../../../base/util/common-util';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { AuthService } from '../../../auth/auth.service';
import { WalletDetails } from '../../../model/basket/walletDetails';
import { ToasterService } from '../../toaster/toaster.service';

@Component({
    selector: 'app-cartdiscount',
    templateUrl: './cartdiscount.template.html',
    styleUrls: ['./cartdiscount.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CartDiscountComponent implements OnInit, OnDestroy, OnChanges {


    statusMessage: string = "";
    statusMessage1: string = "";

    @Input('cartItemDetails')
    cartItemDetails: CartItem;

    packageList: BookedPackageResponse[];
    packageNamesShow: boolean = false;

    @Input()
    onlyPayment: boolean = false;
    @Input()
    parentProfileId: number;
    @Input()
    discountType: number;
    @Input()
    pocId: any;

    bookedPackage: BookedPackageResponse;
    dropDownIndex: number = 0;

    couponCode: string;
    couponDiscountAmount: number = 0;

    isOtherDiscount = false;

    otherDiscountMode = 0;
    otherDiscountAmount: number = 0;
    otherDiscountAmountPercent: number = 0;

    taxationAmount: number = 0;

    @Input()
    promotionalDiscount: number = 0;

    @Input()
    isOldRecord = false;
    @Output()
    calculateDiscount: EventEmitter<CartItem> = new EventEmitter();
    searchPocTotal: number = 0;
    key: string;
    pocSearchList: any[] = new Array<any>();
    selectedPoc: any;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    walletAmount: WalletDetails;
    walletBalance: number = 0;
    postWalletAmount: number = 0;
    perWalletBal: number = 0;
    walletErrorMessage: string = "";
    cashBackAmount: number;
    showReferredBy: boolean = false;
    showWallet: boolean = false;
    showPostWallet: boolean = false;
    checkingOD: boolean = true;
    usedWalletAmount: number = 0;
    validation: ValidationUtil;
    selectColumns: any[] = [
        {
            variable: 'pocName',
            filter: 'text'
        }
    ];

    debounceTime = 500;
    currencySymbol: string = '';

    private walletModelChanged: Subject<string> = new Subject<string>();
    private walletSubscription: Subscription;

    private odPercentModelChanged: Subject<string> = new Subject<string>();
    private odPercentSubscription: Subscription;

    constructor(private authService: AuthService, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private superAdminService: SuperAdminService,
        private diagnosticService: DiagnosticsService, private packageService: PackageService, private validationUtil: ValidationUtil, private cd: ChangeDetectorRef,
        private toast: ToasterService) {
        this.validation = validationUtil;
        this.showPostWallet = Config.portal.customizations.postWalletEnabled;
        if (Config.portal && Config.portal.customizations && Config.portal.customizations.referredByCheckout) {
            this.showReferredBy = true;
        }
        if (Config.portal && Config.portal.currencySymbol) {
            this.currencySymbol = Config.portal.currencySymbol;
        }
    }

    ngOnInit(): void {
        // For wallet apply
        this.walletSubscription = this.walletModelChanged
            .pipe(
                debounceTime(this.debounceTime),
            )
            .subscribe(() => {
                this.onWalletAmountChange();
            });

        // For other discount % apply
        this.odPercentSubscription = this.odPercentModelChanged
            .pipe(
                debounceTime(this.debounceTime),
            )
            .subscribe(() => {
                this.applyOtherDiscount();
            });
    }

    walletInputChanged() {
        this.walletModelChanged.next(null);
    }

    otherDiscountInputChanged() {
        this.odPercentModelChanged.next(null);
    }

    ngOnChanges(changes: SimpleChanges) {

        if (Config.portal.customizations.walletEnabled == true) {
            this.showWallet = true;
            (<any>$)("#checkWalletAmount").prop("checked", false);
            this.cartItemDetails.walletApply = false;
            this.getWalletAmount();
        }
        if ((!this.isOldRecord && !this.onlyPayment) && this.parentProfileId > 0) {
            this.getPackages();
        }
        /* Disable input scroll */
        $(function () {
            $('form').on('focus', 'input[type=number]', function (e) {
                $(this).on('mousewheel.disableScroll', function (e) {
                    e.preventDefault()
                })
                $(this).on("keydown", function (event) {
                    if (event.keyCode === 38 || event.keyCode === 40) {
                        event.preventDefault();
                    }
                });
            })
            $('form').on('blur', 'input[type=number]', function (e) {
                $(this).off('mousewheel.disableScroll')
            })
        });

        let originalAmount: number = 0;
        this.promotionalDiscount = 0;
        this.taxationAmount = 0;

        let itemsList: any[];

        if (this.cartItemDetails.serviceList && this.cartItemDetails.serviceList.length > 0) {
            itemsList = this.cartItemDetails.serviceList;
        } else if (this.cartItemDetails.pharmacyList && this.cartItemDetails.pharmacyList.length > 0) {
            itemsList = this.cartItemDetails.pharmacyList;
        } else if (this.cartItemDetails.productList && this.cartItemDetails.productList.length > 0) {
            itemsList = this.cartItemDetails.productList;
        }

        if (!this.cartItemDetails.payment.taxationAmount) {
            this.cartItemDetails.payment.taxationAmount = 0;
            this.taxationAmount = 0;
        }

        if (!this.cartItemDetails.payment.otherDiscountAmount) {
            this.cartItemDetails.payment.otherDiscountAmount = 0;
        }

        if (!this.cartItemDetails.payment.packageDiscountAmount) {

            this.cartItemDetails.payment.packageDiscountAmount = 0;

        }

        if (this.cartItemDetails && this.cartItemDetails.isReset) {

            this.taxationAmount = 0;
            this.dropDownIndex = 0;
            this.cartItemDetails.packageName = "NA";
            this.cartItemDetails.payment.packageDiscountAmount = 0;
            this.cartItemDetails.userPackageId = 0;
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.resetCoupon();

        } else {
            if (this.cartItemDetails && this.cartItemDetails.basketDiscount) {
                setTimeout(() =>
                    this.cartItemDetails.basketDiscount.forEach(e => {
                        if (e.type == BasketConstants.DISCOUNT_TYPE_COUPON) {
                            this.couponCode = e.name;
                            this.applyCoupon();
                            return;
                        }
                    })
                    , 100)
            }
        }
        if (itemsList && itemsList.length > 0) {
            this.promotionalDiscount = 0;
            for (let i = 0; i < itemsList.length; i++) {

                if (!itemsList[i].discountPrice) {
                    itemsList[i].discountPrice = 0;
                }

                if ((!itemsList[i].grossPrice || itemsList[i].grossPrice == 0)
                    && itemsList[i].netPrice && itemsList[i].netPrice > 0) {
                    // Do an item level calculation of gross, net and taxes
                    let tmpTotalTax = 0;
                    if (itemsList[i].taxes != undefined && itemsList[i].taxes != null) {
                        if (itemsList[i].taxes.igst && itemsList[i].taxes.igst > 0) {
                            tmpTotalTax += +itemsList[i].taxes.igst;
                        } else {
                            if (!itemsList[i].taxes.igst) {
                                itemsList[i].taxes.igst = 0;
                            }
                            if (itemsList[i].taxes.cgst && itemsList[i].taxes.cgst > 0) {
                                tmpTotalTax += +itemsList[i].totalTaxes.cgst;
                            } else {
                                itemsList[i].taxes.cgst = 0;
                            }
                            if (itemsList[i].taxes.sgst && itemsList[i].taxes.sgst > 0) {
                                tmpTotalTax += +itemsList[i].taxes.sgst;
                            } else {
                                itemsList[i].taxes.sgst = 0;
                            }
                        }
                    }
                    itemsList[i].grossPrice = this.roundToTwo(+itemsList[i].netPrice / (1 + (+tmpTotalTax / 100))) + +itemsList[i].discountPrice;
                    if (+tmpTotalTax > 0) {
                        itemsList[i].taxes.cgstAmount = this.roundToTwo((+itemsList[i].grossPrice - +itemsList[i].discountPrice) * (itemsList[i].taxes.cgst ? +itemsList[i].taxes.cgst : 0) / 100);
                        itemsList[i].taxes.sgstAmount = this.roundToTwo((+itemsList[i].grossPrice - +itemsList[i].discountPrice) * (itemsList[i].taxes.sgst ? +itemsList[i].taxes.sgst : 0) / 100);
                        itemsList[i].taxes.igstAmount = this.roundToTwo((+itemsList[i].grossPrice - +itemsList[i].discountPrice) * (itemsList[i].taxes.igst ? +itemsList[i].taxes.igst : 0) / 100);
                    } else {
                        itemsList[i].taxes = new Taxes();
                        itemsList[i].taxes.igstAmount = 0;
                        itemsList[i].taxes.cgstAmount = 0;
                        itemsList[i].taxes.sgstAmount = 0;
                    }
                    itemsList[i].grossPrice = +itemsList[i].netPrice + +itemsList[i].discountPrice - (itemsList[i].taxes.igstAmount > 0 ? +itemsList[i].taxes.igstAmount : (+itemsList[i].taxes.cgstAmount + + itemsList[i].taxes.sgstAmount));
                }

                if (itemsList[i].grossPrice >= 0 && +itemsList[i].quantity >= 0) {

                    if (!itemsList[i].netPrice) {
                        itemsList[i].netPrice = 0;
                    }

                    itemsList[i].totalTaxes = new Taxes();
                    if (itemsList[i].taxes != undefined && itemsList[i].taxes != null) {
                        itemsList[i].totalTaxes.cgst = itemsList[i].taxes.cgst != undefined && itemsList[i].taxes.cgst > 0 ? itemsList[i].taxes.cgst : 0;
                        itemsList[i].totalTaxes.sgst = itemsList[i].taxes.sgst != undefined && itemsList[i].taxes.sgst > 0 ? itemsList[i].taxes.sgst : 0;
                        itemsList[i].totalTaxes.igst = itemsList[i].taxes.igst != undefined && itemsList[i].taxes.igst > 0 ? itemsList[i].taxes.igst : 0;
                        if (!itemsList[i].netPrice || itemsList[i].netPrice == 0 || !itemsList[i].taxes.cgstAmount || !itemsList[i].taxes.sgstAmount || !itemsList[i].taxes.igstAmount) {
                            itemsList[i].taxes.cgstAmount = itemsList[i].taxes.cgstAmount ? +itemsList[i].taxes.cgstAmount : this.roundToTwo((+itemsList[i].grossPrice + +itemsList[i].discountPrice) * itemsList[i].totalTaxes.cgst / 100);
                            itemsList[i].taxes.sgstAmount = itemsList[i].taxes.sgstAmount ? +itemsList[i].taxes.sgstAmount : this.roundToTwo((+itemsList[i].grossPrice + +itemsList[i].discountPrice) * itemsList[i].totalTaxes.sgst / 100);
                            itemsList[i].taxes.igstAmount = itemsList[i].taxes.igstAmount ? +itemsList[i].taxes.igstAmount : this.roundToTwo((+itemsList[i].grossPrice + +itemsList[i].discountPrice) * itemsList[i].totalTaxes.igst / 100);
                        }
                    } else {
                        itemsList[i].taxes = new Taxes();
                        itemsList[i].totalTaxes.cgst = 0;
                        itemsList[i].totalTaxes.sgst = 0;
                        itemsList[i].totalTaxes.igst = 0;
                        itemsList[i].taxes.igstAmount = 0;
                        itemsList[i].taxes.cgstAmount = 0;
                        itemsList[i].taxes.sgstAmount = 0;
                    }

                    let taxAmountPerUnit: number = itemsList[i].taxes.igstAmount > 0 ?
                        +itemsList[i].taxes.igstAmount :
                        +itemsList[i].taxes.cgstAmount + +itemsList[i].taxes.sgstAmount;

                    if (+itemsList[i].netPrice == 0) {
                        itemsList[i].netPrice = +itemsList[i].grossPrice - +itemsList[i].discountPrice + +taxAmountPerUnit;
                    }

                    if (itemsList[i].grossPrice > 0 && itemsList[i].netPrice > 0
                        && itemsList[i].grossPrice != itemsList[i].netPrice
                        && (!itemsList[i].discountPercent || itemsList[i].discountPercent == 0)
                        && (!taxAmountPerUnit || taxAmountPerUnit == 0)) {
                        itemsList[i].discountPrice = itemsList[i].grossPrice - itemsList[i].netPrice;
                    }

                    itemsList[i].originalAmount = +itemsList[i].grossPrice * +itemsList[i].quantity;
                    originalAmount = +originalAmount + +itemsList[i].originalAmount;

                    itemsList[i].totalTaxes.cgstAmount = this.roundToTwo(+itemsList[i].quantity * +itemsList[i].taxes.cgstAmount);
                    itemsList[i].totalTaxes.sgstAmount = this.roundToTwo(+itemsList[i].quantity * +itemsList[i].taxes.sgstAmount);
                    itemsList[i].totalTaxes.igstAmount = this.roundToTwo(+itemsList[i].quantity * +itemsList[i].taxes.igstAmount);

                    itemsList[i].taxationAmount = itemsList[i].totalTaxes.igstAmount && +itemsList[i].totalTaxes.igstAmount > 0 ? +itemsList[i].totalTaxes.igstAmount : (+itemsList[i].totalTaxes.cgstAmount + +itemsList[i].totalTaxes.sgstAmount);
                    this.taxationAmount = +this.taxationAmount + +itemsList[i].taxationAmount;
                    if (itemsList[i].grossPrice - taxAmountPerUnit - itemsList[i].netPrice > 0.04 || (itemsList[i].discountPrice && +itemsList[i].discountPrice > 0.04)) {
                        itemsList[i].otherDiscountAmount = +itemsList[i].discountPrice * +itemsList[i].quantity;
                        this.promotionalDiscount += +itemsList[i].otherDiscountAmount;
                    } else {
                        itemsList[i].discountPrice = 0;
                    }

                    itemsList[i].finalAmount = +itemsList[i].originalAmount + +itemsList[i].taxationAmount - +itemsList[i].otherDiscountAmount;
                    if (!this.cartItemDetails.basketDiscount && itemsList[i].discountPrice) {
                        this.promotionalDiscount += +itemsList[i].discountPrice * +itemsList[i].quantity;
                    }
                }
            }
        } else {

            this.dropDownIndex = 0;
            this.cartItemDetails.packageName = "NA";
            this.cartItemDetails.payment.packageDiscountAmount = 0;
            this.cartItemDetails.userPackageId = 0;
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.resetCoupon();
            this.promotionalDiscount = 0;

        }

        if (this.isOldRecord && this.cartItemDetails.basketDiscount && itemsList && !this.cartItemDetails.isReset) {
            this.cartItemDetails.basketDiscount.forEach((item) => {
                if (item.type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.couponDiscountAmount = this.roundToTwo(item.discountAmount);
                    this.cashBackAmount = this.roundToTwo(item.cashbackAmount);
                } else if (item.type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
                    this.otherDiscountAmountPercent = item.percent;
                    this.otherDiscountAmount = item.discountAmount;
                    console.log("OtherDiscountAmounttt: " + this.otherDiscountAmount);
                }
            });
        }

        this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(this.couponDiscountAmount + this.otherDiscountAmount +
            this.promotionalDiscount);

        this.cartItemDetails.payment.originalAmount = parseFloat(originalAmount.toFixed(2));
        // this.cartItemDetails.payment.taxationAmount = this.roundToTwo(this.taxationAmount);
        if (this.taxationAmount && this.taxationAmount > 0) {
            this.calculateFinalValue();
        }
        this.calculateBasket();
        this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        if (this.promotionalDiscount > 0) {
            let basketDiscount = new BasketDiscount();
            basketDiscount.discountAmount = this.promotionalDiscount;
            basketDiscount.type = BasketConstants.DISCOUNT_TYPE_PROMOTIONAL;
            this.setBasketDiscount(basketDiscount);
        }
        this.usedWalletAmount = this.cartItemDetails.payment.usedWalletAmount;
        console.log('ngOnChanges End: ' + JSON.stringify(this.cartItemDetails));
    }

    calculateFinalPayment(cartItem: CartItem) {
        return this.roundToTwo(cartItem.payment.originalAmount
            + cartItem.payment.taxationAmount
            + (cartItem.deliveryAmount ? cartItem.deliveryAmount : 0)
            - (cartItem.payment.usedWalletAmount ? cartItem.payment.usedWalletAmount : 0)
            - (cartItem.payment.usedPostWalletAmount ? cartItem.payment.usedPostWalletAmount : 0)
            - cartItem.payment.packageDiscountAmount
            - cartItem.payment.otherDiscountAmount
            + (cartItem.payment.platformCharges ? cartItem.payment.platformCharges : 0));
    }

    applyCoupon() {
        if (this.couponCode == "" || this.couponCode == null) {
            this.statusMessage = "please enter coupon to apply";
            return;
        }
        this.dropDownIndex = 0;
        this.statusMessage1 = "";
        this.cartItemDetails.packageName = null;
        this.cartItemDetails.payment.packageDiscountAmount = 0;
        this.cartItemDetails.userPackageId = 0;
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.walletErrorMessage = "";
        this.cartItemDetails.payment.usedWalletAmount = 0;
        (<any>$)("#checkWalletAmount").prop("checked", false);
        if (this.cartItemDetails.basketDiscount) {
            for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                if (this.cartItemDetails.basketDiscount[i] && this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                    this.cartItemDetails.basketDiscount.splice(i, 1);
                }
                break;
            }
        }

        let basketDiscount: BasketDiscount = new BasketDiscount();
        basketDiscount.type = BasketConstants.DISCOUNT_TYPE_COUPON;
        basketDiscount.name = this.couponCode;
        this.setBasketDiscount(basketDiscount);


        this.cartItemDetails.payment.otherDiscountAmount = this.promotionalDiscount;

        this.cartItemDetails.payment.otherDiscountAmount = this.promotionalDiscount;
        this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        this.calculateBasket();
        // this.onWalletChecked();
    }

    onKeyUp(key) {
        if (!this.couponCode || this.couponCode == "") {
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.cartItemDetails.userPackageId = 0;
            this.cartItemDetails.packageName = null;
            this.cartItemDetails.payment.packageDiscountAmount = 0;
            this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(this.promotionalDiscount);
            this.resetCoupon();
            /* this.cartItemDetails.payment.finalAmount = this.roundToTwo(this.cartItemDetails.payment.originalAmount
                + this.cartItemDetails.payment.taxationAmount
                - this.cartItemDetails.payment.otherDiscountAmount); */
        }
    }

    onDiscountDropDownChange(index: number) {
        this.resetError();
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.cartItemDetails.payment.packageDiscountAmount = 0;
        this.cartItemDetails.userPackageId = 0;
        this.cartItemDetails.payment.packageDiscountAmount = 0;
        (<any>$)("#checkWalletAmount").prop("checked", false);
        this.cartItemDetails.payment.usedWalletAmount = 0;
        this.resetCoupon();

        if (this.cartItemDetails.basketDiscount) {
            for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                if (this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.cartItemDetails.basketDiscount.splice(i, 1);
                }
                if (this.cartItemDetails.basketDiscount[i] && this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                    this.cartItemDetails.basketDiscount.splice(i, 1);
                }
            }
        }

        this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(this.promotionalDiscount);

        if (index == 0) {
            this.cartItemDetails.packageName = null;
            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
            this.calculateDiscount.emit(this.cartItemDetails);
            return;
        } else {
            let selectedPackage: BookedPackageResponse = this.packageList[index];
            this.cartItemDetails.userPackageId = selectedPackage.userPackageId;
            this.cartItemDetails.packageName = selectedPackage.packageName;

            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
            this.calculateBasket();
            // this.onWalletChecked();
        }
    }

    async calculateBasket() {
        let basketRequest = new BasketRequest();
        if (!this.cartItemDetails.empId || this.cartItemDetails.empId == 0) {
            this.cartItemDetails.empId = this.authService.userAuth.employeeId;
        }
        if (!this.cartItemDetails.bookingSource || this.cartItemDetails.bookingSource == 0) {
            this.cartItemDetails.bookingSource = 3;
        }
        basketRequest.parentProfileId = this.cartItemDetails.parentProfileId;
        basketRequest.cartItemList = new Array<CartItem>();
        basketRequest.cartItemList[0] = this.cartItemDetails;

        this.cartItemDetails.actualDate = 11111;

        // $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        await this.diagnosticService.calculateBasket(basketRequest).then((basketResponse) => {
            this.spinnerService.stop();
            if (basketResponse && basketResponse.cartItemList && basketResponse.cartItemList[0]) {
                this.cartItemDetails.payment = basketResponse.cartItemList[0].payment;
                this.cartItemDetails.deliveryAmount = basketResponse.cartItemList[0].deliveryAmount;
                this.cartItemDetails.basketDiscount = basketResponse.cartItemList[0].basketDiscount;
                this.cartItemDetails.userPackageId = basketResponse.cartItemList[0].userPackageId;
            }

            if (this.cartItemDetails.basketDiscount && this.cartItemDetails.basketDiscount.length > 0) {
                for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                    if (this.cartItemDetails.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        if (this.cartItemDetails.basketDiscount[i].valueDiscount) {
                            this.otherDiscountAmount = this.cartItemDetails.basketDiscount[i].discountAmount;
                        } else {
                            this.otherDiscountAmount = this.cartItemDetails.basketDiscount[i].discountAmount;
                            this.otherDiscountAmountPercent = this.cartItemDetails.basketDiscount[i].percent;
                        }
                    }
                }
            }
            if (this.cartItemDetails.payment.taxationAmount && this.cartItemDetails.payment.taxationAmount > 0) {
                this.taxationAmount = this.cartItemDetails.payment.taxationAmount;
            }
            if (this.cartItemDetails && this.cartItemDetails.payment
                && (this.cartItemDetails.payment.usedWalletAmount > 0
                    || this.cartItemDetails.payment.usedPostWalletAmount > 0)) {
                this.showWallet = true;
                this.cartItemDetails.walletApply = true;
                this.walletBalance = this.cartItemDetails.payment.usedWalletAmount;
                this.toast.show("Wallet Amount applied successfully", "bg-success text-white font-weight-bold", 3000);
            }
            if (this.cartItemDetails && this.cartItemDetails.statusCode
                && this.cartItemDetails.statusCode != ResponseConstants.SUCCESS
                && this.cartItemDetails.statusCode != ResponseConstants.SUCCESS_UPDATED) {
                this.errorMessage = new Array();
                this.errorMessage.push(this.cartItemDetails.statusMessage);
                this.showMessage = true;
                this.isError = true;
            }
            if (basketResponse && basketResponse.statusCode && basketResponse.statusCode != ResponseConstants.SUCCESS
                && basketResponse.statusCode != ResponseConstants.SUCCESS_UPDATED) {
                this.toast.show(basketResponse.statusMessage, "bg-danger text-white font-weight-bold", 3000);

                (<any>$)("#checkWalletAmount").prop("checked", false);
                this.cartItemDetails.walletApply = false;
            }
            console.log('After calculate Basket >>> ', this.cartItemDetails);
        });
        // this.calculateFinalValue();
        this.cd.detectChanges();
    }

    getPackages(): void {
        let index = 0;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.packageService.getBookedPackagesList(this.cartItemDetails.parentProfileId,
            this.cartItemDetails.serviceId ? this.cartItemDetails.serviceId : 0,
            this.cartItemDetails.doctorId ? this.cartItemDetails.doctorId : 0,
            this.discountType, this.pocId).then((data) => {
                this.spinnerService.stop();
                if (data != null && data.packageDiscountList != null && data.packageDiscountList.length > 0) {
                    this.packageList = new Array<BookedPackageResponse>();
                    this.bookedPackage = new BookedPackageResponse();
                    this.packageNamesShow = true;
                    this.bookedPackage.userPackageId = 0;
                    this.bookedPackage.packageName = 'Select a package';
                    this.packageList[0] = this.bookedPackage;
                    data.packageDiscountList.forEach((element) => {
                        if (element.profileId === this.parentProfileId) {
                            this.packageList.push(element);
                            // this.cartItemDetails.payment.packageDiscountAmount = 0;
                        }
                    });

                    if (this.cartItemDetails.userPackageId && this.cartItemDetails.userPackageId > 0) {
                        index = this.packageList.findIndex((packageElement, i) => {
                            return packageElement.userPackageId == this.cartItemDetails.userPackageId;
                        });
                        this.dropDownIndex = index;
                    }
                    console.log('packaeIndex', index)
                    index > 0 ? this.onDiscountDropDownChange(index) : this.onDiscountDropDownChange(0);
                }
                else {
                    this.packageList = new Array<BookedPackageResponse>();
                    let bookedPackage = new BookedPackageResponse();
                    bookedPackage.packageName = "No packages found";
                    this.packageNamesShow = false;
                    this.onDiscountDropDownChange(0);
                }
            });

    }

    checkDiscountSelection(index: number) {
        this.otherDiscountMode = index;
        this.applyOtherDiscount();
    }

    applyOtherDiscount() {
        if (this.checkingOD) {
            if (this.cartItemDetails.basketDiscount && this.cartItemDetails.basketDiscount.length > 0) {
                this.cartItemDetails.basketDiscount.forEach((discount) => {
                    if (discount.type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        this.otherDiscountAmountPercent = discount.percent;
                        this.otherDiscountMode = 0;
                    }
                })
            }
            this.checkingOD = false;
        }
        this.isError = false;
        let payableAmount = this.cartItemDetails.payment.originalAmount
            - (this.cartItemDetails.payment.usedWalletAmount ? this.cartItemDetails.payment.usedWalletAmount : 0)
            - (this.cartItemDetails.payment.usedPostWalletAmount ? this.cartItemDetails.payment.usedPostWalletAmount : 0)
            - this.cartItemDetails.payment.packageDiscountAmount
            - this.couponDiscountAmount - this.promotionalDiscount;
        if (this.otherDiscountAmountPercent < 0 || this.otherDiscountAmountPercent > 100 || this.otherDiscountAmount < 0 ||
            this.otherDiscountAmount > payableAmount) {
            this.isError = true;
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
            return;
        }
        this.resetError();

        if (this.otherDiscountMode === 0) {
            if (this.otherDiscountAmountPercent < 0 || this.otherDiscountAmountPercent > 100) {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = 'Discount given is not valid';
                this.isError = true;
                this.showMessage = true;
            } else if (this.otherDiscountAmountPercent === 0 || this.otherDiscountAmountPercent == null) {
                this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
                this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount);
                if (this.cartItemDetails.basketDiscount) {
                    for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                        if (this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                            this.cartItemDetails.basketDiscount.splice(i, 1);
                        }
                    }
                }
            } else {

                this.otherDiscountAmount = this.roundToTwo(+payableAmount * (+this.otherDiscountAmountPercent / 100));
                this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(+this.otherDiscountAmount + +this.couponDiscountAmount + +this.promotionalDiscount);
                let basketDiscount = new BasketDiscount();
                basketDiscount.type = BasketConstants.DISCOUNT_TYPE_PARTNER;
                basketDiscount.percent = this.otherDiscountAmountPercent;
                basketDiscount.discountAmount = this.otherDiscountAmount;
                this.setBasketDiscount(basketDiscount);
            }
        } else {
            if (this.otherDiscountAmount < 0 || this.otherDiscountAmount > payableAmount) {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = 'Discount given is not valid';
                this.isError = true;
                this.showMessage = true;
            } else if (this.otherDiscountAmount == 0 || this.otherDiscountAmount == null) {
                this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount);
                this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
                if (this.cartItemDetails.basketDiscount) {
                    for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                        if (this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                            this.cartItemDetails.basketDiscount.splice(i, 1);
                        }
                    }
                }
            } else {
                this.otherDiscountAmountPercent = this.roundToTwo((+this.otherDiscountAmount * 100) / +payableAmount);
                this.cartItemDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount + +this.otherDiscountAmount);
                let basketDiscount = new BasketDiscount();
                basketDiscount.type = BasketConstants.DISCOUNT_TYPE_PARTNER;
                basketDiscount.percent = this.otherDiscountAmountPercent;
                basketDiscount.valueDiscount = true;
                basketDiscount.discountAmount = this.otherDiscountAmount;
                this.setBasketDiscount(basketDiscount);
            }
        }
        if (this.otherDiscountAmountPercent > 0) {
            this.isOtherDiscount = true;
        }
        this.calculateBasket();
        this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);

        this.calculateFinalValue();
    }

    setBasketDiscount(basketDiscount: BasketDiscount) {
        if (!this.cartItemDetails.basketDiscount) {
            this.cartItemDetails.basketDiscount = new Array();
        } else {
            for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                if (basketDiscount.type == BasketConstants.DISCOUNT_TYPE_COUPON) {
                    if (this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        this.cartItemDetails.basketDiscount.splice(i, 1);
                    }
                }
                if (this.cartItemDetails.basketDiscount[i] && this.cartItemDetails.basketDiscount[i].type === basketDiscount.type) {
                    this.cartItemDetails.basketDiscount.splice(i, 1);
                }
            }
        }
        this.cartItemDetails.basketDiscount.push(basketDiscount);
    }

    resetCoupon() {
        this.couponDiscountAmount = 0;
        this.couponCode = "";
        this.cartItemDetails.payment.packageCashBackAmount = 0;
        this.cartItemDetails.payment.totalCashbackAmount = 0;
        (<any>$)("#couponDiscount").val("");
        this.walletErrorMessage = "";
        this.cartItemDetails.payment.usedWalletAmount = 0;
        this.walletBalance = this.perWalletBal;
        this.statusMessage = "";
        this.statusMessage1 = "";
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.promotionalDiscount = 0;
        if (this.cartItemDetails.basketDiscount) {
            for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
                if (this.cartItemDetails.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.cartItemDetails.payment.otherDiscountAmount = this.cartItemDetails.payment.otherDiscountAmount -
                        this.cartItemDetails.basketDiscount[i].discountAmount;
                    this.cartItemDetails.payment.finalAmount = this.cartItemDetails.payment.finalAmount +
                        this.cartItemDetails.basketDiscount[i].discountAmount;
                    // this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
                    this.cartItemDetails.basketDiscount.splice(i, 1);
                    this.calculateFinalValue();
                }
                if (this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PROMOTIONAL) {
                    this.promotionalDiscount += +this.roundToTwo(this.cartItemDetails.basketDiscount[i].discountAmount);
                }
            }
        }
        this.applyOtherDiscount();
    }

    roundToTwo(num) {
        num = num + 'e+2';
        return +(Math.round(num) + 'e-2');
    }

    resetError() {
        this.errorMessage = new Array();
        this.isError = false;
        this.showMessage = false;
    }

    calculateFinalValue(): void {

        if (this.cartItemDetails.basketDiscount && this.cartItemDetails.basketDiscount.length > 0) {
            this.cartItemDetails.basketDiscount.forEach((item) => {
                if (item.type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.statusMessage = "coupon applied"
                    this.cashBackAmount = this.roundToTwo(item.discountAmount);
                }
            })
        }

        if (this.taxationAmount && this.taxationAmount > 0) {
            if (+this.promotionalDiscount == 0 && this.cartItemDetails.basketDiscount) {
                let basketDiscountPromotional = this.cartItemDetails.basketDiscount.find(item => item.type == BasketConstants.DISCOUNT_TYPE_PROMOTIONAL);
                if (basketDiscountPromotional && basketDiscountPromotional.discountAmount > 0) {
                    this.promotionalDiscount = +basketDiscountPromotional.discountAmount;
                }
            }

            let discountPercent: number = 0;
            let totalDiscount = +this.cartItemDetails.payment.otherDiscountAmount + +this.cartItemDetails.payment.packageDiscountAmount - this.promotionalDiscount;
            if (totalDiscount > 0 && this.cartItemDetails.payment.originalAmount > 0) {
                discountPercent = this.roundToTwo((+totalDiscount / (+this.cartItemDetails.payment.originalAmount - this.promotionalDiscount)) * 100);
            }

            if (discountPercent > 0) {
                this.cartItemDetails.payment.taxationAmount = this.roundToTwo(+this.taxationAmount
                    * (1 - (+this.roundToTwo(discountPercent) / 100)));
            } else {
                this.cartItemDetails.payment.taxationAmount = this.taxationAmount;
            }

        } else {
            this.cartItemDetails.payment.taxationAmount = 0;
        }
        this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        this.calculateDiscount.emit(this.cartItemDetails);
    }
    searchPocs(key) {
        this.key = key;
        let request: PocSearch = new PocSearch();
        request.searchTerm = this.key;
        if (key.length > 2) {
            this.superAdminService.getPocDetails(request).then(pocList => {
                this.searchPocTotal = pocList.length;
                this.pocSearchList = pocList;
                this.commonUtil.sleep(700);
                this.isError = false;
                this.errorMessage = new Array();
                this.showMessage = false;
            })
        }
    }

    getPocName(infos) {
        for (let i = 0; i < this.pocSearchList.length; i++) {
            if (infos.pocId == this.pocSearchList[i].pocId)
                this.selectedPoc = this.pocSearchList[i];
        }
        this.cartItemDetails.referredByBooking = new ReferredBy();
        this.cartItemDetails.referredByBooking.referralPocId = this.selectedPoc.pocId;
        this.cartItemDetails.referredByBooking.referralPocName = this.selectedPoc.pocName;
        this.key = this.selectedPoc.pocName;
    }
    getWalletAmount(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.packageService.getWalletAmount(this.cartItemDetails.parentProfileId, this.showPostWallet).then(data => {
            this.spinnerService.stop();
            this.walletAmount = data;
            this.postWalletAmount = data.postWalletBalance;
            this.walletBalance = this.perWalletBal = data.walletBalance;
        });
    };
    onPostWalletChecked() {
        if ((<any>$("#checkPostWalletAmount:checked")).length > 0) {
            if (this.cartItemDetails.payment.finalAmount > this.postWalletAmount)
                this.cartItemDetails.payment.usedPostWalletAmount = this.postWalletAmount;
            else this.cartItemDetails.payment.usedPostWalletAmount = this.cartItemDetails.payment.finalAmount;
        }
        else this.cartItemDetails.payment.usedPostWalletAmount = 0;
        this.calculateBasket();
    }
    onWalletAmountChange() {
        if (this.walletBalance > this.perWalletBal)
            this.walletBalance = this.perWalletBal;
        if ((<any>$("#checkWalletAmount:checked")).length > 0)
            this.onWalletChecked();
    }
    onWalletChecked() {
        // this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        if (this.walletBalance > this.cartItemDetails.payment.finalAmount)
            this.walletBalance = this.cartItemDetails.payment.finalAmount;
        // if (this.cartItemDetails.basketDiscount) {
        //     for (let i = 0; i < this.cartItemDetails.basketDiscount.length; i++) {
        //         if (this.cartItemDetails.basketDiscount[i] && this.cartItemDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
        //             this.cartItemDetails.basketDiscount.splice(i, 1);
        //         }
        //     }
        // };
        this.cartItemDetails.payment.usedWalletAmount = this.usedWalletAmount = this.walletBalance;
        if ((<any>$("#checkWalletAmount:checked")).length > 0) {
            this.cartItemDetails.walletApply = true;
            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        }
        else {
            this.cartItemDetails.walletApply = false;
            this.walletBalance = this.perWalletBal;
            this.cartItemDetails.payment.usedWalletAmount = 0;
            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        };
        if (this.walletBalance == null || this.walletBalance == undefined || this.walletBalance == 0) {
            this.walletErrorMessage = "Please Enter Valid Wallet Amount";
            return;
        }
        else this.walletErrorMessage = "";

        if ((<any>$("#checkWalletAmount:checked")).length > 0) this.cartItemDetails.walletApply = true;
        else {
            this.cartItemDetails.walletApply = false;
            this.cartItemDetails.payment.usedWalletAmount = this.usedWalletAmount = 0;
            this.cartItemDetails.payment.finalAmount = this.calculateFinalPayment(this.cartItemDetails);
        };
        this.calculateBasket();
    };

    ngOnDestroy(): void {
        this.walletSubscription.unsubscribe();
        this.odPercentSubscription.unsubscribe();
    }

}
