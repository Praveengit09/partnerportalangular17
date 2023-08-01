import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { DiagnosticAdminService } from '../../diagnosticadmin.service';
import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';

@Component({
    selector: 'sampleinfodownload',
    templateUrl: './sampleinfodownload.template.html',
    styleUrls: ['./sampleinfodownload.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class SampleInfoDownloadComponent implements OnInit {

    selectedpocIdList: Array<number> = [];
    empId: number;
    pocList: Array<EmployeePocMapping> = [];
    selectedPocList: Array<EmployeePocMapping> = [];
    tempPocIdlist: Array<number> = new Array<number>();

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    dropdownSettings: {};
    fromDate: Date = new Date();
    toDate: Date = new Date();

    TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();

    datepickerOpts = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    }

    constructor(private diagAdminService: DiagnosticAdminService, private authService: AuthService,
        private commonUtil: CommonUtil, private adminService: BusinessAdminService, private cd: ChangeDetectorRef) {
        this.empId = this.authService.userAuth.employeeId;
    }

    ngOnInit() {
        // this.pocId = this.authService.userAuth.pocId;
        this.selectedpocIdList = [];
        this.getPocList(this.empId);
        console.log("this.formDate: " + this.fromDate + ">>>>" + this.toDate);
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'pocId',
            textField: 'pocName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true
        };

    }

    onDownloadButtonClick() {
        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array();
        console.log("selectedPocList: " + JSON.stringify(this.selectedPocList));
        this.selectedPocList.forEach(element => {
            this.selectedpocIdList.push(element.pocId);
        });
        console.log(">>>>>>> " + this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) +
            ">>>>>" + this.commonUtil.convertOnlyDateToTimestamp(this.toDate) + ">>>>" + this.selectedpocIdList);
        if (this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) >
            this.commonUtil.convertOnlyDateToTimestamp(this.toDate)) {
            this.errorMessage = new Array();
            this.errorMessage[0] = 'To Date is earlier than From Date. Please select valid from and to dates.';
            this.isError = true;
            this.showMessage = true;
            $('html, body').animate({ scrollTop: '0px' }, 300);
            return;
        }
        if ((this.commonUtil.convertOnlyDateToTimestamp(this.fromDate) &&
            this.commonUtil.convertOnlyDateToTimestamp(this.toDate))
            || this.selectedpocIdList) {
            this.diagAdminService.getSampleInfo(this.commonUtil.convertOnlyDateToTimestamp(this.fromDate),
                this.commonUtil.convertOnlyDateToTimestamp(this.toDate), this.selectedpocIdList).then(response => {
                    console.log("GotIt: ", response);
                    this.selectedpocIdList = [];

                    if (response.statusMessage != "Data not Found") {
                        this.fromDate = new Date();
                        this.toDate = new Date();
                        this.onDeSelectAll();

                        window.location.href = response.statusMessage;
                    }
                    else {
                        this.errorMessage = new Array();
                        this.errorMessage[0] = response.statusMessage;
                        this.isError = true;
                        this.showMessage = true;
                        $('html, body').animate({ scrollTop: '0px' }, 300);
                        return;
                    }
                })
        }
        //  else {
        //     this.errorMessage = new Array();
        //     this.errorMessage[0] = 'Please Select all the fields';
        //     this.isError = true;
        //     this.showMessage = true;
        //     $('html, body').animate({ scrollTop: '0px' }, 300);
        //     return;
        // }
    }

    getPocList(empId: number): void {
        this.adminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
            if (response && response.length > 0) {
                this.pocList = response;
            }
        })
            .catch(error => {
                console.error('Error occurred while fetching the employee POCs', error);
            });
    }

    onSelectPoc(poc) {

    }
    onPocDeSelect(poc) {

    }
    onSelectAll(items: any) {

    }
    onDeSelectAll() {
        this.selectedPocList = [];
        console.log("selectedpocIdList: " + JSON.stringify(this.selectedPocList));
    }
}