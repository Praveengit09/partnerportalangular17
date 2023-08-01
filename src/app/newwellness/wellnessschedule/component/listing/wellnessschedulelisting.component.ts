import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Router } from '@angular/router';
import { CommonUtil } from '../../../..//base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { WellnessScheduleService } from '../../wellnessSchedule.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { InvestigationDayTime } from '../../../../model/superadmin/investigationDayTime';

@Component({
  selector: 'scheduleslistingofwellnesscomponent',
  templateUrl: './wellnessschedulelisting.template.html',
  styleUrls: ['./wellnessschedulelisting.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class WellnessSchedulesListingComponent implements OnInit {

  pocId: number;
  wellnessScheduleList: Array<InvestigationRequest> = new Array<InvestigationRequest>();//change acc to your requirement

  constructor(config: AppConfig,
    private wellnessSchService: WellnessScheduleService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.pocId = this.auth.selectedPocDetails.pocId;
  }

  ngOnInit() {
    this.getWellnessScheduleList();
  }

  getWellnessScheduleList() {
    this.spinnerService.start();
    this.wellnessSchService.getWellnessScheduleList(this.pocId).then(respList => {
      this.spinnerService.stop();
      this.wellnessScheduleList = respList;
    });
  }

  onAddSchedule(): void {
    window.localStorage.removeItem('selectedInvestigationDetailsList');
    window.localStorage.removeItem('investigationRequest');
    this.wellnessSchService.editWellnessSchedule = new InvestigationDayTime();
    this.wellnessSchService.isScheduleEdit = false;
    this.router.navigate(['/app/wellness/wellness_schedule/createscheduleforwellness/']);
  }

  onManage(index) {
    window.localStorage.removeItem('selectedInvestigationDetailsList');
    window.localStorage.removeItem('investigationRequest');
    this.wellnessSchService.editWellnessSchedule = new InvestigationDayTime();//change acc to your requirement
    this.wellnessSchService.isScheduleEdit = false;
    var obj = this.wellnessScheduleList[index];
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('investigationRequest', cryptoUtil.encryptData(JSON.stringify(obj)));
    this.router.navigate(['/app/wellness/wellness_schedule/createscheduleforwellness/']);
  }


  extractItem(item): string {

    let length = item.serviceList.length;
    let arr: string = "";
    if (length > 5) {
      for (let i = 0; i < 5; i++) {
        if (i < 4)
          arr = arr + item.serviceList[i].serviceName + " , ";
        else
          arr = arr + item.serviceList[i].serviceName;
      }
      arr = arr + "....";
    } else {
      for (let i = 0; i < length; i++) {
        if (i < length - 1)
          arr = arr + item.serviceList[i].serviceName + " , ";
        else
          arr = arr + item.serviceList[i].serviceName;
      }
    }
    return arr;
  }



}