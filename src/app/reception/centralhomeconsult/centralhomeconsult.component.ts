import { SpinnerService } from './../../layout/widget/spinner/spinner.service';
import { STATUSCOUNT } from './statuscount';
import { AppConfig } from '../../app.config';
import { AuthService } from '../../auth/auth.service';
import { ReceptionService } from '../reception.service';
import { DateUtil } from '../../base/util/dateutil';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { PocAdviseData } from '../../model/poc/poc-advise-data';
import { SlotBookingDetails } from '../../model/basket/slotBookingDetails';
import { BusinessAdminService } from '../../businessadmin/businessadmin.service';
import { EmployeePocMapping } from '../../model/employee/employeepocmapping';

@Component({
    selector: 'centralhomeconsult',
    templateUrl: './centralhomeconsult.template.html',
    styleUrls: ['./centralhomeconsult.style.scss'],
    providers: [BusinessAdminService],
    encapsulation: ViewEncapsulation.Emulated
})

export class CentralHomeConsultComponent implements OnInit {
    pocList: Array<EmployeePocMapping> = new Array<EmployeePocMapping>();
    centralHomeConsultList: Array<SlotBookingDetails>;
    selectedRequest: SlotBookingDetails;
    dateList: Array<any>;
    pocIdList: Array<number> = new Array<number>();
    tempPocIdlist: Array<number> = new Array<number>();
    scrollPosition: number;
    startDate: number;
    endDate: number;
    skip: number = 0;
    date: any;
    config: any;
    empId: number;
    selectedPOC: any;
    total: number = 0;
    perPage: number = 10;
    countOfOrders: STATUSCOUNT;
    pdfHeaderType: number;
    isError: boolean = false;
    showErrorMessage: boolean = false;
    errorMessage: Array<string>;
    dataMsg: string = ' ';

    columns: any[] = [
        {
            display: 'Order Id',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Name',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName',
            filter: 'nametitle',
            sort: false
        },
        // {
        //     display: 'Poc Details',
        //     variable: 'pocDetails.pocName pocDetails.contactList[0]',
        //     filter: 'text',
        //     sort: false
        // },
        {
            display: 'Centre Name',
            variable: 'pocDetails.pocName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Provider Name',
            variable: 'doctorDetail.firstName doctorDetail.lastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'slotDate',
            filter: 'date',
            sort: false
        },
        {
            display: 'Time',
            variable: 'slotTime',
            filter: 'time',
            sort: false
        },
        {
            display: 'Status',
            variable: 'homeConsultStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '2',
                    condition: 'lte',
                    label: 'Pending',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '3',
                    condition: 'lte',
                    label: 'Reached Patient',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '4',
                    condition: 'lte',
                    label: 'Started Consultation',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed',
                    // style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '19',
                    condition: 'eq',
                    label: 'Cancelled',
                    // style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '10',
                    condition: 'eq',
                    label: 'Waiting For Doctor Approval',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Approved',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '12',
                    condition: 'eq',
                    label: 'Rejected',
                    // style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                }
            ]
        },
        {
            display: 'Payment Receipt',
            label: 'assets/img/partner/pdf_icon_read.png',
            filter: 'action',
            type: 'image',
            sort: false,
            variable: 'payment.paymentStatus',
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_read.png',
                    style: ''
                },
                {
                    value: '0',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                    style: 'disabled'
                },
                {
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                    style: 'disabled'
                }
            ]
        }
    ];

    sorting: any = {
        column: 'orderId',
        descending: true
    };

    constructor(config: AppConfig, private authService: AuthService, private receptionService: ReceptionService,
        private businessAdminService: BusinessAdminService, private spinnerService: SpinnerService
    ) {
        this.empId = this.authService.userAuth.employeeId;
        this.dateList = DateUtil.getMonthsList((new Date().getFullYear() - 1));
    }

    ngOnInit() {
        this.getPocList(this.empId);
        this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
    }

    getCentralHomeConsultationList() {
        this.isError = false;
        this.errorMessage = new Array();
        this.showErrorMessage = false;
        this.dataMsg = 'Loading....';
        this.receptionService.getCentralHomeConsultationList(this.startDate, this.endDate, 0, 0, this.pocIdList, "", "", this.skip).then((response) => {
            if (this.skip > 0) {
                this.centralHomeConsultList.push.apply(this.centralHomeConsultList, response)

            } else {
                this.centralHomeConsultList = new Array();
                this.centralHomeConsultList = response;
            }
            this.total = this.centralHomeConsultList.length;

            // this.centralHomeConsultList = response;
            for (let i = 0; i < this.centralHomeConsultList.length; i++) {
                if (this.centralHomeConsultList[i].cancellationStatus == 0) {
                    this.centralHomeConsultList[i].homeConsultStatus = this.centralHomeConsultList[i].invoiceCompletionStatus;
                }
                else {
                    this.centralHomeConsultList[i].homeConsultStatus = 19;
                }
            }
            if (this.centralHomeConsultList != undefined) {
                if (this.centralHomeConsultList.length > 0) {

                    this.total = this.scrollPosition = this.centralHomeConsultList.length;
                    this.isError = false;
                    this.errorMessage = new Array();
                    this.showErrorMessage = false;
                }
                else {
                    // this.isError = true;
                    // this.errorMessage = new Array();
                    // this.errorMessage[0] = "data not found.";
                    // this.showErrorMessage = true;
                    this.dataMsg = 'No Data Found';
                }

            }

        })

    }

    getPocList(empId: number): void {
        this.spinnerService.start();
        this.businessAdminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
            this.spinnerService.stop();
            if (response && response.length > 0) {
                this.pocList = response;
                this.pocIdList = new Array<number>();
                for (let i = 0; i < this.pocList.length; i++) {
                    this.pocIdList[i] = this.pocList[i].pocId;
                }
                this.tempPocIdlist = this.pocIdList;
                this.dateChoosen(0);
                this.getCountofOrders();
                this.getCentralHomeConsultationList();

            }
        })
            .catch(error => {
                console.error('Error occurred while fetching the employee POCs', error);
            });
    }

    onPage(page) {
        this.skip = this.total;
        this.getCentralHomeConsultationList();
    }

    onSelectPoc(index: number) {
        if (index >= 0) {
            this.selectedPOC = this.pocList[index];
            this.pocIdList = new Array<number>();
            this.pocIdList[0] = this.selectedPOC.pocId;

        }
        else {
            this.pocIdList = new Array<number>();
            this.pocIdList = this.tempPocIdlist;
        }
        this.getCentralHomeConsultationList();
        this.getCountofOrders();

    }

    getCountofOrders() {
        this.receptionService.getCountOfOrders(this.startDate, this.endDate, this.pocIdList).then((response) => {
            this.countOfOrders = response;
        });
    }


    dateChoosen(index: number): void {
        let dateObj = this.dateList[index];
        this.startDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month, dateObj.year);
        this.endDate = DateUtil.getTimeInMillisFromMonthYear(dateObj.month + 1, dateObj.year) - 1;
        this.getCentralHomeConsultationList();
        this.getCountofOrders();
    }

    onImageClicked(item: SlotBookingDetails): void {
        this.selectedRequest = item;
        if (this.selectedRequest.payment.paymentStatus == 1) {
            if (this.pdfHeaderType == 0) {
                this.authService.openPDF(this.selectedRequest.pdfUrlWithHeader)
            } else {
                this.authService.openPDF(this.selectedRequest.pdfUrlWithoutHeader)
            }
        }
    }

}