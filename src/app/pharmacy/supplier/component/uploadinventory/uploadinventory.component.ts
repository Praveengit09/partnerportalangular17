import { FileUtil } from './../../../../base/util/file-util';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { PharmacyService } from "../../../pharmacy.service";
import { AuthService } from './../../../../auth/auth.service';

@Component({
  selector: 'uploadinventory',
  templateUrl: './uploadinventory.template.html',
  styleUrls: ['./uploadinventory.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class UploadInventoryComponent implements OnInit {
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

  @ViewChild('diagnosticFileUpload', { static: false })
  myInputVariable: any;

  constructor(private authService: AuthService, private router: Router,
    private spinner: SpinnerService, private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService, private fileUtil: FileUtil) {
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
      //let url = awsS3FileResult.Location;
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
        return;
      }
      console.log('File Path is ' + awsS3FileResult.Location);
      this.pharmacyService.readSupplierInventoryExcel({ fileUrl: awsS3FileResult.Location, pocId: this.authService.selectedPocDetails.pocId }).then((data) => {
        this.spinnerService.stop();
        if (data.statusCode == 405) {
          this.myInputVariable.nativeElement.value = "";
          // this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = true;
          let locString: string = '';
          console.log("rrsponsseeeee" + JSON.stringify(data.responseMap));
          if (data.responseMap != null) {
            this.isError = true;
            var value;
            Object.keys(data.responseMap).forEach(function (key) {
              value = data.responseMap[key];
              locString = locString + key + " " + value + "  ";
              console.log("key & Value:: " + key + "  " + value);
            });
            this.errorMessage = new Array();
            this.errorMessage[0] = locString;

          }
        }
        else if (data.statusCode == 201 || data.statusCode == 200) {
          this.isError = false;
          this.errorMessage = new Array();
          this.showMessage = true;
          this.errorMessage[0] = "All Inventory updated successfully.";
          var $el = $('#files');
          (<any>$el.wrap('<form>').closest('form').get(0)).reset();
          $el.unwrap();
        }
        else {
          this.isError = true;
          this.errorMessage = new Array();
          if (data.name == "TimeoutError") {
            this.errorMessage[0] = "Timeout Error has occured. Please try again later.";
          } else {
            this.errorMessage[0] = "Something went wrong. Please try again later.";
          }
          this.showMessage = true;
          return;
        }
      }).catch(err => {
        this.spinnerService.stop();
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Something went wrong. Please try again later.";
        this.showMessage = true;
      });
    }).catch(error => {
      this.spinnerService.stop();
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Something went wrong. Please try again later.";
      this.showMessage = true;
    });

  }

}
