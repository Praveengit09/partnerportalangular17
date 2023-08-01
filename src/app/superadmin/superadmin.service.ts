import { ReferredPoc } from './../model/poc/pocDetails';
import { Injectable } from "@angular/core";
import { HttpService } from "../base/http.service";
import { AuthService } from "../auth/auth.service";
import { URLStringFormatter } from "../base/util/url-string-formatter";
import { AppConstants } from '../base/appconstants';
import { BrandDetailsWithReferralCode } from '../model/brand/brandDetailsWithReferralCode';
import { BaseResponse } from '../model/base/baseresponse';
import { EmployeeRequest } from '../model/employee/employeerequest';
import { PocSearch } from '../model/poc/pocSearch';
import { ServiceItem } from '../model/service/serviceItem';
import { DoctorFavRolesRequest } from '../model/poc/doctorfavrolesrequest';
import { AssignEmployeeRequest } from "../model/employee/assignEmployeeRequest";
import { DoctorLeaveRequest } from '../model/employee/doctorleaverequest';
import { DoctorScheduleDetails } from '../model/employee/doctorscheduledetails';
import { ScheduleRequest } from '../model/employee/schedulerequest';
import { EmployeeListRequest } from '../model/employee/employeeListRequest';
import { DoctorDetails } from '../model/employee/doctordetails';
import { Employee } from '../model/employee/employee';
import { PocPayoutConfigurationDetails } from '../model/poc/pocpayoutconfigurationdetails';

@Injectable()
export class SuperAdminService {

    public pocId: number;
    isBrandModify: boolean;
    isPocModify: boolean;
    public pocDetail: any;
    referredByPocDetails: ReferredPoc = new ReferredPoc();
    brandDetail: BrandDetailsWithReferralCode = new BrandDetailsWithReferralCode();
    public doctorDetail: DoctorDetails;
    public doctorList = new Array<DoctorDetails>();
    public employee: Employee = new Employee();
    AssignEmployeeRequest: AssignEmployeeRequest = new AssignEmployeeRequest();
    ServiceItem: ServiceItem = new ServiceItem();
    checkedList: ServiceItem[];
    createPocTabs = [
        {
            "name": "POC Information",
            "condition": true
        },
        {
            "name": "Service Portfolio",
            "condition": true
        },
        {
            "name": "Settings",
            "condition": true
        }
    ];
    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
    ) {
        console.log("checked List----->" + this.checkedList)
        let refPoc = localStorage.getItem('superAdminReferredPoc');
        if (refPoc) {
            this.setReferredByPocDetails(JSON.parse(refPoc));
        }
    }

    getBrandDetails(): Promise<BrandDetailsWithReferralCode[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_BRAND_DETAILS, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }
    getBrandConfiguration(brandId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_BRAND_CONFIGURATIONS, brandId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    addAndUpdateBrandConfig(requestBody): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_BRAND_CONFIGURATIONS, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getBrandAppMapping(brandId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_BRAND_APP_MAPPING, brandId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    UpdateBrandAppMapping(requestBody): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_BRAND_APP_MAPPING, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getDiagBufferTime(appId: number) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAG_BUFFER_TIME, appId), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    UpdateDiagBufferTime(requestBody): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_DIAG_BUFFER_TIME, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getdiagnosticSchedulelist(pocId) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTIC_SCHEDULE_LIST, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getEmployeeBasedOnRole(employeeRequest: EmployeeRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ALL_EMPLOYEES_BASED_ON_ROLE, JSON.stringify(employeeRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getPocDetails(request: PocSearch): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_POC_DETAILS,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    addAndUpdateBrandDetails(requestBody: BrandDetailsWithReferralCode): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_UPDATE_BRAND_DETAILS, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }
    addAndUpdatePocDetails(requestBody: any): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_UPDATE_POC_DETAILS, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }
    updateRole(requestBody: any): Promise<BaseResponse> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_AND_UPDATE_ROLE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }

    getFollowUpDiscounts(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().FOLLOW_UP_DISCOUNTS, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            // console.log("datapck?????" + JSON.stringify(data));
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });

    }
    getList(EmployeeListRequest: EmployeeListRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_LIST, JSON.stringify(EmployeeListRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    updateDoctorLeave(DoctorLeaveRequest: DoctorLeaveRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().MARK_DOCTOR_LEAVE, JSON.stringify(DoctorLeaveRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    getallservices(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_All_SERVICES, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getallpackages(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_All_PACKAGES, AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getAllRoles(isSuperAdmin: boolean, pocId: number): Promise<any> {
        if (!isSuperAdmin) {
            return this.httpService.httpGetPromise(this.httpService.getPaths().GET_ADMIN_ROLES + "?pocId=" + pocId, AppConstants.POZ_BASE_URL_INDEX)
                .then((data) => {
                    return Promise.resolve(data);
                }).catch((err) => {
                    return Promise.reject(err);
                });
        } else {
            return this.httpService.httpGetPromise(this.httpService.getPaths().GET_All_ROLES, AppConstants.POZ_BASE_URL_INDEX)
                .then((data) => {
                    return Promise.resolve(data);
                }).catch((err) => {
                    return Promise.reject(err);
                });
        }
    }

    getAllPermission(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_PERMISSIONS, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getEmployeeAssociationWithDoc(pocId: number, roleId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMPLOYEE_ASSOCIATION_WITH_DOC, pocId, roleId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getDiagnosticListBasedOnFirstChar(pocId: number, firstChar: string): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DIAGNOSTICLIST_BASEDON_FIRSTCHAR, pocId, firstChar),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getScheduleList(doctorId: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GETSCHEDULELIST + "?doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                // console.log("datacheck>>>>" + JSON.stringify(data));
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    updateEmployeeAssociationWithDoc(docFavRequest: DoctorFavRolesRequest[]): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_EMPLOYEE_ASSOCIATED_DOCTOR_DETAILS, JSON.stringify(docFavRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    updateConsultation(requestBody: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_CONSULTATION_FEE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getEmployeesForRole(requestBody: AssignEmployeeRequest): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_ASSIGNED_EMP_FOR_ROLE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    updateSchedule(requestBody: DoctorScheduleDetails): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SCHEDULE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }
    getdoctorschedule(ScheduleRequest: ScheduleRequest): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_DOCTOR_SCHEDULE, JSON.stringify(ScheduleRequest), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getTestType(): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_TEST_TYPE,
            AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    getSearchedTermTest(request): Promise<any[]> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_SEARCH_TERM_DIAGNOSTIC_SCHEDULE,
            JSON.stringify(request), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    createDiagnosticSchedule(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CREATE_DIAGNOSTIC_SCHEDULE,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }
    insertPrecautionInDiagnostic(request): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().INSERT_PRECAUTION_IN_DIAGNOSTIC,
            JSON.stringify(request), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log("repsonse" + data);
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getAllPocs(skip: number, size: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_ALL_POC, skip, size), AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }
    getPayoutDetails(pocId) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_PAYOUT_DETAILS, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }
    updatePayoutDetails(payoutDetails: PocPayoutConfigurationDetails): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().UPDATE_PAYOUT_DETAILS, JSON.stringify(payoutDetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    setReferredByPocDetails(referredPoc: ReferredPoc) {
        this.referredByPocDetails = referredPoc;
        localStorage.setItem('superAdminReferredPoc', JSON.stringify(referredPoc));
    }

    getDoctorLeaves(doctorId, pocId) {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_DOCTOR_LEAVES, doctorId, pocId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    cancelDoctorLeave(leaveRequest) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().CANCEL_DOCTOR_LEAVE, JSON.stringify(leaveRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
}