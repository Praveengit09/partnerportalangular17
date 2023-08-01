import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../../../auth/auth.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { AssignEmployeeRequest } from './../../../../model/employee/assignEmployeeRequest';
import { EmployeeService } from '../../employee.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
@Component({
  selector: 'employeelist',
  templateUrl: './employeelist.template.html',
  styleUrls: ['./employeelist.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeListComponent implements OnInit {
  errorMessage: Array<string>;
  searchTerm: any;
  pocIdList: Array<number>;
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  perPage: number = 10;
  total: number = 0;
  scrollPosition: number;
  time: any;
  offset: number = 50;
  fromIndex: number;
  employeeRequest: AssignEmployeeRequest = new AssignEmployeeRequest();
  employeeList: any;
  empId: number;
  searchCriteria: string = 'name';
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
      display: 'Action',
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

  constructor(private auth: AuthService, private employeeService: EmployeeService,
    private router: Router, private spinnerService: SpinnerService) {
    this.fromIndex = 0;
    this.searchTerm = '';
    this.empId = this.auth.userAuth.employeeId;
    employeeService.pageNo = 0;
    localStorage.removeItem('employeeUpdateDetails')
  }

  ngOnInit() {
    this.spinnerService.start();
    this.employeeService.doctorDetail = new DoctorDetails();
    this.employeeService.isEmployeeModify = false;
    this.employeeService.setDetail();
    this.getEmployeeList();
  }

  onNewEmployee(): void {
    this.employeeService.isEmployeeModify = false;
    this.employeeService.doctorDetail = new DoctorDetails();
    this.router.navigate(['/app/master/employee/employeeUpdation']);
  }

  onButtonClicked(event: any) {
    if (event.empId != 1) {
      this.employeeService.doctorDetail = event;
      this.employeeService.isEmployeeModify = true;
      this.employeeService.setDetail();
      this.router.navigate(['/app/master/employee/employeeUpdation']);
    }
    console.log("emp" + JSON.stringify(this.employeeService.doctorDetail));
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

  onSearchChange(search: string) {
    (<any>$)("#searchBox").val("");
    if (this.employeeRequest != undefined) {
      this.employeeRequest.name = this.employeeRequest.mobileNumber = "";
    }
    this.searchCriteria = search;
  }
  onRefresh() {
    this.spinnerService.start();
    this.getEmployeeList();
    this.searchTerm = "";
    setTimeout(() => {
      this.spinnerService.stop();
    }, 2000)
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

  onHyperLinkClicked(event) {
    this.employeeService.isEmployeeModify = false;
    this.employeeService.doctorDetail = event;
    this.router.navigate(['/app/master/employee/employeedetails']);
  }

  onPage(event) {
  }
}