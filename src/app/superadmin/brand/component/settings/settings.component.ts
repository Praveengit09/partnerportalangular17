import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';

import { SuperAdminService } from '../../../superadmin.service';
import { BrandConfiguration } from '../../../../model/brand/brandConfiguration';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
    selector: 'settings',
    templateUrl: './settings.template.html',
    styleUrls: ['./settings.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class BrandSettingsComponent implements OnInit {

    brandDetails: BrandDetailsWithReferralCode;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    config: any;
    isBrandModify: boolean;
    adminId: number;
    brandConfigurations: BrandConfiguration = new BrandConfiguration()
    constructor(config: AppConfig,
        private superAdminService: SuperAdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
        this.brandDetails = this.superAdminService.brandDetail;

        this.adminId = auth.loginResponse.employee.empId;
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.brandDetails.brandId != undefined) {
            window.localStorage.setItem('BrandDetails', cryptoUtil.encryptData(JSON.stringify(this.brandDetails)));
        } else {
            if (window.localStorage.getItem('BrandDetails') != null && window.localStorage.getItem('BrandDetails').length > 0) {
                this.brandDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('BrandDetails')));

            }
        }
        console.log("========>>>brand", this.brandDetails);

    }
    onBrandConfig() {
        this.router.navigate(["/app/master/brand/configuration"]);
    }
    onBrandMapping() {

    }
    onSlotBuffer() {
        this.router.navigate(["/app/master/brand/slotBuffer"]);
    }
    onBrandAppMap(){
        this.router.navigate(['/app/master/brand/brandAppMapping'])
    }

}