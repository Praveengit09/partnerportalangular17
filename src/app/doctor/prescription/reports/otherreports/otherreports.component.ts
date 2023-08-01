import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DoctorUtil } from '../../../../base/util/doctor-util';
import { AuthService } from '../../../../auth/auth.service';
import { DoctorService } from '../../../../doctor/doctor.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { UserReport } from '../../../../model/report/userReport';
import { OnboardingService } from '../../../../onboarding/onboarding.service';
import { PatientQueue } from '../../../../model/reception/patientQueue';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { ConsentRequestConstants } from '../../../../constants/doctor/consentrequestconstants';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { NgOtpInputComponent } from 'ng-otp-input';
import { Config } from '../../../../base/config';

@Component({
    selector: 'other_reports',
    templateUrl: './otherreports.template.html',
    styleUrls: ['./otherreports.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class OtherReportsComponent implements OnInit, OnDestroy {

    @Input("isNotPopupWidget") isNotPopupWidget: boolean = false;
    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    profileId: any;
    type: Array<number>;
    otherReportList: Array<UserReport> = new Array<UserReport>();
    perPage: number = 10;
    total: number = 0;
    dataMsg = '';

    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();
    consentOtp: string = '';
    consentVerified: boolean = false;
    showModalBody: boolean = false;
    columns: any[] = [
        {
            display: 'Date',
            variable: 'reportedDate',
            filter: 'date',
            sort: true
        },
        {
            display: 'Patient Name',
            variable: 'fName lName',
            filler: ',',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'FileName',
            variable: 'name',
            filler: ',',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Files',
            label: 'Download Report',
            filter: 'action',
            event: 'reportClick',
            type: 'hyperlink',
            style: 'btn btn-danger mb-xs done_txt',
            sort: false,
            variable: 'name',
            conditions: [
                {
                    condition: 'default',
                    label: 'Download Report',
                    style: 'btn btn-danger mb-xs done_txt'
                }
            ]
        }
    ]
    sorting: any = {
        column: 'reportedDate',
        descending: true
    };


    constructor(private onboardingService: OnboardingService, private doctorService: DoctorService,
        private spinnerService: SpinnerService, private authService: AuthService, private toast: ToasterService) {
    }

    ngOnInit() {
        this.profileId = this.doctorService.patientQueue.patientProfileId;
        console.log(this.profileId);
        this.isNotPopupWidget == true ? this.getOtherReportsData() : '';
    }



    getOtherReportsData() {
        console.log('reportsdata')
        this.spinnerService.start();
        // this.dataMsg = 'Loading...';
        this.type = new Array<number>();
        this.type[0] = 4;
        this.onboardingService.getUploadedReports(true, this.profileId, this.type, 0).then((data) => {

            this.spinnerService.stop();
            this.showModalBody = true;
            if (data && data.length >= 0 && data != undefined && data != null) {
                // this.consentVerified = true;
                this.otherReportList = data;
            }
            // else {
            //     this.consentVerified == false && this.isNotPopupWidget != true && this.onConsentRequestClickHandler();
            // }

            if (this.otherReportList.length > 0) {
                this.total = this.otherReportList.length;
            } else {
                this.otherReportList = new Array();
                this.dataMsg = "No Data Found";
                this.total = this.otherReportList.length;
            }
            console.log("OtherReports: " + JSON.stringify(data));

        }).catch((err) => {
            this.spinnerService.stop();
        });
    }

    clickEventHandler(e) {
        if (e.event === 'reportClick') {
            this.onButtonClicked(e.val);
        }
    }

    onButtonClicked(reportItem) {
        console.log("onButtonClicked: ", reportItem);
        if (reportItem.fileUrlList && reportItem.fileUrlList.length > 0 && reportItem.fileUrlList[0].fileUrl != undefined) {
            this.authService.openPDF(reportItem.fileUrlList[0].fileUrl);
        }
    }
    openURLInNewTab(url) {
        this.authService.openPDF(url);
    }

    getFileExtensionFromUrl(url: string) {
        return DoctorUtil.getFileExtensionFromUrl(url);
    }

    openOtherReportsModal() {
        (<any>$("#otherReportsModal")).modal("show");
        if (Config.portal.doctorOptions.enableOtpBasedConsent == true) {
            this.checkPatientConsentforReports()
        }
        else {
            this.consentVerified = true;
            this.showModalBody = true
            this.getOtherReportsData();
        }


    }

    checkPatientConsentforReports() {
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
        requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
        requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.consentContentType = 2;
        this.spinnerService.start();
        this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
            this.spinnerService.stop();
            if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
                this.consentVerified = true;
                this.getOtherReportsData();
            }
            else if (consentStatus.statusCode == 412) {
                this.showModalBody = true;
                this.consentVerified = false;
                this.onConsentRequestClickHandler();
            }

        })

    }

    onPage(event) {

    }

    async onConsentRequestClickHandler() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        this.selectedPatient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientQueue')));
        this.requestConsentForPatient = `${this.selectedPatient.patientTitle ? this.selectedPatient.patientTitle + '. ' : ''} ${('' + this.selectedPatient.patientFirstName).slice(0, 22)} ${this.selectedPatient.patientLastName ? ('' + this.selectedPatient.patientLastName).slice(0, 22) : ''}`;
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0 };
        requestBody.parentProfileId = this.selectedPatient.parentProfileId;
        requestBody.patientProfileId = this.selectedPatient.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        await this.doctorService.requestPatientConsent(requestBody).then((response) => {
            if (response.statusCode == 401) {
                this.toast.show("Something went wrong,please try again", "bg-warning text-white font-weight-bold", 3000);
            }

        });

    }


    verifyConsentOtpHandler() {
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "otp": '' };
        requestBody.parentProfileId = this.selectedPatient.parentProfileId;
        requestBody.patientProfileId = this.selectedPatient.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.otp = this.consentOtp;
        this.doctorService.verifyConsentOtp(requestBody).then((response) => {
            if (response.statusCode == 200 || response.statusCode == 201) {
                this.doctorService.consentOtpVerified = true;
                this.consentVerified = true;
                this.toast.show("Consent request succesful", "bg-success text-white font-weight-bold", 3000);
                this.getOtherReportsData();
            }
            else if (response.statusCode == 401) {
                this.ngOtpInput.setValue('');
                this.consentOtp = '';
                this.toast.show(response.statusMessage, "bg-warning text-white font-weight-bold", 3000);
            }
        }).catch((err) => {
            console.log(err)
        }).finally(() => {

        });;
    }

    onOtpChange(event) {
        console.log('onOtpChange', event)
        this.consentOtp = event;
    }

    ngOnDestroy() {
        (<any>$("#otherReportsModal")).modal("hide");
    }
}