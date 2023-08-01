import { PackingInformation } from './../../../../model/product/packinginformation';
import { StockDetails } from './../../../../model/product/stockdetails';
import { Component, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { PharmacyService } from "./../../../pharmacy.service";
import { Router } from '@angular/router';
import { Config } from '../../../../base/config';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../auth/auth.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { CommonUtil } from '../../../../base/util/common-util';

@Component({
  selector: 'pharmacy',
  templateUrl: './pharmacy.template.html',
  styleUrls: ['./pharmacy.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PharmacyComponent implements OnDestroy, OnInit {
  config: any;
  month: any;
  year: any;
  pharmacyList: CartItem[] = new Array<CartItem>();
  selectedPharmacyAdvise: CartItem;
  errorMessage: Array<string> = new Array();
  isError: boolean;
  showMessage: boolean;
  searchCriteria: string = 'orderId';
  defaultDate: number = 0;
  pdfHeaderType: number;
  defaultMsgForNoMacthingRecord: string = "No records found matching your search criteria. Please try some other criteria."
  timer: any;
  orderId = '';
  mobileNo = '';
  columns: any[] = [
    {
      display: 'Order ID',
      variable: 'orderId',
      filter: 'text',
      sort: false
    },
    {
      display: 'Patient Name',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile',
      filter: 'nametitle',
      filler: ',',
      sort: true
    },
    {
      display: 'Doctor Name',
      variable: 'doctorDetail.title doctorDetail.firstName doctorDetail.lastName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Clinic Name',
      variable: 'pocDetails.pocName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Status',
      variable: 'payment.paymentStatus',
      filter: 'text',
      sort: true,
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
          condition: 'default',
          label: 'Pending'
        }
      ]
    },
    // {
    //   display: 'InPatient ',
    //   variable: 'inPatientBilling',
    //   filter: 'text',
    //   sort: true,
    //   conditions: [
    //     {
    //       value: 'true',
    //       condition: 'eq',
    //       label: 'InPatient'
    //     },
    //     {
    //       value: 'false',
    //       condition: 'default',
    //       label: 'Out Patient'
    //     },
    //   ]
    // },
    {
      display: 'Date',
      variable: 'updatedTimestamp',
      filter: 'date',
      sort: false
    },
    {
      display: 'Action',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      variable: 'invoiceCompletionStatus',
      conditions: [
        {
          value: '5',
          condition: 'eq',
          label: 'Completed',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        },
        {
          value: '0',
          condition: 'lte',
          label: 'View',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '1',
          condition: 'eq',
          label: 'pending',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'pending',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
        }
      ]
    },
    {
      display: 'Return',
      label: 'View',
      style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      filter: 'action',
      type: 'button',
      event: 'returnOrder',
      sort: false,
      variable: 'returnStatus',
      conditions: [
        {
          value: '0',
          condition: 'eq',
          label: 'Return',
          style: 'btn width-100 mb-xs botton_txtdigo'
        },
        {
          value: '1',
          condition: 'gte',
          label: 'Returned',
          style: 'btn width-100 mb-xs botton_txtdigo disabled'
        },
        {
          condition: 'default',
          label: 'Return',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
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

  perPage: number = 10;
  total: number = 0;
  startDate;
  endDate;

  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  constructor(config: AppConfig,
    private pharmacyService: PharmacyService, private auth: AuthService, private commonUtil: CommonUtil,
    private router: Router, private spinnerService: SpinnerService) {
    this.config = config.getConfig();
    this.pdfHeaderType = auth.userAuth.pdfHeaderType;
    if (Config.portal && Config.portal.specialFeatures && !Config.portal.specialFeatures.enableInPatientBilling) {
      this.columns.splice(5, 1);
    }
  }

  ngOnInit(): void {
    let now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.pharmacyService.isEditedOrder = false;
    this.isError = this.pharmacyService.isError;
    this.errorMessage = this.pharmacyService.errorMessage;
    this.showMessage = this.pharmacyService.showMessage;
    this.pharmacyList = new Array();
    this.total = 0;
    this.getpharmacyAdvisesForPoc();
  }

  getpharmacyAdvisesForPoc(): void {
    let startDate, endDate;
    this.isError = this.pharmacyService.isError;
    this.errorMessage = this.pharmacyService.errorMessage;
    this.showMessage = this.pharmacyService.showMessage;

    this.startDate ? startDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate) : startDate = 0;
    this.endDate ? endDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000 : endDate = 0;

    this.spinnerService.start();
    this.pharmacyService.getpharmacyAdvisesForPoc(this.auth.userAuth.pocId, this.total, 50, this.orderId, this.mobileNo, startDate, endDate).then(pharmacyAdviseList => {
      this.spinnerService.stop();
      if (pharmacyAdviseList && pharmacyAdviseList.length > 0) {
        this.pharmacyList.push.apply(this.pharmacyList, pharmacyAdviseList);
        if (this.pharmacyList.length != this.total) {
          this.total = this.pharmacyList.length;
        }
        this.pharmacyList.forEach(doc => {
          if (doc.invoiceCompletionStatus < 5)
            doc.returnStatus = -1;
        });
      } else if (pharmacyAdviseList && pharmacyAdviseList.length == 0
        && ((this.orderId && this.orderId.length > 0) || (this.mobileNo && this.mobileNo.length > 0))) {
        this.pharmacyList = new Array<CartItem>();
        this.total = this.pharmacyList.length;
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = this.defaultMsgForNoMacthingRecord;
        this.showMessage = true;
      }
    });
  }

  getRefreshedorderList(): void {
    (<any>$)("#orderId").prop("checked", true);
    this.pharmacyService.isError = false;
    this.pharmacyService.errorMessage = undefined;
    this.pharmacyService.showMessage = false;
    this.defaultDate = 0;
    this.startDate = this.endDate = null;
    this.pharmacyList = new Array<CartItem>();
    this.total = 0;
    this.orderId = this.mobileNo = '';
    $('#search').val('');
    // if (search != undefined && search.length < 1) {
    this.getpharmacyAdvisesForPoc();
    // }
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getPharmacyAdvisesForPocBasedOnPhnNoId();
    }
  }

  getPharmacyAdvisesForPocBasedOnPhnNoId(search: string = ''): void {
    search = $('#search').val().toString();
    let orderId = '';
    let mobileNo = '';
    if (isNaN(parseInt(search))) {
      this.searchCriteria = 'orderId';
      this.orderId = search;
    } else {
      this.searchCriteria = 'contactNo';
      if (search.length != 10) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Please Enter valid mobile number');
        this.showMessage = true;
        return;
      }
      this.mobileNo = search;
    }
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.pharmacyList = (search == null || search == '') ? this.pharmacyList : new Array<CartItem>();
    this.total = 0;
    if (search == null || search == '') {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage.push('Please Enter search query');
      this.showMessage = true;
      return;
    }
    else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    this.getpharmacyAdvisesForPoc();
  }

  startDateChoosen(startDate) {
    this.startDate = startDate;
  }

  endDateChoosen(endDate) {

    this.endDate = endDate;
  }


  getPharmacyAdvisesForPocBasedOnDate() {
    let startDate = this.startDate;
    let endDate = this.endDate
    if (this.startDate && this.endDate) {
      if (this.commonUtil.convertOnlyDateToTimestamp(startDate) > this.commonUtil.convertOnlyDateToTimestamp(endDate)) {

        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push('Start date must be less than end date');
        this.showMessage = true;
        return;

      }
      else {
        this.pharmacyService.isError = false;
        this.pharmacyService.errorMessage = undefined;
        this.pharmacyService.showMessage = false;
        // this.defaultDate = 0;
        this.pharmacyList = new Array<CartItem>();
        this.total = 0;
        this.getpharmacyAdvisesForPoc();

      }
    }
    else {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage.push('Please enter Valid date range');
      this.showMessage = true;
      return;


    }

  }



  onButtonClicked(pharmacyAdvise: CartItem): void {
    console.log("onButtonClicked: ", pharmacyAdvise);
    // pharmacyAdvise.returnStatus = 0;
    this.selectedPharmacyAdvise = pharmacyAdvise;
    this.checkPrescriptionOrder(pharmacyAdvise);
    this.pharmacyService.pharmacyAdviseTrack = pharmacyAdvise;
    if (this.selectedPharmacyAdvise.payment.paymentStatus !== 1)
      this.router.navigate(['/app/pharmacy/advice/vieworder']);
  }

  checkPrescriptionOrder(pharmacyAdvise: CartItem) {
    console.log("inside");
    if (pharmacyAdvise.invoiceCompletionStatus == 0 && !Config.portal.specialFeatures.enableZeroPriceBilling) {
      pharmacyAdvise.pharmacyList.forEach(item => {
        item.stockDetails = new StockDetails();
        item.packingInformation = new PackingInformation();
      })
    }
  }

  onGenerateNewAdvise(): void {
    localStorage.removeItem("cartItem");
    this.router.navigate(['/app/pharmacy/advice/newadvice']);
  }

  onImageClicked(pharmacyAdvise: CartItem): void {
    this.selectedPharmacyAdvise = pharmacyAdvise;
    if (this.selectedPharmacyAdvise.payment.paymentStatus == 1) {
      let pdfUrl = '';
      if (this.pdfHeaderType == 0) {
        pdfUrl = this.selectedPharmacyAdvise.pdfUrlWithHeader;
      } else {
        pdfUrl = this.selectedPharmacyAdvise.pdfUrlWithoutHeader;
      }
      this.pharmacyService.openPDF(pdfUrl);
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
    else if (e.event == 'returnOrder') {
      if(e.val.returnStatus==0){
        this.onReturnOrderClicked(e.val);
      }
    }
  }

  onPage(page: number) {
    this.getpharmacyAdvisesForPoc();
  }

  ngOnDestroy(): void {
    this.pharmacyService.isError = false;
    this.pharmacyService.showMessage = false;

  }

  onSearchChange(search: string) {
    this.searchCriteria = search;
  }

  onReturnOrderClicked(order) {
    if (order.invoiceCompletionStatus == 5 && order.returnStatus == 0) {
      this.pharmacyService.pharmacyAdviseTrack = order;
      this.router.navigate(['app/pharmacy/returns/walkin']);
    }
  }

}
