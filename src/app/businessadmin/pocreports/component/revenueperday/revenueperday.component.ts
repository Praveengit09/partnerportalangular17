import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { AuthService } from "../../../../auth/auth.service";
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { BusinessAdminService } from '../../../businessadmin.service';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { DateUtil } from '../../../../base/util/dateutil';

// import * as moment from 'moment';
// import { LocaleConfig, LocaleService } from 'ngx-daterangepicker-material';

declare var d3: any;
declare var nv: any;
@Component({
  selector: 'revenueperday',
  templateUrl: './revenueperday.template.html',
  styleUrls: ['./revenueperday.style.scss'],
  encapsulation: ViewEncapsulation.None,
  // providers: [LocaleService]
})
export class RevenuePerDay{
  nvd31Chart: any;
  nvd31Data: any;
  reportResponse: ReportResponse[] = new Array<ReportResponse>();
  config: any;
  //dropDownIndexForPastDate: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;
  selectedPOC: PocAdviseData
  @Input()
  selectedRange;
  @Input()
  dropDownIndexForPastDate;
  colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD',
    '#B2DA87', '#78C2DC', '#4D97EA'];

  constructor(config: AppConfig,
    private adminService: BusinessAdminService,
    private authService: AuthService) {
    this.config = config.getConfig();
    // NgxDaterangepickerMd
  }


  ngOnChanges(): void {
    console.log(this.selectedRange, "pocid::::")
    // this.dropDownIndexForPastDate = 0;
    this.getadmincount().then(response => {
      this.isNetworkErr = false;
      this.reportResponse = response;
      if (this.reportResponse.length > 0)
        console.log("Response In ConsumerAdmin NgOnInit::ghhghgas " + JSON.stringify(response));
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
    request.pocIds = this.authService.loginResponse.employee.pocIdList;
    request.perPOC = true;
    request.daysInterval = parseInt(this.dropDownIndexForPastDate);
    //console.log("fgfgfgdffd",(this.dropDownIndexForPastDate))
    console.log("request" + JSON.stringify(request));
    return this.adminService.getRevenueReport(request);
  }

  applyNvd3Data(): void {
    let response: DashBoardChartResp = new DashBoardChartResp();
    response.values = [];
    if (this.reportResponse == undefined || this.reportResponse.length == 0) {
      // Nothing to do
    } else {
      let dataMap = {};
      response.key = "RevenuePerDay";
      this.reportResponse.forEach(e => {
        if (!dataMap[e.date] || dataMap[e.date] == 0) {
          dataMap[e.date] = e.finalAmount;
        } else if (dataMap[e.date] && +dataMap[e.date] > 0) {
          dataMap[e.date] = (+dataMap[e.date] + +e.finalAmount);
        }
      });

      let startDate = DateUtil.removeTimeInMillis(this.startingDate);
      for (let i = startDate; i <= this.toDate; i = i + 86400000) {
        let coor = new ChartCoordinate();
        coor.x = i;
        coor.y = +(dataMap["" + i] && +dataMap["" + i] > 0 ? dataMap["" + i] : 0);
        response.values.push(coor);
        if (this.highYAxis < coor.y) {
          this.highYAxis = coor.y;
        }
      }

      response.values.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        return 0;
      });
    }

    function addGraph(): Array<any> {
      let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
      data.push(response);
      console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
      return data;
    }
    this.nvd31Chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .margin({ left: 60, bottom: 70, right: 20 }).color(['#82DFD6', '#ddd']);
    // .color(['#82DFD6', '#ddd']);
    if (this.isNetworkErr == false)
      this.nvd31Chart.noData("No Data is Available.");
    else
      this.nvd31Chart.noData("Oops ! Something Went Wrong.");
    this.nvd31Chart.xAxis
      .showMaxMin(false)
      .axisLabel("Date →")
      .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


    //if (this.dropDownIndexForPastDate != 0)
    this.nvd31Chart.xAxis.rotateLabels(-90);

    this.nvd31Chart.xAxis.tickValues(response.values.map(function (d) { return d.x; }));

    if (this.highYAxis != 0) {
      this.nvd31Chart.forceY([0]);
    } else {
      this.nvd31Chart.forceY([0, 100]);
    }

    this.nvd31Chart.yAxis
      .showMaxMin(true)
      .axisLabel("Amount (₹) →")
      .tickFormat(d3.format('.2s'));


    if (response != undefined && response != null) {
      this.nvd31Data = addGraph().map(function (el, i): boolean {
        console.log("ConsumerAdmin In ApplyNvd3Data AddGraph:;;;; " + JSON.stringify(response));
        el.area = true;
        return el;
      });
      //console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
    }
    d3.select('#chart')    //Select the <svg> element you want to render the chart in.   
      .datum(this.nvd31Data)         //Populate the <svg> element with chart data...
      .call(this.nvd31Chart);
    nv.utils.windowResize(this.nvd31Chart.update);

  }
}