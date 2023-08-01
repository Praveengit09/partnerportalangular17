import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { HsLocalStorage } from '../../../../base/hsLocalStorage.service';
import { RoleConstants } from '../../../../constants/auth/roleconstants';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Auth } from '../../../../model/auth/auth';
import { Doctor } from '../../../../model/employee/doctor';
import { EmployeeRequest } from '../../../../model/employee/employeerequest';
import { DoctorFavRolesRequest, DoctorTag } from '../../../../model/poc/doctorfavrolesrequest';
import { EmployeeLocal, MappingEmployee } from '../../../../model/poc/employeelocal';
import { PocDetail } from '../../../../model/poc/pocDetails';
import { ReceptionService } from '../../../../reception/reception.service';
import { SuperAdminService } from '../../../superadmin.service';
import { AuthService } from './../../../../auth/auth.service';

@Component({
  selector: 'managetagging',
  templateUrl: './managetagging.template.html',
  styleUrls: ['./managetagging.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class ManageTaggingComponent implements OnInit {
  employeeRequest: EmployeeRequest = new EmployeeRequest();
  pocId: number;
  employeeId: string;
  roleId: number;
  user: Auth;
  doctorList: Doctor[] = new Array<Doctor>();
  receptionList: any[] = [];
  cashierList: any[] = [];
  vitalList: any[] = [];
  scheduleManagerList: any[] = [];
  printprescriptionList: any[] = [];
  emptyString: string = " ";
  showSave: boolean = false;
  hideEdit: boolean = false;
  doctorRoleMapping: Array<EmployeeLocal>;
  indexreception: any;
  indexcashier: any
  indexvital: any
  indexschedule: any;
  indexprintprescription: any;
  pocDetails: PocDetail;
  isSuperAdmin: boolean;
  loginEmpId: number;
  dropdownSettings = {};

  constructor(private authService: AuthService, private superAdminService: SuperAdminService, private hsLocalStorage: HsLocalStorage,
    private receptionService: ReceptionService, private spinnerService: SpinnerService) {

  }


  ngOnInit() {
    this.isSuperAdmin = this.authService.employeeDetails.superAdmin;
    this.loginEmpId = this.authService.employeeDetails.empId;
    this.fetchPocDetails();
    this.pocId = this.pocDetails.pocId;
    console.log("pociddddddd" + this.pocId);
    this.getDoctorList();
    this.getReceptionList();
    this.getCashierList();
    this.getVitalsList();
    this.getScheduleManagerList();
    this.getPrintPrescription();


    ///////////////////////multidropdown////////////

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      closeDropDownOnSelection: true,
      allowSearchFilter: true,
      enableCheckAll: false,
    };
  }
  fetchPocDetails() {
    this.pocDetails = this.superAdminService.pocDetail;
    if (this.pocDetails) {
      let data = { 'pocDetail': this.pocDetails };
      this.hsLocalStorage.setDataEncrypted('pocDetailloc', data);
    } else {
      this.pocDetails = this.hsLocalStorage.getDataEncrypted('pocDetailloc').pocDetail;
      this.superAdminService.pocDetail = this.pocDetails;
    }
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }


  getDoctorList() {
    this.receptionService.getDoctorList(this.pocId, 0, 0).then(data => {
      this.doctorList = data;
      this.getEmpAssociationWithDoc();
    })
  }

  getReceptionList() {
    // this.employeeRequest.pocIdList[0] = this.authService.selectedPocDetails.pocId;
    this.employeeRequest.pocIdList[0] = this.pocId;
    this.employeeRequest.roleId = RoleConstants.receptionRoleId;
    this.employeeRequest.superAdmin = false;
    this.superAdminService.getEmployeeBasedOnRole(this.employeeRequest).then(data => {
      let respcnList = data;
      if (respcnList) {
        respcnList.forEach(element => {
          let recepList = this.receptionList.filter(e => {
            return element.empId == e.empId;
          }).length > 0;
          !recepList ? this.receptionList.push(this.getEmployee(element, RoleConstants.receptionRoleId)) : '';
        });
        //console.log(this.receptionList)
      }
      // this.receptionList = data
      for (let i = 0; i < this.receptionList.length; i++) {
        this.receptionList[i].id = this.receptionList[i].empId;
        this.receptionList[i].itemName = this.receptionList[i] && (this.receptionList[i].firstName ? this.receptionList[i].firstName : ' ')
          + " " + (this.receptionList[i].lastName ? this.receptionList[i].lastName : '');
      }
    });
  }
  getCashierList() {
    //this.employeeRequest.pocIdList[0] = this.authService.selectedPocDetails.pocId;
    this.employeeRequest.pocIdList[0] = this.pocId;

    this.employeeRequest.roleId = RoleConstants.cashierRoleId;
    this.employeeRequest.superAdmin = false;
    this.superAdminService.getEmployeeBasedOnRole(this.employeeRequest).then(data => {
      let allcashierList = data;
      if (allcashierList) {
        allcashierList.forEach(element => {
          let isIncluded = this.cashierList.filter(ex => {
            return element.empId == ex.empId;
          }).length > 0;
          !isIncluded ? this.cashierList.push(this.getEmployee(element, RoleConstants.cashierRoleId)) : '';
        })
      }
      console.log(allcashierList)
      for (let i = 0; i < this.cashierList.length; i++) {
        this.cashierList[i].id = this.cashierList[i].empId;
        this.cashierList[i].itemName = this.cashierList[i] && (this.cashierList[i].firstName ? this.cashierList[i].firstName : ' ')
          + " " + (this.cashierList[i].lastName ? this.cashierList[i].lastName : ' ');
      }
    });
  }
  getVitalsList() {
    // this.employeeRequest.pocIdList[0] = this.authService.selectedPocDetails.pocId;
    this.employeeRequest.pocIdList[0] = this.pocId;

    this.employeeRequest.roleId = RoleConstants.nurseRoleId;
    this.employeeRequest.superAdmin = false;
    this.superAdminService.getEmployeeBasedOnRole(this.employeeRequest).then(data => {
      let allvitalList = data;
      if (allvitalList) {
        allvitalList.forEach(e => {
          let vitalList = this.vitalList.filter(ex => {
            return e.empId == ex.empId;
          }).length > 0;
          !vitalList ? this.vitalList.push(this.getEmployee(e, RoleConstants.nurseRoleId)) : '';
        })
        for (let i = 0; i < this.vitalList.length; i++) {
          this.vitalList[i].id = this.vitalList[i].empId;
          this.vitalList[i].itemName = this.vitalList[i] && (this.vitalList[i].firstName ? this.vitalList[i].firstName : ' ') + " " +
            (this.vitalList[i].lastName ? this.vitalList[i].lastName : '');
        }
      }
    });
  }
  getScheduleManagerList() {
    //this.employeeRequest.pocIdList[0] = this.authService.selectedPocDetails.pocId;
    this.employeeRequest.pocIdList[0] = this.pocId;

    this.employeeRequest.roleId = RoleConstants.scheduleRoleId;
    this.employeeRequest.superAdmin = false;
    this.superAdminService.getEmployeeBasedOnRole(this.employeeRequest).then(data => {
      let allscheduleManagerList = data;
      if (allscheduleManagerList) {
        allscheduleManagerList.forEach(e => {
          let scheduleList = this.scheduleManagerList.filter(ex => {
            return e.empId == ex.empId;
          }).length > 0;
          !scheduleList ? this.scheduleManagerList.push(this.getEmployee(e, RoleConstants.scheduleRoleId)) : '';
        })
        for (let i = 0; i < this.scheduleManagerList.length; i++) {
          this.scheduleManagerList[i].id = this.scheduleManagerList[i].empId;
          this.scheduleManagerList[i].itemName = this.scheduleManagerList[i] && (this.scheduleManagerList[i].firstName ? this.scheduleManagerList[i].firstName : " ")
            + " " + (this.scheduleManagerList[i].lastName ? this.scheduleManagerList[i].lastName : '');
        }
      }
    });
  }

  getPrintPrescription() {
    //this.employeeRequest.pocIdList[0] = this.authService.selectedPocDetails.pocId;
    this.employeeRequest.pocIdList[0] = this.pocId;

    this.employeeRequest.roleId = RoleConstants.printPrescriptionRoleId;
    this.employeeRequest.superAdmin = false;
    this.superAdminService.getEmployeeBasedOnRole(this.employeeRequest).then(data => {
      let allprintprescriptionList = data;
      if (allprintprescriptionList) {
        allprintprescriptionList.forEach(e => {
          let printList = this.printprescriptionList.filter(ex => {
            return e.empId == ex.empId;
          }).length > 0;
          !printList ? this.printprescriptionList.push(this.getEmployee(e, RoleConstants.printPrescriptionRoleId)) : '';
        })
        for (let i = 0; i < this.printprescriptionList.length; i++) {
          this.printprescriptionList[i].id = this.printprescriptionList[i].empId;
          this.printprescriptionList[i].itemName = this.printprescriptionList[i] && (this.printprescriptionList[i].firstName ? this.printprescriptionList[i].firstName : ' ') + " " +
            (this.printprescriptionList[i].lastName ? this.printprescriptionList[i].lastName : '');
        }
      }
    });
  }

  getEmpAssociationWithDoc() {
    this.spinnerService.start();
    this.superAdminService.getEmployeeAssociationWithDoc(this.pocId, 0).then(data => {
      console.log("data from Server in getEmpAssociationWithDoc::" + JSON.stringify(data));
      this.doctorRoleMapping = this.convertServerMappingToLocal(data);
      console.log("DoctorRoleMapping::" + JSON.stringify(this.doctorRoleMapping));
      this.spinnerService.stop();
    });
  }

  onReceptionChange(index: number, mappingIndex: number) {
    if (index >= 0 && mappingIndex >= 0) {
      this.doctorRoleMapping[mappingIndex].receptionist = this.receptionList[index - 1];
    }
    console.log("DoctorroleMapping in onReceptionChange::" + JSON.stringify(this.doctorRoleMapping));
  }
  onCashierChange(index: number, mappingIndex: number) {
    if (index >= 0 && mappingIndex >= 0) {
      this.doctorRoleMapping[mappingIndex].cashier = this.cashierList[index - 1];
    }
    console.log("DoctorroleMapping in onCashierChange::" + JSON.stringify(this.doctorRoleMapping));
  }

  onVitalChange(index: number, mappingIndex: number) {
    if (index >= 0 && mappingIndex >= 0) {
      this.doctorRoleMapping[mappingIndex].vital = this.vitalList[index - 1];
    }
  }

  onScheduleChange(index: number, mappingIndex: number) {
    if (index >= 0 && mappingIndex >= 0) {
      this.doctorRoleMapping[mappingIndex].scheduleManager = this.scheduleManagerList[index - 1];
    }
  }

  onPrintPrescriptionChange(index: number, mappingIndex: number) {
    if (index >= 0 && mappingIndex >= 0) {
      this.doctorRoleMapping[mappingIndex].printPrescription = this.printprescriptionList[index - 1];
    }
  }

  onSave(doctorMapping: EmployeeLocal, k) {
    console.log('line 256');
    $("#receptionLabel" + k).show();
    $("#cashierLabel" + k).show();
    $("#vitalLabel" + k).show();
    $("#scheduleLabel" + k).show();
    $("#prescriptionLabel" + k).show();
    $("#receptionFrom" + k).hide();
    $("#cashierFrom" + k).hide();
    $("#vitalFrom" + k).hide();
    $("#scheduleFrom" + k).hide();
    $("#prescriptionFrom" + k).hide();
    $("#editbutton" + k).show();
    $("#singlebutton" + k).hide();

    console.log("On save request before trasnform:>>" + JSON.stringify(doctorMapping));
    let serverMapping: Array<DoctorFavRolesRequest> = this.convertLocalMappingToServer(doctorMapping);
    console.log('line 272');
    console.log("On save request bodyyyyy:>>" + JSON.stringify(serverMapping));
    this.spinnerService.start();
    this.superAdminService.updateEmployeeAssociationWithDoc(serverMapping).then(data => {
      if (data.statusCode == 200 || data.statusCode == 201) {
        console.log('line 277');
        this.spinnerService.stop();
        // this.showSave = false;
        // this.hideEdit = false;
        this.getEmpAssociationWithDoc();
        console.log('line 282');
      }
    })
  }

  onEdit(doctorMapping, k) {
    $("#receptionLabel" + k).hide();
    $("#cashierLabel" + k).hide();
    $("#vitalLabel" + k).hide();
    $("#scheduleLabel" + k).hide();
    $("#prescriptionLabel" + k).hide();
    $("#editbutton" + k).hide();
    $("#receptionFrom" + k).show();
    $("#cashierFrom" + k).show();
    $("#vitalFrom" + k).show();
    $("#scheduleFrom" + k).show();
    $("#prescriptionFrom" + k).show();
    $("#singlebutton" + k).show();
    //this.showSave = true;
    //this.hideEdit = true;
    if (doctorMapping.receptionist != undefined && doctorMapping.receptionist != null) {
      this.indexreception = doctorMapping.receptionist.findIndex(x => x.roleId == doctorMapping.receptionist.roleId);
    } else {
      this.indexreception = -1;
    }

    if (doctorMapping.cashier != undefined && doctorMapping.cashier != null) {
      this.indexcashier = doctorMapping.cashier.findIndex(x => x.roleId == doctorMapping.cashier.roleId);
    }
    else {
      this.indexcashier = -1;
    }
    if (doctorMapping.vital != undefined && doctorMapping.vital != null) {
      this.indexvital = doctorMapping.vitalList && doctorMapping.vitalList.findIndex(x => x.roleId == doctorMapping.vital.roleId);
    } else {
      this.indexvital = -1;
    }
    if (doctorMapping.scheduleManager != undefined && doctorMapping.scheduleManager != null) {
      this.indexschedule = doctorMapping.scheduleManagerList && doctorMapping.scheduleManagerList.findIndex(x => x.roleId == doctorMapping.scheduleManager.roleId);
    } else {
      this.indexschedule = -1;
    }
    if (doctorMapping.printPrescription != undefined && doctorMapping.printPrescription != null) {
      this.indexprintprescription = doctorMapping.printprescriptionList && doctorMapping.printprescriptionList.findIndex(x => x.roleId == doctorMapping.printPrescription.roleId);
    }
    else {
      this.indexprintprescription = -1;
    }

    setTimeout(() => {
      $("#receptionFrom" + k).val(this.indexreception + 1);
      $("#cashierFrom" + k).val(this.indexcashier + 1);
      $("#vitalFrom" + k).val(this.indexvital + 1);
      $("#scheduleFrom" + k).val(this.indexschedule + 1);
      $("#prescriptionFrom" + k).val(this.indexprintprescription + 1);
    }, 100)
    console.log("employee" + JSON.stringify(doctorMapping.receptionist))

  }


  convertServerMappingToLocal(serverMappings: Array<DoctorFavRolesRequest>): Array<EmployeeLocal> {
    let localMappings: Array<EmployeeLocal> = new Array();
    if (serverMappings != undefined && serverMappings != null && serverMappings.length > 0) {
      serverMappings.forEach(employeeItem => {
        if (employeeItem != undefined && employeeItem != null
          && employeeItem.doctorTag != undefined
          && employeeItem.doctorTag != null) {
          // employeeItem.doctorTag.forEach(doctorItem => {
          let matchedDoctor = localMappings.find(x => x.doctor.doctorId == employeeItem.doctorTag.doctorId);
          if (matchedDoctor != undefined && matchedDoctor != null) {
            let index = localMappings.indexOf(matchedDoctor);
            this.mapRoles(employeeItem.roleId, matchedDoctor, this.getEmployee(employeeItem, employeeItem.roleId));
            // tmpFavEmployees
            localMappings[index] = matchedDoctor;
          } else {
            matchedDoctor = new EmployeeLocal();
            matchedDoctor.doctor = employeeItem.doctorTag;
            this.mapRoles(employeeItem.roleId, matchedDoctor, this.getEmployee(employeeItem, employeeItem.roleId));
            localMappings.push(matchedDoctor);
          }

          // });
        }
      });
    }

    this.doctorList.forEach(doctor => {
      let matchedDoctor = localMappings.find(x => x.doctor.doctorId == doctor.empId);
      if (matchedDoctor == undefined || matchedDoctor == null) {
        matchedDoctor = new EmployeeLocal();
        matchedDoctor.doctor = new DoctorTag();
        matchedDoctor.doctor.doctorId = doctor.empId;
        matchedDoctor.doctor.firstName = doctor.firstName;
        matchedDoctor.doctor.lastName = doctor.lastName;
        matchedDoctor.doctor.title = doctor.title;
        matchedDoctor.doctor.imageUrl = doctor.imageUrl;
        localMappings.push(matchedDoctor);
      }
    });
    return localMappings;
  }
  private setReceptionChoice(matchedDoctor, tmpFavEmployees) {
    let selectedIndex = matchedDoctor.receptionist.findIndex(e => { return tmpFavEmployees.empId == e.empId; });
    let receptionIndex = this.receptionList.findIndex(e => { return tmpFavEmployees.empId == e.empId; });
    tmpFavEmployees.id = tmpFavEmployees.empId;
    tmpFavEmployees.itemName = tmpFavEmployees.firstName + " " + (tmpFavEmployees.lastName ? tmpFavEmployees.lastName : '');
    if (selectedIndex == -1) {
      this.receptionList.splice(receptionIndex, 1, tmpFavEmployees);
      matchedDoctor.receptionist.push(tmpFavEmployees)
    }
  }
  private setCashierChoice(matchedDoctor, tmpFavEmployees) {
    let selectedIndex = matchedDoctor.cashier.findIndex(e => { return tmpFavEmployees.empId == e.empId; });
    let cashierIndex = this.cashierList.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    tmpFavEmployees.id = tmpFavEmployees.empId;
    tmpFavEmployees.itemName = tmpFavEmployees.firstName + " " + (tmpFavEmployees.lastName ? tmpFavEmployees.lastName : '');
    if (selectedIndex == -1) {
      this.cashierList.splice(cashierIndex, 1, tmpFavEmployees);
      matchedDoctor.cashier.push(tmpFavEmployees)
    }
  }
  private setVitalChoice(matchedDoctor, tmpFavEmployees) {
    let selectedIndex = matchedDoctor.vital.findIndex(e => { return tmpFavEmployees.empId == e.empId; });
    let vitalIndex = this.vitalList.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    tmpFavEmployees.id = tmpFavEmployees.empId;
    tmpFavEmployees.itemName = tmpFavEmployees.firstName + " " + (tmpFavEmployees.lastName ? tmpFavEmployees.lastName : '');
    if (selectedIndex == -1) {
      this.vitalList.splice(vitalIndex, 1, tmpFavEmployees);
      matchedDoctor.vital.push(tmpFavEmployees)
    }
  }
  private setScheduleChoce(matchedDoctor, tmpFavEmployees) {
    let selectedIndex = matchedDoctor.scheduleManager.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    let scheduleIndex = this.scheduleManagerList.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    tmpFavEmployees.id = tmpFavEmployees.empId
    tmpFavEmployees.itemName = tmpFavEmployees.firstName + " " + (tmpFavEmployees.lastName ? tmpFavEmployees.lastName : '');
    if (selectedIndex == -1) {
      this.scheduleManagerList.splice(scheduleIndex, 1, tmpFavEmployees);
      matchedDoctor.scheduleManager.push(tmpFavEmployees)
    }
  }
  private setPrintPrescriptionChoce(matchedDoctor, tmpFavEmployees) {
    let selectedIndex = matchedDoctor.printPrescription.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    let scheduleIndex = this.printprescriptionList.findIndex(e => { return tmpFavEmployees.empId == e.empId });
    tmpFavEmployees.id = tmpFavEmployees.empId
    tmpFavEmployees.itemName = tmpFavEmployees.firstName + " " + (tmpFavEmployees.lastName ? tmpFavEmployees.lastName : '');
    if (selectedIndex == -1) {
      this.printprescriptionList.splice(scheduleIndex, 1, tmpFavEmployees);
      matchedDoctor.printPrescription.push(tmpFavEmployees)
    }
  }

  private mapRoles(roleId, matchedDoctor, tmpFavEmployees) {
    switch (roleId) {
      case RoleConstants.receptionRoleId:
        this.setReceptionChoice(matchedDoctor, tmpFavEmployees);
        // matchedDoctor.receptionist.push(tmpFavEmployees);
        break;
      case RoleConstants.nurseRoleId:
        // matchedDoctor.vital = tmpFavEmployees;
        this.setVitalChoice(matchedDoctor, tmpFavEmployees);
        break;
      case RoleConstants.cashierRoleId:
        this.setCashierChoice(matchedDoctor, tmpFavEmployees);
        // matchedDoctor.cashier = tmpFavEmployees;
        break;
      case RoleConstants.scheduleRoleId:
        this.setScheduleChoce(matchedDoctor, tmpFavEmployees);
        // matchedDoctor.scheduleManager = tmpFavEmployees;
        break;
      case RoleConstants.printPrescriptionRoleId:
        this.setPrintPrescriptionChoce(matchedDoctor, tmpFavEmployees);
        // matchedDoctor.printPrescription = tmpFavEmployees;
        break;
      default:
        break;
    }
  }

  private getMapOfRoles(localMapping: EmployeeLocal): Map<number, MappingEmployee> {
    let rolesForDoctor = new Map<number, MappingEmployee>();
    if (localMapping.receptionist != undefined && localMapping.receptionist != null) {
      localMapping.receptionist.forEach((e, i) => {
        rolesForDoctor.set(Number.parseInt(RoleConstants.receptionRoleId + '' + i), this.getEmployee(e, RoleConstants.receptionRoleId));
      });
    }
    if (localMapping.cashier != undefined && localMapping.cashier != null) {
      localMapping.cashier.forEach((e, i) => {
        rolesForDoctor.set(Number.parseInt(RoleConstants.cashierRoleId + '' + i), this.getEmployee(e, RoleConstants.cashierRoleId));
      });

    }
    if (localMapping.vital != undefined && localMapping.vital != null) {
      localMapping.vital.forEach((e, i) => {
        rolesForDoctor.set(Number.parseInt(RoleConstants.nurseRoleId + '' + i), this.getEmployee(e, RoleConstants.nurseRoleId));
      });
    }

    if (localMapping.scheduleManager != undefined && localMapping.scheduleManager != null) {
      localMapping.scheduleManager.forEach((element, i) => {
        rolesForDoctor.set(Number.parseInt(RoleConstants.scheduleRoleId + '' + i), this.getEmployee(element, RoleConstants.scheduleRoleId));
      });

    }
    if (localMapping.printPrescription != undefined && localMapping.printPrescription != null) {
      localMapping.printPrescription.forEach((element, i) => {
        rolesForDoctor.set(Number.parseInt(RoleConstants.printPrescriptionRoleId + '' + i + '51'), this.getEmployee(element, RoleConstants.printPrescriptionRoleId));
      });

    }
    rolesForDoctor.forEach((value: MappingEmployee, key: number) => {
      console.log("Maps--->" + key, JSON.stringify(value));
    });
    return rolesForDoctor;
  }

  private getEmployee(emp: any, roleId?): MappingEmployee {
    let employee = new MappingEmployee();
    employee.empId = emp.empId;
    employee.firstName = emp.firstName;
    employee.lastName = emp.lastName;
    employee.title = emp.title;
    roleId ? employee.roleid = roleId : '';
    return employee;
  }

  convertLocalMappingToServer(localMapping: EmployeeLocal): Array<DoctorFavRolesRequest> {
    let serverMapping: Array<DoctorFavRolesRequest> = new Array<DoctorFavRolesRequest>();
    console.log('line' + 520);
    if (localMapping != undefined && localMapping != null) {
      console.log('line' + 522);
      let rolesForDoctor: Map<number, MappingEmployee> = this.getMapOfRoles(localMapping);
      console.log('line' + 524);
      if (rolesForDoctor != undefined
        && rolesForDoctor != null && rolesForDoctor.size > 0) {
        console.log('line' + 527 + 'rolesForDoctor--->', rolesForDoctor);
        rolesForDoctor.forEach((item: MappingEmployee, roleId: number) => {
          console.log('line' + 529 + 'item--->', item);
          if (item) {
            console.log('line' + 531 + 'serverMapping--->', serverMapping);
            let matchedEmployee = serverMapping.find(x => x.empId == item.empId);
            console.log('line' + 533 + 'matchedEmployee--->', matchedEmployee);


            console.log('line' + 536 + 'serverMapping--->', serverMapping);
            let index = serverMapping.indexOf(matchedEmployee);
            console.log('line' + 538 + 'index--->', index);

            // if (matchedEmployee.rolesForDoctorsList == undefined || matchedEmployee.rolesForDoctorsList == null) {
            //   matchedEmployee.rolesForDoctorsList = new Array();
            // }
            // let doctorRoleTemp = new RolesForDoctorsList();
            // doctorRoleTemp.roleId = roleId;
            // doctorRoleTemp.doctorTagList = new DoctorTag();
            // doctorRoleTemp.doctorTagList.push(localMapping.doctor);
            // matchedEmployee.rolesForDoctorsList.push(doctorRoleTemp);
            // doctorRoleTemp.doctorTagList
            console.log('line' + 549 + 'matchedEmployee--->', matchedEmployee);

            matchedEmployee = new DoctorFavRolesRequest();
            console.log('line' + 552 + 'matchedEmployee--->', matchedEmployee);
            try {
              matchedEmployee.empId = item.empId;
            } catch (error) {
              console.log(error)
            }
            try {
              matchedEmployee.firstName = item.firstName;
            } catch (error) {
              console.log(error)
            }


            try {
              matchedEmployee.lastName = item.lastName;
            } catch (error) {
              console.log(error)
            }

            try {
              matchedEmployee.title = item.title;
            } catch (error) {
              console.log(error)
            }

            try {
              matchedEmployee.pocId = this.pocId;
            } catch (error) {
              console.log(error)
            }

            try {
              matchedEmployee.roleId = item.roleid;
            } catch (error) {
              console.log(error)
            }

            try {
              matchedEmployee.doctorTag = new DoctorTag();
            } catch (error) {
              console.log(error)
            }

            try {
              matchedEmployee.doctorTag = localMapping.doctor;
            } catch (error) {
              console.log(error)
            }

            console.log('line ' + 601 + ' matchedEmployee-->', matchedEmployee);
            try {
              serverMapping.push(matchedEmployee);
            } catch (error) {
              console.log(error)
            }
            console.log('line ' + 607 + ' serverMapping-->', serverMapping);

          } else alert(item + 'Item not found')
        });

      }
      else {
        let matchedEmployee = new DoctorFavRolesRequest();
        matchedEmployee.pocId = this.pocId;
        matchedEmployee.doctorTag = new DoctorTag();
        matchedEmployee.doctorTag = localMapping.doctor;
        serverMapping.push(matchedEmployee);
      }
    }
    return serverMapping;
  }

}