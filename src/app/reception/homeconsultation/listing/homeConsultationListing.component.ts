import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { AppConfig } from './../../../app.config';
import { AuthService } from './../../../auth/auth.service';
import { NavigationStart, Router, ActivatedRoute, Params } from '@angular/router';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { ReceptionService } from './../../../reception/reception.service';
import { RoleConstants } from '../../../constants/auth/roleconstants';
import { Doctor } from '../../../model/employee/doctor';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { Location } from '@angular/common';
import { DoctorDetails } from '../../../model/employee/doctordetails';
import { DoctorService } from '../../../doctor/doctor.service';

@Component({
    selector: 'homeConsultationListing',
    templateUrl: './homeConsultationListing.template.html',
    styleUrls: ['./homeConsultationListing.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class HomeConsultationListingComponent {
    config: any;
    total: number = 0;
    patientName: string;
    mobileNo: string;
    perPage: number = 10;
    date: number;
    dataMsg: string = ' ';
    // spin:boolean=true;
    errorMessage: Array<string>;
    isError: boolean = false;
    showMessage: boolean = false;
    skip: number = 0;
    time: any;
    isChecked: boolean = true;
    offset: number = 50;
    isCorrectMobile: boolean = false;
    isEmpty: boolean = false;
    dropDownIndex: number = 0;
    searchCriteria: string;
    pocId: number;
    empId: number;
    isName: boolean = true;
    isNumber: boolean = false;
    doctorId: number;
    homeConsultationListIndex: string = 'homeConsultationListIndex';
    selectedDoctorIndex: number;
    searchTerm: any;
    hasHomeconsultation: boolean;
    selectedDoctor: DoctorDetails;
    doctorList: Doctor[] = new Array<Doctor>();
    filteredDoctorList: Doctor[] = new Array<Doctor>();
    doctorHomeConsultList: Array<SlotBookingDetails>;
    tempdoctorHomeConsultList: Array<SlotBookingDetails>;
    // tempDoctor:Array<SlotBookingDetails>;
    selectedRequest: SlotBookingDetails;
    pdfHeaderType: number;

    columns: any[] = [
        {
            display: 'Order Id',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Patient Information',
            variable:
                `patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName, \n 
            deliveryAddress.address1,deliveryAddress.address2, \n 
            deliveryAddress.cityName, \n 
            deliveryAddress.stateName, \n 
            deliveryAddress.cityName deliveryAddress.pinCode, \n 
            patientProfileDetails.contactInfo.mobile`,
            filter: 'nametitle',
            sort: false
        },

        {
            display: 'Doctor Name',
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
            variable: 'payment.paymentStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Paid'
                },
                {
                    value: '0',
                    condition: 'lte',
                    label: 'Not Paid'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    condition: 'default',
                    label: 'Not Paid'
                }
            ]
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
            variable: 'homeConsultStatus',
            conditions: [
                {
                    value: '2',
                    condition: 'lte',
                    label: 'Pending',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '3',
                    condition: 'lte',
                    label: 'Reached Patient',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '4',
                    condition: 'lte',
                    label: 'Started Consultation',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed',
                    style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '19',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-200 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '10',
                    condition: 'eq',
                    label: 'Waiting For Doctor Approval',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Approved',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '12',
                    condition: 'eq',
                    label: 'Rejected',
                    style: 'btn btn-danger width-200 mb-xs botton_txtdigo done_txt'
                }

            ]
        },
        {
            display: 'Receipt',
            label: 'assets/img/partner/pdf_icon_read.png',
            filter: 'action',
            type: 'image',
            event: 'pdfButton',
            sort: false,
            variable: 'payment.paymentStatus',
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_read.png',
                },
                {
                    value: '0',
                    condition: 'eq',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                    style: ' hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'assets/img/partner/pdf_icon_disabled.png',
                    style: 'hide_btndigo disabled'
                }
            ]
        }
    ];

    sorting: any = {
        column: 'orderId',
        descending: true
    };

    constructor(config: AppConfig,
        private receptionService: ReceptionService,
        private authService: AuthService, private location: Location,
        private router: Router, private spinnerService: SpinnerService, private doctorService: DoctorService) {
        this.config = config.getConfig();
        this.pocId = this.authService.userAuth.pocId;
        this.empId = this.authService.userAuth.employeeId;
        this.doctorId = 0;
        this.patientName = "";
        this.mobileNo = "";
        this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
    }

    ngOnInit(): void {
        this.getDoctorslist();
        this.getHomeConsultations();
    }
    // callsetInterval(){
    //     this.spin = false;

    //     setInterval(()=> {this.getHomeConsultations()}, SystemConstants.REFRESH_TIME);

    // }

    // load() {
    //     console.log("====>>>")
    //     setTimeout(() => { location.reload() }, SystemConstants.REFRESH_TIME);
    //     // location.reload();
    //     }

    getDoctorslist(): void {
        this.receptionService.getDoctorList(this.pocId, this.empId, RoleConstants.receptionRoleId).then((doctor) => {
            this.doctorList = doctor;
            for (let i = 0; i < this.doctorList.length; i++) {
                this.doctorList[i].employeePocMappingList.forEach(obj =>{
                    if (obj.participationSettings.homeConsultationAvailable == true)
                    this.filteredDoctorList.push(this.doctorList[i]);
                });
               
            }
            // console.log("%%"+this.filteredDoctorList)


        });
    }

    // Make the service call to fetch the home consultations list on autorefresh
    pageRefresh(event) {
        if (this.searchTerm == undefined || this.searchTerm.length == 0 || this.searchTerm == " ") {
            this.receptionService.getDoctorHomeConsultationList(this.doctorId, this.empId, this.pocId, this.patientName, this.mobileNo, this.skip).then((doctor) => {
                this.doctorHomeConsultList = doctor;
                this.listing();
            });
        }
        else {
            this.receptionService.getDoctorHomeConsultationList(this.doctorId, this.empId, this.pocId, this.patientName, this.mobileNo, this.skip).then((response) => {
                this.doctorHomeConsultList = response;
                this.listing();
            });
        }

    }

    getHomeConsultations() {
        this.doctorId = 0;
        this.patientName = "";
        this.mobileNo = "";
        this.spinnerService.start();
        this.receptionService.getDoctorHomeConsultationList(this.doctorId, this.empId, this.pocId, this.patientName, this.mobileNo, this.skip).then((response) => {
            this.spinnerService.stop();
     
            this.doctorHomeConsultList = response;
            this.tempdoctorHomeConsultList = this.doctorHomeConsultList;
            this.total = this.skip = this.doctorHomeConsultList.length;
            this.listing()
        }).catch(()=>{
               this.spinnerService.stop();
        })
    }

    onDoctorDropDownChange(selectedDoctorIndex) {
        console.log("refresh");
        this.selectedDoctorIndex = selectedDoctorIndex;
        this.doctorHomeConsultList = new Array<SlotBookingDetails>();
        if (selectedDoctorIndex == 0) {
            this.getRefreshedorderList();
        }
        if (selectedDoctorIndex > 0) {
            this.selectedDoctor = this.filteredDoctorList[selectedDoctorIndex - 1];
            for (let i = 0; i < this.tempdoctorHomeConsultList.length; i++) {
                if (this.selectedDoctor.empId == this.tempdoctorHomeConsultList[i].doctorId) {
                    this.doctorHomeConsultList.push(this.tempdoctorHomeConsultList[i]);
                }
            }
        }
    }

    searchIndex(index: number) {
        if (index == 0) {
            this.isName = true;

            this.isNumber = false;
        }
        else {
            this.isName = false;
            this.isNumber = true;
        }
    }

    onInputChange() {
        this.total = this.skip = 0;
    }

    getRefreshedorderList() {
        $('#search').val('');
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.searchTerm = "";
        this.dropDownIndex = 0;
        this.skip = 0;
        this.getHomeConsultations();
    }

    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getPatientListBasedOnPhoneNumberOrName();
        }
    }

    getPatientListBasedOnPhoneNumberOrName(): void {
        console.log("refresh");
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        var str1 = $('#search').val().toString().trim();
        var str = str1.replace(/\s/g, " ");
        if (isNaN(parseInt(str))) {
            this.searchIndex(0);
        } else {
            this.searchIndex(1);
            if (str.length != 10) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage.push('Please Enter valid mobile number');
                this.showMessage = true;
                return;
            }
        }

        if (!str) {
            window.alert("Please enter valid Patient's Name/Mobile Number");
            this.searchTerm = "";
        }

        console.log("^^^^" + str);
        if (this.isName == true && str != "") {
            if (isNaN(parseInt(str))) {
                this.patientName = str;
                this.mobileNo = "";
            }
            else {
                this.patientName = "";
                this.mobileNo = "";
                window.alert("Please enter valid Patient Name");
                this.searchTerm = "";
            }
        }
        else if (this.isNumber) {
            if (!isNaN(parseInt(str))) {
                this.mobileNo = str;
                this.patientName = "";
            }
            else {
                this.mobileNo = "";
                this.patientName = "";
                window.alert("Please enter valid Mobile Number");
                this.searchTerm = "";
            }
        }
        else {
            this.patientName = "";
            this.mobileNo = "";
        }


        this.spinnerService.start();
        this.dataMsg = 'Loading......';
        this.receptionService.getDoctorHomeConsultationList(this.doctorId, this.empId, this.pocId, this.patientName, this.mobileNo, this.skip).then((doctor) => {

            setTimeout(() => {
                this.spinnerService.stop();
                if (this.skip > 0) {
                    this.doctorHomeConsultList.push.apply(this.doctorHomeConsultList, doctor)
                } else {
                    this.doctorHomeConsultList = new Array();
                    this.doctorHomeConsultList = doctor;
                }
                // this.doctorHomeConsultList = doctor;
                // this.total = this.skip =  this.doctorHomeConsultList.length;
                this.listing();
                if (this.doctorHomeConsultList.length > 0) {
                    this.total = this.skip = this.doctorHomeConsultList.length;
                    this.isError = false;
                    this.errorMessage = new Array();
                    this.showMessage = false;
                } else {
                    // this.isError = true;
                    // this.errorMessage = new Array();
                    // this.errorMessage[0] = "data not found.";
                    // this.showMessage = true;
                    this.dataMsg = 'No Data Found'
                }

            }, 2000)
        });
    }

    onButtonClicked(item: SlotBookingDetails): void {
        this.selectedRequest = item;
        console.log("@@this" + JSON.stringify(this.selectedRequest));
        if (this.selectedRequest.homeConsultStatus != 5 && this.selectedRequest.homeConsultStatus != 19 && this.selectedRequest.homeConsultStatus != 12 && this.selectedRequest.homeConsultStatus != 10)
            this.router.navigate(['app/reception/homeconsult/update']);
        if (this.selectedRequest.homeConsultStatus == 12)
            this.router.navigate(['app/reception/homeconsult/request']);
        if (this.selectedRequest.homeConsultStatus == 10) {
            console.log('selectedrequest' + JSON.stringify(this.selectedRequest));
            this.router.navigate(['app/reception/homeconsult/edit']);
        }

    }

    onImageClicked(item: SlotBookingDetails): void {
        if (item.payment.paymentStatus != 1) {
            return;
        }
        this.selectedRequest = item;
        if (this.selectedRequest.payment.paymentStatus == 1) {
            if (this.pdfHeaderType == 0) {
                this.authService.openPDF(this.selectedRequest.pdfUrlWithHeader)
            } else {
                this.authService.openPDF(this.selectedRequest.pdfUrlWithoutHeader)
            }
        }
    }

    clickEventHandler(e) {
        console.log(e);
        if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        }
        else if (e.event == 'pdfButton') {
            this.onImageClicked(e.val);
        }
    }

    onPage(page: number): void {

        // this.skip = +page * +this.perPage;
        if (this.searchTerm)
            this.getPatientListBasedOnPhoneNumberOrName();
        else
            this.getHomeConsultations();

    }

    createNewRequest(): void {
        this.router.navigate(['app/reception/homeconsult/request']);
    }

    ngOnDestroy(): void {
        if (this.selectedRequest != undefined && this.selectedRequest != null) {

            if (this.selectedRequest.homeConsultStatus != 5 && this.selectedRequest.homeConsultStatus != 19 && this.selectedRequest.homeConsultStatus != 12 && this.selectedRequest.homeConsultStatus != 10) {
                this.receptionService.homeConsultTrack = this.selectedRequest;
                this.doctorService.doctorHomeConsultTrack = new SlotBookingDetails();
                this.receptionService.rejectedHomeConsultOrderTrack = new SlotBookingDetails();
            }
            if (this.selectedRequest.homeConsultStatus == 12) {
                this.receptionService.rejectedHomeConsultOrderTrack = this.selectedRequest;
                this.doctorService.doctorHomeConsultTrack = new SlotBookingDetails();
                this.receptionService.homeConsultTrack = new SlotBookingDetails();
            }
            if (this.selectedRequest.homeConsultStatus == 10) {
                console.log('selectedrequest' + JSON.stringify(this.selectedRequest));
                this.receptionService.doctorHomeConsultTrack = this.selectedRequest;
                this.receptionService.rejectedHomeConsultOrderTrack = new SlotBookingDetails();
                this.receptionService.homeConsultTrack = new SlotBookingDetails();
            }

        }
    }


    listing() {
        for (let i = 0; i < this.doctorHomeConsultList.length; i++) {
            if (this.doctorHomeConsultList[i].cancellationStatus == 0) {
                this.doctorHomeConsultList[i].homeConsultStatus = this.doctorHomeConsultList[i].invoiceCompletionStatus;
            }
            else {
                this.doctorHomeConsultList[i].homeConsultStatus = 19;
            }


        }
    }
}
