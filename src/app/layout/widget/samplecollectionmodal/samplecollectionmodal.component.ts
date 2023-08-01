import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Config } from '../../../base/config';
import { DeliveryCharges } from '../../../model/common/deliverycharges';
import { PocCollectionCharges } from '../../../model/common/poccollectioncharges';
import { DiagnosticScheduleService } from './../../../diagnostics/schedule/schedule.service';
import { BrandDetailsWithReferralCode } from '../../../model/brand/brandDetailsWithReferralCode';
import { SuperAdminService } from '../../../superadmin/superadmin.service';
import { PocDetail } from '../../../model/poc/pocDetails';

@Component({
  selector: 'samplecollection-modal',
  templateUrl: './samplecollectionmodal.template.html',
  styleUrls: ['./samplecollectionmodal.style.scss']
})
export class SampleCollectionModal implements OnInit {

  collectionCharge: PocCollectionCharges = new PocCollectionCharges();
  brandList: BrandDetailsWithReferralCode[] = [];
  errorMessage: string = '';
  isError = false;

  pocList: PocDetail[] = new Array<PocDetail>();

  @Input() pocId: number;
  @Input() type: number;
  @Input() brandSpecific: boolean;
  @Input() isForScreen: boolean;
  @Input() brandId: number;

  constructor(private diagScheduleService: DiagnosticScheduleService,
    private superAdminService: SuperAdminService) {

  }

  disableMouseScroll() {
    //  Disable input scroll 
    $(function () {
      $('div').on('focus', 'input[type=number]', function (e) {
        $(this).on('mousewheel.disableScroll', function (e) {
          e.preventDefault()
        })
        $(this).on("keydown", function (event) {
          if (event.keyCode === 38 || event.keyCode === 40) {
            event.preventDefault();
          }
        });
      })
      $('div').on('blur', 'input[type=number]', function (e) {
        $(this).off('mousewheel.disableScroll')
      })
    });
  }

  ngOnInit() {
    this.disableMouseScroll();
    console.log("ngOnInit");
    if (this.brandSpecific) {
      this.getBrandList();
    }
    this.getChargesData();
  }

  getBrandList() {
    this.superAdminService.getBrandDetails().then(brandList => {
      this.brandList = brandList;
    });
  }

  getChargesData() {
    this.diagScheduleService.getDiagnosticCollectionCharges(this.brandId, this.type, this.pocId).then(data => {
      this.collectionCharge = data;
      if (!this.collectionCharge || !(this.collectionCharge.deliveryCharges && this.collectionCharge.deliveryCharges.length > 0)) {
        let deliveryCharge: DeliveryCharges = new DeliveryCharges();
        this.collectionCharge.deliveryCharges = new Array<DeliveryCharges>();
        this.collectionCharge.deliveryCharges.push(deliveryCharge);
      }
      //deliveryCharges[0] is taken as "isIncludeDistance" is respective to entire list
      else if (this.collectionCharge && this.collectionCharge.deliveryCharges[0].toDistance > 0) {
        this.collectionCharge.isIncludeDistance = true;
      }
      (<any>$)("#samplecollModal").modal("show");
    })
  }

  updateChargesData() {
    console.log("BrandId: ", this.brandId);

    this.errorMessage = "";
    this.isError = false;
    this.collectionCharge.brandId = this.brandId;
    this.collectionCharge.pocId = this.pocId;
    this.collectionCharge.type = this.type;
    this.collectionCharge.brandSpecific = this.brandSpecific;
    this.collectionCharge.deliveryCharges.forEach(charge => {

      if (!this.collectionCharge.isIncludeDistance) {
        charge.fromDistance = 0;
        charge.toDistance = 0;
      }
      else if (this.collectionCharge.isIncludeDistance && (charge.fromDistance < 0 || charge.toDistance <= 0 ||
        charge.fromDistance > charge.toDistance)) {
        this.errorMessage = "Please enter valid dataa";
        this.isError = true;
        return;
      }

      if (!charge.orderValue || charge.orderValue <= 0 || !charge.collection || charge.collection < 0) {
        this.errorMessage = "Please enter valid data";
        this.isError = true;
        return;
      }
    });
    if (!this.isError) {
      this.diagScheduleService.updatedeliveryCharges(this.collectionCharge).then(data => {
        if (!this.isForScreen) {
          (<any>$)("#samplecollModal").modal("hide");
        }
        alert(data.statusMessage);
      })
    }
  }

  onAddClick() {
    let deliveryCharge: DeliveryCharges = new DeliveryCharges();
    this.collectionCharge.deliveryCharges.push(deliveryCharge);
  }

  onRemoveClick(index: number) {
    this.collectionCharge.deliveryCharges.splice(index, 1);
  }
}
