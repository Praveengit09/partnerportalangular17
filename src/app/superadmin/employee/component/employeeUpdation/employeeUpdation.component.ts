import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { Component, ViewEncapsulation, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { EmployeeService } from '../../employee.service';
import { AuthService } from '../../../../auth/auth.service';

export const changePageType = {

};
@Component({
  selector: 'employeeUpdation',
  templateUrl: './employeeUpdation.template.html',
  styleUrls: ['./employeeUpdation.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeUpdation implements OnInit, OnChanges, OnDestroy {

  pageNo: number = 0;
  isModify: boolean;

  cryptoUtil: CryptoUtil = new CryptoUtil();
  data = {
    doctorDetail: this.empServe.doctorDetail,
    pageNo: this.pageNo,
    isEmployeeModify: this.empServe.isEmployeeModify,
  };
  tabData = [];
  lastEditedPage: number = 0;
  pageChangeCall: boolean = false;
  errorMessage: any[] = new Array();
  @Input() doctorDetails: DoctorDetails = this.empServe.doctorDetail;


  constructor(private empServe: EmployeeService, private auth: AuthService) {
    this.doctorDetails = empServe.doctorDetail;
    this.isModify = empServe.isEmployeeModify;
  }

  ngOnInit() {
    this.checkLocalStorage();
    this.updateTabData();
    this.auth.setPreventNavigation(true);
  }

  ngOnDestroy() {
    this.auth.setPreventNavigation(false);
  }

  checkLocalStorage() {
    if (this.doctorDetails.firstName) {
      if (this.empServe.pageNo != 0)
        this.pageNo = this.empServe.pageNo;
      else
        this.pageNo = 0;
      this.data.pageNo = this.pageNo;
      localStorage.setItem('employeeUpdateDetails', this.cryptoUtil.encryptData(JSON.stringify(this.data)));
    } else {
      let xtemp = this.cryptoUtil.decryptData(localStorage.getItem('employeeUpdateDetails'));
      if (xtemp) {
        this.data = JSON.parse(xtemp);
        this.empServe.doctorDetail = this.doctorDetails = this.data.doctorDetail;
        this.empServe.pageNo = this.pageNo = this.data.pageNo;
        this.empServe.isEmployeeModify = this.isModify = this.data.isEmployeeModify;
      }
      else this.empServe.pageNo = this.pageNo = 0;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.doctorDetails = this.empServe.doctorDetail;
  }

  checkValidation(pageNo): boolean {
    let isError = false;
    let val: any;
    this.empServe.errMasg = new Array();

    switch (pageNo) {
      case 0: {
        isError = false;
        break;
      }
      case 1: {
        val = this.empServe.getValidatePersionalDetail(this.empServe.doctorDetail);
        isError = val.isError;
        val.isError ? this.lastEditedPage = 0 : '';
        break;
      }
      case 2: {
        let val1 = this.empServe.getValidatePersionalDetail(this.empServe.doctorDetail);
        let val2 = this.empServe.getValidateProffesionalDetail(this.empServe.doctorDetail);
        if (val1.isError) {
          val = val1;
          val1.isError ? this.lastEditedPage = 0 : '';
          isError = val.isError;
        } else if (val2.isError && (this.doctorDetails.type == 0 || this.doctorDetails.type == 1)) {
          val = val2;
          val2.isError ? this.lastEditedPage = 1 : '';
          isError = val.isError;
        }
        break;
      }
      case 3: {
        let val1 = this.empServe.getValidatePersionalDetail(this.empServe.doctorDetail);
        let val2 = this.empServe.getValidateProffesionalDetail(this.empServe.doctorDetail);
        let val3 = this.empServe.getValidateAssignRole(this.empServe.doctorDetail);
        if (val1.isError) {
          val = val1;
          val1.isError ? this.lastEditedPage = 0 : '';
          isError = val.isError;
        } else if (val2.isError && (this.doctorDetails.type == 0 || this.doctorDetails.type == 1)) {
          val = val2;
          val2.isError ? this.lastEditedPage = 1 : '';
          isError = val.isError;
        } else if (val3.isError) {
          val = val3;
          val3.isError ? this.lastEditedPage = 2 : '';
          isError = val.isError;
        }
        // isError = val.isError;
        break;
      }
      default:
        this.lastEditedPage = 0;
        isError = true;
        break;
    }
    if (isError) { this.isModify = false; this.empServe.errMasg = val.errorMessage; this.pageReFresh(); };
    return isError;
  }
  onPageChange(e) {

    let isError = this.checkValidation(e.pageType);
    if (isError) {
      this.empServe.pageNo = this.pageNo = this.data.pageNo = this.lastEditedPage;
      return
    }
    this.doctorDetails = this.empServe.doctorDetail;
    // this.tempEditPage < this.pageNo ? this.tempEditPage = this.pageNo : '';
    this.empServe.pageNo = this.pageNo = this.data.pageNo = e.pageType;
    console.log(e)
    if (e.pageControl == 'currentPageEmpTypeChange') {
      this.isModify = false;
      this.lastEditedPage = 0;
    } else this.lastEditedPage = e.lastEditedPage;
    // this.data.tempEditPage = this.tempEditPage;
    this.updateTabData();
    localStorage.setItem('employeeUpdateDetails', this.cryptoUtil.encryptData(JSON.stringify(this.data)));
  }
  pageReFresh() {
    this.pageChangeCall = true;
    setTimeout(() => { this.pageChangeCall = false; }, 100);
  }
  onPageNavigate(no) {
    // this.doctorDetails = this.empServe.doctorDetail;
    // if (no < this.pageNo || this.isModify)
    //   this.pageNo = no;
    // else if (no <= this.tempEditPage) {
    //   this.pageNo = no;
    // }
    // this.empServe.pageNo = this.data.pageNo = this.pageNo;
    // this.updateTabData();
    // localStorage.setItem('employeeUpdateDetails', this.cryptoUtil.encryptData(JSON.stringify(this.data)));
  }

  updateTabData() {
    this.tabData = [
      {
        "name": "Personal Details",
        "condition": true
      },
      {
        "name": "Professional Details",
        "condition": this.doctorDetails.type == 0 || this.doctorDetails.type == 1
      },
      {
        "name": "POC And Roles",
        "condition": true
      }, {
        "name": "Location Mapping",
        "condition": true
      },
    ]
  }
}