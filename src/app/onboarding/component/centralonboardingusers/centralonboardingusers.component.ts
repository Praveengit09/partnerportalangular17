import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { OnboardingService } from '../../onboarding.service';
import { CommonUtil } from '../../../base/util/common-util';
import { CentralOnboardingInteraction } from '../../../model/onboarding/centralonboardinginteraction';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'centralonboardingusers',
    templateUrl: './centralonboardingusers.template.html',
    styleUrls: ['./centralonboardingusers.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class CentralOnboardingUsers implements OnInit {
    startDate: Date;
    endDate: Date;
    endingDate: Date;
    perPage: number = 10;
    from: number = 0;
    errorMessage: Array<string>;
    isDate: boolean = false;
    isDisplay: boolean = false;
    message: Array<string>;
    dataMsg = '';
    isError: boolean;
    disablePageClick: boolean = false;
    centralOnboardingOrdersList: CentralOnboardingInteraction[] = new Array<CentralOnboardingInteraction>();
    total: number = 0;
    changesInteractionStatus: string = '';
    checkEndDate: boolean = false;
    filterInteractionStatus: string;
    interactionStatus: string = '';
    empId: any;
    employeeName: string;
    modalId: any;
    doctorType: boolean;
    diagnosticType: boolean;
    valueToCheckType: number;
    userData: CentralOnboardingInteraction;
    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);
    requestBody = new CentralOnboardingInteraction();
    error: string = '';

    interactionStatusList = ['Select Status', 'Not Interacted', 'Interacted', 'Not Reachable', 'Abusive', 'Re-Interact']
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
            variable: 'title fName lName,\n localDOBYear,patientGender,\n mobileNumber,email',
            filter: 'nametitle',
            filler: ',',
            sort: false
        },
        {
            display: 'Registered Date',
            variable: 'userCreatedTime',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Interaction Status',
            variable: 'status',
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
            variable: 'status',
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
        column: 'userCreatedTime',
        descending: true
    };
    constructor(private onboardingService: OnboardingService, private spinner: SpinnerService,
        private commonUtil: CommonUtil, private authService: AuthService) {
        this.empId = this.authService.userAuth.employeeId;
        this.employeeName = this.authService.userAuth.employeeName;

    }

    ngOnInit() {
        this.centralOnboardingOrdersList = [];
        this.filterInteractionStatus = this.interactionStatus = this.interactionStatusList[0];

    }

    getCentralOnboardingUsersList() {
        if (this.endingDate == null && this.startDate == null) {
            this.setErrorMessage("Please Select Date");
            this.isDate = false;
        }
        else if (this.endingDate == null || this.endingDate == undefined) {
            this.setErrorMessage("Please Select End Date");
            this.isDate = false;
        }
        else if (this.startDate == null || this.startDate == undefined) {
            this.setErrorMessage("Please Select Start Date");
            this.isDate = false;
        }
        else if (this.startDate > this.endingDate) {
            this.setErrorMessage("End date must be greater than start date");
            this.isDate = true;
        }
        else {
            console.log('status' + this.filterInteractionStatus);
            let status: string;
            this.filterInteractionStatus === 'Select Status' ? status = '' : status = this.filterInteractionStatus;
            this.dataMsg = 'Loading....';
            this.spinner.start();
            this.onboardingService.getCentralOnboardingUserOrders(this.startDate.getTime(), this.endingDate.getTime(), status, this.from, 50).then(response => {
                this.spinner.stop();
                this.disablePageClick = response.length < 50 ? false : true;
                if (response.length > 0) {
                    this.dataMsg = '';
                    if (this.total > 0) {
                        this.centralOnboardingOrdersList.push.apply(this.centralOnboardingOrdersList, response);
                    }
                    else {
                        this.centralOnboardingOrdersList = new Array();
                        this.centralOnboardingOrdersList = response;
                        this.centralOnboardingOrdersList.forEach(queue => {
                            queue.localDOBYear = this.commonUtil.getAge(queue.dob).split(",")[0] + this.commonUtil.getAge(queue.dob).split(",")[1];
                            // queue.onboardedDate === 0 ? delete queue.onboardedDate : '';
                        });
                    }
                    this.total = this.centralOnboardingOrdersList.length;
                }
                else {
                    if (this.total == 0) {
                        this.centralOnboardingOrdersList = new Array();
                        this.dataMsg = "No Data Found";
                        this.total = this.centralOnboardingOrdersList.length;
                    }
                }
            });
        }
    }

    onSubmitDate() {
        this.resetOnboardingUsersList();

    }

    onChangeStatus(status) {
        this.filterInteractionStatus = status;
        this.resetOnboardingUsersList();
    }

    resetOnboardingUsersList() {
        this.centralOnboardingOrdersList = new Array<CentralOnboardingInteraction>();
        this.total = this.centralOnboardingOrdersList.length;
        this.getCentralOnboardingUsersList();
    }

    onPage(event) {
        if (this.centralOnboardingOrdersList && this.centralOnboardingOrdersList.length > 0 &&
            this.disablePageClick == true) {
            this.from = this.total;
            this.getCentralOnboardingUsersList();
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
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
        this.checkEndDate = true;
    }

    setErrorMessage(errorMessage: string) {
        this.isDisplay = true;
        this.isDate = false;
        this.message = new Array();
        this.message[0] = errorMessage;
    }


    clickEventHandler(e) {
        if (e.event === 'commentsButton') {
            this.onButtonClicked(e.val);
        }
    }


    onButtonClicked(data: CentralOnboardingInteraction): void {
        // if(data.status != 'Interacted'){
            this.userData = data;
            this.userData.comments = '';
            this.interactionStatus = '';
            this.error = '';
            this.doctorType = false;
            this.diagnosticType = false;
            this.modalId = 'onboarding_id';
            (<any>$)("#modalId").modal("show");
        // }
       
    }

    addInteractionStatus(status) {
        this.changesInteractionStatus = this.interactionStatus = status;
        this.requestBody.status = this.changesInteractionStatus;
    }

    checkType(number: any) {
        this.valueToCheckType = number;

        if (this.valueToCheckType === 1) {
            this.doctorType = this.requestBody.didDoctorBooking = true;
            this.diagnosticType = this.requestBody.didDiagnosticBooking = false;
        }
        else if (this.valueToCheckType === 2) {
            this.doctorType = this.requestBody.didDoctorBooking = false;
            this.diagnosticType = this.requestBody.didDiagnosticBooking = true;
        }

    }

    onSubmit(remarks) {
        this.requestBody.comments = remarks;
        this.error = '';
        if ((this.interactionStatus == '' && this.requestBody.comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }
        this.requestBody.fName = this.userData.fName;
        this.requestBody.lName = this.userData.lName;
        this.requestBody.empId = this.empId;
        this.requestBody.employeeName = this.employeeName;
        this.requestBody.profileId = this.userData.profileId;
        this.requestBody.title = this.userData.title;
        this.requestBody.interactionDate = new Date().getTime();
        this.requestBody.gender = this.userData.gender;
        this.requestBody.onboardedDate = (this.userData.onboardedDate && this.userData.onboardedDate) || 0;
        this.requestBody.dob = this.userData.dob;
        this.requestBody.mobileNumber = this.userData.mobileNumber;
        // this.requestBody.userCreatedTime = this.userData.userCreatedTime;
        this.spinner.start();
        this.onboardingService.updateUserStatus(this.requestBody).then(response => {
            this.spinner.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {
                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                (<any>$)("#select_entity_type").val(0);
                this.doctorType = false;
                this.diagnosticType = false;
                this.interactionStatus = '';
                this.userData = new CentralOnboardingInteraction();
                this.resetOnboardingUsersList();
            }
            else {
                window.alert('Something went wrong,please try again');
            }

        });
    }


}