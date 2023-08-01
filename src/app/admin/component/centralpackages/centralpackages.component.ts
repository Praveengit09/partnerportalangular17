import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Config } from '../../../base/config';
import { AdminService } from '../../admin.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'centralpackages',
    templateUrl: './centralpackages.template.html',
    styleUrls: ['./centralpackages.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class CentralPackageBookingsComponent implements OnInit {

    startDate: Date;
    endDate: Date;
    endingDate: Date;
    appId: number;

    perPage: number = 10;
    packageBookingList: any;
    errorMessage: Array<string>;
    isDate: boolean = false;
    isDisplay: boolean = false;
    message: Array<string>;
    dataMsg = '';
    error: string = '';
    isError: boolean;
    total: number = 0;
    checkEndDate: boolean = false;
    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);
    employeeName: string;
    empId: number;
    modalId: any;
    userData: any;
    changesInteractionStatus: string = '';
    interactionStatus: string;
    requestBody: any = {};
    first: boolean;
    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    datepickerOptEnd = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy',
    };
    columns: any[] = [
        {
            display: 'OrderID',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'InvoiceId',
            variable: 'invoiceId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Details',
            variable: 'patientFirstName patientLastName, patientMobile, patientEmail',
            filler: ',',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Package Name',
            variable: 'packageName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Purchase Date',
            variable: 'orderPlacedTimestamp',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Payment Status',
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
                    condition: 'default',
                    label: 'Not Paid'
                }
            ]
        },
        {
            display: 'Package Price',
            variable: 'payment.finalAmount',
            filter: 'text',
            sort: false
        },
        {
            display: 'Centre Name',
            variable: 'pocName',
            filter: 'text',
            sort: false
        }
    ]
    sorting: any = {
        column: 'createdTimestamp',
        descending: true
    };


    constructor(private adminService: AdminService, private spinner: SpinnerService, private authService: AuthService) {
        this.empId = this.authService.userAuth.employeeId;
        this.employeeName = this.authService.userAuth.employeeName;
        if (Config.portal)
            this.appId = Config.portal.appId;
    }
    ngOnInit() {

    }

    getCentralPackagePurchases() {

        if (this.endingDate == null && this.startDate == null) {
            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Date";
        }
        else if (this.endingDate == null || this.endingDate == undefined) {
            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select End Date";


        }
        else if (this.startDate == null || this.startDate == undefined) {

            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Start Date";

        }
        else if (this.startDate > this.endingDate) {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "End date must be greater than start date";
        }
        else {
            this.spinner.start();
            this.dataMsg = 'Loading...';
            this.adminService.getPackageBookings(this.appId, this.startDate.getTime(), this.endingDate.getTime(), this.total, '', 0).then(response => {
                this.spinner.stop();
                if (response.length > 0) {
                    this.packageBookingList = response;
                    // this.total = this.packageBookingList.length;
                    this.packageBookingList.forEach(item => {
                        item.packageName = item.productList[0].productName;
                        item.patientFirstName = item.patientProfileDetails.fName;
                        item.patientLastName = item.patientProfileDetails.lName;
                        item.patientMobile = item.patientProfileDetails.contactInfo ? item.patientProfileDetails.contactInfo.mobile : '';
                        item.patientEmail = item.patientProfileDetails.contactInfo ? item.patientProfileDetails.contactInfo.email : '';
                        item.pocName = item.pocDetails ? item.pocDetails.pocName : ''
                    })
                }
                else {
                    this.packageBookingList = new Array();
                    this.dataMsg = "No Data Found";
                    this.total = this.packageBookingList.length;
                }
            });

        }

    }


    onPage(event: any) {

    }

    startDateChoosen($event): void {
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
            this.startDate.getDate(), 0, 0, 0);
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
    }

    endDateChoosen(event) {
        this.endingDate = new Date(this.endingDate.setHours(23, 59, 0, 0))
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
        this.checkEndDate = true;
    }

    clickEventHandler(e) {
        if (e.event === 'commentsButton') {
            this.onButtonClicked(e.val);
        }
    }


    onButtonClicked(data: any): void {
        this.userData = data;
        this.userData.comments = '';
        this.interactionStatus = 'Select Status';
        this.error = '';
        this.modalId = 'abandoned_doctor_id';
        (<any>$)("#modalId").modal("show");
    }

    addInteractionStatus(interactionStatus) {
        this.changesInteractionStatus = this.interactionStatus = interactionStatus;
        this.changesInteractionStatus === 'Select Status' ? this.requestBody.interactionStatus = '' : this.requestBody.interactionStatus = this.changesInteractionStatus;
    }

    onSubmit(remarks) {
        this.error = '';
        this.requestBody.comments = remarks;
        if ((this.interactionStatus == 'Select Status' && this.requestBody.comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }
        let empName = this.employeeName.split(' ');
        this.requestBody.interactionTimestamp = new Date().getTime();
        this.requestBody.empId = this.empId;
        this.requestBody.empFirstName = empName[0];
        this.requestBody.empLastName = empName[1];
        this.requestBody.recordId = this.userData.recordId;
        this.spinner.start();
        this.adminService.updateReviewForAbandonedDoctorBookings(this.requestBody).then(response => {
            this.spinner.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {
                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                this.interactionStatus = null;
                this.userData = {};
                this.first = false;
                this.packageBookingList = new Array();
                this.getCentralPackagePurchases();
            }
            else {
                window.alert('Something went wrong,please try again');
            }

        });
    }

}