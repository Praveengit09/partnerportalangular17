import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { Config } from '../../../base/config';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';

// const moment = _rollupMoment || _moment;

export const MMDDYYYY = {
  parse: {
    dateInput: 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY'
  }
};


@Component({
  selector: 'datetime',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MMDDYYYY },
  ],
  encapsulation: ViewEncapsulation.Emulated
})

export class HSDatePickerComponent implements OnInit, OnDestroy {
  @Input('datepicker') public datepickerOpts;
  @Input('timepicker') public timepicker: boolean;
  @Input('placeholder') public placeholder: string = "";
  @Input('readonly') public readonly: boolean = false;

  @Output('dateChange') public dateChange: EventEmitter<Date> = new EventEmitter();

  date = new Date;

  selectedDate: Date = new Date();
  time_To: string;
  toMinutes: number;
  toTimeTimeStamp: number;
  TIME_CONSTANT: number = -Config.portal.timezoneDifferential;


  @Input()
  get value(): Date {
    return new Date(this.date)
  };
  set value(val: Date) {
    if (this.timepicker == false || this.datepickerOpts == true) {
      this.date = val;
      this.valueChange.emit(val);
    } else if (this.timepicker == true || this.datepickerOpts == false) {
      this.time_To = val.getHours() + ":" + val.getMinutes();
      this.valueChange.emit(val);
    }
  }
  @Output() public valueChange: EventEmitter<Date> = new EventEmitter();

  startDate: Date;
  endDate: Date;
  autoclose: boolean;
  todayBtn: string;
  icon: string;
  todayHighlight: boolean;
  assumeNearbyYear: boolean;
  format: string;

  constructor() {

  }

  ngOnInit() {
    if (this.datepickerOpts == false) {
      this.timepicker = true;
    }
    if (this.datepickerOpts.startDate != null ||
      this.datepickerOpts.startDate != undefined) {
      this.startDate = this.datepickerOpts.startDate;
    } else {
      this.startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
    }
    if (this.datepickerOpts.endDate != null ||
      this.datepickerOpts.endDate != undefined) {
      this.endDate = this.datepickerOpts.endDate;
    } else {
      this.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 20));
    }
    if (this.placeholder == "") {
      this.placeholder = (this.timepicker) ? "Select Time" : "Select Date";
    }
    if (this.date != null && this.date != undefined) {
      this.placeholder = "";
    }

  }
  setTodayDate() {
    if (this.timepicker == false) {
      this.date = new Date();
      this.valueChange.emit(this.value);
      this.dateChange.emit(this.value);
    } else {
      let val = new Date();
      this.time_To = val.getHours() + ":" + val.getMinutes();
      this.timeValidation();
    }
    // this.placeholder = "";
  }

  ngOnDestroy(): void {
  }
  validateDate(e) {
    console.log(e);
    let ignoreKeyCodeList = [8, 9, 13, 16, 17, 18, 20, 27, 37, 38, 39, 40, 93, 110];
    if (ignoreKeyCodeList.indexOf(e.keyCode) != -1) {
      // return;
    }
    if (('' + e.target.value).length >= 10) {
      e.preventDefault();
      return false;
    }
    if (e.keyCode == 191 || e.keyCode == 111) {
      // return;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
  }
  dateInput() {
    if (this.value.getTime() == 0) {
      // this.value=new Date();
      this.date = undefined;
      this.placeholder = (this.timepicker) ? "Select Time" : "Select Date";
    }
    if (this.date != undefined) {
      this.placeholder = "";
    }
    if (this.value.getTime() < this.startDate.getTime()) {
      this.value = new Date(this.startDate.getTime());
    }
    if (this.value.getTime() > this.endDate.getTime()) {
      this.value = new Date(this.endDate.getTime());
    }
    this.valueChange.emit(this.value);
    this.dateChange.emit(this.value);
  }

  checkDateValidation(e) {
    let date: string = '' + e.target.value;
    console.log(date);
    let d: Array<string> = new Array<string>();
    d = date.split("/");
    if (d.length > 1 && d[0] && (isNaN(+d[0]) || +d[0] > 31)) {
      d[0] = "31";
    }
    if (d.length == 1) {
      e.preventDefault();
      return;
    }
    if (d.length > 2 && d[1] && (isNaN(+d[1]) || +d[1] > 12 || d[1].length > 2)) {
      d[1] = "12";
    }
    if (d.length == 2) {
      e.preventDefault();
      return;
    }
    if (d.length > 3 && d[1] && (isNaN(+d[2]) || +d[2] > this.endDate.getFullYear())) {
      d[2] = "" + this.endDate.getFullYear();
    }
    if (d.length > 3) {
      e.preventDefault();
      return;
    }
    this.date = new Date(+d[2], +d[1] - 1, +d[0]);
  }
  getTime12Hr(): string {

    let fullTime = this.time_To + "";
    let time = fullTime.split(':');
    let hr: string = '' + parseInt(time[0]);
    let amPm: string = 'AM';
    if (isNaN(+hr) || +hr <= 0) {
      // hr='12';
      hr = '0';
    }
    if (+hr >= 12) {
      +hr != 12 ? hr = (+hr - 12) + '' : '';
      amPm = 'PM';
    }
    if (+hr == 0) {
      hr = '12';
    }
    if (hr.length == 1) {
      hr = '0' + hr;
    }
    let min: string = '' + parseInt(time[1]);
    if (isNaN(+min) || +min <= 0) {
      min = '00';
    }
    if (+min > 60) {
      min = '60';
    }
    if (min.length == 1) {
      min = '0' + min
    }

    return hr + ':' + min + ' ' + amPm;
  }

  timeValidation() {
    // console.log("To time-->" + this.toTime.getTime());
    // this.locToTime = this.toTime.getTime();

    console.log("to time-->" + this.time_To);
    var fullTime = this.time_To + "";
    var time = fullTime.split(':');
    var hr = parseInt(time[0]);
    var min = parseInt(time[1]);
    console.log("hr & min --->" + hr + " " + min);
    this.toMinutes = (((hr * 60) + min));
    this.toTimeTimeStamp = ((this.toMinutes * 60) * 1000) + this.TIME_CONSTANT;
    console.log("to Time stamp-->" + this.toTimeTimeStamp);
    this.date = new Date(1970, 0, 1, hr, min);
    this.valueChange.emit(this.date);
  }

}