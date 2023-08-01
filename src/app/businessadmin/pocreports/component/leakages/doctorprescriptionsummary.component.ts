import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { BusinessAdminService } from '../../../businessadmin.service';
import { AuthService } from '../../../../auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { DoctorPrescriptionReport } from '../../../../model/common/doctorprescriptionreport';

@Component({
  selector: 'doctorPrescriptionSummary',
  templateUrl: './doctorprescriptionsummary.template.html',
  styleUrls: ['./doctorprescriptionsummary.style.scss'],
  encapsulation: ViewEncapsulation.None
})



export class DoctorPrescriptionSummary implements OnInit {

  @Input() isFromDoctorDashboard: boolean = false;

  dropDownIndexForPastDate: number = 0;
  toDate: number;
  startingDate: number;
  perPage: number = 5;
  total: number = 0;
  dataMsg: string = ''
  doctorPrescriptionSummaryList: DoctorPrescriptionReport[] = new Array<DoctorPrescriptionReport>();
  pendingPrescriptionCount: number;

  columns: any[] = [
    {

      display: 'Doctor',
      variable: 'doctFirstName doctLastName',
      filter: 'text',
      sort: false

    },
    {
      display: 'No. of Prescriptions',
      variable: 'totalPrscriptionCount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Pharmacy Prescriptions',
      variable: 'pharmacyPrescription',
      filter: 'text',
      sort: false
    },
    {
      display: 'Pharmacy Fulfilled',
      variable: 'pharmacyBillingCount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Diagnostic Prescriptions',
      variable: 'investigationPrescription',
      filter: 'text',
      sort: false
    },
    {
      display: 'Diagnostic Fulfilled',
      variable: 'diagnosticBillingCount',
      filter: 'text',
      sort: false
    },
  ]

  sorting: any = {
    column: 'Doctor',
    descending: true
  }


  constructor(private authService: AuthService, private businessAdmin: BusinessAdminService) {

  }


  ngOnInit(): void {
    console.log('isFromDoctorDashboard', typeof (this.isFromDoctorDashboard));
    if (this.isFromDoctorDashboard == true) {
      this.dropDownIndexForPastDate = -1;
    }
    this.onDateOptionChange(this.dropDownIndexForPastDate);
  }


  getadmincount() {

    let dateOffset;
    if (this.dropDownIndexForPastDate == 0) {
      dateOffset = (24 * 60 * 60 * 1000) * 7; // for 7 days
    } else if (this.dropDownIndexForPastDate == 1) {
      dateOffset = (24 * 60 * 60 * 1000) * 15; // for 15 days
    } else if (this.dropDownIndexForPastDate == 2) {
      dateOffset = (24 * 60 * 60 * 1000) * 30; // for 30 days
    } else if (this.dropDownIndexForPastDate == -1) {
      dateOffset = 0; // Today
    }

    let startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    startDate.setTime(startDate.getTime() - dateOffset);
    this.startingDate = startDate.getTime();
    let endDate = new Date();
    // endDate.setHours(0);
    // endDate.setMinutes(0);
    // endDate.setSeconds(0);
    // endDate.setMilliseconds(0);
    // endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
    this.toDate = endDate.getTime();

    let request: ReportRequest = new ReportRequest();
    request.fromDate = startDate.getTime();
    request.toDate = endDate.getTime();
    request.pocIds = new Array<number>();
    console.log("POC_AUTH::" + this.authService.userAuth.pocId);
    // request.pocIds = this.authService.employeeDetails.pocIdList;
    if (this.isFromDoctorDashboard == false) {
      request.pocIds = this.authService.loginResponse.employee.pocIdList;
    }
    else if (this.isFromDoctorDashboard == true) {
      request.pocIds[0] = this.authService.userAuth.pocId;
      request.doctorId = this.authService.employeeDetails.empId;
    }

    // request.perPOC = true;
    console.log("requesttttt" + JSON.stringify(request));
    this.businessAdmin.getDoctorPendingPrescriptionCount(request).then(response => {
      if (response.length > 0) {
        this.pendingPrescriptionCount = response[0].pendingPrescriptionCount;
      }
      else this.pendingPrescriptionCount = 0;
    });
    return this.businessAdmin.getDoctorPrescriptionSummaryList(request);
  }

  onDateOptionChange(index: number) {
    this.dropDownIndexForPastDate = index;
    this.doctorPrescriptionSummaryList = [];
    console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
    this.getadmincount().then(response => {

      if (response.length > 0) {
        this.doctorPrescriptionSummaryList = response;
        this.total = this.doctorPrescriptionSummaryList.length;
      }
      else {
        this.dataMsg = 'No Data Found';
      }

      console.log("Response In ConsumerOnboarded OnDateOptionChange:: " + JSON.stringify(this.doctorPrescriptionSummaryList));

    });
  }
}