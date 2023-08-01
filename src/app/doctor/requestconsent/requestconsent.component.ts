import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { ToasterService } from "../../layout/toaster/toaster.service";
import { AuthService } from "../../auth/auth.service";
import { CryptoUtil } from "../../auth/util/cryptoutil";
import { PatientQueue } from "../../model/reception/patientQueue";
import { DoctorService } from "../doctor.service";
import { NgOtpInputComponent } from "ng-otp-input";

@Component({
    selector: "requestconsent",
    templateUrl: "./requestconsent.template.html",
    styleUrls: ["./requestconsent.style.scss"],
    encapsulation: ViewEncapsulation.Emulated
})

export class RequestConsentComponent implements OnInit {

    @Output() onModalClose = new EventEmitter();
    @Input() isFromWizard: boolean = false;
    @Input() isFromqueue: boolean = false;
    @Output() emitConsentStatus = new EventEmitter();
    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();
    consentOtp: string = '';
    
    constructor(private authService: AuthService, private doctorService: DoctorService, private toast: ToasterService) {

    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        this.selectedPatient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientQueue')));
        this.onConsentRequestClickHandler();
        this.isFromWizard == true && (<any>$("#requestconsentmodalinqueue")).modal("show");
    }




    onConsentRequestClickHandler() {
        this.requestConsentForPatient = `${this.selectedPatient.patientTitle ? this.selectedPatient.patientTitle + '. ' : ''} ${('' + this.selectedPatient.patientFirstName).slice(0, 22)} ${this.selectedPatient.patientLastName ? ('' + this.selectedPatient.patientLastName).slice(0, 22) : ''}`;
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0 };
        requestBody.parentProfileId = this.selectedPatient.parentProfileId;
        requestBody.patientProfileId = this.selectedPatient.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        this.doctorService.requestPatientConsent(requestBody).then((response) => {
            if (response.statusCode == 200) {
                this.emitConsentStatus.emit('true');
            }
            else if (response.statusCode == 201) {
                this.isFromWizard != true && (<any>$("#requestconsentmodalinqueue")).modal("show");
                this.emitConsentStatus.emit('false');
            }
            else if (response.statusCode == 401) {
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
            this.doctorService.consentOtpVerified=true;
                this.onModalClose.emit('true');
                (<any>$("#requestconsentmodalinqueue")).modal("hide");
                this.toast.show("Consent request succesful", "bg-success text-white font-weight-bold", 3000);

            }
            else if (response.statusCode == 401) {
                this.onModalClose.emit('false');
                this.ngOtpInput.setValue('');
                this.consentOtp = '';
                this.toast.show(response.statusMessage, "bg-warning text-white font-weight-bold", 3000);
            }
        }).catch((err) => {
            console.log(err)
        }).finally(() => {

        });





    }

    closeModal() {
        this.onModalClose.emit('false');
        (<any>$("#requestconsentmodalinqueue")).modal("hide");
    }


    onOtpChange(event) {
        console.log('onOtpChange', event)
        this.consentOtp = event;
        // console.log('onOtpChange', event.target.value)
    }


}