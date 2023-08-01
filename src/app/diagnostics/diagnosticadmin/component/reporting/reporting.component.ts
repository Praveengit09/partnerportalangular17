import { AuthService } from './../../../../auth/auth.service';
import { AdminService } from './../../../../admin/admin.service';
import { CommonUtil } from './../../../../base/util/common-util';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { ProductDeliveryRequest } from '../../../../model/product/productdeliveryrequest';
import { DeliveryDetailsOfAllEmployees } from '../../../../model/diagnostics/deliveryDetailsOfAllEmployees';
import { Config } from '../../../../base/config';
import { DiagnosticAdminService } from '../../diagnosticadmin.service';

@Component({
  selector: 'reporting',
  templateUrl: './reporting.template.html',
  styleUrls: ['./reporting.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class ReportingOrdersComponent implements OnInit {

  errorMessage: Array<string>;
  brandFilter: boolean = false;

  total: number = 0;
  dataMsg: string = ' ';
  isError: boolean;
  error: string = '';
  showMessage: boolean;
  perPage: number = 10;
  deliveryDetailsOfEmployeeList: DeliveryDetailsOfAllEmployees[] = new Array<DeliveryDetailsOfAllEmployees>();
  pocRolesList: Array<EmployeePocMapping>;
  empId: number;
  employeeName: string;
  selectedPOC: EmployeePocMapping;
  pocId: number = 0;
  futureDate = new Date().setMonth(new Date().getMonth() + 1);
  pastDate = new Date().setMonth(new Date().getMonth() - 3);
  indexForPOC: number = 0;
  searchCriteria: number = 0;
  searchTerm: string = '';
  indexForVendor: number = 0;
  vendorListDetails: any = [];
  phleboVendorAssignment: boolean = false;
  isVendor: boolean = false;
  fromIndex = 0;
  pocIdList: Array<number> = [];

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
      display: 'Phlebo Name',
      variable: 'firstName lastName',
      filter: 'nametitle',
      sort: false
    },
    {
      display: 'Total Accepted',
      variable: 'noOfOrderAcceptedByThisEmployee',
      filter: 'text',
      sort: false
    },
    {
      display: 'Total Collected',
      variable: 'noOfOrderCollectedByThisEmployee',
      filter: 'text',
      sort: false
    },
    {
      display: 'Total Deliveries Pending',
      variable: 'totalSampleToBeDelievered',
      filter: 'text',
      sort: false
    },
    {
      display: 'Total Delivered',
      variable: 'totalSampleDelivered',
      filter: 'text',
      sort: false
    },
    // {
    //   display: 'Diagnostic Center Name',
    //   variable: 'pocName',
    //   filter: 'text',
    //   sort: false
    // },
    {
      display: 'Total Cash Collected',
      variable: 'cashCollected',
      filter: 'text',
      sort: false
    },
    {
      display: 'Total Cash Delivered',
      variable: 'cashDelivered',
      filter: 'text',
      sort: false
    }
  ];

  constructor(private spinnerService: SpinnerService, private commonUtil: CommonUtil, private diagAdminService: DiagnosticAdminService,
    private adminService: AdminService, private authService: AuthService) {
    this.empId = this.authService.userAuth.employeeId;
    this.employeeName = this.authService.userAuth.employeeName;
    if (Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment)
      this.phleboVendorAssignment = true;
    if (authService.userAuth.selectedPoc.pocType == 9) {
      this.isVendor = true;
    }
  }

  ngOnInit() {
    if (!this.phleboVendorAssignment)
      this.getPocList(this.empId, this.brandFilter);

    if (this.phleboVendorAssignment) {
      if (!this.isVendor) {
        this.getVendorsList();
      }
      else
        this.pocIdList.push(this.authService.selectedPocDetails.pocId);
    }
    if (!this.phleboVendorAssignment)
      this.getPlebotomistCollectionList();
  }


  getVendorsList() {
    this.vendorListDetails = [];
    this.diagAdminService.vendorDetails(this.authService.selectedPocDetails.pocId).then(list => {
      this.vendorListDetails = list;
      this.pocIdList = [];
      this.vendorListDetails.forEach(order => {
        this.pocIdList.push(order.pocId);
      });
      this.getPlebotomistCollectionList();
    });
  }

  onVendorSelect(index: number) {
    this.pocIdList = [];
    if (index > 0) {
      this.pocIdList.push(this.vendorListDetails[index - 1].pocId);
    } else {
      this.vendorListDetails.forEach(order => {
        this.pocIdList.push(order.pocId);
      });
    }
    this.deliveryDetailsOfEmployeeList = new Array();
    this.getPlebotomistCollectionList();
    //  For Vendor Concept Other than VDC incase needed
    // vendor manager - pocId = 0; pocIdList = [ ]
    // after selecting dropdown  pocId = selected pocId ; pocIdList = [ ];
    // when vendor logins , pocId = 0; pocIdList = [logined vendor pocId ];
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
    this.pocIdList = [];
    if (index > 0) {
      this.selectedPOC = this.pocRolesList[index - 1];
      this.pocIdList.push(this.selectedPOC.pocId);
    }
    this.deliveryDetailsOfEmployeeList = new Array();
    this.getPlebotomistCollectionList();
  }

  onEnterPressed(e) {
    console.log("Event: ", e);
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    if (e.keyCode == 13) {
      this.getOrderListWithMobileOrName();
    }
  }

  getOrderListWithMobileOrName(search: string = '') {
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
    this.searchTerm = search;
    this.getPlebotomistCollectionList();
  }

  getRefreshedorderList() {
    /* this.startDate = new Date();
    this.endDate = new Date(); */
    this.searchTerm = "";
    this.pocId = 0;
    $('#search').val('');
    this.indexForPOC = 0;
    this.deliveryDetailsOfEmployeeList = new Array();
    this.getPlebotomistCollectionList();
  }

  getPlebotomistCollectionList(): void {
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
      productDeliveryReq.pocId = this.pocId;
      productDeliveryReq.pocIdList = this.pocIdList;
      productDeliveryReq.fromIndex = this.fromIndex;
      // productDeliveryReq.centralHomeOders = true;
      if (this.searchCriteria == 1)
        productDeliveryReq.searchTerm = this.searchTerm;
      else if (this.searchCriteria == 2)
        productDeliveryReq.mobile = this.searchTerm;
      this.diagAdminService.getPhlemotomistCollectionData(productDeliveryReq).then(response => {
        this.spinnerService.stop();
        console.log(JSON.stringify(response));
        if (response.length > 0) {
          this.deliveryDetailsOfEmployeeList = [...this.deliveryDetailsOfEmployeeList, ...response];
          console.log(this.deliveryDetailsOfEmployeeList)
          // this.deliveryDetailsOfEmployeeList.forEach(item => {
          //   item.totalDeliveriesPending = (item.totalSampleToBeCollected + item.totalSampleToBeDelievered);
          // });
          this.total = this.deliveryDetailsOfEmployeeList.length;
        }
        else {
          this.dataMsg = "No Data Found";
          this.deliveryDetailsOfEmployeeList = new Array<any>();
          this.total = this.deliveryDetailsOfEmployeeList.length;
        }
      });
    }
    this.spinnerService.stop();
  }

  startDateChoosen($event): void {
    this.startDate = $event;
    console.log("startDateChoosen: ", $event);

    this.total = 0;
    this.deliveryDetailsOfEmployeeList = new Array();
    this.getPlebotomistCollectionList();
  }

  endDateChoosen($event) {
    this.endDate = $event;
    this.total = 0;
    this.deliveryDetailsOfEmployeeList = new Array();
    this.getPlebotomistCollectionList();
  }

  onPage(page: number) {
    console.log(page)
    if (this.total < 50 || (+this.total % 50) > 0) {
      return;
    }
    this.fromIndex = +this.total;
    this.getPlebotomistCollectionList();
  }

}
