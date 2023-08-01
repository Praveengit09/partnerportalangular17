import { Injectable } from '@angular/core'
import { PatientQueue } from '../../model/reception/patientQueue';
import { SessionBean } from '../../model/slotbooking/sesssionBean';

@Injectable()
export class DoctorUtil {

    static getQueueFromSessionBean(sessionBean: SessionBean) {
        let queue: PatientQueue = new PatientQueue();
        queue.doctorId = sessionBean.doctorId;
        queue.doctorFirstName = sessionBean.doctorFirstName;
        queue.doctorLastName = sessionBean.doctorLastName ? sessionBean.doctorLastName : '';
        queue.doctorTitle = sessionBean.doctorTitle;
        queue.pocId = sessionBean.pocId;
        queue.serviceId = sessionBean.serviceId;
        queue.patientFirstName = sessionBean.patientFirstName;
        queue.patientLastName = sessionBean.patientLastName ? sessionBean.patientLastName : '';
        queue.patientTitle = sessionBean.patientTitle;
        queue.patientDOB = sessionBean.patientDOB;
        queue.patientGender = sessionBean.patientGender;
        queue.patientProfilePic = sessionBean.patientProfilePic;
        queue.patientContactNumber = sessionBean.patientContactNumber;
        queue.parentProfileId = sessionBean.parentProfileId;
        queue.invoiceId = sessionBean.invoiceId;
        queue.orderId = sessionBean.orderId;
        queue.time = sessionBean.time;
        // queue.order = sessionBean.orderId;
        queue.bookingType = sessionBean.bookingType;
        queue.bookingSubType = sessionBean.bookingSubType;
        queue.patientProfileId = sessionBean.patientProfileId;
        queue.sessionBean = new SessionBean();
        queue.sessionBean.doctorId = sessionBean.doctorId;
        queue.sessionBean.doctorTitle = sessionBean.doctorTitle;
        queue.sessionBean.patientAge = sessionBean.patientAge;
        queue.sessionBean.doctorFirstName = sessionBean.doctorFirstName;
        queue.sessionBean.doctorLastName = sessionBean.doctorLastName ? sessionBean.doctorLastName : '';
        queue.sessionBean.patientId = sessionBean.patientId;
        queue.sessionBean.profileId = sessionBean.profileId;
        queue.sessionBean.patientName = (sessionBean.patientTitle ? (sessionBean.patientTitle + ". ") : '')
            + sessionBean.patientFirstName + ' ' + (sessionBean.patientLastName ? sessionBean.patientLastName : '');
        queue.sessionBean.serviceId = sessionBean.serviceId;
        queue.sessionBean.type = sessionBean.bookingType;
        queue.sessionBean.sessionId = sessionBean.sessionId;
        queue.sessionBean.tokenId = sessionBean.tokenId;
        queue.sessionBean.serviceId = sessionBean.serviceId;
        // queue.sessionBean.sessionBean = sessionBean.sessionBean;
        queue.sessionBean.availableStatus = sessionBean.availableStatus;
        queue.sessionBean.currentTime = sessionBean.currentTime;
        queue.sessionBean.orderId = sessionBean.orderId;
        queue.sessionBean.invoiceId = sessionBean.invoiceId;
        queue.sessionBean.apiKey = sessionBean.apiKey;
        queue.sessionBean.bookingSubType = sessionBean.bookingSubType;

        return queue;
    }

    static getFileExtensionFromUrl(url: string): string {
        let toLowerCaseurl = '' + ((url) + '').toLocaleLowerCase();
        let fileExtensions: string[] = ['pdf', 'xlsx', 'xlx', 'xls', 'png', 'jpg', 'jpeg'];
        for (let i = 0; i < fileExtensions.length; i++) {
            let j = toLowerCaseurl.indexOf('.' + fileExtensions[i]);
            if (j > 0) {
                return '.' + fileExtensions[i];
            }
        }
        for (let i = 0; i < fileExtensions.length; i++) {
            let j = toLowerCaseurl.indexOf(fileExtensions[i] + `/`);
            if (j >= 0) {
                return '.' + fileExtensions[i];
            }
        }
        return '';
    }

}