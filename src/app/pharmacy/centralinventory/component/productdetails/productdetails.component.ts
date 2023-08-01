import { PocDetail } from './../../../../model/poc/pocDetails';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { PocPharmacyDetailsRequest } from '../../../../model/centralinventory/pocpharmacydetailsrequest';
import { PharmacyService } from '../../../pharmacy.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PharmacyInventoryDetail } from '../../../../model/pharmacy/pharmacyProductsDetailsList';
import { CommonUtil } from '../../../../base/util/common-util';

@Component({
  selector: 'productdetails',
  templateUrl: './productdetails.template.html',
  styleUrls: ['./productdetails.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class CentralInventoryProductDetailsComponent implements OnInit {

  pocPharmacyDetailsRequest=new PocPharmacyDetailsRequest();
  pharmacyInventoryDetail:Array<PharmacyInventoryDetail>=Array<PharmacyInventoryDetail>();
  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Medicine Name',
      variable: 'productName',
      filter: 'text',
      sort: true
    },
    {
      display: 'Manufacturer',
      variable: 'brandName',
      filter: 'text',
      sort: true
    }
    ,
    {
      display: 'Quantity Left',
      variable: 'stockDetails.totalAvailableQuantity',
      filter: 'text',
      sort: true
    }
    ,
    {
      display: 'Batch No',
      variable: 'stockDetails.batchNo',
      filter: 'text',
      sort: true
    },
    {
      display: 'Expiring On',
      variable: 'stockDetails.expiryDate',
      filter: 'datemmyy',
      sort: true
    }

  ];
  
  pocProductdetails:PocDetail=new PocDetail();
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonUtil:CommonUtil,
    private pharmacyService:PharmacyService,
    private spinnerService: SpinnerService
    ){
    this.pocProductdetails=this.pharmacyService.pocProductdetails;
    this.pocPharmacyDetailsRequest=this.pharmacyService.pocPharmacyDetailsRequest;
    if(this.pocPharmacyDetailsRequest==null && this.pocPharmacyDetailsRequest==undefined){
      this.router.navigate(['app/pharmacy/centralinventory/inventoryinformation']);
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      console.log(params);
      if(params['pocId']!=null && params['pocId']!=undefined && params['pocId']!=''){
        let pocId=parseInt(params['pocId']+'');
        this.pharmacyService.pocPharmacyDetailsRequest.pocId= pocId;
        this.getPOCPharmacyDetailsAccordingToCondition(pocId);
      }
      else{
        this.router.navigate(['app/pharmacy/centralinventory/inventoryinformation']);
      }
    });
  }

  getPOCPharmacyDetailsAccordingToCondition(pocId:number){
    this.spinnerService.start();
    this.pharmacyService.getPOCPharmacyDetailsAccordingToCondition(this.pocPharmacyDetailsRequest).then((data)=>{
      this.spinnerService.stop();
      this.pharmacyInventoryDetail = JSON.parse(JSON.stringify(data));
    }).catch(()=>{
      this.spinnerService.stop();
    })
  }
  onClickDownloadExcell(){
    let downloadRequest:PocPharmacyDetailsRequest= JSON.parse(JSON.stringify(this.pocPharmacyDetailsRequest));
    this.spinnerService.start();
    this.pharmacyService.getDownloadExcellLinkPharmacyDetailsAccordingToCondition(downloadRequest).then((data)=>{
      this.spinnerService.stop();
      console.log(data);
      if(data.imageUrl!=null&&data.imageUrl!=undefined){
        //  window.open(""+data.imageUrl+"", '_blank')
        this.pharmacyService.openPDF(data.imageUrl);
      }
    }).catch(()=>{
      this.spinnerService.stop();
    })
  }

  convertToDate(str) {
    return this.commonUtil.convertToDate(str);
  }
  
}
