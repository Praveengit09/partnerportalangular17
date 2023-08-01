import { AuthService } from './../../../../auth/auth.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CentralInventryService } from '../../centralinventory.service';

class Graph {
  dataset: Object;
  labels = new Array();
  data;
}
@Component({
  templateUrl: './inventryReports.template.html',
  styleUrls: ['./inventryReports.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class CentralInventoryReportsComponent implements OnInit {

  monthNames = new Array();
  monthIndex;
  yearList = new Array();
  yearIndex = 0;
  today = new Date();
  allowMonthSelect: boolean = false;
  monthlySalesReportRes: any = new Object();
  ordersFulfilsPerDay = new Graph();
  getDiagnosisVsMedicineRes: any;
  manufacturarVsDoctorRes: any;
  manufacturarVsDrugsSoldRes: any;
  topDrugsSoldRes: any;
  manufacturarVsDiagnosisVsSalesRes: any;
  brandListRes: any[];
  symtomListRes: any[];

  perPage: number = 10;
  // sorting: any = {
  //   column: 'updatedTimestamp',
  //   descending: true
  // };
  columnsGetDiagnosisVsMedicineRes: any[];
  columnsManufacturarVsDoctorRes: any[];
  columnManufacturarVsDrugsSoldRes: any[];
  columnTopDrugsSoldRes: any[];
  columnManufacturarVsDiagnosisVsSalesRes: any[];

  manuVDiaVSalesBrandIndex: number = 0;
  manuVDrugsBrandIndex: number = 0;
  manuVDoctorBrandIndex: number = 0;
  diagnoVMedicineTypeIndex: number = 0;

  SymtomList: any[] = [
    {
      variable: 'name',
      filter: 'text'
    }
  ];


  constructor(private inventryService: CentralInventryService, private authService: AuthService) {
  }

  ngOnInit() {
    this.columnsGetDiagnosisVsMedicineRes = this.inventryService.columnsGetDiagnosisVsMedicineRes;
    this.columnsManufacturarVsDoctorRes = this.inventryService.columnsManufacturarVsDoctorRes;
    this.columnManufacturarVsDrugsSoldRes = this.inventryService.columnManufacturarVsDrugsSoldRes;
    this.columnTopDrugsSoldRes = this.inventryService.columnTopDrugsSoldRes;
    this.columnManufacturarVsDiagnosisVsSalesRes = this.inventryService.columnManufacturarVsDiagnosisVsSalesRes;
    this.getMonthList();
    this.getBrandNames();
    //this.getSymtoms();
  }

  getMonthlySalesReport() {
    let reqDate = new Date();
    reqDate.setMonth(this.monthIndex);
    reqDate.setFullYear(+this.yearList[this.yearIndex]);
    this.inventryService.getMonthlySalesReport(reqDate.getTime()).then(data => {
      this.monthlySalesReportRes = data[0];
    });
  }
  getDiagnosisVsMedicine() {
    this.inventryService.diagnosisVsMedicine(this.symtomListRes[this.diagnoVMedicineTypeIndex].name).then(data => {
      // console.log('getDiagnosisVsMedicine==>' + JSON.stringify(data))
      this.getDiagnosisVsMedicineRes = data;
    });
  }
  manufacturarVsDoctor() {
    this.inventryService.manufacturarVsDoctor(this.brandListRes[this.manuVDoctorBrandIndex].brandName).then(data => {
      // console.log('manufacturarVsDoctor==>' + JSON.stringify(data))
      this.manufacturarVsDoctorRes = data;
    });
  }
  manufacturarVsDrugsSold() {
    this.inventryService.manufacturarVsDrugs(this.brandListRes[this.manuVDrugsBrandIndex].brandName).then(data => {
      // console.log('manufacturarVsDrugs==>' + JSON.stringify(data))
      this.manufacturarVsDrugsSoldRes = data;
    });
  }
  topDrugsSold() {
    console.log("pavan");
    this.inventryService.topDrugsSold().then(data => {
      // console.log('topDrugsSold==>' + JSON.stringify(data))
      this.topDrugsSoldRes = data;
    });
  }
  manufacturarVsDiagnosisVsSales() {
    this.inventryService.manufacturarVsDiagnosisVsSales(this.brandListRes[this.manuVDiaVSalesBrandIndex].brandName).then(data => {
      // console.log('manufacturarVsDiagnosisVsSales==>' + JSON.stringify(data))
      this.manufacturarVsDiagnosisVsSalesRes = data;
    });
  }
  getBrandNames() {
    this.inventryService.getBrandNames().then(data => {
      // console.log('Brand Names==>' + JSON.stringify(data))
      this.brandListRes = data;
      this.brandListRes.sort(function (a, b) {
        if (a.brandName && b.brandName && a.brandName.toLowerCase() < b.brandName.toLowerCase())
          return -1;
        if (a.brandName && b.brandName && a.brandName.toLowerCase() > b.brandName.toLowerCase())
          return 1;
        return 0;
      });
      this.getFulfiledData();
      this.getMonthlySalesReport();
      this.manufacturarVsDoctor();
      this.manufacturarVsDrugsSold();
      this.topDrugsSold();
      this.manufacturarVsDiagnosisVsSales();
    });
  }
  getSymtoms() {
    this.inventryService.getSymtomNames().then(data => {
      console.log('Symtoms Names==>' + JSON.stringify(data))
      this.symtomListRes = data;
      this.symtomListRes.sort(function (a, b) {
        if (a.name && b.name && a.name.toLowerCase() < b.name.toLowerCase())
          return -1;
        if (a.name && b.name && a.name.toLowerCase() > b.name.toLowerCase())
          return 1;
        return 0;
      });
      this.getDiagnosisVsMedicine();
    });
  }
  onDropDownChange(index, type) {
    if (type == 'manuVDoctorBrandIndex') {
      this.manuVDoctorBrandIndex = index;
      this.manufacturarVsDoctor();
    }
    else if (type == 'manuVDrugsBrandIndex') {
      this.manuVDrugsBrandIndex = index;
      this.manufacturarVsDrugsSold();
    }
    else if (type == 'manuVDiaVSalesBrandIndex') {
      this.manuVDiaVSalesBrandIndex = index;
      this.manufacturarVsDiagnosisVsSales();
    } else if (type == 'diagnoVMedicineTypeIndex') {
      this.diagnoVMedicineTypeIndex = index;
      this.getDiagnosisVsMedicine();
    }
  }

  getFulfiledData() {
    this.ordersFulfilsPerDay.labels = new Array();
    this.ordersFulfilsPerDay.data = new Array();
    this.ordersFulfilsPerDay.dataset = undefined;
    let reqDate = new Date();
    reqDate.setMonth(this.monthIndex);
    reqDate.setFullYear(+this.yearList[this.yearIndex]);
    this.inventryService.getGraphOrderFulfillPerDay(reqDate.getTime()).then(data => {
      console.log(JSON.stringify(data));
      let eleArr = data;
      if (eleArr.length > 0)
        eleArr.forEach(e => {
          let date = new Date(e.x).getDate();
          this.ordersFulfilsPerDay.data[date] = e.y;
        });
      this.ordersFulfilsPerDay.dataset = [{
        data: this.ordersFulfilsPerDay.data,
        borderColor: "#3e95cd",
        fill: false
      }]
    });
    let tDate = new Date(reqDate.getTime());
    let lastDate = new Date(tDate.getFullYear(), tDate.getMonth() + 1, 0).getDate();
    for (let index = 0; index <= lastDate; index++) {
      this.ordersFulfilsPerDay.data.push('');
      this.ordersFulfilsPerDay.labels.push(index);
    }
  }

  onSelecteMonth(index: number, type?) {
    this.allowMonthSelect = true;
    this.ordersFulfilsPerDay.dataset = new Array();
    type == 'year' ? this.yearIndex = index : this.monthIndex = index;
    this.allowMonthSelect = this.yearList[this.yearIndex] == this.today.getFullYear() ? false : true;
    this.getFulfiledData();
  }
  getMonthList() {
    this.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    let month = this.today.getMonth();
    let year = this.today.getFullYear();
    this.yearList = new Array();
    for (let i = 0; i <= 50; i++) {
      (+year - 50 + +i) == +year ? this.yearIndex = i : 0;
      this.yearList.push(year - 50 + i);
    }
    this.allowMonthSelect = false;
    this.monthIndex = month;
  }

  onPage(page: number) {
    // this.getProductAdvisesForPoc(this.productList[this.total - 1].updatedTimestamp);
    // alert(page)
  }
  clickEventHandler(e) {
    // if (e.event == "viewButton") {
    //   this.onButtonClicked(e.val);
    // } else if (e.event == "pdfClick") {
    //   this.onImageClicked(e.val)
    // }
  }

  searchSymptoms(searchElement){
    if (searchElement.length >= 3) {
      this.inventryService
        .getSymptomsAndDiagnosisAutocomplete({
          aliasSearchType: 5,
          favPartnerPocId: 0,
          from: 0,
          id: this.authService.userAuth.employeeId,
          searchCriteria: 0,
          searchTerm: searchElement,
          size: 100
        })
        .then(data => {
          if (data.length > -1) {
            this.symtomListRes = JSON.parse(JSON.stringify(data));
          }
        });
    } else {  
      this.symtomListRes = [];     
    }
  }

   selecetedSymptom(searchTerm){
    for(var i=0; i<this.symtomListRes.length; i++){
      if(searchTerm.name==this.symtomListRes[i].name){
        this.onDropDownChange(i,'diagnoVMedicineTypeIndex');
      }
    }
  }

}