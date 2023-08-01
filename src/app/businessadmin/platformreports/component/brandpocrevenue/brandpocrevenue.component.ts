import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Config } from '../../../../base/config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from "../../../../auth/auth.service";
import { BusinessAdminService } from '../../../businessadmin.service';
import { SuperAdminService } from '../../../../superadmin/superadmin.service';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { BrandPocPeriodicFinancialStatement } from '../../../../model/report/brandpocperiodicfinancialstatement';

@Component({
  selector: 'brandpocrevenue',
  templateUrl: './brandpocrevenue.template.html',
  styleUrls: ['./brandpocrevenue.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrandPocRevenueComponent implements OnInit {

  config: any;

  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',
  };

  startDate: Date;
  endDate: Date;


  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;

  empId: number;
  selectedBrandId: number = 0;
  showAllBrands: boolean;

  brandPocPeriodicFinancialStatement: BrandPocPeriodicFinancialStatement;
  brandList: BrandDetailsWithReferralCode[];

  perPage: number = 10;
  total: number = 0;

  environment: string = Config.portal.name || 'MyMedic';

  constructor(config: AppConfig,
    private businessAdminService: BusinessAdminService, private superAdminService: SuperAdminService,
    private authService: AuthService, private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);
    this.endDate = new Date();
  }

  ngOnInit(): void {
    this.empId = this.authService.userAuth.employeeId;
    this.selectedBrandId = Config.portal.appId;
    this.showAllBrands = false;
    if (Config.portal.customizations && Config.portal.customizations.allBrandsAccess && this.authService.userAuth.hasHSBusinessAdminRole) {
      this.showAllBrands = true;
      this.getBrands();
    }
    this.getBrandRevenueReport();
  }

  resetError() {
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

  onSubmitCall() {
    this.getBrandRevenueReport();
  }

  getBrandRevenueReport() {
    this.resetError();
    if (!this.startDate || !this.endDate || this.startDate.getTime() <= 0
      || this.endDate.getTime() <= 0
      || this.endDate.getTime() < this.startDate.getTime()) {
      this.errorMessage[0] = 'Please select valid dates';
      this.isError = true;
      this.showMessage = true;
    }
    this.spinnerService.start();
    this.brandPocPeriodicFinancialStatement = new BrandPocPeriodicFinancialStatement();
    this.brandPocPeriodicFinancialStatement.brandPerPocRevenueList = new Array();
    this.total = 0;
    let data1 = new Date((this.startDate ? this.startDate : 0));
    data1.setHours(0, 0, 0, 0);
    let date2 = new Date((this.endDate ? this.endDate : 0));
    date2.setHours(0, 0, 0, 0)
    console.log('BrandId is ' + Config.portal.appId + ' and start time is ' + data1.getTime() + ' and end time is ' + date2.getTime());
    this.businessAdminService.getBrandRevenueByPoc(this.selectedBrandId, data1.getTime(), date2.getTime()).then(response => {
      this.spinnerService.stop();
      if (!response || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
      } else {
        this.brandPocPeriodicFinancialStatement = response;
        if (this.brandPocPeriodicFinancialStatement &&
          this.brandPocPeriodicFinancialStatement.brandPerPocRevenueList
          && this.brandPocPeriodicFinancialStatement.brandPerPocRevenueList.length > 0) {
          this.total = this.brandPocPeriodicFinancialStatement.brandPerPocRevenueList.length;
        } else {
          this.errorMessage[0] = "No Data Found.";
          this.isError = true;
          this.showMessage = true;
        }
      }
    });
  }

  getBrands() {
    this.superAdminService.getBrandDetails().then(brandList => {
      this.brandList = brandList;
    });
  }

  onBrandSelect(index) {
    if (index >= 0) {
      this.selectedBrandId = this.brandList[index].brandId;
    } else {
      this.selectedBrandId = Config.portal.appId;
    }
  }

}
