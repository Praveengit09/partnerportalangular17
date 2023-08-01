import { Component, ViewEncapsulation, OnInit, Input, SimpleChange } from '@angular/core';
import { DashboardViewVo } from '../../../model/common/dashboardviewvo';
import { CentralDashboardTotalCountView } from '../../../model/common/centraldashboardtotalcountview';

@Component({
    selector: 'customeronboarding',
    templateUrl: './customeronboarding.template.html',
    styleUrls: ['./customeronboarding.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class CustomerOnboardingComponent implements OnInit {

    perPage: number = 5;
    total: number = 0;
    dataMsg: string = '';
    opsDashboardDataList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
    @Input() public onboardingList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView()
    customeronboardingList: DashboardViewVo[] = new Array<DashboardViewVo>();
    hasData:boolean = false;
    columns_onboarding: any[] = [
        {
            display: 'Date',
            variable: 'createdTime',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of Onboarded Users',
            variable: 'onboardingOrderCount',
            filter: 'text',
            sort: false

        },
        {
            display: 'No. of orders with completed customer interaction ',
            variable: 'cutomerInteractedWithConsumerCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with pending customer interaction ',
            variable: 'cutomerPendingdWithConsumerCount',
            filter: 'text',
            sort: false
        }
      

    ];

    ngOnInit(): void {
        this.setData();
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
       if (changes['onboardingList']) {
            this.onboardingList = changes['onboardingList'].currentValue;
            this.setData();
        }
    }
    setData() {
        this.opsDashboardDataList = new CentralDashboardTotalCountView();
      this.opsDashboardDataList.listCentralDashboardViewVo = new Array<DashboardViewVo>();
        this.opsDashboardDataList = this.onboardingList;
        this.hasData = JSON.stringify(this.opsDashboardDataList) != '{}';
        if (this.hasData === true) {
            this.customeronboardingList = this.opsDashboardDataList.listCentralDashboardViewVo;
            this.total = this.customeronboardingList.length;
        }
        else {
            this.total = 0;
            this.dataMsg = 'No Data Found'
        }
    }

    openModal() {
        (<any>$)("#onboarding_modalId").modal("show");
    }

    closeModal(){
        (<any>$)("#onboarding_modalId").modal("hide");
    }
}