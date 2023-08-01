import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { BookingReport } from '../../../../model/report/bookingreport';
import { AuthService } from "../../../../auth/auth.service";
import { BusinessAdminService } from '../../../businessadmin.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';

@Component({
  selector: 'bookingreport',
  templateUrl: './bookingreport.template.html',
  styleUrls: ['./bookingreport.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class BookingReportComponent implements OnInit {
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isDate: boolean = false;
  isDisplay: boolean = false;
  message: Array<string>;
  todaysDate: number;
  config: any;
  month: any;
  year: any;
  startDate: Date;
  endDate: Date;
  bookingReportList: BookingReport[] = new Array<BookingReport>();
  pocRolesList: Array<EmployeePocMapping>;
  selectedPOC: EmployeePocMapping;
  bookingReportRes: any;

  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  
  columns: any[] = [
    {
      display: 'Date',
      variable: 'date',
      filter: 'date',
      sort: true
    },
    {
      display: 'Doctor',
      variable: 'doctorFirstName doctorLastName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Booked Slots',
      variable: 'bookedSlots videoSlotsTotal inPersionSlotsTotal digiSlotsTotal',
      filter: 'multiLine',
      style: "multiLine",
      nameList: 'Total_BookedSlots Total_VideoSlots Total_InPersionSlots Total_DigiSlots',
      sort: true
    },
    {
      display: 'Total Slots',
      variable: 'totalSlots',
      filter: 'text',
      sort: true
    },
    {
      display: 'Missed Consultations',
      variable: 'notAppearedSlots',
      filter: 'text',
      sort: true
    }
  ];
  sorting: any = {
    column: 'date',
    descending: true
  };

  perPage: number = 10;
  total: number = 0;
  selectedPocIndex: number = -1;
  selectedPocDoctorIndex: number = -1;
  bookingReportsResponse = new Array();
  doctorList: Array<DoctorDetails> = new Array<DoctorDetails>();
  sessionDataDetails: any = new Object();
  sRes: any = new Object();

  constructor(config: AppConfig,
    private adminService: BusinessAdminService,
    private authService: AuthService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    let dateOffset = (24 * 60 * 60 * 1000) * 30;
    this.startDate = new Date();
    this.startDate.setTime(this.startDate.getTime() - dateOffset);
    this.endDate = new Date();
    this.pocRolesList = this.authService.employeePocMappingList;
    let selectedPoc = this.authService.selectedPOCMapping;
    this.selectedPocIndex = this.pocRolesList.findIndex(e => { return selectedPoc && e.pocId == selectedPoc.pocId });
    this.selectedPocIndex = this.selectedPocIndex > -1 ? this.selectedPocIndex : -1;
    this.selectedPocIndex > -1 ? this.onPOCSelect(this.selectedPocIndex) : '';
    // this.getBookingReportForPoc();
  }

  startDateChoosen(): void {
    this.datepickerOptEnd = {
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
      assumeNearbyYear: true,
      format: 'dd/mm/yyyy'
    };

  }

  getBookingReportForPoc(): void {

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
      this.isDate = true;
      this.isDisplay = false;
      this.message = new Array();
      this.message[0] = "Please Select Start Date";
    }
    else if (this.startDate > this.endDate) {
      this.errorMessage = new Array();
      this.isDate = true;
      this.isDisplay = true;
      this.message = new Array();
      this.message[0] = "End date can not be less than start date";
    }
    else if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
      console.log('In the if condition' + this.selectedPOC.pocId);
      this.onPOCSelect(this.selectedPocIndex);
    } else {
      console.log('In the else condition');
      this.onPOCSelect(0);
    }

  }

  endDateChoosen(event) {
    this.errorMessage = new Array();
    this.isDate = false;
    this.isDisplay = false;
  }

  setReportSessionData(sPocId: number, doctorId?) {
    let sFromDate = this.startDate.getTime();
    let sToDate = this.endDate.getTime();
    var docId = new Array();
    docId.push(sPocId);
    this.adminService.getReportSessionData(sPocId, sFromDate, sToDate, doctorId).then(e => {
      this.sessionDataDetails = this.sRes = e;
      this.sRes.totalBookings ? '' : this.sRes = undefined;
      console.log('eee==>', (e))
    });
  }

  onPOCSelect(index: number): void {
    console.log('Selected POC is' + index);
    this.showMessage = false;
    this.bookingReportList = new Array<BookingReport>();
    this.selectedPocDoctorIndex = -1;
    let reportRequest: ReportRequest = new ReportRequest();
    if (index >= 0 && index < this.pocRolesList.length) {
      this.selectedPOC = this.pocRolesList[index];
      reportRequest.pocIds = new Array<number>();
      reportRequest.pocIds.push(this.selectedPOC.pocId);
    }
    console.log('Selected POC is' + this.selectedPOC.pocId);

    // else if (!(this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0)) {
    // this.selectedPOC = this.pocRolesList[0];
    // reportRequest.pocIds = new Array<number>();
    // this.pocRolesList.forEach(e=>{
    //   reportRequest.pocIds.push(e.pocId);
    // });
    // }
    reportRequest.fromDate = this.startDate.getTime();
    reportRequest.toDate = this.endDate.getTime();
    console.log('In the if condition' + this.selectedPOC.pocId);
    let unsortedArray: BookingReport[] = new Array<BookingReport>();

    this.setReportSessionData(this.selectedPOC.pocId);
    this.adminService.getBookingReport(reportRequest).then(response => {
      let data: any = response;
      this.bookingReportRes = response;
      this.bookingReportsResponse = response;
      this.doctorList = new Array();
      if (data != null && data.length > 0) {
        data.forEach(bookingObj => {
          let doctor: DoctorDetails = new DoctorDetails();
          doctor.empId = bookingObj.doctorId;
          doctor.firstName = bookingObj.doctorFirstName;
          doctor.lastName = bookingObj.doctorLastName ? bookingObj.doctorLastName : '';
          this.doctorList.push(doctor);
          this.prepareBookingReportList(bookingObj, unsortedArray);
        });
      }
      this.sortBookingReport(unsortedArray);
    });
  }
  onPOCDoctorSelect(index?) {
    let unsortedArray: BookingReport[] = new Array<BookingReport>();
    let doctor: DoctorDetails = this.doctorList[index];
    this.setReportSessionData(this.selectedPOC.pocId, doctor.empId);
    let indexOfRoport = this.bookingReportsResponse.findIndex(e => { return doctor && e.doctorId == doctor.empId });
    if (indexOfRoport > -1) {
      this.prepareBookingReportList(this.bookingReportsResponse[indexOfRoport], unsortedArray);
      this.sortBookingReport(unsortedArray);
    }
    else {
      let unsortedArray: BookingReport[] = new Array<BookingReport>();
      this.bookingReportRes.forEach(e => {
        this.prepareBookingReportList(e, unsortedArray);
      });
      this.sortBookingReport(unsortedArray);
      // this.onPOCSelect(this.selectedPocIndex);
    }
  }
  prepareBookingReportList(bookingObj, unsortedArray) {
    if (bookingObj != null && bookingObj.dateSummery != null && bookingObj.dateSummery.length > 0) {
      bookingObj.dateSummery.forEach(element => {
        if(element !=null){
        let bookingReport: BookingReport = new BookingReport();
        bookingReport.pocId = bookingObj.pocId;
        bookingReport.pocName = bookingObj.pocName;
        bookingReport.doctorId = bookingObj.doctorId;
        bookingReport.doctorFirstName = bookingObj.doctorFirstName;
        bookingReport.doctorLastName = bookingObj.doctorLastName ? bookingObj.doctorLastName : '';
        bookingReport.date = element.date;
        bookingReport.bookedSlots = element.bookedSlots;
        bookingReport.totalSlots = element.totalSlots;
        bookingReport.videoSlotsTotal = element.videoSlotsTotal;
        bookingReport.inPersionSlotsTotal = element.inPersionSlotsTotal;
        bookingReport.digiSlotsTotal = element.digiSlotsTotal;
        bookingReport.notAppearedSlots = element.notAppearedSlots;
        unsortedArray.push(bookingReport);
        };
      });
    }
  }
  sortBookingReport(unsortedArray) {
    if (unsortedArray.length > 0) {
      this.bookingReportList = unsortedArray.sort((obj1, obj2) => {
        if (obj1.date == obj2.date) {
          if (obj1.doctorFirstName == obj2.doctorFirstName) {
            return 0;
          } else if (obj1.doctorFirstName > obj2.doctorFirstName) {
            return 1;
          } else {
            return -1;
          }
        } else if (obj1.date > obj2.date) {
          return -1;
        } else {
          return 1;
        }
      });
      this.total = this.bookingReportList.length;
    }
    else {
      this.isError = true;
      this.showMessage = true;
      this.message = new Array();
      this.errorMessage = new Array();
      this.errorMessage[0] = "No Data Found";
      this.total = this.bookingReportList.length;
    }
  }

}
