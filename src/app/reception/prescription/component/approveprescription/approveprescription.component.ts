import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { CommonUtil } from '../../../../base/util/common-util';
import { ReceptionService } from './../../../../reception/reception.service';
import { OnboardingService } from './../../../../onboarding/onboarding.service';
import { ConsumerApprovalRequest } from '../../../../model/reception/prescription/consumerApprovalRequest';
import { Address } from '../../../../model/profile/address';
import { PurchaseDetails } from './../../../../model/reception/prescription/purchaseDetails';
import { PriscriptionApprovalRequest } from '../../../../model/reception/prescription/prescriptionApprovalRequest';
import { UpdateAddress } from '../../../../model/profile/updateAddress';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { Coordinates } from '../../../../model/poc/coordinates';
import { Location } from '../../../../model/profile/location';
import { AuthService } from '../../../../auth/auth.service';
import { DiagnosticsService } from '../../../../diagnostics/diagnostics.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { Payment } from '../../../../model/basket/payment';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { ProfileDetailsVO } from '../../../../model/profile/profileDetailsVO';
import { Config } from '../../../../base/config';

@Component({
  selector: 'approve-prescription',
  templateUrl: './approveprescription.template.html',
  styleUrls: ['./approveprescription.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class ApprovePrescriptionComponent implements OnInit {
  config: any;

  errorMessage: Array<string>;
  diagnoMessage: Array<string>;
  pharmacyMessage: Array<string>
  isError: boolean;
  showMessage: boolean;

  errorMessagePopup: Array<string>;
  isErrorPopup: boolean;
  showMessagePopup: boolean;

  patientPriscription: any;
  consumerApprovalRequest: ConsumerApprovalRequest = new ConsumerApprovalRequest();
  editAddress: Address = new Address();
  localityResponse: any;
  locationIndex: number = 0;
  pharmacyAddress: Address;
  diagnosticAddress: Address;
  pharmacyPoc: any;
  diagnosticPoc: any;
  pharmacyPurchaseType: number = 1;
  diagnosticPurchaseType: number = 1;
  validation: any;
  common: any;
  patientAddressList: Array<Address>;
  serviceList: Array<number>;
  pocList: Array<PocDetail>;
  pocListt: Array<PocDetail>;
  pocList1: Array<any>;
  pocList2: Array<any>;
  serviceIdList: Array<any>;
  serviceIdList1: Array<any>;
  featureEdit: number;// 1 - Pharmacy, 2 - diagnostic
  homeDelivery: boolean = true;
  pocId: number;
  diagnosticSchedulelist: Array<any>;
  empId: number;
  addressId: number;
  netPrice: any;
  cancelOrder: boolean;
  brandId: number;
  appId: number;
  receptionSlotBookingDetails: SlotBookingDetails;
  slotTimeList: any = new Array();
  selectedId: any;
  selectedPocId: any;
  slotDate: Date = new Date();
  homeorderNetprice: number;
  netPriceDetail: number;
  pharmacyPurchase: boolean;
  productName: any[] = [];
  diagnosticName: any[] = [];
  allPocListDetails: any = [];
  diagnosticPocDetails: any = [];
  sepRouteFlow: boolean = false;

  constructor(private auth: AuthService, private receptionService: ReceptionService, private authService: AuthService, private onboardingService: OnboardingService,
    private _validation: ValidationUtil, private router: Router, private _common: CommonUtil,
    private diagnosticsService: DiagnosticsService, private spinnerService: SpinnerService) {
    this.validation = _validation;
    this.common = _common;
    this.appId = auth.userAuth.brandId;
    this.brandId = auth.selectedPocDetails.brandId;
    // console.log("brandId" + JSON.stringify(this.brandId));
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableSeperateRouteFlow)
      this.sepRouteFlow = true;
  }

  getpocListDetails(homeCollection: boolean) {
    if (this.sepRouteFlow) {
      let req = {
        doctorId: this.patientPriscription.doctorId,
        pocType: 0,
        longitude: this.authService.selectedPocDetails.address.locationCoordinates.lon,
        latitude: this.authService.selectedPocDetails.address.locationCoordinates.lat,
        cityId: this.authService.selectedPocDetails.address.city,
        homeCollections: homeCollection,
        from: 0,
        size: 50,
        brandId: this.brandId,
        serviceListId: []
      }
      this.allPocListDetails = [];
      this.diagnosticPocDetails = [];

      if (this.patientPriscription.showDiagnostic) {
        req.pocType = 23;
        this.patientPriscription.investigationAdvises.investigationList.forEach(res => {
          req.serviceListId.push(res.serviceId)
        });

        this.productName.filter(res => res.isSelected == true);
        this.receptionService.PocDetails(req).then(response => {

          response.brandPocs.forEach(element => {
            element.details.pocName = element.details.pocName + " (Brand)";
            this.diagnosticPocDetails.push(element);
          });

          response.favouritePartners.forEach(element => {
            let a = false;
            this.diagnosticPocDetails.forEach(e => {
              if (e.pocName == element.details.pocName + " (Brand)") {
                e.pocName = element.pocName + " (Brand, Favorites)";
                a = true;
              }
            });

            if (a == false) {
              element.details.pocName = element.details.pocName + " (Favorites)";
              this.diagnosticPocDetails.push(element.details);
            }
          });

          response.diagnosticNearByPocs.forEach(element => {
            let a = false;
            this.diagnosticPocDetails.forEach(e => {
              if (e.pocName == element.pocName + " (Brand)") {
                e.pocName = element.pocName + " (Brand, NearBy)";
                a = true;
              }

              else if (e.pocName == element.pocName + " (Favorites)") {
                e.pocName = element.pocName + " (Favorites, NearBy)";
                a = true;
              }

              else if (e.pocName == element.pocName + " (Brand, Favorites)") {
                e.pocName = element.pocName + " (Brand, Favorites, NearBy)";
                a = true;
              }
            });

            if (a == false) {
              element.pocName = element.pocName + " (NearBy)";
              this.diagnosticPocDetails.push(element);
              console.log(element);
            }
          });
        });
      }
      else {
        req.pocType = 22;
        this.receptionService.PocDetails(req).then(response => {

          response.brandPocs.forEach(element => {
            element.details.pocName = element.details.pocName + " (Brand)";
            this.allPocListDetails.push(element);
          });

          response.favouritePartners.forEach(element => {
            let a = false;
            this.allPocListDetails.forEach(e => {
              if (e.pocName == element.details.pocName + " (Brand)") {
                e.pocName = element.details.pocName + " (Brand, Favorites)";
                a = true;
              }
            });

            if (a == false) {
              element.details.pocName = element.details.pocName + " (Favorites)";
              this.allPocListDetails.push(element.details);
              console.log(element);
            }
          });

          response.pharmacyNearByPocs.forEach(element => {
            let a = false;
            this.allPocListDetails.forEach(e => {
              if (e.pocName == element.pocName + " (Brand)") {
                e.pocName = element.pocName + " (Brand, NearBy)";
                a = true;
              }

              else if (e.pocName == element.pocName + " (Favorites)") {
                e.pocName = element.pocName + " (Favorites, NearBy)";
                a = true;
              }

              else if (e.pocName == element.pocName + " (Brand, Favorites)") {
                e.pocName = element.pocName + " (Brand, Favorites, NearBy)";
                a = true;
              }
            });

            if (a == false) {
              element.pocName = element.pocName + " (NearBy)";
              this.allPocListDetails.push(element);
              console.log(element);
            }
          });
        });
        console.log(this.allPocListDetails);
      }
    }
  }

  ngOnInit() {
    (<any>$)("#success").modal({ show: false, backdrop: 'static' });
    this.patientPriscription = this.receptionService.patientPriscriptionDetails;
    this.empId = this.authService.userAuth.employeeId;
    console.log("serviceList---> " + JSON.stringify(this.patientPriscription));

    if (this.patientPriscription != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('patientPriscription', cryptoUtil.encryptData(JSON.stringify(this.patientPriscription)));
    } else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('patientPriscription') != null) {
        this.patientPriscription = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('patientPriscription')));
      }
    }
    if (this.patientPriscription.patientAddress != undefined && this.patientPriscription.patientAddress != null) {
      this.patientAddressList = this.patientPriscription.patientAddress;
    } else {
      this.patientAddressList = new Array();
    }
    this.pocList1 = new Array();
    this.pocList2 = new Array();
    if (this.patientPriscription.pharmacyAdvises && this.patientPriscription.pharmacyAdvises.routedToPoc != undefined && this.patientPriscription.pharmacyAdvises.routedToPoc != null) {
      for (let i = 0; i < this.patientPriscription.pharmacyAdvises.routedToPoc.length; i++) {
        if (this.patientPriscription.pharmacyAdvises.routedToPoc[i].pharmacyHomeDeliveryAvailable == true) {
          this.pocList = this.patientPriscription.pharmacyAdvises.routedToPoc;
        }
        this.pocList1.push(this.patientPriscription.pharmacyAdvises.routedToPoc[i].pocName)
        this.pocList = this.patientPriscription.pharmacyAdvises.routedToPoc;
      };
    } else {
      this.pocList = new Array();

    }
    if (this.patientPriscription.investigationAdvises && this.patientPriscription.investigationAdvises.routedToPoc != undefined && this.patientPriscription.investigationAdvises.routedToPoc != null) {
      for (let i = 0; i < this.patientPriscription.investigationAdvises.routedToPoc.length; i++) {
        if (this.patientPriscription.investigationAdvises.routedToPoc[i].diagnosticSampleCollectionAvailable == true) {
          this.pocListt = this.patientPriscription.investigationAdvises.routedToPoc;
        }
        this.pocList2.push(this.patientPriscription.investigationAdvises.routedToPoc[i].pocName);
      }
    } else {
      this.pocListt = new Array();
    }
    let len = this.patientPriscription.investigationAdvises.investigationList ? this.patientPriscription.investigationAdvises.investigationList.length : 0;
    for (let i = 0; i < len; i++) {
      if (this.patientPriscription.investigationAdvises.investigationList[i].homeCollections == 0) {
        this.homeDelivery = false;
      }
    }

    this.serviceIdList = new Array<number>();
    if (this.patientPriscription.investigationAdvises && this.patientPriscription.investigationAdvises.investigationList != undefined && this.patientPriscription.investigationAdvises.investigationList != null) {
      for (let i = 0; i < this.patientPriscription.investigationAdvises.investigationList.length; i++) {
        this.serviceIdList.push(this.patientPriscription.investigationAdvises.investigationList[i].serviceId)
      };
    }


    console.log("Approve---> " + JSON.stringify(this.patientPriscription.pharmacyAdvises));

    if (this.sepRouteFlow) {
      if ((this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != undefined || this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != null) && this.patientPriscription.pharmacyAdvises.pharmacyAdviceList.length > 0) {
        this.productName = this.patientPriscription.pharmacyAdvises.pharmacyAdviceList;
        console.log(this.patientPriscription.pharmacyAdvises.pharmacyAdviceList);
        this.productName.forEach(element => {
          element.isSelected = true;
        });
      }

      if ((this.patientPriscription.investigationAdvises.investigationList != undefined || this.patientPriscription.investigationAdvises.investigationList != null) && this.patientPriscription.investigationAdvises.investigationList.length > 0) {
        this.diagnosticName = this.patientPriscription.investigationAdvises.investigationList;
        this.diagnosticName.forEach(element => {
          element.isSelected = true;
        });
      }

      if (this.patientPriscription.prescriptionPharmacyHomeDeliveryEnabled) {
        this.getpocListDetails(false);
      }

    }
  }

  slotBookingDetails() {
    this.receptionSlotBookingDetails = new SlotBookingDetails();
    this.receptionSlotBookingDetails.appId = this.appId;
    this.receptionSlotBookingDetails.brandId = this.brandId;
    this.receptionSlotBookingDetails.bookingSource = 3
    this.receptionSlotBookingDetails.paymentSource = 3;
    this.receptionSlotBookingDetails.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
    this.receptionSlotBookingDetails.bookingSubType = SlotBookingDetails.DIAGNOSTICS_BOOKING_SUB_TYPE_HOME;
    this.receptionSlotBookingDetails.doctorId = this.patientPriscription.doctorId;
    this.receptionSlotBookingDetails.bookingPocId = this.patientPriscription.bookingPocId;
    this.pocListt.forEach(e => {
      this.pocId = e.pocId;
    })

    this.receptionSlotBookingDetails.pocId = this.pocId;
    this.receptionSlotBookingDetails.bookingPocId = this.patientPriscription.bookingPocId;
    this.receptionSlotBookingDetails.parentProfileId = this.patientPriscription.parentProfileId;
    this.receptionSlotBookingDetails.patientProfileId = this.patientPriscription.patientId;

    this.receptionSlotBookingDetails.patientProfileDetails = new ProfileDetailsVO
    this.receptionSlotBookingDetails.patientProfileDetails.contactInfo.mobile = this.patientPriscription.patientContactNumber;
    this.receptionSlotBookingDetails.patientProfileDetails.contactInfo.email = this.patientPriscription.patientEmailId;
    this.receptionSlotBookingDetails.patientProfileDetails.contactInfo.addresses = this.patientPriscription.patientAddress;
    this.receptionSlotBookingDetails.patientProfileDetails.fName = this.patientPriscription.patientFirstName;
    this.receptionSlotBookingDetails.patientProfileDetails.lName = this.patientPriscription.patientLastName ? this.patientPriscription.patientLastName : '';
    this.receptionSlotBookingDetails.patientProfileDetails.title = this.patientPriscription.patientTitle ? this.patientPriscription.patientTitle : "";
    this.receptionSlotBookingDetails.patientProfileDetails.profileId = this.patientPriscription.patientId;

    this.receptionSlotBookingDetails.doctorDetail = new DoctorDetails();
    this.receptionSlotBookingDetails.doctorDetail.firstName = this.patientPriscription.doctorFirstName;
    this.receptionSlotBookingDetails.doctorDetail.lastName = this.patientPriscription.doctorLastName ? this.patientPriscription.doctorLastName : '';
    this.receptionSlotBookingDetails.doctorDetail.title = this.patientPriscription.doctorTitle ? this.patientPriscription.doctorTitle : "";

    this.receptionSlotBookingDetails.pocDetails = new PocDetail();
    this.patientPriscription.investigationAdvises.routedToPoc.forEach(element => {
      this.receptionSlotBookingDetails.pocDetails = element;
    });
    this.receptionSlotBookingDetails.deliveryAddress = this.diagnosticAddress;
    this.receptionSlotBookingDetails.slotDate = this.patientPriscription.date;
    this.receptionSlotBookingDetails.slotTime = this.patientPriscription.time;
    this.receptionSlotBookingDetails.slotTime = this.patientPriscription.time;
    this.receptionSlotBookingDetails.payment = new Payment();
    this.receptionSlotBookingDetails.serviceList = new Array();
    this.diagnosticSchedulelist.forEach(e => {
      // this.receptionSlotBookingDetails.serviceId = e.serviceId;
      // this.receptionSlotBookingDetails.serviceName = e.serviceName;
      if (e.homeOrderPriceDetails != undefined) {
        this.homeorderNetprice = e.homeOrderPriceDetails.netPrice;
        if (this.homeorderNetprice > 0) {
          this.receptionSlotBookingDetails.serviceList.push(e)
        }
      }
    })
    this.diagnosticSchedulelist.forEach(e => {
      this.receptionSlotBookingDetails.scheduleId = e.scheduleId;
    })


    console.log("receptionSlotBookingDetails" + JSON.stringify(this.receptionSlotBookingDetails))

  }

  setPurchaseType(type: number, featureEdit: number) {

    if (featureEdit == 1) {
      this.pharmacyPurchaseType = type;
    } else if (featureEdit == 2) {
      this.diagnosticPurchaseType = type;
    }

  }

  setNewPurchaseType(type: number, featureEdit: number) {
    this.pharmacyPoc = null;
    if (featureEdit == 1) {
      this.pharmacyPurchaseType = type;
    } else if (featureEdit == 2) {
      this.diagnosticPurchaseType = type;
    }
    if (type == 1)
      this.getpocListDetails(false);
    if (type == 2)
      this.getpocListDetails(true);
  }

  onClickMedicine(index) {
    this.productName[index].isSelected = !this.productName[index].isSelected;
    console.log(this.productName);
  }

  onClickDiagnostic(index) {
    this.diagnosticName[index].isSelected = !this.diagnosticName[index].isSelected;
  }



  setSelectedAddress(addressId: number, featureEdit: number) {
    this.localityResponse = null;
    this.locationIndex = 0;
    if (addressId > 0) {
      this.patientAddressList.forEach(
        address => {
          if (address.addressId == addressId) {
            if (featureEdit == 1) {
              this.pharmacyAddress = address;
            } else if (featureEdit == 2) {
              this.diagnosticAddress = address;
            }
          }
        });
    } else if (addressId == 0) {
      this.featureEdit = featureEdit;
      this.editAddress = new Address();
      (<any>$("#updateAddress")).modal("show");
    } else {
      if (featureEdit == 1) {
        this.pharmacyAddress = null;
      } else if (featureEdit == 2) {
        this.diagnosticAddress = null;
      }
    }

  }

  setSelectedPocDiag(index: number) {
    if (index > 0) {
      if (this.pocListt[index - 1] != undefined || this.pocListt[index - 1] != null) {
        this.pocId = this.pocListt[index - 1].pocId;
        this.diagnosticPoc = this.pocListt[index - 1];
      }
    }
    else {
      this.diagnosticPoc = null;
    }
  }

  setSelectedPoc(pocId: number, featureEdit: number) {
    if (pocId > 0) {
      this.pocList.forEach(
        poc => {
          this.pharmacyPoc = poc;
        });
    } else {
      this.pharmacyPoc = null;
    }

  }


  setNewSelectedPocDiag(index: number) {
    if (index > 0) {
      this.diagnosticPoc = this.diagnosticPocDetails[index - 1];
      console.log(this.diagnosticPoc)
    }
    else {
      this.diagnosticPoc = null;
    }
  }

  setNewSelectedPoc(index: number) {
    if (index > 0) {
      this.pharmacyPoc = this.allPocListDetails[index - 1];
    } else {
      this.pharmacyPoc = null;
    }
  }



  searchByPinCode(pinCode: any, pincodeChanged: boolean) {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || pinCode.length == 6) {
      this.spinnerService.start();
      this.localityResponse = null;
      this.locationIndex = 0;
      this.onboardingService.getStateCityByPinCode(pinCode).then(response => {
        if (response.length > 0) {
          if (pincodeChanged) {
            this.editAddress.city = response[0].cityId;
            this.editAddress.cityName = response[0].cityName;
            this.editAddress.state = response[0].stateId;
            this.editAddress.stateName = response[0].stateName;
            this.editAddress.area = response[0].localityList[0].id;
            this.editAddress.areaName = response[0].localityList[0].name;
            this.editAddress.locationCoordinates = new Coordinates();
            this.editAddress.locationCoordinates.lat = response[0].localityList[0].lat;
            this.editAddress.locationCoordinates.lon = response[0].localityList[0].lon;
            this.editAddress.location = new Location();
            this.editAddress.location.coordinates = new Array();
            this.editAddress.location.coordinates.push(response[0].localityList[0].lon);
            this.editAddress.location.coordinates.push(response[0].localityList[0].lat);
          }
          this.localityResponse = response[0].localityList;
          if (this.editAddress && this.editAddress.area > 0 && this.localityResponse && this.localityResponse.length > 0) {
            for (let i = 0; i < this.localityResponse.length; i++) {
              if (this.editAddress.area == this.localityResponse[i].id) {
                this.locationIndex = i;
              }
            }
          }
        }
        this.spinnerService.stop();
      });
    }
  }

  selectedAddressType() {
    let isFound: boolean = false;
    let addressType = this.editAddress.addressType;
    if (this.editAddress != null && this.editAddress.addressType != undefined
      && this.editAddress.addressType > -1 && this.editAddress.addressType != Address.ADDRESS_OTHER) {
      this.patientAddressList.forEach(item => {
        if (item.addressType == this.editAddress.addressType) {
          this.editAddress = JSON.parse(JSON.stringify(item));
          isFound = true;
        }
      });
    }
    if (!isFound) {
      this.editAddress = new Address();
      this.editAddress.addressType = addressType;
    }
  }

  onLocationChange() {
    if (this.localityResponse && this.localityResponse.length > 0 && this.locationIndex >= 0) {
      let index = this.locationIndex;
      this.editAddress.area = this.localityResponse[index].id;
      this.editAddress.areaName = this.localityResponse[index].name;
      this.editAddress.locationCoordinates = new Coordinates();
      this.editAddress.locationCoordinates.lat = this.localityResponse[index].lat;
      this.editAddress.locationCoordinates.lon = this.localityResponse[index].lon;
      this.editAddress.location = new Location();
      this.editAddress.location.coordinates = new Array();
      this.editAddress.location.coordinates.push(this.localityResponse[index].lon);
      this.editAddress.location.coordinates.push(this.localityResponse[index].lat);
      console.log('Selected area is ' + this.editAddress.areaName);
      console.log('Selected areaID is ' + this.editAddress.area);
    }
  }

  sameAsAbove() {
    if ((<any>$("#sameasabove:checked")).length > 0) {
      this.diagnosticAddress = this.pharmacyAddress;
    }
  }

  modifyAddress(address: Address) {
    this.localityResponse = null;
    this.locationIndex = 0;
    this.editAddress = JSON.parse(JSON.stringify(address));
    if (this.editAddress && this.editAddress.pinCode) {
      this.searchByPinCode(this.editAddress.pinCode, false);
    }
    (<any>$("#updateAddress")).modal("show");
  }

  saveAddress() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    this.isErrorPopup = false;
    this.showMessagePopup = false;
    this.errorMessagePopup = new Array();
    this.localityResponse = null;
    this.locationIndex = 0;
    if (this.editAddress.addressType == undefined || this.editAddress.addressType < 0) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please select Address Type";
      return;
    }
    if (this.editAddress.addressType == Address.ADDRESS_OTHER && (this.editAddress.label == undefined || this.editAddress.label == null || this.editAddress.label.length == 0)) {
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a name for this address";
      return;
    }
    console.log('Updated address is ', this.editAddress);
    if (this.editAddress.pinCode != undefined && this.editAddress.pinCode.length == 6 && this.editAddress.city > 0) {
      let addressRequest: UpdateAddress = new UpdateAddress();
      addressRequest.profileId = this.patientPriscription.patientId;
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
          for (let i = 0; i < this.patientAddressList.length; i++) {
            let item = this.patientAddressList[i];
            if (item.addressId == response.address.addressId) {
              this.patientAddressList[i] = item = response.address;
              if (this.pharmacyAddress != undefined && this.pharmacyAddress != null && this.pharmacyAddress.addressId == response.address.addressId) {
                this.pharmacyAddress = item;
              }
              if (this.diagnosticAddress != undefined && this.diagnosticAddress != null && this.diagnosticAddress.addressId == response.address.addressId) {
                this.diagnosticAddress = item;
              }
              isFound = true;
              break;
            }
          }
          if (!isFound) {
            this.patientAddressList.push(response.address);
          }
          console.log('Printing updated list>>' + JSON.stringify(this.patientAddressList));
          if (this.featureEdit == 1) {
            this.pharmacyAddress = response.address;
          } else if (this.featureEdit == 2) {
            this.diagnosticAddress = response.address;
          }
          this.isError = false;
          this.showMessage = true;
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

  submitPrescriptionApproval(value: number) {
    value == 0 ? this.pharmacyPurchase = true : this.pharmacyPurchase = false;
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    this.consumerApprovalRequest = new ConsumerApprovalRequest();
    this.consumerApprovalRequest.adviceId = this.patientPriscription.adviceId;
    let request: PriscriptionApprovalRequest = new PriscriptionApprovalRequest();
    request.adviceId = this.consumerApprovalRequest.adviceId;
    request.status = 2;

    if (this.pharmacyPurchase) {
      this.consumerApprovalRequest.pharmacyPurchase = new PurchaseDetails();
      this.consumerApprovalRequest.pharmacyPurchase.purchaseType = this.pharmacyPurchaseType;
    }
    else {
      this.consumerApprovalRequest.diagnosticPurchase = new PurchaseDetails();
      this.consumerApprovalRequest.diagnosticPurchase.purchaseType = this.diagnosticPurchaseType;
    }


    if (this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != undefined && this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != null && this.pharmacyPurchase == true && this.pharmacyPurchaseType != 3) {

      if ((this.pharmacyPurchaseType == 1 || this.pharmacyPurchaseType == 2) && this.pharmacyPurchase == true && (this.pharmacyPoc == undefined || this.pharmacyPoc == null)) {
        this.isError = true;
        this.showMessage = true;
        this.pharmacyMessage = new Array();
        this.pharmacyMessage[0] = "Please select Pharmacy Poc";
        return;
      } else {
        if (this.pharmacyPoc == "Central Pharmacy") {
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = new PocDetail();
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = this.pharmacyPoc;
        }
        else {
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = new PocDetail();
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = this.pharmacyPoc;
        }
      }
      if ((this.pharmacyPurchaseType == 2 && this.pharmacyPurchase == true) && (this.pharmacyAddress == undefined || this.pharmacyAddress == null || this.pharmacyAddress.addressId <= 0)) {
        this.isError = true;
        this.showMessage = true;
        this.pharmacyMessage = new Array();
        this.pharmacyMessage[0] = "Please select a delivery address";
        return;
      } else {
        this.consumerApprovalRequest.pharmacyPurchase.address = this.pharmacyAddress;
      }

    }
    if (this.patientPriscription.investigationAdvises.investigationList != undefined && this.patientPriscription.investigationAdvises.investigationList != null && this.pharmacyPurchase == false && this.diagnosticPurchaseType != 3) {

      if (((this.diagnosticPurchaseType == 1 || this.diagnosticPurchaseType == 2) && this.pharmacyPurchase == false) && (this.diagnosticPoc == undefined || this.diagnosticPoc == null)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select Diagnostic Poc";
        return;
      } else {
        this.consumerApprovalRequest.diagnosticPurchase.pocDetail = new PocDetail();
        this.consumerApprovalRequest.diagnosticPurchase.pocDetail = this.diagnosticPoc;
      }
    }

    if (this.sepRouteFlow) {
      if (this.pharmacyPurchase && this.pharmacyPurchaseType != 3) {
        this.consumerApprovalRequest.pharmacyPurchase.pocDetail.pocName = this.consumerApprovalRequest.pharmacyPurchase.pocDetail.pocName.split('(')[0];
        request.consumerApprovalRequest = this.consumerApprovalRequest;
        request.consumerApprovalRequest.pharmacyPurchase.pharmacyAdviceList = this.productName.filter(res => res.isSelected == true);
      }
      else if (!this.pharmacyPurchase && this.diagnosticPurchaseType != 3) {
        this.consumerApprovalRequest.diagnosticPurchase.pocDetail.pocName = this.consumerApprovalRequest.diagnosticPurchase.pocDetail.pocName.split('(')[0];
        request.consumerApprovalRequest = this.consumerApprovalRequest;
        request.consumerApprovalRequest.diagnosticPurchase.investigationList = this.diagnosticName.filter(res => res.isSelected == true);
      }
      // add check for atleast one selected

      if ((this.pharmacyPurchase == true && this.pharmacyPurchaseType != 3) && (request.consumerApprovalRequest.pharmacyPurchase.pharmacyAdviceList == undefined || request.consumerApprovalRequest.pharmacyPurchase.pharmacyAdviceList == null || request.consumerApprovalRequest.pharmacyPurchase.pharmacyAdviceList.length == 0)) {
        this.isError = true;
        this.showMessage = true;
        this.pharmacyMessage = new Array();
        this.pharmacyMessage[0] = "Please select minimum 1 medicine"
        return;
      }
      if ((this.pharmacyPurchase == false && this.diagnosticPurchaseType != 3) && (request.consumerApprovalRequest.diagnosticPurchase.investigationList == undefined || request.consumerApprovalRequest.diagnosticPurchase.investigationList == null || request.consumerApprovalRequest.diagnosticPurchase.investigationList.length == 0)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select minimum 1 diagnostic";
        return;
      }
    }
    else {
      request.consumerApprovalRequest = this.consumerApprovalRequest;
    }

    this.spinnerService.start();
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    this.receptionService.submitPriscriptionForAccept(request).then(response => {
      this.spinnerService.stop();
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (this.pharmacyPurchase == false && (this.diagnosticPurchaseType == 1 || this.diagnosticPurchaseType == 2 || this.diagnosticPurchaseType == 3)) {
          if (this.sepRouteFlow) {
            alert("Order request has been raised successfully")
            this.router.navigate(["/app/reception/prescription/prescription"]);
          }
          else {
            (<any>$("#successDiago")).modal("show");
            (<any>$("#successPharmacy")).modal("hide");
          }
        }
        if (this.pharmacyPurchase == true && (this.pharmacyPurchaseType == 1 || this.pharmacyPurchaseType == 2 || this.pharmacyPurchaseType == 3)) {
          if (this.sepRouteFlow) {
            alert("Order request has been raised successfully")
            this.router.navigate(["/app/reception/prescription/prescription"]);
          }
          else {
            (<any>$("#successPharmacy")).modal("show");
            (<any>$("#successDiago")).modal("hide");
          }
        }
      } else {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = response.statusMessage;
      }
    });
  }

  submitPrescriptionInvestApproval(index: number) {
    if (this.diagnosticPoc == undefined || this.diagnosticPoc == null || this.diagnosticPoc.pocId == 0) {
      this.isError = false;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Source Lab!";
      return;
    }

    if (this.diagnosticPurchaseType == 2 && (this.diagnosticAddress == undefined || this.diagnosticAddress == null || this.diagnosticAddress.addressId == 0)) {
      this.isError = false;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Address!";
      return;
    }


    let pocId, serviceIdList, homeCollection
    pocId = this.pocId;
    serviceIdList = this.serviceIdList;

    homeCollection = true;
    this.spinnerService.start();

    (<any>$("#successDiago")).modal("show");
    this.receptionService.getAvailableServicesInpoc(pocId, serviceIdList, homeCollection).then(diagnosticSchedulelist => {
      this.spinnerService.stop();
      if (diagnosticSchedulelist == undefined || diagnosticSchedulelist == null || diagnosticSchedulelist.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.diagnoMessage = new Array();
        this.diagnoMessage[0] = "Diagnostic Test Not Available";
        $("#prescription").css({ "visibility": "hidden" });
      } else {
        this.diagnosticSchedulelist = new Array<any>();
        this.diagnosticSchedulelist = diagnosticSchedulelist;
        this.slotBookingDetails()
        if (this.diagnosticSchedulelist && this.diagnosticSchedulelist != undefined && this.diagnosticSchedulelist != null) {
          this.diagnosticSchedulelist.forEach(e => {
            if (e.homeOrderPriceDetails != undefined) {
              this.netPriceDetail = e.homeOrderPriceDetails.netPrice;
              if (e.homeOrderPriceDetails.netPrice > 0) {
                this.cancelOrder = true;
                $("#prescription").css({ "display": "block" });
              } else {
                this.isError = true;
                this.showMessage = true;
                this.diagnoMessage = new Array();
                this.diagnoMessage[0] = "Diagnostic Test Not Available";
                $("#prescription").css({ "display": "none" });
              }
            }
          })

        }
      }
    })
  }

  cancel() {
    this.receptionService.approvalTaken = false;
    this.router.navigate(["/app/reception/prescription/prescription"]);
  }
  goToWalkPrescription() {
    this.receptionService.approvalTaken = true;
    this.router.navigate(["/app/reception/prescription/prescription"]);
  }

  goToPrescription(item) {
    item = this.receptionSlotBookingDetails;
    this.diagnosticsService.isFromPriscription = true;
    this.diagnosticsService.receptionPriscriptionDetails = item;
    this.router.navigate(["/app/diagnostics/slotbooking/slotselection/1/true"]);
  }
}