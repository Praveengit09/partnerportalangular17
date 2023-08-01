import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AdminService } from '../../admin/admin.service';
import { SpinnerService } from '../../layout/widget/spinner/spinner.service';
import { FileUtil } from '../../base/util/file-util';

@Component({
    selector: 'assignpackages',
    templateUrl: './assignpackages.template.html',
    styleUrls: ['./assignpackages.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class AssignPackagesComponent implements OnInit {
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

    @ViewChild('diagnosticFileUpload', { static: false })

    myInputVariable: any;

    constructor(private authService: AuthService, private router: Router, private adminService: AdminService,
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
            this.checkBoxValidationMessage = 'Please select atleast one template.';
            return;
        }

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
            this.adminService.readPackagesExcel({ excelUrl: awsS3FileResult.Location, pocId: this.authService.selectedPOCMapping.pocId, pocName: this.authService.selectedPOCMapping.pocName }).then((data) => {
                this.spinnerService.stop();
                // console.log(JSON.stringify(data));
                let map = new Map(Object.entries(data));
                this.errorMessage = new Array();
                for (let item of Array.from(map.keys())) {

                    if (+item == 200) {
                        this.myInputVariable.nativeElement.value = "";
                        this.isError = false;
                        this.errorMessage[0] = data[item + ''];
                        this.showMessage = true;
                    } else {
                        this.isError = true;
                        this.errorMessage[0] = data[item + ''];
                        this.showMessage = true;
                        return;
                    }
                }

            });
        });

    }
    getKeys(map) {
        return Array.from(map.keys());
    }

}