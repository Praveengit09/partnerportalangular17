import { Component, ViewEncapsulation, OnInit, Input, SimpleChange } from '@angular/core';
import { CentralDashboardTotalCountView } from '../../../model/common/centraldashboardtotalcountview';
import { DashboardViewVo } from '../../../model/common/dashboardviewvo';

@Component({
    selector: 'diagnosticsordermanagement',
    templateUrl: './diagnosticsordermanagement.template.html',
    styleUrls: ['./diagnosticsordermanagement.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class DiagnosticsOrderManagementComponent implements OnInit {
    perPage: number = 5;
    total: number = 0;
    dataMsg: string = '';
    hasData: boolean = false;
    opsDashboardDataList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
    @Input() public diagnosticList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
    diagnosticOrderManagementList: DashboardViewVo[] = new Array<DashboardViewVo>();
    columns_diagnosticordermanagement: any[] = [
        {
            display: 'Date',
            variable: 'createdTime',
            filter: 'text',
            sort: true
        },
        {

            display: 'No. of total orders',
            variable: 'diagnosticOrderCount',
            filter: 'text',
            sort: false

        },
        {
            display: 'No. of orders completed',
            variable: 'diagnosticOrderCompletedCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders pending',
            variable: 'diagnosticOrderPendingCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders cancelled',
            variable: 'diagnosticOrderCancelingCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with completed customer interaction',
            variable: 'cutomerInteractedWithConsumerCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with pending customer interaction',
            variable: 'cutomerPendingdWithConsumerCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with completed diagnoastic centre interaction',
            variable: 'cutomerInteractedWithdiagnosticCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with pending diagnoastic centre interaction',
            variable: 'cutomerPendingdWithdiagnosticCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders prescriptions',
            variable: 'doctorPrescriptionsCount',
            filter: 'text',
            sort: false
        },

    ];

    ngOnInit(): void {
        this.setData();
    }


    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['diagnosticList']) {
            this.diagnosticList = changes['diagnosticList'].currentValue;
            this.setData();
        }

    }

    setData() {
        this.opsDashboardDataList = new CentralDashboardTotalCountView();
        this.opsDashboardDataList.listCentralDashboardViewVo = new Array<DashboardViewVo>();
        this.opsDashboardDataList = this.diagnosticList;
        this.hasData = JSON.stringify(this.opsDashboardDataList) != '{}';
        if (this.hasData === true) {
            this.diagnosticOrderManagementList = this.opsDashboardDataList.listCentralDashboardViewVo;
            this.total = this.diagnosticOrderManagementList.length;
        }
        else {
            this.total = 0;
            this.dataMsg = 'No Data Found'
        }
    }

    openModal() {
        (<any>$)("#diagnostic_modalId").modal("show");
    }

    closeModal() {
        (<any>$)("#diagnostic_modalId").modal("hide");
    }
}