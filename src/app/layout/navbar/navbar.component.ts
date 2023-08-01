import { Config } from './../../base/config';
import { Component, EventEmitter, OnInit, ElementRef, Input, Output, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AppConfig } from '../../app.config';

import { AuthService } from '../../auth/auth.service';
import { UserPermissions } from './../../model/auth/user-permissions';
import { CryptoUtil } from '../../auth/util/cryptoutil';

declare var jQuery: any;

@Component({
  selector: '[navbar]',
  templateUrl: './navbar.template.html',
  styleUrls: ['./navbar.style.scss']
})
export class Navbar implements OnInit {
  @Output() toggleSidebarEvent: EventEmitter<any> = new EventEmitter();
  @Output() navClickEvent: EventEmitter<any> = new EventEmitter();
  $el: any;
  config: any;
  router: Router;
  location: Location;
  userPermissions: UserPermissions[];
  userPermissionsDefaultVisibileList: UserPermissions[];
  userPermissionsOverflowList: UserPermissions[];
  //@Input('isMouseOut')
  isMoreClicked: boolean = false;
  isMore: boolean = false;
  noOfUserPermissions: number = 7;

  tempUserPermission: UserPermissions;

  cryptoUtil: CryptoUtil = new CryptoUtil()

  constructor(el: ElementRef, config: AppConfig, router: Router, location: Location,
    private authService: AuthService) {
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
    this.router = router;
    this.location = location;
    this.userPermissions = authService.userNavArray;
    this.userPermissionsDefaultVisibileList = this.userPermissions.slice(0, 2);
    this.userPermissionsOverflowList = this.userPermissions.slice(2, this.userPermissions.length);

    if (this.userPermissions.length > this.noOfUserPermissions) {
      this.isMore = true;
    }
  }

  ngOnInit(): void {
    this.$el.find('.input-group-addon + .form-control').on('blur focus', (e): void => {
      jQuery(this).parents('.input-group')[e.type === 'focus' ? 'addClass' : 'removeClass']('focus');
    });

    var $nav = $('.greedy-nav');
    var $btn = $('.greedy-nav button');
    var $vlinks = $('.greedy-nav .visible-links');
    var $hlinks = $('.greedy-nav .hidden-links');

    var breaks = [];

    function updateNav() {

      var availableSpace = $btn.hasClass('hidden') ? $nav.width() : $nav.width() - $btn.width() - 30;

      // The visible list is overflowing the nav
      if ($vlinks.width() > availableSpace) {

        // Record the width of the list
        breaks.push($vlinks.width());

        // Move item to the hidden list
        $vlinks.children().last().prependTo($hlinks);

        // Show the dropdown btn
        if ($btn.hasClass('hidden')) {
          $btn.removeClass('hidden');
        }

        // The visible list is not overflowing
      } else {

        // There is space for another item in the nav
        if (availableSpace > breaks[breaks.length - 1]) {

          // Move the item to the visible list
          $hlinks.children().first().appendTo($vlinks);
          breaks.pop();
        }

        // Recur if the visible list is still overflowing the nav
        // if($vlinks.width() > availableSpace) {
        //   updateNav();
        // }
        // Hide the dropdown btn if hidden list is empty
        if (breaks.length < 1) {
          $btn.addClass('hidden');
          $hlinks.addClass('hidden');
        }
      }

      // Recur if the visible list is still overflowing the nav
      if ($vlinks.width() > availableSpace) {
        updateNav();
      }

      if (!$btn.hasClass('hidden')) {
        $vlinks.css({ "padding-right": "55px" })
      }
      else {
        $vlinks.css({ "padding-right": "00px" })
      }

    }

    // Window listeners

    window.onload = updateNav;

    $(window).resize(updateNav);
    $('#content-wrap').click(function (e) {
      if (!($('.hidden-links.topnav').hasClass('hidden'))) {
        $hlinks.toggleClass('hidden');
      }
      if ($("ul.mobilenav").hasClass('activemenu')) {
        $("ul.mobilenav").removeClass('activemenu');
      }
    });

    $btn.on('click', function () {
      $hlinks.toggleClass('hidden');
    });
    setTimeout(() =>
      updateNav(), 100);

    /* Mobile menu */
    $("button.mobile-menu").click(function () {
      $(".mobilenav").toggleClass("activemenu");
      if ($("#bs-example-navbar-collapse-2").hasClass("active-sidebar")) {
        $("#bs-example-navbar-collapse-2").removeClass("active-sidebar");
      }
    })
  }

  moreClickChange(event) {
    if (event.type == 'mouseover') {
      this.isMoreClicked = true;
    } else if (event.type == 'click') {
      this.isMoreClicked = true;
    } else if (event.type == 'mouseleave') {
      this.isMoreClicked = false;
    }
  }

  toggleSidebar(state): void {
    this.toggleSidebarEvent.emit(state);
  }

  navigate(userPermission) {
    console.log(userPermission);
    console.log(this.getPreventNavigation());
    this.tempUserPermission = userPermission;
    if (this.getPreventNavigation() == true) {
      (<any>$("#preventNavigationNav")).modal({
        show: true,
        escapeClose: false,
        clickClose: false,
        showClose: false,
        backdrop: "static",
        keyboard: false
      });
      $(".modal-backdrop").remove();//to be removed
    } else {
      this.sendRole(userPermission);
    }
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

  sendRole(userPermission: UserPermissions): void {
    if (!$('.greedy-nav .hidden-links').hasClass('hidden')) {
      $('.greedy-nav .hidden-links').addClass('hidden');
    }
    if ($("ul.mobilenav").hasClass('activemenu')) {
      $("ul.mobilenav").removeClass('activemenu');
    }
    if (userPermission.path) {
      this.router.navigate(['./app/' + userPermission.path]);
    }
    if (userPermission != undefined && userPermission != null) {
      localStorage.setItem('pocChanged', 'false');
      this.navClickEvent.emit(userPermission);
    }
    // let i = this.userPermissions.indexOf(userPermission);
    // if(i>=this.noOfUserPermissions){
    // this.userPermissions.splice(i, 1);
    // this.userPermissions.splice(this.noOfUserPermissions-1, 0, userPermission);
    // this.userPermissions.splice(0, 0, userPermission);
    // window.localStorage.setItem('userPermissions', this.cryptoUtil.encryptData(JSON.stringify(this.userPermissions)));
    // }
  }
  isRouterLinkActive(path) {
    if (!path) return false;
    return (window.location.href + '').includes(('/app/' + path + ''));
  }

  sendDashboardRole(): void {
    let navFound: boolean = false;
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorDefaultDashboard && this.authService.userAuth.hasDoctorRole && this.userPermissions
      && this.userPermissions.length > 0) {
      let tmp = this.userPermissions.filter(item => item.label == 'Doctor');
      if (tmp && tmp.length > 0) {
        navFound = true;
        this.navigate(tmp[0]);
      }
    }
    if (!navFound) {
      let userPermissions: UserPermissions = new UserPermissions('Dashboard', 'dashboard', false, 0, 0, "", 0);
      this.navClickEvent.emit(userPermissions);
    }
  }

  SidebarMenuToggle() {
    if ($("#bs-example-navbar-collapse-2").hasClass("active-sidebar")) {
      $("#bs-example-navbar-collapse-2").removeClass("active-sidebar");
    } else {
      $("#bs-example-navbar-collapse-2").addClass("active-sidebar");
      if ($("ul.mobilenav").hasClass('activemenu')) {
        $("ul.mobilenav").removeClass('activemenu');
      }
    }
  }

  getAssertsLogoPath(): string {
    return Config.portal.iconspath;
  }

}
