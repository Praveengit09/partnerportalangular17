import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { PocDetail } from "../../../model/poc/pocDetails";
import { Router } from '@angular/router';
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../auth/auth.service";
import { FileUtil } from "../../../base/util/file-util";
import { SuperAdminService } from "../../../superadmin/superadmin.service";
import { BrandDetailsWithReferralCode } from "../../../model/brand/brandDetailsWithReferralCode";
import { HsLocalStorage } from "../../../base/hsLocalStorage.service";
import { saasSubscriptionsService } from "../../../superadmin/poc/component/saas/saassubscriptions.service";
import { PocSubscriptionDetails } from "../../../model/saas/pocsubscriptiondetails";

@Component({
  selector: 'basicinformation',
  templateUrl: './basicinformation.template.html',
  styleUrls: ['./basicinformation.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class BasicInformationComponent implements OnInit, OnDestroy {//Component
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;

  pocDetails: PocDetail = new PocDetail();
  uploadFilesList: any;
  contactList: Array<any> = new Array<any>();

  brandList: BrandDetailsWithReferralCode[] = new Array<BrandDetailsWithReferralCode>();
  mobileNumber: number;

  isPocModify: boolean

  dropDownIndex: number = -1;
  brandName: string = ''
  subscriptionDetails:PocSubscriptionDetails;

  constructor(private spinnerService: SpinnerService,
    private auth: AuthService,
    private fileUtil: FileUtil,
    private superAdminService: SuperAdminService,
    private hsLocalStorage: HsLocalStorage,
    private router: Router,
    private saasService:saasSubscriptionsService
  ) {
    this.pocDetails = new PocDetail();
  }

  ngOnInit() {
    
    this.superAdminService.pocDetail=this.auth.selectedPocDetails
    // console.log(this.auth.selectedPocDetails.pocId);
   this. getSubscriptionDetails()
  //  console.log(this.subscriptionDetails);
  
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
    let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
    if (this.isPocModify && ((createPocLoc && createPocLoc.pocDetails)
      || (this.superAdminService && this.superAdminService.pocDetail))) {
      this.pocDetails = this.superAdminService.pocDetail;
      if (this.pocDetails) {
        let data = { 'pocDetails': this.pocDetails, 'isPocModify': this.isPocModify };
        this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
        this.contactList = this.pocDetails.contactList;
      } else {
        this.superAdminService.pocDetail = this.pocDetails = createPocLoc.pocDetails;
        this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
        console.log(`pocdetails==>${JSON.stringify(this.pocDetails)}`);
        this.contactList = this.pocDetails.contactList;
      }
      if (this.pocDetails.pdfHeaderType != 0 || this.pocDetails.pdfHeaderType == undefined) {
        (<any>$("#Pdf")).prop("checked", true)
      }
    } else {
      this.pocDetails = new PocDetail();
    }

    this.getContactList();
    this.pocDetails.GSTIN
  }


  fileUpload(event) {
    this.uploadFilesList = event.target.files;
  }

  uploadProfilePic() {
    console.log(this.uploadFilesList);
    
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.jpg') || file.name.endsWith('.JPG') || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {
        }
        else {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = 'Only png, jpg files are supported';
          this.showMessage = true;
          return;
        }
      }
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3('poc/logo', this.uploadFilesList[0], 0, true, false).then((awsS3FileResult: any) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      }
      else {
        this.spinnerService.stop();
        this.pocDetails.pocLogo = awsS3FileResult.Location;
      }
    }).catch(err => {
      this.spinnerService.stop();
    });

  }


  validateEmailId(email: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  getContactList() {
    if (!this.pocDetails.contactList || this.pocDetails.contactList.length <= 0) {
      if (!this.contactList) {
        this.contactList = new Array();
      }
      this.contactList.push('');
      this.pocDetails.contactList = this.contactList;
    }
  }

  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 46) {
      return true;
    }
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var key2 = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key2)) {
      return false;
    }
    if (event.keyCode == 8 || event.keyCode == 46
      || event.keyCode == 37 || event.keyCode == 39) {
      return true;
    } else if (key < 48 || key > 57) {
      return false;
    } else return true;
  }

  addAnotherNumber(): void {
    if (this.contactList[this.contactList.length - 1] == "") {
      return;
    }
    this.contactList.push('');
  }

  onWorkPlaceAddress() {
    if (this.pocDetails.pocName) {
      this.pocDetails.pocName = this.pocDetails.pocName.trim();
      console.log(this.pocDetails);
    }
    else if (this.pocDetails.pocName == undefined || this.pocDetails.pocName == null || this.pocDetails.pocName == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the poc name...!!";
      this.showMessage = true;
      return;
    }
    // if (this.pocDetails.pocLogo == undefined || this.pocDetails.pocLogo == null || this.pocDetails.pocLogo == "") {
    //   this.isError = true;
    //   this.errorMessage = new Array();
    //   this.errorMessage[0] = "Enter the organisation name...!!";
    //   this.showMessage = true;
    //   return;
    // }
    if (this.pocDetails.licenseInfo == undefined || this.pocDetails.licenseInfo == null || this.pocDetails.licenseInfo == '') {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the licenseInfo...!!";
      this.showMessage = true;
      console.log(this.showMessage);

      return;
    }
    if (this.pocDetails.GSTIN == undefined || this.pocDetails.GSTIN == null || this.pocDetails.GSTIN == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the GSTIN....!!";
      this.showMessage = true;
      return;
    }
  
    if (!this.validateEmailId(this.pocDetails.email) || (this.pocDetails.email == undefined || this.pocDetails.email == null || this.pocDetails.email == "")) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter valid emailId...!!";
      this.showMessage = true;
      return;
    }

    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.uploadProfilePic()
    
    this.router.navigate(['./pocadmin/sidebar/addressandlocation']);
  }

  ngOnDestroy(): void {
    if (this.pocDetails != undefined && this.pocDetails != null) {
      this.superAdminService.pocDetail = this.pocDetails;

      console.log('assigning data to server');
    }
    this.auth.setPreventNavigation(false);
  }

  trackByFn(index: any, item: any) {
    return index;
  }


  skipForNow() {
    this.router.navigate(['./app/dashboard'])
  }
  

  async getSubscriptionDetails() {

    this.spinnerService.start();
    await this.saasService.getSubscriptionDetails(this.auth.selectedPocDetails.pocId).then((res) => {
      if (Object.entries(res).length != 0 && res != undefined && res != null) {
        this.subscriptionDetails = res;        
        this.spinnerService.stop();
      }
    }).catch((err) => {
      this.spinnerService.stop();
    })
  }
}