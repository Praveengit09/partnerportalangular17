import { Component, ViewEncapsulation, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FileUtil } from '../../../base/util/file-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';

import { AuthService } from './../../../auth/auth.service';
import { PaymentService } from './../../payment.service'

@Component({
  selector: 'updateimmunization',
  templateUrl: './updateimmunization.template.html',
  styleUrls: ['./updateimmunization.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class UpdateImmunizationComponent implements OnInit {
  config: any;
  month: any;
  year: any;
  startdate: Date;
  fileUploadData: string;
  uploadFilesList: any;
  hasCheckBoxValidation: boolean = false;
  checkBoxValidationMessage: string;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  immunizationName: string = "";

  @ViewChild('diagnosticFileUpload', { static: false })
  myInputVariable: any;

  constructor(private authService: AuthService, private router: Router,
    private paymentService: PaymentService, private fileUtil: FileUtil,
    private spinnerService: SpinnerService) {
  }


  ngOnInit() {

  }
  fileUpload(event) {
    this.uploadFilesList = event.target.files;
    this.hasCheckBoxValidation = false;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;

    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    } else if (this.uploadFilesList.length > 1) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select only one file at one time.';
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {

        }
        else {
          this.hasCheckBoxValidation = true;
          this.checkBoxValidationMessage = 'Only xls, xlsx files are supported';
          return;
        }
      }
    }
  }

  onUploadButtonClick() {

    if (this.hasCheckBoxValidation) {
      return;
    }
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3(null, this.uploadFilesList[0], 0, false, false).then((awsS3FileResult) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
        return;
      }
      console.log('File Path is ' + awsS3FileResult.Location);
      this.paymentService.readImmunizationExcel({ fileName: awsS3FileResult.Location, pocId: this.authService.selectedPocDetails.pocId }).then((data) => {
        this.spinnerService.stop();
        if (data.statusCode == 201 || data.statusCode == 200) {
          this.myInputVariable.nativeElement.value = "";
          this.isError = false;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Test updated successfully.";
          this.showMessage = true;
        } else {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = data.statusMessage;
          this.showMessage = true;
          return;
        }
      }).catch(error => {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
      });

    }).catch(err => {
      this.spinnerService.stop();
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Something went wrong. Please try again later.";
      this.showMessage = true;
    });
  }

}