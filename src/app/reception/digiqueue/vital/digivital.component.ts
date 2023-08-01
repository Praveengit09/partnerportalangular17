import { Component, ViewEncapsulation } from '@angular/core';
import { AppConfig } from './../../../app.config';
import { AuthService } from './../../../auth/auth.service';
import { ConsultationQueueRequest } from './../../../model/slotbooking/consultationQueueRequest';
import { NurseService } from './../../../nurse/nurse.service';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { Router } from '@angular/router';
import { QueueConsult } from './../../../model/reception/queueConsult';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { RoleConstants } from './../../../constants/auth/roleconstants';
import { Location } from '@angular/common';
import { ReceptionService } from './../../reception.service';

@Component({
  selector: 'digivital',
  templateUrl: './digivital.template.html',
  styleUrls: ['./digivital.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DigiVitalComponent {
  config: any;
  total: number = 0;
  patientFirstName: string;
  perPage: number = 10;
  empId: number;
  pocId: number;
  doctorId: number;
  roleId: number;
  date: number;
  dataMsg: string;
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
      display: 'Doctor Name',
      variable: 'patientQueue.doctorFirstName patientQueue.doctorLastName',
      filter: 'text',
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
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'engagenowButton',
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
          style: 'btn width-100 mb-xs   hide_btntxt'
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
    private receptionService: ReceptionService, private location: Location,
    private authService: AuthService, private nurseService: NurseService,
    private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.patientFirstName = '';
  }

  ngOnInit(): void {
    console.log("id" + this.authService.userAuth.employeeId + "");
    this.doctorId = 0;// no doctorId is required, so it is 0.
    this.pocId = this.authService.userAuth.pocId;
    this.empId = this.authService.userAuth.employeeId;
    this.roleId = RoleConstants.digiManagerRoleId; // for digi manager
    this.getConsultationList();
    // this.load();
  }

  // load() {
  //   console.log("====>>>")
  //   setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
  //   // location.reload();
  //   }


  getConsultationList() {
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    let request: ConsultationQueueRequest = new ConsultationQueueRequest();
    request.pocId = this.pocId;
    request.empId = this.empId;
    request.doctorId = 0;
    request.roleId = this.roleId;
    request.date = date;
    request.searchByName = this.patientFirstName;
    request.digiQueue = true;
    console.log("check" + this.filterStatus);
    request.filterStatus = this.filterStatus;
    this.spinnerService.start();
    this.receptionService.getDoctorConsultationQueueFromServer(request).then(patientQueueList => {
      this.spinnerService.stop();
      console.log("PatientConsultationQueueList Response:: " + JSON.stringify(patientQueueList));
      this.patientConsultationQueueList = patientQueueList;
      let queueOb: QueueConsult;
      let index = 0;
      for (let i = 0; i < patientQueueList.length; i++) {
        //if (patientQueueList[i].patientStatus != 7) {
        if ((patientQueueList[i].status != 6 && patientQueueList[i].status != 1)
          && patientQueueList[i].bookingSubType != undefined && patientQueueList[i].bookingSubType == 1) {
          queueOb = new QueueConsult();
          queueOb.serialNum = ++index;
          queueOb.patientQueue = patientQueueList[i];
          this.patientList.push(queueOb);
        }
        //}
      }
      this.total = this.patientList.length;
      console.log("PatientList Response:: " + JSON.stringify(this.patientList));
    });
  }

  //   onDiscountDropDownChange(index: number)
  //   {
  //     if(index==0)
  //     {
  //      // console.log("DROP"+this.dropDownIndex);
  //       this.filterStatus=this.dropDownIndex;
  //       this.getConsultationList();

  //     }
  //     else if(index==1){
  //     //  console.log("DROP1"+this.dropDownIndex);
  //       this.filterStatus=this.dropDownIndex;
  //       this.getConsultationList();
  //     }
  //     else if(index==2)
  //     {
  // //console.log("DROP2"+this.dropDownIndex);
  //       this.filterStatus=this.dropDownIndex;
  //       this.getConsultationList();
  //     }
  //   }
  onDiscountDropDownChange(index: number) {
    this.filterStatus = this.dropDownIndex;
    this.patientList = new Array<QueueConsult>();
    this.getConsultationList();
  }
  onRefresh() {
    //this.isCorrectMobile = false;
    this.isError = false;
    this.filterStatus = 0;
    this.dropDownIndex = 0;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.patientFirstName = "";
    //this.isEmpty = false;
    this.scrollPosition = 1;
    this.time = new Date(); // current Date
    this.time = this.time.getTime(); // converting to timeStamp;
    // this.time = 1508755884122;
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

  onSearch() {
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let date = currentDate.getTime();
    let request: ConsultationQueueRequest = new ConsultationQueueRequest();
    request.pocId = this.pocId;
    request.empId = this.empId;
    request.doctorId = 0;
    request.roleId = this.roleId;
    request.searchByName = this.patientFirstName;
    request.date = date;
    request.digiQueue = true;
    request.filterStatus = this.filterStatus;
    console.log("DROP3" + this.filterStatus);
    console.log("patientName::" + this.patientFirstName);
    this.patientFirstName = this.patientFirstName.trim();
    if (this.patientFirstName.length > 3) {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      this.scrollPosition = 1;
      this.time = new Date(); // current Date
      this.time = this.time.getTime(); // converting to timeStamp;
      this.patientConsultationQueueList = new Array<any>();
      console.log("onSearch:" + this.pocId + " " + this.time + " " + this.offset + " " + this.scrollPosition + " " + this.patientFirstName);
      this.dataMsg = 'Loading......';
      this.receptionService.getDoctorConsultationQueueFromServer(request).then(responseList => {
        this.patientConsultationQueueList = responseList;
        if (this.patientConsultationQueueList.length > 0) {
          let queueOb: QueueConsult;
          this.patientList = new Array<QueueConsult>();
          let index = 0;
          for (let i = 0; i < responseList.length; i++) {
            if (responseList[i].status != 6 && responseList[i].bookingSubType != undefined && responseList[i].bookingSubType == 1) {
              queueOb = new QueueConsult();
              queueOb.serialNum = ++index;
              queueOb.patientQueue = responseList[i];
              this.patientList.push(queueOb);
            }
          }
          this.total = this.scrollPosition = this.patientList.length;
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = false;
        } else {
          // this.isError = true;
          // this.errorMessage = new Array();
          // this.errorMessage[0] = "No Data Found.";
          // this.showMessage = true;
          this.dataMsg = "No Data Found.";
        }
      });
    }
  }

  onButtonClicked(queueConsult: QueueConsult): void {
    this.nurseService.patientQ = queueConsult.patientQueue;
    console.log("NurseService.PatientQ in onButtonClicked::" + JSON.stringify(this.nurseService.patientQ));
    this.router.navigate(['/app/reception/digiqueue/vitalsreading']);
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "engagenowButton") {
      this.onButtonClicked(e.val);
    }

  }

  onPage(page: number): void {
    console.log("Pagination:: ");
  }

}
