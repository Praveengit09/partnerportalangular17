import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Config } from '../../../base/config';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { InvasiveTestDetails } from '../../../model/phr/invasivetestdetails';
import { ReportFile } from '../../../model/phr/reportFile';
import { OnboardingService } from '../../onboarding.service';
import { AuthService } from './../../../auth/auth.service';
import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { BaseResponse } from './../../../model/base/baseresponse';
import { GetLabTestsRequest } from './../../../model/phr/getLabTestsRequest';
import { UserReport } from './../../../model/report/userReport';
import { BasePhrAnswer } from '../../../model/phr/basePhrAnswer';
import { FileUtil } from '../../../base/util/file-util';

@Component({
  selector: 'onboarding',
  templateUrl: './updatelabtest.template.html',
  styleUrls: ['./updatelabtest.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class UpdatelabtestComponent {

  environment: string = Config.portal.name || 'MyMedic';

  config: any;
  pocId: number;
  profileId: any;
  empId: number;

  labTests: Array<InvasiveTestDetails>;
  userReport: UserReport;
  selectedTestList: Array<BasePhrAnswer> = new Array();

  uploadFilesList: any;
  uploadResponse: BaseResponse;

  checkBoxValidationMessage: Array<string>;
  hasCheckBoxValidation: boolean = false;
  fileUploadData: string;

  type: Array<number>;
  parentProfileId: number = 0;
  showMessage: boolean;

  constructor(private router: Router, private diagnosticService: DiagnosticsService,
    private activatedRoute: ActivatedRoute, private authService: AuthService,
    private onboardingService: OnboardingService, private spinner: SpinnerService,
    private fileUtil: FileUtil) {
    this.pocId = this.authService.userAuth.pocId;
    this.empId = authService.userAuth.employeeId;
    this.initializeUserReport();
  }

  ngOnInit() {
    $('#testResultsUploadModel').on('hidden.bs.modal', (e) => {
      $("input[type=file]").val("");
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      this.profileId = params['profileId'];

      this.spinner.start();

      let getLabTestsRequest: GetLabTestsRequest = new GetLabTestsRequest();
      getLabTestsRequest.pocId = this.pocId;
      getLabTestsRequest.profileId = this.profileId;
      this.onboardingService.getLabTests(getLabTestsRequest).then((labTests) => {
        this.labTests = labTests.labsinvasive;
        if (this.userReport) {
          this.userReport.testDetailList = this.labTests;
        }
        this.spinner.stop();
      });

      this.type = new Array<number>();
      this.type[0] = 1;
      console.log('ProfileId is >>' + this.profileId);
      this.onboardingService.getObboardingReport(this.profileId).then(userReport => {
        this.userReport = userReport;
        if (!this.userReport || !this.userReport.profileId) {
          this.initializeUserReport();
        } else {
          if (!this.userReport.testDetailList) {
            this.userReport.testDetailList = new Array();
          }
          if (!this.userReport.fileUrlList) {
            this.userReport.fileUrlList = new Array();
          }
        }
      }).catch(error => {
        console.error('Error occurred while getting the onboarding report', error);
        this.initializeUserReport();
      });
    });

    (<any>$('#testResultsUploadModel')).on('show.bs.modal', (e) => {
      this.hasCheckBoxValidation = false;
    });

    (<any>$('#testResultsUploadModel')).on('hide.bs.modal', (e) => {
      this.hasCheckBoxValidation = false;
    });

  }

  private initializeUserReport() {
    this.userReport = new UserReport();
    this.userReport.profileId = this.profileId;
    // For onboarding case setting the reference id to the profile id 
    // so that only one report is generated for the onboarding
    this.userReport.referenceId = this.profileId;
    this.userReport.type = 1;
    this.userReport.userType = 5;
    this.userReport.userId = this.empId;
    this.userReport.status = 0;
    this.userReport.reportedDate = Date.now();
    this.userReport.testDetailList = this.labTests;
    if (!this.userReport.testDetailList) {
      this.userReport.testDetailList = new Array();
    }
    if (!this.userReport.fileUrlList) {
      this.userReport.fileUrlList = new Array();
    }
  }

  updateLabTests() {
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinner.start();
    if (!this.userReport) {
      this.initializeUserReport();
    }
    this.labTests.forEach(item => {
      item.updatedTime = Date.now();
      item.reportedDate = Date.now();
      item.date = Date.now();
    });
    this.userReport.testDetailList = this.labTests;
    this.diagnosticService.getDiagnosticAwsCognitoCredentials(this.userReport).then((updatelabTests) => {
      this.spinner.stop();
      if (updatelabTests.statusCode == 201) {
        this.userReport.reportId = updatelabTests.reportId;
        (<any>$("#successModal")).modal("show");
      }
      if (updatelabTests.statusCode == 410) {
        alert(updatelabTests.statusMessage);
        this.router.navigate(['/app/onboarding/personal/' + this.profileId])
      }
    });
  }

  gotoDashBoard() {
    (<any>$("#successModal")).modal("hide");
    this.router.navigate(['/app/onboarding/onboardingdashboard']);
  }

  checkedTestName(event, selectedItem) {
    if (event.target.checked) {
      let basePhrAnswer: BasePhrAnswer = new BasePhrAnswer();
      basePhrAnswer.id = selectedItem.id;
      basePhrAnswer.name = selectedItem.name;
      this.selectedTestList.push(basePhrAnswer);
    } else {
      this.selectedTestList = this.selectedTestList.filter(function (item) {
        return item.id !== selectedItem.id;
      });
    }
    this.hasCheckBoxValidation = false;
    this.showMessage = false;
    this.checkBoxValidationMessage = new Array();
  }

  isSelectedAll() {
    return this.labTests.every((item) => item.isSelected);
  }

  selectAllTestName(event) {
    let isSelected = this.isSelectedAll();
    if (event.target.checked) this.selectedTestList = new Array();
    this.labTests.forEach(test => {
      test.isSelected = !isSelected;
      this.checkedTestName(event, test)
    })
  }

  initUpload() {
    $("#testResultsUploadModel").on("shown.bs.modal", function () {
      if ($(".modal-backdrop").length > 1) {
        $(".modal-backdrop").not(':first').remove();
      }
    });
    (<any>$("#testResultsUploadModel")).modal("show");
    this.selectedTestList = new Array();
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
  }

  uploadReports(fileUploadForm: NgForm) {
    this.hasCheckBoxValidation = false;
    this.checkBoxValidationMessage = new Array();
    this.showMessage = false;
    if (this.uploadFilesList === undefined || this.uploadFilesList === null || this.uploadFilesList === "") {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = new Array();
      this.checkBoxValidationMessage[0] = 'Please select atleast one file.';
      this.showMessage = true;
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.pdf') || file.name.endsWith('.PDF') || file.name.endsWith('.jpg') || file.name.endsWith('.JPG')
          || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {

        }
        else {
          this.hasCheckBoxValidation = true;
          this.checkBoxValidationMessage = new Array();
          this.checkBoxValidationMessage[0] = 'Only pdf, png, jpg files are supported';
          this.showMessage = true;
          return;
        }
      }
    }

    if (this.userReport === undefined || this.userReport === null) {
      this.initializeUserReport();
    }

    let gloablAwsCredentials: any;

    if (this.selectedTestList.length <= 0 && ((this.fileUploadData != null && this.fileUploadData != undefined) || this.fileUploadData == null && this.fileUploadData == undefined)) {
      this.hasCheckBoxValidation = true;
      this.checkBoxValidationMessage = new Array();
      this.checkBoxValidationMessage[0] = 'Please select test';
      this.showMessage = true;
      return;
    }

    this.userReport.reportedDate = Date.now();
    if (this.uploadFilesList.length > 0) {
      this.userReport.hasFiles = true;
    }

    let self = this;
    this.spinner.start();

    this.diagnosticService.getDiagnosticAwsCognitoCredentials(this.userReport).then(awsAuthCredentails => {
      if (awsAuthCredentails.statusCode == 201 || awsAuthCredentails.statusCode == 200) {
        this.spinner.stop();
        return awsAuthCredentails;
      } else {
        let errorObj: any = new Object();
        errorObj.errorMessage = new Array<string>();
        alert("Something went wrong. Please try again!");
        (<any>$('#testResultsUploadModel')).modal('hide');
        fileUploadForm.resetForm();
        (<any>$)('#files').val("");
        errorObj.errorMessage[0] = this.uploadResponse.statusMessage;
        errorObj.isError = true;
        errorObj.showMessage = true;
        return errorObj;
      }
    }).then((awsCredentials) => {
      console.log('aws credentials ', JSON.stringify(awsCredentials));
      if (awsCredentials.isError) {

      }
      gloablAwsCredentials = awsCredentials;
      let awsS3Functions = new Array();
      for (let uploadFile of this.uploadFilesList) {
        awsS3Functions.push(this.fileUtil.fileUploadToAwsS3(null, uploadFile, this.profileId, false, false));
      }
      return Promise.all(awsS3Functions);

    }).then((awsS3FileResults) => {

      if (!this.userReport.fileUrlList) {
        this.userReport.fileUrlList = new Array();
      }

      for (let awsS3FileResult of awsS3FileResults) {
        let fileType: ReportFile = new ReportFile();
        if (awsS3FileResult.Location) {
          let url = awsS3FileResult.Location;
          fileType.fileUrl = url;
          let lastIndex = url.lastIndexOf('/');
          let modifiedName = url.substring(lastIndex + 1, url.length);
          fileType.fileName = modifiedName;
          if (modifiedName.lastIndexOf(".pdf") > 0 || modifiedName.lastIndexOf(".PDF") > 0) {
            fileType.contentType = 2;
          }
          else if (modifiedName.lastIndexOf(".png") > 0 || modifiedName.lastIndexOf(".PNG") > 0
            || modifiedName.lastIndexOf(".jpg") > 0 || modifiedName.lastIndexOf(".JPG") > 0) {
            fileType.contentType = 1;
          }
        }
        fileType.testList = this.selectedTestList;
        fileType.uploadedDate = Date.now();
        this.userReport.fileUrlList.push(fileType);
      }

      this.userReport.profileId = this.profileId;
      this.userReport.reportId = gloablAwsCredentials.reportId;
      return this.diagnosticService.UpdateDiagnosticFileUrls(this.userReport);

    }).then((uploadFileStatusResponse) => {
      if (uploadFileStatusResponse.statusCode == 201 || uploadFileStatusResponse.statusCode == 200) {
        self.uploadFilesList = undefined;
        fileUploadForm.resetForm();
        this.spinner.stop();
        (<any>$('#testResultsUploadModel')).modal('hide');
        this.labTests.forEach(e => { delete e.isSelected });
      }
      else {
        this.spinner.stop();
      }
    });

  }

  remove(index: number) {
    this.userReport.fileUrlList.splice(index, 1);
  }

  validateNumber(id: string, e) {
    console.log(e);
    if (e.keyCode == 110 || e.keyCode == 9) {
      // return;
    }
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
      e.preventDefault();
      return false;
    }
    return true;
  }

}
