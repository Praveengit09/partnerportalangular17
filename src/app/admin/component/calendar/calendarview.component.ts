import { SlotBookingDetails } from './../../../model/basket/slotBookingDetails';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGrigPlugin from '@fullcalendar/timegrid';
import { AuthService } from './../../../auth/auth.service';
import { CommonUtil } from './../../../base/util/common-util';
import { AdminService } from './../../admin.service';

@Component({
  selector: 'calendar',
  templateUrl: './calendarview.template.html',
  styleUrls: ['./calendarview.style.scss']
})
export class CalendarviewComponent implements OnInit {

  @ViewChild('calendar', { static: false }) calendarComponent: FullCalendarComponent;

  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[];
  slotDuration = "00:20:00";
  slotLabelInterval = '00:20:00';
  allDaySlot: boolean = false;
  modalData: SlotBookingDetails = new SlotBookingDetails();
  showModal: boolean = false;
  empId: number;
  fromDate: number;
  toDate: number;
  colorCodeArray: string[] = ['#99ccff', '#ff9999', '#ffdb4d', '#ff5c33', '#ff4d88', '#2952a3', '#00b386']
  textColorArray: string[] = ['black', 'black', 'black', 'black', 'white', 'white', 'white']
  doctorIds: number[] = new Array<number>();
  doctorResponse: SlotBookingDetails[] = new Array<SlotBookingDetails>();
  response: any = new Array();
  temp: SlotBookingDetails[] = new Array<SlotBookingDetails>();

  constructor(private adminService: AdminService, private commonUtil: CommonUtil, private cd: ChangeDetectorRef,
    private authService: AuthService) {
    this.empId = this.authService.userAuth.employeeId;
  }

  ngOnInit() {
    this.currentWeek();
  }

  getCentralDoctorOrders(): void {
    console.log("Dates---->", this.fromDate, this.toDate);
    this.adminService.getCentralDoctorOrder(this.fromDate, this.toDate, 0, this.empId, 0, 200, "", "", "", 0, 0, 0,"",false,"","","").
      then(response => {
        this.doctorResponse = new Array();
        this.doctorResponse = this.temp = response;
        this.convertResponseToEvents();
      })
  }

  convertResponseToEvents() {
    this.doctorResponse.forEach((doc, index) => {
      let event = {
        id: index,
        title: 'Dr. ' + doc.doctorDetail.firstName + ' ' + (doc.doctorDetail.lastName ? doc.doctorDetail.lastName : ''),
        start: doc.slotDate + doc.slotTime + 19800000,
        end: doc.slotDate + doc.slotTime + 19800000 + 1200000,
      }
      var inlist = false;
      this.doctorIds.forEach(id => {
        if (id == doc.doctorDetail.empId) {
          inlist = true;
        }
      })
      if (!inlist) {
        this.doctorIds.push(doc.doctorDetail.empId);
      }
      let color = this.colorCodeArray[this.doctorIds.indexOf(doc.doctorDetail.empId)]
      color ? color : '#99e699'
      event['backgroundColor'] = color;
      event['textColor'] = this.textColorArray[this.doctorIds.indexOf(doc.doctorDetail.empId)]
      this.response.push(event);
    })
    this.calendarEvents = this.response.splice(0);
    this.cd.detectChanges();
  }

  currentWeek() {
    let today = new Date().getDay();
    let todayNo = new Date(this.commonUtil.convertOnlyDateToTimestamp(new Date)).getDate();
    let x = 7 - today;
    this.fromDate = new Date(this.commonUtil.convertOnlyDateToTimestamp(new Date)).setDate(todayNo - today);
    this.toDate = new Date(this.commonUtil.convertOnlyDateToTimestamp(new Date)).setDate(todayNo + x);
    this.getCentralDoctorOrders();
  }

  onNextweek() {
    this.fromDate = this.fromDate + 7 * 86400000;
    this.toDate = this.toDate + 7 * 86400000;
    let cal = this.calendarComponent.getApi();
    cal.gotoDate(this.fromDate);
    this.getCentralDoctorOrders();
  }
  onPrevWeek() {
    this.fromDate = this.fromDate - 7 * 86400000;
    this.toDate = this.toDate - 7 * 86400000;
    let cal = this.calendarComponent.getApi();
    cal.gotoDate(this.fromDate);
    this.getCentralDoctorOrders();
  }

  onNextDay() {
    this.fromDate = this.fromDate + 86400000;
    this.toDate = this.fromDate + 86400000;
    let cal = this.calendarComponent.getApi();
    cal.gotoDate(this.fromDate);
    this.getCentralDoctorOrders();
  }

  onPrevDay() {
    this.toDate = this.fromDate;
    this.fromDate = this.fromDate - 86400000;
    let cal = this.calendarComponent.getApi();
    cal.gotoDate(this.fromDate);
    this.getCentralDoctorOrders();
  }

  onEventClick(arg) {
    let id = arg.event.id;
    this.modalData = this.temp[id];
    this.showModal = true;
    (<any>$("#slotdetails")).modal("show");
  }
}