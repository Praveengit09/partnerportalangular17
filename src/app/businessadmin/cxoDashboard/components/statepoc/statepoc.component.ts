import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { BusinessAdminService } from '../../../../../app/businessadmin/businessadmin.service';
import { AppConfig } from '../../../../../app/app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { AuthService } from '../../../../../app/auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'statepoc',
    templateUrl: './statepoc.template.html',
    styleUrls: ['./statepoc.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class StatePocComponent implements OnInit, OnChanges {
    nvd38Chart: any;
    nvd38Data: any;
    nvd37Chart: any;
    nvd37Data: any;
    nvd36Chart: any;
    nvd36Data: any;
    config: any;

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

    segregatedStateData = new Map();
    nvd3DataForGraph = new Array();
    pocStateIds = new Array();

    statesTodayReport = new Array();
    statesWeekReport = new Array();
    statesMonthReport = new Array();

    statesPocCount = new Array();

    todayDate: number;
    weekStartDate: number;
    monthStartDate: number;

    brandName: string;

    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService) {
        this.config = config.getConfig();
    }

    ngOnInit() {
        const todayStartDate = new Date();
        todayStartDate.setHours(0, 0, 0, 0);
        this.todayDate = todayStartDate.getTime();

        const weekStartDate = new Date();
        const startOfWeek = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() - (weekStartDate.getDay() + 6) % 7, 0, 0, 0);
        this.weekStartDate = startOfWeek.getTime();

        const monthStartDate = new Date();
        monthStartDate.setDate(1);
        monthStartDate.setHours(0, 0, 0, 0);
        this.monthStartDate = monthStartDate.getTime();

    }


    ngOnChanges(): void {
        this.nvd3DataForGraph = new Array();
        this.segregatedStateData = new Map();
        this.statesPocCount = new Array();
        this.statesTodayReport = new Array();
        this.statesWeekReport = new Array();
        this.statesMonthReport = new Array();
        this.getRevenueReportForGraph().then(() => {
            this.segregatedStateData.forEach((value) => {
                console.log(value, "state wise data================");
                this.applyNvd3DataForGraph(value);
            });

            this.getReport();

        }).catch(err => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getRevenueReportForGraph() {
        return new Promise<void>((resolve, reject) => {
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

            let request: ReportRequest = new ReportRequest();

            if (this.brandId == undefined || this.brandId == null) {
                this.authService.employeePocMappingList.forEach(element => {
                    request.brandIds.push(element.brandId);
                });
            } else {
                request.brandIds.push(this.brandId);
            }

            request.fromDate = this.startDate;
            request.toDate = this.toDate;
            request.forGraph = true;
            request.stateWise = true;
            request.daysInterval = parseInt(this.dropDownIndexForPastDate);

            this.adminService.getBrandRevenueCXO(request).then(response => {
                response.forEach((obj) => {
                    const pocStateId = obj.pocStateId;
                    if (this.segregatedStateData.has(pocStateId)) {
                        this.segregatedStateData.get(pocStateId).push(obj);
                    } else {
                        this.segregatedStateData.set(pocStateId, [obj]);
                    }

                    if (!this.pocStateIds.includes(pocStateId)) {
                        this.pocStateIds.push(pocStateId);
                    }
                });
                resolve();
            }).catch((err) => {
                // if (err) {
                    console.log("ErrorMsg--" + err);
                    return Promise.reject(err);
                // }
            });
        })
    }

    applyNvd3DataForGraph(graphData): void {
        console.log(graphData, "graphData in nvd3==========");

        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (graphData == undefined || graphData == 0) {
            responseList.push(response);
        } else {
            if (graphData[0].brandName != undefined) {
                response.key = graphData[0].brandName;
                this.brandName = graphData[0].brandName;
            }
            else {
                response.key = this.brandName;
            }
            response.id = graphData[0].brandId;
            coor.x = graphData[0].date;
            coor.y = graphData[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < graphData.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (graphData[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = graphData[i].date;
                        coor.y = graphData[i].finalAmount;
                        responseList[j].values.push(coor);
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = graphData[i].brandId;
                        response.key = graphData[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = graphData[i].date;
                        coor.y = graphData[i].finalAmount;
                        response.values.push(coor);
                        responseList.push(response);
                        break;
                    }
                }
            }

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
                responseList[y].values.sort(function (a, b) {
                    if (a.x < b.x) return -1;
                    if (a.x > b.x) return 1;

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
            return data;
        }

        this.nvd36Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd36Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd36Chart.showLegend(true);
        }

        if (this.isNetworkErr == false)
            this.nvd36Chart.noData("No Data is Available.");
        else
            this.nvd36Chart.noData("Oops ! Something Went Wrong.");

        this.nvd36Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat("")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

        if (this.dropDownIndexForPastDate != 0)
            this.nvd36Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd36Chart.forceY([0]);
        } else {
            this.nvd36Chart.forceY([0, 100]);
        }

        this.nvd36Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd36Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd36Data));


        d3.select('#chart' + graphData[0].pocStateId)    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd36Data)         //Populate the <svg> element with chart data...
            .call(this.nvd36Chart);
        nv.utils.windowResize(this.nvd36Chart.update);

        const nvdDataAndChart = {
            nvd36Data: this.nvd36Data,
            nvd36Chart: this.nvd36Chart,
            nvd36Id: '#chart' + graphData[0].pocStateId,
            pocStateId: graphData[0].pocStateId,
            pocState: graphData[0].pocState
        };

        this.nvd3DataForGraph.push(nvdDataAndChart);
    }

    getReport() {
        this.pocStateIds.forEach((pocStateId) => {
            let request = new ReportRequest();
            request.brandIds = new Array<number>();
            request.state = pocStateId;

            if (this.brandId == undefined || this.brandId == null) {
                this.authService.employeePocMappingList.forEach(element => {
                    request.brandIds.push(element.brandId);
                });
            } else {
                request.brandIds.push(this.brandId);
            }

            this.getStatesTodayReport(request);
            this.getStatesWeekReport(request);
            this.getStatesMonthReport(request);
            this.getStatesPocCount(request);
        })
    }

    getStatesTodayReport(request) {
        request.fromDate = this.todayDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_DAY;

        this.adminService.getBrandRevenueCXO(request).then(response => {
            console.log(response, "statesTodayReport================");
            if (response.length > 0) {
                this.statesTodayReport.push(response[0]);
            }
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getStatesWeekReport(request) {
        request.fromDate = this.weekStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_WEEK;


        this.adminService.getBrandRevenueCXO(request).then(response => {
            console.log(response, "statesWeekReport================");
            if (response.length > 0) {
                this.statesWeekReport.push(response[0]);
            }
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getStatesMonthReport(request) {
        request.fromDate = this.monthStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_MONTH;


        this.adminService.getBrandRevenueCXO(request).then(response => {
            console.log(response, "statesMonthReport================");
            if (response.length > 0) {
                this.statesMonthReport.push(response[0]);
            }
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getStatesPocCount(request) {
        this.adminService.getPocCount(request).then(response => {
            const statePocCount = {
                pocStateId: request.state,
                pocCount: response
            }
            console.log(statePocCount.pocCount, statePocCount.pocStateId + " Poccount================");
            this.statesPocCount.push(statePocCount);
        });
    }

    hasMatchingStateTodayReport(pocStateId: string): boolean {
        return (
            this.statesTodayReport &&
            this.statesTodayReport.length > 0 &&
            this.statesTodayReport.some((report) => report.pocStateId === pocStateId)
        );
    }

    hasMatchingStateWeekReport(pocStateId: string): boolean {
        return (
            this.statesWeekReport &&
            this.statesWeekReport.length > 0 &&
            this.statesWeekReport.some((report) => report.pocStateId === pocStateId)
        );
    }

    hasMatchingStateMonthReport(pocStateId: string): boolean {
        return (
            this.statesMonthReport &&
            this.statesMonthReport.length > 0 &&
            this.statesMonthReport.some((report) => report.pocStateId === pocStateId)
        );
    }

}