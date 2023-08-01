import { DiagnosticAdminService } from './../../diagnosticadmin.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { OnInit, ViewEncapsulation, Component } from '@angular/core';
import { Config } from './../../../../base/config';
import { DateUtil } from '../../../../base/util/dateutil';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { AuthService } from '../../../../auth/auth.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
    selector: 'enquirylist',
    templateUrl: './enquirydetails.template.html',
    styleUrls: ['./enquirydetails.styles.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class EnquirylistComponent implements OnInit {

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    error: string = '';
    type: string = '';
    mainFilterTypes: string[] = ['CorporateWellness', 'NewsLetter', 'HomeCollection', 'Enquiry', 'Reports'];
    subFilterTypes: string[] = ['website', 'callCenter', 'App'];
    sourceApp: number = 0;

    startDate: Date = new Date();
    endDate: Date = new Date();

    startDateInMillis: number;
    endDateInMillis: number;

    enquiryForm: FormGroup;
    City: any = ['Bangalore', 'Hyderabad', 'Chennai', 'Kochi'];
    formMobile = "";

    enquiryStatusForm: FormGroup;
    enquiryStatus: any = ['Not-Intracted', 'Intracted', 'Not-Reachable', 'Abusive', 'Re-Interact'];
    currentEnquiry: any;
    intractionHistory = "";
    datepickerOpts = {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    mobileNo: string;
    fromIndex = 0;
    data: any[];
    dataMsg: string = ' ';
    total: number = 0;
    perPage: number = 10;
    enableVdcCustomTag: boolean = false;
    corporate: number = 0;
    newsLetter: number = 0;
    reports: number = 0;
    homeCollection: number = 0;
    enquiry: number = 0;
    appCount: number = 0;
    websiteCount: number = 0;
    callcenterCount: number = 0;



    columns: any[] = [
        {
            display: 'Name',
            variable: 'name',
            filter: 'text',
            sort: true
        },
        {
            display: 'Mobile',
            variable: 'mobileNo',
            filter: 'text',
            sort: false
        },
        {
            display: 'Email Id',
            variable: 'email',
            filter: 'text',
            sort: false
        },
        {
            display: 'City',
            variable: 'city',
            filter: 'text',
            sort: false
        },
        {
            display: 'Enquiry',
            variable: 'enquiryFor',
            filter: 'text',
            sort: false
        },
        {
            display: 'Enquiry Date',
            variable: 'enquiryDate',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'Action',
            label: 'VIEW',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'enquiryStatusUpdateModel',
            sort: false,
            variable: 'enquiryStatusSet',
            conditions: [
                {
                    condition: 'default',
                    label: 'Update Status'
                }
            ]
        },
        {
            display: 'Intraction Details',
            variable: 'status_comment',
            filter: 'htmlContent',
            sort: false,
            event: 'showConsumerEnquiryModel',
            eventLabel: 'View All',
            eventVisibleWhenEmpty: false
        },
        {
            display: 'Enquiry Type',
            variable: 'type',
            filter: 'text',
            sort: false
        }
    ];

    constructor(public spinnerService: SpinnerService, private diagAdminService: DiagnosticAdminService, private authService: AuthService,
        private validation: ValidationUtil, private toast: ToasterService, private commonUtil: CommonUtil) {

    }

    ngOnInit() {
        if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName) {
            this.enableVdcCustomTag = true;
        }
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('enquiryStartDate') != null && window.localStorage.getItem('enquiryStartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('enquiryStartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('enquiryEndDate'))));
            this.submit();
        }
        else
            this.getBaseEnquiryDetails();

        this.resetForm();
    }

    getBaseEnquiryDetails() {
        this.mobileNo = '';
        this.fromIndex = 0;
        this.type = '';
        this.sourceApp = 0;
        this.data = [];
        this.total = 0;
        this.startDateInMillis = DateUtil.removeTimeInMillis(this.startDate.getTime());
        this.endDateInMillis = DateUtil.removeTimeInMillis(this.endDate.getTime() + (24 * 60 * 60 * 1000));
        this.getEnquiryDetails();
        this.getEnquiryDetailsCount();
    }

    getEnquiryDetails() {
        this.spinnerService.start();
        this.diagAdminService.getEnquiryDetails(this.mobileNo, this.startDateInMillis, this.endDateInMillis, this.fromIndex, this.type, this.sourceApp).then(response => {
            this.spinnerService.stop();
            if (response.length > 0) {
                if (this.fromIndex == 0)
                    this.data = response;
                else
                    this.data = [...this.data, ...response];
                this.data.forEach((dat) => {
                    if (dat.consumerInteractionHistory) {
                        dat.status_comment = this.commonUtil.getFormattedConsumerInteractionData(dat.consumerInteractionHistory[0]);
                    }
                })
            } else {
                this.dataMsg = "No Data Found";
                this.data = new Array();
            }
            this.total = this.data.length;
        });
    }

    getEnquiryDetailsCount() {
        if (!this.enableVdcCustomTag) {
            return;
        }
        this.spinnerService.start();
        this.diagAdminService.getEnquiryDetailsCount(this.startDateInMillis, this.endDateInMillis, this.mobileNo, this.type).then(response => {
            this.spinnerService.stop();
            console.log("counts-", JSON.stringify(response));
            if (response && response.length == 0) {
                if (this.type.length == 0)
                    this.resetCount();
                else {
                    this.appCount = 0;
                    this.websiteCount = 0;
                    this.callcenterCount = 0;
                }
            } else {
                this.appCount = response[0].andriodAppCount;
                this.websiteCount = response[0].consumerAppCount;
                this.callcenterCount = response[0].partnerAppCount;
                if (this.type.length == 0) {
                    this.corporate = response[0].corporateWellnessCount;
                    this.newsLetter = response[0].newsLetterCount;
                    this.homeCollection = response[0].homeCollectionCount;
                    this.enquiry = response[0].enquiryCount;
                    this.reports = response[0].reportsCount;
                }
            }
            this.deselectMainFilter(this.type);
        });
    }

    onSourceFilter(num) {
        this.sourceApp = num;
        let type = num == 3 ? 'callCenter' : num == 5 ? 'website' : num == 1 ? 'App' : "";
        let subfilterButtons = document.getElementById(type);

        if (subfilterButtons != null && this.enableVdcCustomTag) {
            subfilterButtons.style.borderWidth = '5px';
            this.deselectSubFilters(type);
        }
        this.getEnquiryDetails();
    }

    onStatusButtonSelect(num) {
        num == 1 ? this.type = 'CorporateWellness' : num == 2 ? this.type = 'NewsLetter' : num == 3 ? this.type = 'HomeCollection' : num == 4 ? this.type = 'Enquiry' : num == 5 ? this.type = 'Reports' : this.type = '';
        const filterButtons = document.getElementById(this.type);
        if (filterButtons != null && this.enableVdcCustomTag) {
            filterButtons.style.borderWidth = '5px';
            this.deselectMainFilter(this.type);
        }
        this.sourceApp = 0;
        this.getEnquiryDetails();
        this.getEnquiryDetailsCount();
    }

    deselectMainFilter(mainFilter) {
        if (this.enableVdcCustomTag) {
            this.mainFilterTypes.forEach(type => {
                let filterButton = document.getElementById(type);
                if (type != mainFilter) {
                    filterButton.style.borderWidth = '1px';
                }
            })
            this.deselectSubFilters("");
        }
    }

    deselectSubFilters(subFilter) {
        if (this.enableVdcCustomTag) {
            this.subFilterTypes.forEach(type => {
                let filterButton = document.getElementById(type);
                if (type != subFilter) {
                    filterButton.style.borderWidth = '1px';
                }
            })
        }
    }

    onEnterPressed(e) {
        this.isError = false;
        this.errorMessage = new Array();
        if (e.keyCode == 13) {
            this.data = [];
            this.getLeadsWithMobile();
        }
    }

    startDateChoosen($event): void {
        this.startDate = $event;
    }

    endDateChoosen($event) {
        this.endDate = $event;
    }

    submit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('enquiryStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('enquiryEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.errorMessage = new Array();
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage.push("End date must be greater than start date");
            return;
        }
        this.mobileNo = $('#search').val().toString();
        if (this.startDate == null || this.endDate == null)
            return;
        this.startDateInMillis = DateUtil.removeTimeInMillis(this.startDate.getTime());
        this.endDateInMillis = DateUtil.removeTimeInMillis(this.endDate.getTime() + (24 * 60 * 60 * 1000));
        this.fromIndex = 0;
        this.type = '';
        this.sourceApp = 0;
        this.data = [];
        this.total = 0;
        this.getEnquiryDetails();
        this.getEnquiryDetailsCount();
    }


    onPage(page: number) {
        if (this.total < 50 || (+this.total % 50) > 0) {
            return;
        }
        this.fromIndex = +this.total;
        this.getEnquiryDetails();
    }

    getLeadsWithMobile() {
        this.mobileNo = $('#search').val().toString();
        if (this.mobileNo.length != 10) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter valid mobile number');
            this.showMessage = true;
            return;
        }
        this.spinnerService.start();
        this.data = [];
        this.getEnquiryDetails();
    }

    resetForm() {
        this.enquiryForm = new FormGroup({
            'name': new FormControl(null, Validators.required),
            'email': new FormControl(null, Validators.email),
            // [Validators.pattern( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
            'mobileNo': new FormControl(null, [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]),
            'city': new FormControl("", Validators.required),
            'enquiryFor': new FormControl(null, Validators.required)
        })
        this.enquiryStatusForm = new FormGroup({
            'consumerInteractionStatus': new FormControl('', Validators.required),
            'consumerInteractedComments': new FormControl(null, Validators.required)
        })
    }

    resetCount() {
        this.reports = 0;
        this.corporate = 0;
        this.enquiry = 0;
        this.homeCollection = 0;
        this.newsLetter = 0;
        this.appCount = 0;
        this.callcenterCount = 0;
        this.websiteCount = 0;
        this.deselectMainFilter(this.type)
    }

    validate(event, type) {
        switch (type) {
            case 0: return this.validation.onlyAlphabetsWithSpace(event)           //name     
            case 1: return this.validation.onlyNumbers(event) && (this.formMobile.length < 10);  //mobile Number 
            default: return false;
        }
    }

    onSubmit() {
        let enquiryFormData = this.enquiryForm.value;
        enquiryFormData.id = "5";
        enquiryFormData.params = {};
        enquiryFormData.status = 0;
        enquiryFormData.type = "Enquiry";
        this.diagAdminService.postEnquiryDetails(enquiryFormData);
        this.toast.show('Enquiry Added Successfully', "bg-success text-white font-weight-bold", 3000);
        this.getBaseEnquiryDetails();
    }

    clickEventHandler(event) {
        if (event.event === 'enquiryStatusUpdateModel') {
            this.currentEnquiry = {};
            this.currentEnquiry = event.val;
            this.resetForm();
            (<any>$("#enquiryStatusUpdateModel")).modal("show");
        }
        else if (event.event === 'showConsumerEnquiryModel') {
            let tmp = new Array();
            if (event.val && event.val.consumerInteractionHistory && event.val.consumerInteractionHistory.length > 0) {
                event.val.consumerInteractionHistory.forEach(interactionData => {
                    tmp.push(this.commonUtil.getFormattedConsumerInteractionData(interactionData));
                });
                this.intractionHistory = tmp.join(' ');
            }
            (<any>$("#showConsumerEnquiryModel")).modal("show");
        }
    }

    onSubmitStatus() {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].mobileNo === this.currentEnquiry.mobileNo) {
                let consumerInteractionHistory = this.enquiryStatusForm.value;
                consumerInteractionHistory.consumerInteractedEmpId = this.authService.userAuth.employeeId;
                consumerInteractionHistory.consumerInteractedEmployeeName = this.authService.userAuth.employeeName;
                consumerInteractionHistory.consumerInteractionDate = new Date().getTime() + (24 * 60 * 60 * 1000);
                if (this.data[i].consumerInteractionHistory)
                    this.data[i].consumerInteractionHistory = [consumerInteractionHistory, ...this.data[i].consumerInteractionHistory];
                else {
                    this.data[i].consumerInteractionHistory = [];
                    this.data[i].consumerInteractionHistory.push(consumerInteractionHistory);
                }
                this.diagAdminService.updateEnquiryStatus(this.data[i]);
            }
            this.toast.show('Update added succesfully please "Refresh"', "bg-success text-white font-weight-bold", 3000);
        }
    }
}
