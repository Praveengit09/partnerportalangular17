import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { OpsDashboardConstants } from './opsdashboardconstants';
import { BrandDetailsWithReferralCode } from '../model/brand/brandDetailsWithReferralCode';
import { SuperAdminService } from '../superadmin/superadmin.service';
import { Config } from '../base/config';
import { DashboardViewVo } from '../model/common/dashboardviewvo';
import { OpsService } from './ops.service';
import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { keys } from 'd3';
import { CentralDashboardTotalCountView } from '../model/common/centraldashboardtotalcountview';
import { TotalCentralOrdersAndPaidCount } from '../model/common/totalcentralordersandpaidcount';
import { TurnAroundTimeVo } from '../model/common/turnaroundtimevo';


@Component({
  selector: 'ops',
  templateUrl: './ops.template.html',
  styleUrls: ['./ops.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class OpsComponent implements OnInit {
  startDate: Date;
  endDate: Date;
  endingDate: Date;
  errorMessage: Array<string>;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  dataMsg = '';
  isError: boolean;

  checkEndDate: boolean = false;
  brandList: BrandDetailsWithReferralCode[] = new Array<BrandDetailsWithReferralCode>();
  checkFiled: number = 0
  dropDownIndex: number = -1;
  brandName: string;
  brandId: number = 0;
  customeronboardingList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  diagnosticOrderManagementList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  doctorManagementList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  futureDate = new Date().setMonth(new Date().getMonth() + 1);
  pastDate = new Date().setMonth(new Date().getMonth() - 3);
  opsDashboardData: DashboardViewVo[] = new Array<DashboardViewVo>();
  totalsummaryData: any;
  turnAroundTimelist: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  opsDashboardDataList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  centralOrderTotalCountList: TotalCentralOrdersAndPaidCount = new TotalCentralOrdersAndPaidCount();
  datepickerOpts = {
    startDate: new Date(this.pastDate),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    startDate: new Date(this.pastDate),
    endDate: new Date(this.futureDate),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',
  };
  constructor(private superAdminService: SuperAdminService,
    private opsService: OpsService, private spinner: SpinnerService) {

  }
  ngOnInit() {
    this.startDate = this.endingDate = new Date();
    if (Config.portal && Config.portal.customizations && Config.portal.customizations.allBrandsAccess) {
      this.getBrandList();
    } else {
      this.brandId = Config.portal.appId;
    }
    this.onSubmit();
  }

  getBrandList() {
    this.superAdminService.getBrandDetails().then(brandList => {
      this.brandList = brandList;
    });
  }

  onBrandChange(index) {
    if (index >= 0) {
      this.brandId = this.brandList[index].brandId;
      this.brandName = this.brandList[index].brandName;
    }
    else {
      this.brandId = 0;
    }
    this.onSubmit();
  }


  async onSubmit() {
    this.message = new Array<string>()
    this.isDate = false;
    this.isDisplay = false;
    this.message[0] = '';
    this.checkFiled = 0;
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
      this.startDate.getDate(), 0, 0, 0);
    this.endingDate = new Date(this.endingDate.setHours(23, 0, 0, 0));
    console.log('datecheck' + this.startDate + '###' + this.endingDate)
    if (this.startDate.getTime() > this.endingDate.getTime()) {
      this.message = new Array<string>()
      this.isDate = true;
      this.isDisplay = true;
      this.message[0] = 'Start Date Must Be Less Than End Date';
      return;
    }
    this.spinner.start();
    await this.getOnboardingDetails();
    await this.getDoctorOrdersDetails();
    await this.getDiagnosticOrdersDetails();
    await this.getTatDetails();
    this.spinner.stop();

  }

  async getOpsDashboardData(checkFiled) {
    // this.opsDashboardDataList = new Array<CentralDashboardTotalCountView>();
    this.opsDashboardDataList = new CentralDashboardTotalCountView();
    this.opsDashboardDataList.listCentralDashboardViewVo = new Array<DashboardViewVo>();
    await this.opsService.getOpsDashboardData(checkFiled, this.brandId, this.startDate.getTime(), this.endingDate.getTime()).then(response => {
      this.opsDashboardData = new Array<DashboardViewVo>();
      this.opsDashboardDataList = response;
      if (JSON.stringify(this.opsDashboardDataList) != '{}' && this.opsDashboardDataList.listCentralDashboardViewVo != null && this.opsDashboardDataList.listCentralDashboardViewVo != undefined) {
        this.opsDashboardData = (this.opsDashboardDataList.listCentralDashboardViewVo);
        this.opsDashboardData.forEach((element, i) => {
          this.opsDashboardData[i].createdTime = this.convertDate(element.createdTime);
        });
        this.opsDashboardData = this.removeDuplicates(this.opsDashboardData);
        this.opsDashboardDataList.listCentralDashboardViewVo = this.opsDashboardData;
      }
    });
  }

  async getOnboardingDetails() {
    console.log('@@@@@' + 'onboarding');
    setTimeout(() => {
      this.customeronboardingList = new CentralDashboardTotalCountView();
    }, 5);

    await this.getOpsDashboardData(OpsDashboardConstants.CENTRALONBORDING);
    this.customeronboardingList = this.opsDashboardDataList;
  }

  async getDoctorOrdersDetails() {
    console.log('@@@@@' + 'doctor');
    this.doctorManagementList = new CentralDashboardTotalCountView();
    await this.getOpsDashboardData(OpsDashboardConstants.CENTRALDOCTORBOOKING);
    this.doctorManagementList = this.opsDashboardDataList;
  }

  async getDiagnosticOrdersDetails() {
    console.log('@@@@@' + 'diagnostic');
    this.diagnosticOrderManagementList = new CentralDashboardTotalCountView();
    await this.getOpsDashboardData(OpsDashboardConstants.CENTRALDIAGNOSTICBOOKING);
    this.diagnosticOrderManagementList = this.opsDashboardDataList;

  }

  async getTatDetails() {
    this.turnAroundTimelist = new CentralDashboardTotalCountView();
    this.turnAroundTimelist.listOfTurnAroundTime = new Array<TurnAroundTimeVo>();
    await this.opsService.getTurnAroundTime(this.brandId, this.startDate.getTime(), this.endingDate.getTime()).then(response => {
      var turnAroundTimedata = new Array<TurnAroundTimeVo>();
      this.turnAroundTimelist = response;
      if (JSON.stringify(this.turnAroundTimelist) != '{}' && this.turnAroundTimelist.listOfTurnAroundTime != null && this.turnAroundTimelist.listOfTurnAroundTime != undefined) {
        turnAroundTimedata = (this.turnAroundTimelist.listOfTurnAroundTime);
        turnAroundTimedata.forEach((element, i) => {
          turnAroundTimedata[i].createdTime = this.convertDate(element.createdTime);
        });
        this.turnAroundTimelist.listOfTurnAroundTime = this.removeDuplicates(turnAroundTimedata);
      }
    });
  }




  convertDate(timestamp: any) {
    var dateTime = new Date(Number(timestamp));
    return dateTime.toLocaleDateString();
  }

  removeDuplicates(arr: any): any {
    var elementkeys = new Array();
    elementkeys = keys(arr[0]).sort();
    console.log('elementkeys' + JSON.stringify(elementkeys));
    elementkeys = elementkeys.slice(2, elementkeys.length);
    console.log('elementkeys' + JSON.stringify(elementkeys));
    const filteredArr = arr.reduce((acc, current) => {
      const x = acc.find(item => {
        var result = item.createdTime === current.createdTime;
        elementkeys.forEach(element => {
          if ((result === true)) {
            item[element] = item[element] + current[element];
          }
        });
        return result;
      });
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    return filteredArr;
  }


  getRefreshedorderList() {

    this.startDate = this.endingDate = new Date();
    this.onSubmit();
  }
}
