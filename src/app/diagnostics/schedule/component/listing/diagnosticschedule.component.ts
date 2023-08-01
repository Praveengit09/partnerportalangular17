import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvestigationRequest } from '../../../../model/superadmin/investigationRequest';
import { AppConfig } from '../../../../app.config';
import { DiagnosticScheduleService } from '../../schedule.service';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { InvestigationDayTime } from '../../../../model/superadmin/investigationDayTime';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { PocCollectionCharges } from '../../../../model/common/poccollectioncharges';
import { Config } from '../../../../base/config';



@Component({
  selector: 'diagnosticschedule',
  templateUrl: './diagnosticschedule.template.html',
  styleUrls: ['./diagnosticschedule.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class DiagnosticSchedulesComponent implements OnInit {
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
  //pocDetails: any;
  pocId: any;
  diagnosticScheduleList: Array<InvestigationRequest> = new Array<InvestigationRequest>();
  selectedScheduleTypeList: InvestigationRequest[] = [];
  scheduleType: number = 1;
  homeCollectionScheduleExists: boolean = false;
  selectedCity: LocationModeResponse;
  type: number = PocCollectionCharges.DIAGNOSTICS;
  appId: number;
  POCSpecificBrandId: number;
  isCollectionPriceClick: boolean = false;

  constructor(config: AppConfig,
    private diagSchService: DiagnosticScheduleService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.pocId = this.auth.selectedPocDetails.pocId;
    this.POCSpecificBrandId = this.auth.selectedPocDetails.brandId;
    if (Config.portal)
      this.appId = Config.portal.appId;
  }

  ngOnInit() {
    this.getDiagnosticScheduleList();
    $(":radio").on('click', function () {
      if ($(".schedule_selection .col-md-6").hasClass("checked")) {
        $(".schedule_selection .col-md-6").removeClass("checked");
        $(this).parent().addClass("checked");
      }
      else $(this).parent().addClass("checked");
    });
    // this.selectedCity = this.diagSchService.selectedCity;
  }

  onAddCollectionPrice() {
    this.isCollectionPriceClick = true;
    (<any>$)("#samplecollModal").modal("show");
  }

  onAddSchedule(): void {
    window.localStorage.removeItem('selectedInvestigationDetailsList');
    window.localStorage.removeItem('investigationRequest');
    this.checkHomeCollectionSchedule();
    this.diagSchService.selectedAreaList = [];
    this.diagSchService.editDiagnosticSchedule = new InvestigationDayTime();
    this.diagSchService.isScheduleEdit = false;
    this.diagSchService.selectedCity = new LocationModeResponse();
    this.diagSchService.allAreasofCity = [];
    this.router.navigate(['/app/diagnostics/schedule/createnewdiagnosticschedule/']);
  }

  getDiagnosticScheduleList() {
    this.spinnerService.start();
    this.diagSchService.getdiagnosticSchedulelist(this.pocId).then(respList => {
      this.spinnerService.stop();
      this.diagnosticScheduleList = respList;
      this.diagnosticScheduleList.forEach(schedule => {
        if (schedule.scheduleType == this.scheduleType) {
          this.selectedScheduleTypeList.push(schedule);
        }
      });
    });
  }


  onPrecautions(index): void {
    window.localStorage.removeItem('selectedInvestigationDetailsList');
    window.localStorage.removeItem('investigationRequest');
    var obj = this.selectedScheduleTypeList[index];
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('investigationRequest', cryptoUtil.encryptData(JSON.stringify(obj)));
    this.router.navigate(['/app/diagnostics/schedule/precautions/']);
  }

  onManage(index) {
    window.localStorage.removeItem('selectedInvestigationDetailsList');
    window.localStorage.removeItem('investigationRequest');
    this.diagSchService.selectedAreaList = [];
    this.diagSchService.editDiagnosticSchedule = new InvestigationDayTime();
    this.diagSchService.isScheduleEdit = false;
    this.diagSchService.selectedCity = new LocationModeResponse();
    this.diagSchService.allAreasofCity = [];
    // this.checkHomeCollectionSchedule();
    var obj = this.selectedScheduleTypeList[index];
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('investigationRequest', cryptoUtil.encryptData(JSON.stringify(obj)));
    this.router.navigate(['/app/diagnostics/schedule/createnewdiagnosticschedule/']);
  }

  private checkHomeCollectionSchedule() {
    window.localStorage.removeItem('homeCollectionScheduleExists');
    this.diagnosticScheduleList.forEach(item => {
      if (item.scheduleType == 1) {
        this.homeCollectionScheduleExists = true;
      }
    });
    window.localStorage.setItem('homeCollectionScheduleExists', this.homeCollectionScheduleExists.toString());
  }

  checkedScheduleType(type: number) {
    this.scheduleType = type;
    console.log("ScheduleType1: " + this.scheduleType);
    this.selectedScheduleTypeList = [];
    this.diagnosticScheduleList.forEach(schedule => {
      if (schedule.scheduleType == this.scheduleType) {
        this.selectedScheduleTypeList.push(schedule);
      }
    });
  }

  extractItem(item): string {
    //console.log("item in extractItem--->" + JSON.stringify(item));
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
    //console.log("arr in extractItem-->" + arr);
    return arr;
  }

}