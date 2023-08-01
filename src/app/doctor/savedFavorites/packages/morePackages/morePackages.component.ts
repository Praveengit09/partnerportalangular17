import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { SuperAdminService } from '../../../../superadmin/superadmin.service';
import { HealthPackage } from '../../../../model/package/healthPackage';
import { EmployeeService } from '../../../../superadmin/employee/employee.service';
import { AuthService } from '../../../../auth/auth.service';
import { DoctorSelectedPackageResponse } from '../../../../model/employee/doctorSelectedPackageResponse';
import { Router } from '@angular/router';
import { PackageService } from '../../../../packages/package.service';
import { PocPackages } from '../../../../model/employee/pocpackages';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { Config } from '../../../../base/config';

@Component({
  selector: "morePackages",
  templateUrl: "./morePackages.template.html",
  styleUrls: ["./morePackages.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class MorePackagesComponent implements OnInit {

  packageList: HealthPackage[] = new Array<HealthPackage>();
  docPac: any;
  employeeDetails: DoctorDetails;
  selectedPackageList: Array<any> = new Array();
  selectedpackage: HealthPackage;
  selectedPackages: Array<HealthPackage> = new Array<HealthPackage>();
  pocId: number;

  //pagination 
  noOfReportsPerPage: number = 10;
  indexOfPage: number;
  currentIndex = -1;
  currency: string = ''

  constructor(private superAdminService: SuperAdminService, private packageService: PackageService, private router: Router,
    private employeeService: EmployeeService, private authservice: AuthService, private spinnerService: SpinnerService) {
    this.pocId = this.authservice.userAuth.pocId;
    this.currency = Config.portal.currencySymbol;
  }
  ngOnInit() {
    this.pocId = this.authservice.userAuth.pocId;
    this.employeeDetails = this.authservice.employeeDetails;
    console.log("========>>> " + JSON.stringify(this.employeeDetails))
    this.getAllPackages();
  }
  getAllPackages(): void {
    this.spinnerService.start();
    this.superAdminService.getallpackages().then(response => {
      this.spinnerService.stop();
      this.packageList = response;
      this.getDoctorPackages();
    });
  }
  getDoctorPackages(): void {
    this.spinnerService.start();
    this.employeeService.getdoctorpackages(this.authservice.userAuth.employeeId).then(response => {
      this.spinnerService.stop();
      this.docPac = response;
      this.docPac.forEach(element => {
        if (element.pocId == this.authservice.userAuth.pocId) {
          for (let i = 0; i < this.packageList.length; i++) {
            for (let j = 0; j < element.doctorPackages.length; j++) {
              if (this.packageList[i].packageId == element.doctorPackages[j].packageId && element.doctorPackages[j].ownPackage == 0) {
                $("#" + element.doctorPackages[j].packageId).prop("checked", true);
                $("#" + element.doctorPackages[j].packageId).attr('disabled', 'disabled');
                this.selectedPackageList.push(this.packageList[i].packageId);
              }
              else if (this.packageList[i].packageId == element.doctorPackages[j].packageId && element.doctorPackages[j].ownPackage == 1) {
                $("#" + element.doctorPackages[j].packageId).prop("checked", true);
                this.selectedPackageList.push(this.packageList[i].packageId);
              }
            }
          }
        }
        console.log("here is the doctor package list===>>>" + JSON.stringify(this.selectedPackageList))

      });
    });
  }

  onViewPackage(selectedpackage: HealthPackage): void {
    this.selectedpackage = selectedpackage;
    this.selectedpackage.freeConsultationsList.forEach((element) => {
      if (element.serviceTypeId === 3) {
        const serviceList = new Array<any>();
        serviceList.push(element.serviceList);

        // serviceList.forEach((element) => {
        //   element.forEach((ele) => {
        //   });
        // });
      }
    });
  }

  checkedPackage(item) {
    if ((<any>$("#" + item.packageId + ":checked")).length > 0) {
      this.selectedPackageList.push(item.packageId);
    } else {
      this.selectedPackageList.forEach((element3, index) => {
        if (item.packageId == element3) {
          this.selectedPackageList.splice(index, 1);
        }
      });
    }
  }

  AddPackages(): void {
    let index = this.authservice.employeeDetails.employeePocMappingList.forEach((e, i) => {
      if (e.pocId == this.pocId) {
        if (e.participationSettings.packageIdList == undefined && this.employeeDetails.employeePocMappingList[i].participationSettings.packageIdList == undefined) {
          e.participationSettings.packageIdList = new Array<number>();
          this.employeeDetails.employeePocMappingList[i].participationSettings.packageIdList = new Array<number>();
          this.employeeDetails.employeePocMappingList[i].participationSettings.packageIdList = this.selectedPackageList;
          e.participationSettings.packageIdList = this.selectedPackageList;
          delete this.employeeDetails.employeePocMappingList[i].participationSettings.packageNameList;
          delete e.participationSettings.packageNameList;
        }
        else {
          e.participationSettings.packageIdList = this.selectedPackageList;
          this.employeeDetails.employeePocMappingList[i].participationSettings.packageIdList = this.selectedPackageList;
        }
      }
    });

    console.log(" check data" + JSON.stringify(this.employeeDetails.employeePocMappingList));

    this.employeeService.updateEmployee(this.employeeDetails).then((data) => {
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.router.navigate(['/app/doctor/favorites/packages/packages'])
      }
      console.log(" check data" + JSON.stringify(data));
    });
  }

  changePageIndex(index: number) {
    this.indexOfPage = index;
  }
  getNumberOfPages() {
    if (this.noOfReportsPerPage == 0) return Array(1).fill(1);
    if (this.packageList.length == 0) return Array(1).fill(1);
    return Array(
      Math.ceil(this.packageList.length / this.noOfReportsPerPage)
    ).fill(1);
  }

}
