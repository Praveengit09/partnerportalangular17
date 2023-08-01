import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgOtpInputComponent } from "ng-otp-input";
import { AuthService } from "../../../auth/auth.service";
import { CryptoUtil } from "../../../auth/util/cryptoutil";
import { Config } from '../../../base/config';
import { CommonUtil } from "../../../base/util/common-util";
import { ToasterService } from "../../../layout/toaster/toaster.service";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { PatientMedicalAdvise } from "../../../model/advice/patientMedicalAdvise";
import { SlotBookingDetails } from "../../../model/basket/slotBookingDetails";
import { PhrCategory } from "../../../model/phr/phrCategory";
import { PatientQueue } from "../../../model/reception/patientQueue";
import { NurseService } from "../../../nurse/nurse.service";
import { DoctorService } from "../../doctor.service";

@Component({
    selector: "preconsultationsummary",
    templateUrl: "./preconsultationsummary.template.html",
    styleUrls: ["./preconsultationsummary.style.scss"],
    encapsulation: ViewEncapsulation.Emulated
})

export class PreconsultationSummaryComponent implements OnInit {

    currentView = 'precheck-questionnaire';
    commonUtil: CommonUtil;
    noOfPatientPastPrescriptionToBeAdded: number = 10;
    patientPastPrescriptionCount: number = 0;
    endOfPastPrescriptions: boolean = false;
    pastPrescriptions: PatientMedicalAdvise[] = [];
    perPage: number = 4;
    total: number = 0;
    showQuestionnaire: boolean = false;
    phrType: number = 104;
    dataMsg = " ";
    patientName; string = '';
    onboardingPrescriptionQuestionnaire: PhrCategory = new PhrCategory();
    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();
    consentOtp: string = '';
    consentVerified: boolean = false;
    showModalBody: boolean = false;
    prescription: PatientMedicalAdvise;
    showPastPres: boolean = false;

    @Input() patientQueue: PatientQueue = new PatientQueue();
    @Input() showModal: boolean = false;
    @Input() viewQuestionnaire: boolean = false;
    prescriptionQuestionnaire: PhrCategory = new PhrCategory();
    @Output() onCloseModal = new EventEmitter();
    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;





    columns: any[] = [
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: false
        },
        {
            display: 'Diagnosis',
            variable: 'diagnosisList',
            displayVariable: 'name',
            breakFill: ', ',
            filter: 'array-to-string',
            sort: false
        },
        {
            display: 'Specialization',
            variable: 'serviceName',
            filter: 'text',
            sort: false
        },
        {
            display: 'prescription',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
            filter: 'action',            
            type: 'button',
            event: 'viewpastpres',
            sort: false            
        }
    ]


    sorting: any = {
        column: 'date',
        descending: true
    };
    constructor(private doctorService: DoctorService, private authService: AuthService, private spinner: SpinnerService, private common: CommonUtil,
        private nurseService: NurseService, private toast: ToasterService) {
        this.commonUtil = common;


    }

    ngOnInit() {
        if (this.showModal == true) {
            (<any>$('#PreConsultationModel')).modal("show");

        }
        this.getPrescriptionOnboardingQuestionnaire(this.patientQueue).then(() => {
            this.routeToPage('precheck-questionnaire');

        });


        this.patientName = (this.patientQueue.patientTitle ? this.patientQueue.patientTitle : "") + " " + (this.patientQueue.patientFirstName ? this.patientQueue.patientFirstName : "") + " " + (this.patientQueue.patientLastName ? " " + this.patientQueue.patientLastName : "")

    }

    clickEventHandler(e) {
        if (e.event == "viewpastpres") {
            this.onPastPresClicked(e.val);
        }
    }

    onPastPresClicked(val) {
        this.prescription = val;
        console.log("past pres",JSON.stringify(this.prescription));
        this.showPastPres = true;
        (<any>$('#modalpastpres')).modal("show");
    }

    routeToPage(currentView) {
        this.currentView = currentView;
        if (currentView == 'previsit') {
            this.checkConsent();
        }
        else if (currentView == 'precheck-questionnaire') {
            this.getPrescriptionQuestionnaire(this.patientQueue);
        }


    }


    onPrecheckbtnClickHandler() {
        (<any>$('#PreConsultationModel')).modal("show");
    }

    onPage(event) {

    }

    getMorePastPrescription() {
        let doctorId = 0;
        if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorIdForPastPrescriptions)
            doctorId = this.authService.userAuth.employeeId;

        this.doctorService
            .getAllPatientConsultation(
                this.patientQueue.patientProfileId,
                this.patientPastPrescriptionCount,
                10,
                doctorId,
                0
            ).then(data => {


                let pastPrescriptionData = JSON.parse(JSON.stringify(data));
                if (pastPrescriptionData.length > 0) {
                    this.dataMsg = " ";

                    if (this.pastPrescriptions.length > 0) {
                        this.pastPrescriptions.push(pastPrescriptionData)
                    }
                    else {
                        this.pastPrescriptions = (pastPrescriptionData);
                    }
                    this.total = this.patientPastPrescriptionCount = this.pastPrescriptions.length;

                    console.log('pastPrescriptionData&&&', this.currentView)
                }
                else {
                    this.dataMsg = "No Data Found";
                }
            });
    }




    async getPrescriptionQuestionnaire(patientQueue) {
        let bookingType = patientQueue.bookingType;
        let bookingSubType = patientQueue.bookingSubType;
        if (`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT}`
            || `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_VIDEO}_0` || `${bookingType}_${bookingSubType}` === `0_2`
        ) {

            if (this.currentView == 'onboarding') {
                this.phrType = 105;
            }
            else {
                this.phrType = 100;
            }
            await this.doctorService.getAnsOfVideoBooking(patientQueue.patientProfileId, this.phrType).then(data => {

                this.formatQuestinnaireData(data, '');
            }).catch((err) => {

            });
        }
        else if ((`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN}` ||
            `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC}`
            || `${bookingType}_${bookingSubType}` === `0_0` || `${bookingType}_${bookingSubType}` === `0_3`
        )) {

            if (this.currentView == 'onboarding') {
                this.phrType = 105;
            }
            else {
                this.phrType = 104;
            }
            this.spinner.start();
            await this.nurseService.getWalkinBookingQuestions(patientQueue.patientProfileId, this.phrType).then(data => {
                this.spinner.stop()
                this.prescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
                this.viewQuestionnaire = true;
                if (data) {

                    this.formatQuestinnaireData(data, '');
                }
            }).catch((err) => {
                this.spinner.stop();
            });

            console.log('videQuestionModel', JSON.stringify(this.prescriptionQuestionnaire.activities[0]));
        }

    }


    async getPrescriptionOnboardingQuestionnaire(patientQueue) {
        let bookingType = patientQueue.bookingType;
        let bookingSubType = patientQueue.bookingSubType;
        if (`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_VIDEO_CHAT}`
            || `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_VIDEO}_0` || `${bookingType}_${bookingSubType}` === `0_2`
        ) {

            this.phrType = 105;
            await this.doctorService.getAnsOfVideoBooking(patientQueue.patientProfileId, this.phrType).then(data => {

                this.formatQuestinnaireDataForOnboarding(data, 'onboarding');
            }).catch((err) => {

            });
        }
        else if ((`${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_WALKIN}` ||
            `${bookingType}_${bookingSubType}` === `${SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT}_${SlotBookingDetails.DOCTOR_SLOT_BOOKING_SUB_TYPE_POC}`
            || `${bookingType}_${bookingSubType}` === `0_0` || `${bookingType}_${bookingSubType}` === `0_3`
        )) {

            this.phrType = 105;
            this.spinner.start();
            await this.nurseService.getWalkinBookingQuestions(patientQueue.patientProfileId, this.phrType).then(data => {
                this.spinner.stop()
                // this.onboardingPrescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
                this.viewQuestionnaire = true;
                if (data) {

                    this.formatQuestinnaireDataForOnboarding(data, 'onboarding');
                }
            }).catch((err) => {
                this.spinner.stop();
            });

        }

    }

    formatQuestinnaireData(data, currentView) {

        let prescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
        this.viewQuestionnaire = true;
        if (data) {
            for (let i = 0; i < prescriptionQuestionnaire.activities.length; i++) {
                for (let j = 0; j < prescriptionQuestionnaire.activities[i].question.length; j++) {
                    let componentId = prescriptionQuestionnaire.activities[i].question[j].componentId;
                    let inputType = prescriptionQuestionnaire.activities[i].question[j].inputType
                    if (componentId == 0 || (componentId == 1 && inputType != 2) || componentId == 4 || componentId == 5) {
                        for (let k = 0; k < prescriptionQuestionnaire.activities[i].question[j].choices.length; k++) {
                            for (let l = 0; l < prescriptionQuestionnaire.activities[i].question[j].choices[k].length; l++) {
                                if (prescriptionQuestionnaire.activities[i].question[j].choices[k][l].id == prescriptionQuestionnaire.activities[i].question[j].ans && (prescriptionQuestionnaire.activities[i].question[j].ans != '')) {
                                    prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = prescriptionQuestionnaire.activities[i].question[j].choices[k][l].option;
                                    break;
                                }
                            }
                        }
                    }
                    else if (prescriptionQuestionnaire.activities[i].question[j].componentId == 2 || prescriptionQuestionnaire.activities[i].question[j].componentId == 9 || (prescriptionQuestionnaire.activities[i].question[j].componentId == 1 && prescriptionQuestionnaire.activities[i].question[j].inputType == 2)) {
                        prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = prescriptionQuestionnaire.activities[i].question[j].ans;
                    }

                }
            }
        }

        // if (currentView != 'onboarding') {
        this.prescriptionQuestionnaire = prescriptionQuestionnaire;
        // } 

    }

    formatQuestinnaireDataForOnboarding(data, currentView) {


        let prescriptionQuestionnaire = new PhrCategory();
        prescriptionQuestionnaire = this.onboardingPrescriptionQuestionnaire = JSON.parse(JSON.stringify(data));
        this.viewQuestionnaire = true;
        if (data) {
            for (let i = 0; i < prescriptionQuestionnaire.activities.length; i++) {
                for (let j = 0; j < prescriptionQuestionnaire.activities[i].question.length; j++) {
                    let componentId = prescriptionQuestionnaire.activities[i].question[j].componentId;
                    let inputType = prescriptionQuestionnaire.activities[i].question[j].inputType
                    if (componentId == 0 || (componentId == 1 && inputType != 2) || componentId == 4 || componentId == 5) {
                        for (let k = 0; k < prescriptionQuestionnaire.activities[i].question[j].choices.length; k++) {
                            for (let l = 0; l < prescriptionQuestionnaire.activities[i].question[j].choices[k].length; l++) {
                                if (prescriptionQuestionnaire.activities[i].question[j].choices[k][l].id == prescriptionQuestionnaire.activities[i].question[j].ans && (prescriptionQuestionnaire.activities[i].question[j].ans != '')) {
                                    prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = prescriptionQuestionnaire.activities[i].question[j].choices[k][l].option;
                                    break;
                                }
                            }
                        }
                    }
                    else if (prescriptionQuestionnaire.activities[i].question[j].componentId == 2 || prescriptionQuestionnaire.activities[i].question[j].componentId == 9 || (prescriptionQuestionnaire.activities[i].question[j].componentId == 1 && prescriptionQuestionnaire.activities[i].question[j].inputType == 2)) {
                        prescriptionQuestionnaire.activities[i].question[j].calcuatedAnswer = prescriptionQuestionnaire.activities[i].question[j].ans;
                    }

                }
            }
            this.onboardingPrescriptionQuestionnaire = JSON.parse(JSON.stringify(prescriptionQuestionnaire));;

        }








    }





    closeModal() {
        (<any>$('#PreConsultationModel')).modal("hide");
        this.onCloseModal.emit('true')
    }



    checkConsent() {
        let requestBody: any = { "parentProfileId": 0, "patientProfileId": 0, "empId": 0, "consentContentType": 0 };
        requestBody.parentProfileId = this.patientQueue.parentProfileId;
        requestBody.patientProfileId = this.patientQueue.patientProfileId;
        requestBody.empId = this.authService.employeeDetails.empId;
        requestBody.consentContentType = 2;
        this.spinner.start();
        this.doctorService.checkConsentStatus(requestBody).then((consentStatus) => {
            this.spinner.stop();
            if (consentStatus.statusCode == 200 || consentStatus.statusCode == 201) {
                this.consentVerified = true;
                this.getMorePastPrescription();

            }
            else if (consentStatus.statusCode == 412) {
                this.consentVerified = false;
                this.showModalBody = true;
                this.onConsentRequestClickHandler()
            }

        })
    }



    async onConsentRequestClickHandler() {
        console.log('onConsentRequestClickHandler');
        let cryptoUtil: CryptoUtil = new CryptoUtil();

        this.selectedPatient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientQueue')));
        this.selectedPatient = this.patientQueue;
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
                this.consentVerified = true;
                this.toast.show("Consent request succesful", "bg-success text-white font-weight-bold", 3000);
                this.getMorePastPrescription();
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

}