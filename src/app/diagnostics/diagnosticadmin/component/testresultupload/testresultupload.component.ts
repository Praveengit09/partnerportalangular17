import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { FileUtil } from '../../../../base/util/file-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DiagnosticAdminService } from '../../diagnosticadmin.service';

@Component({
    selector: 'testresultupload',
    templateUrl: './testresultupload.template.html',
    styleUrls: ['./testresultupload.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class TestResultUploadComponent implements OnInit {

    fileUploadData: string;
    pdfUploadFilesList: Array<any>;
    excelUploadFileList: Array<any>;
    hasCheckBoxValidation: boolean = false;
    checkBoxValidationMessage: string;

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;

    isExcel: boolean = false;
    path: string;
    excelUrl: string;

    partnerProcessedSample: boolean = false;
    isPdf: boolean = true;
    isPartial: boolean = false;

    @ViewChild('diagnosticFileUpload', { static: false })
    myInputVariable: any;

    @ViewChild('diagnosticExcelUpload', { static: false })
    excelInputVariable: any;

    constructor(private authService: AuthService,
        private diagAdminService: DiagnosticAdminService,
        private spinnerService: SpinnerService,
        private fileUtil: FileUtil
    ) {

    }

    ngOnInit() {
    }

    fileUpload(event, isExcel: boolean) {
        this.isExcel = isExcel;
        console.log("uploadFilesList: " + JSON.stringify(event.target.files));
        if (this.isExcel) {
            this.excelUploadFileList = event.target.files;
        } else {
            this.pdfUploadFilesList = event.target.files;
        }

    }

    checkedReportType(reportType) {
        this.isPartial = reportType;
    }

    onUploadButtonClick(isExcel) {
        this.isExcel = isExcel;
        this.hasCheckBoxValidation = false;
        this.isError = false;
        this.errorMessage = undefined;
        this.showMessage = false;

        if (!isExcel) {
            if (this.pdfUploadFilesList === undefined || this.pdfUploadFilesList === null) {
                this.hasCheckBoxValidation = true;
                this.checkBoxValidationMessage = 'Please select atleast one file of report.';
                return;
            }
            else if (this.pdfUploadFilesList.length > 0) {
                for (let file of this.pdfUploadFilesList) {
                    if (file.name.endsWith('.pdf') || file.name.endsWith('.PDF') || file.name.endsWith('.jpg') || file.name.endsWith('.JPG')
                        || file.name.endsWith('.png') || file.name.endsWith('.PNG')) {

                    }
                    else {
                        this.hasCheckBoxValidation = true;
                        this.checkBoxValidationMessage = 'Only pdf, png, jpg files are supported';
                        return;
                    }
                }
            }
        }

        else if (isExcel) {
            if (this.excelUploadFileList === undefined || this.excelUploadFileList === null) {
                this.hasCheckBoxValidation = true;
                this.checkBoxValidationMessage = 'Please select excel to be uploaded.';
                return;
            }
            else if (this.excelUploadFileList.length > 0) {
                for (let file of this.excelUploadFileList) {
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

        $('html, body').animate({ scrollTop: '0px' }, 300);
        this.spinnerService.start();
        if (isExcel) {
            this.fileUtil.fileUploadToAwsS3(null, this.excelUploadFileList[0], 0, false, false).then((awsS3FileResults) => {
                this.excelUrl = this.path = awsS3FileResults[0].Location;
                alert("Template uploaded successfully");
            }).catch(error => {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Error occurred while processing request. Please try again!";
                this.showMessage = true;
                this.spinnerService.stop();
            });

        } else {
            for (let uploadFile of this.pdfUploadFilesList) {
                this.fileUtil.fileUploadToAwsS3(null, uploadFile, 0, false, true);
            }
            alert("Reports uploaded successfully");
        }
    }

    submitData() {
        console.log("partnerProcessedSample: " + this.partnerProcessedSample);
        this.hasCheckBoxValidation = false;
        this.isError = false;
        this.errorMessage = undefined;
        this.showMessage = false;
        this.spinnerService.start();
        if (this.path && this.excelUrl) {
            this.diagAdminService.uploadexcelInfo({
                filesPath: this.path, excelUrl: this.excelUrl, empId: this.authService.userAuth.employeeId,
                partnerProcessedSample: this.partnerProcessedSample, pdf: this.isPdf, partial: this.isPartial
            }).then((response) => {
                this.spinnerService.stop();
                if (response.statusCode === 201) {
                    this.excelUrl = "";
                    this.path = "";
                    this.myInputVariable.nativeElement.value = "";
                    this.excelInputVariable.nativeElement.value = "";
                    alert(response.statusMessage);
                } else {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = response.statusMessage;
                    this.showMessage = true;
                }

                console.log("Response: ", response);
            })
        } else {
            this.spinnerService.stop();
            if (!this.path) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please Upload Report(s).";
                this.showMessage = true;
                return;
            } else if (!this.excelUrl) {
                this.isError = true;
                this.errorMessage = new Array();
                this.errorMessage[0] = "Please add excel.";
                this.showMessage = true;
            }
        }
    }
}