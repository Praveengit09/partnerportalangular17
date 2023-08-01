import { DoctorService } from './../../../doctor/doctor.service';
import { ToasterService } from './../../../layout/toaster/toaster.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DateUtil } from '../../../base/util/dateutil';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { CentralOrderInteraction } from '../../../model/common/centralorderinteraction';
import { AuthService } from './../../../auth/auth.service';
import { CommonUtil } from './../../../base/util/common-util';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { EmployeePocMapping } from './../../../model/employee/employeepocmapping';
import { ReceptionService } from './../../../reception/reception.service';
import { AdminService } from './../../admin.service';
import { Config } from './../../../base/config';


@Component({
    selector: 'centraldoctorbookings',
    templateUrl: './centraldoctorbookings.template.html',
    styleUrls: ['./centraldoctorbookings.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class CentralDoctorBookingsComponent implements OnInit {

    errorMessage: Array<string>;
    isDate: boolean = false;
    isDisplay: boolean = false;
    checkEndDate: boolean = false;
    startDate: Date = new Date();
    endDate: Date;
    brandFilter: boolean = false;
    endingDate: Date = new Date();
    todaysDate: number;
    total: number = 0;
    dataMsg: string = ' ';
    message: Array<string>;
    isError: boolean;
    error: string;
    pocId: number = 0;
    showMessage: boolean;
    perPage: number = 10;
    getcentraldoctorordersList: any = new Array<any>();
    pocRolesList: Array<EmployeePocMapping>;
    selectedPOC: EmployeePocMapping;
    pocIds = new Array<number>();
    tempLength: number = 0;
    futureDate = new Date().setMonth(new Date().getMonth() + 1);
    pastDate = new Date().setMonth(new Date().getMonth() - 12);
    empId: number;
    from: number = 0;
    disablePageClick: boolean;
    presentPageSize: number;
    filterPaymentStatus: number = 0;
    filterInvoiceStatus: number = 0;
    fiterCancellationStatus = 0;
    email: string = '';
    toEmail: string = '';
    patientFilter: boolean = true;
    doctorFilter: boolean = false;
    orderFilter: boolean = false;
    orderId: string = '';
    invoiceId: string = '';
    searchCriteria: number;
    search: string;
    doctorName: string = '';
    patientName: string = '';
    mobile: string = '';
    employeeName: string = '';
    bookingDetails: any;
    userData: CentralOrderInteraction = new CentralOrderInteraction();
    interactionStatus: string = '';
    modalTitle: string;
    modalId: any;
    comments: string;
    doctorInteractionComments: string = '';
    doctorInteractedStatus: string = '';
    consumerInteractionStatus: string = '';
    url: string = '';
    consumerInteractedComments: string;
    requestBody: CentralOrderInteraction = new CentralOrderInteraction();
    first: boolean;
    formattedDataString: string;
    bookedDate: any;
    smsTemplates: any;
    profileId: number;    
    sendMessage: string = '';
    sendSmsMsg: any;
    smsError: boolean = false;
    smsErrorMsg: Array<string> = [];

    datepickerOpts = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    datepickerOptEnd = {
        startDate: new Date(this.pastDate),
        endDate: new Date(this.futureDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy',
    };
    columns: any[] = [
        {
            display: 'OrderId',
            variable: 'orderId',
            filter: 'action',
            style: 'patientLink',
            event: 'hyperlink',
            type: 'hyperlink',
            sort: false
        },
        {
            display: 'InvoiceId',
            variable: 'baseInvoiceId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Customer Details',
            variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName, patientProfileDetails.contactInfo.mobile,  patientProfileDetails.contactInfo.email',
            filler: ',',
            filter: 'nametitle',
            sort: false
        },
        {
            display: 'Centre Name',
            variable: 'pocDetails.pocName pocDetails.contactList[0]',
            filter: 'text',
            sort: false
        },
        {
            display: 'Doctor Details',
            variable: 'doctorDetail.firstName doctorDetail.lastName doctorDetail.contactList[0]',
            filter: 'text',
            sort: false
        },
        {
            display: 'Booking Type',
            variable: 'bookingSubType',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Walk-In'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Digiroom'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Video Chat'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Walk-In'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Home Consultation'
                },
            ]
        },
        {
            display: 'Booking Details',
            variable: 'slotDateTime',
            filter: 'datetime',
            sort: false
        },
        {
            display: 'User Type',
            variable: 'bookingStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'New User'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Follow Up'
                },
                {
                    value: '2',
                    condition: 'gte',
                    label: 'Repeat'
                },
                {
                    condition: 'default',
                    label: 'New User'
                },
            ]
        },
        {
            display: 'Amount',
            variable: 'payment.finalAmount',
            filter: 'text',
            sort: false
        },
        {
            display: 'Discount Amount',
            variable: 'payment.otherDiscountAmount',
            filter: 'text',
            sort: false
        },
        {
            display: 'Payment Status',
            variable: 'payment.paymentStatus',
            filter: 'text',
            sort: false,
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Not Paid'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Paid'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Failed'
                }
            ]
        },
        {
            display: 'Payment Id',
            variable: 'payment.paymentId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Order Status',
            filter: 'text',
            sort: false,
            variable: 'invoiceCompletionStatus',
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Sample Collected'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Reports Pending'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'Pending'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Completed'
                }
            ]
        },
        {
            display: 'Patient Video',
            filter: 'text',
            sort: false,
            variable: 'videoConsultationSource',
            conditions: [
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Android App'
                },
                {
                    value: '4',
                    condition: 'eq',
                    label: 'iOS App'
                },
                {
                    value: '5',
                    condition: 'eq',
                    label: 'Web Portal'
                },
                {
                    condition: 'default',
                    label: 'NA'
                }
            ]
        },
        {
            display: 'Last Updated Time',
            variable: 'updatedTimestamp',
            filter: 'datetime',
        },
        {
            display: 'Cancellation Status',
            filter: 'text',
            sort: false,
            variable: 'enableCancel',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Active'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Cancelled By User'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Cancelled By Partner'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Cancelled'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Cannot Be Cancelled'
                }
            ]
        },
        {
            display: 'CANCEL',
            filter: 'action',
            type: 'button',
            event: 'cancelButton',
            sort: false,
            variable: 'enableCancel',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Cancel',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Cancel',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'Cancel',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                }
            ]
        },
        {
            display: 'RESCHEDULE',
            filter: 'action',
            type: 'button',
            event: 'rescheduleButton',
            sort: false,
            variable: 'enableCancel',
            conditions: [
                {
                    value: '0',
                    condition: 'eq',
                    label: 'Reschedule',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {
                    value: '2',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '3',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '1',
                    condition: 'eq',
                    label: 'Cancelled',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    value: '11',
                    condition: 'eq',
                    label: 'Reschedule',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                },
                {
                    condition: 'default',
                    label: 'Reschedule',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                }
            ]
        },
        {
            display: 'Order Creator',
            variable: 'creatorName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Customer Interaction Comments',
            variable: 'formattedConsumerInteraction',
            filter: 'htmlContent',
            sort: false,
            event: 'showAllConsumerInteractions',
            eventLabel: 'View All',
            eventVisibleWhenEmpty: false
        },
        {
            display: 'Doctor Interaction Comments',
            variable: 'formattedDoctorInteraction',
            filter: 'htmlContent',
            sort: false,
            event: 'showAllDoctorInteractions',
            eventLabel: 'View All',
            eventVisibleWhenEmpty: false
        },
        {
            display: 'Add Customer Interaction Status',
            filter: 'action',
            type: 'button',
            event: 'customerReviewButton',
            variable: 'consumerInteractionStatus',
            sort: false,
            conditions: [
                {
                    value: 'Interacted',
                    condition: 'eq',
                    label: 'Add Status',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {

                    condition: 'default',
                    label: 'Add Status',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                }

            ]
        },
        {
            display: 'Add Doctor Interaction Status',
            filter: 'action',
            type: 'button',
            event: 'doctorReviewButton',
            variable: 'doctorInteractedStatus',
            sort: false,
            conditions: [
                {
                    value: 'Interacted',
                    condition: 'eq',
                    label: 'Add Status',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                },
                {

                    condition: 'default',
                    label: 'Add Status',
                    style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
                }

            ]
        },
        {
            display: 'Rating',
            variable: 'userRatingText',
            filter: 'htmlContent',
            sort: false,
            event: 'showUserRating',
            eventLabel: 'View Details',
            eventVisibleWhenEmpty: false
        },
        {
            display: 'Lead Details',
            variable: 'leadParams.utm_campaign leadParams.utm_source leadParams.utm_medium',
            filter: 'text',
            sort: false
        },
        {
            display: 'Total Consultation Time',
            variable: 'consultationTime',
            filter: 'htmlContent',
            sort: false,
            event: 'showConsultationTime',
            eventLabel: 'View Details',
            eventVisibleWhenEmpty: false
        },
        {
            display: 'No of Visits',
            variable: 'noOfVisits',
            filter: 'text',
            sort: false
        }, {
            display: 'revenue',
            variable: 'revenue',
            filter: 'text',
            sort: false
        }
    ]


    constructor(private spinnerService: SpinnerService, private commonUtil: CommonUtil, private adminService: AdminService, private toast: ToasterService,
        private authService: AuthService, private diagnosticService: DiagnosticsService, private receptionService: ReceptionService, private doctorService: DoctorService,
        private router: Router) {
        this.empId = this.authService.userAuth.employeeId;
        this.employeeName = this.authService.userAuth.employeeName;
        if (Config.portal.doctorOptions && Config.portal.doctorOptions.showPatientDeviceInfo) {
            this.columns.push({
                display: 'AdvertisementId',
                variable: 'advertisementId',
                filter: 'text',
                sort: false
            }, {
                display: 'IMEI',
                variable: 'imei',
                filter: 'text',
                sort: false
            });
        }

        if (Config.portal.doctorOptions && Config.portal.doctorOptions.enableProductList) {
            this.columns.splice(12, 0, {
                display: 'Products - Quantity',
                variable: 'products',
                filter: 'text',
                sort: false
            });
        }

        if (Config.portal.doctorOptions && Config.portal.doctorOptions.showPatientDeviceInfo) {
            this.columns.push({
                display: 'Dial User',
                variable: 'orderId',
                filter: 'action',
                type: 'button',
                sort: false,
                event: 'callingUser',
                conditions: [
                    {
                        condition: 'default',
                        label: 'Call Now',
                        style: 'btn btn-primary width-100 mb-xs botton_txtdigo done_txt'
                    }
                ]
            });
            this.columns.push({
                display: 'SMS',
                variable: 'orderId',
                filter: 'action',
                type: 'button',
                sort: false,
                event: 'smsUser',
                conditions: [
                    {
                        condition: 'default',
                        label: 'Send SMS',
                        style: 'btn btn-primary width-100 mb-xs botton_txtdigo done_txt'
                    }
                ]
            })

        }
    }

    ngOnInit(): void {
        console.log('central');
        this.getPocList(this.empId, this.brandFilter);
        this.onSubmit();
    }

    getPocList(empId: number, brandFilter: boolean): void {
        brandFilter = true;
        this.adminService.getPOCForEmployeeByBrandFilter(empId, brandFilter).then(response => {
            if (response && response.length > 0) {
                this.pocRolesList = response;
            }
        })
            .catch(error => {
                console.error('Error occurred while fetching the employee POCs', error);
            });
    }

    reset() {
        this.total = 0;
        this.from = 0;
        this.getcentraldoctorordersList = new Array();
    }

    onPOCSelect(pocId: number): void {
        this.showMessage = false;
        this.pocId = pocId;
        this.reset();
        if (pocId > 0) {
            this.pocRolesList.forEach(pocItem => {
                if (pocId === pocItem.pocId) {
                    this.selectedPOC = pocItem;
                }
            });
        }
        this.getCentralDoctorOrders();
    }

    getCentralDoctorOrders(): void {
        this.spinnerService.start();
        this.dataMsg = 'Loading...';
        this.todaysDate = new Date().getTime();
        if (this.selectedPOC != undefined && this.selectedPOC != null && this.selectedPOC.pocId > 0) {
            this.pocIds = new Array<number>();
            this.pocIds.push(this.selectedPOC.pocId);
        }
        else {
            this.pocIds = this.authService.pocIds;
        }
        if (this.endingDate == null && this.startDate == null) {
            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Date";
        }
        else if (this.endingDate == null || this.endingDate == undefined) {
            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select End Date";


        }
        else if (this.startDate == null || this.startDate == undefined) {

            this.errorMessage = new Array();
            this.isDate = false;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "Please Select Start Date";

        }
        else if (this.startDate > this.endingDate) {
            this.errorMessage = new Array();
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "End date must be greater than start date";
        }

        else {
            this.showMessage = false;
            this.adminService.getCentralDoctorOrder(this.commonUtil.convertOnlyDateToTimestamp(this.startDate), this.endingDate.getTime(), this.pocId,
                this.empId, this.from, 50, this.mobile, this.patientName, this.doctorName, this.filterPaymentStatus, this.filterInvoiceStatus,
                this.fiterCancellationStatus, this.email, false, '', this.orderId, this.invoiceId
            ).
                then(response => {
                    console.log('length' + response.length)
                    this.disablePageClick = response.length < 50 ? false : true;
                    if (response.length > 0) {

                        this.dataMsg = '';
                        if (this.total > 0) {
                            this.getcentraldoctorordersList.push.apply(this.getcentraldoctorordersList, response);
                        }
                        else {
                            this.getcentraldoctorordersList = new Array();
                            this.getcentraldoctorordersList = response;
                            console.log("doctor-->" + JSON.stringify(this.getcentraldoctorordersList))
                        }

                        this.total = this.getcentraldoctorordersList.length;
                        this.getcentraldoctorordersList.forEach(element => {
                            element.slotDateTime = element.slotDate + (element.slotTime + this.commonUtil.getTimezoneDifferential());
                            element.enableCancel = element.cancellationStatus;
                            if (element.invoiceCompletionStatus == 5) {
                                element.enableCancel = 11;
                            }
                            element.userRatingText = element.userRating && element.userRating.userRating && element.userRating.userRating > 0 ? ('Rating: ' + element.userRating.userRating + ' / 5') : 'Rating: Pending';
                            let tmpTime = element.consultationEndTime && element.consultationEndTime > 0 && element.consultationInitiatedTime && element.consultationInitiatedTime > 0 ? (element.consultationEndTime - element.consultationInitiatedTime) : 0;
                            element.consultationTime = DateUtil.getTimeInHoursMinSeconds(tmpTime);
                        });
                    }
                    else {
                        if (this.total == 0) {
                            this.getcentraldoctorordersList = new Array();
                            this.dataMsg = "No Data Found";
                            this.total = this.getcentraldoctorordersList.length;

                        }
                    }

                });
        }
        this.spinnerService.stop();
    }

    getCentralDoctorOrdersListByFilter(search: any = '', type: string) {
        this.doctorName = this.patientName = this.mobile = this.orderId = this.invoiceId = '';
        type == 'patient' ? search = $('#search1').val().toString() : (type == 'doctor' ? search = $('#search2').val().toString() : search = $('#search3').val().toString());
        if (type == 'patient') {
            if (isNaN(parseInt(search))) {
                this.searchCriteria = 1;
            } else {
                this.searchCriteria = 2;
                if (search.length != 10) {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage.push('Please Enter valid mobile number');
                    this.showMessage = true;
                    return;
                }
            }

            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            let emailCheck = re.test(search);

            if (emailCheck) {
                this.searchCriteria = 0;
                this.email = search;
            }
            else this.email = '';
            this.searchCriteria == 1 ? this.patientName = search : this.patientName = '';
            this.searchCriteria == 2 ? this.mobile = search : this.mobile = '';
        }
        else if (type == 'doctor') {
            this.doctorName = search;
        } else if (type == 'order') {
            if (search.substring(0, 2) == 'OR')
                this.orderId = search;
            if (search.substring(0, 2) == 'IN')
                this.invoiceId = search;
        }
        this.reset();
        this.getCentralDoctorOrders();
    }

    onChange(type) {
        type == 1 ? this.patientFilter = true : this.patientFilter = false;
        type == 2 ? this.doctorFilter = true : this.doctorFilter = false;
        type == 3 ? this.orderFilter = true : this.orderFilter = false;
    }

    onEnterPressed(e, type) {
        if (e.keyCode == 13) {
            this.reset();
            this.getCentralDoctorOrdersListByFilter('', type);
        }
    }

    onChangeStatus(value) {
        this.reset();
        this.getCentralDoctorOrders();
    }

    startDateChoosen($event): void {
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
            this.startDate.getDate(), 0, 0, 0)
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
    }

    endDateChoosen(event) {
        this.endingDate = new Date(this.endingDate.getFullYear(), this.endingDate.getMonth(),
            this.endingDate.getDate(), 0, 0, 0)
        this.errorMessage = new Array();
        this.isDate = false;
        this.isDisplay = false;
        this.checkEndDate = true;
    }

    clickEventHandler(e) {
        if (e.event == 'cancelButton') {
            this.cancelAppoinment(e.val);
        } else if (e.event == 'customerReviewButton') {
            this.customerReviewButtonClicked(e.val);
        } else if (e.event == 'doctorReviewButton') {
            this.doctorReviewButtonClicked(e.val);
        } else if (e.event == 'showAllConsumerInteractions') {
            this.showAllCustomerInteractions(e.val);
        } else if (e.event == 'showAllDoctorInteractions') {
            this.showAllDoctorInteractions(e.val);
        } else if (e.event == 'rescheduleButton') {
            this.rescheduleAppoinment(e.val);
        } else if (e.event == 'showUserRating') {
            this.showUserRating(e.val);
        } else if (e.event == 'showConsultationTime') {
            this.showDoctorConsultationTime(e.val);
        } else if (e.event == 'hyperlink') {
            this.gotoPatientDetails(e.val);
        } else if (e.event == 'callingUser') {
            this.callUser(e.val);
        } else if (e.event == 'smsUser') {
            this.getSMSUser(e.val);
        }      
    }



    onPage(page: number) {
        if (this.getcentraldoctorordersList && this.getcentraldoctorordersList.length > 0 &&
            this.disablePageClick == true) {
            this.from = this.total;
            this.getCentralDoctorOrders();
        }
    }

    pageEvent(event: any) {
        this.presentPageSize = event.pageSize;
    }

    onSubmit(): void {
        let search = '';
        if (this.patientFilter == true) {
            if ($('#search1').val() != undefined)
                search = $('#search1').val().toString()
        }
        else if (this.doctorFilter == true) {
            if ($('#search2').val() != undefined)
                search = $('#search2').val().toString();
        }
        else {
            if ($('#search3').val() != undefined)
                search = $('#search3').val().toString();
        }

        if (search.length > 0) {
            this.patientFilter == true ? this.getCentralDoctorOrdersListByFilter('', 'patient') : (this.doctorFilter == true ? this.getCentralDoctorOrdersListByFilter('', 'doctor') : this.getCentralDoctorOrdersListByFilter('', 'order'));
        }
        else {
            this.patientName = '';
            this.mobile = '';
            this.doctorName = '';
            this.reset();
            this.getCentralDoctorOrders();
        }
    }

    cancelAppoinment(bookingDetail: any) {
        console.log("bookingDetail: " + JSON.stringify(bookingDetail));
        this.bookingDetails = bookingDetail;
        if (this.bookingDetails.invoiceCompletionStatus < 5 && this.bookingDetails.cancellationStatus == 0)
            (<any>$("#cancel_confirm")).modal("show");
    }

    rescheduleAppoinment(bookingDetail: any) {
        if (bookingDetail.enableCancel == 0) {
            let patientSlot = {};
            patientSlot['doctorId'] = bookingDetail.doctorId;
            patientSlot['pocId'] = bookingDetail.pocId;
            patientSlot['serviceId'] = bookingDetail.serviceId;
            patientSlot['doctorTitle'] = bookingDetail.doctorDetail.title;
            patientSlot['doctorFirstName'] = bookingDetail.doctorDetail.firstName;
            patientSlot['doctorLastName'] = bookingDetail.doctorDetail.lastName;
            patientSlot['patientTitle'] = bookingDetail.patientProfileDetails.title;
            patientSlot['patientFirstName'] = bookingDetail.patientProfileDetails.fName;
            patientSlot['patientLastName'] = bookingDetail.patientProfileDetails.lName;
            patientSlot['patientContactNumber'] = bookingDetail.patientProfileDetails.contactInfo.mobile;
            patientSlot['orderId'] = bookingDetail.orderId;
            patientSlot['patientGender'] = bookingDetail.patientProfileDetails.gender;
            bookingDetail.doctorDetail.serviceName = bookingDetail.serviceName;

            this.receptionService.patientSlotForDoc = patientSlot;
            this.receptionService.isCentralBooking = true;
            this.receptionService.selectedDoctor = bookingDetail.doctorDetail;
            this.bookedDate = new Date(bookingDetail.slotDate);
            this.bookedDate.setHours(0);
            this.bookedDate.setMinutes(0);
            this.bookedDate.setSeconds(0);
            this.bookedDate.setMilliseconds(0);
            this.receptionService.bookedDate = this.bookedDate;
            this.receptionService.age = this.commonUtil.getAge(bookingDetail.patientProfileDetails.dob);
            this.receptionService.invoiceId = bookingDetail.invoiceId;
            this.router.navigate(['/app/reception/reschedule']);
        }
    }

    cancelSlot() {
        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        this.diagnosticService.cancelBookedSlot(this.bookingDetails.orderId, this.bookingDetails.invoiceId, 0, this.bookingDetails.patientProfileDetails.profileId)
            .then(data => {
                this.spinnerService.stop();

                if (data.statusCode == 405) {
                    $('#cancelError').show();
                    alert(data.statusMessage);

                    (<any>$("#cancel_confirm")).modal("hide");
                }
                else {
                    alert(data.statusMessage);
                    (<any>$("#cancel_confirm")).modal("hide");
                    this.total = 0;
                    this.getcentraldoctorordersList = new Array();
                    this.getCentralDoctorOrders();
                }
                setTimeout(function () {
                    $('#cancelError').fadeOut();
                }, 60000);
            });
    }

    customerReviewButtonClicked(data: any): void {
        // if (data.consumerInteractionStatus != 'Interacted') {
        this.modalId = 'central_doctor_id1';
        this.modalTitle = 'Add Customer Review';
        this.onButtonClicked(data);
        // }
    }

    doctorReviewButtonClicked(data: any) {
        // if (data.doctorInteractedStatus != 'Interacted') {
        this.modalId = 'central_doctor_id2';
        this.modalTitle = 'Add Doctor Review';
        this.onButtonClicked(data);
        // }

    }

    onButtonClicked(data: any) {
        this.userData = new CentralOrderInteraction();
        this.userData = data;
        this.comments = '';
        // this.interactionStatus = 'Select Status';
        this.error = '';

        // if (this.modalTitle === 'Add Customer Review') {
        //     this.requestBody.doctorInteractedStatus = (this.userData.doctorInteractedStatus && this.userData.doctorInteractedStatus) || '';
        //     this.requestBody.doctorInteractionComments = (this.userData.doctorInteractionComments && this.userData.doctorInteractionComments) || '';
        //     this.requestBody.doctorInteractionDate = (this.userData.doctorInteractionDate && this.userData.doctorInteractionDate) || 0;
        //     this.requestBody.doctorInteractedEmpId = this.userData.doctorInteractedEmpId;
        //     this.requestBody.doctorInteractedEmployeeName = (this.userData.doctorInteractedEmployeeName && this.userData.doctorInteractedEmployeeName) || '';
        // }
        // else if (this.modalTitle === 'Add Doctor Review') {
        //     this.requestBody.consumerInteractionStatus = (this.userData.consumerInteractionStatus && this.userData.consumerInteractionStatus) || '';
        //     this.consumerInteractedComments = this.requestBody.consumerInteractedComments = (this.userData.consumerInteractedComments && this.userData.consumerInteractedComments) || '';
        //     this.requestBody.consumerInteractionDate = (this.userData.consumerInteractionDate && this.userData.consumerInteractionDate) || 0;
        //     this.requestBody.consumerInteractedEmpId = (this.userData.consumerInteractedEmpId);
        //     this.requestBody.consumerInteractedEmployeeName = (this.userData.consumerInteractedEmployeeName && this.userData.consumerInteractedEmployeeName) || '';
        // }
        (<any>$)("#modalId").modal("show");

    }

    addInteractionStatus(status: any) {
        this.interactionStatus = status;


    }

    onRemarksSubmit(comments) {
        this.error = '';
        this.comments = comments
        if ((this.interactionStatus == '' && this.comments == '')) {
            this.error = 'Please add atleast one value.';
            return;
        }
        if (this.modalTitle === 'Add Customer Review') {
            this.requestBody.consumerInteractedEmpId = this.empId;
            this.requestBody.consumerInteractedEmployeeName = this.employeeName;
            this.requestBody.consumerInteractionDate = new Date().getTime();
            this.requestBody.consumerInteractedComments = this.comments = comments;
            this.requestBody.consumerInteractionStatus = this.interactionStatus;
            this.requestBody.interactionType = 0;
        }
        else if (this.modalTitle === 'Add Doctor Review') {
            this.requestBody.doctorInteractedEmpId = this.empId;
            this.requestBody.doctorInteractedEmployeeName = this.employeeName;
            this.requestBody.doctorInteractionDate = new Date().getTime();
            this.requestBody.doctorInteractionComments = this.comments = comments;
            this.requestBody.doctorInteractedStatus = this.interactionStatus;
            this.requestBody.interactionType = 1;

        }

        this.requestBody.profileId = this.userData.patientProfileId;
        this.requestBody.orderId = this.userData.orderId;
        this.requestBody.patientName = (this.userData.patientProfileDetails.title ? this.userData.patientProfileDetails.title : '') + ' ' +
            (this.userData.patientProfileDetails.fName ? this.userData.patientProfileDetails.fName : '') + ' ' +
            (this.userData.patientProfileDetails.lName ? this.userData.patientProfileDetails.lName : '');
        this.requestBody.bookingType = this.userData.bookingType;
        this.spinnerService.start();
        this.adminService.updateReviewForCentralBookings(this.requestBody).then(response => {
            this.spinnerService.stop();
            if (response.statusCode === 200 || response.statusCode === 201) {
                window.alert('Successfully Updated');
                (<any>$)("#modalId").modal("hide");
                (<any>$)("#select_entity_type").val(0);
                this.interactionStatus = '';
                this.comments = ' ';
                this.total = 0;
                this.requestBody = new CentralOrderInteraction();
                this.modalId = null;
                this.modalTitle = '';
                this.getcentraldoctorordersList = new Array();
                this.getCentralDoctorOrders();
            }
            else {
                window.alert('Something went wrong,please try again');
            }

        });
    }

    showAllCustomerInteractions(data: any) {
        (<any>$("#viewmoremodal")).modal("show");
        this.modalTitle = 'Customer Interactions';
        this.formattedDataString = '';
        let tmp = new Array();
        if (data && data.consumerInteractionHistory && data.consumerInteractionHistory.length > 0) {
            data.consumerInteractionHistory.forEach(interactionData => {
                tmp.push(this.commonUtil.getFormattedConsumerInteractionData(interactionData));
            });
            this.formattedDataString = tmp.join(' ');
        }
    }

    showAllDoctorInteractions(data: any) {
        (<any>$("#viewmoremodal")).modal("show");
        this.modalTitle = 'Doctor Interactions';
        this.formattedDataString = '';
        let tmp = new Array();
        if (data && data.doctorInteractionHistory && data.doctorInteractionHistory.length > 0) {
            data.doctorInteractionHistory.forEach(interactionData => {
                tmp.push(this.commonUtil.getFormattedDoctorInteractionData(interactionData));
            });
            this.formattedDataString = tmp.join(' ');
        }
    }

    showUserRating(data: any) {
        (<any>$("#viewmoremodal")).modal("show");
        this.modalTitle = 'User Rating';
        let userRating = null;
        if (data && data.userRating) {
            userRating = data.userRating;
        }
        this.formattedDataString = this.commonUtil.getFormattedFeedbackDetails(userRating);
    }

    showDoctorConsultationTime(data: any) {
        this.spinnerService.start();
        this.adminService.getDoctorConsultationTime(data.orderId).then(response => {
            this.spinnerService.stop();
            response.videoLink ? this.url = response.videoLink : this.url = '';
            (<any>$("#viewmoremodal")).modal("show");
            this.modalTitle = 'Consultation Time';
            this.formattedDataString = '';

            if (response && response.prescriptionTime) {
                this.formattedDataString += '<div><b>Total Prescription Time: </b>' + DateUtil.getTimeInHoursMinSeconds(response.prescriptionTime) + '</div>';
            }
            if (response && response.timeInVideo) {
                this.formattedDataString += '<div><b>Total Video Time: </b>' + DateUtil.getTimeInHoursMinSeconds(response.timeInVideo) + '</div>';
            }
            if (response && response.patientVideoStartTime && response.patientVideoEndTime) {
                this.formattedDataString += '<div><b>Patient Video Start & End Time: </b>' + DateUtil.getDateAsFormattedString(response.patientVideoStartTime) + ' & ' + DateUtil.getDateAsFormattedString(response.patientVideoEndTime) + '</div>';
            }
            if (response && response.doctorVideoStartTime && response.doctorVideoEndTime) {
                this.formattedDataString += '<div><b>Doctor Video Start & End Time: </b>' + DateUtil.getDateAsFormattedString(response.doctorVideoStartTime) + ' & ' + DateUtil.getDateAsFormattedString(response.doctorVideoEndTime) + '</div>';
            }
            if (response && response.prescriptionGeneratedTime && response.prescriptionGeneratedTime) {
                this.formattedDataString += '<div><b>Doctor Prescription Generated at: </b>' + DateUtil.getDateAsFormattedString(response.prescriptionGeneratedTime) + '</div>';
            }
            if (response && response.videoLink != undefined && response.videoLink != null && response.videoLink.length > 0) {
                this.formattedDataString += '<div><b>Consultation Recorded Video Link: </b>';
                response.videoLink.forEach(link => {
                    this.formattedDataString += '<a href="{{link}}">' + link + ' </a><br/>';
                })
                this.formattedDataString += '</div>';
            }
        }).catch(error => {
            this.spinnerService.stop();
        });
    }

    innerHTMLClick(event) {
        event.preventDefault();
        window.open(this.url, '_blank')
    }


    onSendEmail() {
        (<any>$("#mailmodal")).modal("show");
    }

    onMailSubmit() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let emailCheck = re.test(this.toEmail);
        if (!emailCheck) {
            alert("Please enter a valid email address");
            return;
        }
        if (this.startDate != null && this.startDate != undefined && this.endingDate != null && this.endingDate != undefined) {
            if (this.startDate > this.endingDate) {
                this.errorMessage = new Array();
                this.isDate = true;
                this.isDisplay = true;
                this.message = new Array();
                this.message[0] = "End date must be greater than start date";
                return;
            }
        }
        else {
            this.errorMessage = new Array();
            (<any>$)("#mailmodal").modal("hide");
            this.isDate = true;
            this.isDisplay = true;
            this.message = new Array();
            this.message[0] = "please select dates to continue";
            return;
        }
        (<any>$)("#mailmodal").modal("hide");
        this.spinnerService.start();
        this.adminService.getCentralDoctorOrder(this.startDate.getTime(), this.endingDate.getTime(), this.pocId,
            this.empId, this.from, 50, this.mobile, this.patientName, this.doctorName, this.filterPaymentStatus, this.filterInvoiceStatus,
            this.fiterCancellationStatus, this.email, true, this.toEmail, this.orderId, this.invoiceId
        ).
            then(response => {

                this.toEmail = '';
                try {
                    this.spinnerService.stop();
                    this.toast.show('Successfully sent email.', "bg-success text-white font-weight-bold", 3000);
                }
                catch (error) {
                    console.error(error);
                }
            })
    }

    gotoPatientDetails(data) {
        this.adminService.selectedProfileId = data.parentProfileId;
        this.router.navigate(['/app/admin/orderhistory']);
    }

    callUser(data) {
        let order = data
        this.doctorService.placeClickCallRequest(order.patientProfileId, this.empId, order.orderId).then(resp => {
            if (resp && (resp.statusCode == 200 || resp.statusCode == 201)) {
                this.toast.show(resp.statusMessage, "bg-success text-white font-weight-bold", 2000);
            } else {
                this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
            }
        }).catch(err => {
            this.toast.show("Error in placing the call. Please retry.", "bg-danger text-white font-weight-bold", 3000);
        });
    }

    getSMSUser(data) {
        let temp = data;
        this.profileId = data.patientProfileId;
        this.doctorService.getCRMSMS(temp.orderId).then(resp => {
            if (resp && resp.length) {
                this.smsTemplates = resp;
            }
        });
        this.sendMessage = '';
        (<any>$)("#smsmodal").modal("show");
    }

    sendSMSUser() {
        if (this.sendMessage == '') {
            this.smsError = true;
            this.smsErrorMsg = [];
            this.smsErrorMsg.push("Please select template");
            return;
        } else {
            this.smsError = false;
            this.smsErrorMsg = [];
        }
        (<any>$("#smsmodal")).modal("hide");
        let req = {
            patientProfileId: this.profileId,
            templateId: this.sendSmsMsg[0].templateId,
            templateMessage: this.sendSmsMsg[0].templateMessage
        };
        this.spinnerService.start();
        this.doctorService.sendCRMSMStoUSer(req).then(resp => {
            this.sendMessage = '';
            this.spinnerService.stop();
            alert(resp.statusMessage);
        });
    }

    onSmsTemplateChange(data) {
        this.sendMessage = '';
        this.sendSmsMsg = this.smsTemplates.filter(s => s.templateId == data);
        if (this.sendSmsMsg.length > 0)
            this.sendMessage = this.sendSmsMsg[0].templateMessage;
        if(this.sendMessage.length > 0) {
            this.smsError = false;
            this.smsErrorMsg = [];
        }
    }

}
