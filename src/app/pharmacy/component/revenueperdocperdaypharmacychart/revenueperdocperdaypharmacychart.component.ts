import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { ReportRequest } from './../../../model/report/reportrequest';
import { AuthService } from "./../../../auth/auth.service";
import { PharmacyService } from './../../../pharmacy/pharmacy.service';
import { DashBoardChartResp } from './../../../model/chart/dashboardChartResp';
import { ReportResponse } from './../../../model/report/reportresponse';
import { ChartCoordinate } from './../../../model/chart/chartCoordinate';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { ReportConstants } from '../../../constants/report/reportconstants';
import { BusinessAdminService } from '../../../businessadmin/businessadmin.service';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'revenueperdocperdaypharmacychart',
  templateUrl: './revenueperdocperdaypharmacychart.template.html',
  styleUrls: ['./revenueperdocperdaypharmacychart.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class RevenuePerDocPerDayPharmacyChartComponent implements OnInit {

  nvd32Chart: any;
  nvd32Data: any;
  reportResponse: ReportResponse[] = new Array<ReportResponse>();
  dashBoardChartResponseList: DashBoardChartResp[];
  config: any;
  dropDownIndexForPastDate: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;
  isMoreItem: boolean;

  colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
    '#78C2DC', '#4D97EA'];

  constructor(config: AppConfig,
    private pharmacyService: PharmacyService,
    private businessadminService: BusinessAdminService,
    private authService: AuthService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    this.dropDownIndexForPastDate = 0;
    this.spinnerService.start();
    this.getPharmacyRevenueBasedOnDay().then(response => {
      this.spinnerService.stop();
      this.reportResponse = response;
      this.isNetworkErr = false;
      console.log("Response In RevenuePerDocPerDayPharmacyChartComponent NgOnInit:: " + JSON.stringify(this.reportResponse));
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

  getPharmacyRevenueBasedOnDay() {

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
    console.log("Starting Date::" + this.startingDate);
    let endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);
    endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
    this.toDate = endDate.getTime();
    console.log("To Date::" + this.toDate);
    let request: ReportRequest = new ReportRequest();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocIds = new Array<number>();
    request.pocIds.push(this.authService.userAuth.pocId);
    request.basketType = ReportConstants.BASKET_TYPE_PHARMACY;
    request.perDoctor = true;
    console.log("fromDate:: " + request.fromDate + " toDate:: " + request.toDate);
    console.log("request body++++++++++++++" + JSON.stringify(request));
    this.dashBoardChartResponseList = new Array<DashBoardChartResp>();
    return this.businessadminService.getRevenueReport(request);

  }

  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    this.nvd32Data = undefined;
    this.spinnerService.start();
    this.getPharmacyRevenueBasedOnDay().then(response => {
      this.spinnerService.stop();
      this.reportResponse = response;
      console.log("Response In RevenuePerDocPerDayPharmacyChartComponent onDateOptionChange:: " + JSON.stringify(this.reportResponse));
      this.applyNvd3Data();
    });
  }

  applyNvd3Data(): void {
    let response: DashBoardChartResp = new DashBoardChartResp();
    let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
    let coor: ChartCoordinate = new ChartCoordinate();
    if (this.reportResponse == undefined || this.reportResponse.length == 0 || this.reportResponse == null) {
      //return;
      responseList.push(response);
    } else {
      response.id = this.reportResponse[0].doctorId;
      response.key = this.reportResponse[0].doctorFirstName != null ? this.reportResponse[0].doctorFirstName : '' + (this.reportResponse[0].doctorLastName != null ? this.reportResponse[0].doctorLastName : '');
      coor.x = this.reportResponse[0].date;
      coor.y = this.reportResponse[0].finalAmount;
      response.values.push(coor);
      responseList.push(response);

      for (let i = 1; i < this.reportResponse.length; i++) {
        let num: number = responseList.length;
        for (let j = 0; j < num; j++) {
          let tempkey = this.reportResponse[i].doctorId;
          if (tempkey == responseList[j].id) {
            coor = new ChartCoordinate();
            coor.x = this.reportResponse[i].date;
            coor.y = this.reportResponse[i].finalAmount;
            responseList[j].values.push(coor);
            num = responseList.length;
            console.log("dramebaaz");
            break;
          }
          if (j == num - 1) { //full search of responseList
            response = new DashBoardChartResp();
            response.id = this.reportResponse[i].doctorId;
            response.key = this.reportResponse[i].doctorFirstName != null ? this.reportResponse[i].doctorFirstName : '' + this.reportResponse[i].doctorLastName != null ? this.reportResponse[i].doctorLastName : '';
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

      console.log("ResponseList Check in RevenuePerDocPerDayPharmacyChartComponent::" + JSON.stringify(responseList));


      //sort the list in decending order of values of Doc name...and deleting id..
      /*  for (let y = 0; y < responseList.length; y++) {
         delete responseList[y].id;
         responseList.sort(function (a, b) {
           if (a.values.length < b.values.length) return 1;
           if (a.values.length > b.values.length) return -1;
           return 0;
         });
       }

       console.log("ResponseList Check2::" + JSON.stringify(responseList)); */

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
      //console.log("data2:: " + JSON.stringify(data));
      return data;
    }

    this.nvd32Chart = nv.models.multiBarChart().reduceXTicks(false)
      .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
    // .color(['#F7653F', '#0000ff']);

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

    if ($(window).width() <= 767) {
      this.nvd32Chart
        .xAxis.rotateLabels(-90);
    }
    this.nvd32Chart.xAxis
      .showMaxMin(false)
      .axisLabel("Date →")
      .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

    if (this.dropDownIndexForPastDate != 0)
      this.nvd32Chart.xAxis.rotateLabels(-90);

    if (this.highYAxis != 0) {
      this.nvd32Chart.forceY([0]);
    } else {
      this.nvd32Chart.forceY([0, 10]);
    }
    this.nvd32Chart.yAxis
      .showMaxMin(true)
      .axisLabel("Amount (₹) →")
      .tickFormat(d3.format('.02s'));


    if (responseList != undefined && responseList != null) {
      this.nvd32Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }
    console.log("Nvd32Data:: " + JSON.stringify(this.nvd32Data));

  }
}
