import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from './../../../base/util/common-util';

@Component({
    selector: 'centralpostwallet',
    templateUrl: './centralpostwallet.template.html',
    styleUrls: ['./centralpostwallet.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class CentralPostWalletComponent implements OnInit {
    postwalletList: any;
    mobileNo: string;
    amount: number;
    dataMsg = '';
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    age: any;

    perPage: number = 10;
    total: number = 0;
    isCorrectMobile: boolean = false;

    columns: any[] = [
        {
            display: 'Patient Details',
            variable: 'profile.fName profile.lName,profile.age,profile.gender',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Contact Info',
            variable: 'profile.contactInfo.mobile, profile.contactInfo.email',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Post Wallet Amount Due',
            variable: 'usedPostWalletAmount',
            filler: ',',
            filter: 'number',
            sort: false
        },
    ]
    sorting: any = {
        column: 'updatedTime',
        descending: true
    };


    constructor(private adminService: AdminService, private spinner: SpinnerService, private commonUtil: CommonUtil) {

    }
    ngOnInit() {
        this.amount = 0;
        this.mobileNo = '';
        console.log("ngOnInit:" + this.amount + " " + this.mobileNo);
        this.getPostwalletList();

    }
    getPostwalletList() {
        this.spinner.start();
        this.adminService.getPostWalletDetails(this.mobileNo, this.amount).then(responseList => {
            this.spinner.stop();
            if (this.total > 0)
                this.postwalletList.push.apply(this.postwalletList, responseList);
            else {
                this.postwalletList = new Array<any>();
                this.postwalletList = responseList;
                this.postwalletList.forEach(element => {
                    element.profile.age = this.commonUtil.getAgeForall(element.profile.dob);
                })
            }
            if (this.postwalletList.length > 0) {
                this.total = this.postwalletList.length;
                console.log("this.total " + this.total);
            }

        });
    }
    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.onSearch();
        }
    }
    onEnterPressedAmount(e) {
        if (e.keyCode == 13) {
            this.amountonSearch();
        }
    }
    validateNumberInputOnly(event) {

        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    onSearch() {
        this.amount = 0;
        this.mobileNo = this.mobileNo.trim();
        if (this.mobileNo.length < 10 || this.mobileNo.length > 10) {
            this.isCorrectMobile = true;
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Enter Valid 10 digits Number.";
            this.showMessage = true;
            return;
        } else {
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
            this.amount = 0;
            this.total = 0;
            this.postwalletList = new Array<any>();
            this.dataMsg = 'Loading.....';
            this.spinner.start(); this.dataMsg = 'Loading.....';
            this.spinner.start();
            this.adminService.getPostWalletDetails(this.mobileNo, this.amount).then(responseList => {
                this.spinner.stop();
                this.postwalletList = responseList;
                this.postwalletList.forEach(element => {
                    element.profile.age = this.commonUtil.getAgeForall(element.profile.dob);
                })
                if (this.postwalletList.length > 0) {
                    this.total = this.postwalletList.length;
                    this.isError = false;
                    this.errorMessage = new Array();
                    this.showMessage = false;
                } else {
                    this.total = this.postwalletList.length;
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.dataMsg = "No Data is found for this Mobile Number.";
                    this.showMessage = true;
                }
            })
        }
    }

    amountonSearch() {
        this.mobileNo = '';
        this.amount = this.amount;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.total = 0;
        this.postwalletList = new Array<any>();
        this.dataMsg = 'Loading.....';
        this.spinner.start(); this.dataMsg = 'Loading.....';
        this.spinner.start();
        this.adminService.getPostWalletDetails(this.mobileNo, this.amount).then(responseList => {
            this.spinner.stop();
            this.postwalletList = responseList;
            this.postwalletList.forEach(element => {
                element.profile.age = this.commonUtil.getAgeForall(element.profile.dob);
            })

            if (this.postwalletList.length > 0) {
                this.total = this.postwalletList.length;
                this.isError = false;
                this.errorMessage = new Array();
                this.showMessage = false;
            } else {
                this.total = this.postwalletList.length;
                this.isError = true;
                this.errorMessage = new Array();
                this.dataMsg = "No Data is found for this amount Number.";
                this.showMessage = true;
            }
        })
    }
    onPage(page: number) {
        this.amount = 0;
        this.mobileNo = '';
        console.log("===>page" + JSON.stringify(this.amount + " " + this.mobileNo))
        this.getPostwalletList();
    }

    clickEventHandler(event) {

    }

}



