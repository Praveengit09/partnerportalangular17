import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';



@Component({
  selector: 'wellnessschedule',
  templateUrl: './wellnessschedule.template.html',
  styleUrls: ['./wellnessschedule.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class WellnessScheduleComponent implements OnInit {
  date3: Date = new Date(2016, 5, 10);
  fromDate: Date = new Date();
  toDate: Date = new Date();
  fromTime: Date = new Date(1970, 0, 1);
  toTime: Date = new Date(1970, 0, 1);

  timeInterval: any;
  minutes: any;
  datepickerOpts = {
    startDate: new Date(2016, 5, 10),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'D, d MM yyyy'
  }


  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
  }

  ngOnInit() {

  }

  onAddSchedule(): void {
    this.router.navigate(['/app/master/poc/manage/createnewwellnessschedule/']);
  }


  onPrecautions(): void {
    this.router.navigate(['/app/master/poc/manage/precautions/']);
  }

}