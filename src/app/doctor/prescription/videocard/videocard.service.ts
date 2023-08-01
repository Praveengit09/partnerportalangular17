import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { DigiQueueService } from './../../../reception/digiqueue/digiqueue.service';
import { VideoStatus } from './../../../model/doctor/videoStatus';
import { AuthService } from './../../../auth/auth.service';
import { Observable } from 'rxjs';
import { SessionBean } from './../../../model/slotbooking/sesssionBean';
import { URLStringFormatter } from './../../../base/util/url-string-formatter';
import { DoctorService } from './../../doctor.service';
import { NotificationsService } from '../../../layout/notifications/notifications.service';
import { Config } from './../../../base/config';

@Injectable()
export class VideoCardService {
    private socket;
    userType: number = VideoStatus.USER_TYPE_DOCTOR;
    patientQueue;

    constructor(
        private doctorService: DoctorService,
        private notificationsService: NotificationsService,
        private digiService: DigiQueueService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter
    ) {
        this.socket = io(Config.URLS.CHAT_SERVER_URL + 'videoprescription');
        console.log(Config.URLS.CHAT_SERVER_URL + 'videoprescription');
    }
    onUpdateSession() {
        return Observable.create((observer) => {
            this.socket.on('onUpdateSession', (sessionBean) => {
                let session: SessionBean = JSON.parse(sessionBean);
                this.doctorService.setOpenTokCredential(session.apiKey, session.sessionId, session.tokenId);
                observer.next(session);
            });
        });
    }
    onUpdatePrescription(): Observable<any> {
        return Observable.create((observer) => {
            this.socket.on('onUpdatePrescription', (prescription) => {
                observer.next(JSON.parse(prescription));
            });
        });
    }
    onStatusUpdate() {
        return Observable.create((observer) => {
            this.socket.on('onUpdateSession', (videoStatus) => {
                videoStatus = JSON.parse(videoStatus);
                observer.next(videoStatus);
            });
        });
    }

    updatePrescription(prescription = this.doctorService.patientMedicalAdvise) {
        // if (prescription.bookingType &&
        //     prescription.bookingType == 3 &&
        //     prescription.bookingSubType &&
        //     prescription.bookingSubType == 1) { //digi
        this.socket.emit('updatePrescription', JSON.stringify(prescription));
        // }
    }


    updateSessionStatus(msg = '', code = 0, network = '', userType = this.userType) {
        let videoStatus: VideoStatus = new VideoStatus();

        videoStatus.msg = msg;
        videoStatus.code = code;
        videoStatus.network = network;

        videoStatus.sessionId = this.doctorService.SESSION_ID;
        videoStatus.apiKey = this.doctorService.SESSION_ID;
        videoStatus.token = this.doctorService.SESSION_ID;

        videoStatus.userType = userType;

        console.log(videoStatus)

        this.socket.emit('updateSessionStatus', JSON.stringify(videoStatus));
    }

    subscribeToVideoStatus(sessionBean, userType) {
        this.userType = userType;
        this.notificationsService.avaliableStatus = false;
        this.socket.emit('subscribeToVideoStatus', this.generateSessionBean(sessionBean));
    }
    unSubscribeToVideoStatus(sessionBean, userType) {
        this.userType = userType;
        this.notificationsService.avaliableStatus = true;
        if (sessionBean) {
            sessionBean.userType = userType;
            this.socket.emit('unSubscribeToVideoStatus', sessionBean);
        }
    }
    generateSessionBean(sessionBean: SessionBean) {
        if (!sessionBean) {
            sessionBean = new SessionBean();
        }
        let cryptoUtil = new CryptoUtil();

        if (this.userType == VideoStatus.USER_TYPE_DOCTOR) {
            sessionBean.userType = VideoStatus.USER_TYPE_DOCTOR;
            sessionBean.apiKey = this.doctorService.API_KEY;
            sessionBean.sessionId = this.doctorService.SESSION_ID;
            sessionBean.tokenId = this.doctorService.TOKEN;
            sessionBean.doctorId = this.patientQueue.doctorId;
            sessionBean.doctorTitle = this.patientQueue.doctorTitle;
            sessionBean.doctorFirstName = this.patientQueue.doctorFirstName;
            sessionBean.doctorLastName = this.patientQueue.doctorLastName ? this.patientQueue.doctorLastName : '';
            sessionBean.patientId = this.patientQueue.patientProfileId;
            sessionBean.profileId = this.patientQueue.patientProfileId;
            sessionBean.patientProfileId = this.patientQueue.patientProfileId;
            sessionBean.patientName = (this.patientQueue.patientTitle ? (this.patientQueue.patientTitle + ". ") : '') + this.patientQueue.patientFirstName + ' ' + (this.patientQueue.patientLastName ? this.patientQueue.patientLastName : '');
            sessionBean.patientAge = this.patientQueue.patientDOB;
            sessionBean.patientGender = this.patientQueue.patientGender;
            sessionBean.serviceId = this.patientQueue.serviceId;
            sessionBean.startTime = this.patientQueue.time;
            sessionBean.availableStatus = 1;
            sessionBean.currentTime = new Date().getTime();
            sessionBean.orderId = this.patientQueue.orderId;
            sessionBean.invoiceId = this.patientQueue.invoiceId;
            sessionBean.parentProfileId = this.patientQueue.parentProfileId;
            // sessionBean.consultationType=this.doctorService.patientQueue.;
            sessionBean.patientProfilePic = this.patientQueue.patientProfilePic;
            sessionBean.patientContactNumber = this.patientQueue.patientContactNumber;
            sessionBean.bookingSubType = this.patientQueue.bookingSubType;
            sessionBean.doctorImageUrl = this.auth.employeeDetails.imageUrl;
        } else if ((this.userType == VideoStatus.USER_TYPE_PATIENT) || (this.userType == 2)) {
            sessionBean.userType = this.userType;
            sessionBean.apiKey = this.digiService.API_KEY;
            sessionBean.sessionId = this.digiService.SESSION_ID;
            sessionBean.tokenId = this.digiService.TOKEN;
            sessionBean.doctorId = this.digiService.queue.doctorId;
            sessionBean.doctorTitle = this.digiService.queue.doctorTitle;
            sessionBean.doctorFirstName = this.digiService.queue.doctorFirstName;
            sessionBean.doctorLastName = this.digiService.queue.doctorLastName ? this.digiService.queue.doctorLastName : '';
            sessionBean.patientId = this.digiService.queue.patientProfileId;
            sessionBean.profileId = this.digiService.queue.patientProfileId;
            sessionBean.patientProfileId = this.digiService.queue.patientProfileId;
            sessionBean.patientName = (this.digiService.queue.patientTitle ? (this.digiService.queue.patientTitle + ". ") : '') + this.digiService.queue.patientFirstName + ' ' + (this.digiService.queue.patientLastName ? this.digiService.queue.patientLastName : '');
            sessionBean.patientAge = this.digiService.queue.patientDOB;
            sessionBean.patientGender = this.digiService.queue.patientGender;
            sessionBean.serviceId = this.digiService.queue.serviceId;
            sessionBean.startTime = this.digiService.queue.time;
            sessionBean.availableStatus = 1;
            sessionBean.currentTime = new Date().getTime();
            sessionBean.orderId = this.digiService.queue.orderId;
            sessionBean.invoiceId = this.digiService.queue.invoiceId;
            sessionBean.parentProfileId = this.digiService.queue.parentProfileId;
            // sessionBean.consultationType=this.digiService.queue.;
            sessionBean.patientProfilePic = this.digiService.queue.patientProfilePic;
            sessionBean.patientContactNumber = this.digiService.queue.patientContactNumber;
            sessionBean.bookingSubType = this.digiService.queue.bookingSubType;
            sessionBean.doctorImageUrl = this.auth.employeeDetails.imageUrl;
        }
        console.log(sessionBean)
        return JSON.stringify(sessionBean);
    }

    endConsultation(data) {
        this.socket.emit('endConsultation', data);
    }
}