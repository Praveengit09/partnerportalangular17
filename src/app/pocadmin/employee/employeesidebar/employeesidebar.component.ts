import { Component, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../auth/auth.service";
import { Auth } from "../../../model/auth/auth";
import { PocDetail } from "../../../model/poc/pocDetails";
import { CryptoUtil } from "../../../auth/util/cryptoutil";

@Component({
  selector: 'employeesidebar',
  templateUrl: './employeesidebar.template.html',
  styleUrls: ['./employeesidebar.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmployeeSidebarComponent {
  user: Auth;
  pocList = new Array<PocDetail>();
  pocRolesList: any;
  selectedPoc: any;

  constructor(private authService: AuthService,) {

    this.user = authService.userAuth;
    console.log(this.user);
    let poclist = window.localStorage.getItem('pocRolesList');
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (poclist)
      this.pocRolesList = JSON.parse(cryptoUtil.decryptData(poclist));

  }

  ngOnInit() {
    let cryptoUtil = new CryptoUtil();
    this.getPocList();
    if (this.authService.employeePocMappingList) {
      this.pocRolesList = this.authService.employeePocMappingList;
      window.localStorage.setItem('pocRolesList', cryptoUtil.encryptData(JSON.stringify(this.pocRolesList)));
    }
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
    // this.getRegistrationsCount();
  }

}