import { Component, ViewEncapsulation } from "@angular/core";
import { PocDetail } from "../../../model/poc/pocDetails";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { AuthService } from "../../../auth/auth.service";
import { SuperAdminService } from "../../../superadmin/superadmin.service";
import { Router } from "@angular/router";
import { CDSSOptions } from "../../../model/poc/cdss";
import { HsLocalStorage } from "../../../base/hsLocalStorage.service";


@Component({
  selector: 'softwaresettings',
  templateUrl: './softwaresettings.template.html',
  styleUrls: ['./softwaresettings.style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SoftwareSettings {
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;

  pocDetails: PocDetail;
  isPocModify: boolean;

  constructor(private spinnerService: SpinnerService,
    private auth: AuthService,
    private superAdminService: SuperAdminService,
    private hsLocalStorage: HsLocalStorage,

    private router: Router) {
    this.pocDetails = new PocDetail();
    this.pocDetails = this.superAdminService.pocDetail;
  }

  ngOnInit() {

    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    this.pocDetails = this.superAdminService.pocDetail;

    this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
    let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
    if (this.pocDetails) {
      let data = { 'pocDetails': this.pocDetails, 'isPocModify': this.isPocModify };
      this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
    } else {
      this.superAdminService.pocDetail = this.pocDetails = createPocLoc.pocDetails;
      this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
      console.log(`pocdetails==>${JSON.stringify(this.pocDetails)}`);
    }

    this.settingDate();
  }


  onSaveWorkplace() {

    this.superAdminService.addAndUpdatePocDetails(this.pocDetails).then(resp => {
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.auth.userAuth.pdfHeaderType = this.pocDetails.pdfHeaderType;
      if (resp.statusCode == 200 || resp.statusCode == 201) {
        {
          alert("Workplace Saved Successfully")
          this.isError = false;
          this.errorMessage = new Array();
          this.errorMessage.push("Workplace Saved Successfully");
          this.showMessage = true;
        }
        this.spinnerService.stop();
        this.router.navigate(['/pocadmin/navigatepage'])
        // this.router.navigate(['./app/dashboard'])
      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push("something went wrong");
        this.showMessage = true;
        this.spinnerService.stop();
        alert("something went wrong")
      }
    }).catch(err => {
      if (err) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Server Issue ! Check Your Connection...";
        this.showMessage = true;
        this.spinnerService.stop();
      }
    });
  }

  skipForNow() {
    this.router.navigate(['./app/master/poc/list'])
  }

  settingDate() {

    if (!this.pocDetails.cdssOptions) {
      this.pocDetails.cdssOptions = new CDSSOptions();
    }

    if (this.pocDetails.cdssOptions.doctorEditable == false || this.pocDetails.cdssOptions.doctorEditable == undefined) {
      // this.nocdss = true;
      this.pocDetails.cdssOptions.doctorEditable = false;
    }
    else {
      this.pocDetails.cdssOptions.doctorEditable = true;
    }

    if (this.pocDetails.scanAndUploadPrescriptions == false || this.pocDetails.scanAndUploadPrescriptions == undefined || this.pocDetails.scanAndUploadPrescriptions == null) {
      this.pocDetails.scanAndUploadPrescriptions = false;
    }
    else {
      this.pocDetails.scanAndUploadPrescriptions = true;
    }

    if (this.pocDetails.payOnDeliveryAvailable == false || this.pocDetails.payOnDeliveryAvailable == undefined || this.pocDetails.payOnDeliveryAvailable == null) {
      this.pocDetails.payOnDeliveryAvailable = false;
    }
    else {
      this.pocDetails.payOnDeliveryAvailable = true;
    }

  }


  changeData(type, isValue?) {

    if (type == 'doctorEditable') {
      this.pocDetails.cdssOptions.doctorEditable = !this.pocDetails.cdssOptions.doctorEditable;
    }
    if (type == 'scanAndUploadPrescriptions') {
      this.pocDetails.scanAndUploadPrescriptions = !this.pocDetails.scanAndUploadPrescriptions;
    }
    if (type == 'payOnDeliveryAvailable') {
      this.pocDetails.payOnDeliveryAvailable = !this.pocDetails.payOnDeliveryAvailable;
    }
    if (type == 'pdfHeaderType') {
      this.pocDetails.pdfHeaderType = isValue;
      console.log(this.pocDetails.pdfHeaderType);
    }
  }

}
