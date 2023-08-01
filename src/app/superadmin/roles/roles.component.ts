import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';
import { AuthService } from './../../auth/auth.service';
import { CommonUtil } from '../../base/util/common-util';
import { SpinnerService } from './../../layout/widget/spinner/spinner.service';
import { ValidationUtil } from './../../base/util/validation-util';
import { SuperAdminService } from './../superadmin.service';
import { Role } from "./../../model/employee/role";
import { AccessPermission } from "./../../model/employee/accesspermission";

@Component({
  selector: 'roles',
  templateUrl: './roles.template.html',
  styleUrls: ['./roles.style.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class RolesComponent implements OnInit {

  rolesList: Role[] = [];
  rolesNameList: Role[] = [];
  selectedRole: Role;
  rolesPermissionList: any
  permissionList: AccessPermission[] = new Array<AccessPermission>();
  tempPermissionList: AccessPermission[] = new Array<AccessPermission>();
  roleId: number;
  indexForRole: number = 0;
  roleName: string;
  perPage: number = 35;
  total: number = 0;
  scrollPosition: number;
  time: any;
  offset: number = 50;
  fromIndex: number;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  empId: number;
  columns: any[] = [
    {
      display: 'Screen Name',
      variable: 'permissionName',
      filter: 'text',
      sort: false
    },
    {
      display: 'View',
      variable: 'value',
      filter: 'action',
      sort: false,
      type: 'image',
      event: 'pdfButton1',
      label: '',
      style: 'botton_editimg',
      // style:'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'assets/img/ic-close-portal-24.png',
          // style: 'botton_editimg',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        },
        {
          value: '1',
          condition: 'lte',
          label: 'assets/img/ic-check-portal-24.png',
          // style: 'botton_editimg',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        },
        {
          value: '2',
          condition: 'lte',
          label: 'assets/img/ic-check-portal-24.png',
          // style: 'botton_editimg',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        }
      ]
    },
    {
      display: 'Edit',
      variable: 'value',
      filter: 'action',
      sort: false,
      type: 'image',
      event: 'pdfButton2',
      label: '',
      style: 'botton_editimg',
      // style:'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'assets/img/ic-close-portal-24.png',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        },
        {
          value: '1',
          condition: 'lte',
          label: 'assets/img/ic-close-portal-24.png',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        },
        {
          value: '2',
          condition: 'lte',
          label: 'assets/img/ic-check-portal-24.png',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
        }
      ]
    },
  ];

  sorting: any = {
    column: 'screenName',
    descending: false
  };
  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    //this.rolesPermissionList = this.auth.loginResponse.permissionBaseData;
    this.superAdminService.getAllPermission().then(List => {
      this.rolesPermissionList = List;
    })
  }


  ngOnInit() {
    this.getRoles();
    this.empId = this.auth.userAuth.employeeId;
  }


  getRoles() {
    this.superAdminService.getAllRoles(this.auth.userAuth.hasSuperAdminRole, this.auth.userAuth.pocId).then(List => {
      for (let i = 0; i < List.length; i++) {
        if (List[i].visibility == true) {
          this.rolesList.push(List[i]);
          // this.onRoleChange(0);
        }
        this.rolesNameList = this.rolesList;

      }
      if (this.rolesList[0].roleId) {
        this.tempPermissionList = this.rolesPermissionList;
        for (let i = 0; i < this.tempPermissionList.length; i++) {
          this.tempPermissionList[i].value = 0;
        }
        console.log("rolelist12" + JSON.stringify(this.tempPermissionList))
      }
    });
  }

  onRoleChange(index: number): void {
    if (index == 0) {
      this.selectedRole = null;
      this.permissionList = [];
    }
    this.roleId = (index > 0 ? this.rolesList[index - 1].roleId : index);
    for (let j = 0; j < this.rolesList.length; j++) {
      if (this.roleId == this.rolesList[j].roleId) {
        this.selectedRole = this.rolesList[j];
        this.permissionList = this.rolesList[j].permissions;
        console.log("it is coming in this log========" + this.roleId + "           " + JSON.stringify(this.permissionList))
      }
    }
  }

  onSubmit(): void {
    let Request: Role = new Role();
    Request.roleId = this.selectedRole.roleId;
    Request.roleName = this.selectedRole.roleName;
    Request.updatedTime = new Date().getTime();
    Request.description = null;
    Request.type = 0
    Request.visibility = true        // boolean
    Request.permissions = this.permissionList
    this.superAdminService.updateRole(Request).then(response => {
    });
  }

  onRoleSubmit(): void {
    if (this.roleName != undefined) {
      this.roleName = this.roleName.trim();
    }
    if (this.roleName == undefined || this.roleName == null || this.roleName == "") {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter the Role Name...!!";
      this.showMessage = true;
      return;
    }
    else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
      (<any>$)("#myModal37").modal("hide");

    }
    let Request: Role = new Role();
    Request.roleId = 0;
    Request.roleName = this.roleName;
    Request.updatedTime = new Date().getTime();
    Request.type = 0
    Request.visibility = true        // boolean
    Request.permissions = this.tempPermissionList;
    this.superAdminService.updateRole(Request).then(response => {
      if (response.statusCode == 200 || response.statusCode == 201) {
        this.getRoles();
      }
    });
  }


  onButtonClicked(event): void {

  }

  onPage(event): void {

  }

  onHyperLinkClicked(event): void {

  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "pdfButton1") {
      this.onButtonClicked(e.val);
    }
    else if (e.event == 'pdfButton2') {
      this.onHyperLinkClicked(e.val);
    }
  }

  onValueCheckedView(role, index): void {
    let val = 0;
    if ($("#view" + index).prop('checked') == true) {
      $("#edit" + index).prop('checked', false);
      val = 1;
    } else {
      val = 0;
    }
    this.permissionList[index].value = val;
  }

  onValueCheckedEdit(role, index): void {
    let val = 0;
    if ($("#edit" + index).prop('checked') == true) {
      $("#view" + index).prop('checked', false);
      val = 2;
    } else {
      val = 0;
    }
    this.permissionList[index].value = val;
  }

  onValueCheckedView1(role, index): void {
    let val = 0;
    if ($("#view1" + index).prop('checked') == true) {
      $("#edit1" + index).prop('checked', false);
      val = 1;
    } else {
      val = 0;
    }
    this.tempPermissionList[index].value = val;
  }

  onValueCheckedEdit1(role, index): void {
    let val = 0;
    if ($("#edit1" + index).prop('checked') == true) {
      $("#view1" + index).prop('checked', false);
      val = 2;
    } else {
      val = 0;
    }
    this.tempPermissionList[index].value = val;
  }

  // onValueChecked(role, index, value): void {
  //   console.log("ppp" + JSON.stringify(role) + "index" + index + "value" + value + "permissionList>>>>>" + JSON.stringify(this.permissionList));
  //   this.tempPermissionList[index].value = parseInt(value);
  // }

  openModal(id) {
    (<any>$(id)).modal("show");
    if ($(".modal-backdrop").length > 1) {
      $(".modal-backdrop").not(':first').remove();
    }
  }
}