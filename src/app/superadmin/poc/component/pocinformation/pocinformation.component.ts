import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { LoginResponse } from "../../../../login/model/loginresponse";
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { HealthPackage } from "../../../../model/package/healthPackage";
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';

@Component({
  selector: 'pocinformation',
  templateUrl: './pocinformation.template.html',
  styleUrls: ['./pocinformation.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class PocInformationComponent implements OnInit {
  // packageNames: string[];
  packageList: HealthPackage[] = new Array<HealthPackage>();
  pocDetails: PocDetail;
  serviceItems: Array<ServiceItem> = new Array();
  rolesMap: Map<number, Array<ServiceItem>> = new Map<number, Array<ServiceItem>>();
  serviceKey: number[] = [1, 2, 3, 4, 5];
  serviceRole: string[] = ["Additional", "Diagnostic", "Medical", "Wellness", "Home Consultation"];

  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {

  }

  ngOnInit() {

    this.pocDetails = this.superAdminService.pocDetail;
    // saving and getting from local.....
    if (this.pocDetails) {
      let data = { 'pocDetail': this.pocDetails };
      if (this.pocDetails.serviceList != null && this.pocDetails.serviceList != undefined) {
        this.serviceItems = this.pocDetails.serviceList;
        let obj = new ServiceItem();
        // console.log("diagnosticsAdviseTrack in Submit()::" + JSON.stringify(this.serviceItems));
        /* let rolesMap = new Map<number, Array<ServiceItem>>(); */
        for (let i = 0; i < this.serviceItems.length; i++) {
          let key = this.serviceItems[i].serviceType;
          if (this.rolesMap.has(key)) {
            let arr2 = new Array<ServiceItem>();
            arr2 = this.rolesMap.get(key);
            arr2.push(this.serviceItems[i]);
            this.rolesMap.set(key, arr2);
          } else {
            let arr = new Array<ServiceItem>();
            arr.push(this.serviceItems[i]);
            this.rolesMap.set(key, arr);
          }
        }

        this.rolesMap.forEach((value: Array<ServiceItem>, key: number) => {
        });

      }
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.pocDetails = this.hsLocalStorage.getComponentData().pocDetail;
      if (this.pocDetails.serviceList != null && this.pocDetails.serviceList != undefined) {
        this.serviceItems = this.pocDetails.serviceList;
        let obj = new ServiceItem();
        // console.log("diagnosticsAdviseTrack in Submit()::" + JSON.stringify(this.serviceItems));
        /* let rolesMap = new Map<number, Array<ServiceItem>>(); */
        for (let i = 0; i < this.serviceItems.length; i++) {
          let key = this.serviceItems[i].serviceType;
          if (this.rolesMap.has(key)) {
            let arr2 = new Array<ServiceItem>();
            arr2 = this.rolesMap.get(key);
            arr2.push(this.serviceItems[i]);
            this.rolesMap.set(key, arr2);
          } else {
            let arr = new Array<ServiceItem>();
            arr.push(this.serviceItems[i]);
            this.rolesMap.set(key, arr);
          }
        }

        this.rolesMap.forEach((value: Array<ServiceItem>, key: number) => {
        });

      }

      this.superAdminService.pocDetail = this.pocDetails;
    }
    this.selectedPackages();
  }
  selectedPackages() {
    if (this.pocDetails.agreement != undefined) {
      this.superAdminService.getallpackages().then(response => {
        for (let i = 0; i < response.length; i++) {
          for (let j = 0; j < this.pocDetails.agreement.packageIdList.length; j++) {
            if (response[i].packageId == this.pocDetails.agreement.packageIdList[j]) {
              this.packageList.push(response[i]);
              console.log("here package List--------" + JSON.stringify(this.packageList))
            }
          }
        }
      });
    }
  }

  onPocViewEmployee(): void {
    this.router.navigate(['/app/master/poc/employees']);
  }
  onEditPoc(): void {
    this.superAdminService.isPocModify = true;
    this.router.navigate(['/app/master/poc/create']);
  }

  getValue(key) {
    return this.rolesMap.get(key);
  }

}