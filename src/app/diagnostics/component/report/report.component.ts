import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { DiagnoReport } from './../../../model/diagnostics/diagnoreport';
import { DiagnosticsService } from "../../diagnostics.service";
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';

@Component({
  selector: 'diagnosticsReport',
  templateUrl: './report.template.html',
  styleUrls: ['./report.style.scss'],
  providers: [DiagnosticsService],
  encapsulation: ViewEncapsulation.Emulated
})
export class DiagnosticsReportComponent {
  config: any;
  month: any;
  year: any;
  dataMsg:string = ' ';
  startDate: Date;
  endDate: Date;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    startDate: new Date(this.startDate),
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };
  diagnosticsReportList: DiagnoReport[] = new Array<DiagnoReport>();

  columns: any[] = [
    {
      display: 'Date',
      variable: 'recorddate',
      filter: 'date',
      sort: true
    },
    {
      display: 'Total',
      variable: 'totalrecords',
      filter: 'text',
      sort: true
    },
    {
      display: 'Visited',
      variable: 'visited',
      filter: 'text',
      sort: true
    },
    {
      display: 'Completed',
      variable: 'completed',
      filter: 'text',
      sort: true
    },
    {
      display: 'Partial',
      variable: 'partial',
      filter: 'text',
      sort: true
    },
    {
      display: 'Paid',
      variable: 'paid',
      filter: 'text',
      sort: true
    },
    {
      display: 'New',
      variable: 'newrecord',
      filter: 'text',
      sort: true
    },
    {
      display: 'Amount (₹)',
      variable: 'amount',
      filter: 'number',
      sort: true
    }
  ];
  sorting: any = {
    column: 'recorddate',
    descending: true
  };

  perPage: number = 10;
  total: number = 0;

  constructor(config: AppConfig,
    private diagnosticsService: DiagnosticsService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }



  ngOnInit(): void {
    //let dateOffset = (24*60*60*1000) * 30;
    //this.startDate = new Date();
    // this.startDate.setTime(this.startDate.getTime() - dateOffset);
    //this.endDate = new Date();
    // this.getdiagnosticsReportForPoc();
  }
  startDateChoosen($event): void {
    // alert("Start date is choosen");
    // alert($event);
    this.datepickerOptEnd = {
      startDate: new Date(this.startDate),
      endDate: new Date(),
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
      assumeNearbyYear: true,
      format: 'dd/mm/yyyy'
    };
  }

  onSubmit()
  {
    this.diagnosticsReportList = new Array<DiagnoReport>();
    console.log('daata'+JSON.stringify(this.diagnosticsReportList));
    this.getdiagnosticsReportForPoc();
  }
  getdiagnosticsReportForPoc(): void {
    if (this.startDate != null && this.startDate != undefined && this.endDate != null && this.endDate != undefined) {
      this.spinnerService.start();
      this.isError = false;
      this.showMessage = false;
      this.dataMsg = 'Loading....';
      this.diagnosticsService.getDiagnosticsReport(this.startDate.getTime(), this.endDate.getTime()).then(diagnosticsList => {
        this.spinnerService.stop();
        if(diagnosticsList.length > 0){
          console.log("================>>>" + JSON.stringify(diagnosticsList))
          this.diagnosticsReportList = diagnosticsList;
          console.log("heeeeeeeeeeeeeeeeelo:" + JSON.stringify(this.diagnosticsReportList));
          this.total = this.diagnosticsReportList.length;
        }
        else
        {
          this.dataMsg = 'No Data Found';
        }
      
      });
    }
    else {
      console.log('else');
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Select the start date and end date first";
      this.showMessage = true;
    }
  }
}
