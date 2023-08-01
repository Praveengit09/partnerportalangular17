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
  selector: 'revenueperdoc',
  templateUrl: './revenueperdoc.template.html',
  styleUrls: ['./revenueperdoc.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RevenuePerDoctor {
  nvd32Chart: any;
  nvd32Data: any;
  reportResponse: ReportResponse[] = new Array<ReportResponse>();
  dashBoardChartResponseList: DashBoardChartResp[];
  config: any;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;
  isMoreItem: boolean;
  @Input()
  selectedRange;
  @Input()
  dropDownIndexForPastDate;

  colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
    '#78C2DC', '#4D97EA'];

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
      console.log("Response In ConsumerAdmin NgOnInit:: killer" + JSON.stringify(this.reportResponse));
      if (this.reportResponse.length > 0)
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
    request.fromDate = this.startingDate
    request.toDate = this.toDate
    request.pocIds = new Array<number>();
    request.perDoctor = true;
    request.pocIds = this.authService.loginResponse.employee.pocIdList;
    request.daysInterval = parseInt(this.dropDownIndexForPastDate);
    this.dashBoardChartResponseList = new Array<DashBoardChartResp>();
    return this.adminService.getRevenueReport(request);
  }

  applyNvd3Data(): void {

    let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
    if (this.reportResponse == undefined || this.reportResponse.length == 0) {
      let response: DashBoardChartResp = new DashBoardChartResp();
      responseList.push(response);
    } else {

      let dataMap = {};
      let doctorIdList = [];
      this.reportResponse.forEach(e => {
        let internalDataMap = {};
        if (!dataMap[e.doctorId] || dataMap[e.doctorId] == null) {
          dataMap[e.doctorId] = internalDataMap;
          doctorIdList.push(e.doctorId);
        } else if (dataMap[e.doctorId] && +dataMap[e.doctorId] != null) {
          internalDataMap = dataMap[e.doctorId];
        }
        internalDataMap["key"] = e.doctorFirstName + (e.doctorLastName ? e.doctorLastName : '');
        let internalData = {};
        if (internalDataMap["data"]) {
          internalData = internalDataMap["data"];
        }
        if (!internalData[e.date] || internalData[e.date] == 0) {
          internalData[e.date] = e.finalAmount;
        } else if (internalData[e.date] && +internalData[e.date] > 0) {
          internalData[e.date] = (+internalData[e.date] + +e.finalAmount);
        }
        internalDataMap["data"] = internalData;
        dataMap[e.doctorId] = internalDataMap;
        if (this.highYAxis < +e.finalAmount) {
          this.highYAxis = +e.finalAmount;
        }
      });

      let startDate = DateUtil.removeTimeInMillis(this.startingDate);
      for (let id in doctorIdList) {
        let response: DashBoardChartResp = new DashBoardChartResp();
        response.id = +doctorIdList[id];
        if (!dataMap[doctorIdList[id]]) {
          continue;
        }
        response.key = dataMap[doctorIdList[id]]["key"];

        for (let i = startDate; i <= this.toDate; i = i + 86400000) {
          let coor = new ChartCoordinate();
          coor.x = i;
          coor.y = +(dataMap[doctorIdList[id]].data["" + i] && +dataMap[doctorIdList[id]].data["" + i] > 0 ? dataMap[doctorIdList[id]].data["" + i] : 0);
          response.values.push(coor);

        }
        response.values.sort(function (a, b) {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        });
        responseList.push(response);
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
      .showMaxMin(false).axisLabel("Date →")
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
      .tickFormat(d3.format('.2s'));

    if (responseList != undefined && responseList != null) {
      this.nvd32Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }
    //console.log("Nvd32Data:: " + JSON.stringify(this.nvd32Data));
    d3.select('#chart1')    //Select the <svg> element you want to render the chart in.   
      .datum(this.nvd32Data)         //Populate the <svg> element with chart data...
      .call(this.nvd32Chart);
    nv.utils.windowResize(this.nvd32Chart.update);
  }
}