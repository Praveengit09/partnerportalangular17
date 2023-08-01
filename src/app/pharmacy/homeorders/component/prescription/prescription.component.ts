import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PaymentType } from '../../../../model/payment/paymentType';
import { AuthService } from './../../../../auth/auth.service';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Payment } from './../../../../model/basket/payment';
import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { DiscountType } from './../../../../model/package/discountType';
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { BaseGenericMedicine } from './../../../../model/pharmacy/baseGenericMedicine';
import { GetProductRequest } from './../../../../model/pharmacy/getProductRequest';
import { Pharmacy } from './../../../../model/pharmacy/pharmacy';
import { PackingInformation } from './../../../../model/product/packinginformation';
import { ProductDeliveryTrack } from './../../../../model/product/productdeliverytrack';
import { StockDetails } from './../../../../model/product/stockdetails';
import { PharmacyService } from './../../../pharmacy.service';



@Component({
    selector: 'prescription',
    templateUrl: './prescription.template.html',
    styleUrls: ['./prescription.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class PharmacyPrescriptionComponent implements OnInit, OnDestroy {

    processOrderDetails: AdminPharmacyDeliveryResponse;
    approved: any;
    isError: boolean = false;
    errorMessage: Array<string>;
    showMessage: boolean = false;
    showMessagetxt: boolean = false;
    showRemarksMessagetxt: boolean = false;
    pocId: any;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;
    packageNames: string[];
    bookedPackageList: BookedPackageResponse[] = new Array();
    crouselSelectedImage: String;
    invoiceDetailList: any;
    modalMessage: string;
    actionStatus: any = ProductDeliveryTrack;
    prescriptionType = "";
    transactionId: string;
    pharmacyList: Array<Pharmacy> = new Array<Pharmacy>();
    calculatedData: any;
    discountType: number = DiscountType.TYPE_PHARMACY_DISCOUNT;
    oldRecord: boolean = true;
    agentList = [];
    agentEmpId: any = "";
    changeAgent: boolean = false;
    agentName: string = "";

    constructor(private pharmacyService: PharmacyService, private auth: AuthService, private toast: ToasterService,
        private router: Router, private spinnerService: SpinnerService, private sanitizer: DomSanitizer,
        private cdRef: ChangeDetectorRef) {
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    }

    async ngOnInit() {
        this.processOrderDetails = this.pharmacyService.pharmacyDeliveryDetails;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else {
            if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
                this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
            }
        }
        // if (!this.processOrderDetails.cashPaymentAmount && this.processOrderDetails.onlinePaymentAmount) {
        //     this.processOrderDetails.cashPaymentAmount = +this.processOrderDetails.cartItem.payment.finalAmount - +this.processOrderDetails.onlinePaymentAmount;
        // }
        this.processOrderDetails.cartItem.convertedDocumentUrlList = new Array();
        if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.proofDocumentUrlList && this.processOrderDetails.cartItem.proofDocumentUrlList.length > 0) {
            this.processOrderDetails.cartItem.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.processOrderDetails.cartItem.convertedDocumentUrlList.push(url);
                }
                else {
                    this.pharmacyService.getPdfUrl(url).then(xdata => {
                        this.processOrderDetails.cartItem.convertedDocumentUrlList.push(this.pharmacyService.tempPdfUrl);
                        // alert(this.pharmacyService.tempPdfUrl);
                    });
                }
            });
        }
        this.pharmacyList = this.processOrderDetails.cartItem.pharmacyList ? this.processOrderDetails.cartItem.pharmacyList : new Array<Pharmacy>();
        this.pharmacyList.forEach((e, ind) => {
            var productRequest = new GetProductRequest();
            productRequest.productCode = e.productCode;
            productRequest.productId = e.productId;
            productRequest.pocId = this.auth.selectedPocDetails.pocId;
            console.log('ppp==>' + JSON.stringify(e) + e.productId + !e.stockDetails + e.netPrice)
            if (this.processOrderDetails.orderType == 1 && ((e.productId && !e.stockDetails) || !e.netPrice || e.netPrice == 0))
                this.getProduct(e, productRequest).then(item => {
                    if (e.netPrice == 0 && e.grossPrice != 0) {
                        let totalTax = +e.taxes.cgstAmount + +e.taxes.igstAmount + +e.taxes.sgstAmount;
                        e.netPrice = e.grossPrice + totalTax;
                        if (!e.stockDetails.netPrice || e.stockDetails.netPrice == 0) {
                            e.stockDetails.netPrice = e.netPrice;
                            e.stockDetails.packageNetPrice = e.netPrice;
                            e.stockDetails.unitNetPrice = e.netPrice;
                        }
                        // this.pharmacyList = this.pharmacyService.calculateCost(this.pharmacyList).pharmacyList;
                    }
                    let calItem = this.pharmacyService.calculateItem(e);
                    // if (ind == this.pharmacyList.length - 1) {
                    //     this.checkPaymentCalculation();
                    // }
                });
        });
        this.checkPaymentCalculation();
        this.fetchAgentList();
        if (!this.processOrderDetails.cartItem.payment.amountPaid)
            this.processOrderDetails.cartItem.payment.amountPaid = 0;
    }
    checkPaymentCalculation() {
        let pharmaCalc: any = this.pharmacyService.calculateCost(this.pharmacyList);
        this.pharmacyList = pharmaCalc.pharmacyList;
        if (this.processOrderDetails.cartItem.payment.originalAmount != pharmaCalc.originalAmount) {
            this.processOrderDetails.cartItem.payment.originalAmount = pharmaCalc.originalAmount;
            this.processOrderDetails.cartItem.payment.taxationAmount = pharmaCalc.taxationAmount;
            this.processOrderDetails.cartItem.payment.finalAmount = pharmaCalc.finalAmount;
            let toBeCollectedAmt = pharmaCalc.finalAmount - (this.processOrderDetails.onlinePaymentAmount ? this.processOrderDetails.onlinePaymentAmount : 0);
            this.processOrderDetails.cashPaymentAmount = toBeCollectedAmt > 0 ? toBeCollectedAmt : 0;
        }
    }
    fetchAgentList() {
        if (this.processOrderDetails.actionStatus == this.actionStatus.CUSTOMER_APPROVED
            || this.processOrderDetails.actionStatus == this.actionStatus.DELIVERY_INITIATED
            || this.processOrderDetails.actionStatus == this.actionStatus.OUT_FOR_DELIVERY
            || this.processOrderDetails.actionStatus == this.actionStatus.NEW) {
            this.agentEmpId = this.processOrderDetails.employeeAccepted ? this.processOrderDetails.employeeAccepted : '';
            this.getEmployeeToAssignForDelivery();
        }
    }

    ngOnDestroy() {
        if (this.processOrderDetails) {
            this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/homeorder/homeorders']);
    }

    onGenerateEditOrder(): void {
        this.pharmacyService.pharmacyList = this.processOrderDetails.cartItem.pharmacyList;
        if (this.pocId == 2) {
            // If HS Central Pharmacy
            this.router.navigate(['/app/pharmacy/homeorder/editstock']);
            // this.router.navigate(['/app/pharmacy/homeorder/edit']);
        } else {
            this.router.navigate(['/app/pharmacy/homeorder/editstock']);
        }
    }

    onChangeAgent() {
        if (this.agentEmpId) {
            let agentdetails: any = this.agentList.filter(agent => { return this.agentEmpId == agent.empId });
            agentdetails = agentdetails && agentdetails[0];
            console.log("agentdeatails-----", JSON.stringify(agentdetails));
            this.agentName = agentdetails.firstName;
            if (agentdetails.lastName)
                this.agentName = this.agentName + ' ' + agentdetails.lastName;
            this.changeAgent = true;
        }
    }
    onEditAgent() {
        this.changeAgent = !this.changeAgent;
    }

    onDeliveredClick() {
        (<any>$("#deliveryremarkspopup")).modal("show");
        $(".modal-backdrop").not(':first').remove();
        if (this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.payment && this.processOrderDetails.cartItem.payment.paymentStatus != 1) {
            this.processOrderDetails.cartItem.payment.transactionType = 2;
        }
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
    }

    openCancelOrderModal() {
        (<any>$("#rejectModal")).modal("show");
        $(".modal-backdrop").not(':first').remove();
    }

    onInvoiceClick() {
        this.orderId = this.processOrderDetails.orderId;
        this.invoiceId = this.processOrderDetails.baseInvoiceId;
        this.spinnerService.start();
        this.pharmacyService.getOrderDetails(this.orderId, this.invoiceId).then(baseResponse => {
            this.spinnerService.stop();

            this.invoiceDetailList = baseResponse.cartItemList;
            console.log("data" + JSON.stringify(this.invoiceDetailList));
        });
    }

    invoiceClick(invoice: any) {
        console.log("pdf" + JSON.stringify(this.invoiceDetailList));

        if (this.pdfHeaderType == 0) {
            this.auth.openPDF(invoice.pdfUrlWithHeader);
        }
        else {
            this.auth.openPDF(invoice.pdfUrlWithoutHeader);
        }
    }

    checkPaymentModeSelection(transactionType: number) {
        this.processOrderDetails.cartItem.payment.transactionType = transactionType;
    }

    onRemarkSubmitClicked() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == "" || this.processOrderDetails.remarks == null) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Add Your Remark!!!";
            this.showRemarksMessagetxt = true;
            return;
        }
        if (this.processOrderDetails.cartItem.payment.paymentStatus != PaymentType.PAYMENT_STATUS_PAID
            || this.processOrderDetails.cashPaymentAmount > 0) {
            if (this.processOrderDetails.cartItem.payment.transactionType == 0) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please select a payment mode!!!";
                this.showRemarksMessagetxt = true;
                return;
            } else if (this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_CARD
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_CASH
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_PHONEPE
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_GOOGLE_PAY
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_PAYTM
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_NEFT
                || this.processOrderDetails.cartItem.payment.transactionType == Payment.PAYMENT_TYPE_UPI) {
                this.processOrderDetails.cartItem.payment.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
                this.processOrderDetails.cartItem.payment.transactionId = this.transactionId;
            }
        }
        this.processOrderDetails.actionStatus = this.actionStatus.COMPLETED;
        this.updatepharmacydeliveries();
        (<any>$("#deliveryremarkspopup")).modal('hide');
    }

    onAcceptOrder() {
        this.processOrderDetails.actionStatus = this.actionStatus.VENDOR_APPROVED;
        this.processOrderDetails.cartItem.pocId = this.pocId;
        this.updatepharmacydeliveries();
        // !this.isError?this.onGenerateEditOrder():"";
    }

    onRejectOrder() {
        this.processOrderDetails.actionStatus = this.actionStatus.VENDOR_REJECTED;
        // this.actionStatus.VENDOR_REJECTED;
        this.processOrderDetails.cartItem.pocId = this.pocId;
        this.updatepharmacydeliveries();
    }

    onGenerateConfirmOrder() {
        let canProceed: boolean = true;
        if (this.processOrderDetails && this.processOrderDetails.cartItem
            && this.processOrderDetails.cartItem.pharmacyList
            && this.processOrderDetails.cartItem.pharmacyList.length > 0) {
            this.processOrderDetails.cartItem.pharmacyList.forEach(item => {
                if (+item.quantity <= 0 || +item.grossPrice <= 0) {
                    canProceed = false;
                }
            });
        } else {
            canProceed = false;
        }
        if (canProceed) {
            this.processOrderDetails.actionStatus = this.actionStatus.CUSTOMER_APPROVED;
            this.updatepharmacydeliveries();
            this.fetchAgentList();
            this.pharmacyService.pharmacyDeliveryDetails = this.processOrderDetails;
        } else {
            $('html, body').animate({ scrollTop: '0px' }, 300);
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Cannot confirm this order. Please check the order details.";
            this.showMessage = true;
            return;
        }
    }

    onInitiateDeliveryClick() {
        let canProceed: boolean = true;
        if (this.processOrderDetails && this.processOrderDetails.cartItem
            && this.processOrderDetails.cartItem.pharmacyList
            && this.processOrderDetails.cartItem.pharmacyList.length > 0) {
            this.processOrderDetails.cartItem.pharmacyList.forEach(item => {
                if (+item.quantity <= 0 || +item.grossPrice <= 0) {
                    canProceed = false;
                }
            });
        } else {
            canProceed = false;
        }
        if (canProceed) {
            this.processOrderDetails.actionStatus = this.actionStatus.DELIVERY_INITIATED;
            this.updatepharmacydeliveries();
        } else {
            $('html, body').animate({ scrollTop: '0px' }, 300);
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Cannot initiate delivery for this order. Please check the order details.";
            this.showMessage = true;
            return;
        }
    }

    updatepharmacydeliveries(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.processOrderDetails.doctorDetail = new DoctorDetails();
        this.spinnerService.start();
        this.pharmacyService.updatepharmacydeliveries(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                if (this.processOrderDetails.actionStatus == this.actionStatus.DELIVERY_INITIATED
                    || this.processOrderDetails.actionStatus == this.actionStatus.COMPLETED
                    || this.processOrderDetails.actionStatus == this.actionStatus.VENDOR_APPROVED) {

                    if (this.processOrderDetails.actionStatus == this.actionStatus.COMPLETED) {
                        this.modalMessage = "Delivered Successfully";
                        (<any>$("#messageModal")).modal("show");
                    } else if (this.processOrderDetails.actionStatus == this.actionStatus.DELIVERY_INITIATED) {
                        this.errorMessage[0] = "Initiated Delivery";
                        this.showMessage = true;
                    } else {
                        this.errorMessage[0] = "Accepted order successfully";
                        this.showMessage = true;
                    }

                } else if (this.processOrderDetails.actionStatus == this.actionStatus.REJECTED) {
                    this.modalMessage = "Cancelled the order successfully";
                    (<any>$("#messageModal")).modal({ backdrop: 'static', keyboard: false, show: true });
                } else if (this.processOrderDetails.actionStatus == this.actionStatus.VENDOR_REJECTED) {
                    this.modalMessage = "Rejected the order successfully";
                    (<any>$("#messageModal")).modal("show");
                }
                return;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = (baseResponse && baseResponse.statusMessage) ? baseResponse.statusMessage : "Error while processing request !!! Try Again!!!";
                this.showMessage = true;
                return;
            }
        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        });
    }

    onRejectButtonClicked() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == null || this.processOrderDetails.remarks == "") {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter the proper reason";
            this.showMessagetxt = true;
            return;
        }
        this.processOrderDetails.actionStatus = this.actionStatus.REJECTED;
        this.updatepharmacydeliveries();
        (<any>$("#rejectModal")).modal('hide');
    }

    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        let isPdf = imageSrc.substring(imageSrc.lastIndexOf('.') + 1, imageSrc.lastIndexOf('.') + 4).toString();
        if (isPdf == "pdf") {
            //  window.open(imageSrc)
            let h = window.innerHeight;
            $('#prescription-modal').css('height', h * .85);
            this.crouselSelectedImage = imageSrc;
            $('#pdfView2').attr({ data: imageSrc + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100 });
        } else {
            $('#prescription-modal').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }
    }
    hideToolBar(e) {
        $('.toolbar').css('display', 'none');
        return false;
    }
    // public showObject: boolean = true;
    // public url: String = null;
    // public url: SafeUrl = null;

    // public set attachmentFile(f: FetAttachmentFile) {
    //     this.attachment = f;
    //     if (this.attachment !== null && this.attachment !== undefined) {
    //         this.url = null;
    //         this.mimeType = null;
    //         this.showObject = false;
    //         this.cdRef.detectChanges();
    //         this.url = "/attachment/contentById/" + this.attachment.componentId;
    //         // this.url = this.sanitizer.bypassSecurityTrustResourceUrl("/attachment/contentById/" + this.attachment.componentId);
    //         this.mimeType = f.mimeType;
    //         this.showObject = true;
    //         this.cdRef.detectChanges();
    //     }
    // }

    // public innerHtml() {
    //     return this.sanitizer.bypassSecurityTrustHtml(
    //         "<object data='" + this.url + "' type='" + this.mimeType + "' class='embed-responsive-item'>" +
    //         "<embed src='" + this.url + "' type='" + this.mimeType + "' />" +
    //         "</object>");
    // }
    async getProduct(item: Pharmacy, productRequest: GetProductRequest) {
        item.packageSoldLoose = item.packageSoldLoose ? true : false;
        await this.pharmacyService.getProduct(productRequest).then(productDetail => {
            // let prod = productDetail.filter(e => { return e.stockDetails.totalAvailableQuantity != 0 });
            // if (prod.length != 0)
            //     productDetail = prod;
            let isAlreadyExist: boolean = false;
            if (productDetail.length > 0) {
                item.pharmacyStockList = new Array<Pharmacy>();
                item.pharmacyStockList = productDetail;
                // if (productDetail.length > 1) {
                //     item.grossPrice = 0;
                //     item.netPrice = 0;
                //     item.taxes = new Taxes();
                //     item.totalTaxes = new Taxes();
                //     item.batchNumberTemp = productDetail.length + "more batches available.";
                //     if (item.stockDetails && item.stockDetails.batchNo) {
                //         productDetail.forEach(e => {
                //             if (e.stockDetails.batchNo == item.stockDetails.batchNo) {
                //                 item.stockDetails = e.stockDetails;
                //                 item.grossPrice = e.stockDetails.grossPrice;
                //                 item.netPrice = e.stockDetails.netPrice;
                //                 item.taxes = item.totalTaxes = e.stockDetails.taxes;
                //                 item.batchNumberTemp = e.stockDetails.batchNo;
                //                 item.stockDetails.unitNetPrice = +e.stockDetails.netPrice;
                //                 item.stockDetails.packageNetPrice = e.stockDetails.packageNetPrice ?
                //                     +e.stockDetails.packageNetPrice : +e.stockDetails.netPrice;
                //                 item.netPrice = item.stockDetails.netPrice
                //                     = +item.stockDetails.packageNetPrice;
                //                 item.stockDetails.packingInformation = new PackingInformation();
                //                 item.stockDetails.packingInformation = e.packingInformation;
                //                 item.packageSoldLoose = false;
                //                 //  e.packingInformation && e.packingInformation.unitsInPackage && e.packingInformation.unitsInPackage > 0;
                //             };
                //             item.netPrice = item.packageSoldLoose ? item.stockDetails.unitNetPrice : item.stockDetails.packageNetPrice;
                //             this.calculatedData = this.pharmacyService.calculateCost(this.pharmacyList);
                //             this.pharmacyList = this.calculatedData.pharmacyList;
                //         });
                //     }
                // } else {
                console.log("StockDetails: " + JSON.stringify(productDetail[0].stockDetails));
                item.stockDetails = new StockDetails();
                if (productDetail[0].stockDetails) {
                    item.stockDetails = productDetail[0].stockDetails;
                    item.grossPrice = productDetail[0].stockDetails.grossPrice;
                    item.netPrice = productDetail[0].stockDetails.netPrice;
                    item.taxes = item.totalTaxes = productDetail[0].stockDetails.taxes;
                    item.batchNumberTemp = productDetail[0].stockDetails.batchNo;
                    item.stockDetails.unitNetPrice =
                        // productDetail[0].stockDetails.unitNetPrice ? +productDetail[0].stockDetails.unitNetPrice :
                        +productDetail[0].stockDetails.netPrice;
                    item.stockDetails.packageNetPrice = productDetail[0].stockDetails.packageNetPrice ?
                        +productDetail[0].stockDetails.packageNetPrice : +productDetail[0].stockDetails.netPrice;
                    item.netPrice = item.stockDetails.netPrice
                        = +item.stockDetails.packageNetPrice;
                    item.stockDetails.packingInformation = new PackingInformation();
                    item.stockDetails.packingInformation = productDetail[0].packingInformation;
                }
                item.packingInformation = productDetail[0].packingInformation ? productDetail[0].packingInformation : new PackingInformation();
                item.genericMedicine = productDetail[0].genericMedicine ? productDetail[0].genericMedicine : new BaseGenericMedicine();
                item.schedule = productDetail[0].schedule;
                // this.showOutOfStockError(item, productDetail);
                // this.errorPSMessages.forEach(data => {
                //     "Stock is not available for " + item.productName
                // })
                item.netPrice = item.packageSoldLoose ? item.stockDetails.unitNetPrice : item.stockDetails.packageNetPrice;
                this.calculatedData = this.pharmacyService.calculateCost(this.pharmacyList);
                this.pharmacyList = this.calculatedData.pharmacyList;
            }
            // } else {
            //     // this.showOutOfStockError(item, productDetail);
            //     return;
            // }
        }).catch(error => {
            console.error('Error occurred while fetching the stock details', error);
            return;
        });
    }
    getEmployeeToAssignForDelivery() {
        this.pharmacyService.getEmployeeToAssignForDelivery(this.processOrderDetails.orderId, this.pocId).then(empList => {
            this.agentList = empList;
            this.onChangeAgent();
        }).catch(err => console.log(err));
    }
    assignAgent() {
        this.spinnerService.start();
        let agentdetails: any = this.agentList.filter(agent => { return this.agentEmpId == agent.empId });
        agentdetails = agentdetails && agentdetails[0];
        console.log(agentdetails, JSON.stringify(this.processOrderDetails));
        this.processOrderDetails.orderRequest = 0;
        this.processOrderDetails.employeeAccepted = agentdetails.empId;
        this.processOrderDetails.actionStatus = this.actionStatus.CUSTOMER_APPROVED;
        this.pharmacyService.updateHomeOrderForDelivery(this.processOrderDetails).then(res => {
            this.spinnerService.stop();
            this.toast.show("Agent assigned successfully", "bg-warning text-white font-weight-bold", 5000);
            this.router.navigate(['/app/pharmacy/homeorder/homeorders']);

        }).catch((err) => this.spinnerService.stop());
    }
}