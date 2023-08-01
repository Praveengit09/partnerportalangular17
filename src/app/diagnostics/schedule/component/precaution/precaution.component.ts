import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';
import { InvestigationPrecautionRequest } from '../../../../model/superadmin/investigationPrecautionRequest';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { DiagnosticScheduleService } from '../../schedule.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { ServiceItem } from '../../../../model/service/serviceItem';


@Component({
    selector: 'precautions',
    templateUrl: './precaution.template.html',
    styleUrls: ['./precaution.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class PrecautionComponent implements OnInit {


    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    firstChar: string;
    investigationRequest: InvestigationRequest;
    serviceListDisplay: Array<InvestigationDetails>;
    mainServiceList: Array<InvestigationDetails>;
    selectedServiceList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    precautionList: Array<InvestigationPrecautionRequest> = new Array<InvestigationPrecautionRequest>();
    preList: Array<InvestigationPrecautionRequest> = new Array<InvestigationPrecautionRequest>();
    displayTest: any;
    searchTerm: string = "";
    precaution: string = "";
    constructor(config: AppConfig,
        private diagSchService: DiagnosticScheduleService, private auth: AuthService,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('investigationRequest') != null && window.localStorage.getItem('investigationRequest').length > 0) {
            this.investigationRequest = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('investigationRequest')));
            this.mainServiceList = JSON.parse(JSON.stringify(this.investigationRequest.serviceList));
        }

        console.log("nginvestigationList" + JSON.stringify(this.investigationRequest));
        if (this.investigationRequest.precautionList != undefined && this.investigationRequest.precautionList.length > 0) {
            this.preList = this.investigationRequest.precautionList;
            console.log("preList" + JSON.stringify(this.preList));

        }
        console.log("serviceListDisplay in ngOnInIt()-----------> " + JSON.stringify(this.serviceListDisplay));
        console.log("mainServiceList in ngOnInIt()-----------> " + JSON.stringify(this.mainServiceList));
        this.firstChar = 'a';
        this.onAlphabetClick(this.firstChar);
    }

    onAlphabetClick(ch) {
        console.log("inside" + ch);
        this.firstChar = ch;
        this.serviceListDisplay = new Array<InvestigationDetails>();
        console.log("mainServiceList " + JSON.stringify(this.mainServiceList));
        if (ch != '#') {
            this.mainServiceList.forEach(element => {
                console.log("firstchar: " + this.firstChar.toUpperCase() + ">>>>>> " + element.serviceName.charAt(0));
                console.log(+ ">>>>>> " + element.serviceName.charAt(0) == this.firstChar.toUpperCase());
                if (element.serviceName.charAt(0) == this.firstChar.toUpperCase()) {
                    this.serviceListDisplay.push(element);
                }

            });
        } else {
            this.mainServiceList.forEach(element => {
                let indexCode = element.serviceName.charCodeAt(0);
                if (indexCode < 65 || (indexCode > 90 && indexCode < 97) || indexCode > 122) {
                    this.serviceListDisplay.push(element);
                }
            });
        }
        console.log("serviceListDisplay onAlphabetClick--> " + JSON.stringify(this.serviceListDisplay));

        if (this.investigationRequest.precautionList != undefined && this.investigationRequest.precautionList.length > 0) {
            for (let item of this.preList) {
                console.log("preListItem" + JSON.stringify(item));
                item.serviceIdList.forEach(element => {
                    this.mainServiceList.forEach((element2, index) => {
                        if (element.serviceId == element2.serviceId) {
                            this.mainServiceList.splice(index, 1);
                        }
                    });
                    this.serviceListDisplay.forEach((element3, index) => {
                        if (element.serviceId == element3.serviceId) {
                            this.serviceListDisplay.splice(index, 1);
                        }
                    });
                });
            }
        }
    }

    onClickItem(item: InvestigationDetails) {
        console.log("clickedItem--->" + JSON.stringify(item));
        if ($('#' + item.serviceId).prop('checked') == true) {
            console.log("Checked");
            item.isSelected = true;
            this.selectedServiceList.push(item);
        } else {
            console.log("UnChecked");
            let index = this.selectedServiceList.findIndex(x => x.serviceId == item.serviceId);
            console.log("index--->" + index);
            this.selectedServiceList[index].isSelected = false;
            this.selectedServiceList.splice(index, 1);
        }
        console.log("selectedServiceList in onClickArray--->" + JSON.stringify(this.selectedServiceList));
    }

    savePrecautions() {
        if (this.selectedServiceList == undefined || this.selectedServiceList == null || this.selectedServiceList.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Choose atleast one test...";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 1000);
            return;
        }
        var l1: Array<ServiceItem> = new Array<ServiceItem>();
        this.selectedServiceList.forEach(element => {
            var obj = new ServiceItem();
            obj.serviceId = element.serviceId;
            obj.serviceName = element.serviceName;
            l1.push(obj);
        });
        var l2: InvestigationPrecautionRequest = new InvestigationPrecautionRequest();
        l2.precaution = this.precaution;
        l2.serviceIdList = l1;
        this.preList.push(l2);
        console.log("precautionList in savePrecautions--->" + JSON.stringify(this.preList));

        for (let i = 0; i < this.selectedServiceList.length; i++) {
            for (let j = 0; j < this.serviceListDisplay.length; j++) {
                if (this.selectedServiceList[i].serviceId === this.serviceListDisplay[j].serviceId)
                    this.serviceListDisplay.splice(j, 1);
            }
            for (let k = 0; k < this.mainServiceList.length; k++) {
                if (this.selectedServiceList[i].serviceId === this.mainServiceList[k].serviceId)
                    this.mainServiceList.splice(k, 1);
            }
        }
        console.log("serviceListDisplay in savePrecautions----->" + JSON.stringify(this.serviceListDisplay));
        console.log("selectedServiceList in savePrecautions----->" + JSON.stringify(this.selectedServiceList));
        console.log("mainServiceList in savePrecautions----->" + JSON.stringify(this.mainServiceList));

        this.selectedServiceList = new Array<InvestigationDetails>();
        this.precaution = '';
    }

    submitPrecautions() {
        console.log();
        this.investigationRequest.precautionList = this.preList;
        console.log("requestBody" + JSON.stringify(this.investigationRequest));
        this.diagSchService.insertPrecautionInDiagnostic(this.investigationRequest).then(data => {
            console.log("response----->" + JSON.stringify(data));
            if (data.statusCode == 200) {
                this.router.navigate(['/app/diagnostics/schedule/diagnosticschedule/']);
            }
        });

    }

    onDelete(index: number) {
        for (let item of this.preList[index].serviceIdList) {
            console.log("item----->" + JSON.stringify(item));
            var obj = this.investigationRequest.serviceList.find(ele => ele.serviceId == item.serviceId);
            console.log("deleted obj---->" + JSON.stringify(obj));
            this.mainServiceList.push(obj);
            this.serviceListDisplay.push(obj);
        }
        this.preList.splice(index, 1);
        this.onAlphabetClick(this.firstChar);
        console.log("serviceListDisplay in onDelete................>" + JSON.stringify(this.serviceListDisplay));
        console.log("preList in onDelete --------------->" + JSON.stringify(this.preList));
        console.log("mainServiceList in onDelete --------------->" + JSON.stringify(this.mainServiceList));
    }

    testDisplay(test) {
        console.log("testdisp--->" + JSON.stringify(test));
        this.displayTest = test.serviceIdList;
        console.log("display-------->" + JSON.stringify(this.displayTest));
    }

    onSearch() {
        console.log("SearchTerm--->" + this.searchTerm);
        if (this.searchTerm.length > 2) {
            this.firstChar = this.searchTerm;
            this.serviceListDisplay = new Array<InvestigationDetails>();
            this.mainServiceList.forEach(element => {
                console.log("firstchar" + this.firstChar);
                if (element.serviceName.substring(0, this.firstChar.length).toLowerCase() == this.firstChar.toLowerCase()) {
                    this.serviceListDisplay.push(element);
                }
            });
            console.log("serviceListDisplay onSearch--> " + JSON.stringify(this.serviceListDisplay));

        } else if (this.searchTerm.length == 0) {
            this.firstChar = 'a';
            this.onAlphabetClick(this.firstChar);
        }
    }

}