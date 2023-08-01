import { NotificationsService } from './../../../layout/notifications/notifications.service';
import { VideoCardService } from './../../../doctor/prescription/videocard/videocard.service';
import { VideoStatus } from './../../../model/doctor/videoStatus';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientQueue } from '../../../model/reception/patientQueue';
import { AppConfig } from '../../../app.config';
import { CommonUtil } from '../../../base/util/common-util';
import { AuthService } from '../../../auth/auth.service';
import { PaymentService } from '../../../payment/payment.service';
import { PharmacyService } from '../../../pharmacy/pharmacy.service';
import { ReceptionService } from '../../reception.service';
import { ConsultationQueueRequest } from '../../../model/slotbooking/consultationQueueRequest';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { DigiQueueService } from '../digiqueue.service';
import { Location } from '@angular/common';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import 'rxjs/add/observable/interval';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { CryptoUtil } from '../../../auth/util/cryptoutil';

@Component({
    selector: 'doctorqueue',
    templateUrl: './doctorqueue.template.html',
    styleUrls: ['./doctorqueue.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DoctorQueueComponent implements OnInit {

    queueResponse: PatientQueue[] = new Array();
    originalQueueResponse: PatientQueue[] = new Array();
    subType: string[] = ["POC", "DIGIROOM", "VIDEO-CHAT", "WALKIN"];
    sub;
    serviseList: any;
    pdfHeaderType: number;
    // bookingPocId: any;

    constructor(config: AppConfig, private notificationsService: NotificationsService, private router: Router, private localStorage: HsLocalStorage, private diagnosticService: DiagnosticsService,
        private commonUtil: CommonUtil, private doctorService: DigiQueueService, private digiQueueService: DigiQueueService
        , private authService: AuthService, private pharmacyService: PharmacyService, private paymentservice: PaymentService,
        private paymentService: PaymentService, private videoCardService: VideoCardService, private location: Location, private receptionService: ReceptionService, private spinnerService: SpinnerService) {
        // this.sub = Observable.interval(10000).subscribe((val) => { this.getDoctorsConsultationQueue(); });

        this.sub = setInterval(
            () => { this.getDoctorsConsultationQueue(); },
            10000
        )


        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        console.log("========>>> headerType " + this.pdfHeaderType)

    }
    ngOnInit() {
        this.serviseList = this.authService.loginResponse.employee.serviceList;
        if (!this.serviseList) {
            this.serviseList = new Array();
        }
        console.log("serviceList-->>" + JSON.stringify(this.serviseList));
        this.getDoctorsConsultationQueue();
        // this.load();
    }

    // load() {
    //     console.log("====>>>")
    //     setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
    //     // location.reload();
    //     }

    ngOnDestroy() {
        // this.sub.unsubscribe();
        clearInterval(this.sub);
    }

    getDoctorsConsultationQueue() {

        console.log("yeessss");

        let consultationQueueRequest: ConsultationQueueRequest = new ConsultationQueueRequest();
        consultationQueueRequest.digiQueue = true;

        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        consultationQueueRequest.date = date.getTime();

        consultationQueueRequest.roleId = 0;
        consultationQueueRequest.doctorId = 0;

        consultationQueueRequest.empId = this.authService.userAuth.employeeId;
        consultationQueueRequest.pocId = this.authService.userAuth.pocId;
        // this.spinnerService.start();
        this.doctorService.getDoctorsConsultationQueue(consultationQueueRequest).then((queueResponse: PatientQueue[]) => {
            // this.spinnerService.stop();
            console.log("resp-->>" + JSON.stringify(queueResponse));
            this.originalQueueResponse = queueResponse;
            this.queueResponse = queueResponse;
            let hasVideoConInQueue = false;
            //filter list for status 6 and calculate temp data
            /*  this.queueResponse = this.queueResponse.filter(
                 queue => queue.status != 6); */
            this.queueResponse.forEach(queue => {
                if (
                    queue.bookingType == 1 ||
                    (queue.bookingType == 3 &&
                        (queue.bookingSubType == 1 ||
                            queue.bookingSubType == 2))
                ) {
                    hasVideoConInQueue = true;
                }
                queue.localDOBYear = this.commonUtil.getAge(queue.patientDOB).split(",")[0] + this.commonUtil.getAge(queue.patientDOB).split(",")[1];
            });
            console.log("QueueResponse==>> " + JSON.stringify(this.queueResponse));
            if (hasVideoConInQueue) {
                this.notificationsService.subscribeNotification();
            }
            this.calculatingWaitingTime();
        })
    }

    calculatingWaitingTime() {
        for (let i = 0; i < this.queueResponse.length; i++) {
            // patient status is waiting or in payment
            if (this.queueResponse[i].status == 4 || this.queueResponse[i].status == 7) {
                // if booking subtype is walkin
                if (this.queueResponse[i].bookingSubType == 3) {
                    let time = new Date();
                    time.setDate(0);
                    time.setMonth(0);
                    time.setFullYear(0);
                    let currentTime = time.getTime();
                    console.log("Cur time-->" + currentTime);
                    this.queueResponse[i].waitingTime = this.queueResponse[i].time - currentTime;
                } else {
                    let time = new Date();
                    this.queueResponse[i].waitingTime = time.getTime() - this.queueResponse[i].visitedTime
                }
            } else {
                // if booking subtype is walkin
                if (this.queueResponse[i].bookingSubType == 3) {
                    this.queueResponse[i].waitingTime = this.queueResponse[i].doctorEngTime -
                        new Date().getTime();
                } else {
                    this.queueResponse[i].waitingTime = this.queueResponse[i].doctorEngTime -
                        this.queueResponse[i].visitedTime;
                }
            }
            console.log("Waiting time--->>" + this.queueResponse[i].waitingTime);
        }
    }

    async onClickEngage(butttonindex: number, queue: PatientQueue) {
        this.digiQueueService.queue = queue;
        switch (butttonindex) {
            //update
            case 1: {
                let basketRequest: BasketRequest = await this.pharmacyService.getOrderDetails(queue.orderId, queue.invoiceId);
                if (basketRequest && basketRequest.slotBookingDetailsList && basketRequest.slotBookingDetailsList.length > 0 && basketRequest.slotBookingDetailsList[0].payment && basketRequest.slotBookingDetailsList[0].payment.paymentStatus == 0) {
                    // await this.receptionService.updatePaymentDeskToServer(basketRequest);
                    this.notifyCustomer(queue, butttonindex);
                } else {
                    this.notifyCustomer(queue, butttonindex);
                }
                break;
            }

            //engage
            case 5: {
                this.notifyCustomer(queue, butttonindex);
                break;
            }
        }
    }

    async notifyCustomer(queue: PatientQueue, butttonindex) {

        //update 4 //start 5

        let patientStatus = butttonindex == 1 ? 4 : 5;

        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        let notifyCustomerRequest = {
            "date": queue.slotDate || date.getTime(),
            "bookingPocId": queue.bookingPocId,
            "notifyPartner": false,
            "digiQueue": true,
            "doctorId": queue.doctorId,
            "invoiceId": queue.invoiceId,
            "orderId": queue.orderId,
            "patientId": queue.patientProfileId,
            "patientStatus": patientStatus,
            "pocId": queue.pocId,
            "time": queue.time
        }
        await this.paymentService.notifyCustomer(notifyCustomerRequest);
        if (butttonindex == 1) {
            this.getDoctorsConsultationQueue();
        } else {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem(
                "apiKey",
                cryptoUtil.encryptData(JSON.stringify(queue.sessionBean.apiKey))
            );
            window.localStorage.setItem(
                "sessionId",
                cryptoUtil.encryptData(JSON.stringify(queue.sessionBean.sessionId))
            );
            window.localStorage.setItem(
                "tokenId",
                cryptoUtil.encryptData(JSON.stringify(queue.sessionBean.tokenId))
            );
            this.digiQueueService.setOpenTokCredential(queue.sessionBean.apiKey, queue.sessionBean.sessionId, queue.sessionBean.tokenId);
            this.localStorage.saveComponentData(queue);
            console.log("hioiii 3333");
            this.videoCardService.subscribeToVideoStatus(this.digiQueueService.queue.sessionBean, VideoStatus.USER_TYPE_PATIENT);
            queue.sessionBean.bookingPocId = queue.bookingPocId;
            this.notificationsService.notifyDoctorCallForward(queue.sessionBean);
            this.digiQueueService.isNetworkQualityTested = true;
            this.router.navigate(['./app/reception/digiqueue/video']);
        }
    }

    async onPayNowClick(queue: PatientQueue) {
        window.scroll(0, 0);
        let basketRequest: BasketRequest = await this.pharmacyService.getOrderDetails(queue.orderId, queue.invoiceId);
        if (basketRequest && basketRequest.statusCode == 500) {
            alert(basketRequest.statusMessage);
        } else {
            this.digiQueueService.basketRequest = basketRequest;
            this.diagnosticService.isNotReloaded = true;
            this.router.navigate(['./app/reception/digiqueue/invoice'])
        }
    }

    onImageClicked(queue: PatientQueue) {
        this.authService.openPDF(queue.advisePdfUrlWithHeader);
    }
    onRecieptClicked(queue: PatientQueue) {
        if (this.pdfHeaderType == 0) {
            this.authService.openPDF(queue.pdfUrlWithHeader);
        }
        if (this.pdfHeaderType == 1) {
            this.authService.openPDF(queue.pdfUrlWithoutHeader);
        }
    }
}