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
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';


@Component({
  selector: 'brandlist',
  templateUrl: './brandlist.template.html',
  styleUrls: ['./brandlist.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class BrandListingComponent implements OnInit {

  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  brandList: BrandDetailsWithReferralCode[] = new Array<BrandDetailsWithReferralCode>();
  perPage: number = 10;
  total: number = 0;

  columns: any[] = [
    {
      display: 'Brand Logo',
      variable: 'brandImageurl',
      label: 'brandImageurl',
      filter: 'action',
      type: 'image',
      // event: 'brandImageurlButton',
      style: 'image-logo-circle ',
      sort: false
    },
    {
      display: 'Brand Name',
      variable: 'brandName',
      type: 'hyperlink',
      event: 'brandImageurlButton',
      filter: 'action',
      sort: false
    },
    {
      display: 'Organisation',
      variable: 'organisation',
      filter: 'text',
      sort: true
    },
    {
      display: 'Managed By',
      variable: 'managerName',
      filter: 'text',
      sort: false,

    },

    {
      display: 'Action',
      variable: '',
      filter: 'action',
      sort: false,
      type: 'button',
      event: 'modifyButton',
      label: 'Modify',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Modify',
        }
        // ,
        // {
        //   value: '1',
        //   condition: 'eq',
        //   label: 'M',
        //   style: 'btn btn-danger width-100 mb-xs botton_txtdigo '
        // },


      ]
    },

  ];

  sorting: any = {
    column: 'brandId',
    descending: true
  };

  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {

  }

  ngOnInit() {
    window.localStorage.removeItem('BrandDetails');
    this.getBrandList();

  }
  onCreatebrand(): void {
    this.superAdminService.isBrandModify = false;
    console.log("create the dataaaaaa" + JSON.stringify(this.superAdminService.isBrandModify));
    this.router.navigate(['/app/master/brand/details']);
  }

  getBrandList() {
    this.superAdminService.getBrandDetails().then(brandList => {
      this.brandList = brandList;
      for (let i = 0; i < this.brandList.length; i++) {
        if (this.brandList[i].brandImageurl == null || this.brandList[i].brandImageurl == undefined ||
          this.brandList[i].brandImageurl == '' || this.brandList[i].brandImageurl == ' ') {
          this.brandList[i].brandImageurl = 'assets/img/ic_poc_brands.png';
        }
      }
    });
  }
  onButtonClicked(event) {
    this.superAdminService.brandDetail = event;
    this.superAdminService.isBrandModify = true;
    console.log("modify the dataaaaaa" + JSON.stringify(this.superAdminService.isBrandModify));
    if (event.brandId != undefined) {
      this.router.navigate(['/app/master/brand/details']);
    }
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "modifyButton") {
      this.onButtonClicked(e.val);
    }
    else if (e.event == 'brandImageurlButton') {
      this.onHyperLinkClicked(e.val);
    }
  }

  onPage(event: any) {

  }
  onHyperLinkClicked(event) {
    this.superAdminService.brandDetail = event;
    if (event.brandId != undefined)
      this.router.navigate(['/app/master/brand/settings']);
  }

}