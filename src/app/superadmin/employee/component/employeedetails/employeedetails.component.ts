import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { EmployeeService } from '../../employee.service';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { HealthPackage } from "../../../../model/package/healthPackage";
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { BaseResponse } from '../../../../model/base/baseresponse';



@Component({
  selector: 'employeedetails',
  templateUrl: './employeedetails.template.html',
  styleUrls: ['./employeedetails.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class EmployeeDetailsComponent implements OnInit {

  employeedetails: DoctorDetails;
  serviceList: any;
  pocId: number;
  pocName: string;
  pocDetails: PocDetail;
  packageList: HealthPackage[] = new Array<HealthPackage>();
  list: Array<string>;
  roleList: any;
  packages: Array<number> = new Array();
  pocList: any;
  isPackage: boolean = false;
  roleIdList: Array<number> = new Array();
  roleIdName: Array<string> = new Array();
  roleAllName: Array<any> = new Array();

  isRole: boolean = false;
  docPac: any;

  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService, private employeeService: EmployeeService, private localStore: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    if (employeeService.isEmployeeModify == undefined) {
      employeeService.getDetails();
    } else {
      employeeService.setDetail();
    }
  }

  ngOnInit() {
    this.fetchEmployeeDetails();
    this.employeedetails.employeePocMappingList.forEach(e => {
      if (e.pocId == this.employeedetails.empPersonalPocInfo.pocId) {
        this.employeedetails.defaultMargin = e.margin;
      }
    });
    this.serviceList = this.employeedetails.serviceList;
    if (this.employeedetails.employeePocMappingList != undefined) {
      this.pocList = this.employeedetails.employeePocMappingList;
      this.superAdminService.getAllRoles(this.auth.userAuth.hasSuperAdminRole, this.auth.userAuth.pocId).then((data) => {
        this.roleList = data;
        this.pocList.forEach(ele => {
          ele.roleIdName = new Array();
          this.roleList.forEach(role => {
            if (ele.roleIdList.includes(role.roleId)) {
              ele.roleIdName.push(role.roleName);
            }
          });
        });
        this.roleAllName.push(this.roleIdName);
      })
    }
    else {
      this.isRole = false;
    }
    $('.modal').on('hidden.bs.modal', (e) => {
      $("#selectbasic").prop('selectedIndex', 0);
      $(".custom_chk input[type='checkbox'] ").prop('checked', false);
    });
    this.getAllRoles();
  }

  fetchEmployeeDetails() {
    this.employeedetails = this.employeeService.doctorDetail;
    let empLoc = this.localStore.getDataEncrypted('employeedetails');
    if (this.employeedetails) {
      this.localStore.setDataEncrypted('employeedetails', this.employeedetails);
    } else if (empLoc) {
      this.employeeService.doctorDetail = this.employeedetails = empLoc;
    }
  }

  getallpackages(): void {
    this.superAdminService.getallpackages().then(response => {
      this.packageList = response;
    });
  }

  getAllRoles() {
    this.superAdminService.getAllRoles(this.auth.userAuth.hasSuperAdminRole, this.auth.userAuth.pocId).then((data) => {
      this.roleList = data;
    })
  }

  onEmployeePersonal(): void {
    // this.employeeService.employeeDetail = event
    this.employeeService.isEmployeeModify = true;
    // this.router.navigate(['/app/master/employee/employeepersonaldetails']);
    this.router.navigate(['/app/master/employee/employeeUpdation']);
  }

  updatePoc(event) {
    this.packages = new Array<number>();
    this.packageList = new Array<HealthPackage>();
    let selPoc: EmployeePocMapping;
    if (event > 0) {
      this.isPackage = true;
      selPoc = this.pocList[event - 1];
      this.pocId = selPoc.pocId;
      this.pocName = selPoc.pocName;
      this.employeeService.getdoctorpackages(this.employeedetails.empId).then(response => {
        let selPocPackDetail = response.filter(pocPackage => pocPackage.pocId == this.pocId);
        if (selPocPackDetail && selPocPackDetail[0]) {
          selPocPackDetail[0].doctorPackages.forEach(element => {
            this.packages.push(element.packageId);
          });
          if (this.pocName != undefined) {
            this.superAdminService.getallpackages().then((response: Array<any>) => {
              if (response && response.length > 0) {
                this.packageList = [...this.packageList, ...response.filter(pack => this.packages.includes(pack.packageId))];
              }
              // for (let i = 0; i < response.length; i++) {
              //   for (let j = 0; j < this.packages.length; j++) {
              //     if (response[i].packageId == this.packages[j]) {
              //       this.packageList.push(response[i]);
              //     }
              //   }
              // }             
            });
          }
        } else {
          this.packageList = new Array();
        }
      });
    } else {
      this.packageList = [];
      this.isPackage = false;
    }
  }

  toggleEmployeeBlacklisting() {
    this.spinnerService.start();
    console.log('Blacklisting the employee');
    if (this.employeedetails) {
      if (this.employeedetails.employeeBlacklisted) {
        this.employeeService.whitelistEmployee(this.employeedetails.empId).then((response: BaseResponse) => {
          if (response) {
            this.spinnerService.stop();
            this.employeedetails.employeeBlacklisted = false;
            this.employeeService.doctorDetail = this.employeedetails;
            this.localStore.setDataEncrypted('employeedetails', this.employeedetails);
          }
        });
      } else {
        this.employeeService.blacklistEmployee(this.employeedetails.empId).then((response: BaseResponse) => {
          if (response) {
            this.spinnerService.stop();
            this.employeedetails.employeeBlacklisted = true;
            this.employeeService.doctorDetail = this.employeedetails;
            this.localStore.setDataEncrypted('employeedetails', this.employeedetails);
          }
        });
      }
    }
  }

}
