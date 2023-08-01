import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { InvestigationDetails } from '../../../../model/diagnostics/investigationDetails';
import { WellnessScheduleService } from '../../wellnessSchedule.service';
import { AuthService } from '../../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';

@Component({
    selector: 'savedservices',
    templateUrl: './savedservices.template.html',
    styleUrls: ['./savedservices.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class SavedServicesComponent implements OnInit {

    list1: Array<InvestigationDetails>;
    list2: Array<InvestigationDetails>;
    list3: Array<InvestigationDetails>;
    //pocDetails: any;
    pocId: any;
    selectedInvestigationDetailsList: Array<InvestigationDetails> = new Array<InvestigationDetails>();
    constructor(private wellnessSchService: WellnessScheduleService, private auth: AuthService, private router: Router,
        private route: ActivatedRoute) {
        this.pocId = this.auth.selectedPocDetails.pocId;
    }

    ngOnInit() {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('selectedInvestigationDetailsList') != null && window.localStorage.getItem('selectedInvestigationDetailsList').length > 0) {
            this.selectedInvestigationDetailsList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedInvestigationDetailsList')));
        }
        console.log("selectedInvestigationDetailsList---->" + JSON.stringify(this.selectedInvestigationDetailsList));
        this.divisionOfTheList(this.selectedInvestigationDetailsList);
    }

    divisionOfTheList(respList) {
        this.list1 = new Array<InvestigationDetails>();
        this.list2 = new Array<InvestigationDetails>();
        this.list3 = new Array<InvestigationDetails>();
        if (respList.length >= 3) {
            var l1 = Math.floor(respList.length / 3);
            var l2 = respList.length - (2 * l1);

            for (let i = 0; i < l1; i++) {
                this.list1.push(respList[i]);
            }

            for (let i = l1; i < respList.length - l2; i++) {
                this.list2.push(respList[i]);
            }

            for (let i = 2 * l1; i < respList.length; i++) {
                this.list3.push(respList[i]);
            }

        } else {


            for (let i = 0; i < respList.length; i++) {
                this.list1.push(respList[i]);
            }
        }
        console.log("Array1-->" + JSON.stringify(this.list1));
        console.log("Array2-->" + JSON.stringify(this.list2));
        console.log("Array3-->" + JSON.stringify(this.list3));
    }

    save_continue() {
        this.router.navigate(['/app/wellness/wellness_schedule/createscheduleforwellness/']);
    }

    onEdit() {
        this.router.navigate(['/app/wellness/wellness_schedule/wellness_selectedservices/', this.pocId]);

    }

}
