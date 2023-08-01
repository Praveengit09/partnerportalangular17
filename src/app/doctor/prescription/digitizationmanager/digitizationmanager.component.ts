import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../app.config';
import { AuthService } from '../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { DoctorService } from '../../doctor.service';
import { PatientMedicalAdvise } from './../../../model/advice/patientMedicalAdvise';
import { PatientQueue } from './../../../model/reception/patientQueue';
import { CryptoUtil } from '../../../auth/util/cryptoutil';

@Component({
    selector: 'digitizationmanager',
    templateUrl: './digitizationmanager.template.html',
    styleUrls: ['./digitizationmanager.style.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DigitizationManagerComponent implements OnInit {
    config: any;
    empId: number;
    doctorId: number;
    pocId: number;
    digitizerEmpId: number;
    adviceId: number;


    total: number = 0;
    perPage: number = 10;
    size: number = 50;
    from: number = 0;
    stausFilterValue: number = -1;

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;

    digitizationQueueList: Array<PatientMedicalAdvise>;
    digitizeManagersList: Array<any>;
    digitizersList: Array<any>;
    selectedDigitizerName: string;
    selectedDigitizerEmpId: number;
    selectedItem = new PatientQueue();
    dataMsg: string = ' ';

    searchTerm: string = '';
    isWrongMobile: boolean = false;
    searchCriteria: number = 0;

    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 3);

    startDate: Date = new Date();
    endDate: Date = new Date();
    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    columns: any[] = [
        {
            display: 'Patient Information',
            variable: 'patientTitle patientFirstName patientLastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Doctor Name',
            variable: 'doctorTitle doctorFirstName doctorLastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Date',
            variable: 'date',
            filter: 'date',
            sort: false
        },
        {
            display: 'Time',
            variable: 'time',
            filter: 'time',
            sort: false
        },
        {
            display: 'Assign',
            label: 'Assign',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo',
            filter: 'action',
            type: 'button',
            event: 'assignButton',
            sort: true,
            variable: 'prescriptionDigitizationStatus',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Assign',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '1',
                    condition: 'gte',
                    label: 'Assigned',
                    style: 'btn width-100 mb-xs botton_txtdigo digitization-complete-btn disabled'
                }
            ]
        },
        {
            display: 'Digitizer Name',
            variable: 'digitizerfName digitizerlName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Status',
            label: 'Edit',
            style: 'btn btn-danger width-150 mb-xs botton_txtdigo',
            filter: 'action',
            type: 'button',
            event: 'editButton',
            sort: true,
            variable: 'prescriptionDigitizationStatus',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Edit',
                    style: 'btn btn-danger width-150 mb-xs botton_txtdigo digitization-btn'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Completed',
                    style: 'btn width-150 mb-xs botton_txtdigo digitization-complete-btn disabled'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'In Process',
                    style: 'btn width-150 mb-xs botton_txtdigo digitization-btn disabled'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Waiting for Approval',
                    style: 'btn width-150 mb-xs botton_txtdigo digitization-btn disabled'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Rejected',
                    style: 'btn width-150 mb-xs botton_txtdigo digitization-btn disabled'
                },
            ]
        },
        {
            display: 'View',
            label: 'View',
            style: 'btn width-100 btn-danger mb-xs botton_txtdigo digitization-complete-btn',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
            variable: 'prescriptionDigitizationStatus',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'View',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled digitization-view-btn'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'View',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled  '
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'View',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled digitization-view-btn'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'View',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'View',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo digitization-complete-btn'
                },
            ]
        }
    ];

    sorting: any = {
        column: 'orderId',
        descending: true
    };
    displayMedicalAdvice: any;

    constructor(config: AppConfig,
        private authService: AuthService,
        private doctorService: DoctorService, private router: Router,
        private spinnerService: SpinnerService, private commonUtil: CommonUtil,) {
        this.config = config.getConfig();
        this.pocId = this.authService.userAuth.pocId;
        this.doctorId = this.authService.userAuth.employeeId;
        this.empId = this.authService.userAuth.employeeId;

        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('queueStartDate') != null && window.localStorage.getItem('queueStartDate') != undefined) {
            this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('queueStartDate'))));
            this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('queueEndDate'))));
        }
    }

    ngOnInit() {
        this.from = 0;
        this.getDigitizationQueueList(); 
    }

    getDigitizationQueueList() {
        this.spinnerService.start();
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
            this.spinnerService.stop();
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Start Date should always be greater than end date';
            this.isError = true;
            this.showMessage = true;
            return;
        }
        let mobileNo = "";
        let doctorName = "";
        if (this.searchCriteria == 1) {
            doctorName = this.searchTerm;
            mobileNo = "";
        } else if (this.searchCriteria == 2) {
            doctorName = "";
            mobileNo = this.searchTerm;
        }
 
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('queueStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
        window.localStorage.setItem('queueEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

        this.doctorService.getDigitizationQueueForDigitizeManager(this.empId, this.from, this.size,
            this.commonUtil.convertOnlyDateToTimestamp(this.startDate),
            this.commonUtil.convertOnlyDateToTimestamp(this.endDate), 0, mobileNo, doctorName, this.pocId, this.stausFilterValue).then((data) => {
                console.log("Data: ", data);
                this.digitizationQueueList = data;
                this.spinnerService.stop();

                if (this.digitizationQueueList.length > 0) {
                    this.total = this.from = this.digitizationQueueList.length;
                } else {
                    this.dataMsg = 'No Data Found';
                }
            })
    }

    getDigitizeManagers() {
        this.spinnerService.start();
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;

        this.doctorService.getDigitizeManagers(this.pocId).then((data) => {
            this.digitizeManagersList = data;
            this.spinnerService.stop();
        })
    }

    startDateChoosen($event): void {
        this.startDate = $event;
        this.total = 0;
        this.from = 0;
        this.digitizationQueueList = new Array();
        this.getDigitizationQueueList();
    }

    endDateChoosen($event) {
        this.endDate = $event;
        this.total = 0;
        this.from = 0;
        this.digitizationQueueList = new Array();
        this.getDigitizationQueueList();
    }

    resetAndGetDigitizationQueueList() {
        this.digitizationQueueList = new Array();
        this.total = 0;
        this.from = 0;
        this.size = 50;
        this.getDigitizationQueueList();
    }


    clickEventHandler(e) {
        console.log(e);
        if (e.event == "editButton") {
            this.onEditButtonClicked(e.val);
        }
        if (e.event == "viewButton") {
            this.onViewButtonClicked(e.val)
        }
        if (e.event == "assignButton") {
            this.onAssignButtonClicked(e.val)
        }
    }

    onFilterChanged(value) {
        this.stausFilterValue = value;
        this.resetAndGetDigitizationQueueList();

    }

    onEditButtonClicked(item: PatientMedicalAdvise) {
        console.log("onEditButtonClicked: ", item);
        if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_INIT)
            this.generatePatientQueueFromPatientMedicalAdvise(item)
    }

    onViewButtonClicked(item: PatientMedicalAdvise) {
        console.log("onViewButtonClicked: ", item);
        if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_SENT_FOR_APPROVAL ||
            item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_COMPLETED) {
            this.displayMedicalAdvice = item;
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('displayMedicalAdvice', cryptoUtil.encryptData(JSON.stringify(this.displayMedicalAdvice)));
            this.router.navigate(['/app/doctor/digitizedprescription']);
        }
    }

    onAssignButtonClicked(item: PatientMedicalAdvise) {
        console.log("onAssignButtonClicked: ", item);
        this.adviceId = item.adviceId;

        if (item.prescriptionDigitizationStatus == PatientMedicalAdvise.DIGITIZATION_STATUS_INIT) {
            this.doctorService.getDigitizers(this.pocId).then((data) => {
                console.log("Digitizers: ", data);
                this.digitizersList = data;
                if (this.digitizersList.length > 0) {
                    (<any>$("#modeldigitizerslist")).modal({
                        show: true,
                        escapeClose: true,
                        clickClose: true,
                        showClose: true,
                        backdrop: true,
                        keyboard: false
                    });
                } else {
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = 'Digitizers Not Found';
                    this.isError = true;
                    this.showMessage = true;
                }
            });
        }
    }


  assignPrescriptionToDigitizer() {
        (<any>$("#modeldigitizerslist")).modal("hide");
        console.log(`selected digitizerName ${this.selectedDigitizerName}.`);
        console.log(`selected digitizerEmpId ${this.selectedDigitizerEmpId}.`);
        console.log(`alotted adviceId ${this.adviceId}.`);

        let item = {
            digitizerEmpId: this.selectedDigitizerEmpId,
            adviceId: this.adviceId
        }

        this.doctorService.assignPrescriptionToDigitizer(item).then(data => {
            console.log(data);
            if (data.statusCode == 201 || data.statusCode == 200) {
                console.log('Assigned Successfully..........')
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = data.statusMessage;
                this.isError = false;
                this.showMessage = true;
            }
            else {
                console.log('Unabled to Assign-------------')
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = data.statusMessage;
                this.isError = true;
                this.showMessage = true;
            }
        });
        this.resetAndGetDigitizationQueueList();
    }

    generatePatientQueueFromPatientMedicalAdvise(item: PatientMedicalAdvise) {
        let patientQueue = new PatientQueue();
        let commonUtil = new CommonUtil();
        patientQueue = JSON.parse(JSON.stringify(item));
        patientQueue.serviceId = item.serviceId;
        patientQueue.visitedTime = item.adviseGeneratedTime;
        patientQueue.bookingType = item.bookingType;
        patientQueue.bookingSubType = item.bookingSubType;
        patientQueue.patientProfileId = item.patientId;
        patientQueue.parentProfileId = item.parentProfileId;
        patientQueue.localDOBYear = commonUtil.getAge(item.patientDOB);
        patientQueue.pdfUrlWithHeader = item.advisePdfUrlWithHeader;
        patientQueue.pdfUrlWithoutHeader = item.advisePdfUrlWithoutHeader;
        patientQueue.time = item.time;
        patientQueue.patientTitle = item.patientTitle ? item.patientTitle : "";
        patientQueue.patientFirstName = item.patientFirstName;
        patientQueue.patientLastName = item.patientLastName ? item.patientLastName : '';
        patientQueue.patientDOB = item.patientDOB;
        patientQueue.patientGender = item.patientGender;
        patientQueue.bookingPocId = item.pocId;
        patientQueue.orderId = item.orderId;
        patientQueue.invoiceId = item.invoiceId;
        patientQueue.parentProfileId = item.parentProfileId;
        patientQueue.doctorId = item.doctorId;
        patientQueue.serviceId = item.serviceId;
        patientQueue.pocId = item.pocId;
        patientQueue.doctorFirstName = item.doctorFirstName;
        patientQueue.doctorLastName = item.doctorLastName ? item.doctorLastName : '';
        patientQueue.doctorTitle = item.doctorTitle;
        patientQueue.profilePic = item.patientProfilePic;
        patientQueue.patientContactNumber = item.patientContactNumber;
        patientQueue.bookingSubType = item.bookingSubType;

        this.doctorService.patientQueue = patientQueue;
        this.doctorService.isFrom = "digitizationqueue";

        let cryptoUtil: CryptoUtil = new CryptoUtil();
        window.localStorage.setItem('isFromDigitization', cryptoUtil.encryptData(this.doctorService.isFrom));

        window.localStorage.removeItem('patientQueue');
        window.localStorage.removeItem("patientMedicalAdvise");
        window.localStorage.setItem("patientQueue", cryptoUtil.encryptData(JSON.stringify(this.doctorService.patientQueue)));
        this.doctorService.patientMedicalAdvise = new PatientMedicalAdvise();

        this.router.navigate(['./app/doctor/prescription']);
    }

    onPage(page: number): void {
        this.from = 0;
        this.getDigitizationQueueList();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.onSearch();
        }
    }

    onSearch() {
        console.log("NameOrMob::" + this.searchTerm);
        this.searchTerm = this.searchTerm.trim();
        if (isNaN(parseInt(this.searchTerm))) {
            this.searchCriteria = 1;
        }
        else if (this.searchTerm.length < 10 || this.searchTerm.length > 10
            || !this.searchTerm || this.searchTerm.length < 3) {
            this.isWrongMobile = true;
        } else {
            this.searchCriteria = 2;
        }

        if (this.isWrongMobile) {
            this.errorMessage = new Array();
            this.errorMessage[0] = 'Enter valid mobile no.';
            this.isError = true;
            this.showMessage = true;
        }

        this.isWrongMobile = false;
        this.from = 0;
        this.digitizationQueueList = new Array<PatientMedicalAdvise>();
        this.dataMsg = "Loading...";
        this.getDigitizationQueueList();
    }

    onRefresh() {
        this.isWrongMobile = false;
        this.searchTerm = '';
        this.from = 0;
        this.digitizationQueueList = new Array<any>();
        this.total = 0;
        this.stausFilterValue = -1;
        $('#search').val('');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.getDigitizationQueueList();
    }

}

