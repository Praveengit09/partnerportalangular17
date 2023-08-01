import { OnboardingService } from './../../../onboarding/onboarding.service';
import { Component, ViewEncapsulation } from "@angular/core";
import { PocDetail } from "../../../model/poc/pocDetails";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../auth/auth.service";
import { SuperAdminService } from "../../../superadmin/superadmin.service";
import { Router } from "@angular/router";
import { Config } from "../../../base/config"
import { HsLocalStorage } from "../../../base/hsLocalStorage.service";
import { Locality } from '../../../model/base/locality';
import { Address } from '../../../model/poc/address';

@Component({
  selector: 'addressandlocation',
  templateUrl: './addressandlocation.template.html',
  styleUrls: ['./addressandlocation.style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddressAndLocationComponent {
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;

  pocDetails: PocDetail = new PocDetail();
  isPocModify: boolean;

  localityList: Locality[] = new Array<Locality>();
  isMapVisible: boolean = false;
  localityName: string;
  
  constructor(private spinnerService: SpinnerService,
    private auth: AuthService,
    private onboardingService: OnboardingService,
    private superAdminService: SuperAdminService,
    private router: Router,
    private hsLocalStorage: HsLocalStorage
  ) {
    this.pocDetails = new PocDetail();
  }

  ngOnInit() {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
    this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
    let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
    if (this.isPocModify && ((createPocLoc && createPocLoc.pocDetails)
      || (this.superAdminService && this.superAdminService.pocDetail))) {
      this.pocDetails = this.superAdminService.pocDetail;
      if (this.pocDetails) {
        let data = { 'pocDetails': this.pocDetails, 'isPocModify': this.isPocModify };
        this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
      } else {
        this.superAdminService.pocDetail = this.pocDetails = createPocLoc.pocDetails;
        this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
        console.log(`pocdetails==>${JSON.stringify(this.pocDetails)}`);
      }
      if (this.pocDetails.pdfHeaderType != 0 || this.pocDetails.pdfHeaderType == undefined) {
        (<any>$("#Pdf")).prop("checked", true)
      }
    } else {
      this.pocDetails = new PocDetail();
    }

    this.getStateCityByPinCode(this.pocDetails.address.pinCode);

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
          }); this.pocDetails.locality = isLocalityNotChanged ? this.pocDetails.locality : 'Select Locality';
        }

        else {
          this.pocDetails.locality = this.localityName;
        }
      }
      );
    }
    else if ((pinCode + "").length == 0) {
      this.pocDetails.address.cityName = null;
      this.pocDetails.address.stateName = null;
      this.pocDetails.address.city = null;
      this.pocDetails.address.state = null;
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


  onServicePortfolio() {
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
    // for (let i = 0; i < this.contactList.length; i++) {
    //   if (this.contactList[i] == "" || this.contactList[i] == null || this.contactList[i].length <= 0) {
    //     this.contactList.splice(i, 1);
    //   }
    // }

    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;


    this.router.navigate(['./pocadmin/sidebar/serviceoffered'])
  }

  showMap() {
    if (this.isMapVisible) {
      this.isMapVisible = !this.isMapVisible;
    }
    this.isMapVisible = !this.isMapVisible;
  }
  skipForNow() {
    this.router.navigate(['./app/dashboard'])
  }

}
