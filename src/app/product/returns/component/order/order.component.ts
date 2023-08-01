import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductDeliveryTrack } from '../../../../model/product/productdeliverytrack';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { AdminService } from './../../../../admin/admin.service';


@Component({
    selector: 'returnorder',
    templateUrl: './order.template.html',
    styleUrls: ['./order.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class ReturnOrderComponent implements OnInit, OnDestroy {

    processOrderDetails: ProductDeliveryTrack;

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    showMessagetxt: boolean;
    pocId: any;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;

    invoiceDetailList: any;
    modalMessage: string;

    constructor(private adminService: AdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private localstorage: HsLocalStorage) {
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    }

    ngOnInit() {
        this.processOrderDetails = this.adminService.productDeliveryTrack;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails.orderId != undefined || this.processOrderDetails.orderId != null) {
            this.localstorage.setDataEncrypted('processOrderDetails', JSON.stringify(this.processOrderDetails));
        } else {
            let data = this.localstorage.getDataEncrypted('processOrderDetails');
            if (data != null && data.length > 0) {
                this.processOrderDetails = JSON.parse(data);
            }
        }
    }

    ngOnDestroy() {
        if (this.processOrderDetails) {
            this.adminService.productDeliveryTrack = this.processOrderDetails;
        }
    }

    onGenerateBack(): void {
        console.log('close');
        this.router.navigate(['/app/product/returns/list']);
        $('#messageModal').on('hidden.bs.modal', function (e) {
            $(".modal-backdrop").remove();
          });
    }

    onGenerateEditOrder(): void {
        this.router.navigate(['/app/product/returns/edit']);
    }

    onReturnedClick() {
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
    }

    onInvoiceClick() {
        this.orderId = this.processOrderDetails.orderId;
        this.invoiceId = this.processOrderDetails.baseInvoiceId;
        this.spinnerService.start();
        this.adminService.getReturnOrderDetails(this.orderId, this.invoiceId).then(baseResponse => {
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

    onRemarkSubmitClicked() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == "" || this.processOrderDetails.remarks == null) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Add Your Remark!!!";
            this.showMessage = true;
            return;
        }
        this.processOrderDetails.actionStatus = ProductDeliveryTrack.COMPLETED;
        this.updateProductReturns();
        (<any>$("#deliveryremarkspopup")).modal('hide');
    }

    onInitiateReturnClick() {
        let canProceed: boolean = true;
        if (this.processOrderDetails && this.processOrderDetails.cartItem
            && this.processOrderDetails.cartItem.productList
            && this.processOrderDetails.cartItem.productList.length > 0) {
            this.processOrderDetails.cartItem.productList.forEach(item => {
                if (item.quantity <= 0 || item.grossPrice <= 0) {
                    canProceed = false;
                }
            });
        } else {
            canProceed = false;
        }
        if (canProceed) {
            this.processOrderDetails.actionStatus = ProductDeliveryTrack.VENDOR_RETURN_COLLECTION_INITIATED;
            this.updateProductReturns();
        } else {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Cannot initiate return process for this order. Please check the order details.";
            this.showMessage = true;
            return;
        }
    }

    updateProductReturns(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.spinnerService.start();
        this.adminService.updateProductReturn(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                if (this.processOrderDetails.actionStatus == ProductDeliveryTrack.VENDOR_RETURN_COLLECTION_INITIATED || this.processOrderDetails.actionStatus == ProductDeliveryTrack.COMPLETED) {
                    if (this.processOrderDetails.actionStatus == ProductDeliveryTrack.COMPLETED) {
                        this.modalMessage = "Return items collected successfully.";
                        (<any>$("#messageModal")).modal("show");
                    } else {
                        this.errorMessage[0] = "Return initiated successfully.";
                        this.showMessage = true;
                    }
                } else if (this.processOrderDetails.actionStatus == ProductDeliveryTrack.REJECTED) {
                    this.modalMessage = "Rejected the return order.";
                    (<any>$("#messageModal")).modal("show");
                }
                return;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error occurred while processing request. Please try again!";
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

    onRejectButtonSubmit() {
        if (this.processOrderDetails.remarks == undefined || this.processOrderDetails.remarks == null || this.processOrderDetails.remarks == "") {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter the proper reason";
            this.showMessagetxt = true;
            return;
        }
        this.processOrderDetails.actionStatus = ProductDeliveryTrack.REJECTED;
        this.updateProductReturns();
        (<any>$("#rejectModal")).modal('hide');
    }

    onRejectButtonClick() {
        if (this.processOrderDetails.remarks != undefined || this.processOrderDetails.remarks != "" || this.processOrderDetails.remarks != null) {
            this.processOrderDetails.remarks = "";
            this.showMessage = false;
        }
    }

}