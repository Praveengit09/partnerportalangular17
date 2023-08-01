import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserReport } from '../../..//model/report/userReport';
import { Config } from '../../../base/config';
import { CommonUtil } from '../../../base/util/common-util';
import { FileUtil } from '../../../base/util/file-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { Payment } from '../../../model/basket/payment';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { InvasiveTestDetails } from '../../../model/phr/invasivetestdetails';
import { AuthService } from "./../../../auth/auth.service";
import { HsLocalStorage } from './../../../base/hsLocalStorage.service';
import { DiagnosticDeliveryAdviceTrack } from './../../../model/diagnostics/diagnosticListForAdmin';
import { DiagnosticsService } from './../../diagnostics.service';
// tslint:disable-next-line:no-var-requires

@Component({
    selector: 'orderresults',
    templateUrl: './ordertestresults.template.html',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ['./ordertestresults.style.scss']
})
export class OrderResultsComponent implements OnInit {
    @ViewChild('diagnosticFileUpload', { static: false })
    diagnosticFileUploadVariable: any;

    today: Date = new Date();
    datepickerOpts = {
        autoclose: true,
        startDate: new Date(),
        endDate: new Date(),
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    }

    errorMessage: Array<string>;
    isError: boolean = false;
    showMessage: boolean;

    diagnosticsAdviseTrack: DiagnosticDeliveryAdviceTrack;
    reportFileList: Array<String> = new Array<String>();

    uploadFilesList: any;
    checkBoxValidationMessage: string;

    empId: number;
    empName: string;

    @ViewChild('diagnosticFileUpload', { static: false })
    myInputVariable: ElementRef;

    @Input() defaultSelectField: string = null;
    appId: number = 0;

    constructor(private diagnosticsService: DiagnosticsService, private router: Router,
        private authService: AuthService, private fileUtil: FileUtil,
        private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService, private commonUtil: CommonUtil) {
        this.empId = authService.userAuth.employeeId;
        this.empName = authService.userAuth.employeeName;
        if (Config.portal && Config.portal.appId)
            this.appId = Config.portal.appId;
    }

    ngOnInit() {
        const random = Math.floor(Math.random() * 9999999999);
        this.diagnosticsAdviseTrack = this.diagnosticsService.subServiceDiagnosticsOrderAdmin;
        this.datepickerOpts.startDate = new Date(this.diagnosticsAdviseTrack.createdTimestamp);
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
                }
            }
        }

        if (!this.diagnosticsAdviseTrack.proofDocumentUrlList) {
            this.diagnosticsAdviseTrack.proofDocumentUrlList = new Array();
        }
        let serviceIdList = Array();
        for (const serviceItem of this.diagnosticsAdviseTrack.serviceList) {
            serviceIdList.push(serviceItem.serviceId);
        }
        console.log("this.diagnosticsService.serviceItem: ", this.diagnosticsService.serviceItem);

        if (this.diagnosticsService.serviceItem) {
            this.diagnosticsAdviseTrack.serviceList.forEach(service => {
                if (service.serviceId == this.diagnosticsService.serviceItem.serviceId) {
                    service.sampleId = this.diagnosticsService.serviceItem.sampleId;
                }
            });
        }
        console.log("Barcode: " + JSON.stringify(this.diagnosticsAdviseTrack.serviceList));
    }

    fileUpload(event) {
        this.uploadFilesList = event.target.files;
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

        let userReport: UserReport = new UserReport();
        userReport.type = 0;
        userReport.userType = 3;
        userReport.profileId = this.diagnosticsAdviseTrack.patientProfileId;
        userReport.referenceId = this.diagnosticsAdviseTrack.orderId;
        userReport.proofDocumentUrlList = this.diagnosticsAdviseTrack.proofDocumentUrlList;
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
            details.sampleId = serviceItem.sampleId;
            details.date = Date.parse(serviceItem.sampleCollectionDate);
            details.reportedDate = Date.now();
            details.updatedTime = Date.now();
            userReport.testDetailList.push(details);
        }

        this.spinnerService.start();
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

                this.spinnerService.stop();
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
            this.reportFileList = new Array<String>();
            for (let awsS3FileResult of awsS3FileResults) {
                if (awsS3FileResult.Location) {
                    let url = awsS3FileResult.Location;
                    this.reportFileList.push(url);
                }
            }
            if (!this.diagnosticsAdviseTrack.proofDocumentUrlList) {
                this.diagnosticsAdviseTrack.proofDocumentUrlList = new Array();
            }
            try {
                this.reportFileList.forEach(item => {
                    try {
                        this.diagnosticsAdviseTrack.proofDocumentUrlList.push(JSON.parse(JSON.stringify(item)));
                    } catch (error) {
                        console.error('Error occurred', error);
                    }
                });
            } catch (error) {
                console.error('Error occurred', error);
            }
            // Removed the code for updating the update file path in the phr reports.

            fileUploadForm.resetForm();
            this.spinnerService.stop();
            (<any>$('#testResultsUploadModel')).modal('hide');
        }).catch(error => {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Error occurred while processing request. Please try again!";
            this.showMessage = true;
            this.spinnerService.stop();
        });
    }

    makeUrl(url) {
        this.authService.openPDF(url);
    }

    remove(index: number) {
        console.log("index: " + index);
        this.diagnosticsAdviseTrack.proofDocumentUrlList.splice(index, 1);
        // this.reportFileList = this.diagnosticsAdviseTrack.proofDocumentUrlList;
        console.log("proofDocumentUrlList: " + JSON.stringify(this.diagnosticsAdviseTrack.proofDocumentUrlList))
    }

    initialUploadReport() {
        this.myInputVariable.nativeElement.value = "";
        (<any>$("#testResultsUploadModel")).modal("show");
    }

    onSubmit(): void {
        this.spinnerService.start();

        let dataEntered: boolean;

        this.isError = false;
        this.showMessage = false;
        this.errorMessage = new Array<string>();

        this.diagnosticsAdviseTrack.serviceList.forEach(item => {
            console.log("TestResultss: " + item.sampleCollectionDate + ">>>>>" + this.diagnosticsAdviseTrack.createdTimestamp);
            let tempCollectionDate = null;
            if (item.sampleCollectionDate != undefined)
                tempCollectionDate = this.commonUtil.convertOnlyDateToTimestamp(item.sampleCollectionDate);
            console.log("TestResults: " + tempCollectionDate);
            if (tempCollectionDate == this.commonUtil.convertOnlyDateToTimestamp(new Date())) {
                tempCollectionDate = new Date().getTime();
            }
            item.homeCollections = 1;
            dataEntered = false;
            $('html, body').animate({ scrollTop: '0px' }, 300);
            if ((!item.sampleId) || isNaN(tempCollectionDate) || tempCollectionDate == null) {
                this.errorMessage[0] = 'Please add data for all tests.';
                this.isError = true;
            } else if (tempCollectionDate > (new Date().getTime())) {
                this.errorMessage[0] = 'Please add proper home collection date.';
                this.isError = true;
            } else {
                dataEntered = true;
                item.sampleCollectionDate = new Date(tempCollectionDate);
                this.isError = false;
                this.showMessage = false;
            }
            if (this.isError) {
                this.showMessage = true;
                this.spinnerService.stop();
                return;
            }
        });

        if (dataEntered == true) {
            this.diagnosticsAdviseTrack.serviceList.forEach(item => {
                item.sampleCollectionDate = this.commonUtil.convertOnlyDateToTimestamp(item.sampleCollectionDate)
            })
        }

        console.log("dataEntered: " + dataEntered);
        if (dataEntered) {
            this.diagnosticsAdviseTrack.acceptedEmpId = this.empId;
            this.diagnosticsAdviseTrack.acceptedEmpName = this.empName;
            this.diagnosticsAdviseTrack.payment.paymentStatus = Payment.PAYMENT_STATUS_PAID;
            this.diagnosticsAdviseTrack.invoiceCompletionStatus = DiagnosticDeliveryAdviceTrack.COLLECTED;
            this.diagnosticsAdviseTrack.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.COLLECTED;

            this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticsAdviseTrack).then(data => {
                this.errorMessage = new Array<string>();;
                console.log("diagnosticorderadmin bodyyyyyy::" + JSON.stringify(this.diagnosticsAdviseTrack));
                if (data.statusCode == 201 || data.statusCode == 200) {
                    console.log('success-------------')
                    this.updateInvestigationDetail();

                    // Added the delivered status to count the delivery
                    this.diagnosticsAdviseTrack.invoiceCompletionStatus = DiagnosticDeliveryAdviceTrack.DELIVERED;
                    this.diagnosticsAdviseTrack.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.DELIVERED;
                    this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticsAdviseTrack)
                        .then(data => {
                            console.log('success-------------');
                        }).catch((error) => {
                            console.error('Error occurred while updating the delivery status', error);
                        });
                } else {
                    console.log('fails-------------');
                    this.spinnerService.stop();
                    this.errorMessage = new Array<string>();
                    this.errorMessage[0] = data.statusMessage;
                    this.isError = true;
                    this.showMessage = true;
                }
            }).catch(() => {
                this.spinnerService.stop();
                alert("Something went wrong.Please try again");
            });

        }
    }

    updateInvestigationDetail() {
        this.diagnosticsAdviseTrack.empId = this.authService.userAuth.employeeId;
        this.diagnosticsService.updateDiagnosticInvestigationDetail(this.diagnosticsAdviseTrack).then(uploadResponse => {
            if (uploadResponse && (uploadResponse.statusCode == 201 || uploadResponse.statusCode == 200)) {
                this.spinnerService.stop();
                this.gotoOrderList();
            } else {
                this.errorMessage = new Array<string>();
                this.errorMessage[0] = (uploadResponse && uploadResponse.statusMessage) ? uploadResponse.statusMessage : 'Error occurred while submitting the test report.';
                this.isError = true;
                this.showMessage = true;
                return;
            }
        }).catch((error) => {
            console.error('Error occurred while getting the response', error);
            this.errorMessage = new Array<string>();
            this.errorMessage[0] = "Error occurred while uploading the test report";
            this.isError = true;
            this.showMessage = true;
        }).catch(() => {
            this.spinnerService.stop();
            alert("Something went wrong.Please try again");
        });
    }

    gotoDiagnosticsDashboard(): void {
        this.router.navigate(['/app/diagnostics']);
    }
    gotoOrderList() {
        if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN)
            this.router.navigate(['/app/diagnostics/slotbooking/slotqueue']);
        else if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING)
            this.router.navigate(['/app/diagnostics/orders']);
        else
            this.router.navigate(['/app/diagnostics/homeorders/homeorderlist']);
    }

    /* private setTimestampForDate(date) {
        let dt = new Date(date);
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setSeconds(0);
        dt.setMilliseconds(0);
        return dt.getTime();
    } */

    checkedDateField(sample, event, isSampleCollectionDate) {
        console.log('Sample collection >> ', sample);
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
        console.log("ServiceListDate: ", this.diagnosticsAdviseTrack.serviceList);
    }

    /* checkedDateField(sample, event, isSampleCollectionDate) {
        if (isSampleCollectionDate)
            sample.sampleCollectionDate = new Date(this.setTimestampForDate(sample.sampleCollectionDate));
        console.log('Sample collection date >> ' + JSON.stringify(sample) + ">>>>" + event.target.checked);
        this.diagnosticsAdviseTrack.serviceList.forEach((element, i) => {
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
            if (isSampleCollectionDate)
                console.log('==>' + i + '==>' + sample.sampleCollectionDate)
        });
    } */

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

    onBarcodeClick(item: any) {
        this.diagnosticsService.serviceItem = item;
        this.router.navigate(['/app/diagnostics/homeorders/barcodescanner']);
        console.log("onBarcodeClick: " + JSON.stringify(item));
    }

    getFileName(url) {
        return ('/' + url).split('/').pop().replace(/\%20/gi, ' ').substring(14, 50);
    }

    onBackClick() {
        this.router.navigate(['/app/diagnostics/homeorders/orderdetails']);
    }

}
