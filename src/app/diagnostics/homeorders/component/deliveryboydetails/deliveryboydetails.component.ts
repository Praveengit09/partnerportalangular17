import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../app.config';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { CommonUtil } from '../../../../base/util/common-util';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { DeliveryDetailsOfEachEmployee } from '../../../../model/diagnostics/deliveryDetailsOfEachEmployee';
import { SampleDetails } from '../../../../model/diagnostics/sampleDetails';
import { AuthService } from "./../../../../auth/auth.service";
import { DiagnosticsService } from './../../../diagnostics.service';
import { DeliveryDetailsOfAllEmployees } from '../../../../model/diagnostics/deliveryDetailsOfAllEmployees';

@Component({
    templateUrl: './deliveryboydetails.template.html',
    styleUrls: ['./deliveryboydetails.style.scss'],
    encapsulation: ViewEncapsulation.None,

})

export class DeliveryBoyDetailsComponent {

    detailsOfEachEmployeeList: DeliveryDetailsOfEachEmployee[] = [];
    employeeDetail: DeliveryDetailsOfAllEmployees;
    sampleDetails: SampleDetails[] = [];
    totalSamplesCollected: number = 0;
    totalTubesGiven: number = 0;
    totalSamplesDelivered: number = 0;
    noOfTubesAdded: number;
    validation: ValidationUtil;
    pocId: number;
    noOfTubes: number;

    constructor(config: AppConfig, private authService: AuthService,
        private diagnosticsService: DiagnosticsService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil,
        private router: Router, private spinnerService: SpinnerService, private hsLocalStorage: HsLocalStorage) {
        this.pocId = authService.userAuth.pocId;
        this.validation = validationUtil;
    }

    ngOnInit(): void {
        console.log("EmpID: " + this.diagnosticsService.deliveryEmp);
        if (this.diagnosticsService.deliveryEmp && this.diagnosticsService.selectedTimeStamp) {
            this.hsLocalStorage.setData('deliveryEmp', this.diagnosticsService.deliveryEmp);
            this.hsLocalStorage.setData('selectedTimeStamp', this.diagnosticsService.selectedTimeStamp);
        } else if (this.hsLocalStorage && this.hsLocalStorage.getData('deliveryEmp')
            && this.hsLocalStorage.getData('selectedTimeStamp')) {
            this.diagnosticsService.deliveryEmp = this.hsLocalStorage.getData('deliveryEmp');
            this.diagnosticsService.selectedTimeStamp = this.hsLocalStorage.getData('selectedTimeStamp');
        }
        this.employeeDetail = this.diagnosticsService.deliveryEmp;
        this.getDeliveryBoyDetails();
        this.getSampleDeliveredToLabsCount();
    }

    getDeliveryBoyDetails() {
        this.diagnosticsService.getDeliveryDetailsOfSpecificEmployees(this.diagnosticsService.selectedTimeStamp,
            this.diagnosticsService.deliveryEmp.empId).then(details => {
                this.detailsOfEachEmployeeList = details;
                details.forEach(empDetail => {
                    this.totalSamplesCollected += empDetail.noOfSampleCollected;
                    this.totalTubesGiven += empDetail.tubesGiven;
                });
            })
    }

    getSampleDeliveredToLabsCount() {
        this.diagnosticsService.getSamplesDeliveredToLabCount(this.diagnosticsService.selectedTimeStamp,
            this.diagnosticsService.deliveryEmp.empId).then(samplesData => {
                this.sampleDetails = samplesData;
                samplesData.forEach(item => {
                    this.totalSamplesDelivered += item.samples;
                });
            })
    }

    addInventory() {
        this.diagnosticsService.diagnosticAddInventory(this.diagnosticsService.deliveryEmp.empId,
            this.pocId, this.noOfTubesAdded).then((data) => {
                if (data && data.statusCode == 200) {
                    alert(data.statusMessage);
                    this.noOfTubes = this.noOfTubesAdded;
                } else {
                    alert("Something went wrong.Please try again.");
                }
            })
    }

    onDone() {
        this.router.navigate(['/app/diagnostics/homeorders/logistics']);
    }

}