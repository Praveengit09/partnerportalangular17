import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { DashBoardChartResp } from './../../../model/chart/dashboardChartResp';
import { AuthService } from "./../../../auth/auth.service";
import { DashBoardChartReq } from './../../../model/chart/dashBoardChartReq';
import { DiagnosticsService } from './../../../diagnostics/diagnostics.service';
import { ReportResponse } from './../../../model/report/reportresponse';
import { ChartCoordinate } from './../../../model/chart/chartCoordinate';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { StatusType } from '../../../model/common/statusType';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'partiallyfulfilledchartdiagnostic',
  templateUrl: './partiallyfulfilledchartdiagnostic.template.html',
  styleUrls: ['./partiallyfulfilledchartdiagnostic.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PartiallyfulfilledChartDiagnosticComponent {
  nvd32Chart: any;
  nvd32Data: any;
  reportResponse: ReportResponse[] = new Array<ReportResponse>();
  config: any;
  dropDownIndexForPastDate: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;

  reportsPendingCount: number = 0;

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
      console.log("Response In ConsumerOnboarded NgOnInit::partially order " + JSON.stringify(this.reportResponse));
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
    let request: DashBoardChartReq = new DashBoardChartReq();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocId = this.authService.userAuth.pocId;
    request.reportType = StatusType.PARTIAL_REPORT;
    console.log("requestttt for partially" + JSON.stringify(request));

    console.log("fromDate:: " + request.fromDate + " toDate:: " + request.toDate);
    return this.diagnosticService.getDiagnosticPartialOrderFulfilled(request);
  }


  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    this.nvd32Data = undefined;
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
    response.key = "PartiallyFulfilledPerDay";
    if (this.reportResponse == undefined)
      return;

    for (let i = 0; i < this.reportResponse.length; i++) {
      coor = new ChartCoordinate();
      coor.x = this.reportResponse[i].date;
      coor.y = this.reportResponse[i].count;
      response.values.push(coor);
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
      console.log("partially In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
      return data;
    }

    this.nvd32Chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .margin({ left: 60, bottom: 70, right: 20 })
      .color(['#82DFD6', '#ddd']);

    if (this.isNetworkErr == false)
      this.nvd32Chart.noData("No Data is Available.");
    else
      this.nvd32Chart.noData("Oops ! Something Went Wrong.");

    if($(window).width()<=767){
      this.nvd32Chart
      .xAxis.rotateLabels(-90);
    }

    this.nvd32Chart.xAxis 
      .showMaxMin(false)
      .axisLabel("Date →")
      .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

    if (this.dropDownIndexForPastDate != 0)
      this.nvd32Chart.xAxis.rotateLabels(-90);

    this.nvd32Chart.xAxis.tickValues(response.values.map(function (d) { return d.x; }));

    if (this.highYAxis != 0) {
      this.nvd32Chart.forceY([0]);
    } else {
      this.nvd32Chart.forceY([0, 100]);
    }

    this.nvd32Chart.yAxis
      .showMaxMin(true)
      .axisLabel("No of Orders →")
      .tickFormat(d3.format("d"));

    if (response != undefined && response != null) {
      this.nvd32Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }
    // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
  }
}
