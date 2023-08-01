import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { BusinessAdminService } from '../../../../../app/businessadmin/businessadmin.service';
import { AppConfig } from '../../../../../app/app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { AuthService } from '../../../../../app/auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';
import { ReportConstants } from '../../../../constants/report/reportconstants';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'pocrevenue',
    templateUrl: './pocrevenue.template.html',
    styleUrls: ['./pocrevenue.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PocRevenueComponent implements OnInit, OnChanges {
    nvd35Chart: any;
    nvd35Data: any;
    nvd34Chart: any;
    nvd34Data: any;
    config: any;
    reportResponseForTotalBrandRevenue: ReportResponse[] = new Array<ReportResponse>();
    reportResponseForDoctorRevenue: ReportResponse[] = new Array<ReportResponse>();

    @Input()
    selectDate;
    startDate: number;
    toDate: number;
    @Input()
    dropDownIndexForPastDate;
    @Input()
    brandId;
    highYAxis: number = 0;
    isNetworkErr: boolean;
    dashBoardChartResponseList: DashBoardChartResp[];
    colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
        '#78C2DC', '#4D97EA'];
    isMoreItem: boolean;

    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService) {
        this.config = config.getConfig();
    }

    topFiveData: ReportResponse[] = new Array<ReportResponse>();
    bottomFiveData: ReportResponse[] = new Array<ReportResponse>();

    doctorPocCount: number;
    brandPocCount: number;

    doctorTodayReport: ReportResponse[] = new Array<ReportResponse>();
    doctorWeekReport: ReportResponse[] = new Array<ReportResponse>();
    doctorMonthReport: ReportResponse[] = new Array<ReportResponse>();

    brandTodayReport: ReportResponse[] = new Array<ReportResponse>();
    brandWeekReport: ReportResponse[] = new Array<ReportResponse>();
    brandMonthReport: ReportResponse[] = new Array<ReportResponse>();

    todayDate: number;
    weekStartDate: number;
    monthStartDate: number;

    ngOnInit() {
        const todayStartDate = new Date();
        todayStartDate.setHours(0, 0, 0, 0);
        this.todayDate = todayStartDate.getTime();

        const weekStartDate = new Date();
        const startOfWeek = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() - (weekStartDate.getDay() + 6) % 7,0,0,0);
        this.weekStartDate = startOfWeek.getTime();

        const monthStartDate = new Date();
        monthStartDate.setDate(1);
        monthStartDate.setHours(0, 0, 0, 0);
        this.monthStartDate = monthStartDate.getTime();

        this.getBrandTodayRevenue();
        this.getBrandWeekRevenue();
        this.getBrandMonthRevenue();
        this.getDoctorTodayRevenue();
        this.getDoctorWeekRevenue();
        this.getDoctorMonthRevenue();
        this.getBrandPocCount();
        this.getDoctorPocCount();
        this.getTopFivePerformingCenters();
        this.getBottomFivePerformingCenters();
    }

    ngOnChanges(): void {
        this.getBrandReportForGraph();
        this.getDoctorReportForGraph();
    }

    getBrandTodayRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.fromDate = this.todayDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_DAY;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.brandTodayReport = response;
            console.log(response, "brandTodayReport================");

        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getBrandWeekRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.fromDate = this.weekStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_WEEK;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.brandWeekReport = response;
            console.log(response, "brandWeekReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getBrandMonthRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.fromDate = this.monthStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_MONTH;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.brandMonthReport = response;
            console.log(response, "brandMonthReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDoctorTodayRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.fromDate = this.todayDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_DAY;
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DOCTOR_BOOKINGS);

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.doctorTodayReport = response;
            console.log(response, "doctorTodayReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDoctorWeekRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.fromDate = this.weekStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_WEEK;
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DOCTOR_BOOKINGS);

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.doctorWeekReport = response;
            console.log(response, "doctorWeekReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDoctorMonthRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.fromDate = this.monthStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_MONTH;
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DOCTOR_BOOKINGS);

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getRevenue(request).then(response => {
            this.doctorMonthReport = response;
            console.log(response, "doctorMonthReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getRevenue(request) {
        return this.adminService.getBrandRevenueCXO(request);
    }

    getBrandPocCount() {
        let request: ReportRequest = new ReportRequest();
        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getPocCount(request).then(data => {
            this.brandPocCount = data;
        })
    }

    getDoctorPocCount() {
        let request: ReportRequest = new ReportRequest();
        request.serviceType = 3;
        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        this.getPocCount(request).then(data => {
            this.doctorPocCount = data;
        })
    }

    getPocCount(request) {
        return this.adminService.getPocCount(request);
    }

    getBrandReportForGraph() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();

        this.getRevenueReportForGraph(request).then(response => {
            this.reportResponseForTotalBrandRevenue = response;
            this.applyNvd3DataForTotalBrandRev();
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDoctorReportForGraph() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DOCTOR_BOOKINGS);

        this.getRevenueReportForGraph(request).then(response => {
            this.reportResponseForDoctorRevenue = response;
            this.applyNvd3DataForDoctorRev();
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getRevenueReportForGraph(request) {
        console.log("date", this.brandId)
        let dateOffset;
        if (this.dropDownIndexForPastDate == 0) {
            dateOffset = (24 * 60 * 60 * 1000) * 7; // for 7 days
        } else if (this.dropDownIndexForPastDate == 1) {
            dateOffset = (24 * 60 * 60 * 1000) * 15; // for 15 days
        } else if (this.dropDownIndexForPastDate == 2) {
            dateOffset = (24 * 60 * 60 * 1000) * 30; // for 30 days
        }

        let startDate = new Date();
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        startDate.setTime(startDate.getTime() - (24 * 60 * 60 * 1000) * 30);
        this.startDate = this.selectDate.date1 ? this.selectDate.date1.getTime() : startDate.getTime();

        let endDate = new Date();
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setTime(endDate.getTime());
        this.toDate = this.selectDate.date2 ? this.selectDate.date2.getTime() : endDate.getTime();

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        request.fromDate = this.startDate;
        request.toDate = this.toDate;
        request.forGraph = true
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);

        return this.adminService.getBrandRevenueCXO(request);
    }

    getTopFivePerformingCenters() {
        let request: ReportRequest = new ReportRequest();
        request.topFive = true;

        this.getTopfiveBottomfivePerformingCenters(request).then(response => {
            this.topFiveData = response;
            console.log(response, "topFiveData================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getBottomFivePerformingCenters() {
        let request: ReportRequest = new ReportRequest();
        request.topFive = false;

        this.getTopfiveBottomfivePerformingCenters(request).then(response => {
            this.bottomFiveData = response;
            console.log(response, "bottomFiveData================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getTopfiveBottomfivePerformingCenters(request) {
        request.brandIds = new Array<number>();
        request.fromDate = this.todayDate;
        request.toDate = this.todayDate;
        request.forGraph = false;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        return this.adminService.getTopfiveBottomfivePerformingCenters(request);
    }

    applyNvd3DataForTotalBrandRev(): void {
        console.log("brandName" + JSON.stringify(this.reportResponseForTotalBrandRevenue))
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponseForTotalBrandRevenue == undefined || this.reportResponseForTotalBrandRevenue.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponseForTotalBrandRevenue[0].brandName;
            response.id = this.reportResponseForTotalBrandRevenue[0].brandId;
            coor.x = this.reportResponseForTotalBrandRevenue[0].date;
            coor.y = this.reportResponseForTotalBrandRevenue[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponseForTotalBrandRevenue.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponseForTotalBrandRevenue[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseForTotalBrandRevenue[i].date;
                        coor.y = this.reportResponseForTotalBrandRevenue[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponseForTotalBrandRevenue[i].brandId;
                        response.key = this.reportResponseForTotalBrandRevenue[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseForTotalBrandRevenue[i].date;
                        coor.y = this.reportResponseForTotalBrandRevenue[i].finalAmount;
                        response.values.push(coor);

                        responseList.push(response);
                        break;
                    }
                }
            }
            //console.log("inside function" + JSON.stringify(responseList));

            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startDate; i <= this.toDate; i = i + 86400000) {
                    if ((responseList[j].values.find(coordinate => coordinate.x == i)) == undefined) {
                        let coor = new ChartCoordinate();
                        coor.x = i;
                        coor.y = 0;
                        responseList[j].values.push(coor);
                    }
                }
            }

            for (let y = 0; y < responseList.length; y++) {
                responseList[y].values.sort(function (weekRevenueStartDate, weekRevenueEndDate) {
                    if (weekRevenueStartDate.x < weekRevenueEndDate.x) return -1;
                    if (weekRevenueStartDate.x > weekRevenueEndDate.x) return 1;

                    return 0;
                });
            }

            console.log("POC_Res_Value::" + JSON.stringify(responseList));

            if (responseList != undefined && responseList != null) {
                for (let j = 0; j < responseList.length; j++) {
                    for (let i = 0; i < responseList[j].values.length; i++) {
                        if (this.highYAxis < responseList[j].values[i].y) {
                            this.highYAxis = responseList[j].values[i].y;
                            break;
                        }
                    }
                }
            }
            this.dashBoardChartResponseList = responseList;
        }
        function addGraph(): Array<any> {
            let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
            data = responseList;
            // console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
            return data;
        }
        this.nvd34Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd34Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd34Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd34Chart.noData("No Data is Available.");
        else
            this.nvd34Chart.noData("Oops ! Something Went Wrong.");

        this.nvd34Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat("")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


        if (this.dropDownIndexForPastDate != 0)
            this.nvd34Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd34Chart.forceY([0]);
        } else {
            this.nvd34Chart.forceY([0, 100]);
        }

        this.nvd34Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd34Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd34Data));
        d3.select('#chart4')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd34Data)         //Populate the <svg> element with chart data...
            .call(this.nvd34Chart);
        nv.utils.windowResize(this.nvd34Chart.update);

    }


    applyNvd3DataForDoctorRev(): void {
        console.log(this.reportResponseForDoctorRevenue, "graph data for Doctor Revenue")
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponseForDoctorRevenue == undefined || this.reportResponseForDoctorRevenue.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponseForDoctorRevenue[0].brandName;
            response.id = this.reportResponseForDoctorRevenue[0].brandId;
            coor.x = this.reportResponseForDoctorRevenue[0].date;
            coor.y = this.reportResponseForDoctorRevenue[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponseForDoctorRevenue.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponseForDoctorRevenue[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseForDoctorRevenue[i].date;
                        coor.y = this.reportResponseForDoctorRevenue[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponseForDoctorRevenue[i].brandId;
                        response.key = this.reportResponseForDoctorRevenue[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseForDoctorRevenue[i].date;
                        coor.y = this.reportResponseForDoctorRevenue[i].finalAmount;
                        response.values.push(coor);

                        responseList.push(response);
                        break;
                    }
                }
            }
            //console.log("inside function" + JSON.stringify(responseList));

            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startDate; i <= this.toDate; i = i + 86400000) {
                    if ((responseList[j].values.find(coordinate => coordinate.x == i)) == undefined) {
                        let coor = new ChartCoordinate();
                        coor.x = i;
                        coor.y = 0;
                        responseList[j].values.push(coor);
                    }
                }
            }

            for (let y = 0; y < responseList.length; y++) {
                responseList[y].values.sort(function (weekRevenueStartDate, weekRevenueEndDate) {
                    if (weekRevenueStartDate.x < weekRevenueEndDate.x) return -1;
                    if (weekRevenueStartDate.x > weekRevenueEndDate.x) return 1;

                    return 0;
                });
            }

            console.log("POC_Res_Value::" + JSON.stringify(responseList));

            if (responseList != undefined && responseList != null) {
                for (let j = 0; j < responseList.length; j++) {
                    for (let i = 0; i < responseList[j].values.length; i++) {
                        if (this.highYAxis < responseList[j].values[i].y) {
                            this.highYAxis = responseList[j].values[i].y;
                            break;
                        }
                    }
                }
            }
            this.dashBoardChartResponseList = responseList;
        }
        function addGraph(): Array<any> {
            let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
            data = responseList;
            // console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
            return data;
        }
        this.nvd35Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd35Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd35Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd35Chart.noData("No Data is Available.");
        else
            this.nvd35Chart.noData("Oops ! Something Went Wrong.");

        this.nvd35Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat(" ")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


        if (this.dropDownIndexForPastDate != 0)
            this.nvd35Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd35Chart.forceY([0]);
        } else {
            this.nvd35Chart.forceY([0, 100]);
        }

        this.nvd35Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd35Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd35Data));

        d3.select('#chart5')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd35Data)         //Populate the <svg> element with chart data...
            .call(this.nvd35Chart);
        nv.utils.windowResize(this.nvd35Chart.update);

    }

}