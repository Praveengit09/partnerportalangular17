import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { DoctorService } from '../../../doctor.service';
import { AuthService } from '../../../../auth/auth.service';
import { Config } from '../../../../base/config';

@Component({
  selector: "myPackages",
  templateUrl: "./myPackages.template.html",
  styleUrls: ["./myPackages.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class MyPackagesComponent implements OnInit {
  doctorPackages: any;
  selectedPocMapping: EmployeePocMapping;

  //pagination 
  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  displayDoctorPackages: any;
  currentIndex = -1;
  currency: string = ''
  constructor(private router: Router, private spinnerService: SpinnerService, private doctorService: DoctorService,
    private authservice: AuthService) {
    this.selectedPocMapping = authservice.selectedPOCMapping;
    this.currency = Config.portal.currencySymbol;
    // .participationSettings.canEditPackages
  }
  ngOnInit() {
    this.getPackagesList();
  }
  getPackagesList() {
    this.spinnerService.start();
    this.doctorService.doctorPackagesList(this.authservice.userAuth.employeeId, this.authservice.userAuth.pocId).then(data => {
      this.spinnerService.stop();
      console.log(data);
      this.doctorPackages = data;

      //for pagination
      this.doctorPackages = JSON.parse(JSON.stringify(data));
      this.indexOfPage = 1;
      this.displayDoctorPackages = JSON.parse(JSON.stringify(this.doctorPackages.slice(0, this.noOfReportsPerPage)));
    });
  }
  add_package() {
    this.router.navigate(['/app/doctor/favorites/packages/morePackages']);
  }

  changePageIndex(index: number) {
    if (this.indexOfPage == index) {
      return;
    }
    this.indexOfPage = index;
    this.displayDoctorPackages = JSON.parse(JSON.stringify(
      this.doctorPackages.slice(
        (this.indexOfPage - 1) * this.noOfReportsPerPage, this.indexOfPage * this.noOfReportsPerPage
      )));
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.doctorPackages.length == 0) return Array(1).fill(1);
    return Array(
      Math.ceil(this.doctorPackages.length / this.noOfReportsPerPage)
    ).fill(1);
  }

}
