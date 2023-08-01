import { Component, OnInit } from '@angular/core';
import { PackageService } from '../package.service';
import { HealthPackage } from '../../model/package/healthPackage';
import { CryptoUtil } from '../../auth/util/cryptoutil';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { AuthService } from '../../auth/auth.service';
import { PocDetail } from '../../model/poc/pocDetails';

@Component({
  selector: 'viewspecialist',
  templateUrl: './viewspecialist.template.html',
  styleUrls: ['./viewspecialist.style.scss']
})
export class ViewSpecialistComponent implements OnInit {
  viewspecialists: any;
  lat: number;
  long: number;
  selectedpackage: HealthPackage;
  indexOfPage: number;
  noOfReportsPerPage: number = 10;
  displayDoctorList: Array<any>;
  pocDetails: PocDetail
  constructor(private packageService: PackageService, private spinnerService: SpinnerService, private auth: AuthService) {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (this.packageService.selectedpackage == null || this.packageService.selectedpackage == undefined) {
      this.packageService.selectedpackage = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("selectedpackage")));
    } else {
      window.localStorage.setItem('selectedpackage', cryptoUtil.encryptData(JSON.stringify(this.packageService.selectedpackage)));
    }
  }

  ngOnInit() {
    this.packageService.viewspecialists;
    this.selectedpackage = this.packageService.selectedpackage;
    this.pocDetails = this.auth.userAuth.selectedPoc;
    let serviceId;
    this.selectedpackage.discountsList.forEach((element) => {
      if (element.serviceTypeId == 3) {
        serviceId = element.serviceList[0].serviceId;
      }
    });
    // navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position.coords.latitude);
    this.lat = this.pocDetails.address.locationCoordinates.lat;
    this.long = this.pocDetails.address.locationCoordinates.lon;
    this.spinnerService.start();
    this.packageService.getpackagedoctorsbydistance(serviceId, this.selectedpackage.packageId, this.lat, this.long).then(data => {
      this.spinnerService.stop();
      console.log(data);
      this.viewspecialists = data;
      if (this.viewspecialists) {
        this.indexOfPage = 1;
        this.displayDoctorList = JSON.parse(JSON.stringify(this.viewspecialists.slice(0, this.noOfReportsPerPage)));
      }
    });
    // });

  }

  getPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude);
      this.lat = position.coords.latitude;
      console.log(position.coords.longitude);
      this.long = position.coords.longitude;
    });
  }


  changePageIndex(index: number) {
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    if (this.viewspecialists)
      this.displayDoctorList = JSON.parse(JSON.stringify(
        this.viewspecialists.slice(
          (this.indexOfPage - 1) * this.noOfReportsPerPage, this.indexOfPage * this.noOfReportsPerPage
        )));
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.viewspecialists.length == 0) return Array(1).fill(1);
    return Array(
      Math.ceil(this.viewspecialists.length / this.noOfReportsPerPage)
    ).fill(1);
  }

}