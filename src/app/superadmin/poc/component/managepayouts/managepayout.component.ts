import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { PocPayoutConfigurationDetails, BankAccountDetails } from '../../../../model/poc/pocpayoutconfigurationdetails'
import { PocDetail } from '../../../../model/poc/pocDetails';
import { ManagePayoutsConstants } from '../../../../model/poc/payoutconstants';
import { Router } from '@angular/router';

@Component({
    selector: 'managepayout',
    templateUrl: './managepayout.template.html',
    styleUrls: ['./managepayout.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class ManagePayoutComponent implements OnInit {
    contactList: Array<string> = new Array<string>();
    payoutDetails: PocPayoutConfigurationDetails = new PocPayoutConfigurationDetails();
    emailList: Array<any> = new Array<any>();
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    pocDetails: PocDetail;
    accountHolderName: string;
    accountNo: string;
    confirmAccountNumber: string;
    ifscCode: string;
    validation: any;
    constructor(config: AppConfig, private hsLocalStorage: HsLocalStorage, private superAdminService: SuperAdminService,
        private spinnerService: SpinnerService, private validationUtil: ValidationUtil, private router: Router) {
        this.validation = validationUtil;
        this.payoutDetails.bankAccountDetails = new BankAccountDetails();
    }
    ngOnInit() {
        this.fetchPocDetails();
        this.getManagePayoutDetails();
        this.getContactList();
        this.getEmailList();
    }
    fetchPocDetails() {
        this.pocDetails = this.superAdminService.pocDetail;
        if (this.pocDetails) {
            let data = { 'pocDetails': this.pocDetails };
            this.hsLocalStorage.setDataEncrypted('pocDetailloc', data);
        } else {
            let locData = this.hsLocalStorage.getDataEncrypted('pocDetailloc');
            this.pocDetails = locData.pocDetails;
            this.superAdminService.pocDetail = this.pocDetails;
        }
    }
    getManagePayoutDetails() {
        this.spinnerService.start();
        this.superAdminService.getPayoutDetails(this.pocDetails.pocId).then(details => {
            this.payoutDetails = details;
            if (this.payoutDetails.notificationContactNos)
                this.contactList = this.payoutDetails.notificationContactNos;
            if (this.payoutDetails.notificationEmails)
                this.emailList = this.payoutDetails.notificationEmails;
            if (this.payoutDetails.bankAccountDetails)
                this.confirmAccountNumber = this.payoutDetails.bankAccountDetails.accountNo;
            if (this.payoutDetails.payoutMode == "" || this.payoutDetails.payoutMode == undefined || this.payoutDetails.payoutMode == null)
                this.payoutDetails.payoutMode = ManagePayoutsConstants.CN_UPI;
            this.spinnerService.stop();
        })
    }
    getContactList() {
        if (!this.payoutDetails.notificationContactNos || this.payoutDetails.notificationContactNos.length <= 0) {
            if (!this.contactList) {
                this.contactList = new Array();
            }
            this.contactList.push('');
            this.payoutDetails.notificationContactNos = this.contactList;
        }
    }
    trackByFn(index: any, item: any) {
        return index;
    }
    getEmailList() {
        if (!this.payoutDetails.notificationEmails || this.payoutDetails.notificationEmails.length <= 0) {
            if (!this.emailList) {
                this.emailList = new Array();
            }
            this.emailList.push('');
            this.payoutDetails.notificationEmails = this.emailList;
        }
    }
    addApplyButton() {
        if (this.contactList[this.contactList.length - 1] == "") {
            return;
        } else if (this.contactList[this.contactList.length - 1].length < 10) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter valid contactNumber...!!";
            this.showMessage = true;
            return;
        }
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;

        this.contactList.push('');
    }
    removeAddress(index: number) {
        this.contactList.splice(index, 1);
    }
    addEmail() {
        if (this.emailList[this.emailList.length - 1] == "") {
            return;
        }
        this.emailList.push('');
    }
    removeEmail(index: number) {
        if (this.emailList.length > 1)
            this.emailList.splice(index, 1);
    }
    changeData() {
        this.payoutDetails.payoutEnabled = !this.payoutDetails.payoutEnabled;
    }
    resetfields() {
        this.payoutDetails.bankAccountDetails = new BankAccountDetails();
        this.payoutDetails.upiAccountDetails = "";
        this.payoutDetails.paytmAccountNo = "";
        // this.accountHolderName = "";
        // this.accountNo = "";
        // this.confirmAccountNumber = "";
        // this.ifscCode = "";
    }
    checkPayoutModeSelection(index) {
        if (!this.payoutDetails.bankAccountDetails)
            this.payoutDetails.bankAccountDetails = new BankAccountDetails();
        // this.resetfields();
        if (index == 0) {
            this.payoutDetails.payoutMode = ManagePayoutsConstants.CN_UPI;
        }
        else if (index == 1) {
            this.payoutDetails.payoutMode = ManagePayoutsConstants.CN_NEFT;
        }
        else if (index == 2) {
            this.payoutDetails.payoutMode = ManagePayoutsConstants.CN_IMPS;
        }
        else if (index == 3) {
            this.payoutDetails.payoutMode = ManagePayoutsConstants.CN_PAYTM;
        }
    }
    validateEmailId(email: string) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    onPayoutSubmit() {
        this.onPayoutValidate();
        this.payoutDetails.notificationContactNos = new Array<string>();
        this.payoutDetails.notificationEmails = new Array<string>();
        this.payoutDetails.notificationEmails = this.emailList;
        this.payoutDetails.notificationContactNos = this.contactList;
        this.payoutDetails.pocId = this.pocDetails.pocId;
        if (this.isError == false) {
            this.spinnerService.start();
            this.superAdminService.updatePayoutDetails(this.payoutDetails).then(resp => {
                this.spinnerService.stop();
                if (resp.statusCode == 200 || resp.statusCode == 201) {
                    alert(resp.statusMessage);
                }
                else {
                    alert(resp.statusMessage)
                    return;
                }
            })
        }
    }
    onPayoutValidate() {
        if ((this.payoutDetails.payoutDuration == 0 || this.payoutDetails.payoutDuration > 365)
            || this.payoutDetails.payoutDuration == undefined
            || this.payoutDetails.payoutDuration == null || this.payoutDetails.payoutDuration.toString() == "") {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter the payout Duration between 1 to 365...!!";
            this.showMessage = true;
            return;
        }
        if (this.payoutDetails.payoutMode == ManagePayoutsConstants.CN_UPI && (this.payoutDetails.upiAccountDetails == null || this.payoutDetails.upiAccountDetails == undefined || this.payoutDetails.upiAccountDetails == "")) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter Upi Account Details...!!";
            this.showMessage = true;
            return;
        }
        if (this.payoutDetails.payoutMode == ManagePayoutsConstants.CN_NEFT || this.payoutDetails.payoutMode == ManagePayoutsConstants.CN_IMPS) {
            if ((this.payoutDetails.bankAccountDetails.accountHolderName == null || this.payoutDetails.bankAccountDetails.accountHolderName == undefined || this.payoutDetails.bankAccountDetails.accountHolderName == "") ||
                (this.payoutDetails.bankAccountDetails.accountNo == null || this.payoutDetails.bankAccountDetails.accountNo == undefined || this.payoutDetails.bankAccountDetails.accountNo == "") ||
                (this.payoutDetails.bankAccountDetails.ifscCode == null || this.payoutDetails.bankAccountDetails.ifscCode == undefined || this.payoutDetails.bankAccountDetails.ifscCode == "")
            ) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Enter Bank Account Details...!!";
                this.showMessage = true;
                return;
            }
            if (this.payoutDetails.bankAccountDetails.accountNo && this.payoutDetails.bankAccountDetails.accountNo != "" && this.payoutDetails.bankAccountDetails.accountNo != this.confirmAccountNumber) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Your Account Number do not match";
                this.showMessage = true;
                return;
            }
        }

        if (this.payoutDetails.payoutMode == ManagePayoutsConstants.CN_PAYTM && (this.payoutDetails.paytmAccountNo == null || this.payoutDetails.paytmAccountNo == undefined || this.payoutDetails.paytmAccountNo == "")) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter PayTm Account Details...!!";
            this.showMessage = true;
            return;
        }
        for (let i = 0; i < this.emailList.length; i++) {
            if (this.emailList[i + 1] == "" || this.emailList[i + 1] == null || this.emailList[i + 1].length <= 0) {
                this.emailList.splice(i + 1, 1);
            }
            if (!this.validateEmailId(this.emailList[i]) || (this.emailList[0] == undefined || this.emailList[0] == null || this.emailList[0] == "")) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Enter valid emailId...!!";
                this.showMessage = true;
                return;
            }
        }
        for (let i = 0; i < this.contactList.length; i++) {
            if (this.contactList[0] == undefined || this.contactList[0] == null
                || this.contactList[i].length < 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Enter valid contactNumber...!!";
                this.showMessage = true;
                return;
            }
            if (this.contactList[i] == "" || this.contactList[i] == null) {
                this.contactList.splice(i, 1);
            }
        }
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
    }
}