import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';
import { ReportConstants } from '../../../../constants/report/reportconstants';
import { BusinessAdminService } from '../../../businessadmin.service';
import { DateUtil } from '../../../../base/util/dateutil';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'basedonpaymentmode',
    templateUrl: './basedonpaymentmode.template.html',
    styleUrls: ['./basedonpaymentmode.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AmountBasedOnPaymentMode {
    nvd32Chart: any;
    nvd32Data: any;
    reportResponse: ReportResponse[] = new Array<ReportResponse>();
    chartResponseList: DashBoardChartResp[];
    config: any;
    //dropDownIndexForPastDate: number;
    highYAxis: number = 0;
    toDate: number;
    startingDate: number;
    isNetworkErr: boolean;
    isMoreItem: boolean;
    colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
        '#78C2DC', '#4D97EA'];
    @Input()
    selectedRange;
    @Input()
    dropDownIndexForPastDate;

    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService) {
        this.config = config.getConfig();
    }

    ngOnChanges(): void {
        //this.dropDownIndexForPastDate = 0;
        this.getadmincount().then(response => {
            this.reportResponse = response;
            this.isNetworkErr = false;
            console.log("Response In ConsumerAdminRevenuePerService NgOnInit:: " + JSON.stringify(this.reportResponse));
            if (this.reportResponse.length > 0)
                this.applyNvd3Data();
        }).catch((err) => {
            // if (err) {
                this.isNetworkErr = true;
                this.applyNvd3Data();
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });;
    }

    getadmincount() {

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
        startDate.setTime(startDate.getTime() - dateOffset);
        this.startingDate = this.selectedRange.date1 ? this.selectedRange.date1.getTime() : startDate.getTime();
        let endDate = new Date();
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
        this.toDate = this.selectedRange.date2 ? this.selectedRange.date2.getTime() : endDate.getTime();
        let request: ReportRequest = new ReportRequest();
        request.fromDate = startDate.getTime();
        request.toDate = endDate.getTime();
        request.pocIds = new Array<number>();
        request.perService = true;
        //console.log("POC_AUTH::" + this.authService.userAuth.pocId);
        request.pocIds = this.authService.loginResponse.employee.pocIdList;
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);
        // console.log("requesttttt" + JSON.stringify(request));
        this.chartResponseList = new Array<DashBoardChartResp>();
        return this.adminService.getRevenueReport(request);
    }
    // onDateOptionChange(index: number) {
    //     this.dropDownIndexForPastDate = index;
    //     console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    //     this.nvd32Data = undefined;
    //     this.getadmincount().then(response => {
    //         this.reportResponse = response;
    //         console.log("Response In ConsumerOnboarded OnDateOptionChange:: " + JSON.stringify(this.reportResponse));
    //         this.applyNvd3Data();
    //     });
    // }

    applyNvd3Data(): void {

        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponse == undefined || this.reportResponse.length == 0) {
            responseList.push(response);
        } else {
            response.key = ReportConstants.getBasketType(this.reportResponse[0].basketType);
            coor.x = this.reportResponse[0].date;
            coor.y = this.reportResponse[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponse.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (ReportConstants.getBasketType(this.reportResponse[i].basketType) == responseList[j].key) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].finalAmount;
                        responseList[j].values.push(coor);
                        num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.key = ReportConstants.getBasketType(this.reportResponse[i].basketType);
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].finalAmount;
                        response.values.push(coor);
                        responseList.push(response);
                        break;
                    }
                }
            }

            for (let j = 0; j < responseList.length; j++) {
                let startDate = DateUtil.removeTimeInMillis(this.startingDate);
                for (let i = startDate; i <= this.toDate; i = i + 86400000) {
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
            this.chartResponseList = responseList;
        }

        function addGraph(): Array<any> {
            let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
            data = responseList;
            // console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
            return data;
        }
        this.nvd32Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        // .color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd32Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd32Chart.showLegend(true);
        }

        if (this.isNetworkErr == false)
            this.nvd32Chart.noData("No Data is Available.");
        else
            this.nvd32Chart.noData("Oops ! Something Went Wrong.");

        this.nvd32Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

        if (this.dropDownIndexForPastDate != 0)
            this.nvd32Chart.xAxis.rotateLabels(-90);


        if (this.highYAxis != 0) {
            this.nvd32Chart.forceY([0]);
        } else {
            this.nvd32Chart.forceY([0, 100]);
        }

        this.nvd32Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Amount (₹) →")

            .tickFormat(d3.format(".2s"));

        if (response != undefined && response != null) {
            this.nvd32Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
        d3.select('#chart03')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd32Data)         //Populate the <svg> element with chart data...
            .call(this.nvd32Chart);
        if (this.nvd32Chart != undefined) {
            nv.utils.windowResize(this.nvd32Chart.update);
        }
    }
}
