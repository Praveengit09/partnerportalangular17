import { DiagnosticAdminRequest } from '../../../../model/diagnostics/diagnosticAdminRequest';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { DiagnosticsService } from '../../../diagnostics.service';
import { AuthService } from '../../../../auth/auth.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';

@Component({
    selector: 'pickuporderlist',
    templateUrl: './pickuporders.template.html',
    styleUrls: ['./pickuporders.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PickupOrdersComponent {

    pocId: number = 0;
    empId: number = 0;
    fromIndex: number = 0;
    total: number = 0;
    dataMsg: string = '';
    perPage: number = 10;
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    searchCriteria: string = 'orderId';
    isCorrectMobile: boolean = false;
    diagnoAdminRequest: DiagnosticAdminRequest = new DiagnosticAdminRequest();
    deliveryDiagnosticslist: any = new Array<any>();
    crouselSelectedImage: String;
    prescriptionType = "";
    fileUrlList: any = new Array();

    startDate: Date = new Date();
    endDate: Date = new Date();
    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    columns: any[] = [
        {
            display: 'Order ID',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Details',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile, patientProfileDetails.gender',
            filter: 'nametitle',
            filler: ',',
            sort: false
        },
        {
            display: 'Pickup Date & Time',
            variable: 'createdTimestamp',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Status',
            variable: 'actionPerformed',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '34',
                    condition: 'eq',
                    label: 'Initiated'
                },
                {
                    value: '36',
                    condition: 'eq',
                    label: 'Picked'
                },
                {
                    value: '37',
                    condition: 'eq',
                    label: 'Delivered'
                },
                {
                    condition: 'default',
                    label: 'Initiated'
                }
            ]
        },
        {
            display: 'Agent Name',
            variable: 'employeeAcceptedName',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewOrder',
            sort: false
        },
        {
            display: 'Reports',
            variable: 'fileCount',
            filter: 'action',
            type: 'button',
            event: 'reports',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Not Available',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'Not Available',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                }
            ]
        }
    ];

    col = [
        {
            display: 'Tests',
            variable: 'fileName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Report',
            label: 'assets/img/partner/pdf_icon_read.png',
            filter: 'action',
            type: 'image',
            sort: false,
            event: 'openfile',
            variable: 'contentType',
            conditions: [
                {
                    value: '2',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_read.png',
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'assets/img/partner/image_icon_read.png',
                },
                {
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                    style: 'hide_btn'
                }
            ]
        }
    ];

    constructor(private authService: AuthService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
        private router: Router, private spinnerService: SpinnerService) {
        this.pocId = authService.userAuth.pocId;
        this.fromIndex = 0;
    }

    ngOnInit(): void {
        this.getOrderList();
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('pickUpStartDate') != null && window.localStorage.getItem('pickUpStartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pickUpStartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pickUpEndDate'))));
        }
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
        }
    }

    onNewOrderButtonClicked(): void {
        this.router.navigate(['/app/diagnostics/homeorders/pickuprequest']);
    }

    getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(str: string = ''): void {
        this.dataMsg = '';
        str = $('#search').val().toString();
        if (isNaN(parseInt(str))) {
            this.searchCriteria = 'orderId';
        } else {
            this.searchCriteria = 'contactNo';
            if (str.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            }
        }
        this.total = 0;
        this.fromIndex = 0;
        this.diagnoAdminRequest = new DiagnosticAdminRequest();
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        let searchStr = str.trim();
        if (this.searchCriteria == 'orderId') {
            this.diagnoAdminRequest.orderId = searchStr;
        } else if (this.searchCriteria == 'contactNo') {
            if (searchStr.length < 10 || searchStr.length > 10) {
                this.isCorrectMobile = true;
                return;
            } else {
                this.diagnoAdminRequest.mobile = searchStr;
                this.isCorrectMobile = false;
            }
        }
        this.getOrderList();
    }

    clickEventHandler(e) {
        if (e.event == 'viewOrder') {
            this.viewOrderDetails(e.val);
        }
        if (e.event == "reports") {
            this.fileUrlList = e.val.fileUrlList;
            if (e.val.fileCount > 0)
                this.onReportsClicked();
        }
        if (e.event == "openfile") {
            this.openPdf(e);
        }
    }


    openPdf(e) {
        console.log("pdf", e)
        let imageSrc = '';

        this.diagnosticsService.getPdfUrl(e.val.fileUrl).then(xdata => {
            imageSrc = this.diagnosticsService.tempPdfUrl;
            if (e.val.contentType == 2)
                this.prescriptionType = 'pdf';
            else
                this.prescriptionType = 'img';
            this.crouselSelectedImage = undefined;
            if (this.prescriptionType == "pdf") {
                this.authService.openPDF(imageSrc);
            } else {
                $('#prescription-modal').css('height', 'none');
                this.crouselSelectedImage = imageSrc;
                (<any>$("#sliderimagepopup")).modal("show");
            }
        });
    }

    onReportsClicked() {
        if (this.fileUrlList.length > 0) {
            this.fileUrlList.forEach(file => {
                let temp = '';
                file.testList.forEach((test, index) => {
                    temp = temp + test.name;
                    if (index != file.testList.length - 1)
                        temp = temp + ", ";
                })
                file.fileName = temp;
            });
            (<any>$("#reports")).modal("show");
        }
    }

    viewOrderDetails(val) {
        this.diagnosticsService.order = val;
        this.router.navigate(['/app/diagnostics/homeorders/pickuporderdetails']);
    }



    startDateChoosen($event): void {
        this.startDate = $event;
        this.total = 0;
        this.fromIndex = 0;
        this.deliveryDiagnosticslist = [];
        this.getOrderList();
    }

    endDateChoosen($event): void {
        console.log("startDateChoosen1: " + $event);
        this.endDate = $event;
        this.total = 0;
        this.fromIndex = 0;
        this.deliveryDiagnosticslist = [];
        this.getOrderList();
    }

    getRefreshedorderList(): void {
        $('#search').val('');
        (<any>$)("#searchBox").val("");
        (<any>$)("#checkOrderId").prop("checked", true);
        this.fromIndex = 0;
        this.isCorrectMobile = false;
        this.startDate = new Date();
        this.endDate = new Date();
        this.resetErrorMessage();
        this.getOrderList();
    }

    onSearchChange(search: string) {
        (<any>$)("#searchBox").val("");
        this.searchCriteria = search;
        this.isCorrectMobile = false;
        if (this.diagnoAdminRequest != undefined) {
            this.diagnoAdminRequest.orderId = this.diagnoAdminRequest.mobile = "";
        }
        this.resetErrorMessage();
    }

    resetErrorMessage() {
        this.errorMessage = new Array();
        this.isError = false;
        this.showMessage = false;
    }

    getOrderList() {
        this.resetErrorMessage();
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        }
        this.spinnerService.start();
        this.dataMsg = 'Loading...';
        this.diagnoAdminRequest.pocId = this.pocId;
        this.diagnoAdminRequest.fromIndex = this.fromIndex;
        this.diagnoAdminRequest.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
        let tmpDate: Date = new Date(this.endDate.getTime());
        this.diagnoAdminRequest.toDate = this.commonUtil.convertOnlyDateToTimestamp(new Date(tmpDate.setDate(tmpDate.getDate() + 1))) - 1;

        this.diagnosticsService.getPickUpRaisedOrders(this.diagnoAdminRequest).then((response) => {
            this.spinnerService.stop();
            this.deliveryDiagnosticslist = response;
            this.total = this.deliveryDiagnosticslist.length;
            if (this.deliveryDiagnosticslist.length == 0)
                this.dataMsg = 'No Data Found';
            this.deliveryDiagnosticslist.forEach(element => {
                element.fileCount = 0;
                if(element.fileUrl && element.fileUrl.length)
                    element.fileCount = element.fileUrlList.length;
            });
        })

        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('pickUpStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('pickUpEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));
    }

    onPage(event) {
        this.fromIndex = this.total + 1;
    }

}