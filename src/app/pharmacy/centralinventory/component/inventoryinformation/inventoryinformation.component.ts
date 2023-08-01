import { EmployeePocMapping } from './../../../../model/employee/employeepocmapping';
import { SearchRequest } from './../../../../model/common/searchRequest';
import { PocDetail } from './../../../../model/poc/pocDetails';
import { PharmacyService } from './../../../pharmacy.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyConstants } from '../../../../model/prescription/pharmacyconstants';
import { PocPharmacyDetailsRequest } from '../../../../model/centralinventory/pocpharmacydetailsrequest';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { ToasterService } from '../../../../layout/toaster/toaster.service';

@Component({
  selector: 'inventoryinformation',
  templateUrl: './inventoryinformation.template.html',
  styleUrls: ['./inventoryinformation.style.scss']
})

export class CentralInventoryInformationComponent implements OnInit {
  datepickerOpts = {
    autoclose: true,
    endDate: new Date(new Date().setFullYear((new Date().getFullYear()) + 200)),
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }
  quantity: number;
  quantityOption: number;
  expiringIn;
  pocPharmacyDetailsRequest = new PocPharmacyDetailsRequest();
  pocList: Array<EmployeePocMapping>;
  listOfPharmacyPOC: Array<PocDetail>;
  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Centre Details',
      variable: 'pocName \n address.areaName \n contactList',
      filter: 'text',
      sort: true
    },
    {
      display: 'Action',
      label: 'View',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'viewButton',
      type: 'button',
      style: 'btn btn-primary width-100 mb-xs botton_txt done_txt',
    },
    {
      display: 'Download',
      label: 'Download',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'download',
      type: 'button',
      style: 'btn btn-primary width-100 mb-xs botton_txt done_txt',
    }

  ];
  supplierId: number;
  supplierResult: any;
  supplierResultLength: any;
  selectColumns: any[] = [
    {
      variable: 'pocName',
      filter: 'text'
    },
    {
      variable: 'productName',
      filter: 'text'
    }
  ];
  constructor(private router: Router, private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private toast: ToasterService,
    private adminService: BusinessAdminService) {
    this.getPocList(this.authService.userAuth.employeeId);
    if (this.pharmacyService.isFromProduct == true) {
      this.getDataFromLocalStorage();
    }
    this.pharmacyService.isFromProduct = false;
  }
  getDataFromLocalStorage() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    if (window.localStorage.getItem("listOfPharmacyPOC") != undefined &&
      window.localStorage.getItem("listOfPharmacyPOC") != null) {
      this.listOfPharmacyPOC = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("listOfPharmacyPOC")));
    }
    if (window.localStorage.getItem("pocPharmacyDetailsRequest") != undefined &&
      window.localStorage.getItem("pocPharmacyDetailsRequest") != null) {
      this.pocPharmacyDetailsRequest = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem("pocPharmacyDetailsRequest")));
      if (this.pocPharmacyDetailsRequest.quantityLess != null &&
        this.pocPharmacyDetailsRequest.quantityLess != undefined &&
        this.pocPharmacyDetailsRequest.quantityLess != 0) {
        this.quantityOption = 0;
        this.quantity = this.pocPharmacyDetailsRequest.quantityLess;
      } else if (this.pocPharmacyDetailsRequest.quantityEquals != null &&
        this.pocPharmacyDetailsRequest.quantityEquals != undefined &&
        this.pocPharmacyDetailsRequest.quantityEquals != 0) {
        this.quantityOption = 1;
        this.quantity = this.pocPharmacyDetailsRequest.quantityEquals;
      } else if (this.pocPharmacyDetailsRequest.quantityGreater != null &&
        this.pocPharmacyDetailsRequest.quantityGreater != undefined &&
        this.pocPharmacyDetailsRequest.quantityGreater != 0) {
        this.quantityOption = 2;
        this.quantity = this.pocPharmacyDetailsRequest.quantityGreater;
      }
      if (this.pocPharmacyDetailsRequest.expiryDate != null &&
        this.pocPharmacyDetailsRequest.expiryDate != undefined &&
        this.pocPharmacyDetailsRequest.expiryDate != 0) {
        this.expiringIn = new Date(this.pocPharmacyDetailsRequest.expiryDate - 86400000 + 1);
      }
      this.pharmacyService.pocPharmacyDetailsRequest = this.pocPharmacyDetailsRequest;
    }
  }
  setDataToLocalStorage() {
    let cryptoUtil: CryptoUtil = new CryptoUtil();
    this.pharmacyService.pocPharmacyDetailsRequest = this.pocPharmacyDetailsRequest;
    window.localStorage.removeItem("pocPharmacyDetailsRequest");
    window.localStorage.setItem("pocPharmacyDetailsRequest", cryptoUtil.encryptData(JSON.stringify(this.pocPharmacyDetailsRequest)));
    window.localStorage.removeItem("listOfPharmacyPOC");
    window.localStorage.setItem("listOfPharmacyPOC", cryptoUtil.encryptData(JSON.stringify(this.listOfPharmacyPOC)));
  }

  ngOnInit() {
    setTimeout(() => {
      if (
        this.pocPharmacyDetailsRequest &&
        this.pocPharmacyDetailsRequest.suplierName != null &&
        this.pocPharmacyDetailsRequest.suplierName != undefined &&
        this.pocPharmacyDetailsRequest.suplierName != '') {
        $('.widget-info .newadvice_table input').val(this.pocPharmacyDetailsRequest.suplierName + '');
      }
    }, 1)

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

  getPharmacyConstants(sw: string) {
    switch (sw) {
      case 'pharmacyType': return PharmacyConstants.LIST_OF_TYPE_OF_PHARMACY;
      default: return '';
    }
  }
  setQuantityCondition() {
    console.log(this.quantityOption);
    switch (this.quantityOption + '') {
      case "0":
        this.pocPharmacyDetailsRequest.quantityLess = parseInt(this.quantity + '');
        this.pocPharmacyDetailsRequest.quantityEquals = 0;
        this.pocPharmacyDetailsRequest.quantityGreater = 0;
        break;
      case "1":
        this.pocPharmacyDetailsRequest.quantityLess = 0;
        this.pocPharmacyDetailsRequest.quantityEquals = parseInt(this.quantity + '');
        this.pocPharmacyDetailsRequest.quantityGreater = 0;
        break;
      case "2":
        this.pocPharmacyDetailsRequest.quantityLess = 0;
        this.pocPharmacyDetailsRequest.quantityEquals = 0;
        this.pocPharmacyDetailsRequest.quantityGreater = parseInt(this.quantity + '');
        break;
      default:
        this.pocPharmacyDetailsRequest.quantityLess = 0;
        this.pocPharmacyDetailsRequest.quantityEquals = 0;
        this.pocPharmacyDetailsRequest.quantityGreater = 0;
    }
  }
  ispocPharmacyDetailsRequestNull(req: PocPharmacyDetailsRequest) {
    if (req == null || req == undefined) {
      return true;
    } else if (req.pocId != null && req.pocId != undefined && req.pocId != 0) {
      return false;
    } else if (req.quantityEquals != null && req.quantityEquals != undefined && req.quantityEquals != 0) {
      return false;
    } else if (req.quantityGreater != null && req.quantityGreater != undefined && req.quantityGreater != 0) {
      return false;
    } else if (req.quantityLess != null && req.quantityLess != undefined && req.quantityLess != 0) {
      return false;
    } else if (req.expiryDate != null && req.expiryDate != undefined && req.expiryDate != 0 && !isNaN(req.expiryDate)) {
      return false;
    } else if (req.suplierName != null && req.suplierName != undefined && req.suplierName != '') {
      return false;
    } else if (req.drugForm != null && req.drugForm != undefined && req.drugForm != '') {
      return false;
    } else if (req.genericMedicineName != null && req.genericMedicineName != undefined && req.genericMedicineName != '') {
      return false;
    } else if (req.brandName != null && req.brandName != undefined && req.brandName != '') {
      return false;
    } else return true;
  }

  searchPoc() {
    if (this.expiringIn != null && this.expiringIn != undefined && (!isNaN(this.expiringIn))) {
      this.pocPharmacyDetailsRequest.expiryDate = parseInt(this.expiringIn.getTime() + '') + 86400000 - 1;
    } else {
      this.pocPharmacyDetailsRequest.expiryDate = 0;
    }
    console.log(this.pocPharmacyDetailsRequest);
    if (this.ispocPharmacyDetailsRequestNull(this.pocPharmacyDetailsRequest)) {
      this.listOfPharmacyPOC = undefined;
      this.toast.show("Select atleast one filter to search", "bg-danger text-white font-weight-bold", 3000);
      return;
    }
    this.spinnerService.start();
    this.pharmacyService.getPharmacyDetailsAccordingToCondition(this.pocPharmacyDetailsRequest).then((data) => {
      this.pharmacyService.pocPharmacyDetailsRequest = this.pocPharmacyDetailsRequest;
      console.log(data);
      this.spinnerService.stop();
      this.listOfPharmacyPOC = JSON.parse(JSON.stringify(data));
      this.setDataToLocalStorage()
    }).catch(() => {
      this.spinnerService.stop();
    })

  }
  onClickDownloadExcell(pocId: number) {
    let downloadRequest: PocPharmacyDetailsRequest = JSON.parse(JSON.stringify(this.pocPharmacyDetailsRequest));
    downloadRequest.pocId = pocId;
    this.spinnerService.start();
    this.pharmacyService.getDownloadExcellLinkPharmacyDetailsAccordingToCondition(downloadRequest).then((data) => {
      this.spinnerService.stop();
      console.log(data);
      if (data.imageUrl != null && data.imageUrl != undefined) {
        //  window.open("" + data.imageUrl + "", "_blank");
        this.pharmacyService.openPDF(data.imageUrl);
      }
    }).catch(() => {
      this.spinnerService.stop();
    })
  }
  onClickView(pocId: number) {
    this.pharmacyService.isFromProduct = true;
    this.router.navigate(['app/pharmacy/centralinventory/productdetails/' + pocId]);
  }
  resetFilters() {
    this.pocPharmacyDetailsRequest = new PocPharmacyDetailsRequest();
    $('.widget-info .newadvice_table input').val('');
    this.expiringIn = undefined;
    this.quantity = undefined;
    this.quantityOption = undefined;
    this.listOfPharmacyPOC = undefined;
    this.setDataToLocalStorage();
  }
  clickEventHandler(e) {
    if (e.event == 'viewButton') {
      this.onClickView(e.val.pocId);
      this.pharmacyService.pocProductdetails = JSON.parse(JSON.stringify(e.val));
    } else if (e.event == 'download') {
      this.onClickDownloadExcell(e.val.pocId);
    }
  }
  searchSupplier(key: string) {
    if (key == "0") return;
    var searchRequest = new SearchRequest();
    searchRequest.aliasSearchType = 3;
    searchRequest.id;
    searchRequest.searchCriteria = 0;
    searchRequest.searchTerm = key;
    this.pocPharmacyDetailsRequest.suplierName = key;
    searchRequest.pocName = key;
    this.supplierId = 0;
    // this.updateSupplierOrderListRequest.supplierEmail = '';
    // this.updateSupplierOrderListRequest.supplierAddress = '';
    // this.updateSupplierOrderListRequest.suppilerMobile = '';
    if (key == '0') {
      return;
    }
    if (key.length > 2) {
      this.pharmacyService.searchSupplier(searchRequest).then(supplierResult => {
        this.supplierResult = supplierResult;
        // this.getSupplierId(this.supplierResult[0].supplierName);
        this.supplierResultLength = this.supplierResult.length;
        console.log('searchResult in for--' + key + "---" + JSON.stringify(supplierResult));
      });
    }
  }

  getSupplierId(supplierName) {
    this.supplierId = 0;
    this.pocPharmacyDetailsRequest.suplierName = supplierName;
    if (this.supplierResult != undefined) {
      if (this.supplierResult.length > 0) {
        for (let i = 0; i < this.supplierResult.length; i++) {
          if (this.supplierResult[i].pocName == this.pocPharmacyDetailsRequest.suplierName) {
            this.supplierId = this.supplierResult[i].pocId;
            this.pharmacyService.supplierDetails = this.supplierResult[i];
          }
        }
      }
    }
    console.log(this.supplierId);
  }
}
