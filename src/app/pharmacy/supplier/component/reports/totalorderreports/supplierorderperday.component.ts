import { SupplierOrderResponse } from './../../../../../model/report/supplierordersreport';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AppConfig } from './../../../../../app.config';
import { AuthService } from './../../../../../auth/auth.service';
import { ChartCoordinate } from './../../../../../model/chart/chartCoordinate';
import { DashBoardChartResp } from './../../../../../model/chart/dashboardChartResp';
import { PharmacyService } from './../../../../pharmacy.service';


declare var d3: any;
declare var nv: any;
@Component({
    selector: 'supplierorderperday',
    templateUrl: './supplierorderperday.template.html',
    styleUrls: ['./supplierorderperday.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SupplierOrderPerDay {
    nvd32Chart: any;
    nvd32Data: any;
    reportResponse: SupplierOrderResponse[] = new Array<SupplierOrderResponse>();
    chartResponseList: DashBoardChartResp[];
    config: any;
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
    showLineGraph: boolean = false;
    cartItemType: number = 101;

    constructor(config: AppConfig, private pharmacyService: PharmacyService,
        private authService: AuthService) {
        this.config = config.getConfig();
        console.log("showLineGraph ----", this.showLineGraph)
    }

    ngOnChanges(): void {

        this.getTotalOrdersCountList().then(response => {
            this.reportResponse = response;
            this.isNetworkErr = false;
            console.log("Response Supplier Orders NgOnInit:: " + JSON.stringify(this.reportResponse));
            this.filterCartItemType(this.cartItemType);
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

    getTotalOrdersCountList() {

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
        this.chartResponseList = new Array<DashBoardChartResp>();
        return this.pharmacyService.getTotalOrdersCountList(this.authService.selectedPOCMapping.pocId, this.startingDate, this.toDate, this.dropDownIndexForPastDate);
    }

    applyNvd3Data(): void {

        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        if (this.reportResponse == undefined || this.reportResponse.length == 0) {
            responseList.push(response);
        } else {
            response.key = "Raised"
            responseList.push(response);
            let response1: DashBoardChartResp = new DashBoardChartResp();
            response1.key = "Pending"
            responseList.push(response1);
            let response2: DashBoardChartResp = new DashBoardChartResp();
            response2.key = "Completed"
            responseList.push(response2);
            let response3: DashBoardChartResp = new DashBoardChartResp();
            response3.key = "Rejected"
            responseList.push(response3);
            console.log("response=======", JSON.stringify(responseList))

            this.reportResponse.sort(function (a, b) {
                if (a.timeStamp < b.timeStamp) return -1;
                if (a.timeStamp > b.timeStamp) return 1;
                return 0;
            });

            for (let i = 0; i < this.reportResponse.length; i++) {
                let coor = new ChartCoordinate();
                coor.x = this.reportResponse[i].timeStamp;
                coor.y = this.reportResponse[i].totalOrderRaised ? this.reportResponse[i].totalOrderRaised : 0;
                responseList[0].values.push(coor);
                let coor1 = new ChartCoordinate();
                coor1.x = this.reportResponse[i].timeStamp;
                coor1.y = this.reportResponse[i].totalOrdersPending ? this.reportResponse[i].totalOrdersPending : 0;
                responseList[1].values.push(coor1);
                let coor2 = new ChartCoordinate();
                coor2.x = this.reportResponse[i].timeStamp;
                coor2.y = this.reportResponse[i].totalOrdersFulfilled ? this.reportResponse[i].totalOrdersFulfilled : 0;
                responseList[2].values.push(coor2);
                let coor3 = new ChartCoordinate();
                coor3.x = this.reportResponse[i].timeStamp;
                coor3.y = this.reportResponse[i].totalOrdersRejected ? this.reportResponse[i].totalOrdersRejected : 0;
                responseList[3].values.push(coor3);
            }

            if (this.dropDownIndexForPastDate == 1) {
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
            }

            for (let y = 0; y < responseList.length; y++) {
                responseList[y].values.sort(function (a, b) {
                    if (a.x < b.x) return -1;
                    if (a.x > b.x) return 1;
                    return 0;
                });
            }
            console.log("Supplier order Response::" + JSON.stringify(responseList));

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
            this.chartResponseList = responseList;
        }

        function addGraph(): Array<any> {
            let data: DashBoardChartResp[] = new Array<DashBoardChartResp>();
            data = responseList;
            return data;
        }
        if (!this.showLineGraph)
            this.nvd32Chart = nv.models.multiBarChart().reduceXTicks(false)
                .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);

        if (this.showLineGraph)
            this.nvd32Chart = nv.models.lineChart()
                .useInteractiveGuideline(true)
                .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);

        this.isMoreItem = true;
        this.nvd32Chart.showLegend(true);

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
            .axisLabel("Orders →")
            .tickFormat(d3.format(".2"));

        if (response != undefined && response != null) {
            this.nvd32Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }

        d3.select('#totalorders')
            .datum(this.nvd32Data)
            .call(this.nvd32Chart);
        nv.utils.windowResize(this.nvd32Chart.update);
    }

    filterCartItemType(value: number) {
        this.reportResponse = this.reportResponse.filter(item => item.cartItemType == value);
        console.log("response: " + JSON.stringify(this.reportResponse));
    }

    onChangeFilter(value: number) {
        this.cartItemType = value;
        this.ngOnChanges()
    }

    onChangeRadio(value: number) {
        value == 0 ? this.showLineGraph = false : this.showLineGraph = true;
        if (this.showLineGraph == true) {
            $("#totalorders .nv-multiBarWithLegend").css("display", "none");
            $("#totalorders .nv-lineChart").css("display", "block");

        }
        if (this.showLineGraph == false) {
            $("#totalorders .nv-multibar").css("display", "block");
            $("#totalorders .nv-multiBarWithLegend").css("display", "block");
            $("#totalorders .nv-lineChart").css("display", "none");
        }
        this.ngOnChanges()

    }
}
