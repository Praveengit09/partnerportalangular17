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
    selector: 'brandconfiguration',
    templateUrl: './brandconfiguration.template.html',
    styleUrls: ['./brandconfiguration.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class BrandConfigurationComponent implements OnInit {

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    config: any;
    brandConfigurations: BrandConfiguration = new BrandConfiguration();
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
        this.getBrandConfig();

    }
    getBrandConfig() {
        this.spinnerService.start();
        this.superAdminService.getBrandConfiguration(this.brandDetails.brandId).then(resp => {
            this.brandConfigurations = resp;
            this.spinnerService.stop();
            console.log("====>>>>>" + JSON.stringify(this.brandConfigurations));
        });
    }
    submitBrandConfig() {
        this.spinnerService.start();
        this.superAdminService.addAndUpdateBrandConfig(this.brandConfigurations).then(resp => {
            this.spinnerService.start();
            if (resp.statusCode == 200 || resp.statusCode == 201) {
                alert(resp.statusMessage);
                window.history.back();
            }
            else {
                alert(resp.statusMessage);
            }
        });
        console.log("====>>>>>" + JSON.stringify(this.brandConfigurations));
    }
    changeData(type) {
        if (type == 'sqsQueueEnabled') {
            this.brandConfigurations.sqsQueueEnabled = !this.brandConfigurations.sqsQueueEnabled;
        }
        if (type == 'autoRoutingPrescriptionEnabled') {
            this.brandConfigurations.autoRoutingPrescriptionEnabled = !this.brandConfigurations.autoRoutingPrescriptionEnabled;
        }
        if (type == 'prescriptionPharmacyHomeDeliveryEnabled') {
            this.brandConfigurations.prescriptionPharmacyHomeDeliveryEnabled = !this.brandConfigurations.prescriptionPharmacyHomeDeliveryEnabled;
        }
        if (type == 'prescriptionDiagnosticHomeDeliveryEnabled') {
            this.brandConfigurations.prescriptionDiagnosticHomeDeliveryEnabled = !this.brandConfigurations.prescriptionDiagnosticHomeDeliveryEnabled;
        }
        if (type == 'prescriptionPharmacyWalkinEnabled') {
            this.brandConfigurations.prescriptionPharmacyWalkinEnabled = !this.brandConfigurations.prescriptionPharmacyWalkinEnabled;
        }
        if (type == 'prescriptionDiagnosticWalkinEnabled') {
            this.brandConfigurations.prescriptionDiagnosticWalkinEnabled = !this.brandConfigurations.prescriptionDiagnosticWalkinEnabled;
        }
        console.log("===========>>>>", this.brandConfigurations);

    }
}