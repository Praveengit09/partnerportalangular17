import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonUtil } from '../../../base/util/common-util';

@Component({
  selector: 'hs-datepicker',
  templateUrl: './monthpicker.template.html',
  styleUrls: ['./monthpicker.style.scss']
})
export class MonthpickerComponent implements OnInit, OnChanges {
  month = new Array();
  year = new Array();
  mon: any;
  yer: any;
  date: any;
  monthAndyear: any;
  resultmonthandyear: any;
  isIncorrectSelected: boolean = true;
  isTouched: boolean = false;
  numericSelectedMonth: number;
  returnedDate: Date = new Date();
  isMonthSelected: boolean = false;
  isYearSelected: boolean = false;
  monthDropDownIndex: any = "Select a Month";
  yearDropDownIndex: any = "Select a Year";

  @Input() defautDate: number;
  @Input() isMatEnable: boolean = false;
  @Input() placeholder: string;
  @Output() onDateSubmit = new EventEmitter<Date>();

  constructor(private commonUtil: CommonUtil) {
    this.resultmonthandyear = "";
    this.mon = "";
    this.yer = "";
    let self = this;
    $(document).ready(() => {
      $("#myModal89").on("hide.bs.modal", function () {
        self.clearError();
      });
    })
  }
  ngOnInit() {
    let yearNow = new Date().getFullYear();
    this.month = ["Select a Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.year = ["Select a Year",];
    for (var i = 0; i < 100; i++) {
      this.year.push(yearNow + i);
    }
    if (this.defautDate > 0) {
      this.isMonthSelected = true;
      this.isYearSelected = true;
      let inputDate: Date = new Date(this.defautDate);
      this.resultmonthandyear = this.month[inputDate.getMonth() + 1] + " " + inputDate.getFullYear();
      this.monthDropDownIndex = this.mon = this.month[inputDate.getMonth() + 1];
      this.yearDropDownIndex = this.yer = inputDate.getFullYear();
    } else {
      this.monthDropDownIndex = this.mon = this.month[0];
      this.yearDropDownIndex = this.yer = this.year[0];
      this.resultmonthandyear = "";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defautDate'] && this.defautDate > 0) {
      let inputDate: Date = new Date(this.defautDate);
      this.resultmonthandyear = this.month[inputDate.getMonth() + 1] + " " + inputDate.getFullYear();
    } else {
      this.resetDateField();
    }
  }
  clearError(event?) {
    if (event) {
      event.stopPropagation();
      $(document).ready(() => {
        (<any>$("#myModal89")).modal("hide");
      })
    }
    this.isMonthSelected = true;
    this.isYearSelected = true;
    this.yearDropDownIndex = "Select a Year";
    this.monthDropDownIndex = "Select a Month";
    if (this.defautDate && this.defautDate > 0) {
      this.ngOnInit();
    }
  }

  ClickTextbox() {
    (<any>$("#myModal89")).modal('show');
  }

  monthandyear() {
    this.resultmonthandyear = (this.mon + " " + this.yer);
    // this.isMonthSelected = true;
    // this.isYearSelected = true;
    this.isIncorrectSelected = true;
    if (this.mon == "" || this.mon == undefined || this.mon == this.month[0]) {
      this.resultmonthandyear = "";
      this.isMonthSelected = false;
      this.isTouched = true;
      console.log('inavlid Month');
      return;
    }
    if (this.yer == "" || this.yer == undefined || this.yer == this.year[0]) {
      this.resultmonthandyear = "";
      this.isTouched = true;
      this.isYearSelected = false;
      console.log('inavlid Year');
      return;
    }
    this.returnedDate = new Date(Number(this.yer), this.numericSelectedMonth, 1, 0, 0, 0, 0);

    if (this.returnedDate < new Date()) {
      this.resultmonthandyear = "";
      this.isIncorrectSelected = false;
      return;
    }
    (<any>$("#myModal89")).modal('hide');
    console.log("Year from HS table::" + this.yer + " month::" + this.numericSelectedMonth);

    console.log("Date from HS-Date Picker::" + this.returnedDate);

    // going back to 5hrs 30min & 1sec from IST (that will take last date of previous month)
    this.returnedDate = new Date(this.commonUtil.convertDateToTimestamp(this.returnedDate) - 19801000);

    this.onDateSubmit.emit(this.returnedDate);
  }

  monthChange(value) {
    this.mon = value;
    this.isMonthSelected = true;
    if (value == "Select a Month") {
      this.isMonthSelected = false;
      this.numericSelectedMonth = 0;
      this.mon = "";
    } else if (value == "January") {
      this.numericSelectedMonth = 1;
    } else if (value == "February") {
      this.numericSelectedMonth = 2;
    } else if (value == "March") {
      this.numericSelectedMonth = 3;
    } else if (value == "April") {
      this.numericSelectedMonth = 4;
    } else if (value == "May") {
      this.numericSelectedMonth = 5;
    } else if (value == "June") {
      this.numericSelectedMonth = 6;
    } else if (value == "July") {
      this.numericSelectedMonth = 7;
    } else if (value == "August") {
      this.numericSelectedMonth = 8;
    } else if (value == "September") {
      this.numericSelectedMonth = 9;
    } else if (value == "October") {
      this.numericSelectedMonth = 10;
    } else if (value == "November") {
      this.numericSelectedMonth = 11;
    } else if (value == "December") {
      this.numericSelectedMonth = 12;
    }
  }
  yearChange(value) {
    this.yer = value;
    this.isYearSelected = true;
    if (value == "Select a Year") {
      this.isYearSelected = false;
      this.yer = "";
    }
  }

  resetDateField() {
    this.resultmonthandyear = "Choose Date";
    this.monthDropDownIndex = "Select a Month";
    this.yearDropDownIndex = "Select a Year";
    this.mon = "";
    this.yer = "";
  }

}