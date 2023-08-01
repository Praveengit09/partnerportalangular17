import { Component, ViewEncapsulation } from '@angular/core';
import { CartItem } from '../../../../model/basket/cartitem';
import { AuthService } from '../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Router } from '@angular/router';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { PaymentService } from '../../../../payment/payment.service';

@Component({
  selector: 'miscellaneouspaymentslisting_component',
  templateUrl: './listing.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./listing.style.scss']
})
export class MiscellaneousPaymentsListingComponent {
  pocId: any;
  from: number = 0;
  total: number = 0;
  dataMsg: string = '';
  miscellaneousOrdersList: CartItem[] = new Array<CartItem>();
  selectedMiscServiceAdvise: CartItem;
  pdfHeaderType: number;
  perPage: number = 10;
  searchTerm: any = '';
  orderId : string = '';
  mobileNo : string = '';
  columns: any[] =
    [
      {
        display: 'Order ID',
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

      {
        display: 'Centre Details',
        variable: 'pocDetails.pocName',
        filter: 'text',
        sort: false
      },
      {
        display: 'Date',
        variable: 'updatedTimestamp',
        filter: 'date',
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
        style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        filter: 'action',
        type: 'button',
        event: 'viewButton',
        sort: false,
        variable: 'payment.paymentStatus',
        conditions: [
          {
            value: '1',
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
            value: '2',
            condition: 'eq',
            label: 'Pending',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt'
          },
          {
            condition: 'default',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo'
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


  constructor(private paymentService: PaymentService, private authService: AuthService,
    private router: Router, private spinnerService: SpinnerService, private toast: ToasterService) {
    this.pocId = this.authService.userAuth.pocId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
  }

  ngOnInit() {
    this.getMiscellaneousOrdersList();
  }

  getMiscellaneousOrdersList() {
    this.paymentService.getMiscellaneousPaymentsOrdersList(this.pocId, this.from, 50,this.orderId,this.mobileNo).then((response) => {
      this.spinnerService.start();
      setTimeout(() => {
        this.spinnerService.stop();
        if (this.from > 0) {
          this.miscellaneousOrdersList.push.apply(this.miscellaneousOrdersList, response)
        } else {
          this.miscellaneousOrdersList = new Array();
          this.miscellaneousOrdersList = response;
        }
        if (this.miscellaneousOrdersList.length > 0) {
          this.total = this.from = this.miscellaneousOrdersList.length;

        } else {
          this.dataMsg = 'No Data Found'
        }

      }, 2000)
    });
  }

  onPage(page: number): void {
    this.getMiscellaneousOrdersList();
  }

  onInputChange() {
   
    this.total = this.from = 0;
}

  onGenerateNewOrder() {
    this.router.navigate(['/app/payment/miscellaneouspaymentsorderrequest']);
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

  onButtonClicked(item: CartItem): void {
    console.log(item)
    this.selectedMiscServiceAdvise = item;
    console.log(this.selectedMiscServiceAdvise.payment.paymentStatus != 1);
    if (this.selectedMiscServiceAdvise.payment.paymentStatus != 1)
      this.router.navigate(['/app/payment/miscellaneouspaymentsadvicedetail']);
  }

  onImageClicked(item: CartItem): void {
    this.selectedMiscServiceAdvise = item;
    let pdfUrl = '';
    if (this.selectedMiscServiceAdvise.payment.paymentStatus == 1) {

      if (this.pdfHeaderType == 0 || this.pdfHeaderType == undefined) {
        pdfUrl = this.selectedMiscServiceAdvise.pdfUrlWithHeader;
      }
      else {
        pdfUrl = this.selectedMiscServiceAdvise.pdfUrlWithoutHeader;
      }
      this.spinnerService.start();
      this.authService.getTempUrl(pdfUrl).then((url) => {
        this.spinnerService.stop();
        if ((url.statusCode == 201 || url.statusCode == 200)) {
          this.authService.openPDF(url.data);
        } else {
          this.toast.show(url.statusMessage, "bg-danger text-white font-weight-bold", 3000);
        }
      }).catch((err) => {
        this.spinnerService.stop();
        this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
      })

    }
  }

  onRefresh() {
    this.from = 0;
    this.total = 0;
    this.searchTerm = '';
    this.mobileNo = this.orderId = '';
    this.miscellaneousOrdersList = new Array<CartItem>();
    this.getMiscellaneousOrdersList();
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
        this.getQueueBasedOnOrderIdAndMobileNo(); 
    }
}

getQueueBasedOnOrderIdAndMobileNo(){
  let str = '';
  str = $('#search').val().toString();
  if(str != null && str != '' && str != undefined){
    if (isNaN(parseInt(str))) {
      this.orderId = str;
      this.mobileNo = '';
      this.getMiscellaneousOrdersList();
    } else {
      
      if (str.length != 10) {
        window.alert('Please Enter valid mobile number');
        return;
      }
      else{
        this.mobileNo = (str);
        this.orderId = '';
        this.getMiscellaneousOrdersList();
      }
    }
  }
 else{
  window.alert('Please Enter valid mobile number/order Id');
     
 }
}


  ngOnDestroy(): void {
    if (this.selectedMiscServiceAdvise != undefined && this.selectedMiscServiceAdvise != null) {
      this.paymentService.miscellaneousOrderAdviseTrack = this.selectedMiscServiceAdvise;
    }
  }

}