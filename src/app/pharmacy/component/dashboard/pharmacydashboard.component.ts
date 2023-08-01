import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from './../../../app.config';

import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';
import { PharmacyService } from './../../../pharmacy/pharmacy.service';
import { DashBoardChartReq } from './../../../model/chart/dashBoardChartReq';
import { MedicineStock } from './../../../model/pharmacy/medicineStock';

@Component({
  selector: 'pharmacydashboard',
  templateUrl: './pharmacydashboard.template.html',
  styleUrls: ['./pharmacydashboard.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PharmacyDashboardComponent implements OnInit {
  config: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  hasCentralPharmacyAdminRole: boolean;
  pocId: number;
  dashBoardChartRespList: any[] = new Array<any>();
  medicineStocklist: MedicineStock[] = new Array<MedicineStock>();
  keyToSearch: string = "MedicinesStock";

  constructor(config: AppConfig,
    private pharmacyService: PharmacyService,
    private authService: AuthService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.hasCentralPharmacyAdminRole = this.authService.userAuth.hasCentralPharmacyHomeOrdersRole;
    this.authService.selectedPocDetails ? this.pocId = this.authService.selectedPocDetails.pocId : '';
  }

  ngOnInit(): void {
    this.spinnerService.start();
    this.getPharmacyRevenueBasedOnDay().then(response => {
      this.spinnerService.stop();
      this.dashBoardChartRespList = response;
      console.log("Response In  PharmacyDashboardComponent NgOnInit:: " + JSON.stringify(this.dashBoardChartRespList));
      this.medicineStock();
    });
  }

  getPharmacyRevenueBasedOnDay(): Promise<any[]> {
    let dateOffset = (24 * 60 * 60 * 1000) * 7; // for 7 days
    let startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    startDate.setTime(startDate.getTime() - dateOffset);
    let endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);
    let request: DashBoardChartReq = new DashBoardChartReq();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocId = this.authService.userAuth.pocId;
    console.log("QWERTY_POCID::" + request.pocId);
    console.log("fromDate:: " + request.fromDate + " toDate:: " + request.toDate);
    return this.pharmacyService.getPharmacyRevenueBasedOnDay(request);
  }

  medicineStock() {
    if (this.dashBoardChartRespList != undefined) {
      for (let i = 0; i < this.dashBoardChartRespList.length; i++) {
        if (this.dashBoardChartRespList[i].key == this.keyToSearch) {
          this.medicineStocklist = this.dashBoardChartRespList[i].medicineStock;
          break;
        }
      }
    }
    console.log("MedicineStocklist:: " + JSON.stringify(this.medicineStocklist));
  }

}
