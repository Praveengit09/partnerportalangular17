import { DiagnosticsService } from './../../../diagnostics/diagnostics.service';
import { OnboardingService } from './../../../onboarding/onboarding.service';
import { BasketConstants } from './../../../constants/basket/basketconstants';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SelectedRegisteredProfile } from './../../../model/profile/selectedRegisteredProfile';
import { CommonUtil } from './../../../base/util/common-util';
import { BasketResponse } from './../../../model/basket/basketResponse';
import { AuthService } from './../../../auth/auth.service';
import { Address } from './../../../model/profile/address';
import { Router } from '@angular/router';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { ReceptionService } from './../../../reception/reception.service';
import { CryptoUtil } from './../../../auth/util/cryptoutil';
import { Payment } from './../../../model/basket/payment';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { Doctor } from '../../../model/employee/doctor';
import { DoctorDetails } from '../../../model/employee/doctordetails';
import { ServiceDetail } from '../../../model/employee/servicedetail';
import { UpdateAddress } from '../../../model/profile/updateAddress';
import { ValidationUtil } from '../../../base/util/validation-util';
import { DoctorService } from '../../../doctor/doctor.service';
import { EmployeePocMapping } from '../../../model/employee/employeepocmapping';
import { Config } from './../../../base/config';


@Component({
  selector: 'homeConsultRequest',
  templateUrl: './homeConsultRequest.template.html',
  styleUrls: ['./homeConsultRequest.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeConsultationRequestComponent implements OnInit {

  slotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  selectedServiceIndex: number = 0;
  selectedSubServiceIndex: number = 0;
  providerDropDownIndex: number = 0;
  errorMessagePopup: Array<string>;
  isErrorPopup: boolean;
  showMessagePopup: boolean;
  error_Message: string = ' ';
  pocId: number;
  empId: number;

  dropDownIndex1: number = 0;
  dropDownIndex2: number = 0;
  transactionId: any;
  homeConsultationFee: number = 0;
  // transactionTypeIndex: number = 2;
  diagnosticPurchaseType: number = 1;
  patientAddressList: Array<Address>;
  consultationAddress: Address;
  basketResponse: BasketResponse;
  response: SlotBookingDetails;
  patientPriscription: any;
  editAddress: Address = new Address();
  featureEdit: number;
  disabled: boolean = false;
  enableFeeChange: boolean = false;
  selectedDoctorIndex: number;
  rejectedHomeConsultOrderTrack: SlotBookingDetails;
  selectedDoctorServiceIndex: number = 0;
  providerErrorMessage: string = ' ';
  filteredDoctorList: Doctor[] = new Array<Doctor>();
  selectedDoctor: DoctorDetails = new DoctorDetails();
  selectedDoctorService: ServiceDetail = new ServiceDetail();
  doctorServiceList: Array<ServiceDetail>;
  doctorSubServiceList: Array<any>;
  selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
  doctorList: Doctor[] = new Array<Doctor>();
  basketRequest: BasketRequest = new BasketRequest();
  date: Date = new Date();
  enable_Error: boolean = false;
  checkTime: boolean;
  addressIndex: number = -1;
  fromTime: Date = new Date(1970, 0, 1);
  time: Date = new Date(1970, 0, 1);
  time_From: string;
  fromMinutes: any;
  services: Array<any> = new Array<any>();
  fromTimeTimeStamp: number;
  locFromTime: number = -this.commonUtil.getTimezoneDifferential();
  TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();
  validation: any;
  selectedService: ServiceDetail;
  selectedSubService: ServiceDetail;
  pocList: Array<EmployeePocMapping>;
  selectedPoc: any;

  // date: Date = new Date(2016, 5, 10);

  datepickerOpts = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy'
  }


  constructor(
    private receptionService: ReceptionService, private onboardingService: OnboardingService, private validationUtil: ValidationUtil,
    private authService: AuthService,
    private router: Router, private commonUtil: CommonUtil, private spinnerService: SpinnerService, private diagnosticService: DiagnosticsService, private doctorService: DoctorService) {
    // this.config = config.getConfig();
    this.validation = validationUtil;
    this.pocId = this.authService.userAuth.pocId;
    this.empId = this.authService.userAuth.employeeId;
    this.slotBookingDetails.pocId = this.pocId;
    this.slotBookingDetails.empId = this.empId;
    this.slotBookingDetails.bookingPocId = this.pocId;
    this.slotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_DOCTOR_SLOT;
    this.slotBookingDetails.bookingSubType = BasketConstants.DOCTOR_BOOKING_SUBTYPE_HOME_CONSULTATION;
    this.slotBookingDetails.bookingSource = this.basketRequest.bookingSource = 3;
    this.slotBookingDetails.paymentSource = 3;


  }


  ngOnInit() {

    this.rejectedHomeConsultOrderTrack = this.receptionService.rejectedHomeConsultOrderTrack;
    console.log('@@@@' + JSON.stringify((this.rejectedHomeConsultOrderTrack)));
    if (this.rejectedHomeConsultOrderTrack != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('rejectedHomeConsultOrderTrack', cryptoUtil.encryptData(JSON.stringify(this.rejectedHomeConsultOrderTrack)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('rejectedHomeConsultOrderTrack') != null) {
        this.rejectedHomeConsultOrderTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('rejectedHomeConsultOrderTrack')));
      }
    }
    this.getDoctorservicelist();

    if (this.rejectedHomeConsultOrderTrack != undefined && this.rejectedHomeConsultOrderTrack.orderId != undefined && this.rejectedHomeConsultOrderTrack.orderId != null) {
      this.selectedRegisteredProfile.selectedProfile.fName = this.rejectedHomeConsultOrderTrack.patientProfileDetails.fName;
      var checkTimeValidation = this.commonUtil.dateAndTimeValidation(this.rejectedHomeConsultOrderTrack.slotDate, this.rejectedHomeConsultOrderTrack.slotTime);
      if (checkTimeValidation == -1) {
        this.date = new Date();
        var initialTime = new Date('January 1, 1970');
        this.fromTime = new Date(initialTime.getTime());
      }
      else if (checkTimeValidation == 1 || checkTimeValidation == 0) {
        this.date = new Date(this.rejectedHomeConsultOrderTrack.slotDate);
        this.fromTime = new Date(this.rejectedHomeConsultOrderTrack.slotTime);
      }
      this.enableFeeChange = true;
      this.homeConsultationFee = this.rejectedHomeConsultOrderTrack.payment.finalAmount;
      this.slotBookingDetails.patientProfileId = this.rejectedHomeConsultOrderTrack.patientProfileId;
      this.slotBookingDetails.parentProfileId = this.rejectedHomeConsultOrderTrack.parentProfileId;
      this.slotBookingDetails.patientRelationship = this.rejectedHomeConsultOrderTrack.patientRelationship;
      this.slotBookingDetails.deliveryAddress = this.rejectedHomeConsultOrderTrack.deliveryAddress;
      this.slotBookingDetails.orderId = this.rejectedHomeConsultOrderTrack.orderId;
      this.slotBookingDetails.invoiceId = this.rejectedHomeConsultOrderTrack.invoiceId;
      this.slotBookingDetails.doctorDetail = this.rejectedHomeConsultOrderTrack.doctorDetail;

    }
    if (this.selectedRegisteredProfile.selfProfile != null)
      this.patientAddressList = this.selectedRegisteredProfile.selfProfile.contactInfo.addresses;
    // this.pocList = this.selectedDoctor.employeePocMappingList;
    // this.selectedPoc = this.pocList[this.pocList.findIndex(e => { return e.pocId == this.pocId })];
  }

  getDoctorservicelist(): void {
    this.receptionService.getAllDoctorServices().then((services) => {
      let serviceList = this.authService.selectedPocDetails.serviceList;
      this.doctorServiceList = services.filter(e => {
        let serviceIndex = serviceList.findIndex(ex => { return ex.serviceId == e.serviceId });
        return serviceIndex > 0 ? serviceList[serviceIndex].serviceId == e.serviceId : false;
      });
      console.log('services' + JSON.stringify(this.doctorServiceList));

      if (this.rejectedHomeConsultOrderTrack != undefined && this.rejectedHomeConsultOrderTrack.orderId != undefined && this.rejectedHomeConsultOrderTrack.orderId != null) {
        for (let i = 0; i < this.doctorServiceList.length; i++) {
          if (this.rejectedHomeConsultOrderTrack.parentServiceId == this.doctorServiceList[i].serviceId) {
            this.selectedServiceIndex = i + 1;
          }
        }
        this.onServiceSelected(this.selectedServiceIndex);

      }

    });

  }

  getDoctorSubServiceList(): void {
    this.error_Message = '';
    this.doctorSubServiceList = new Array<any>();
    this.receptionService.getDoctorSubServiceList(this.pocId, this.selectedService.serviceId).then((subservices) => {
      if (subservices.length > 0) {
        this.doctorSubServiceList = subservices;
        if (this.rejectedHomeConsultOrderTrack != undefined && this.rejectedHomeConsultOrderTrack.orderId != undefined && this.rejectedHomeConsultOrderTrack.orderId != null) {
          for (let i = 0; i < this.doctorSubServiceList.length; i++) {
            if (this.rejectedHomeConsultOrderTrack.serviceId == this.doctorSubServiceList[i].serviceId) {
              this.selectedSubServiceIndex = i + 1;
              console.log('###1' + this.selectedServiceIndex);
            }
          }

          this.onSubServiceSelected(this.selectedSubServiceIndex);
        }
      }
      else {

        this.error_Message = 'This service has no subServices,Please select another service';
      }

    });
  }

  getservicebasedDoctorList(): void {
    this.receptionService.getServiceBasedDoctorList(this.pocId, this.selectedSubService.serviceId, this.empId).then((doctor) => {
      this.filteredDoctorList = doctor;
      if (this.filteredDoctorList.length > 0) {
        if (this.rejectedHomeConsultOrderTrack != undefined && this.rejectedHomeConsultOrderTrack.orderId != undefined && this.rejectedHomeConsultOrderTrack.orderId != null) {
          for (let i = 0; i < this.filteredDoctorList.length; i++) {
            if (this.rejectedHomeConsultOrderTrack.doctorDetail.empId == this.filteredDoctorList[i].empId) {
              this.providerDropDownIndex = i + 1;
              console.log('###1' + this.selectedServiceIndex);
            }
          }
          this.onDoctorSelected(this.providerDropDownIndex);
          // this.onDoctorSelected(this.providerDropDownIndex);
        }
      }
      else {
        this.providerErrorMessage = 'This subService has no Providers,Please select another subService';
      }

    });
  }

  onServiceSelected(index) {
    this.providerErrorMessage = ' ';
    this.error_Message = '';
    this.resetErrorMessage();
    this.selectedSubServiceIndex = 0;
    this.providerDropDownIndex = 0;
    this.selectedService = this.doctorServiceList[index - 1];
    this.selectedServiceIndex = index;
    if (this.selectedService != undefined) {
      this.slotBookingDetails.parentServiceId = this.selectedService.serviceId;
      this.slotBookingDetails.parentServiceName = this.selectedService.serviceName;
      this.getDoctorSubServiceList();
    }
  }

  onSubServiceSelected(count) {
    this.resetErrorMessage();
    this.providerDropDownIndex = 0
    this.providerErrorMessage = ' ';
    this.selectedSubService = this.doctorSubServiceList[count - 1];
    this.selectedSubServiceIndex = count;
    if (this.selectedSubService != undefined) {
      this.slotBookingDetails.serviceId = this.selectedSubService.serviceId;
      this.slotBookingDetails.serviceName = this.selectedSubService.serviceName;
      this.getservicebasedDoctorList();
    }

  }

  onDoctorSelected(index) {
    this.resetErrorMessage();
    if (index > 0) {
      this.selectedDoctor = this.filteredDoctorList[index - 1];
      console.log('**selecteddoctor' + JSON.stringify(this.selectedDoctor));
      this.slotBookingDetails.doctorId = this.selectedDoctor.empId;
      if (this.enableFeeChange == false) {
        var tempServiceList = this.selectedDoctor.employeePocMappingList[this.selectedDoctor.employeePocMappingList.findIndex(e => { return e.pocId == this.pocId })];
        this.homeConsultationFee = this.slotBookingDetails.payment.originalAmount =
          this.slotBookingDetails.payment.finalAmount
          = tempServiceList.serviceList[tempServiceList.serviceList.findIndex(e => { return e.serviceId == this.slotBookingDetails.serviceId })].homeConsultationFee;

      }
    }
    else {
      this.homeConsultationFee = 0;
    }
    this.enableFeeChange = false;
  }

  onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.selectedRegisteredProfile = selectedRegisteredProfile;
    // this.saveSelectedProfile();
    this.patientAddressList = this.selectedRegisteredProfile.selfProfile.contactInfo.addresses;
    this.slotBookingDetails.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
    this.slotBookingDetails.parentProfileId = this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
    this.slotBookingDetails.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
  }

  setSelectedAddress(featureEdit: number) {
    let addressId;
    if (this.addressIndex != 0 && this.addressIndex != -1) {
      addressId = this.patientAddressList[this.addressIndex - 1].addressId;
    }
    console.log(this.addressIndex)
    console.log('addressId' + addressId);
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (this.addressIndex > 0) {
      this.patientAddressList.forEach(
        address => {
          if (address.addressId == addressId) {
            if (featureEdit == 2) {
              this.consultationAddress = address;
              console.log("#$" + JSON.stringify(this.consultationAddress));
            }
          }
          // this.slotBookingDetails.deliveryAddress = this.consultationAddress;
        });
    } else if (this.addressIndex == 0) {
      this.addressIndex = -1;
      this.consultationAddress = null;
      console.log("featureEdit=================");
      this.featureEdit = featureEdit;
      this.editAddress = new Address();
      this.editAddress.addressType = -1;
      // this.consultationAddress=this.editAddress;
      (<any>$("#updateAddress")).modal("show");
      console.log("!!" + JSON.stringify(this.consultationAddress));

    } else {
      if (featureEdit == 2) {
        this.consultationAddress = null;
      }
    }
    this.slotBookingDetails.deliveryAddress = this.consultationAddress;
  }

  modifyAddress(address: Address) {
    this.editAddress = JSON.parse(JSON.stringify(address));
    // console.log("@@"+JSON.stringify())
    this.slotBookingDetails.deliveryAddress = this.editAddress;

    (<any>$("#updateAddress")).modal("show");
  }

  searchByPinCode(pinCode: any) {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || pinCode.length == 6) {
      this.spinnerService.start();
      this.onboardingService.getStateCityByPinCode(pinCode).then(response => {
        if (response.length > 0) {
          this.editAddress.city = response[0].cityId;
          this.editAddress.cityName = response[0].cityName;
          this.editAddress.state = response[0].stateId;
          this.editAddress.stateName = response[0].stateName;
          this.editAddress.area = response[0].localityList[0].id;
          this.editAddress.areaName = response[0].localityList[0].name;
        }
        this.spinnerService.stop();
      });
    }
  }
  saveAddress() {

    this.isErrorPopup = false;
    this.showMessagePopup = false;
    this.errorMessagePopup = new Array();
    if (this.editAddress.addressType == undefined || this.editAddress.addressType < 0) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please select Address Type";
      return;
    }
    if (this.editAddress.address1 == undefined || this.editAddress.address1 == null || this.editAddress.address1.length == 0) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please select Address1";
      return;
    }
    if (this.editAddress.address2 == undefined || this.editAddress.address2 == null || this.editAddress.address2.length == 0) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please select Address2";
      return;
    }
    if (this.editAddress.addressType == Address.ADDRESS_OTHER && (this.editAddress.label == undefined || this.editAddress.label == null || this.editAddress.label.length == 0)) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a name for this address";
      return;
    }
    if (this.editAddress.pinCode != undefined && this.editAddress.pinCode.length == 6 && this.editAddress.city > 0) {
      let addressRequest: UpdateAddress = new UpdateAddress();
      addressRequest.profileId = this.selectedRegisteredProfile.selectedProfile.profileId;
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
          if (this.patientAddressList != null || this.patientAddressList != undefined) {
            for (let i = 0; i < this.patientAddressList.length; i++) {
              let item = this.patientAddressList[i];
              if (item.addressId == response.address.addressId) {
                this.patientAddressList[i] = item = response.address;
                if (this.consultationAddress != undefined && this.consultationAddress != null && this.consultationAddress.addressId == response.address.addressId) {
                  this.consultationAddress = item;
                }
                isFound = true;
                break;
              }
            }
          }
          if (!isFound) {
            if (this.patientAddressList == null || this.patientAddressList == undefined) {
              this.patientAddressList = new Array<Address>();
            }
            this.patientAddressList.push(response.address);
            this.consultationAddress = response.address;
            this.slotBookingDetails.deliveryAddress = this.consultationAddress;
          }
          if (this.featureEdit == 1) {
            this.consultationAddress = response.address;
          }
          // } else if (this.featureEdit == 2) {
          //   this.diagnosticAddress = response.address;
          // }
          this.isError = false;
          this.showMessage = true;
          // this.consultationAddress=this.editAddress;
          // this.patientAddressList.push(this.consultationAddress);
          let temp = this.consultationAddress.addressId;

          this.patientAddressList.forEach((item, i) => {
            if (item.addressId == temp) {
              this.addressIndex = i + 1;
            }

          });


          this.errorMessage[0] = "Address updated successfully!";
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
  selectedAddressType() {
    let isFound: boolean = false;
    let addressType = this.editAddress.addressType;

    // this.editAddress = new Address();
    if (this.editAddress != null && this.editAddress.addressType != undefined && this.editAddress.addressType > -1 && this.editAddress.addressType != Address.ADDRESS_OTHER) {
      if (this.patientAddressList != null || this.patientAddressList != undefined) {
        this.patientAddressList.forEach(item => {
          if (item.addressType == this.editAddress.addressType) {
            this.editAddress = JSON.parse(JSON.stringify(item));
            isFound = true;
          }
        });
      }

    }
    if (!isFound) {
      this.editAddress = new Address();
      this.editAddress.addressType = addressType;
    }
  }


  goToHomeConsultationList() {
    this.router.navigate(['app/reception/homeconsult/listing']);
  }
  onDateSelected() {
    if (this.date > new Date()) {
      this.resetErrorMessage();
    }
    this.onFromTimeSelected();
  }
  onAmountChange() {
    this.resetErrorMessage();
  }

  onTime() {

    this.resetErrorMessage();
  }

  enableError() {
    // this.enable_Error = true;
  }

  onFromTimeSelected() {
    this.resetErrorMessage();
    var checkDateAndTime = this.commonUtil.dateAndTimeValidation(this.date, this.fromTime);
    // if (this.enable_Error == true) {
    if (checkDateAndTime == -1) {

      this.setErrorMessage("Please Select Correct Time  !!");
      return false;
    }
    else if (checkDateAndTime == 1 || checkDateAndTime == 0) {
      this.onTime();
      return true;
    }
    return false;
    // }
  }

  raiseRequest(type = 'raise request') {
    var date = new Date(this.date.getFullYear(), this.date.getMonth(),
      this.date.getDate(), 0, 0, 0).getTime();
    let fromTime = this.fromTime.getTime();
    this.slotBookingDetails.slotDate = 0;
    this.slotBookingDetails.slotDate = date;
    this.slotBookingDetails.slotTime = fromTime;
    this.slotBookingDetails.payment.paymentStatus = Payment.PAYMENT_STATUS_NOT_PAID;
    this.basketRequest.slotBookingDetailsList[0] = this.slotBookingDetails;
    this.slotBookingDetails.payment.originalAmount = this.slotBookingDetails.payment.finalAmount = this.homeConsultationFee;
    // = this.selectedDoctor.serviceList[this.selectedDoctor.serviceList.findIndex(e => 
    //   { return e.serviceId == this.slotBookingDetails.serviceId })].homeConsultationFee;
    // = this.selectedDoctor.homeConsultationFee;
    // if (this.transactionTypeIndex == Payment.PAYMENT_TYPE_CARD
    //   || this.transactionTypeIndex == Payment.PAYMENT_TYPE_CASH
    //   || this.transactionTypeIndex == Payment.PAYMENT_TYPE_PHONEPE
    //   || this.transactionTypeIndex == Payment.PAYMENT_TYPE_GOOGLE_PAY
    //   || this.transactionTypeIndex == Payment.PAYMENT_TYPE_PAYTM) {
    //   this.slotBookingDetails.payment.transactionType = this.transactionTypeIndex;
    //   this.slotBookingDetails.payment.transactionId = this.transactionId;
    //   this.basketRequest.transactionType = this.transactionTypeIndex;
    //   this.basketRequest.transactionId = this.transactionId;
    // }
    // else if (this.transactionTypeIndex == Payment.PAYMENT_TYPE_MOBILE) {
    //   this.slotBookingDetails.payment.transactionType =  Payment.PAYMENT_TYPE_MOBILE;
    //   this.basketRequest.transactionType = Payment.PAYMENT_TYPE_MOBILE;
    // }

    console.log('Slot Date and Time is ' + (this.slotBookingDetails.slotDate));

    if (this.slotBookingDetails.patientProfileId == null || this.slotBookingDetails.patientProfileId == undefined) {
      this.setErrorMessage("Please select a Patient !!");
      return;
    }

    else if (this.slotBookingDetails.parentServiceId == null || this.slotBookingDetails.parentServiceId == undefined || this.selectedServiceIndex == null || this.selectedServiceIndex == undefined || this.selectedServiceIndex == 0) {
      this.setErrorMessage("Please select a Service !!");
      return;
    }



    else if (this.slotBookingDetails.serviceId == null || this.slotBookingDetails.parentServiceId == undefined || this.selectedSubServiceIndex == null || this.selectedSubServiceIndex == undefined || this.selectedSubServiceIndex == 0) {
      if (this.error_Message == '') {
        this.setErrorMessage("Please select a Sub-Service !!");
        return;
      }
      else {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;

      }

    }


    else if (this.slotBookingDetails.doctorId == null || this.slotBookingDetails.doctorId == undefined || this.providerDropDownIndex == 0) {

      if (this.providerErrorMessage == ' ') {
        this.setErrorMessage("Please Select a Provider !!");
        return;
      }
      else {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      }
    }


    else if (this.onFromTimeSelected() == false) {
      return;
    }
    else if (this.slotBookingDetails.deliveryAddress == undefined || this.slotBookingDetails.deliveryAddress == null) {
      this.setErrorMessage("Please select address for Home Consultation.");
      return;
    }
    else if (this.homeConsultationFee == undefined || this.homeConsultationFee == 0 || this.homeConsultationFee == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Total Amount Payable must be greater than zero";
      this.showMessage = true;
      return;
    }

    else {
      this.resetErrorMessage();
    }
    this.spinnerService.start();
    this.doctorService.UpdateHomeConsultationStatus(this.slotBookingDetails).then(basketresp => {
      this.spinnerService.stop();
      this.response = basketresp;
      if (this.response.statusCode == 200 || this.response.statusCode == 201) {
        this.response = new SlotBookingDetails();
        type == 'raise request' ? window.alert("Request added Successfully") : window.alert("Order Cancelled Successfully!!!");
        this.goToHomeConsultationList();
      }
      // else {
      //   window.alert("Something went wrong please try again...!!")
      // }
    }).catch(() => {
      this.spinnerService.stop();
    })


  }

  cancelRequest() {
    this.slotBookingDetails.cancellationStatus = 2;
    this.raiseRequest('cancel');
  }
  validateNumberWithMaxWithDigit(id: string, e, maxValue: number = 10000) {
    let val = this.getNumberValue(id);
    if (val >= maxValue && (
      (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)
    )) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  getNumberValue(id: string): number {
    return ($(id).val() != undefined
      && $(id).val() != null
      && $(id).val().toString() != null
      && $(id).val().toString() != "")
      ? parseInt($(id).val().toString())
      : 0;
  }

  validateNumber(id: string, e) {
    console.log(e);
    if (e.keyCode == 110 || e.keyCode == 9) {
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

  resetErrorMessage() {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }


  setErrorMessage(setErrorMessageAs): void {
    this.isError = true;
    this.errorMessage = new Array();
    this.errorMessage[0] = setErrorMessageAs;
    this.showMessage = true;
  }



  closeModel(id: string) {
    console.log(id + " closed");
    $(id).on('hidden.bs.modal', function (e) {
      if ($('body').hasClass('modal-open')) {

      } else {
        $('.modal-backdrop').remove();
      }
    });
    (<any>$(id)).modal('hide');
  }



  ngOnDestroy(): void {
    this.rejectedHomeConsultOrderTrack = new SlotBookingDetails();
    this.receptionService.rejectedHomeConsultOrderTrack = new SlotBookingDetails();
  }

} 