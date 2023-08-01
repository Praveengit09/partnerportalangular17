import { BaseResponse } from './../model/base/baseresponse';
import { CDSSClinicalAndDiagnosisResponse } from './../model/advice/CDSSClinicalAndDiagnosisResponse';
import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from './../base/appconstants';
// import * as OT from 'opentok';
import * as OT from '@opentok/client';
import { PatientQueue } from '../model/reception/patientQueue';
import { PatientMedicalAdvise } from '../model/advice/patientMedicalAdvise';
import { DoctorPrescriptionTemplate } from '../model/advice/doctorPrescriptionTemplate';
import { UserReport } from '../model/report/userReport';
import { CryptoUtil } from '../auth/util/cryptoutil';
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';
import { BookingSourceRequest } from '../model/doctor/bookingsourcerequest';
import { Config } from "../base/config";
import { ReportSummary } from '../model/report/reportsummary';
import { promises } from 'dns';
import { ServiceConstants } from '../model/common/serviceconstants';

@Injectable()
export class DoctorService {

    session: OT.Session;
    token: string;
    API_KEY: any;
    SESSION_ID: any;
    TOKEN: any;
    patientQueue: PatientQueue;
    isOnline: boolean;
    patientMedicalAdvise: PatientMedicalAdvise = new PatientMedicalAdvise();
    prescriptionTemplate: DoctorPrescriptionTemplate;
    pastPrescription: PatientMedicalAdvise = new PatientMedicalAdvise();
    isCopied: boolean = false;
    isVideoQuestionShow: boolean = true;
    isVideoMax: boolean = false;
    minWidthOfVideoCard: number;
    maxWidthOfVideoCard: number;
    uploadFilesList: any[] = new Array();
    isPrescriptionGenerated: boolean = false;
    isVideo: boolean = false;
    pdfUrl: string;
    caseSheet: boolean = false;
    caseSheetUrl: string = '';
    doctorPrescriptionTemplate: DoctorPrescriptionTemplate;
    doctorHomeConsultTrack: SlotBookingDetails;
    wizardView: string = "symptomPrescription";
    isFrom: string;
    videoConnectionStatus: string = '';
    isNetworkQualityTested: boolean = true;
    audioSupported = false;
    videoSupported = false;
    networkChecked = false;
    phrWHOCheck: boolean = false;
    daignosticTestList: Array<any>;
    consentOtpVerified: boolean = false;

    constructor(
        private httpService: HttpService,
        private auth: AuthService, private urlStringFormatter: URLStringFormatter
    ) { }



    getDoctorsConsultationQueue(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_CONSULATATION_QUEUE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }//GENERATE_TEST_VIDEO_SESSIONID

    getDoctorSchedules(doctorId: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOCTOR_SCHEDULES, doctorId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDoctorSlotStatus(requestBody: BookingSourceRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_SLOT_STATUS,
            JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getDoctorDashboardSummary(doctorId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOCTOR_DASHBOARD_SUMMARY, doctorId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }




    generateTestVideoSessionid(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GENERATE_TEST_VIDEO_SESSIONID, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    deleteTemplateForDoctor(templateId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().DELETE_TEMPLATE_FOR_DOCTOR + "?templateId=" + templateId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    generatePatientMedicalPresciption(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GENERATE_PATIENT_MEDICAL_PRESCIPTION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                // Clear data in the service and local storage
                this.patientMedicalAdvise = null;
                this.pastPrescription = null;
                this.prescriptionTemplate = null;
                window.localStorage.removeItem("patientMedicalAdvise");
                window.localStorage.removeItem("patientMedicalAdvise");
                window.localStorage.removeItem("patientMedicalAdvise");

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesSymptom(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_SYMPTOM,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesClinicalExaminations(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_CLINICAL_EXAMINATION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesDaignosis(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_DAIGNOSIS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesPharmacy(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_PHARMACY,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesInvestigations(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_INVESTIGATIONS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesProcedures(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_PROCEDURES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesNonMedications(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_NON_MEDICATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addDoctorFavouritesImmunizations(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_FAVOURITES_IMMUNIZATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    // investigationcontrol/getinvestigationadvisesforpoc?pocId=0&scrollPosition=1&time=0&offset=50&patientProfileId=16685

    getAllReportsOfPatient(profileId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths()
            .GET_ALL_REPORTS_FOR_PATIENT + "?profileId=" + profileId
            , AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getPastPatientTests(body: any): Promise<any> {
        let requestBody = {
            adviceId: body.adviceId,
            profileId: body.patientId,
            parentProfileId: body.parentProfileId
        };
        let userReport: UserReport[] = new Array();
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_TEST,
            JSON.stringify(requestBody), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                userReport = JSON.parse(JSON.stringify(data));
                console.log("Diagnostic file upload urls response >>>>>>>>>>>" + JSON.stringify(userReport));
                if (data.statusCode == 200 || data.statusCode == 201) {
                    return userReport;
                }
                return userReport;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return userReport;
                // }
            });
    }
    getAnsOfVideoBooking(profileId, phrType = 100): Promise<any> {

        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ANS_OF_VIDEO_BOOKING + "?profileId=" + profileId + "&phrType=" + phrType, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getdoctorfavourites(doctorId: number): Promise<any> {

        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOR_FAVOURITES + "?doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedAllergies(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_ALLERGIES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedSymptom(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_SYMPTOM,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getCDSSClinicalAndDiagnosisList(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CDSS_OPTION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data: CDSSClinicalAndDiagnosisResponse) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSymptomsAndDiagnosisAutocomplete(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SYMPTONMS_AND_DIAGNOSIS_AUTOCOMPLETE,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getDiagnosticSearchTest(body: any): Promise<any> {
        if (Config.portal && Config.portal.appId) {
            body.brandId = Config.portal.appId;
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DIAGNOSTIC_SEARCH_TEST,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getReferralAutocomplete(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOC_LIST_BY_SPECIALIZATION,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getImmunizationautocomplete(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_IMMUNIZATION_AUTOCOMPLETE,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getNonMedicationAutocomplete(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_NON_MEDICATION_AUTOCOMPLETE,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedClinicalExamination(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_CLINICAL_EXAMINATION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedDaignosis(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_DAIGNOSIS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedMedicines(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_PHARMACY,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedInvestigations(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_INVESTIGATIONS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedProcedure(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_PROCEDURES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedAdmissionNotes(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_ADMISSION_NOTES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedNonMedication(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_NON_MEDICATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedImmunization(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SUGGESTED_IMMUNIZATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getProcudureList(searchTerm, doctorId): Promise<any> {

        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PROCEDURE_LIST + "?search=" + searchTerm + '&doctorId=' + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAdmissionNoteList(searchTerm, doctorId): Promise<any> {

        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ADMISSION_NOTE_LIST + "?search=" + searchTerm + '&doctorId=' + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSuggestedReferral(doctorId): Promise<any> {

        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_SUGGESTED_REFERRAL_DOCTOR_DETAILS + "?doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getTemplatesForDoctor(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_TEMPLATES_FOR_DOCTOR,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    createTemplateForDoctor(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_TEMPLATE_FOR_DOCTOR,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    updatePrePrescriptionDetails(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PRE_PRESCRIPTION_DETAILS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getSavePrescriptionsForPatient(invoiceId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PRE_PATIENT_MEDICAL_PRESCIPTION + "?invoiceId=" + invoiceId, AppConstants.POZ_BASE_URL_INDEX)
            .then((res) => {
                let data = res;
                if (res.data) {
                    data = {
                        ...res.data,
                        ...res
                    };
                    delete data.data;
                };
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getAllPatientConsultation(patientId, from, size, doctorId, serviceId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ALL_PATIENT_CONSULTATION + "?patientId=" + patientId + "&from=" + from + "&size=" + size + "&doctorId=" + doctorId + "&serviceId=" + serviceId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    addSuggestedSymptom(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_SYMPTOM,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    addSuggestedClinicalExamination(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_CLINICAL_EXAMINATION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    addSuggestedDaignosis(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_DAIGNOSIS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addSuggestedInvestigations(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_INVESTIGATIONS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addSuggestedProcedures(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_PROCEDURES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addSuggestedAdmissionNotes(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_ADMISSION_NOTES,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addSuggestedNonMedication(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_NON_MEDICATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    addSuggestedImmunization(body: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_SUGGESTED_IMMUNIZATION_ADVICE,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    doctorPackagesList(doctorId: number, pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().DOCTOR_PACKAGE_LIST + "?doctorId=" + doctorId + "&pocId=" + pocId,
            AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                console.log("data oc cancel: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getSearchedList(searchTerm: string, pocType: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GLOBAL_SEARCH_FOR_DIAG + "?searchTerm=" + searchTerm + "&pocType=" + pocType,
            AppConstants.ELASTIC_URL_INDEX).then((data) => {
                console.log("data oc cancel: " + JSON.stringify(data));
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    fetchPocListForSearch(searchTerm: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().SEARCH_FOR_POC, searchTerm), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    uploadPatientAdvise(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GENERATE_PATIENT_MEDICAL_PRESCIPTION,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    updateDocFavPartners(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().DOCTOR_FAV_PARTNERS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    updateDoctorStatus(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DOCTOR_STATUS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                let cryptoUtil = new CryptoUtil();
                body.availableStatus = body.doctorStatus;
                localStorage.setItem("doctorStatus",
                    cryptoUtil.encryptData(
                        JSON.stringify(body)));
                // return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getDoctorStatus(doctorId): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOR_STATUS + "?doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log('getDoctorStatus');
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }
    getPHRTestReportGraphplots(profileId: number, parentProfileId: number, reportId: number, fromDate: number = new Date().getTime() - 31556952000 * 2, toDate: number = new Date().getTime()): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().PHR_GRAPHPLOTS_FOR_REPORT, profileId, parentProfileId, reportId, fromDate, toDate), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    /* cdssoptions update */
    modifyCDSSOptions(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_CDSSOPTIONS,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getOT() {
        return OT;
    }

    setOpenTokCredential(api_key: any, session_id: string, token: string) {
        this.API_KEY = api_key;
        this.SESSION_ID = session_id;
        this.TOKEN = token;
        let cryptoUtil = new CryptoUtil();
        window.localStorage.setItem("apiKey", cryptoUtil.encryptData(JSON.stringify(api_key)));
        window.localStorage.setItem("sessionId", cryptoUtil.encryptData(JSON.stringify(session_id)));
        window.localStorage.setItem("tokenId", cryptoUtil.encryptData(JSON.stringify(token)));
    }

    initSession() {

        console.log(this.API_KEY);
        console.log(this.SESSION_ID);
        console.log(this.TOKEN);

        if (this.API_KEY && this.TOKEN && this.SESSION_ID) {
            this.session = this.getOT().initSession(this.API_KEY, this.SESSION_ID);
            this.token = this.TOKEN;
            return Promise.resolve(this.session);
        } else {
            return Promise.reject("Session not initiated");
            // return fetch(CONSTS.SAMPLE_SERVER_BASE_URL + '/session')
            //     .then((data) => data.json())
            //     .then((json) => {
            //         this.session = this.getOT().initSession(json.apiKey, json.sessionId);
            //         this.token = json.token;
            //         return this.session;
            //     });
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.session.connect(this.token, (err) => {
                if (err) {
                    //'Could not connect to OpenTok'
                    this.videoConnectionStatus = 'Could not connect to video . . .';
                    console.log('videoStatus ' + this.videoConnectionStatus);
                    reject(err);
                } else {
                    resolve(this.session);
                }
            })
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.session != undefined && this.session != null) {
                this.session.disconnect();
            }
            window.localStorage.removeItem("tokenId");
            window.localStorage.removeItem("apiKey");
            window.localStorage.removeItem("tokenId");
            this.videoConnectionStatus = '';

        });
    }

    getPartnerTitle(): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PARTNERS_TITLE),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return err;
                // }
            });
    }

    UpdateHomeConsultationStatus(diagnosticsAdviseTrack: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().Doctor_Home_Service_Order_Details,
            JSON.stringify(diagnosticsAdviseTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
                    return reportResponse;
                }
                return reportResponse;
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return reportResponse;
                // }
            });
    }

    getDigitizationQueueForDigitizeManager(empId: number, from: number, size: number,
        fromDate: number, toDate: number, doctorId: number, mobileNo: string, doctorName: string, pocId: number, stausFilterValue: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_DIGITIZATION_QUEUE_RECORDS_For_MANAGER, empId,
                from, size, fromDate, toDate, doctorId, mobileNo, doctorName, pocId, stausFilterValue), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });

    }

    getDigitizationQueueForDigitizer(empId: number, from: number, size: number,
        fromDate: number, toDate: number, doctorId: number, mobileNo: string, patientName: string, digitizerEmpId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_DIGITIZATION_QUEUE_RECORDS_FOR_DIGITIZER, empId,
                from, size, fromDate, toDate, doctorId, mobileNo, patientName, digitizerEmpId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }


    getDigitizeManagers(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_DIGITIZE_MANAGERS, pocId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDigitizers(pocId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_DIGITIZERS, pocId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    assignPrescriptionToDigitizer(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().ASSIGN_PRESCRIPTION_TO_DIGITIZER, body.digitizerEmpId, body.adviceId), JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getPdfUrl(pdfUrl) {
        return new Promise((resolve, reject) => {
            this.auth.getTempUrl(pdfUrl).then((url: BaseResponse) => {
                if ((url.statusCode == 201 || url.statusCode == 200)) {
                    resolve(url.data);
                    // this.tempPdfUrl = url.data;
                    // return url.data;
                } else {
                    reject(false)
                    // this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
                    // return false;
                }
            }).catch((err) => {
                console.log(err);
                reject(err)
                // return false;
            })
        })
    }

    deletePrescription(orderId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().DELETE_DOCTOR_PRESCRIPTION, orderId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    placeClickCallRequest(parentProfileId: number, doctorId: number, orderId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().DOCTOR_CLICK_CALL, parentProfileId, doctorId, orderId, false), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getCRMSMS(orderId: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_CRM_SMS_TEMP, orderId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    sendCRMSMStoUSer(req: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SEND_CRM_SMS,
            JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getWHOPhrQuestions(pharmacyIdList: Array<number>): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_WHO_PHRQUESTIONAIRE, pharmacyIdList), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    saveWHOPhrAnswers(phr: any): Promise<any> {

        return this.httpService.httpPostPromise(this.httpService.getPaths().SAVE_WHO_PHRQUESTIONAIRE,
            JSON.stringify(phr), AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDoctorRevenueData(doctorId: number): Promise<ReportSummary> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOCTOR_REVENUE_DATA, doctorId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getDoctorConsultationsData(doctorId: number): Promise<ReportSummary> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOCTOR_CONSULTATIONS_DATA, doctorId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    verifyConsentOtp(requestBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().VERIFY_CONSENT_FOR_DOCTOR,
            JSON.stringify(requestBody), 0)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    requestPatientConsent(requestBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().REQUEST_PATIENT_CONSENT,
            JSON.stringify(requestBody), 0)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    checkConsentStatus(requestBody): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CHECK_CONSENT_STATUS,
            JSON.stringify(requestBody), 0)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    getTokenSummary(pocId, doctorId): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.
            format(this.httpService.getPaths().GET_TOKEN_SUMMARY, pocId, doctorId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }



    getAllServices(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_All_SERVICES + "?categoryId=" + ServiceConstants.SERVICE_TYPE_MEDICAL_SERVICES, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log('response' + JSON.stringify(data));
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
                console.log(err);
                return Promise.reject(err);
            // }
        });
    }

}