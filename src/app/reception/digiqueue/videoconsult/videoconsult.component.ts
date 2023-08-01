import { ToasterService } from './../../../layout/toaster/toaster.service';
import { VideoStatus } from './../../../model/doctor/videoStatus';
import { VideoCardService } from './../../../doctor/prescription/videocard/videocard.service';
import { Component, ViewEncapsulation, OnDestroy, OnInit, AfterViewInit, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../../auth/auth.service'
import { CommonUtil } from './../../../base/util/common-util';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { LoginResponse } from "./../../../login/model/loginresponse";
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../base/util/validation-util';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
// import { OpentokService } from './opentok.service';
import * as OT from '@opentok/client';
import { DigiQueueModule } from '../digiqueue.module';
import { DigiQueueService } from '../digiqueue.service';
import { PaymentService } from '../../../payment/payment.service';
import { PatientMedicalAdvise } from './../../../model/advice/patientMedicalAdvise';
import { NotificationsService } from '../../../layout/notifications/notifications.service';


@Component({
    selector: 'videoconsult',
    templateUrl: './videoconsult.template.html',
    styleUrls: ['./videoconsult.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VideoConsultComponent implements OnInit, OnDestroy {

    session: OT.Session;
    streams: Array<OT.Stream> = [];
    changeDetectorRef: ChangeDetectorRef;
    isCrossVisible: boolean = true;
    queue: PatientQueue = new PatientQueue();
    prescription: PatientMedicalAdvise = new PatientMedicalAdvise();
    modelView: string;
    isSelfVideoVisable: boolean = true;

    constructor(private localStorage: HsLocalStorage, private toast: ToasterService, private activatedRoute: ActivatedRoute,
        private router: Router, private ref: ChangeDetectorRef, private videoCardService: VideoCardService,
        private notificationsService: NotificationsService,
        private paymentService: PaymentService
        , private digiQueueService: DigiQueueService) {
        this.changeDetectorRef = ref;
        this.getVideoDataFromLocalStorage();
        this.initSocketEvents();
        if (this.digiQueueService.isNetworkQualityTested == false) {
            this.videoCardService.updateSessionStatus('Patient Navigated for precall network Test', 0);

            this.router.navigateByUrl('app/reception/digiqueue/video/precalltest');
            return;
        } else {
            this.videoCardService.updateSessionStatus('Patient waiting in prescription screen for establishing connection', 0);
        }
    }
    initSocketEvents() {
        this.videoCardService
            .onStatusUpdate()
            .subscribe((status) => {
                //console.log(status)
                this.toast.show(status.msg, "bg-success text-white font-weight-bold", 2000);

            })
        this.videoCardService.onUpdatePrescription()
            .subscribe((prescription) => {
                console.log(prescription);
                this.prescription = prescription;
            })
    }

    ngOnInit() {
        //console.log("hioiii");
        this.notificationsService.avaliableStatus = false;
        this.queue = this.localStorage.getComponentData();

        // this.initVideoSession();
        let self = this;
        this.activatedRoute.params.subscribe(params => {
            // self.digiQueueService.disconnect();
            self.initVideoSession();
        });
    }
    getPrescription() {
        this.prescription;
    }


    openPrescriptionSummary() {
        this.modelView = 'videoprescription';
        (<any>$('#modelIdvideoprescription')).modal('show');
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
            this.digiQueueService.setOpenTokCredential(apiKey, sessionId, tokenId);
        }
    }

    initVideoSession() {
        this.digiQueueService.initSession().then((session: OT.Session) => {
            this.session = session;
            this.session.on('streamCreated', (event) => {
                this.streams.push(event.stream);
                if (!this.changeDetectorRef['destroyed']) {
                    this.changeDetectorRef.detectChanges();
                }
            });
            this.session.on('streamDestroyed', (event) => {
                const idx = this.streams.indexOf(event.stream);
                if (idx > -1) {
                    this.streams.splice(idx, 1);
                    if (!this.changeDetectorRef['destroyed']) {
                        this.changeDetectorRef.detectChanges();
                    }
                }
            });
        })
            .then(() => this.digiQueueService.connect())
            .catch((err) => {
                //console.error(err);
                // alert('Unable to connect. Please try again later.');
                this.toast.show('Engage video consulation again. . .', "bg-warning text-white font-weight-bold", 3000);
                this.router.navigate(["./app/reception/digiqueue/queue"]);
            });
    }

    getVideoSupported() {
        return this.digiQueueService.videoSupported;
    }
    getAudioSupported() {
        return this.digiQueueService.audioSupported;
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

    onStopButtonClick() {
        this.digiQueueService.disconnect();
        this.router.navigate(['./app/reception/digiqueue/queue']);
        this.isCrossVisible = false;
    }
    reNotifyCustomer() {
        let digiManager = true
        this.paymentService.reNotifyCustomer(this.queue.invoiceId, digiManager)
            .then(data => {
                if (data) {
                    //console.log(data);
                    if (data.statusCode == 500) {
                        alert(data.statusMessage);
                        this.router.navigate(["./app/reception/digiqueue/queue"]);
                    }

                }
            });
        //console.log("Notifcation Sent");  
    }

    ngOnDestroy() {
        try {
            this.notificationsService.avaliableStatus = true;
            if (this.digiQueueService.isNetworkQualityTested == false) {
                return;
            }
            if (this.digiQueueService.isNetworkQualityTested == true) {
                this.videoCardService.updateSessionStatus('Patient Video got disconnected', 0);
            }
            this.digiQueueService.disconnect();
            this.isCrossVisible = false;
        } catch (error) {

        }
    }

}