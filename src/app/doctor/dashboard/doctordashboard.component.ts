import { VideoCardService } from './../prescription/videocard/videocard.service';
import { NotificationsService } from './../../layout/notifications/notifications.service';
import { SuperAdminService } from './../../superadmin/superadmin.service';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ConsultationQueueRequest } from '../../model/slotbooking/consultationQueueRequest';
import { AuthService } from '../../auth/auth.service';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { DoctorService } from '../doctor.service';
import { PatientQueue } from '../../model/reception/patientQueue';
import { SlotBookingDetails } from '../../model/basket/slotBookingDetails';
import { CommonUtil } from '../../base/util/common-util';
import { CryptoUtil } from '../../auth/util/cryptoutil';
import { PatientMedicalAdvise } from '../../model/advice/patientMedicalAdvise';
import { Router } from '@angular/router';
import { PaymentService } from '../../payment/payment.service';
import { SessionBean } from '../../model/slotbooking/sesssionBean';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
import { BasketConstants } from '../../constants/basket/basketconstants';
import { PocDetail } from '../../model/poc/pocDetails';
import { Config } from '../../base/config';
import { BookingSourceRequest } from '../../model/doctor/bookingsourcerequest';
import { AppointmentStatus } from '../../model/doctor/appointmentstatus';
import { ToasterService } from '../../layout/toaster/toaster.service';
import { ReportSummary } from '../../model/report/reportsummary';
import { PhrCategory } from '../../model/phr/phrCategory';
import { doctordashboardresponse } from '../../model/doctor/doctordashboardresponse';
import { NurseService } from '../../nurse/nurse.service';

@Component({
    selector: 'doctordashboard',
    templateUrl: './doctordashboard.template.html',
    styleUrls: ['./doctordashboard.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class DoctorDashboardComponent implements OnInit {

    environment: any = Config.portal;

    shareEnabledInNav = (<any>navigator).share ? true : false;
    queueResponse: PatientQueue[] = new Array();
    queueResponse1: PatientQueue[] = new Array();
    OriginalqueueResponse: PatientQueue[] = new Array();
    scheduleList: Array<any> = new Array<any>();
    pocDetails: Array<any> = new Array<any>();
    queue: PatientQueue;
    scanAndUploadPrescriptions: boolean;
    modalView: string = '';
    sessionBean: SessionBean;
    liveNowQueue: PatientQueue;
    successMsg: string;
    doctorStatus: number;
    doctorDashboardSummary: any;
    isVideoAudioEnable: boolean = false;
    days: any;
    subType: string[] = ["POC", "DIGIROOM", "VIDEO-CHAT", "WALKIN"];
    daysList: Array<any> = new Array<any>();
    fiteredDays: any;
    enableWidgets: boolean = false;
    doctorShareCard: boolean = false;
    doctorSlotsStatus: AppointmentStatus[] = new Array();
    tempdoctorSlotsStatus: AppointmentStatus[] = new Array();
    perPage: number = 5;
    total: number = 0;
    dataMsg: string = '';
    doctorMessage: string = '';
    doctorRevenueResponse: ReportSummary = new ReportSummary();
    showQuestionnaire: boolean = false;
    enableCustomDoctorQueue: boolean = false;
    doctorConsultatonsResponse: any;
    selectedConsultation: string = 'Today';
    selectedTokenParam: string = 'Today';
    selectedRevenueParam: string = 'Today';
    tokenSummary: ReportSummary = new ReportSummary();
    currentToken: string = '';
    showconsentpopup: boolean = false;
    hasConsent: boolean = false;
    patientQueue: PatientQueue = new PatientQueue();
    showModal: boolean = false;
    disablePatientContactNo: boolean;
    isMobile: boolean;
    enableDoctorRevenue: boolean = false;

    daysConversionList: any =
        { '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' }

    columns: any[] = [

        {
            display: 'Patient Details',
            variable:
                `patientTitle patientFirstName patientLastName, 
                        localDOBYear,
                        patientGender,
                        patientContactNumber`,
            filter: 'nametitle',
            style: 'width-200 text_hover',
            sort: false,
            type: 'hyperlink',
            event: 'onNameClick',
            filler: ',',

        },
        {
            display: 'Consultation Type',
            variable: 'consultationType',
            filter: 'text',
            sort: false
        },
        {
            display: 'Consultation Time',
            variable: 'time',
            filter: 'time',
            sort: false
        },
        {
            display: 'Status',
            variable: 'status',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Booked'
                },
                {
                    value: '4',
                    condition: 'lte',
                    label: 'Waiting'
                },
                {
                    value: '6',
                    condition: 'eq',
                    label: 'Checked'
                },
                {
                    value: '7',
                    condition: 'eq',
                    label: 'InPayment'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Engaged'
                },

            ]
        },
        {
            display: 'Waiting Time',
            variable: 'tempWaitingTime',
            filter: 'text',
            sort: false
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'actionButton',
            sort: false,
            variable: 'status',
            conditions: [
                {
                    value: '0',
                    condition: 'lte',
                    label: 'VACANT',
                    style: 'btn engage_txt'
                },
                {
                    value: '1',
                    condition: 'lte',
                    label: 'BOOKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '2',
                    condition: 'lte',
                    label: 'BOOKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'SHORT_BLOCK',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Start',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Engage',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '6',
                    condition: 'eq',
                    label: 'CHECKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '7',
                    condition: 'eq',
                    label: 'Start',
                    style: 'btn engage_txt width-100'
                }

            ]
        }

    ];



    customColumns: any[] = [

        {
            display: 'Patient Details',
            variable: 'formattedPatientDetails',
            filter: 'htmlContent',
            style: 'width-200 text_hover',
            sort: false,
            type: 'hyperlink',
            event: 'onNameClick',

        },

        {
            display: 'Consultation Details',
            variable: 'consultationDetails',
            filter: 'htmlContent',
            filler: ',',
            sort: false
        },
        {
            display: 'Prescription Questionnaire',
            label: 'View Questionnaire',
            style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'questionnaireEvent',
            sort: false,
            variable: 'status',
            conditions: [
                {
                    value: '0',
                    condition: 'lte',
                    label: 'View Questionnaire',
                    style: 'btn engage_txt'
                }
            ]
        },
        {
            display: 'Request Consent',
            label: 'Request',
            style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'consentEvent',
            sort: false,
            variable: 'hasContent',
            conditions: [
                {
                    value: 'true',
                    condition: 'lte',
                    label: 'Request',
                    style: 'btn engage_txt'
                }
            ]
        },

        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'actionButton',
            sort: false,
            variable: 'status',
            conditions: [
                {
                    value: '0',
                    condition: 'lte',
                    label: 'VACANT',
                    style: 'btn engage_txt'
                },
                {
                    value: '1',
                    condition: 'lte',
                    label: 'BOOKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '2',
                    condition: 'lte',
                    label: 'BOOKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'SHORT_BLOCK',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Start',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Engage',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '6',
                    condition: 'eq',
                    label: 'CHECKED',
                    style: 'btn engage_txt width-100'
                },
                {
                    value: '7',
                    condition: 'eq',
                    label: 'Start',
                    style: 'btn engage_txt width-100'
                }

            ]
        }

    ];


    sorting: any = {
        column: 'slotDate',
        descending: true
    };


    constructor(private authService: AuthService, private spinnerService: SpinnerService, private superAdminService: SuperAdminService, private toast: ToasterService,
        private doctorService: DoctorService, private commonUtil: CommonUtil, private router: Router, private notificationsService: NotificationsService,
        private videoCardService: VideoCardService, private paymentService: PaymentService, private localStorage: HsLocalStorage, private nurseService: NurseService) {
        if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorWidgets) {
            this.enableWidgets = true;
        } else {
            this.enableWidgets = false;
        }
        if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorShareCard) {
            this.doctorShareCard = true;
        } else {
            this.doctorShareCard = false;
        }
        if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.disableDoctorWaitingTime) {
            this.columns.splice(4, 1)
        }
        this.enableCustomDoctorQueue = Config.portal.doctorOptions.enableCustomDoctorQueue

        console.log('***' + this.isVideoAudioEnable);
        this.isVideoAudioEnable = this.authService.selectedPOCMapping.participationSettings.doctorVideoNowAvailable;
        if (this.authService.selectedPocDetails == null
            || this.authService.selectedPocDetails == undefined ||
            this.authService.selectedPocDetails.scanAndUploadPrescriptions == null ||
            this.authService.selectedPocDetails.scanAndUploadPrescriptions == undefined) {
            this.scanAndUploadPrescriptions = false;
        } else {
            this.scanAndUploadPrescriptions = this.authService.selectedPocDetails.scanAndUploadPrescriptions;
        }

        if (Config.portal && Config.portal.customizations && Config.portal.customizations.patientContactNo) {
            this.disablePatientContactNo = true

        }
        if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorRevenue) {
            this.enableDoctorRevenue = true;
        } else {
            this.enableDoctorRevenue = false;
        }

    }

    ngOnInit() {
        this.isMobile = this.detectMobileDevice();
        this.isVideoAudioEnable = this.authService.selectedPOCMapping.participationSettings.doctorVideoNowAvailable;
        let self = this;
        this.queueResponse = new Array();
        $('#uploadPrescription').on('hidden.bs.modal', (e) => {
            $("input[type=file]").val("");
            self.modalView = '';
        });
        this.spinnerService.start();
        this.getDoctorsConsultationQueue();
        this.getDoctorSchedules();
        this.getDoctorDashboardSummary();
        this.getDoctorStatus();
        this.getDoctorSlotStatus();
        this.getDoctorRevenue();
        this.getDoctorConsultationsData();
        this.getTokenSummary();
        setTimeout(() => {
            this.spinnerService.stop();
        }, 1500);


        $(document).on('click', '.doctor-widget .header_txt', function () {
            if ($('.header_txt').hasClass('header_txtactive')) {
                $('.header_txt').removeClass('header_txtactive');
                $(this).addClass('header_txtactive');
            }
            else {
                $(this).addClass('header_txtactive');
            }
        });


    }


    getDoctorsConsultationQueue() {
        let consultationQueueRequest: ConsultationQueueRequest = new ConsultationQueueRequest();
        consultationQueueRequest.digiQueue = false;

        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        consultationQueueRequest.date = date.getTime();

        consultationQueueRequest.roleId = 0;
        consultationQueueRequest.doctorId = this.authService.userAuth.employeeId;

        consultationQueueRequest.empId = this.authService.userAuth.employeeId;
        consultationQueueRequest.pocId = this.authService.userAuth.pocId;
        console.log("requestBody--->" + JSON.stringify(consultationQueueRequest));

        this.doctorService.getDoctorsConsultationQueue(consultationQueueRequest).then((queueResponse: PatientQueue[]) => {

            console.log("====resp====" + JSON.stringify(queueResponse));


            // this.OriginalqueueResponse = queueResponse;
            if (this.OriginalqueueResponse.length > 0) {
                this.OriginalqueueResponse.push.apply(this.OriginalqueueResponse, queueResponse)
            }
            else {
                this.OriginalqueueResponse = queueResponse;
            }

            this.queueResponse1 = queueResponse.filter((queue) => {
                return (queue.status != 6);//Removing Checked

            });
            this.queueResponse = this.queueResponse1.filter((queue) => {
                return (queue.bookingType != 4 && queue.bookingSubType != 5);
            }).sort(function (a, b) {
                if (+(+a.slotDate + +a.time) < +(+b.slotDate + +b.time)) {
                    return -1;
                }
                if (+(+a.slotDate + +a.time) > +(+b.slotDate + +b.time)) {
                    return 1;
                }
                return 0;
            });

            this.total = this.queueResponse.length;
            // this.queueResponse.forEach(queue => {
            //     queue.localDOBYear = this.commonUtil.getAge(queue.patientDOB).split(",")[0] + this.commonUtil.getAge(queue.patientDOB).split(",")[1];
            //     this.getModifiedData(queue);
            // });

            this.queueResponse.forEach((queue) => {
                if (queue.bookingType == SlotBookingDetails.BOOKING_TYPE_VIDEO) {
                    queue.consultationType = 'Connect Now';
                } else {
                    queue.consultationType = this.subType[queue.bookingSubType];
                }
            });
            this.calculatingWaitingTime();

            this.queueResponse.forEach((queue) => {
                queue.localDOBYear = this.commonUtil.getAge(queue.patientDOB).split(",")[0] + this.commonUtil.getAge(queue.patientDOB).split(",")[1];

                if (queue.waitingTime > 0) {
                    queue.tempWaitingTime = Math.round(queue.waitingTime / 60000) + " " + 'mins';
                }
                else {
                    queue.tempWaitingTime = 0 + " " + 'mins';
                }
                if (
                    queue.bookingType == 1 ||
                    (queue.bookingType == 3 &&
                        (queue.bookingSubType == 1 ||
                            queue.bookingSubType == 2))
                ) {
                    delete queue.tempWaitingTime;
                }
                this.enableCustomDoctorQueue == true && this.getModifiedData(queue);
            })

            if (this.queueResponse.length == 0) {
                this.dataMsg = 'No patients in queue';
            }

            if (this.queueResponse[0] != undefined || this.queueResponse[0] != null)
                this.currentToken = this.queueResponse[0].appointmentToken && this.queueResponse[0].appointmentToken.split(':')[1];



        })
    }

    getModifiedData(queue) {

        // if (this.enableCustomDoctorQueue == true) {

        queue.typeOfAppointment == 1 ? queue.patientType = 'Follow Up' : (queue.patientType = (queue.typeOfAppointment == 0) ? 'New' : '');
        queue.noOfVisits = `Visits(${queue.visitDetails.noOfVisits ? queue.visitDetails.noOfVisits : 0})`;
        queue.appointmentToken ? queue.appointmentToken = `Token:${queue.appointmentToken}` : queue.appointmentToken = '';

        if ((queue.status == 4 || queue.status == 5 || queue.status == 7) && queue.bookingSubType != 2) {
            queue.waitingTime > 0 ? queue.convertedWaitingTime = `In queue ${queue.tempWaitingTime}` : queue.convertedWaitingTime = `0 mins`;
        }
        queue.convertedtime = CommonUtil.getStringTimeFromTimeStampTo(queue.time);
        let status = queue.status;
        if (status == 4) {
            queue.consultationStatus = 'Waiting';
        }
        else if (status == 5) {
            queue.consultationStatus = 'Engaged';
        }
        else if (status == 6) {
            queue.consultationStatus = 'Checked';
        }
        else if (queue.status == 7) {
            queue.consultationStatus = 'InPayment';
        }
        else if (queue.status == 1) {
            queue.consultationStatus = 'Booked';
        }

        if ((queue.status == 4 || queue.status == 5) && queue.bookingSubType == 2) {
            queue.bookingTypeParam = 'Video';

        }


        queue.formattedPatientDetails = `${queue.patientTitle ? queue.patientTitle : ''}  ${queue.patientFirstName}   ${queue.patientLastName ? queue.patientLastName : ''}  <br/>
                ${queue.localDOBYear} <br/>
                ${queue.patientGender}  <br/>
                ${this.disablePatientContactNo ? '' : queue.patientContactNumber} <br/>
                    ${queue.patientType}  <br/>
                    ${queue.noOfVisits}`



        queue.consultationDetails = `${queue.convertedtime} ${queue.appointmentToken ? '<br/>' : ''} 
                ${queue.appointmentToken ? queue.appointmentToken : ''} ${queue.convertedWaitingTime ? ' <br/>' : ''}
                ${queue.convertedWaitingTime ? queue.convertedWaitingTime : ''} <br/>
                ${queue.bookingTypeParam ? queue.bookingTypeParam : ''} `;

        // }

    }

    calculatingWaitingTime() {
        let time = new Date();
        time.setHours(0);
        time.setMinutes(-new Date().getTimezoneOffset());
        time.setSeconds(0);
        time.setMilliseconds(0);
        let currentTime = new Date().getTime() - time.getTime();
        console.log("Cur time-->" + currentTime + " \t timeofset_-->" + new Date().getTimezoneOffset());

        for (let i = 0; i < this.queueResponse.length; i++) {
            // patient status is waiting or in payment
            if (this.queueResponse[i].status == 4) {
                // if booking subtype is walkin
                if (this.queueResponse[i].bookingSubType == 3) {

                    this.queueResponse[i].waitingTime = currentTime - this.queueResponse[i].time;

                } else {
                    let time = new Date();
                    this.queueResponse[i].waitingTime = time.getTime() - this.queueResponse[i].visitedTime
                }
            }
            else if (this.queueResponse[i].status == 5 || this.queueResponse[i].status == 7) {
                // if booking subtype is walkin
                if (this.queueResponse[i].bookingSubType == 3) {
                    this.queueResponse[i].waitingTime = this.getWaitingTime(this.queueResponse[i]);
                }
                else {
                    this.queueResponse[i].waitingTime = this.getWaitingTime(this.queueResponse[i]);
                }
            }
            else {
                // if booking subtype is walkin
                if (this.queueResponse[i].bookingSubType == 3) {
                    this.queueResponse[i].waitingTime = new Date().getTime() - this.queueResponse[i].doctorEngTime;
                } else {
                    this.queueResponse[i].waitingTime = this.queueResponse[i].visitedTime -
                        this.queueResponse[i].visitedTime;
                }
            }
            console.log("Waiting time--->>" + this.queueResponse[i].waitingTime);
        }
    }
    getWaitingTime(item) {
        let time = new Date();
        time.setHours(0);
        time.setMinutes(-new Date().getTimezoneOffset());
        time.setSeconds(0);
        time.setMilliseconds(0);
        let visitedTime = new Date(item.visitedTime).getTime() - time.getTime();
        let engageTime = new Date(item.doctorEngTime).getTime() - time.getTime();
        if (item.status == 5) {
            return engageTime - visitedTime;
        }
        else if (item.status == 7) {
            return new Date().getTime() - time.getTime() - visitedTime;
        }
        return 0;
        // return needTime - item.time;
    }


    getDoctorSchedules() {
        this.superAdminService.getScheduleList(this.authService.userAuth.employeeId).then((response) => {
            console.log('response' + JSON.stringify(response));
            this.pocDetails = new Array<any>();
            this.scheduleList = new Array<any>();

            this.pocDetails.forEach((e, i) => { e.pocDetails = new Array<PocDetail>() });
            this.pocDetails = response;
            for (let i = 0; i < this.pocDetails.length; i++) {
                this.pocDetails[i]['daysList'] = [];
                this.pocDetails[i]['scheduleList'] = new Array<any>();
            }
            this.pocDetails = this.pocDetails.filter((element) => {
                return element.schedules.length > 0;
            })
            this.pocDetails.forEach((pocDetailselement) => {
                this.scheduleList = (this.filterScheduleIdList(pocDetailselement.schedules));
                pocDetailselement.scheduleList = (this.filterScheduleIdList(pocDetailselement.schedules));
                var daysListOfPoc = new Array<any>();
                var days = new Array<any>();
                this.scheduleList.forEach((e, index1) => {
                    let temp = new Array();
                    e.forEach((element) => {
                        let day = new Date(element.date).getDay();
                        temp.push(day);
                    });
                    days[index1] = temp;
                });
                daysListOfPoc = (days);
                var fiteredDays = new Array<any>();
                daysListOfPoc.forEach((element, index) => {
                    fiteredDays[index] = (element.filter((x, i, a) => a.indexOf(x) == i)).sort();

                })
                this.fiteredDays = (fiteredDays);
                let temp: any = new Array();
                this.fiteredDays.forEach((e, i) => {
                    var tempList = new Array();
                    e.forEach((element) => {
                        tempList.push(' ' + this.daysConversionList[element] + ' ');
                    });
                    temp[i] = tempList;
                })
                this.daysList = (temp);
                if (pocDetailselement.daysList != undefined) {
                    pocDetailselement.daysList = this.daysList;
                }
            });
        });
    }

    getDoctorDashboardSummary() {
        this.doctorService.getDoctorDashboardSummary(this.authService.userAuth.employeeId).then((response) => {
            console.log('doctorDashboardSummary' + JSON.stringify(response));
            this.doctorDashboardSummary = new Array<any>();
            this.doctorDashboardSummary = response;

        });
    }



    getDoctorSlotStatus() {
        console.log('doctorslotstatus');
        let requestBody = new BookingSourceRequest();
        requestBody.doctorId = this.authService.userAuth.employeeId;
        requestBody.pocIdList = this.authService.employeeDetails.pocIdList;
        // requestBody.pocIdList = this.authService.pocIds;
        console.log('pocidlist' + requestBody.pocIdList);
        this.doctorService.getDoctorSlotStatus(requestBody).then((response) => {
            this.doctorSlotsStatus = response;
            return response;
        }).then(() => {
            this.onTextClick(0);


        })
        // return this.doctorSlotsStatus;


    }




    getDoctorStatus(storeToLocal: boolean = false) {
        let doctorStatusRes = this.doctorService.getDoctorStatus(this.authService.userAuth.employeeId);
        doctorStatusRes.then(data => {
            this.doctorStatus = data.availableStatus;
            if (storeToLocal == true) {
                let cryptoUtil = new CryptoUtil();
                localStorage.setItem("doctorStatus", cryptoUtil.encryptData(
                    JSON.stringify({
                        "doctorId": data.doctorId,
                        "doctorStatus": data.availableStatus,
                        "pocId": this.authService.selectedPOCMapping.pocId
                    })));
            }
            if (this.doctorStatus == 0)
                this.doctorService.isOnline = false;
            else if (this.doctorStatus == 1)
                this.doctorService.isOnline = true;
            this.liveNowQueue = this.setQueueFromSessionBean(data);
            this.sessionBean = this.liveNowQueue.sessionBean;
        });
    }

    getIsOnline(): boolean {
        return this.doctorService.isOnline;
    }


    updateDoctorStatus() {
        console.log("**isOnline");


        this.doctorService.isOnline = !this.doctorService.isOnline;
        console.log(this.doctorService.isOnline);
        let updateDoctorRequest = {
            "doctorId": this.authService.userAuth.employeeId,
            "doctorStatus": this.doctorService.isOnline ? 1 : 0,
            "pocId": this.authService.userAuth.pocId
        }
        console.log(updateDoctorRequest);
        this.doctorService.updateDoctorStatus(updateDoctorRequest).then(resp => {
            console.log(resp);
        });
    }

    private setQueueFromSessionBean(data: any) {
        let queue: PatientQueue = new PatientQueue();
        queue.doctorId = data.doctorId;
        queue.doctorFirstName = data.doctorFirstName;
        queue.doctorLastName = data.doctorLastName ? data.doctorLastName : '';
        queue.doctorTitle = data.doctorTitle;
        queue.pocId = this.authService.selectedPocDetails.pocId;
        queue.serviceId = data.serviceId;
        queue.patientFirstName = data.patientFirstName;
        queue.patientTitle = data.patientTitle;
        queue.patientLastName = data.patientLastName ? data.patientLastName : '';
        queue.patientDOB = data.patientDOB;
        queue.patientGender = data.patientGender;
        queue.patientProfilePic = data.patientProfilePic;
        queue.patientContactNumber = data.patientContactNumber;
        queue.parentProfileId = data.parentProfileId;
        queue.invoiceId = data.invoiceId;
        queue.orderId = data.orderId;
        queue.time = data.time;
        queue.order = data.orderId;
        queue.bookingType = data.bookingType;
        queue.bookingSubType = data.bookingSubType;
        queue.patientProfileId = data.patientProfileId;
        queue.sessionBean = new SessionBean();
        queue.sessionBean.doctorId = data.doctorId;
        queue.sessionBean.doctorTitle = data.doctorTitle;
        queue.sessionBean.patientAge = data.patientAge;
        queue.sessionBean.doctorFirstName = data.doctorFirstName;
        queue.sessionBean.doctorLastName = data.doctorLastName ? data.doctorLastName : '';
        queue.sessionBean.patientId = data.patientId;
        queue.sessionBean.profileId = data.profileId;
        queue.sessionBean.patientName = (data.patientTitle ? data.patientTitle + '.' : '') + data.patientFirstName + ' ' + (data.patientLastName ? data.patientLastName : '');
        queue.sessionBean.serviceId = data.serviceId;
        queue.sessionBean.type = data.bookingType;
        queue.sessionBean.sessionId = data.sessionId;
        queue.sessionBean.tokenId = data.tokenId;
        queue.sessionBean.serviceId = data.serviceId;
        queue.sessionBean.message = data.message;
        queue.sessionBean.availableStatus = data.availableStatus;
        queue.sessionBean.currentTime = data.currentTime;
        queue.sessionBean.orderId = data.orderId;
        queue.sessionBean.invoiceId = data.invoiceId;
        queue.sessionBean.apiKey = data.apiKey;
        queue.sessionBean.bookingSubType = data.bookingSubType;
        return queue;
    }

    async onClickEngage(queue: PatientQueue) {
        (<any>$("#doctordashboardUploadPrescription")).modal('hide');
        console.clear();
        console.log('start of onClickEngage');
        this.spinnerService.start();
        this.doctorService.patientQueue = this.videoCardService.patientQueue = queue;
        this.notifyCustomer(queue);
        console.log('end of onClickEngage');
    }

    async notifyCustomer(queue: PatientQueue) {
        this.doctorService.disconnect();
        console.log("start of notifyCustomer")
        this.doctorService.patientQueue = queue;
        window.localStorage.removeItem('patientQueue');
        window.localStorage.removeItem("patientMedicalAdvise");
        this.doctorService.uploadFilesList = new Array();
        this.doctorService.isPrescriptionGenerated = false;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('patientQueue', cryptoUtil.encryptData(JSON.stringify(queue)));
        this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
        //for doctor always 5
        this.doctorService.isFrom = "doctordashboard";
        let patientStatus: number = 5;
        let digiQueue: boolean = false;
        // let pocId: number = this.authService.userAuth.pocId;
        let digiManager: boolean = false;


        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (queue.bookingType == 3 && queue.bookingSubType == 1) {
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

            this.spinnerService.stop();
            this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            return;
        }
        if (notifyResp && notifyResp.statusCode == 500 || notifyResp.statusCode == 403) {
            alert(notifyResp.statusMessage);
            this.spinnerService.stop();
            return;
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
        else if (this.sessionBean && (queue.invoiceId == this.liveNowQueue.invoiceId)) {
            sessionBean = this.sessionBean;
        }

        if (sessionBean != undefined && sessionBean != null
            && sessionBean.apiKey != undefined && sessionBean.apiKey != null
            && sessionBean.sessionId != undefined && sessionBean.sessionId != null

        ) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem(
                "apiKey",
                cryptoUtil.encryptData(JSON.stringify(sessionBean.apiKey))
            );
            window.localStorage.setItem(
                "sessionId",
                cryptoUtil.encryptData(JSON.stringify(sessionBean.sessionId))
            );
            window.localStorage.setItem(
                "tokenId",
                cryptoUtil.encryptData(JSON.stringify(sessionBean.tokenId))
            );
            this.doctorService.setOpenTokCredential(sessionBean.apiKey, sessionBean.sessionId, sessionBean.tokenId)
            this.localStorage.saveComponentData(queue);
            this.doctorService.getSavePrescriptionsForPatient(queue.invoiceId).then(data => {
                this.spinnerService.stop();
                if (data) {
                    if (data.statusCode != 200 && data.statusCode != 201) {
                        this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
                        return;
                    }
                    if (data.invoiceId == queue.invoiceId) {
                        this.doctorService.patientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        window.localStorage.removeItem("patientMedicalAdvise");
                        let patientMedicalAdvise: PatientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        patientMedicalAdvise.doctorId = queue.doctorId;
                        patientMedicalAdvise.doctorFirstName = queue.doctorFirstName;
                        patientMedicalAdvise.doctorLastName = queue.doctorLastName ? queue.doctorLastName : '';
                        patientMedicalAdvise.doctorTitle = queue.doctorTitle;
                        patientMedicalAdvise.pocId = this.authService.selectedPocDetails.pocId;
                        patientMedicalAdvise.serviceId = queue.serviceId;
                        patientMedicalAdvise.patientFirstName = queue.patientFirstName;
                        patientMedicalAdvise.patientTitle = queue.patientTitle;
                        patientMedicalAdvise.patientLastName = queue.patientLastName ? queue.patientLastName : '';
                        patientMedicalAdvise.patientDOB = queue.patientDOB;
                        patientMedicalAdvise.patientGender = queue.patientGender;
                        patientMedicalAdvise.patientProfilePic = queue.patientProfilePic;
                        patientMedicalAdvise.patientContactNumber = queue.patientContactNumber;
                        patientMedicalAdvise.parentProfileId = queue.parentProfileId;
                        patientMedicalAdvise.invoiceId = queue.invoiceId;
                        patientMedicalAdvise.orderId = queue.orderId;
                        patientMedicalAdvise.time = queue.time;
                        patientMedicalAdvise.bookingType = queue.bookingType;
                        patientMedicalAdvise.bookingSubType = queue.bookingSubType;
                        window.localStorage.setItem('patientMedicalAdvise', cryptoUtil.encryptData(JSON.stringify(patientMedicalAdvise)));
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
                    this.doctorService.isPrescriptionGenerated = false;
                    sessionBean.bookingPocId = queue.bookingPocId;
                    this.notificationsService.notifyPatient(sessionBean);
                    this.videoCardService.subscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
                    this.router.navigate(['./app/doctor/prescription']);
                }
            }).catch((err) => {
                console.log(err);
                this.spinnerService.stop();

                this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            });
        }
        if (queue.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_WALKIN || queue.bookingSubType == BasketConstants.DOCTOR_BOOKING_SUBTYPE_POC) {
            this.doctorService.getSavePrescriptionsForPatient(queue.invoiceId).then(data => {
                this.spinnerService.stop();
                if (data) {
                    if (data.statusCode != 200 && data.statusCode != 201) {
                        this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
                        return;
                    }
                    if (data.invoiceId == queue.invoiceId) {
                        this.doctorService.patientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        window.localStorage.removeItem("patientMedicalAdvise");
                        let patientMedicalAdvise: PatientMedicalAdvise = JSON.parse(JSON.stringify(data));
                        patientMedicalAdvise.doctorId = queue.doctorId;
                        patientMedicalAdvise.doctorFirstName = queue.doctorFirstName;
                        patientMedicalAdvise.doctorLastName = queue.doctorLastName ? queue.doctorLastName : '';
                        patientMedicalAdvise.doctorTitle = queue.doctorTitle;
                        patientMedicalAdvise.pocId = this.authService.selectedPocDetails.pocId;
                        patientMedicalAdvise.serviceId = queue.serviceId;
                        patientMedicalAdvise.patientFirstName = queue.patientFirstName;
                        patientMedicalAdvise.patientTitle = queue.patientTitle;
                        patientMedicalAdvise.patientLastName = queue.patientLastName ? queue.patientLastName : '';
                        patientMedicalAdvise.patientDOB = queue.patientDOB;
                        patientMedicalAdvise.patientGender = queue.patientGender;
                        patientMedicalAdvise.patientProfilePic = queue.patientProfilePic;
                        patientMedicalAdvise.patientContactNumber = queue.patientContactNumber;
                        patientMedicalAdvise.parentProfileId = queue.parentProfileId;
                        patientMedicalAdvise.invoiceId = queue.invoiceId;
                        patientMedicalAdvise.orderId = queue.orderId;
                        patientMedicalAdvise.time = queue.time;
                        patientMedicalAdvise.bookingType = queue.bookingType;
                        patientMedicalAdvise.bookingSubType = queue.bookingSubType;
                        window.localStorage.setItem('patientMedicalAdvise', cryptoUtil.encryptData(JSON.stringify(patientMedicalAdvise)));
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
                this.spinnerService.stop();

                this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            });

        }
        console.log('end of notifyCustomer');

    }


    generatePrescription(item: PatientQueue) {
        this.queue = this.doctorService.patientQueue = item;
        this.doctorService.isFrom = "doctordashboard";
        if (this.scanAndUploadPrescriptions == true) {
            this.modalView = "uploadOrEngage";
            this.openModelWithOutClose('#doctordashboardUploadPrescription');
        }
        else {
            this.onClickEngage(item);
        }

    }

    generatePrescriptionClickHandler(item: PatientQueue) {
        console.log('item', item)
        this.queue = this.doctorService.patientQueue = item;
        this.doctorService.isFrom = "doctordashboard";
        this.onClickEngage(item);


    }


    openModelWithOutClose(id: string) {
        (<any>$(id)).modal({
            show: true,
            escapeClose: false,
            clickClose: false,
            showClose: false,
            backdrop: "static",
            keyboard: false
        });
    }


    goToConsultationQueue() {
        this.router.navigate(['app/doctor/queue']);
    }

    onTextClick(index) {
        console.log('**#onclick' + JSON.stringify(this.doctorSlotsStatus));
        if (this.doctorSlotsStatus.length > 0) {
            this.tempdoctorSlotsStatus = this.doctorSlotsStatus.filter((queue) => {
                return (queue.type == index);
            });

        }
    }

    onPage(event) {
        this.getDoctorsConsultationQueue();
    }

    clickEventHandler(e) {
        console.log(e);
        if (e.event == "actionButton") {
            if (e.val.status == 1 || e.val.status == 2 || e.val.status == 3 || e.val.status == 6) {
                return;
            }
            else {
                this.generatePrescription(e.val)
            }
        }
        if (e.event == "questionnaireEvent") {
            this.onViewPrescriptionQuestionnaireClickHandler(e.val);
        }
        if (e.event == "consentEvent") {
            this.onConsentRequestClickHandler(e.val);
        }
        if (e.event == "onNameClick") {
            this.navigateToPHRSummary(e.val);
        }
    }

    navigateToPHRSummary(queue) {
        this.doctorService.patientQueue = queue;
        this.queue = queue;
        this.router.navigate(['./app/doctor/patientphrsummary']);
    }


    filterScheduleIdList(scheduleList) {
        var tempScheduleIds = new Array<number>();
        scheduleList.forEach(element => {
            tempScheduleIds.push(element.scheduleId);
        });
        var idList = this.removeDuplicate(tempScheduleIds);
        var filteredScheduledListOfPoc = new Array<any>();
        idList.forEach((element, j) => {
            filteredScheduledListOfPoc[j] = new Array<any>();
            for (let i = 0; i < (scheduleList).length; i++) {
                if (scheduleList[i].scheduleId == element) {
                    filteredScheduledListOfPoc[j].push(scheduleList[i])
                }
            }
        });
        return filteredScheduledListOfPoc;
    }

    removeDuplicate(tempScheduleIds) {
        var uniqueArray = [];

        tempScheduleIds.forEach((e, i) => {
            if (uniqueArray.indexOf(tempScheduleIds[i]) === -1) {
                uniqueArray.push(tempScheduleIds[i]);
            }

        });
        return uniqueArray;
    }

    copyInputMessage() {
        let appId = (this.environment.appId + '').padStart(2, '0');
        let serviceId = ((this.authService.employeeDetails.serviceList
            && this.authService.employeeDetails.serviceList.length > 0
            && this.authService.employeeDetails.serviceList[0]
            && this.authService.employeeDetails.serviceList[0].serviceId)
            ? this.authService.employeeDetails.serviceList[0].serviceId : 211) + '';
        serviceId = serviceId.padStart(3, '0');
        let doctorId = (this.authService.userAuth.employeeId + '').padStart(5, '0');
        let pocId = (this.authService.selectedPocDetails.pocId + '').padStart(5, '0');
        let envId = (Config.TEST_TYPE >= Config.LIVE) ? 0 : 1;

        this.doctorMessage = `Hi there, I am ${'Dr. ' + this.authService.userAuth.employeeName} now available on the ${this.environment.name} app.You can also book for my video consultation appointment from https://d.my3c.co/` + appId + serviceId + pocId + doctorId + envId;

        if (this.isMobile &&(<any>navigator).share) {
            (<any>navigator).share({
                //   title: '',
                text: this.doctorMessage,
                // url: 'https://d.my3c.co/' + appId + serviceId + pocId + doctorId + envId,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
            return;
        }

        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = this.doctorMessage;
        // Set non-editable to avoid focus and move outside of view
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.setAttribute('readonly', '');
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
        this.toast.show('Message copied', "bg-success text-white font-weight-bold", 2000);
}

    getDoctorRevenue() {
        this.doctorService.getDoctorRevenueData(this.authService.userAuth.employeeId).then((revenueResponse) => {
            this.doctorRevenueResponse = revenueResponse;

        }).catch((err) => {
            this.toast.show("Something went wrong. Please try again", "bg-warning text-white font-weight-bold", 3000);
        })
    }

    getDoctorConsultationsData() {
        this.doctorService.getDoctorConsultationsData(this.authService.userAuth.employeeId).then((response) => {
            this.doctorConsultatonsResponse = response;

        }).catch((err) => {
            this.toast.show("Something went wrong. Please try again", "bg-warning text-white font-weight-bold", 3000);
        })
    }


    onViewPrescriptionQuestionnaireClickHandler(patientQueue) {
        this.patientQueue = patientQueue;
        this.showQuestionnaire = this.showModal = true;
    }

    onCloseModalPreQuestionnaire() {
        this.showQuestionnaire = false;
        this.showModal = false
    }

    onConsentRequestClickHandler(queue) {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(queue)));
        this.showconsentpopup = true;
    }

    onModalClose() {
        this.showconsentpopup = false;
    }

    changeConsultationData(value) {
        this.selectedConsultation = value;
    }

    checkConsentStatus(hasConsent) {

        if (hasConsent == 'true') {
            this.showconsentpopup = false;
            this.toast.show("Patient has already given the consent", "bg-warning text-white font-weight-bold", 3000);

        } else {
            this.hasConsent = false;

        }

    }

    async getTokenSummary() {
        let pocId = this.authService.userAuth.pocId;
        let doctorId = this.authService.userAuth.employeeId;
        await this.doctorService.getTokenSummary(pocId, doctorId).then((tokenResponse) => {
            this.tokenSummary = tokenResponse;
        }).catch((err) => {
            this.toast.show("Something went wrong. Please try again", "bg-warning text-white font-weight-bold", 3000);
        })
    }

    detectMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      }

}