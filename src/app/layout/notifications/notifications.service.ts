import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import io from 'socket.io-client';
import { Observable } from 'rxjs';
import { SessionBean } from '../../model/slotbooking/sesssionBean';
import { SocketConstants } from '../../model/socket/socketconstants';
import { Config } from './../../base/config';

@Injectable()
export class NotificationsService {
    private socket: any;
    avaliableStatus: boolean = true;

    constructor(private auth: AuthService) {
        this.socket = io(Config.URLS.CHAT_SERVER_URL + 'notification');
        console.log(Config.URLS.CHAT_SERVER_URL + 'notification');
        this.onCallForward();
    }

    subscribeNotification(empId = this.auth.employeeDetails.empId) {
        this.socket.emit('subscribeNotification', empId);
    }

    onCallForward(): Observable<SessionBean> {
        return Observable.create((observer) => {
            this.socket.on('onCallForward', (sessionBean) => {
                console.log("event", "onCallForward", sessionBean)
                sessionBean = JSON.parse(sessionBean);
                if (this.avaliableStatus == true) {
                    observer.next(sessionBean);
                }
            });
        });
    }

    onCallReject(): Observable<SessionBean> {
        return Observable.create((observer) => {
            this.socket.on('onCallReject', (sessionBean) => {
                console.log("event", "onCallReject", sessionBean)
                sessionBean = JSON.parse(sessionBean);
                observer.next(sessionBean);
            });
        });
    }
    notifyCallReject(sessionBean: SessionBean) {
        if (sessionBean) {
            if (
                sessionBean.bookingType == 3 &&
                sessionBean.bookingSubType == 1 //digi manager 1
            ) {
                if (sessionBean.to == SocketConstants.DIGI_MANAGER) sessionBean.to = SocketConstants.DOCTOR;
                else if (sessionBean.to == SocketConstants.DOCTOR) sessionBean.to = SocketConstants.DIGI_MANAGER;
                else sessionBean.to = SocketConstants.DIGI_MANAGER;
            } else if (
                sessionBean.bookingType == 1 //connect now
            ) {
                sessionBean.to = SocketConstants.CONSUMER;//user 1
            } else if (
                sessionBean.bookingType == 3 &&
                sessionBean.bookingSubType == 2 //connect later
            ) {
                sessionBean.to = SocketConstants.CONSUMER;//user 1
            }
            this.socket.emit('notifyCallReject', JSON.stringify(sessionBean));
        }
    }

    notifyDigiManger(sessionBean: SessionBean) {
        sessionBean.to = SocketConstants.DIGI_MANAGER;//digi manager 1
        this.socket.emit('notifyDigiManger', JSON.stringify(sessionBean));
    }

    notifyPatient(sessionBean: SessionBean) {
        if (
            sessionBean.bookingType == 3 &&
            sessionBean.bookingSubType == 1 //digi manager 1
        ) {
            sessionBean.to = SocketConstants.DIGI_MANAGER;
            this.socket.emit('notifyDigiManger', JSON.stringify(sessionBean));
        } else if (
            sessionBean.bookingType == 1 //connect now
        ) {
            sessionBean.to = SocketConstants.CONSUMER;//user 1
            this.socket.emit('notifyUserCallForward', JSON.stringify(sessionBean));
        } else if (
            sessionBean.bookingType == 3 &&
            sessionBean.bookingSubType == 2 //connect later
        ) {
            sessionBean.to = SocketConstants.CONSUMER;//user 1
            this.socket.emit('notifyUserCallForward', JSON.stringify(sessionBean));
        }

    }

    notifyUserCallForward(sessionBean: SessionBean) {
        sessionBean.to = SocketConstants.CONSUMER;//user 1
        this.socket.emit('notifyUserCallForward', JSON.stringify(sessionBean));
    }

    notifyDoctorCallForward(sessionBean: SessionBean) {
        sessionBean.to = SocketConstants.DOCTOR;//doctor 0
        this.socket.emit('notifyDoctorCallForward', JSON.stringify(sessionBean));
    }
}