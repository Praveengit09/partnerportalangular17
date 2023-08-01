import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PharmacyService } from './../../../pharmacy.service';
import { AuthService } from './../../../../auth/auth.service'
import { AdminPharmacyDeliveryResponse } from "./../../../../model/pharmacy/adminPharmacyDeliveryResponse";
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';

@Component({
    selector: 'returnsummary',
    templateUrl: './summary.template.html',
    styleUrls: ['./summary.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class ReturnSummaryComponent implements OnInit {
    
    processOrderDetails: AdminPharmacyDeliveryResponse;
    
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    showMessagetxt: boolean;
    
    constructor(private pharmacyService: PharmacyService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService) {
    
    }

    ngOnInit() {
        this.processOrderDetails = this.pharmacyService.pharmacyDeliveryDetails;
        console.log("processorder:::" + JSON.stringify(this.processOrderDetails))
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.processOrderDetails != undefined || this.processOrderDetails != null) {
            window.localStorage.setItem('processOrderDetails', cryptoUtil.encryptData(JSON.stringify(this.processOrderDetails)));
        } else {
            if (window.localStorage.getItem('processOrderDetails') != null && window.localStorage.getItem('processOrderDetails').length > 0) {
                this.processOrderDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('processOrderDetails')));
            }
        }
    }

    onGenerateBack(): void {
        this.router.navigate(['/app/pharmacy/returns/edit']);
    }

    onSubmitChanges(): void {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.processOrderDetails.empFirstName = this.auth.loginResponse.employee.firstName;
        this.processOrderDetails.empLastName = this.auth.loginResponse.employee.lastName;
        this.processOrderDetails.empId = this.auth.loginResponse.employee.empId;
        this.processOrderDetails.updatedTime = new Date().getTime();
        this.processOrderDetails.actionStatus = AdminPharmacyDeliveryResponse.PENDING_CUSTOMER_APPROVAL;
        this.spinnerService.start();
        this.pharmacyService.updatePharmacyReturn(this.processOrderDetails).then(baseResponse => {
            this.spinnerService.stop();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if (baseResponse.statusCode == 201) {
                this.isError = false;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Return order is modified and submited for user approval.";
                this.showMessage = true;
                this.router.navigate(['/app/pharmacy/returns/list']);
                return;
            } else {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error while processing request !!! Try Again!!!";
                this.showMessage = true;
                return;
            }
        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
          });
    }

}