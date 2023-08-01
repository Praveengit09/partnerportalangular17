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
// import * as angular from 'angular';

@Component({
    selector: 'brandappmapping',
    templateUrl: './brandappmapping.template.html',
    styleUrls: ['./brandappmapping.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class BrandMappingComponent implements OnInit {

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    perPage: number = 10;
    total: number = 0;
    isValid: boolean = false;
    script: any;
    formatting: any;
    message: any;
    brandDetails: BrandDetailsWithReferralCode;

    constructor(config: AppConfig,
        private superAdminService: SuperAdminService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
        this.brandDetails = this.superAdminService.brandDetail;
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
        this.formatting = { color: 'green', 'background-color': '#d0e9c6' };
        this.message = "";
        this.getBrandAppMapping();
    }
    getBrandAppMapping() {
        this.spinnerService.start();
        this.superAdminService.getBrandAppMapping(this.brandDetails.brandId).then(resp => {
            // if (resp.statusCode == 200 || resp.statusCode == 201) {
            this.script = JSON.stringify(resp);
            this.spinnerService.stop();
            // }
        });
    };

    updateJsonObject() {
        try {
            JSON.parse(this.script);
        }
        catch (e) {
            this.isValid = false;
            this.formatting = { color: 'red', 'background-color': '#f2dede' };
        }
        this.message = JSON.parse(this.script);
        this.isValid = true;
        this.formatting = { color: 'green', 'background-color': '#d0e9c6' };
    };
    onSubmit() {
        this.spinnerService.start();
        this.superAdminService.UpdateBrandAppMapping(this.message).then(resp => {
            this.spinnerService.stop();
            if (resp.statusCode == 200 || resp.statusCode == 201) {
                alert(resp.statusMessage);
                window.history.back();
            }
            else {
                alert(resp.statusMessage);
            }
        });
        console.log("formatting==>>>", this.message);
    }
}