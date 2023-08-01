import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';

import * as moment from 'moment';
import { LocaleService } from 'ngx-daterangepicker-material';
import { DateUtil } from '../../../../base/util/dateutil';

@Component({
  selector: 'businessadmindashboard',
  templateUrl: './dashboard.template.html',
  styleUrls: ['./dashboard.style.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LocaleService]
})
export class BusinessAdminDashboardComponent implements OnInit {
  config: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  hasBusinessAdminRole: boolean;
  nvd31Data: any;

  moment = moment;
  dropDownIndexForPastDate: number;
  ranges: any;
  calendarPlaceholder: string;
  selectedRange: any = new Object;
  selectedDates: any = new Object;
  getMinDate(): any { return moment().subtract(1, 'years').add(1, 'days'); }
  getMaxDate(): any { return moment(); }


  constructor(config: AppConfig, private authService: AuthService) {
    this.config = config.getConfig();
    this.hasBusinessAdminRole = authService.userAuth.hasBusinessAdminRole;

    this.ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'Last Three Month': [moment().subtract(3, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    this.calendarPlaceholder = 'All';
  }

  ngOnInit(): void {
    let toDay = new Date()
    let dateOffset = (24 * 60 * 60 * 1000) * 7;
    let startTime = DateUtil.removeTimeInMillis(new Date(toDay.getTime() - dateOffset).getTime());
    this.selectedRange.startDate = new Date(startTime);
    this.selectedRange.endDate = toDay;
    this.dropDownIndexForPastDate = 1;
  }

  ngModelChange($event) {
    const { startDate, endDate } = this.selectedRange;
    let date1 = new Date(startDate),
      date2 = new Date(endDate);
    this.nvd31Data = undefined;
    let request: ReportRequest = new ReportRequest();
    request.fromDate = DateUtil.removeTimeInMillis(date1.getTime());
    request.toDate = date2.getTime();
    request.pocIds = new Array<number>();
    request.pocIds = this.authService.loginResponse.employee.pocIdList;
    request.perPOC = true;
    this.selectedDates = { date1, date2 }
    console.log("Selected dates in dashboard are >>", this.selectedDates);
  }

  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
  }


}
