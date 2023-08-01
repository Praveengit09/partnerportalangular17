import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { AuthService } from "./../../../auth/auth.service";
import { OnboardingService } from './../../../onboarding/onboarding.service';
import { DashBoardChartResp } from './../../../model/chart/dashboardChartResp';
import { DashBoardChartReq } from './../../../model/chart/dashBoardChartReq';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { ChartCoordinate } from './../../../model/chart/chartCoordinate';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'hsrevenueschartonboarded',
  templateUrl: './hsrevenueschartonboarded.template.html',
  styleUrls: ['./hsrevenueschartonboarded.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HsRevenuesChartOnboardedComponent implements OnInit {

  nvd32Chart: any;
  nvd32Data: any;
  dashBoardChartRespList: DashBoardChartResp[] = new Array<DashBoardChartResp>();;
  config: any;
  dropDownIndexForPastDate: number;
  highYAxis: number = 0;
  toDate: number;
  startingDate: number;
  isNetworkErr: boolean;
  colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
    '#78C2DC', '#4D97EA'];

  constructor(config: AppConfig,
    private onboardingService: OnboardingService,
    private authService: AuthService,
    private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    this.dropDownIndexForPastDate = 0;
    this.spinnerService.start();
    this.getRevenues().then(response => {
      this.spinnerService.stop();
      this.dashBoardChartRespList = response;
      this.isNetworkErr = false;
      console.log("Response In HSREVENUES NgOnInit:: " + JSON.stringify(this.dashBoardChartRespList));
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

  getRevenues(): Promise<DashBoardChartResp[]> {

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
    console.log("fromDate:: " + request.fromDate + " toDate:: " + request.toDate);
    return this.onboardingService.getRevenues(request);
  }


  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    //console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    this.nvd32Data = undefined;
    this.spinnerService.start();
    this.getRevenues().then(response => {
      this.spinnerService.stop();
      this.dashBoardChartRespList = response;
      //console.log("Response In ConsumerOnboarded OnDateOptionChange:: " + JSON.stringify(this.dashBoardChartRespList));
      this.applyNvd3Data();
    });
  }

  applyNvd3Data(): void {

    let response: DashBoardChartResp[] = new Array<DashBoardChartResp>();
    let response1: DashBoardChartResp = new DashBoardChartResp();
    if (this.dashBoardChartRespList == undefined || (this.dashBoardChartRespList[0].values.length == 0 && this.dashBoardChartRespList[1].values.length == 0)) {
      response.push(response1);
    } else {
      response = this.dashBoardChartRespList;

      for (let j = 0; j < response.length; j++) {
        for (let i = this.startingDate; i <= this.toDate; i = i + 86400000) {
          if ((response[j].values.find(coordinate => coordinate.x == i)) == undefined) {
            let coor = new ChartCoordinate();
            coor.x = i;
            coor.y = 0
            response[j].values.push(coor);
          }
        }
      }


      for (let y = 0; y < response.length; y++) {
        response[y].values.sort(function (a, b) {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        });
      }


      //sort the list in decending order of values of Doc name...and deleting id..
      /*  for (let y = 0; y < response.length; y++) {
         delete response[y].id;
         response.sort(function (a, b) {
           if (a.values.length < b.values.length) return 1;
           if (a.values.length > b.values.length) return -1;
           return 0;
         });
       } */

      console.log("ResponseList Check2::" + JSON.stringify(response));

      if (response != undefined && response != null) {
        for (let j = 0; j < response.length; j++) {
          for (let i = 0; i < response[j].values.length; i++) {
            if (this.highYAxis < response[j].values[i].y) {
              this.highYAxis = response[j].values[i].y;
              break;
            }
          }
        }
      }

      //console.log("HSRevenuesResponse In ApplyNvd3Data:: " + JSON.stringify(response));
    }

    function addGraph(): Array<any> {
      let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
      data = response;
      // console.log("data3:: " + JSON.stringify(data));
      return data;
    }

    this.nvd32Chart = nv.models.multiBarChart().reduceXTicks(false)
      .margin({ left: 60, bottom: 70, right: 20 })
      .color(this.colorCodeArray);

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
      .tickFormat(d3.format(',.0'));

    // console.log("Nvd32Data:: " + JSON.stringify(this.nvd32Data));

    if (response != undefined && response != null) {
      this.nvd32Data = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }

  }
}
