import { Component, ViewEncapsulation, OnInit, Input, SimpleChange } from '@angular/core';
import { CentralDashboardTotalCountView } from '../../../model/common/centraldashboardtotalcountview';
import { DashboardViewVo } from '../../../model/common/dashboardviewvo';

@Component({
    selector: 'doctorsordermanagement',
    templateUrl: './doctorsordermanagement.template.html',
    styleUrls: ['./doctorsordermanagement.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class DoctorsOrderManagementComponent implements OnInit {
    perPage: number = 5;
    total: number = 0;
    dataMsg: string = '';
    hasData: boolean = false;
    opsDashboardDataList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
    @Input() public doctorList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
    doctorManagementList: DashboardViewVo[] = new Array<DashboardViewVo>();
    columns_doctorordermanagement: any[] = [
        {
            display: 'Date',
            variable: 'createdTime',
            filter: 'text',
            sort: false
        },
        {

            display: 'No. of Doctor Consultations',
            variable: 'doctorOrderCount',
            filter: 'text',
            sort: false

        },
        {
            display: 'No. of orders completed',
            variable: 'doctorOrderCompletedCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders pending',
            variable: 'doctorOrderPendingCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders cancelled',
            variable: 'doctorOrderCancelingCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with completed  customer interaction',
            variable: 'cutomerInteractedWithConsumerCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with  pending customer interaction',
            variable: 'cutomerPendingdWithConsumerCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with completed doctor interaction',
            variable: 'cutomerInteractedWithDoctorCount',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of orders with pending doctor interaction',
            variable: 'cutomerPendingdWithDoctorCount',
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

    setData() {
        this.opsDashboardDataList = new CentralDashboardTotalCountView();
        this.opsDashboardDataList.listCentralDashboardViewVo = new Array<DashboardViewVo>();
        this.opsDashboardDataList = this.doctorList;
        this.hasData = JSON.stringify(this.opsDashboardDataList) != '{}';
        if (this.hasData === true) {
            this.doctorManagementList = this.opsDashboardDataList.listCentralDashboardViewVo;
            this.total = this.doctorManagementList.length;
        }
        else {
            this.total = 0;
            this.dataMsg = 'No Data Found'
        }
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['doctorList']) {
            this.doctorList = changes['doctorList'].currentValue;
            this.setData();
        }

    }
    openModal() {
        (<any>$)("#doctor_modal").modal("show");
    }

    closeModal() {
        (<any>$)("#doctor_modal").modal("hide");
    }
}