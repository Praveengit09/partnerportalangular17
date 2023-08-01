import { BusinessAdminService } from './../../../businessadmin/businessadmin.service';
import { CommonUtil } from './../../../base/util/common-util';
import { LocationModeResponse } from './../../../model/common/locationmoderesponse';

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';

import { AuthService } from "../../../auth/auth.service";

import { UserReportService } from './../userreports.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'healthscoregraphdetails',
    templateUrl: './healthscoregraphdetails.template.html',
    styleUrls: ['./healthscoregraphdetails.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HealthScoreGraphDetails implements OnInit {
    healthscoreChart: any;
    isMoreItem: boolean;
    isNetworkErr: boolean;
    healthscoreChartData: any

    config: any;
    isError: boolean;
    showMessage: boolean;
    message: Array<string>;
    errorMessage: Array<string>;
    userReport: any;
    empId: number;
    startDate: number
    endDate: number
    stateId: number;
    cityId: number;
    areaId: number;
    pincode: number;
    indexForCity: number = 0;
    indexForLoc: number = 0;
    indexForState: number = 0;
    stateResponse: LocationModeResponse[] = [];
    cityResponse: LocationModeResponse[] = [];
    localityResponse: LocationModeResponse[] = [];
    datepickerOpts = {
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    constructor(config: AppConfig,
        private adminBusinessService: BusinessAdminService,
        private adminService: UserReportService,
        private authService: AuthService, private common: CommonUtil, private spinnerService: SpinnerService) {
        this.config = config.getConfig();
    }

    ngOnInit(): void {
        this.empId = this.authService.userAuth.employeeId;
        this.getRefreshedorderList();
        this.getState();

    }
    getRefreshedorderList() {
        this.indexForCity = 0;
        this.indexForLoc = 0;
        this.indexForState = 0;
        this.pincode = 0;
        this.stateId = 0;
        this.cityId = 0;
        this.startDate = undefined;
        this.endDate = undefined;
        this.cityResponse = [];
        this.localityResponse = [];
        this.getUserHealthscorecount();
    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.userReport = {};
        this.applyNvd3Data();
        this.getUserHealthscorecount();
    }
    endDateChoosen(eDate): void {
        eDate = new Date(eDate);
        let lDate = new Date();
        let toDay = new Date(),
            selectedDate = new Date(eDate);
        toDay.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (toDay.getTime() == selectedDate.getTime()) {
            let hr = lDate.getHours(),
                min = lDate.getMinutes(),
                sec = lDate.getSeconds();
            eDate.setHours(hr, min, sec);
        }
        //Fixed Check Here
        this.endDate = eDate;
        this.userReport = {};
        this.applyNvd3Data();
        this.getUserHealthscorecount();

    };

    getState(): void {
        this.stateId = 0;
        this.cityId = 0;
        this.adminBusinessService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.stateResponse = this.sortTheResponse(locationResponse);
            console.log("LocationDeatails for State For Login Emp:: " + JSON.stringify(this.stateResponse));
        });
    }
    sortTheResponse(res: LocationModeResponse[]): LocationModeResponse[] {
        res.sort(function (a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        })
        return res;
    }
    onStateChange(index: number): void {
        while (this.cityResponse.length > 0) {
            this.cityResponse.pop();
        }
        while (this.localityResponse.length > 0) {
            this.localityResponse.pop();
        }
        this.cityId = 0;
        this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
        this.pincode = 0;
        this.indexForCity = 0;
        this.indexForLoc = 0;
        if (index != 0) {
            this.adminBusinessService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.cityResponse = this.sortTheResponse(locationResponse);
                console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
            });
            this.userReport = {};
            this.applyNvd3Data()
            this.getUserHealthscorecount();
        }
    }
    onCityChange(index: number): void {
        while (this.localityResponse.length > 0) {
            this.localityResponse.pop();
        }
        this.indexForLoc = 0;
        this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
        this.pincode = 0;
        if (index != 0) {
            this.adminBusinessService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.localityResponse = this.sortTheResponse(locationResponse);
                console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
            });
            this.userReport = {};
            this.applyNvd3Data()
            this.getUserHealthscorecount();
        }

    }
    onLocationChange(index: number): void {

        this.pincode = (index > 0 ? this.localityResponse[index - 1].id : index);
        if (index != 0) {
            this.userReport = {};
            this.applyNvd3Data()
            this.getUserHealthscorecount();
        }
    }
    getUserHealthscorecount() {
        let fromDate, toDate, stateId, cityId, areaId;
        var data1 = new Date((this.startDate ? this.startDate : 0));
        data1.setHours(0, 0, 0, 0);
        fromDate = data1.getTime();
        toDate = new Date(this.endDate ? this.endDate : 0).getTime();
        stateId = this.stateId;
        cityId = this.cityId;
        areaId = this.pincode;

        this.adminService.getHealthScoreGraphReport(fromDate, toDate, stateId, cityId, areaId).then(response => {
            if (response == undefined || response == null || response.length <= 0) {
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
                this.userReport = {};
                this.applyNvd3Data()
            } else {
                this.userReport = response;
                console.log("Healthscore" + JSON.stringify(this.userReport))
                this.applyNvd3Data();

            }
        })
    }

    applyNvd3Data(): void {
        //let response = this.adminService.healthscore;
        let response;
        response = [{
            key: 'Healthscore',
            values: this.userReport
        }]
        nv.addGraph(() => {
            this.healthscoreChart = nv.models.multiBarChart().stacked(true).showControls(false).reduceXTicks(true);

            this.healthscoreChart.xAxis
                .axisLabel("Health Score")
            //.tickFormat(d3.format(','));
            // .axisLabel('');


            this.healthscoreChart.yAxis
                .axisLabel("Number of Users")
                //.axisLabelDistance(-5)
                .tickFormat(d3.format(',f'));

            d3.select('#chartscore svg')
                .datum(response)
                .transition().duration(500)
                .call(this.healthscoreChart)
                ;
            d3.selectAll('.nvtooltip').remove();

            nv.utils.windowResize(this.healthscoreChart.update);

            return this.healthscoreChart;
        });

    }

}


