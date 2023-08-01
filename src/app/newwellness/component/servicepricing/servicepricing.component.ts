import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { WellnessService } from '../../wellness.service';
import { CommonUtil } from './../../../base/util/common-util';
import { WellnessServicePriceDetail } from './../../../model/wellness/wellnessServicePriceDetails';

@Component({
  selector: 'servicepricing',
  templateUrl: './servicepricing.template.html',
  styleUrls: ['./servicepricing.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ServicePricingComponent implements OnInit {

  pocId: number;
  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  addNewTest: boolean;
  showSummary: boolean;
  showAddDepartment1: boolean = true;
  showAddDepartment2: boolean = true;
  showAddDepartment3: boolean = true;
  showAddDepartment4: boolean = true;
  serviceName: string;
  serviceNameSearchList: any[] = new Array<any>();
  searchKeyword: string;
  categoryList: any;
  serviceList: any;

  selectTestName: any[] = [
    {
      variable: 'serviceName',
      filter: 'text'
    }
  ];
  selectedTest: WellnessServicePriceDetail;
  searchTestName: string;
  searchTestTotal: number = 0;


  constructor(private authService: AuthService, private wellnessService: WellnessService,
    private spinnerService: SpinnerService, private commonUtil: CommonUtil) {
    this.addNewTest = false;
    this.showSummary = false;
    this.pocId = this.authService.selectedPocDetails.pocId
    this.getCategories(0);
    this.getCategories(this.pocId);
  }

  ngOnInit() {
  }

  searchTests(searchKeyword) {
    this.searchKeyword = searchKeyword;
    this.serviceName = this.searchKeyword;
    if (searchKeyword.length > 2) {
      this.wellnessService.getWellnessServicesList(this.pocId, this.serviceName).then((data) => {
        this.searchTestTotal = data.length;
        this.serviceNameSearchList = data;
        this.commonUtil.sleep(700);
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      });
    }

  }
  getSearchTestName(searchTestName) {
    for (let i = 0; i < this.serviceNameSearchList.length; i++) {
      if (searchTestName.pocId == this.serviceNameSearchList[i].pocId && searchTestName.serviceName == this.serviceNameSearchList[i].serviceName) {
        this.selectedTest = this.serviceNameSearchList[i];
        this.showSummary = true;
      }
    }
    this.searchKeyword = this.selectedTest.serviceName;
    this.checkDepartments();
  }

  checkDepartments() {
    if (this.selectedTest.departmentId1 == undefined)
      this.selectedTest.departmentId1 = 0;
    if (this.selectedTest.departmentId2 == undefined)
      this.selectedTest.departmentId2 = 0;
    if (this.selectedTest.departmentId3 == undefined)
      this.selectedTest.departmentId3 = 0;
    if (this.selectedTest.departmentId4 == undefined)
      this.selectedTest.departmentId4 = 0;
  }


  onClickNewDepartment(index: number) {
    if (index == 1) {
      this.showAddDepartment1 = !this.showAddDepartment1;
      this.selectedTest.departmentId1 = 0;
      this.selectedTest.departmentName1 = "";
    }
    if (index == 2) {
      this.showAddDepartment2 = !this.showAddDepartment2;
      this.selectedTest.departmentId2 = 0;
      this.selectedTest.departmentName2 = "";
    }
    if (index == 3) {
      this.showAddDepartment3 = !this.showAddDepartment3;
      this.selectedTest.departmentId3 = 0;
      this.selectedTest.departmentName3 = "";
    } if (index == 4) {
      this.showAddDepartment4 = !this.showAddDepartment4;
      this.selectedTest.departmentId4 = 0;
      this.selectedTest.departmentName4 = "";
    }
  }

  getCategories(pocId) {
    this.wellnessService.getCategories(pocId).then((data) => {
      if (pocId) this.serviceList = data;
      else this.categoryList = data;
    })
  }

  onTestSelectChange(id: number) {
    if (id == 0) {
      this.selectedTest.categoryId = 0;
      this.selectedTest.categoryName = "";
    }
    else {
      this.categoryList.filter((service) => {
        if (service.categoryId == id) {
          this.selectedTest.categoryId = service.categoryId;
          this.selectedTest.categoryName = service.categoryName;
        }
      }
      )
    }
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 8 || event.keyCode == 46) {
      let val = event.target.value.split('.');
      if (val.length > 1 && event.keyCode == 46) {
        return false;
      }
      return true;
    }
    else if (key < 48 || key > 57) {
      return false;
    }
    else return true;
  }

  onClickNewTest() {
    this.addNewTest = true;
    this.showSummary = true;
    this.selectedTest = new WellnessServicePriceDetail();
    this.selectedTest.categoryId = 0;
    this.selectedTest.departmentId1 = 0;
    this.selectedTest.departmentId2 = 0;
    this.selectedTest.departmentId3 = 0;
    this.selectedTest.departmentId4 = 0;
  }


  onEnterPressed(event: any) {
    if (event == null || event == '') {
      event = 0;
    }
  }

  onDepartmentSelectChange1(id: number) {
    let subServiceList: any;

    this.serviceList.filter((service) => {
      if (service.categoryId >= 10000 && service.categoryId < 20000) {
        subServiceList = service.subServiceList;
      }
    })

    subServiceList.filter((item) => {
      if (item.categoryId == id) {
        this.selectedTest.departmentId1 = item.categoryId;
        this.selectedTest.departmentName1 = item.categoryName;
      }
    }
    )
    if (!this.showAddDepartment1)
      this.showAddDepartment1 = !this.showAddDepartment1;
    if (id == 0) {
      this.selectedTest.departmentName1 = "";
      this.selectedTest.departmentId1 = 0;
    }
  }

  onDepartmentSelectChange2(id: number) {
    let subServiceList: any;

    this.serviceList.filter((service) => {
      if (service.categoryId >= 20000 && service.categoryId < 30000) {
        subServiceList = service.subServiceList;
      }
    })

    subServiceList.filter((item) => {
      if (item.categoryId == id) {
        this.selectedTest.departmentId2 = item.categoryId;
        this.selectedTest.departmentName2 = item.categoryName;
      }
    }
    )

    if (id == 0) {
      this.selectedTest.departmentName2 = "";
      this.selectedTest.departmentId2 = 0;
    }

    if (!this.showAddDepartment2)
      this.showAddDepartment2 = !this.showAddDepartment2;
  }

  onDepartmentSelectChange3(id: number) {
    let subServiceList: any;

    this.serviceList.filter((service) => {
      if (service.categoryId >= 30000 && service.categoryId < 40000) {
        subServiceList = service.subServiceList;
      }
    })

    subServiceList.filter((item) => {
      if (item.categoryId == id) {
        this.selectedTest.departmentId3 = item.categoryId;
        this.selectedTest.departmentName3 = item.categoryName;
      }
    }
    )
    if (!this.showAddDepartment3)
      this.showAddDepartment3 = !this.showAddDepartment3;
    if (id == 0) {
      this.selectedTest.departmentName3 = "";
      this.selectedTest.departmentId3 = 0;
    }
  }

  onDepartmentSelectChange4(id: number) {
    let subServiceList: any;

    this.serviceList.filter((service) => {
      if (service.categoryId >= 40000) {
        subServiceList = service.subServiceList;
      }
    })

    subServiceList.filter((item) => {
      if (item.categoryId == id) {
        this.selectedTest.departmentId4 = item.categoryId;
        this.selectedTest.departmentName4 = item.categoryName;
      }
    }
    )
    if (!this.showAddDepartment4)
      this.showAddDepartment4 = !this.showAddDepartment4;
    if (id == 0) {
      this.selectedTest.departmentName4 = "";
      this.selectedTest.departmentId4 = 0;
    }
  }

  updateTestCreation() {
    console.log(this.selectedTest);
    if (this.selectedTest.serviceName == undefined || this.selectedTest.serviceName == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter serviceName";
      this.showMessage = true;
      return;
    }
    if (this.selectedTest.categoryName == undefined || this.selectedTest.categoryName == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please select category";
      this.showMessage = true;
      return;
    }
    if (this.selectedTest.grossPrice == undefined || this.selectedTest.grossPrice == 0 || this.selectedTest.netPrice == undefined || this.selectedTest.netPrice == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please update prices";
      this.showMessage = true;
      return;
    }
    if (this.selectedTest.discountPrice == undefined || this.selectedTest.discountPrice == 0) {
      this.selectedTest.discountPrice = this.selectedTest.grossPrice - this.selectedTest.netPrice;
    }
    if (this.selectedTest.departmentName1 == undefined && this.selectedTest.departmentName1 == null
      && this.selectedTest.departmentName2 == undefined && this.selectedTest.departmentName2 == null
      && this.selectedTest.departmentName3 == undefined && this.selectedTest.departmentName3 == null
      && this.selectedTest.departmentName4 == undefined && this.selectedTest.departmentName4 == null
    ) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please enter department";
      this.showMessage = true;
      return;
    }
    if (this.selectedTest.grossPrice < this.selectedTest.netPrice) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "MRP should be greater  than or Sale Price";
      this.showMessage = true;
      return;
    }
    if(this.selectedTest.discountPrice>0 && this.selectedTest.grossPrice<=this.selectedTest.netPrice){
      this.isError=true;
      this.errorMessage=new Array();
      this.errorMessage[0]="MRP should be greater than Sale Price if Discount Price is given";
      this.showMessage=true;
      return;
    }

    this.selectedTest.pocId = this.pocId;
    this.spinnerService.start();

    this.wellnessService.updateWellnessTestPrice(this.selectedTest).then((data) => {
      this.spinnerService.stop();
      if (data.statusCode == 200) {
        alert(data.statusMessage);
        location.reload();
      }
    });

  }
  updatesCancel() {
    this.spinnerService.start();
    alert("Cancel");
    this.spinnerService.stop();
    location.reload();

  }

}