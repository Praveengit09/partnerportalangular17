import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { DoctorService } from '../../../doctor.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { DoctorFavouritePartnerRequest } from '../../../../model/employee/doctorFavPartnerReq';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { FavouritePartners } from '../../../../model/employee/favouritePartners';

@Component({
  selector: "managePartnerNetwork",
  templateUrl: "./managePartnerNetwork.template.html",
  styleUrls: ["./managePartnerNetwork.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class managePartnerNetworkComponent implements OnInit {
  partnerNetworks: any;
  partnerTitles: any;
  indexForLoc: number = 0;
  pocType: number;
  searchTestsTotal: number = 0;
  searchedTests: any;
  partnerNetworkList: Array<any> = new Array();
  selectedPocDetails: Array<FavouritePartners> = new Array();
  employeeDetails: DoctorDetails;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  type: string;
  pocId: number;
  removablePartnerNetworks: Array<any> = new Array();
  selectColumns: any[] = [
    {
      variable: 'pocName',
      filter: 'text'
    }
  ];
  constructor(private router: Router, private authservice: AuthService, private doctorservice: DoctorService) {

  }

  ngOnInit() {
    this.employeeDetails = this.authservice.employeeDetails;
    this.partnerNetworks = this.authservice.employeeDetails.partners;
    this.pocId = this.authservice.userAuth.pocId;

    this.getPartnersTitles();
    this.doctorservice.getPartnerTitle().then(response => {
      this.partnerTitles = new Array();
      response.forEach(element => {
        if (element.configuration == true) {
          this.partnerTitles.push(element);
        }
      });
    });
    console.log("=--------->>iddddd " + JSON.stringify(this.employeeDetails.partners))

  }
  onTitleChange(event: number): void {
    this.indexForLoc = event;
    this.pocType = this.partnerTitles[event - 1].id;
    this.type = this.partnerTitles[event - 1].type;
    console.log("here ===>>> " + this.pocType)
    if (this.pocType != null || this.pocType != undefined) {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
  }

  searchTests(key) {

    if (key.length >= 3) {
      if (this.indexForLoc == 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "select Partner Type....";
        this.showMessage = true;
        return;
      }
      if (this.pocType == null || this.pocType == undefined) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "select Partner Type....";
        this.showMessage = true;
      }

      if(this.pocType == 27){
        this.doctorservice.fetchPocListForSearch(key).then(searchedTests => {
          if (searchedTests.length > 0) {
            this.searchTestsTotal = searchedTests.length;
            this.searchedTests = searchedTests;
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
          }
          else if (searchedTests.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Partner Does not exist';
            this.showMessage = true;
            return;
          }
        });
      }
      else{
      this.doctorservice.getSearchedList(key, this.pocType).then(searchedTests => {
        if (searchedTests.length > 0) {
          this.searchTestsTotal = searchedTests.length;
          this.searchedTests = searchedTests;
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = false;
        }
        else if (searchedTests.length == 0) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = 'Partner Does not exist';
          this.showMessage = true;
          return;
        }
      });
    }
    }
  }

  getPartnersTitles() {
    this.doctorservice.getPartnerTitle().then(response => {
      this.partnerTitles = response;
      if (this.partnerNetworks)
        for (let i = 0; i < this.partnerNetworks.length; i++) {
          for (let j = 0; j < this.partnerTitles.length; j++) {
            if (this.partnerNetworks[i].subTypeId == this.partnerTitles[j].id) {
              this.partnerNetworks[i].Type = this.partnerTitles[j].type;
            }
          }
        }
    });
  }

  getTestName(selectedTest: PocDetail) {
    // this.indexForLoc = 0;
    if (selectedTest.pocId != this.pocId) {
      let isServiceExist = false;
      if (this.selectedPocDetails.length > 0) {
        this.selectedPocDetails.forEach(service => {
          if (selectedTest.pocId == service.details.pocId) {
            isServiceExist = true;
            return
          }
        });
      }
      if (isServiceExist == false) {
        if (!this.selectedPocDetails) {
          this.selectedPocDetails = new Array<FavouritePartners>();
        }
        let favPartners = new FavouritePartners();
        favPartners.subTypeId = this.pocType;
        favPartners.preferred = false;
        favPartners.details = selectedTest;
        favPartners.Type = this.type;
        this.selectedPocDetails.push(favPartners);
        // if (this.selectedPocDetails != undefined && this.selectedPocDetails != null) {
        //   this.selectedPocDetails[this.selectedPocDetails.length] = new FavouritePartners();
        //   this.selectedPocDetails[this.selectedPocDetails.length - 1].subTypeId = this.pocType;
        //   this.selectedPocDetails[this.selectedPocDetails.length - 1].preferred = false;
        //   this.selectedPocDetails[this.selectedPocDetails.length - 1].details = selectedTest;
        //   this.selectedPocDetails[this.selectedPocDetails.length - 1].Type = this.type;
        // }
        // else {
        //   this.selectedPocDetails = new Array<FavouritePartners>();
        //   this.selectedPocDetails[0] = new FavouritePartners();
        //   this.selectedPocDetails[0].subTypeId = this.pocType;
        //   this.selectedPocDetails[0].preferred = false;
        //   this.selectedPocDetails[0].details = selectedTest;
        //   this.selectedPocDetails[0].Type = this.type;
        // }
      }
    }
    if (selectedTest.pocId == this.pocId) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Same Poc can not be added as a Partner Network";
      this.showMessage = true;
    }
    else {
      if (selectedTest != undefined) {
        let isServiceExist1 = false;
        if (this.partnerNetworks)
          if (this.partnerNetworks.length > 0) {
            this.partnerNetworks.forEach((element1) => {

              if ((selectedTest.pocId == element1.details.pocId) && (this.pocType == element1.subTypeId)) {
                console.log("===>>>pocType " + this.pocType + "====>> " + element1.subTypeId)

                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = selectedTest.pocName + "  already exist as partner network";
                this.showMessage = true;
                isServiceExist1 = true;
                this.selectedPocDetails = this.selectedPocDetails.filter((ele) => { return ele.details != selectedTest });
                return;
              }
              if((this.pocType==27) && (this.pocType==element1.subTypeId)){
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Only one Prescription Digitization Partner can be added as a Partner Network";
                this.showMessage = true;
                isServiceExist1 = true;
                this.selectedPocDetails = this.selectedPocDetails.filter((ele) => { return ele.details != selectedTest });
                return;
              }
            });
          }
          else if (this.partnerNetworkList.length > 0) {
            this.partnerNetworkList.forEach(service => {
              if (selectedTest.pocId == service.pocId) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = selectedTest.pocName + "  already added";
                this.showMessage = true;
                isServiceExist1 = true;
                this.selectedPocDetails = this.selectedPocDetails.filter((ele) => { return ele.details != selectedTest });
                return
              }
            });
          }
        if (isServiceExist1 == false) {
          this.partnerNetworkList.push(selectedTest);
        }
      }
    }
  }
  removePartner(item) {
    let index = this.partnerNetworks.findIndex(obj => { return (obj.details.pocId == item.details.pocId && obj.subTypeId == item.subTypeId) });

    if ((<any>$("#Selecteditem" + index + ":checked")).length > 0) {
      this.removablePartnerNetworks.push(item);
    }
    else {
      this.removablePartnerNetworks.forEach((element3, index) => {
        if (item.details.pocId == element3.details.pocId && item.details.subTypeId == element3.details.subTypeId) {
          this.removablePartnerNetworks.splice(index, 1);
        }
      });
    }
  }

  removeSelectedPartner() {
    let request: DoctorFavouritePartnerRequest = new DoctorFavouritePartnerRequest();
    request.doctorId = this.employeeDetails.empId;
    if ((<any>$("#ApplyTests" + ":checked")).length > 0) {
      request.partnerDetails = new Array();
      this.partnerNetworks = new Array();
      this.authservice.employeeDetails.partners = new Array();
      $("#ApplyTests").prop("checked", false);

    }
    else {
      this.removablePartnerNetworks.forEach(element => {
        this.partnerNetworks.forEach((element1, index) => {
          if (element.details.pocId == element1.details.pocId && element.subTypeId == element1.subTypeId) {
            this.partnerNetworks.splice(index, 1);
          }
        })
      });
      request.partnerDetails = this.partnerNetworks;
      this.authservice.employeeDetails.partners = this.partnerNetworks;
    }
    this.doctorservice.updateDocFavPartners(request).then(response => {

    });
  }

  remove(index: number) {
    this.partnerNetworkList.splice(index, 1);
    this.selectedPocDetails.splice(index, 1);
  }

  applyTests() {
    for (let i = 0; i < this.partnerNetworks.length; i++) {
      if ((<any>$("#ApplyTests" + ":checked")).length > 0) {
        $("#Selecteditem" + i).prop("checked", true);
      }
      else {
        $("#Selecteditem" + i).prop("checked", false);

      }
    }

  }

  addToPartners() {
    let request: DoctorFavouritePartnerRequest = new DoctorFavouritePartnerRequest();
    request.doctorId = this.employeeDetails.empId;
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (!this.partnerNetworks) {
      this.partnerNetworks = new Array();
    }
    this.selectedPocDetails.forEach(element => {
      this.partnerNetworks.push(element);
      this.authservice.employeeDetails.partners = this.partnerNetworks;
      this.authservice.saveToLocalStore();
      request.partnerDetails = this.partnerNetworks;
    })
    if ((this.selectedPocDetails != null || this.selectedPocDetails != undefined) && (this.selectedPocDetails.length > 0)) {
      this.doctorservice.updateDocFavPartners(request).then(response => {
        this.partnerNetworkList = new Array();
        this.selectedPocDetails = new Array();
        this.indexForLoc = 0;
      });
    } else {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = `Please select a partner to proceed`;
      this.showMessage = true;
    }
  }

}
