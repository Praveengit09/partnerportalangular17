import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { ProfileSearchRequest } from './../../../model/onboarding/profileSearchRequest';
import { OnboardingService } from '../../onboarding.service';
import { OnboardingProfileDetails } from './../../../model/onboarding/onboardingProfileDetails';
import { OnboardingUserVO } from './../../../model/onboarding/onboardingUserVO';
import { BaseResponse } from './../../../model/base/baseresponse';
import { AuthService } from './../../../auth/auth.service';
import { State } from './../../../model/base/state';
import { City } from './../../../model/base/city';
import { Locality } from './../../../model/base/locality';
import { RoleBasedAddress } from "./../../../model/employee/roleBasedAddress";
import { LocationModeResponse } from './../../../model/common/locationmoderesponse';
import { ProfileResponse } from './../../../model/onboarding/profileResponse';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { BusinessAdminService } from '../../../businessadmin/businessadmin.service';
import { SystemConstants } from '../../../constants/config/systemconstants';
import { CommonUtil } from '../../../base/util/common-util';

@Component({
  templateUrl: './onboardingadmin.template.html',
  styleUrls: ['./onboardingadmin.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class OnboardingAdminComponent {
  router: any;
  config: any;
  month: any;
  year: any;
  scrollPos: number = 0;
  stateAndCitiesFromAuth: State[];
  roleBasedAddressList: RoleBasedAddress[];
  profileResponseList: ProfileResponse[] = new Array<ProfileResponse>();
  selectedCityId: number = 0;
  locality: Locality[] = new Array<Locality>();
  indexForCity: number = 0;

  indexForLoc: number = 0;
  indexForState: number = 0;
  isNumComplete: boolean = false;
  dropDownIndexForCity: number;
  dropDownIndexForLoc: number;
  citiesName: string[];
  citiesId: number[];
  empId: number;
  stateId: number;
  cityId: number;
  locationsName: string[];
  selectedLocation: string;
  pinCode: string; optionStrInLocation: string = "Filter by area";
  onboardingProfileDetails: OnboardingProfileDetails[] = [];
  selectedOnboardingProfileDetails: OnboardingProfileDetails;
  baseResponse: BaseResponse;
  perPage: number = 10;
  total: number = 0;
  profileSearchRequest: ProfileSearchRequest = new ProfileSearchRequest();
  errorMessage: Array<string> = new Array<string>();
  isError: boolean;
  showMessage: boolean;
  isRemarksError: boolean;
  errorRemarksMessage: any[];
  showRemarksMessage: boolean;
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];
  collectCities: City[] = new Array<City>();

  selectedCity: string;
  selectedArea: string;
  optionStr: string = "Filter by city";

  searchCriteria: string = 'profileId';
  onboardingUserVO: OnboardingUserVO = new OnboardingUserVO();
  columns: any[] = [
    {
      display: 'Customer Details',
      variable: "name, age, gender, mobile ",
      filler: ',',
      filter: 'text',
      sort: true
    },
    {
      display: 'Residing Area',
      variable: 'address',
      filter: 'text',
      sort: false
    },

    {
      display: 'Requested Date & Time',
      variable: 'onBoardTime',
      filter: 'date',
      sort: true
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'markAddressStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'MARK ADDRESSED',
          style: 'btn btn-danger mb-xs botton_txt done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'ADDRESSED',
          style: 'disable_btn hide_btn hide_btntxt'
        },

        {
          condition: 'default',
          label: 'MARK ADDRESSED',
          style: 'btn btn-danger width-100 mb-xs botton_txt'
        }
      ]
    },
    {
      display: 'Action By',
      variable: 'remarkerName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Remarks',
      variable: 'description',
      filter: 'text',
      sort: true
    }
  ];

  sorting: any = {
    column: 'onBoardTime',
    descending: true
  };


  constructor(config: AppConfig, elementRef: ElementRef, private commonUtil: CommonUtil,
    private businessadminService: BusinessAdminService, private onboardingService: OnboardingService, private authService: AuthService,
    private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.dropDownIndexForCity = 0;
    this.dropDownIndexForLoc = 0;
    this.scrollPos = 0;
  }

  ngOnInit(): void {
    this.empId = this.authService.userAuth.employeeId;
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.showMessage = false;
    this.stateAndCitiesFromAuth = this.authService.getStatesAndCities();
    this.roleBasedAddressList = this.authService.getcityList();
    this.locationsName = new Array();
    this.locationsName[0] = this.optionStrInLocation;
    this.getState();
    let profileSearchRequest: ProfileSearchRequest;
    profileSearchRequest = new ProfileSearchRequest();
    profileSearchRequest.empId = this.empId;
    this.getOnBoardedConsumerList(profileSearchRequest);

  }


  onSearchChange(search: string) {
    this.searchCriteria = search;
  }

  getRefreshedorderList(): void {
    (<any>$)("#searchBox").val("");
    (<any>$)("#checkProfileId").prop("checked", true);
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.indexForCity = 0;
    this.indexForState = 0;
    this.indexForLoc = 0;
    this.scrollPos = 0;
    this.isNumComplete = false;
    let profileSearchRequest: ProfileSearchRequest;
    profileSearchRequest = new ProfileSearchRequest();
    profileSearchRequest.empId = this.empId;
    this.getOnBoardedConsumerList(profileSearchRequest)
  }

  onPage(page: number): void {
    this.scrollPos = this.total + 1;
    this.getOnBoardedConsumerList(new ProfileSearchRequest());
  }

  getOnBoardedConsumerListOnMobileNo(search: string): void {
    this.total = 0;
    let profileSearchRequest = new ProfileSearchRequest();
    profileSearchRequest.mobile = search;
    profileSearchRequest.empId = this.empId;
    if (search.length == 10)
      this.getOnBoardedConsumerList(profileSearchRequest);
    else
      this.isNumComplete = true;
  }

  getOnBoardedConsumerList(profileSearchRequest: ProfileSearchRequest): void {
    this.spinnerService.start();
    this.onboardingService.getOnBoardedConsumerList(profileSearchRequest).then(consumerList => {
      this.spinnerService.stop();
      this.onboardingProfileDetails = consumerList;
      this.profileResponseList = new Array();
      if (this.onboardingProfileDetails == undefined || this.onboardingProfileDetails.length == 0) {
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = "Record Not Found";
        this.isError = true;
        this.showMessage = true;
        return;
      }
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      for (let i = 0; i < this.onboardingProfileDetails.length; i++) {
        let profileRes: ProfileResponse = new ProfileResponse();
        profileRes.profileId = this.onboardingProfileDetails[i].profileId;
        if (this.onboardingProfileDetails[i].profile != undefined) {
          profileRes.name = this.onboardingProfileDetails[i].profile.title ? (this.onboardingProfileDetails[i].profile.title + ". ") + this.onboardingProfileDetails[i].profile.fName + " " + (this.onboardingProfileDetails[i].profile.lName ? this.onboardingProfileDetails[i].profile.lName : '') :
            '' + this.onboardingProfileDetails[i].profile.fName + " " + (this.onboardingProfileDetails[i].profile.lName ? this.onboardingProfileDetails[i].profile.lName : '');

          profileRes.age = this.commonUtil.getAge(this.onboardingProfileDetails[i].profile.dob).split(",")[0] + this.commonUtil.getAge(this.onboardingProfileDetails[i].profile.dob).split(",")[1];
          if (this.onboardingProfileDetails[i].profile.contactInfo != undefined && this.onboardingProfileDetails[i].profile.contactInfo.mobile != undefined) {
            profileRes.mobile = this.onboardingProfileDetails[i].profile.contactInfo.mobile;
          }
          profileRes.gender = this.onboardingProfileDetails[i].profile.gender;
          profileRes.onBoardTime = this.onboardingProfileDetails[i].onBoardTime;
          profileRes.markAddressStatus = this.onboardingProfileDetails[i].markAddressStatus;
          profileRes.description = (this.onboardingProfileDetails[i].description != undefined ? this.onboardingProfileDetails[i].description : "");
          profileRes.remarkerName = (this.onboardingProfileDetails[i].remarkerName != undefined ? this.onboardingProfileDetails[i].remarkerName : "");;
          // if (this.onboardingProfileDetails[i].profile.contactInfo != undefined && this.onboardingProfileDetails[i].profile.contactInfo.addresses != undefined && this.onboardingProfileDetails[i].profile.contactInfo.addresses.length > 0) {
          //   for (let j = 0; j < this.onboardingProfileDetails[i].profile.contactInfo.addresses.length; j++) {
          //     if (this.onboardingProfileDetails[i].profile.contactInfo.addresses[j].addressType == 0) {
          //       profileRes.address = (this.onboardingProfileDetails[i].profile.contactInfo.addresses[j].address1 != undefined && this.onboardingProfileDetails[i].profile.contactInfo.addresses.length > 0 ? this.onboardingProfileDetails[i].profile.contactInfo.addresses[j].address1 : "") + " " + (this.onboardingProfileDetails[i].profile.contactInfo.addresses[j].address2 != undefined ? this.onboardingProfileDetails[i].profile.contactInfo.addresses[j].address2 : "");
          //       break;
          //     }
          //   }
          // }
          if (this.onboardingProfileDetails[i].deliveryAddress != undefined && this.onboardingProfileDetails[i].deliveryAddress != null) {
            profileRes.address = this.onboardingProfileDetails[i].deliveryAddress.address1 + " " + this.onboardingProfileDetails[i].deliveryAddress.address2;
          }
        }
        this.profileResponseList.push(profileRes);
      }

      this.total = this.profileResponseList.length;
      this.errorMessage = new Array<string>();

      this.isError = false;
      this.showMessage = false;
    });
  }

  onButtonClicked(statusOnboarding: any): void {
    this.selectedOnboardingProfileDetails = statusOnboarding;
    $("#enquirypopup").show();
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array<string>();
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    }
  }


  onCloseButtonClicked() {
    this.onboardingUserVO = new OnboardingUserVO();
    $("#enquirypopup").hide();
    this.isRemarksError = false;
    this.showRemarksMessage = false;
    this.errorRemarksMessage = new Array<string>();
  }

  onLocationChange(index: number) {
    this.pinCode = "";
    this.selectedLocation = this.locationsName[index];
    if (this.selectedLocation != this.optionStrInLocation) {
      for (let i = 0; i < this.roleBasedAddressList.length; i++) {
        if (this.roleBasedAddressList[i].areaName === this.selectedLocation) {
          this.pinCode = this.roleBasedAddressList[i].pinCode;
        }
      }
    }

    this.profileSearchRequest = new ProfileSearchRequest();
    this.profileSearchRequest.fromIndex = this.scrollPos;
    this.getOnBoardedConsumerList(this.profileSearchRequest);
    this.total = this.onboardingProfileDetails.length;
  }


  onSubmitClicked(): void {
    if (this.onboardingUserVO.description == null || this.onboardingUserVO.description == "") {
      this.isRemarksError = true;
      this.showRemarksMessage = true;
      this.errorRemarksMessage = new Array<string>();
      this.errorRemarksMessage[0] = "please fill this description";
      return;
    }
    this.onboardingUserVO.profileId = this.selectedOnboardingProfileDetails.profileId;
    this.onboardingUserVO.empId = this.empId;
    this.onboardingUserVO.remarkerName = this.authService.userAuth.employeeName;
    this.onboardingUserVO.markAddressStatus = 1;
    this.total = 0;
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.onboardingService.addonboardedprofile(this.onboardingUserVO).then(addedProfile => {
      this.spinnerService.stop();
      this.baseResponse = addedProfile;
      $("#enquirypopup").hide();
      this.selectedOnboardingProfileDetails.description = this.onboardingUserVO.description;
      this.selectedOnboardingProfileDetails.markAddressStatus = 1;
      this.selectedOnboardingProfileDetails.remarkerName = this.authService.userAuth.employeeName;
      this.selectedOnboardingProfileDetails.profileId = this.onboardingProfileDetails[0].profileId;
      this.onboardingUserVO = new OnboardingUserVO();
      this.total = this.onboardingProfileDetails.length;
      this.isRemarksError = false;
      this.errorRemarksMessage = new Array();
      this.showRemarksMessage = false;
    });

  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.spinnerService.start();
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.spinnerService.stop();
      this.stateResponse = locationResponse;
      this.stateResponse.sort(this.compare);
    });
  }
  compare(a, b): number {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }

  onStateChange(index: number): void {
    this.cityId = 0;
    this.stateId = this.stateResponse[index - 1].id;
    this.spinnerService.start();
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.spinnerService.stop();
      this.cityResponse = locationResponse;
      this.cityResponse.sort(this.compare);
      let profileSearchRequest = new ProfileSearchRequest();
      profileSearchRequest.empId = this.empId;
      profileSearchRequest.state = this.stateId;
      this.getOnBoardedConsumerList(profileSearchRequest);

    });
  }

  onCityChange(index: number): void {
    this.cityId = this.cityResponse[index].id;
    this.spinnerService.start();
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.spinnerService.stop();
      this.localityResponse = locationResponse;
      this.localityResponse.sort(this.compare);
      let profileSearchRequest = new ProfileSearchRequest();
      profileSearchRequest.empId = this.empId;
      profileSearchRequest.state = this.stateId;
      profileSearchRequest.city = this.cityId;
      this.getOnBoardedConsumerList(profileSearchRequest);
    });
  }
  onLocalityChange(index: number): void {
    let profileSearchRequest = new ProfileSearchRequest();
    this.pinCode = this.localityResponse[index].pinCode;
    profileSearchRequest.empId = this.empId;
    profileSearchRequest.state = this.stateId;
    profileSearchRequest.city = this.cityId;
    profileSearchRequest.pinCode = this.pinCode;
    this.getOnBoardedConsumerList(profileSearchRequest);
  }
}
