import { FileUtil } from './../../../../base/util/file-util';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { SearchRequest } from '../../../../model/common/searchRequest';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { ServiceItem } from '../../../../model/service/serviceItem';
import { DiagnosticsService } from '../../../diagnostics.service';

@Component({
    selector: 'pickuprequest',
    templateUrl: './pickuprequest.template.html',
    styleUrls: ['./pickuprequest.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PickupRequestComponent {


    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    sampleIdCheck: boolean = false;

    pocId: number = 0;
    searchTestsTotal: number = 0;
    searchedTests: any;
    response: any;
    brandId: number;
    uploadFilesList: any;
    checkBoxValidationMessage: string;
    proofs: Array<string> = new Array<string>();
    uploadDoc: boolean = false;

    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    slotBookingDetails: SlotBookingDetails = new SlotBookingDetails();
    vacutainerList: any;
    TIME_CONSTANT: number = -this.commonUtil.getTimezoneDifferential();

    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    selectColumns: any[] = [
        {
            variable: 'serviceName',
            filter: 'text'
        }
    ];

    constructor(private router: Router, private diagnosticsService: DiagnosticsService,
        private auth: AuthService, private commonUtil: CommonUtil, private fileUtil: FileUtil,
        private spinnerService: SpinnerService) {
        this.pocId = auth.userAuth.pocId;
        this.brandId = auth.userAuth.brandId;

    }

    onRegisterNewUser(selectedProfile: SelectedRegisteredProfile) {
        this.selectedRegisteredProfile = selectedProfile;
        this.saveSelectedProfile();
        this.slotBookingDetails.bookingSubType = 0;
        this.uploadDoc = true;
    }

    saveSelectedProfile() {
        this.slotBookingDetails.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
        this.slotBookingDetails.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.slotBookingDetails.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
        this.slotBookingDetails.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
        this.slotBookingDetails.pocDetails = this.auth.userAuth.selectedPoc;
    }

    searchTests(searchKeyword) {

        let searchRequest = new SearchRequest();
        searchRequest.aliasSearchType = 1;
        searchRequest.from = 0;
        searchRequest.id = this.pocId;
        searchRequest.searchCriteria = 0;
        searchRequest.searchTerm = searchKeyword;
        searchRequest.size = 500;
        searchRequest.brandId = this.brandId;

        if (searchKeyword.length > 2) {
            this.diagnosticsService.getSearchedTestsList(searchRequest).then((response) => {
                if (response == undefined || response == null || response.length == 0) {
                    this.errorMessage = new Array();
                    this.errorMessage[0] = 'No results found';
                    this.isError = true;
                    this.showMessage = true;
                    $('html, body').animate({ scrollTop: '0px' }, 300);
                }
                this.searchedTests = response;
                this.searchTestsTotal = response.length;
            });
        }
    }

    resetError() {
        this.errorMessage = new Array();
        this.isError = false;
        this.showMessage = false;
    }

    getTestName(selectedInvestigation) {
        this.resetError();
        if (selectedInvestigation != undefined && selectedInvestigation != null
            && selectedInvestigation.serviceId > 0) {
            let isServiceExist = false;

            if (this.slotBookingDetails.serviceList.length > 0) {
                this.slotBookingDetails.serviceList.forEach(service => {
                    if (selectedInvestigation.serviceId == service.serviceId) {
                        isServiceExist = true;
                        return
                    }
                });
            }

            let serviceItem: ServiceItem = new ServiceItem();
            serviceItem.serviceId = selectedInvestigation.serviceId;
            serviceItem.parentServiceId = serviceItem.categoryId = selectedInvestigation.parentServiceId;
            serviceItem.serviceName = selectedInvestigation.serviceName;
            serviceItem.parentServiceName = serviceItem.categoryName = selectedInvestigation.parentServiceName;
            serviceItem.quantity = 1;

            if (isServiceExist == false) {
                this.diagnosticsService.getTestAmount(selectedInvestigation.serviceId, this.pocId, false).then(data => {

                    if (data && data.netPrice > 0) {
                        if (data.walkinOrderPriceDetails.dayBasedPricing) {
                            data.walkinOrderPriceDetails.dayBasedPricing.forEach(day => {

                                let currentTime = this.commonUtil.convertTimeToUTC(new Date()) + this.TIME_CONSTANT;
                                if (day.dayOfWeek == this.commonUtil.convertDateToDayOfWeek(new Date())) {
                                    day.timeBasedPricing.forEach(timeInterval => {
                                        if (currentTime >= timeInterval.fromTime && currentTime < timeInterval.toTime) {
                                            console.log("timeInterval: " + JSON.stringify(timeInterval));
                                            serviceItem.grossPrice = serviceItem.originalAmount = timeInterval.grossPrice;
                                            serviceItem.netPrice = serviceItem.finalAmount = timeInterval.netPrice;
                                            serviceItem.discountPrice = serviceItem.otherDiscountAmount = timeInterval.discountPrice;
                                        }
                                    })
                                }
                            })
                        } else if (data.walkinOrderPriceDetails) {
                            serviceItem.grossPrice = serviceItem.originalAmount = data.walkinOrderPriceDetails.grossPrice;
                            serviceItem.netPrice = serviceItem.finalAmount = data.walkinOrderPriceDetails.netPrice;
                            serviceItem.discountPrice = serviceItem.otherDiscountAmount = data.walkinOrderPriceDetails.discountPrice;
                            serviceItem.walkinOrderPriceDetails = data.walkinOrderPriceDetails;
                        }
                    }
                    this.slotBookingDetails.serviceList.push(serviceItem);
                });
            }
        }
    }

    remove(index: number): void {
        this.resetError();
        this.slotBookingDetails.serviceList.splice(index, 1);
    }

    onNext() {
        this.resetError();
        if (this.slotBookingDetails.serviceList.length == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage[0] = 'Please add atleast one test';
            return;
        }

        if (!this.slotBookingDetails.patientProfileId) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage[0] = 'Please add profile details';
            return;
        }

        this.spinnerService.start();
        this.slotBookingDetails.actionPerformed = 34; // order intiated
        this.diagnosticsService.raisePickupRequest(this.slotBookingDetails).then((response) => {
            this.spinnerService.stop();
            this.response = response;
            this.sortVacutainerList();
        })
    }

    sortVacutainerList() {
        this.vacutainerList = this.response.vacutainerList;
        let test: any[] = [];
        this.vacutainerList.forEach((vacutainer) => {
            if (vacutainer.vacutainerId == 0)
                test = vacutainer.tests;
        })
        this.vacutainerList = this.vacutainerList.filter(vacutainer => vacutainer.vacutainerId !== 0);
        this.sampleIdCheck = true;
        let serviceList: any[] = [];
        test.forEach((doc) => {
            let temp = {
                vacutainerType: doc.serviceName,
                tests: []
            }
            serviceList.push(temp);
        })
        serviceList.push.apply(this.vacutainerList);
        this.vacutainerList = serviceList;
    }

    openModal(id: string) {
        (<any>$(id)).modal('show');
        $(".modal-backdrop").not(':first').remove();
    }

    closeModel(id: string) {
        (<any>$(id)).modal('hide');
    }


    onBack() {
        this.sampleIdCheck = false;
    }

    onConfirm() {
        this.resetError();
        console.log("vacutainerList", JSON.stringify(this.vacutainerList));
        let check: boolean = false;
        this.vacutainerList.forEach((vacutainer) => {
            if (vacutainer.sampleId == null || vacutainer.sampleId == '' || vacutainer.sampleCollectionDate == undefined || vacutainer.sampleCollectionDate == null) {
                check = true;
            }
        })
        if (check) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage[0] = 'Please add sample details';
            $('html, body').animate({ scrollTop: '0px' }, 300);
            return;
        }
        this.spinnerService.start();
        this.slotBookingDetails.actionPerformed = 32; // during sample update
        this.slotBookingDetails.pocId = this.pocId;
        this.vacutainerList.forEach((vacutainer) => {
            for (let j = 0; j < this.slotBookingDetails.serviceList.length; j++) {
                if (this.slotBookingDetails.serviceList[j].serviceName == vacutainer.vacutainerType) {
                    this.slotBookingDetails.serviceList[j].sampleId = vacutainer.sampleId;
                    this.slotBookingDetails.serviceList[j].sampleCollectionDate = this.commonUtil.convertDateToTimestamp(vacutainer.sampleCollectionDate);
                }
            }
            for (let i = 0; i < vacutainer.tests.length; i++) {
                for (let j = 0; j < this.slotBookingDetails.serviceList.length; j++) {
                    if (this.slotBookingDetails.serviceList[j].serviceName == vacutainer.tests[i].serviceName) {
                        this.slotBookingDetails.serviceList[j].sampleId = vacutainer.sampleId;
                        this.slotBookingDetails.serviceList[j].sampleCollectionDate = this.commonUtil.convertDateToTimestamp(vacutainer.sampleCollectionDate);
                    }
                }
            }
        })

        this.slotBookingDetails.proofs = this.proofs;

        this.diagnosticsService.raisePickupRequest(this.slotBookingDetails).then((response) => {
            this.spinnerService.stop();
            if (response.statusCode == 200 || response.statusCode == 201) {
                alert("Order Raised Successfully");
                this.router.navigate(['/app/diagnostics/homeorders/pickuporderlist']);
            }
            else
                alert("Something went wrong");
        })
    }


    onUploadButtonClick() {
        this.checkBoxValidationMessage = '';
        console.log("profileId", this.slotBookingDetails.patientProfileId)
        if (this.slotBookingDetails.patientProfileId == undefined || this.slotBookingDetails.patientProfileId == null || this.slotBookingDetails.patientProfileId == 0) {
            this.isError = true;
            this.showMessage = true;
            this.errorMessage[0] = 'Please add profile details';
            return;
        }

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

        this.spinnerService.start();
        for (let uploadFile of this.uploadFilesList) {
            this.fileUtil.fileUploadToAwsS3(null, uploadFile, this.slotBookingDetails.patientProfileId, false, false).then(response => {
                this.proofs.push(response.Location);
            });
        }
        (<any>$)('#files').val("");
        this.spinnerService.stop();
        alert("Documents uploaded successfully");
    }

    fileUpload(event) {
        this.uploadFilesList = event.target.files;
    }
}
