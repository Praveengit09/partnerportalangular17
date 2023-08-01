import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { AuthService } from './../../../auth/auth.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { PaymentService } from './../../../payment/payment.service';
import { DoctorService } from './../../doctor.service';
import { HsLocalStorage } from './../../../base/hsLocalStorage.service';
import { Component, ViewEncapsulation, OnDestroy, OnInit, Input, ChangeDetectorRef, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import * as OT from '@opentok/client';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { SessionBean } from '../../../model/slotbooking/sesssionBean';
import { VideoCardService } from './videocard.service';
import { NotificationsService } from '../../../layout/notifications/notifications.service';
import { Config } from './../../../base/config';

@Component({
  selector: "videocard",
  templateUrl: "./videocard.template.html",
  styleUrls: ["./videocard.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class VideoCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input("isVideoMax") isVideoMax: boolean = false;
  @Output("minMaxVideo") minMaxVideo = new EventEmitter<boolean>();

  session: OT.Session;
  streams: Array<OT.Stream> = [];
  changeDetectorRef: ChangeDetectorRef;
  maskVideoEnabled: boolean = false;
  enableBlurVideo: boolean = false;
  enablevideorecord: boolean = false;
  muteAudio: boolean = false;
  muteVideo: boolean = false;
  changeCamera: boolean = false;
  mainStream: any;
  streamCount: number = 1;
  bigstreams: any;
  smallstreams: any;


  videoSize: boolean = false;
  hasMaxSizeVideo: boolean = false;

  isCrossVisible = true;
  @Input()
  sessionId: number;

  constructor(private localStorage: HsLocalStorage, private notificationsService: NotificationsService,
    private videoCardService: VideoCardService, private toast: ToasterService, private router: Router,
    private doctorService: DoctorService, private ref: ChangeDetectorRef, private paymentService: PaymentService,
    private spinnerService: SpinnerService, private auth: AuthService) {
    this.changeDetectorRef = ref;

    this.isVideoMax = this.doctorService.isVideoMax;
    this.getVideoDataFromLocalStorage();
    let self = this;

    setTimeout(() => {
      self.setVideoSize(".videoCardBody");
    }, 1)

    $(window).resize(() => {
      setTimeout(() => {
        self.setVideoSize(".videoCardBody");
      }, 1);
    });

    this.initSocketEvents();
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableBlurVideo) {
      this.enableBlurVideo = Config.portal.doctorOptions.enableBlurVideo;
    }
    this.enablevideorecord = Config.portal.doctorOptions.enablevideorecord;
  }

  initSocketEvents() {

  }

  ngOnInit() {
    this.initVideo();
  }

  toggleVideo(streamId, index) {
    this.mainStream = streamId;
    this.onStreamChange();
  };

  onStreamChange() {
    this.bigstreams = this.streams.filter((item) => item.streamId == this.mainStream);
    this.smallstreams = this.streams.filter((item) => item.streamId != this.mainStream);
  }

  initVideo() {
    this.doctorService.initSession().then((session: OT.Session) => {
      this.session = session;
      this.session.on('streamCreated', (event) => {
        this.streams.push(event.stream);
        this.streams = this.streams.filter((item, index) => this.streams.indexOf(item) === index);
        this.streamCount = this.streams.length;
        this.mainStream = this.streams[0].streamId;
        this.bigstreams = this.streams.filter((item) => item.streamId == this.mainStream);
        if (this.streams.length > 1) {
          this.smallstreams = this.streams.filter((item) => item.streamId != this.mainStream);
        }

        if (!this.changeDetectorRef['destroyed']) {
          this.changeDetectorRef.detectChanges();
        }
        this.setVideoSize('.videoCardBody');
      });

      this.session.on('streamDestroyed', (event) => {
        const idx = this.streams.indexOf(event.stream);
        if (idx > -1) {
          this.streams.splice(idx, 1);
          if (!this.changeDetectorRef['destroyed']) {
            this.changeDetectorRef.detectChanges();
          }
        }
        this.setVideoSize('.videoCardBody');
      });
    }).then(() => {
      this.doctorService.connect().catch(err => {
        if (err.code == 1004) {
          this.toast.show('Cannot connect with the patient as the video session expired.', "bg-warning text-white font-weight-bold", 3000);
          this.onStopButtonClick();
        }
      }); this.setVideoSize('.videoCardBody');
    }).catch((err) => {
      console.error(err);
      this.reNotifyCustomer();
      this.toast.show('Reconnecting . . .', "bg-warning text-white font-weight-bold", 3000);

    });

    $(window).resize(() => {
      setTimeout(() => {
        if (this.isVideoMax) this.setFullScreenVideoSize();
        else this.setMinimizeVideoSize();
      }, 15)
    })
  }

  getVideoDataFromLocalStorage() {
    let apiKey, sessionId, tokenId;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem("apiKey") != undefined &&
      window.localStorage.getItem("apiKey") != null &&
      window.localStorage.getItem("sessionId") != undefined &&
      window.localStorage.getItem("sessionId") != null &&
      window.localStorage.getItem("tokenId") != undefined &&
      window.localStorage.getItem("tokenId") != null) {
      apiKey = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("apiKey")));
      sessionId = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("sessionId")));
      tokenId = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("tokenId")));
      this.doctorService.setOpenTokCredential(apiKey, sessionId, tokenId);
    }
  }

  getVideoSupported() {
    return this.doctorService.videoSupported;
  }

  getAudioSupported() {
    return this.doctorService.audioSupported;
  }

  getNetworkChecked() {
    return this.doctorService.networkChecked;
  }

  isVideoConnected(): boolean {
    if (!this.streams) {
      return false
    }
    if (this.streams.length > 0) {
      return true;
    }
    return false;
  }

  maxVideo() {
    this.isVideoMax = !this.isVideoMax;
    if (this.isVideoMax) {
      let elem = document.getElementById("videoCard");
      try {
        if ((<any>elem).requestFullscreen) {
          (<any>elem).requestFullscreen();
        } else if ((<any>elem).mozRequestFullScreen) { /* Firefox */
          (<any>elem).mozRequestFullScreen();
        } else if ((<any>elem).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          (<any>elem).webkitRequestFullscreen();
        } else if ((<any>elem).msRequestFullscreen) { /* IE/Edge */
          (<any>elem).msRequestFullscreen();
        }
      } catch (error) {

      }
      this.setFullScreenVideoSize();
    }
    else {
      try {
        if ((<any>document).exitFullscreen) {
          (<any>document).exitFullscreen();
        } else if ((<any>document).webkitExitFullscreen) {
          (<any>document).webkitExitFullscreen();
        } else if ((<any>document).mozCancelFullScreen) {
          (<any>document).mozCancelFullScreen();
        } else if ((<any>document).msExitFullscreen) {
          (<any>document).msExitFullscreen();
        }
      } catch (error) {

      }
      this.setMinimizeVideoSize();
    }
  }

  setMinimizeVideoSize() {
    setTimeout(() => {
      let width: number = (parseFloat($("#videoCard").width() + ''));
      $(".OT_root.OT_subscriber.OT_fit-mode-cover")
        .css({
          'width': width + 'px',
          'min-height': (parseFloat(width + '') * (4 / 7)) + 'px'
        });

      $(".OT_subscriber .OT_widget-container")
        .css({
          'height': 100 + '%'
        });

      $(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover")
        .css({
          'width': (parseFloat($(".videoCardBody").width() + '') * (0.3)) + 'px',
          'min-height': (parseFloat($(".videoCardBody").width() + '') * (0.25)) + 'px',
          'height': (parseFloat($(".videoCardBody").width() + '') * (0.25)) + 'px',
          position: 'absolute',
          bottom: '0'
        });
    }, 1);
  }

  setFullScreenVideoSize() {
    setTimeout(() => {
      let id = window;
      let width: number = Math.floor(parseInt($(id).width() + ''));
      let height: number = Math.floor(parseFloat($(id).height() + '')) - 1 * $(".videoCard .video-footer").height();
      $(".OT_root.OT_subscriber.OT_fit-mode-cover")
        .css({
          'width': width + 'px',
          'min-height': height + 'px'
        });
      $(".OT_subscriber .OT_widget-container")
        .css({
          'height': (height - 67) + 'px'
        });
      //postion of full-screen-video
      $(".OT_mirrored.OT_root.OT_publisher.OT_fit-mode-cover")
        .css({
          'width': (width * 0.30) + 'px',
          'height': (height * 0.50) + 'px',
          position: 'absolute',
          bottom: 67 + 'px'
        });
    }, 200);
  }

  setVideoSize(id) {
    if (document.fullscreen || this.doctorService.isPrescriptionGenerated) {
      this.isVideoMax = true;
      this.setFullScreenVideoSize();
    } else {
      this.isVideoMax = false;
      this.setMinimizeVideoSize();
    }
  }

  ngOnDestroy() {
    this.isCrossVisible = false;
    this.doctorService.disconnect();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.doctorService.disconnect();
    this.initVideo();
  }

  onStopButtonClick() {
    if (this.doctorService.isPrescriptionGenerated) {
      this.doctorService.disconnect();
      this.isCrossVisible = false;
      this.doctorService.isVideo = false;
      if (this.doctorService.isFrom == "doctorhomeconsult") {
        this.router.navigate(["./app/doctor/doctorhomeconsult/listing"]);
      } else {
        this.router.navigate(["./app/doctor/queue"]);
      }
    }
    // Emit the event here for stop
    let endConsultData = {
      parentProfileId: this.doctorService.patientQueue.parentProfileId,
      patientProfileId: this.doctorService.patientQueue.parentProfileId,
      invoiceId: this.doctorService.patientQueue.invoiceId,
      prescriptionGenerated: this.doctorService.isPrescriptionGenerated
    };
    this.videoCardService.endConsultation(endConsultData);

    if (this.doctorService.isVideoMax) {
      this.doctorService.disconnect();
      this.isCrossVisible = false;
      this.doctorService.isVideo = false;
      this.minMaxVideo.emit(this.doctorService.isVideoMax);
    }
    else {
      this.isCrossVisible = false;
      this.doctorService.isVideo = false;
      this.doctorService.disconnect();
    }

  }

  reNotifyCustomer() {
    this.paymentService.reNotifyCustomer(this.doctorService.patientQueue.invoiceId).then((resp) => {
      this.toast.show(resp.statusMessage, "bg-warning text-white font-weight-bold", 3000);
      if (resp.statusCode == 200) {
        let session: SessionBean = JSON.parse(JSON.stringify(resp.session));
        session.bookingPocId = this.doctorService.patientQueue.bookingPocId;
        if (session && !session.doctorImageUrl) {
          session.doctorImageUrl = this.auth.employeeDetails.imageUrl;
        }
        if (session && !session.patientProfilePic) {
          session.patientProfilePic = this.doctorService.patientQueue.patientProfilePic;
        }
        if (session && !session.bookingPocId) {
          session.bookingPocId = this.doctorService.patientQueue.bookingPocId;
        }
        console.log(JSON.stringify(session), "notifyPatient")
        this.notificationsService.notifyPatient(session ? session : this.doctorService.patientQueue.sessionBean);
        if (session.sessionId != this.doctorService.SESSION_ID) {
          this.doctorService.setOpenTokCredential(session.apiKey, session.sessionId, session.tokenId);
          this.initVideo();
        }
      }
    })
  }

  changeVideoMinMax() {
    this.isVideoMax = !this.isVideoMax;
    this.doctorService.isVideoMax = !this.doctorService.isVideoMax;
    this.minMaxVideo.emit(this.isVideoMax);
  }
  reconnectVideo() {
    this.toast.show('Reconnecting video again. . .', "bg-warning text-white font-weight-bold", 3000);
    this.doctorService.isVideo = false;
    setTimeout(() => {
      this.doctorService.isVideo = true;
    }, 10)
  }

  isPrescriptionGenerated(): boolean {
    return this.doctorService.isPrescriptionGenerated
  }

  onBlurToggle() {
    this.maskVideoEnabled = !this.maskVideoEnabled;
  }

  onAudioToggle() {
    this.muteAudio = !this.muteAudio;
  }

  onVideoToggle() {
    this.muteVideo = !this.muteVideo;
  }

  onCameraChange() {
    this.changeCamera = !this.changeCamera;
  }
}
