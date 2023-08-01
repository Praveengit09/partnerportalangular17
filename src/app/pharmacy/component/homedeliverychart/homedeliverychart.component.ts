import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { PharmacyService } from './../../../pharmacy/pharmacy.service';
import { DashBoardChartResp } from './../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from './../../../model/chart/chartCoordinate';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';

declare var d3: any;
declare var nv: any;

@Component({
  selector: 'homedeliverychart',
  templateUrl: './homedeliverychart.template.html',
  styleUrls: ['./homedeliverychart.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HomeDeliveryChartComponent implements OnInit {

  @Input() componentId: string;
  @Input() pocId: number;

  nvd32ChartHome: any;
  nvd32DataHome: any;
  config: any;
  homeDeliveryResponse: any;
  dropDownIndexHomeCollection: number;

  colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
    '#78C2DC', '#4D97EA'];

  constructor(config: AppConfig,
    private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    this.dropDownIndexHomeCollection = 0;
    this.spinnerService.start();
    this.getPharmacyHomeDeliveryReports().then(response => {
      this.spinnerService.stop();
      this.homeDeliveryResponse = response;
      this.applyNvd3Data();
    }).catch((err) => {
      // if (err) {
      this.applyNvd3Data();
      return Promise.reject(err);
      // }
    });
  }

  getPharmacyHomeDeliveryReports(): Promise<any[]> {

    let dateOffset;
    if (this.dropDownIndexHomeCollection == 0) {
      dateOffset = (24 * 60 * 60 * 1000) * 7; // for 7 days
    } else if (this.dropDownIndexHomeCollection == 1) {
      dateOffset = (24 * 60 * 60 * 1000) * 15; // for 15 days
    } else if (this.dropDownIndexHomeCollection == 2) {
      dateOffset = (24 * 60 * 60 * 1000) * 30; // for 30 days
    }
    let startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    startDate.setTime(startDate.getTime() - dateOffset);
    let fromDate = startDate.getTime();

    let endDate = new Date();
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);
    endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
    let toDate = endDate.getTime();

    return this.pharmacyService.getPharmacyDeliveryReport(fromDate, toDate, this.pocId);

  }

  onHomeDateChange(index: number) {
    this.dropDownIndexHomeCollection = index;
    this.nvd32DataHome = undefined;
    this.spinnerService.start();
    this.getPharmacyHomeDeliveryReports().then(response => {
      this.spinnerService.stop();
      this.homeDeliveryResponse = response;
      this.applyNvd3Data();
    });
  }

  applyNvd3Data(): void {
    let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();

    if (this.homeDeliveryResponse == undefined || this.homeDeliveryResponse.length == 0 || this.homeDeliveryResponse == null) {
      let response: DashBoardChartResp = new DashBoardChartResp();
      responseList.push(response);
    } else {
      for (let i = 0; i < this.homeDeliveryResponse.length; i++) {
        let response: DashBoardChartResp = new DashBoardChartResp();
        response.id = this.homeDeliveryResponse[i].x;
        response.key = this.homeDeliveryResponse[i].xLabel != null ? this.homeDeliveryResponse[i].xLabel : '';
        let coor: ChartCoordinate = new ChartCoordinate();
        coor.x = this.homeDeliveryResponse[i].x;
        coor.y = this.homeDeliveryResponse[i].y;
        response.values.push(coor);
        responseList.push(response);
      }


      for (let y = 0; y < responseList.length; y++) {
        responseList[y].values.sort(function (a, b) {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        });
      }
    }

    function addGraph(): Array<any> {
      let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
      data = responseList;
      return data;
    }

    this.nvd32ChartHome = nv.models.multiBarChart().reduceXTicks(false)
      .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);


    this.nvd32ChartHome
      .showLegend(false);




    if (!this.homeDeliveryResponse || this.homeDeliveryResponse.length == 0)
      this.nvd32ChartHome.noData("No Data is Available.");

    let outerself = this;

    if ($(window).width() <= 767) {
      this.nvd32ChartHome
        .height(150)
        .xAxis.rotateLabels(-90);
    } else {
      this.nvd32ChartHome
        .height(192)
        .xAxis.rotateLabels(-90);
    }

    this.nvd32ChartHome.xAxis
      .showMaxMin(false)
      .axisLabel("Status -->")
      .tickFormat(function (d): Object {
        if (outerself.homeDeliveryResponse) {
          let matchingRecord = outerself.homeDeliveryResponse.find(function (element) {
            return element.x == d;
          });
          return matchingRecord.xLabel;
        } else {
          return d;
        }
      });

    // this.nvd32Chart.xAxis.rotateLabels(-90); 

    this.nvd32ChartHome.yAxis
      .showMaxMin(true)
      .axisLabel("No. of Orders");
    // .tickFormat(d3.format('.02s'));


    if (responseList != undefined && responseList != null) {
      this.nvd32DataHome = addGraph().map(function (el, i): boolean {
        el.area = true;
        return el;
      });
    }
    console.log("Nvd32Data:: " + JSON.stringify(this.nvd32DataHome));

  }
}
