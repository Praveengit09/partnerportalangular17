import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp'
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate'
import { SlotsResponse } from '../../../../model/report/slotsResponse';
import { BusinessAdminService } from '../../../businessadmin.service';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'slotsperdayperpoc',
    templateUrl: './slotsperdayperpoc.template.html',
    styleUrls: ['./slotsperdayperpoc.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SlotsPerDayPerPoc {
    nvd32Chart: any;
    nvd32Data: any;
    slotsResponse: SlotsResponse[] = new Array<SlotsResponse>();
    dashBoardChartResponseList: DashBoardChartResp[];
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
            this.slotsResponse = response;
            this.isNetworkErr = false;
            console.log("Response In ConsumerAdminRevenuePerService NgOnInit:: " + JSON.stringify(this.slotsResponse));
            if (this.slotsResponse.length > 0)
                this.applyNvd3Data();
        }).catch((err) => {
            // if (err) {
                this.isNetworkErr = true;
                this.applyNvd3Data();
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
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
        request.fromDate = this.startingDate;
        request.toDate = this.toDate;
        request.pocIds = new Array<number>();
        request.perService = true;
        console.log("POC_AUTH::" + this.authService.pocIds);
        request.pocIds = this.authService.loginResponse.employee.pocIdList;
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);
        console.log("requestttttslot" + JSON.stringify(request));
        this.dashBoardChartResponseList = new Array<DashBoardChartResp>();
        return this.adminService.getSlotsStatusinPoc(request);
    }
   

    applyNvd3Data(): void {
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let response: DashBoardChartResp = new DashBoardChartResp();
        if (this.slotsResponse == undefined || this.slotsResponse.length == 0) {
            responseList.push(response);
        } else {
            for (let i = 0; i < this.slotsResponse.length; i++) {
                let response: DashBoardChartResp = new DashBoardChartResp();
                response.key = this.slotsResponse[i].pocName;
                //response.id = this.slotsResponse[i].pocId;
                for (let j = 0; j < this.slotsResponse[i].dateSummery.length; j++) {
                    let chartCoor = new ChartCoordinate();
                    chartCoor.x = this.slotsResponse[i].dateSummery[j].date;
                    chartCoor.y = this.slotsResponse[i].dateSummery[j].bookedSlots != undefined ? this.slotsResponse[i].dateSummery[j].bookedSlots : 0;
                    response.values.push(chartCoor);
                }
                responseList.push(response);
            }

            console.log("ResponseList extracted from slotResponse::" + JSON.stringify(responseList));


            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startingDate; i <= this.toDate; i = i + 86400000) {
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


            /*  this.slotsResponse.forEach(pocSlot => {
                 response.key = pocSlot.pocName;
                 response.id = pocSlot.pocId;
                 pocSlot.dateSummery.forEach(slot => {
                     let chartCoordinate: ChartCoordinate = new ChartCoordinate();
                     chartCoordinate.x = slot.date;
                     chartCoordinate.y = slot.bookedSlots;
                     response.values.push(chartCoordinate);
                 });
                 responseList.push(response);
             }); */
            this.dashBoardChartResponseList = responseList;
        }

        function addGraph(): Array<any> {
            let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
            data = responseList;
            // console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
            return data;
        }
        this.nvd32Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);

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
            .axisLabel("No of Slots →")
            .tickFormat(d3.format('d'));

        if (responseList != undefined && responseList != null) {
            this.nvd32Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
        d3.select('#chart06')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd32Data)         //Populate the <svg> element with chart data...
            .call(this.nvd32Chart);
        nv.utils.windowResize(this.nvd32Chart.update);
    }
}
