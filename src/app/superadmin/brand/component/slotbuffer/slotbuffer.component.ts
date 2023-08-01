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
import { BufferConditions } from '../../../../model/brand/bufferConditions';
import { BufferTime } from '../../../../model/brand/bufferTime';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';

@Component({
    selector: 'slotBuffer',
    templateUrl: './slotbuffer.template.html',
    styleUrls: ['./slotbuffer.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class SlotBufferComponent implements OnInit {

    brandDetails: BrandDetailsWithReferralCode;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    config: any;
    isBrandModify: boolean;
    adminId: number;
    bufferTime: BufferTime = new BufferTime();
    brandConfigurations: BrandConfiguration = new BrandConfiguration();
    locBufferTimeList: BufferConditions[] = new Array<BufferConditions>();
    tempBufferTime: Array<any>;
    bufferTypes: string[] = ["gte", "gt", "lte", "lt", "eq", "defaultValue"];

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
        this.getSlotBuffer();
    }
    getSlotBuffer() {
        this.spinnerService.start();
        this.superAdminService.getDiagBufferTime(this.brandDetails.brandId).then(resp => {
            console.log(resp.appId, "====>>>>>" + JSON.stringify(resp));
            var name;
            var entry;
            if (resp.appId > 0) {
                for (let i = 0; i < resp.conditions.length; i++) {
                    var bufferTime: BufferConditions = new BufferConditions();
                    entry = resp.conditions[i]
                    for (name in entry) {
                        this.bufferTypes.forEach(type => {
                            if (name == type && resp.conditions[i][name] > 0) {
                                bufferTime.showOnlyBufferTime = (name === "defaultValue") ? true : false;
                                bufferTime.timeValue = resp.conditions[i][name];
                                bufferTime.bufferType = type;
                                bufferTime.value = resp.conditions[i].value;
                                this.locBufferTimeList.push(bufferTime)
                                console.log(name, "========>>>>", this.locBufferTimeList);
                                return;
                            }
                        })
                    }
                }
            }
            else {
                bufferTime.value = 30;
                bufferTime.bufferType = "defaultValue";
                this.locBufferTimeList.push(bufferTime)
                console.log("====>>>>>" + JSON.stringify(this.locBufferTimeList));
            }
            this.spinnerService.stop();
        });
    }
    onChangeType(e, i) {
        this.locBufferTimeList[i].showOnlyBufferTime = (e == "defaultValue") ? true : false;
        this.locBufferTimeList[i].timeValue = 0;
    }
    removeclick(i: number): void {
        this.locBufferTimeList.splice(i, 1);
    }
    addApplyButton(): void {
        let bufferTime: BufferConditions = new BufferConditions();
        bufferTime.bufferType = "";
        bufferTime.showOnlyBufferTime = false;
        this.locBufferTimeList.push(bufferTime)
        console.log("====>>>>>" + JSON.stringify(this.locBufferTimeList));
    }
    checkError() {
        for (let i = 0; i < this.locBufferTimeList.length; i++) {
            console.log("====>>>>>" + JSON.stringify(this.locBufferTimeList[i]));

            if (this.locBufferTimeList[i].bufferType == undefined || this.locBufferTimeList[i].bufferType == "") {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Enter Valid Details...!!";
                this.showMessage = true;
                return;
            }
            if (this.locBufferTimeList[i].value == 0 || this.locBufferTimeList[i].value == undefined || this.locBufferTimeList[i].value == null) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Enter Valid Details...!!";
                this.showMessage = true;
                return;
            }
            if (this.locBufferTimeList[i].bufferType != "defaultValue" && (this.locBufferTimeList[i].timeValue == 0 || this.locBufferTimeList[i].timeValue == undefined || this.locBufferTimeList[i].timeValue == null)) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please Enter Time...!!";
                this.showMessage = true;
                return;
            }
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
        }
    }
    saveSlotBufferDetails() {
        this.checkError();
        this.tempBufferTime = new Array();
        for (let i = 0; i < this.locBufferTimeList.length; i++) {
            let temp = {
                id: i + 1,
                [this.locBufferTimeList[i].bufferType]: +((this.locBufferTimeList[i].bufferType == "defaultValue") ? i + 1 : this.locBufferTimeList[i].timeValue),
                value: +this.locBufferTimeList[i].value
            }
            this.tempBufferTime.push(temp)
        }
        let reqBody = new BufferTime();
        reqBody.appId = this.brandDetails.brandId;
        reqBody.bookingSubType = 1;
        reqBody.bookingType = SlotBookingDetails.BOOKING_TYPE_INVESTIGATION;
        reqBody.conditions = this.tempBufferTime;
        console.log("=======>>>", reqBody);
        this.spinnerService.start();
        this.superAdminService.UpdateDiagBufferTime(reqBody).then(resp => {
            this.spinnerService.stop();
            if (resp.statusCode == 200 || resp.statusCode == 201) {
                alert("Successfully added");
                window.history.back();
            }
            else {
                alert(resp.statusMessage);
            }
        });

    }
}