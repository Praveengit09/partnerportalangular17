import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { AdminService } from './../../../../admin/admin.service';
import { DiagnosticAdminService } from './../../diagnosticadmin.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { CentralOrderInteraction } from './../../../../model/common/centralorderinteraction';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';
import { DiagnosticDeliveryAdviceTrack } from '../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from '../../../diagnostics.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { Config } from './../../../../base/config';
import { DiagnosticOrdersCount } from './../../../../model/report/DiagnosticOrdersCount';
import { CryptoUtil } from './../../../../auth/util/cryptoutil';

@Component({
  selector: 'centralwalkinorders',
  templateUrl: './centralwalkinlist.template.html',
  styleUrls: ['./centralwalkinlist.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class DiagnosticsCentralWalkInComponent implements OnInit {
  errorMessage: Array<string>;
  brandFilter: boolean = false;

  total: number = 0;
  dataMsg: string = ' ';
  toEmail: string = '';
  type: string = '';
  mainFilterTypes : string[] = ['PaymentPending','CancelledOrders','AppOrders','CallCenterOrders','WebsiteOrders'];
  
  // message: Array<string>;
  isError: boolean;
  error: string = '';
  showMessage: boolean;
  perPage: number = 10;
  centralWalkinOrderList: any = new Array<any>();
  pocRolesList: Array<EmployeePocMapping>;
  empId: number;
  employeeName: string;
  selectedPOC: EmployeePocMapping;
  pocId: number = 0;
  userData: CentralOrderInteraction = new CentralOrderInteraction();
  interactionStatus: string = '';
  modalTitle: string;
  modalId: string;
  comments: string;
  doctorInteractionComments: string = '';
  doctorInteractedStatus: string = '';
  consumerInteractionStatus: string = '';
  consumerInteractedComments: string;
  requestBody: CentralOrderInteraction = new CentralOrderInteraction();
  indexForPOC: number = 0;
  indexForSource: number = 0;
  searchCriteria: number = 0;
  searchTerm: string = '';
  fromIndex: number = 0;
  bookingSource: number = 0;
  formattedDataString: string;
  invoiceCompletionStatus: number = 0;
  mobileSearchDateCheck: boolean = false;

  futureDate = new Date().setMonth(new Date().getMonth() + 1);
  pastDate = new Date().setMonth(new Date().getMonth() - 3);

  diagnosticOrdersCount: DiagnosticOrdersCount = new DiagnosticOrdersCount();
  paymentPendingRequest: boolean = false;
  cancelledOrderRequest: boolean = false;
  sampleCollectionStatus: number = 0;
  enableButtonStatusFilter: boolean = false;
  enableVdcCustomTag: boolean = false;

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
      display: 'OrderId',
      variable: 'orderId',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'InvoiceId',
      variable: 'baseInvoiceId',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'Centre Name',
      variable: 'pocDetails.pocName pocDetails.contactList[0]',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'Patient Details',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName,  patientProfileDetails.age, patientProfileDetails.gender, patientProfileDetails.referenceId',
      filter: 'nametitle',
      sort: false,
      sticky: false
    },
    {
      display: 'Patient Contact',
      variable: 'patientProfileDetails.contactInfo.mobile, patientProfileDetails.contactInfo.email',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'Booking Source',
      variable: 'bookingSource',
      filter: 'text',
      sort: false,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Mobile App'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'Mobile App'
        },
        {
          value: '5',
          condition: 'eq',
          label: 'Website'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Call Center'
        }
      ]
    },
    {
      display: 'Booking Details',
      variable: 'slotDateTime',
      filter: 'datetime',
      sort: false
    },
    {
      display: 'Order Value (Rs.)',
      variable: 'payment.finalAmount',
      filter: 'text',
      sort: false
    },
    {
      display: 'Due Amount (Rs.)',
      variable: 'payment.amountToBePaid',
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
      display: 'Tests Included',
      variable: 'serviceList',
      displayVariable: 'serviceName',
      breakFill: ', ',
      filter: 'array-to-string',
      sort: false
    },
    {
      display: 'Order Status',
      filter: 'text',
      sort: false,
      variable: 'orderStatus',
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
        },
        {
          value: '30',
          condition: 'eq',
          label: 'Cancelled'
        },
        {
          condition: 'default',
          label: 'Pending'
        }
      ]
    },
    {
      display: 'Last Updated Time',
      variable: 'updatedTimestamp',
      filter: 'datetime',
      sort: true
    },
    {
      display: 'Cancellation Status',
      filter: 'text',
      sort: false,
      variable: 'cancellationStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Active'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Cancelled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Rejected'
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
      display: 'Order Creator',
      variable: 'creatorName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Action',
      label: 'MARK COLLECTEED',
      style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewOrderButton',
      sort: false,
      variable: 'sampleCollectionStatus',
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'MARK AS DELIVERED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'MODIFIED',
          style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'REJECTED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '9',
          condition: 'eq',
          label: 'DELIVERED',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          condition: 'default',
          label: 'VIEW',
          style: 'btn btn-danger width-130 mb-xs botton_txt'
        }
      ]
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
      display: 'Add Customer Interaction Status',
      variable: 'consumerInteractionStatus',
      filter: 'action',
      type: 'button',
      event: 'customerReviewButton',
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
    }
  ];

  constructor(private spinnerService: SpinnerService, private diagAdminService: DiagnosticAdminService, private commonUtil: CommonUtil,
    private adminService: AdminService, private authService: AuthService, private toast: ToasterService,
    private diagnosticsService: DiagnosticsService, private router: Router) {
    this.empId = this.authService.userAuth.employeeId;
    this.employeeName = this.authService.userAuth.employeeName;
    this.fromIndex = 0;


    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableDiagnosticComments) {

      this.columns.splice(15, 0, {
        display: 'Diagnostic Center Interaction Comments',
        variable: 'formattedDoctorInteraction',
        filter: 'htmlContent',
        sort: false,
        event: 'showAllDoctorInteractions',
        eventLabel: 'View All',
        eventVisibleWhenEmpty: false
      });

      this.columns.splice(17, 0, {
        display: 'Add Diagnostic Center Interaction Status',
        variable: 'doctorInteractedStatus',
        filter: 'action',
        type: 'button',
        event: 'diagnosticReviewButton',
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
      });
    }

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.lisIntegrated) {
      this.columns.splice(5, 0, {
        display: 'Health ID',
        variable: 'patientProfileDetails.referenceId',
        filter: 'text',
        sort: false
      });
      this.columns.splice(6, 0, {
        display: 'LIS Bill No.',
        variable: 'referenceId',
        filter: 'text',
        sort: false
      });
    }

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableInvoiceSplitting) {

      this.columns.splice(13, 0, {
        display: 'Client Name',
        variable: 'clientName',
        filter: 'text',
        sort: false
      });

      this.columns.splice(14, 0, {
        display: 'Credit User',
        filter: 'text',
        sort: false,
        variable: 'creditUser',
        conditions: [
          {
            value: '1',
            condition: 'eq',
            label: 'Yes'
          },
          {
            value: '2',
            condition: 'eq',
            label: 'No'
          },
          {
            condition: 'default',
            label: 'NO'
          }
        ]
      });
    }
  }

  ngOnInit() {
    this.mobileSearchDateCheck = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableMobileSearchWithoutDates;
    this.enableButtonStatusFilter = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableButtonStatusFilter;
    this.getPocList(this.empId, this.brandFilter);
    this.getCentralWalkInDiagnosticBookingsCount();
    this.getCentralWalkInOrderList();
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
      this.columns[0].sticky = true;
      this.columns[1].sticky = true;
      this.columns[2].sticky = true;
      this.columns[3].sticky = true;
    }
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('walkInStartDate') != null && window.localStorage.getItem('walkInStartDate') != undefined) {
        this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('walkInStartDate'))));
        this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('walkInEndDate'))));
        this.submit();
      } 
    if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName)
      this.enableVdcCustomTag = true;
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



  onPOCSelect(index: number): void {
    this.showMessage = false;
    this.pocId = 0;
    if (index > 0) {
      this.selectedPOC = this.pocRolesList[index - 1];
      this.pocId = this.selectedPOC.pocId;
    }
    this.getCentralWalkInOrderList();
    this.getCentralWalkInDiagnosticBookingsCount();
  }

  onBookingSourceSelect(sourceVal: number): void {
    this.showMessage = false;
    this.bookingSource = sourceVal;
    this.getCentralWalkInOrderList();
    this.getCentralWalkInDiagnosticBookingsCount();
  }

  onStatusSelect(status: number): void {
    this.showMessage = false;
    this.invoiceCompletionStatus = status;
    this.getCentralWalkInOrderList();
  }

  onEnterPressed(e) {
    console.log("Event: ", e);
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (e.keyCode == 13) {
      this.getOrderListWithMobileOrOrderId();
    }
  }

  getOrderListWithMobileOrOrderId(search: string = '') {
    search = $('#search').val().toString();
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
    this.total = this.fromIndex = 0;
    this.searchTerm = search;
    this.getCentralWalkInOrderList();
    this.getCentralWalkInDiagnosticBookingsCount();
  }

  getRefreshedorderList() {
    /* this.startDate = new Date();
    this.endDate = new Date(); */
    this.searchTerm = "";
    this.pocId = 0;
    $('#search').val('');
    this.indexForPOC = 0;
    this.indexForSource = 0;
    this.fromIndex = 0;
    this.bookingSource = 0;
    this.searchCriteria = 0;
    this.paymentPendingRequest = false;
    this.cancelledOrderRequest = false;
    this.getCentralWalkInOrderList();
    this.getCentralWalkInDiagnosticBookingsCount();
    this.deselectMainFilter(null);  // for deselecting filter button
  }

  getCentralWalkInOrderList(): void {
    this.spinnerService.start();
    this.dataMsg = 'Loading...';
    console.log("getCentralWalkInOrderList: " + this.startDate + ">>>>>: " + this.endDate + ">>>>>: " + (this.startDate > this.endDate));
    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      // this.message = new Array();
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Start Date should always be greater than end date';
      this.isError = true;
      this.showMessage = true;
    }

    else {
      this.showMessage = false;
      this.spinnerService.start();
      let productDeliveryReq = new ProductDeliveryRequest();
      productDeliveryReq.empId = this.empId;
      productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
      productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
      if (this.mobileSearchDateCheck && this.searchCriteria == 2) {
        productDeliveryReq.fromDate = 0;
        productDeliveryReq.toDate = 0;
      }
      productDeliveryReq.pocId = this.pocId;
      productDeliveryReq.centralHomeOders = false;
      productDeliveryReq.fromIndex = this.fromIndex;
      if (this.searchCriteria == 1)
        productDeliveryReq.orderId = this.searchTerm;
      else if (this.searchCriteria == 2)
        productDeliveryReq.mobile = this.searchTerm;
      if (this.bookingSource > 0) {
        productDeliveryReq.bookingSource = this.bookingSource;
      }
      if (this.invoiceCompletionStatus > 0) {
        productDeliveryReq.invoiceCompletionStatus = this.invoiceCompletionStatus;
      }
      if (this.paymentPendingRequest) {
        productDeliveryReq.paymentPendingRequest = this.paymentPendingRequest;
      }
      if (this.cancelledOrderRequest) {
        productDeliveryReq.cancelledOrderRequest = this.cancelledOrderRequest;
      }
      if (this.sampleCollectionStatus > 0) {
        productDeliveryReq.sampleCollectionStatus = this.sampleCollectionStatus;
      }
      this.diagAdminService.getDiagnosticCentralOrders(productDeliveryReq).then(response => {
        this.spinnerService.stop();
        this.total = 0;
        if (this.fromIndex > 0) {
          this.sortBookingReport(this.centralWalkinOrderList.push.apply(this.centralWalkinOrderList, response))
        } else {
          this.centralWalkinOrderList = new Array();
          this.centralWalkinOrderList = this.sortBookingReport(response);
        }
        if (response.length > 0) {
          this.total = this.centralWalkinOrderList.length;
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = false;
          this.centralWalkinOrderList.forEach(element => {
            if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
              element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
            }
            element.slotDateTime = element.slotDate + (element.slotTime + + this.commonUtil.getTimezoneDifferential());
            element.invoiceCompletionStatus >= 2 ? element.cancellationStatus = 11 : '';
            if (element.cancellationStatus === 1 || element.cancellationStatus === 3) {
              element.orderStatus = 30;
            }
            else {
              element.orderStatus = element.invoiceCompletionStatus;
            }

            if (element.payment.amountToBePaid == undefined || element.payment.amountToBePaid == null) {
              element.payment.amountToBePaid = element.payment.finalAmount - element.payment.amountPaid;
            }

            if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.lisIntegrated) {
              if (!element.referenceId || element.referenceId.length <= 0) {
                element.referenceId = "Not placed in LIS";
              }
            }

            if ((element.payment.paymentStatus == 2 || element.payment.paymentStatus == 0) && element.cancellationStatus == 0) {
              element.rowStyle = { 'background-color': '#de4343', 'color': 'white' };
            }
            else if ((element.cancellationStatus == 1 || element.cancellationStatus == 2 || element.cancellationStatus == 3 || element.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.REJECTED)) {
              element.rowStyle = { 'background-color': '#7271C8', 'color': 'white' };
            }
            if (element.postPrandialSplitting)
              element.rowStyle = { 'background-color': '#DDA0DD', 'color': 'white' };
          });
        }
        else if (productDeliveryReq.fromIndex == 0) {
          if (productDeliveryReq.orderId != undefined && productDeliveryReq.orderId.length) {
            this.dataMsg = "No data found for the specified Order Id.";
          } else if (productDeliveryReq.mobile != undefined && productDeliveryReq.mobile.length) {
            this.dataMsg = "No data found for the specified mobile number.";
          } else if (this.bookingSource > 0) {
            this.dataMsg = "No data found for the specified booking source.";
          } else if (this.invoiceCompletionStatus > 0) {
            this.dataMsg = "No data found for the specified status.";
          } else if (this.pocId > 0) {
            this.dataMsg = "No data found for the specified POC.";
          } else {
            this.dataMsg = "No data found.";
          }
          this.centralWalkinOrderList = new Array();
          this.total = this.centralWalkinOrderList.length;
          this.showMessage = true;
        }

      });
    }
    this.spinnerService.stop();
  }

  sortBookingReport(unsortedArray) {
    if (unsortedArray.length > 0) {
      this.centralWalkinOrderList = unsortedArray.sort((obj1, obj2) => {
        if (obj1.orderId == obj2.orderId) {
          return 0;
        } else if (obj1.orderId > obj2.orderId) {
          return -1;
        } else {
          return 1;
        }
      });
      this.total = this.centralWalkinOrderList.length;

    }
    return this.centralWalkinOrderList;
  }



  startDateChoosen($event): void {
    console.log("startDateChoosen: " + $event + ">>>>>>: " + $event.getDate());
    this.startDate = $event;
  } 

  endDateChoosen($event) {
    console.log("startDateChoosen1: " + $event);
    this.endDate = $event;
    
  }

  submit(){
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('walkInStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
    window.localStorage.setItem('walkInEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));
    this.getOrderListWithMobileOrOrderId();
    this.diagnosticOrdersCount = new DiagnosticOrdersCount();
    this.getCentralWalkInDiagnosticBookingsCount();
    this.total = 0;
    this.centralWalkinOrderList = new Array();
    this.getCentralWalkInOrderList();
  }

  clickEventHandler(e) {
    if (e.event == 'customerReviewButton') {
      this.customerReviewButtonClicked(e.val);
    } else if (e.event == 'diagnosticReviewButton') {
      this.diagnosticReviewButtonClicked(e.val);
    } else if (e.event == 'viewOrderButton') {
      this.onViewButtonClicked(e.val);
    } else if (e.event == 'showAllConsumerInteractions') {
      this.showAllCustomerInteractions(e.val);
    } else if (e.event == 'showAllDoctorInteractions') {
      this.showAllDoctorInteractions(e.val);
    }
  }

  onPage(page: number) {
    this.fromIndex = +this.total;
    this.getCentralWalkInOrderList();
  }

  addInteractionStatus(status: any) {
    this.interactionStatus = status;
  }


  onViewButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
    if (statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
      && statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED
      && statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED) {
      this.spinnerService.start();
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN;
      this.diagAdminService.getCentralDiagnosticOrderDetails(statusDiagnosticsAdvise.invoiceId)
        .then(data => {
          this.diagnosticsService.orderDetailAdviceTrack = data;
          this.diagnosticsService.centralAdminModify = true;
          this.spinnerService.stop();
          this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
        }).catch(error => {

        })
    }
  }

  customerReviewButtonClicked(data: any): void {
    this.modalId = 'central_Diagnostic_id1';
    this.modalTitle = 'Add Customer Review';
    this.onButtonClicked(data);
  }

  diagnosticReviewButtonClicked(data: any) {
    // if (data.doctorInteractedStatus != 'Interacted') {
    this.modalId = 'central_Diagnostic_id2';
    this.modalTitle = 'Add Diagnostic Center Review';
    this.onButtonClicked(data);
    // }

  }

  onButtonClicked(data: any) {
    this.userData = new CentralOrderInteraction();
    this.userData = data;
    this.comments = '';
    this.interactionStatus = '';
    this.error = '';
    // if (this.modalTitle === 'Add Customer Review') {
    //   this.doctorInteractedStatus = this.requestBody.doctorInteractedStatus = (this.userData.doctorInteractedStatus && this.userData.doctorInteractedStatus) || '';
    //   this.doctorInteractionComments = this.requestBody.doctorInteractionComments = (this.userData.doctorInteractionComments && this.userData.doctorInteractionComments) || '';
    //   this.requestBody.doctorInteractionDate = (this.userData.doctorInteractionDate && this.userData.doctorInteractionDate) || 0;
    //   this.requestBody.doctorInteractedEmpId = this.userData.doctorInteractedEmpId;
    //   this.requestBody.doctorInteractedEmployeeName = (this.userData.doctorInteractedEmployeeName && this.userData.doctorInteractedEmployeeName) || '';
    // }
    // else if (this.modalTitle === 'Add Diagnostic Center Review') {
    //   this.consumerInteractionStatus = this.requestBody.consumerInteractionStatus = (this.userData.consumerInteractionStatus && this.userData.consumerInteractionStatus) || '';
    //   this.consumerInteractedComments = this.requestBody.consumerInteractedComments = (this.userData.consumerInteractedComments && this.userData.consumerInteractedComments) || '';
    //   this.requestBody.consumerInteractionDate = (this.userData.consumerInteractionDate && this.userData.consumerInteractionDate) || 0;
    //   this.requestBody.consumerInteractedEmpId = (this.userData.consumerInteractedEmpId);
    //   this.requestBody.consumerInteractedEmployeeName = (this.userData.consumerInteractedEmployeeName && this.userData.consumerInteractedEmployeeName) || '';
    // }
    (<any>$)("#modalId").modal("show");
  }

  showAllCustomerInteractions(data: any) {
    (<any>$("#viewmoremodal")).modal("show");
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
    this.formattedDataString = '';
    let tmp = new Array();
    if (data && data.doctorInteractionHistory && data.doctorInteractionHistory.length > 0) {
      data.doctorInteractionHistory.forEach(interactionData => {
        tmp.push(this.commonUtil.getFormattedDoctorInteractionData(interactionData));
      });
      this.formattedDataString = tmp.join(' ');
    }
  }

  onRemarksSubmit(comments) {
    this.error = '';
    this.comments = comments;
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
    else if (this.modalTitle === 'Add Diagnostic Center Review') {
      this.requestBody.doctorInteractedEmpId = this.empId;
      this.requestBody.doctorInteractedEmployeeName = this.employeeName;
      this.requestBody.doctorInteractionDate = new Date().getTime();
      this.requestBody.doctorInteractionComments = this.comments = comments;
      this.requestBody.doctorInteractedStatus = this.interactionStatus;
      this.requestBody.interactionType = 1;
    }

    this.requestBody.profileId = this.userData.patientProfileId;
    this.requestBody.orderId = this.userData.orderId;
    this.requestBody.baseInvoiceId = this.userData.invoiceId;
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
        this.requestBody = new CentralOrderInteraction();
        this.modalId = null;
        this.modalTitle = '';
        this.total = 0;
        this.error = '';
        this.centralWalkinOrderList = new Array();
        this.getCentralWalkInOrderList();
        this.getCentralWalkInDiagnosticBookingsCount();
      }
      else {
        window.alert('Something went wrong,please try again');
      }

    });
  }


  onStatusButtonSelect(status: number): void {
    status == 1 ? this.type = 'CancelledOrders' : status == 2 ? this.type = 'PaymentPending' : status == 31 ? this.type = 'AppOrders' : status == 32 ? this.type = 'CallCenterOrders' : status == 33 ? this.type = 'WebsiteOrders' : this.type = '';    
    const filterButtons = document.getElementById(this.type);
    if (filterButtons != null && this.enableButtonStatusFilter) {
       filterButtons.style.borderWidth='5px';
       this.deselectMainFilter(this.type);
   }
    this.centralWalkinOrderList = new Array();
    this.showMessage = false;
    this.paymentPendingRequest = false;
    this.cancelledOrderRequest = false;
    switch (status) {
      case 2: this.paymentPendingRequest = true; break;
      case 1: this.cancelledOrderRequest = true; break;
      case 4: this.sampleCollectionStatus = 4; break;
      case 21: this.sampleCollectionStatus = 21; break;
      case 31: this.sampleCollectionStatus = 31; break;
      case 32: this.sampleCollectionStatus = 32; break;
      case 33: this.sampleCollectionStatus = 33; break;
    }
    this.getCentralWalkInOrderList();
  }

  deselectMainFilter(mainFilter){
    if(this.enableButtonStatusFilter){
        this.mainFilterTypes.forEach(type=>{
            let filterButton = document.getElementById(type);
            if(type != mainFilter){
                filterButton.style.borderWidth='1px';
            }
        })
    }
}

  getCentralWalkInDiagnosticBookingsCount(): void {
    this.spinnerService.start();
    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      this.spinnerService.stop();
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Start Date should always be greater than end date';
      this.isError = true;
      this.showMessage = true;
      return;
    } else {
      this.showMessage = false;
      let productDeliveryReq = new ProductDeliveryRequest();
      productDeliveryReq.empId = this.empId;
      productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
      productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
      if (this.mobileSearchDateCheck && this.searchCriteria == 2) {
        productDeliveryReq.fromDate = 0;
        productDeliveryReq.toDate = 0;
      }
      productDeliveryReq.pocId = this.pocId;
      productDeliveryReq.centralHomeOders = false;
      if (this.searchCriteria == 1)
        productDeliveryReq.orderId = this.searchTerm;
      else if (this.searchCriteria == 2)
        productDeliveryReq.mobile = this.searchTerm;
      if (this.bookingSource > 0) {
        productDeliveryReq.bookingSource = this.bookingSource;
      }
      if (this.invoiceCompletionStatus > 0) {
        productDeliveryReq.invoiceCompletionStatus = this.invoiceCompletionStatus;
      }
      productDeliveryReq.pageSize = 0;

      this.diagAdminService.getCentralDiagnosticOrdersCount(productDeliveryReq).then(response => {
        this.spinnerService.stop();
        if (response != null && response != undefined)
          this.diagnosticOrdersCount = response;
        console.log("diagnosticBookingsCount" + JSON.stringify(this.diagnosticOrdersCount));
      }).catch((err) => {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Failed to fetch central Walkin Diagnostic Bookings count";
        this.showMessage = true;
      });

    }
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
    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      this.spinnerService.stop();
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Start Date should always be greater than end date';
      this.isError = true;
      this.showMessage = true;
      return;
    }
    (<any>$)("#mailmodal").modal("hide");
    this.spinnerService.start();

    let productDeliveryReq = new ProductDeliveryRequest();
    productDeliveryReq.empId = this.empId;
    productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
    productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
    if (this.mobileSearchDateCheck && this.searchCriteria == 2) {
      productDeliveryReq.fromDate = 0;
      productDeliveryReq.toDate = 0;
    }
    productDeliveryReq.pocId = this.pocId;
    productDeliveryReq.centralHomeOders = false;
    productDeliveryReq.fromIndex = this.fromIndex;
    productDeliveryReq.isExcel = true;
    productDeliveryReq.toEmail = this.toEmail;
    if (this.searchCriteria == 1)
      productDeliveryReq.orderId = this.searchTerm;
    else if (this.searchCriteria == 2)
      productDeliveryReq.mobile = this.searchTerm;
    if (this.bookingSource > 0) {
      productDeliveryReq.bookingSource = this.bookingSource;
    }
    if (this.invoiceCompletionStatus > 0) {
      productDeliveryReq.invoiceCompletionStatus = this.invoiceCompletionStatus;
    }
    if (this.paymentPendingRequest) {
      productDeliveryReq.paymentPendingRequest = this.paymentPendingRequest;
    }
    if (this.cancelledOrderRequest) {
      productDeliveryReq.cancelledOrderRequest = this.cancelledOrderRequest;
    }
    if (this.sampleCollectionStatus > 0) {
      productDeliveryReq.sampleCollectionStatus = this.sampleCollectionStatus;
    }
    this.diagAdminService.getDiagnosticCentralOrders(productDeliveryReq).then(response => {
      this.spinnerService.stop();
      this.toEmail = '';
      try {
        this.spinnerService.stop();
        if (this.total > 0)
          this.toast.show('Successfully sent email', "bg-success text-white font-weight-bold", 3000);
        else
          this.toast.show('No data found', "bg-danger text-white font-weight-bold", 3000);
      }
      catch (error) {
        console.error(error);
      }
    })
  }

}
