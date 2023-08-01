import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { FileUtil } from './../../../base/util/file-util';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnChanges, OnDestroy, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ValidationUtil } from '../../../base/util/validation-util';
import { Config } from '../../../base/config';
import { BasketConstants } from '../../../constants/basket/basketconstants';
import { ResponseConstants } from '../../../constants/common/responseconstants';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { BasketDiscount } from '../../../model/package/basketDiscount';
import { BookedPackageResponse } from '../../../model/package/bookedPackageResponse';
import { PackageService } from '../../../packages/package.service';
import { SpinnerService } from '../spinner/spinner.service';
import { Taxes } from '../../../model/basket/taxes';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
import { CommonUtil } from '../../../base/util/common-util';
import { PocSearch } from '../../../model/poc/pocSearch';
import { ReferredBy } from '../../../model/basket/referredBy';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { AuthService } from '../../../auth/auth.service';
import { WalletDetails } from '../../../model/basket/walletDetails';
import { ToasterService } from '../../toaster/toaster.service';
import { DiagnosticClient } from '../../../model/diagnostics/diagnosticClient';


@Component({
    selector: 'app-slotbookingdiscount',
    templateUrl: './slotbookingdiscount.template.html',
    styleUrls: ['./slotbookingdiscount.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DiscountComponent implements OnInit, OnDestroy, OnChanges {
    couponCode: string = "";
    couponDiscountAmount: number = 0;
    statusMessage: string = "";
    statusMessage1: string = "";
    walletErrorMessage: string = "";
    dropDownIndex: number = 0;
    dropDownIndex1: number = 0;
    perWalletBal: number = 0;
    enableDocTypeDropDown: boolean;
    filesLength: number = 0;
    i: number;

    @Input()
    slotBookingDetails: SlotBookingDetails;
    packageList: BookedPackageResponse[];
    followUpDiscount: BasketDiscount[];
    packageNamesShow: boolean = false;
    followUpNameShow: boolean = false;
    @Input()
    onlyPayment: boolean = false;
    @Input()
    discountType: number;
    @Input()
    promotionalDiscount: number = 0;
    @Input()
    isReception: boolean = false;
    @Output()
    calculateDiscount: EventEmitter<SlotBookingDetails> = new EventEmitter();

    @Output()
    hasError: EventEmitter<any> = new EventEmitter();

    basketRequest: BasketRequest;

    isFirstChange: boolean = true;
    isOtherDiscount = false;

    otherDiscountMode = 0;
    otherDiscountAmount: number = 0;
    otherDiscountAmountPercent: number = 0;
    otherDiscountValue: number = 0;
    otherDiscountPercent: number = 0;
    walletAmount: WalletDetails;
    walletBalance: number = 0;
    postWalletAmount: number = 0;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    usedWalletAmount: number = 0;
    privilegeCardDiscount: number = 0;
    taxationAmount: number = 0;

    searchPocTotal: number = 0;
    key: string;
    pocSearchList: any[] = new Array<any>();
    selectedPoc: any;
    // discountedAmount: number = 0;

    validation: ValidationUtil;

    @Input()
    isOldRecord = false;
    showPostWallet = false;
    showReferredBy: boolean = false;
    showWallet: boolean = false;
    otherDiscountError: boolean = false;
    cashBackAmount: number
    selectColumns: any[] = [
        {
            variable: 'pocName',
            filter: 'text'
        }
    ];

    debounceTime = 500;
    currencySymbol: string = '';
    currencyCode: string = '';

    private walletModelChanged: Subject<string> = new Subject<string>();
    private walletSubscription: Subscription;

    private odPercentModelChanged: Subject<string> = new Subject<string>();
    private odPercentSubscription: Subscription;

    enableClientBilling: boolean = false;
    enableVdcCustomTag: boolean = false;
    diagnosticClientList: DiagnosticClient[];
    disableDiagnosticHomePartnerDiscount: boolean = false;
    disableDiagnosticHomePackageDiscount: boolean = false;
    disableDiagnosticHomeCouponDiscount: boolean = false;
    disableDiagnosticWalkinPartnerDiscount: boolean = false;
    disableDiagnosticWalkinPackageDiscount: boolean = false;
    disableDiagnosticWalkinCouponDiscount: boolean = false;
    isDiagnosticHomeOrder: boolean = false;
    isDiagnosticWalkinOrder: boolean = false;
    phleboVendorAssignment: boolean = false;

    uploadFilesList: any;
    hasCheckBoxValidation: boolean = false;
    proofDocumentList: Array<string> = [];
    checkBoxValidationMessage: string;
    @ViewChild('diagnosticFileUpload', { static: false })
    myInputVariable: any;
    documentList: any = [];
    documentId: number = -1;
    alertCheckbox: boolean = false;
    clientDoc: Array<string> = [];
    scanDocClientIndex: number = 0;
    clientSubTypeName: string = "";
    firstClient: number = 1;
    yodaCheck: boolean = false;

    constructor(private authService: AuthService, private spinnerService: SpinnerService, private packageService: PackageService,
        private commonUtil: CommonUtil, private diagnosticService: DiagnosticsService, private validationUtil: ValidationUtil, private fileUtil: FileUtil,
        private cd: ChangeDetectorRef, private superAdminService: SuperAdminService, private toast: ToasterService) {
        this.validation = validationUtil;
        this.showPostWallet = Config.portal.customizations.postWalletEnabled;
        if (Config.portal && Config.portal.customizations && Config.portal.customizations.referredByCheckout) {
            this.showReferredBy = true;
        }
        if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableClientBilling) {
            this.enableClientBilling = true;
        }
        if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName) {
            this.enableVdcCustomTag = true;
        }
        if (Config.portal && Config.portal.currencySymbol) {
            this.currencySymbol = Config.portal.currencySymbol;
            this.currencyCode = Config.portal.currencyCode
        }
        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticHomePartnerDiscount) {
            this.disableDiagnosticHomePartnerDiscount = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticHomePackageDiscount) {
            this.disableDiagnosticHomePackageDiscount = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticHomeCouponDiscount) {
            this.disableDiagnosticHomeCouponDiscount = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticWalkinPartnerDiscount) {
            this.disableDiagnosticWalkinPartnerDiscount = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticWalkinPackageDiscount) {
            this.disableDiagnosticWalkinPackageDiscount = true;
        }

        if (Config.portal.customizations && Config.portal.customizations.disableDiagnosticWalkinCouponDiscount) {
            this.disableDiagnosticWalkinCouponDiscount = true;
        }

        if (Config.portal && Config.portal.customizations && Config.portal.customizations.enableMapsLink)
            this.yodaCheck = true;

        if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
            this.phleboVendorAssignment = true;
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

    getDiagnosticClients() {
        // 2- clients & 1- general        
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        let firstClient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('firstClient')));
        if (firstClient)
            this.firstClient = 2;
        this.diagnosticService.getDiagnosticClients(this.firstClient).then(repsonse => {
            this.diagnosticClientList = repsonse;
            if (this.slotBookingDetails.privilegeCardType && this.slotBookingDetails.privilegeCardType > 0) {
                let index = this.diagnosticClientList.findIndex(client => {
                    return client.privilegeType == this.slotBookingDetails.privilegeCardType && client.clientName == this.slotBookingDetails.clientName;
                });
                if (index > 0) {
                    this.documentList = this.diagnosticClientList[index].documentList;
                    this.dropDownIndex = index;
                }
                else
                    this.dropDownIndex = 0;
            }
            else {
                this.documentList = this.diagnosticClientList[0].documentList;
                this.slotBookingDetails.scanDocumentsList = [];
            }
            this.diagnosticService.clientDocumentList = this.documentList;
        }).catch(err => {
            console.error("Error occurred while fetching the client list", err);
        })
    }

    onClientChange(index: number) {
        this.slotBookingDetails.payment.creditUser = 2;
        this.alertCheckbox = false;
        this.slotBookingDetails.additionalInfo = "";
        this.slotBookingDetails.scanDocumentsList = [];
        if (this.diagnosticClientList && this.diagnosticClientList[index]) {
            this.slotBookingDetails.privilegeCardType = this.diagnosticClientList[index].privilegeType;
            if (this.diagnosticClientList[index].documentList != null && this.diagnosticClientList[index].documentList != undefined) {
                this.documentList = this.diagnosticClientList[index].documentList;
                this.documentId = -1;
                this.diagnosticService.clientDocumentList = this.documentList;
            }
            else
                this.documentList = [];
            this.calculateDiscount.emit(this.slotBookingDetails);
            this.calculateBasket();
        }
    }

    onClientDocType(index: number) {
        this.documentId = index;
        this.hasCheckBoxValidation = false;
    }

    walletInputChanged() {
        this.walletModelChanged.next(null);
    }

    otherDiscountInputChanged() {
        this.odPercentModelChanged.next(null);
    }

    ngOnChanges(): void {
        console.log("isOldRecord: " + this.isOldRecord);
        console.log("ngOnChanges: " + JSON.stringify(this.slotBookingDetails));

        //  Disable input scroll 
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
        if (Config.portal.customizations.walletEnabled == true) {
            this.showWallet = true;
            (<any>$)("#checkWalletAmount").prop("checked", false);
            this.slotBookingDetails.walletApply = false;
            this.walletAmount = new WalletDetails();
            this.getWalletAmount();
        }
        if ((!this.isOldRecord && !this.onlyPayment) && this.slotBookingDetails.parentProfileId > 0) {
            this.getPackages();
        }
        if (this.slotBookingDetails.bookingType == SlotBookingDetails.BOOKING_TYPE_INVESTIGATION && this.enableClientBilling) {
            this.getDiagnosticClients();
        }
        if (this.isReception) {
            this.dropDownIndex = 0;
            this.dropDownIndex1 = 0;
            this.slotBookingDetails.packageName = "NA";
            this.slotBookingDetails.payment.packageDiscountAmount = 0;
            this.slotBookingDetails.userPackageId = 0;
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.resetCoupon();
            this.promotionalDiscount = 0;
            this.otherDiscountValue = 0;
            this.calculateBasket();
        } else {
            let originalAmount: number = 0;
            this.promotionalDiscount = 0;
            this.taxationAmount = 0;

            let itemsList: any[];
            let shouldReset: boolean = false;
            if (this.slotBookingDetails.serviceList && this.slotBookingDetails.serviceList.length > 0) {
                itemsList = this.slotBookingDetails.serviceList;
                shouldReset = true;
            }

            if (!this.slotBookingDetails.payment.taxationAmount) {
                this.slotBookingDetails.payment.taxationAmount = 0;
                this.taxationAmount = 0;
            }

            if (!this.slotBookingDetails.payment.otherDiscountAmount) {
                this.slotBookingDetails.payment.otherDiscountAmount = 0;
            }

            if (!this.slotBookingDetails.payment.packageDiscountAmount) {
                this.slotBookingDetails.payment.packageDiscountAmount = 0;
            }

            if (this.slotBookingDetails && this.slotBookingDetails.isReset) {
                this.taxationAmount = 0;
                this.dropDownIndex = 0;
                this.dropDownIndex1 = 0;
                this.slotBookingDetails.packageName = "NA";
                this.slotBookingDetails.payment.packageDiscountAmount = 0;
                this.slotBookingDetails.userPackageId = 0;
                this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
                this.resetCoupon();
            } else {
                if (this.slotBookingDetails && this.slotBookingDetails.basketDiscount) {
                    setTimeout(() =>
                        this.slotBookingDetails.basketDiscount.forEach(e => {
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

                    }
                }
            } else {
                this.dropDownIndex = 0;
                this.dropDownIndex1 = 0;
                this.slotBookingDetails.packageName = "NA";
                this.slotBookingDetails.payment.packageDiscountAmount = 0;
                this.slotBookingDetails.userPackageId = 0;
                this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
                this.resetCoupon();
                this.promotionalDiscount = 0;
            }

            if (this.isOldRecord && this.slotBookingDetails.basketDiscount && itemsList) {
                this.slotBookingDetails.basketDiscount.forEach((item) => {
                    if (item.type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                        this.couponDiscountAmount = this.roundToTwo(item.discountAmount);
                        this.cashBackAmount = this.roundToTwo(item.cashbackAmount);
                    } else if (item.type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        this.otherDiscountAmountPercent = item.percent;
                        this.otherDiscountAmount = item.discountAmount;
                    }
                });
            }

            this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(this.couponDiscountAmount + this.otherDiscountAmount +
                this.promotionalDiscount);

            this.slotBookingDetails.payment.originalAmount = parseFloat(originalAmount.toFixed(2));
            if (this.taxationAmount && this.taxationAmount > 0) {
                this.calculateFinalValue();
            }
            this.calculateBasket();
            this.slotBookingDetails.payment.finalAmount = this.roundToTwo(this.slotBookingDetails.payment.originalAmount
                + this.slotBookingDetails.payment.taxationAmount
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - this.slotBookingDetails.payment.packageDiscountAmount
                - this.slotBookingDetails.payment.otherDiscountAmount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0));
            if (this.promotionalDiscount > 0) {
                let basketDiscount = new BasketDiscount();
                basketDiscount.discountAmount = this.promotionalDiscount;
                basketDiscount.type = BasketConstants.DISCOUNT_TYPE_PROMOTIONAL;
                this.setBasketDiscount(basketDiscount);
            }
        }

        if (this.slotBookingDetails && this.slotBookingDetails.bookingType == SlotBookingDetails.BOOKING_TYPE_INVESTIGATION) {
            if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
                this.isDiagnosticHomeOrder = true;
            } else if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
                this.isDiagnosticWalkinOrder = true;
            }
        }

        console.log("ngChange: " + this.couponDiscountAmount + ">>>>>" + this.otherDiscountAmount + ">>>>>>" +
            this.promotionalDiscount + ">>>>>>" + this.slotBookingDetails.payment.packageDiscountAmount + ">>>>>>" +
            this.slotBookingDetails.payment.finalAmount);
        this.usedWalletAmount = this.slotBookingDetails.payment.usedWalletAmount
    }

    calculateFinalValue(): void {
        if (this.taxationAmount && this.taxationAmount > 0) {

            if (+this.promotionalDiscount == 0) {
                let basketDiscountPromotional = this.slotBookingDetails.basketDiscount.find(item => item.type == BasketConstants.DISCOUNT_TYPE_PROMOTIONAL);
                if (basketDiscountPromotional && basketDiscountPromotional.discountAmount > 0) {
                    this.promotionalDiscount = +basketDiscountPromotional.discountAmount;
                }
            }

            let discountPercent: number = 0;
            let totalDiscount = +this.slotBookingDetails.payment.otherDiscountAmount + +this.slotBookingDetails.payment.packageDiscountAmount - this.promotionalDiscount;
            if (totalDiscount > 0 && this.slotBookingDetails.payment.originalAmount > 0) {
                discountPercent = this.roundToTwo((+totalDiscount / (+this.slotBookingDetails.payment.originalAmount - this.promotionalDiscount)) * 100);
            }

            if (discountPercent > 0) {
                this.slotBookingDetails.payment.taxationAmount = this.roundToTwo(+this.taxationAmount
                    * (1 - (+this.roundToTwo(discountPercent) / 100)));
            } else {
                this.slotBookingDetails.payment.taxationAmount = this.taxationAmount;
            }

        } else {
            this.slotBookingDetails.payment.taxationAmount = 0;
        }
        this.slotBookingDetails.payment.finalAmount = this.roundToTwo(+this.slotBookingDetails.payment.originalAmount
            + +this.slotBookingDetails.payment.taxationAmount
            - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
            - +this.slotBookingDetails.payment.otherDiscountAmount
            - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
            - +this.slotBookingDetails.payment.packageDiscountAmount
            + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
            + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0));

        console.log("Logg2: " + this.slotBookingDetails.payment.finalAmount + ">>>>: " +
            this.slotBookingDetails.payment.originalAmount + ">>>>:" +
            this.slotBookingDetails.payment.taxationAmount +
            ">>>>>: " + this.slotBookingDetails.payment.otherDiscountAmount +
            ">>>>: " + this.slotBookingDetails.payment.packageDiscountAmount +
            ">>>>:" + this.slotBookingDetails.deliveryAmount);
        this.calculateDiscount.emit(this.slotBookingDetails);
    }

    applyCoupon() {
        const basketDiscount: BasketDiscount = new BasketDiscount();
        basketDiscount.type = BasketConstants.DISCOUNT_TYPE_COUPON;
        basketDiscount.name = this.couponCode;
        this.setBasketDiscount(basketDiscount);
        this.statusMessage1 = "";
        this.slotBookingDetails.userPackageId = 0;
        this.slotBookingDetails.packageName = "NA";
        this.dropDownIndex = 0;
        this.dropDownIndex1 = 0;
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.slotBookingDetails.payment.packageDiscountAmount = 0;
        this.otherDiscountValue = this.otherDiscountPercent = 0;
        this.slotBookingDetails.payment.usedWalletAmount = 0;
        (<any>$)("#checkWalletAmount").prop("checked", false);
        this.walletErrorMessage = "";
        console.log("Logg: " + this.slotBookingDetails.payment.originalAmount + ">>>>:" +
            this.promotionalDiscount + ">>>>>: " + this.slotBookingDetails.deliveryAmount + ">>>>>: " + this.slotBookingDetails.payment.otherDiscountAmount);

        this.slotBookingDetails.payment.finalAmount = this.slotBookingDetails.payment.originalAmount
            - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
            - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
            - this.promotionalDiscount
            + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
            + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
        this.slotBookingDetails.payment.otherDiscountAmount = this.promotionalDiscount;
        this.calculateBasket();
        // this.onWalletChecked();
    }

    onKeyUp(key) {
        if (this.couponCode == "") {
            this.statusMessage = "";
            this.couponDiscountAmount = 0;
            if (this.slotBookingDetails.basketDiscount) {
                for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                    if (this.slotBookingDetails.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_COUPON) {
                        this.slotBookingDetails.basketDiscount.splice(i, 1);
                    }
                }
            }
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.slotBookingDetails.payment.finalAmount = this.slotBookingDetails.payment.originalAmount
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - this.promotionalDiscount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
            this.slotBookingDetails.payment.otherDiscountAmount = this.promotionalDiscount;
        }
    }

    onFollowUpChange(index: number) {
        this.resetCoupon();
        let basketDiscount = new BasketDiscount();
        this.slotBookingDetails.userPackageId = 0;
        this.slotBookingDetails.packageName = "NA";
        this.dropDownIndex = 0;
        this.couponDiscountAmount = 0;
        this.slotBookingDetails.payment.packageDiscountAmount = 0;
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.slotBookingDetails.payment.usedWalletAmount = 0;
        this.walletErrorMessage = "";
        (<any>$)("#checkWalletAmount").prop("checked", false);
        this.slotBookingDetails.walletApply = false;
        // this.otherDiscountValue = this.otherDiscountPercent = 0;
        this.otherDiscountPercent = this.followUpDiscount[index].percent;
        this.otherDiscountValue = this.roundToTwo(((this.slotBookingDetails.payment.originalAmount - this.slotBookingDetails.payment.packageDiscountAmount - this.couponDiscountAmount) * this.otherDiscountPercent) / 100);
        this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(+this.otherDiscountAmount + +this.couponDiscountAmount + +this.promotionalDiscount + this.otherDiscountValue ? this.otherDiscountValue : 0);

        basketDiscount.type = BasketConstants.DISCOUNT_TYPE_DOCTOR_FOLLOWUP;
        basketDiscount.percent = this.otherDiscountPercent;
        basketDiscount.discountAmount = this.otherDiscountValue;
        basketDiscount.id = this.followUpDiscount[index].id;
        this.setBasketDiscount(basketDiscount);
        if (this.slotBookingDetails.basketDiscount) {
            for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
                if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
            }
        }
        if (this.otherDiscountValue > 0) {
            this.slotBookingDetails.typeOfAppointment = 1;
        }
        else {
            this.slotBookingDetails.typeOfAppointment = 0;
        }
        this.slotBookingDetails.payment.finalAmount =
            this.roundToTwo(this.slotBookingDetails.payment.originalAmount
                + (this.slotBookingDetails.payment.taxationAmount ? this.slotBookingDetails.payment.taxationAmount : 0)
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - (this.slotBookingDetails.payment.packageDiscountAmount ? this.slotBookingDetails.payment.packageDiscountAmount : 0)
                - (this.slotBookingDetails.payment.otherDiscountAmount ? this.slotBookingDetails.payment.otherDiscountAmount : 0)
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0));
        console.log("======>>>followUpDiscount ", this.slotBookingDetails.payment.finalAmount, " ===>>>", this.slotBookingDetails.payment.otherDiscountAmount);

        this.calculateDiscount.emit(this.slotBookingDetails);
        this.calculateBasket();
    }

    onDiscountDropDownChange(index: number) {
        this.resetError();
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        this.dropDownIndex1 = 0;
        this.otherDiscountValue = this.otherDiscountPercent = 0;
        this.slotBookingDetails.payment.packageDiscountAmount = 0;
        this.slotBookingDetails.payment.usedWalletAmount = 0;
        this.slotBookingDetails.userPackageId = 0;
        this.couponDiscountAmount = 0;
        (<any>$)("#checkWalletAmount").prop("checked", false);
        this.resetCoupon();
        this.hasError.emit(false);
        if (this.slotBookingDetails.basketDiscount) {
            for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
                if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_DOCTOR_FOLLOWUP) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
                if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
            }
        }

        this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(this.promotionalDiscount + this.otherDiscountValue);

        console.log(index + " onDiscountDropDownChange: " + JSON.stringify(this.packageList));
        if (index == 0) {
            this.slotBookingDetails.packageName = null;
            this.slotBookingDetails.payment.finalAmount = this.roundToTwo(this.slotBookingDetails.payment.originalAmount
                + (this.slotBookingDetails.payment.taxationAmount ? this.slotBookingDetails.payment.taxationAmount : 0)
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - (this.slotBookingDetails.payment.otherDiscountAmount ? this.slotBookingDetails.payment.otherDiscountAmount : 0)
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0));
            this.calculateDiscount.emit(this.slotBookingDetails);
            return;
        } else {
            let selectedPackage: BookedPackageResponse = this.packageList[index];
            this.slotBookingDetails.userPackageId = selectedPackage.userPackageId;
            this.slotBookingDetails.packageName = selectedPackage.packageName;

            this.slotBookingDetails.payment.finalAmount = this.slotBookingDetails.payment.originalAmount
                + (this.slotBookingDetails.payment.taxationAmount ? this.slotBookingDetails.payment.taxationAmount : 0)
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - this.slotBookingDetails.payment.otherDiscountAmount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
            console.log("followUpOtherDiscountAmoount===>>> ", this.slotBookingDetails.payment.otherDiscountAmount, "=====>>> ", this.slotBookingDetails.payment.finalAmount)
            this.calculateBasket();
            // this.onWalletChecked();
        }
    }


    calculateBasket() {
        console.log("Calculate Basket >>> ", this.slotBookingDetails);

        let basketRequest = new BasketRequest();
        if (!this.slotBookingDetails.empId || this.slotBookingDetails.empId == 0) {
            this.slotBookingDetails.empId = this.authService.userAuth.employeeId;
        }
        if (!this.slotBookingDetails.bookingSource || this.slotBookingDetails.bookingSource == 0) {
            this.slotBookingDetails.bookingSource = 3;
        }

        this.privilegeCardDiscount = 0;

        basketRequest.parentProfileId = this.slotBookingDetails.parentProfileId;
        basketRequest.slotBookingDetailsList = new Array<SlotBookingDetails>();
        basketRequest.slotBookingDetailsList[0] = this.slotBookingDetails;

        // $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.diagnosticService.calculateBasket(basketRequest).then((basketResponse) => {
            this.spinnerService.stop();

            this.statusMessage = "";
            if (basketResponse && basketResponse.statusCode == ResponseConstants.SUCCESS) {
                this.slotBookingDetails.basketDiscount.forEach((item) => {
                    if (item.type === BasketConstants.DISCOUNT_TYPE_COUPON && item.name != "") {
                        this.statusMessage = "coupon applied"
                        this.toast.show("Coupon applied successfully", "bg-success text-white font-weight-bold", 3000);
                    }
                    if (item.type === BasketConstants.DISCOUNT_TYPE_PARTNER)
                        this.toast.show("Additional Discount applied successfully", "bg-success text-white font-weight-bold", 3000);
                })
            }
            if (basketResponse && basketResponse.slotBookingDetailsList && basketResponse.slotBookingDetailsList[0]) {
                this.slotBookingDetails.statusCode = basketResponse.slotBookingDetailsList[0].statusCode;
                this.slotBookingDetails.statusMessage = basketResponse.slotBookingDetailsList[0].statusMessage;
                this.slotBookingDetails.payment = basketResponse.slotBookingDetailsList[0].payment;
                this.slotBookingDetails.deliveryAmount = basketResponse.slotBookingDetailsList[0].deliveryAmount;
                this.slotBookingDetails.basketDiscount = basketResponse.slotBookingDetailsList[0].basketDiscount;
                this.slotBookingDetails.userPackageId = basketResponse.slotBookingDetailsList[0].userPackageId;
                (basketResponse.slotBookingDetailsList[0].clientName && basketResponse.slotBookingDetailsList[0].clientName.length > 0) ? this.slotBookingDetails.clientName = basketResponse.slotBookingDetailsList[0].clientName : this.slotBookingDetails.clientName = '';
                (basketResponse.slotBookingDetailsList[0].note && basketResponse.slotBookingDetailsList[0].note.length > 0) ? this.slotBookingDetails.note = basketResponse.slotBookingDetailsList[0].note : this.slotBookingDetails.note = '';
                (basketResponse.slotBookingDetailsList[0].additionalInfo && basketResponse.slotBookingDetailsList[0].additionalInfo.length > 0) ? this.slotBookingDetails.additionalInfo = basketResponse.slotBookingDetailsList[0].additionalInfo : this.slotBookingDetails.additionalInfo = '';
                this.slotBookingDetails.privilegeCardType = basketResponse.slotBookingDetailsList[0].privilegeCardType;
            }

            if (this.slotBookingDetails.basketDiscount && this.slotBookingDetails.basketDiscount.length > 0) {
                for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                    if (this.slotBookingDetails.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        if (this.slotBookingDetails.basketDiscount[i].valueDiscount) {
                            this.otherDiscountValue = this.otherDiscountAmount = this.slotBookingDetails.basketDiscount[i].discountAmount;
                        } else {
                            this.otherDiscountAmount = this.slotBookingDetails.basketDiscount[i].discountAmount;
                            this.otherDiscountAmountPercent = this.slotBookingDetails.basketDiscount[i].percent;
                        }
                    }
                }
            }
            if (this.slotBookingDetails.payment.taxationAmount && this.slotBookingDetails.payment.taxationAmount > 0) {
                this.taxationAmount = this.slotBookingDetails.payment.taxationAmount;
            }

            if (this.slotBookingDetails && this.slotBookingDetails.payment
                && (this.slotBookingDetails.payment.usedWalletAmount > 0
                    || this.slotBookingDetails.payment.usedPostWalletAmount > 0)) {
                this.showWallet = true;
                this.slotBookingDetails.walletApply = true;
                this.toast.show("Wallet Amount applied successfully", "bg-success text-white font-weight-bold", 3000);
            }

            if (this.slotBookingDetails.basketDiscount && this.slotBookingDetails.basketDiscount.length > 0) {
                let baskDiscArr = this.slotBookingDetails.basketDiscount.filter(item => item.type == BasketConstants.DISCOUNT_TYPE_PRIVELEGE_CARD);
                if (baskDiscArr && baskDiscArr.length > 0) {
                    this.privilegeCardDiscount = baskDiscArr[0].discountAmount;
                }
            }

            if (this.slotBookingDetails && this.slotBookingDetails.statusCode
                && this.slotBookingDetails.statusCode != ResponseConstants.SUCCESS
                && this.slotBookingDetails.statusCode != ResponseConstants.SUCCESS_UPDATED) {
                this.errorMessage = new Array();
                this.errorMessage.push(this.slotBookingDetails.statusMessage);
                this.showMessage = true;
                this.isError = true;
            }

            if (basketResponse && basketResponse.statusCode && basketResponse.statusCode != ResponseConstants.SUCCESS
                && basketResponse.statusCode != ResponseConstants.SUCCESS_UPDATED) {
                // this.toast.show(basketResponse.statusMessage, "bg-danger text-white font-weight-bold", 3000);

                (<any>$)("#checkWalletAmount").prop("checked", false);
                this.slotBookingDetails.walletApply = false;
            }

            if (this.slotBookingDetails.additionalInfo && this.slotBookingDetails.additionalInfo.length && !this.alertCheckbox) {
                if (!this.slotBookingDetails.privilegeCardType || this.slotBookingDetails.privilegeCardType == 0) {
                    this.dropDownIndex = 0;
                }
                alert(this.slotBookingDetails.additionalInfo);
                this.alertCheckbox = true;
            }

            console.log('After calculate Basket >>> ', this.slotBookingDetails);
        });
        this.cd.detectChanges();
    }

    getWalletAmount(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.packageService.getWalletAmount(this.slotBookingDetails.parentProfileId, this.showPostWallet).then(data => {
            this.spinnerService.stop();
            this.walletAmount = data;
            this.postWalletAmount = data.postWalletBalance;
            this.walletBalance = this.perWalletBal = data.walletBalance >= 100 ? 100 : data.walletBalance;
        });
    };
    onPostWalletChecked() {
        if ((<any>$("#checkPostWalletAmount:checked")).length > 0) {
            if (this.slotBookingDetails.payment.finalAmount > this.postWalletAmount)
                this.slotBookingDetails.payment.usedPostWalletAmount = this.postWalletAmount;
            else this.slotBookingDetails.payment.usedPostWalletAmount = this.slotBookingDetails.payment.finalAmount;
        }
        else this.slotBookingDetails.payment.usedPostWalletAmount = 0;
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
        // this.otherDiscountValue = this.otherDiscountPercent = 0;
        // this.dropDownIndex1 = 0;
        // if (this.slotBookingDetails.basketDiscount) {
        //     for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
        //         if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_DOCTOR_FOLLOWUP) {
        //             this.slotBookingDetails.basketDiscount.splice(i, 1);
        //         }
        //         if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
        //             this.slotBookingDetails.basketDiscount.splice(i, 1);
        //         }
        //     }
        // }
        if (this.walletBalance > this.slotBookingDetails.payment.finalAmount)
            this.walletBalance = this.slotBookingDetails.payment.finalAmount;
        this.slotBookingDetails.payment.usedWalletAmount = this.usedWalletAmount = this.walletBalance;
        if ((<any>$("#checkWalletAmount:checked")).length > 0) {
            this.slotBookingDetails.walletApply = true;
            this.slotBookingDetails.payment.finalAmount = +this.slotBookingDetails.payment.originalAmount
                + (+this.slotBookingDetails.payment.taxationAmount ? +this.slotBookingDetails.payment.taxationAmount : 0)
                - this.slotBookingDetails.payment.usedWalletAmount - this.otherDiscountAmount - this.promotionalDiscount
                - this.slotBookingDetails.payment.packageDiscountAmount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
        }
        else {
            this.slotBookingDetails.walletApply = false;
            this.slotBookingDetails.payment.usedWalletAmount = this.usedWalletAmount = 0;
            this.walletBalance = this.perWalletBal;
            this.slotBookingDetails.payment.finalAmount = +this.slotBookingDetails.payment.originalAmount;
            + (+this.slotBookingDetails.payment.taxationAmount ? +this.slotBookingDetails.payment.taxationAmount : 0)
                - this.slotBookingDetails.payment.usedWalletAmount - this.otherDiscountAmount - this.promotionalDiscount
                - this.slotBookingDetails.payment.packageDiscountAmount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
        };
        if (this.walletBalance == null || this.walletBalance == undefined || this.walletBalance == 0) {
            this.walletErrorMessage = "Please Enter Valid Wallet Amount";
            return;
        }
        else this.walletErrorMessage = "";
        this.calculateBasket();
    };

    getPackages(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.packageService.getBookedPackagesList(this.slotBookingDetails.parentProfileId, this.slotBookingDetails.serviceId ? this.slotBookingDetails.serviceId : 0,
            this.slotBookingDetails.doctorId ? this.slotBookingDetails.doctorId : 0,
            this.discountType, this.slotBookingDetails.pocId ? this.slotBookingDetails.pocId : 0, this.slotBookingDetails.slotDate).then((data) => {
                this.spinnerService.stop();
                if ((data != null && data.packageDiscountList != null && data.packageDiscountList.length > 0) ||
                    (data != null && data.otherDiscountList != null && data.otherDiscountList.length > 0)) {
                    if (data.packageDiscountList) {
                        this.followUpDiscount = new Array<BasketDiscount>();
                        this.packageList = new Array<BookedPackageResponse>();
                        let bookedPackage = new BookedPackageResponse();
                        this.packageNamesShow = true;
                        this.followUpNameShow = false;
                        bookedPackage.userPackageId = 0;
                        bookedPackage.packageName = 'Select a package';
                        this.packageList[0] = bookedPackage;
                        data.packageDiscountList.forEach((element) => {
                            if (element.profileId === this.slotBookingDetails.patientProfileId) {
                                this.packageList.push(element);
                                this.slotBookingDetails.payment.packageDiscountAmount = 0;
                            }
                        });
                        this.onDiscountDropDownChange(0);
                    }
                    if (data.otherDiscountList && this.slotBookingDetails.bookingType == SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT) {
                        this.followUpDiscount = new Array<BasketDiscount>();
                        let selectedFollowUp = new BasketDiscount();
                        selectedFollowUp.name = 'Select a FollowUp Discount';
                        this.followUpNameShow = true;
                        console.log("=====>>>followUpname ", this.followUpNameShow, this.onlyPayment)
                        this.followUpDiscount[0] = selectedFollowUp;
                        data.otherDiscountList.forEach(ele => {
                            if (ele.profileId === this.slotBookingDetails.patientProfileId) {
                                this.followUpDiscount.push(ele);
                            }
                        });
                    }
                }
                else {
                    this.packageList = new Array<BookedPackageResponse>();
                    this.followUpDiscount = new Array<BasketDiscount>();
                    let bookedPackage = new BookedPackageResponse();
                    bookedPackage.packageName = "No packages found";
                    this.packageNamesShow = false;
                    this.followUpNameShow = false;
                    console.log("=====>>>followUpname ", this.followUpNameShow)

                    this.onDiscountDropDownChange(0);
                }
            });
    }

    checkDiscountSelection(index: number) {
        this.otherDiscountMode = index;
        this.applyOtherDiscount();
    }

    applyOtherDiscount() {
        this.otherDiscountError = false;
        console.log("Pavana----", this.otherDiscountAmountPercent)
        let payableAmount = this.slotBookingDetails.payment.originalAmount
            - this.slotBookingDetails.payment.packageDiscountAmount
            - this.couponDiscountAmount - this.promotionalDiscount;
        if (this.otherDiscountAmountPercent < 0 || this.otherDiscountAmountPercent > 100 || this.otherDiscountAmount < 0 ||
            this.otherDiscountAmount > payableAmount) {
            this.otherDiscountError = true;
            this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
            this.slotBookingDetails.payment.finalAmount = +this.slotBookingDetails.payment.originalAmount
                + (+this.slotBookingDetails.payment.taxationAmount ? +this.slotBookingDetails.payment.taxationAmount : 0)
                - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
                - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
                - this.otherDiscountAmount - this.promotionalDiscount
                - this.slotBookingDetails.payment.packageDiscountAmount
                + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
                + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);
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
                this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount);
                if (this.slotBookingDetails.basketDiscount) {
                    for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                        if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                            this.slotBookingDetails.basketDiscount.splice(i, 1);
                        }
                    }
                }
            } else {

                this.otherDiscountAmount = this.roundToTwo(+payableAmount * (+this.otherDiscountAmountPercent / 100));
                this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(+this.otherDiscountAmount + +this.couponDiscountAmount + +this.promotionalDiscount);
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
                this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount);
                this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
                if (this.slotBookingDetails.basketDiscount) {
                    for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                        if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                            this.slotBookingDetails.basketDiscount.splice(i, 1);
                        }
                    }
                }
            } else {
                this.otherDiscountAmountPercent = this.roundToTwo((+this.otherDiscountAmount * 100) / +payableAmount);
                this.slotBookingDetails.payment.otherDiscountAmount = this.roundToTwo(+this.promotionalDiscount + +this.couponDiscountAmount + +this.otherDiscountAmount);
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
        this.slotBookingDetails.payment.finalAmount = +this.slotBookingDetails.payment.originalAmount
            + (+this.slotBookingDetails.payment.taxationAmount ? +this.slotBookingDetails.payment.taxationAmount : 0)
            - (this.slotBookingDetails.payment.usedWalletAmount ? this.slotBookingDetails.payment.usedWalletAmount : 0)
            - (this.slotBookingDetails.payment.usedPostWalletAmount ? this.slotBookingDetails.payment.usedPostWalletAmount : 0)
            - this.slotBookingDetails.payment.otherDiscountAmount
            - this.slotBookingDetails.payment.packageDiscountAmount
            + (this.slotBookingDetails.deliveryAmount ? this.slotBookingDetails.deliveryAmount : 0)
            + (this.slotBookingDetails.payment.platformCharges ? this.slotBookingDetails.payment.platformCharges : 0);

        this.calculateFinalValue();
    }

    setBasketDiscount(basketDiscount: BasketDiscount) {
        if (!this.slotBookingDetails.basketDiscount) {
            this.slotBookingDetails.basketDiscount = new Array();
        } else {
            for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                if (basketDiscount.type == BasketConstants.DISCOUNT_TYPE_COUPON && this.slotBookingDetails.basketDiscount[i]) {
                    if (this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_PARTNER) {
                        this.slotBookingDetails.basketDiscount.splice(i, 1);
                    }
                    if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === BasketConstants.DISCOUNT_TYPE_DOCTOR_FOLLOWUP) {
                        this.slotBookingDetails.basketDiscount.splice(i, 1);
                    }
                }
                if (this.slotBookingDetails.basketDiscount[i] && this.slotBookingDetails.basketDiscount[i].type === basketDiscount.type) {
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
            }
        }
        this.slotBookingDetails.basketDiscount.push(basketDiscount);
        console.log("=========>>>>followUp ", JSON.stringify(this.slotBookingDetails.basketDiscount))
    }

    resetCoupon() {
        this.couponDiscountAmount = 0;
        this.slotBookingDetails.payment.totalCashbackAmount = 0;
        this.slotBookingDetails.payment.packageCashBackAmount = 0;
        this.slotBookingDetails.payment.usedWalletAmount = 0;
        this.walletErrorMessage = "";
        this.walletBalance = this.perWalletBal;
        this.couponCode = "";
        this.hasError.emit(false);
        (<any>$)("#couponDiscount").val("");
        this.statusMessage = "";
        this.statusMessage1 = "";
        this.otherDiscountAmount = this.otherDiscountAmountPercent = 0;
        if (this.slotBookingDetails.basketDiscount) {
            for (let i = 0; i < this.slotBookingDetails.basketDiscount.length; i++) {
                if (this.slotBookingDetails.basketDiscount[i].type == BasketConstants.DISCOUNT_TYPE_COUPON) {
                    this.slotBookingDetails.payment.otherDiscountAmount = this.slotBookingDetails.payment.otherDiscountAmount -
                        this.slotBookingDetails.basketDiscount[i].discountAmount;
                    this.slotBookingDetails.payment.finalAmount = this.slotBookingDetails.payment.finalAmount +
                        this.slotBookingDetails.basketDiscount[i].discountAmount;
                    this.slotBookingDetails.basketDiscount.splice(i, 1);
                }
            }
        }
        this.applyOtherDiscount();
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
        this.slotBookingDetails.referredByBooking = new ReferredBy();
        this.slotBookingDetails.referredByBooking.referralPocId = this.selectedPoc.pocId;
        this.slotBookingDetails.referredByBooking.referralPocName = this.selectedPoc.pocName;
        this.key = this.selectedPoc.pocName;
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

    ngOnDestroy(): void {
        this.walletSubscription.unsubscribe();
        this.odPercentSubscription.unsubscribe();
    }

    fileUpload(event) {
        this.uploadFilesList = event.target.files;
        this.hasCheckBoxValidation = false;
        if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Please select atleast one file.';
            return;
        } else if (this.uploadFilesList.length > 3) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Upto three files can be uploaded at a time.';
            return;
        }
        else if (this.uploadFilesList.length > 0) {
            for (let file of this.uploadFilesList) {
                if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.pdf')) {

                }
                else {
                    this.hasCheckBoxValidation = true;
                    this.checkBoxValidationMessage = 'Only pdf, jpg & png files are supported';
                    return;
                }
            }
        }
    }

    onUploadButtonClick() {
        if (this.hasCheckBoxValidation) {
            return;
        }
        if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Please select atleast one file.';
            return;
        }
        if (this.documentId == -1) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Please select document type';
            return;
        }
        this.proofDocumentList = [];
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.filesLength = this.uploadFilesList.length;
        for (let i = 0; i < this.uploadFilesList.length; i++) {
            this.uploadFiles(this.uploadFilesList[i]);
        }
        var $el = $('#files');
        (<any>$el.wrap('<form>').closest('form').get(0)).reset();
        $el.unwrap();
    }

    uploadFiles(file) {
        this.spinnerService.start();
        this.fileUtil.fileUploadToAwsS3(null, file, 0, false, false).then((awsS3FileResult) => {
            this.spinnerService.stop();
            console.log("awsResult", JSON.stringify(awsS3FileResult));
            if (!awsS3FileResult) {
                this.hasCheckBoxValidation = true;
                this.checkBoxValidationMessage = "Something went wrong. Please try again later.";
                return;
            }
            this.proofDocumentList.push(awsS3FileResult.Location);
            console.log("proof", awsS3FileResult.Location);
            if (this.filesLength == this.proofDocumentList.length) {
                console.log("scanDocs", JSON.stringify(this.proofDocumentList))

                if (this.slotBookingDetails.scanDocumentsList.length > 0) {
                    let id = this.diagnosticClientList[this.dropDownIndex].documentList[this.documentId].documentId;
                    console.log("documentid", id, JSON.stringify(this.slotBookingDetails.scanDocumentsList));
                    this.slotBookingDetails.scanDocumentsList.forEach(doc => {
                        if (doc.documentId == id) {
                            this.proofDocumentList.forEach(item => {
                                doc.scanDocuments.push(item);
                            });
                            this.proofDocumentList = [];
                        }
                    });
                }
                console.log("lenght", this.proofDocumentList.length);
                if (this.proofDocumentList.length > 0) {
                    let body = {
                        "documentId": this.diagnosticClientList[this.dropDownIndex].documentList[this.documentId].documentId,
                        "scanDocumentId": this.diagnosticClientList[this.dropDownIndex].documentList[this.documentId].scanDocumentId,
                        "scanDocumentName": this.diagnosticClientList[this.dropDownIndex].documentList[this.documentId].scanDocumentName,
                        "scanDocuments": this.proofDocumentList
                    }
                    this.slotBookingDetails.scanDocumentsList.push(body);
                }
                this.documentId = -1;
                this.hasCheckBoxValidation = false;
                this.proofDocumentList = [];
                this.calculateDiscount.emit(this.slotBookingDetails);
            }
        }).catch(error => {
            this.spinnerService.stop();
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = "Something went wrong. Please try again later.";
            this.showMessage = true;
        });

    }

    showClientDoc(index) {
        this.clientDoc = [];
        this.scanDocClientIndex = index;
        this.clientSubTypeName = this.slotBookingDetails.scanDocumentsList[index].scanDocumentName;
        this.slotBookingDetails.scanDocumentsList[index].scanDocuments.forEach((doc) => {
            let lastIndex = doc.lastIndexOf('/');
            let modifiedName = doc.substring(lastIndex + 1, doc.length);
            this.clientDoc.push(modifiedName);
        });
        (<any>$("#docs")).modal("show");
    }

    remove(i) {
        this.clientDoc.splice(i, 1);
        this.slotBookingDetails.scanDocumentsList[this.scanDocClientIndex].scanDocuments.splice(i, 1);
        this.slotBookingDetails.scanDocumentsList = this.slotBookingDetails.scanDocumentsList.filter(d => d.scanDocuments.length > 0);
    }

    showDoc(i) {
        this.authService.openPDF(this.slotBookingDetails.scanDocumentsList[this.scanDocClientIndex].scanDocuments[i]);
    }

}
