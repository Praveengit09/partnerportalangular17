// import { element } from '@angular/core/src/render3';
import { Injectable } from "@angular/core";
import { HttpService } from "../../base/http.service";
import { AuthService } from "../../auth/auth.service";
import { URLStringFormatter } from "../../base/util/url-string-formatter";
import { AppConstants } from '../../base/appconstants';
import { AssignEmployeeRequest } from "../../model/employee/assignEmployeeRequest";
import { DoctorDetails } from '../../model/employee/doctordetails';
import { Region } from '../../model/employee/getRegion';
import { Employee } from '../../model/employee/employee';
import { HsLocalStorage } from '../../base/hsLocalStorage.service';
@Injectable()
export class EmployeeService {
    public isEmployeeModify: boolean;
    public isPocModify: boolean;
    public doctorDetail: DoctorDetails = new DoctorDetails();
    public selectedPocIndex: number;
    public employee: Employee;
    region: Region = new Region();
    pageNo: number = 0;
    errMasg: Array<string> = new Array<string>();
    constructor(
        private httpService: HttpService,
        private auth: AuthService,
        private urlStringFormatter: URLStringFormatter,
        private hsLocalStorage: HsLocalStorage
    ) { }

    setDetail() {
        let data = {
            'docDetails': this.doctorDetail,
            'isModifyEmp': this.isEmployeeModify,
            'isPocModify': this.isPocModify,
            'selectedPocIndex': this.selectedPocIndex
        };
        this.hsLocalStorage.setDataEncrypted('docDetails', data);
    }
    getDetails() {
        let data = this.hsLocalStorage.getDataEncrypted('docDetails');
        if (data) {
            this.doctorDetail = data.docDetails;
            this.isEmployeeModify = data.isModifyEmp;
            this.isPocModify = data.isPocModify;
            this.selectedPocIndex = data.selectedPocIndex;
        }
    }
    getValidatePersionalDetail(doctorDetails) {
        let showMessage = false;
        let errorMessage = new Array();
        let isError = false;
        if (doctorDetails.type == undefined || doctorDetails.type == null || doctorDetails.type < 0) {
            errorMessage[0] = "Select Employee type...!!";
        } else if (doctorDetails.title == undefined || doctorDetails.title == "undefined" || doctorDetails.title == null || doctorDetails.title == "") {
            errorMessage[0] = "Select title...!!";
        } else if (doctorDetails.firstName == undefined || doctorDetails.firstName == null || doctorDetails.firstName == "") {
            errorMessage[0] = "Enter the First Name...!!";
        } else if (doctorDetails.gender == undefined || doctorDetails.gender == null || doctorDetails.gender == "") {
            errorMessage[0] = "Select Gender...!!";
        } else if (doctorDetails.emailId == undefined || doctorDetails.emailId == null || doctorDetails.emailId == "") {
            errorMessage[0] = "Enter the email...!!";
        }
        let contactList = doctorDetails.contactList;
        for (let ic = 0; ic < contactList.length; ic++) {
            let eleLength = contactList[ic].length;
            if (eleLength > 0 && eleLength < 10) {
                errorMessage[0] = "Enter Valid Mobile No...!!";
                break;
            }
        }
        if (errorMessage.length > 0 && errorMessage[0].trim() != '') {
            isError = true;
            showMessage = true;
        }
        doctorDetails.contactList[0] == '' ? doctorDetails.contactList.splice(0, 1) : '';
        return { 'isError': isError, 'showMessage': showMessage, 'errorMessage': errorMessage };
    }
    getValidateProffesionalDetail(doctorDetails) {
        let showMessage = false;
        let errorMessage = new Array();
        let isError = false;
        if (doctorDetails && (!doctorDetails.qualificationName || doctorDetails.qualificationName.trim() == "")) {
            errorMessage[0] = "Enter the qualification...!!";
        } else if (doctorDetails && (!doctorDetails.experience || doctorDetails.experience < 0)) {
            errorMessage[0] = "Enter the experience...!!";
        }
        // else if (doctorDetails && (!doctorDetails.description || doctorDetails.description == "")) {
        //     errorMessage[0] = "Enter the description ...!!";
        // } 
        else if (doctorDetails && (!doctorDetails.serviceList || doctorDetails.serviceList.length <= 0)) {
            errorMessage[0] = "Enter the speciality...!!";
        }
        if (errorMessage.length > 0 && errorMessage[0].trim() != '') {
            isError = true;
            showMessage = true;
        }
        return { 'isError': isError, 'showMessage': showMessage, 'errorMessage': errorMessage };
    }
    getValidateAssignRole(doctorDetails) {
        let showMessage = false;
        let errorMessage = new Array();
        let isError = false;
        if (doctorDetails.employeePocMappingList.length <= 0) {
            errorMessage[0] = "Associate Atleast One POC To Proceed Ahead !!";
        } else if (doctorDetails.type != 2 && !(doctorDetails.empPersonalPocInfo && doctorDetails.empPersonalPocInfo.pocId)
            && doctorDetails.employeePocMappingList.length >= 1) {
            errorMessage[0] = "choose your default poc";
            // alert("choose your default poc");
        }
        if (errorMessage.length > 0 && errorMessage[0].trim() != '') {
            isError = true;
            showMessage = true;
        }
        return { 'isError': isError, 'showMessage': showMessage, 'errorMessage': errorMessage };
    }
    deleteEmoloyee(requestBody: any) {
        return this.httpService.httpPostPromise(this.httpService.getPaths().DELETE_EMPLOYEE, JSON.stringify(requestBody), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }
    getEmployeesList(employeeRequest: AssignEmployeeRequest): Promise<any> {
        console.log("Get employee list >> request body>>>>" + JSON.stringify(employeeRequest));
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_EMPLOYEE_LIST, JSON.stringify(employeeRequest), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getEmployeeDetails(empId): Promise<any> {
        console.log("Employee service >> Get employee details >> " + empId);
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMPLOYEE_DETAILS, empId), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getLanguages(): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_LANGUAGES, AppConstants.CONQUEST_BASE_URL_INDEX)
            .then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                return Promise.reject(err);
            });
    }

    getSpeciality(type: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_SPECIALITY + "?type=" + type, AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getdoctorpackages(doctorId: number): Promise<any[]> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTORPKS + "?doctorId=" + doctorId, AppConstants.CONQUEST_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            // if (err) {
            console.log(err);
            return Promise.reject(err);
            // }
        });
    }

    getRegion(region: Region): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REGION, JSON.stringify(region), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }
    updateEmployee(doctordetails: DoctorDetails): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_UPDATE_EMP, JSON.stringify(doctordetails), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    getEmployee(mobile: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().GET_EMPLOYEE, mobile),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    blacklistEmployee(empId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().BLACKLIST_EMPLOYEE, empId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    whitelistEmployee(empId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.urlStringFormatter.format(this.httpService.getPaths().WHITELIST_EMPLOYEE, empId),
            AppConstants.POZ_BASE_URL_INDEX).then((data) => {

                return Promise.resolve(data);

            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

}