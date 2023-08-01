import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { AuthService } from "../../../../auth/auth.service";
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp'
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate'
import { SlotsResponse } from '../../../../model/report/slotsResponse';
import { BusinessAdminService } from '../../../businessadmin.service';
import { DateUtil } from '../../../../base/util/dateutil';
declare var d3: any;
declare var nv: any;
@Component({
  selector: 'slotsperday',
  templateUrl: './slotsperday.template.html',
  styleUrls: ['./slotsperday.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SlotsPerDay {
  nvd31Chart: any;
  nvd31Data: any;
  slotsResponse: SlotsResponse[] = new Array<SlotsResponse>();;
  config: any;
  finalslots: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;
  //dropDownIndexForPastDate: number;
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
      console.log("Response In ConsumerAdmin NgOnInit::slotsperday " + JSON.stringify(this.slotsResponse));
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
    // let startDate = new Date();
    // startDate.setHours(0);
    // startDate.setMinutes(0);
    // startDate.setSeconds(0);
    // startDate.setMilliseconds(0);
    // startDate.setTime(startDate.getTime() - dateOffset);
    // this.startingDate = this.selectedRange.date1 ? this.selectedRange.date1.getTime() : startDate.getTime();
    // console.log("selectedRange==>"+JSON.stringify(this.startingDate))


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
    //console.log("POC_AUTH::" + this.authService.pocIds);
    request.pocIds = this.authService.loginResponse.employee.pocIdList;
    request.daysInterval = parseInt(this.dropDownIndexForPastDate);
    console.log("requesttttt" + JSON.stringify(request));
    return this.adminService.getSlotsStatusinPoc(request);
  }




  applyNvd3Data(): void {
    let response: DashBoardChartResp = new DashBoardChartResp();
    if (this.slotsResponse == undefined || this.slotsResponse.length == 0) {

    } else {
      response.key = "SlotsPerDay";
      for (let i = 0; i < this.slotsResponse[0].dateSummery.length; i++) {
        let coor1: ChartCoordinate = new ChartCoordinate();
        coor1.x = this.slotsResponse[0].dateSummery[i].date;
        if (this.slotsResponse[0].dateSummery[i].bookedSlots != undefined) {
          coor1.y = this.slotsResponse[0].dateSummery[i].bookedSlots;
        } else {
          coor1.y = 0;
        }
        response.values.push(coor1);
      }
      //console.log("check zara coor"+JSON.stringify(coor));
      for (let j = 1; j < this.slotsResponse.length; j++) {
        for (let k = 0; k < this.slotsResponse[j].dateSummery.length; k++) {
          let len = response.values.length;
          for (let l = 0; l < len; l++) {
            if (this.slotsResponse[j].dateSummery[k].date == response.values[l].x) {
              response.values[l].y = response.values[l].y + (this.slotsResponse[j].dateSummery[k].bookedSlots != undefined ? this.slotsResponse[j].dateSummery[k].bookedSlots : 0);
              break;
            }
            if (l == len - 1) {
              let coor: ChartCoordinate = new ChartCoordinate();
              coor.x = this.slotsResponse[j].dateSummery[k].date;
              coor.y = (this.slotsResponse[j].dateSummery[k].bookedSlots != undefined ? this.slotsResponse[j].dateSummery[k].bookedSlots : 0);
              response.values.push(coor);
              break;

            }
          }
        }
      }

      for (let j = 0; j < response.values.length; j++) {
        let startDate = DateUtil.removeTimeInMillis(this.startingDate);
        for (let i = startDate; i <= this.toDate; i = i + 86400000) {
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

      console.log("Res_Value slotperday::" + JSON.stringify(response));

      if (response.values != undefined && response.values != null) {
        for (let i = 0; i < response.values.length; i++) {
          if (this.highYAxis < response.values[i].y) {
            this.highYAxis = response.values[i].y;
            break;
          }
        }
      }
    }

    function addGraph(): Array<any> {
      let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
      data.push(response);
      console.log("ConsumerAdmin In ApplyNvd3Data AddGraph: " + JSON.stringify(data));
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

    this.nvd31Chart.xAxis
      .showMaxMin(false)
      .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

    if (this.dropDownIndexForPastDate != 0)
      this.nvd31Chart.xAxis.rotateLabels(-90);

    this.nvd31Chart.xAxis.axisLabel("Date →");
    this.nvd31Chart.xAxis.tickValues(response.values.map(function (d) { return d.x; }));

    if (this.highYAxis != 0) {
      this.nvd31Chart.forceY([0]);
    } else {
      this.nvd31Chart.forceY([0, 100]);
    }

    this.nvd31Chart.yAxis
      .showMaxMin(true)
      .tickFormat(d3.format('d'));

    this.nvd31Chart.yAxis.axisLabel("No. of slots →");

    if (response != undefined && response != null) {
      this.nvd31Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
      console.log("Nvd31Dataslot:: " + JSON.stringify(this.nvd31Data));
    }

    d3.select('#chart05')    //Select the <svg> element you want to render the chart in.   
      .datum(this.nvd31Data)         //Populate the <svg> element with chart data...
      .call(this.nvd31Chart);
    nv.utils.windowResize(this.nvd31Chart.update);
  }
}
