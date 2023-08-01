import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { PocDetail } from './../model/poc/pocDetails';
import { Config } from '../base/config';
import { HsLocalStorage } from '../base/hsLocalStorage.service';
import { CryptoUtil } from '../auth/util/cryptoutil';


@Component({
    selector: 'pocpopup',
    styleUrls: ['./pocpopup.style.scss'],
    templateUrl: './pocpopup.template.html',
    encapsulation: ViewEncapsulation.Emulated
    // host: {
    //     class: 'login-page app'
    // },
})
export class PocPopupComponent implements OnInit, OnDestroy {

   environment: string = Config.portal.name || 'MyMedic'; 

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    // [checked]="poc.pocId == selectedPoc.pocId" // add this code in template file to enable radio button to be checked by default
    selectedPoc: any;
    pocList = Array<PocDetail>();
    pocRolesList: any;

    constructor(private authService: AuthService,
        private router: Router, public spinner: SpinnerService, private hsLocalStorage: HsLocalStorage) {
        let item = window.localStorage.getItem('pocRolesList');
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (item)
            this.pocRolesList = JSON.parse(cryptoUtil.decryptData(item));
    }

    ngOnInit() {
        let cryptoUtil = new CryptoUtil();
        if (this.authService.employeePocMappingList) { this.pocRolesList = this.authService.employeePocMappingList; }
        window.localStorage.setItem('pocRolesList', cryptoUtil.encryptData(JSON.stringify(this.pocRolesList)));
        // for (let rolesList of this.pocRolesList) 
        this.pocRolesList.forEach(rolesList => {
            let pocDetails = new PocDetail();
            pocDetails.pocId = rolesList.pocId;
            pocDetails.pocName = rolesList.pocName;
            this.pocList.push(pocDetails);
        });
        this.selectedPoc = this.pocList[0];
        // this.pocList = this.pocList.filter((list)=>{
        // return (list.pocName != null || list.pocName != undefined)
        // })

        this.spinner.stop();
    }
    selectPoc(pocObj, pocPosition) {
        this.spinner.start();
        console.log(pocObj);
        this.selectedPoc = this.pocList.filter((item) => item.pocId == pocObj.pocId)[0];
        this.authService.buildNavBasedOnPOC(pocPosition);
        this.gotoDashboard();
    }

    ngOnDestroy() {
        this.spinner.start();
    }
    gotoDashboard() {
        this.router.navigate(['/app/dashboard']);
    }
}
