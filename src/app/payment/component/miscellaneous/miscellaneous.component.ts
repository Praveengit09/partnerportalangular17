import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from "../../payment.service";
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';
import { Location } from '@angular/common';
import { CartItem } from './../../../model/basket/cartitem';
import { Config } from '../../../base/config';
import { ToasterService } from '../../../layout/toaster/toaster.service';


@Component({
    selector: '[misc]',
    templateUrl: './miscellaneous.template.html',
    styleUrls: ['./miscellaneous.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class MiscellaneousComponent implements OnInit {

    perPage: number = 10;
    total: number = 0;
    pocId: number;
    mobileNumber: string;
    scrollPosition: number;
    time: any;
    offset: number = 50;
    isCorrectMobile: boolean = false;
    isEmpty: boolean = false;
    procedureList: CartItem[] = new Array<CartItem>();
    selectedProcedureAdvise: CartItem;
    pdfHeaderType: number;
    dataMsg: string = ' ';
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    procedurePrescriptionLabel: string = null;

    columns: any[] =
        [
            {
                display: 'Order ID',
                variable: 'orderId',
                filter: 'text',
                sort: false
            },
            {
                display: 'Patient Name',
                variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName',
                filter: 'nametitle',
                sort: false
            },

            {
                display: 'Centre Details',
                variable: 'pocDetails.pocName',
                filter: 'text',
                sort: false
            },
            {
                display: 'Doctor Name',
                variable: 'doctorDetail.title doctorDetail.firstName  doctorDetail.lastName',
                filter: 'nametitle',
                filler: ' ',
                sort: false
            },
            {
                display: 'Date',
                variable: 'updatedTimestamp',
                filter: 'date',
                sort: false
            },
            {
                display: 'Status',
                variable: 'payment.paymentStatus',
                filter: 'text',
                sort: false,
                conditions: [
                    {
                        value: '1',
                        condition: 'eq',
                        label: 'Paid'
                    },
                    {
                        value: '0',
                        condition: 'lte',
                        label: 'Not Paid'
                    },
                    {
                        value: '2',
                        condition: 'eq',
                        label: 'Pending'
                    },
                    {
                        condition: 'default',
                        label: 'Not Paid'
                    }
                ]
            },

            {
                display: 'Action',
                label: 'View',
                style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
                filter: 'action',
                type: 'button',
                event: 'viewButton',
                sort: false,
                variable: 'payment.paymentStatus',
                conditions: [
                    {
                        value: '1',
                        condition: 'eq',
                        label: 'Completed',
                        style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
                    },
                    {
                        value: '0',
                        condition: 'lte',
                        label: 'View',
                        style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                    },
                    {
                        value: '2',
                        condition: 'eq',
                        label: 'Pending',
                        style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                    },
                    {
                        condition: 'default',
                        label: 'View',
                        style: 'btn btn-danger width-100 mb-xs botton_txtdigo'
                    }
                ]
            },
            {
                display: 'Receipt',
                label: 'assets/img/partner/pdf_icon_read.png',
                filter: 'action',
                type: 'image',
                event: 'pdfButton',
                sort: false,
                variable: 'payment.paymentStatus',
                conditions: [
                    {
                        value: '1',
                        condition: 'eq',
                        label: 'assets/img/partner/pdf_icon_read.png',
                    },
                    {
                        value: '0',
                        condition: 'eq',
                        label: 'assets/img/partner/pdf_icon_disabled.png',
                    },
                    {
                        condition: 'default',
                        label: 'assets/img/partner/pdf_icon_disabled.png',
                    }
                ]
            }
        ];
    sorting: any = {
        column: 'updatedTimestamp',
        descending: true
    };

    constructor(private paymentService: PaymentService, private authService: AuthService,
        private router: Router, private toast: ToasterService,
        private spinnerService: SpinnerService, private location: Location) {
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        this.pocId = this.authService.userAuth.pocId;
        this.scrollPosition = 1;
        this.time = new Date(); // current Date
        this.time = this.time.getTime(); // converting to timeStamp;
        this.mobileNumber = '';
        this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
    }

    ngOnInit() {
        this.getProcedureListMiscellaneous();
        // this.load();
    }

    // load() {
    //     console.log("====>>>")
    //     setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
    //     // location.reload();
    //     }


    getProcedureListMiscellaneous(type?) {
        this.spinnerService.start();
        this.paymentService.getProcedureListMiscellaneous(this.pocId, this.time, this.offset,
            this.scrollPosition, this.mobileNumber).then(responseList => {
                this.spinnerService.stop();
                // if (type == 'refresh') {
                //     this.procedureList = responseList;
                // }
                // else {
                if (this.total > 0) {
                    this.procedureList.push.apply(this.procedureList, responseList);

                }
                else {
                    this.procedureList = new Array<CartItem>();
                    this.procedureList = responseList;

                }
                // }
                if (this.procedureList.length > 0) {
                    this.total = this.scrollPosition = this.procedureList.length;
                }
            });
    }

    onButtonClicked(item: CartItem): void {
        console.log(item)
        this.selectedProcedureAdvise = item;
        console.log(this.selectedProcedureAdvise.payment.paymentStatus != 1);
        if (this.selectedProcedureAdvise.payment.paymentStatus != 1)
            this.router.navigate(['/app/payment/miscadvice']);
    }

    onImageClicked(item: CartItem): void {
        this.selectedProcedureAdvise = item;
        let pdfUrl = '';
        if (this.selectedProcedureAdvise.payment.paymentStatus == 1) {

            if (this.pdfHeaderType == 0 || this.pdfHeaderType == undefined) {
                pdfUrl = this.selectedProcedureAdvise.pdfUrlWithHeader;
            }
            else {
                pdfUrl = this.selectedProcedureAdvise.pdfUrlWithoutHeader;
            }
            this.spinnerService.start();
            this.authService.getTempUrl(pdfUrl).then((url) => {
                this.spinnerService.stop();
                if ((url.statusCode == 201 || url.statusCode == 200)) {
                    this.authService.openPDF(url.data);
                } else {
                    this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
                }
            }).catch((err) => {
                this.spinnerService.stop();
                this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
            })

        }
    }


    clickEventHandler(e) {
        console.log(e);
        if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        }
        else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        }
    }

    onPage(page: number) {
        this.time = new Date(); // current Date
        this.time = this.time.getTime(); // converting to timeStamp;
        // this.time = 1508755884122;
        console.log("Onpage:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.mobileNumber);
        this.getProcedureListMiscellaneous();
    }

    onRefresh() {
        //this.isCorrectMobile = false;
        // this.spinnerService.start();
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.mobileNumber = "";
        //this.isEmpty = false;
        this.scrollPosition = 1;
        this.time = new Date(); // current Date
        this.time = this.time.getTime(); // converting to timeStamp;
        this.total = 0
        $('#search').val('');
        // this.time = 1508755884122;
        // this.procedureList = undefined;
        this.procedureList = new Array<CartItem>();
        console.log("onRefresh:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.mobileNumber);
        this.getProcedureListMiscellaneous();
    }

    validateNumberInputOnly(event) {

        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }


    onGenerateWalkin(): void {
        this.router.navigate(['/app/payment/walkinmiscellaneous']);
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.onSearch();
        }
    }

    onSearch() {
        console.log("NameOrMob::" + this.mobileNumber);
        this.mobileNumber = this.mobileNumber.trim();
        let patientList: any[];
        if (this.mobileNumber.length < 10 || this.mobileNumber.length > 10) {
            //this.isCorrectMobile = true;
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter Valid 10 digits Number.";
            this.showMessage = true;
            return;
        } else {
            // this.isCorrectMobile = false;
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
            this.scrollPosition = 1;
            this.time = new Date(); // current Date
            this.time = this.time.getTime(); // converting to timeStamp;
            // this.time = 1508755884122;
            this.total = 0
            this.procedureList = new Array<any>();
            console.log("onSearch:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.mobileNumber);
            this.dataMsg = 'Loading....';
            this.paymentService.getProcedureListMiscellaneous(this.pocId, this.time, this.offset,
                this.scrollPosition, this.mobileNumber).then(responseList => {
                    this.procedureList = responseList;
                    if (this.procedureList.length > 0) {
                        this.total = this.scrollPosition = this.procedureList.length;
                        this.isError = false;
                        this.errorMessage = new Array();
                        this.showMessage = false;
                        this.dataMsg = ' ';
                    } else {
                        // this.isError = true;
                        // this.errorMessage = new Array();
                        // this.errorMessage[0] = "No Data is found for this Mobile Number.";
                        // this.showMessage = true;
                        this.dataMsg = "No Data is found for this Mobile Number.";
                    }
                });
        }
    }

    ngOnDestroy(): void {
        if (this.selectedProcedureAdvise != undefined && this.selectedProcedureAdvise != null) {
            this.paymentService.procedureAdviseTrack = this.selectedProcedureAdvise;
        }
    }
}