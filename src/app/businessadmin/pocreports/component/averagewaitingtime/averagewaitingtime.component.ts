import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp'
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate'
import { BusinessAdminService } from '../../../businessadmin.service';
import { DateUtil } from '../../../../base/util/dateutil';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'averagewaitingtime',
    templateUrl: './averagewaitingtime.template.html',
    styleUrls: ['./averagewaitingtime.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AverageWaitingTime {
    nvd32Chart: any;
    nvd32Data: any;
    reportResponse: ReportResponse[] = new Array<ReportResponse>();
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
            this.reportResponse = response;
            this.isNetworkErr = false;
            console.log("Response In ConsumerAdmin NgOnInit:: " + JSON.stringify(this.reportResponse));
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
        // request.perPOC = true;
        // console.log("POC_AUTH::" + this.authService.userAuth.pocId);
        request.pocIds = this.authService.loginResponse.employee.pocIdList;
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);
        //console.log("requesttttt123" + JSON.stringify(request));
        this.dashBoardChartResponseList = new Array<DashBoardChartResp>();
        return this.adminService.getPocPerformance(request);
    }

    // onDateOptionChange(index: number) {
    //     this.dropDownIndexForPastDate = index;
    //     console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    //     this.nvd32Data = undefined;
    //     this.getadmincount().then(response => {
    //         this.reportResponse = response;
    //         console.log("Response In ConsumerOnboarded OnDateOptionChange:: response a rha hai" + JSON.stringify(this.reportResponse));
    //         console.log("waiting time" + JSON.stringify(this.reportResponse[0].averageWatingTime));
    //         this.applyNvd3Data();
    //     });
    // }

    applyNvd3Data(): void {
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        let response: DashBoardChartResp = new DashBoardChartResp();

        // test data starts from here..............

        /*   response.key = "Series 1 HS Revenue";
          response.id = 101;
          let y = 1000
          response.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y = y + 200;
              let cood: ChartCoordinate = new ChartCoordinate();
              cood.x = i;
              cood.y = y;
              response.values.push(cood);
          }
          responseList.push(response);
 
          let response2: DashBoardChartResp = new DashBoardChartResp();
          response2.key = "Series 2 HS Revenue";
          response2.id = 102;
          let y2 = 1000
          response2.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y2 = y2 + 1200;
              let cood2: ChartCoordinate = new ChartCoordinate();
              cood2.x = i;
              cood2.y = y2;
              response2.values.push(cood2);
          }
          responseList.push(response2);
 
          let response3: DashBoardChartResp = new DashBoardChartResp();
          response3.key = "Series 3 HS Revenue";
          response3.id = 103;
          let y3 = 1000
          response3.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y3 = y3 + 80;
              let cood3: ChartCoordinate = new ChartCoordinate();
              cood3.x = i;
              cood3.y = y3;
              response3.values.push(cood3);
          }
          responseList.push(response3);
 
          let response4: DashBoardChartResp = new DashBoardChartResp();
          response4.key = "Series 4 HS Revenue";
          response4.id = 104;
          let y4 = 1000
          response4.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y4 = y4 + 500;
              let cood4: ChartCoordinate = new ChartCoordinate();
              cood4.x = i;
              cood4.y = y4;
              response4.values.push(cood4);
          }
          responseList.push(response4);
 
          let response5: DashBoardChartResp = new DashBoardChartResp();
          response5.key = "Series 5 HS Revenue";
          response5.id = 105;
          let y5 = 1000
          response5.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y5 = y5 + 500;
              let cood5: ChartCoordinate = new ChartCoordinate();
              cood5.x = i;
              cood5.y = y5;
              response5.values.push(cood5);
          }
          responseList.push(response5);
 
          let response6: DashBoardChartResp = new DashBoardChartResp();
          response6.key = "Series 6 HS Revenue";
          response6.id = 106;
          let y6 = 1000
          response6.values = new Array<ChartCoordinate>();
          for (let i = 1502735400000; i <= 1505327400000; i = i + 86400000) {
              y6 = y6 + 500;
              let cood6: ChartCoordinate = new ChartCoordinate();
              cood6.x = i;
              cood6.y = y6;
              response6.values.push(cood6);
          }
          responseList.push(response6); */

        // test data ends here .....................

        if (this.reportResponse == undefined || this.reportResponse.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponse[0].pocName;
            response.id = this.reportResponse[0].pocId;
            coor.x = this.reportResponse[0].date;
            coor.y = this.reportResponse[0].averageWatingTime;
            console.log("check" + coor.y);
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponse.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponse[i].pocId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].averageWatingTime;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponse[i].pocId;
                        response.key = this.reportResponse[i].pocName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponse[i].date;
                        coor.y = this.reportResponse[i].averageWatingTime;
                        response.values.push(coor);
                        // console.log("inside function" + JSON.stringify(this.reportResponse[i].averageWatingtime));
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
        //.color(['#82DFD6', '#fff000']);

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
            .axisLabel("Average(ms) →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd32Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
        d3.select('#chart07')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd32Data)         //Populate the <svg> element with chart data...
            .call(this.nvd32Chart);
        nv.utils.windowResize(this.nvd32Chart.update);
    }
}
