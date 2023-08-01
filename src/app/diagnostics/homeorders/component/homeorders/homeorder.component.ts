import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { CommonUtil } from '../../../../base/util/common-util';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { AuthService } from "./../../../../auth/auth.service";
import { LocationModeResponse } from './../../../../model/common/locationmoderesponse';
import { DiagnosticAdminRequest } from './../../../../model/diagnostics//diagnosticAdminRequest';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from './../../../diagnostics.service';




@Component({
  templateUrl: './homeorder.template.html',
  styleUrls: ['./homeorder.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class HomeOrderComponent implements OnDestroy {
  config: any;
  selectedDiagnosticsAdmin: DiagnosticDeliveryAdviceTrack;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  searchCriteria: string = 'orderId';
  deliveryDiagnosticslist: DiagnosticDeliveryAdviceTrack[];
  diagnoAdminRequest: DiagnosticAdminRequest;
  indexForCity: number = 0;
  indexForLoc: number = 0;
  indexForState: number = 0;
  empId: number;
  stateId: number;
  cityId: number;
  dataMsg: string = '';
  stateResponse: LocationModeResponse[] = [];
  cityResponse: LocationModeResponse[] = [];
  localityResponse: LocationModeResponse[] = [];
  perPage: number = 10;
  total: number = 0;
  pocId: number;
  pinCode: string = null;
  fromIndex: number = 0;
  isCorrectMobile: boolean = false;
  isFilterVisible: boolean = false;
  pdfHeaderType: number;

  startDate: Date = new Date();
  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Patient Details',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile , patientProfileDetails.age , patientProfileDetails.gender',
      filter: 'nametitle',
      filler: ',',
      sort: true
    },
    {
      display: 'Home Collection Address',
      variable: 'deliveryAddress.address1 deliveryAddress.address2 deliveryAddress.cityName deliveryAddress.pinCode',
      filter: 'text',
      sort: false
    },
    {
      display: 'Slot Date',
      variable: 'pickupDate',
      filter: 'date',
      sort: true
    },
    {
      display: 'Slot Time',
      variable: 'pickupTime',
      filter: 'time',
      sort: true
    },
    {
      display: 'Payment Status',
      variable: 'payment.paymentStatus',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Unpaid'
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
          condition: 'default',
          label: 'Unpaid'
        }
      ]
    },
    {
      display: 'Action',
      label: 'MARK COLLECTEED',
      style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
      filter: 'action',
      type: 'button',
      event: 'markCollectedButton',
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
      display: 'Action By',
      variable: 'empFirstName empLastName',
      filter: 'text',
      sort: true
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
          value: '0',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
        },
        {
          condition: 'default',
          label: 'assets/img/partner/pdf_icon_disabled.png',
        }
      ]
    }
  ];
  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
  };

  constructor(config: AppConfig, private authService: AuthService, private businessadminService: BusinessAdminService,
    private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil,
    private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.pocId = authService.userAuth.pocId;
    this.empId = this.authService.userAuth.employeeId;
    this.fromIndex = 0;
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
  }

  ngOnInit(): void {
    this.getState();
    this.getDiagnosticListForAdmin();
  }

  onSearchChange(search: string) {
    (<any>$)("#searchBox").val("");
    this.searchCriteria = search;
    this.isCorrectMobile = false;
    if (this.diagnoAdminRequest != undefined) {
      this.diagnoAdminRequest.orderId = this.diagnoAdminRequest.mobile = "";
    }
  }

  getRefreshedorderList(): void {
    $('#search').val('');
    (<any>$)("#searchBox").val("");
    (<any>$)("#checkOrderId").prop("checked", true);
    this.indexForCity = 0;
    this.indexForLoc = 0;
    this.indexForState = 0;
    this.indexForCity = 0;
    this.indexForLoc = 0;
    this.indexForState = 0;
    this.pinCode = null;
    this.stateId = 0;
    this.cityId = 0;
    this.fromIndex = 0;
    this.isCorrectMobile = false;
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.startDate = new Date();

    while (this.cityResponse.length > 0) {
      this.cityResponse.pop();
    }
    while (this.localityResponse.length > 0) {
      this.localityResponse.pop();
    }
    this.getDiagnosticListForAdmin();
  }

  startDateChoosen($event): void {
    this.startDate = $event;
    this.total = 0;
    this.deliveryDiagnosticslist = new Array<DiagnosticDeliveryAdviceTrack>();
    console.log("StartDate: " + this.startDate);
    this.getAdminDiagnosticOrderList();
  }

  onButtonClicked(statusDiagnosticsAdvise: DiagnosticDeliveryAdviceTrack): void {
    console.log("status-->" + JSON.stringify(statusDiagnosticsAdvise));
    this.selectedDiagnosticsAdmin = statusDiagnosticsAdvise;
    if (this.selectedDiagnosticsAdmin.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.COLLECTED
      && this.selectedDiagnosticsAdmin.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.REJECTED
      && this.selectedDiagnosticsAdmin.sampleCollectionStatus != DiagnosticDeliveryAdviceTrack.DELIVERED) {
      this.diagnosticsService.diagBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
      this.diagnosticsService.centralAdminModify = false;
      this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    } else if (this.selectedDiagnosticsAdmin.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.COLLECTED) {
      this.spinnerService.start();
      statusDiagnosticsAdvise.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.DELIVERED;
      this.diagnosticsService.updateDiagnosticAdminRemarks(statusDiagnosticsAdvise).then(data => {
        this.spinnerService.stop();
        if (data.statusCode == 200 || data.statusCode == 201) {
          alert('Status Updated Successfully');
          this.getDiagnosticListForAdmin();
        } else {
          alert('Something went wrong.Please try after sometime');
        }
      })
    }
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "markCollectedButton") { // event in cloumn object event {....., event:"editButton"  }
      this.onButtonClicked(e.val);
    } else if (e.event == 'pdfButton') {
      this.onImageClicked(e.val);
    }
  }

  onImageClicked(item: DiagnosticDeliveryAdviceTrack): void {
    // this.selectedDiagnosticsAdvise = item;
    console.log("Item: ", item);
    if (item.payment.paymentStatus == 1) {
      if (this.pdfHeaderType == 0) {
        this.authService.openPDF(item.pdfUrlWithHeader)
      } else {
        this.authService.openPDF(item.pdfUrlWithoutHeader)
      }
    }

  }

  onNewOrderButtonClicked(): void {
    this.diagnosticsService.slotBookingSubType = SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME;
    this.diagnosticsService.receptionPriscriptionDetails = undefined;
    this.router.navigate(['/app/diagnostics/slotbooking/slotselection']);
  }

  getDiagnosticListForAdmin(): void {
    this.diagnoAdminRequest = new DiagnosticAdminRequest();
    // this.diagnoAdminRequest.pocId = this.pocId;
    this.diagnoAdminRequest.pocIdList.push(this.pocId);
    this.diagnoAdminRequest.fromIndex = this.fromIndex;
    this.diagnoAdminRequest.empId = this.empId;
    console.log("fromIndex1:: " + this.fromIndex);
    this.getAdminDiagnosticOrderList();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId();
    }
  }

  getDiagnosticAdvisesForPocBasedOnPhoneNumberOrId(str: string = ''): void {
    str = $('#search').val().toString();
    if (isNaN(parseInt(str))) {
      this.searchCriteria = 'orderId';
    } else {
      this.searchCriteria = 'contactNo';
      if (str.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
    }
    this.total = 0;
    this.diagnoAdminRequest = new DiagnosticAdminRequest();
    this.diagnoAdminRequest.empId = this.empId;
    // this.diagnoAdminRequest.pocId = this.pocId;
    this.diagnoAdminRequest.pocIdList.push(this.pocId);
    this.diagnoAdminRequest.fromIndex = this.total;
    let searchStr = str.trim();
    console.log("SearchString length::" + searchStr.length);
    if (this.searchCriteria == 'orderId') {
      this.diagnoAdminRequest.orderId = searchStr;
    } else if (this.searchCriteria == 'contactNo') {
      if (searchStr.length < 10 || searchStr.length > 10) {
        this.isCorrectMobile = true;
        return;
      } else {
        this.diagnoAdminRequest.mobile = searchStr;
        this.isCorrectMobile = false;
      }
    }
    this.diagnoAdminRequest.state = this.stateId;
    this.diagnoAdminRequest.city = this.cityId;
    this.diagnoAdminRequest.pinCode = this.pinCode;
    this.getAdminDiagnosticOrderList();
  }

  getDiagnosticAdvisesStateOrCityOrAreaBased() {
    this.total = 0;
    if (this.diagnoAdminRequest == undefined) {
      this.diagnoAdminRequest = new DiagnosticAdminRequest();
    }
    this.diagnoAdminRequest.state = this.stateId;
    this.diagnoAdminRequest.city = this.cityId;
    this.diagnoAdminRequest.pinCode = this.pinCode;
    this.getAdminDiagnosticOrderList();
  }

  onPage(page: number) {
    this.fromIndex = +page * +this.perPage;
    console.log("fromIndex2:: " + this.fromIndex);
    this.getDiagnosticListForAdmin();
  }

  /* getAdminDiagnosticOrderList() {
    console.log("Bahubali Request::: " + JSON.stringify(this.diagnoAdminRequest));
    this.spinnerService.start();
    this.diagnosticsService.getDiagnosticListForAdmin(this.diagnoAdminRequest).then(diagnoListAdminData => {
      this.spinnerService.stop();
      console.log("AdminDiagnosticOrderList:: " + JSON.stringify(diagnoListAdminData));
      console.log("TotalValue::" + this.total);
      if (diagnoListAdminData.length == 0) {
        console.log("AdminDiagnosticOrderListIff:");
        this.total = diagnoListAdminData.length;
        this.isError = true;
        this.errorMessage = new Array();
        if (this.diagnoAdminRequest.orderId != undefined) {
          this.errorMessage[0] = "No data found for the specified Order Id.";
        } else if (this.diagnoAdminRequest.mobile != undefined) {
          this.errorMessage[0] = "No data found for the specified mobile number.";
        } else {
          this.errorMessage[0] = "No data found.";
        }
        this.deliveryDiagnosticslist = new Array();
        this.total = 0;
        this.showMessage = true;
      } else {
        console.log("AdminDiagnosticOrderListElse:");
        this.deliveryDiagnosticslist = diagnoListAdminData;
        this.total = this.deliveryDiagnosticslist.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.deliveryDiagnosticslist.forEach(element => {
          element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
        });
      }
    });
  } */

  getAdminDiagnosticOrderList() {
    this.dataMsg = 'Loading......';
    this.spinnerService.start();
    this.diagnoAdminRequest.employeeRequest = 4;
    this.diagnoAdminRequest.date = this.commonUtil.convertDateToTimestamp(this.startDate);

    this.diagnosticsService.getDiagnosticListForAdmin(this.diagnoAdminRequest).then(diagnoListAdminData => {
      this.spinnerService.stop();
      this.total = 0;
      if (this.fromIndex > 0) {
        this.deliveryDiagnosticslist.push.apply(this.deliveryDiagnosticslist, diagnoListAdminData)
      } else {
        this.deliveryDiagnosticslist = new Array();
        this.deliveryDiagnosticslist = diagnoListAdminData;
      }
      if (diagnoListAdminData.length > 0) {
        this.total = this.deliveryDiagnosticslist.length;
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
        this.deliveryDiagnosticslist.forEach(element => {
          if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
            element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
          }
        });
      } else if (this.diagnoAdminRequest.fromIndex == 0) {
        if (this.diagnoAdminRequest.orderId != undefined) {
          this.dataMsg = "No data found for the specified Order Id.";
        } else if (this.diagnoAdminRequest.mobile != undefined) {
          this.dataMsg = "No data found for the specified mobile number.";
        } else {
          this.dataMsg = "No data found.";
        }
        this.deliveryDiagnosticslist = new Array();
        this.total = this.deliveryDiagnosticslist.length;
        this.showMessage = true;
      }
    });
  }

  ngOnDestroy(): void {
    //console.log('Calling on destroy...' + JSON.stringify(this.selectedDiagnosticsAdmin));
    this.diagnosticsService.orderDetailAdviceTrack = this.selectedDiagnosticsAdmin;
  }

  getState(): void {
    this.stateId = 0;
    this.cityId = 0;
    this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
      this.stateResponse = locationResponse;
      this.stateResponse.sort(this.compare);
      console.log("stateresponse: " + JSON.stringify(this.stateResponse));
    });
  }

  compare(a, b): number {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }

  onStateChange(index: number): void {
    if (this.isCorrectMobile != true) {
      while (this.cityResponse.length > 0) {
        this.cityResponse.pop();
      }
      while (this.localityResponse.length > 0) {
        this.localityResponse.pop();
      }
      this.cityId = 0;
      this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
      this.pinCode = null;
      this.indexForCity = 0;
      this.indexForLoc = 0;
      if (index != 0) {
        this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
          this.cityResponse = locationResponse;
          this.cityResponse.sort(this.compare);
          console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
        });
        this.getDiagnosticAdvisesStateOrCityOrAreaBased();
      }
    }
  }

  onCityChange(index: number): void {
    if (this.isCorrectMobile != true) {
      while (this.localityResponse.length > 0) {
        this.localityResponse.pop();
      }
      this.indexForLoc = 0;
      this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
      this.pinCode = null;
      if (index != 0) {
        this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
          this.localityResponse = locationResponse;
          this.localityResponse.sort(this.compare);
          console.log("LocationDeatails for location For Login Emp:: " + JSON.stringify(this.localityResponse));
        });
        this.getDiagnosticAdvisesStateOrCityOrAreaBased();
      }
    }
  }

  onLocationChange(index: number): void {
    if (this.isCorrectMobile != true) {
      this.pinCode = (index > 0 ? this.localityResponse[index - 1].pinCode : null);
      if (index != 0) {
        this.getDiagnosticAdvisesStateOrCityOrAreaBased();
      }
    }
  }

  filterBtnClicked() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  getWidth() {
    return $(window).width();
  }

}
