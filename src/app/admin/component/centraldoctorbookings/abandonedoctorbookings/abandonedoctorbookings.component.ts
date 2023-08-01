import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Config } from '../../../../base/config';
import { AdminService } from '../../../../admin/admin.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
    selector: 'abandoneddoctorbookings',
    templateUrl: './abandonedoctorbookings.template.html',
    styleUrls: ['./abandonedoctorbookings.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class AbandonedDoctorBookingsComponent implements OnInit {

    startDate: Date;
    endDate: Date;
    endingDate: Date;
    appId: number;
    abandonedDiagnosticOrdersList: any;
    perPage: number = 10;
    abandonedDoctorBookingsList: any;
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
 interactionStatus: string = '';
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
            display: 'Patient Details',
            variable: 'patientFirstName patientLastName, patientMobile, patientEmail',
            filler: ',',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Booking Details',
            variable: 'createdTimestamp',
            filter: 'datetime',
            sort: false
        },

        {
            display: 'Doctor Name',
            variable: 'doctorName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Doctor Specialization',
            variable: 'serviceName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Centre Name',
            variable: 'pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Interaction Status',
            variable: 'interactionStatus',
            filter: 'text',
            sort: false
        },
        {
            display: 'Comments',
            variable: 'comments',
            filter: 'text',
            sort: false
        },
        {
            display: 'Add Interaction Status',
            variable: 'interactionStatus',
            filter: 'action',
            type: 'button',
            event: 'commentsButton',
            sort: false,
            conditions: [
                {
                    value: 'Interacted',
                    condition: 'eq',
                    label: 'Add Interaction Status',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    condition: 'default',
                    label: 'Add Interaction Status',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                }

            ]
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
        // this.getAbandonedDoctorBookings();
    }

    getAbandonedDoctorBookings() {

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
            let requestBody: any = {};
            requestBody.fromDate = this.startDate.getTime();
            requestBody.toDate = this.endingDate.getTime();
            requestBody.brandId = this.appId;
            // this.abandonedDoctorBookingsList = new Array();
            this.adminService.getAbandonedDoctorBookings(requestBody).then(response => {
                this.spinner.stop();
                if (response.length > 0) {
                    this.abandonedDoctorBookingsList = response;
                    this.total = this.abandonedDoctorBookingsList.length;
                }
                else {
                    this.abandonedDoctorBookingsList = new Array();
                    this.dataMsg = "No Data Found";
                    this.total = this.abandonedDoctorBookingsList.length;

                }
            });

        }

    }


    onPage(event: any) {

    }

    startDateChoosen($event): void {
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
            this.startDate.getDate(), 0, 0, 0)
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
    }

    endDateChoosen(event) {
        this.endingDate = new Date(this.endingDate.getFullYear(), this.endingDate.getMonth(),
            this.endingDate.getDate(), 0, 0, 0)
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
        // if (data.interactionStatus != 'Interacted') {
            this.userData = data;
            this.userData.comments = '';
            this.interactionStatus = '';
            this.error = '';
            this.modalId = 'abandoned_doctor_id';
            (<any>$)("#modalId").modal("show");

        // }
    }

    addInteractionStatus(interactionStatus) {
        this.requestBody.interactionStatus = this.interactionStatus = interactionStatus;
    }

    onSubmit(remarks) {
        this.error = '';
        this.requestBody.comments = remarks;
        if ((this.interactionStatus == '' && this.requestBody.comments == '')) {
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
                (<any>$)("#select_entity_type").val(0);
                this.interactionStatus = '';
                this.userData = {};
                this.abandonedDoctorBookingsList = new Array();
                this.getAbandonedDoctorBookings();
            }
            else {
                window.alert('Something went wrong. Please try again');
            }

        });
    }

}