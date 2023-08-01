import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';

import { Config } from '../../../../base/config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from "../../../../auth/auth.service";
import { BusinessAdminService } from '../../../businessadmin.service';

import { TotalBrandRevenueFinancialStatement } from '../../../../model/report/totalbrandrevenuefinancialstatement';
import { BrandPocPerCategoryRevenue } from '../../../../model/report/brandpocpercategoryrevenue';
import { ReportConstants } from '../../../../constants/report/reportconstants';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { CartItem } from '../../../../model/basket/cartitem';
import { SuperAdminService } from '../../../../superadmin/superadmin.service';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';

@Component({
  selector: 'brandrevenue',
  templateUrl: './brandrevenue.template.html',
  styleUrls: ['./brandrevenue.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrandRevenueComponent implements OnInit {

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

  brandRevenueFinancialStatement: TotalBrandRevenueFinancialStatement;
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
    this.brandRevenueFinancialStatement = new TotalBrandRevenueFinancialStatement();
    this.brandRevenueFinancialStatement.brandPeriodicFinancialStatementList = new Array();
    this.total = 0;
    console.log('BrandId is ' + Config.portal.appId + ' and start time is ' + this.startDate.getTime() + ' and end time is ' + this.endDate.getTime());
    this.businessAdminService.getBrandRevenue(this.selectedBrandId, this.startDate.getTime(), this.endDate.getTime()).then(response => {
      this.spinnerService.stop();
      if (!response || response.length <= 0) {
        this.isError = true;
        this.showMessage = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "No Reports Found";
      } else {
        this.brandRevenueFinancialStatement = response;
        if (this.brandRevenueFinancialStatement &&
          this.brandRevenueFinancialStatement.brandPeriodicFinancialStatementList
          && this.brandRevenueFinancialStatement.brandPeriodicFinancialStatementList.length > 0) {
          this.total = this.brandRevenueFinancialStatement.brandPeriodicFinancialStatementList.length;
          this.brandRevenueFinancialStatement.brandPeriodicFinancialStatementList.forEach(function (item) {
            if (item && item.brandPocPerCategoryRevenueList && item.brandPocPerCategoryRevenueList.length > 0) {
              item.revenuePerCategory = '';
              for (let i = 0; i < item.brandPocPerCategoryRevenueList.length; i++) {
                let brandCategoryRevenune: BrandPocPerCategoryRevenue = item.brandPocPerCategoryRevenueList[i];
                let basketType = '';
                if (brandCategoryRevenune.bookingType && brandCategoryRevenune.bookingType > 0) {
                  basketType = SlotBookingDetails.getSlotBookingType(brandCategoryRevenune.bookingType);
                } else if (brandCategoryRevenune.cartItemType && brandCategoryRevenune.cartItemType > 0) {
                  basketType = CartItem.getcartItemType(brandCategoryRevenune.cartItemType);
                }
                let transactionPartnerType = ReportConstants.gettransactionPartnerType(brandCategoryRevenune.transactionPartnerType);
                item.brandPocPerCategoryRevenueList[i].basketTypeLabel = basketType;
                item.brandPocPerCategoryRevenueList[i].transactionPartnerTypeLabel = transactionPartnerType;
                // item.revenuePerCategory += 'Booking Type:' + basketType + ' | Transaction Type:' + transactionPartnerType + ' | Brand Revenue:' + brandCategoryRevenune.pocRevenue + ' | HS Revenue:' + brandCategoryRevenune.hsRevenue + ' <br/>';
              }
            }
          });
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
