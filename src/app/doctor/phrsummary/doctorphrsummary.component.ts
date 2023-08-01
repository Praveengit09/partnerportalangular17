import { HsLocalStorage } from './../../base/hsLocalStorage.service';
import { AuthService } from './../../auth/auth.service';
import { CryptoUtil } from './../../auth/util/cryptoutil';
import { PaymentService } from './../../payment/payment.service';
import { DoctorService } from '../doctor.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { BasketConstants } from '../../constants/basket/basketconstants';
import { SessionBean } from '../../model/slotbooking/sesssionBean';
import { PatientQueue } from '../../model/reception/patientQueue';
import { PatientMedicalAdvise } from '../../model/advice/patientMedicalAdvise';
import { NurseService } from '../../nurse/nurse.service';
import { VideoCardService } from '../prescription/videocard/videocard.service';
import { NotificationsService } from '../../layout/notifications/notifications.service';
import { ToasterService } from '../../layout/toaster/toaster.service';
import { Config } from './../../base/config';

@Component({
    selector: 'doctorphrsummary',
    templateUrl: './doctorphrsummary.template.html',
    styleUrls: ['./doctorphrsummary.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DoctorPHRSummary implements OnInit {

    isVitalsReadingView: boolean;
    queue: PatientQueue;
    consentVerified: boolean = false;
    showConsentForUploadedReports: boolean = false;
    isFromWizard: boolean = false;

    constructor(private router: Router,
        private doctorService: DoctorService,
        private notificationsService: NotificationsService,
        private paymentService: PaymentService,
        private videoCardService: VideoCardService,
        private authService: AuthService,
        private nurseService: NurseService,
        private localStorage: HsLocalStorage,
        private toast: ToasterService,
        private spinnerService: SpinnerService) {
        let self = this;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.doctorService.patientQueue) {
            window.localStorage.setItem(
                "patientQueue",
                cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue))
            );
        } else if (
            window.localStorage.getItem("patientQueue") != undefined &&
            window.localStorage.getItem("patientQueue") != null
        ) {
            this.doctorService.patientQueue = JSON.parse(
                cryptoUtil.decryptData(window.localStorage.getItem("patientQueue"))
            );
        }
        this.queue = this.doctorService.patientQueue;
        $("#vitalsReadingComponentModel").on("hidden.bs.modal", function () {
            self.clearModelVitalsReadingView();
        });

    }
    ngOnInit() {
        // this.doctorService.isFromPatientSummary = true;
    }

    clearModelVitalsReadingView() {
        this.isVitalsReadingView = false;
        console.log("model closed");
    }

    async onClickEngage() {
        console.log('start of onClickEngage');
        this.notifyCustomer(this.doctorService.patientQueue);
        console.log('end of onClickEngage');
    }

    async notifyCustomer(queue: PatientQueue) {
        console.log("start of notifyCustomer")
        this.doctorService.patientQueue = queue;
        window.localStorage.removeItem('patientQueue');
        window.localStorage.removeItem("patientMedicalAdvise");
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('patientQueue', cryptoUtil.encryptData(JSON.stringify(queue)));
        this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
        //for doctor always 5

        let patientStatus: number = 5;
        let digiQueue: boolean = false;
        // let pocId: number = this.authService.userAuth.pocId;
        let digiManager: boolean = false;


        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (queue.bookingSubType == 1) {
            digiQueue = true;
            // pocId = queue.pocId;
            digiManager = true;
        }

        let notifyCustomerRequest = {
            "date": queue.slotDate || date.getTime(),
            // "doctorPocId": queue.doctorPocDetails != undefined ? queue.doctorPocDetails.pocId : 0,
            "bookingPocId": queue.bookingPocId,
            "notifyPartner": digiManager,
            "digiQueue": digiQueue,
            "doctorId": queue.doctorId,
            "invoiceId": queue.invoiceId,
            "orderId": queue.orderId,
            "patientId": queue.patientProfileId,
            "patientStatus": patientStatus,
            "pocId": this.authService.selectedPocDetails.pocId,
            "time": queue.time,
            "doctorInitiated": true
        }
        let notifyResp;
        try {
            notifyResp = await this.paymentService.notifyCustomer(notifyCustomerRequest);
        } catch (error) {
            console.log(error)
        }
        let sessionBean: SessionBean = new SessionBean();
        if (notifyResp.session) {
            if (notifyResp.session && !notifyResp.session.doctorImageUrl) {
                notifyResp.session.doctorImageUrl = this.authService.employeeDetails.imageUrl;
            }
            if (notifyResp.session && !notifyResp.session.patientProfilePic) {
                notifyResp.session.patientProfilePic = queue.patientProfilePic;
            }
            sessionBean = notifyResp.session;
            this.doctorService.patientQueue.sessionBean = sessionBean;
        }
        if (sessionBean != undefined && sessionBean != null
            && sessionBean.apiKey != undefined && sessionBean.apiKey != null
            && sessionBean.sessionId != undefined && sessionBean.sessionId != null

        ) {
            this.doctorService.setOpenTokCredential(sessionBean.apiKey, sessionBean.sessionId, sessionBean.tokenId)
            this.localStorage.saveComponentData(queue);
            this.doctorService.getSavePrescriptionsForPatient(queue.invoiceId).then(data => {
                if (data) {
                    if (data.statusCode != 200 && data.statusCode != 201) {
                        this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
                        return;
                    }
                    if (data.invoiceId == queue.invoiceId) {
                        this.doctorService.patientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        if (this.doctorService.patientMedicalAdvise.diagnosisList) {
                            this.doctorService.patientMedicalAdvise.finalDiagnosisCount = 0;
                            this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount = 0;
                            for (let i = 0; i < this.doctorService.patientMedicalAdvise.diagnosisList.length; i++) {
                                if (this.doctorService.patientMedicalAdvise.diagnosisList[i].finalDiagnosis)
                                    this.doctorService.patientMedicalAdvise.finalDiagnosisCount++;
                                else this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount++;
                            }
                        }
                    }
                    this.doctorService.isVideoQuestionShow = false;
                    sessionBean.bookingPocId = queue.bookingPocId;
                    this.notificationsService.notifyPatient(sessionBean);
                    this.videoCardService.subscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
                    this.router.navigate(['./app/doctor/prescription']);
                }
            }).catch((err) => {
                console.log(err);
                this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            });
        }
        if (queue.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_WALKIN || queue.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_POC) {
            this.doctorService.getSavePrescriptionsForPatient(queue.invoiceId).then(data => {
                if (data) {
                    if (data.statusCode != 200 && data.statusCode != 201) {
                        this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
                        return;
                    }
                    if (data.invoiceId == queue.invoiceId) {
                        this.doctorService.patientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        if (this.doctorService.patientMedicalAdvise.diagnosisList) {
                            this.doctorService.patientMedicalAdvise.finalDiagnosisCount = 0;
                            this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount = 0;
                            for (let i = 0; i < this.doctorService.patientMedicalAdvise.diagnosisList.length; i++) {
                                if (this.doctorService.patientMedicalAdvise.diagnosisList[i].finalDiagnosis)
                                    this.doctorService.patientMedicalAdvise.finalDiagnosisCount++;
                                else this.doctorService.patientMedicalAdvise.nonFinalDiagnosisCount++;
                            }
                        }
                    }
                    this.router.navigate(['./app/doctor/prescription']);
                }
            }).catch((err) => {
                console.log(err);
                this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            });

        }
        console.log('end of notifyCustomer');

    }

    editVitals() {
        this.nurseService.patientQ = this.queue;
        console.log(this.queue);
        this.isVitalsReadingView = true;
        console.log(this.isVitalsReadingView);
        (<any>$("#vitalsReadingComponentModel")).modal("toggle");
    }

    showUploadedRecords() {
        this.showConsentForUploadedReports = true;
        if (Config.portal.doctorOptions.enableOtpBasedConsent == true) {
            this.checkPatientConsent();
        }
        else {
            this.consentVerified = true;
            (<any>$("#uploadedReportsComponentModel")).modal("toggle");
        }

    }



    checkPatientConsent() {
        // this.selectedPatient = this.doctorService.patientQueue;
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
        requestBody.parentProfileId = this.doctorService.patientQueue.parentProfileId;
        requestBody.patientProfileId = this.doctorService.patientQueue.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.consentContentType = 2;
        this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
            if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
                this.consentVerified = true;
                (<any>$("#uploadedReportsComponentModel")).modal("toggle");
            }
            else if (consentStatus.statusCode == 412) {
                this.consentVerified = false;
                this.isFromWizard = true;
            }

        })
    }

    // onConsentRequestClickHandler() {
    //     let cryptoUtil: CryptoUtil = new CryptoUtil();
    //     window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
    //     this.showconsentpopup = true;
    //     this.isFromWizard = true;

    // }

    onModalClose(closeModal) {
        // if (closeModal == 'true') {
        // this.consentVerified = false;i
        console.log('togglemodal', closeModal)
        this.isFromWizard = false;
        if (closeModal == 'true') {
            console.log('togglemodal')
            this.consentVerified == true;
            this.showConsentForUploadedReports = true;
            ((<any>$("#uploadedReportsComponentModel")).modal("show"));
            // this.toggleReportsModal();//on otp verified
        }
        else {
            console.log('togglemodal')
            this.showConsentForUploadedReports = false;
            this.consentVerified == false;
        }




    }

    toggleReportsModal() {
        console.log('togglemodal');
        ((<any>$("#uploadedReportsComponentModel")).modal("hide"));
        $('.modal-backdrop').remove();
    }
}