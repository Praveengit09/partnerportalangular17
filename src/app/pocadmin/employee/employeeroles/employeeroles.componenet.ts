import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { EmployeeService } from "../../../superadmin/employee/employee.service";
import { SuperAdminService } from "../../../superadmin/superadmin.service";
import { AuthService } from "../../../auth/auth.service";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";
import { HsLocalStorage } from "../../../base/hsLocalStorage.service";
import { DoctorServiceDetail } from "../../../model/employee/doctorServiceDetail";
import { EmployeePocMapping } from "../../../model/employee/employeepocmapping";
import { DoctorDetails } from "../../../model/employee/doctordetails";
import { PocSearch } from "../../../model/poc/pocSearch";
import { EmployeeType } from "../../../constants/common/employeeType.const";
import { DoctorParticipationData } from "../../../model/employee/doctorparticipationdata";
import { HSMargin } from "../../../model/poc/margin";
import { Router } from "@angular/router";
import { PocAdviseData } from "../../../model/poc/poc-advise-data";

@Component({
  selector: 'employeeroles',
  templateUrl: './employeeroles.template.html',
  styleUrls: ['./employeeroles.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmployeeRolesComponent {

  isError: boolean;
  showMessage: boolean;
  errorMessage: Array<string>;
  isErrorPoc: boolean;
  errorMessagePoc: Array<string>;
  showMessagePoc: boolean;
  @Input() pageChangeCall: any;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();

  empId: number;
  isPoc: boolean;
  isEmployeeModify: boolean;
  isSuperAdmin: boolean;
  isPocRollEdit: boolean;
  selectedPocDetail: EmployeePocMapping = new EmployeePocMapping();
  doctorDetails: DoctorDetails = new DoctorDetails();
  roleList = new Array();
  roleIdList: Array<number> = new Array<number>();
  roleIdName: Array<string> = new Array<string>();
  assignedSuperRoles: number[];
  defaultPocId = -1;
  tempIndex: number = -1;
  doctorJoinedPocList: Array<EmployeePocMapping> = [];
  doctorJoinedPocIdList: Array<number> = [];
  saasSubscriber: boolean = false;


  doctorRoleObj = {
    roleId: 3,
    roleName: "Doctor",
    type: 2,
    visibility: false
  };
  pocSearchPlaceHolder = "Enter Centre Name";
  EmployeeType = EmployeeType;

  constructor(private employeeService: EmployeeService,
    private superAdminService: SuperAdminService,
    private auth: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private hsLocalStorage: HsLocalStorage) {
    if (this.employeeService.isEmployeeModify == undefined) {
      //on refresh getting data from localstorage to service
      employeeService.getDetails();
    }
    this.isEmployeeModify = this.employeeService.isEmployeeModify;
    this.empId = this.auth.userAuth.employeeId;
    this.isSuperAdmin = this.auth.userAuth.hasSuperAdminRole;
    this.saasSubscriber = this.auth.selectedPocDetails ? this.auth.selectedPocDetails.saasSubscriber : false;

    if (!this.isSuperAdmin) {
      //if loggedin as POCAdmin then capture current pocDetails
      this.selectedPocDetail = this.auth.userAuth.selectedPoc;
    }

    this.doctorDetails = this.employeeService.doctorDetail;
    //gathering service list by clearing margins for base servicelist
    let tServiceList = new Array<DoctorServiceDetail>()
    if (this.doctorDetails && this.doctorDetails.serviceList)
      this.doctorDetails.serviceList.forEach(speciality => {
        let specialityObj: DoctorServiceDetail = new DoctorServiceDetail();
        specialityObj.serviceName = speciality.serviceName;
        specialityObj.serviceId = speciality.serviceId;
        tServiceList.push(specialityObj);
      });
    this.doctorDetails.serviceList = tServiceList;
    employeeService.doctorDetail = this.doctorDetails;
  }

  ngOnInit(): void {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "o/";
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage; // Gecko, WebKit, Chrome <34
    });
    //getting data for modify and gathering localstorage data
    if (this.isEmployeeModify == true || this.isEmployeeModify == undefined) {
      this.employeeService.setDetail();
      if (this.doctorDetails) {
        let data = { pocDetails: this.doctorDetails };
        this.hsLocalStorage.saveComponentData(data);
      } else {
        this.doctorDetails = this.hsLocalStorage.getComponentData().pocDetails;
        this.employeeService.doctorDetail = this.doctorDetails;
      }
      this.hideModals();
    }
    //get default poc id
    if (this.doctorDetails.empPersonalPocInfo) {
      this.defaultPocId = this.doctorDetails.empPersonalPocInfo.pocId;
    }
    if (this.doctorDetails && this.doctorDetails.employeePocMappingList != undefined) {
      this.doctorJoinedPocList = this.doctorDetails.employeePocMappingList;
      let tempPocIdList = new Array();
      this.doctorJoinedPocList.forEach(poc => { tempPocIdList.push(poc.pocId); });

      console.log(this.doctorJoinedPocList);
      // filter servicelist by common for poc and doctor for every poc
      this.getPocDetails(tempPocIdList, 0);
    }
    //fetching All Roles list
    this.getRollList();
  }
  hideModals() {
    $(".modal").on("hidden.bs.modal", e => {
      this.closePopUp();
      $("#selectbasic").prop("selectedIndex", -1);
      $(".custom_chk input[type='checkbox'] ").prop("checked", false);
    });
  }
  ngOnDestroy(): void {
    this.employeeService.doctorDetail = this.doctorDetails;
  }

  getRollList() {
    this.spinnerService.start();
    this.superAdminService.getAllRoles(this.isSuperAdmin, this.auth.userAuth.pocId).then(data => {
      this.roleList = data;
      this.roleList.sort((a, b) => { return a.roleName.localeCompare(b.roleName); });
      this.filterRoleByDoctorType();
      this.spinnerService.stop();
    }).catch(err => {
      this.spinnerService.stop();
    });
  }
  closePopUp() {
    this.roleIdList = new Array();
    this.roleIdName = new Array();
  }
  onEditpoc(pocIndex) {
    this.isPocRollEdit = true;
    this.assignedSuperRoles = new Array<number>();
    this.employeeService.selectedPocIndex = pocIndex;
    this.employeeService.doctorDetail = this.doctorDetails;
    this.updatePoc(this.doctorJoinedPocList[pocIndex]);
  }
  updatePoc(event: EmployeePocMapping) {
    this.roleIdList = new Array<number>();
    this.roleIdName = new Array<string>();
    this.tempIndex = 0;
    if (event) {
      this.selectedPocDetail = event;
      this.selectRoles();
    }
  }
  selectRoles() {
    if (this.isPocRollEdit) {
      (<any>$("#myModal47")).modal("show");
    }
    this.filterRoleByDoctorType();
    if (this.selectedPocDetail) {
      let selRoleId = this.selectedPocDetail.roleIdList;
      let selRoleName = this.selectedPocDetail.roleIdName;
      if (!this.roleIdList) {
        this.roleIdList = [];
      }
      if (!this.roleIdName) {
        this.roleIdName = [];
      }
      if (selRoleId) {
        this.roleIdList = (selRoleId);
      }
      if (selRoleName) {
        this.roleIdName = (selRoleName);
      }
      if (this.selectedPocDetail.roleIdList) {
        this.selectedPocDetail.roleIdList.forEach(roleid => {
          let obj = this.roleList.find(o => o.roleId === roleid);
          let objIndex = this.roleList.indexOf(obj);
          if (objIndex != -1) {
            $("#" + objIndex).prop("checked", true);
          }
          this.isPoc = true;
          // deldete for PocAdmin Role
          if (!this.isSuperAdmin && obj && (obj.type == 0 || obj.type == 1)) {
            this.assignedSuperRoles.push(obj.roleId);
          }
        });
      }

    } else {
      this.isPoc = false;
    }

  }

  filterRoleByDoctorType() {
    if (this.doctorDetails.type == EmployeeType.APPUSER) {
      //removing doctor role in roleList
      this.roleList = this.roleList.filter(e => { return e.roleId != this.doctorRoleObj.roleId; });
    }
    else if (this.doctorDetails.type == EmployeeType.DOCTOR) {
      //adding doctor role in roleList
      let roleListDoc = this.roleList.filter(e => { return this.doctorRoleObj.roleId == e.roleId; }).length > 0;
      !roleListDoc ? this.roleList.push(this.doctorRoleObj) : "";
    }
    this.doctorJoinedPocList.forEach((e, ix) => {
      if (this.doctorDetails.type == EmployeeType.APPUSER) {
        //removing Doctor Role From Every Poc
        e.roleIdList ? (e.roleIdList = e.roleIdList.filter(ex => { return ex != 3; })) : "";
        e.roleIdName ? (e.roleIdName = e.roleIdName.filter(ex => { return ex != "Doctor"; })) : "";
      } else if (this.doctorDetails.type == EmployeeType.DOCTOR) {
        //adding Doctor role for Every Poc
        if (!e.roleIdList) {
          e.roleIdList = [];
        }
        if (!e.roleIdList.includes(this.doctorRoleObj.roleId)) {
          e.roleIdList.push(this.doctorRoleObj.roleId);
        }
      }
      e.roleIdName = new Array();
      //RoleIdList Wise filtering RoleNames
      this.roleList.forEach(role => {
        let checkRolePresent = e.roleIdList.includes(role.roleId);
        checkRolePresent ? e.roleIdName.push(role.roleName) : "";
      });
    });
    //removing pocs which do't have any roles
    this.doctorJoinedPocList = this.doctorJoinedPocList.filter(ex => { return ex.roleIdList.length > 0; });
    this.doctorDetails.employeePocMappingList = this.doctorJoinedPocList;
  }
  //model
  getRoleDetails(roles: any, index: number) {
    if ((<any>$("#" + index + ":checked")).length > 0) {
      if (!this.roleIdList) {
        this.roleIdList = [];
      }
      if (!this.roleIdName) {
        this.roleIdName = [];
      }
      if (!this.roleIdList.includes(roles.roleId)) {
        this.roleIdList.push(roles.roleId);
        this.roleIdName.push(roles.roleName);
      }
      console.log(`checked getRoleDetails ==>${this.roleIdList}`);
    } else {
      this.roleIdList = this.roleIdList.filter(tRole => tRole != roles.roleId);
      this.roleIdName = this.roleIdName.filter(tRole => tRole != roles.roleName);
      console.log(`checked getRoleDetails ==>${this.roleIdList}`);
    }
  }
  updateRole() {
    let pocRolesList: Array<EmployeePocMapping> = null;
    if (this.tempIndex != -1) {
      this.isError = false;
      this.showMessage = false;
      let isDoctorPresent = this.roleIdList.includes(this.doctorRoleObj.roleId);
      if (this.doctorDetails.type == EmployeeType.DOCTOR && !isDoctorPresent) {
        this.roleIdList.push(this.doctorRoleObj.roleId);
        this.roleIdName.push(this.doctorRoleObj.roleName);
      }
      if (this.roleIdList.length < 1 || !this.roleIdList) {
        this.isErrorPoc = true;
        this.errorMessagePoc = new Array();
        this.errorMessagePoc[0] = "Select Role";
        this.showMessagePoc = true;
        alert("Select at list one role");
        return;
      }

      if (!this.isSuperAdmin) {
        if (this.assignedSuperRoles && this.assignedSuperRoles.length > 0) {
          for (let i = 0; i < this.assignedSuperRoles.length; i++) {
            let obj = this.roleIdList.find(o => o === this.assignedSuperRoles[i]);
            if (!obj || obj == 0) {
              this.roleIdList.push(this.assignedSuperRoles[i]);
            }
          }
        }
        this.assignedSuperRoles = new Array<number>();
      }
      this.doctorDetails = this.employeeService.doctorDetail;
      let employeePOC: EmployeePocMapping = new EmployeePocMapping();
      employeePOC = {
        ...this.selectedPocDetail,
        participationSettings: new DoctorParticipationData(),
        roleIdList: this.roleIdList,
        roleIdName: this.roleIdName,
      };
      employeePOC.participationSettings.pdfHeaderType = 0;
      employeePOC.participationSettings.scanAndUploadPrescriptions = false;
      console.log(`${employeePOC.pocName + employeePOC.pocId} is updateRole==>employeePOC.serviceList${JSON.stringify(employeePOC.serviceList)}==>doctorDetail.serviceList${JSON.stringify(this.employeeService.doctorDetail.serviceList)}`)
      let serviceList = [];
      if (employeePOC && employeePOC.serviceList && employeePOC.serviceList.length > 0) {
        serviceList = serviceList.concat(employeePOC.serviceList);
      }
      if (this.employeeService && this.employeeService.doctorDetail && this.employeeService.doctorDetail.serviceList && this.employeeService.doctorDetail.serviceList.length > 0) {
        serviceList = serviceList.concat(this.employeeService.doctorDetail.serviceList);
      }
      employeePOC.serviceList = serviceList;

      if (this.doctorDetails.employeePocMappingList != undefined) {
        pocRolesList = this.doctorDetails.employeePocMappingList;
      }
      let isPresentPoc: boolean = false;
      //**check whether POC already Exist Or New Poc */
      let obj = this.doctorJoinedPocList.find(o => o.pocId === employeePOC.pocId);
      if (obj) {
        let indexT = this.doctorJoinedPocList.indexOf(obj);
        employeePOC.participationSettings = this.doctorJoinedPocList[indexT].participationSettings;
        employeePOC.serviceList = this.doctorJoinedPocList[indexT].serviceList;
        employeePOC.margin = this.doctorJoinedPocList[indexT].margin;
        if (this.isPoc == true) {
          pocRolesList.splice(indexT, 1);
          isPresentPoc = true;
        }
      } else {
        employeePOC.participationSettings = new DoctorParticipationData();
        employeePOC.serviceList.push.apply(this.doctorDetails.serviceList);
        employeePOC.margin = new HSMargin();
      }
      // employeePOC.brandId = this.brandId;
      if (employeePOC.roleIdName.length > 0) {
        pocRolesList.push(employeePOC);
      }
      this.doctorDetails.employeePocMappingList = pocRolesList;
      this.doctorJoinedPocList = pocRolesList;
      this.roleIdList = new Array<number>();
      this.roleIdName = new Array<string>();
      let isPocExist =
        this.doctorDetails.pocIdList &&
        this.doctorDetails.pocIdList.indexOf(this.selectedPocDetail.pocId);
      if (isPocExist == -1) {//this.doctorDetails.type == 0 &&
        this.doctorDetails.pocIdList.push(this.selectedPocDetail.pocId);
      }
      this.employeeService.doctorDetail = this.doctorDetails;
      this.employeeService.setDetail();
    }
    if (!this.isError) {
      $("#myModal47").on("hidden.bs.modal", function (e) {
        $(".modal-backdrop").remove();
      });
      (<any>$("#myModal47")).modal("hide");
      //$('#myModal47').modal('toggle');
    }
  }

  onValueCheckedd(poc): void {
    this.doctorDetails.empPersonalPocInfo = new PocAdviseData();
    if (poc.pocId != this.defaultPocId) {
      this.doctorDetails.empPersonalPocInfo = { ...poc };
      this.doctorDetails.empPersonalPocInfo.pocId = this.defaultPocId = poc.pocId;
      // this.doctorDetails.empPersonalPocInfo.pocName = poc.pocName;
      this.doctorDetails.empPersonalPocInfo.email = this.doctorDetails.emailId;
      this.doctorDetails.empPersonalPocInfo.contactList = this.doctorDetails.contactList;
      // this.doctorDetails.empPersonalPocInfo.address = address;
    } else this.defaultPocId = 0;
  }
  newPoc() {
    this.tempIndex = 0;
    if (this.doctorJoinedPocList) {
      this.doctorJoinedPocIdList = new Array();
      setTimeout(() =>
        this.doctorJoinedPocList.forEach(poc => { this.doctorJoinedPocIdList.push(poc.pocId); }), 100);
    }
    // this.selectedPocDetail = new EmployeePocMapping();
    $(".checkRoleList").prop("checked", false);
    this.isPocRollEdit = false;
    (<any>$)('#myModal47').modal('show');
    $(".modal-backdrop").not(':first').remove();
  }

  onLocationmapping(): void {
    this.isError = this.showMessage = false;
    this.errorMessage = new Array();
    let isValid = this.employeeService.getValidateAssignRole(this.doctorDetails);
    this.isError = isValid.isError;
    this.errorMessage = isValid.errorMessage;
    this.showMessage = isValid.showMessage;
    if (this.isError) {
      return;
    }
    if (!this.isError && this.doctorDetails.serviceList != undefined) {
      this.employeeService.doctorDetail = this.doctorDetails;
      this.employeeService.setDetail();
    }
    if (this.isError == false) {

      this.pageChange.emit({ pageControl: "employeelocation", pageType: 3 });
      // this.router.navigate(['/app/master/employee/employeelocation']);
    } else {
      this.errorMessage = Array.from(new Set(this.errorMessage).values());
      this.showMessage = true;
    }
  }

  async onEditSeting(pocIndex) {
    this.isError = false;
    let selPoc = this.doctorDetails.employeePocMappingList[pocIndex];
    if (selPoc.serviceList != undefined) {
      // await this.getPocDetails(selPoc.pocId, pocIndex);
      //Filter POC and Employee Common Service 
      await this.getPocDetails([selPoc.pocId]);
      this.employeeService.selectedPocIndex = pocIndex;
      this.employeeService.doctorDetail = this.doctorDetails;
      this.employeeService.setDetail();
    }
    if (this.isError == false) {
      // change this
      this.router.navigate(["/app/master/employee/employeeparticipatedetails"]);
    }
  }
  async getPocDetails(pocIdList, type: number = 1) {
    let request: PocSearch = new PocSearch;
    let pocIdWiselistLoc = new Array();
    let pocServiceList = new Array<DoctorServiceDetail>();
    let dataServiceList = new Array();
    let selPocLoc = null;
    request.pocIdList = pocIdList;
    if (pocIdList && pocIdList.length > 0)
      await this.superAdminService.getPocDetails(request).then(pocIdWiselist => {
        //res poc list
        pocIdWiselistLoc = pocIdWiselist;
        //Iterate doctor participating poc list
        this.doctorDetails.employeePocMappingList.forEach((poc, indexp) => {
          //doctor participating poc's servicelist
          dataServiceList = poc.serviceList;
          //clearing previous service list
          pocServiceList = new Array<DoctorServiceDetail>();
          //filtered poc from res poc by selected doctor poc
          selPocLoc = pocIdWiselistLoc.filter(pc => pc.pocId == poc.pocId);
          if (selPocLoc && selPocLoc.length > 0) {
            //Iterate Doctor participating Service list
            this.doctorDetails.serviceList.forEach(e => {
              if (selPocLoc.length > 0 && selPocLoc[0].serviceList) {
                //filtering service from res by doctor participating service list
                let service = selPocLoc[0].serviceList.filter(serv => {
                  // console.log(e.serviceId, +serv.serviceId, e.serviceId == +serv.serviceId);
                  return +e.serviceId == +serv.serviceId;
                });
                pocServiceList.push.apply(pocServiceList, JSON.parse(JSON.stringify(service)));
              }
            });
            //Iterate Service End
            poc.pocDetail = selPocLoc[0];
            // console.log(pocServiceList,'==>emproles==>', JSON.stringify(this.doctorDetails));
            if (pocServiceList && pocServiceList.length > 0 && (poc.serviceList != null || poc.serviceList != undefined)) {
              poc.serviceList = this.setServiceList([...poc.serviceList], [...pocServiceList], type);
              this.employeeService.doctorDetail = this.doctorDetails;
            } else poc.serviceList = [];
            if (type == 1 && poc.serviceList && poc.serviceList.length <= 0) {
              this.isError = true;
              alert('This Poc Don`t has access for any services');
            }
          }

        });
        //Iterate POC End
      });
  }
  setServiceList(dataServiceList, pocServiceList, type: number = 1) {
    if (dataServiceList && dataServiceList.length == 0) {
      dataServiceList = pocServiceList;
      //   console.log(dataServiceList);
    } else if (dataServiceList && dataServiceList.length > 0 && pocServiceList && pocServiceList.length > 0) {
      pocServiceList.forEach(data => {
        /*checking whethere service already exist with price or not 
          if not then add to poc service list*/
        let index = dataServiceList.findIndex(x => { return x.serviceId == data.serviceId });
        if (index == -1) {
          dataServiceList.push(data);
        }
      });
      let indexList = new Array();
      dataServiceList.forEach((data, i) => {
        /*checking whethere service removed from poc 
        but previously was having service 
        as doctor and poc were participate with some price */
        let index = pocServiceList.findIndex(x => { return x.serviceId == data.serviceId });
        if (index == -1) {
          indexList.push(i);
        }
      });
      indexList.forEach((xh, i) => {
        dataServiceList.splice(xh - i, 1)
      });
    }
    let tempServList = new Array();
    dataServiceList.forEach((item) => {
      if (tempServList.filter((sl) => sl.serviceId == item.serviceId).length <= 0) { tempServList.push(item) }
    })
    return tempServList;
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (this.employeeService.errMasg && this.employeeService.errMasg.length > 0) {
      this.isError = false;
      this.errorMessage = new Array();
      let isValid = this.employeeService.getValidateAssignRole(this.doctorDetails);
      this.isError = isValid.isError;
      this.errorMessage = isValid.errorMessage;
      this.showMessage = isValid.showMessage;
      if (this.isError) {
        return;
      }
    }
  }
}