import { AuthService } from '../../../auth/auth.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { WellnessService } from '../../wellness.service';
import { Router } from '@angular/router';
import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { FileUtil } from '../../../base/util/file-util';

@Component({
    selector: 'updatepricing',
    templateUrl: './updatepricing.template.html',
    styleUrls: ['./updatepricing.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class UpdateWellnessPricingComponent implements OnInit {
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
        private wellnessService: WellnessService, private fileUtil: FileUtil,
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
        this.hasCheckBoxValidation = false;
        this.isError = false;
        this.errorMessage = undefined;
        this.showMessage = false;
        if (this.hasCheckBoxValidation) {
            return;
        }
        if (this.uploadFilesList === undefined || this.uploadFilesList === null ||
            this.uploadFilesList[0] === undefined || this.uploadFilesList[0] === null) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Please select atleast one file.';
            return;
        } else if (this.uploadFilesList.length > 1) {
            this.hasCheckBoxValidation = true;
            this.checkBoxValidationMessage = 'Please select only one file at one time.';
            return;
        } else if (this.uploadFilesList.length > 0) {
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
            this.wellnessService.readTestPriceExcel({
                fileUrl: awsS3FileResult.Location, pocId: this.authService.selectedPocDetails.pocId,
            }).then((data) => {
                this.spinnerService.stop();
                if (data.statusCode == 201 || data.statusCode == 200) {
                    this.myInputVariable.nativeElement.value = "";
                    this.isError = false;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = data.statusMessage;
                    this.showMessage = true;
                } else {
                    this.isError = true;
                    this.errorMessage = new Array();
                    this.errorMessage[0] = data.statusMessage;
                    this.showMessage = true;
                    return;
                }
            });

        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        });
    }

    onSearchAndUpadateClick() {
        this.router.navigate(['app/wellness/servicepricing'])
    }
}