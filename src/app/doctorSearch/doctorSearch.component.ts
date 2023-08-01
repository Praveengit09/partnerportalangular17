import { AuthService } from './../auth/auth.service';
import { Component, ViewEncapsulation, OnInit, Input, Output } from "@angular/core";
import { Doctor } from '../model/employee/doctor';
import { DoctorDetails } from '../model/employee/doctordetails';
import { EventEmitter } from '@angular/core';
import { DoctorSearchService } from './doctorSearch.service';
import { SearchRequest } from '../model/common/searchRequest';
import { Address } from '../model/poc/address';
import { DiagnosticsService } from '../diagnostics/diagnostics.service';
import { SlotBookingDetails } from '../model/basket/slotBookingDetails';
import { Config } from '../base/config';
import { ToasterService } from '../layout/toaster/toaster.service';

@Component({
  selector: 'doctor-search',
  templateUrl: './doctorSearch.template.html',
  styleUrls: ['./doctorSearch.style.scss'],
  providers: [DoctorSearchService],
  encapsulation: ViewEncapsulation.Emulated
})

export class doctorSearchComponent implements OnInit {

  @Input('pocId') public pocId: number;
  @Input('city') public city: number;
  @Input('empId') public empId: number;
  @Input() isMatEnable: boolean = false;
  @Input() public label: string;
  @Input() public defaultSelectLabel: string;
  @Output() doctorListSearchEvent = new EventEmitter<DoctorDetails>();
  @Input() public doctorsList: Doctor[] = new Array<Doctor>();

  selectedDoctor: DoctorDetails = new DoctorDetails();
  selectedDoctorName: string;
  dropDownIndex: number = 0;
  searchedTests: Doctor[] = new Array<Doctor>();;
  searchTestsTotal: number = 0;
  enableAddNew: boolean = false;
  searchTerm: string;
  errorMessage: Array<string>;
  isError: boolean = false;
  errorLabel: string;
  @Input() bookinSubType: boolean;
  disablePocSpecificDoctors: boolean;

  selectColumns: any[] = [
    {
      variable: 'doctorName',
      filter: 'text'
    }
  ];

  constructor(private doctorSearchService: DoctorSearchService, private auth: AuthService,
    private diagnosticsService: DiagnosticsService, private toast: ToasterService) {
  }

  ngOnInit() {
    !this.pocId ? this.pocId = this.auth.selectedPOCMapping.pocId : '';
    !this.city ? this.city = 0 : '';
    !this.empId ? this.empId = this.auth.userAuth.employeeId : '';
    !this.label ? this.label = 'Doctor Name' : "";
    !this.defaultSelectLabel ? this.defaultSelectLabel = 'Enter Doctor Name' : '';
    this.errorLabel = this.label.split(' ')[0].toLocaleLowerCase();
  }

  updateDoctorName() {
    let doctor: DoctorDetails = new DoctorDetails();
    var docName = this.searchTerm.split(/ (.*)/);
    doctor.firstName = docName[0];
    doctor.lastName = docName[1];
    doctor.title = "Dr"
    doctor.pocIdList = new Array<number>();
    doctor.pocIdList[0] = this.pocId;
    var addr = new Address();
    addr.city = this.city;
    doctor.addressList = new Array();
    doctor.addressList.push(addr);
    if (doctor.lastName == undefined || doctor.lastName == null) {
      doctor.lastName = ' ';
    }
    this.selectedDoctor.title = doctor.title ? doctor.title : ""
    this.selectedDoctor.firstName = doctor.firstName;
    this.selectedDoctor.lastName = doctor.lastName;

    this.doctorSearchService.addNewDoctorToServer(doctor).then(response => {
      if (response.statusCode == 200 || response.pocDoctorId > 0) {
        this.enableAddNew = false;
        this.toast.show("Added Doctor Successfully", "bg-success text-white font-weight-bold", 3000);
        this.selectedDoctor.empId = +response.pocDoctorId;
        this.doctorEvent(this.selectedDoctor);

      }
    });
  }

  searchTests(key) {
    let searchRequest = new SearchRequest();
    searchRequest.from = 0;
    if (!(Config && Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.disablePocSpecificDoctors)) {
      searchRequest.id = this.pocId;
      this.disablePocSpecificDoctors = Config.portal.doctorOptions.disablePocSpecificDoctors;
    }
    searchRequest.city = this.city.toString();
    searchRequest.searchTerm = key.trim();
    if (this.diagnosticsService.slotBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME) {
      searchRequest.homeCollections = true;
    } else {
      searchRequest.homeCollections = false;
    }
    searchRequest.size = 500;
    this.enableAddNew = false;
    this.searchTerm = key.trim();
    if (searchRequest.searchTerm != "") {
      if (key.length > 2) {

        this.doctorSearchService.getSearchedDoctorsList(searchRequest).then((searchedTests) => {
          this.searchTestsTotal = searchedTests.length;
          this.searchedTests = searchedTests;
          for (let i = 0; i < this.searchedTests.length; i++) {
            this.searchedTests[i].doctorName = this.searchedTests[i].firstName + ' ' + (this.searchedTests[i].lastName ? this.searchedTests[i].lastName : "");
            if (this.searchedTests[i].doctorName && (this.searchedTests[i].doctorName.startsWith('Dr') || this.searchedTests[i].doctorName.startsWith('dr'))) {
              // Nothing to do
            } else {
              this.searchedTests[i].doctorName = (this.searchedTests[i].title ? (this.searchedTests[i].title + " ") : "") + this.searchedTests[i].doctorName;
            }
          }
          if (searchedTests.length == 0 || searchedTests == undefined || searchedTests == null) {
            this.enableAddNew = true;
          }
        });
      }

    }
  }

  onKeydown(event) {
    this.enableAddNew = false;
  }

  getTestName(selectedDoctor) {
    if (selectedDoctor) {
      this.selectedDoctor = selectedDoctor;
      var doctorName = (this.selectedDoctor.firstName ? this.selectedDoctor.firstName : '') + " " + (this.selectedDoctor.lastName ? this.selectedDoctor.lastName : '');
      this.selectedDoctorName = doctorName;
      this.doctorEvent(this.selectedDoctor);
    }
    else {
      this.selectedDoctor = new DoctorDetails();
      this.doctorEvent(this.selectedDoctor);
    }
  }

  doctorEvent(selectedDoctordetails: DoctorDetails) {
    this.doctorListSearchEvent.emit(selectedDoctordetails);
  }

  ngOnDestroy(): void {

  }

}



