import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsService } from './../../../diagnostics.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { ViewEncapsulation, Component } from '@angular/core';
import { DateUtil } from 'src/app/base/util/dateutil';

@Component({
    selector: 'slotsummarydashboard',
    templateUrl: './slotdashboard.template.html',
    styleUrls: ['./slotdashboard.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SlotSummaryDashboardComponent {

    isError: boolean;
    showMessage: boolean;
    errorMessage: Array<string>;

    pocId: number = 0;
    scheduleType: number = 1;
    slotResponse: any[] = [];
    displaySlotResponse : any[] = [];
    date: Date = new Date();
    totalBooked: number = 0;
    sortBy: number = 1;
    vendorCountDetails : any[] = [] ;
    totalOrderCount : number = 0;

    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);

    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'd MM yyyy'
    }

    constructor(private diagnosticsService: DiagnosticsService,
        private auth: AuthService, private commonUtil: CommonUtil, private spinnerService: SpinnerService) {
        this.pocId = auth.userAuth.pocId;
        this.getSlotSummaryList();
    }

    getSlotSummaryList() {
        this.totalBooked = 0;
        this.totalOrderCount = 0;
        this.spinnerService.start();
        this.diagnosticsService.getSlotSummaryList(this.pocId, this.commonUtil.convertOnlyDateToTimestamp(this.date), this.scheduleType).then((response) => {
            this.spinnerService.stop();
            if (response.length > 0) {
                this.slotResponse = response.filter(item => item.dateSlots.length > 0);
                this.slotResponse.forEach((item) => {
                    item.totalAvailableSlots = item.dateSlots.length * item.pplPerSlot; 
                    item.totalBooked = 0;
                    item.dateSlots.forEach(doc => {
                        doc.filled = item.pplPerSlot - doc.vacantSlots;
                        doc.timeString = this.getStringTimeFromTimeStamp(doc.time, doc.expireTime);
                        item.totalBooked += doc.filled;
                    });
                    if (this.sortBy == 1)
                        item.dateSlots = this.sortByMostBooked(item.dateSlots);
                    else if (this.sortBy == 2)
                        item.dateSlots = this.sortByTime(item.dateSlots);
                    item.vacantSlots = item.totalAvailableSlots - item.totalBooked; 
                    this.totalBooked += item.totalBooked;
                });
                this.displaySlotResponse = this.slotResponse;
            }
            else {
                this.slotResponse = [];
                this.displaySlotResponse = this.slotResponse;
            }
        });
        this.getVendorOrderAssignedCount();
    }

    getVendorOrderAssignedCount(){
       
        let vendorRequestBody : any = {};
            vendorRequestBody.pocIdList = [];
            vendorRequestBody.isExcel = false;
            vendorRequestBody.toEmail = "";
            vendorRequestBody.emailReportId = 0;
            vendorRequestBody.empId = this.auth.userAuth.employeeId;
            vendorRequestBody.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.date);
            vendorRequestBody.toDate = this.commonUtil.convertOnlyDateToTimestamp(new Date(new Date().setDate(this.date.getDate() + 2)));
            vendorRequestBody.employeeRequest = 0;
            console.log(vendorRequestBody.fromDate + " " + vendorRequestBody.toDate)

        this.diagnosticsService.getVendorAssignedOrderCount(vendorRequestBody).then((response)=>{
            if(response.length > 0){
                this.vendorCountDetails = response;
                response.forEach(vendor =>{
                    this.totalOrderCount += vendor.orderCount ;
                })
                console.log(response);
            }
        })
    }

    getStringTimeFromTimeStamp(startTime: number, expireTime : number) {
        var start = new Date(startTime);
        var end = new Date(expireTime);
        var startHours = start.getHours();
        var endHours = end.getHours();
        var ampm_start = startHours >= 12 ? 'PM' : 'AM';
        var ampm_end = endHours >=12 ? 'PM' : 'AM';
        startHours = startHours % 12;
        endHours =endHours % 12;
        startHours = startHours ? startHours : 12; // the hour '0' should be '12'
        endHours = endHours ? endHours : 12;
        var strTime = startHours + ' ' + ampm_start + ' to ' + endHours + ' ' + ampm_end ;
        return strTime;
    }

    refreshSlots(){
        this.sortBy = 1;
        this.getSlotSummaryList();
    }

    sortByMostBooked(res) {
        res = this.sortByTime(res);
        res.sort(function (a, b) {
            if (a.filled > b.filled) return -1;
            if (a.filled < b.filled) return 1;
            return 0;
        })
        return res;
    }

    sortByTime(res) {
        res.sort(function (a, b) {
            return a.time - b.time;
        })
        return res;
    }

    onChangeSort(number) {
        this.slotResponse.forEach(item => {
            if (number == 1)
                item.dataSlots = this.sortByMostBooked(item.dateSlots);
            else if (number == 2)
                item.dataSlots = this.sortByTime(item.dateSlots);
        })
    }

    onClusterFilter(number){
        this.displaySlotResponse = [];
        if(number >= 0)
            this.displaySlotResponse.push(this.slotResponse[number]);
        else
            this.displaySlotResponse = this.slotResponse;
    }

}