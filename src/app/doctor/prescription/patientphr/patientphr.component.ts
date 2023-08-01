import { Component, ViewEncapsulation, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../app.config';
import { OnboardingService } from '../../../onboarding/onboarding.service';
import { DoctorService } from '../../doctor.service';
import { CommonUtil } from '../../../base/util/common-util';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { AuthService } from '../../../auth/auth.service';
import { CryptoUtil } from '../../../auth/util/cryptoutil';
import { ConsentRequestConstants } from '../../../constants/doctor/consentrequestconstants';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { NgOtpInputComponent } from 'ng-otp-input';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { Config } from '../../../base/config';


@Component({
    selector: 'patientphr',
    templateUrl: './patientphr.template.html',
    styleUrls: ['./patientphr.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class PatientPHR implements OnInit {
    patientPHRID: string;
    patientPHR: any[];
    updatedBy: any;
    isPHREdit: boolean = false;
    enablePhrSummary: boolean = false;

    @Output('change') change = new EventEmitter();

    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();
    consentOtp: string = '';
    consentVerified: boolean = false;
    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;


    constructor(config: AppConfig, private commonUtil: CommonUtil = new CommonUtil(),
        private doctorService: DoctorService, private onboardingService: OnboardingService,
        private authService: AuthService, private toast: ToasterService, private spinnerService: SpinnerService) {
        this.patientPHRID = "patientphr" + Math.floor((Math.random() * 1000) + 1);

    }


    ngOnInit() {

    }
    onClickPatientPHR() {
        // (<any>$("#"+this.patientPHRID)).modal("show"); 
        this.isPHREdit = false;
        this.enablePhrSummary = true;
        this.consentVerified = false;
        if (Config.portal.doctorOptions.enableOtpBasedConsent == true) {
            this.checkConsent();
        }
        else {
            this.consentVerified = true;
        }

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
                // this.getVitalReadings();

            }
            else if (response.statusCode == 401) {
                this.consentOtp = '';
                this.toast.show(response.statusMessage, "bg-warning text-white font-weight-bold", 3000);
            }
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            this.ngOtpInput.setValue('');
            this.consentOtp = '';
        });;

    }

    checkConsent() {
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
        requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
        requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.consentContentType = 1;
        this.spinnerService.start();
        this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
            this.spinnerService.stop();
            if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
                this.consentVerified = true;
            }
            else if (consentStatus.statusCode == 412) {
                this.onConsentRequestClickHandler()
            }

        })
    }

    onOtpChange(event) {
        console.log('onOtpChange', event)
        this.consentOtp = event;
    }

}
