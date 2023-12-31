import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { AppConfig } from "../../../app.config";
import { Router } from "@angular/router";
import * as $ from 'jquery';
import { AuthService } from "../../../auth/auth.service";
import { CommonUtil } from "../../../base/util/common-util";
import { DoctorDetails } from "../../../model/employee/doctordetails";
import { Employee } from '../../../model/employee/employee';
import { FileUtil } from "../../../base/util/file-util";
import { EmployeeService } from "../../../superadmin/employee/employee.service";
import { SuperAdminService } from "../../../superadmin/superadmin.service";
import { SpinnerService } from "../../../layout/widget/spinner/spinner.service";

@Component({
  selector: 'employeeinformation',
  templateUrl: './employeeinformation.template.html',
  styleUrls: ['./employeeinformation.style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmployeeInformationComponent implements OnInit, OnChanges {
  errorMessage = new Array<string>();
  showMessage: boolean;
  doctorDetails: DoctorDetails = new DoctorDetails();
  languages: any;
  languageList: Array<any> = new Array<any>();
  employee: Employee = new Employee;
  contactList: Array<any> = new Array<any>();
  mobileNumber: string;
  isLength: boolean;
  isError: boolean;
  uploadFiles: any;
  uploadSign: any;
  uploadCertificate: any;
  uploadFilesList: any = 'No File Choosen';
  uploadSignatureList: any = 'No File Choosen';
  uploadCertificatesList: any = 'No File Choosen';
  empId: number;
  isEmployeeModify: boolean;
  lists: Array<any> = new Array<any>();
  @Input() pageChangeCall: any;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();
  canShowDoctor: boolean = false;
  saasSubscriber: boolean = false;


  constructor(config: AppConfig, private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private fileUtil: FileUtil, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private employeeService: EmployeeService) {
    this.doctorDetails = new DoctorDetails();
    this.empId = this.auth.userAuth.employeeId;
    this.saasSubscriber = this.auth.selectedPocDetails ? this.auth.selectedPocDetails.saasSubscriber : false;
    this.isEmployeeModify = this.employeeService.isEmployeeModify;
    if (this.employeeService.isEmployeeModify == true) {
      employeeService.getDetails();
    }
  }

  ngOnInit() {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
    this.doctorDetails = this.employeeService.doctorDetail ? this.employeeService.doctorDetail : new DoctorDetails();
    this.employeeService.getLanguages().then((response => {
      this.languages = response;
    })).then(data => { this.getLanguages() });
    if (this.isEmployeeModify == true) {
      this.employeeService.setDetail();
      this.doctorDetails.type = this.employeeService.doctorDetail.type;
    }
    // initiating contact in doctor detail object 
    let contactL = this.doctorDetails.contactList;
    if (!contactL || contactL.length <= 1) {
      this.doctorDetails.contactList = !contactL || contactL.length <= 0 ? ['', ''] : [contactL[0] ? contactL[0] : '', contactL[1] ? contactL[1] : ''];
    }
    if (this.doctorDetails && this.doctorDetails.imageUrl) {
      let p = this.doctorDetails.imageUrl.split('/');
      this.uploadFilesList = p[p.length - 1];
    }
    if (this.doctorDetails && this.doctorDetails.signatureImageUrl) {
      let p = this.doctorDetails.signatureImageUrl.split('/');
      this.uploadSignatureList = p[p.length - 1];
    }
  }

  ngOnDestroy(): void {
    if (this.doctorDetails != undefined && this.doctorDetails != null) {
      this.superAdminService.doctorDetail = this.doctorDetails;
    }
  }

  trackByFn(index, item) {
    return index;
  }

  onNumberChange(mobileNo: any): void {
    if (mobileNo.length == 10) {
      this.isLength = true;
      this.employeeService.getEmployee(mobileNo).then(employeeDetails => {
        if (employeeDetails.contactList != undefined) {
          this.doctorDetails = employeeDetails;
        }
      })
    }
    else if (mobileNo.length == 0) {
      this.isError = false;
      this.showMessage = false;
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
  getLanguages(callType?): void {
    if (!this.doctorDetails.languages) {
      this.doctorDetails.languages = [];
    }
    if (this.doctorDetails.languages.length > 0) {
      for (let i = 0; i < this.doctorDetails.languages.length; i++) {
        this.lists.push(this.doctorDetails.languages[i].name);
      }
      this.languageList = this.doctorDetails.languages;
    } else {
      this.doctorDetails.languages.push(this.languages[0]);
      this.languageList.push(this.languages[0]);
      this.lists.push(this.languages[0].name);
    }
    setTimeout(() => {
      for (let j = 0; j < this.languageList.length; j++) {
        $("#" + this.languageList[j].id).prop("checked", true)
      }
    }, 100)
  }
  getLangDetails(language: any) {
    if ((<any>$("#" + language.id + ":checked")).length > 0) {
      this.languageList.push(language);
      this.lists.push(language.name);
    } else {
      this.languageList = this.languageList.filter(lang => lang.id != language.id);
      this.lists = this.lists.filter(lang => lang != language.name);
    }
  }

  onTypeChange(event) {
    this.doctorDetails.type = parseInt(event);
    this.employeeService.doctorDetail.type = this.doctorDetails.type;
    this.pageChange.emit({ pageControl: 'currentPageEmpTypeChange', pageType: this.employeeService.pageNo });
  }


  onTitleChange(event) {
    this.doctorDetails.title = event;
  }
  onGenderChange(event) {
    console.log(event);

    this.doctorDetails.gender = event;
  }
  addApplyButton(): void {
    if (this.doctorDetails.contactList.length <= 2) {
      this.doctorDetails.contactList.push('');
    }
  }

  onNext(location): void {
    let mailformat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.doctorDetails.emailId && !(this.doctorDetails.emailId.match(mailformat))) {
      alert('Invalid Email Address');
      return;
    }
    this.onCreateEmployee();
    this.doctorDetails.languages = this.languageList;
    this.employeeService.doctorDetail = this.doctorDetails;
    this.employeeService.setDetail();
    if (this.isError == false && location == 'location') {
      this.pageChange.emit({ pageControl: 'employeelocation', pageType: 3 });
    }
    else if (this.isError == false && location == 'professional') {
      this.pageChange.emit({ pageControl: 'employeeprofessionaldetails', pageType: 1 });
    }
    else if (this.isError == false && location == 'roleandpoc') {
      this.pageChange.emit({ pageControl: 'employeeroles', pageType: 2 });
    }
    this.employeeService.setDetail();
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (this.employeeService.errMasg && this.employeeService.errMasg.length > 0)
      this.onCreateEmployee()
  }

  onCreateEmployee() {
    this.doctorDetails.contactList = [...Array.from(new Set(this.doctorDetails.contactList))];
    this.errorMessage = new Array();
    let validPersonal = this.employeeService.getValidatePersionalDetail(this.doctorDetails);
    this.isError = validPersonal.isError;
    this.errorMessage = validPersonal.errorMessage;
    this.showMessage = validPersonal.showMessage;
    if (this.isError) {
      return;
    }
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }
  imageUpload(event) {
    this.uploadFilesList = event.target.files[0].name;
    this.uploadFiles = event.target.files;
    //this.getuploadFilesList = this.uploadFilesList;
    //console.log("image==>" + JSON.stringify(this.getuploadFilesList))
    this.uploadProfilePic();
    this.employee.profileImageData = event.target.files;
  }
  signatureUpload(event) {
    this.uploadSignatureList = event.target.files[0].name;
    this.uploadSign = event.target.files;
    this.uploadSignature();
  }

  certificatesUpload(event) {
    this.uploadCertificatesList = event.target.files[0].name;
    this.uploadCertificate = event.target.files;
    this.uploadCertificates();
  }
  uploadProfilePic() {
    if (this.uploadFilesList === undefined || this.uploadFilesList === null) {
      return;
    }
    else if (this.uploadFilesList.length > 0) {
      if (!(this.uploadFilesList.endsWith('.jpg') || this.uploadFilesList.endsWith('.JPG') || this.uploadFilesList.endsWith('.png') || this.uploadFilesList.endsWith('.PNG'))) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Only png, jpg files are supported';
        this.showMessage = true;
        return;
      }
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();

    this.fileUtil.fileUploadToAwsS3('employee/image', this.uploadFiles[0], 0, true, false).then((awsS3FileResult: any) => {
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      }
      else {
        this.spinnerService.stop();
        this.doctorDetails.imageUrl = awsS3FileResult.Location;

      }
    }).catch(err => {
      this.spinnerService.stop();
    });
  }
  uploadSignature() {
    if (this.uploadSignatureList === undefined || this.uploadSignatureList === null) {
      return;
    }
    else if (this.uploadSignatureList.length > 0) {
      if (this.uploadSignatureList.endsWith('.jpg') || this.uploadSignatureList.endsWith('.JPG') || this.uploadSignatureList.endsWith('.png') || this.uploadSignatureList.endsWith('.PNG')) {

      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Only png, jpg files are supported';
        this.showMessage = true;
        return;
      }
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3('employee/sign', this.uploadSign[0], 0, false, false).then((awsS3FileResult: any) => {
      console.log("awsS3FileResult" + JSON.stringify(awsS3FileResult));
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      }
      else {
        this.spinnerService.stop();
        this.doctorDetails.signatureImageUrl = awsS3FileResult.Location;
      }
    }).catch(err => { this.spinnerService.stop(); });
  }

  uploadCertificates() {
    if (this.uploadCertificatesList === undefined || this.uploadCertificatesList === null) {
      return;
    }
    else if (this.uploadCertificatesList.length > 0) {
      if (this.uploadCertificatesList.endsWith('.jpg') || this.uploadCertificatesList.endsWith('.JPG') || this.uploadCertificatesList.endsWith('.png') || this.uploadCertificatesList.endsWith('.PNG') || this.uploadCertificatesList.endsWith('.pdf') || this.uploadCertificatesList.endsWith('.PDF')) {

      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = 'Only png, jpg files are supported';
        this.showMessage = true;
        return;
      }
    }
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    this.fileUtil.fileUploadToAwsS3('employee/certificate', this.uploadCertificate[0], 0, false, false).then((awsS3FileResult: any) => {
      console.log("awsS3FileResult" + JSON.stringify(awsS3FileResult));
      if (!awsS3FileResult) {
        this.spinnerService.stop();
        return;
      }
      else {
        this.spinnerService.stop();
        this.doctorDetails.certificateImageUrl = awsS3FileResult.Location;
      }
    }).catch(err => { this.spinnerService.stop(); });
  }
}

