import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service'
import { CommonUtil } from '../../../../base/util/common-util';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { SuperAdminService } from '../../../superadmin.service';
import { Role } from "../../../../model/employee/role";
import { AssignEmployeeRequest } from "../../../../model/employee/assignEmployeeRequest";
import { PocDetail } from '../../../../model/poc/pocDetails';
import { Employee } from "../../../../model/employee/employee";
import { ServiceItem } from "../../../../model/service/serviceItem";
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';

@Component({
    selector: 'pocemployees',
    templateUrl: './pocemployees.template.html',
    styleUrls: ['./pocemployees.style.scss'],
    encapsulation: ViewEncapsulation.None,

})
export class PocEmployeesComponent implements OnInit {

    rolesList: Role[] = [];
    roles: Role[] = [];
    indexForRole: number = 0;
    indexForRole1: number = -1;
    roleId: number;
    serviceId: number;
    pocDetails: PocDetail;
    employeeList: Employee[] = new Array<Employee>();
    serviceList: ServiceItem[] = new Array<ServiceItem>();
    perPage: number = 10;
    total: number = 0;
    scrollPosition: number;
    time: any;
    offset: number = 50;
    fromIndex: number;
    contactList = new Array();

    columns: any[] = [
        {
            display: 'Employee',
            variable: 'firstName lastName',
            filter: 'text',
            sort: false
        },
        {
            display: 'Mobile',
            variable: 'tempContactList',
            filter: 'text',
            sort: false
        },
        {
            display: 'Email',
            variable: 'emailId',
            filter: 'text',
            sort: false
        },
    ];

    sorting: any = {
        column: 'empId',
        descending: true
    };

    constructor(config: AppConfig,
        private superAdminService: SuperAdminService, private auth: AuthService, private hsLocalStorage: HsLocalStorage,
        private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    }

    ngOnInit() {
        this.pocDetails = this.superAdminService.pocDetail;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (this.pocDetails) {
            let data = { 'pocDetail': this.pocDetails };
            this.hsLocalStorage.saveComponentData(data);
        } else {
            this.pocDetails = this.hsLocalStorage.getComponentData().pocDetail;
            this.superAdminService.pocDetail = this.pocDetails;
        }
        this.getRoles();
        console.log("getrole" + JSON.stringify(this.getRoles))
    }
    getRoles() {
        this.superAdminService.getAllRoles(this.auth.userAuth.hasSuperAdminRole, this.auth.userAuth.pocId).then(rolesList => {
            for (let i = 0; i < rolesList.length; i++) {
                if (rolesList[i].roleId != 1) {
                    this.roles.push(rolesList[i]);
                }

            }
            this.rolesList = this.roles;
            let request: AssignEmployeeRequest = new AssignEmployeeRequest();
            request.pocIdList = new Array<number>();
            request.pocIdList.push(this.pocDetails.pocId);
            request.roleId = this.rolesList[0].roleId;
            request.serviceId = 0;
            request.superAdmin = false;
            this.superAdminService.getEmployeesForRole(request).then(employeeList => {
                this.employeeList = employeeList;
                this.employeeList.forEach(e => {
                    e.tempContactList = new Array();
                    e.contactList.forEach(ee => {
                        if (ee) {
                            e.tempContactList.push(ee);
                        }
                    })
                })
            });
        });

    }
    onRoleChange(index: number): void {
        this.roleId = (index >= 0 ? this.rolesList[index].roleId : index);
        console.log("here are the roleId==>>>" + JSON.stringify(this.pocDetails) + this.roleId)
        let request: AssignEmployeeRequest = new AssignEmployeeRequest();
        request.pocIdList = new Array<number>();
        request.pocIdList.push(this.pocDetails.pocId);
        request.roleId = this.roleId;
        request.serviceId = 0;
        request.superAdmin = false;
        if (index != null) {
            this.superAdminService.getEmployeesForRole(request).then(employeeList => {
                this.employeeList = employeeList;
                if (this.roleId == 3 && this.pocDetails) {
                    this.serviceList = new Array();
                    this.employeeList.forEach(emp => {
                        let empPoc = emp.employeePocMappingList.filter(poc => poc.pocId == this.pocDetails.pocId)[0];
                        empPoc.serviceList.forEach(service => {
                            let tempServ = this.pocDetails.serviceList.filter(s => service.serviceId == s.serviceId)[0];
                            if (tempServ) {
                                this.serviceList.push(tempServ);
                            }
                        });
                    });
                    this.serviceList = Array.from(new Set(this.serviceList).values());
                }
                this.employeeList.forEach(e => {
                    e.tempContactList = new Array();
                    e.contactList.forEach(ex => { if (ex) { e.tempContactList.push(ex); } })
                })
            });
        }

    }
    onSearchChange(index: number): void {
        console.log("here is the console")
        this.serviceId = (index >= 0 ? this.serviceList[index].serviceId : 0);
        let request: AssignEmployeeRequest = new AssignEmployeeRequest();
        request.pocIdList = new Array<number>();
        request.pocIdList.push(this.pocDetails.pocId);
        request.roleId = this.roleId;
        request.serviceId = this.serviceId
        request.superAdmin = false;
        if (index != null) {
            this.superAdminService.getEmployeesForRole(request).then(employeeList => {
                this.employeeList = employeeList;
                this.employeeList.forEach(e => {
                    e.tempContactList = new Array();
                    e.contactList.forEach(ex => { if (ex) { e.tempContactList.push(ex); } })
                })
            });
        }
    }
}