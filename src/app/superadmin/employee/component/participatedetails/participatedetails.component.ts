import { CryptoUtil } from './../../../../auth/util/cryptoutil';
import { DoctorDetails } from './../../../../model/employee/doctordetails';
import { AuthService } from './../../../../auth/auth.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { PocPackages } from '../../../../model/employee/pocpackages';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { EmployeeService } from '../../employee.service';
import { DoctorParticipationData } from '../../../../model/employee/doctorparticipationdata';
import { DoctorServiceDetail } from '../../../../model/employee/doctorServiceDetail';
import { HSMargin } from '../../../../model/poc/margin';
import { SuperAdminService } from '../../../superadmin.service';
import { HealthPackage } from '../../../../model/package/healthPackage';
import { EmployeePocMapping } from '../../../../model/employee/employeepocmapping';
import { PocSearch } from '../../../../model/poc/pocSearch';
import { Config } from '../../../../base/config';

@Component({
    selector: 'participatedetails',
    templateUrl: './participatedetails.template.html',
    styleUrls: ['./participatedetails.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class EmployeeParticipatedetailsComponent implements OnInit {
    doctorDetail: DoctorDetails = new DoctorDetails;
    participationData: DoctorParticipationData = new DoctorParticipationData();
    pocPackages: PocPackages = new PocPackages;
    employeePocMargin: HSMargin = new HSMargin();
    nopdfHeader: boolean = false;
    digitalPrescription: boolean = false;
    nopackages: boolean = true;
    isDigiPercent: boolean = true;
    isVideoPercent: boolean = true;
    isHomePercent: boolean = true;
    ishsPercent: boolean = true;
    otherDiscountAmountPer: number = 0;
    otherDiscountPackage: number = 0;
    isPackagePercent: boolean = true;
    packagesList = new Array<number>();
    selectedPackageNameList = new Array<string>();
    packages: any;
    pocId: number;
    isPoc: boolean = false;
    selectedPackageIdList = new Array<number>();
    overridePdfHeader: boolean = true;
    isError: boolean = false;
    pocListIndexData: number;
    isVideoLaterPercent: boolean = true;
    errorMessage: any[];
    showMessage: boolean;
    isPhysicallyPercent: boolean = true;
    isPharmacyPercent: boolean = true;
    isDiagnosticsPercent: boolean = true;
    isInvestigationPercent: boolean = true;
    isImmunizationPercent: boolean = true;
    isWelnessPercent: boolean = true;
    isProcedurePercent: boolean = true;
    isReferralPercent: boolean = true;
    tempSelectedName: string;
    selectedPoc: EmployeePocMapping;
    checkedPackagelist2 = new Array();
    serviceFeeType: string;
    packageList: HealthPackage[] = new Array<HealthPackage>();
    tempDoctorDetail: DoctorDetails;
    pocPackageIdList: number[] = new Array();
    constructor(config: AppConfig, private auth: AuthService, private superAdminService: SuperAdminService, private router: Router, private hsLocalStorage: HsLocalStorage, private employeeService: EmployeeService) {
        if (this.employeeService.isEmployeeModify == undefined) {
            employeeService.getDetails();
        }
        let cryptoUtil = new CryptoUtil();
        let xtemp = cryptoUtil.decryptData(localStorage.getItem('employeeUpdateDetails'));
        if (xtemp) {
            let data = JSON.parse(xtemp);
            employeeService.pageNo = data.pageNo;
        }
    }
    ngOnInit() {

        /**Collecting Basic Data */
        this.doctorDetail = this.employeeService.doctorDetail;
        this.tempDoctorDetail = JSON.parse(JSON.stringify(this.doctorDetail));
        this.pocListIndexData = this.employeeService.selectedPocIndex;
        this.selectedPoc = this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData];
        // this.getPocDetails(this.selectedPoc.pocId);
        let participateData = this.doctorDetail.employeePocMappingList[this.pocListIndexData].participationSettings;
        this.participationData = participateData ? participateData : new DoctorParticipationData();
        let marginData = this.doctorDetail.employeePocMappingList[this.pocListIndexData].margin;
        this.employeePocMargin = marginData ? marginData : new HSMargin();

        //selected Packages
        // this.checkedPackagelist2.push.apply(this.checkedPackagelist2, this.participationData.packageIdList);
        // this.selectedPackageIdList = this.checkedPackagelist2;
        //setting Doctor details
        this.doctorDetail.type = this.employeeService.doctorDetail.type;
        this.participationData.canEditPackages ? this.editPackage(0) : this.editPackage(1);
        this.isDigiPercent = this.employeePocMargin.digiConsultationMarginFee && this.employeePocMargin.digiConsultationMarginFee != 0 ? false : true;
        this.isVideoPercent = this.employeePocMargin.videoConsultationMarginFee && this.employeePocMargin.videoConsultationMarginFee != 0 ? false : true;
        this.isVideoLaterPercent = this.employeePocMargin.videoLaterConsultationMarginFee && this.employeePocMargin.videoLaterConsultationMarginFee != 0 ? false : true;
        this.isHomePercent = this.employeePocMargin.homeConsultationMarginFee && this.employeePocMargin.homeConsultationMarginFee != 0 ? false : true;
        this.isPhysicallyPercent = this.employeePocMargin.walkinConsultationMarginFee && this.employeePocMargin.walkinConsultationMarginFee != 0 ? false : true;
        this.isPharmacyPercent = this.employeePocMargin.homePharmacyMarginFee && this.employeePocMargin.homePharmacyMarginFee != 0 ? false : true;
        this.isDiagnosticsPercent = this.employeePocMargin.homeCollectionInvestigationMarginFee && this.employeePocMargin.homeCollectionInvestigationMarginFee != 0 ? false : true;
        //this.isInvestigationPercent = this.employeePocMargin.homeCollectionInvestigationMarginFee && this.employeePocMargin.homeCollectionInvestigationMarginFee != 0 ? false : true;
        this.isImmunizationPercent = this.employeePocMargin.immunizationMarginFee && this.employeePocMargin.immunizationMarginFee != 0 ? false : true;
        this.isWelnessPercent = this.employeePocMargin.welnessMarginFee && this.employeePocMargin.welnessMarginFee != 0 ? false : true;
        this.isProcedurePercent = this.employeePocMargin.procedureMarginFee && this.employeePocMargin.procedureMarginFee != 0 ? false : true;
        this.isReferralPercent = this.employeePocMargin.otherReferralMarginFee && this.employeePocMargin.otherReferralMarginFee != 0 ? false : true;
        this.ishsPercent = this.employeePocMargin.defaultMarginFee && this.employeePocMargin.defaultMarginFee != 0 ? false : true;
        this.isPackagePercent = this.employeePocMargin.packageMarginFee && this.employeePocMargin.packageMarginFee != 0 ? false : true;
        if (this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocDetail
            && this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocDetail.agreement
            && this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocDetail.agreement.packageIdList) { this.pocPackageIdList = this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocDetail.agreement.packageIdList; }
        this.updatePoc();

    }
    participatePercetage(value, variable) {
        value[variable] = value[variable] && value[variable] > 100 ? 100 : value[variable] < 0 ? 0 : value[variable];
    }
    getPocDetails(pocId) {
        let pocServiceList = new Array<DoctorServiceDetail>();
        let request: PocSearch = new PocSearch;
        request.pocIdList = [pocId];
        this.superAdminService.getPocDetails(request).then(poclist => {
            let service: any;
            this.doctorDetail.serviceList.forEach(e => {
                if (poclist.length > 0) {
                    service = poclist[0].serviceList.filter(service => { return e.serviceId == service.serviceId; })
                    console.log(JSON.stringify(service))
                    pocServiceList.push.apply(pocServiceList, service);
                }
            })
        }).then(() => {
            // console.log('datalistx1==>' + JSON.stringify(pocServiceList));
            let dataServiceList = this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData].serviceList;
            // console.log('datalistx1==>dataServiceList' + JSON.stringify(dataServiceList));
            pocServiceList.forEach(data => {
                let index = dataServiceList.findIndex(x => { return x.serviceId == data.serviceId });
                if (index == -1) {
                    dataServiceList.push(data);
                }
            });
            let indexList = new Array();
            dataServiceList.forEach((data, i) => {
                let index = pocServiceList.findIndex(x => { return x.serviceId == data.serviceId });
                if (index == -1) {
                    indexList.push(i);
                }
            });
            indexList.forEach((xh, i) => {
                dataServiceList.splice(xh - i, 1)
            });
            this.doctorDetail = this.employeeService.doctorDetail;
            if (dataServiceList.length <= 0) {
                alert('This Poc Don`t has access for any services');
                window.history.back();
            }
            // console.log('datalist==>>' + JSON.stringify(dataServiceList));
            // console.log('datalist2==>>' + JSON.stringify(this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData].serviceList));
        });
    }

    changeData(type, isValue?) {
        let dataServiceList = this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData].serviceList;
        if (type == 'overridePdfHeader') {
            this.participationData.overridePdfHeader = !this.participationData.overridePdfHeader;
        }
        if (type == 'enableNotification') {
            this.participationData.enableNotification = !this.participationData.enableNotification;
        }
        else if (type == 'DigitalPrescription') {
            if (this.participationData.digitalPrescriptionAvailable) {
                dataServiceList.forEach(d => {
                    delete d.digiConsultationFee;
                    delete d.videoNowConsultationFee;
                    delete d.videoLaterConsultationFee;
                });
                delete this.employeePocMargin.digiConsultationMargin;
                delete this.employeePocMargin.digiConsultationMarginFee;
                delete this.employeePocMargin.videoConsultationMargin;
                delete this.employeePocMargin.videoConsultationMarginFee;
                delete this.employeePocMargin.videoLaterConsultationMargin;
                delete this.employeePocMargin.videoLaterConsultationMarginFee;
            }
            this.participationData.digitalPrescriptionAvailable = !this.participationData.digitalPrescriptionAvailable;
        }
        else if (type == 'digiroomPrescription') {
            if (this.participationData.doctorDigiAvailable) {
                dataServiceList.forEach(d => {
                    delete d.digiConsultationFee;
                });
                delete this.employeePocMargin.digiConsultationMargin;
                delete this.employeePocMargin.digiConsultationMarginFee;
            }
            this.participationData.doctorDigiAvailable = !this.participationData.doctorDigiAvailable;
        }
        else if (type == 'VideoNowPrescription') {
            if (this.participationData.doctorVideoNowAvailable) {
                dataServiceList.forEach(d => {
                    delete d.videoNowConsultationFee;
                });
                delete this.employeePocMargin.videoConsultationMargin;
                delete this.employeePocMargin.videoConsultationMarginFee;
            }
            this.participationData.doctorVideoNowAvailable = !this.participationData.doctorVideoNowAvailable;
        }
        else if (type == 'VideoLaterPrescription') {
            if (this.participationData.doctorVideoLaterAvailable) {
                dataServiceList.forEach(d => {
                    delete d.videoLaterConsultationFee;
                });
                delete this.employeePocMargin.videoLaterConsultationMargin;
                delete this.employeePocMargin.videoLaterConsultationMarginFee;
            }
            this.participationData.doctorVideoLaterAvailable = !this.participationData.doctorVideoLaterAvailable;
        }
        else if (type == 'homePrescription') {
            if (this.participationData.homeConsultationAvailable) {
                dataServiceList.forEach(d => {
                    delete d.homeConsultationFee;
                });
                delete this.employeePocMargin.homeConsultationMargin;
                delete this.employeePocMargin.homeConsultationMarginFee;
            }
            this.participationData.homeConsultationAvailable = !this.participationData.homeConsultationAvailable;
        }
        else if (type == 'physicalConsultation') {
            if (this.participationData.doctorPhysicallyAvailable) {
                dataServiceList.forEach(d => {
                    delete d.walkinConsultationFee;
                });
                delete this.employeePocMargin.walkinConsultationMargin;
                delete this.employeePocMargin.walkinConsultationMarginFee;
            }
            this.participationData.doctorPhysicallyAvailable = !this.participationData.doctorPhysicallyAvailable;
        }
        else if (type == 'packageConsultation') {
            this.participationData.participateInPackages = !this.participationData.participateInPackages;
            this.participationData.participateInPackages ? this.packageSelection(0) : this.packageSelection(1);
        }
    }
    onlyDecimalValueTillTwoDigits(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 46 && evt.srcElement.value.split('.').length > 1) {
            return false;
        }
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        var velement = evt.target || evt.srcElement;
        var fstpart_val = velement.value;
        var fstpart = velement.value.length;
        if (fstpart.length == 2) {
            return false;
        }
        var parts = velement.value.split('.');
        if (parts.length == 2 && parts[0].length <= 2 && parts[1].length >= 2) {
            return false;
        }
        if (parts[0].length >= 3) {
            return false;
        }
        return true;
    }

    editHeader(index: number) {
        console.log('index' + index);
        if (index == 0) {
            this.participationData.overridePdfHeader = true;
            this.nopdfHeader = false;
        }
        else {
            this.participationData.overridePdfHeader = false;
            this.nopdfHeader = true;
        }
    }
    applyHSDiscount(event: any) {
        if (event == null || event == '') {
            event = 0;
        } else if (event < 0 || event > 100) {
            this.otherDiscountAmountPer = event;
            this.employeePocMargin.defaultMargin = 100;
            return;
        }
        this.otherDiscountAmountPer = event;
        this.otherDiscountAmountPer = parseFloat(this.otherDiscountAmountPer + "");
    }
    applyHSpackageDiscount(event: any) {
        if (event == null || event == '') {
            event = 0;
        } else if (event < 0 || event > 100) {
            this.otherDiscountPackage = event;
            this.employeePocMargin.packageMargin = 100;
            return;
        }
        this.otherDiscountPackage = event;
        this.otherDiscountPackage = parseFloat(this.otherDiscountPackage + "");
    }

    packageSelection(index: number) {
        if (index == 0) {
            this.participationData.participateInPackages = true;
            // this.hsPackage = true;
            // this.nopackage = false;
        }
        else {
            this.participationData.participateInPackages = false;
            // this.hsPackage = false;
            // this.nopackage = true;
            this.employeePocMargin.packageMargin = undefined;
        }
    }
    updatePackageList() {
        // if (this.selectedPackageNameList.length == 0) {
        //     let obj = this.packagesList.find(pack => pack === this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocId);
        //     this.packagesList.splice(this.packages.indexOf(obj), 1);
        // }
        // else {
        //     let pocpackages: PocPackages = new PocPackages();
        //     pocpackages.pocId = this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocId;
        //     pocpackages.pocName = this.doctorDetail.employeePocMappingList[this.pocListIndexData].pocName;
        //     // this.pocNameList.push(pocpackages.pocName);
        //     //note and check isPoc needed or not ?
        //     if (this.isPoc == true) {
        //         if (this.packages) {
        //             let obj = this.packages.find(o => o.pocId === pocpackages.pocId);
        //             this.packagesList.splice(this.packages.indexOf(obj), 1);
        //         }
        //     }
        //     console.log("gdcfjfsdjkdjsdfs" + JSON.stringify(this.doctorDetail.employeePocMappingList[this.pocListIndexData]))
        // }

    }

    editPackage(index: number) {
        if (index == 0) {
            this.participationData.canEditPackages = true;
            this.nopackages = false;
        }
        else {
            this.participationData.canEditPackages = false;
            this.nopackages = true;
        }
    }
    selectPhysicallyConsultation(index: number) {
        if (index == 0) {
            this.participationData.doctorPhysicallyAvailable = true;
            // this.hasPhysicallyConsultation = true;
            // this.noPhysicallyConsultation = false;
        }
        else {
            this.participationData.doctorPhysicallyAvailable = false;
            // this.hasPhysicallyConsultation = false;
            // this.noPhysicallyConsultation = true;
            this.employeePocMargin.walkinConsultationMarginFee = 0
        }
    }
    validateNumberInputOnly(event) {
        var key = window.event ? event.keyCode : event.which;
        if (event.keyCode == 8 || event.keyCode == 46
            || event.keyCode == 37 || event.keyCode == 39) {
            return true;
        }
        else if (key < 48 || key > 57) {
            return false;
        }
        else return true;
    }
    updatePoc() {
        // this.pocName = this.selectedPoc.pocName;
        this.pocId = this.selectedPoc.pocId;
        this.getallpackages();
    }
    getallpackages(): void {
        this.superAdminService.getallpackages().then(response => {
            this.packageList = response;
            if (this.doctorDetail.employeePocMappingList[this.pocListIndexData].participationSettings.packageIdList != undefined
                && this.doctorDetail.employeePocMappingList[this.pocListIndexData].participationSettings.packageIdList.length > 0) {
                this.packages = this.doctorDetail.employeePocMappingList[this.pocListIndexData].participationSettings.packageIdList;
            }
            this.selectedPackageNameList = new Array();
            this.selectedPackageIdList = new Array();
            this.packageList.forEach((ele, packI) => {
                if (this.packages)
                    this.packages.forEach(element => {
                        if (element === ele.packageId) {
                            // pocObj = element.participationSettings.packageIdList;
                            this.selectedPackageNameList.push(ele.name);
                            this.selectedPackageIdList.push(ele.packageId);
                            this.checkedPackagelist2 = this.selectedPackageIdList;
                        }
                    });

                if (this.pocPackageIdList.includes(ele.packageId) && !this.checkedPackagelist2.includes(ele.packageId)) {
                    if (!this.selectedPackageNameList.includes(ele.name))
                        this.selectedPackageNameList.push(ele.name);
                    this.checkedPackagelist2.push(ele.packageId)
                    this.selectedPackageIdList = this.checkedPackagelist2;
                }
            });
            this.participationData.packageIdList = this.selectedPackageIdList;
        });

    }
    onValueChecked(selectedpackage, index: number): void {
        if (!this.participationData.packageIdList || !this.participationData.packageNameList) {
            this.participationData.packageIdList = new Array();
            this.participationData.packageNameList = new Array();
        }
        if ((<any>$("#" + index + ":checked")).length > 0) {
            this.selectedPackageNameList.push(selectedpackage.name);
            this.selectedPackageIdList.push(selectedpackage.packageId);

        } else {
            var index = this.selectedPackageNameList.findIndex(pac => { return pac == selectedpackage.name });
            this.selectedPackageNameList.splice(index, 1);
            this.selectedPackageIdList.splice(index, 1);
        }
        this.participationData.packageIdList = this.checkedPackagelist2 = this.selectedPackageIdList
        this.participationData.packageNameList = this.selectedPackageNameList;
    }
    checkedSelectedPackages() {
        setTimeout(() => {
            console.log(JSON.stringify(this.checkedPackagelist2) + "packagelist====>>>>" + JSON.stringify(this.packageList));

            this.packageList.forEach((element, i) => {
                this.checkedPackagelist2.forEach(e => {
                    if (e == element.packageId) {
                        $("#" + i).prop('checked', true);
                    }
                });
                if (this.pocPackageIdList.includes(element.packageId)) {
                    $("#" + i).prop('checked', true);
                    $("#" + i).attr('disabled', 'disabled');
                    $(".packCheck" + i).addClass('slot-disabled');
                }
            })
        }, 100);

    }
    selectSpecialize(value, type) {
        this.tempSelectedName = value;
        switch (type) {
            case 0:
                this.serviceFeeType = 'digiConsultationFee';
                break;
            case 1:
                this.serviceFeeType = 'videoNowConsultationFee';
                break;
            case 2:
                this.serviceFeeType = 'videoLaterConsultationFee';
                break;
            case 3:
                this.serviceFeeType = 'homeConsultationFee';
                break;
            case 4:
                this.serviceFeeType = 'walkinConsultationFee';
                break;

            default:
                break;
        }
    }
    closePopUp() {
        this.packagesList = new Array();
    }

    doneParticipatedPoc() {
        this.isError = false;
        if (this.doctorDetail.employeePocMappingList[this.pocListIndexData].serviceList != undefined) {
            this.doctorDetail.employeePocMappingList[this.pocListIndexData].participationSettings = this.participationData;
            this.doctorDetail.employeePocMappingList[this.pocListIndexData].margin = this.doctorDetail.defaultMargin = this.employeePocMargin;
            this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData] = this.doctorDetail.employeePocMappingList[this.pocListIndexData];
            console.log("fdsfsdfhdfsk" + JSON.stringify(this.employeeService.doctorDetail.employeePocMappingList[this.pocListIndexData]));
        }
        if (this.doctorDetail.serviceList != undefined && !Config.portal.specialFeatures.enableZeroPriceBilling) {
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
            this.doctorDetail.employeePocMappingList[this.pocListIndexData].serviceList.forEach(e => {
                if (this.participationData.doctorDigiAvailable && (!e.digiConsultationFee || e.digiConsultationFee <= 0)) {
                    this.isError = true;
                    this.errorMessage.push("Please Enter digiConsultation Fee For All services  ");
                }
                if (this.participationData.homeConsultationAvailable && (!e.homeConsultationFee || e.homeConsultationFee <= 0)) {
                    this.isError = true;
                    this.errorMessage.push("Please Enter homeConsultation Fee For All services  ");
                }
                if (this.participationData.doctorVideoLaterAvailable && (!e.videoLaterConsultationFee || e.videoLaterConsultationFee <= 0)) {
                    this.isError = true;
                    this.errorMessage.push("Please Enter videoLaterConsultation Fee For All services  ");
                }
                if (this.participationData.doctorVideoNowAvailable && (!e.videoNowConsultationFee || e.videoNowConsultationFee <= 0)) {
                    this.isError = true;
                    this.errorMessage.push("Please Enter videoNowConsultation Fee For All services  ");
                }
                if (this.participationData.doctorPhysicallyAvailable && (!e.walkinConsultationFee || e.walkinConsultationFee <= 0)) {
                    this.isError = true;
                    this.errorMessage.push("Please Enter walkinConsultation Fee For All services  ");
                }
            });
        }
        if (this.isError == false) {
            this.employeeService.setDetail();
            // this.router.navigate(['/app/master/employee/employeeroles']);
            window.history.back();
        } else {
            this.errorMessage = Array.from(new Set(this.errorMessage).values());;
            this.showMessage = true;
        }

    }
    goBack() {
        this.employeeService.doctorDetail = this.tempDoctorDetail;
        window.history.back();
    }
    deleteVar(margin, varName) {
        delete margin[varName];
    }
}