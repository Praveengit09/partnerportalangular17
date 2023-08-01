import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { LocationModeResponse } from '../../../../model/common/locationmoderesponse';
import { Region } from '../../../../model/employee/getRegion';
import { DiagnosticScheduleService } from '../../schedule.service';

@Component({
  selector: 'diagnosticschedulelocation',
  templateUrl: './diagnosticschedulelocation.template.html',
  styleUrls: ['./diagnosticschedulelocation.style.scss'],
  encapsulation: ViewEncapsulation.None,

})

export class DiagnosticScheduleLocationComponent implements OnInit {

  region: Region = new Region();
  regionList: any;

  stateId: number;
  cityId: number = 0;
  cityResponse: any[] = [];
  areaResponse: LocationModeResponse[] = [];
  pageEvent: any;
  perPage: number = 10;
  pincode: string = null;

  selectedAreas: LocationModeResponse[] = [];
  // allAreasofCity: LocationModeResponse[] = [];
  selectedList: any[];
  selectedCity: LocationModeResponse = new LocationModeResponse();

  columns: any[] = [
    {
      display: '#',
      filter: 'index',
      type: 'index',
      sort: false
    },
    {
      display: 'Locations',
      variable: 'name',
      filter: 'text',
      sort: false
    },
    {
      display: 'PIN Code',
      variable: 'pinCode',
      filter: 'text',
      sort: false
    }
  ];


  isError: boolean;
  errorMessage: any[];
  showMessage: boolean;
  isCityChange: boolean = false;

  constructor(public diagnosticScheduleService: DiagnosticScheduleService,
    private spinnerService: SpinnerService, private router: Router, private authService: AuthService) {
    this.stateId = this.authService.selectedPocDetails.address.state;

  }

  ngOnInit() {
    console.log("SelCity: " + this.diagnosticScheduleService.selectedCity + ">>>>>>", this.diagnosticScheduleService.editDiagnosticSchedule)
    this.getRegion(this.stateId, Region.MODE_FOR_CITY);
    if (this.diagnosticScheduleService.editDiagnosticSchedule &&
      this.diagnosticScheduleService.editDiagnosticSchedule.areaList.length > 0) {
      this.selectedAreas = this.diagnosticScheduleService.editDiagnosticSchedule.areaList;
    } else if (this.diagnosticScheduleService.selectedAreaList && this.diagnosticScheduleService.selectedAreaList.length > 0) {
      this.selectedAreas = this.diagnosticScheduleService.selectedAreaList;
    } else {
      this.selectedAreas = [];
    }
  }

  getRegion(id: number, mode: number) {
    this.resetError();
    this.region.id = id;  //southzone
    this.region.mode = mode;
    this.spinnerService.start();
    this.diagnosticScheduleService.getRegion(this.region).then((data) => {
      if (data && data.length > 0) {
        this.spinnerService.stop();
        if (data[0].parentId == this.stateId) {
          this.cityResponse = data;
          if (this.diagnosticScheduleService.editDiagnosticSchedule && this.diagnosticScheduleService.editDiagnosticSchedule.areaList
            && this.diagnosticScheduleService.editDiagnosticSchedule.areaList.length > 0) {
            this.selectedCity = this.diagnosticScheduleService.editDiagnosticSchedule.cityDetails;
            this.cityId = this.diagnosticScheduleService.editDiagnosticSchedule.areaList[0].parentId;
            this.getRegion(this.diagnosticScheduleService.editDiagnosticSchedule.areaList[0].parentId, Region.MODE_FOR_AREA);
          } else if (this.diagnosticScheduleService.selectedAreaList
            && this.diagnosticScheduleService.selectedAreaList.length > 0) {
            this.selectedCity = this.diagnosticScheduleService.editDiagnosticSchedule.cityDetails;
            this.cityId = this.diagnosticScheduleService.selectedAreaList[0].parentId;
            this.getRegion(this.diagnosticScheduleService.selectedAreaList[0].parentId, Region.MODE_FOR_AREA);
          }
        } else if (data[0].parentId == this.cityId) {
          this.areaResponse = data;
          if ((this.diagnosticScheduleService.editDiagnosticSchedule && this.diagnosticScheduleService.editDiagnosticSchedule.areaList &&
            this.diagnosticScheduleService.editDiagnosticSchedule.areaList.length > 0) || (this.diagnosticScheduleService.selectedAreaList
              && this.diagnosticScheduleService.selectedAreaList.length > 0)) {
            this.cityId = this.areaResponse[0].parentId;
            console.log("CityId: " + this.cityId);
          }
        }
      } else {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "No data found";
        this.showMessage = true;
        return;
      }
      console.log("response" + JSON.stringify(data));
    })
  }

  onCityChange(cityId: number): void {
    this.cityResponse.forEach(city => {
      if (Number(cityId) === Number(city.id)) {
        this.selectedCity = city;
        return;
      }
    });
    console.log("city: " + JSON.stringify(this.selectedCity));
    this.cityId = cityId;
    if (cityId > 0) {
      this.isCityChange = true;
      console.log("this.isCityChange: " + this.isCityChange);
      this.selectedList = [];
      this.diagnosticScheduleService.editDiagnosticSchedule.areaList = [];
      this.getRegion(cityId, Region.MODE_FOR_AREA);
    }
    else
      this.areaResponse = [];
  }

  onStateChange(stateId: number): void {
    console.log("stateId: " + stateId + ">>>>" + this.cityId);
    this.cityResponse = [];
    this.cityId = 0;
    this.areaResponse = [];
    this.stateId = stateId;
    if (stateId > 0)
      this.getRegion(stateId, Region.MODE_FOR_CITY);

  }

  getPage(pageEvent: PageEvent): void {
    this.pageEvent = pageEvent;
  }

  clickEventHandler(e) {
    console.log("VEvent: " + JSON.stringify(e));
    this.isError = false;
    this.showMessage = false;
    if (e.event == 'onChecked') {
      console.log("Value: " + JSON.stringify(e.val));
      this.selectedList = e.val;
    }
  }

  onSaveDetails() {
    console.log("selectedAreaList: " + JSON.stringify(this.diagnosticScheduleService.editDiagnosticSchedule.areaList));
    console.log("this.selectedCity: " + JSON.stringify(this.selectedCity));
    if (this.selectedList && this.selectedList.length > 0) {
      this.selectedAreas = this.selectedList;
    } else if (this.diagnosticScheduleService.isScheduleEdit && this.diagnosticScheduleService.editDiagnosticSchedule.areaList
      && this.diagnosticScheduleService.editDiagnosticSchedule.areaList.length > 0) {
      this.selectedAreas = this.diagnosticScheduleService.editDiagnosticSchedule.areaList;
    } else {
      this.selectedAreas = this.areaResponse;
    }

    console.log("selectedAreas: " + JSON.stringify(this.selectedAreas));

    this.isCityChange = false;
    if (this.diagnosticScheduleService.isScheduleEdit) {
      this.diagnosticScheduleService.editDiagnosticSchedule.areaList = this.selectedAreas;
      this.diagnosticScheduleService.editDiagnosticSchedule.cityDetails = this.selectedCity;
      this.diagnosticScheduleService.selectedAreaList = this.selectedAreas;
    } else {
      if (this.selectedAreas && this.selectedAreas.length > 0) {
        this.diagnosticScheduleService.selectedAreaList = this.selectedAreas;
      }
    }
    this.diagnosticScheduleService.selectedCity = this.selectedCity;
    console.log("Schedulee: " + JSON.stringify(this.diagnosticScheduleService.editDiagnosticSchedule));
    this.router.navigate(['/app/diagnostics/schedule/createnewdiagnosticschedule/']);
  }

  resetError() {
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
  }

}