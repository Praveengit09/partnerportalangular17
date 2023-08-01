import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { PackageService } from '../../../packages/package.service';
import { AdminService } from '../../admin.service';
import { WalletService } from '../wallet.service';

@Component({
    selector: 'userwallet',
    templateUrl: './userwallet.template.html',
    styleUrls: ['./userwallet.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class UserWalletComponent implements OnInit {


    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;
    mobileNo: string = '';
    profileId: number = 0;
    selectedProfile: any;
    walletBalance: number = 0;
    billAmount: number = 0;
    walletAmountUsed: number = 0;
    referenceId: string = '';
    remarks: string = '';
    packageSelected: boolean;

    constructor(private walletService: WalletService, private adminService: AdminService, private pacakgeService: PackageService, private authService: AuthService, private spinner: SpinnerService, private commonUtil: CommonUtil) {
    }

    ngOnInit() {
    }

    onEnterPressed(e) {
        if (e.keyCode == 13)
            this.getUserDetails();
    }

    validateNumberInputOnly(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode == 8 || event.keyCode == 46
            || event.keyCode == 37 || event.keyCode == 39) {
            return true;
        }
        else if (key < 48 || key > 57) {
            return false;
        }
        else return true;
    }

    onPackageChange(result) {
        this.packageSelected = result;
    }

    getUserDetails() {
        this.spinner.start();
        this.resetParams(false);
        if (this.mobileNo.length < 10 || this.mobileNo.length > 10) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please Enter valid 10 digit mobile number";
            this.spinner.stop();
            return;
        }
        else {
            this.spinner.stop();
            this.isError = false;
            this.showMessage = false;
            this.errorMessage = new Array();
        }
        this.getDetailsBasedOnMobileNo();
    }

    getDetailsBasedOnMobileNo() {
        this.selectedProfile = null;
        this.spinner.start();
        this.adminService.getRegisteredUser(this.mobileNo).then(response => {
            if (response && response.length > 0) {
                this.selectedProfile = response[0];
                this.profileId = this.selectedProfile.profileId;
                this.spinner.stop();
                this.getWalletBalance();
            } else {
                this.spinner.stop();
                this.isError = true;
                this.showMessage = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "User not found. Please try again.";
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }).catch(error => {
            this.spinner.stop();
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Something went wrong. Please try again.";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            this.resetParams(true);
        });
    }

    getWalletBalance() {
        this.spinner.start();
        this.pacakgeService.getWalletAmount(this.profileId, false).then(response => {
            this.spinner.stop();
            this.walletBalance = response.walletBalance;
            this.walletAmountUsed = this.walletBalance;
        }).catch(error => {
            this.spinner.stop();
            this.walletBalance = this.walletAmountUsed = 0;
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Something went wrong. Please try again.";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        });
    }

    checkAndUpdateWallet() {
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
        if (!this.billAmount || this.billAmount == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter valid bill amount";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            return;
        }
        if (!this.walletAmountUsed || this.walletAmountUsed == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter valid wallet usage amount";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            return;
        }

        this.spinner.start();
        this.walletService.checkWalletAmount(this.profileId, this.billAmount, this.walletAmountUsed, this.packageSelected).then(response => {
            if (response.statusCode == 200 || response.statusCode == 201) {
                this.spinner.stop();
                if (+response.data && +response.data > 0 && this.walletAmountUsed == +response.data) {
                    // proceed to purchase
                    this.updateWallet();
                } else {
                    this.walletAmountUsed = +response.data;
                    (<any>$("#showwalletmessage")).modal("show");

                    // this.isError = true;
                    // this.showMessage = true;
                    // this.errorMessage = new Array();
                    // this.errorMessage[0] = "Your wallet does not have enough balance or cannot be utilized.";
                }
            } else {
                this.spinner.stop();
                this.isError = true;
                this.showMessage = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Something went wrong. Please try again.";
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }).catch(err => {
            this.spinner.stop();
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Something went wrong. Please try again.";
        })

    }

    updateWallet() {
        let request = {
            parentProfileId: this.profileId,
            finalAmount: this.billAmount,
            usedWalletAmount: this.walletAmountUsed,
            referenceId: this.referenceId,
            remarks: this.remarks,
            empId: this.authService.userAuth.employeeId,
            packageSelected: this.packageSelected
        }
        this.spinner.start();
        this.walletService.updateWalletUsage(request).then(response => {
            this.spinner.stop();
            this.resetParams(false);
            this.isError = false;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Updated the wallet successfully.";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });

        }).catch(err => {
            this.spinner.stop();
            this.isError = true;
            this.showMessage = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Something went wrong. Please try again.";
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        })
    }

    resetParams(resetMobile) {

        if (resetMobile) {
            this.mobileNo = '';
        }
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
        this.profileId = 0;
        this.selectedProfile = null;
        this.walletBalance = 0;
        this.billAmount = 0;
        this.walletAmountUsed = 0;
        this.referenceId = '';
        this.remarks = '';
        this.packageSelected = false;
    }

}