import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { ToasterService } from './../../../../layout/toaster/toaster.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { DiagnosticDeliveryAdviceTrack } from '../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticOrderHistory } from '../../../../model/diagnostics/diagnosticOrderHistory';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';
import { DiagnosticsService } from '../../../diagnostics.service';
import { AdminService } from './../../../../admin/admin.service';
import { AuthService } from './../../../../auth/auth.service';
import { Config } from './../../../../base/config';
import { CommonUtil } from './../../../../base/util/common-util';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { CentralOrderInteraction } from './../../../../model/common/centralorderinteraction';
import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { DiagnosticOrderReports } from './../../../../model/report/diagnosticorderreports';
import { DiagnosticOrdersCount } from './../../../../model/report/DiagnosticOrdersCount';
import { DiagnosticAdminService } from './../../diagnosticadmin.service';


@Component({
  selector: 'centralhomeorders',
  templateUrl: './listing.template.html',
  styleUrls: ['./listing.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class DiagnosticsCentralHomeOrderComponent implements OnInit {

  errorMessage: Array<string>;
  brandFilter: boolean = false;

  total: number = 0;
  dataMsg: string = ' ';
  isError: boolean;
  error: string = '';
  showMessage: boolean;
  consumablesList: any;
  finalCountTubes: Array<String>;
  perPage: number = 10;
  diagnosticscentralhomeordersList: any = new Array<any>();
  pocRolesList: Array<EmployeePocMapping>;
  empId: number;
  employeeName: string;
  selectedPOC: EmployeePocMapping;
  type: string = '';
  mainFilterTypes: string[] = ['PaymentPending', 'CancelledOrders', 'AddressChanged', 'AppOrders', 'CallCenterOrders', 'WebsiteOrders', 'VendorUnassigned', 'VendorRejected', 'PhleboUnassigned', 'PhleboRejected'];
  // pocIds = new Array<number>();
  pocId: number = 0;
  bookingSource: number = 0;
  invoiceCompletionStatus: number = 0;
  futureDate = new Date().setMonth(new Date().getMonth() + 1);
  pastDate = new Date().setMonth(new Date().getMonth() - 3);
  userData: CentralOrderInteraction = new CentralOrderInteraction();
  interactionStatus: string = '';
  modalTitle: string;
  modalId: string;
  comments: string;
  doctorInteractionComments: string = "";
  doctorInteractedStatus: string = '';
  consumerInteractionStatus: string = '';
  toEmail: string = '';
  consumerInteractedComments: string;
  requestBody: CentralOrderInteraction = new CentralOrderInteraction();
  indexForPOC: number = 0;
  indexForSource: number = 0;
  searchCriteria: number = 0;
  searchTerm: string = '';
  pdfHeaderType: number;
  fromIndex: number = 0;
  formattedDataString: string;
  diagnosticBookingReports: DiagnosticOrderReports = new DiagnosticOrderReports();
  mobileSearchDateCheck: boolean = false;
  enableRowColors: boolean = false;
  transactionHistoryList: DiagnosticOrderHistory[];
  diagnosticOrdersCount: DiagnosticOrdersCount = new DiagnosticOrdersCount();
  paymentPendingRequest: boolean = false;
  cancelledOrderRequest: boolean = false;
  rescheduled: boolean = false;
  sampleCollectionStatus: number = 0;
  enableButtonStatusFilter: boolean = false;
  enableReports: boolean = true;
  hideFilterByHCCentres: boolean = false;
  dropOffDetails: Array<any> = [];
  formattedDeliveryData: string = '';
  proofDocumentUrlList: Array<String>;
  convertedDocumentUrlList: Array<String>;
  cashproofDocumentUrlList: Array<String>;
  cashconvertedDocumentUrlList: Array<String>;
  convertedPhleboDocumentUrlList: Array<String>;
  cashDocs: boolean = false;
  crouselSelectedImage: String;
  prescriptionType = "";
  docsCheck: boolean = false;
  phleboDocs: boolean = false;
  enableVdcCustomTag: boolean = false;
  enableFilters: boolean = false;
  inputValue = "";
  disableMobilePayment: boolean = false;

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
      variable: 'invoiceId',
      filter: 'text',
      sort: false,
      sticky: false
    },
    {
      display: 'Patient Contact',
      variable: 'patientDetails',
      filter: 'text',
      sort: false
    },
    {
      display: 'Booking Details',
      variable: 'slotDateTime',
      filter: 'datetime',
      sort: false
    },
    {
      display: 'Phlebo Name',
      variable: 'phlebotomistName',
      filter: 'text',
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
          value: '6',
          condition: 'eq',
          label: 'Sample Delivered'
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
          label: 'Cancelled' // for vdc rejected label changed 
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
    // {
    //   display: 'Customer Interaction Status',
    //   variable: 'consumerInteractionStatus',
    //   filter: 'text',
    //   sort: false
    // },
    {
      display: 'Doctor Name',
      variable: 'doctorName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Order Creator',
      variable: 'creatorName',
      filter: 'text',
      sort: false
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
        },
        {
          value: '6',
          condition: 'eq',
          label: 'Phlebo App'
        }
      ]
    },
    {
      display: 'Reschedule',
      filter: 'action',
      type: 'button',
      event: 'rescheduleButton',
      sort: false,
      variable: 'cancellationStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Reschedule Booking',
          style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'Reschedule Booking',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Reschedule Booking',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Reschedule Booking',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          value: '11',
          condition: 'eq',
          label: 'Reschedule Booking',
          style: 'btn width-150 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          condition: 'default',
          label: 'Reschedule Booking',
          style: 'btn btn-danger width-150 mb-xs botton_txtdigo done_txt'
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
          // style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
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
  // sorting: any = {
  //   column: 'orderId',
  //   descending: true
  // };

  historyColumns: any[] = [
    {
      display: 'Description',
      variable: 'label',
      filter: 'text',
      sort: false
    },
    {
      display: 'Time',
      variable: 'updatedTimestamp',
      filter: 'datetime',
      sort: false
    }
  ];
  // tab: any;
  // tab1: any;
  // tab2: any;
  // tab3: any;
  // isActive: boolean = false;
  // tab4: any;
  // tab5: any;
  // temp: number = 0;


  constructor(private spinnerService: SpinnerService, private diagAdminService: DiagnosticAdminService, private commonUtil: CommonUtil,
    private adminService: AdminService, private authService: AuthService, private toast: ToasterService, private hsLocalStorage: HsLocalStorage,
    private diagnosticsService: DiagnosticsService, private router: Router) {
    this.empId = this.authService.userAuth.employeeId;
    this.employeeName = this.authService.userAuth.employeeName;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    this.fromIndex = 0;
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.disableMobileAndEditOption) {
      this.disableMobilePayment = true;
      this.columns.splice(2, 0, {
        display: 'Patient Details',
        variable: 'patientinfo',
        filter: 'text',
        sort: false,
        sticky: false
      });
    } else {
      this.columns.splice(2, 0, {
        display: 'Patient Details',
        variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName,  patientProfileDetails.age, patientProfileDetails.gender',
        filter: 'nametitle',
        sort: false,
        sticky: false
      });
    }
    let index = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment ? 6 : 19;
    console.log("index", index)
    this.columns.splice(index, 0, {
      display: 'Action',
      label: 'MARK COLLECTED',
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
    });

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
      this.columns.splice(7, 0, {
        display: 'LIS Message',
        variable: 'lisMessage',
        filter: 'text',
        sort: false
      });
    }
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
      this.columns[0].sticky = true;
      this.columns[1].sticky = true;
      this.columns[2].sticky = true;
      this.columns.splice(8, 0, {
        display: 'Vendor Name',
        variable: 'vendorPocName',
        filter: 'text',
        sort: false
      });
    }

    if (Config.portal.diagnosticOptions && !Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
      this.columns.splice(14, 0, {
        display: 'Tests Included',
        variable: 'serviceList',
        displayVariable: 'serviceName',
        breakFill: ', ',
        filter: 'array-to-string',
        sort: false
      });
    }

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableDiagnosticComments) {

      this.columns.splice(22, 0, {
        display: 'Center Interaction Comments',
        variable: 'formattedDoctorInteraction',
        filter: 'htmlContent',
        sort: false,
        event: 'showAllDoctorInteractions',
        eventLabel: 'View All',
        eventVisibleWhenEmpty: false
      });

      this.columns.splice(24, 0, {
        display: 'Add Center Interaction Status',
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

    if (Config.portal.diagnosticOptions && !Config.portal.diagnosticOptions.hideHomeCollectionPOCName) {
      this.columns.splice(5, 0, {
        display: 'Home Collection Location',
        variable: 'addressDetails',
        filter: 'text',
        sort: false
      });

      this.columns.splice(19, 0, {
        display: 'Center Name',
        variable: 'pocDetails.pocName pocDetails.contactList[0]',
        filter: 'text',
        sort: false
      });
    }

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableInvoiceSplitting) {

      this.columns.splice(16, 0, {
        display: 'Client Name',
        variable: 'clientName',
        filter: 'text',
        sort: false
      });

      this.columns.splice(17, 0, {
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

      this.columns.splice(26, 0, {
        display: 'Delivery Details',
        variable: 'sampleCollectionStatus',
        filter: 'action',
        type: 'button',
        event: 'deliveryDropDetails',
        sort: false,
        conditions: [
          {
            value: '9',
            condition: 'eq',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
          },
          {
            condition: 'default',
            label: 'View',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
          }
        ]
      });
    }


    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableFilters)
      this.enableFilters = true;

    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableHistoryForOrder) {
      this.columns.splice(25, 0, {
        display: 'History',
        label: 'History',
        style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
        filter: 'action',
        type: 'button',
        event: 'viewHistory',
        sort: false
      });
    }

    this.hideFilterByHCCentres = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.hideHomeCollectionPOCName;


    $(document).ready(function () {
      $(window).scroll(function () {
        if ($(window).scrollTop() > 550) {

          $('.list_diagnostic').addClass('positions');
          $('.ngTablePagination').removeClass('mt-2');



          // $('#diagnosticscentralhomeordersListTable .button_position').addClass('button_down');

          $('#diagnosticscentralhomeordersListTable').addClass('fixed_top');

        }

        if ($(window).scrollTop() < 551) {
          $('#diagnosticscentralhomeordersListTable').removeClass('fixed_top');
          $('.list_diagnostic').removeClass('positions');
          // $('#diagnosticscentralhomeordersListTable .button_position').removeClass('button_down');
        }
      })


    });
  }

  ngOnInit() {
    this.mobileSearchDateCheck = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableMobileSearchWithoutDates;
    this.enableRowColors = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableBackGroundColor;
    this.enableButtonStatusFilter = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableButtonStatusFilter;
    this.enableReports = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableReportSection;
    if (Config.portal.customizations && Config.portal.customizations.enableCustomVdcName)
      this.enableVdcCustomTag = true;
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem('homeCollectionStartDate') != null && window.localStorage.getItem('homeCollectionStartDate') != undefined) {
      this.startDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('homeCollectionStartDate'))));
      this.endDate = new Date(JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('homeCollectionEndDate'))));
    }
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


  onPOCSelect(index: number): void {
    this.showMessage = false;
    this.pocId = 0;
    if (index > 0) {
      this.selectedPOC = this.pocRolesList[index - 1];
      this.pocId = this.selectedPOC.pocId;
    }
    this.getDiagnosticCentralHomeOrdersList();
    this.getCentralDiagnosticBookingsCount();
  }

  onBookingSourceSelect(sourceVal: number): void {
    this.showMessage = false;
    this.bookingSource = sourceVal;
    this.getDiagnosticCentralHomeOrdersList();
    this.getCentralDiagnosticBookingsCount();
  }

  onStatusSelect(status: number): void {
    this.showMessage = false;
    this.invoiceCompletionStatus = status;
    this.getDiagnosticCentralHomeOrdersList();
  }

  onEnterPressed(e) {
    console.log("Event: ", e);
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (e.keyCode == 13) {
      this.getOrderListWithMobile();
    }
  }

  validateOrderId(event) {
    console.log(event)
    return this.commonUtil.validateInputes(event, 3) && this.inputValue.length < 12;
  }

  getOrderListWithMobile(search: string = '') {
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
    this.getDiagnosticCentralHomeOrdersList();
    this.getCentralDiagnosticBookingsCount();
  }

  getRefreshedorderList() {
    /* this.startDate = new Date();
    this.endDate = new Date(); */
    this.searchTerm = "";
    this.pocId = 0;
    $('#search').val('');
    this.indexForPOC = 0;
    this.fromIndex = 0;
    this.indexForSource = 0;
    this.bookingSource = 0;
    this.paymentPendingRequest = false;
    this.cancelledOrderRequest = false;
    this.sampleCollectionStatus = 0;
    this.searchCriteria = 0;
    this.diagnosticBookingReports = new DiagnosticOrderReports();
    this.getCentralDiagnosticBookingReports();

    this.diagnosticOrdersCount = new DiagnosticOrdersCount();
    this.getCentralDiagnosticBookingsCount();
    this.deselectMainFilter(null);  // for deselecting filter button
    this.getDiagnosticCentralHomeOrdersList();
  }

  getDiagnosticCentralHomeOrdersList(): void {
    this.spinnerService.start();
    this.dataMsg = 'Loading...';

    if (this.commonUtil.convertOnlyDateToTimestamp(this.startDate) > this.commonUtil.convertOnlyDateToTimestamp(this.endDate)) {
      this.spinnerService.stop();
      this.errorMessage = new Array();
      this.errorMessage[0] = 'Start Date should always be greater than end date';
      this.isError = true;
      this.showMessage = true;
      return;
    }

    else {
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
      productDeliveryReq.centralHomeOders = true;
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
      if (this.rescheduled) {
        productDeliveryReq.rescheduled = this.rescheduled;
      }
      if (this.sampleCollectionStatus > 0) {
        productDeliveryReq.sampleCollectionStatus = this.sampleCollectionStatus;
      }
      this.diagAdminService.getDiagnosticCentralOrders(productDeliveryReq).then(response => {
        this.spinnerService.stop();
        this.total = 0;
        if (this.fromIndex > 0) {
          this.sortBookingReport(this.diagnosticscentralhomeordersList.push.apply(this.diagnosticscentralhomeordersList, response));
        } else {
          this.diagnosticscentralhomeordersList = new Array();
          this.diagnosticscentralhomeordersList = this.sortBookingReport(response);
        }
        if (this.diagnosticscentralhomeordersList.length > 0) {
          this.total = this.diagnosticscentralhomeordersList.length;
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = false;
          this.diagnosticscentralhomeordersList.forEach(homeOrder => {

            if (homeOrder.patientProfileDetails && homeOrder.patientProfileDetails.dob && homeOrder.patientProfileDetails.dob != 0)
              homeOrder.patientProfileDetails.age = this.commonUtil.getAgeForall(homeOrder.patientProfileDetails.dob);
            else
              homeOrder.patientProfileDetails.age = 0;

            // for yoda dob optional
            if (this.disableMobilePayment) {
              homeOrder.patientinfo = "" + homeOrder.patientProfileDetails.fName + (homeOrder.patientProfileDetails.lName ? homeOrder.patientProfileDetails.lName : '') + ", " + (homeOrder.patientProfileDetails.age != 0 ? homeOrder.patientProfileDetails.age + ", " : '') + homeOrder.patientProfileDetails.gender;
            }

            homeOrder.slotDateTime = homeOrder.slotDate + (homeOrder.slotTime + + this.commonUtil.getTimezoneDifferential());

            if (homeOrder.cancellationStatus === 1 || homeOrder.cancellationStatus === 3) {
              homeOrder.orderStatus = 30;
            }
            else {
              homeOrder.invoiceCompletionStatus >= 2 ? homeOrder.cancellationStatus = 11 : '';
              homeOrder.orderStatus = homeOrder.invoiceCompletionStatus;
            }
            //New status updated for sample delivered
            if (homeOrder.sampleDropOffDetails != undefined && homeOrder.sampleDropOffDetails != null && homeOrder.sampleDropOffDetails.length > 0) {
              homeOrder.orderStatus = 6;
            }

            if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.lisIntegrated) {
              if (!homeOrder.referenceId || homeOrder.referenceId.length <= 0) {
                homeOrder.referenceId = "Not placed in LIS";
              }
            }

            if (homeOrder.payment.amountToBePaid == undefined || homeOrder.payment.amountToBePaid == null) {
              homeOrder.payment.amountToBePaid = homeOrder.payment.finalAmount - homeOrder.payment.amountPaid;
            }

            if (homeOrder.postPrandialSplitting)
              homeOrder.rowStyle = { 'background-color': '#DDA0DD', 'color': 'white' };
            if (this.paymentPendingRequest) {
              homeOrder.rowStyle = { 'background-color': '#f59a4b', 'color': 'white' };
            } else if (this.cancelledOrderRequest) {
              // homeOrder.rowStyle = { 'background-color': '#7271C8', 'color': 'white' };
            } else if (this.sampleCollectionStatus == 4) {
              // homeOrder.rowStyle = { 'background-color': '#D7972F', 'color': 'white' };
            }
            else if (this.sampleCollectionStatus == 21) {
              // homeOrder.rowStyle = { 'background-color': '#9A564F', 'color': 'white' };
            } else if (this.sampleCollectionStatus == 25) {
              homeOrder.rowStyle = { 'background-color': '#fe4343', 'color': 'white' };
            }
            else {
              if ((homeOrder.payment.paymentStatus == 0 || homeOrder.payment.paymentStatus == 2) && (homeOrder.cancellationStatus == 0 || homeOrder.cancellationStatus == 11)) {
                // homeOrder.rowStyle = { 'background-color': '#de4343', 'color': 'white' };
              }
              else if ((homeOrder.cancellationStatus == 1 || homeOrder.cancellationStatus == 2 || homeOrder.cancellationStatus == 3 || homeOrder.cancellationStatus == 11) && (homeOrder.phleboOrderCancelRequest == null || homeOrder.phleboOrderCancelRequest == undefined)) {
                // homeOrder.rowStyle = { 'background-color': '#7271C8', 'color': 'white' };
              }
              else if (homeOrder.sampleCollectionStatus == 4) {
                // homeOrder.rowStyle = { 'background-color': '#D7972F', 'color': 'white' };
              }
              else if ((homeOrder.phlebotomistName == "" || homeOrder.phlebotomistName == undefined)) {
                // homeOrder.rowStyle = { 'background-color': '#9A564F', 'color': 'white' };
              }
              else if ((homeOrder.phleboOrderCancelRequest != null || homeOrder.phleboOrderCancelRequest != undefined)) {
                // homeOrder.rowStyle = { 'background-color': '#de4343', 'color': 'white' };
              }
            }
          });
          console.log("check", JSON.stringify(this.diagnosticscentralhomeordersList));
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
          this.diagnosticscentralhomeordersList = new Array();
          this.total = this.diagnosticscentralhomeordersList.length;
          this.showMessage = true;
        }

      });

    }
    this.spinnerService.stop();
  }

  sortBookingReport(unsortedArray) {
    if (unsortedArray.length > 0) {
      this.diagnosticscentralhomeordersList = unsortedArray.sort((obj1, obj2) => {
        if (obj1.orderId == obj2.orderId) {
          return 0;
        } else if (obj1.orderId > obj2.orderId) {
          return -1;
        } else {
          return 1;
        }
      });
      this.total = this.diagnosticscentralhomeordersList.length;

    }
    return this.diagnosticscentralhomeordersList;
  }

  startDateChoosen($event): void {
    this.startDate = $event;
  }

  endDateChoosen($event) {
    this.endDate = $event;
  }

  onSubmit() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    window.localStorage.setItem('homeCollectionStartDate', cryptoUtil.encryptData(JSON.stringify(this.startDate)));
    window.localStorage.setItem('homeCollectionEndDate', cryptoUtil.encryptData(JSON.stringify(this.endDate)));

    let search = $('#search').val().toString();
    if (search.length > 0) {
      this.getOrderListWithMobile('');
      return;
    }

    this.diagnosticBookingReports = new DiagnosticOrderReports();
    this.getCentralDiagnosticBookingReports();

    this.diagnosticOrdersCount = new DiagnosticOrdersCount();
    this.getCentralDiagnosticBookingsCount();

    this.total = 0;
    this.diagnosticscentralhomeordersList = new Array();
    this.getDiagnosticCentralHomeOrdersList();
  }

  clickEventHandler(e) {
    if (e.event == 'customerReviewButton') {
      this.customerReviewButtonClicked(e.val);
    } else if (e.event == 'diagnosticReviewButton') {
      this.diagnosticReviewButtonClicked(e.val);
    } else if (e.event == 'showAllConsumerInteractions') {
      this.showAllCustomerInteractions(e.val);
    } else if (e.event == 'showAllDoctorInteractions') {
      this.showAllDoctorInteractions(e.val);
    } else if (e.event == 'viewOrderButton') {
      this.onViewButtonClicked(e.val);
    } else if (e.event == 'rescheduleButton') {
      this.onClickRescheduled(e.val);
    } else if (e.event == 'viewHistory') {
      this.onViewHistoryClicked(e.val);
    } else if (e.event == 'deliveryDropDetails') {
      this.getDeliveryDropOffDetails(e.val);
    }
  }

  onClickRescheduled(val) {
    this.diagnosticsService.order = val;
    this.diagnosticsService.tempPdfUrl = '/app/diagnostics/diagnosticadmin/centralhomeorders';
    if (val && val.cancellationStatus == 0) {
      this.router.navigate(['/app/diagnostics/diagnosticadmin/reschedule'])
    }
  }

  onPage(page: number) {
    this.fromIndex = +this.total;
    this.getDiagnosticCentralHomeOrdersList();
  }

  addInteractionStatus(status: any) {
    this.interactionStatus = status;
  }

  onViewButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
    if (statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
      && statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED
      && statusDiagnosticsAdvise.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED) {
      this.spinnerService.start();
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
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
    // if (data.consumerInteractionStatus != 'Interacted') {
    this.modalId = 'central_Diagnostic_id1';
    this.modalTitle = 'Add Customer Review';
    this.onButtonClicked(data);
    // }

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
    console.log("onButtonClicked: ", data);
    this.comments = '';
    this.interactionStatus = '';
    this.error = '';

    if (this.modalTitle === 'Add Customer Review') {
      this.doctorInteractedStatus = this.requestBody.doctorInteractedStatus = (this.userData.doctorInteractedStatus && this.userData.doctorInteractedStatus) || '';
      this.doctorInteractionComments = this.requestBody.doctorInteractionComments = (this.userData.doctorInteractionComments && this.userData.doctorInteractionComments) || '';
      this.requestBody.doctorInteractionDate = (this.userData.doctorInteractionDate && this.userData.doctorInteractionDate) || 0;
      this.requestBody.doctorInteractedEmpId = this.userData.doctorInteractedEmpId;
      this.requestBody.doctorInteractedEmployeeName = (this.userData.doctorInteractedEmployeeName && this.userData.doctorInteractedEmployeeName) || '';
    }
    else if (this.modalTitle === 'Add Diagnostic Center Review') {
      this.consumerInteractionStatus = this.requestBody.consumerInteractionStatus = (this.userData.consumerInteractionStatus && this.userData.consumerInteractionStatus) || '';
      this.consumerInteractedComments = this.requestBody.consumerInteractedComments = (this.userData.consumerInteractedComments && this.userData.consumerInteractedComments) || '';
      this.requestBody.consumerInteractionDate = (this.userData.consumerInteractionDate && this.userData.consumerInteractionDate) || 0;
      this.requestBody.consumerInteractedEmpId = (this.userData.consumerInteractedEmpId);
      this.requestBody.consumerInteractedEmployeeName = (this.userData.consumerInteractedEmployeeName && this.userData.consumerInteractedEmployeeName) || '';
    }
    (<any>$)("#modalId").modal("show");
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
        this.diagnosticscentralhomeordersList = new Array();
        this.getDiagnosticCentralHomeOrdersList();
        this.getCentralDiagnosticBookingsCount();
      }
      else {
        window.alert('Something went wrong,please try again');
      }

    });
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

  getCentralDiagnosticBookingReports() {

    this.showMessage = false;
    let productDeliveryReq = new ProductDeliveryRequest();
    productDeliveryReq.empId = this.empId;
    productDeliveryReq.fromDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
    productDeliveryReq.toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate);
    productDeliveryReq.pocId = this.pocId;
    productDeliveryReq.centralHomeOders = true;
    this.spinnerService.start();
    this.diagAdminService.getCentralDiagnosticBookingReports(productDeliveryReq).then(response => {
      this.spinnerService.stop();
      if (response != null && response != undefined)
        this.diagnosticBookingReports = response;
      console.log("diagnosticBookingReports" + JSON.stringify(this.diagnosticBookingReports));
    }).catch((err) => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Failed to fetch centralDiagnosticBookingReports";
      this.showMessage = true;
    });

  }

  onViewHistoryClicked(item): void {
    this.transactionHistoryList = null;
    item.transactionHistory.sort(function (a, b) {
      if (a.updatedTimestamp < b.updatedTimestamp) return -1;
      if (a.updatedTimestamp > b.updatedTimestamp) return 1;
      return 0;
    })
    if (item && item.transactionHistory && item.transactionHistory.length > 0) {
      let paymentStatus = 0;
      let vendorName = null;
      let phleboName = null;
      let cancellationStatus = 0;
      let prescriptionOrder = false;
      for (let index = 0; index < item.transactionHistory.length; index++) {
        let record = item.transactionHistory[index];
        if (index == 0) {
          // In the inital record, checking the booking and payment status
          let source = 'Call Centre';
          if (item.bookingSource == 1 || item.bookingSource == 4) {
            source = 'Mobile App';
          } else if (item.bookingSource == 5) {
            source = 'Website';
          } else if (item.bookingSource == 6) {
            source = "Phlebo App";
          }
          if (record.paymentStatus == 1) {
            paymentStatus = record.paymentStatus;
          }
          record.label = 'Order Placed from ' + source + '. Order is ' + (paymentStatus == 1 ? 'paid' : 'not paid') + '.';
          if (record.actionPerformed == 33) {
            prescriptionOrder = true;
            record.label = 'Order Placed through Prescription from ' + source + '. Order is not paid.'
          }
        } else if (record.actionPerformed > 0) {
          switch (record.actionPerformed) {
            case DiagnosticDeliveryAdviceTrack.COLLECTSAMPLE:
              if (record.acceptedEmpName) {
                record.label = 'Order has been assigned to ' + record.acceptedEmpName;
              }
              if (prescriptionOrder) {
                record.label = 'Order Initaited by ' + record.acceptedEmpName;
                prescriptionOrder = false;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.COLLECTED:
              if (paymentStatus == 0 && record.paymentStatus == 1) {
                record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' collected the samples and payment';
              } else {
                record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' collected the samples';
              }
              break;
            case DiagnosticDeliveryAdviceTrack.MODIFIED:
              if (record.acceptedEmpName) {
                record.label = 'Order has been modified by ' + record.acceptedEmpName;
              } else if (record.rescheduledOrder) {
                record.label = 'Order has been rescheduled.';
              } else {
                record.label = 'Order has been modified.';
              }
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.REJECTED:
              if (cancellationStatus > 0) {
                if (record.acceptedEmpName) {
                  record.label = 'Order has been cancelled by ' + record.acceptedEmpName;
                } else {
                  record.label = 'Order has been cancelled.';
                }
              } else {
                if (record.acceptedEmpName) {
                  record.label = 'Order has been rejected by ' + record.acceptedEmpName;
                } else {
                  record.label = 'Order has been rejected.';
                }
              }
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.COLLECTION_PENDING:
              if (paymentStatus == 0 && record.paymentStatus == 1) {
                record.label = 'Payment collected by phlebo ' + (phleboName ? phleboName : '');
                paymentStatus = record.paymentStatus;
              } else {
                // as yoda mobile payment is not there
                if (!this.disableMobilePayment)
                  record.label = 'Payment link sent to the customer.';
              }
              break;
            case DiagnosticDeliveryAdviceTrack.UPDATE_SAMPLE:
              record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' started sample collection process';
              break;
            case DiagnosticDeliveryAdviceTrack.ACCEPTED:
              if (record.vendorPocName != null && (vendorName == null || vendorName != record.vendorName)) {
                record.label = 'Order assigned to vendor ' + record.vendorPocName;
                vendorName = record.vendorPocName;
              } else if (record.acceptedEmpName != null && (phleboName == null || phleboName != record.acceptedEmpName || phleboName == record.acceptedEmpName)) {
                record.label = 'Order assigned to phlebo ' + record.acceptedEmpName;
                phleboName = record.acceptedEmpName;
              } else if (!vendorName && !phleboName && !record.acceptedEmpName && !record.vendorPocName) {
                record.label = 'Order accepted by admin.';
              } else if (phleboName && !record.acceptedEmpName) {
                record.label = 'Order accepted by phlebo ' + phleboName;
              } else if (vendorName && !record.vendorPocName) {
                record.label = 'Order accepted by vendor ' + vendorName;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.NOT_ACCEPTED:
              if (record.acceptedEmpName) {
                record.label = 'Order has been rejected by ' + record.acceptedEmpName;
              } else {
                record.label = 'Order has been rejected.';
              }
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.DELIVERED:
              record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' delivered the samples in the lab';

              break;
            case DiagnosticDeliveryAdviceTrack.PHLEBO_REACHED:
              record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' reached customer to collect samples';
              break;
            case DiagnosticDeliveryAdviceTrack.STARTED:
              record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' started journey to collect samples';
              break;
            case DiagnosticDeliveryAdviceTrack.PHLEBO_RAISED_CANCELREQ:
              record.label = 'Phlebo ' + (phleboName ? phleboName : '') + ' raised request to cancel order.';
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.PHLEBO_CASH_COLLECTED:
              record.label = 'Cash ' + (record.cashAmount ? ' of Rs.' + record.cashAmount : '') + ' deposited by the phlebo ' + (phleboName ? phleboName : '') + (record.pocName ? ' at ' + record.pocName : '');
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            case DiagnosticDeliveryAdviceTrack.PHLEBO_DLEIVERY_ACCEPTED:
              record.label = '' + (record.acceptedEmpName) + ' accepted delivered samples from ' + (phleboName ? phleboName : '');
              if (record.remarks && record.remarks.length > 0) {
                record.label += ' The following remarks are added: ' + record.remarks;
              }
              break;
            default:
              break;
          }
        }
        if (cancellationStatus == 0 && record.cancellationStatus > 0) {
          record.label = 'Order is rejected ' + (record.acceptedEmpName ? "by " + record.acceptedEmpName : '');
          if (record.remarks && record.remarks.length > 0) {
            record.label += ' with following reason: ' + record.remarks;
          }
          cancellationStatus = record.cancellationStatus;
        }
        if ((record.label == null || record.label.length == 0) && record.paymentStatus == 1 && record.actionPerformed == null) {
          if (index > 0 && item.transactionHistory[index - 1] && item.transactionHistory[index - 1].label != 'Payment has been made.')
            record.label = 'Payment has been made.';
        }
      }
      this.transactionHistoryList = item.transactionHistory.filter((record) => { return record.label != null && record.label.length > 0 });
      this.transactionHistoryList.forEach(doc => {
        if (doc.actionPerformed == 14)
          doc.rowStyle = { 'color': 'red' };
      });
      if (this.transactionHistoryList && this.transactionHistoryList.length > 0) {
        (<any>$("#transactionHistory")).modal("show");
        this.getPhebloDocs(item.selfiPic);
      } else {
        alert('History not available');
      }
    }
  }

  onStatusButtonSelect(status: number): void {
    status == 1 ? this.type = 'CancelledOrders' : status == 2 ? this.type = 'PaymentPending' : status == 4 ? this.type = 'VendorRejected' : status == 27 ? this.type = 'AddressChanged' : status == 31 ? this.type = 'AppOrders' : status == 32 ? this.type = 'CallCenterOrders' : status == 33 ? this.type = 'WebsiteOrders' : status == 26 ? this.type = 'VendorUnassigned' : status == 21 ? this.type = 'PhleboUnassigned' : status == 25 ? this.type = 'PhleboRejected' : this.type = '';
    const filterButtons = document.getElementById(this.type);
    if (filterButtons != null && this.enableButtonStatusFilter) {
      filterButtons.style.borderWidth = '5px';
      this.deselectMainFilter(this.type);
    }
    this.showMessage = false;
    this.paymentPendingRequest = false;
    this.cancelledOrderRequest = false;
    this.rescheduled = false;
    this.sampleCollectionStatus = 0;
    this.fromIndex = 0;
    this.diagnosticscentralhomeordersList = new Array();
    switch (status) {
      case 2: this.paymentPendingRequest = true; break;
      case 1: this.cancelledOrderRequest = true; break;
      case 4: this.sampleCollectionStatus = 4; break;
      case 21: this.sampleCollectionStatus = 21; break;
      case 25: this.sampleCollectionStatus = 25; break;
      case 26: this.sampleCollectionStatus = 26; break;
      case 27: this.sampleCollectionStatus = 27; break;
      case 30: this.rescheduled = true; break;
      case 31: this.sampleCollectionStatus = 31; break;
      case 32: this.sampleCollectionStatus = 32; break;
      case 33: this.sampleCollectionStatus = 33; break;
    }
    this.getDiagnosticCentralHomeOrdersList();
  }

  deselectMainFilter(mainFilter) {
    // if(this.enableButtonStatusFilter){
    this.mainFilterTypes.forEach(type => {
      let filterButton = document.getElementById(type);
      if (type != mainFilter) {
        filterButton.style.borderWidth = '1px';
      }
    })
    //  }
  }

  getCentralDiagnosticBookingsCount(): void {
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
      productDeliveryReq.centralHomeOders = true;
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
        this.errorMessage[0] = "Failed to fetch central Diagnostic Bookings count";
        this.showMessage = true;
      });


    }
    this.deselectMainFilter(this.type);
  }

  getDeliveryDropOffDetails(value) {
    let data = value;
    let tempString = "No details available";
    this.finalCountTubes = new Array<string>();
    this.proofDocumentUrlList = new Array<string>();
    this.cashproofDocumentUrlList = new Array<string>();
    this.docsCheck = false;
    this.cashDocs = false;
    this.consumablesList = [];
    if (value.consumablesInventoryDetails && value.consumablesInventoryDetails.length > 0)
      this.consumablesList = value.consumablesInventoryDetails;
    if (data != undefined && data != null && data.sampleDropOffDetails && data.sampleDropOffDetails.length > 0) {
      tempString = "<h4 class='page-title'>Sample Deposited Details:</h4>";
      data.sampleDropOffDetails.forEach(item => {
        console.log("item: " + JSON.stringify(item))
        let temp = "";
        let name = item.collectedByName ? ('<b>Employee Name: </b>' + item.collectedByName) : '';
        let empId = item.collectedById ? ('<b>Employee Id : </b>' + item.collectedById) : '';

        let poc = item.pocDetails.pocName ? ('<b>Drop Off Center: </b>' + item.pocDetails.pocName) : '';
        let date = item.updatedTimeStamp ? ('<b>Date: </b>' + this.commonUtil.convertTimeStampToDate(item.updatedTimeStamp)) : '';

        let service = '<b>Vacutainer list: </b>';
        let tubeNames = [];
        item.serviceList.forEach(test => {
          if (test.vacutainerList != null && test.vacutainerList.length > 0) {
            test.vacutainerList.forEach(tube => {
              if (tubeNames.length == 0) {
                tubeNames.push(tube.vacutainerType);
              } else {
                let check = tubeNames.filter((record) => { return record == tube.vacutainerType });
                if (!check.length)
                  tubeNames.push(tube.vacutainerType);
              }
            })
          }
        })
        if (tubeNames.length > 0) {
          service = service + tubeNames.length + "<br>";
          let tub = '';
          tubeNames.forEach((doc, index) => {
            tub = tub + doc + "- 1";
            if (index != tubeNames.length - 1)
              tub = tub + ', ';
            this.finalCountTubes.push(doc);
          })
          service = service + tub;
        } else {
          service = '<b>Service Names: </b>';
          item.serviceList.forEach((test, index) => {
            service = service + test.serviceName;
            if (index != item.serviceList.length - 1)
              service = service + ', ';
          })
        }
        temp = poc + "<br>" + name + "<br>" + empId + "<br>" + date + "<br>" + service + "<br>";
        tempString = tempString + temp + "<br>";
        item.samplesDropProof.forEach(doc => {
          this.proofDocumentUrlList.push(doc);
        })
      })
      this.docsCheck = true;
    }
    console.log("final tubes", JSON.stringify(this.finalCountTubes));

    let cashString = '';
    if (data != undefined && data != null && data.cashDeliveryDetails != null && data.cashDeliveryDetails != undefined) {
      cashString = "<h4 class='page-title'>Cash Deposited Details:</h4>";
      let item = data.cashDeliveryDetails;

      let name = item.empName ? ('<b>Employee Name: </b>' + item.empName) : '';
      let id = item.empId ? ('<b>Employee Id: </b>' + item.empId) : '';
      let date = item.updatedTimestamp ? ('<b>Date: </b>' + this.commonUtil.convertTimeStampToDate(item.updatedTimestamp)) : '';
      let amount = item.cashAmount ? ('<b>Amount: </b> Rs.' + item.cashAmount) : '';
      let poc = item.pocName ? ('<b>Drop Off Center: </b>' + item.pocName) : '';

      cashString = cashString + poc + "<br>" + name + "<br>" + id + "<br>" + date + "<br>" + amount + "<br>";

      if (item.proofs.length > 0) {
        this.cashDocs = true;
        this.cashproofDocumentUrlList = item.proofs;
      }
      else
        this.cashDocs = false;
    }
    (<any>$("#viewdropoff")).modal("show");
    this.formattedDeliveryData = tempString + cashString;
    this.getDocuments();
    this.getCashDocuments();
  }

  getPhebloDocs(value) {
    this.phleboDocs = false;
    this.convertedPhleboDocumentUrlList = new Array();
    if (value && value.length > 0) {
      this.phleboDocs = true;
      value.forEach(url => {
        if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
          this.convertedPhleboDocumentUrlList.push(url);
        }
        else {
          if (url.includes("pdf"))
            this.convertedPhleboDocumentUrlList.push(url);
          else {
            this.diagnosticsService.getPdfUrl(url).then(xdata => {
              this.convertedPhleboDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
            });
          }
        }
      });
    }
  }


  getDocuments() {
    this.convertedDocumentUrlList = new Array();
    if (this.proofDocumentUrlList && this.proofDocumentUrlList.length > 0) {
      this.proofDocumentUrlList.forEach(url => {
        if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
          this.convertedDocumentUrlList.push(url);
        }
        else {
          if (url.includes("pdf"))
            this.convertedDocumentUrlList.push(url);
          else {
            this.diagnosticsService.getPdfUrl(url).then(xdata => {
              this.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
            });
          }
        }
      });
    }
    console.log("converted", JSON.stringify(this.convertedDocumentUrlList));
  }

  getCashDocuments() {
    this.cashconvertedDocumentUrlList = new Array();
    if (this.cashproofDocumentUrlList && this.cashproofDocumentUrlList.length > 0) {
      this.cashproofDocumentUrlList.forEach(url => {
        if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
          this.cashconvertedDocumentUrlList.push(url);
        }
        else {
          if (url.includes("pdf"))
            this.cashconvertedDocumentUrlList.push(url);
          else {
            this.diagnosticsService.getPdfUrl(url).then(xdata => {
              this.cashconvertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
            });
          }
        }
      });
    }
    console.log("cash convert", JSON.stringify(this.cashconvertedDocumentUrlList));
  }

  sliderImage(imageSrc, type) {
    this.prescriptionType = type;
    this.crouselSelectedImage = undefined;
    if (type == "pdf") {
      this.authService.openPDF(imageSrc)
    } else {
      $('#prescription-modal').css('height', 'none');
      this.crouselSelectedImage = imageSrc;
    }
  }

  onViewDocs() {
    // (<any>$("#viewdropoff")).modal("hide");
    (<any>$("#viewdropoffdocs")).modal("show");
  }

  onViewCashDocs() {
    (<any>$("#viewcashdropoffdocs")).modal("show");
  }

  onSendEmail() {
    (<any>$("#mailmodal")).modal("show");
  }

  onViewPhleboDocs() {
    (<any>$("#viewselfie")).modal("show");
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
    productDeliveryReq.centralHomeOders = true;
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
