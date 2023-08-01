import { Component, ViewEncapsulation, OnInit, Input, SimpleChange } from '@angular/core';
import { TotalCentralOrdersAndPaidCount } from '../../../model/common/totalcentralordersandpaidcount';
import { CentralOrdersAndPaidCount } from '../../../model/common/centralordersandpaidcount';
import { keys } from 'd3';
import { Config } from '../../../base/config';

import { BrandDetailsWithReferralCode } from '../../../model/brand/brandDetailsWithReferralCode';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { CentralOrdersTotalCountService } from '../../centralorderstotalcount.service';

@Component({
    selector: 'centralorderstotalcount',
    templateUrl: './centralorderstotalcount.template.html',
    styleUrls: ['./centralorderstotalcount.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class CentralOrdersTotalCount implements OnInit {
    startDate: Date;
    endDate: Date;
    endingDate: Date;
    errorMessage: Array<string>;
    isDate: boolean = false;
    isDisplay: boolean = false;
    message: Array<string>;
    dataMsg = '';
    isError: boolean;
    error: boolean = false;
    checkEndDate: boolean = false;
    brandList: BrandDetailsWithReferralCode[] = new Array<BrandDetailsWithReferralCode>();

    dropDownIndex: number = -1;
    brandName: string;
    brandId: number = 0;
    perPage: number = 5;
    total: number = 0;
    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);

    centralOrderTotalCountList: TotalCentralOrdersAndPaidCount = new TotalCentralOrdersAndPaidCount()
    totalOrdersCountData: CentralOrdersAndPaidCount[] = new Array<CentralOrdersAndPaidCount>();
    hasData: boolean = false;
    total_orders_column: any[] = [
        {
            display: 'Date',
            variable: 'createdTimeStamp',
            filter: 'text',
            sort: false
        },
        {
            display: 'No. of Orders Raised',
            variable: 'ordersRaised',
            filter: 'text',
            sort: false

        },
        {
            display: 'No. of Paid Orders',
            variable: 'ordersPaid',
            filter: 'text',
            sort: false
        },
        {
            display: 'Revenue of Orders Raised',
            variable: 'ordersRevenue',
            filter: 'number',
            sort: false

        },
        {
            display: 'Revenue of Paid Orders',
            variable: 'paidRevenue',
            filter: 'number',
            sort: false
        },
    ];

    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    datepickerOptEnd = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy',
    };
    constructor(private superAdminService: SuperAdminService,
        private centralOrdersService: CentralOrdersTotalCountService, private spinner: SpinnerService) {

    }
    ngOnInit() {
        this.startDate = this.endingDate = new Date();
        if (Config.portal && Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
            this.getBrandList();
        } else {
            this.brandId = Config.portal.appId;
        }
        this.onSubmit();
    }

    getBrandList() {
        this.superAdminService.getBrandDetails().then(brandList => {
            this.brandList = brandList;
        });
    }

    onBrandChange(index) {
        if (index >= 0) {
            this.brandId = this.brandList[index].brandId;
            this.brandName = this.brandList[index].brandName;
        }
        else {
            this.brandId = 0;
        }
        this.onSubmit();
    }


    async onSubmit() {
        this.message = new Array<string>()
        this.isDate = false;
        this.isDisplay = false;
        this.message[0] = '';

        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
            this.startDate.getDate(), 0, 0, 0);
        this.endingDate = new Date(this.endingDate.setHours(23, 0, 0, 0));
        console.log('datecheck' + this.startDate + '###' + this.endingDate)
        if (this.startDate.getTime() > this.endingDate.getTime()) {
            this.message = new Array<string>()
            this.isDate = true;
            this.isDisplay = true;
            this.message[0] = 'Start Date Must Be Less Than End Date';
            return;
        }
        this.spinner.start();
        await this.getCentralOrderTotalCount();
        this.spinner.stop();

    }

    async getCentralOrderTotalCount() {

        this.centralOrderTotalCountList = new TotalCentralOrdersAndPaidCount();
        this.centralOrderTotalCountList.centralOrdersAndPaidCount = new Array<CentralOrdersAndPaidCount>();
        this.totalOrdersCountData = new Array<CentralOrdersAndPaidCount>()
        await this.centralOrdersService.getTotalOrdersCountList(this.brandId, this.startDate.getTime(), this.endingDate.getTime()).then(response => {
            var totalOrdersCountData = new Array<CentralOrdersAndPaidCount>();
            this.centralOrderTotalCountList = response;
            if (JSON.stringify(this.centralOrderTotalCountList) != '{}' && this.centralOrderTotalCountList.centralOrdersAndPaidCount != null && this.centralOrderTotalCountList.centralOrdersAndPaidCount != undefined) {
                totalOrdersCountData = (this.centralOrderTotalCountList.centralOrdersAndPaidCount);
                totalOrdersCountData.forEach((element, i) => {
                    totalOrdersCountData[i].createdTimeStamp = this.convertDate(element.createdTimeStamp);
                });
                this.centralOrderTotalCountList.centralOrdersAndPaidCount = totalOrdersCountData;
            }
        });
        this.setData();

    }

    setData() {
        this.hasData = (JSON.stringify(this.centralOrderTotalCountList) != '{}' && this.centralOrderTotalCountList.centralOrdersAndPaidCount != null);
        if (this.hasData === true) {
            this.totalOrdersCountData = this.removeDuplicates(this.centralOrderTotalCountList.centralOrdersAndPaidCount);
            this.total = this.totalOrdersCountData.length;
        }
        else {
            this.total = 0;
            this.totalOrdersCountData = new Array<CentralOrdersAndPaidCount>();
            this.dataMsg = 'No Data Found';
        }
    }

    openModal() {
        (<any>$)("#centralOrders_modalId").modal("show");
    }

    closeModal() {
        (<any>$)("#centralOrders_modalId").modal("hide");
    }


    convertDate(timestamp: any) {
        var dateTime = new Date(Number(timestamp));
        return dateTime.toLocaleDateString();
    }

    removeDuplicates(arr: any): any {
        var elementkeys = new Array();
        elementkeys = keys(arr[0]).sort();
        elementkeys = elementkeys.slice(2, elementkeys.length);
        const filteredArr = arr.reduce((acc, current) => {
            const x = acc.find(item => {
                var result = item.createdTimeStamp === current.createdTimeStamp;
                elementkeys.forEach(element => {
                    if ((result === true)) {
                        item[element] = item[element] + current[element];
                    }
                });
                return result;
            });
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);
        return filteredArr;
    }


    getRefreshedorderList() {

        this.startDate = this.endingDate = new Date();
        this.onSubmit();
    }
}