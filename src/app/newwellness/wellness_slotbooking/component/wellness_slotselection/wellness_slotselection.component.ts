import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Payment } from '../../../../model/basket/payment';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { Address } from '../../../../model/profile/address';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { UpdateAddress } from '../../../../model/profile/updateAddress';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { OnboardingService } from '../../../../onboarding/onboarding.service';
import { ReceptionService } from '../../../../reception/reception.service';
// import { DiagnosticsService } from '../../../diagnostics.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { DiagnosticsService } from './../../../../diagnostics/diagnostics.service';
import { WellnessSlotBookingService } from '../../wellness_slotbooking.service';
import { WellnessService } from '../../../../newwellness/wellness.service';

@Component({
  selector: 'wellness_slot_selection',
  templateUrl: './wellness_slotselection.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./wellness_slotselection.style.scss']
})
export class WellnessSlotSelectionComponent implements OnInit, OnDestroy {

  validation: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  selectedProfileAddress: Array<Address> = new Array();
  searchTestsTotal: number = 0;
  searchedTests: any;
  scheduleId: number = 0;
  pocId: any;
  brandId: number;
  slotBookingDetails: SlotBookingDetails;
  editAddress: Address = new Address();
  errorMessagePopup: Array<string>;
  isErrorPopup: boolean;
  showMessagePopup: boolean;
  city: number;
  slotDate: Date = new Date();
  slotTimeList: any = new Array();
  slotData: any = new Array;
  isAddNew: boolean = false;
  price: number = 0;
  selectedDayInNumber: number = 0;
  dropDownIndex: number = 0;

  datepickerOpts = {
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 6)),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }

  selectColumns: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];

  constructor(private router: Router, private wellnessService: WellnessService,
    private wellnessSlotBookingService: WellnessSlotBookingService,
    private auth: AuthService, private commonUtil: CommonUtil, private _validation: ValidationUtil,
    private hsLocalStorage: HsLocalStorage, private receptionService: ReceptionService,
    private spinnerService: SpinnerService, private onboardingService: OnboardingService) {
    this.validation = _validation;
    this.searchedTests = new Array();
    this.pocId = auth.userAuth.pocId;
    this.city = auth.selectedPocDetails.address.city;
    this.brandId = auth.userAuth.brandId;
  }

  ngOnInit(): void {
    if (!this.selectedRegisteredProfile.selfProfile.fName) {
      (<any>$('#registerPatientModal')).modal('show');
    }
    this.slotBookingDetails = new SlotBookingDetails();
    this.slotBookingDetails.pocId = this.pocId;
    this.slotBookingDetails.bookingSource = 3
    this.slotBookingDetails.paymentSource = 3;
    this.slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_WELLNESS;
    // this.slotBookingDetails.bookingSubType = this.diagnosticsService.slotBookingSubType;
    this.slotBookingDetails.serviceList = new Array();
    this.slotBookingDetails.empId = this.auth.employeeDetails.empId;
    this.slotBookingDetails.payment = new Payment();
    this.slotBookingDetails.doctorDetail = new DoctorDetails();
    this.slotTimeList = new Array();
    this.slotTimeList.push({
      "startTime": 0,
      "label": "No slots available"
    });

  }

  onRegisterNewUser(selectedProfile: SelectedRegisteredProfile) {
    console.log("Selected Profile: " + JSON.stringify(selectedProfile));
    this.selectedRegisteredProfile = selectedProfile;
    this.saveSelectedProfile();
  }

  saveSelectedProfile() {
    this.resetError();
    this.slotBookingDetails.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.slotBookingDetails.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.slotBookingDetails.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
    this.slotBookingDetails.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
  }



  searchTests(searchKeyword) {

    this.resetError();
    let searchRequest = new SearchRequest();
    searchRequest.from = 0;
    // searchRequest.filteredServiceId = 0;
    searchRequest.pocId = this.pocId;
    searchRequest.searchTerm = searchKeyword;
    searchRequest.size = 500;
    searchRequest.scheduleId = this.scheduleId;
    searchRequest.homeCollections = false;
    if (searchKeyword.length > 2) {
      this.wellnessSlotBookingService.searchWellnessScheduleTests(searchRequest).then((searchedTests) => {
        if (searchedTests == undefined || searchedTests == null || searchedTests.length == 0) {
          this.errorMessage = new Array();
          this.errorMessage[0] = 'No results found';
          this.isError = true;
          this.showMessage = true;
          $('html, body').animate({ scrollTop: '0px' }, 300);
        }
        this.searchTestsTotal = searchedTests.length;
        this.searchedTests = searchedTests;
      });
    }
  }

  getTestName(selectedInvestigation) {
    this.resetError();
    console.log("selectedInvestigation: " + JSON.stringify(selectedInvestigation));
    if (selectedInvestigation != undefined && selectedInvestigation != null
      && selectedInvestigation.serviceId > 0) {
      let isServiceExist = false;

      if (this.slotBookingDetails.serviceList.length > 0) {
        this.slotBookingDetails.serviceList.forEach(service => {
          if (selectedInvestigation.serviceId == service.serviceId) {
            isServiceExist = true;
            return
          }
        });
      }

      if (isServiceExist == false) {
        let serviceItem: ServiceItem = new ServiceItem();
        serviceItem.serviceId = selectedInvestigation.serviceId;
        serviceItem.parentServiceId = serviceItem.categoryId = selectedInvestigation.parentServiceId;
        serviceItem.serviceName = selectedInvestigation.serviceName;
        serviceItem.grossPrice = selectedInvestigation.grossPrice;
        serviceItem.discountPrice = selectedInvestigation.discountPrice;
        serviceItem.netPrice = selectedInvestigation.netPrice;
        serviceItem.taxes = selectedInvestigation.taxes;
        serviceItem.quantity = 1;
        this.slotBookingDetails.serviceList.push(serviceItem);
        let serviceIdList = new Array();
        this.slotBookingDetails.serviceList.forEach(service => {
          serviceIdList.push(service.serviceId);
        });
        this.scheduleId = selectedInvestigation.scheduleId;
        if (this.slotBookingDetails != undefined && this.slotBookingDetails.serviceList != undefined && this.slotBookingDetails.serviceList.length > 0
          && this.scheduleId > 0) {
          //Network call to get slotdata with respect to test schedule.
          this.spinnerService.start();
          this.wellnessSlotBookingService.getWellnessServiceWalkInSlots(this.pocId, this.scheduleId, serviceIdList).then(data => {
            console.log(JSON.stringify(data));
            if (data && (data.statusCode == 200 || data.statusCode == 201)) {
              this.slotData = data;
              this.setData();
            } else {
              alert(data.statusMessage);
            }
            this.spinnerService.stop();
          });

        }
      }
    }
  }

  setData() {
    console.log("slotBookingDetails.serviceList: " + JSON.stringify(this.slotBookingDetails.serviceList));
    console.log("slotData.serviceList: " + JSON.stringify(this.slotData.serviceList));
    for (let i = 0; i < this.slotData.serviceList.length; i++) {
      for (let j = 0; j < this.slotBookingDetails.serviceList.length; j++) {
        if (this.slotData.serviceList[i].serviceId === this.slotBookingDetails.serviceList[j].serviceId) {
          this.slotData.serviceList[i].parentServiceId = this.slotBookingDetails.serviceList[j] ?
            this.slotBookingDetails.serviceList[j].parentServiceId : 0;
          this.slotData.serviceList[i].parentServiceName = this.slotBookingDetails.serviceList[j] ?
            this.slotBookingDetails.serviceList[j].parentServiceName : "";
        }
      }
    }
    this.slotBookingDetails.serviceList = this.slotData.serviceList;
    console.log("slotBookingDetails.serviceListt: " + JSON.stringify(this.slotBookingDetails.serviceList));
    this.price = 0;
    this.slotBookingDetails.serviceList.forEach(service => {
      service.quantity = 1;
      this.price += +service.netPrice;
      console.log("Price: " + this.price);
    });
    this.dropDownIndex = 0;
    this.onDateSelected();
    this.spinnerService.stop();
  }

  onDateSelected() {
    this.resetError();
    this.selectedDayInNumber = this.commonUtil.convertDateToDayOfWeek(this.slotDate);
    let selectedDate = +this.commonUtil.convertDateToTimestamp(this.slotDate) - this.commonUtil.getTimezoneDifferential();
    console.log("onDateSelected: " + selectedDate);
    this.slotBookingDetails.slotDate = +selectedDate;
    this.slotBookingDetails.slotTime = undefined; //since 0 is the timestamp for 5:30A.M
    this.dropDownIndex = 0;
    if (this.slotData.slots) {
      for (let i = 0; i < this.slotData.slots.length; i++) {
        let date = this.slotData.slots[i];
        if (date.actualDate == selectedDate) {
          let timingData = new Array();
          let currentTime = this.commonUtil.convertTimeToUTC(new Date()) - this.commonUtil.getTimezoneDifferential();
          date.dateSlots.forEach(timing => {
            console.log('current utc time = ' + currentTime);
            console.log('timing.time = ' + timing.time);
            console.log("slotTimeList: " + new Date(timing.time).getHours() + ">>>>>" + (new Date(timing.time).getMinutes()));
            console.log("Check: " + (timing.status == 0) +
              ">>>>>>>" + (timing.time > currentTime) +
              ">>>>>>" + (selectedDate > (new Date().getTime())));
            if ((timing.status == 0) && ((timing.time > currentTime) || (selectedDate > (new Date().getTime())))) {
              let slotTiming = {
                "startTime": timing.time,
                "endTime": timing.expireTime,
                "label": (new Date(timing.time).getHours() + ":" + (new Date(timing.time).getMinutes() < 10 ? '0' : '') + new Date(timing.time).getMinutes() + " - "
                  + new Date(timing.expireTime).getHours() + ":" + (new Date(timing.expireTime).getMinutes() < 10 ? '0' : '') + new Date(timing.expireTime).getMinutes())
              };
              timingData.push(slotTiming);
            }
          });
          timingData.sort(function (a, b) { return a.startTime - b.startTime });
          timingData.unshift({
            "startTime": 0,
            "label": "Select time slot"
          });
          this.slotTimeList = timingData;
          break;
        } else {
          this.slotTimeList = new Array();
          this.slotTimeList.push({
            "startTime": 0,
            "label": "No slots available"
          });
        }
      }
    }

    if (this.slotTimeList == undefined || this.slotTimeList == null || this.slotTimeList.length <= 1) {
      // Show error message
      this.slotTimeList = new Array();
      this.slotTimeList.push({
        "startTime": 0,
        "label": "No slots available"
      });
    }


  }

  onTimeSelected(selectedTime) {
    this.resetError();
    console.log("SelectedTime: " + JSON.stringify(this.slotBookingDetails.serviceList));
    this.slotBookingDetails.slotTime = selectedTime;
    let originalAmount: number = 0;
    let otherDiscountAmount: number = 0;
    let finalAmount: number = 0;
    let tempService;
    this.slotBookingDetails.serviceList.forEach(service => {
      tempService = service.walkinOrderPriceDetails;
    });
    this.slotBookingDetails.payment.originalAmount = originalAmount;
    this.slotBookingDetails.payment.otherDiscountAmount = otherDiscountAmount;
    this.slotBookingDetails.payment.taxationAmount = 0;
    this.slotBookingDetails.payment.packageDiscountAmount = 0;
    this.slotBookingDetails.payment.finalAmount = finalAmount;
  }

  setPrice() {

  }

  remove(index: number): void {
    this.resetError();
    this.slotBookingDetails.serviceList.splice(index, 1);
    if (this.slotBookingDetails.serviceList.length == 0) {
      this.scheduleId = 0;
      this.slotTimeList = new Array();
      this.slotTimeList.push({
        "startTime": 0,
        "label": "No slots available"
      });
      this.price = 0;
    } else {
      this.price = 0;
      this.slotBookingDetails.serviceList.forEach(service => {
        this.price = +service.netPrice;
      });
    }
    this.searchTestsTotal = 0;
    this.dropDownIndex = 0;
  }

  continueToPayment() {
    this.resetError();
    $('html, body').animate({ scrollTop: '0px' }, 300);
    if (this.slotBookingDetails.patientProfileId == undefined || this.slotBookingDetails.patientProfileId <= 0) {
      this.errorMessage[0] = 'Please select the patient';
      this.isError = true;
      this.showMessage = true;
      (<any>$('#registerPatientModal')).modal('show');
      return;
    }

    if (this.slotBookingDetails.serviceList == undefined || this.slotBookingDetails.serviceList == null
      || this.slotBookingDetails.serviceList.length <= 0) {
      this.errorMessage[0] = 'Please select atleast one test';
      this.isError = true;
      this.showMessage = true;
      return;
    }

    console.log("this.slotBookingDetails.slotDate: " + this.slotBookingDetails.slotDate);
    console.log("this.slotBookingDetails.slotTime: " + this.slotBookingDetails.slotTime);
    if (this.slotBookingDetails.slotDate == undefined || this.slotBookingDetails.slotTime == undefined) {
      this.errorMessage[0] = 'Please select the slot';
      this.isError = true;
      this.showMessage = true;
      return;
    }
    this.slotBookingDetails.brandId = this.brandId;
    let basketRequest: BasketRequest = new BasketRequest();
    basketRequest.orderId = this.slotBookingDetails.orderId;
    basketRequest.transactionSource = this.slotBookingDetails.paymentSource;
    basketRequest.totalOriginalAmount = this.slotBookingDetails.payment.originalAmount;
    basketRequest.totalFinalAmount = this.slotBookingDetails.payment.finalAmount;
    basketRequest.bookingSource = this.slotBookingDetails.bookingSource;
    basketRequest.parentProfileId = this.slotBookingDetails.parentProfileId;
    basketRequest.slotBookingDetailsList = new Array();
    basketRequest.slotBookingDetailsList.push(this.slotBookingDetails);
    let currentTimestamp: Date = new Date();
    this.slotBookingDetails.createdTimestamp = currentTimestamp.getTime();
    basketRequest.createdTimestamp = currentTimestamp.getTime();
    this.wellnessService.wellnessSlotBookingDetails = this.slotBookingDetails;
    this.router.navigate(['/app/wellness/wellness_slotbooking/wellness_slotsummary']);
  }

  resetError() {
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

  validateDate(e) {
    console.log(e);
    if (e.keyCode == 110 || e.keyCode == 9 || e.keyCode == 8) {
      // return;
    }
    if (('' + e.target.value).length >= 10) {
      e.preventDefault();
      return false;
    }
    if (e.keyCode == 191 || e.keyCode == 111) {
      // return;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  closeModel(id: string) {
    (<any>$(id)).modal('hide');
  }

  openModal(id: string) {
    (<any>$(id)).modal('show');
    $(".modal-backdrop").not(':first').remove();
  }


  ngOnDestroy() {
    this.wellnessService.wellnessSlotBookingDetails = this.slotBookingDetails;
    console.log('wellness' + JSON.stringify(this.wellnessService.slotBookingDetails));
    this.wellnessService.onlyPayment = false;
  }

}
