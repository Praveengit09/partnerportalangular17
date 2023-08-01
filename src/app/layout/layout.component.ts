import { DigiQueueService } from "./../reception/digiqueue/digiqueue.service";
import { CryptoUtil } from "./../auth/util/cryptoutil";
import {
  Component,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  NgZone,
  OnDestroy,
  OnInit
} from "@angular/core";

import { Router, NavigationEnd } from "@angular/router";
import { AppConfig } from "./../app.config";
import { Sidebar } from "./sidebar/sidebar.component";

import { AuthService } from "./../auth/auth.service";
import { UserPermissions } from "./../model/auth/user-permissions";
import { DoctorService } from "../doctor/doctor.service";

//imports for FCM Notifications
import * as firebase from "firebase";
import { PatientQueue } from "../model/reception/patientQueue";
import { PatientMedicalAdvise } from "../model/advice/patientMedicalAdvise";
import { Config } from '../base/config';
import { DoctorUtil } from '../base/util/doctor-util';
import { VideoCardService } from '../doctor/prescription/videocard/videocard.service';
import { ToasterService } from './toaster/toaster.service';

declare var jQuery: any;
declare var Hammer: any;

@Component({
  selector: "layout",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./layout.template.html",
  host: {
    "[class.nav-static]": 'config.state["nav-static"]',
    "[class.chat-sidebar-opened]": "chatOpened",
    "[class.app]": "true",
    id: "app"
  }
})
export class Layout implements OnInit, OnDestroy {
  @ViewChild(Sidebar, { static: false }) sidebar: Sidebar;
  config: any;
  configFn: any;
  $sidebar: any;
  el: ElementRef;
  router: Router;
  chatOpened: boolean = false;
  selectedUserPermission: UserPermissions;
  messaging: any;
  token: string;
  notificationType: number;
  timer: any;
  isNavbarUpdated: boolean = true;

  constructor(
    config: AppConfig,
    el: ElementRef,
    router: Router,
    private doctorService: DoctorService,
    private digiQueueService: DigiQueueService,
    private videoCardService: VideoCardService,
    private authService: AuthService,
    private toast: ToasterService,
    private zone: NgZone
  ) {

    this.el = el;
    this.config = config.getConfig();
    this.configFn = config;
    this.router = router;

    console.log("this.authService.userAuth.hasDigiManagerRole==" + this.authService.userAuth.hasDigiManagerRole);
    console.log("this.authService.userAuth.hasDoctorRole==" + this.authService.userAuth.hasDoctorRole);
    if (this.authService.userAuth.hasDoctorRole == true ||
      this.authService.userAuth.hasDigiManagerRole == true) {
      //Notification Messaging
      this.messaging = firebase.messaging();
      this.notificationTokenRefresh();
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem("nav-static") === "true") {
      this.config.state["nav-static"] = true;
    }

    jQuery(".modal").appendTo("body");
    jQuery(".modal-open").appendTo("body");
    jQuery(".modal")
      .on("show", function () {
        jQuery("body").addClass("modal-open");
      })
      .on("hidden", function () {
        alert();
        jQuery("body").removeClass("modal-open");
      });
    $(window).scroll(function () {
      return false;
    });

    let $el = jQuery(this.el.nativeElement);
    this.$sidebar = $el.find("[sidebar]");

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.timer = setTimeout(() => {
          this.collapseNavIfSmallScreen();
          window.scrollTo(0, 0);

          $el.find('a[href="#"]').on("click", e => {
            e.preventDefault();
          });
        });
      }
    });

    this.$sidebar.on("mouseenter", this._sidebarMouseEnter.bind(this));
    this.$sidebar.on("mouseleave", this._sidebarMouseLeave.bind(this));

    this.checkNavigationState();

    this.$sidebar.on("click", () => {
      if (jQuery("layout").is(".nav-collapsed")) {
        this.expandNavigation();
      }
    });

    this.router.events.subscribe(() => {
      this.collapseNavIfSmallScreen();
      window.scrollTo(0, 0);
    });

    if ("ontouchstart" in window) {
      this.enableSwipeCollapsing();
    }

    this.$sidebar
      .find(".collapse")
      .on("show.bs.collapse", (e): void => {
        // execute only if we're actually the .collapse element initiated event
        // return for bubbled events
        if (e.target !== e.currentTarget) {
          return;
        }

        let $triggerLink = jQuery(this).prev("[data-toggle=collapse]");
        jQuery($triggerLink.data("parent"))
          .find(".collapse.in")
          .not(jQuery(this))
          .collapse("hide");
      })
      /* adding additional classes to navigation link li-parent
       for several purposes. see navigation styles */
      .on("show.bs.collapse", (e): void => {
        // execute only if we're actually the .collapse element initiated event
        // return for bubbled events
        if (e.target !== e.currentTarget) {
          return;
        }

        jQuery(this)
          .closest("li")
          .addClass("open");
      })
      .on("hide.bs.collapse", (e): void => {
        // execute only if we're actually the .collapse element initiated event
        // return for bubbled events
        if (e.target !== e.currentTarget) {
          return;
        }

        jQuery(this)
          .closest("li")
          .removeClass("open");
      });
    console.log("this.authService.userAuth.hasDigiManagerRole==" + this.authService.userAuth.hasDigiManagerRole);
    console.log("this.authService.userAuth.hasDoctorRole==" + this.authService.userAuth.hasDoctorRole);
    if (this.authService.userAuth.hasDoctorRole == true ||
      this.authService.userAuth.hasDigiManagerRole == true) {
      //Requesting Permission For Notification
      this.requestPermissionForNotication();
      //Overiding Default Message Notication For Notification
      this.onNotificationMessage();
    }
    this.isNavbarUpdated = true;
  }

  updateNavbar(value) {
    this.isNavbarUpdated = false;
    setTimeout(() => this.isNavbarUpdated = true, 10);
  }
  /**
   * This method is called to pass the data from the header to side nav on clicking the nav item on header
   */
  navClickListener(userPermission: UserPermissions): void {
    console.log("navClickListener: ", userPermission);
    this.selectedUserPermission = userPermission;
  }

  toggleSidebarListener(state): void {
    let toggleNavigation =
      state === "static"
        ? this.toggleNavigationState
        : this.toggleNavigationCollapseState;
    toggleNavigation.apply(this);
    localStorage.setItem("nav-static", this.config.state["nav-static"]);
  }

  toggleNavigationState(): void {
    this.config.state["nav-static"] = !this.config.state["nav-static"];
    if (!this.config.state["nav-static"]) {
      this.collapseNavigation();
    }
  }

  expandNavigation(): void {
    // this method only makes sense for non-static navigation state
    if (
      this.isNavigationStatic() &&
      (this.configFn.isScreen("lg") || this.configFn.isScreen("xl"))
    ) {
      return;
    }

    jQuery("layout").removeClass("nav-collapsed");
    this.$sidebar
      .find(".active .active")
      .closest(".collapse")
      .collapse("show")
      .siblings("[data-toggle=collapse]")
      .removeClass("collapsed");
  }

  collapseNavigation(): void {
    // this method only makes sense for non-static navigation state
    if (
      this.isNavigationStatic() &&
      (this.configFn.isScreen("lg") || this.configFn.isScreen("xl"))
    ) {
      return;
    }

    jQuery("layout").addClass("nav-collapsed");
    this.$sidebar
      .find(".collapse.in")
      .collapse("hide")
      .siblings("[data-toggle=collapse]")
      .addClass("collapsed");
  }

  /**
   * Check and set navigation collapse according to screen size and navigation state
   */
  checkNavigationState(): void {
    if (this.isNavigationStatic()) {
      if (
        this.configFn.isScreen("sm") ||
        this.configFn.isScreen("xs") ||
        this.configFn.isScreen("md")
      ) {
        this.collapseNavigation();
      }
    } else {
      if (this.configFn.isScreen("lg") || this.configFn.isScreen("xl")) {
        this.timer = setTimeout(() => {
          this.collapseNavigation();
        }, this.config.settings.navCollapseTimeout);
      } else {
        this.collapseNavigation();
      }
    }
  }

  isNavigationStatic(): boolean {
    return this.config.state["nav-static"] === true;
  }

  toggleNavigationCollapseState(): void {
    if (jQuery("layout").is(".nav-collapsed")) {
      this.expandNavigation();
    } else {
      this.collapseNavigation();
    }
  }

  _sidebarMouseEnter(): void {
    if (this.configFn.isScreen("lg") || this.configFn.isScreen("xl")) {
      this.expandNavigation();
    }
  }
  _sidebarMouseLeave(): void {
    if (this.configFn.isScreen("lg") || this.configFn.isScreen("xl")) {
      // this.collapseNavigation();
    }
  }

  enableSwipeCollapsing(): void {
    let swipe = new Hammer(document.getElementById("content-wrap"));
    let d = this;

    swipe.on("swipeleft", () => {
      this.timer = setTimeout(() => {
        if (d.configFn.isScreen("md")) {
          return;
        }

        if (!jQuery("layout").is(".nav-collapsed")) {
          d.collapseNavigation();
        }
      });
    });

    swipe.on("swiperight", () => {
      if (d.configFn.isScreen("md")) {
        return;
      }

      if (jQuery("layout").is(".chat-sidebar-opened")) {
        return;
      }

      if (jQuery("layout").is(".nav-collapsed")) {
        d.expandNavigation();
      }
    });
  }

  collapseNavIfSmallScreen(): void {
    if (
      this.configFn.isScreen("xs") ||
      this.configFn.isScreen("sm") ||
      this.configFn.isScreen("md")
    ) {
      this.collapseNavigation();
    }
  }

  notificationTokenRefresh() {
    const self = this;
    this.messaging.onTokenRefresh(() => {
      this.messaging
        .getToken()
        .then(function (refreshedToken) {
          console.log("Token refreshed==>" + refreshedToken);
          let EmptokenObject = {
            //deviceId: "3",
            deviceToken: refreshedToken,
            source: "3",
            //  profileId: "3",
            doctorId: self.authService.userAuth.employeeId
          };
          console.log(EmptokenObject);
        })

        .catch(function (err) {
          console.log("Unable to retrieve refreshed token ", err);
        });
    });
  }

  requestPermissionForNotication() {
    const self = this;
    this.messaging
      .requestPermission()
      .then(function () {
        console.log("Notification permission granted.");
        self.messaging
          .getToken()
          .then(function (currentToken) {
            if (currentToken) {
              self.token = currentToken;
              // Displays the current token data
              let EmptokenObject = {
                //deviceId: "3",
                deviceToken: currentToken,
                source: "3",
                //  profileId: "3",
                doctorId: self.authService.userAuth.employeeId
              };
              console.log(EmptokenObject);
              self.authService
                .updateNotificationToken(EmptokenObject)
                .then(data => {
                  if (data) {
                    console.log("token sent success");
                  } else console.log("token sent failure");
                });
            } else {
              // Show permission request.
              console.log(
                "No Instance ID token available. Request permission to generate one."
              );
            }
          })
          .catch(function (err) {
            console.log("An error occurred while retrieving token.", err);
          });
      })
      .catch(function (err) {
        console.log("Unable to get permission to notify. ", err);
      });
  }

  onNotificationMessage() {
    const self = this;
    this.messaging.onMessage(function (notificationMessage) {
      console.log("Message received. ");
      let message = JSON.parse(notificationMessage.data.default);
      console.log(message);
      if (
        message &&
        message.doctorId &&
        message.doctorId != self.authService.employeeDetails.empId &&
        message.bookingType &&
        message.bookingType == 3 &&
        message.bookingSubType &&
        message.bookingSubType == 1
      ) {
        // self.routeVideoTo="./app/reception/digiqueue/video/consult";
        self.notificationType = 1;
      } else {
        // self.routeVideoTo="./app/doctor/prescription";
        self.notificationType = 2;
      }
      if (self.notificationType == 2 || self.notificationType == 1)
        self.manageVideoNotification(message, self);
    });
  }

  manageVideoNotification(message: any, self: this) {
    let options = {
      body: message.message,
      icon: ((Config.portal.iconspath) || ("assets/icon/")) + 'android-icon-48x48.png'
    };
    let queue: PatientQueue = DoctorUtil.getQueueFromSessionBean(message);

    if ((self.doctorService.patientQueue) && (self.notificationType == 2) && (queue.invoiceId == self.doctorService.patientQueue.invoiceId)) {
      if (queue.sessionBean.sessionId != this.doctorService.SESSION_ID) {
        this.setVideoSessionData(message);
        if (self.notificationType == 2) {
          self.doctorService.setOpenTokCredential(
            message.apiKey,
            message.sessionId,
            message.tokenId
          );
        }

      }
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem(
        "patientQueue",
        cryptoUtil.encryptData(JSON.stringify(queue))
      );
    }
    // console.log(self.digiQueueService.queue);
    // console.log('notificationType'+self.notificationType);
    // console.log('queue.invoiceId'+queue.invoiceId);

    if ((self.digiQueueService.queue) && (self.notificationType == 1) && (queue.invoiceId == self.digiQueueService.queue.invoiceId)) {
      console.log('line 489');
      if (queue.sessionBean.sessionId != self.digiQueueService.SESSION_ID) {
        // self.digiQueueService.disconnect();
        console.log('line 492');
        this.setVideoSessionData(message);
        self.digiQueueService.setOpenTokCredential(
          message.apiKey,
          message.sessionId,
          message.tokenId
        );
        self.digiQueueService.queue = queue;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem(
          "component_data",
          cryptoUtil.encryptData(JSON.stringify(queue))
        );
        console.log('line 492');
        self.routeToPrescription();
        console.log('line 492');
      }

      console.log('line 492');
    }
    let notification = new Notification(message.message, options);
    console.log('line 492');
    notification.onclick = function (event) {
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      //  window.open("http://localhost:3000/#/app/doctor", "_blank");
      if (
        message != undefined &&
        message != null &&
        message.apiKey != undefined &&
        message.apiKey != null &&
        message.sessionId != undefined &&
        message.sessionId != null
      ) {
        self.setVideoSessionData(message);
        if (self.notificationType == 2) {
          self.doctorService.patientQueue = queue;
          self.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
          self.doctorService.setOpenTokCredential(
            message.apiKey,
            message.sessionId,
            message.tokenId
          );
        }
        else if (self.notificationType == 1) {
          self.digiQueueService.setOpenTokCredential(
            message.apiKey,
            message.sessionId,
            message.tokenId
          );
          self.digiQueueService.queue = queue;
        }
        window.localStorage.removeItem("patientQueue");
        window.localStorage.removeItem("patientMedicalAdvise");
        window.localStorage.removeItem("component_data");

        let cryptoUtil: CryptoUtil = new CryptoUtil();

        window.localStorage.setItem(
          "component_data",
          cryptoUtil.encryptData(JSON.stringify(queue))
        );
        window.localStorage.setItem(
          "patientQueue",
          cryptoUtil.encryptData(JSON.stringify(queue))
        );
        self.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
        // self.digiQueueService.isNetworkQualityTested = false;
        self.routeToPrescription();
      }
    };
  }


  setVideoSessionData(message: any) {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem("apiKey", cryptoUtil.encryptData(JSON.stringify(message.apiKey)));
    window.localStorage.setItem("sessionId", cryptoUtil.encryptData(JSON.stringify(message.sessionId)));
    window.localStorage.setItem("tokenId", cryptoUtil.encryptData(JSON.stringify(message.tokenId)));
  }

  routeToPrescription() {
    let self = this;
    (<any>$('.modal')).modal("hide");
    this.doctorService.isVideoQuestionShow = false;
    this.doctorService.isPrescriptionGenerated = false;
    this.doctorService.isFrom = "";
    if (this.notificationType == 1) {
      this.videoCardService.subscribeToVideoStatus(this.digiQueueService.queue.sessionBean, 1);
      this.zone.run(() =>
        this.router.navigate(["./app/reception/digiqueue/video/consult/" + self.digiQueueService.SESSION_ID])
      );
    }
    else if (this.notificationType == 2) {
      this.videoCardService.subscribeToVideoStatus(this.doctorService.patientQueue.sessionBean, 0);
      this.zone.run(() => this.router.navigate(["./app/doctor/"]));
      this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();
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
          }
          this.doctorService.isVideo = true;
          // let baseurl = window.location.href.split('/#/')[0]+'/#/';
          //  window.open(baseurl+'app/doctor/prescription','hsDoctorPrescription',"menubar=no,location=no,resizable=no,scrollbars=no,status=no",true);
          this.zone.run(() => this.router.navigate(["./app/doctor/prescription"]));
        }
      });

    }

  }

  getSelectedPOCId() {
    if (this.authService.selectedPocDetails)
      return this.authService.selectedPocDetails.pocId;
    else return -1;
  }
  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
