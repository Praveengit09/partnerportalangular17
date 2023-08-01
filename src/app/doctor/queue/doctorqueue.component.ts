import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/observable/interval';
import { BasketConstants } from '../../../app/constants/basket/basketconstants';
import { AppConfig } from '../../app.config';
import { AuthService } from '../../auth/auth.service';
import { CryptoUtil } from '../../auth/util/cryptoutil';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
import { CommonUtil } from '../../base/util/common-util';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { PatientMedicalAdvise } from '../../model/advice/patientMedicalAdvise';
import { VideoStatus } from '../../model/doctor/videoStatus';
import { Doctor } from '../../model/employee/doctor';
import { PatientQueue } from '../../model/reception/patientQueue';
import { ConsultationQueueRequest } from '../../model/slotbooking/consultationQueueRequest';
import { SessionBean } from '../../model/slotbooking/sesssionBean';
import { NurseService } from '../../nurse/nurse.service';
import { PaymentService } from '../../payment/payment.service';
import { DoctorService } from '../doctor.service';
import { VideoCardService } from '../prescription/videocard/videocard.service';
import { SystemConstants } from './../../constants/config/systemconstants';
import { NotificationsService } from './../../layout/notifications/notifications.service';
import { ToasterService } from './../../layout/toaster/toaster.service';
import { Config } from '../../base/config';
import { PhrCategory } from '../../model/phr/phrCategory';

@Component({
    selector: 'doctorqueue',
    templateUrl: './doctorqueue.template.html',
    styleUrls: ['./doctorqueue.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DoctorQueueComponent implements OnInit, OnDestroy {

    isVideoAudioEnable: boolean;
    sessionBean: SessionBean;
    liveNowQueue: PatientQueue;
    doctorStatus: number;
    queueResponse: PatientQueue[] = new Array();
    queueResponse1: PatientQueue[] = new Array();
    originalQueueResponse: PatientQueue[] = new Array();
    queue: PatientQueue;
    subType: string[] = ["WALK-IN", "DIGIROOM", "VIDEO-CHAT", "WALK-IN"];
    isVitalsReadingView: boolean;
    selectedDoctor: Doctor;
    scanAndUploadPrescriptions: boolean = false;
    uploadFilesList: any[] = new Array();
    successMsg: string;
    hasCheckBoxValidation: boolean = false;
    checkBoxValidationMessage: string;
    successColor: string = 'black';
    patientMedicalAdvice: PatientMedicalAdvise;
    url: any;
    disabledUpload: boolean = false;
    doctorServiceType = new Map();
    timeConstant: number;
    enableCustomDoctorQueue: boolean = false;
    currentToken: string = '';
    requestConsentForPatient: string = '';
    selectedPatient: PatientQueue = new PatientQueue();

    doctorQueueRefresh;
    doctorStatusRefresh;
    consentOtp: string = '';
    currency: string = '';
    showconsentpopup: boolean = false;
    isFromqueue: boolean = false;
    hasConsent: boolean = false;
    showQuestionnaire: boolean = false;
    patientQueue: PatientQueue = new PatientQueue();
    showModal: boolean = false;
    disablePatientContactNo: boolean;
    revenueGeneratedByCustomer: boolean = false;


    queueDate: Date = new Date();
    datepickerOptEnd = {
        startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
        autoclose: true,
        todayBtn: "linked",
        todayHighlight: true,
        assumeNearbyYear: true,
        format: "dd/mm/yyyy"
    };
    queueSortIndex: number = 0;


    constructor(config: AppConfig, private router: Router, private localStorage: HsLocalStorage,
        private notificationsService: NotificationsService, private toast: ToasterService,
        private commonUtil: CommonUtil, private doctorService: DoctorService,
        private authService: AuthService,
        private nurseService: NurseService,
        private videoCardService: VideoCardService,
        private spinnerService: SpinnerService,
        private paymentService: PaymentService) {
        this.isVideoAudioEnable = this.authService.selectedPOCMapping.participationSettings.doctorVideoNowAvailable;
        this.enableCustomDoctorQueue = Config.portal.doctorOptions.enableCustomDoctorQueue;
        this.revenueGeneratedByCustomer = Config.portal.doctorOptions.revenueGeneratedByCustomer;
        this.currency = Config.portal.currencySymbol;
        if (this.authService.selectedPocDetails == null
            || this.authService.selectedPocDetails == undefined ||
            this.authService.selectedPocDetails.scanAndUploadPrescriptions == null ||
            this.authService.selectedPocDetails.scanAndUploadPrescriptions == undefined) {
            this.scanAndUploadPrescriptions = false;
        } else {
            this.scanAndUploadPrescriptions = this.authService.selectedPocDetails.scanAndUploadPrescriptions;
        }
        //this.timeConstant=this.systemConstant.REFRESH_TIME;
        if (this.authService.employeeDetails.serviceList && this.authService.employeeDetails.serviceList.length > 0) {
            for (let index = 0; index < this.authService.employeeDetails.serviceList.length; index++) {
                this.doctorServiceType.set(this.authService.employeeDetails.serviceList[index].serviceId, this.authService.employeeDetails.serviceList[index]);
            }
        }
        if (Config.portal && Config.portal.customizations && Config.portal.customizations.disablePatientContactNo) {
            this.disablePatientContactNo = false

        }
        clearInterval(this.doctorStatusRefresh);
        this.doctorStatusRefresh = setInterval(
            (param) => {
                this.getDoctorStatus(param);
            },
            SystemConstants.REFRESH_TIME,
            true
        );
        console.log(this.doctorStatusRefresh);
        // this.doctorStatusRefresh = Observable.interval(SystemConstants.REFRESH_TIME).subscribe((val) => { this.getDoctorStatus(true); });
        clearInterval(this.doctorQueueRefresh);
        this.doctorQueueRefresh = setInterval(
            () => {
                this.getDoctorsConsultationQueue();
            },
            SystemConstants.REFRESH_TIME
        );
        console.log(this.doctorQueueRefresh);
    }
    ngOnInit() {
        // console.log("refreshtime"+this.timeConstant);
        // setInterval(() => { this.getDoctorsConsultationQueue() }, SystemConstants.REFRESH_TIME);
        console.log('systemcobstant' + JSON.stringify(SystemConstants.REFRESH_TIME));
        this.getDoctorsConsultationQueue();
        $('#uploadPrescription').on('hidden.bs.modal', (e) => {
            $("input[type=file]").val("");
            this.successMsg = "";
        });
        //  this.doctorService.getDoctorStatus(this.authService.userAuth.employeeId);
        this.getDoctorStatus();
        // this.load();
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

    private setQueueFromSessionBean(data: any) {
        let queue: PatientQueue = new PatientQueue();
        queue.doctorId = data.doctorId;
        queue.doctorFirstName = data.doctorFirstName;
        queue.doctorLastName = data.doctorLastName ? data.doctorLastName : '';
        queue.doctorTitle = data.doctorTitle;
        queue.pocId = this.authService.selectedPocDetails.pocId;
        queue.serviceId = data.serviceId;
        queue.patientTitle = data.patientTitle;
        queue.patientFirstName = data.patientFirstName;
        queue.patientLastName = data.patientLastName ? data.patientLastName : '';
        queue.patientTitle = data.patientTitle;
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
        queue.sessionBean.patientName = (data.patientTitle ? data.patientTitle + '.' : '') + ' ' + data.patientFirstName + ' ' + (data.patientLastName ? data.patientLastName : '');
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

    ngOnDestroy() {
        clearInterval(this.doctorStatusRefresh);
        clearInterval(this.doctorQueueRefresh);
        // this.doctorQueueRefresh.unsubscribe();
        // this.doctorStatusRefresh.unsubscribe();
    }
    // load() {
    //     console.log("====>>>")
    //     setTimeout(() => { location.reload() },SystemConstants.REFRESH_TIME);
    //     // location.reload();
    //     }

    // }

    connectLiveNow() {
        // this.onClickEngage(this.liveNowQueue);
        (<any>$("#connectNow")).modal("show");
    }

    getIsOnline(): boolean {
        return this.doctorService.isOnline;
    }


    getDoctorsConsultationQueue() {
        let consultationQueueRequest: ConsultationQueueRequest = new ConsultationQueueRequest();
        consultationQueueRequest.digiQueue = false;

        let date = this.queueDate;
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        consultationQueueRequest.date = date.getTime();

        consultationQueueRequest.roleId = 0;
        consultationQueueRequest.doctorId = this.authService.userAuth.employeeId;

        consultationQueueRequest.empId = this.authService.userAuth.employeeId;
        consultationQueueRequest.pocId = this.authService.userAuth.pocId;
        this.doctorService.getDoctorsConsultationQueue(consultationQueueRequest).then((queueResponse: PatientQueue[]) => {
            this.spinnerService.stop();
            this.originalQueueResponse = queueResponse;
            let hasVideoConInQueue = false;
            //filter list for status 6 and calculate temp data
            this.queueResponse1 = queueResponse.filter((queue) => {
                if (
                    queue.bookingType == 1 ||
                    (queue.bookingType == 3 &&
                        (queue.bookingSubType == 1 ||
                            queue.bookingSubType == 2))
                ) {
                    hasVideoConInQueue = true;
                }
                return (queue.status != 6);//Removing Checked
            });
            this.queueResponse = this.queueResponse1.filter((queue) => {
                return (queue.bookingType != 4 && queue.bookingSubType != 5);
            });

            this.queueResponse.forEach(queue => {
                queue.localDOBYear = '' + this.getAge(queue.patientDOB);

            });
            this.calculatingWaitingTime();
            this.sortQueueData();
            if (this.queueResponse && this.queueResponse.length > 0) {
                this.queueResponse[0].appointmentToken ? this.currentToken = this.queueResponse[0].appointmentToken : this.currentToken = 0 + '';
            }

            if (hasVideoConInQueue) {
                this.notificationsService.subscribeNotification();
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    getAge(dob: number): string {
        let ageYears: number = 0;
        let ageMonths: number = 0;

        if (isNaN(parseInt(this.commonUtil.getAgeForall(dob).split(",")[0]))) {
            ageYears = 0
        } else {
            ageYears = parseInt(this.commonUtil.getAgeForall(dob).split(",")[0]);
        }
        if (isNaN(parseInt(this.commonUtil.getAgeForall(dob).split(",")[1]))) {
            ageMonths = 0
        } else {
            ageMonths = parseInt(this.commonUtil.getAgeForall(dob).split(",")[1]);
        }
        let ageString: string = "";
        if (ageYears != null && ageYears != undefined && ageYears != 0) {
            ageString = ageYears + " Years ";
        }
        if (ageMonths != null && ageMonths != undefined && ageMonths != 0) {
            ageString = ageString + ageMonths + " Months";
        }

        return ageString;
    }

    sortQueueData() {
        if (this.queueSortIndex == 1) {
            return this.queueResponse.sort(function (a, b) {
                if (+(+a.waitingTime) > +(+b.waitingTime)) {
                    return -1;
                }
                if (+(+a.waitingTime) < +(+b.waitingTime)) {
                    return 1;
                }
                return 0;
            })
        } else {
            return this.queueResponse.sort(function (a, b) {
                if (+(+a.slotDate + +a.time) < +(+b.slotDate + +b.time)) {
                    return -1;
                }
                if (+(+a.slotDate + +a.time) > +(+b.slotDate + +b.time)) {
                    return 1;
                }
                return 0;
            })
        }
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

            if (
                (Config.portal && Config.portal.doctorOptions
                    && Config.portal.doctorOptions.disableDoctorWaitingTime) &&
                (this.queueResponse[i].bookingType == 1 ||
                    (this.queueResponse[i].bookingType == 3 &&
                        (this.queueResponse[i].bookingSubType == 1 ||
                            this.queueResponse[i].bookingSubType == 2)))
            ) {
                delete this.queueResponse[i].waitingTime;
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

    async onClickEngage(queue: PatientQueue) {
        console.log('start of onClickEngage');
        this.spinnerService.start();
        this.notifyCustomer(queue);
        console.log('end of onClickEngage');
    }

    async notifyCustomer(queue: PatientQueue) {
        this.doctorService.disconnect();
        console.log("start of notifyCustomer")
        this.doctorService.patientQueue = this.videoCardService.patientQueue = queue;
        window.localStorage.removeItem('patientQueue');
        window.localStorage.removeItem("patientMedicalAdvise");
        this.doctorService.uploadFilesList = new Array();
        this.doctorService.isPrescriptionGenerated = false;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('patientQueue', cryptoUtil.encryptData(JSON.stringify(queue)));
        this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
        //for doctor always 5
        // this.doctorService.isFrom = "";
        this.doctorService.isFrom = "consultationqueue";
        window.localStorage.setItem('isFromDigitization', cryptoUtil.encryptData(this.doctorService.isFrom));
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
            console.log(error);
            this.spinnerService.stop();
            this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
            return;
        }
        if (notifyResp && notifyResp.statusCode == 500 || notifyResp.statusCode == 403) {
            alert(notifyResp.statusMessage);
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
            sessionBean.bookingPocId = queue.bookingPocId;
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
                    this.notificationsService.notifyPatient(sessionBean);
                    this.videoCardService.subscribeToVideoStatus(sessionBean, VideoStatus.USER_TYPE_DOCTOR);
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
    updateDoctorStatus() {
        console.log("isOnline");


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

    patientPHR(queue: PatientQueue) {
        // this.router.navigateByUrl('app/onboarding/physical/'+queue.parentProfileId);
        this.queue = queue;
        this.nurseService.patientQ = queue;
        this.isVitalsReadingView = true;
        //this.router.navigate(['/app/doctor/vitalsReading']);
        (<any>$("#modelId")).modal("toggle");
    }
    getQueue(queue) {
        this.queue = queue;
        this.doctorService.patientQueue = queue;
    }
    navigateToPHRSummary(queue) {
        this.doctorService.patientQueue = queue;
        this.queue = queue;
        this.router.navigate(['./app/doctor/patientphrsummary']);
    }
    openModelWithOutClose(id) {
        (<any>$("#" + id)).modal({
            show: true,
            escapeClose: false,
            clickClose: false,
            showClose: false,
            backdrop: "static",
            keyboard: false
        });
    }


    checkConsentStatus(hasConsent) {
        if (hasConsent == 'true') {
            this.hasConsent = true;
            this.showconsentpopup = false;
            this.toast.show("Patient has already given the consent", "bg-warning text-white font-weight-bold", 3000);

        } else {
            this.showconsentpopup = true;
            this.hasConsent = false;

        }
    }

    onConsentRequestClickHandler(queue) {

        this.isFromqueue = true;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(queue)));
        this.showconsentpopup = true;
    }

    onModalClose() {
        this.showconsentpopup = false;
        this.isFromqueue = false;
    }

    onViewPrescriptionQuestionnaireClickHandler(patientQueue) {

        this.patientQueue = patientQueue;
        this.showQuestionnaire = this.showModal = true;
        console.log('showQuestionnaire', this.showQuestionnaire);;
    }

    onCloseModalPreQuestionnaire() {
        this.showQuestionnaire = this.showModal = false;
    }


}

// int SERVICE_TYPE_POC = 0;
// int SERVICE_TYPE_DIGIROOM = SERVICE_TYPE_POC + 1;
// int SERVICE_TYPE_VIDEO_CHAT = SERVICE_TYPE_DIGIROOM + 1;
// int SERVICE_TYPE_WALKIN = SERVICE_TYPE_VIDEO_CHAT + 1;