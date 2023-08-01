import { AdminService } from './../../../../admin/admin.service';
import { ProductCentralService } from './../../../productCentral.service';
import { ProductDeliveryTrack } from './../../../../model/product/productdeliverytrack';
import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { BookedPackageResponse } from './../../../../model/package/bookedPackageResponse';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';

@Component({
    selector: 'orderdetails',
    templateUrl: './orderdetails.template.html',
    styleUrls: ['./orderdetails.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class CentralHomeOrderDetailsComponent implements OnInit, OnDestroy {

    empId: number;
    processOrderDetails: AdminPharmacyDeliveryResponse;
    approved: any;
    isError: boolean = false;
    errorMessage: Array<string>;
    showMessage: boolean = false;
    showMessagetxt: boolean = false;
    showRemarksMessagetxt: boolean = false;
    pocId: number;
    selectedPocId: number;
    orderId: string;
    invoiceId: string;
    pdfHeaderType: any;
    packageNames: string[];
    bookedPackageList: BookedPackageResponse[] = new Array();
    crouselSelectedImage: String;
    invoiceDetailList: any;
    modalMessage: string;
    pocList: Array<EmployeePocMapping>;
    prescriptionType: any;
    actionStatus: any = ProductDeliveryTrack;

    constructor(private productService: ProductCentralService, private auth: AuthService,
        private businessAdminService: BusinessAdminService,private adminService:AdminService,
        private router: Router, private spinnerService: SpinnerService) {
        this.empId = auth.userAuth.employeeId;
        this.pocId = auth.userAuth.pocId;
        this.pdfHeaderType = auth.userAuth.pdfHeaderType;
        // $(window).on('popstate', function (event) {
        //     (<any>$(".modal")).modal('hide');
        //     $('.modal-backdrop').remove();
        // });
    }

    ngOnInit() {
        this.processOrderDetails = this.productService.productDeliveryDetails;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else {
            if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
                this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
            }
        }
        if (this.processOrderDetails && this.processOrderDetails.cartItem && this.processOrderDetails.cartItem.proofDocumentUrlList && this.processOrderDetails.cartItem.proofDocumentUrlList.length > 0) {
            this.processOrderDetails.cartItem.convertedDocumentUrlList = new Array<String>();
            this.processOrderDetails.cartItem.proofDocumentUrlList.forEach(url => {
                if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
                    this.processOrderDetails.cartItem.convertedDocumentUrlList.push(url);
                }
                else {
                    this.productService.getPdfUrl(url).then(xdata => {
                        this.processOrderDetails.cartItem.convertedDocumentUrlList.push(this.productService.tempPdfUrl);
                    });
                }
            });
        }
        !this.processOrderDetails ? this.processOrderDetails = new AdminPharmacyDeliveryResponse() : '';
        this.getPocList(this.empId);
    }

    ngOnDestroy() {
        if (this.processOrderDetails) {
            this.productService.productDeliveryDetails = this.processOrderDetails;
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/product/centralhomeorder/listing']);
    }

    hideToolBar(e) {
        $('.toolbar').css('display', 'none');
        return false;
    }

    onInvoiceClick() {
        this.orderId = this.processOrderDetails.orderId;
        this.invoiceId = this.processOrderDetails.baseInvoiceId;
        this.spinnerService.start();
        this.productService.getOrderDetails(this.orderId, this.invoiceId).then(baseResponse => {
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

    onReassignOrder() {
        if (this.selectedPocId > 0) {
            this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.VENDOR_REJECTED;
            this.processOrderDetails.cartItem.pocId = this.selectedPocId;
            this.processOrderDetails.adminReassignment = true;
            this.updateproductdeliveries();
        } else {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please select a POC for re-assignment";
            this.showMessage = true;
            return;
        }
    }

    updateproductdeliveries(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.processOrderDetails.doctorDetail = new DoctorDetails();
        this.spinnerService.start();
        this.adminService.updateProductDeliveries(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                if (this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.REJECTED) {
                    this.modalMessage = "Cancelled the order successfully";
                    (<any>$("#messageModal")).modal("show");
                } else if (this.processOrderDetails.actionStatus == AdminPharmacyDeliveryResponse.VENDOR_REJECTED) {
                    this.modalMessage = "Re-assigned the order successfully";
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
        this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.REJECTED;
        this.updateproductdeliveries();
        (<any>$("#rejectModal")).modal('hide');
        $('#rejectModal').on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
    }

    getPocList(empId: number): void {
        this.businessAdminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
            if (response && response.length > 0) {
                this.pocList = response;
            }
        }).catch(error => {
            console.error('Error occurred while fetching the employee POCs', error);
        });
    }
    onPOCSelect(pocId: number): void {
        this.selectedPocId = pocId;
    }

    // sliderImage(imageSrc) {
    //     if (imageSrc.substring((imageSrc.lastIndexOf('.') + 1)).toString() == "pdf") {
    //         this.auth.openPDF(imageSrc)
    //     } else {
    //         this.crouselSelectedImage = imageSrc;
    //     }
    // }
    sliderImage(imageSrc, type) {
        this.prescriptionType = type;
        this.crouselSelectedImage = undefined;
        let isPdf = imageSrc.substring(imageSrc.lastIndexOf('.') + 1, imageSrc.lastIndexOf('.') + 4).toString();
        if (isPdf == "pdf") {
            //  window.open(imageSrc)
            let h = window.innerHeight;
            $('.modal-body').css('height', h * .85);
            this.crouselSelectedImage = imageSrc;
            $('#pdfView2').attr({ data: imageSrc + '#toolbar=0&navpanes=0&scrollbar=0', height: (h * .85) - 100 });
        } else {
            $('.modal-body').css('height', 'none');
            this.crouselSelectedImage = imageSrc;
        }
    }

}