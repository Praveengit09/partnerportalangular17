import {
    Component,
    ViewEncapsulation,
    ViewChild,
    OnInit,
    Input
  } from "@angular/core";
  import { ChartCoordinate } from '../../../../model/chart/chartCoordinate';
  import { AppConfig } from '../../../../app.config';
  import { GroupedGrowthChart } from '../../../../model/chart/reportchartResp';
  
  declare var d3: any;
  declare var nv: any;
  
  
  @Component({
    selector: "reportgraph",
    templateUrl: "./reportgraph.template.html",
    styleUrls: ["./reportgraph.style.scss"],
    encapsulation: ViewEncapsulation.None
  })
  export class ReportGraphComponent implements OnInit {
  
    @Input("reportResponse") reportResponse: GroupedGrowthChart[] = new Array<GroupedGrowthChart>();
    @Input("graphLabel") graphLabel: string = "Report Graph";
  
    nvd31Chart: any;
    nvd31Data: any;
    toDate: number = new Date().getTime();
    @Input("xAxisStep") xAxisStep = 1000 * 60 * 60 * 24;
    @Input("startingDate") startingDate: number = new Date().getTime() - 1000 * 60 * 60 * 24 * 6;
    highYAxis: number = 0;
    minYaxis: number = Infinity;
  
    maxXaxis: number = 0;
    minXaxis: number = Infinity;
    config: any;
  
    isNetworkErr: boolean;
  
    invalidData: boolean = false;
  
    tableData = [];
    noOfUnits = 0;
  
  
    constructor(config: AppConfig) {
      this.config = config.getConfig();
    }
  
    ngOnInit() {
      this.applyNvd3Data();
    }
  
    applyNvd3Data(): void {
    
      let coor: ChartCoordinate;
      let x_axis: Array<number> = new Array<number>();
      let y_axis: Array<number> = new Array<number>();
      this.tableData = [];
      if (this.reportResponse == undefined || this.reportResponse == null ||
        this.reportResponse[0] == undefined || this.reportResponse[0] == null ||
        this.reportResponse[0].graphs[0] == undefined || this.reportResponse[0].graphs[0] == null ||
        this.reportResponse[0].graphs[0] == undefined || this.reportResponse[0].graphs[0] == null ||
        this.reportResponse[0].graphs[0].plots[0] == undefined || this.reportResponse[0].graphs[0].plots[0] == null ||
        this.reportResponse[0].graphs[0].plots[0] == undefined || this.reportResponse[0].graphs[0].plots[0] == null
      ) {
        this.noOfUnits = 0;
        return;
      }
      this.noOfUnits = this.reportResponse[0].graphs.length;
      let i = 0, j = 0;
      if (isNaN(this.reportResponse[0].graphs[0].plots[0].y)) {
        this.highYAxis = -Infinity;
        this.minYaxis = Infinity;
      } else {
          this.highYAxis = this.reportResponse[0].graphs[0].plots[0].y;
          this.minYaxis = this.reportResponse[0].graphs[0].plots[0].y;
     }
  
      if (isNaN(this.reportResponse[0].graphs[0].plots[0].x)) {
        this.maxXaxis = -Infinity;
        this.minXaxis = Infinity;
      } else {
        this.maxXaxis = this.reportResponse[0].graphs[0].plots[0].x;
        this.minXaxis = this.reportResponse[0].graphs[0].plots[0].x;
      }
      let maxNumOfPlots = 0;
      let tickValues = new Array();
      for (let j = 0; j < this.reportResponse[0].graphs.length; j++) {
        if (this.reportResponse[0].graphs[j].plots.length > maxNumOfPlots)
          maxNumOfPlots = this.reportResponse[0].graphs[j].plots.length;
        this.reportResponse[0].graphs[j].plots.sort(function (a, b) {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        });
        for (let k = 0; k < this.reportResponse[0].graphs[j].plots.length; k++) {
          this.tableData.push({
            x: this.reportResponse[i].graphs[j].plots[k].x,
            y: this.reportResponse[i].graphs[j].plots[k].y,
            unit: this.reportResponse[0].graphs[i].unit
          })
          coor = new ChartCoordinate();
          if (x_axis.indexOf(this.reportResponse[i].graphs[j].plots[k].x) == -1 && y_axis.indexOf(this.reportResponse[i].graphs[j].plots[k].y) == -1) {
            this.reportResponse[i].graphs[j].plots[k].y = Number(this.reportResponse[i].graphs[j].plots[k].y + "");
            this.reportResponse[i].graphs[j].plots[k].x = Number(this.reportResponse[i].graphs[j].plots[k].x + "");
            let date = new Date(this.reportResponse[i].graphs[j].plots[k].x);
            coor.x = date.getTime();
            coor.y = this.reportResponse[i].graphs[j].plots[k].y;
            if (isNaN(this.reportResponse[i].graphs[j].plots[k].y) || isNaN(this.reportResponse[i].graphs[j].plots[k].x)) {
              this.reportResponse[i].graphs[j].plots.splice(k, 1);
              k--;
              continue;
            }
            // this.tableData.push({
            //   x: this.reportResponse[i].graphs[j].plots[k].x,
            //   y: this.reportResponse[i].graphs[j].plots[k].y,
            //   unit: this.reportResponse[0].graphs[i].unit
            // })
            x_axis.push(this.reportResponse[i].graphs[j].plots[k].x);
            y_axis.push(this.reportResponse[i].graphs[j].plots[k].y);
            if (this.highYAxis < +coor.y) {
              this.highYAxis = +coor.y;
            }
            if (this.minYaxis > +coor.y) {
              this.minYaxis = +coor.y;
            }
            if (this.maxXaxis < +coor.x) {
              this.maxXaxis = +coor.x;
            }
            if (this.minXaxis > +coor.x) {
              this.minXaxis = +coor.x;
            }
            
           
            console.log(coor);
            // response.values.push(coor);
          }
         }
      }
      if(this.minYaxis == this.highYAxis){
        this.minYaxis = 0
      }
      if (maxNumOfPlots < 1) {
        this.invalidData = true;
        return;
      }
       if (this.minYaxis == this.highYAxis) {
        this.invalidData = true;
        return;
      }
  
      if (this.highYAxis != -Infinity && this.minYaxis != Infinity &&
        this.maxXaxis != -Infinity && this.minXaxis != Infinity
      ) {
        for (let i = this.startingDate; i <= this.toDate; i = i + this.xAxisStep) {
          tickValues.push(i);
        }
      }
      console.log(tickValues.map(d => new Date(d)), "tickValues")
      console.log("HighYAxis :: " + this.highYAxis);
      this.nvd31Chart = nv.models.lineChart()
        .useInteractiveGuideline(false)
        .margin({ left: 60, bottom: 70, right: 20 })
        .color(['#82DFD6', '#ddd'])
        .showLegend(true)
        .useVoronoi(true)
        .showVoronoi(true)
        .pointShape("circle")
        .clipRadius(6)
  
      console.log(tickValues);
      this.nvd31Chart
        .height(350)
        .forceX([tickValues[0], tickValues[tickValues.length - 1]])
        .xAxis
        .tickValues(tickValues)
        .showMaxMin(false)
        .tickFormat(function (d): Object { return d3.time.format('%d-%b-%Y')(new Date(d)); })
        .axisLabel("Date →")
        .rotateLabels(-90);
      console.log(this.highYAxis);
      let diff: number = Infinity;
      // Find the min diff by comparing difference 
      // of all possible pairs in given array 
      for (let k = 0; k < this.reportResponse[0].graphs.length; k++)
        for (let i = 0; i < this.reportResponse[0].graphs[k].plots.length - 1; i++)
          for (let j = i + 1; j < this.reportResponse[0].graphs[k].plots.length; j++)
            if (Math.abs((this.reportResponse[0].graphs[k].plots[i].y - this.reportResponse[0].graphs[k].plots[j].y)) < diff)
              diff = Math.abs((this.reportResponse[0].graphs[k].plots[i].y - this.reportResponse[0].graphs[k].plots[j].y));
      console.log(diff + "diff");
      tickValues = new Array();
      console.log(this.minYaxis + "minYaxis");
      console.log(maxNumOfPlots + "maxNumOfPlots")
  
      for (let i: number = parseFloat('' + this.minYaxis); (i <= this.highYAxis) || (tickValues.length <= 6); i = parseFloat(i + '') + (parseFloat((this.highYAxis - this.minYaxis) + '') / 6)) {
        tickValues.push(parseFloat(i + ''))
      }
      tickValues.push(
        tickValues[tickValues.length - 1] +
        (this.highYAxis - this.minYaxis) / 6
      );
  
  
  
      console.log(Math.ceil((this.highYAxis / diff)) * diff + diff + "Math.ceil((this.highYAxis/diff))*diff+diff");
  
      let max = tickValues[tickValues.length - 1];
  
      console.log(this.minYaxis + " minYaxis")
      console.log(max + " max")
  
  
      this.nvd31Chart
        .forceY([this.minYaxis, max])
        .yAxis
        .domain([this.minYaxis, max])
        .showMaxMin(false)
        .tickValues(tickValues)
        .tickFormat(d3.format(".2f"));
      console.log(tickValues);
      let LineColor = ['#ff7f0e', '#2ca02c', '#7777ff'];
 
      if (this.reportResponse[0] != undefined && this.reportResponse[0] != null) {
        this.nvd31Data = new Array();
        for (let i = 0; i < this.reportResponse[0].graphs.length; i++) {
          this.nvd31Data.push(
            {
              values: this.reportResponse[0].graphs[i].plots,      //values - represents the array of {x,y} data points
              key: this.reportResponse[0].graphs[i].unit, //key  - the name of the series.
              color: LineColor[i],
              area: false
            }
          )
        }
      }
      let self = this;
      nv.utils.windowResize(function () { self.nvd31Chart.update() });
  
      // console.log("Nvd31Data:: " + JSON.stringify(this.nvd31Data));
    }
  }