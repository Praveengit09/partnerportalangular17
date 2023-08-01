import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Config } from '../../../../base/config';
import { DiagnosticAdminService } from '../../diagnosticadmin.service';
import { AuthService } from '../../../../auth/auth.service';


@Component({
    selector: 'abandoneddiagnosticorders',
    templateUrl: './abandonedDiagnosticorders.template.html',
    styleUrls: ['./abandonedDiagnosticorders.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class AbandonedDiagnosticOrdersComponent implements OnInit {

    startDate: Date;
    endDate: Date;
    endingDate: Date;
    appId: number;
    abandonedDiagnosticOrdersList: any;
    perPage: number = 10;
    errorMessage: Array<string>;
    isDate: boolean = false;
    isDisplay: boolean = false;
    message: Array<string>;
    dataMsg = '';
    isError: boolean;
    error: string = '';
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
            variable: 'patientFirstName patientLastName,patientMobile,patientEmail',
            filter: 'nametitle',
            filler: ',',
            sort: false
        },
        {
            display: 'Booking Details',
            variable: 'createdTimestamp',
            filter: 'datetime',
            sort: false
        },

        {
            display: 'Tests',
            variable: 'testName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Lab Centre Name',
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
            filter: 'action',
            type: 'button',
            event: 'commentsButton',
            variable: 'interactionStatus',
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
        column: 'orderId',
        descending: true
    };
    constructor(private diagnosticsService: DiagnosticAdminService, private spinner: SpinnerService, private authService: AuthService) {
        this.employeeName = this.authService.userAuth.employeeName;
        this.empId = this.authService.userAuth.employeeId;
        if (Config.portal)
            this.appId = Config.portal.appId;
    }
    ngOnInit() {
        // this.getAbandonedDiagnosticOrders();
    }

    getAbandonedDiagnosticOrders() {
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
            let requestBody: any = {};
            requestBody.fromDate = this.startDate.getTime();
            requestBody.toDate = this.endingDate.getTime();
            requestBody.brandId = this.appId;
            this.spinner.start();
            this.dataMsg = 'Loading....';
            this.diagnosticsService.getDiagnosticAbandonedOrders(requestBody).then(response => {
                this.spinner.stop();
                if (response.length > 0) {
                    this.abandonedDiagnosticOrdersList = response;
                    this.total = this.abandonedDiagnosticOrdersList.length;
                }
                else {
                    this.abandonedDiagnosticOrdersList = new Array();
                    this.dataMsg = 'No Data Found'
                    this.total = this.abandonedDiagnosticOrdersList.length;

                }
            });

        }

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

    onPage(event: any) {

    }

    clickEventHandler(e) {
        if (e.event === 'commentsButton') {
            this.onButtonClicked(e.val);
        }
    }

    onButtonClicked(data: any): void {
        // if(data.interactionStatus != 'Interacted'){
            this.userData = data;
            this.userData.comments = '';
            this.interactionStatus = '';
            this.error = '';
            this.modalId = 'abandoned_diagnostic_id';
            (<any>$)("#modalId").modal("show");
        // }
      
    }

    addInteractionStatus(interactionStatus) {
        this.requestBody.interactionStatus = this.interactionStatus = interactionStatus;
    }

    onSubmit(remarks) {
        this.requestBody.comments = remarks;
        this.error = '';
        if ((this.interactionStatus == '' && this.requestBody.comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }
        let empName = this.employeeName.split(' ');
        this.requestBody.interactionTimestamp = new Date().getTime();
        this.requestBody.acceptedEmpId = this.empId;
        this.requestBody.acceptedEmpName = empName[0];
        this.requestBody.empLastName = empName[1];
        this.requestBody.recordId = this.userData.recordId;
        this.spinner.start();
        this.diagnosticsService.updateInteractionStatusOfAbandonedDiagnosticOrders(this.requestBody).then(response => {
            this.spinner.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {

                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                (<any>$)("#select_entity_type").val(0);
                this.interactionStatus = '';
                this.userData = {};
                this.abandonedDiagnosticOrdersList = new Array();
                this.getAbandonedDiagnosticOrders();
            }
            else {
                window.alert('Something went wrong,please try again');
            }
        });
    }


}