import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { BrandDetailsWithReferralCode } from '../../../../model/brand/brandDetailsWithReferralCode';
import { FileUtil } from '../../../../base/util/file-util';

@Component({
  selector: 'branddetails',
  templateUrl: './branddetails.template.html',
  styleUrls: ['./branddetails.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BrandDetailsComponent implements OnInit {

  isError: boolean;
  errorMessage: Array<string>;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  config: any;
  month: any;
  year: any = new Date().getFullYear();
  startDate: Date = new Date();
  endDate: Date = new Date();
  datepickerOpts;
  datepickerOptEnd;
  datePkrSetEndDate = new Date();

  brandDetails: BrandDetailsWithReferralCode;
  isBrandModify: boolean;
  brandButtonType: string;
  uploadFilesList: any;

  adminId: number;

  constructor(config: AppConfig, private fileUtil: FileUtil,
    private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService,
    private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.brandDetails = new BrandDetailsWithReferralCode();
    this.isBrandModify = this.superAdminService.isBrandModify;
    this.adminId = auth.loginResponse.employee.empId;
  }

  ngOnInit() {

    if (this.isBrandModify == true || this.isBrandModify == undefined) {
      this.brandDetails = this.superAdminService.brandDetail;
      // saving and getting from local.....
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (this.brandDetails.brandId != undefined) {
        window.localStorage.setItem('BrandDetails', cryptoUtil.encryptData(JSON.stringify(this.brandDetails)));
      } else {
        if (window.localStorage.getItem('BrandDetails') != null && window.localStorage.getItem('BrandDetails').length > 0) {
          this.brandDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('BrandDetails')));

        }
      }
      if (this.brandDetails.brandId != undefined) {
        this.isBrandModify = true;
      }
    }

    if (this.isBrandModify == true) {
      this.brandButtonType = 'Modify';
      this.startDate = new Date(this.brandDetails.validFrom);
      this.endDate = new Date(this.brandDetails.validTo);
    }
    else {
      this.startDate = null;
      this.endDate = null;
      this.brandButtonType = 'Create';
    }

    this.datePkrSetEndDate.setFullYear(this.year + 100);

    this.datepickerOpts = {
      startDate: new Date(),
      //endDate: new Date(this.datePkrSetEndDate),
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
      assumeNearbyYear: true,
      format: 'dd/mm/yyyy'
    };

    this.datepickerOptEnd = {
      startDate: new Date(),
      endDate: new Date(this.datePkrSetEndDate),
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true,
      assumeNearbyYear: true,
      format: 'dd/mm/yyyy'
    };
  }

  startDateChange(type: string) {
    if (type == 'start') {
      this.datepickerOptEnd = {
        startDate: new Date(this.startDate),
        endDate: new Date(this.datePkrSetEndDate),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
      };
    }
    let d = new Date(this.startDate);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    this.startDate = d;
  }

  changeData(type) {
    if (type == 'partnerPortalDisabled') {
      this.brandDetails.partnerPortalDisabled = !this.brandDetails.partnerPortalDisabled;
    }
    if (type == 'hasBrandApp') {
      this.brandDetails.hasBrandApp = !this.brandDetails.hasBrandApp;
    }
  }

  onCreateBrand() {
    this.brandDetails.referralCreationDate = new Date().getTime();
    if (this.startDate != undefined && this.startDate != null)
      this.brandDetails.validFrom = this.startDate.getTime();
    if (this.endDate != undefined && this.endDate != null)
      this.brandDetails.validTo = this.endDate.getTime();

    if (this.brandDetails.brandName == undefined || this.brandDetails.brandName == null || this.brandDetails.brandName == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the brand name...!!";
      this.showMessage = true;
      return;
    }
    if (this.brandDetails.organisation == undefined || this.brandDetails.organisation == null || this.brandDetails.organisation == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the organisation name...!!";
      this.showMessage = true;
      return;
    }
    if (this.brandDetails.validFrom == undefined || this.brandDetails.validFrom == null || this.brandDetails.validFrom == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Choose the Valid From...!!";
      this.showMessage = true;
      return;
    }
    if (this.brandDetails.validTo == undefined || this.brandDetails.validTo == null || this.brandDetails.validTo == 0) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Choose the Valid To...!!";
      this.showMessage = true;
      return;
    }
    if (this.brandDetails.mobileNumber == undefined || this.brandDetails.mobileNumber == null || this.brandDetails.mobileNumber == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the mobile Number...!!";
      this.showMessage = true;
      return;
    }
    if (this.brandDetails.emailId == undefined || this.brandDetails.emailId == null || this.brandDetails.emailId == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the email...!!";
      this.showMessage = true;
      return;
    }
    if ((this.startDate > this.endDate) || (this.startDate == undefined || this.startDate == null) || (this.endDate == undefined || this.endDate == null)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter Valid Date.";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if (this.startDate < new Date(new Date().setDate(new Date().getDate() - 1))) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Invalid start Date/End Date";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }

    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.superAdminService.addAndUpdateBrandDetails(this.brandDetails).then(resp => {
      if (resp.statusCode == 200 || resp.statusCode == 201) {
        alert("Successfully added");
        this.router.navigate(['/app/master/brand/list']);
      }
      else {
        alert(resp.statusMessage)
      }
    });
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
  }

  uploadProfilePic() {
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.onCreateBrand();
      return;
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3('brand/logo', this.uploadFilesList[0], 0, true, false).then((awsS3FileResult: any) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      } else {
        this.spinnerService.stop();
        this.brandDetails.brandImageurl = awsS3FileResult.Location;
        this.onCreateBrand();
      }
    }).catch(err => {
      this.spinnerService.stop();
    });
  }

}