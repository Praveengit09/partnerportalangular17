import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConfig } from '../app.config';
import { AppConstants } from './../base/appconstants';
import { PatientSlots } from './../model/slotbooking/patientslots';
import { ConsultationQueueRequest } from './../model/slotbooking/consultationQueueRequest';
import { PatientArrivalRequest } from './../model/reception/patientArrivalRequest';
import { PatientQueue } from './../model/reception/patientQueue';
import { DoctorName } from './../model/reception/doctorName';
import { Doctor } from './../model/employee/doctor';
import { BasketRequest } from './../model/basket/basketRequest';
import { PriscriptionApprovalRequest } from '../model/reception/prescription/prescriptionApprovalRequest';
import { GetDoctorsBySpecializationRequest } from '../model/reception/getdoctorsbyspecializationrequest';
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';
import { ServiceConstants } from '../model/common/serviceconstants';

@Injectable()
export class ReceptionService {
    public homeConsultTrack: SlotBookingDetails;
    public rejectedHomeConsultOrderTrack: SlotBookingDetails;
    public doctorHomeConsultTrack: SlotBookingDetails;
    patientSlotForDoc: any;
    patientListForPrecription: any[] = new Array<any>();
    config: AppConfig = new AppConfig();
    public selectedDoctor: Doctor = new Doctor();
    doctorNameTest: DoctorName;
    pocId: any;
    patientPriscriptionDetails: any;
    isCentralBooking: boolean;
    public docData: Doctor;
    bookedDate: any;
    age: String;
    invoiceId: any;
    approvalTaken: boolean;
    patientDataToPdf: any;

    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private receptionStringFormatter: URLStringFormatter
    ) {
    }

    getDoctorList(pocId: number, empId: number, roleId: number): Promise<Doctor[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETDOCTORSLIST + "?pocId=" + pocId + "&empId=" + empId + "&roleId=" + roleId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getDoctorSearchList(pocId: number, empId: number, roleId: number, searchTerm: string): Promise<Doctor[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETDOCTORSLIST + "?pocId=" + pocId + "&empId=" + empId + "&roleId=" + roleId + "&searchTerm=" + searchTerm, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getRegistrationsCount(pocId: number) {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETNUMBEROFREGISTRATIONSCOUNT + "?pocId=" + pocId, AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    getAppoinmentRequests(pocId, empId, orderId, appointmentRequestId, date, size, from) {

        return this.httpService.httpGetPromise(this.receptionStringFormatter.
            format(this.httpService.getPaths().GET_APPOINMENT_REQUESTS, pocId, empId, orderId, appointmentRequestId, date, size, from), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });

    }
    updateAppointmentRequests(req): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_APPOINTMENT_REQUESTS, JSON.stringify(req), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);

        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }

    getPatientSlotForDoctor(pocId: any, serviceId: any, doctorId: any, allSlots: boolean): Promise<PatientSlots> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETPATIENTSLOT + "?allSlots=" + allSlots + "&pocId=" + pocId + "&serviceId=" + serviceId + "&doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                this.patientSlotForDoc = data;
                return Promise.resolve(this.patientSlotForDoc);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getDoctorHomeConsultationList(doctorId: any, empId: any, pocId: any, patientName: string, mobile: string, skip: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOR_HOME_CONSULTATIONS + "?doctorId=" + doctorId + "&empId=" + empId + "&pocId=" + pocId + "&patientName=" + patientName + "&mobile=" + mobile + "&skip=" + skip, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getCentralHomeConsultationList(startDate: any, endDate: any, doctorId: any, empId: any, pocId: any, patientName: string, mobile: string, skip: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOR_HOME_CONSULTATIONS + "?fromDate=" + startDate + "&toDate=" + endDate + "&doctorId=" + doctorId + "&empId=" + empId + "&pocId=" + pocId + "&patientName=" + patientName + "&mobile=" + mobile + "&skip=" + skip, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }


    completePayment(diagnosticsAdviseTrack: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PAYMENT_STATUS_AT_COUNTER,
            JSON.stringify(diagnosticsAdviseTrack), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                console.log("update Order response >>>>>>>>>>>" + JSON.stringify(reportResponse));
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

    PocDetails(data: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().Show_All_POC_DETAILS,
            JSON.stringify(data), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return data;
            }).catch((err) => {
                // if (err) {
                console.log(err);
                // }
            });
    }

    slotReschedule(request: any): Promise<any> {
        let reportResponse: any;
        return this.httpService.httpPostPromise(this.httpService.getPaths().SLOTRESCHEDULE,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                reportResponse = data;
                console.log("update Order response >>>>>>>>>>>" + JSON.stringify(reportResponse));
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

    getPatientListPrescription(pocId: any, doctorId: any, from: any, size: any, searchTerm: any, isDigi: boolean, startDate: number, endDate: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PATIENTLIST_PRESCRIPTION + "?doctorId=" + doctorId + "&pocId=" + pocId + "&from=" + from + "&size=" + size + "&searchTerm=" + searchTerm + "&isDigi=" + isDigi + "&startDate=" + startDate + "&endDate=" + endDate, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                this.patientListForPrecription = data;
                return Promise.resolve(this.patientListForPrecription);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    passDoctorDetails(doctor: Doctor, pocId): void {
        this.selectedDoctor = doctor;
        this.pocId = pocId;
        console.log("Doc detail in receptionService:: " + JSON.stringify(this.selectedDoctor));
    }


    getDoctorConsultationQueueFromServer(consultationQueueRequest: ConsultationQueueRequest): Promise<any[]> {
        let patientQueueList: Array<PatientQueue>
        if (consultationQueueRequest.filterStatus != undefined) {
            consultationQueueRequest.filterStatus = parseInt(consultationQueueRequest.filterStatus.toString());
        }
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_CONSULATATION_QUEUE, JSON.stringify(consultationQueueRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            patientQueueList = data;
            // console.log("patientQueueList response >>>>>>>>>>>" + JSON.stringify(patientQueueList));
            // if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
            return Promise.resolve(patientQueueList);
            //}
            // return reportResponse;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getWaitingPatientDetails(pocId: any): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_WAITING_PATIENT_DETAILS + "?pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                this.patientListForPrecription = data;
                return Promise.resolve(this.patientListForPrecription);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateConsultationQueueToServer(patientArrivalRequest: PatientArrivalRequest) {

        console.log("Body <<<>>>>" + JSON.stringify(patientArrivalRequest));

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_CONSULTATION_QUEUE, JSON.stringify(patientArrivalRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("updateConsultationQueueToServer response >>>>>>>>>>>" + JSON.stringify(data));
            // if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
            return Promise.resolve(data);
            //}
            // return reportResponse;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updatePaymentDeskToServer(basketRequest: BasketRequest) {

        console.log("Body basketRequest <<<>>>>" + JSON.stringify(basketRequest));

        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PAYMENT_DESK, JSON.stringify(basketRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("updateConsultationQueueToServer response >>>>>>>>>>>" + JSON.stringify(data));
            // if (reportResponse.statusCode == 200 || reportResponse.statusCode == 201) {
            return Promise.resolve(data);
            //}
            // return reportResponse;
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getRevenueDetailsForDoctor(patientProfileId, parentProfileId, pocId) {
        console.log("request done from my side" + parentProfileId);

        return this.httpService.httpGetPromise(this.httpService.getPaths().GETPROFILEVISITEDDETAILS + "?parentProfileId=" + parentProfileId + "&patientProfileId=" + patientProfileId + "&pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log('response' + JSON.stringify(data));
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    saveAddress(address): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATEADDRESS, JSON.stringify(address), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {

            return Promise.resolve(data);

        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    submitPriscriptionForApproval(consumerApprovalRequest: PriscriptionApprovalRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUBMIT_PRISCRIPTION_FOR_APPROVAL, JSON.stringify(consumerApprovalRequest), AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }


    getAvailableServicesInpoc(pocId: number, serviceIdList: any, homeCollection: boolean): Promise<any> {
        console.log("datacheck>>>>" + JSON.stringify(pocId));
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_AVAILABLE_SERVICES_INPOC + "?pocId=" + pocId + "&serviceIdList=" + serviceIdList + "&homeCollection=" + homeCollection, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    submitPriscriptionForAccept(consumerApprovalRequest: PriscriptionApprovalRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().SUBMIT_PRISCRIPTION_FOR_ACCEPT, JSON.stringify(consumerApprovalRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {

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

    getAllDoctorServices(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_All_SERVICES + "?categoryId=" + ServiceConstants.SERVICE_TYPE_HOME_CONSULTATION_SERVICES, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log('response' + JSON.stringify(data));
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getDoctorSubServiceList(pocId: number, serviceId: any): Promise<Doctor[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETDOCTORSUBSERVICELIST + "?pocId=" + pocId + "&serviceId=" + serviceId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getServiceBasedDoctorList(pocId: number, serviceId: any, empId: number): Promise<Doctor[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETSERVICEBASEDDOCTORLIST + "?pocId=" + pocId + "&serviceId=" + serviceId + "&empId=" + empId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getDoctorListBySpecialization(getDoctorsBySpecializationRequest: GetDoctorsBySpecializationRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOC_LIST_BY_SPECIALIZATION, JSON.stringify(getDoctorsBySpecializationRequest), AppConstants.ELASTIC_URL_INDEX).then((data) => {
            return Promise.resolve(data);

        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }


    getCountOfOrders(startDate: number, endDate: number, pocIdList: Array<number>): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_CENTRAL_HOME_CONSULT_ORDER_COUNT + "?fromDate=" + startDate + "&toDate=" + endDate + "&pocId=" + pocIdList, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getDoctorAvailableSlots(date: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOE_AVAILABLE_SLOTS + "?date=" + date, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

}
