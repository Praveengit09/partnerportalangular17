import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ValidationUtil } from '../../base/util/validation-util';
import { AppConfig } from '../../app.config';
import { Doctor } from '../../model/employee/doctor';
import { ReceptionService } from '../../reception/reception.service';
import { AuthService } from '../../auth/auth.service';
import { ToasterService } from '../../layout/toaster/toaster.service';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { POCService } from '../../poc/poc.service';
import { DoctorService } from '../doctor.service';
import { Config } from '../../base/config';

@Component({
  selector: 'docprescription',
  templateUrl: './prescriptionlist.template.html',
  styleUrls: ['./prescriptionlist.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class PrescriptionListComponent implements OnInit {

  config: any;
  Appconfig: AppConfig = new AppConfig();
  selectedDoctor: Doctor;
  pocId: any;
  doctorId: any;
  serviceId: any;
  dataMsg: string = ' ';
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
  isDigi: boolean = false;
  orderId: string = null;

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


  constructor(
    private activatedRoute: ActivatedRoute, private tValidation: ValidationUtil,
    private receptionService: ReceptionService, private router: Router, private location: Location,
    private auth: AuthService,
    private doctorService: DoctorService,
    private toast: ToasterService,
    private spinnerService: SpinnerService,
    public pocService: POCService) {
    this.config = this.Appconfig.getConfig();
    this.validation = tValidation;
    this.pdfHeaderType = auth.selectedPocDetails.pdfHeaderType;
    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDeletePrescription) {
      this.columns.push(
        {
          display: 'Action',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
          filter: 'action',
          type: 'button',
          event: 'deleteButton',
          sort: false,
          variable: 'deleteFlag',
          conditions: [
            {
              value: '1',
              condition: 'eq',
              label: 'Delete',
              style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
            },
            {
              value: '0',
              condition: 'eq',
              label: 'Delete',
              style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
            }
          ]
        })
    }
  }

  ngOnInit() {
    console.log("in prescription");
    this.activatedRoute.params.subscribe(params => {
      this.pocId = this.auth.userAuth.pocId;
      this.doctorId = this.auth.userAuth.employeeId;
      this.patientListForPrecription = new Array<any>();
      this.from = 0;
      console.log("ngOnInit:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
      this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);

    });
    // this.load();
  }

  getPatientList(pocId, docId, from, size, mobile) {
    this.dataMsg = 'Loading......';
    this.spinnerService.start();
    this.receptionService.getPatientListPrescription(pocId, docId, from, size, mobile, this.isDigi, 0, 0).then((dataList) => {
      this.spinnerService.stop();
      if (this.total > 0)
        this.patientListForPrecription.push.apply(this.patientListForPrecription, dataList);
      else {
        this.patientListForPrecription = new Array<any>();
        this.patientListForPrecription = dataList;
      }
      for (let i = 0; i < this.patientListForPrecription.length; i++) {
        let record = this.patientListForPrecription[i];
        let deleteFlag = 0
        if (record.date > (new Date().getTime() - 7 * 24 * 60 * 60 * 1000)) {
          deleteFlag = 1;
        }
        this.patientListForPrecription[i].deleteFlag = deleteFlag;
      }
      if (this.patientListForPrecription) {
        this.patientListForPrecription.sort(function (a, b) {
          if (a.date == b.date) {
            return (b.time - a.time);
          }
          return (b.date - a.date);
        });
      }
      if (this.patientListForPrecription.length > 0) {
        this.total = this.from = this.patientListForPrecription.length;
        console.log("length" + this.from);
      }
      else {
        this.dataMsg = 'No Data Found';
      }
    });
  }
  // load() {
  //   console.log("====>>>")
  //   setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
  //   // location.reload();
  //   }

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

  onDeleteButtonClicked(data) {
    if (data && data.orderId && data.orderId.length > 0) {
      if (data.deleteFlag == 1) {
        this.orderId = data.orderId;
        (<any>$("#saveAlertmodelId")).modal({
          show: true,
          escapeClose: false,
          clickClose: false,
          showClose: false,
          backdrop: "static",
          keyboard: false
        });
      }
    } else {
      this.toast.show("Invalid Order Id", "bg-danger text-white font-weight-bold", 3000);
    }
  }

  confirmDeletion() {
    this.discardChanges();
    this.spinnerService.start();
    this.doctorService.deletePrescription(this.orderId).then(response => {
      this.spinnerService.stop();
      this.toast.show(response.statusMessage, "bg-danger text-white font-weight-bold", 3000);
      this.onRefresh();
    }).catch(error => {
      this.spinnerService.stop();
      this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
    });
  }

  discardChanges() {
    (<any>$("#saveAlertmodelId")).modal("hide");
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "viewButton") {
      this.onButtonClicked(e.val);
    } else if (e.event == "deleteButton") {
      this.onDeleteButtonClicked(e.val);
    }
  }

  onPage(page: number) {
    console.log("Onpage:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
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
    this.getPatientList(this.pocId, this.doctorId, this.from, this.size, this.mobileNumber);
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }

  onSearch() {
    console.log("NameOrMob::" + this.mobileNumber);
    this.mobileNumber = this.mobileNumber.trim();
    if (!isNaN(parseInt(this.mobileNumber))
      && (this.mobileNumber.length < 10 || this.mobileNumber.length > 10)) {
      this.isCorrectMobile = true;
      return;
    } else if (!this.mobileNumber || this.mobileNumber.length < 3) {
      this.isCorrectMobile = true;
      return;
    }
    this.isCorrectMobile = false;
    this.from = 0;
    this.patientListForPrecription = new Array<any>();
    this.dataMsg = "Loading...";

    console.log("onSearch:" + this.pocId + " " + this.doctorId + " " + this.from + " " + this.size + " " + this.mobileNumber);
    this.receptionService.getPatientListPrescription(this.pocId, this.doctorId, this.from, this.size,
      this.mobileNumber, this.isDigi,0 ,0).then((dataList) => {
        this.patientListForPrecription = (dataList);
        if (this.patientListForPrecription.length > 0) {
          this.total = this.from = this.patientListForPrecription.length;
          this.isEmpty = false;
        } else {
          this.dataMsg = 'No Data Found';
          this.isEmpty = true;
        }
        console.log("PreList::" + JSON.stringify(this.patientListForPrecription));
      });

  }
  ngOnDestroy() {

  }
}
