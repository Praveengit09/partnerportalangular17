import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { DoctorDetails } from "../../../model/employee/doctordetails";
import { EmployeeService } from "../../../superadmin/employee/employee.service";
import { DoctorServiceDetail } from "../../../model/employee/doctorServiceDetail";
import { ServiceItem } from "../../../model/service/serviceItem";
import * as $ from 'jquery';

@Component({
  selector: 'employeeprofessionalDetails',
  templateUrl: './employeeprofessionalDetails.template.html',
  styleUrls: ['./employeeprofessionalDetails.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmployeeProfessionalDetailsComponent {

  doctorDetail: DoctorDetails;
  serviceList = new Array<DoctorServiceDetail>();
  doctorId: number;
  isEmployeeModify: boolean;
  packages = new Array();
  getSpecialityList: ServiceItem[];
  pocName: string;
  empService: any;
  isError: boolean;
  errorMessage = new Array<string>();
  showMessage: boolean;
  @Input() pageChangeCall: any;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();

  constructor(private employeeService: EmployeeService) {
    this.isEmployeeModify = employeeService.isEmployeeModify;
    if (this.employeeService.isEmployeeModify == true) {
      employeeService.getDetails();
    }
    this.empService = employeeService;
  }
  ngOnInit() {
    this.getspecialities();
    this.doctorDetail = this.employeeService.doctorDetail;
    this.serviceList = this.doctorDetail.serviceList;
    // if (this.isEmployeeModify == true) {
    this.doctorId = this.doctorDetail.empId;
    if (this.doctorDetail.employeePocMappingList != undefined && this.doctorDetail.employeePocMappingList.length > 0) {
      this.serviceList = new Array<DoctorServiceDetail>()
      this.serviceList = this.employeeService.doctorDetail.serviceList;

      this.doctorDetail.employeePocMappingList.forEach(e => {
        this.packages.push(e.participationSettings.packageIdList);
      });
    }
    this.employeeService.setDetail();
    this.doctorDetail.type = this.employeeService.doctorDetail.type;
    console.log("doctorser" + JSON.stringify(this.serviceList))
  }

  ngOnDestroy(): void {
    this.employeeService.doctorDetail = this.doctorDetail;
  }

  resetServiceData(serviceItem) {

    for (let i = 0; i < this.serviceList.length; i++) {
      // console.log('if' + this.serviceList.length);
      //  this.doctorDetail.serviceList=new Array<ServiceDetail>();
      this.doctorDetail.serviceList[this.serviceList.length - 1] = new DoctorServiceDetail();
      this.doctorDetail.serviceList[this.serviceList.length - 1].discountPrice = 0;
      this.doctorDetail.serviceList[this.serviceList.length - 1].discountedPrice = 0;
      this.doctorDetail.serviceList[this.serviceList.length - 1].hasPersonalSchedule = false;
      this.doctorDetail.serviceList[this.serviceList.length - 1].hasSchedule = false;
      this.doctorDetail.serviceList[this.serviceList.length - 1].originalPrice = 0;
      this.doctorDetail.serviceList[this.serviceList.length - 1].serviceType = 0;
      this.doctorDetail.serviceList[this.serviceList.length - 1].serviceId = serviceItem.id;
      this.doctorDetail.serviceList[this.serviceList.length - 1].serviceName = serviceItem.text;
    }
    this.serviceList = this.doctorDetail.serviceList;
    // console.log('if list--->' + JSON.stringify(this.serviceList));
  }

  onValueCheckedd(serviceItem): void {
    if (this.serviceList == undefined)
      this.serviceList = new Array<DoctorServiceDetail>();
    if ((<any>$("#" + serviceItem.id + ":checked")).length > 0) {
      this.serviceList.push(serviceItem);
      if (this.doctorDetail.serviceList != undefined) {
        this.resetServiceData(serviceItem);
      }
      else {
        this.doctorDetail.serviceList = new Array<DoctorServiceDetail>();
        this.resetServiceData(serviceItem);
      }
    }
    else {
      var index = this.serviceList.findIndex(x => x.serviceId == serviceItem.id);
      this.serviceList.splice(index, 1);
      // this.doctorDetail.employeePocMappingList.forEach(poc => {
      //   poc.serviceList.forEach((service, serI) => {
      //     if (service.serviceId == serviceItem.id) {
      //       delete poc.serviceList[serI];
      //     }
      //   });
      // });
    }
    this.doctorDetail.serviceList = this.serviceList;
  }

  getspecialities(): void {
    if (this.doctorDetail) {
      this.employeeService.getSpeciality(this.doctorDetail.type).then(response => {
        this.getSpecialityList = response;
        if (this.serviceList != undefined) {
          this.doctorDetail.serviceList = this.serviceList;
        }
        if (this.doctorDetail.serviceList != undefined) {
          setTimeout(() => {
            for (let j = 0; j < this.serviceList.length; j++) {
              $("#" + this.serviceList[j].serviceId).prop("checked", true)
            }
          }, 100)
        }
      });
    }
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (this.employeeService.errMasg && this.employeeService.errMasg.length > 0)
      this.professionalDetails()
  }
  professionalDetails() {
    let isValid = this.employeeService.getValidateProffesionalDetail(this.doctorDetail);
    this.isError = isValid.isError;
    this.errorMessage = isValid.errorMessage;
    this.showMessage = isValid.showMessage;
    if (this.isError) {
      return;
    }
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }
  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 39) {
      return true;
    }
    else if ((key < 48 || key > 57) || event.keyCode == 37) {
      return false;
    }
    else return true;

  }
  validatecopyPast(event) {
    if (event.ctrlKey == true && (event.which == '118' || event.which == '86')) {
      event.preventDefault();
    }
  }
  onEmployeeRole(): void {
    if (this.doctorDetail.serviceList != undefined) {
      this.employeeService.doctorDetail = this.doctorDetail;
      this.employeeService.setDetail();
    }
    console.log(`proffessional==>${JSON.stringify(this.doctorDetail.serviceList)}`)
    this.professionalDetails();
    if (this.isError == false) {
      this.pageChange.emit({ pageControl: 'employeeroles', pageType: 2 });
    }
  }
}