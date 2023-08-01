import { OnInit, ViewEncapsulation, Component } from '@angular/core';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { WellnessScheduleService } from '../../wellnessSchedule.service';
import { AuthService } from '../../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { DiagnosticScheduleService } from './../../../../diagnostics/schedule/schedule.service';


@Component({
    selector: 'selectedservices',
    templateUrl: './selectedservices.template.html',
    styleUrls: ['./selectedservices.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class SelectedServicesComponent implements OnInit {

    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    isErrorCheck: boolean = false;
    isMsgError: boolean = false;
    msgError: string = "";
    pocId: number;
    firstChar: string;
    searchTerm: string = "";
    list1: Array<InvestigationDetails>;
    list2: Array<InvestigationDetails>;
    list3: Array<InvestigationDetails>;
    selectedInvestigationDetailsList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    investigationRequest: InvestigationRequest;
    scheduleId: number;
    scheduleType: number;
    col1Checked: boolean;
    col2Checked: boolean;
    col3Checked: boolean;

    constructor(private wellnessSchService: WellnessScheduleService, private auth: AuthService, private router: Router,
        private route: ActivatedRoute) {
        this.investigationRequest = new InvestigationRequest();
        this.scheduleId = 0;
    }

    ngOnInit() {

        this.pocId = JSON.parse(this.route.snapshot.paramMap.get('pocId'));
        this.firstChar = 'a';
        console.log("PocId-->" + this.pocId);

        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('investigationRequest') != undefined && window.localStorage.getItem('investigationRequest') != null && window.localStorage.getItem('investigationRequest').length > 0) {
            this.investigationRequest = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('investigationRequest')));
            this.scheduleId = this.investigationRequest.scheduleId;
            this.scheduleType = 2;
        }
        console.log("investigationRequest in ngOninit---->" + JSON.stringify(this.investigationRequest));
        if (window.localStorage.getItem('selectedInvestigationDetailsList') != null && window.localStorage.getItem('selectedInvestigationDetailsList').length > 0) {
            this.selectedInvestigationDetailsList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedInvestigationDetailsList')));
            this.doCheckForAllSelected();
        }
        console.log("selectedInvestigationDetailsList---->" + JSON.stringify(this.selectedInvestigationDetailsList));

        this.getWellnessListBasedOnFirstChar();

    }

    onSearch() {
        console.log("SearchTerm--->" + this.searchTerm);
        if (this.searchTerm.length > 2) {
            this.firstChar = this.searchTerm;
            this.getWellnessListBasedOnFirstChar();
        }

    }
    
    getWellnessListBasedOnFirstChar() {
        console.log("scheduleId, PocId & FirstChar---->" + this.scheduleId + " & " + this.pocId + " & " + this.firstChar + " & " + this.scheduleType);
        this.wellnessSchService.getWellnessListBasedOnFirstChar(this.pocId, this.firstChar,this.scheduleId,this.scheduleType).then(respList => {
            console.log("response in getDiagnosticListBasedOnFirstChar:: " + JSON.stringify(respList));
            this.divisionOfTheList(respList);
            if (this.selectedInvestigationDetailsList.length > 0) {
                setTimeout(() => {
                    this.doCheckForAllSelected();
                }, 500);
            }
        });
    }

    doCheckForAllSelected() {
        for (let i = 0; i < this.selectedInvestigationDetailsList.length; i++) {
            console.log("which should be checked--->" + this.selectedInvestigationDetailsList[i].serviceId);
            $('#' + this.selectedInvestigationDetailsList[i].serviceId).prop('checked', true);
        }
    }

    onAlphabetClick(ch) {
        this.firstChar = ch;
        this.col1Checked = false;
        this.col2Checked = false;
        this.col3Checked = false;
        this.getWellnessListBasedOnFirstChar();
    }

    onOthersClick() {
        this.firstChar = '#';
        this.col1Checked = false;
        this.col2Checked = false;
        this.col3Checked = false;
        this.wellnessSchService.getWellnessListForOtherChar(this.pocId).then(respList => {
            console.log("response in getDiagnosticListBasedOnFirstChar:: " + JSON.stringify(respList));
            this.divisionOfTheList(respList);
            if (this.selectedInvestigationDetailsList.length > 0) {
                setTimeout(() => {
                    this.doCheckForAllSelected();
                }, 500);
            }
        });
    }

    onColumnChecked(column: number) {
        console.log('Clicked' + column);
        let isChecked: boolean = false;
        if (column == 1) {
            console.log('this.col1Checked' + this.col1Checked);
            isChecked = this.col1Checked;
            this.col1Checked = !isChecked;
        } else if (column == 2) {
            isChecked = this.col2Checked;
            this.col2Checked = !isChecked;
        } else if (column == 3) {
            isChecked = this.col3Checked;
            this.col3Checked = !isChecked;
        }
        console.log('isChecked' + isChecked);
        if (isChecked) {
            this.onUnselectAll(column);
        } else {
            this.onSelectAll(column);
        }
    }

    onSelectAll(column: number) {
        console.log('In On select all' + column);
        if (!this.selectedInvestigationDetailsList) {
            this.selectedInvestigationDetailsList = new Array();
        }
        let isEmptyInitially = (this.selectedInvestigationDetailsList && this.selectedInvestigationDetailsList.length == 0);
        if (column == 1 && this.list1 && this.list1.length > 0) {
            console.log('In On select all list1' + this.list1);
            if (!isEmptyInitially) {
                for (let i = 0; i < this.list1.length; i++) {
                    let foundObj = this.selectedInvestigationDetailsList.find(item => { return item.serviceId == this.list1[i].serviceId });
                    if (!foundObj) {
                        this.selectedInvestigationDetailsList.push(this.list1[i]);
                    }
                }
            } else {
                this.selectedInvestigationDetailsList.push.apply(this.selectedInvestigationDetailsList, this.list1);
            }
        }
        if (column == 2 && this.list2 && this.list2.length > 0) {
            if (!isEmptyInitially) {
                for (let i = 0; i < this.list2.length; i++) {
                    let foundObj = this.selectedInvestigationDetailsList.find(item => { return item.serviceId == this.list2[i].serviceId });
                    if (!foundObj) {
                        this.selectedInvestigationDetailsList.push(this.list2[i]);
                    }
                }
            } else {
                this.selectedInvestigationDetailsList.push.apply(this.selectedInvestigationDetailsList, this.list2);
            }
        }
        if (column == 3 && this.list3 && this.list3.length > 0) {
            if (!isEmptyInitially) {
                for (let i = 0; i < this.list3.length; i++) {
                    let foundObj = this.selectedInvestigationDetailsList.find(item => { return item.serviceId == this.list3[i].serviceId });
                    if (!foundObj) {
                        this.selectedInvestigationDetailsList.push(this.list3[i]);
                    }
                }
            } else {
                this.selectedInvestigationDetailsList.push.apply(this.selectedInvestigationDetailsList, this.list3);
            }
        }
        this.doCheckForAllSelected();
    }

    onUnselectAll(column: number) {
        for (let i = this.selectedInvestigationDetailsList.length - 1; i >= 0; i--) {
            let foundObj = null;
            if (column == 1) {
                foundObj = this.list1.find(item => { return item.serviceId == this.selectedInvestigationDetailsList[i].serviceId });
            }
            if (column == 2) {
                foundObj = this.list2.find(item => { return item.serviceId == this.selectedInvestigationDetailsList[i].serviceId });
            }
            if (column == 3) {
                foundObj = this.list3.find(item => { return item.serviceId == this.selectedInvestigationDetailsList[i].serviceId });
            }
            if (foundObj) {
                $('#' + this.selectedInvestigationDetailsList[i].serviceId).prop('checked', false);
                this.selectedInvestigationDetailsList.splice(i, 1);
            }
        }
    }

    onClickArray(item) {
        console.log("clickedItem--->" + JSON.stringify(item));
        if ($('#' + item.serviceId).prop('checked') == true) {
            console.log("Checked");
            this.selectedInvestigationDetailsList.push(item);
        } else {
            console.log("UnChecked");
            let index = this.selectedInvestigationDetailsList.findIndex(x => x.serviceId == item.serviceId);
            console.log("index--->" + index);
            this.selectedInvestigationDetailsList.splice(index, 1);
        }
        console.log("selectedInvestigationDetailsList--->" + JSON.stringify(this.selectedInvestigationDetailsList));
    }

    saveAndContinue() {
        console.log("selectedInvestigationDetailsList in save & continue--->" + JSON.stringify(this.selectedInvestigationDetailsList));
        if (this.selectedInvestigationDetailsList.length == 0) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Select atleast one test...";
            this.showMessage = true;
            setTimeout(() => {
                this.isError = false;
                this.showMessage = false;
            }, 2000);
            return;
        }
        
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        for (let i = 0; i < this.selectedInvestigationDetailsList.length; i++) {
            delete this.selectedInvestigationDetailsList[i].walkinOrderPriceDetails;
            delete this.selectedInvestigationDetailsList[i].homeOrderPriceDetails;
        }
        window.localStorage.setItem('selectedInvestigationDetailsList', cryptoUtil.encryptData(JSON.stringify(this.selectedInvestigationDetailsList)));
        this.router.navigate(['/app/wellness/wellness_schedule/savedwellness_services/']);
    }

    divisionOfTheList(respList) {
        this.list1 = new Array<InvestigationDetails>();
        this.list2 = new Array<InvestigationDetails>();
        this.list3 = new Array<InvestigationDetails>();
        if (respList.length >= 3) {
            var l1 = Math.floor(respList.length / 3);
            var l2 = respList.length - (2 * l1);
            // this.list1 = new Array<InvestigationDetails>();
            for (let i = 0; i < l1; i++) {
                this.list1.push(respList[i]);
            }
            // this.list2 = new Array<InvestigationDetails>();
            for (let i = l1; i < respList.length - l2; i++) {
                this.list2.push(respList[i]);
            }
            // this.list3 = new Array<InvestigationDetails>();
            for (let i = 2 * l1; i < respList.length; i++) {
                this.list3.push(respList[i]);
            }

        } else {
            //this.list1 = new Array<InvestigationDetails>();
            for (let i = 0; i < respList.length; i++) {
                this.list1.push(respList[i]);
            }
        }
        console.log("Array1-->" + JSON.stringify(this.list1));
        console.log("Array2-->" + JSON.stringify(this.list2));
        console.log("Array3-->" + JSON.stringify(this.list3));

    }


}