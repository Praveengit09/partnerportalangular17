import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyService } from "../../../pharmacy.service";
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../../auth/auth.service';
import { BusinessAdminService } from '../../../../businessadmin/businessadmin.service';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';
import { FileUtil } from '../../../../base/util/file-util';

@Component({
  templateUrl: './uploadinventory.template.html',
  styleUrls: ['./uploadinventory.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class CentralInventoryUploadComponent implements OnInit {
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
  excelString: any;
  message: Array<string>;
  selectedPocId: number = 0;
  pocList: Array<EmployeePocMapping>;
  empId: number;

  @ViewChild('diagnosticFileUpload', { static: false })
  myInputVariable: any;

  constructor(private authService: AuthService, private router: Router,
    private spinner: SpinnerService, private pharmacyService: PharmacyService,
    private spinnerService: SpinnerService, private adminService: BusinessAdminService,
    private fileUtil: FileUtil) {
    this.empId = this.authService.userAuth.employeeId;
  }

  ngOnInit() {
    this.excelString = 'Filename.xls';
    this.getPocList(this.empId);
  }

  resetErrorMessage() {
    this.isError = false;
    this.showMessage = false;
    this.message = new Array();
    this.errorMessage = new Array();
  }

  onPOCSelect(pocId: number): void {
    console.log('Selected POC is' + pocId);
    if (pocId == 0) {
      this.resetErrorMessage();
    }
    this.selectedPocId = pocId;
  }

  getPocList(empId: number): void {
    this.adminService.getPOCForEmployeeByLocationMapping(empId, false).then(response => {
      if (response && response.length > 0) {
        this.pocList = response;
      }
    })
      .catch(error => {
        console.error('Error occurred while fetching the employee POCs', error);
      });
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
    this.hasCheckBoxValidation = false;
    this.isError = false;
    this.errorMessage = undefined;
    this.showMessage = false;
    this.excelString = this.uploadFilesList[0].name;

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
        return;
      }
      console.log('File Path is ' + awsS3FileResult.Location);
      this.pharmacyService.readInventoryExcel({ fileName: awsS3FileResult.Location, pocId: this.selectedPocId }).then((data) => {
        this.spinnerService.stop();
        this.myInputVariable.nativeElement.value = "";
        this.excelString = 'Filename.xls';
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

  clearUploadData(fileType) {
    if (fileType == 'excel') {
      var $el = $('#files');
      (<any>$el.wrap('<form>').closest('form').get(0)).reset();
      $el.unwrap();
      this.excelString = 'Filename.xls';
      this.uploadFilesList = new Array();
    }
  }
  onSearchAndUpadateClick() {
    this.router.navigate(['app/pharmacy/centralinventory/searchandupdate'])
  }
}