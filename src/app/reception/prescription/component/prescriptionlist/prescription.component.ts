import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from './../../../../app.config';
import { AuthService } from './../../../../auth/auth.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Doctor } from './../../../../model/employee/doctor';
import { POCService } from "./../../../../poc/poc.service";
import { Config } from './../../../../base/config';
import { ReceptionService } from './../../../../reception/reception.service';
import { Pharmacy } from 'src/app/model/pharmacy/pharmacy';
// import { variable } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'prescription',
  templateUrl: './prescription.template.html',
  styleUrls: ['./prescription.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class PrescriptionComponent implements OnInit {
  config: any;
  Appconfig: AppConfig = new AppConfig();
  selectedDoctor: Doctor;
  pocId: any;
  doctorId: number = 0;
  docListTotal: number = 0;
  startDate: Date = new Date();
  endDate: Date = new Date();
  serviceId: any;
  dataMsg: string = 'No Data Found';
  total: number = 0;
  size: number = 50;
  perPage: number = 10;
  from: number = 0;
  mobileNumber: string = '';
  isCorrectMobile: boolean = false;
  isEmpty: boolean = false;
  patientListForPrecription: any[] = [];
  pdfHeaderType: number;
  isDigi: boolean = false;
  isError: boolean = false;
  showMessage: boolean = false;
  errorMessage: Array<string>;
  prescriptionDoctorList: Doctor[] = new Array<Doctor>();
  sepRouteFlows: boolean = false;

  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };


  columns: any[] = [
    {
      display: 'Patient Name',
      variable: 'patientTitle patientFirstName patientLastName',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'patientContactNumber',
      filter: 'text',
      sort: false
    },
    {
      display: 'Email',
      variable: 'patientEmailId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Slot',
      variable: 'time',
      filter: 'time',
      sort: true
    },
    {
      display: 'Date',
      variable: 'date',
      filter: 'date',
      sort: true
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      filter: 'action',
      event: 'viewButton',
      type: 'button',
      sort: false
    }
  ];
  sorting: any = {
    column: 'date',
    descending: true
  };

  selectColumns: any[] = [
    {
      variable: 'firstName',
      filter: 'text'
    }
  ];

  constructor(
    private receptionService: ReceptionService, private router: Router,
    private auth: AuthService,
    private toast: ToasterService,
    private spinnerService: SpinnerService, private commonUtil: CommonUtil,
    public pocService: POCService) {
    this.config = this.Appconfig.getConfig();
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableSeperateRouteFlow) {
      this.sepRouteFlows = true;

      this.columns.push({
        display: 'Pharmacy Request',
        filter: 'action',
        event: 'pharmacy',
        type: 'button',
        variable: 'pharmacyApprovalTaken',
        conditions: [
          {
            value: false,
            condition: 'eq',
            label: 'Place Medicine Request',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
          },
          {
            value: true,
            condition: 'eq',
            label: 'Requested Order',
            style: 'btn width-100 mb-xs botton_txt approved_txt disabled'
          },
          {
            condition: 'default',
            label: 'Place Medicine Request',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
          }
        ]
      });
      this.columns.push({
        display: 'Diagnostic Request',
        filter: 'action',
        event: 'diagnostic',
        type: 'button',
        variable: 'diagnosticApprovalTaken',
        conditions: [
          {
            value: false,
            condition: 'eq',
            label: 'Place Diagnostics Request',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
          },
          {
            value: true,
            condition: 'eq',
            label: 'Requested Order',
            style: 'btn width-100 mb-xs botton_txt approved_txt disabled'
          },
          {
            condition: 'default',
            label: 'Place Diagnostics Request',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
          }
        ]
      });
    }
    else {
      this.columns.push({
        display: 'Status',
        label: 'Approve',
        filter: 'action',
        event: 'approveHyperLink',
        type: 'button',
        variable: 'approvalTaken',
        conditions: [
          {
            value: true,
            condition: 'eq',
            label: 'Place Order Request',
            style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
          },
          {
            value: false,
            condition: 'eq',
            label: 'Requested Order',
            style: 'btn width-100 mb-xs botton_txt approved_txt disabled'
          }
        ]
      })
    }

  }

  ngOnInit() {
    this.pocId = this.auth.userAuth.pocId;
    this.patientListForPrecription = new Array<any>();
    this.from = 0;
    pharmacyDis : false;
  }

  getPatientList(pocId, docId, from, size, mobile) {
    if (this.doctorId == 0) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage.push("Please select  doctor")
      return;
    }
    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "End date must be greater than start date";
      return;
    }
    this.reset();

    let fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
    let toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
    this.spinnerService.start();
    this.receptionService.getPatientListPrescription(pocId, docId, from, size, mobile, this.isDigi, fromDate, toDate).then((dataList) => {
      this.spinnerService.stop();

      if (this.total > 0){
        this.patientListForPrecription.push.apply(this.patientListForPrecription, dataList);
      }
      else
        this.patientListForPrecription = dataList;

      if (this.patientListForPrecription.length) {
        this.patientListForPrecription.sort(function (a, b) {
          if (a.date == b.date) {
            return (b.time - a.time);
          }
          return (b.date - a.date);
        });
        this.total = this.from = this.patientListForPrecription.length;
        console.log("pavan", this.total, JSON.stringify(this.patientListForPrecription));
        if(this.sepRouteFlows){
        this.patientListForPrecription.forEach(element => {
          if(element.pharmacyAdvises.pharmacyAdviceList == undefined || element.pharmacyAdvises.pharmacyAdviceList == null){ 
            element.pharmacyApprovalTaken=true;
          }
          if(element.investigationAdvises.investigationList == undefined || element.investigationAdvises.investigationList == null ){
            element.diagnosticApprovalTaken=true;
          }
          
        });
      }
      }
    });
  }

  validateNumberInputOnly(event) {
    return this.commonUtil.validateInputes(event, 2);
  }
  validateAlphaInputOnly(event) {
    return this.commonUtil.validateInputes(event, 1);
  }

  onButtonClicked(data: any): void {
    let pdfUrl = '';
    if (this.pdfHeaderType == 0) {
      pdfUrl = data.advisePdfUrlWithHeader;
    }
    else {
      pdfUrl = data.advisePdfUrlWithoutHeader;
    }
    this.spinnerService.start();
    this.auth.getTempUrl(pdfUrl).then((url) => {
      this.spinnerService.stop();
      if ((url.statusCode == 201 || url.statusCode == 200)) {
        this.auth.openPDF(url.data);
      } else {
        this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
      }
    }).catch((err) => {
      this.spinnerService.stop();
      this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
    })
  }

  onHyperLinkClicked(data: any): void {
    this.receptionService.patientPriscriptionDetails = data;
    if (data.approvalTaken)
      this.router.navigate(['/app/reception/prescription/approveprescription']);
  }

  clickEventHandler(e) {
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
    else if (e.event == 'approveHyperLink') {
      this.onHyperLinkClicked(e.val);
    }
    else if (e.event == "pharmacy"){
      this.onPharmacyClicked(e.val);
    }
    else if (e.event == "diagnostic")
      this.onDiagnosticClicked(e.val);

  }

  onPharmacyClicked(data: any): void {
    data.showPharmacy = true;
    data.showDiagnostic = false;
    this.receptionService.patientPriscriptionDetails = data;
    if(data.pharmacyApprovalTaken==false ||data.pharmacyApprovalTaken==undefined)
    this.router.navigate(['/app/reception/prescription/approveprescription']);
  }
  onDiagnosticClicked(data: any): void {
    data.showPharmacy = false;
    data.showDiagnostic = true;
    this.receptionService.patientPriscriptionDetails = data;
    if(data.diagnosticApprovalTaken==false || data.diagnosticApprovalTaken==undefined)
    this.router.navigate(['/app/reception/prescription/approveprescription']);
  }

  onPage(page: number) {
    if (this.total < 50 || (+this.total % 50) > 0) {
      return;
    }
    this.from = this.total;
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
  }

  onRefresh() {
    this.mobileNumber = '';
    this.from = 0;
    this.total = 0;
    this.reset();
    this.patientListForPrecription = new Array<any>();
    $('#search').val('');
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }

  startDateChoosen($event): void {
    this.startDate = $event;
  }

  endDateChoosen($event): void {
    this.endDate = $event;
  }

  onSearch() {
    this.mobileNumber = this.mobileNumber.trim();
    if (this.mobileNumber != '' && this.mobileNumber.length < 10 || this.mobileNumber.length > 10) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage.push("Please Enter valid mobile number")
      return;
    } else {
      this.from = 0;
      this.total = 0;
      this.patientListForPrecription = new Array<any>();
      this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
    }
  }

  getListOfPrescriptionDoctors(searchTerm): void {
    if (searchTerm.length <= 2) {
      this.doctorId = 0;
      this.patientListForPrecription = new Array<any>();
      return;
    }
    this.receptionService.getDoctorSearchList(this.auth.userAuth.pocId, 0, 0, searchTerm).then((doctor) => {
      this.prescriptionDoctorList = new Array<Doctor>();
      doctor.forEach(element => {
        let doctorTemp: Doctor = Object.create(element);
        doctorTemp.firstName = (element.title ? element.title : '') + ' ' + (element.firstName ? element.firstName : ' ') + ' ' + (element.lastName ? element.lastName : '');
        this.prescriptionDoctorList.push(doctorTemp);
      });
    });
    this.docListTotal = this.prescriptionDoctorList.length;
  }

  onDocSelect(val) {
    this.doctorId = val.empId;
    this.patientListForPrecription = new Array<any>();
    this.reset();
    if (this.doctorId == 0) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage.push("Please select  doctor")
      return;
    }
    this.docListTotal = 1;
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
  }

  reset() {
    this.isError = false;
    this.showMessage = false;
    this.errorMessage = new Array();
  }

}
