import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { BusinessAdminService } from '../../../../../app/businessadmin/businessadmin.service';
import { AppConfig } from '../../../../../app/app.config';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { AuthService } from '../../../../../app/auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { DashBoardChartResp } from '../../../../model/chart/dashboardChartResp';
import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';
import { ReportConstants } from '../../../../constants/report/reportconstants';

declare var d3: any;
declare var nv: any;
@Component({
    selector: 'pocservice',
    templateUrl: './pocservice.template.html',
    styleUrls: ['./pocservice.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PocServiceComponent implements OnInit, OnChanges {
    nvd37Chart: any;
    nvd37Data: any;
    nvd36Chart: any;
    nvd36Data: any;
    nvd35Chart: any;
    nvd35Data: any;
    config: any;

    reportResponseDiagnostic: ReportResponse[] = new Array<ReportResponse>();
    reportResponsePharmacy: ReportResponse[] = new Array<ReportResponse>();
    reportResponseProduct: ReportResponse[] = new Array<ReportResponse>();

    @Input()
    selectDate;
    startDate: number;
    toDate: number;
    @Input()
    dropDownIndexForPastDate;
    @Input()
    brandId;
    highYAxis: number = 0;
    isNetworkErr: boolean;
    dashBoardChartResponseList: DashBoardChartResp[];
    colorCodeArray: string[] = ['#6679D1', '#FBB138', '#FF8017', '#BE76EA', '#EB64C1', '#ED7F7F', '#16B1BD', '#B2DA87',
        '#78C2DC', '#4D97EA'];
    isMoreItem: boolean;

    constructor(config: AppConfig,
        private adminService: BusinessAdminService,
        private authService: AuthService) {
        this.config = config.getConfig();
    }

    todayDate: number;
    weekStartDate: number;
    monthStartDate: number;

    diagnosticTodayReport: ReportResponse[] = new Array<ReportResponse>();
    diagnosticWeekReport: ReportResponse[] = new Array<ReportResponse>();
    diagnosticMonthReport: ReportResponse[] = new Array<ReportResponse>();

    pharmacyTodayReport: ReportResponse[] = new Array<ReportResponse>();
    pharmacyWeekReport: ReportResponse[] = new Array<ReportResponse>();
    pharmacyMonthReport: ReportResponse[] = new Array<ReportResponse>();

    productTodayReport: ReportResponse[] = new Array<ReportResponse>();
    productWeekReport: ReportResponse[] = new Array<ReportResponse>();
    productMonthReport: ReportResponse[] = new Array<ReportResponse>();

    diagnosticPocCount: number;
    pharmacyPocCount: number;
    productPocCount: number;

    ngOnInit() {
        const todayStartDate = new Date();
        todayStartDate.setHours(0, 0, 0, 0);
        this.todayDate = todayStartDate.getTime();

        const weekStartDate = new Date();
        const startOfWeek = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() - (weekStartDate.getDay() + 6) % 7,0,0,0);
        this.weekStartDate = startOfWeek.getTime();

        const monthStartDate = new Date();
        monthStartDate.setDate(1);
        monthStartDate.setHours(0, 0, 0, 0);
        this.monthStartDate = monthStartDate.getTime();

        this.getDiagonsticTodayRevenue();
        this.getDiagonsticWeekRevenue();
        this.getDiagonsticMonthRevenue();
        this.getPharamacyTodayRevenue();
        this.getPharamacyWeekRevenue();
        this.getPharamacyMonthRevenue();
        this.getProductTodayRevenue();
        this.getProductWeekRevenue();
        this.getProductMonthRevenue();
        this.getDiagnosticPocCount();
        this.getPharamacyPocCount();
        this.getProductPocCount();
    }
    ngOnChanges(): void {
        this.getDiagonsticReportForGraph();
        this.getPharamacyReportForGraph();
        this.getProductReportForGraph();
    }

    getDiagonsticTodayRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DIAGNOSTICS)

        this.getTodayRevenue(request).then(response => {
            this.diagnosticTodayReport = response;
            console.log(response, "diagnosticTodayReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDiagonsticWeekRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DIAGNOSTICS)

        this.getWeekRevenue(request).then(response => {
            this.diagnosticWeekReport = response;
            console.log(response, "diagnosticWeekReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getDiagonsticMonthRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DIAGNOSTICS)

        this.getMonthRevenue(request).then(response => {
            this.diagnosticMonthReport = response;
            console.log(response, "diagnosticMonthReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getPharamacyTodayRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PHARMACY)

        this.getTodayRevenue(request).then(response => {
            this.pharmacyTodayReport = response;
            console.log(response, "pharmacyTodayReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getPharamacyWeekRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PHARMACY);

        this.getWeekRevenue(request).then(response => {
            this.pharmacyWeekReport = response;
            console.log(response, "pharamacyWeekReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getPharamacyMonthRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PHARMACY);

        this.getMonthRevenue(request).then(response => {
            this.pharmacyMonthReport = response;
            console.log(response, "pharmacyMonthReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getProductTodayRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PRODUCT);

        this.getTodayRevenue(request).then(response => {
            this.productTodayReport = response;
            console.log(response, "productTodayReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getProductWeekRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PRODUCT);

        this.getWeekRevenue(request).then(response => {
            this.productWeekReport = response;
            console.log(response, "productWeekReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getProductMonthRevenue() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PRODUCT);

        this.getMonthRevenue(request).then(response => {
            this.productMonthReport = response;
            console.log(response, "productMonthReport================");
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getTodayRevenue(request) {
        request.fromDate = this.todayDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_DAY;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        return this.adminService.getBrandRevenueCXO(request);
    }

    getWeekRevenue(request) {
        request.fromDate = this.weekStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_WEEK;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        return this.adminService.getBrandRevenueCXO(request);
    }

    getMonthRevenue(request) {
        request.fromDate = this.monthStartDate;
        request.toDate = this.todayDate;
        request.forGraph = false;
        request.daysInterval = ReportRequest.DAYS_INTERVAL_TYPE_PER_MONTH;

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        return this.adminService.getBrandRevenueCXO(request);
    }

    getDiagnosticPocCount() {
        let request: ReportRequest = new ReportRequest();
        request.serviceType = 2;

        this.getPocCount(request).then(data => {
            this.diagnosticPocCount = data;
        })
    }

    getPharamacyPocCount() {
        let request: ReportRequest = new ReportRequest();
        request.serviceId = 9889;

        this.getPocCount(request).then(data => {
            this.pharmacyPocCount = data;
        })
    }

    getProductPocCount() {
        let request: ReportRequest = new ReportRequest();
        request.serviceId = 9889;

        this.getPocCount(request).then(data => {
            this.productPocCount = data;
        })
    }

    getPocCount(request) {
        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        return this.adminService.getPocCount(request);
    }

    getDiagonsticReportForGraph() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_DIAGNOSTICS);

        this.getRevenueReportForGraph(request).then(response => {
            this.reportResponseDiagnostic = response;
            this.applyNvd3DataDiagnostic();
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getPharamacyReportForGraph() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PHARMACY);

        this.getRevenueReportForGraph(request).then(response => {
            this.reportResponsePharmacy = response;
            this.applyNvd3DataPharmacy();
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getProductReportForGraph() {
        let request: ReportRequest = new ReportRequest();
        request.brandIds = new Array<number>();
        request.basketTypes.push(ReportConstants.BASKET_TYPE_PRODUCT);

        this.getRevenueReportForGraph(request).then(response => {
            this.reportResponseProduct = response;
            this.applyNvd3DataProduct();
        }).catch((err) => {
            // if (err) {
                console.log("ErrorMsg--" + err);
                return Promise.reject(err);
            // }
        });
    }

    getRevenueReportForGraph(request) {
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
        startDate.setTime(startDate.getTime() - (24 * 60 * 60 * 1000) * 30);
        this.startDate = this.selectDate.date1 ? this.selectDate.date1.getTime() : startDate.getTime();

        let endDate = new Date();
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setTime(endDate.getTime());
        this.toDate = this.selectDate.date2 ? this.selectDate.date2.getTime() : endDate.getTime();

        if (this.brandId == undefined || this.brandId == null) {
            this.authService.employeePocMappingList.forEach(element => {
                request.brandIds.push(element.brandId);
            });
        } else {
            request.brandIds.push(this.brandId);
        }

        request.fromDate = this.startDate;
        request.toDate = this.toDate;
        request.forGraph = true;
        request.daysInterval = parseInt(this.dropDownIndexForPastDate);

        return this.adminService.getBrandRevenueCXO(request);
    }

    applyNvd3DataDiagnostic(): void {
        console.log("brandName" + JSON.stringify(this.reportResponseDiagnostic))
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponseDiagnostic == undefined || this.reportResponseDiagnostic.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponseDiagnostic[0].brandName;
            response.id = this.reportResponseDiagnostic[0].brandId;
            coor.x = this.reportResponseDiagnostic[0].date;
            coor.y = this.reportResponseDiagnostic[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponseDiagnostic.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponseDiagnostic[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseDiagnostic[i].date;
                        coor.y = this.reportResponseDiagnostic[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) {   //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponseDiagnostic[i].brandId;
                        response.key = this.reportResponseDiagnostic[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseDiagnostic[i].date;
                        coor.y = this.reportResponseDiagnostic[i].finalAmount;
                        response.values.push(coor);

                        responseList.push(response);
                        break;
                    }
                }
            }
            //console.log("inside function" + JSON.stringify(responseList));

            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startDate; i <= this.toDate; i = i + 86400000) {
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
        this.nvd35Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd35Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd35Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd35Chart.noData("No Data is Available.");
        else
            this.nvd35Chart.noData("Oops ! Something Went Wrong.");

        this.nvd35Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat("")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


        if (this.dropDownIndexForPastDate != 0)
            this.nvd35Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd35Chart.forceY([0]);
        } else {
            this.nvd35Chart.forceY([0, 100]);
        }

        this.nvd35Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd35Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd35Data));
        d3.select('#chart6')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd35Data)         //Populate the <svg> element with chart data...
            .call(this.nvd35Chart);
        nv.utils.windowResize(this.nvd35Chart.update);

    }

    applyNvd3DataPharmacy(): void {
        console.log("brandName" + JSON.stringify(this.reportResponsePharmacy))
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponsePharmacy == undefined || this.reportResponsePharmacy.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponsePharmacy[0].brandName;
            response.id = this.reportResponsePharmacy[0].brandId;
            coor.x = this.reportResponsePharmacy[0].date;
            coor.y = this.reportResponsePharmacy[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponsePharmacy.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponsePharmacy[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponsePharmacy[i].date;
                        coor.y = this.reportResponsePharmacy[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponsePharmacy[i].brandId;
                        response.key = this.reportResponsePharmacy[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponsePharmacy[i].date;
                        coor.y = this.reportResponsePharmacy[i].finalAmount;
                        response.values.push(coor);

                        responseList.push(response);
                        break;
                    }
                }
            }
            //console.log("inside function" + JSON.stringify(responseList));

            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startDate; i <= this.toDate; i = i + 86400000) {
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
        this.nvd36Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd36Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd36Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd36Chart.noData("No Data is Available.");
        else
            this.nvd36Chart.noData("Oops ! Something Went Wrong.");

        this.nvd36Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat("")
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });

        if (this.dropDownIndexForPastDate != 0)
            this.nvd36Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd36Chart.forceY([0]);
        } else {
            this.nvd36Chart.forceY([0, 100]);
        }

        this.nvd36Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd36Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd36Data));

        d3.select('#chart7')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd36Data)         //Populate the <svg> element with chart data...
            .call(this.nvd36Chart);
        nv.utils.windowResize(this.nvd36Chart.update);

    }

    applyNvd3DataProduct(): void {
        console.log("brandName" + JSON.stringify(this.reportResponseProduct))
        let response: DashBoardChartResp = new DashBoardChartResp();
        let responseList: DashBoardChartResp[] = new Array<DashBoardChartResp>();
        let coor: ChartCoordinate = new ChartCoordinate();
        if (this.reportResponseProduct == undefined || this.reportResponseProduct.length == 0) {
            responseList.push(response);
        } else {
            response.key = this.reportResponseProduct[0].brandName;
            response.id = this.reportResponseProduct[0].brandId;
            coor.x = this.reportResponseProduct[0].date;
            coor.y = this.reportResponseProduct[0].finalAmount;
            response.values.push(coor);
            responseList.push(response);

            for (let i = 1; i < this.reportResponseProduct.length; i++) {
                let num: number = responseList.length;
                for (let j = 0; j < num; j++) {
                    if (this.reportResponseProduct[i].brandId == responseList[j].id) {
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseProduct[i].date;
                        coor.y = this.reportResponseProduct[i].finalAmount;
                        responseList[j].values.push(coor);
                        // num = responseList.length;
                        break;
                    }
                    if (j == num - 1) { //full search of responseList
                        response = new DashBoardChartResp();
                        response.id = this.reportResponseProduct[i].brandId;
                        response.key = this.reportResponseProduct[i].brandName;
                        coor = new ChartCoordinate();
                        coor.x = this.reportResponseProduct[i].date;
                        coor.y = this.reportResponseProduct[i].finalAmount;
                        response.values.push(coor);

                        responseList.push(response);
                        break;
                    }
                }
            }
            //console.log("inside function" + JSON.stringify(responseList));

            for (let j = 0; j < responseList.length; j++) {
                for (let i = this.startDate; i <= this.toDate; i = i + 86400000) {
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
        this.nvd37Chart = nv.models.multiBarChart().reduceXTicks(false)
            .margin({ left: 60, bottom: 70, right: 20 }).color(this.colorCodeArray);
        //.color(['#82DFD6', '#fff000']);

        if (responseList.length > 3) {
            this.isMoreItem = true;
            this.nvd37Chart.showLegend(false);
        } else {
            this.isMoreItem = false;
            this.nvd37Chart.showLegend(true);
        }


        if (this.isNetworkErr == false)
            this.nvd37Chart.noData("No Data is Available.");
        else
            this.nvd37Chart.noData("Oops ! Something Went Wrong.");

        this.nvd37Chart.xAxis
            .showMaxMin(false)
            .axisLabel("Date →")
            .tickFormat('')
            .tickFormat(function (d): Object { return d3.time.format('%b %d')(new Date(d)); });


        if (this.dropDownIndexForPastDate != 0)
            this.nvd37Chart.xAxis.rotateLabels(-90);

        if (this.highYAxis != 0) {
            this.nvd37Chart.forceY([0]);
        } else {
            this.nvd37Chart.forceY([0, 100]);
        }

        this.nvd37Chart.yAxis
            .showMaxMin(true)
            .axisLabel("Revenue  →")
            .tickFormat(d3.format('.2s'));

        if (response != undefined && response != null) {
            this.nvd37Data = addGraph().map(function (el, i): boolean {
                el.area = true;
                return el;
            });
        }
        console.log("Nvd31Datarevenue:: " + JSON.stringify(this.nvd37Data));


        d3.select('#chart8')    //Select the <svg> element you want to render the chart in.   
            .datum(this.nvd37Data)         //Populate the <svg> element with chart data...
            .call(this.nvd37Chart);
        nv.utils.windowResize(this.nvd37Chart.update);
    }
}