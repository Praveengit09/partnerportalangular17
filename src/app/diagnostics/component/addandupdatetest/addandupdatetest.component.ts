import { IdName } from './../../../model/employee/idName';
import { ServiceDetail } from './../../../model/employee/servicedetail';
import { SymptomNote } from './../../../model/advice/symptomNote';
import { DisplayDescription } from './../../../model/product/displaydescription';
import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';
import { InvestigationDetails } from './../../../model/diagnostics/investigationDetails';
import { TestCategoryIds } from './../../../model/diagnostics/testCategory';
import { ServiceItem } from './../../../model/service/serviceItem';
import { CommonUtil } from './../../../base/util/common-util';
import { DiagnosticsService } from './../../diagnostics.service';
import { DiagnosticsServicePriceDetail } from './../../../model/diagnostics/diagnosticsServicePriceDetails';
@Component({
    selector: 'addandupdatetest',
    templateUrl: './addandupdatetest.template.html',
    styleUrls: ['./addandupdatetest.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class AddAndUpdateTestComponent implements OnInit {
    serviceNameSearchList: any[] = new Array<any>();
    upDateList: any;
    categoryNameList: ServiceDetail[] = new Array<ServiceDetail>();
    searchKeyword: string;
    searchTestTotal: number = 0;
    departmentCategory: number = 0;
    serviceName: string;
    isError: boolean;
    errorMessage: Array<string>;
    showMessage: boolean;
    selectedTest: DiagnosticsServicePriceDetail = new DiagnosticsServicePriceDetail();
    selectedCategory: ServiceDetail = new ServiceDetail();
    selectedChangeCategory: DiagnosticsServicePriceDetail = new DiagnosticsServicePriceDetail();
    investigationInfo: ServiceItem = new ServiceItem();
    isErrorTest: boolean;
    showMessageTest: boolean;
    homeCollections: boolean = false;
    errorMessageTest: Array<string>;
    content: any;
    @Input()
    investigationDetails: InvestigationDetails;
    testCategoryIds = TestCategoryIds;
    //testCategoryId: number[] = new Array<number>();
    //  ````````````````````````````````selectedCategorIds = TestCategoryIds[0].id;
    displayDescriptionList: DisplayDescription[] = new Array<DisplayDescription>();
    subServiceList: ServiceDetail[] = new Array<ServiceDetail>();
    displayNoteList: SymptomNote[] = new Array<SymptomNote>();
    displayContentList: DisplayDescription[] = new Array<DisplayDescription>();
    brandId: number;
    selectedCategoryIndex1: number = -1;
    selectedCategoryIndex2: number = -1;
    selectedCategoryIndex3: number = -1;
    selectedCategoryIndex4: number = -1;
    selectedTestIndex: number = -1;
    selectTestName: any[] = [
        {
            variable: 'serviceName',
            filter: 'text'
        }
    ];


    testCategoryId: number;
    testCategoryName: string;

    constructor(private authService: AuthService, private diagnosticsService: DiagnosticsService,
        private spinnerService: SpinnerService, private commonUtil: CommonUtil,) {
        this.brandId = authService.userAuth.brandId;
    }

    ngOnInit() {
        //this.testCategoryIds = this.testCategoryIds.findIndex(e => { return testCategoryId && e.pocId == selectedPoc.pocId });
        this.onDepartmentSelect()
    }
    searchTests(searchKeyword) {
        this.searchKeyword = searchKeyword;
        this.serviceName = this.searchKeyword;
        if (searchKeyword.length > 2) {
            this.diagnosticsService.getBaseTestList(this.serviceName).then((data) => {
                this.searchTestTotal = data.length;
                this.serviceNameSearchList = data;
                this.commonUtil.sleep(700);
                this.isError = false;
                this.errorMessage = new Array();
                this.showMessage = false;
            });
        }

    }
    getSearchTestName(searchTestName) {
        for (let i = 0; i < this.serviceNameSearchList.length; i++) {
            if (searchTestName.serviceName == this.serviceNameSearchList[i].serviceName)
                this.selectedTest = this.serviceNameSearchList[i];
            this.selectedTestIndex = this.testCategoryIds.findIndex(e => { return e.name == this.selectedTest.categoryName });
            this.selectedCategoryIndex1 = this.selectedCategory.subServiceList.findIndex(e => { return e.categoryName == this.selectedTest.departmentName1 })
            this.selectedCategoryIndex2 = this.selectedCategory.subServiceList.findIndex(e => { return e.categoryName == this.selectedTest.departmentName2 })
            this.selectedCategoryIndex3 = this.selectedCategory.subServiceList.findIndex(e => { return e.categoryName == this.selectedTest.departmentName3 })
            this.selectedCategoryIndex4 = this.selectedCategory.subServiceList.findIndex(e => { return e.categoryName == this.selectedTest.departmentName4 })
            console.log("this.selectedTest" + JSON.stringify(this.selectedTest))
        }

        this.investigationDetails = new InvestigationDetails();
        this.investigationDetails.serviceName = this.selectedTest.serviceName;
        this.searchKeyword = this.selectedTest.serviceName;
        this.onDepartmentSelect();
    }
    applyTests(type) {
        if (type == 'selectedTest.homeCollections') {
            this.selectedTest.homeCollections = 0
        } else {
            this.selectedTest.homeCollections = 1
        }

    }
    addApplyButton() {
        if (this.selectedTest.displayDescriptionList) {
            this.setdisplayDescriptionList();
        } else {
            let descDetails = new Array<DisplayDescription>();
            let content = new Array<String>();
            let details = new DisplayDescription();
            details.content = content;
            descDetails.push(details);
         
            let displayDescription: DisplayDescription = new DisplayDescription();
            displayDescription.descDetails = descDetails;
            this.displayDescriptionList.push(displayDescription);

        }
    }
    addApplyButton1(index) {
        if (
            // this.displayDescriptionList.length > 0 &&
            this.displayDescriptionList[0].title != "" &&
            this.displayDescriptionList[0].title != undefined &&
            this.displayDescriptionList[0].title != null
        ) {
            let content: string;
            this.displayDescriptionList[index].descDetails[0].content.push(content);
        }
        //  else {
        //     let content: string;
        //     this.displayDescriptionList[0].descDetails = new Array();
        //     let description = new DisplayDescription();
        //     this.displayDescriptionList[0].descDetails.push(description);
        //     this.displayDescriptionList[0].descDetails[0].content = new Array<string>();
        //     this.displayDescriptionList[0].descDetails[0].content.push(content);
        // }
    }

    removeclick(i: number): void {
        this.displayDescriptionList.splice(i, 1);
    }

    removeclickList(j: number): void {
        this.displayDescriptionList[0].descDetails[0].content.splice(j, 1);
    }
    setdisplayDescriptionList() {
        this.displayDescriptionList = this.investigationDetails.displayDescriptionList = new Array();
        let displayDescription: DisplayDescription = new DisplayDescription();
        this.selectedTest.displayDescriptionList.push(displayDescription);
        this.displayDescriptionList = this.selectedTest.displayDescriptionList;
        console.log("this.displayDescriptionList" + JSON.stringify(this.displayDescriptionList))
    }

    addApplyNoteButton() {
        if (this.selectedTest.note) {
            this.setdisplayNoteList();
        } else {
            let displayNote: SymptomNote = new SymptomNote();
            this.displayNoteList.push(displayNote);

        }
    }
    setdisplayNoteList() {
        this.displayNoteList = this.investigationDetails.note = new Array();
        let displayDescription: SymptomNote = new SymptomNote();
        this.selectedTest.note.push(displayDescription);
        this.displayNoteList = this.selectedTest.note;
    }
    removeNoteclick(i: number): void {
        this.displayNoteList.splice(i, 1);
    }
    onDepartmentSelect() {
        this.brandId = this.authService.userAuth.brandId;
        this.homeCollections = false;
        this.diagnosticsService.getTestTypeCategory(this.brandId, this.homeCollections).then(response => {
            this.departmentCategory = response.length;
            this.categoryNameList = response;
            for (let i = 0; i < this.categoryNameList.length; i++) {
                this.selectedCategory = this.categoryNameList[i]
            }
            // let content: string;
            // this.categoryNameList[index].descDetails[0].content.push(content);

        })
    }
    onTestSelectChange(index: number): void {
        this.testCategoryId = this.testCategoryIds[index].id;
        this.testCategoryName = this.testCategoryIds[index].name;
        this.saveTestCreation;
    }
    onDepartmentSelectChange1(index: number): void {
        if (this.selectedCategory.subServiceList[index - 1] != undefined || this.selectedCategory.subServiceList[index - 1] != null) {
            this.selectedChangeCategory.departmentId1 = this.selectedCategory.subServiceList[index - 1].categoryId;
            this.selectedChangeCategory.departmentName1 = this.selectedCategory.subServiceList[index - 1].categoryName;
        }
        this.saveTestCreation;
    }

    onDepartmentSelectChange2(index: number): void {
        if (this.selectedCategory.subServiceList[index - 1] != undefined || this.selectedCategory.subServiceList[index - 1] != null) {
            this.selectedChangeCategory.departmentId2 = this.selectedCategory.subServiceList[index - 1].categoryId;
            this.selectedChangeCategory.departmentName2 = this.selectedCategory.subServiceList[index - 1].categoryName;
        }
        this.saveTestCreation;
    }
    onDepartmentSelectChange3(index: number): void {
        if (this.selectedCategory.subServiceList[index - 1] != undefined || this.selectedCategory.subServiceList[index - 1] != null) {
            this.selectedChangeCategory.departmentId3 = this.selectedCategory.subServiceList[index - 1].categoryId;
            this.selectedChangeCategory.departmentName3 = this.selectedCategory.subServiceList[index - 1].categoryName;
        }
        this.saveTestCreation;
    }
    onDepartmentSelectChange4(index: number): void {
        if (this.selectedCategory.subServiceList[index - 1] != undefined || this.selectedCategory.subServiceList[index - 1] != null) {
            this.selectedChangeCategory.departmentId4 = this.selectedCategory.subServiceList[index - 1].categoryId;
            this.selectedChangeCategory.departmentName4 = this.selectedCategory.subServiceList[index - 1].categoryName;
        }
        this.saveTestCreation;

    }

    saveTestCreation(): void {
        if (this.serviceName == undefined || this.serviceName == null) {
            this.isErrorTest = true;
            this.errorMessageTest = new Array();
            this.errorMessageTest[0] = "Please enter serviceName";
            this.showMessageTest = true;
            return;
        }
        if (this.selectedTest.displayName == undefined || this.selectedTest.displayName == null) {
            this.isErrorTest = true;
            this.errorMessageTest = new Array();
            this.errorMessageTest[0] = "Please enter displayName";
            this.showMessageTest = true;
            return;
        }
        if ((this.testCategoryName == undefined || this.testCategoryName == null) && (this.selectedTest.categoryName == undefined || this.selectedTest.categoryName == null)) {
            this.isErrorTest = true;
            this.errorMessageTest = new Array();
            this.errorMessageTest[0] = "Please enter testCategory";
            this.showMessageTest = true;
            return;
        }
        this.spinnerService.start();
        let testDetails: DiagnosticsServicePriceDetail = new DiagnosticsServicePriceDetail();
        testDetails.serviceName = this.serviceName;
        testDetails.serviceId = this.selectedTest.serviceId;
        testDetails.displayName = this.selectedTest.displayName;
        testDetails.description = this.selectedTest.description;
        testDetails.homeCollections = this.selectedTest.homeCollections;
        testDetails.precaution = this.selectedTest.precaution;
        testDetails.displayDescriptionList = this.displayDescriptionList;
        testDetails.note = this.displayNoteList;
        testDetails.referenceId = this.selectedTest.referenceId;
        testDetails.sample = this.selectedTest.sample;
        testDetails.methodology = this.selectedTest.methodology;
        testDetails.tat = this.selectedTest.tat;
        testDetails.tags = this.selectedTest.tags;
        if (this.testCategoryId == undefined || this.testCategoryId == null) {
            testDetails.categoryId = this.selectedTest.categoryId;
            testDetails.categoryName = this.selectedTest.categoryName;
        }
        if (this.testCategoryId != undefined || this.testCategoryId != null) {
            testDetails.categoryId = this.testCategoryId;
            testDetails.categoryName = this.testCategoryName;
        }

        testDetails.departmentId1 = this.selectedChangeCategory.departmentId1;
        testDetails.departmentName1 = this.selectedChangeCategory.departmentName1;
        testDetails.departmentId2 = this.selectedChangeCategory.departmentId2;
        testDetails.departmentName2 = this.selectedChangeCategory.departmentName2;
        testDetails.departmentId3 = this.selectedChangeCategory.departmentId3;
        testDetails.departmentName3 = this.selectedChangeCategory.departmentName3;
        testDetails.departmentId4 = this.selectedChangeCategory.departmentId4;
        testDetails.departmentName4 = this.selectedChangeCategory.departmentName4;
        // this.testCategoryIds.forEach(e => {
        //     testDetails.categoryId = e.id;
        //     testDetails.categoryName = e.name;
        // })
        console.log("testDetails" + JSON.stringify(testDetails))
        this.diagnosticsService.updatebasetest(testDetails).then(response => {
            this.upDateList = response
            this.spinnerService.stop();
            if (response.statusCode == 200) {
                alert(response.statusMessage);
                location.reload();
            }
        })



    }

    updatesCancel() {
        this.spinnerService.start();
        alert("Add And Update Test Cencel");
        this.spinnerService.stop();
        location.reload();

    }
}