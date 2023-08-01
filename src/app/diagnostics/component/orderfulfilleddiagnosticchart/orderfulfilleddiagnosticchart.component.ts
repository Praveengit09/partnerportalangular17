import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { AuthService } from "./../../../auth/auth.service";
import { DashBoardChartResp } from './../../../model/chart/dashboardChartResp';
import { DashBoardChartReq } from './../../../model/chart/dashBoardChartReq';
import { DiagnosticsService } from './../../../diagnostics/diagnostics.service';
import { ChartCoordinate } from './../../../model/chart/chartCoordinate';
import { ReportResponse } from './../../../model/report/reportresponse';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { ReportRequest } from './../../../model/report/reportrequest';
import { BasketRequest } from '../../../model/basket/basketRequest';
import { StatusType } from '../../../model/common/statusType';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'orderfulfilleddiagnosticchart',
  templateUrl: './orderfulfilleddiagnosticchart.template.html',
  styleUrls: ['./orderfulfilleddiagnosticchart.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderFulfilledDiagnosticChartComponent {
  nvd31Chart: any;
  nvd31Data: any;
  reportResponse: ReportResponse[] = new Array<ReportResponse>();
  config: any;
  dropDownIndexForPastDate: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;

  constructor(config: AppConfig,
    private diagnosticService: DiagnosticsService,
    private authService: AuthService,
    private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    this.dropDownIndexForPastDate = 0;
    this.spinnerService.start();
    this.getdiagnosticcount().then(response => {
      this.spinnerService.stop();
      this.reportResponse = response;
      this.isNetworkErr = false;
      console.log("Response In ConsumerOnboarded NgOnInit:: " + JSON.stringify(this.reportResponse));
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

  getdiagnosticcount(): Promise<ReportResponse[]> {

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
    this.startingDate = startDate.getTime();
    let endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);
    endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
    this.toDate = endDate.getTime();

    /* let request: DashBoardChartReq = new DashBoardChartReq();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocId = this.authService.userAuth.pocId;
    console.log("requestttt" + JSON.stringify(request));
     return this.diagnosticService.getDiagnosticOrderFulfilled(request);*/

    // let request: ReportRequest = new ReportRequest();
    // request.fromDate = startDate.getTime();
    // request.toDate = endDate.getTime();
    // //request.pocIds = new Array<number>();
    // request.pocId = this.authService.userAuth.pocId;
    let request: DashBoardChartReq = new DashBoardChartReq();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocId = this.authService.userAuth.pocId;
    request.reportType = StatusType.FULL_REPORT;
    if(this.authService.userAuth.pocId>1)
    //request.basketType = BasketRequest.BASKET_TYPE_DIAGNOSTICS;
    //request.perPOC = true;
    console.log("fromDate:: " + request.fromDate + " toDate:: " + request.toDate);
    return this.diagnosticService.getDiagnosticPartialOrderFulfilled(request);
  }

  

  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    this.nvd31Data = undefined;
    this.spinnerService.start();
    this.getdiagnosticcount().then(response => {
      this.spinnerService.stop();
      this.reportResponse = response;
      console.log("Response In  OnDateOptionChange:: " + JSON.stringify(this.reportResponse));
      this.applyNvd3Data();
    });
  }

  applyNvd3Data(): void {
    let response: DashBoardChartResp = new DashBoardChartResp();
    let coor: ChartCoordinate;
    response.key = "OrderFulfilledPerDay";

    if (this.reportResponse == undefined)
      return;

    for (let i = 0; i < this.reportResponse.length; i++) {
      coor = new ChartCoordinate();
      coor.x = this.reportResponse[i].date;
      coor.y = this.reportResponse[i].count;
      response.values.push(coor);
      // console.log("response with count:::" + response);
    }

    for (let j = 0; j < response.values.length; j++) {
      for (let i = this.startingDate; i <= this.toDate; i = i + 86400000) {
        if ((response.values.find(coordinate => coordinate.x == i)) == undefined) {
          let coor = new ChartCoordinate();
          coor.x = i;
          coor.y = 0;
          response.values.push(coor);
        }
      }
    }

    response.values.sort(function (a, b) {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      return 0;
    });

    if (response.values != undefined && response.values != null) {
      for (let i = 0; i < response.values.length; i++) {
        if (this.highYAxis < response.values[i].y) {
          this.highYAxis = response.values[i].y;
          break;
        }
      }
    }

    function addGraph(): Array<any> {
      let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
      data.push(response);
      console.log(" In ApplyNvd3Data AddGraph: " + JSON.stringify(response));
      return data;
    }

    this.nvd31Chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .margin({ left: 60, bottom: 70, right: 20 })
      .color(['#82DFD6', '#ddd']);

    if (this.isNetworkErr == false)
      this.nvd31Chart.noData("No Data is Available.");
    else
      this.nvd31Chart.noData("Oops ! Something Went Wrong.");

      if($(window).width()<=767){
        this.nvd31Chart
        .xAxis.rotateLabels(-90);
      }

    this.nvd31Chart.xAxis
      .showMaxMin(false)
      .axisLabel("Date →")
      .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

    if (this.dropDownIndexForPastDate != 0)
      this.nvd31Chart.xAxis.rotateLabels(-90);

    this.nvd31Chart.xAxis.tickValues(response.values.map(function (d) { return d.x; }));

    if (this.highYAxis != 0) {
      this.nvd31Chart.forceY([0]);
    } else {
      this.nvd31Chart.forceY([0, 100]);
    }

    this.nvd31Chart.yAxis
      .showMaxMin(true)
      .axisLabel("No of Orders →")
      .tickFormat(d3.format('d'));

    if (response != undefined && response != null) {
      this.nvd31Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }
    // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
  }
}
