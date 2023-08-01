import { DiagnosticsService } from './../../diagnostics/diagnostics.service';
import { Component, OnInit, ElementRef, Input, OnChanges, OnDestroy, Output, EventEmitter, AfterViewInit, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, UrlSegment } from '@angular/router';

import { Location } from '@angular/common';
import { AppConfig } from '../../app.config';

import { AuthService } from './../../auth/auth.service';
import { ReceptionService } from './../../reception/reception.service';

import { UserPermissions } from './../../model/auth/user-permissions';
import { Auth } from './../../model/auth/auth';
import { UpdatedPassword } from './../../login/model/updatepassword';

import { ServiceDetail } from './../../model/employee/servicedetail';
import { Doctor } from './../../model/employee/doctor';

import { CryptoUtil } from './../../auth/util/cryptoutil';

import { RoleConstants } from './../../constants/auth/roleconstants';
import { DoctorService } from '../../doctor/doctor.service';
import { PocDetail } from '../../model/poc/pocDetails';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { SpinnerService } from '../widget/spinner/spinner.service';
import { CommonUtil } from '../../base/util/common-util';
import { Config } from './../../base/config';

declare var jQuery: any;

@Component({
  selector: '[sidebar]',
  templateUrl: './sidebar.template.html',
  styleUrls: ['./sidebar.style.scss']
})

export class Sidebar implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Output() pocChangeEvent: EventEmitter<any> = new EventEmitter();
  // isPocUpdate: boolean;
  $el: any;
  config: any;
  router: Router;
  location: Location;
  condition: boolean = true;
  total: number = 0;
  user: Auth;
  userNavArray: UserPermissions[] = new Array<UserPermissions>();
  doctorList: Doctor[] = new Array<Doctor>();
  queueDoctorList: Doctor[] = new Array<Doctor>();
  prescriptionDoctorList: Doctor[] = new Array<Doctor>();
  serviceList: ServiceDetail[];
  wellnessServiceList: ServiceDetail[];
  parent: any;
  pocName: any;
  selectedPOC: any;
  creditLimit: number;

  tempUserPermission: any;

  isDiagnostic: boolean = false;
  hasAppointmentsRole: boolean = false;
  hasPrintPrescriptionRole: boolean = false;
  hasQueueRole: boolean = false;
  hasSuperAdminRole: boolean = false;

  @Input() updatedPassword: UpdatedPassword = new UpdatedPassword();
  @Input() confirmPassword: string;
  @Input() selectedRole: UserPermissions;
  @Input() selectedPOCId: number;
  changePasswordClicked: boolean = false;
  errorMessageChangePassword: Array<string>;
  isErrorChangePassword: boolean;
  showMessageChangePassword: boolean;
  isAssignedTasksVisible: boolean;
  isAssignedNotCompleteVisible: boolean;

  managePOCVisible: boolean = false;
  timer: any;
  selectedPoc: any;
  pocList = new Array<PocDetail>();
  pocRolesList: any;
  isCorporateAdmin: boolean;
  onboardUserDetailList: any;
  dataMsg: string = ' ';

  hideSidenavUserMetrics: boolean = false;
  pocCode: string;
  enableRequestQueue: boolean

  perPage: number = 10;
  columns: any[] = [
    {
      display: 'Name',
      variable: 'fName lName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Gender',
      variable: 'gender',
      filter: 'text',
      sort: false
    },
    {
      display: 'Age',
      variable: 'age',
      filter: 'text',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'contactInfo.mobile',
      filter: 'text',
      sort: false
    },
    {
      display: 'Email',
      variable: 'contactInfo.email',
      filter: 'text',
      sort: false
    },
    {
      display: 'App User?',
      filter: 'text',
      sort: false,
      variable: 'portal',
      conditions: [
        {
          value: 'true',
          condition: 'eq',
          label: 'Yes'
        },
        {
          condition: 'default',
          label: 'No'
        }
      ]
    }
  ];

  sorting: any = {
    descending: true
  };

  constructor(config: AppConfig, el: ElementRef, router: Router, location: Location, private authService: AuthService,
    private doctorService: DoctorService, private receptionService: ReceptionService,
    private diagnosticService: DiagnosticsService,    // private wellnessService: WellnessService,
    private activatedRoute: ActivatedRoute, private hsLocalStorage: HsLocalStorage, private onboardingService: OnboardingService,
    private spinnerService: SpinnerService, private commonUtil: CommonUtil) {
    let poclist = window.localStorage.getItem('pocRolesList');
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (poclist)
      this.pocRolesList = JSON.parse(cryptoUtil.decryptData(poclist));
    let self = this;
    window.addEventListener("load", function () {
      //calculating number of tabs opened
      let noOfTabsOpened = localStorage.getItem('noOfTabsOpened') ? +cryptoUtil.decryptData(localStorage.getItem('noOfTabsOpened')) : 0;
      if (noOfTabsOpened != null && noOfTabsOpened != undefined && noOfTabsOpened >= 0) {
        noOfTabsOpened++;
        localStorage.setItem('noOfTabsOpened', cryptoUtil.encryptData('' + noOfTabsOpened))
      }
      else {
        localStorage.setItem('noOfTabsOpened', cryptoUtil.encryptData('1'));
        noOfTabsOpened = 1;
      }
      //checking employee has Doctor role
      //console.log("hasDoctorRole-->" + self.authService.userAuth.hasDoctorRole);
      if (self.authService.userAuth.hasDoctorRole == true) {
        //console.log("on load ");
        //console.log(noOfTabsOpened);
        //console.log((+noOfTabsOpened) > 0);
        let tempRFT = localStorage.getItem('refreshTime');
        let lastCloseTime = tempRFT ? +cryptoUtil.decryptData(tempRFT) : undefined;
        localStorage.removeItem('refreshTime');
        let nowTime = new Date().getTime();

        //console.log(nowTime);
        //console.log(lastCloseTime);
        //console.log((nowTime - lastCloseTime <= 30000));

        if (
          (+noOfTabsOpened) > 0 &&
          lastCloseTime != null &&
          lastCloseTime != undefined &&
          lastCloseTime != 0 &&
          (nowTime - lastCloseTime <= 60000)
        ) {
          //set doctor online/offline stored in local status if tab close time and open time difference is 30sec
          if (localStorage.getItem("doctorStatus") != undefined && localStorage.getItem("doctorStatus") != null) {
            let doctorStatus = JSON.parse(cryptoUtil.decryptData(localStorage.getItem("doctorStatus")));
            //console.log(doctorStatus);
            if (doctorStatus != null && doctorStatus != undefined && doctorStatus.doctorStatus != null && doctorStatus.doctorStatus != undefined) {
              //console.log(doctorStatus.doctorStatus);
              if (doctorStatus.doctorStatus != null && doctorStatus.doctorStatus != undefined) {
                //console.log(self.authService.employeeDetails.empId);
                //console.log(self.authService.selectedPOC.pocId);
                self.doctorService.updateDoctorStatus({
                  "doctorId": doctorStatus.doctorId,
                  "doctorStatus": (doctorStatus.doctorStatus != null && doctorStatus.doctorStatus != undefined) ? (doctorStatus.doctorStatus) : 0,
                  "pocId": doctorStatus.pocId
                }).then((data) => {
                  self.doctorService.isOnline = (doctorStatus.doctorStatus != null && doctorStatus.doctorStatus != undefined) ? (doctorStatus.doctorStatus) : 0;

                });
              }
            }
          }
          else {
            self.doctorService.getDoctorStatus(self.authService.employeeDetails.empId).then((data) => {
              self.doctorService.isOnline = (data.availableStatus) ? data.availableStatus : 0;
              localStorage.setItem("doctorStatus", cryptoUtil.encryptData(
                JSON.stringify({
                  "doctorId": self.authService.employeeDetails.empId,
                  "doctorStatus": (data.availableStatus) ? data.availableStatus : 0,
                  "pocId": self.authService.selectedPOCMapping.pocId
                }
                )))
            })
          }
        }
        else if (
          lastCloseTime != null &&
          lastCloseTime != undefined &&
          noOfTabsOpened <= 1
        ) {
          //after 30 sec on load removing  localStorage
          //console.log("after 30 sec on load removing  localStorage");
          localStorage.removeItem("doctorStatus");
          self.logout();
        }

      }
      else {
        //console.log("does not have doctor role");
      }
    });
    window.addEventListener("beforeunload", function (event) {
      //console.log("hasDoctorRole-->" + self.authService.userAuth.hasDoctorRole);
      let pageOpenedData = localStorage.getItem('noOfTabsOpened');

      let noOfTabsOpened = pageOpenedData ? +cryptoUtil.decryptData(pageOpenedData) : 0;
      //console.log(noOfTabsOpened);
      //console.log(noOfTabsOpened > 0);
      if (noOfTabsOpened != null && noOfTabsOpened != undefined && noOfTabsOpened > 0) {
        noOfTabsOpened--;
        localStorage.setItem('noOfTabsOpened', cryptoUtil.encryptData('' + noOfTabsOpened))
      }
      else {
        noOfTabsOpened = 0;
        localStorage.setItem('noOfTabsOpened', cryptoUtil.encryptData('0'))
      }
      if (self.authService.userAuth.hasDoctorRole == true) {

        event.preventDefault();
        //console.log("beforeunload");
        //console.log(new Date().getTime());
        if (noOfTabsOpened == null || noOfTabsOpened == undefined || noOfTabsOpened <= 0) {
          localStorage.setItem('refreshTime', cryptoUtil.encryptData('' + new Date().getTime()));
          //console.log("self.authService.logoutService()");
          self.authService.logoutService().then((data) =>
            console.log(data)
          );
        }
        //console.log("end of beforeload")
      }
      else {
        //console.log("does not have doctor role");
      }
    });
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
    this.router = router;
    this.location = location;
    this.user = authService.userAuth;
    this.selectedPOC = authService.selectedPOCMapping;
    this.isCorporateAdmin = authService.isCorporateAdmin;
    this.hasSuperAdminRole = this.user.hasSuperAdminRole;
    if (this.selectedRole != undefined && this.selectedRole != null) {
      this.setToLocalStorage();
    } else {
      this.getFromLocalStore();
    }
    this.managePocSideMenuHandler(router);
    this.hideSidenavUserMetrics = Config.portal.customizations && Config.portal.customizations.hideSidenavUserMetrics;
    let showPocCode = Config.portal.customizations && Config.portal.customizations.showPocCode;
    if (showPocCode && authService.selectedPocDetails && authService.selectedPocDetails.pocCode) {
      this.pocCode = authService.selectedPocDetails.pocCode
    }
    if (Config.portal.customizations && Config.portal.customizations.enableRequestQueue) {
      this.enableRequestQueue = true

    }
  }
  ngAfterViewInit(): void {
    // this.managePocSideMenuHandler(this.router);
  }
  ngOnInit(): void {
    let cryptoUtil = new CryptoUtil();
    if (this.authService.employeePocMappingList) {
      this.pocRolesList = this.authService.employeePocMappingList;
      window.localStorage.setItem('pocRolesList', cryptoUtil.encryptData(JSON.stringify(this.pocRolesList)));
    }
    this.getPocList();
    jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
    this.initSidebarScroll();
    this.getFromLocalStore();
    let isPocChange = localStorage.getItem('pocChanged');
    if (isPocChange == 'true') {
      this.authService.userAuth.hasPrintPrescriptionRole = this.hasPrintPrescriptionRole = false;
      this.authService.userAuth.hasReceptionRole = this.hasAppointmentsRole = false;
      this.userNavArray = new Array<UserPermissions>();
    }
    $('#content-wrap').click(function (e) {
      if ($("#bs-example-navbar-collapse-2").hasClass("active-sidebar")) {
        $("#bs-example-navbar-collapse-2").removeClass("active-sidebar");
      }
    });
    $(document).ready(function () {
      $(document).on('click', '.panel-heading', function () {
        if ($(this).hasClass('activebg')) {
          $('.panel-heading').removeClass('activebg');
          $(this).addClass('normalbg');
        }
        else if ($('.panel-heading').hasClass('activebg')) {
          $('.panel-heading').removeClass('activebg');
          $(this).addClass('activebg');
        }
        else {
          $(this).addClass('activebg');
        }
      });

      $(document).on('click', '.sidebar-heading', function () {
        localStorage.setItem("activeSubMenu", $(this).text());
        if ($(this).hasClass('activebg')) {
          $('.sidebar-heading').removeClass('activebg');
          $(this).addClass('normalbg');
        }
        else if ($('.sidebar-heading').hasClass('activebg')) {
          $('.sidebar-heading').removeClass('activebg');
          $(this).addClass('activebg');
        }
        else {
          $(this).addClass('activebg');
        }

        if ($(this).parent().hasClass('keep-opensubmenu')) {
          $('.dropdown').removeClass('keep-opensubmenu');
          $(this).parent().addClass('hidesubmenu');
        }
        else if ($('.dropdown').hasClass('keep-opensubmenu')) {
          $('.dropdown').removeClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
          $(this).parent().addClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
        }
        else {
          $(this).parent().removeClass('hidesubmenu');
          $(this).parent().addClass('keep-opensubmenu');
          $(this).parent().removeClass('hidesubmenu');
        }
      });

      if ($(".dropdown").hasClass("keep-opensubmenu")) {
        $('.sidebar-heading').addClass('activebg');
      }

      $('ul.keep-open').click(function (e) {
        $(this).parent(".dropdown").addClass("keep-opensubmenu");
      });

      var activeItem = localStorage.getItem("activeSubMenu") ? localStorage.getItem("activeSubMenu") : null;
      if (activeItem) {
        $('.sidebar-heading').filter(function () {
          return $(this).text() == activeItem;
        }).addClass("activebg").parent().addClass("keep-opensubmenu");
      }

      // $(document).on('click', '.sidebar-navtoggle', function () {
      //   if ($(this).parent().hasClass('active_sidebartxt')) {
      //     $(this).parent().removeClass('active_sidebartxt');
      //   }
      //   else {
      //     $(this).parent().addClass('active_sidebartxt')
      //   }
      // });

      // $('body').on("click", function () {
      //   $(".txt_sidebar").removeClass('active_sidebartxt');
      // })

      $(".custom-selectbox").each(function () {
        $(this).after("<span class='holder'></span>");
      });
      $(".custom-selectbox").change(function () {
        var selectedOption = $(this).find(":selected").text();
        $(this).next(".holder").text(selectedOption);
      }).trigger('change');

      $(".holder").css({ "width": "180px", "display": "block" });



      // if ($("#bs-example-navbar-collapse-2").hasClass('active-sidebar')) {
      //   alert("fbg");
      //   $(this).removeClass('active-sidebar');
      // }
      // else {
      //   $("#bs-example-navbar-collapse-2").addClass('active-sidebar')
      // }

    });

    //creation of doctorStatus into local storage if not existing
    this.setDoctorStatusToStorage();
  }
  getPocList() {
    if (this.pocRolesList != null || this.pocRolesList != undefined) {
      for (let rolesList of this.pocRolesList) {
        let pocDetails = new PocDetail();
        pocDetails.pocId = rolesList.pocId;
        pocDetails.pocName = rolesList.pocName;
        this.pocList.push(pocDetails);
      }
    }
    this.selectedPoc = this.pocList[0];
    this.getRegistrationsCount();
  }
  getCreditLimit() {
    this.creditLimit = undefined;
    if (this.authService.selectedPocDetails && this.authService.selectedPocDetails.creditLimit > 0 && this.authService.selectedPocDetails.localDiagnosticPartner) {
      this.diagnosticService.getCreditLimit(this.authService.selectedPocDetails.pocId).then(response => {
        this.creditLimit = response.pocCreditLimit - response.pocCreditLimitUsed;
      });
    }
  }

  getOnboardUserInfo() {
    this.spinnerService.start();
    this.dataMsg = 'Loading...';
    this.onboardingService.getOnboardinguserdetails(this.selectedPOC.pocId, this.total, 50).then(response => {
      if (this.total > 0) {
        this.onboardUserDetailList.push.apply(this.onboardUserDetailList, response)
      }
      else {
        this.onboardUserDetailList = new Array<any>();
        this.onboardUserDetailList = response;
      }
      this.total = this.onboardUserDetailList.length;
      this.onboardUserDetailList.forEach(element => {
        element.age = element.dob ? this.commonUtil.getAgeForall(element.dob) : '';
      });
      this.spinnerService.stop();
    });
  }

  openModal(id: string) {
    (<any>$(id)).modal('show');
    $(".modal-backdrop").not(':first').remove();
  }

  toggleSidebar() {
    if ($("#bs-example-navbar-collapse-2").hasClass("active-sidebar")) {
      $("#bs-example-navbar-collapse-2").removeClass("active-sidebar");
    } else {
      $("#bs-example-navbar-collapse-2").addClass("active-sidebar");
      if ($("ul.mobilenav").hasClass('activemenu')) {
        $("ul.mobilenav").removeClass('activemenu');
      }
    }
  }
  async selectPoc(pocId?, pocPosition?) {
    // this.selectedPOC = this.pocList.filter(e => { return e.pocId == pocId });
    this.authService.userNavArray = this.userNavArray = new Array<UserPermissions>();
    this.authService.userAuth.hasPrintPrescriptionRole = this.hasPrintPrescriptionRole = false;
    this.authService.userAuth.hasReceptionRole = this.hasAppointmentsRole = false;
    pocPosition = this.pocList.findIndex(e => { return e.pocId == pocId });
    this.selectedPoc = this.pocList[pocPosition];
    this.authService.selectedPOCMapping = this.selectedPOC = this.selectedPoc;
    this.getRegistrationsCount();
    this.selectedRole = null;
    this.clearFromLocalStore();

    localStorage.setItem('pocChanged', 'true');
    this.authService.buildNavBasedOnPOC(pocPosition);
    this.gotoDashboard();
    // this.isPocUpdate = !this.isPocUpdate;
    this.pocChangeEvent.emit(true);
    //this.ngOnChanges(null);
  }

  private managePocSideMenuHandler(router: Router) {
    if (this.hasSuperAdminRole || this.user.hasPOCAdminRole) {
      router.events.subscribe((val) => {
        // This block of code is used for the super admin role to 
        // show the manage pocs nav option based on the trigger from the RHS pane
        // Here we are checking for the change in route, if the route has poc/manage, 
        // then this change will be triggered
        let triggerChange = this.managePOCVisible;
        if ((val instanceof NavigationEnd) && val != null && val.urlAfterRedirects != null && val.urlAfterRedirects.indexOf('/master/poc/manage') > 0) {
          this.managePOCVisible = true;
        } else if ((val instanceof NavigationEnd) && val != null && val.urlAfterRedirects != null && val.urlAfterRedirects.indexOf('/master/poc/list') > 0) {
          this.removeManagePocNav();
        } else {
          this.managePOCVisible = false;
        }
        if (this.managePOCVisible != triggerChange) {
          if (this.managePOCVisible) {
            // Show the manage POC option
            this.addManagePocNav();
          }
          else {
            // Hide the manage POC option
            // this.removeManagePocNav();
          }
        }
      });
    }
  }

  navigate(userPermission) {
    console.log(userPermission);
    console.log(this.getPreventNavigation());
    this.tempUserPermission = userPermission;
    if (!userPermission) return;
    if (this.getPreventNavigation() == true) {
      (<any>$("#preventNavigationSideBar")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      $(".modal-backdrop").remove();//to be removed
    } else {
      if (userPermission.label == "Reception Appointments") {
        this.passDoctorDetails(userPermission.doctor, userPermission.pocId);
        return;
      }
      this.navigateByUserPermission(userPermission);
    }
  }
  navigateByUserPermission(userPermission: UserPermissions) {
    this.router.navigate(['./app/' + userPermission.path]);
  }
  hideModal(id: string) {
    (<any>$(id)).modal('hide');
  }
  getPreventNavigation() {
    return this.authService.getPreventNavigation();
  }
  setPreventNavigation(preventNavigation) {
    this.authService.setPreventNavigation(preventNavigation);
  }
  isRouterLinkActive(path) {
    if (!path) return false;
    return (window.location.href + '').includes(('/app/' + path + ''));
  }


  public addManagePocNav(): void {
    // let index = this.userNavArray.length;
    let userNav = new UserPermissions('Manage POC', '/master/poc/manage', false, 1, 2, 'poclist', 2);
    userNav.subPermissions = new Array();
    userNav.subPermissions[0] = new UserPermissions('Doctor Favorite Roles', 'master/poc/manage/tagging', true, 1, 2, 'poclist', 1);
    userNav.subPermissions[1] = new UserPermissions('Followup Discounts', 'master/poc/manage/discount', true, 1, 2, 'poclist', 2);
    userNav.subPermissions[2] = new UserPermissions('Doctor Schedules', 'master/poc/manage/schedule', true, 1, 2, 'poclist', 3);
    if (this.authService.employeeDetails.empId == 1) {
      userNav.subPermissions[3] = new UserPermissions('Manage Payouts', 'master/poc/manage/payouts', true, 1, 2, 'poclist', 4);
    }
    // this.userNavArray.push(userNav);
    if (this.userNavArray.findIndex(e => { return e.path == '/master/poc/manage' }) < 0) {
      setTimeout(() => { this.userNavArray.push(userNav); }, 300);
    }
  }

  public removeManagePocNav(): void {
    if (this.userNavArray != null && this.userNavArray.length > 0) {
      let index = -1;
      index = this.userNavArray.findIndex(e => { return e.path == '/master/poc/manage' });
      if (index > 0) {
        this.userNavArray.splice(index, 1);
      }
    }
  }


  setDoctorStatusToStorage() {
    let cryptoUtil = new CryptoUtil();
    if (localStorage.getItem("doctorStatus") != undefined && localStorage.getItem("doctorStatus") != null) {
      let doctorStatus = JSON.parse(cryptoUtil.decryptData(localStorage.getItem("doctorStatus")));
      if (doctorStatus == null || doctorStatus == undefined ||
        doctorStatus.doctorStatus == null || doctorStatus.doctorStatus == undefined ||
        doctorStatus.doctorId == null || doctorStatus.doctorId == undefined ||
        doctorStatus.pocId == null || doctorStatus.pocId == undefined) {
        this.doctorService.getDoctorStatus(this.authService.employeeDetails.empId).then((data) => {
          localStorage.setItem("doctorStatus", cryptoUtil.encryptData(JSON.stringify({
            "doctorId": this.authService.employeeDetails.empId,
            "doctorStatus": (data.availableStatus) ? data.availableStatus : 0,
            "pocId": this.authService.selectedPOCMapping.pocId
          })));
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.selectedRole) {
      let userPermissionLists = this.authService.userNavArray;
      let userPerm = userPermissionLists.filter((e) => {
        console.log(e.path.split('/')[0] == this.router.url.split('/')[2]
          , e.path.split('/')[0] == this.router.url.split('/')[2] && e.path.split('/')[1] == this.router.url.split('/')[3]
          , e.path, this.router.url.split('/')[2])
        if (e.path.split('/').length == 1) {
          return e.path == this.router.url.split('/')[2];
        } else if (e.path.split('/').length == 2) {
          return e.path.split('/')[0] == this.router.url.split('/')[2]
            && e.path.split('/')[1] == this.router.url.split('/')[3];
        }
        return e.path == this.router.url.split('/')[2]
      });
      this.selectedRole = userPerm[0];
      try {
        let pocChanged = changes['selectedPOCId'];
        if (pocChanged.currentValue != pocChanged.previousValue)
          this.getCreditLimit();
      } catch (error) {
        console.log(error);
      }
      // console.log("xxpath", this.router.url.split('/')[2], JSON.stringify(userPerm));
    }

    if (this.selectedRole != undefined && this.selectedRole != null) {
      this.setToLocalStorage();
    } else {
      this.getFromLocalStore();
    }
    this.generateSideNav();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
  gotoDashboard() {
    this.router.navigate(['/app/dashboard']);
  }

  generateSideNav(): void {
    this.userNavArray = new Array<UserPermissions>();
    this.serviceList = null;
    this.wellnessServiceList = null;
    this.doctorList = null;
    this.prescriptionDoctorList = null;
    this.queueDoctorList = null;
    this.hasAppointmentsRole = false;
    this.hasQueueRole = false;
    this.hasPrintPrescriptionRole = false;
    if (this.selectedRole != undefined && this.selectedRole != null && this.selectedRole.label) {
      this.userNavArray = this.selectedRole.subPermissions;
      // Apply any other menu options applicable
      switch (this.selectedRole.label) {
        case 'Dashboard': {
          this.userNavArray = new Array<UserPermissions>();
          break;
        };
        case 'Reception': {
          this.hasAppointmentsRole = this.authService.userAuth.hasReceptionRole;
          this.hasPrintPrescriptionRole = this.authService.userAuth.hasPrintPrescriptionRole;
          this.hasQueueRole = this.authService.userAuth.hasQueueRole;

          if (this.hasAppointmentsRole) {
            this.getListOfDoctorsforReception();
          }

          // if (this.hasPrintPrescriptionRole) {
          //  this.getListOfPrescriptionDoctors();
          // }

          if (this.hasQueueRole) {
            this.getListOfQueueDoctors();
          }

          break;
        };
        /* case 'Diagnostics': {
          if (this.authService.userAuth.hasDiagnosticReceptionRole) {
            this.getListOfDiagnosticTests();
          }
          break;
        }; */
        /*  case 'Wellness': {
           if (this.authService.userAuth.hasWellnessRole) {
             this.getListOfWellnessServices();
           }
           break;
         }; */
      }
    }

  }

  initSidebarScroll(): void {
    let $sidebarContent = this.$el.find('.js-sidebar-content');
    if (this.$el.find('.slimScrollDiv').length !== 0) {
      $sidebarContent.slimscroll({
        destroy: true
      });
    }
    $sidebarContent.slimscroll({
      height: window.innerHeight,
      size: '4px'
    });
  }

  getListOfDoctorsforReception(): void {
    this.receptionService.getDoctorList(this.user.pocId, this.user.employeeId, RoleConstants.receptionRoleId).then((doctor) => {
      this.doctorList = new Array<Doctor>();
      doctor.forEach(element => {
        if (element.employeePocMappingList != null && element.employeePocMappingList.length > 0) {
          element.employeePocMappingList.forEach(element1 => {
            if (element1 != null && element1.pocId > 0 && element1.pocId == this.user.pocId) {
              element1.serviceList.forEach(element2 => {
                if (element2 != null && element2.serviceId > 0) {
                  let doctorTemp: Doctor = Object.create(element);
                  doctorTemp.serviceId = element2.serviceId;
                  doctorTemp.serviceName = element2.serviceName;
                  doctorTemp.consultationFee = element2.walkinConsultationFee;
                  doctorTemp.myPoc = element1;
                  this.doctorList.push(doctorTemp);
                }
              });
            }
          });
        }
      });
    });
  }

  // getListOfPrescriptionDoctors(): void {
  //   this.receptionService.getDoctorList(this.user.pocId, this.user.employeeId, RoleConstants.printPrescriptionRoleId).then((doctor) => {
  //     this.prescriptionDoctorList = new Array<Doctor>();
  //     doctor.forEach(element => {
  //       let doctorTemp: Doctor = Object.create(element);
  //       this.prescriptionDoctorList.push(doctorTemp);
  //     });
  //   });
  // }

  clickEventHandler(event) {

  }

  getListOfQueueDoctors(): void {
    this.receptionService.getDoctorList(this.user.pocId, this.user.employeeId, RoleConstants.receptionRoleId).then((doctor) => {
      this.queueDoctorList = new Array<Doctor>();
      doctor.forEach(element => {
        let doctorTemp: Doctor = Object.create(element);
        this.queueDoctorList.push(doctorTemp);
      });
    });
  }

  passDoctorDetails(doctor: Doctor, pocId, path?) {
    if (this.getPreventNavigation() == false) {
      this.receptionService.passDoctorDetails(doctor, pocId);
      if (path) {
        this.router.navigate(['./app/' + path]);
      } else {
        this.router.navigate(['/app/reception/booking', doctor.empId, pocId]);
      }

    } else {
      this.navigate({
        'label': 'Reception Appointments',
        'path': path ? path : 'reception/booking',
        'doctor': doctor,
        'pocId': pocId
      })
    }
  }

  setToLocalStorage(): void {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('selectedRole', cryptoUtil.encryptData(JSON.stringify(this.selectedRole)));
    this.authService.setSelectedRole(this.selectedRole);
  }

  getFromLocalStore(): void {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('selectedRole') != null && window.localStorage.getItem('selectedRole').length > 0) {
      this.selectedRole = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedRole')));
      this.authService.setSelectedRole(this.selectedRole);
      this.generateSideNav();
    }
  }

  clearFromLocalStore(): void {
    window.localStorage.removeItem('selectedRole');
  }

  logout(): void {
    let res = this.authService.logoutService();
    this.receptionService.selectedDoctor = new Doctor();
    let changeIp = localStorage.getItem('qaChangeIP');
    //console.log(res);
    this.authService.logout()
      .then(resp => {
        if (resp == true) {
          // window.location.replace('/#/login');
          window.location.reload();
        }
        localStorage.setItem('qaChangeIP', changeIp);
      });
  }

  changePassword(): void {
    this.changePasswordClicked = true;
    this.errorMessageChangePassword = new Array<string>();
    this.isErrorChangePassword = false;
    this.showMessageChangePassword = false;
    if (this.updatedPassword.oldPassword == null) {
      this.errorMessageChangePassword = new Array<string>();
      this.errorMessageChangePassword[0] = 'Please enter your current password';
      this.isErrorChangePassword = true;
      this.showMessageChangePassword = true;
      this.changePasswordClicked = false;
      return;
    }
    if (this.updatedPassword.newPassword == null || this.updatedPassword.newPassword != this.confirmPassword) {
      this.errorMessageChangePassword = new Array<string>();
      this.errorMessageChangePassword[0] = 'Your new passwords do not match';
      this.isErrorChangePassword = true;
      this.showMessageChangePassword = true;
      this.changePasswordClicked = false;
      return;
    }
    if (this.updatedPassword.oldPassword == this.updatedPassword.newPassword || this.updatedPassword.oldPassword == this.confirmPassword) {
      this.errorMessageChangePassword = new Array<string>();
      this.errorMessageChangePassword[0] = 'New password should be different from old passwrod';
      this.isErrorChangePassword = true;
      this.showMessageChangePassword = true;
      this.changePasswordClicked = false;
      return;
    }

    if (Config && Config.portal && Config.portal.customizations && Config.portal.customizations.enableStrongPassword) {
      if (this.updatedPassword.newPassword == null || this.updatedPassword.newPassword.length < 8 || this.updatedPassword.newPassword.length > 16) {
        this.errorMessageChangePassword = new Array<string>();
        this.errorMessageChangePassword[0] = 'Password lenght should be between 8 and 16 characters';
        this.isErrorChangePassword = true;
        this.showMessageChangePassword = true;
        this.changePasswordClicked = false;
        return;
      }

      if (this.updatedPassword.newPassword) {
        let re = /^(?=.*[0-9])(?=.*[- ?!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9- ?!@#$%^&*]{8,16}$/;
        if (!re.test(this.updatedPassword.newPassword)) {
          this.errorMessageChangePassword = new Array<string>();
          this.errorMessageChangePassword[0] = 'password must contain 1 digit, 1 special character and both alphabet cases';
          this.isErrorChangePassword = true;
          this.showMessageChangePassword = true;
          this.changePasswordClicked = false;
          return;
        }
        if (this.authService.userAuth.employeeName.toLowerCase().includes(this.updatedPassword.newPassword.toLowerCase())) {
          this.errorMessageChangePassword = new Array<string>();
          this.errorMessageChangePassword[0] = 'password cannot contain user name';
          this.isErrorChangePassword = true;
          this.showMessageChangePassword = true;
          this.changePasswordClicked = false;
          return;
        }
      }
    } else {
      if (this.updatedPassword.newPassword == null || this.updatedPassword.newPassword.length <= 5) {
        this.errorMessageChangePassword = new Array<string>();
        this.errorMessageChangePassword[0] = 'Your new passwords sholud be more than 6 characters ';
        this.isErrorChangePassword = true;
        this.showMessageChangePassword = true;
        this.changePasswordClicked = false;
        return;
      }
    }

    this.authService.changePassword(this.updatedPassword)
      .then(resp => {
        //console.log('The response is' + resp);
        if (resp == true) {
          this.errorMessageChangePassword = new Array<string>();
          this.errorMessageChangePassword[0] = 'Your password is changed successfully';
          this.isErrorChangePassword = false;
          this.showMessageChangePassword = true;
          this.timer = setTimeout(() => {
            this.errorMessageChangePassword = new Array<string>();
            this.isErrorChangePassword = false;
            this.showMessageChangePassword = false;
            this.updatedPassword = new UpdatedPassword();
            this.confirmPassword = null;
            this.changePasswordClicked = false;
            (<any>$('#dashboardChangePassword')).modal('hide');
          }, 4000);
        } else {
          this.errorMessageChangePassword = new Array<string>();
          this.errorMessageChangePassword[0] = 'Please enter valid password and retry!';
          this.isErrorChangePassword = true;
          this.showMessageChangePassword = true;
          this.changePasswordClicked = false;
        }
      }).catch(error => {
        this.errorMessageChangePassword = new Array<string>();
        this.errorMessageChangePassword[0] = error.errorMessage;
        this.isErrorChangePassword = true;
        this.showMessageChangePassword = true;
        this.changePasswordClicked = false;
      });;
  }

  reset() {
    this.errorMessageChangePassword = null;
  }
  getRegistrationsCount() {
    if (!this.selectedPOC || this.hideSidenavUserMetrics) {
      return;
    }
    this.selectedPOC.registrationCount = 0;
    this.selectedPOC.onboardingCount = 0;
    this.selectedPOC.appUserCount = 0;
    this.receptionService.getRegistrationsCount(this.selectedPOC.pocId).then((regis) => {
      if (regis && (regis.registrationCount)) {
        this.selectedPOC.registrationCount = regis.registrationCount;
      }
      if (regis && (regis.onboardingCount)) {
        this.selectedPOC.onboardingCount = regis.onboardingCount;
      }
      if (regis && (regis.appUserCount)) {
        this.selectedPOC.appUserCount = regis.appUserCount;
      }
    })
  }
  getNoOfRegistrationsCountLabel() {
    // let url=window.location.href + '';
    // if(url.indexOf('onboarding')>0){
    //   return 'Total no. of registrations: ';
    // }else{
    //   return 'Total no. of registrations: ';
    // }
    return 'My Users: '
  }

  getNoOfRegistrationsCount() {
    // let url=window.location.href + '';
    // if(url.indexOf('onboarding')>0){
    //   return this.selectedPOC.onboardingCount;
    // }else{
    //   return this.selectedPOC.registrationCount;
    // }
    if (!this.selectedPOC) {
      return 0;
    }
    return this.selectedPOC.onboardingCount;
  }

  getNoOfAppUserCountLabel() {
    return 'App Users: '
  }

  getNoOfAppUserCount() {
    if (!this.selectedPOC) {
      return 0;
    }
    return this.selectedPOC.appUserCount;
  }

  onPage(page: number) {
    this.total = this.total + 1;
    this.getOnboardUserInfo();
  }

}
