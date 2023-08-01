import { DiagnosticClient } from './../../../../model/diagnostics/diagnosticClient';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { DiagnosticsService } from '../../../diagnostics.service';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { Coordinates } from '../../../../model/poc/coordinates';
import { Location } from '../../../../model/profile/location';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { Config } from '../../../../base/config';

@Component({
  selector: 'slot-selection',
  templateUrl: './slotselection.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./slotselection.style.scss']
})
export class SlotSelectionComponent implements OnInit, OnDestroy {

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
  appId: number;
  slotBookingDetails: SlotBookingDetails;

  editAddress: Address = new Address();
  localityResponse: any;
  locationIndex: number = 0;
  errorMessagePopup: Array<string>;
  isErrorPopup: boolean;
  showMessagePopup: boolean;
  city: number;

  slotDate: Date = new Date();

  slotTimeList: any = new Array();
  selectedId: any;
  slotData: any = new Array;
  isAddNew: boolean = false;
  price: number = 0;
  selectedDayInNumber: number = 0;
  dropDownIndex: number = 0;
  dropDownIndex2: number = 0;
  spotBookingdropDownIndex: number = 0;
  spotBookingdropDownIndex2: number = 0;


  isCentralBooking: boolean = false;
  selectedPocId: any;
  diagnosticPocList: PocDetail[];
  isReceptionPrescription: boolean = false;
  doctorDetails: any;
  pocName: string;
  doctorName: string;
  homeOrderPriceDetails: any;
  crouselSelectedImage: String;
  prescriptionType = "";
  checkSupportOrder: boolean;
  enablePincode: boolean = false;
  pinCode: string = "";
  proceedback: boolean = false;
  dateProceedBack: boolean = true;
  spotBooking: boolean = false;
  enableSpotBook: boolean = false;
  slotTime: number = 0;
  slotTime2: number = 0;
  availableSlotDays: number = 7;
  splitSlots: boolean = false;
  enableInvoiceSplitting: boolean = false;
  srfTest: boolean = false;
  isEdit: boolean = false;
  fetchSlotDate: number = 0;
  spotTimeList: any[] = DiagnosticDeliveryAdviceTrack.SPOTBOOKING;
  spotBookingTimeList: any[] = [];
  isb2bUser: boolean = false;
  enableClientSelection: boolean = false;
  privilegeType: number = -1;
  clientIndex: number = -1;
  diagnosticClientList: DiagnosticClient[];
  packageSuggestions: boolean = false;
  packagefetchPincode: string = '';
  suggestedPackages: any[] = [];
  suggestedPackageList: any[] = [];
  enableMapsLink: boolean = false;
  viewMore: boolean = false;
  slotPriceinSlots: boolean = false;
  ageString: string = "";

  // isHomeCollections: boolean;
  selectedPocIndex: any = 0;
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

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private diagnosticsService: DiagnosticsService,
    private auth: AuthService, private commonUtil: CommonUtil, private _validation: ValidationUtil, private toast: ToasterService,
    private hsLocalStorage: HsLocalStorage, private receptionService: ReceptionService,
    private spinnerService: SpinnerService, private onboardingService: OnboardingService) {
    this.validation = _validation;
    this.searchedTests = new Array();
    this.pocId = auth.userAuth.pocId;
    this.city = auth.selectedPocDetails && auth.selectedPocDetails.address && auth.selectedPocDetails.address.city ? auth.selectedPocDetails.address.city : 0;
    this.appId = auth.userAuth.brandId;
    this.brandId = auth.selectedPocDetails.brandId;
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableSpotBooking) {
      this.enableSpotBook = true;
      this.enablePincode = true; // pincode enabled for vdc walkin central login
      if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableInvoiceSplitting)
        this.enableInvoiceSplitting = true;
      this.datepickerOpts.endDate = new Date(new Date().setDate(new Date().getDate() + 29));
      this.availableSlotDays = 30;
      this.getDiagnosticClients();
    }
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePackageSuggestions)
      this.packageSuggestions = true;
    this.fetchSlotDate = +this.commonUtil.convertDateToTimestamp(this.slotDate) - this.commonUtil.getTimezoneDifferential();
    if (Config.portal && Config.portal.customizations && Config.portal.customizations.enableMapsLink)
      this.enableMapsLink = true;
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.slotPriceinSlots)
      this.slotPriceinSlots = true;
  }

  ngOnInit(): void {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    this.isReceptionPrescription = this.diagnosticsService.isFromPriscription;
    this.slotBookingDetails = this.diagnosticsService.receptionPriscriptionDetails;
    console.log("slotBookingDetails .........." + JSON.stringify(this.slotBookingDetails))

    if (this.slotBookingDetails != undefined) {
      window.localStorage.setItem('isReceptionPrescription', cryptoUtil.encryptData(JSON.stringify(this.isReceptionPrescription)));
      window.localStorage.setItem('slotBookingDetails', cryptoUtil.encryptData(JSON.stringify(this.slotBookingDetails)));
      window.localStorage.setItem('scheduleId', cryptoUtil.encryptData(JSON.stringify(this.scheduleId)));
      this.setBackItems();
    } else {
      this.isReceptionPrescription = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('isReceptionPrescription')));
      this.slotBookingDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('slotBookingDetails')));
      this.scheduleId = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('scheduleId')));
      this.diagnosticsService.receptionPriscriptionDetails = this.slotBookingDetails;
      this.diagnosticsService.isFromPriscription = this.isReceptionPrescription;
    }
    if (this.isReceptionPrescription == true) {
      this.doctorDetails = this.slotBookingDetails.doctorDetail;
      this.setSelectedDoctorDetails(this.doctorDetails);

      this.slotBookingDetails.deliveryAddress.label = this.slotBookingDetails.deliveryAddress.addressType == Address.ADDRESS_HOME ? 'Home Address' :
        (this.slotBookingDetails.deliveryAddress.addressType == Address.ADDRESS_OFFICE ? 'OfficeAddress' :
          (this.slotBookingDetails.deliveryAddress.addressType == Address.ADDRESS_OTHER && (this.slotBookingDetails.deliveryAddress.label != undefined && this.slotBookingDetails.deliveryAddress.label != null &&
            this.slotBookingDetails.deliveryAddress.label.length > 0) ? this.slotBookingDetails.deliveryAddress.label : 'Other Address'))
      this.selectedProfileAddress.push(this.slotBookingDetails.deliveryAddress)
      this.selectedId = 1;

      this.diagnosticPocList = new Array();
      this.pocName = this.slotBookingDetails.pocDetails.pocName;
      this.pocId = this.slotBookingDetails.pocId;
      this.getTestName(this.slotBookingDetails)
      this.onDateSelected();
      this.setData();
    }

    if (this.slotBookingDetails && !this.isReceptionPrescription && !this.proceedback) {
      this.slotBookingDetails.pocId = 0;
      this.isCentralBooking = true;
      this.selectedPocId = -1;
      this.slotBookingDetails.empId = this.auth.employeeDetails.empId;
      this.slotBookingDetails.payment = new Payment();
      this.slotBookingDetails.doctorDetail = new DoctorDetails();
      this.isReceptionPrescription = true;
      this.checkSupportOrder = true;
      this.selectedRegisteredProfile.selfProfile.profileId = this.slotBookingDetails.patientProfileId;
      this.selectedRegisteredProfile.selectedProfile.profileId = this.slotBookingDetails.patientProfileId;
      this.selectedProfileAddress = this.slotBookingDetails.patientProfileDetails.contactInfo.addresses;
      if (this.slotBookingDetails.privilegeCardType && this.slotBookingDetails.privilegeCardType > 0) {
        this.privilegeType = this.slotBookingDetails.privilegeCardType;
      }
      if (this.slotBookingDetails.deliveryAddress) {
        this.getPocList(this.slotBookingDetails.deliveryAddress.pinCode);
        this.slotBookingDetails.patientProfileDetails.contactInfo.addresses.forEach((address, index) => {
          if (address.addressType == Address.ADDRESS_HOME) address.label = 'Home Address';
          if (address.addressType == Address.ADDRESS_OFFICE) address.label = 'OfficeAddress';
          if (address.pinCode == this.slotBookingDetails.deliveryAddress.pinCode && address.addressType == this.slotBookingDetails.deliveryAddress.addressType)
            this.selectedId = index + 1;
        })
      }
      this.getAge();
    }
    if (!(this.selectedRegisteredProfile && this.selectedRegisteredProfile.selfProfile && this.selectedRegisteredProfile.selfProfile.fName) && !(this.slotBookingDetails && this.slotBookingDetails.patientProfileDetails && this.slotBookingDetails.patientProfileDetails.fName)) {
      (<any>$('#registerPatientModal')).modal('show');
    } else {
      this.enableClientSelection = true;
      (<any>$('#registerPatientModal')).modal('hide');
    }
    if (!this.isReceptionPrescription) {
      this.activatedRoute.params.subscribe(params => {
        if (params && params['cb']) {
          this.diagnosticsService.isCentralBooking = this.isCentralBooking = params['cb'];
          this.diagnosticsService.isOnboardingBooking = true;
        }
        if (params && params['subType']) {
          this.diagnosticsService.slotBookingSubType = +params['subType'];
          this.diagnosticsService.isOnboardingBooking = true;
        }
      });

      if (this.diagnosticsService.slotBookingSubType != undefined) {
        let data = {
          'slotBookingSubType': this.diagnosticsService.slotBookingSubType,
          'isCentralBooking': (this.diagnosticsService.isCentralBooking ? this.diagnosticsService.isCentralBooking : false)
        };
        this.hsLocalStorage.saveComponentData(data);
      } else {
        this.diagnosticsService.slotBookingSubType = this.hsLocalStorage.getComponentData().slotBookingSubType;
        this.diagnosticsService.isCentralBooking = this.hsLocalStorage.getComponentData().isCentralBooking;
      }
      this.isCentralBooking = (this.diagnosticsService.isCentralBooking ? this.diagnosticsService.isCentralBooking : false);
      if (this.isCentralBooking) {
        if (!this.proceedback)
          this.pocId = 0;
        this.appId = this.auth.userAuth.brandId;
      }
      if (!this.proceedback) {
        this.slotTimeList = new Array();
        this.slotTimeList.push({
          "startTime": 0,
          "label": "No slots available"
        });
        this.selectedId = -1;
        this.selectedPocId = -1;
      }
    }
    if (!this.slotBookingDetails) {
      this.initializeSlotBookingDetails();
    }
    if (this.checkSupportOrder)
      this.isReceptionPrescription = false;

  }

  getAge() {
    if (this.slotBookingDetails.patientProfileDetails.dob != undefined && this.slotBookingDetails.patientProfileDetails.dob != null) {
      let ageYears = 0;
      let ageMonths = 0;
      if (isNaN(parseInt(this.commonUtil.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[0]))) {
        ageYears = 0;
      } else {
        ageYears = parseInt(this.commonUtil.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[0]);
      }
      if (isNaN(parseInt(this.commonUtil.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[1]))) {
        ageMonths = 0;
      } else {
        ageMonths = parseInt(this.commonUtil.getAgeForall(this.slotBookingDetails.patientProfileDetails.dob).split(",")[1]);
      }
      if (ageYears > 0 || ageMonths > 0)
        this.ageString = '' + ageYears + ' Years ' + ageMonths + ' Months';
    }
  }

  initializeSlotBookingDetails() {
    this.slotBookingDetails = new SlotBookingDetails();
    this.slotBookingDetails.pocId = this.pocId;
    this.slotBookingDetails.bookingSource = 3
    this.slotBookingDetails.paymentSource = 3;
    this.slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
    this.slotBookingDetails.bookingSubType = this.diagnosticsService.slotBookingSubType;
    if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
      this.slotBookingDetails.deliveryType = BasketConstants.DELIVERY_TYPE_HOME;
    }
    this.slotBookingDetails.serviceList = new Array();
    this.slotBookingDetails.empId = this.auth.employeeDetails.empId;
    this.slotBookingDetails.payment = new Payment();
    this.slotBookingDetails.doctorDetail = new DoctorDetails();
  }

  onRegisterNewUser(selectedProfile: SelectedRegisteredProfile) {
    console.log("Selected Profile: " + JSON.stringify(selectedProfile));
    this.selectedRegisteredProfile = selectedProfile;
    if (this.selectedRegisteredProfile.selfProfile.contactInfo && this.selectedRegisteredProfile.selfProfile.contactInfo != null
      && this.selectedRegisteredProfile.selfProfile.contactInfo.addresses
      && this.selectedRegisteredProfile.selfProfile.contactInfo.addresses != null) {
      this.selectedRegisteredProfile.selfProfile.contactInfo.addresses.forEach(address => {
        address.label = address.addressType == Address.ADDRESS_HOME ? 'Home Address' :
          (address.addressType == Address.ADDRESS_OFFICE ? 'OfficeAddress' :
            (address.addressType == Address.ADDRESS_OTHER && (address.label != undefined && address.label != null &&
              address.label.length > 0) ? address.label : 'Other Address'))
        this.selectedProfileAddress.push(address)
      });
    }
    this.saveSelectedProfile();
  }

  saveSelectedProfile() {
    this.resetError();
    this.slotBookingDetails.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.slotBookingDetails.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.slotBookingDetails.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
    this.slotBookingDetails.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
    this.slotBookingDetails.patientProfileDetails.contactInfo = this.selectedRegisteredProfile.selfProfile.contactInfo; // for alt no
    if (this.isCentralBooking && this.diagnosticsService.slotBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
      this.getPocList(this.auth.selectedPocDetails.address.pinCode);
    }
    this.getAge();
    this.enableClientSelection = true;
    this.isb2bUser = false;
  }

  searchBasedonPincode(e) {
    if (e.keyCode == 13) {
      if (this.pinCode.length != 6) {
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Enter proper pin code';
        this.isError = true;
        this.showMessage = true;
      }
    }
    if (this.pinCode.length == 6) {
      this.getPocList(this.pinCode);
    }
  }

  getPocList(pinCode: string) {
    console.log("this.diagnosticsService.slotBookingSubType: ", this.diagnosticsService.slotBookingSubType);
    let isHomeCollections;
    if (this.diagnosticsService.slotBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
      isHomeCollections = true;
    } else {
      isHomeCollections = false;
    }
    let request = {
      "pinCode": pinCode,
      "brandId": this.appId,
      "from": 0,
      "size": 100,
      "homeCollections": isHomeCollections
    };
    this.diagnosticPocList = new Array();
    this.resetError();
    this.spinnerService.start();
    this.diagnosticsService.getDiagnosticPocs(request)
      .then(data => {
        this.spinnerService.stop();
        if (data && data.length > 0) {
          this.diagnosticPocList = data;
          if (this.proceedback)
            this.setPocDetails();
        } else {
          this.diagnosticPocList = new Array();
          this.errorMessage = new Array();
          this.errorMessage[0] = 'No servicable diagnostic centers found';
          this.isError = true;
          this.showMessage = true;
        }
      })
      .catch(error => {
        console.error('Error occurred while fetching the diagnostic pocs', error);
      });
  }

  sliderImage(imageSrc, type) {
    this.prescriptionType = type;
    this.crouselSelectedImage = undefined;
    if (type == "pdf") {
      this.auth.openPDF(imageSrc)
    } else {
      $('#prescription-modal').css('height', 'none');
      this.crouselSelectedImage = imageSrc;
    }
  }

  setSelectedPocDetails(index) {
    if (index >= 0 && index < this.diagnosticPocList.length) {
      let pocDetails: PocDetail = this.diagnosticPocList[index];
      if (pocDetails && pocDetails.pocId > 0) {
        this.pocId = pocDetails.pocId;
        this.brandId = pocDetails.brandId;
        this.slotBookingDetails.pocId = pocDetails.pocId;
        this.slotBookingDetails.brandId = pocDetails.brandId;
        this.packagefetchPincode = pocDetails.address.pinCode;
        this.resetError();
      }
      this.changedTestCentre(index)
    }
  }

  changedTestCentre(index) {
    if (this.selectedPocIndex == 0) {
      this.selectedPocIndex = this.diagnosticPocList[index];
    }
    else if (this.diagnosticPocList.indexOf(this.selectedPocIndex) != index) {
      this.slotBookingDetails.serviceList = [];
      this.scheduleId = 0;
    }
  }

  getPackageSuggestions() {
    let serviceIds = [];
    this.slotBookingDetails.serviceList.forEach(service => { serviceIds.push(service.serviceId) });
    this.diagnosticsService.getPackageSuggestionsAsPerTests(serviceIds, this.packagefetchPincode).then(data => {
      console.log(JSON.stringify(data));
      this.spinnerService.stop();
      this.suggestedPackages = data;
      serviceIds.forEach(serviceId => {
        for (let i = 0; i < this.suggestedPackages.length; i++) {
          if (serviceId == this.suggestedPackages[i].serviceId && this.suggestedPackages[i].parentServiceId == 4)
            this.suggestedPackages[i].isBooked = true;
        }
      })
      this.setSuggestedPackages();
    });
  }

  onAddPackage(index) {
    console.log("index package", JSON.stringify(this.suggestedPackages[index]));
    this.getTestName(this.suggestedPackages[index]);
  }

  setSuggestedPackages() {
    if (this.viewMore)
      this.suggestedPackageList = this.suggestedPackages
    else if (this.suggestedPackages.length > 6 && !this.viewMore)
      this.suggestedPackageList = this.suggestedPackages.slice(0, 6);
    else
      this.suggestedPackageList = this.suggestedPackages;
  }

  onClickViewMore() {
    this.viewMore = !this.viewMore;
    this.setSuggestedPackages();
  }

  setSelectedDoctorDetails(doctorDetails: DoctorDetails) {
    this.slotBookingDetails.doctorId = doctorDetails.empId;
    this.slotBookingDetails.doctorDetail.empId = doctorDetails.empId;
    this.slotBookingDetails.doctorDetail.firstName = doctorDetails.firstName;
    this.slotBookingDetails.doctorDetail.lastName = doctorDetails.lastName ? doctorDetails.lastName : '';
    this.slotBookingDetails.doctorDetail.title = doctorDetails.title ? doctorDetails.title : "";
    let dot = doctorDetails.title.includes(".");
    this.doctorName = this.slotBookingDetails.doctorDetail.title + (dot ? '' : ".") + this.slotBookingDetails.doctorDetail.firstName + "" +
      this.slotBookingDetails.doctorDetail.lastName
  }

  onEditDoc() {
    this.doctorName = '';
    this.slotBookingDetails.doctorId = this.slotBookingDetails.doctorDetail.empId = 0;
    this.slotBookingDetails.doctorDetail.firstName = this.slotBookingDetails.doctorDetail.lastName = this.slotBookingDetails.doctorDetail.title = null;
  }

  searchTests(searchKeyword) {
    if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME &&
      (!this.slotBookingDetails.deliveryAddress || !this.slotBookingDetails.deliveryAddress.pinCode)) {
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Please Add/Select Address';
      this.isError = true;
      this.showMessage = true;
      $('html, body').animate({ scrollTop: '0px' }, 300);
      return;
    }

    if (this.pocId == 0) {
      if (this.isCentralBooking) {
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Please select a diagnostic center to proceed further';
        this.isError = true;
        this.showMessage = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      } else {
        this.pocId = this.auth.userAuth.pocId;
        this.slotBookingDetails.pocId = this.pocId;
        this.slotBookingDetails.brandId = this.brandId;
      }
    }
    if (this.isb2bUser && this.privilegeType <= 0) {
      if (this.slotBookingDetails.privilegeCardType && this.slotBookingDetails.privilegeCardType > 0) {
        this.privilegeType = this.slotBookingDetails.privilegeCardType;
      } else {
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Please select client';
        this.isError = true;
        this.showMessage = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      }
    }
    this.resetError();
    let searchRequest = new SearchRequest();
    searchRequest.from = 0;
    searchRequest.id = this.pocId;
    searchRequest.searchTerm = searchKeyword;
    searchRequest.size = 500;
    searchRequest.scheduleId = this.scheduleId;
    if (this.diagnosticsService.slotBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME || this.isReceptionPrescription == true) {
      searchRequest.homeCollections = true;
    } else {
      searchRequest.homeCollections = false;
    }

    if (searchKeyword.length > 2 && !this.isb2bUser) {
      this.diagnosticsService.searchScheduleTests(searchRequest).then((searchedTests) => {
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
    else if (searchKeyword.length > 2 && this.isb2bUser) {
      let req = {
        "privilegeType": this.privilegeType,
        "pocId": this.pocId,
        "searchTerm": searchKeyword,
        "status": this.slotBookingDetails.bookingSubType
      }
      this.diagnosticsService.searchB2BClientScheduleTests(req).then((searchedTests) => {
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
      && selectedInvestigation.serviceId > 0 || this.isReceptionPrescription == true) {
      let isServiceExist = false;

      if (this.slotBookingDetails.serviceList.length > 0) {
        this.slotBookingDetails.serviceList.forEach(service => {
          if (selectedInvestigation.serviceId == service.serviceId) {
            isServiceExist = true;
            alert("Test Name is already Added")
            return
          }
        });
      }

      if (isServiceExist == false || this.isReceptionPrescription == true) {
        let serviceItem: ServiceItem = new ServiceItem();
        if (selectedInvestigation.srfTest == true) {
          serviceItem.srfTest = selectedInvestigation.srfTest;
          this.srfTest = true;
        }
        else
          serviceItem.srfTest = false;
        serviceItem.serviceId = selectedInvestigation.serviceId;
        serviceItem.parentServiceId = serviceItem.categoryId = selectedInvestigation.parentServiceId;
        serviceItem.serviceName = selectedInvestigation.serviceName;
        serviceItem.parentServiceName = serviceItem.categoryName = selectedInvestigation.parentServiceName;
        if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
          if (this.isReceptionPrescription == true && selectedInvestigation.serviceList != undefined) {
            selectedInvestigation.serviceList.forEach(element => {
              this.homeOrderPriceDetails = element.homeOrderPriceDetails
            });
          }

          if (selectedInvestigation.homeOrderPriceDetails || this.homeOrderPriceDetails) {
            if (this.homeOrderPriceDetails) {
              serviceItem.grossPrice = this.homeOrderPriceDetails.grossPrice;
              serviceItem.discountPrice = this.homeOrderPriceDetails.discountPrice;
              serviceItem.netPrice = this.homeOrderPriceDetails.netPrice;
              serviceItem.taxes = this.homeOrderPriceDetails.taxes
            } else {
              serviceItem.grossPrice = selectedInvestigation.homeOrderPriceDetails.grossPrice;
              serviceItem.discountPrice = selectedInvestigation.homeOrderPriceDetails.discountPrice;
              serviceItem.netPrice = selectedInvestigation.homeOrderPriceDetails.netPrice;
              serviceItem.taxes = selectedInvestigation.homeOrderPriceDetails && selectedInvestigation.homeOrderPriceDetails.taxes;
              if (selectedInvestigation.note != undefined) {
                selectedInvestigation.note.forEach(e => {
                  serviceItem.precaution = e.title
                })
              }
            }
          } else {
            alert("Something went wrong. Not able to retrieve the test prices.");
            return;
          }
        } else if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
          if (selectedInvestigation.walkinOrderPriceDetails) {
            serviceItem.grossPrice = selectedInvestigation.walkinOrderPriceDetails.grossPrice;
            serviceItem.discountPrice = selectedInvestigation.walkinOrderPriceDetails.discountPrice;
            serviceItem.netPrice = selectedInvestigation.walkinOrderPriceDetails.netPrice;
            serviceItem.taxes = selectedInvestigation.walkinOrderPriceDetails.taxes;
            if (selectedInvestigation.note != undefined) {
              selectedInvestigation.note.forEach(e => {
                serviceItem.precaution = e.title
              })
            }
          } else {
            alert("Something went wrong. Not able to retrieve the test prices.");
            return;
          }
        }
        console.log("Check: " + JSON.stringify(this.slotBookingDetails.serviceList));
        // this.slotBookingDetails.serviceList.forEach(services => {
        //   if (services.serviceId != serviceItem.serviceId) {
        //     serviceItem.quantity = 1;
        //     this.slotBookingDetails.serviceList.push(serviceItem);
        //   }
        // })
        if (this.slotBookingDetails.serviceList != undefined && serviceItem.serviceName != undefined ) {
          serviceItem.quantity = 1;
          this.slotBookingDetails.serviceList.push(serviceItem);
        }
        console.log("Check: " + JSON.stringify(this.slotBookingDetails.serviceList));
        if (!this.isb2bUser)
          this.scheduleId = selectedInvestigation.scheduleId;
        else
          this.scheduleId = 0;
        if (this.slotBookingDetails != undefined && this.slotBookingDetails.serviceList != undefined && this.slotBookingDetails.serviceList.length > 0
          && this.scheduleId >= 0 || this.isReceptionPrescription == true) {
          //Network call to get slotdata with respect to test schedule.
          this.spinnerService.start();
          this.onDateSelected();
          this.checkSplitSlot();
          if (this.packageSuggestions && this.slotBookingDetails.serviceList.length > 1)
            this.getPackageSuggestions();
        }
      }
    }
  }

  getSlots(serviceIdList) {
    if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
      this.spinnerService.start();
      this.diagnosticsService.getHomeCollectionSlots(this.pocId, this.scheduleId, this.slotBookingDetails.deliveryAddress.pinCode, this.slotBookingDetails.deliveryAddress.area, serviceIdList, this.slotBookingDetails.parentProfileId, this.fetchSlotDate).then(data => {
        console.log(JSON.stringify(data));
        this.spinnerService.stop();
        if (data && (data.statusCode == 200 || data.statusCode == 201)) {
          this.slotData = data;
          this.setData();
        } else {
          alert(data.statusMessage);
        }
        this.spinnerService.stop();
      });
    } else if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
      this.spinnerService.start();
      this.diagnosticsService.getWalkInSlots(this.pocId, this.scheduleId, serviceIdList, this.slotBookingDetails.parentProfileId, this.fetchSlotDate).then(data => {
        console.log(JSON.stringify(data));
        this.spinnerService.stop();
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

  setData() {
    console.log("slotBookingDetails.serviceList: " + JSON.stringify(this.slotBookingDetails.serviceList));
    if (this.slotBookingDetails.serviceList != undefined) {
      for (let i = 0; i < this.slotData.serviceList && this.slotData.serviceList.length; i++) {
        for (let j = 0; j < this.slotBookingDetails.serviceList.length; j++) {
          if (this.slotData.serviceList[i].serviceId === this.slotBookingDetails.serviceList[j].serviceId) {
            this.slotData.serviceList[i].parentServiceId = this.slotBookingDetails.serviceList[j] ?
              this.slotBookingDetails.serviceList[j].parentServiceId : 0;
            this.slotData.serviceList[i].parentServiceName = this.slotBookingDetails.serviceList[j] ?
              this.slotBookingDetails.serviceList[j].parentServiceName : "";
          }
        }
        this.slotBookingDetails.serviceList = this.slotData.serviceList;
      }

    }

    console.log("slotBookingDetails--->: " + JSON.stringify(this.slotBookingDetails.serviceList));

    this.price = 0;
    //setting prices only for homecollection as by deafult prices are set for walkin on server side
    if (this.slotBookingDetails.serviceList != undefined) {
      this.slotBookingDetails.serviceList.forEach(service => {
        service.quantity = 1;
        if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
          service.grossPrice = service.homeOrderPriceDetails && service.homeOrderPriceDetails.grossPrice || service.grossPrice;
          service.netPrice = service.homeOrderPriceDetails && service.homeOrderPriceDetails.netPrice || service.netPrice;
          service.discountPrice = service.homeOrderPriceDetails && service.homeOrderPriceDetails.discountPrice || service.discountPrice;
        }
        this.price += +service.netPrice;
        console.log("Price: " + this.price);
      });
    }
    this.getSlotPerDate();
    if (this.slotTime != 0 && this.spotBooking) {
      this.timeCheckSpotBooking();
      let temp = this.spotBookingTimeList.findIndex(x => x.timeValue == this.slotTime);
      if (temp >= 0)
        this.spotBookingdropDownIndex = this.spotBookingTimeList[temp].timeValue;
    }
    if (this.slotTime2 != 0 && this.spotBooking) {
      this.timeCheckSpotBooking();
      let temp = this.spotBookingTimeList.findIndex(x => x.timeValue == this.slotTime2);
      if (temp >= 0)
        this.spotBookingdropDownIndex2 = this.spotBookingTimeList[temp].timeValue;
    }

    if (this.slotTime != 0) {
      let temp = this.slotTimeList.findIndex(x => x.startTime == this.slotTime);
      if (temp >= 0)
        this.dropDownIndex = this.slotTimeList[temp].startTime;
    } else {
      this.dropDownIndex = 0;
      this.slotTime = 0;
    }
    if (this.slotTime2 != 0) {
      let temp = this.slotTimeList.findIndex(x => x.startTime == this.slotTime2);
      if (temp >= 0)
        this.dropDownIndex2 = this.slotTimeList[temp].startTime;
    } else {
      this.dropDownIndex2 = 0;
      this.slotTime2 = 0;
    }
    this.spinnerService.stop();
  }

  onDateSelected() {
    this.resetError();
    this.selectedDayInNumber = this.commonUtil.convertDateToDayOfWeek(this.slotDate);
    let selectedDate = +this.commonUtil.convertDateToTimestamp(this.slotDate) - this.commonUtil.getTimezoneDifferential();
    console.log("onDateSelected: " + selectedDate);
    // if(this.slotBookingDetails.slotDate != selectedDate){
    //   this.slotTime=0;
    //   // if(this.slotBookingDetails.slotTime != undefined)
    //   // this.slotBookingDetails.slotTime=undefined;
    // }
    this.slotBookingDetails.slotDate = +selectedDate
    this.fetchSlotDate = +selectedDate;
    this.spotBookingdropDownIndex = 0;
    this.spotBookingdropDownIndex2 = 0;
    if (this.splitSlots) {
      this.slotBookingDetails.slotDate2 = +selectedDate;
      this.slotBookingDetails.slotTime2 = undefined;
      this.dropDownIndex2 = 0;
    }
    if (this.dateProceedBack) {
      this.slotBookingDetails.slotTime = undefined; //since 0 is the timestamp for 5:30A.M  
      this.slotTime = 0;
      this.slotTime2 = 0;
    }
    this.dateProceedBack = true;
    let serviceIdList = new Array();
    this.slotBookingDetails.serviceList.forEach(service => {
      serviceIdList.push(service.serviceId);
    });
    this.getSlots(serviceIdList);
    this.timeCheckSpotBooking();
  }

  getSlotPerDate() {
    if (this.slotData.slots) {
      for (let i = 0; i < this.slotData.slots.length; i++) {
        let date = this.slotData.slots[i];
        if (date.actualDate == this.fetchSlotDate) {
          let timingData = new Array();

          let currentTime = this.commonUtil.convertTimeToUTC(new Date()) - this.commonUtil.getTimezoneDifferential();

          date.dateSlots.forEach(timing => {
            console.log('current utc time = ' + currentTime);
            console.log('timing.time = ' + timing.time);

            console.log("slotTimeList: " + new Date(timing.time).getHours() + ">>>>>" + (new Date(timing.time).getMinutes()));
            console.log("Check: " + (timing.status == 0) +
              ">>>>>>>" + (timing.time > currentTime) +
              ">>>>>>" + (this.fetchSlotDate > (new Date().getTime())));


            if ((timing.status == 0) && ((timing.time > currentTime) || (this.fetchSlotDate > (new Date().getTime())))) {
              let slotTiming = {
                "startTime": timing.time,
                "endTime": timing.expireTime,
                "slotPrice": 0,
                "label": (new Date(timing.time).getHours() + ":" + (new Date(timing.time).getMinutes() < 10 ? '0' : '') + new Date(timing.time).getMinutes() + " - "
                  + new Date(timing.expireTime).getHours() + ":" + (new Date(timing.expireTime).getMinutes() < 10 ? '0' : '') + new Date(timing.expireTime).getMinutes())
              };
              if (this.slotPriceinSlots) {
                slotTiming.slotPrice = timing.slotPrice;
              }
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

  onTimeSelected(selectedTime, number) {
    this.resetError();
    if (selectedTime == 0) {
      this.slotBookingDetails.slotTime = undefined;
    }
    else if (number == 1) {
      this.slotBookingDetails.slotTime = selectedTime;
    }
    else
      this.slotBookingDetails.slotTime2 = selectedTime;
    if (this.slotPriceinSlots) {
      let i = this.slotTimeList.findIndex(e => e.startTime == selectedTime);
      this.slotBookingDetails.deliveryAmount = this.slotTimeList[i].slotPrice;
    }
    let originalAmount: number = 0;
    let otherDiscountAmount: number = 0;
    let finalAmount: number = 0;
    let tempService;
    this.slotBookingDetails.serviceList.forEach(service => {
      if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
        tempService = service.homeOrderPriceDetails;
      } else if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN) {
        tempService = service.walkinOrderPriceDetails;
      } if (tempService && tempService.dayBasedPricing) {
        tempService.dayBasedPricing.forEach(day => {
          if (day.dayOfWeek == this.selectedDayInNumber) {
            day.timeBasedPricing.forEach(timeInterval => {
              if (selectedTime >= timeInterval.fromTime && selectedTime < timeInterval.toTime) {
                console.log("SelectedTime: " + selectedTime);
                console.log("timeInterval: " + timeInterval.fromTime + ">>>>>>" + timeInterval.toTime);
                service.grossPrice = timeInterval.grossPrice;
                service.netPrice = timeInterval.netPrice;
                service.discountPrice = timeInterval.discountPrice;
                service.taxes = timeInterval.taxes;
                originalAmount = +originalAmount + +timeInterval.grossPrice;
                if (timeInterval.discountPrice && timeInterval.discountPrice > 0) {
                  otherDiscountAmount = +otherDiscountAmount + +timeInterval.discountPrice;
                } else {
                  timeInterval.discountPrice = 0;
                }
                finalAmount = +finalAmount + +timeInterval.netPrice;
                this.price = finalAmount;
                console.log("FinalAmount: " + finalAmount);
              }
            })
          }
        })
      }
    });
    this.slotBookingDetails.payment.originalAmount = originalAmount;
    this.slotBookingDetails.payment.otherDiscountAmount = otherDiscountAmount;
    this.slotBookingDetails.payment.taxationAmount = 0;
    this.slotBookingDetails.payment.packageDiscountAmount = 0;
    this.slotBookingDetails.payment.finalAmount = finalAmount;
  }

  setPrice() {

  }

  selectedAddressType() {
    let isFound: boolean = false;
    let addressType = this.editAddress.addressType;
    if (this.editAddress != null && this.editAddress.addressType != undefined && this.editAddress.addressType > -1 &&
      this.editAddress.addressType != Address.ADDRESS_OTHER) {
      this.selectedProfileAddress.forEach(item => {
        if (item.addressType == this.editAddress.addressType) {
          this.editAddress = JSON.parse(JSON.stringify(item));
          isFound = true;
        }
      });
    }
    if (!isFound) {
      this.editAddress = new Address();
      this.editAddress.addressType = addressType;
      this.isEdit = true;
    }
    else
      this.isEdit = false;
  }

  setSelectedAddress(index: number) {
    console.log("Index: " + index + ">>>>>" + JSON.stringify(this.selectedProfileAddress[index - 1]));
    this.localityResponse = null;
    this.locationIndex = 0;

    if (index == 0) {
      this.editAddress = new Address();
      this.editAddress.addressType = -1;
      this.slotBookingDetails.deliveryAddress = null;
      this.isAddNew = true;
      (<any>$("#updateAddress")).modal("show");
    }
    else if (this.selectedProfileAddress[index - 1] && this.selectedProfileAddress[index - 1].addressId != 0 && this.selectedProfileAddress[index - 1].addressId > -1 && this.selectedProfileAddress != undefined && this.selectedProfileAddress != null) {
      this.selectedProfileAddress.forEach(address => {
        if (this.selectedProfileAddress[index - 1].addressId == address.addressId) {
          this.slotBookingDetails.deliveryAddress = address;
          if (this.isCentralBooking) {
            this.getPocList(address.pinCode);
          }
        }
      });
    } else {
      this.slotBookingDetails.deliveryAddress = null;
    }
    this.slotBookingDetails.serviceList = new Array();
    this.slotTimeList = new Array();
    this.slotTimeList.push({
      "startTime": 0,
      "label": "No slots available"
    });
  }

  modifyAddress(address: Address) {
    this.isAddNew = false;
    this.localityResponse = null;
    this.locationIndex = 0;
    this.editAddress = JSON.parse(JSON.stringify(address));
    if (this.editAddress && this.editAddress.pinCode) {
      this.searchByPinCode(this.editAddress.pinCode, false);
    }
    (<any>$("#updateAddress")).modal("show");
  }

  close() {
    if (this.isAddNew)
      this.selectedId = -1;
  }

  closeModel(id: string) {
    (<any>$(id)).modal('hide');
  }

  openModal(id: string) {
    (<any>$(id)).modal('show');
    $(".modal-backdrop").not(':first').remove();
  }


  saveAddress() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    this.isErrorPopup = false;
    this.showMessagePopup = false;
    this.errorMessagePopup = new Array();
    if (this.editAddress.addressType == undefined || this.editAddress.addressType < 0) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please select Address Type";
      return;
    }
    if (this.editAddress.addressType == Address.ADDRESS_OTHER && (this.editAddress.label == undefined || this.editAddress.label == null || this.editAddress.label.length == 0)) {
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a name for this address";
      return;
    }
    if (this.editAddress.address1 == undefined || this.editAddress.address1 == null || this.editAddress.address1 == "") {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please add Address";
      return;
    }
    if (this.locationIndex == -1 || this.editAddress.areaName == undefined || this.editAddress.areaName == null || this.editAddress.area == 0 || this.editAddress.areaName == '') {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please add Area";
      return;
    }
    // making landmark optional for yoda 
    if ((this.editAddress.landmark == undefined || this.editAddress.landmark == null || this.editAddress.landmark == "") && !this.enableMapsLink) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please add Landmark";
      return;
    }
    if (this.editAddress.pinCode == undefined || this.editAddress.pinCode == null || this.editAddress.pinCode == "" || this.editAddress.pinCode.length < 6) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a valid pin code";
      return;
    }

    //fetching lat lon from maps link
    if (this.enableMapsLink && this.editAddress.mapsLink != undefined && this.editAddress.mapsLink.length) {
      let link = this.editAddress.mapsLink.split('@')[1];
      if (link == undefined) {
        this.isErrorPopup = true;
        this.showMessagePopup = true;
        this.errorMessagePopup[0] = "Please enter proper map link";
        return;
      }
      let latlon = link.split(',');
      this.editAddress.locationCoordinates = new Coordinates();
      this.editAddress.locationCoordinates.lon = parseFloat(latlon[1]);
      this.editAddress.locationCoordinates.lat = parseFloat(latlon[0]);
      this.editAddress.location = new Location();
      this.editAddress.location.coordinates = new Array();
      this.editAddress.location.coordinates.push(parseFloat(latlon[1]));
      this.editAddress.location.coordinates.push(parseFloat(latlon[0]));
    }

    this.localityResponse = null;
    this.locationIndex = 0;
    if (this.editAddress.pinCode != undefined && this.editAddress.pinCode.length == 6 && this.editAddress.city > 0) {
      let addressRequest: UpdateAddress = new UpdateAddress();
      addressRequest.profileId = this.selectedRegisteredProfile.selfProfile.profileId;
      addressRequest.address = this.editAddress;
      this.spinnerService.start();
      this.receptionService.saveAddress(addressRequest).then(response => {
        this.spinnerService.stop();
        if (response.statusCode >= 400) {
          this.isError = true;
          this.showMessage = true;
          this.errorMessage[0] = response.statusMessage;
        } else {
          let isFound: boolean = false;
          for (let i = 0; i < this.selectedProfileAddress.length; i++) {
            if (response.address.addressId == this.selectedProfileAddress[i].addressId) {
              this.selectedProfileAddress[i] = response.address;
              this.selectedId = i + 1;
              isFound = true;
              break;
            }
          }
          if (!isFound) {
            let tempAddress = response.address;
            tempAddress.label = tempAddress.addressType == Address.ADDRESS_HOME ? 'Home Address' :
              (tempAddress.addressType == Address.ADDRESS_OFFICE ? 'OfficeAddress' :
                (tempAddress.addressType == Address.ADDRESS_OTHER ? tempAddress.label : 'Other Address'))
            if (!this.selectedRegisteredProfile.selfProfile.contactInfo.addresses
              && this.selectedRegisteredProfile.selfProfile.contactInfo.addresses == null) {
              this.selectedRegisteredProfile.selfProfile.contactInfo.addresses = new Array();
            }
            this.selectedRegisteredProfile.selfProfile.contactInfo.addresses.push(tempAddress);
            this.selectedProfileAddress.push(tempAddress);

            console.log("this.tempselectedProfileAddress: " + JSON.stringify(this.selectedProfileAddress))
            for (let i = 0; i < this.selectedProfileAddress.length; i++) {
              if (response.address.addressId == this.selectedProfileAddress[i].addressId) {
                this.selectedId = i + 1;
              }
            }
          }
          this.slotBookingDetails.deliveryAddress = response.address;
          if (this.isCentralBooking) {
            this.getPocList(this.slotBookingDetails.deliveryAddress.pinCode);
          }
          this.isError = false;
          this.showMessage = false;
          this.errorMessage[0] = "";
          alert("Address saved successfully");
          this.slotBookingDetails.serviceList = new Array();

          (<any>$("#updateAddress")).modal("hide");
        }
      });
    } else {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a valid pin code";
      return;
    }
  }


  searchByPinCode(pinCode: any, pincodeChanged: boolean) {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || pinCode.length == 6) {
      this.spinnerService.start();
      this.localityResponse = null;
      this.locationIndex = -1;
      this.onboardingService.getStateCityByPinCode(pinCode).then(response => {
        if (response.length > 0) {
          if (pincodeChanged) {
            this.editAddress.city = response[0].cityId;
            this.editAddress.cityName = response[0].cityName;
            this.editAddress.state = response[0].stateId;
            this.editAddress.stateName = response[0].stateName;
          }
          this.localityResponse = response[0].localityList;
          this.locationIndex = response[0].localityList.findIndex(e => { return e.name == this.editAddress.areaName; });
        }
        this.spinnerService.stop();
      });
    }
  }

  onLocationChange() {
    if (this.localityResponse && this.localityResponse.length > 0 && this.locationIndex >= 0) {
      let index = this.locationIndex;
      this.editAddress.area = this.localityResponse[index].id;
      this.editAddress.areaName = this.localityResponse[index].name;
      console.log('Selected area is ' + this.editAddress.areaName);
      console.log('Selected areaID is ' + this.editAddress.area);
      // adding lat lon for yoda if maps link and landmark missing 
      if (this.enableMapsLink && (this.editAddress.mapsLink == undefined || this.editAddress.mapsLink.length == 0) && (this.editAddress.landmark == undefined || this.editAddress.landmark.length == 0)) {
        this.editAddress.locationCoordinates = new Coordinates();
        this.editAddress.locationCoordinates.lon = this.localityResponse[index].lon;
        this.editAddress.locationCoordinates.lat = this.localityResponse[index].lat;
        this.editAddress.location = new Location();
        this.editAddress.location.coordinates = new Array();
        //this.editAddress.location.coordinates.push(this.localityResponse[index].lon);
        //this.editAddress.location.coordinates.push(this.localityResponse[index].lat);
      }
    }
  }

  remove(index: number): void {
    this.resetError();
    if (this.packageSuggestions) {
      for (let i = 0; i < this.suggestedPackages.length; i++) {
        if (this.suggestedPackages[i].serviceId == this.slotBookingDetails.serviceList[index].serviceId && this.suggestedPackages[i].parentServiceId == 4) {
          this.suggestedPackages[i].isBooked = false;
          this.setSuggestedPackages();
          break;
        }
      }
    }
    this.slotBookingDetails.serviceList.splice(index, 1);
    if (this.slotBookingDetails.serviceList.length == 0) {
      this.scheduleId = 0;
      this.srfTest = false;
      this.slotTimeList = new Array();
      this.slotTimeList.push({
        "startTime": 0,
        "label": "No slots available"
      });
      this.price = 0;
    } else {
      this.price = 0;
      let srf = false;
      let serviceIdList = new Array();
      this.slotBookingDetails.serviceList.forEach(service => {
        this.price += +service.netPrice;
        serviceIdList.push(service.serviceId);
        if (service.srfTest)
          srf = true;
      });
      srf ? this.srfTest = true : this.srfTest = false;
      this.getSlots(serviceIdList);
    }
    this.searchTestsTotal = 0;
    this.dropDownIndex = 0;
    this.dropDownIndex2 = 0;
    this.spotBookingdropDownIndex = 0;
    this.spotBookingdropDownIndex2 = 0;
    this.checkSplitSlot();
  }

  continueToPayment() {
    this.resetError();
    $('html, body').animate({ scrollTop: '0px' }, 300);
    if (this.spotBooking) {
      if (this.slotTime == 0) {
        this.errorMessage[0] = 'Please select the slot';
        this.isError = true;
        this.showMessage = true;
        return;
      }
      this.slotBookingDetails.slotTime = this.slotTime;
      this.slotBookingDetails.spotBooking = true;
      if (this.splitSlots) {
        if (this.slotTime == this.slotTime2) {
          this.errorMessage[0] = 'Both slots cannot have same time';
          this.isError = true;
          this.showMessage = true;
          return;
        }
        if ((this.slotTime2 - this.slotTime) < 6600000) {
          this.errorMessage[0] = '2hrs gap required between slots';
          this.isError = true;
          this.showMessage = true;
          return;
        }
        this.slotBookingDetails.slotTime2 = this.slotTime2;
      }
    }
    if (this.splitSlots) {
      this.slotBookingDetails.slotDate2 = this.slotBookingDetails.slotDate;
      if (this.slotBookingDetails.slotTime2 == undefined || this.slotBookingDetails.slotTime2 == 0) {
        this.errorMessage[0] = 'Please select the second slot';
        this.isError = true;
        this.showMessage = true;
        return;
      }
      if (this.slotBookingDetails.slotTime == this.slotBookingDetails.slotTime2) {
        this.errorMessage[0] = 'Both slots cannot have same time';
        this.isError = true;
        this.showMessage = true;
        return;
      }
      if (this.slotBookingDetails.slotTime > this.slotBookingDetails.slotTime2) {
        this.errorMessage[0] = 'second slot time cannot be before first slot ';
        this.isError = true;
        this.showMessage = true;
        return;
      }
      if ((this.slotBookingDetails.slotTime2 - this.slotBookingDetails.slotTime) < 6600000) {
        this.errorMessage[0] = '2hrs gap required between slots';
        this.isError = true;
        this.showMessage = true;
        return;
      }
    }
    else {
      this.slotBookingDetails.slotDate2 = 0;
      this.slotBookingDetails.slotTime2 = 0;
    }
    if (this.slotBookingDetails.patientProfileId == undefined || this.slotBookingDetails.patientProfileId <= 0) {
      this.errorMessage[0] = 'Please select the patient';
      this.isError = true;
      this.showMessage = true;
      (<any>$('#registerPatientModal')).modal('show');
      return;
    }
    if (this.slotBookingDetails.doctorDetail.firstName == undefined || this.slotBookingDetails.doctorDetail.firstName == null) {
      this.errorMessage[0] = 'Please add Doctor';
      this.isError = true;
      this.showMessage = true;
      return;
    }
    if (this.slotBookingDetails.serviceList == undefined || this.slotBookingDetails.serviceList == null
      || this.slotBookingDetails.serviceList.length <= 0) {
      this.errorMessage[0] = 'Please select atleast one test';
      this.isError = true;
      this.showMessage = true;
      return;
    }

    if (this.isb2bUser && this.privilegeType == 0) {
      this.errorMessage[0] = 'Please select client';
      this.isError = true;
      this.showMessage = true;
      return;
    }

    if (this.srfTest && (this.slotBookingDetails.srfId == null || this.slotBookingDetails.srfId == undefined || this.slotBookingDetails.srfId == '')) {
      this.errorMessage[0] = 'Please add SRF-ID';
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

    if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME &&
      (this.slotBookingDetails.deliveryAddress == undefined || this.slotBookingDetails.deliveryAddress == null
        || this.slotBookingDetails.deliveryAddress.addressId == 0)) {
      this.errorMessage[0] = 'Please select a delivery address';
      this.isError = true;
      this.showMessage = true;
      return;
    }

    if (!this.srfTest)
      this.slotBookingDetails.srfId = '';

    if (!this.isb2bUser) {
      this.slotBookingDetails.privilegeCardType = 0;
      this.slotBookingDetails.clientName = '';
    }

    if (this.enableInvoiceSplitting) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('firstClient', cryptoUtil.encryptData(JSON.stringify(this.isb2bUser)));
    }

    this.slotBookingDetails.brandId = this.brandId;
    this.slotBookingDetails.bookingPocId = this.auth.userAuth.pocId;
    this.slotBookingDetails.empId = this.auth.employeeDetails.empId;
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
    this.spinnerService.start();
    this.diagnosticsService.calculateBasket(basketRequest).then(data => {
      this.spinnerService.stop();
      this.slotBookingDetails = data.slotBookingDetailsList[0];
      basketRequest.totalFinalAmount = this.slotBookingDetails.payment.finalAmount;
      this.diagnosticsService.slotBookingDetails = this.slotBookingDetails;
      this.scheduleId > 0 ? this.diagnosticsService.scheduleId = this.scheduleId : '';
      if (data.statusCode == 201 || data.statusCode == 200) {
        this.router.navigate(['/app/diagnostics/slotbooking/slotsummary']);
      }
      else {
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = data && data.slotBookingDetailsList && data.slotBookingDetailsList.length > 0 ? data.slotBookingDetailsList[0].statusMessage : data.statusMessage;
        this.isError = true;
        this.showMessage = true;
      }
    });

  }

  resetError() {
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

  validateDate(e) {
    console.log(e);

    if (e.keyCode == 110 || e.keyCode == 9 || e.keyCode == 8) {
      return false;
    }
    if (('' + e.target.value).length >= 10) {
      e.preventDefault();
      return false;
    }
    if (e.keyCode == 191 || e.keyCode == 111) {
      return false;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    window.localStorage.removeItem('slotBookingDetails');
    this.diagnosticsService.receptionPriscriptionDetails = null;
  }

  setBackItems() {
    if (!this.slotBookingDetails.slotTime)
      return;
    if (this.slotBookingDetails.srfId && this.slotBookingDetails.srfId.length)
      this.srfTest = true;
    this.enableClientSelection = true;
    this.proceedback = true;
    this.dateProceedBack = false;
    this.doctorDetails = this.slotBookingDetails.doctorDetail;
    if (this.slotBookingDetails.slotTime != undefined && this.slotBookingDetails.slotTime != null) {
      this.slotTime = this.slotBookingDetails.slotTime;
      this.slotTime2 = this.slotBookingDetails.slotTime2;
      this.slotDate = this.slotBookingDetails.slotDate ? new Date((this.slotBookingDetails.slotDate)) : this.slotDate;
    }
    this.spotBooking = this.slotBookingDetails.spotBooking;
    this.setSelectedDoctorDetails(this.doctorDetails);
    this.checkSplitSlot();
    this.slotBookingDetails.payment = new Payment();
    this.selectedRegisteredProfile.selfProfile.profileId = this.slotBookingDetails.patientProfileId;
    this.selectedRegisteredProfile.selectedProfile.profileId = this.slotBookingDetails.patientProfileId;
    this.selectedProfileAddress = this.slotBookingDetails.patientProfileDetails.contactInfo.addresses;
    if (this.slotBookingDetails.bookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
      if (this.slotBookingDetails.deliveryAddress) {
        this.getPocList(this.slotBookingDetails.deliveryAddress.pinCode);
        this.slotBookingDetails.patientProfileDetails.contactInfo.addresses.forEach((address, index) => {
          if (address.addressType == Address.ADDRESS_HOME) address.label = 'Home Address';
          if (address.addressType == Address.ADDRESS_OFFICE) address.label = 'OfficeAddress';
          if (address.pinCode == this.slotBookingDetails.deliveryAddress.pinCode && address.addressType == this.slotBookingDetails.deliveryAddress.addressType)
            this.selectedId = index + 1;
        })
      }
    }
    else {
      this.getPocList(this.auth.selectedPocDetails.address.pinCode);
    }
    this.getAge();
  }

  setPocDetails() {
    this.selectedPocId = this.diagnosticPocList.findIndex(x => x.pocId == this.slotBookingDetails.pocId);
    this.setSelectedPocDetails(this.selectedPocId);
    this.scheduleId = this.diagnosticsService.scheduleId;
    this.onDateSelected();
  }

  enableSpotBooking(val) {
    this.spotBooking = val;
    if (val)
      this.toast.show('Spot Booking Enabled', "bg-success text-white font-weight-bold", 3000);
  }

  timeCheckSpotBooking() {
    if (this.slotBookingDetails.slotDate == this.commonUtil.convertOnlyDateToTimestamp(new Date)) {
      let currentTime = this.commonUtil.convertTimeToUTC(new Date()) - this.commonUtil.getTimezoneDifferential();
      this.spotBookingTimeList = this.spotTimeList.filter(doc => doc.timeValue >= currentTime);
    }
    else
      this.spotBookingTimeList = this.spotTimeList;
  }

  onSpotTimeSelected(val, index) {
    if (index == 1) {
      this.slotTime = val;
    }
    else
      this.slotTime2 = val;
  }

  checkSplitSlot() {
    if (this.slotBookingDetails.serviceList.length == 0 || !this.enableInvoiceSplitting) {
      this.splitSlots = false;
      return;
    }
    this.diagnosticsService.splitOrder(this.slotBookingDetails).then(slotList => {
      slotList.length > 1 ? this.splitSlots = true : this.splitSlots = false;
    });
  }

  onChooseAddress(addressResponse) {
    addressResponse = JSON.parse(JSON.stringify(addressResponse));
    if (addressResponse && addressResponse.formatted_address) {
      this.editAddress.landmark = addressResponse.formatted_address;
      this.isEdit = false;
      if (addressResponse.address_components && addressResponse.address_components.length > 0) {
        let filteredArr = addressResponse.address_components.filter(itm => itm.types && itm.types && itm.types.length > 0 && itm.types[0] == "postal_code");
        if (filteredArr && filteredArr.length > 0) {
          this.editAddress.pinCode = filteredArr[0].short_name;
          this.searchByPinCode(this.editAddress.pinCode, true);
        }
      }
      // if google map link for yoda missing then landmark latlon is considering
      if (this.enableMapsLink && this.editAddress.mapsLink != undefined && this.editAddress.mapsLink.length) {
        return;
      }

      if (addressResponse.geometry) {
        this.editAddress.locationCoordinates = new Coordinates();
        this.editAddress.locationCoordinates.lon = addressResponse.geometry.location.lng;
        this.editAddress.locationCoordinates.lat = addressResponse.geometry.location.lat;
        this.editAddress.location = new Location();
        this.editAddress.location.coordinates = new Array();
        this.editAddress.location.coordinates.push(addressResponse.geometry.location.lng);
        this.editAddress.location.coordinates.push(addressResponse.geometry.location.lat);
      }
    }
  }

  onClickEditAddressLandmark() {
    this.isEdit = true;
  }

  getDiagnosticClients() {
    // 2- clients & 1- general
    this.diagnosticsService.getDiagnosticClients(2).then(response => {
      this.diagnosticClientList = response;
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      let firstClient = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('firstClient')));
      if (firstClient) {
        this.isb2bUser = true;
        this.clientIndex = this.diagnosticClientList.findIndex(e => { return e.privilegeType == this.slotBookingDetails.privilegeCardType });
      }
    }).catch(err => {
      console.error("Error occurred while fetching the client list", err);
    })
  }

  checkb2bUser(num) {
    this.slotBookingDetails.serviceList = new Array();
    if (num == 1)
      this.isb2bUser = true;
    else {
      this.isb2bUser = false;
      this.clientIndex = -1;
      this.privilegeType = 0;
      this.slotBookingDetails.privilegeCardType = 0;
      this.slotBookingDetails.clientName = '';
    }
  }

  onClientChange(index) {
    this.clientIndex = index;
    this.slotBookingDetails.serviceList = new Array();
    if (index == -1) {
      this.privilegeType = 0;
      this.slotBookingDetails.privilegeCardType = 0;
      this.slotBookingDetails.b2bUserOrder = 0;
      this.slotBookingDetails.clientName = '';
      return;
    }
    this.resetError();
    this.slotBookingDetails.privilegeCardType = this.privilegeType = this.diagnosticClientList[index].privilegeType;
    this.slotBookingDetails.b2bUserOrder = 2;
    if (this.slotBookingDetails.payment) {
      this.slotBookingDetails.payment = new Payment();
    }
    this.slotBookingDetails.payment.creditUser = this.diagnosticClientList[index].creditType && this.diagnosticClientList[index].creditType > 0 ? this.diagnosticClientList[index].creditType : 0;
    this.slotBookingDetails.clientName = this.diagnosticClientList[index].clientName;
  }

}