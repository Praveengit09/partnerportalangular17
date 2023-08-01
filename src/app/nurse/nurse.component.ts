import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from './../app.config';
import { AuthService } from './../auth/auth.service';
import { ConsultationQueueRequest } from './../model/slotbooking/consultationQueueRequest';
import { NurseService } from './nurse.service';
import { PatientQueue } from './../model/reception/patientQueue';
import { ActivatedRoute, Router } from '@angular/router';
import { QueueConsult } from './../model/reception/queueConsult';
import { SpinnerService } from './../layout/widget/spinner/spinner.service';
import { RoleConstants } from './../constants/auth/roleconstants';
import { Location } from '@angular/common';
import { ReceptionService } from '../reception/reception.service';
import { Config } from './../base/config';
import { CommonUtil } from '../base/util/common-util';

@Component({
  selector: 'nurse',
  templateUrl: './nurse.template.html',
  styleUrls: ['./nurse.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class NurseComponent {
  config: any;
  total: number = 0;
  dataMsg: string = ' ';
  patientFirstName: string;
  perPage: number = 10;
  empId: number;
  pocId: number;
  doctorId: number;
  roleId: number;
  date: number;
  digiQueue: boolean;
  filterStatus: number = 0;
  consultationQueueRequest: ConsultationQueueRequest;
  patientConsultationQueueList = new Array<PatientQueue>();
  patientList = new Array<QueueConsult>();
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  scrollPosition: number;
  time: any;
  offset: number = 50;
  isCorrectMobile: boolean = false;
  isEmpty: boolean = false;
  dropDownIndex: number = 0;
  columns: any[] = [
    {
      display: '#',
      variable: 'serialNum',
      filter: 'text',
      sort: true
    },
    {
      display: 'Patient Name',
      variable: 'patientQueue.patientTitle patientQueue.patientFirstName patientQueue.patientLastName',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Token',
      variable: 'patientQueue.appointmentToken',
      filter: 'text',
      sort: false
    },
    {
      display: 'Doctor Name',
      variable: 'patientQueue.doctorTitle patientQueue.doctorFirstName patientQueue.doctorLastName',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Slot',
      variable: 'patientQueue.time',
      filter: 'time',
      sort: false
    },
    {
      display: 'Action',
      label: 'Engage Now',
      filter: 'action',
      type: 'button',
      event: 'engageNowButton',
      sort: false,
      variable: 'patientQueue.vitalStatus',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Engage Now',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Done',
          style: 'btn width-100 mb-xs hide_btntxt disabled'
        },
        {
          condition: 'default',
          label: 'Mark Addressed',
          style: 'btn btn-danger width-100 mb-xs botton_txt'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'serialNum',
    descending: false
  };

  constructor(config: AppConfig,
    private receptionService: ReceptionService,
    private authService: AuthService, private nurseService: NurseService, private commonUtil: CommonUtil,
    private router: Router, private spinnerService: SpinnerService, private location: Location, private activeroute: ActivatedRoute) {
    this.config = config.getConfig();
    this.patientFirstName = '';
    if (Config.portal.doctorOptions.enablePrescriptionQuestionnaire == true) {
      const viewQuestinnaireSection = {
        display: 'Prescription Questionnaire',
        label: 'View Questionnaire',
        style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
        filter: 'action',
        type: 'button',
        event: 'questionnaireEvent',
        sort: false,
        conditions: [
          {

            condition: 'default',
            label: 'View Questionnaire',
            style: 'btn engage_txt'
          }
        ]
      }
      this.columns.push(viewQuestinnaireSection)
    }

    if (Config.portal.specialFeatures && Config.portal.specialFeatures.enablePhrForNurse == true) {
      const viewQuestinnaireSection = {
        display: 'Patient History',
        label: 'View History',
        style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
        filter: 'action',
        type: 'button',
        event: 'phrEvent',
        sort: false,
        conditions: [
          {

            condition: 'default',
            label: 'View History',
            style: 'btn engage_txt'
          }
        ]
      }
      this.columns.push(viewQuestinnaireSection)
    }

  }

  ngOnInit(): void {
    console.log("id" + this.authService.userAuth.employeeId + "");
    this.doctorId = 0;// no doctorId is required, so it is 0.
    this.pocId = this.authService.userAuth.pocId;
    this.empId = this.authService.userAuth.employeeId;
    this.roleId = RoleConstants.nurseRoleId; // for vitals
    this.getConsultationList();
    // this.load();
  }

  // load() {
  //   console.log("====>>>")
  //   setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
  //   // location.reload();
  //   }
  getConsultationQueueRequest(): ConsultationQueueRequest {
    let date = new Date().setHours(0, 0, 0, 0);
    let request: ConsultationQueueRequest = new ConsultationQueueRequest();
    request.pocId = this.pocId;
    request.empId = this.empId;
    request.doctorId = this.doctorId;
    request.roleId = this.roleId;
    request.date = date;
    request.searchByName = this.patientFirstName;
    request.digiQueue = false;
    request.filterStatus = this.filterStatus;
    return request;
  }

  async getConsultationList() {
    let request: ConsultationQueueRequest = this.getConsultationQueueRequest();
    this.spinnerService.start();
    this.dataMsg = null;
    await this.receptionService.getDoctorConsultationQueueFromServer(request).then(patientQueueList => {
      this.spinnerService.stop();
      this.patientList = new Array<QueueConsult>();
      // console.log("PatientConsultationQueueList Response:: " + JSON.stringify(patientQueueList));
      this.patientConsultationQueueList = patientQueueList;
      let index = 0;
      this.patientConsultationQueueList.forEach((ele, i) => {
        if (ele.status != 6 && ele.bookingSubType != 1) {
          let queueOb: QueueConsult = { serialNum: ++index, patientQueue: ele };
          this.patientList.push(queueOb);
        }
      });
      this.total = this.patientList.length;
      this.dataMsg = this.total <= 0 ? 'No Data Found' : '';
    }).catch(err => {
      if (err)
        console.log(err);
    });;
  }

  onDiscountDropDownChange(index: number) {
    this.filterStatus = index;
    this.patientList = new Array<QueueConsult>();
    this.getConsultationList();
  }
  onRefresh() {
    this.isError = false;
    this.filterStatus = 0;
    this.dropDownIndex = 0;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.patientFirstName = "";
    this.scrollPosition = 1;
    this.time = new Date(); // current Date
    this.time = this.time.getTime(); // converting to timeStamp;
    this.patientList = new Array<any>();
    this.total = 0;
    $('#search').val('');
    console.log("onRefresh:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.patientFirstName);
    this.getConsultationList();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }
  validateToOnlyAlphabets(e) {
    return this.commonUtil.validateInputes(e, 1)
  }

  onSearch() {
    this.errorMessage = new Array();
    this.isError = false;
    this.showMessage = false;
    this.patientFirstName = this.patientFirstName.trim();
    let request: ConsultationQueueRequest = this.getConsultationQueueRequest();
    if (this.patientFirstName.length >= 3) {
      this.scrollPosition = 1;
      // this.time = new Date(); // current Date
      this.time = new Date().getTime(); // converting to timeStamp;      
      // console.log("onSearch:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.patientFirstName);
      this.patientConsultationQueueList = new Array<any>();
      this.spinnerService.start();
      this.dataMsg = null;
      this.receptionService.getDoctorConsultationQueueFromServer(request).then(responseList => {
        this.spinnerService.stop();
        this.patientConsultationQueueList = responseList;
        this.patientList = new Array<QueueConsult>();
        if (this.patientConsultationQueueList.length > 0) {
          let index = 0;
          this.patientConsultationQueueList.forEach((ele, i) => {
            if (ele.status != 6 && ele.bookingSubType != 1) {
              let queueOb: QueueConsult = { serialNum: ++index, patientQueue: ele };
              this.patientList.push(queueOb);
            }
          });
          this.total = this.scrollPosition = this.patientList.length;
          this.dataMsg = "";
        } else {
          this.isError = true;
          this.errorMessage[0] = this.dataMsg = "No Data Found.";
          this.showMessage = true;
        }
      }).catch(err => {
        if (err)
          console.log(err);
      });
    }
    else {
      this.isError = true;
      this.errorMessage[0] = "Please enter patient name..";
      this.showMessage = true;
    }
  }

  onButtonClicked(queueConsult: QueueConsult): void {
    this.nurseService.patientQ = queueConsult.patientQueue;
    // console.log("NurseService.PatientQ in onButtonClicked::" + JSON.stringify(this.nurseService.patientQ));
    this.router.navigate(['/app/nurse/vitalsreading']);
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "engageNowButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    }
    else if (e.event == "questionnaireEvent") {
      this.nurseService.patientQ = e.val.patientQueue;
      this.router.navigate(['/app/nurse/questionnaire']);
    } else if (e.event == "phrEvent") {
      this.router.navigate(["/app/onboarding/personal/" + e.val.patientQueue.patientProfileId + "/nurse"]);
    }
  }

  onPage(page: number): void {
    console.log("Pagination:: ");
  }

}
