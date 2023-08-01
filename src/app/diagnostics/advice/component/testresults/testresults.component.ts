import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { Config } from '../../../../base/config';
import { CommonUtil } from '../../../../base/util/common-util';
import { FileUtil } from '../../../../base/util/file-util';
import { BasePhrAnswer } from '../../../../model/phr/basePhrAnswer';
import { InvasiveTestDetails } from '../../../../model/phr/invasivetestdetails';
import { ReportFile } from '../../../../model/phr/reportFile';
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { DiagnosticsAdviseTrack } from './../../../../model/diagnostics/diagnosticsAdviseTrack';
import { UserReport } from './../../../../model/report/userReport';
import { DiagnosticsService } from './../../../diagnostics.service';
// tslint:disable-next-line:no-var-requires

@Component({
  selector: 'testresults-component',
  templateUrl: './testresults.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./testresults.style.scss']
})
export class TestResultsComponent {

  @ViewChild('diagnosticFileUpload', { static: false })
  diagnosticFileUploadVariable: any;

  today: Date = new Date();
  datepickerOpts = {
    autoclose: true,
    endDate: new Date(),
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  }

  errorMessage: Array<string>;
  isError: boolean = false;
  showMessage: boolean;

  diagnosticsAdviseTrack: DiagnosticsAdviseTrack;
  reportFile: ReportFile;

  fileUploadCheckBoxId: string;
  uploadFilesList: any;
  checkBoxValidationMessage: string;
  markAsDoneVar: boolean = false;
  checkedId: number = 0;
  appId: number = 0;
  isDisabled: boolean = false;
  isOneServiceDisabled: boolean = false;

  @ViewChild('diagnosticFileUpload', { static: false })
  myInputVariable: ElementRef;

  crouselSelectedImage: String;
  tempProofDocumentList: any[] = new Array();

  @Input() defaultSelectField: string = null;

  constructor(private diagnosticsService: DiagnosticsService, private router: Router,
    private authService: AuthService, private commonUtil: CommonUtil, private fileUtil:FileUtil,
    private hsLocalStorage: HsLocalStorage, private spinner: SpinnerService) {
    this.markAsDoneVar = false;
    if (Config.portal && Config.portal.appId)
      this.appId = Config.portal.appId;
  }

  ngOnInit() {
    const random = Math.floor(Math.random() * 9999999999);
    this.fileUploadCheckBoxId = 'search-box-' + random + this.defaultSelectField;
    this.diagnosticsAdviseTrack = this.diagnosticsService.diagnosticsAdviseTrack;
    console.log('Diagnostic Advice Track >> ' + JSON.stringify(this.diagnosticsAdviseTrack));

    // local storage , save all your data here
    if (this.diagnosticsAdviseTrack) {
      const data = { diagnosticsAdviseTrack: this.diagnosticsAdviseTrack };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.diagnosticsAdviseTrack = this.hsLocalStorage.getComponentData().diagnosticsAdviseTrack;
      if (!this.diagnosticsAdviseTrack) {
        this.gotoDiagnosticsDashboard();
      }
    }

    if (this.diagnosticsAdviseTrack !== undefined) {
      if (this.diagnosticsAdviseTrack.serviceList.length > 0) {
        for (const service of this.diagnosticsAdviseTrack.serviceList) {
          if (service.sampleId === undefined
            || service.sampleId == null) {
            service.checkSampleIdExist = false;
          } else {
            service.checkSampleIdExist = true;
          }
          if (service.sampleCollectionDate) {
            service.sampleCollectionDate =
              new Date(service.sampleCollectionDate);
          }
          service.isSelected = false;
          if (service.checkSampleIdExist || service.partnerProcessedSample) {
            service.isDisabled = true;
            this.isOneServiceDisabled = true;
          } else
            service.isDisabled = false

          console.log("isDisabled: " + service.serviceName + ">>>>" + this.isDisabled);

        }
      }
      console.log('Diagnostic Advice Track >> ' + JSON.stringify(this.diagnosticsAdviseTrack));
    }

    if (!this.diagnosticsAdviseTrack.fileUrlList) {
      this.diagnosticsAdviseTrack.fileUrlList = new Array();
    }

    this.markAsDoneVar = false;
    let serviceIdList = Array();
    for (const serviceItem of this.diagnosticsAdviseTrack.serviceList) {
      serviceIdList.push(serviceItem.serviceId);
    }
    console.log("Check Ragne: " + this.authService.selectedPOCMapping.pocId + "ServiceIds:" + serviceIdList.toString());
    this.diagnosticsService.getTestResults(this.authService.selectedPOCMapping.pocId, serviceIdList.toString()).then((data) => {
      if (data != undefined && data.length > 0) {
        this.diagnosticsAdviseTrack.serviceList.forEach(service => {
          data.forEach(element => {
            if (element.serviceId == service.serviceId) {
              service.minRangeValue = element.minRangeValue;
              service.maxRangeValue = element.maxRangeValue;
              service.testResultDataUnit = element.testResultDataUnit;
            }
          });
        });
      }
    });
    console.log('Check ServiceList: ' + JSON.stringify(this.diagnosticsAdviseTrack));

    if (this.diagnosticsAdviseTrack.proofDocumentUrlList) {
      this.diagnosticsAdviseTrack.proofDocumentUrlList.forEach(proof => {
        this.spinner.start()
        this.authService.getTempFileURLFromSecureURL(proof).then((resp) => {
          this.spinner.stop();
          console.log("TempURl: ", resp.data);

          if (resp.statusCode == 200 || resp.statusCode == 201)
            this.tempProofDocumentList.push(resp.data);
          else
            alert("Something went wrong while getting secure url");
        })
      })
    }

  }

  ceil(x: number) {
    return Math.ceil(x);
  }

  checkedTestName() {
    console.log('Checked test name >>' + JSON.stringify(this.diagnosticsAdviseTrack.serviceList));
    this.reportFile = new ReportFile();
    this.reportFile.testList = new Array();
    if (this.diagnosticsAdviseTrack.serviceList &&
      this.diagnosticsAdviseTrack.serviceList.length > 0) {
      this.diagnosticsAdviseTrack.serviceList.forEach((item) => {
        if (item.isSelected) {
          let basePhrAnswer: BasePhrAnswer = new BasePhrAnswer();
          basePhrAnswer.id = item.serviceId;
          basePhrAnswer.name = item.serviceName;
          this.reportFile.testList.push(basePhrAnswer);
        }
      });
    }
  }

  selectAll(select) {
    this.checkedId = select;
    this.reportFile = new ReportFile();
    this.reportFile.testList = new Array();
    if (this.diagnosticsAdviseTrack.serviceList &&
      this.diagnosticsAdviseTrack.serviceList.length > 0) {
      this.diagnosticsAdviseTrack.serviceList.forEach((item) => {
        if (select === 1) {
          item.isSelected = true;
          let basePhrAnswer: BasePhrAnswer = new BasePhrAnswer();
          basePhrAnswer.id = item.serviceId;
          basePhrAnswer.name = item.serviceName;
          this.reportFile.testList.push(basePhrAnswer);
        } else {
          item.isSelected = false;
        }
      });
    }
  }

  fileUpload(event) {
    this.uploadFilesList = event.target.files;
    console.log("fileUpload: " + JSON.stringify(this.uploadFilesList));
  }

  uploadReports(fileUploadForm: NgForm) {
   
    $('#testResultsUploadModel').on('hidden.bs.modal', function (e) {
      $('.modal-backdrop').remove();
    });
    this.checkBoxValidationMessage = null;
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      this.checkBoxValidationMessage = 'Please select atleast one file.';
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      for (let file of this.uploadFilesList) {
        if (file.name.endsWith('.pdf') || file.name.endsWith('.PDF') || file.name.endsWith('.jpg') || file.name.endsWith('.JPG')
          || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {

        }
        else {
          this.checkBoxValidationMessage = 'Only pdf, png, jpg files are supported';
          return;
        }
      }
    }

    if (!this.reportFile || !this.reportFile.testList || this.reportFile.testList.length <= 0) {
      this.checkBoxValidationMessage = 'Please select test';
      return;
    }
    let userReport: UserReport = new UserReport();
    userReport.type = 0;
    userReport.userType = 3;
    userReport.profileId = this.diagnosticsAdviseTrack.patientProfileId;
    userReport.referenceId = this.diagnosticsAdviseTrack.orderId;
    userReport.fileUrlList = this.diagnosticsAdviseTrack.fileUrlList;
    userReport.reportId = this.diagnosticsAdviseTrack.reportId;
    userReport.testDetailList = new Array<InvasiveTestDetails>();
    userReport.name = this.authService.selectedPOCMapping.pocName;
    userReport.status = UserReport.STATUS_INACTIVE;
    userReport.reportedDate = Date.now();

    for (let serviceItem of this.diagnosticsAdviseTrack.serviceList) {
      let details: InvasiveTestDetails = new InvasiveTestDetails();
      details.id = serviceItem.serviceId;
      details.name = serviceItem.serviceName;
      details.parentId = serviceItem.parentServiceId;
      details.parentName = serviceItem.parentServiceName;
      details.unit = serviceItem.testResultDataUnit;
      details.value = serviceItem.testResultDataValue;
      details.normalRangeValues = serviceItem.normalResultDataValue;
      details.sampleId = serviceItem.sampleId;
      details.date = Date.parse(serviceItem.sampleCollectionDate);
      details.reportedDate = Date.now();
      details.updatedTime = Date.now();
      userReport.testDetailList.push(details);
    }

    this.spinner.start();
    this.diagnosticsService.getDiagnosticAwsCognitoCredentials(userReport).then(response => {
      // Call the updateInvasive service and fetch the reportId and AWS Cognito credentials
      if (response.statusCode == 201 || response.statusCode == 200) {
        userReport.reportId = response.reportId;
        this.diagnosticsAdviseTrack.reportId = response.reportId;
        for (let invasiveTest of userReport.testDetailList) {
          invasiveTest.reportId = response.reportId;
        }
        return response;
      } else {
        console.log('aws auth credentials ', JSON.stringify(response));
        let errorObj: any = new Object();
        errorObj.errorMessage = new Array<string>();

        (<any>$)('#testResultsUploadModel').modal("hide");

        this.spinner.stop();
        fileUploadForm.resetForm();
        (<any>$)('#files').val("");
        errorObj.errorMessage[0] = "Error occured ,due to network connectivity";
        errorObj.isError = true;
        errorObj.showMessage = true;
        alert(errorObj.errorMessage[0]);
        return errorObj;
      }
    }).then((awsCredentials) => {
      // Upload the files using the cognito credentails
      console.log('aws credentials ', JSON.stringify(awsCredentials));
      if (!awsCredentials.isError) {
        let awsS3Functions = new Array();
        for (let uploadFile of this.uploadFilesList) {
          awsS3Functions.push(this.fileUtil.fileUploadToAwsS3(null, uploadFile, this.diagnosticsAdviseTrack.parentProfileId, false, false));
        }
        return Promise.all(awsS3Functions);
      } else {
        return awsCredentials;
      }
    }).then((awsS3FileResults) => {
      // After the files are uploaded, update the diagnosticAdviceTrack with the file details
      let reportFileList: Array<ReportFile> = new Array<ReportFile>();
      for (let awsS3FileResult of awsS3FileResults) {
        let uploadedFile: ReportFile = new ReportFile();
        if (awsS3FileResult.Location) {
          let url = awsS3FileResult.Location;
          uploadedFile.fileUrl = url;
          let lastIndex = url.lastIndexOf('/');
          let modifiedName = url.substring(lastIndex + 1, url.length);
          uploadedFile.fileName = modifiedName;
          if (modifiedName.lastIndexOf(".pdf") > 0 || modifiedName.lastIndexOf(".PDF") > 0) {
            uploadedFile.contentType = 2;
          } else if (modifiedName.lastIndexOf(".png") > 0 || modifiedName.lastIndexOf(".PNG") > 0
            || modifiedName.lastIndexOf(".jpg") > 0 || modifiedName.lastIndexOf(".JPG") > 0) {
            uploadedFile.contentType = 1;
          }
        }
        uploadedFile.testList = JSON.parse(JSON.stringify(this.reportFile.testList));
        uploadedFile.uploadedDate = Date.now();
        reportFileList.push(uploadedFile);
      }
      console.log('Selected tests are >>> ' + (JSON.stringify(this.reportFile.testList)));
      console.log('Uploaded test files are >>> ' + (JSON.stringify(reportFileList)));
      console.log('Diangostic advice tracker >>> ' + (JSON.stringify(this.diagnosticsAdviseTrack)));
      userReport.fileUrlList = reportFileList;
      if (!this.diagnosticsAdviseTrack.fileUrlList) {
        this.diagnosticsAdviseTrack.fileUrlList = new Array();
      }
      try {
        reportFileList.forEach(item => {
          try {
            this.diagnosticsAdviseTrack.fileUrlList.push(JSON.parse(JSON.stringify(item)));
          } catch (error) {
            console.error('Error occurred', error);
          }
        });
      } catch (error) {
        console.error('Error occurred', error);
      }
      console.log('Diangostic advice tracker >>> ' + (JSON.stringify(this.diagnosticsAdviseTrack)));


      // Removed the code for updating the update file path in the phr reports.

      this.reportFile = null;
      fileUploadForm.resetForm();
      this.spinner.stop();
      (<any>$('#testResultsUploadModel')).modal('hide');
    }).catch(error => {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Error occurred while processing request. Please try again!";
      this.showMessage = true;
      this.spinner.stop();
    });
    // }

  }


  remove(index: number) {
    this.diagnosticsAdviseTrack.fileUrlList.splice(index, 1);
  }

  initialUploadReport() {
    this.checkedId = 0;
    this.selectAll(this.checkedId);
    this.myInputVariable.nativeElement.value = "";
    (<any>$("#testResultsUploadModel")).modal("show");
  }

  onSubmit(): void {
    if (this.diagnosticsAdviseTrack.invoiceCompletionStatus == 5) {
      this.router.navigate(['/app/diagnostics/advice/walkinreports']);
      return;
    }

    if (this.markAsDoneVar) {
      this.diagnosticsAdviseTrack.invoiceCompletionStatus = 5;
    }
    else {
      this.diagnosticsAdviseTrack.invoiceCompletionStatus = 3;
    }

    this.diagnosticsAdviseTrack.serviceList.forEach(item => {
      console.log("sampleCollectionDate: " + item.sampleCollectionDate + ">>>> " + item.sampleId);
      if (!item.sampleCollectionDate && item.sampleId) {
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = "Please add Home Collection Date";
        this.isError = true;
        this.showMessage = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      } else if (!item.sampleId && item.sampleCollectionDate) {
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = "Please add Sample Id";
        this.isError = true;
        this.showMessage = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      } else {
        this.errorMessage = new Array<string>();
        this.isError = false;
        this.showMessage = false;
      }
      if (item.sampleCollectionDate)
        item.sampleCollectionDate = this.commonUtil.convertCurrentDateToTimeStamp(item.sampleCollectionDate);
    });


    if (!this.isError) {
      this.diagnosticsAdviseTrack.empId = this.authService.employeeDetails.empId;
      this.diagnosticsService.updateDiagnosticInvestigationDetail(this.diagnosticsAdviseTrack).then(uploadResponse => {
        if (uploadResponse && (uploadResponse.statusCode == 201 || uploadResponse.statusCode == 200)) {
          this.errorMessage = new Array<string>();
          this.errorMessage[0] = "Order fulfilled successfully";
          this.isError = false;
          this.showMessage = true;
          this.gotoOrderList();
        } else {
          this.errorMessage = new Array<string>();
          this.errorMessage[0] = (uploadResponse && uploadResponse.statusMessage) ? uploadResponse.statusMessage : 'Error occurred while submitting the test report.';
          this.isError = true;
          this.showMessage = true;
          return;
        }
      }).catch(error => {
        console.error('Error occurred while getting the response', error);
        this.errorMessage = new Array<string>();
        this.errorMessage[0] = "Error occurred while uploading the test report";
        this.isError = true;
        this.showMessage = true;
      });
      this.markAsDoneVar = false;
    }
  }

  gotoDiagnosticsDashboard(): void {
    this.router.navigate(['/app/diagnostics']);
  }
  gotoOrderList() {
    this.router.navigate(['/app/diagnostics/advice/walkinreports']);
  }

  checkedDateField(sample, event, isSampleCollectionDate) {
    this.diagnosticsAdviseTrack.serviceList.forEach(element => {
      if (isSampleCollectionDate) {
        if (event.target.checked) {
          element.sampleCollectionDate = sample.sampleCollectionDate;
        } else if (sample && element.serviceId != sample.serviceId) {
          element.sampleCollectionDate = "";
        }
      } else {
        if (event.target.checked)
          element.partnerProcessedSample = true;
        else
          element.partnerProcessedSample = false;
      }
    });
  }

  makeUrl(url) {
    this.authService.openPDF(url);
  }

  sliderImage(imageSrc) {
    if (imageSrc.substring((imageSrc.lastIndexOf('.') + 1), (imageSrc.lastIndexOf('.') + 4)).toString() == "pdf") {
      window.open(imageSrc, '_blank')
    } else {
      this.crouselSelectedImage = imageSrc;
    }
  }

  getContentType(fileName: string): string {
    let contentType: string = '';
    if (fileName != null && fileName.length > 0)
      if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileName.endsWith(".png")) {
        contentType = "image/png";
      } else if (fileName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileName.endsWith(".xls")) {
        contentType = "application/vnd.ms-excel";
      } else if (fileName.endsWith(".xlsx")) {
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        contentType = "application/octet-stream";
      }
    return contentType;
  }

}
