import { Component, ViewEncapsulation } from "@angular/core";
import { AuthService } from '../../../auth/auth.service';
import { EmployeeService } from '../../../superadmin/employee/employee.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { Router } from '@angular/router';
import { AssignEmployeeRequest } from "../../../model/employee/assignEmployeeRequest";
import { DoctorDetails } from "../../../model/employee/doctordetails";

@Component({
  selector: 'employeelist',
  templateUrl: './employeelist.template.html',
  styleUrls: ['./employeelist.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmployeeListComponent {
  errorMessage: Array<string>;
  searchTerm: any;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  perPage: number = 10;
  total: number = 0;
  offset: number = 50;
  fromIndex: number;
  employeeRequest: AssignEmployeeRequest = new AssignEmployeeRequest();
  employeeList: any;
  empId: number;

  columns: any[] = [
    {
      display: 'Employee Name',
      variable: 'firstName lastName',
      filter: 'action',
      style: 'orderId',
      event: 'hyperlink',
      type: 'hyperlink',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'contactList[0]',
      filter: 'text',
      sort: false
    },
    {
      display: 'Email',
      variable: 'emailId',
      filter: 'text',
      sort: false
    },
    {
      display: 'DELETE',//add t h
      label: 'DELETE',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'deleteButton',
      type: 'button',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'DELETE',
          type: 'button',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'DELETE',
          type: 'button',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        }
      ]
    },
    {
      display: 'EDIT',
      label: 'EDIT',
      variable: '',
      filter: 'action',
      sort: false,
      event: 'editButton',
      type: 'button',
      style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
      conditions: [
        {
          value: '0',
          condition: 'lte',
          label: 'EDIT',
          type: 'button',
          style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
        },
        {
          value: '1',
          condition: 'eq',
          label: 'EDIT',
          type: 'button',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo'
        }
      ]
    }
  ];

  sorting: any = {
    column: 'firstName',
    descending: false
  };

  constructor(private auth: AuthService, private employeeService: EmployeeService, private router: Router, private spinnerService: SpinnerService) {
    this.searchTerm = '';

  }
  ngOnInit() {
    this.spinnerService.start();
    this.employeeService.doctorDetail = new DoctorDetails();
    this.employeeService.isEmployeeModify = false;
    this.employeeService.setDetail();
    this.getEmployeeList();
  }

  onButtonClicked(event: any) {
    if (event.empId != 1) {
      this.employeeService.doctorDetail = event;
      this.employeeService.isEmployeeModify = true;
      this.employeeService.setDetail();
      this.router.navigate(['./pocadminEmp/employee/updation'])
    }
  }

  onDeleteButtonClicked(event: any) {
    let requestBody = {
      "empId": event.empId,
      "pocId": this.auth.userAuth.pocId
    }
    this.employeeService.deleteEmoloyee(requestBody).then((response) => {
      console.log(response);
      this.onRefresh();
    }).catch(err => {

      // toast import or delete 
      console.log(err);
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Error occurred for deleting the employee  ";
      this.showMessage = true;
    });
  }

  onHyperLinkClicked(event) {
    this.employeeService.isEmployeeModify = false;
    this.employeeService.doctorDetail = event;

    this.router.navigate(['/app/master/employee/employeedetails']);
  }
  clickEventHandler(e) {
    console.log(e);
    if (e.val && e.val.empId > 1) {
      this.spinnerService.start();
      this.employeeService.getEmployeeDetails(e.val.empId).then((response) => {
        this.spinnerService.stop();
        if (response.empId > 0) {
          if (e.event == "editButton") {
            console.log(e);
            this.onButtonClicked(response);
          }
          else if (response.empId > 0) {
            if (e.event == "deleteButton") {
              console.log(e);
              this.onDeleteButtonClicked(response);
            }
          }
          else if (e.event == 'hyperlink') {
            this.onHyperLinkClicked(response);
          }
        } else {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Error occurred fetching the employee details";
          this.showMessage = true;
        }
      }).catch(err => {
        this.spinnerService.stop();
        console.log(err);
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Error occurred fetching the employee details";
        this.showMessage = true;
      });

    }
  }
  getEmployeeList() {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
    this.spinnerService.start();
    this.employeeRequest = new AssignEmployeeRequest();
    this.employeeRequest.superAdmin = true;
    if (this.empId == 1) {
      this.employeeService.getEmployeesList(this.employeeRequest).then((response) => {

        this.spinnerService.stop();
        this.employeeList = response;
      }).catch(err => {
        this.spinnerService.stop();
        console.log(err);
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Error occurred fetching the employee list";
        this.showMessage = true;
      });
    }
    else {
      this.employeeRequest.superAdmin = false;
      this.employeeRequest.pocIdList = [this.auth.userAuth.pocId];
      this.employeeService.getEmployeesList(this.employeeRequest).then(respList => {
        this.spinnerService.stop();
        this.employeeList = respList;
      }).catch(err => {
        this.spinnerService.stop();
        console.log(err);
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Error occurred fetching the employee list";
        this.showMessage = true;
      });;
    }
  }

  onRefresh() {
    this.spinnerService.start();
    this.getEmployeeList();
    this.searchTerm = "";
    setTimeout(() => {
      this.spinnerService.stop();
    }, 2000)
  }
  onAddEmployee(): void {
    this.employeeService.isEmployeeModify = false;
    this.employeeService.doctorDetail = new DoctorDetails();
    this.router.navigate(['./pocadminEmp/employee/updation'])
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.onSearchButtonClick();
    }
  }

  onSearchButtonClick(): void {
    console.log("button");
    this.spinnerService.start();
    this.searchTerm = this.searchTerm.trim();
    if (!isNaN(this.searchTerm)) {
      this.employeeRequest.mobileNumber = this.searchTerm;
      this.employeeRequest.name = "";
    }
    else {
      this.employeeRequest.name = this.searchTerm;
      this.employeeRequest.mobileNumber = "";
    }
    this.employeeService.getEmployeesList(this.employeeRequest).then(response => {
      this.spinnerService.stop();
      this.employeeList = response;
      if (this.employeeList == null || this.employeeList.length == 0) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Employee Does not exist";
        this.showMessage = true;
        return;
      }
      else {
        this.isError = false;
        this.errorMessage = new Array();
        this.showMessage = false;
      }
    }).catch((err) => {
      if (err) {
        this.spinnerService.stop();
        console.log(err);
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Error occurred fetching the employee list";
        this.showMessage = true;
        return;
      }
    });
  }

  onPage(event) {
  }


}