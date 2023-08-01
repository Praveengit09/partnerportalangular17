import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { OnboardingService } from './../../../../onboarding/onboarding.service'
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { Locality } from '../../../../model/base/locality';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { Address } from '../../../../model/poc/address';
// import { setTimeout } from 'timers';
import { FileUtil } from '../../../../base/util/file-util';
import { Config } from '../../../../base/config';

@Component({
  selector: 'createpoc',
  templateUrl: './createpoc.template.html',
  styleUrls: ['./createpoc.style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreatePocComponent implements OnInit {

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  pocDetails: PocDetail = new PocDetail();
  pocId: number;
  mobileNumber: number;
  zoom: number;
  isMapVisible: boolean = false;
  uploadFilesList: any;
  contactList: Array<any> = new Array<any>();
  brandList: BrandDetailsWithReferralCode[] = new Array<BrandDetailsWithReferralCode>();
  localityList: Locality[] = new Array<Locality>();
  selectedLocality: any;
  selectedBrand: BrandDetailsWithReferralCode;
  isPocModify: boolean;
  isEmail: boolean;
  list: Array<any>;
  localityName: string = "Select Locality";
  dropDownIndex: number = -1;
  validation: any;
  currentPageIndex: number = 0;
  tabData = [];
  brandName: string = '';
  disableBrandOptions: boolean = false;
  constructor(config: AppConfig, private fileUtil: FileUtil,
    private superAdminService: SuperAdminService, private onboardingService: OnboardingService, private auth: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.pocDetails = new PocDetail();
    this.validation = validationUtil;
    this.tabData = superAdminService.createPocTabs;
    this.disableBrandOptions = this.auth.userAuth.hasSuperAdminRole;
  }

  ngOnInit() {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    // console.log('xthis.dropDownInde' + this.dropDownIndex);
    this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
    let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
    if (this.isPocModify && ((createPocLoc && createPocLoc.pocDetails)
      || (this.superAdminService && this.superAdminService.pocDetail))) {
      this.pocDetails = this.superAdminService.pocDetail;
      if (this.pocDetails) {
        let data = { 'pocDetails': this.pocDetails, 'isPocModify': this.isPocModify };
        this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
        this.contactList = this.pocDetails.contactList;
      } else {
        this.superAdminService.pocDetail = this.pocDetails = createPocLoc.pocDetails;
        this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
        console.log(`pocdetails==>${JSON.stringify(this.pocDetails)}`);
        this.contactList = this.pocDetails.contactList;
      }
      if (this.pocDetails.pdfHeaderType != 0 || this.pocDetails.pdfHeaderType == undefined) {
        (<any>$("#Pdf")).prop("checked", true)
      }
    } else {
      this.pocDetails = new PocDetail();
    }

    this.getBrandList();
    this.getContactList();
    this.getStateCityByPinCode(this.pocDetails.address.pinCode);
    this.pocDetails.GSTIN

    this.auth.setPreventNavigation(true);
  }
  onBackClick(type: any): void {
    this.tabData = [];
    setTimeout(() => { this.tabData = this.superAdminService.createPocTabs; }, 10)
    this.superAdminService.isPocModify = true;
    document.querySelector("#singlebutton").scrollIntoView();
    switch (type) {
      case 1: {
        this.onServicePortFol();
        break;
      }
      case 2: {
        this.onCreatePoc();
        this.uploadProfilePic();
        if (this.isError == false) {
          this.router.navigate(['/app/master/poc/partneragreement/']);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  getBrandList() {

    this.superAdminService.getBrandDetails().then(brandList => {
      this.brandList = brandList;
      for (var i = 0; i < this.brandList.length; i++) {
        console.log('hiiii12');
        if (this.pocDetails.brandId == this.brandList[i].brandId) {
          this.dropDownIndex = i;
          this.brandName = this.brandList[i].brandName
          console.log('dropDownIndex' + i);
        }
      }
    });


  }
  getContactList() {
    if (!this.pocDetails.contactList || this.pocDetails.contactList.length <= 0) {
      if (!this.contactList) {
        this.contactList = new Array();
      }
      this.contactList.push('');
      this.pocDetails.contactList = this.contactList;
    }
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 46) {
      return true;
    }
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var key2 = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key2)) {
      return false;
    }
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    } else if (key < 48 || key > 57) {
      return false;
    } else return true;
  }

  onBrandChange(index: number): void {
    if (index >= 0) {
      this.selectedBrand = this.brandList[index];
      this.pocDetails.brandId = this.selectedBrand.brandId;
    }
    else {
      delete this.pocDetails.brandId;
    }
  }

  onLocalityChange() {
    let x = this.localityList.findIndex(id => { return id.name == this.pocDetails.locality });
    if (x >= 0) {
      this.pocDetails.locality = this.localityList[x].name;
      if (!this.pocDetails.address) {
        this.pocDetails.address = new Address();
      }
      this.pocDetails.address.area = this.localityList[x].id;
      this.pocDetails.address.areaName = this.localityList[x].name;
    }
    console.log("locality------------>" + JSON.stringify(this.pocDetails.locality));
  }

  getStateCityByPinCode(pinCode: any): void {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || (pinCode + "").length == 6) {
      this.onboardingService.getStateCityByPinCode(pinCode).then(data => {
        this.pocDetails.address.cityName = data[0].cityName;
        this.pocDetails.address.stateName = data[0].stateName;
        this.pocDetails.address.city = data[0].cityId;
        this.pocDetails.address.state = data[0].stateId;
        this.pocDetails.address.region = 0;
        this.pocDetails.address.countryId = 0;
        this.pocDetails.address.area = 0;
        this.localityList = data[0].localityList;
        if (this.pocDetails.locality) {
          let isLocalityNotChanged: boolean = false;
          this.localityList.forEach((ele, inx) => {
            if (this.pocDetails.locality == ele.name) {
              this.pocDetails.address.area = ele.id;
              isLocalityNotChanged = true;
            }
          });
          this.pocDetails.locality = isLocalityNotChanged ? this.pocDetails.locality : 'Select Locality';
        }

        else {
          this.pocDetails.locality = this.localityName;
        }
      });
    }
    else if ((pinCode + "").length == 0) {
      this.pocDetails.address.cityName = null;
      this.pocDetails.address.stateName = null;
      this.pocDetails.address.city = null;
      this.pocDetails.address.state = null;

    }
  }
  fileUpload(event) {
    this.uploadFilesList = event.target.files;
  }

  uploadProfilePic() {
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.jpg') || file.name.endsWith('.JPG') || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {

        }
        else {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = 'Only png, jpg files are supported';
          this.showMessage = true;
          return;
        }
      }
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3('poc/logo', this.uploadFilesList[0], 0, true, false).then((awsS3FileResult: any) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      }
      else {
        this.spinnerService.stop();
        this.pocDetails.pocLogo = awsS3FileResult.Location;
      }
    }).catch(err => {
      this.spinnerService.stop();
    });

  }

  validateEmailId(email: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  onCreatePoc() {
    // this.pocDetails = this.superAdminService.pocDetail;
    if (this.pocDetails.pocName) {
      this.pocDetails.pocName = this.pocDetails.pocName.trim();
    }
    else if (this.pocDetails.pocName == undefined || this.pocDetails.pocName == null || this.pocDetails.pocName == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the poc name...!!";
      this.showMessage = true;
      return;
    }
    // if (this.pocDetails.pocLogo == undefined || this.pocDetails.pocLogo == null || this.pocDetails.pocLogo == "") {
    //   this.isError = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "Enter the organisation name...!!";
    //   this.showMessage = true;
    //   return;
    // }
    if (this.pocDetails.licenseInfo == undefined || this.pocDetails.licenseInfo == null || this.pocDetails.licenseInfo == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the licenseInfo...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.GSTIN == undefined || this.pocDetails.GSTIN == null || this.pocDetails.GSTIN == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the GSTIN....!!";
      this.showMessage = true;
      return;
    }
    // if (this.pocDetails.homeConsultationContactNo == undefined || this.pocDetails.homeConsultationContactNo == null || this.pocDetails.homeConsultationContactNo == "") {
    //   this.isError = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "Enter Valid Home Consultation Contact Number...!!";
    //   this.showMessage = true;
    //   return;
    // }
    if (!this.validateEmailId(this.pocDetails.email) || (this.pocDetails.email == undefined || this.pocDetails.email == null || this.pocDetails.email == "")) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter valid emailId...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.address.address1 == undefined || this.pocDetails.address.address1 == null || this.pocDetails.address.address1 == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the address1...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.address.address2 == undefined || this.pocDetails.address.address2 == null || this.pocDetails.address.address2 == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the address2...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.address.pinCode == undefined || this.pocDetails.address.pinCode == null || this.pocDetails.address.pinCode == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the Pincode...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.locality == undefined || this.pocDetails.locality == null || this.pocDetails.locality == "Select Locality") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the Locality...!!";
      this.showMessage = true;
      return;
    }
    if (this.pocDetails.areaName == undefined || this.pocDetails.areaName == null || this.pocDetails.address.areaName == "" && this.pocDetails.address.locationCoordinates.lon == undefined || this.pocDetails.address.locationCoordinates.lon == null || this.pocDetails.address.locationCoordinates.lon == 0
      && this.pocDetails.address.locationCoordinates.lat == undefined || this.pocDetails.address.locationCoordinates.lat == null || this.pocDetails.address.locationCoordinates.lat == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "please select the map";
      this.showMessage = true;
      return;
    }
    for (let i = 0; i < this.contactList.length; i++) {
      if (this.contactList[i] == "" || this.contactList[i] == null || this.contactList[i].length <= 0) {
        this.contactList.splice(i, 1);
      }
    }

    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }

  onServicePortFol(): void {
    this.onCreatePoc();
    this.uploadProfilePic();
    if (this.isError == false) {
      if (!this.pocDetails.pocId && !this.pocDetails.serviceList) {
        this.pocDetails.serviceList = new Array();
      }
      this.router.navigate(['/app/master/poc/serviceportfolio/']);
    }
    this.pocDetails.contactList = new Array<string>();
    this.pocDetails.contactList = this.contactList;
    console.log("==========>>>> " + this.contactList)
    console.log("locality==>" + JSON.stringify(this.pocDetails.locality))
  }

  addApplyButton(): void {
    if (this.contactList[this.contactList.length - 1] == "") {
      return;
    }
    this.contactList.push('');
  }
  ngOnDestroy(): void {
    if (this.pocDetails != undefined && this.pocDetails != null) {
      this.superAdminService.pocDetail = this.pocDetails;
    }
    this.auth.setPreventNavigation(false);
  }
  trackByFn(index: any, item: any) {
    return index;
  }

  onChooseAddress(addressResponse) {
    addressResponse = JSON.parse(JSON.stringify(addressResponse));
    setTimeout(() => {
      addressResponse;
    }, 1000);
    console.log("AddressResponse==>>> " + JSON.stringify(addressResponse))
    this.pocDetails.areaName = (addressResponse.name ? addressResponse.name + ", " : "") + addressResponse.formatted_address;
    if (addressResponse.geometry) {
      this.pocDetails.address.locationCoordinates.lon = addressResponse.geometry.location.lng;
      this.pocDetails.address.locationCoordinates.lat = addressResponse.geometry.location.lat;
    }
  }

  showMap() {
    if (this.isMapVisible) {
      this.isMapVisible = !this.isMapVisible;
    }
    this.isMapVisible = !this.isMapVisible;
  }
}