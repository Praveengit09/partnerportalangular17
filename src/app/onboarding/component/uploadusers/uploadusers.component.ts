import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { OnboardingService } from '../../onboarding.service';
import { FileUtil } from '../../../base/util/file-util';

@Component({
    selector: 'uploadusers',
    templateUrl: './uploadusers.template.html',
    styleUrls: ['./uploadusers.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class UploadUsersComponent implements OnInit {
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
    procedureName: string = "";

    @ViewChild('userOnboardingFileUpload', { static: false })

    myInputVariable: any;

    constructor(private authService: AuthService, private router: Router, private onboardingService: OnboardingService,
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
                if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.vcf')) {

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
            this.checkBoxValidationMessage = 'Please select atleast one template.';
            return;
        }
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
            this.authService.userAuth.employeeName
            this.onboardingService.uploadOnboardingUsers(awsS3FileResult.Location, this.authService.selectedPOCMapping.pocId, this.authService.userAuth.employeeId).then((data) => {
                this.spinnerService.stop();
                this.errorMessage = new Array();
                if (data && (data.statusCode == 200 || data.statusCode == 201)) {
                    this.isError = false;
                    this.errorMessage[0] = 'Your data is being processed. You will receive an email once the data has been processed.';
                } else {
                    this.isError = true;
                    this.errorMessage[0] = data && data.statusMessage ? data.statusMessage : 'Something went wrong. Please check if the file you are trying to upload matches the template format, and try again.';
                }
                this.showMessage = true;
                return;
            });
        });
    }

    getKeys(map) {
        return Array.from(map.keys());
    }

}