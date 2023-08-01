import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { Region } from '../../../../model/employee/getRegion';
import { EmployeeService } from '../../employee.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { Address } from '../../../../model/poc/address';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { Employee } from '../../../../model/employee/employee';
@Component({
  selector: 'employeelocation',
  templateUrl: './employeelocation.template.html',
  styleUrls: ['./employeelocation.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class EmployeeLocationComponent implements OnInit {
  doctorDetails: DoctorDetails;
  employee: Employee;
  region: Region = new Region();
  regionList: any;
  stateList: any;
  cityList: any;
  areaList: any;
  regionName: string;
  regionId: number;
  stateName: string;
  stateId: number;
  cityName: string;
  cityId: number;
  areaName: string;
  areaId: number;
  pincode: string;
  lat: number;
  lon: number;
  pocId: number;
  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  country: number;
  lists: Array<Address>;
  addressList = new Array<Address>();
  addList = new Array<string>();
  finalAddressList: any;
  BasedAddressList = new Array<Address>();
  regionListIndex: number = -1;
  stateListIndex: number = -1;
  cityListIndex: number = -1;
  areaListIndex: number = -1;
  isEmployeeModify: boolean;
  languagesList = new Array<string>();
  list: any;
  @Input() pageChangeCall: any;
  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService, private employeeService: EmployeeService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    if (this.employeeService.isEmployeeModify == undefined) {
      employeeService.getDetails();
    }
    this.isEmployeeModify = this.employeeService.isEmployeeModify
  }
  ngOnInit() {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      // // console.log("cond");
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    // if (this.isEmployeeModify == true || this.isEmployeeModify == undefined) {
    this.doctorDetails = this.employeeService.doctorDetail;
    if (this.doctorDetails) {
      // let data = { 'pocDetails': this.doctorDetails };
      // this.hsLocalStorage.saveComponentData(data);
      this.employeeService.setDetail();
      if (this.doctorDetails.languages != undefined) {
        for (let i = 0; i < this.doctorDetails.languages.length; i++) {
          this.languagesList.push(this.doctorDetails.languages[i].name);
        }
        if (this.languagesList.length > 1) {
          this.list = this.languagesList.join(', ');
        }
        else {
          this.list = this.languagesList.join();
        }
      }
    }
    else {
      // this.doctorDetails = this.hsLocalStorage.getComponentData().pocDetails;
      // this.employeeService.doctorDetail = this.doctorDetails;
      this.employeeService.getDetails();
    }
    this.country = 0;
    if (this.doctorDetails != undefined && this.doctorDetails.addressList != undefined && this.doctorDetails.addressList.length > 0) {
      this.addressList = this.doctorDetails.addressList;
    }
    // }
  }


  getRegion(val) {
    // // console.log("val" + val + JSON.stringify(this.doctorDetails));
    this.region.id = 1;
    this.region.mode = Region.MODE_FOR_REGION;
    this.employeeService.getRegion(this.region).then((data) => {
      this.regionList = data;
      // // console.log("response" + JSON.stringify(data));
    })
  }
  onRegionChange(event, val) {
    // // console.log("event" + JSON.stringify(event));
    if (event >= 0) {
      this.clearLocationData("region", 0);
      // // console.log("val" + val + JSON.stringify(this.doctorDetails));
      this.region.id = this.regionList[event].id;
      this.region.mode = Region.MODE_FOR_STATE;
      this.regionName = this.regionList[event].name;
      this.regionId = this.region.id;
      // // console.log("regiondata" + this.regionId + this.regionName);
      this.employeeService.getRegion(this.region).then((data) => {
        this.stateList = data;
        // // console.log("response" + JSON.stringify(data));
      })
    }
    else {
      this.clearLocationData("region", 1);
      this.regionName = undefined;
      // // console.log("index" + this.stateListIndex + "" + this.cityListIndex + "" + this.areaListIndex);
      // // console.log("state" + this.stateId + "" + this.stateName);
    }
  }
  onStateChange(event, val) {
    // console.log("check" + this.stateListIndex + "here" + JSON.stringify(event));
    if (event >= 0) {
      //  // console.log("event"+JSON.stringify(event)+this.stateList[event-1].id);
      this.clearLocationData('state', 0);
      this.region.id = this.stateList[event].id;
      this.region.mode = Region.MODE_FOR_CITY;
      this.stateName = this.stateList[event].name;
      this.stateId = this.region.id;
      // console.log("statedata" + this.stateId + this.stateName);
      this.employeeService.getRegion(this.region).then((data) => {
        this.cityList = data;
      })
    }
    else {
      this.clearLocationData('state', 1);
      this.stateId = undefined;
      this.stateName = undefined;
    }
  }
  onCityChange(event, val) {
    // // console.log("event"+JSON.stringify(event)+this.cityList[event-1].id);
    if (event >= 0) {
      this.clearLocationData('city', 0);
      this.region.id = this.cityList[event].id;
      this.region.mode = Region.MODE_FOR_AREA;
      this.cityName = this.cityList[event].name;
      this.cityId = this.region.id;
      // console.log("statedata" + this.cityName + this.cityId);
      this.employeeService.getRegion(this.region).then((data) => {
        this.areaList = data;
      })
    }
    else {
      this.clearLocationData('city', 1);
      this.cityId = undefined;
      this.cityName = undefined;
    }
  }
  onAreaChange(event, val) {
    if (event >= 0) {
      this.clearLocationData('area', 0);
      this.region.id = this.areaList[event].id;
      this.areaName = this.areaList[event].name;
      this.areaId = this.region.id;
      this.pincode = this.areaList[event].pinCode;
      this.lat = this.areaList[event].lat;
      this.lon = this.areaList[event].lon;
      // // console.log("statedata" + this.areaName + this.areaId);
      // // console.log("areadata" + JSON.stringify(this.areaList[event]));
    }
  }
  clearLocationData(data, type) {
    if (data == 'region') {
      this.stateList = new Array();
      this.stateId = undefined;
      this.stateName = undefined;
    }
    if (data == 'region' || data == 'state') {
      this.cityList = new Array();
      this.cityId = undefined;
      this.cityName = undefined;
    }
    if (data == 'region' || data == 'state' || data == 'city' || data == 'area') {
      if (data != 'area') {
        this.areaList = new Array();
      }
      this.region = new Region();
      this.areaId = undefined;
      this.areaName = undefined;
      this.pincode = undefined;
    }
  }
  onadd() {
    // if (this.region.id == undefined) {
    //   this.isError = true;
    //   this.showMessage = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "select region";
    // }
    // else if (this.stateId == undefined) {
    //   this.isError = true;
    //   this.showMessage = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "select state";
    // }
    // else if (this.cityId == undefined) {
    //   this.isError = true;
    //   this.showMessage = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "select city";
    // }
    // else if (this.areaId == undefined) {
    //   this.isError = true;
    //   this.showMessage = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "select area";
    let AddressListTemp: Address = new Address();
    this.isError = false;
    this.showMessage = false;
    AddressListTemp.countryId = 1;
    AddressListTemp.country = 'India';
    AddressListTemp.region = this.regionId;
    AddressListTemp.regionName = this.regionName;
    AddressListTemp.state = this.stateId;
    AddressListTemp.stateName = this.stateName;
    AddressListTemp.city = this.cityId;
    AddressListTemp.cityName = this.cityName;
    AddressListTemp.area = this.areaId;
    AddressListTemp.areaName = this.areaName;
    AddressListTemp.pinCode = this.pincode;
    this.BasedAddressList.forEach(element => {
      // // console.log("rolebasedout" + JSON.stringify(AddressListTemp) + "check" + JSON.stringify(element));
      if (JSON.stringify(element) === JSON.stringify(AddressListTemp)) {
        // // console.log("rolebased" + JSON.stringify(AddressListTemp) + "check" + JSON.stringify(element));
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Address already exist";
      }
      // // console.log("element" + JSON.stringify(element));
    });
    if (!this.isError) {
      this.BasedAddressList.push(AddressListTemp);
    }
    this.addressList = this.BasedAddressList;
    // // console.log("addressList" + JSON.stringify(this.addressList));
    this.employeeService.doctorDetail.addressList = this.doctorDetails.addressList = this.addressList;
    this.employeeService.setDetail();
  }
  removeAddress(index: number) {
    this.addressList.splice(index, 1);
    // // console.log("addressListremove" + JSON.stringify(this.addressList));
    this.employeeService.setDetail();
  }


  onSubmitEmployee() {
    this.spinnerService.start();
    this.employeeService.doctorDetail.addressList = this.doctorDetails.addressList = this.addressList;
    if (this.doctorDetails.employeePocMappingList != undefined) {
      this.doctorDetails.employeePocMappingList.forEach(element => {
        delete element.roleIdName;
      });
    }
    // if (this.doctorDetails.employeePocMappingList != undefined) {
    //   for (let i = 0; i < this.doctorDetails.employeePocMappingList.length; i++) {
    //     if (this.doctorDetails.employeePocMappingList[i].pocId == 0 || this.doctorDetails.employeePocMappingList[i].pocId == undefined || this.doctorDetails.employeePocMappingList[i].pocId == null)
    //       this.doctorDetails.employeePocMappingList.splice(i, 1);
    //   }
    // }
    // if (this.doctorDetails.pocIdList[0] == null) {
    //   this.doctorDetails.pocIdList.splice(0, 1)
    //   console.log("=======>>>> ", this.doctorDetails.pocIdList[0])
    // }
    console.log(JSON.stringify(this.doctorDetails.empPersonalPocInfo));
    if (this.doctorDetails.empPersonalPocInfo && this.doctorDetails.empPersonalPocInfo.contactList
      && this.doctorDetails.empPersonalPocInfo.contactList[0] == null) {
      this.doctorDetails.empPersonalPocInfo.contactList[0] = "";
    }
    delete this.doctorDetails.profileImageData;
    this.employeeService.updateEmployee(this.doctorDetails).then((data) => {
      this.spinnerService.stop();
      let response = data;
      if (response.statusCode == 200 || response.statusCode == 201) {
        alert(response.statusMessage);
        this.router.navigate(['/app/master/employee/list']);
        /*  this.isError = false;
         this.errorMessage = new Array();
         this.errorMessage[0] = response.statusMessage;
         this.showMessage = true; */
        // setTimeout(() => { this.spinnerService.start() }, 3000);
        // setTimeout(() => {  }, 2000);
      }
      else if (response.statusCode == 405) {
        // // console.log('else check-' + response.statusCode);
        /*  this.isError = true;
         this.errorMessage = new Array();
         this.errorMessage[0] = response.statusMessage;
         this.showMessage = true; */
        alert(response.statusMessage);
      }
    }).catch((err) => {
      if (err) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Server Not Responding ! Check Your Internet Connection ...';
        this.showMessage = true;
      }
    });
  }

}