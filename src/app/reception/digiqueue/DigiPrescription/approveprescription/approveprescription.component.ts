import { Component, ViewEncapsulation, OnChanges, OnInit, Input, Output, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseDetails } from './../../../../model/reception/prescription/purchaseDetails';
import { ConsumerApprovalRequest } from '../../../../model/reception/prescription/consumerApprovalRequest';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { ReceptionService } from '../../../reception.service';
import { OnboardingService } from '../../../../onboarding/onboarding.service';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { UpdateAddress } from '../../../../model/profile/updateAddress';
import { PriscriptionApprovalRequest } from '../../../../model/reception/prescription/prescriptionApprovalRequest';
import { Address } from '../../../../model/profile/address';
import { AuthService } from '../../../../auth/auth.service';
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
  isError: boolean;
  showMessage: boolean;

  errorMessagePopup: Array<string>;
  isErrorPopup: boolean;
  showMessagePopup: boolean;

  patientPriscription: any;
  consumerApprovalRequest: ConsumerApprovalRequest = new ConsumerApprovalRequest();
  editAddress: Address = new Address();
  pharmacyAddress: Address;
  diagnosticAddress: Address;
  pharmacyPoc: any;
  diagnosticPoc: any;
  pharmacyPurchaseType: number = 1;
  diagnosticPurchaseType: number = 1;
  validation: any;
  common: any;
  patientAddressList: Array<Address>;
  pocList: Array<PocDetail>;
  pocListt: Array<PocDetail>;
  pocList1: Array<any>;
  pocList2: Array<any>;
  featureEdit: number;// 1 - Pharmacy, 2 - diagnostic
  pocId: number;
  pocDetails: PocDetail;
  doctorId: number;
  showPoc: boolean;
  homeDelivery: boolean = true;
  constructor(private receptionService: ReceptionService, private onboardingService: OnboardingService,
    private _validation: ValidationUtil, private router: Router, private auth: AuthService, private _common: CommonUtil, private spinnerService: SpinnerService) {
    this.validation = _validation;
    this.common = _common;
  }

  ngOnInit() {
    this.pocId = this.auth.userAuth.pocId;
    this.pocDetails = this.auth.selectedPocDetails;
    this.doctorId = this.auth.userAuth.employeeId;
    this.patientPriscription = this.receptionService.patientPriscriptionDetails;
    console.log("Approve---> " + JSON.stringify(this.patientPriscription));

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
    this.pocList = new Array();
    this.pocListt = new Array();
    if (this.patientPriscription.pharmacyAdvises.routedToPoc != undefined && this.patientPriscription.pharmacyAdvises.routedToPoc != null
      && this.patientPriscription.pharmacyAdvises.routedToPoc.length > 0) {
      this.showPoc = false;
      for (let i = 0; i < this.patientPriscription.pharmacyAdvises.routedToPoc.length; i++) {
        if (this.patientPriscription.pharmacyAdvises.routedToPoc.find(poc => poc.pocId == this.pocDetails.pocId) == undefined) {
          this.pocList.push(this.pocDetails);
          if (this.pocDetails.pharmacyHomeDeliveryAvailable == true) {
            this.pocList1.push(this.pocDetails);
          }
        }
        this.pocList.push(this.patientPriscription.pharmacyAdvises.routedToPoc[i])
        if (this.patientPriscription.pharmacyAdvises.routedToPoc[i].pharmacyHomeDeliveryAvailable == true) {
          this.pocList1.push(this.patientPriscription.pharmacyAdvises.routedToPoc[i]);
        }
        else {
          this.showPoc = true;
        }
      };
    } else {
      console.log("=======>>> ")
      this.showPoc = true;
      this.pocList.push(this.pocDetails);
      if (this.pocDetails.pharmacyHomeDeliveryAvailable == true) {
        this.pocList1.push(this.pocDetails);
      }
    }
    if (this.patientPriscription.investigationAdvises.routedToPoc != undefined && this.patientPriscription.investigationAdvises.routedToPoc != null
      && this.patientPriscription.investigationAdvises.routedToPoc.length > 0) {
      for (let i = 0; i < this.patientPriscription.investigationAdvises.routedToPoc.length; i++) {
        if (this.patientPriscription.investigationAdvises.routedToPoc.find(poc => poc.pocId == this.pocDetails.pocId) == undefined) {
          this.pocList2.push(this.pocDetails);
          if (this.pocDetails.diagnosticSampleCollectionAvailable == true) {
            this.pocListt.push(this.pocDetails)
          }
        }
        this.pocList2.push(this.patientPriscription.investigationAdvises.routedToPoc[i]);
        if (this.patientPriscription.investigationAdvises.routedToPoc[i].diagnosticSampleCollectionAvailable == true) {
          this.pocListt.push(this.patientPriscription.investigationAdvises.routedToPoc[i]);
        }
      }
    } else {
      this.pocList2.push(this.pocDetails)
      if (this.pocDetails.diagnosticSampleCollectionAvailable == true) {
        this.pocListt.push(this.pocDetails)
      }
    }
    if (this.patientPriscription.investigationAdvises.investigationList != undefined) {
      for (let i = 0; i < this.patientPriscription.investigationAdvises.investigationList.length; i++) {
        if (this.patientPriscription.investigationAdvises.investigationList[i].homeCollections == 0) {
          this.homeDelivery = false;
        }
      }
    }
    console.log("Approve---> " + JSON.stringify(this.pocList));
  }

  setPurchaseType(type: number, featureEdit: number) {
    if (featureEdit == 1) {
      this.pharmacyPoc = null;
      this.pharmacyPurchaseType = type;
    } else if (featureEdit == 2) {
      this.diagnosticPoc = null;
      this.diagnosticPurchaseType = type;
    }
  }

  setSelectedAddress(addressId: number, featureEdit: number) {
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
  setSelectedPoc(pocId: number, featureEdit: number) {
    this.pharmacyPoc = null;
    if (featureEdit == 1) {
      this.pocList.forEach(poc => {
        if (poc.pocId == pocId) {
          this.pharmacyPoc = poc;
        }
      });
    }
    else if (featureEdit == 2) {
      if (pocId > 0) {
        this.pocList1.forEach(poc => {
          if (poc.pocId == pocId) {
            this.pharmacyPoc = poc;
          }
        });
      }
      if (pocId == -2) {
        this.pharmacyPoc = "Central Pharmacy";
      }
    }
  }

  setSelectedPocList(pocId: number, featureEdit: number) {
    this.diagnosticPoc = null;
    if (pocId > 0) {
      if (featureEdit == 1) {
        this.pocList2.forEach(poc => {
          if (poc.pocId == pocId) {
            this.diagnosticPoc = poc;
          }
        });
      }
      else if (featureEdit == 2) {
        this.pocListt.forEach(poc => {
          if (poc.pocId == pocId) {
            this.diagnosticPoc = poc;
          }
        });
      }
    }
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

  selectedAddressType() {
    let isFound: boolean = false;
    let addressType = this.editAddress.addressType;
    if (this.editAddress != null && this.editAddress.addressType != undefined && this.editAddress.addressType > -1 && this.editAddress.addressType != Address.ADDRESS_OTHER) {
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

  sameAsAbove() {
    if ((<any>$("#sameasabove:checked")).length > 0) {
      this.diagnosticAddress = this.pharmacyAddress;
    }
  }

  modifyAddress(address: Address) {
    this.editAddress = JSON.parse(JSON.stringify(address));
    (<any>$("#updateAddress")).modal("show");
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
      this.isErrorPopup = true;
      this.showMessagePopup = true;
      this.errorMessagePopup[0] = "Please enter a name for this address";
      return;
    }
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

  submitPrescriptionApproval() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    let request: PriscriptionApprovalRequest = new PriscriptionApprovalRequest();
    this.consumerApprovalRequest.adviceId = this.patientPriscription.adviceId;
    this.consumerApprovalRequest.pharmacyPurchase = new PurchaseDetails();
    this.consumerApprovalRequest.pharmacyPurchase.purchaseType = this.pharmacyPurchaseType;
    if (this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != undefined && this.patientPriscription.pharmacyAdvises.pharmacyAdviceList != null) {
      console.log("====>>>> " + JSON.stringify(this.pharmacyPoc))
      if ((this.pharmacyPurchaseType == 1 || this.pharmacyPurchaseType == 2) && (this.pharmacyPoc == undefined || this.pharmacyPoc == null)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select Pharmacy Poc";
        return;
      } else {
        if (this.pharmacyPoc == "Central Pharmacy") {
          console.log("====>>>> " + JSON.stringify(this.pharmacyPoc))
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = new PocDetail();
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail.pocName = this.pharmacyPoc;
        }
        else {
          this.consumerApprovalRequest.pharmacyPurchase.pocDetail = this.pharmacyPoc;
        }
      }
      if (this.pharmacyPurchaseType == 2 && (this.pharmacyAddress == undefined || this.pharmacyAddress == null || this.pharmacyAddress.addressId <= 0)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select a delivery address";
        return;
      } else {
        this.consumerApprovalRequest.pharmacyPurchase.address = this.pharmacyAddress;
      }

    }
    if (this.patientPriscription.investigationAdvises.investigationList != undefined && this.patientPriscription.investigationAdvises.investigationList != null) {
      this.consumerApprovalRequest.diagnosticPurchase = new PurchaseDetails();
      console.log("====>>>> " + JSON.stringify(this.diagnosticPoc))
      this.consumerApprovalRequest.diagnosticPurchase.purchaseType = this.diagnosticPurchaseType;
      if (this.diagnosticPurchaseType == 2 && (this.diagnosticPoc == undefined || this.diagnosticPoc == null)) {
        this.diagnosticPoc = new PocDetail();
        this.diagnosticPoc.pocId = 0;
        this.diagnosticPoc.pocName = null;
        this.diagnosticPoc.diagnosticSampleCollectionAvailable = true;
        this.consumerApprovalRequest.diagnosticPurchase.pocDetail = this.diagnosticPoc;
      }
      if (this.diagnosticPurchaseType == 1 && (this.diagnosticPoc == undefined || this.diagnosticPoc == null)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select diagnostic center";
        return;
      } else {
        this.consumerApprovalRequest.diagnosticPurchase.pocDetail = this.diagnosticPoc;
      }
      if (this.diagnosticPurchaseType == 2 && (this.diagnosticAddress == undefined || this.diagnosticAddress == null || this.diagnosticAddress.addressId <= 0)) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = "Please select a home collection address";
        return;
      } else {
        this.consumerApprovalRequest.diagnosticPurchase.address = this.diagnosticAddress;
      }
    }
    request.adviceId = this.consumerApprovalRequest.adviceId;
    request.status = 2;
    request.consumerApprovalRequest = this.consumerApprovalRequest;
    console.log(JSON.stringify(request));
    this.spinnerService.start();
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
    this.receptionService.submitPriscriptionForAccept(request).then(response => {
      this.spinnerService.stop();
      if (response.statusCode == 200 || response.statusCode == 201) {
        (<any>$("#success")).modal("show");
      } else {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage[0] = response.statusMessage;
      }
    })
  }

  goToPrescription() {
    this.router.navigate(["/app/reception/digiqueue/prescription/prescription"]);
  }
}