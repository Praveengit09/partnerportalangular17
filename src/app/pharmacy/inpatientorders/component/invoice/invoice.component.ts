import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyService } from './../../../pharmacy.service'
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service'
import { AuthService } from './../../../../auth/auth.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';

@Component({
  selector: '[inpatient-invoice-component]',
  templateUrl: './invoice.template.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./invoice.style.scss']
})
export class InPatientPharmacyInvoiceComponent implements OnInit {


  pharmacyAdviseTrack: CartItem;
  pharmacyAdviseInfoList: Array<Pharmacy>;
  pdfHeaderType: number;

  constructor(private pharmacyService: PharmacyService, private authService: AuthService, private router: Router, private hsLocalStorage: HsLocalStorage) {
    this.pdfHeaderType = authService.userAuth.pdfHeaderType;
    console.log("pdf type" + this.pdfHeaderType);
  }

  ngOnInit() {
    this.pharmacyAdviseTrack = this.pharmacyService.pharmacyAdviseTrack;
    if (this.pharmacyAdviseTrack) {
      let data = { 'pharmacyAdviceTrack': this.pharmacyAdviseTrack };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.pharmacyAdviseTrack = this.hsLocalStorage.getComponentData().pharmacyAdviceTrack;
      if (!this.pharmacyAdviseTrack) {
        this.gotoPharmacyOrderList();
      }
    }
    this.pharmacyAdviseInfoList = this.pharmacyAdviseTrack.pharmacyList;
    console.log("track" + JSON.stringify(this.pharmacyAdviseInfoList));
    this.pharmacyAdviseInfoList ? this.pharmacyAdviseInfoList.forEach(e => {
      if (e.stockDetails.packageNetPrice) {
        e.stockDetails.netPrice = e.packageSoldLoose ? e.stockDetails.unitNetPrice : e.stockDetails.packageNetPrice;
        e.stockDetails.grossPrice = this.getGrossPrice(e);
        // e.packageSoldLoose ? +e.stockDetails.grossPrice :
        //   (e.packingInformation.unitsInPackage ? +e.stockDetails.grossPrice * +e.packingInformation.unitsInPackage : e.stockDetails.grossPrice);
      }
    }) : '';
  }
  getGrossPrice(item: Pharmacy): number {
    // let grossPrice: number = item.stockDetails.grossPrice * (item.packageSoldLoose ? 1 : item.packingInformation.unitsInPackage)
    // return grossPrice;
    return item.grossPrice
  }

  gotoPharmacyOrderList(): void {
    this.router.navigate(['/app/pharmacy/inpatientorders/list']);
  }

  onPrintButtonClick() {
    console.log("pharmacyAdviseTrack in onPrintButtonClick()-->" + JSON.stringify(this.pharmacyAdviseTrack));
    if (this.pdfHeaderType == 0) {
      this.authService.openPDF(this.pharmacyAdviseTrack.pdfUrlWithHeader)
    } else {
      this.authService.openPDF(this.pharmacyAdviseTrack.pdfUrlWithoutHeader)
    }
  }

  onBackButtonClick() {
    this.gotoPharmacyOrderList();
  }


  ngOnDestroy(): void {

  }


}
