import { ToasterService } from './../layout/toaster/toaster.service';
import { SpinnerService } from './../layout/widget/spinner/spinner.service';
import { PocAdviseData } from './../model/poc/poc-advise-data';
import { EmployeePocMapping } from './../model/employee/employeepocmapping';
import { Injectable } from '@angular/core';
import { Config } from '../base/config';
import { HsLocalStorage } from '../base/hsLocalStorage.service';
import { HttpService } from "../base/http.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { Login } from "../login/model/login";
import { LoginResponse } from "../login/model/loginresponse";
import { OTPVerification } from "../login/model/otpverification";
import { UpdatedPassword } from "../login/model/updatepassword";
import { PocDetail } from '../model/poc/pocDetails';
import { AppConstants } from './../base/appconstants';
import { AccessRights } from "./../constants/auth/access-rights";
import { Permissions } from "./../constants/auth/permissions";
import { Auth } from "./../model/auth/auth";
import { UserPermissions } from "./../model/auth/user-permissions";
import { City } from './../model/base/city';
import { Locality } from './../model/base/locality';
import { State } from './../model/base/state';
import { AccessPermission } from "./../model/employee/accesspermission";
import { Doctor } from './../model/employee/doctor';
import { RoleBasedAddress } from "./../model/employee/roleBasedAddress";
import { GetTimeSlot } from './../model/reception/gettimeslot';
import { CryptoUtil } from './util/cryptoutil';
import { Address } from '../model/poc/address';
import { BaseResponse } from '../model/base/baseresponse';
import { SystemConstants } from '../constants/config/systemconstants';




@Injectable()
export class AuthService {

    loginResponse: LoginResponse;
    userAuth: Auth;
    userNavArray: UserPermissions[];
    employeeDetails: Doctor;
    selectedPOCMapping: EmployeePocMapping;
    selectedPocDetails: PocDetail;
    statesAndCities: State[];
    getTimeSlot: GetTimeSlot = new GetTimeSlot();
    routeNavNumber: number; // 0= 1 POC, 1 = more than 1 poc ,2= new user and saas s
    employeePocMappingList: any;
    pocList: Array<PocAdviseData>;
    authserve: any;
    selectedRole: UserPermissions;
    pocIds: Array<number>;
    roleBasedAddressList: Array<Address>;
    isCorporateAdmin: boolean = false;
    configportal = Config.portal;
    checkHomeConsultationForDoc: any;
    private preventNavigation: boolean = false;
    disableImmunization: boolean = false;
    procedurePrescriptionLabel: string = null;
    admissionNotePrescriptionLabel: string = null;


    constructor(private httpService: HttpService, private spinner: SpinnerService, private toast: ToasterService,
        private urlStringFormatter: URLStringFormatter, private hsLocalStorage: HsLocalStorage) {
        this.userAuth = new Auth();
        this.userNavArray = new Array<UserPermissions>();
        this.getFromLocalStore();
        this.disableImmunization = Config.portal.doctorOptions && Config.portal.doctorOptions.disableImmunization ? Config.portal.doctorOptions.disableImmunization : false;
        this.procedurePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.procedureLabel && Config.portal.doctorOptions.prescriptionLabels.procedureLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.procedureLabel : null;
        this.admissionNotePrescriptionLabel = Config.portal.doctorOptions && Config.portal.doctorOptions.prescriptionLabels && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel && Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel.length > 0 ? Config.portal.doctorOptions.prescriptionLabels.admissionNoteLabel : null;
    }

    login(loginVo: Login, isCorporateLogin: boolean): Promise<boolean> {

        let validCredentials: boolean = false;
        let cryptoUtil = new CryptoUtil();
        this.isCorporateAdmin = isCorporateLogin;

        return this.httpService.httpPostPromise(this.httpService.getPaths().EMPLOYEE_LOGIN, JSON.stringify(loginVo), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            this.loginResponse = data;

            if (this.loginResponse != null && this.loginResponse.statusCode == 200) {
                validCredentials = true;
                this.employeeDetails = this.loginResponse.employee;
                this.isCorporateAdmin = false;
                if (this.loginResponse != null && this.loginResponse.sessionToken != null) {
                    window.localStorage.setItem("raptor", cryptoUtil.encryptData(this.loginResponse.sessionToken));
                }
                if (this.loginResponse.employee != null && this.loginResponse.employee.superAdmin) {
                    // This block gets called if super admin is logging in
                    this.defineSuperAdminNavigation();
                } else if (isCorporateLogin) {
                    this.isCorporateAdmin = true;
                    //This block gets called if the login is of type business admin
                    this.defineBusinessAdminNavigation();
                } else {
                    //This block gets called if the login is of other types
                    this.defineUserNavigationByPermissions();
                }
                if (this.loginResponse.employee != null && this.loginResponse.employee.addressList != null
                    && this.loginResponse.employee.addressList.length > 0) {
                    // Role based address list
                    this.roleBasedAddressList = this.loginResponse.employee.addressList;
                }
                this.saveToLocalStore();
                this.saveCityAndState();
            }
            return validCredentials;
        }).catch((err) => {
            if (err) {
                validCredentials = false;
                console.log(err);
                throw new Error("Something went wrong. Please try after some time");
            }
            return false;
        });
    }

    getTempUrlFiles(profileId, fileType, fileUUID): Promise<any> {
        // empid = this.loginResponse.employee.empId
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_TEMPURL_PDF, profileId, fileType, fileUUID), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            if (err) {
                console.log(err);
                return err;
            }
        });
    }

    /**
     * This method generates the navigation for the super admin login
     */
    defineSuperAdminNavigation(): void {

        this.userAuth = new Auth();
        this.userAuth.employeeName = (this.loginResponse.employee != null && this.loginResponse.employee.firstName != null ? this.loginResponse.employee.firstName : '') + ' ' + (this.loginResponse.employee.lastName != null ? this.loginResponse.employee.lastName : '');
        this.userAuth.employeeId = this.loginResponse.employee.empId;
        this.userAuth.employeeImageUrl = this.loginResponse.employee.imageUrl;
        this.userAuth.isLoggedIn = true;
        this.userAuth.hasSuperAdminRole = true;
        this.userNavArray = new Array<UserPermissions>();
        if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.adminBrand) {
            var index = this.checkIfParentExists('Brand', 'master/brand', 'brand', 11);
            this.userNavArray[index].subPermissions = new Array();
            this.userNavArray[index].subPermissions.push(new UserPermissions('Manage Brands', 'master/brand', true, Permissions.BrandAdmin, 2, 'brand', 1));
        }
        index = this.checkIfParentExists('POC', 'master/poc', 'poclist', 12);
        this.userNavArray[index].subPermissions = new Array();
        this.userNavArray[index].subPermissions.push(new UserPermissions('POC List', 'master/poc', true, Permissions.POCAdmin, 2, 'poclist', 1));



        index = this.checkIfParentExists('Employees', 'master/employee', 'employees', 13);
        this.userNavArray[index].subPermissions = new Array();
        this.userNavArray[index].subPermissions.push(new UserPermissions('Manage Employees', 'master/employee', true, Permissions.EmployeeAdmin, 2, 'employees', 1));
        if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.adminRoles) {
            index = this.checkIfParentExists('Roles', 'master/roles', 'roles', 14);
            this.userNavArray[index].subPermissions = new Array();
            this.userNavArray[index].subPermissions.push(new UserPermissions('Manage Roles', 'master/roles', true, Permissions.RoleAdmin, 2, 'roles', 1));
        }
        this.routeNavNumber = 0;
    }

    /**
     * This method generates the navigation for the business admin login
     */
    defineBusinessAdminNavigation(): void {
        this.userAuth = new Auth();
        this.userAuth.employeeName = (this.loginResponse.employee != null && this.loginResponse.employee.firstName != null ? this.loginResponse.employee.firstName : '') + ' ' + (this.loginResponse.employee.lastName != null ? this.loginResponse.employee.lastName : '');
        this.userAuth.employeeId = this.loginResponse.employee.empId;
        this.userAuth.employeeImageUrl = this.loginResponse.employee.imageUrl;
        this.userAuth.isLoggedIn = true;
        this.userNavArray = new Array<UserPermissions>();
        this.employeePocMappingList = new Array();
        this.pocIds = new Array<number>();
        let pocList = this.loginResponse.employee.employeePocMappingList;
        let permissionSet = new Set();

        if (this.loginResponse.pocPermissionsList && this.loginResponse.pocPermissionsList.length > 0) {
            for (let j = 0; j < this.loginResponse.pocPermissionsList.length; j++) {
                if (this.loginResponse.pocPermissionsList[j].permissionList && this.loginResponse.pocPermissionsList[j].permissionList.length > 0) {
                    for (let k = 0; k < this.loginResponse.pocPermissionsList[j].permissionList.length; k++) {
                        permissionSet.add(this.loginResponse.pocPermissionsList[j].permissionList[k].permissionId);
                    }
                }
            }
        }

        if (pocList != null && pocList.length >= 1) {
            pocList.forEach(element => {
                this.pocIds.push(element.pocId);
                this.selectedPOCMapping = element;
                this.userAuth.pocId = element.pocId;
                this.employeePocMappingList.push(element);
            });
        }

        let index: number = this.userNavArray.length;
        index = this.checkIfParentExists('Admin', 'finance', 'admin', 9);
        permissionSet.forEach(element => {
            switch (element) {
                case Permissions.POCFinancialReports: {
                    if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                        break;
                    }
                    this.userAuth.hasBusinessAdminRole = true;
                    let subNav = this.getLink('Center Financial Reports', 'admin', 9, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Dashboard', 'finance/poc/dashboard', true, Permissions.POCFinancialReports, 2, 'admin', 1);
                    this.addNavPath(subNav.subPermissions, 'Monthly Financial Statement', 'finance/poc/monthlyreport', true, Permissions.POCFinancialReports, 2, 'admin', 2);
                    this.addNavPath(subNav.subPermissions, 'Detailed Transaction Reports', 'finance/poc/detailedreport', true, Permissions.POCFinancialReports, 2, 'admin', 3);
                    this.addNavPath(subNav.subPermissions, 'Transfer Price Reports', 'finance/poc/transferprice', true, Permissions.POCFinancialReports, 2, 'admin', 4);
                    break;
                }
                case Permissions.POCBookingReports: {
                    if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                        break;
                    }
                    this.userAuth.hasBusinessAdminRole = true;
                    let subNav = this.getLink('Center Financial Reports', 'admin', 9, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Booking Reports', 'finance/poc/bookingreport', true, Permissions.POCBookingReports, 2, 'admin', 5);
                    break;
                }
                case Permissions.BrandFinancialReports: {
                    let subNav = this.getLink('Brand Financial Reports', 'admin', 9, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Detailed Transaction Reports', 'finance/brand/detailedreport', true, Permissions.BrandFinancialReports, 2, 'admin', 2);
                    if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                        break;
                    }
                    this.addNavPath(subNav.subPermissions, 'Dashboard', 'finance/brand/dashboard', true, Permissions.BrandFinancialReports, 2, 'admin', 1);
                    break;
                }
                case Permissions.CashAccountingReports: {
                    this.userAuth.hasHSBusinessAdminRole = true;
                    let subNav = this.getLink('Brand Accounting Reports', 'admin', 9, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Cash Accounting', 'finance/brand/accounting', true, Permissions.CashAccountingReports, 2, 'admin', 1);
                    this.addNavPath(subNav.subPermissions, 'Manage Community Payments', 'finance/brand/communitypayments', true, Permissions.CashAccountingReports, 2, 'admin', 2);
                    break;
                }
                case Permissions.ReconciliationReports: {
                    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.internalFinanicalReports) {
                        this.userAuth.hasHSBusinessAdminRole = true;
                        let subNav = this.getLink('Platform Financial Reports', 'admin', 9, this.userNavArray[index].subPermissions);
                        this.addNavPath(subNav.subPermissions, 'Brand Reports', 'finance/platform/brandreport', true, Permissions.ReconciliationReports, 2, 'admin', 1);
                        this.addNavPath(subNav.subPermissions, 'Brand Centre Reports', 'finance/platform/brandpocreport', true, Permissions.ReconciliationReports, 2, 'admin', 2);
                        this.addNavPath(subNav.subPermissions, 'Reconciliation Reports', 'finance/platform/reconciliation', true, Permissions.ReconciliationReports, 2, 'admin', 3);
                    }
                    break;
                }
            }
        });


        this.routeNavNumber = 0;
        let cryptoUtil = new CryptoUtil();
        if (this.employeePocMappingList != null) {
            window.localStorage.setItem('pocRolesList', cryptoUtil.encryptData(JSON.stringify(this.employeePocMappingList)));
        }

    }


    logout(): Promise<boolean> {
        return new Promise(resolve => {
            let removedCredentials: boolean = true;
            this.userAuth = new Auth();
            this.userNavArray = new Array<UserPermissions>();
            this.removeFromLocalStore();
            resolve(removedCredentials);
        });
    }

    /**
     * This method generates the navigation for all the partner logins.
     */
    defineUserNavigationByPermissions(): void {
        this.userAuth = new Auth();
        this.userAuth.employeeName = (this.loginResponse.employee != null && this.loginResponse.employee.firstName != null ? this.loginResponse.employee.firstName : '') + ' ' + (this.loginResponse.employee.lastName != null ? this.loginResponse.employee.lastName : '');
        this.userAuth.employeeId = this.loginResponse.employee.empId;
        this.userAuth.employeeImageUrl = this.loginResponse.employee.imageUrl;
        this.userAuth.isLoggedIn = true;
        this.userNavArray = new Array<UserPermissions>();
        this.employeePocMappingList = this.loginResponse.employee.employeePocMappingList;

        let permissionSetList = new Set();

        if (this.loginResponse.pocPermissionsList && this.loginResponse.pocPermissionsList.length > 0) {
            for (let i = 0; i < this.loginResponse.pocPermissionsList.length; i++) {
                if (this.loginResponse.pocPermissionsList[i].permissionList && this.loginResponse.pocPermissionsList[i].permissionList.length > 0) {
                    for (let j = 0; j < this.loginResponse.pocPermissionsList[i].permissionList.length; j++) {
                        permissionSetList.add(this.loginResponse.pocPermissionsList[i].permissionList[j].permissionId);

                    }
                }
            }
        }

        this.pocList = new Array();
        this.employeePocMappingList.forEach(element => {
            let poc: PocAdviseData = new PocAdviseData();
            poc.pocId = element.pocId;
            poc.pocName = element.pocName;
            poc.brandId = element.brandId;
            this.pocList.push(poc);
        });

        if (permissionSetList.has(17) && this.employeeDetails.empPersonalPocInfo.saasSubscriber && this.loginResponse.newUser) {
            console.log(this.employeePocMappingList[0]);
            console.log(JSON.stringify(this.employeePocMappingList[0]));

            this.buildNavBasedOnPOC(0);
            this.routeNavNumber = 2;

        } else if (this.employeePocMappingList != null && this.employeePocMappingList.length == 1) {
            this.buildNavBasedOnPOC(0);
            this.routeNavNumber = 0;
        } else if (this.employeePocMappingList != null && this.employeePocMappingList.length > 1) {
            this.routeNavNumber = 1;
        }
        else {
            this.routeNavNumber = 0;
        }
    }

    buildNavBasedOnPOC(pocPosition: number): void {
        console.log('buildNavBasedOnPOC');
        if (this.hsLocalStorage.getDataEncrypted('pocRolesList')) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            this.employeePocMappingList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pocRolesList')));
        }
        this.selectedPOCMapping = this.employeePocMappingList[pocPosition];
        this.getPOCDetails(this.selectedPOCMapping.pocId);
        this.buildNavigationBasedOnPoc();
    }


    getPOCDetails(pocId: number): Promise<PocDetail> {
        console.log('Getting the POC Details....' + pocId);
        try {
            return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GETPOCDETAILS, pocId + ""), AppConstants.POZ_BASE_URL_INDEX)
                .then((data) => {
                    this.selectedPocDetails = data;
                    if (this.selectedPocDetails != null) {
                        let cryptoUtil: CryptoUtil = new CryptoUtil();
                        window.localStorage.setItem('selectedPocDetails', cryptoUtil.encryptData(JSON.stringify(this.selectedPocDetails)));
                        this.userAuth.selectedPoc = this.selectedPocDetails;
                        this.userAuth.pocName = this.selectedPocDetails.pocName;
                        this.userAuth.pdfHeaderType = this.selectedPocDetails.pdfHeaderType;
                        // this.userAuth.pdfHeaderType = this.selectedPOCMapping.participationSettings && this.selectedPOCMapping.participationSettings.overridePdfHeader ? 0 : 1;

                        console.log(`pdfHeaderType {"normal":${JSON.stringify(this.selectedPocDetails)},"mapping":${JSON.stringify(this.selectedPOCMapping)}}`);
                        this.saveToLocalStore();
                    }
                    return Promise.resolve(this.selectedPocDetails);
                })
        } catch (Error) {
            this.getPOCDetails(pocId);
            console.log('Error occurred before call', Error);
            return Promise.reject(Error);
        }
    }
    clearHasRole() {
        this.userAuth.hasProductDeliveryRole = false;
        this.userAuth.hasCentralProductHomeOrdersRole = false;
        this.userAuth.hasPharmacyRole = false;
        this.userAuth.hasPharmacyReportsRole = false;
        this.userAuth.hasPharmacyHomeOrdersRole = false;
        this.userAuth.hasCentralPharmacyHomeOrdersRole = false;
        this.userAuth.hasDeliveryAgentRole = false;
    }
    buildNavigationBasedOnPoc(): void {

        this.userAuth.pocId = this.selectedPOCMapping.pocId;
        this.userAuth.brandId = this.selectedPOCMapping.brandId;
        let tempPermissions = null;
        this.clearHasRole();
        for (let j = 0; j < this.loginResponse.pocPermissionsList.length; j++) {
            if (+this.loginResponse.pocPermissionsList[j].pocId == +this.userAuth.pocId) {
                tempPermissions = this.loginResponse.pocPermissionsList[j].permissionList;
            }
        }
        if (tempPermissions && tempPermissions.length > 0) {
            this.checkHomeConsultationForDoc = tempPermissions.find(element =>
                element.permissionId == Permissions.HomeCareAppointment
            );

            for (let k = 0; k < tempPermissions.length; k++) {
                if (tempPermissions[k].value > 0) {
                    this.buildNavigation(tempPermissions[k]);
                }
            }
        }
        this.sortNavigation(this.userNavArray);
        this.saveToLocalStore();
    }

    buildNavigation(accessPermission: AccessPermission): void {
        let index: number = this.userNavArray.length;

        switch (accessPermission.permissionId) {
            case Permissions.DoctorPrescription: {
                if (accessPermission.value == 2) {
                    index = this.checkIfParentExists('Doctor', 'doctor', 'doctor', 4);
                    this.userAuth.hasDoctorRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Consultation Queue', 'doctor/queue', true, Permissions.DoctorPrescription, 2, 'doctor', 1);
                    if (this.checkHomeConsultationForDoc && this.checkHomeConsultationForDoc.permissionId == Permissions.HomeCareAppointment) {
                        this.addNavPath(this.userNavArray[index].subPermissions, 'Home Consultation', 'doctor/doctorhomeconsult', true, Permissions.DoctorPrescription, 2, 'doctor', 2);
                    }
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Past Prescriptions', 'doctor/past', true, Permissions.Default, 2, 'doctor', 4);
                    if (Config.portal && Config.portal.doctorOptions && Config.portal.doctorOptions.enableDoctorChat) {
                        this.addNavPath(this.userNavArray[index].subPermissions, 'Chat', 'doctor/chat', true, Permissions.Default, 2, 'doctor', 7);
                    }
                    this.sortNavigation(this.userNavArray[index].subPermissions);
                }
                break;
            };
            case Permissions.PrescriptionDigitizer: {
                index = this.checkIfParentExists('Doctor', 'doctor', 'doctor', 4);
                this.userAuth.hasDigitizationRole = true;
                let subNav = this.getLink('Digitization', 'doctor', 5, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Prescription Expert', 'doctor/prescriptiondigitizationqueue', true, Permissions.PrescriptionDigitizer, 2, 'doctor', 2);
                break;
            };

            case Permissions.PrescriptionDigitizationManager: {
                index = this.checkIfParentExists('Doctor', 'doctor', 'doctor', 4);
                this.userAuth.hasDigitizationRole = true;
                let subNav = this.getLink('Digitization', 'doctor', 5, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Manage Digitization', 'doctor/digitizationmanager', true, Permissions.PrescriptionDigitizationManager, 2, 'doctor', 1);
                break;
            };

            case Permissions.DoctorPreferences: {
                if (accessPermission.value == 2) {
                    index = this.checkIfParentExists('Doctor', 'doctor', 'doctor', 4);
                    this.userAuth.hasDoctorRole = true;
                    let subNav = this.getLink('Saved Favorites', 'doctor', 5, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Prescription Favorites', 'doctor/favorites/prescriptionFav', true, Permissions.DoctorPreferences, 2, 'doctor', 1);
                    this.addNavPath(subNav.subPermissions, 'Packages', 'doctor/favorites/packages', true, Permissions.DoctorPreferences, 2, 'doctor', 2);
                    this.addNavPath(subNav.subPermissions, 'Saved Templates', 'doctor/favorites/templates', true, Permissions.DoctorPreferences, 2, 'doctor', 6);
                    this.addNavPath(subNav.subPermissions, 'Partner Network', 'doctor/favorites/partnerNetwork', true, Permissions.DoctorPreferences, 2, 'doctor', 8);
                    this.addNavPath(subNav.subPermissions, 'Referral Network', 'doctor/favorites/referralNetwork', true, Permissions.DoctorPreferences, 2, 'doctor', 9);
                    this.addNavPath(subNav.subPermissions, 'CDSS options', 'doctor/favorites/cdssOptions', true, Permissions.DoctorPreferences, 2, 'doctor', 10);
                    this.sortNavigation(subNav.subPermissions);
                }
                break;
            };
            case Permissions.POC: {
                if (accessPermission.value == 2) {
                    index = this.checkIfParentExists('POC', 'master/poc/list', 'poclist', 12);
                    this.userAuth.hasPOCAdminRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'POC List', 'master/poc/list', true, Permissions.POC, 2, 'poclist', 1);

                    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.enableSaaSManagement && this.employeeDetails.empPersonalPocInfo.saasSubscriber == true) {
                        this.addNavPath(this.userNavArray[index].subPermissions, 'Manage Subscription', 'master/poc/saas-subscriptions', true, Permissions.POC, 2, 'managesubscriptions', 3);
                    }
                }
                break;
            };
            case Permissions.Employee: {
                index = this.checkIfParentExists('Employees', 'master/employee', 'employees', 13);
                this.userAuth.hasEmployeeAdminRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Manage Employees', 'master/employee', true, Permissions.Employee, 2, 'employees', 1);
                break;
            };

            case Permissions.DiagnosticOrder: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticOrderRole = true;

                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Walk-in Orders', 'diagnostics/orders', true,
                    Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 2);
                this.addNavPath(subNav.subPermissions, 'Update Test Reports', 'diagnostics/advice/walkinreports',
                    true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 5);

                this.sortNavigation(subNav.subPermissions);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticLabReports: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticOrderRole = true;

                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Update Test Reports', 'diagnostics/advice/walkinreports', true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 4);

                this.sortNavigation(subNav.subPermissions);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticAppointments: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReceptionRole = true;

                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Appointments', 'diagnostics/slotbooking/slotqueue', true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 1);
                this.sortNavigation(subNav.subPermissions);
                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticHomeOrder: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsHomeOrdersRole = true;
                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'New Home Orders', 'diagnostics/homeorders/managehomeorderlist',
                    true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 3);
                this.addNavPath(subNav.subPermissions, 'Pending Orders', 'diagnostics/homeorders/homeorderlist',
                    true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 4);
                this.addNavPath(subNav.subPermissions, 'Slot Dashboard', 'diagnostics/homeorders/slotdashboard',
                    true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 6);

                this.sortNavigation(subNav.subPermissions);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralDiagnosticOrders: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsAdmin = true;
                let subNav = this.getLink('Diagnostic Admin', 'diagnostics', 4, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Central Home Orders', 'diagnostics/diagnosticadmin/centralhomeorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 11);
                this.addNavPath(subNav.subPermissions, 'Central Walkin Orders', 'diagnostics/diagnosticadmin/centralwalkinorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 13);
                this.addNavPath(subNav.subPermissions, 'Cancellation Requests', 'diagnostics/diagnosticadmin/cancelledorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 14);
                this.addNavPath(subNav.subPermissions, 'Sample Info Download', 'diagnostics/diagnosticadmin/sampleinfodownload', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 15);
                this.addNavPath(subNav.subPermissions, 'Upload Result Excel', 'diagnostics/diagnosticadmin/testresultupload', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 16);
                this.addNavPath(subNav.subPermissions, 'Abandoned Diagnostic Orders', 'diagnostics/diagnosticadmin/abandoneddiagnosticorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 17);
                this.addNavPath(subNav.subPermissions, 'Reported Orders', 'diagnostics/diagnosticadmin/reportedorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 18);
                this.addNavPath(subNav.subPermissions, 'Phlebos List', 'diagnostics/diagnosticadmin/phlebolist', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 19);
                this.addNavPath(subNav.subPermissions, 'Enquiry List', 'diagnostics/diagnosticadmin/enquirylist', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 20);
                this.addNavPath(subNav.subPermissions, 'Profile Search', 'admin/orderhistory', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 21);

                subNav = this.getLink('Logistic Admin', 'diagnostics', 6, this.userNavArray[index].subPermissions);

                this.addNavPath(subNav.subPermissions, 'Central Dashboard', 'diagnostics/homeorders/centrallogistics', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 6);
                this.addNavPath(subNav.subPermissions, 'Central Cash Details', 'diagnostics/homeorders/centralcashagentlist', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 7);
                this.addNavPath(subNav.subPermissions, 'Logistic Details', 'diagnostics/homeorders/distancetravelled', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 8);
                this.addPackage(index);
                this.sortNavigation(subNav.subPermissions);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralDiagnosticHomeOrder: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasCentralDiagnosticHomeOrdersRole = true;
                let subNav = this.getLink('Diagnostic Admin', 'diagnostics', 4, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Order Requests', 'diagnostics/diagnosticadmin/requestorders', true,
                    Permissions.CentralDiagnosticHomeOrder, accessPermission.value, 'diagnostics', 12);

                this.sortNavigation(subNav.subPermissions);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticSchedule: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReportsRole = true;

                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Diagnostic Schedules', 'diagnostics/schedule', true, Permissions.DiagnosticSchedule, accessPermission.value, 'diagnostics', 3);
                this.addNavPath(subNav.subPermissions, 'Update Test Pricing', 'diagnostics/testupdatepricing', true, Permissions.DiagnosticSchedule, accessPermission.value, 'diagnostics', 4);


                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticHomeOrdersAdmin: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsHomeOrderAdmin = true;
                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Manage Home Orders', 'diagnostics/homeorders/adminhomeorderlist', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 1);
                this.addNavPath(subNav.subPermissions, 'Approve Privilege User', 'diagnostics/vdc/vdcuser', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 2);
                this.addNavPath(subNav.subPermissions, 'Logistic Sample Request', 'diagnostics/homeorders/logistics', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 3);
                this.addNavPath(subNav.subPermissions, 'Logistic Cash Requests', 'diagnostics/homeorders/cashbyagentlist', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 4);
                this.addNavPath(subNav.subPermissions, 'Login History', 'diagnostics/homeorders/loginhistory', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 5);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticReports: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReportsRole = true;

                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Reports', 'diagnostics/mydiagnostics', true, Permissions.DiagnosticReports, accessPermission.value, 'diagnostics', 2);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralDiagnosticManager: {

                if (Config.portal.appId == SystemConstants.BRAND_VDC) {
                    this.setVdcNavigation(accessPermission);
                    break;
                }

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticManagerRole = true;

                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Home Collection Charges', 'diagnostics/collectionpriceupdate', true,
                    Permissions.CentralDiagnosticManager, accessPermission.value, 'diagnostics', 10);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.PharmacyOrder: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasPharmacyRole = true;
                let subNav = this.getLink('Pharmacy', 'pharmacy', 1, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Walk-in Orders', 'pharmacy/orders', true, Permissions.PharmacyOrder, accessPermission.value, 'pharmacy', 1);
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.enableInPatientBilling) {
                    this.addNavPath(subNav.subPermissions, 'In-Patient Orders', 'pharmacy/inpatientorders/list', true, Permissions.PharmacyOrder, accessPermission.value, 'pharmacy', 1);

                }
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.enableOtPatientBilling) {
                    this.addNavPath(subNav.subPermissions, 'OT-Patient Orders', 'pharmacy/otpatientorders/list', true, Permissions.PharmacyOrder, accessPermission.value, 'pharmacy', 1);

                }

                this.sortNavigation(subNav.subPermissions);

                this.addPackage(index);
                break;
            };
            case Permissions.PharmacyReports: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasPharmacyReportsRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Reports', 'pharmacy/mypharmacy', true, Permissions.PharmacyReports, accessPermission.value, 'pharmacy', 4);

                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.PharmacyInventory: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasInventoryRole = true;
                let subNav = this.getLink('Inventory', 'pharmacy', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Dashboard', 'pharmacy/inventory/dashboard', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 1);
                this.addNavPath(subNav.subPermissions, 'Add Inventory', 'pharmacy/inventory/inventorymanagement', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 2);
                this.addNavPath(subNav.subPermissions, 'Upload Inventory', 'pharmacy/inventory/uploadinventory', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 3);
                this.addNavPath(subNav.subPermissions, 'Stock Summary', 'pharmacy/inventory/stock', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 4);
                this.addNavPath(subNav.subPermissions, 'My Orders', 'pharmacy/inventory/orderlist', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 5);
                this.addNavPath(subNav.subPermissions, 'Pharmacy Transfer', 'pharmacy/inventory/transfer', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 6);
                this.addNavPath(subNav.subPermissions, 'Upload Delivery Charges', 'pharmacy/inventory/uploaddeliverycharge', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 7);
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.Supplier: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasInventoryRole = true;
                let subNav = this.getLink('Supplier', 'pharmacy', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Supplier Orders', 'pharmacy/supplier/orderlist', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 1);
                this.addNavPath(subNav.subPermissions, 'Supplier Invoices', 'pharmacy/supplier/invoicelist', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 2);
                this.addNavPath(subNav.subPermissions, 'Add Inventory', 'pharmacy/supplier/inventorymanagement', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 3);
                this.addNavPath(subNav.subPermissions, 'Upload Inventory', 'pharmacy/supplier/uploadinventory', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 4);
                this.addNavPath(subNav.subPermissions, 'Stock Summary', 'pharmacy/supplier/stock', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 5);
                this.addNavPath(subNav.subPermissions, 'Reports', 'pharmacy/supplier/reports', true, Permissions.PharmacyInventory, accessPermission.value, 'pharmacy', 6);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.PharmacyHomeOrder: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasPharmacyHomeOrdersRole = true;
                let subNav = this.getLink('Pharmacy', 'pharmacy', 1, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Home Orders', 'pharmacy/homeorder', true, Permissions.PharmacyHomeOrder, accessPermission.value, 'pharmacy', 2);
                this.addNavPath(subNav.subPermissions, 'Returns', 'pharmacy/returns', true, Permissions.PharmacyHomeOrder, accessPermission.value, 'pharmacy', 3);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralPharmacyHomeOrder: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasCentralPharmacyHomeOrdersRole = true;
                let subNav = this.getLink('Pharmacy', 'pharmacy', 1, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Central Home Orders', 'pharmacy/centralhomeorder', true, Permissions.CentralPharmacyHomeOrder, accessPermission.value, 'pharmacy', 2);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralInventory: {
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.userAuth.hasCentralPharmacyHomeOrdersRole = true;
                let subNav2 = this.getLink('Central Inventory', 'pharmacy', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav2.subPermissions, 'Update Inventory', 'pharmacy/centralinventory/uploadinventory', true, Permissions.CentralInventory, accessPermission.value, 'pharmacy', 1);
                this.addNavPath(subNav2.subPermissions, 'Inventory Information', 'pharmacy/centralinventory/inventoryinformation', true, Permissions.CentralInventory, accessPermission.value, 'pharmacy', 2);
                this.addNavPath(subNav2.subPermissions, 'Inventory Reports', 'pharmacy/centralinventory/reports', true, Permissions.CentralInventory, accessPermission.value, 'pharmacy', 3);
                this.sortNavigation(subNav2.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.ProductDelivery: {
                this.userAuth.hasDeliveryAgentRole = true;
                index = this.checkIfParentExists('Pharmacy', 'pharmacy', 'pharmacy', 5);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Pharmacy Delivery', 'pharmacy/pharmacyDelivery/orderlist/0', true, Permissions.ProductDelivery, accessPermission.value, 'pharmacy', 3);
                index = this.checkIfParentExists('Product', 'product', 'products', 10);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Product Delivery', 'product/productDelivery/orderlist/1', true, Permissions.ProductDelivery, accessPermission.value, 'product', 4);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DoctorAppointments: {
                index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                this.userAuth.hasReceptionRole = true;
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.ConsultationQueue: {
                index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                this.userAuth.hasQueueRole = true;
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralHomeCare: {
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.centralHomeCare) {
                    index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                    this.userAuth.hasCentralHomeCareRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Central Home Care Services', 'reception/centralhomeconsult', true, Permissions.CentralHomeCare, 2, 'reception', 5);
                }
                break;
            };
            case Permissions.HomeCareAppointment: {
                index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                this.userAuth.hasHomeCareAppointmentRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Home Care Services', 'reception/homeconsult', true, Permissions.HomeCareAppointment, 2, 'reception', 4);
                break;
            };
            case Permissions.DigiReceptionist: {
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.digiReception) {
                    index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                    this.userAuth.hasDigiManagerRole = true;
                    let subNav = this.getLink('Digi Manager', 'reception', 4, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Digi Queue', 'reception/digiqueue/queue', true, Permissions.DigiReceptionist, 2, 'reception', 1);
                    this.addNavPath(subNav.subPermissions, 'Vital Queue', 'reception/digiqueue/vital', true, Permissions.DigiReceptionist, 2, 'reception', 2);
                    this.addNavPath(subNav.subPermissions, 'Digi Prescription', 'reception/digiqueue/prescription', true, Permissions.DigiReceptionist, 2, 'reception', 3);

                    this.addPackage(index);
                    this.sortNavigation(this.userNavArray[index].subPermissions);
                }
                break;
            };
            case Permissions.ManagePrescriptions: {
                index = this.checkIfParentExists('Reception', 'reception', 'reception', 1);
                this.userAuth.hasPrintPrescriptionRole = true;
                let subNav = this.getLink('Prescription', 'reception', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Prescription List', 'reception/prescription', true, Permissions.ManagePrescriptions, accessPermission.value, 'reception', 1);
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.Vitals: {
                index = this.checkIfParentExists('Nurse', 'nurse', 'vital', 3);
                this.userAuth.hasNurseRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Vitals', 'nurse', true, Permissions.Vitals, accessPermission.value, 'vital', 1);
                this.addNavPath(this.userNavArray[index].subPermissions, 'SBR', 'nurse/SBR', true, Permissions.Vitals, accessPermission.value, 'vital', 1);
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.Billing: {
                index = this.checkIfParentExists('Payment', 'payment', 'payment', 2);
                this.userAuth.hasPaymentRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Payment Desk', 'payment/desk', true, Permissions.Payment, accessPermission.value, 'payment', 1);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Miscellaneous Orders', 'payment/miscellaneouspaymentslisting', true, Permissions.Payment, accessPermission.value, 'payment', 5);

                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

            case Permissions.MiscellaneousServices: {
                index = this.checkIfParentExists('Payment', 'payment', 'payment', 2);
                this.userAuth.hasProcedureRole = true;

                let subNav = this.getLink((this.procedurePrescriptionLabel && this.procedurePrescriptionLabel.length > 0 ? this.procedurePrescriptionLabel : 'Procedures'), 'payment', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Order List', 'payment/misc', true, Permissions.Payment, accessPermission.value, 'payment', 1);
                this.addNavPath(subNav.subPermissions, (this.procedurePrescriptionLabel && this.procedurePrescriptionLabel.length > 0 ? ('Upload ' + this.procedurePrescriptionLabel) : 'Upload Procedures'), 'payment/updateprocedure', true, Permissions.Payment, accessPermission.value, 'payment', 2);

                subNav = this.getLink((this.admissionNotePrescriptionLabel && this.admissionNotePrescriptionLabel.length > 0 ? this.admissionNotePrescriptionLabel : 'IP Admission'), 'payment', 4, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Order List', 'payment/admissionnote', true, Permissions.Payment, accessPermission.value, 'payment', 1);
                this.addNavPath(subNav.subPermissions, (this.admissionNotePrescriptionLabel && this.admissionNotePrescriptionLabel.length > 0 ? 'Upload ' + this.admissionNotePrescriptionLabel : 'Upload Admission Procedures'), 'payment/updateadmissionnote', true, Permissions.Payment, accessPermission.value, 'payment', 2);

                if (!this.disableImmunization) {
                    subNav = this.getLink('Immunization', 'payment', 3, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Order List', 'payment/immunization', true, Permissions.Payment, accessPermission.value, 'payment', 1);
                    this.addNavPath(subNav.subPermissions, 'Upload immunization', 'payment/updateimmunization', true, Permissions.Payment, accessPermission.value, 'payment', 2);
                }
                
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.OnboardingRequest: {

                if (Config.portal.appId == SystemConstants.BRAND_YODA) {
                    this.setYodaNavigation(accessPermission);
                    break;
                }

                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.onboardingPartner) {
                    index = this.checkIfParentExists('Onboarding', 'onboarding', 'onboarding', 8);
                    this.userAuth.hasOnboardingRequestRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Onboarding Users', 'onboarding/user', true, Permissions.OnboardingRequest, accessPermission.value, 'onboarding', 1);
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Coupon Users', 'onboarding/coupon', true, Permissions.OnboardingRequest, accessPermission.value, 'onboarding', 3);
                    this.addNavPath(this.userNavArray[index].subPermissions, 'Upload Users', 'onboarding/uploadusers', true, Permissions.OnboardingRequest, accessPermission.value, 'onboarding', 2);
                    this.addPackage(index);
                    this.sortNavigation(this.userNavArray[index].subPermissions);

                    // Adding Diagnostic Home Order bookings to Onboarding User
                    index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                    let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                    this.addNavPath(subNav.subPermissions, 'Other Home Orders', 'diagnostics/slotbooking/slotselection/1/true',
                        true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 2);
                }
                break;
            };
            case Permissions.AppOnboardingRequest: {

                index = this.checkIfParentExists('Onboarding', 'onboarding', 'onboarding', 8);
                this.userAuth.hasOnboardingAdminRole = true;
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.appOnboardingRequest) {
                    this.userAuth.hasOnboardingRequestRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'App Onboarding Requests', 'onboarding/requests', true, Permissions.AppOnboardingRequest, accessPermission.value, 'onboarding', 2);
                }
                this.addNavPath(this.userNavArray[index].subPermissions, 'Central Onboarded Users', 'onboarding/centralOnboardingUsers', true, Permissions.AppOnboardingRequest, accessPermission.value, 'onboarding', 3);
                this.sortNavigation(this.userNavArray[index].subPermissions);

                break;
            };
            case Permissions.CentralReports: {
                if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.misReports) {
                    index = this.checkIfParentExists('MIS', 'mis', 'reports', 12);
                    this.userAuth.hasMISRole = true;
                    this.addNavPath(this.userNavArray[index].subPermissions, 'MIS Reports', 'mis/users', true, Permissions.AppOnboardingRequest, accessPermission.value, 'reports', 3);
                    this.sortNavigation(this.userNavArray[index].subPermissions);
                }
                break;
            };
            case Permissions.CentralOperationsReports: {
                index = this.checkIfParentExists('MIS', 'mis', 'reports', 12);
                this.userAuth.hasMISRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Operations Reports', 'ops/opsdashboard', true, Permissions.AppOnboardingRequest, accessPermission.value, 'ops', 4);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.OpsFinancialReports: {
                index = this.checkIfParentExists('MIS', 'mis', 'reports', 12);
                this.userAuth.hasMISRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Revenue Reports', 'revenuereports/totalorderscount', true, Permissions.AppOnboardingRequest, accessPermission.value, 'revenuereports', 5);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CancellationRequest: {
                index = this.checkIfParentExists('Admin', 'admin', 'admin', 9);
                this.userAuth.hasCancellationAdminRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Order Cancellations', 'admin/ordercancellations', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 2);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralDoctorOrders: {
                index = this.checkIfParentExists('Admin', 'admin', 'admin', 9);
                this.userAuth.hasCancellationAdminRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Central Doctor Bookings', 'admin/centraldoctorbookings', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 2);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Non-Buying Users', 'admin/nonbuyingusers', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 3);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Abandoned Doctor Bookings', 'admin/abandoneddoctorbookings', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 4);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Doctor Bookings Calendar', 'admin/calendar', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 5);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Profile Search', 'admin/orderhistory', true, Permissions.CancellationRequest, accessPermission.value, 'admin', 6);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.ProductHomeOrder: {
                index = this.checkIfParentExists('Product', 'product', 'products', 10);
                this.userAuth.hasProductDeliveryRole = true;
                let subNav = this.getLink('Product', 'products', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Home Orders', 'product/homeorder', true, Permissions.ProductHomeOrder, accessPermission.value, 'product', 1);
                this.addNavPath(subNav.subPermissions, 'Walk-in Orders', 'product/walkin', true, Permissions.ProductHomeOrder, accessPermission.value, 'product', 2);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.ProductReturnOrder: {
                index = this.checkIfParentExists('Product', 'product', 'products', 10);
                this.userAuth.hasProductDeliveryRole = true;
                let subNav = this.getLink('Product', 'products', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Return Orders', 'product/returns', true, Permissions.ProductReturnOrder, accessPermission.value, 'product', 6);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralProductHomeOrder: {
                index = this.checkIfParentExists('Product', 'product', 'products', 10);
                this.userAuth.hasCentralProductHomeOrdersRole = true;
                this.userAuth.hasProductDeliveryRole = true;
                let subNav = this.getLink('Product', 'products', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Central Home Orders', 'product/centralhomeorder', true, Permissions.CentralProductHomeOrder, accessPermission.value, 'product', 3);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.ProductInventory: {
                index = this.checkIfParentExists('Product', 'product', 'products', 10);
                this.userAuth.hasProductDeliveryRole = true;
                let subNav = this.getLink('Manage Product', 'products', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Add Inventory', 'product/inventory/add', true, Permissions.ProductInventory, accessPermission.value, 'product', 4);
                this.addNavPath(subNav.subPermissions, 'Stock Summary', 'product/inventory/stock', true, Permissions.ProductInventory, accessPermission.value, 'product', 5);
                this.addNavPath(subNav.subPermissions, 'Update Product Information', 'product/inventory/updateproduct', true, Permissions.ProductInventory, accessPermission.value, 'product', 6);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.WellnessSchedule: {
                index = this.checkIfParentExists('Wellness', 'wellness', 'wellness', 10);
                this.userAuth.hasWellnessRole = true;
                let subNav = this.getLink('Manage', 'wellness', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Wellness Schedules', 'wellness/wellness_schedule', true,
                    Permissions.WellnessSchedule, accessPermission.value, 'wellness', 2);
                this.addNavPath(subNav.subPermissions, 'Update Service Pricing', 'wellness/servicesupdatepricing',
                    true, Permissions.WellnessSchedule, accessPermission.value, 'wellness', 5);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.WellnessOrder: {
                index = this.checkIfParentExists('Wellness', 'wellness', 'wellness', 10);
                this.userAuth.hasWellnessRole = true;
                let subNav = this.getLink('Orders', 'wellness', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Appointments', 'wellness/wellness_slotbooking', true,
                    Permissions.WellnessSchedule, accessPermission.value, 'wellness', 2);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralPackageBookings: {
                index = this.checkIfParentExists('Admin', 'admin', 'admin', 9);
                this.userAuth.hasCentralPackageRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Central Package Purchases', 'admin/centralpackages', true, Permissions.CentralPackageBookings, accessPermission.value, 'admin', 4);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Central Wallet Manager', 'admin/wallet/usage', true, Permissions.CentralPackageBookings, accessPermission.value, 'admin', 5);
                this.addNavPath(this.userNavArray[index].subPermissions, 'Central Post Wallet Admin', 'admin/postwallet', true, Permissions.CentralPackageBookings, accessPermission.value, 'admin', 5);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.PocPackages: {
                index = this.checkIfParentExists('Admin', 'admin', 'admin', 9);
                this.userAuth.hasPackagePurchasesRole = true;
                this.addNavPath(this.userNavArray[index].subPermissions, 'Package Purchases', 'admin/pocpackages', true, Permissions.PocPackages, accessPermission.value, 'admin', 4);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

        }
    }

    addPackage(index: number): void {
        if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.hsPackages) {
            this.addNavPath(this.userNavArray[index].subPermissions, 'Packages', 'package', true, 2, AccessRights.editAccess, "", 99);
        }
        if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.communityPackages) {
            this.addNavPath(this.userNavArray[index].subPermissions, 'Community Packages', 'package/assignpackages', true, 2, AccessRights.editAccess, "", 100);
        }
    }

    checkIfParentExists(parent: string, path: string, style: string, priority: number): number {
        let currIndex: number = -1;
        if (this.userNavArray == undefined || this.userNavArray == null) {
            this.userNavArray = new Array<UserPermissions>();
        }
        for (let x = 0; x < this.userNavArray.length; x++) {
            if (this.userNavArray[x].label == parent) {
                currIndex = x;
                break;
            }
        }
        if (currIndex == -1) {
            currIndex = this.userNavArray.length;
            this.userNavArray[currIndex] = new UserPermissions(parent, path, false, 0, AccessRights.editAccess, style, priority);
            this.userNavArray[currIndex].subPermissions = new Array<UserPermissions>();
        }
        return currIndex;
    }

    checkIfLinkExists(label: string, permissionsArray: Array<UserPermissions>): boolean {
        let exists: boolean = false;
        if (permissionsArray != undefined && permissionsArray != null && permissionsArray.length > 0) {
            for (let x = 0; x < permissionsArray.length; x++) {
                if (permissionsArray[x].label == label) {
                    exists = true;
                    break;
                }
            }
        }
        return exists;
    }

    addNavPath(permissionsArray: Array<UserPermissions>, label: string, path: string, isNavigation: boolean,
        permission: number, accessRight: number, navigationStyle: string, priority: number): void {
        if (!this.checkIfLinkExists(label, permissionsArray)) {
            permissionsArray.push(new UserPermissions(label, path, isNavigation, permission, accessRight, navigationStyle, priority));
        }
    }

    getLink(label: string, style: string, priority: number, permissionsArray: Array<UserPermissions>): UserPermissions {
        if (permissionsArray != undefined && permissionsArray != null && permissionsArray.length > 0) {
            for (let x = 0; x < permissionsArray.length; x++) {
                if (permissionsArray[x].label == label) {
                    return permissionsArray[x];
                }
            }
        }
        let nav = new UserPermissions(label, null, false, 0, AccessRights.editAccess, style, priority);
        nav.subPermissions = new Array<UserPermissions>();
        permissionsArray.push(nav);
        return nav;
    }

    isAuthorized(): boolean {
        return this.userAuth.isLoggedIn;
    }

    saveToLocalStore(): void {
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.loginResponse != null && this.loginResponse.sessionToken != null) {
            // Session ID is stored in raptor
            window.localStorage.setItem("raptor", cryptoUtil.encryptData(this.loginResponse.sessionToken));
        }
        if (this.userAuth != null) {
            window.localStorage.setItem('authDetails', cryptoUtil.encryptData(JSON.stringify(this.userAuth)));
        }
        if (this.employeeDetails != null) {
            window.localStorage.setItem('employeeDetails', cryptoUtil.encryptData(JSON.stringify(this.employeeDetails)));
        }
        if (this.userNavArray != null) {
            window.localStorage.setItem('userPermissions', cryptoUtil.encryptData(JSON.stringify(this.userNavArray)));
        }
        if (this.loginResponse != null) {
            window.localStorage.setItem('loginResponse', cryptoUtil.encryptData(JSON.stringify(this.loginResponse)));
        }
        if (this.selectedPOCMapping != null) {
            window.localStorage.setItem('selectedPOCMapping', cryptoUtil.encryptData(JSON.stringify(this.selectedPOCMapping)));
        }
        if (this.selectedPocDetails != null) {
            window.localStorage.setItem('selectedPocDetails', cryptoUtil.encryptData(JSON.stringify(this.selectedPocDetails)));
        }
        if (this.roleBasedAddressList != null && this.roleBasedAddressList.length > 0) {
            window.localStorage.setItem('roleBasedAddressList', cryptoUtil.encryptData(JSON.stringify(this.roleBasedAddressList)));
        }
        if (this.pocIds != null) {
            window.localStorage.setItem('pocIds', cryptoUtil.encryptData(JSON.stringify(this.pocIds)));
        }
        if (this.employeePocMappingList != null) {
            window.localStorage.setItem('pocRolesList', cryptoUtil.encryptData(JSON.stringify(this.employeePocMappingList)));
        }
        if (this.isCorporateAdmin) {
            window.localStorage.setItem('isCorporateAcc', cryptoUtil.encryptData(JSON.stringify(this.isCorporateAdmin)));
        }
    }

    removeFromLocalStore(): void {
        let configType = localStorage.getItem('changeTestType');
        let qaChangeIP = localStorage.getItem('qaChangeIP');
        window.localStorage.clear();
        localStorage.setItem('changeTestType', configType + '');
        localStorage.setItem('qaChangeIP', qaChangeIP + '');
    }

    getFromLocalStore(): void {
        try {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('authDetails') != null && window.localStorage.getItem('authDetails').length > 0) {
                this.userAuth = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('authDetails')));
            }
            if (window.localStorage.getItem('employeeDetails') != null && window.localStorage.getItem('employeeDetails').length > 0) {
                this.employeeDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('employeeDetails')));
            }
            if (window.localStorage.getItem('userPermissions') != null && window.localStorage.getItem('userPermissions').length > 0) {
                this.userNavArray = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('userPermissions')));
            }
            if (window.localStorage.getItem('loginResponse') != null && window.localStorage.getItem('loginResponse').length > 0) {
                this.loginResponse = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('loginResponse')));
            }
            if (window.localStorage.getItem('selectedPOCMapping') != null && window.localStorage.getItem('selectedPOCMapping').length > 0) {
                this.selectedPOCMapping = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedPOCMapping')));
            }
            if (window.localStorage.getItem('selectedPocDetails') != null && window.localStorage.getItem('selectedPocDetails').length > 0) {
                this.selectedPocDetails = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('selectedPocDetails')));
            }
            if (window.localStorage.getItem('roleBasedAddressList') != null && window.localStorage.getItem('roleBasedAddressList').length > 0) {
                this.roleBasedAddressList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('roleBasedAddressList')));
            }
            if (window.localStorage.getItem('pocIds') != null && window.localStorage.getItem('pocIds').length > 0) {
                this.pocIds = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pocIds')));
                if (window.localStorage.getItem('pocRolesList') != null && window.localStorage.getItem('pocRolesList').length > 0) {
                    this.employeePocMappingList = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('pocRolesList')));
                }
            }
            this.isCorporateAdmin = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('isCorporateAcc')));

        } catch (Error) {
            this.removeFromLocalStore();
            console.log(Error);
        }
    }

    // saveCityAndState(): void {
    //     // Make a service call to fetch the states and cities
    //     //this.statesAndCities = this.loginResponse.statesAndCities;
    //     window.localStorage.setItem('statesAndCities', JSON.stringify(this.statesAndCities));
    // }
    saveCityAndState(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_STATE_AND_CITY, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                localStorage.setItem('statesAndCities', JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getStatesAndCities(): State[] {
        if ((this.statesAndCities == null || this.statesAndCities == undefined) && window.localStorage.getItem('statesAndCities') != null && window.localStorage.getItem('statesAndCities').length > 0) {
            this.statesAndCities = JSON.parse(window.localStorage.getItem('statesAndCities'));
        }
        return this.statesAndCities;
    }
    getcityList(): RoleBasedAddress[] {

        if ((this.roleBasedAddressList == null || this.roleBasedAddressList == undefined) && window.localStorage.getItem('roleBasedAddressList') != null && window.localStorage.getItem('roleBasedAddressList').length > 0) {
            this.roleBasedAddressList = JSON.parse(window.localStorage.getItem('roleBasedAddressList'));
        }
        return this.roleBasedAddressList;
    }

    getStateById(id: number): State {
        let searchState: State = null;
        try {
            this.statesAndCities = this.getStatesAndCities();
            this.statesAndCities.forEach(element => {
                let state: State = element;
                if (state.id == id) {
                    searchState = state;
                    return;
                }
            });
        } catch (Error) {
            console.log('Error occurred while fetching the state ' + Error);
        }
        return searchState;
    }

    getCityByIds(stateId: number, cityId: number): City {
        let searchCity: City = null;
        try {
            this.statesAndCities = this.getStatesAndCities();
            this.statesAndCities.forEach(element => {
                let state: State = element;
                if (state.id == stateId) {
                    state.cities.forEach(element => {
                        let city: City = element;
                        if (city.id == cityId) {
                            searchCity = city;
                            return;
                        }
                    });
                    return;
                }
            });
        } catch (Error) {
            console.log('Error occurred while fetching the city ' + Error);
        }
        return searchCity;
    }

    getCityById(state: State, cityId: number): City {
        let searchCity: City = null;
        try {
            this.statesAndCities = this.getStatesAndCities();
            state.cities.forEach(element => {
                let city: City = element;
                if (city.id == cityId) {
                    searchCity = city;
                    return;
                }
            });
        } catch (Error) {
            console.log('Error occurred while fetching the City ' + Error);
        }
        return searchCity;
    }

    updateNotificationToken(EmptokenObject): Promise<boolean> {
        let validCredentials: boolean = false;
        return this.httpService
            .httpPostPromise(
                this.httpService.getPaths().UPDATE_NOTIFICATION_TOKEN,
                JSON.stringify(EmptokenObject),
                AppConstants.POZ_BASE_URL_INDEX
            )
            .then(data => {
                if (data.statusCode == 200 || data.statusCode == 201) {
                    validCredentials = true;
                }
                return validCredentials;
            })
            .catch(err => {
                // if (err) {
                    validCredentials = false;
                    console.log(err);
                    return validCredentials;
                // }
            });
    }
    logoutService(): Promise<boolean> {
        let validCredentials: boolean = false;
        return this.httpService.httpGetPromise(this.urlStringFormatter.getFormatedUrlForLogout(this.httpService.getPaths().LOGOUT, '' + this.loginResponse.employee.empId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            console.log("Notication Token Removed....");
            return data;
        }).catch((err) => {
            if (err) {
                console.log(err);
                return err;
            }
        });
    }
    generateOTP(otpVerification: OTPVerification): Promise<boolean> {
        let generatedOtp: boolean = false;
        return this.httpService.httpPostPromise(this.httpService.getPaths().GENERATE_OTP,
            JSON.stringify(otpVerification), AppConstants.POZ_BASE_URL_INDEX).then((response) => {
                if (response.statusCode == 200) {
                    generatedOtp = true;
                }
                return generatedOtp;
            }).catch((err) => {
                // if (err) {
                    generatedOtp = false;
                    console.log(err);
                    return generatedOtp;
                // }
            });
    }

    verifyOTP(otpVerification: OTPVerification): Promise<boolean> {
        let generatedOtp: boolean = false;
        return this.httpService.httpPostPromise(this.httpService.getPaths().VERIFY_OTP,
            JSON.stringify(otpVerification), AppConstants.POZ_BASE_URL_INDEX).then((response) => {
                if (response.statusCode == 200) {
                    generatedOtp = true;
                }
                return generatedOtp;
            }).catch((err) => {
                // if (err) {
                    generatedOtp = false;
                    console.log(err);
                    return generatedOtp;
                // }
            });
    }

    changePassword(updatePassword: UpdatedPassword): Promise<boolean> {
        let generatedOtp: boolean = false;
        if (this.userAuth != null && this.userAuth.employeeId > 0) {
            updatePassword.empId = this.userAuth.employeeId;
            return this.httpService.httpPostPromise(this.httpService.getPaths().CHANGE_PASSWORD,
                JSON.stringify(updatePassword), AppConstants.POZ_BASE_URL_INDEX).then((response) => {
                    if (response.statusCode == 200) {
                        generatedOtp = true;
                    }
                    return generatedOtp;
                }).catch((err) => {
                    // if (err) {
                        generatedOtp = false;
                        console.log(err);
                        return generatedOtp;
                    // }
                });
        }
        else {
            return Promise.resolve(false);
          }
    }

    getLocalitiesForCity(cityId: number): Promise<Locality[]> {
        let city: string = '{' + '"' + 'cityId' + '"' + ':' + cityId + '}';
        return this.httpService.httpPostPromise(this.httpService.getPaths().LOCALITIESFORCITY,
            city, AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                    console.log(err);
                    return Promise.reject(err);
                // }
            });
    }

    setSelectedRole(selectedRole: UserPermissions): void {
        this.selectedRole = selectedRole;
    }

    getSelectedRole(): UserPermissions {
        return this.selectedRole;
    }

    convertDateToTimestamp(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        var dateString = [day, mnth, date.getFullYear()].join("-");
        var newDate = new Date(dateString.split("-").reverse().join("-")).getTime();
        return newDate
    }

    private sortNavigation(userNavArray: UserPermissions[]) {
        if (userNavArray && userNavArray.length > 0) {
            userNavArray.sort(function (a, b) {
                if (a.priority < b.priority)
                    return -1;
                if (a.priority > b.priority)
                    return 1;
                return 0;
            });
        }
    }

    getTempUrl(url: string): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_TEMP_FILE + '/' + url, AppConstants.POZ_BASE_URL_INDEX).then((data: BaseResponse) => {
            return Promise.resolve(data);
        }).catch((err) => {
            if (err) {
                console.log(err);
                return err;
            }
        });
    }

    getTempFileURLFromSecureURL(url, empId = this.loginResponse.employee.empId): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_TEMP_URLS, decodeURI(url), empId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return data;
        }).catch((err) => {
            if (err) {
                console.log(err);
                return err;
            }
        });
    }

    openPDF(pdfUrl: string) {
        this.spinner.start();
        let toLowerCaseurl = '' + pdfUrl.toLowerCase();
        let fileExtensions: string[] = ['.pdf', '.xlsx', '.xlx', '.xls', '.png', '.jpg', '.jpeg'];
        let index = -1;
        for (let i = 0; i < fileExtensions.length; i++) {
            let j = toLowerCaseurl.indexOf(fileExtensions[i]);
            index = (j != -1) ? j : index;
        }
        if (
            index == -1
        ) {
            this.getTempUrl(pdfUrl).then((url) => {
                this.spinner.stop();
                if ((url.statusCode == 201 || url.statusCode == 200)) {
                    window.open(url.data, '_blank');
                    // this.toast.show(url.statusMessage, "bg-warning text-white font-weight-bold", 3000);
                } else {
                    this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
                }
            }).catch((err) => {
                this.spinner.stop();
                this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
            })
        } else if (
            ((toLowerCaseurl.length - 5) <= index) &&
            (index < toLowerCaseurl.length)
        ) {
            this.getTempFileURLFromSecureURL(pdfUrl).then((url) => {
                this.spinner.stop();
                if ((url.statusCode == 201 || url.statusCode == 200)) {
                    window.open(url.data, '_blank');
                    // this.toast.show(url.statusMessage, "bg-warning text-white font-weight-bold", 3000);
                } else {
                    this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
                }
            }).catch((err) => {
                this.spinner.stop();
                this.toast.show("Error in getting response please retry", "bg-danger text-white font-weight-bold", 3000);
            })
        } else {
            window.open(pdfUrl, '_blank');
        }
    }

    getPreventNavigation() {
        return this.preventNavigation;
    }

    setPreventNavigation(preventNavigation) {
        this.preventNavigation = preventNavigation;
    }

    setVdcNavigation(accessPermission: AccessPermission) {
        let index: number = this.userNavArray.length;
        switch (accessPermission.permissionId) {
            case Permissions.CentralDiagnosticOrders: {
                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsAdmin = true;

                let subNav = this.getLink('Call Centre', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'New Bookings', 'diagnostics/diagnosticadmin/requestorders', true,
                    Permissions.CentralDiagnosticHomeOrder, accessPermission.value, 'diagnostics', 11);
                this.addNavPath(subNav.subPermissions, 'Home Collection Orders', 'diagnostics/diagnosticadmin/centralhomeorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 12);
                this.addNavPath(subNav.subPermissions, 'Branch Walkin Orders', 'diagnostics/diagnosticadmin/centralwalkinorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 13);
                this.addNavPath(subNav.subPermissions, 'Cancellation Requests', 'diagnostics/diagnosticadmin/cancelledorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 14);
                this.addNavPath(subNav.subPermissions, 'Web / M-app Queries', 'diagnostics/diagnosticadmin/enquirylist', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 15);

                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.CentralDiagnosticManager: {
                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticManagerRole = true;

                let subNav = this.getLink('Manage', 'diagnostics', 4, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Abandoned Diagnostic Orders', 'diagnostics/diagnosticadmin/abandoneddiagnosticorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 17);
                this.addNavPath(subNav.subPermissions, 'Phlebo Orders Report', 'diagnostics/diagnosticadmin/reportedorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 18);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticHomeOrdersAdmin: {
                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsHomeOrderAdmin = true;
                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Manage Home Orders', 'diagnostics/homeorders/adminhomeorderlist', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 1);

                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticSchedule: {
                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReportsRole = true;

                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Diagnostic Schedules', 'diagnostics/schedule', true, Permissions.DiagnosticSchedule, accessPermission.value, 'diagnostics', 3);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            case Permissions.DiagnosticAppointments: {

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReceptionRole = true;

                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Web Bookings', 'diagnostics/slotbooking/slotqueue', true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 1);
                if (Config.portal.appId == SystemConstants.BRAND_VDC && Config.TEST_TYPE == 1) {
                    this.addNavPath(subNav.subPermissions, 'Slot Dashboard', 'diagnostics/homeorders/slotdashboard',
                        true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 6);
                }
                this.sortNavigation(subNav.subPermissions);
                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };
            default: {
                break;
            }
        }
    }

    setYodaNavigation(accessPermission: AccessPermission) {
        let index: number = this.userNavArray.length;
        switch (accessPermission.permissionId) {
            case Permissions.CentralDiagnosticOrders: {
                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsAdmin = true;
                let subNav = this.getLink('Diagnostic Admin', 'diagnostics', 4, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Central Home Orders', 'diagnostics/diagnosticadmin/centralhomeorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 11);
                this.addNavPath(subNav.subPermissions, 'Central Walkin Orders', 'diagnostics/diagnosticadmin/centralwalkinorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 13);
                this.addNavPath(subNav.subPermissions, 'Cancellation Requests', 'diagnostics/diagnosticadmin/cancelledorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 14);
                this.addNavPath(subNav.subPermissions, 'Reported Orders', 'diagnostics/diagnosticadmin/reportedorders', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 18);
                // this.addNavPath(subNav.subPermissions, 'Phlebos List', 'diagnostics/diagnosticadmin/phlebolist', true,
                //     Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 19);
                this.addNavPath(subNav.subPermissions, 'Profile Search', 'admin/orderhistory', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 21);

                subNav = this.getLink('Logistic Admin', 'diagnostics', 6, this.userNavArray[index].subPermissions);

                this.addNavPath(subNav.subPermissions, 'Central Dashboard', 'diagnostics/homeorders/centrallogistics', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 6);
                this.addNavPath(subNav.subPermissions, 'Logistic Details', 'diagnostics/homeorders/distancetravelled', true,
                    Permissions.CentralDiagnosticOrders, accessPermission.value, 'diagnostics', 8);
                this.addPackage(index);
                this.sortNavigation(subNav.subPermissions);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            }

            case Permissions.DiagnosticHomeOrder: {

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsHomeOrdersRole = true;
                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'New Home Orders', 'diagnostics/homeorders/managehomeorderlist',
                    true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 3);
                this.addNavPath(subNav.subPermissions, 'Pending Orders', 'diagnostics/homeorders/homeorderlist',
                    true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 4);
                // this.addNavPath(subNav.subPermissions, 'PickUp Raised Orders', 'diagnostics/homeorders/pickuporderlist',
                //     true, Permissions.DiagnosticHomeOrder, accessPermission.value, 'diagnostics', 5);
                this.sortNavigation(subNav.subPermissions);
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

            case Permissions.DiagnosticOrder: {

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticOrderRole = true;
                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Walk-in Orders', 'diagnostics/orders', true,
                    Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 2);
                this.sortNavigation(subNav.subPermissions);
                this.addPackage(index);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

            case Permissions.DiagnosticAppointments: {

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticReceptionRole = true;

                let subNav = this.getLink('Orders', 'diagnostics', 2, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Appointments', 'diagnostics/slotbooking/slotqueue', true, Permissions.DiagnosticOrder, accessPermission.value, 'diagnostics', 1);
                this.sortNavigation(subNav.subPermissions);
                this.addPackage(index);

                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

            case Permissions.DiagnosticHomeOrdersAdmin: {

                index = this.checkIfParentExists('Diagnostics', 'diagnostics', 'diagnostics', 6);
                this.userAuth.hasDiagnosticsHomeOrderAdmin = true;
                let subNav = this.getLink('Manage', 'diagnostics', 3, this.userNavArray[index].subPermissions);
                this.addNavPath(subNav.subPermissions, 'Manage Home Orders', 'diagnostics/homeorders/adminhomeorderlist', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 1);
                this.addNavPath(subNav.subPermissions, 'Logistic Sample Request', 'diagnostics/homeorders/logistics', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 3);
                this.addNavPath(subNav.subPermissions, 'Login History', 'diagnostics/homeorders/loginhistory', true,
                    Permissions.DiagnosticHomeOrdersAdmin, accessPermission.value, 'diagnostics', 5);
                this.sortNavigation(subNav.subPermissions);
                this.sortNavigation(this.userNavArray[index].subPermissions);
                break;
            };

            default: {
                break;
            }
        }
    }
}