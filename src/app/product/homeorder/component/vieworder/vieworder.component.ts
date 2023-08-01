import { ProductCentralService } from './../../../productCentral.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';
import { PharmacyService } from '../../../../pharmacy/pharmacy.service';
import { AdminService } from '../../../../admin/admin.service';
import { AuthService } from './../../../../auth/auth.service';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';


@Component({
    selector: 'vieworder',
    templateUrl: './vieworder.template.html',
    styleUrls: ['./vieworder.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class ViewOrderComponent implements OnInit, OnDestroy, OnChanges {

    processOrderDetails: ProductDeliveryTrack;
    approved: any;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    showMessagetxt: boolean;
    pocId: any;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;
    packageNames: string[];
    bookedPackageList: BookedPackageResponse[] = new Array();
    invoiceDetailList: any;
    modalMessage: string;
    actionStatus: any = ProductDeliveryTrack;
    agentList = [];
    agentEmpId: any = "";
    prescriptionType = "";
    crouselSelectedImage: String;

    constructor(private adminService: AdminService,
        private auth: AuthService,
        private router: Router,
        private spinnerService: SpinnerService,
        private localStore: HsLocalStorage,
        private pharmacyService: PharmacyService,
        private productCentralService: ProductCentralService) {
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    }

    ngOnInit() {
        this.processOrderDetails = this.adminService.productDeliveryTrack;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        this.adminService.tempProductDeliveryTrack = null;
        if ((this.processOrderDetails != undefined || this.processOrderDetails != null) && this.processOrderDetails.cartItem != undefined && this.processOrderDetails.cartItem.productList != undefined) {
            this.localStore.setDataEncrypted('processOrderDetails', this.processOrderDetails);
        } else {
            if (this.localStore.getDataEncrypted('processOrderDetails') != null) {
                this.processOrderDetails = this.localStore.getDataEncrypted('processOrderDetails');
            }
        }
        this.processOrderDetails.cartItem.convertedDocumentUrlList = new Array();
        if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.proofDocumentUrlList && this.processOrderDetails.cartItem.proofDocumentUrlList.length > 0) {
            this.processOrderDetails.cartItem.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.processOrderDetails.cartItem.convertedDocumentUrlList.push(url);
                }
                else {
                    this.productCentralService.getPdfUrl(url).then(xdata => {
                        this.processOrderDetails.cartItem.convertedDocumentUrlList.push(this.productCentralService.tempPdfUrl);
                    });
                }
            });
        }
        if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.productList) {
            this.adminService.getStockSummaryReportList({ pocId: this.pocId }).then(list => {
                let getPocProductStockList: Array<any> = list;
                if (getPocProductStockList && getPocProductStockList) {
                    this.processOrderDetails.cartItem.productList.forEach(product => {
                        let filteredItem = getPocProductStockList.filter(item => item.productId == product.productId);
                        if (filteredItem && filteredItem[0]) {
                            product.stockDetails = filteredItem[0];
                        }
                    });
                }
            }).catch(err => console.log(err));
        }
        this.fetchAgentList();
    }
    ngOnChanges(): void {
        // if ($(".modal-backdrop").length > 1) {
        //     $(".modal-backdrop").not(':first').remove();
        // }
    }

    ngOnDestroy() {
        if (this.processOrderDetails) {
            this.adminService.productDeliveryTrack = this.processOrderDetails;
        }
    }

    onGenerateBack(): void {
        // (<any>$("#messageModal")).modal('hide');
        $(".modal-backdrop").remove();
        this.router.navigate(['/app/product/homeorder/list']);
    }

    onGenerateEditOrder(): void {
        this.router.navigate(['/app/product/homeorder/edit']);
    }
    fetchAgentList() {
        if (this.processOrderDetails.orderId && this.processOrderDetails.cartItem.productList != null
            && (this.processOrderDetails.actionStatus == this.actionStatus.CUSTOMER_APPROVED
                || this.processOrderDetails.actionStatus == this.actionStatus.DELIVERY_INITIATED
                || this.processOrderDetails.actionStatus == this.actionStatus.OUT_FOR_DELIVERY
                || this.processOrderDetails.actionStatus == this.actionStatus.NEW)) {
            this.agentEmpId = this.processOrderDetails.employeeAccepted ? this.processOrderDetails.employeeAccepted : '';
            this.getEmployeeToAssignForDelivery();
        }
    }
    getEmployeeToAssignForDelivery() {
        this.pharmacyService.getEmployeeToAssignForDelivery(this.processOrderDetails.orderId, this.pocId).then(empList => {
            this.agentList = empList;
        }).catch(err => console.log(err));
    }

    onDeliveredClick() {
        (<any>$('#deliveryremarkspopup')).modal('show');
        if ($(".modal-backdrop").length > 1) {
            $(".modal-backdrop").not(':first').remove();
        }
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
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
            this.showMessage = true;
            return;
        }
        this.processOrderDetails.actionStatus = this.actionStatus.COMPLETED;
        this.updateProductDeliveries();
        (<any>$("#deliveryremarkspopup")).modal('hide');
    }

    onInitiateDeliveryClick() {
        let canProceed: boolean = true;
        if (this.processOrderDetails && this.processOrderDetails.cartItem
            && this.processOrderDetails.cartItem.productList
            && this.processOrderDetails.cartItem.productList.length > 0) {
            this.processOrderDetails.cartItem.productList.forEach(item => {
                if (+item.quantity <= 0 || +item.grossPrice <= 0) {
                    canProceed = false;
                }
            });
        } else {
            canProceed = false;
        }
        if (canProceed) {
            this.processOrderDetails.actionStatus = this.actionStatus.DELIVERY_INITIATED;
            this.updateProductDeliveries();
        } else {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Cannot initiate delivery for this order. Please check the order details.";
            this.showMessage = true;
            return;
        }
    }

    updateProductDeliveries(isVendorAction = false): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.spinnerService.start();

        let updateDelivery = (baseResponse) => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                if (this.processOrderDetails.actionStatus == this.actionStatus.DELIVERY_INITIATED
                    || this.processOrderDetails.actionStatus == this.actionStatus.COMPLETED
                    || this.processOrderDetails.actionStatus == this.actionStatus.VENDOR_APPROVED
                    || this.processOrderDetails.actionStatus == this.actionStatus.CUSTOMER_APPROVED) {
                    if (this.processOrderDetails.actionStatus == this.actionStatus.COMPLETED) {
                        this.modalMessage = "Delivered Successfully";
                        (<any>$("#messageModal")).modal("show");
                    } else if (this.processOrderDetails.actionStatus == this.actionStatus.CUSTOMER_APPROVED) {
                        this.errorMessage[0] = "Order Confirmed Successfully";
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
                this.errorMessage[0] = "Error while processing request !!! Try Again!!!";
                this.showMessage = true;
                return;
            }
        }
        let err = (error) => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        }
        this.adminService.updateProductDeliveries(this.processOrderDetails).then(updateDelivery, err);
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
        this.updateProductDeliveries();
        (<any>$("#rejectModal")).modal('hide');
        if ($(".modal-backdrop").length > 1) {
            $(".modal-backdrop").not(':first').remove();
        }
    }
    openRejectOrderModal() {
        (<any>$("#rejectModal")).modal("show");
        if ($(".modal-backdrop").length > 1) {
            $(".modal-backdrop").not(':first').remove();
        }
    }
    assignAgent() {
        let agentdetails: any = this.agentList.filter(agent => { return this.agentEmpId == agent.empId });
        agentdetails = agentdetails && agentdetails[0];
        console.log(agentdetails, JSON.stringify(this.processOrderDetails));
        this.processOrderDetails.orderRequest = 1;
        this.processOrderDetails.employeeAccepted = agentdetails.empId;
        this.processOrderDetails.actionStatus= this.actionStatus.CUSTOMER_APPROVED;
        this.pharmacyService.updateHomeOrderForDelivery(this.processOrderDetails).then(res => {
            this.router.navigate(['/app/product/homeorder/list']);
        });
    }
    onAcceptOrder() {
        this.processOrderDetails.actionStatus = this.actionStatus.VENDOR_APPROVED;
        this.processOrderDetails.cartItem.pocId = this.pocId;
        this.updateProductDeliveries(true);
        // !this.isError?this.onGenerateEditOrder():"";
    }

    onRejectOrder() {
        this.processOrderDetails.actionStatus = this.actionStatus.VENDOR_REJECTED;
        this.processOrderDetails.cartItem.pocId = this.pocId;
        this.updateProductDeliveries(true);
    }
    onGenerateConfirmOrder() {
        this.processOrderDetails.actionStatus = this.actionStatus.CUSTOMER_APPROVED;
        this.processOrderDetails.cartItem.pocId = this.pocId;
        this.fetchAgentList();
        this.updateProductDeliveries();
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
}