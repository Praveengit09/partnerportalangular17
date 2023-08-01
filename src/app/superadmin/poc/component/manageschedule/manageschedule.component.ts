import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { ReceptionService } from '../../../../reception/reception.service';
import { EmployeeListRequest } from '../../../../model/employee/employeeListRequest';
import { PharmacyService } from "../../../../pharmacy/pharmacy.service";
import { Doctor } from '../../../../model/employee/doctor';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { DoctorTag } from '../../../../model/poc/doctorfavrolesrequest';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';
export class SpecialityDetails {
  specialityName: string;
}

@Component({
  selector: 'manageschedule',
  templateUrl: './manageschedule.template.html',
  styleUrls: ['./manageschedule.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class ManageScheduleComponent implements OnInit {

  searchCriteria: string = 'firstName';
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria."
  config: any;
  month: any;
  year: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  list: DoctorTag[] = new Array<DoctorTag>();
  total: number = 0;
  doctorList: Doctor[] = new Array<Doctor>();
  pocId: number;
  doctorId: number;
  empId: number;
  scrollPosition: number;
  time: any;
  str: string;
  str2: string;
  offset: number = 50;
  fromIndex: number;
  perPage: number = 10;
  searchTerm: any;
  List: Array<number>;
  isErrorCheck: boolean = false;
  empIdList: Array<number>;
  pocDetails: PocDetail;
  employeeId: number;


  columns: any[] = [
    {
      display: 'Doctor List',
      variable: 'firstName lastName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'contactList',
      filter: 'text',
      sort: false
    },
    {
      display: 'Specialization',
      variable: 'serviceName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Action',
      variable: '',
      filter: 'action',
      sort: false,
      type: 'button',
      event: 'viewButton',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
        }
      ]
    },
  ];

  sorting: any = {
    column: 'empId',
    descending: true
  };


  constructor(config: AppConfig, private pharmacyService: PharmacyService, private hsLocalStorage: HsLocalStorage,
    private superAdminService: SuperAdminService, private auth: AuthService, private recepService: ReceptionService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.fromIndex = 0;
    this.searchTerm = '';
  }
  ngOnInit() {
    this.fetchPocDetails();
    this.pocId = this.pocDetails.pocId;
    this.employeeId = this.auth.userAuth.employeeId;
    this.getDoctorList();
  }
  fetchPocDetails() {
    this.pocDetails = this.superAdminService.pocDetail;
    if (this.pocDetails) {
      let data = { 'pocDetail': this.pocDetails };
      this.hsLocalStorage.setDataEncrypted('pocDetailloc', data);
    } else {
      this.pocDetails = this.hsLocalStorage.getDataEncrypted('pocDetailloc').pocDetail;
      this.superAdminService.pocDetail = this.pocDetails;
    }
  }
  getDoctorList() {
    this.spinnerService.start();
    this.recepService.getDoctorList(this.pocId, 0, 0).then(data => {
      this.doctorList = data;
      this.spinnerService.stop();
      this.getDoctorServices();

    }).catch(error => {
      this.spinnerService.stop();

    });
  }
  onButtonClicked(event: DoctorDetails) {
    this.superAdminService.doctorDetail = event;
    this.router.navigate(['/app/master/poc/manage/doctordetails']);
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
  }

  onSearchChange(search: string) {
    this.searchCriteria = search;
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }

  onSearch() {
    console.log("NameOfPoc::" + this.searchTerm);
    this.searchTerm = this.searchTerm.trim();
    let request: EmployeeListRequest = new EmployeeListRequest();
    request.pocIds = [this.pocId];
    if (!isNaN(this.searchTerm)) {
      request.contactNo = this.searchTerm;
      request.name = "";
    } else {
      request.name = this.searchTerm;
      request.contactNo = "";
    }
    request.limit = 0;
    request.offset = 30;
    request.roleId = 3;
    if (this.searchTerm.length < 3) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter Valid Doctor Name / Mobile no..";
      this.showMessage = true;
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      this.doctorList = new Array<any>();
      this.superAdminService.getList(request).then(responseList => {
        // console.log("onSearch1:" + responseList);
        this.doctorList = responseList;
        this.getDoctorServices();
        if (this.doctorList.length > 0) {
          this.total = this.scrollPosition = this.doctorList.length;
        } else {
          this.isError = true;
          this.errorMessage.push("No Data found.");
          this.showMessage = true;
        }
      });
    }
  }
  getDoctorServices() {
    this.doctorList.forEach(doctor => {
      doctor.serviceName = '';
      let docPoc = doctor.employeePocMappingList.filter(poc => poc.pocId == this.pocDetails.pocId)[0];
      docPoc.serviceList.forEach(service => {
        doctor.serviceName = service.serviceName + "," + doctor.serviceName;
      });
    });
  }

  onRefresh() {
    this.searchTerm = "";
    this.getDoctorList();
  }



}