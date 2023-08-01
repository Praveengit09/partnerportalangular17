import { ReferredPoc } from './../../../../model/poc/pocDetails';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';

import { Component, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { PocDetail } from '../../../../model/poc/pocDetails'
import { PocSearch } from '../../../../model/poc/pocSearch';

@Component({
  selector: 'mypoc',
  templateUrl: './mypoc.template.html',
  styleUrls: ['./mypoc.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class MyPocComponent implements OnInit {


  errorMessage: Array<string>;
  searchTerm: string;
  pocIdList: Array<number>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  pocList: PocDetail[] = new Array<PocDetail>();
  perPage: number = 10;
  total: number = 0;
  scrollPosition: number;
  time: any;
  offset: number = 50;
  fromIndex: number;
  empId: number;
  pocId: number;
  isSuperAdmin: boolean;
  skip: number = 0;
  size: number = 100;
  columns: any[] = [
    {
      display: 'POC Name',
      variable: 'pocName',
      // sticky:true,
      event: 'pocNameClick',
      filter: 'action',
      style: 'orderId',
      type: 'hyperlink',
      sort: true
    },
    {
      display: 'Location',
      variable: 'locality',
      filter: 'text',
      sort: false
    },
    {
      display: 'Action',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'manageButton',
      type: 'button',
      label: 'Manage',
      style: 'btn btn-danger width-100 mb-xs botton_txt123 done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Manage',
          style: 'btn btn-danger width-100 mb-xs botton_txt123 done_txt',
        }
      ]
    },
    {
      display: 'Edit',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'editButton',
      type: 'button',
      label: 'Edit',
      style: 'btn btn-danger width-100 mb-xs botton_txt123 done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'Edit',
          style: 'botton_editimg',
        }
      ]
    },

  ];

  sorting: any = {
    column: 'pocName',
    descending: false
  };

  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.fromIndex = 0;
    this.searchTerm = '';
    this.hsLocalStorage.saveComponentData({});
  }

  ngOnInit() {
    this.empId = this.auth.userAuth.employeeId;
    this.pocId = this.auth.userAuth.pocId;
    this.isSuperAdmin = (this.empId === 1 ? true : false);
    this.getPocList();
    this.clearPocDetails();
  }
  clearPocDetails() {
    this.superAdminService.setReferredByPocDetails(new ReferredPoc());
    this.hsLocalStorage.removeData('doctorDetailloc');
    this.hsLocalStorage.removeData('pocDetailloc');
  }
  getPocList() {
    this.spinnerService.start();
    let request: PocSearch = new PocSearch();
    console.log('is super admin >> ' + this.isSuperAdmin);
    console.log('Search term >> ' + this.searchTerm);
    if (!this.isSuperAdmin ||
      (this.searchTerm != undefined && this.searchTerm != null && this.searchTerm.length > 0)) {
      request.searchTerm = this.searchTerm;
      if (!this.isSuperAdmin) {
        request.pocIdList = [this.pocId];
      }
      this.superAdminService.getPocDetails(request).then(pocList => {
        setTimeout(() => {
          this.spinnerService.stop();
          this.pocList = pocList;
          if (this.pocList.length > 0) {
            this.total = this.scrollPosition = this.pocList.length;
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
          } else {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "POC does not exist.";
            this.showMessage = true;
          }
        }, 2000)
      });
    } else {
      this.superAdminService.getAllPocs(this.skip, this.size).then((data) => {
        if (this.skip == 0)
          this.pocList = data;
        else
          this.pocList.push.apply(this.pocList, data);
        this.total = this.scrollPosition = this.pocList.length;
        this.spinnerService.stop();
      });
    }
  }



  onHyperLinkClicked(event) {
    this.superAdminService.pocId = event.pocId;
    if (event.pocId != undefined) {
      this.setPocDetailsOnService(event.pocId, '/app/master/poc/information');
    }
  }

  onImageClicked(event: any) {
    this.superAdminService.pocId = event.pocId;
    this.superAdminService.isPocModify = true;
    this.setPocDetailsOnService(event.pocId, '/app/master/poc/create');
  }

  onRefresh() {
    this.searchTerm = "";
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.skip = 0;
    // this.pocList = []
    this.getPocList();
  };

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearch();
    }
  }

  onSearch() {
    console.log("NameOfPoc::" + this.searchTerm);
    this.searchTerm = this.searchTerm.trim();
    if (this.searchTerm.length < 3 || this.searchTerm.length > 120) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter Valid POC Name.";
      this.showMessage = true;
      return;
    } else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      this.getPocList();
    }
  }

  onCreatePoc(): void {
    this.hsLocalStorage.removeData('createPocLoc');
    this.superAdminService.isPocModify = false;
    this.router.navigate(['/app/master/poc/create']);
  }

  onPage(page: number) {
    this.fromIndex = this.total;
    this.skip = this.fromIndex;
    this.getPocList();
  }

  setPocDetailsOnService(pocId: number, navPath: string) {
    this.spinnerService.start();
    let request: PocSearch = new PocSearch();
    request.pocIdList = [pocId];
    console.log(`myPocDetailsIn Poclist1==> ${pocId}`);
    this.superAdminService.getPocDetails(request).then(pocList => {
      if (pocList && pocList.length > 0 && pocList[0]) {
        this.superAdminService.pocDetail = pocList[0];
        console.log(`myPocDetailsIn Poclist2==> ${JSON.stringify(pocList)}`);
        this.router.navigate([navPath]);
      }
      this.spinnerService.stop();
    });
  }
  clickEventHandler(e) {
    console.log(e);
    if (e.event == "editButton") {
      this.superAdminService.pocId = e.val.pocId;
      this.superAdminService.isPocModify = true;
      let refData = e.val.referralPocId > 0 ?
        { pocId: e.val.referralPocId, pocName: e.val.referralPocName, referredPocId: e.val.referralPocId } : new ReferredPoc();
      // { pocId: 15, pocName: 'kalyan', referredPocId: 15 }
      this.superAdminService.setReferredByPocDetails(refData);
      this.setPocDetailsOnService(e.val.pocId, '/app/master/poc/create');
    } else if (e.event == "manageButton") {
      this.superAdminService.pocId = e.val.pocId;
      this.setPocDetailsOnService(e.val.pocId, '/app/master/poc/manage/discount');
    } else if (e.event == "pocNameClick") {
      this.superAdminService.pocId = e.val.pocId;
      if (e.val.pocId != undefined) {
        this.setPocDetailsOnService(e.val.pocId, '/app/master/poc/information');
      }
    }
  }

}