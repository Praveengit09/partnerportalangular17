import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { SessionBean } from '../../model/slotbooking/sesssionBean';
import { DoctorService } from '../../doctor/doctor.service';
import { DoctorUtil } from '../../base/util/doctor-util';
import { DigiQueueService } from '../../reception/digiqueue/digiqueue.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { VideoCardService } from '../../doctor/prescription/videocard/videocard.service';
import { ToasterService } from '../toaster/toaster.service';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
import { SocketConstants } from '../../model/socket/socketconstants';
import { PatientMedicalAdvise } from '../../model/advice/patientMedicalAdvise';
import { CryptoUtil } from '../../auth/util/cryptoutil';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.template.html',
  styleUrls: ['./notifications.style.scss']
})
export class Notifications implements OnInit {

  data: any;
  ringtone = new Audio('assets/media/ringtone.mp3');

  constructor(
    private notificationsService: NotificationsService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private videoCardService: VideoCardService,
    private digiQueueService: DigiQueueService,
    private localStorage: HsLocalStorage,
    private router: Router,
    private toast: ToasterService
  ) {
  }


  initNotificationsEvents() {
    let self = this;
    (<any>$("#modelIdincomingcall")).on('shown.bs.modal', function () {
      self.ringtone.loop = true;
      self.ringtone.play();
    });
    (<any>$("#modelIdincomingcall")).on("hidden.bs.modal", function () {
      self.ringtone.pause();
    });

    this.notificationsService.subscribeNotification(this.authService.employeeDetails.empId);

    this.notificationsService.onCallForward()
      .subscribe((sessionBean) => {
        console.log(sessionBean);
        this.data = sessionBean;
        (<any>$("#modelIdincomingcall")).modal({
          show: true,
          escapeClose: false,
          clickClose: false,
          showClose: false,
          backdrop: "static",
          keyboard: false
        });
      })

    this.notificationsService.onCallReject()
      .subscribe((sessionBean) => {
        console.log('onCallReject-->', sessionBean);
        if (this.notificationsService.avaliableStatus == false) {
          this.toast.show('Call Rejected', "bg-danger text-white font-weight-bold", 3000);
        }
      })

  }

  ngOnInit(): void {
    if (
      this.authService.userAuth.hasDoctorRole ||
      this.authService.userAuth.hasDigiManagerRole
    ) {
      this.initNotificationsEvents();
    }
  }
  rejectCall(data) {
    let sessionBean: SessionBean = JSON.parse(JSON.stringify(data));
    (<any>$("#modelIdincomingcall")).modal('hide');
    this.notificationsService.notifyCallReject(sessionBean);
  }
  acceptCall(data) {
    (<any>$("#modelIdincomingcall")).modal('hide');
    let sessionBean: SessionBean = JSON.parse(JSON.stringify(data));
    if (sessionBean.to == SocketConstants.DOCTOR) {
      this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
      this.doctorService.patientQueue = DoctorUtil.getQueueFromSessionBean(sessionBean);
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window) {
        window.localStorage.setItem("patientMedicalAdvise", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientMedicalAdvise)));
        window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
      }
      this.doctorService.setOpenTokCredential(sessionBean.apiKey, sessionBean.sessionId, sessionBean.tokenId);
      this.videoCardService.subscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
      this.doctorService.getSavePrescriptionsForPatient(this.doctorService.patientQueue.invoiceId).then(data => {
        if (data) {
          if (data.statusCode != 200 && data.statusCode != 201) {
            this.toast.show(data.statusMessage || 'Something went wrong', "bg-danger text-white font-weight-bold", 3000);
            return;
          }
          if (data.invoiceId == this.doctorService.patientQueue.invoiceId) {
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
            if (window) {
              window.localStorage.setItem("patientMedicalAdvise", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientMedicalAdvise)));
            }
          }
          this.doctorService.isVideoQuestionShow = false;
          this.doctorService.isPrescriptionGenerated = false;
          sessionBean.bookingPocId = this.doctorService.patientQueue.bookingPocId;
          this.router.navigate(['./app/doctor/prescription']);
        }
      }).catch((err) => {
        console.log(err);
        this.router.navigate(['./app/doctor/prescription']);
        this.toast.show("Network Error. Please try again", "bg-warning text-white font-weight-bold", 3000);
      });


      // this.doctorService.patientQueue = DoctorUtil.getQueueFromSessionBean(sessionBean);
      // this.doctorService.setOpenTokCredential(sessionBean.apiKey, sessionBean.sessionId, sessionBean.tokenId);
      // this.videoCardService.subscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
      // this.router.navigate(["./app/doctor"])
      // setTimeout(() =>
      //   this.router.navigate(["./app/doctor/prescription"])
      //   , 5);
    } else if (sessionBean.to == SocketConstants.DIGI_MANAGER) {
      this.digiQueueService.queue = DoctorUtil.getQueueFromSessionBean(sessionBean);
      this.digiQueueService.setOpenTokCredential(sessionBean.apiKey, sessionBean.sessionId, sessionBean.tokenId);
      this.localStorage.saveComponentData(this.digiQueueService.queue);
      this.videoCardService.subscribeToVideoStatus(this.digiQueueService.queue.sessionBean, 1);
      this.router.navigate(["./app/reception/digiqueue/"])
      setTimeout(() =>
        this.router.navigate(["./app/reception/digiqueue/video/consult/" + sessionBean.sessionId])
        , 5);
    }

  }

  getProfilePic(data: SessionBean) {
    if (data.to == SocketConstants.DOCTOR) {
      return data.patientProfilePic || 'assets/img/avatar.png';
    }
    if (data.to == SocketConstants.DIGI_MANAGER) {
      return data.doctorImageUrl || 'assets/img/avatar.png';
    }
    return 'assets/img/avatar.png';
  }

}
