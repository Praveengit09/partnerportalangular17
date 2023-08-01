import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { DiagnosticScheduleService } from '../../schedule.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';


@Component({
    selector: 'savedtest',
    templateUrl: './savedtest.template.html',
    styleUrls: ['./savedtest.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class SavedTestComponent implements OnInit {

    list1: Array<InvestigationDetails>;
    list2: Array<InvestigationDetails>;
    list3: Array<InvestigationDetails>;
    //pocDetails: any;
    pocId:any;
    selectedInvestigationDetailsList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    constructor(private diagSchService: DiagnosticScheduleService, private auth: AuthService, private router: Router,
        private route: ActivatedRoute) {
    this.pocId = this.auth.selectedPocDetails.pocId;
        }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('selectedInvestigationDetailsList') != null && window.localStorage.getItem('selectedInvestigationDetailsList').length > 0) {
            this.selectedInvestigationDetailsList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedInvestigationDetailsList')));
        }
        console.log("selectedInvestigationDetailsList---->" + JSON.stringify(this.selectedInvestigationDetailsList));

        // if (window.localStorage.getItem('pocDetailInSuperAdmin') != null && window.localStorage.getItem('pocDetailInSuperAdmin').length > 0) {
        //     this.pocDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pocDetailInSuperAdmin')));
        // }
        //console.log("pocDetails in NgOninit---->" + JSON.stringify(this.pocDetails));

        this.divisionOfTheList(this.selectedInvestigationDetailsList);
    }

    divisionOfTheList(respList) {
        this.list1 = new Array<InvestigationDetails>();
        this.list2 = new Array<InvestigationDetails>();
        this.list3 = new Array<InvestigationDetails>();
        if (respList.length >= 3) {
            var l1 = Math.floor(respList.length / 3);
            var l2 = respList.length - (2 * l1);
            //this.list1 = new Array<InvestigationDetails>();
            for (let i = 0; i < l1; i++) {
                this.list1.push(respList[i]);
            }
           // this.list2 = new Array<InvestigationDetails>();
            for (let i = l1; i < respList.length - l2; i++) {
                this.list2.push(respList[i]);
            }
            //this.list3 = new Array<InvestigationDetails>();
            for (let i = 2 * l1; i < respList.length; i++) {
                this.list3.push(respList[i]);
            }

        } else {

           // this.list1 = new Array<InvestigationDetails>();
            for (let i = 0; i < respList.length; i++) {
                this.list1.push(respList[i]);
            }
        }
        console.log("Array1-->" + JSON.stringify(this.list1));
        console.log("Array2-->" + JSON.stringify(this.list2));
        console.log("Array3-->" + JSON.stringify(this.list3));
    }

    save_continue() {
        this.router.navigate(['/app/diagnostics/schedule/createnewdiagnosticschedule/']);
    }

    onEdit() {
        this.router.navigate(['/app/diagnostics/schedule/selectedtest/', this.pocId]);
        // this.router.navigate(['/app/master/poc/manage/selectedtest/', 1007]);
    }

}
