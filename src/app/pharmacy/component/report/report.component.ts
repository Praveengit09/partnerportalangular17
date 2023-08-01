import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { PharmaReport } from './../../../model/pharmacy/pharmareport';
import { PharmacyService } from "../../pharmacy.service";
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';

@Component({
  selector: 'pharmacyReport',
  templateUrl: './report.template.html',
  styleUrls: ['./report.style.scss'],
  providers: [PharmacyService],
  encapsulation: ViewEncapsulation.Emulated
})

export class PharmacyReportComponent implements OnInit {
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  todaysDate: number;
  dataMsg:string = ' ';
  config: any;
  month: any;
  year: any;
  startDate: Date;
  endDate: Date;
  pharmacyReportList: PharmaReport[] = new Array<PharmaReport>();
  isShow: boolean = true;
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    startDate: new Date(),
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

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
      display: 'Amount',
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
    private pharmacyService: PharmacyService, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    // let dateOffset = (24*60*60*1000) * 30;
    //  this.startDate = new Date();
    //  this.startDate.setTime(this.startDate.getTime() - dateOffset);
    //  this.endDate = new Date();
    //  this.getpharmacyReportForPoc();
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

  getpharmacyReportForPoc(): void {

    this.isError = false;
    this.showMessage = false;
    this.message = new Array();
    this.errorMessage = new Array();

    this.todaysDate = new Date().getTime();
    console.log("todaysdate:" + this.todaysDate);
    if (this.endDate == null && this.startDate == null) {
      this.errorMessage = new Array();
      this.isDate = false;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select Date";
    }
    else if (this.endDate == null) {
      this.errorMessage = new Array();
      this.isDate = false;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select End Date";
    }
    else if (this.startDate == null) {
      this.errorMessage = new Array();
      this.isDate = false;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "Please Select Start Date";
    }
    // else if (this.endDate.getTime() >= this.startDate.getTime()) {
    else {
      console.log("correct");
      this.spinnerService.start();
      this.dataMsg = 'Loading....';
      this.pharmacyService.getPharmacyReport(this.startDate.getTime(), this.endDate.getTime()).then(pharmacyList => {
        this.spinnerService.stop();
        this.pharmacyReportList = pharmacyList;
        if (pharmacyList.length > 0) {
          this.isShow = true;
          this.total = this.pharmacyReportList.length;
          console.log("heeeeeeeeeeeeeeeeelo:" + JSON.stringify(this.pharmacyReportList));
        }
        else {
          this.isShow = false;
          this.isError = true;
          this.showMessage = true;
          this.message = new Array();
          this.errorMessage = new Array();
          this.errorMessage[0] = this.dataMsg = "No Report Found";
          this.total = this.pharmacyReportList.length;
          console.log("heeeeeeeeeeeeeeeeelo:" + JSON.stringify(this.pharmacyReportList));

        }
      }
      );
    }
    // else{

    // }
    // else if (this.startDate.getTime() > this.todaysDate) {
    //   //this.errorMessage[0]= " ";
    //   console.log("llllllllllllllllllllllllllllllllllllllllllllllllllllllll");
    //   this.message = new Array();
    //   this.message[0] = "start date must be lesser or equal to todays date";
    // }
    // else if (this.endDate.getTime() < this.startDate.getTime() || this.endDate.getTime() > this.todaysDate) {
    //   console.log("iffffffffffffff");
    //   //this.errorMessage[0] = "";
    //   this.isDate = true;
    //   this.isDisplay = true;
    //   this.message = new Array();
    //   this.message[0] = "end date must be greater or equal to start date and less than or equal to todays date";
    // }
    // else {
    //   //this.errorMessage[0]= " ";
    //   console.log("llllllllllllllllllllllllllllllllllllllllllllllllllllllll");

    //   this.isDate = true;
    //   this.isDisplay = true;
    //   this.message = new Array();
    //   this.errorMessage=new Array();
    //   this.message[0] = "End Date Must Be Lesser Or Equal To Start Date";
    // }
  }

}
