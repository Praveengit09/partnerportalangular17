import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { AuthService } from "../../../auth/auth.service";
import { UserReportService } from './../userreports.service';
import { LocationModeResponse } from './../../../model/common/locationmoderesponse';
import { CommonUtil } from './../../../base/util/common-util';
import { BusinessAdminService } from './../../../businessadmin/businessadmin.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'agegraphdetails',
    templateUrl: './agegraphdetails.template.html',
    styleUrls: ['./agegraphdetails.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AgeGraphDetails implements OnInit {
    nvd32Chart: any;
    ageChart: any;

    config: any;
    isError: boolean;
    showMessage: boolean;
    message: Array<string>;
    errorMessage: Array<string>;
    userReport: any;
    isMoreItem: boolean
    empId: number;
    startDate: number
    endDate: number;
    stateId: number;
    cityId: number;
    //areaId: number;
    pincode: number;
    indexForCity: number = 0;
    indexForLoc: number = 0;
    indexForState: number = 0;
    stateResponse: LocationModeResponse[] = [];
    cityResponse: LocationModeResponse[] = [];
    localityResponse: LocationModeResponse[] = [];
    userNewstateData = new Array<any>()
    isDate: boolean = false;
    isDisplay: boolean = false;
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
        this.startDate = undefined;
        this.endDate = undefined;
        this.cityResponse = [];
        this.localityResponse = [];
        this.indexForCity = 0;
        this.indexForLoc = 0;
        this.indexForState = 0;
        this.pincode = 0;
        this.stateId = 0;
        this.cityId = 0;
        this.getUsercount();
    }
    startDateChoosen($event): void {
        this.startDate = $event;
        this.userReport = {};
        this.applyNvd3Data();
        this.getUsercount();
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
        this.getUsercount();

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
            this.getUsercount();
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
            this.getUsercount();
        }

    }
    onLocationChange(index: number): void {

        this.pincode = (index > 0 ? this.localityResponse[index - 1].id : index);
        console.log("pincode==>" + JSON.stringify(this.pincode))
        if (index != 0) {
            this.userReport = {};
            this.applyNvd3Data()
            this.getUsercount();
        }
    }

    getUsercount() {

        let fromDate, toDate, stateId, cityId, areaId;
        var data1 = new Date((this.startDate ? this.startDate : 0));
        data1.setHours(0, 0, 0, 0);
        fromDate = data1.getTime();
        var data2 = new Date((this.endDate ? this.endDate : 0));
        toDate = data2.getTime()
        stateId = this.stateId;
        cityId = this.cityId;
        areaId = this.pincode;
        //}

        this.adminService.getAgeGraphReport(fromDate, toDate, stateId, cityId, areaId).then(response => {
            console.log("==========>" + JSON.stringify(stateId))
            if (response == undefined || response == null || response.length <= 0) {
                console.log("AgeReportresponse" + JSON.stringify(response))
                this.isError = true;
                this.showMessage = true;
                this.message = new Array();
                this.errorMessage = new Array();
                this.errorMessage[0] = "No Reports Found";
                this.userReport = {};
                this.applyNvd3Data()
            } else {
                this.userReport = response;
                this.applyNvd3Data()
            }



        })

    }


    applyNvd3Data(): void {
        let response;
        //if (this.userReport != null || this.userReport != undefined || this.userReport.length > 0) {
        response = [{
            key: 'age',
            values: this.userReport

        }]

        //}
        nv.addGraph(  ()=> {

            this.ageChart = nv.models.multiBarChart()
                .reduceXTicks(false)   //If 'false', every single x-axis tick label will be rendered.
                //.rotateLabels(90)      //Angle to rotate x-axis labels.
                .showControls(false)
                .stacked(true);   //Allow user to switch between 'Grouped' and 'Stacked' mode.

            this.ageChart.xAxis
                .axisLabel("Age")
            // .tickFormat(d3.format(',f'));
            //.axisLabel('');
            this.ageChart.yAxis
                .axisLabel("Number of Users")
                .axisLabelDistance(-5)
                .tickFormat(d3.format(',f'));

            d3.select('#chart1 svg')
                .datum(response)
                .transition().duration(500)
                .call(this.ageChart)
                ;
            d3.selectAll('.nvtooltip').remove();



            nv.utils.windowResize(this.ageChart.update);


            return this.ageChart;
        });

    }

}
