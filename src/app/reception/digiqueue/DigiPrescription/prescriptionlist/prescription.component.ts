import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { Doctor } from '../../../../model/employee/doctor';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { ReceptionService } from '../../../reception.service';
import { AuthService } from '../../../../auth/auth.service';
import { POCService } from '../../../../poc/poc.service';


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
  doctorId: any;
  dataMsg: string = ' ';
  empId: any;
  serviceId: any;
  total: number = 0;
  size: number = 50;
  perPage: number = 10;
  from: number = 0;
  mobileNumber: string = '';
  isCorrectMobile: boolean = false;
  isEmpty: boolean = false;
  patientListForPrecription: any[];
  validation: ValidationUtil;
  pdfHeaderType: number;
  isDigi: boolean = true;
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
      event: "viewButton",
      filter: 'action',
      type: 'button',
      sort: false
    },
    {
      display: 'Status',
      label: 'Approve',
      filter: 'action',
      type: 'button',
      event: "hyperlink",
      variable: 'approvalTaken',
      conditions: [
        {
          value: false,
          condition: 'eq',
          label: 'Approve',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
        },
        {
          value: true,
          condition: 'eq',
          label: 'Approved',
          style: 'btn width-100 mb-xs botton_txt approved_txt'
        }
      ]
    }
  ];
  sorting: any = {
    column: 'date',
    descending: true
  };


  constructor(
    private activatedRoute: ActivatedRoute, private tValidation: ValidationUtil,    
    private toast:ToasterService,
    private receptionService: ReceptionService, private router: Router, private location: Location,
    private auth: AuthService, public pocService: POCService, private spinnerService: SpinnerService) {
    this.config = this.Appconfig.getConfig();
    this.validation = tValidation;
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
  }

  ngOnInit() {
    console.log("in prescription");
    // this.activatedRoute.params.subscribe(params => {
    this.pocId = this.auth.userAuth.pocId;
    this.doctorId = this.auth.userAuth.employeeId
    this.isDigi = true;
    // this.doctorId = this.activatedRoute.snapshot.params['doctorId']
    this.patientListForPrecription = new Array<any>();
    console.log("ngOnInit:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber, this.isDigi);

    // });
    // this.load();
  }

  getPatientList(pocId, docId, from, size, mobile, isDigi) {
    this.spinnerService.start();
    this.receptionService.getPatientListPrescription(pocId, docId, from, size, mobile, isDigi,0 ,0).then((dataList) => {
      this.spinnerService.stop();
      this.patientListForPrecription.push.apply(this.patientListForPrecription, dataList);

      if (this.patientListForPrecription) {
        this.patientListForPrecription.sort(function (a, b) {
          return (b.date - a.date);
        });
      }
      if (this.patientListForPrecription.length > 0) {
        this.total = this.patientListForPrecription.length;
        console.log("length" + this.from);
      }
    });
  }
  // load() {
  //   console.log("====>>>")
  //   setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
  //   // location.reload();
  //   }

  onButtonClicked(data: any): void {
    console.log(data);
      let pdfUrl='';
      if (this.pdfHeaderType == 0) {
        pdfUrl = data.advisePdfUrlWithHeader ;
      }
      else {
        pdfUrl = data.advisePdfUrlWithoutHeader;
      }
      this.spinnerService.start();
      this.auth.getTempUrl(pdfUrl).then((url)=>{
        this.spinnerService.stop();
        if((url.statusCode==201||url.statusCode==200)){
          this.auth.openPDF(url.data);
        }else{
          this.toast.show(url.statusMessage,"bg-danger text-white font-weight-bold",3000);
        }
      }).catch((err)=>{
        this.spinnerService.stop();
        this.toast.show("Error in getting response please retry","bg-danger text-white font-weight-bold",3000);
      })
  }
  onHyperLinkClicked(data: any): void {
    this.receptionService.patientPriscriptionDetails = data;
    if (!data.approvalTaken) {
      this.router.navigate(['/app/reception/digiqueue/prescription/approveprescription']);
    }

  }
  onPage(page: number) {
    console.log("Onpage:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber, this.isDigi);
  }

  onRefresh() {
    this.isCorrectMobile = false;
    this.mobileNumber = '';
    this.isEmpty = false;
    this.from = 0;
    this.patientListForPrecription = new Array<any>();
    this.total = 0;
    $('#search').val('');
    console.log("onRefresh:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber, this.isDigi);
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }

  onSearch() {
    console.log("NameOrMob::" + this.mobileNumber);
    this.mobileNumber = this.mobileNumber.trim();
    let patientList: any[];
    if (this.mobileNumber.length < 10 || this.mobileNumber.length > 10) {
      this.isCorrectMobile = true;
      return;
    } else {
      this.isCorrectMobile = false;
      this.from = 0;
      this.patientListForPrecription = new Array<any>();
      console.log("onSearch:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
      this.dataMsg = 'Loading.....'
      this.receptionService.getPatientListPrescription(this.pocId, this.doctorId, this.from, this.size,
        this.mobileNumber, this.isDigi,0 ,0).then((dataList) => {
          this.patientListForPrecription.push.apply(this.patientListForPrecription, dataList);
          if (this.patientListForPrecription.length > 0) {
            this.total = this.from = this.patientListForPrecription.length;
            this.isEmpty = false;
          } else {
            this.isEmpty = true;
            this.dataMsg = 'No Data Found';
          }
          console.log("PreList::" + JSON.stringify(this.patientListForPrecription));
        });
    }
  }
  ngOnDestroy() {

  }
  clickEventHandler(e) {
    if (e.event == "hyperlink") {
      this.onHyperLinkClicked(e.val);
    } else if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    }
  }
}
