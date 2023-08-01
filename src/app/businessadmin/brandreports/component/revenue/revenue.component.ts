import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
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
    selector: 'revenue',
    templateUrl: './revenue.template.html',
    styleUrls: ['./revenue.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RevenueComponent {
    nvd31Chart: any;
    nvd31Data: any;
    config: any;
    // reportRequest: ReportRequest[] = new Array<ReportRequest>();
    reportResponse: ReportResponse[] = new Array<ReportResponse>();
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
    ngOnChanges(): void {
        this.getBrandRevenueReport().then(response => {
            this.isNetworkErr = false;
            this.reportResponse = response;
            if (this.reportResponse.length >= 0)
                console.log("Response In ConsumerAdmin NgOnInit::ghhghg " + JSON.stringify(response));
            this.applyNvd3Data();
        }).catch((err) => {
            // if (err) {
            this.applyNvd3Data();
            console.log("ErrorMsg--" + err);
            return Promise.reject(err);
            // }
        });

    }
    getBrandRevenueReport() {
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
        let request: ReportRequest = new ReportRequest();
        request.fromDate = this.startDate;
        request.toDate = this.toDate;
        request.brandIds = new Array<number>();
        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }


        request.perPOC = false;
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);
        request.perService = false;
        console.log("request12354", request)
        return this.adminService.getBrandRevenueReport(request);
    }
    applyNvd3Data(): void {
        console.log("brandName" + JSON.stringify(this.reportResponse))
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponse == undefined || this.reportResponse.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponse[0].brandName;
            response.id = this.reportResponse[0].brandId;
            coor.x = this.reportResponse[0].date;
            coor.y = this.reportResponse[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponse.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponse[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponse[i].brandId;
                        response.key = this.reportResponse[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].finalAmount;
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
            // console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
            return data;
        }
        this.nvd31Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd31Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd31Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd31Chart.noData("No Data is Available.");
        else
            this.nvd31Chart.noData("Oops ! Something Went Wrong.");

        this.nvd31Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


        if (this.dropDownIndexForPastDate != 0)
            this.nvd31Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd31Chart.forceY([0]);
        } else {
            this.nvd31Chart.forceY([0, 100]);
        }

        this.nvd31Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd31Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd31Data));
        d3.select('#chart')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd31Data)         //Populate the <svg> element with chart data...
            .call(this.nvd31Chart);
        nv.utils.windowResize(this.nvd31Chart.update);

    }


}