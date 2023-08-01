import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CommonUtil } from '../../../base/util/common-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { DiagnosticAdminRequest } from '../../../model/diagnostics/diagnosticAdminRequest';
import { VDCUserPrivilegeResponse } from '../../../vdc/vdcuserPrivilegeconstant';
import { DiagnosticsService } from '../../diagnostics.service';
import { VdcUserPrivilegeService } from '../vdcuserprivilege.service';

@Component({
  selector: 'vdcUserPrivilege',
  templateUrl: './vdcUserPrivilege.template.html',
  styleUrls: ['./vdcUserPrivilege.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class VdcUserPrivilegeComponent implements OnInit {
  vdcUserPrivilegeResponse: VDCUserPrivilegeResponse[];
  diagnoAdminRequest: DiagnosticAdminRequest;
  type: number = 0;
  status: number = 0;
  parentProfileId: number;
  typeName: any;
  statusName: any;
  perPage: number = 10;
  total: number = 0;
  fromIndex: number = 0;
  dataMsg: string = '';
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  vdcUserPrivilegeList: any;
  patientProfile: any;
  crouselSelectedImage: String;
  prescriptionType = "";
  pdfimageFile: any;
  pdfImage: boolean;
  pdfHeaderType: number;
  filterCardType: number = 0;
  filterApprovalStatus: number = 0;
  startDate: Date = null;
  endDate: Date = null;
  fromdate: number = 0;
  todate: number = 0;
  empId: number;
  mobileNo: string = '';
  remarks: string = '';


  datepickerOpts = {
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  columns: any[] = [
    // {
    //   display: 'Order Id',
    //   variable: 'orderId ',
    //   filter: 'text',
    //   sort: false
    // },
    {
      display: 'Valid From',
      variable: 'validFrom',
      filter: 'date',
      sort: false
    },
    {
      display: 'Valid To',
      variable: 'validTo ',
      filter: 'date',
      sort: false
    },
    {
      display: 'Registered Date',
      variable: 'patientProfileDetails.updatedTime ',
      filter: 'date',
      sort: false
    },
    {
      display: 'Patient Details',
      variable: 'patientProfileDetails.title patientProfileDetails.fName patientProfileDetails.lName , patientProfileDetails.contactInfo.mobile , patientProfileDetails.age , patientProfileDetails.gender',
      filter: 'nametitle',
      filler: ',',
      sort: true
    },
    {
      display: 'Type',
      variable: 'type',
      filter: 'text',
      sort: true,
      conditions: [
        {
          value: '1',
          condition: 'eq',
          label: 'Privilege Card'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'Senior Citizen Card'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'Central Government Card'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'Jain Community Card'
        },
      ]
    },
    {
      display: 'Status',
      variable: 'status',
      filter: 'text',
      sort: true,
      conditions: [

        {
          value: '1',
          condition: 'eq',
          label: 'ACTIVE'
        },
        {
          value: '2',
          condition: 'eq',
          label: 'APPROVAL PENDING'
        },
        {
          value: '3',
          condition: 'eq',
          label: 'REJECTED'
        },
        {
          value: '4',
          condition: 'eq',
          label: 'PAYMENT PENDING'
        }
      ]
    },
    {
      display: 'Comment',
      variable: 'remarks',
      filter: 'text',
      sort: false
    },
    {
      display: 'Approved/Rejected By',
      variable: 'employeeTitle employeeFirstName employeeLastName',
      filter: 'nametitle',
      filler: '',
      sort: false
    },
    {
      display: 'Order Details',
      label: 'View',
      variable: 'status',
      filter: 'action',
      type: 'button',
      event: 'viewButton',
      sort: false,
      conditions: [

        {
          value: '1',
          condition: 'eq',
          label: 'Approved',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        },

        {
          value: '3',
          condition: 'eq',
          label: 'Rejected',
          style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
        },
        {
          condition: 'default',
          style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
          label: 'View',
        }

      ]
    },
    {
      display: 'Upload File',
      label: 'assets/img/partner/pdf_icon_read.png',
      filter: 'action',
      type: 'image',
      event: 'pdfButton',
      sort: false,
      variable: 'pdfImage',
      conditions: [
        {
          value: 'true',
          condition: 'eq',
          label: 'assets/img/partner/pdf_icon_read.png',
          style: ''
        },
        {
          value: 'false',
          condition: 'eq',
          label: 'assets/img/partner/image_icon_read.png',
          style: ''
        },
        {
          value: 'false',
          condition: 'default',
          label: 'assets/img/partner/no-pictures.png',
          style: ''
        }
        
      ]
    }
  ];
  
  sorting: any = {
    column: 'updatedTimestamp',
    descending: true
};
  constructor(
    private vdcuserPrivilegeService: VdcUserPrivilegeService, private commonUtil: CommonUtil, private diagnosticsService: DiagnosticsService,
    private spinnerService: SpinnerService, private router: Router, private authService: AuthService) {
    this.empId = this.authService.userAuth.employeeId;
    this.pdfHeaderType = this.authService.userAuth.pdfHeaderType;
  }

  ngOnInit(): void {
    this.getVdcUserPrivilegeList();
  }
  reset() {
    this.total = 0;
    this.fromIndex = 0;
    this.vdcUserPrivilegeResponse = new Array();
  }


  getVdcUserPrivilegeList(): void {
    this.spinnerService.start();

    console.log("type:" + this.type + "status: " + this.status + "startDate:" + this.fromdate + "todate: " + this.todate + "mobile:" + this.mobileNo);
    this.vdcuserPrivilegeService.getUserPrivileges(this.type, this.status, this.fromdate, this.todate, this.mobileNo, this.fromIndex).then(vdcSeniorcitizen => {
      // this.spinnerService.stop();

      this.total = 0;
      if (this.fromIndex > 0) {
        this.vdcUserPrivilegeResponse.push.apply(this.vdcUserPrivilegeResponse, vdcSeniorcitizen)
        this.pdfImageFile();
      } else {
        this.vdcUserPrivilegeResponse = new Array();
        this.vdcUserPrivilegeResponse = vdcSeniorcitizen;
        this.pdfImageFile();
      } if (vdcSeniorcitizen.length > 0) {
        this.total = this.vdcUserPrivilegeResponse.length;

        this.vdcUserPrivilegeResponse.forEach(element => {
          if (element.patientProfileDetails && element.patientProfileDetails.dob && element.patientProfileDetails.dob != 0) {
            element.patientProfileDetails.age = this.commonUtil.getAgeForall(element.patientProfileDetails.dob);
          }


        });
      }
      else if (this.fromIndex == 0) {
        if (this.mobileNo != undefined && this.mobileNo != null && this.mobileNo != "") {
          this.dataMsg = "No data found for the specified mobile number.";
        } else {
          this.dataMsg = "No data found.";
        }
        this.vdcUserPrivilegeResponse = new Array();
        this.total = this.vdcUserPrivilegeResponse.length;
        this.showMessage = true;
      }


    })
    this.spinnerService.stop();
    console.log('vdcUserPrivilegeResponse', JSON.stringify(this.typeName));
  }
  pdfImageFile() {
    this.vdcUserPrivilegeResponse.forEach(element => {
      if (element.patientProfileDetails && element.patientProfileDetails.proofDocumentUrlList != undefined || element.patientProfileDetails && element.patientProfileDetails.proofDocumentUrlList != null) {
        console.log('proofDocumentUrlList-->',JSON.stringify(element.patientProfileDetails.proofDocumentUrlList));
        element.patientProfileDetails.proofDocumentUrlList.forEach(url => {
          if (url.substring(url.lastIndexOf('.') + 1, url.lastIndexOf('.') + 4).toString() == "pdf") {
            element.pdfImage = true;
          }
          else
            element.pdfImage = false;

        })
      }

    })
  }
  clickEventHandler(e) {
    if (e.event == 'viewButton') {
      this.onViewClick(e.val);

    } else if (e.event == 'pdfButton') {
      this.invoiceClick(e.val)
    }
  }
  onViewClick(item) {
    console.log(item.status)
    if(item.status==1 || item.status==3){
      return;
    }
    this.vdcUserPrivilegeList = item;
    this.patientProfile = this.vdcUserPrivilegeList.patientProfileDetails;
    (<any>$("#vdcdetails")).modal("show");
    console.log("vdcUpdateSeniorcitizen" + JSON.stringify(this.vdcUserPrivilegeList.patientProfileDetails.proofDocumentUrlList))
  }
  async rejectRequest() {

    let request = new VDCUserPrivilegeResponse();
    request.parentProfileId = this.vdcUserPrivilegeList.patientProfileId;
    request.type = this.vdcUserPrivilegeList.type;
    request.status = 0;
    request.remarks = this.remarks;
    request.empId = this.empId;
    if (this.remarks == undefined || this.remarks == null || this.remarks == '') {
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'Please Add Remarks.';
      this.isError = true;
      this.showMessage = true;
      return;
    }
    this.spinnerService.start();
    this.vdcuserPrivilegeService.updateuserprivilegetype(request).then(vdcUpdateSeniorcitizen => {
      this.spinnerService.stop();
      if (vdcUpdateSeniorcitizen.statusCode == 200 || vdcUpdateSeniorcitizen.statusCode == 201) {
        alert(vdcUpdateSeniorcitizen.statusMessage + ' Reject Request ');
        (<any>$("#vdcdetails")).modal("hide");
        this.remarks = '';
        this.errorMessage[0] = '';
        this.showMessage = false;

      } else {
        alert(vdcUpdateSeniorcitizen.statusMessage);
      }
    })

    this.getVdcUserPrivilegeList();

  }
  async approveRequest() {
    this.spinnerService.start();
    let request = new VDCUserPrivilegeResponse();

    request.parentProfileId = this.vdcUserPrivilegeList.patientProfileId;
    request.type = this.vdcUserPrivilegeList.type;
    request.status = 1;
    request.empId = this.empId;
    this.vdcuserPrivilegeService.updateuserprivilegetype(request).then(vdcUpdateSeniorcitizen => {
      this.spinnerService.stop();
      if (vdcUpdateSeniorcitizen.statusCode == 200 || vdcUpdateSeniorcitizen.statusCode == 201) {
        alert(vdcUpdateSeniorcitizen.statusMessage + ' Approved Request ');
        (<any>$("#vdcdetails")).modal("hide");

      } else {
        alert(vdcUpdateSeniorcitizen.statusMessage);
      }
    })
    this.getVdcUserPrivilegeList();
  }
  invoiceClick(invoice: any) {
    this.crouselSelectedImage = undefined;
    console.log("proofDocumentUrl-->" + JSON.stringify(invoice.patientProfileDetails.proofDocumentUrlList));
    if (invoice.patientProfileDetails && invoice.patientProfileDetails.proofDocumentUrlList != undefined || invoice.patientProfileDetails && invoice.patientProfileDetails.proofDocumentUrlList != null) {
      invoice.patientProfileDetails.proofDocumentUrlList.forEach(url => {
        let isPdf = url.substring(url.lastIndexOf('.') + 1, url.lastIndexOf('.') + 4).toString() == "pdf";
        if (isPdf == true) {
          this.authService.openPDF(url);
        }
        else {
          this.diagnosticsService.getPdfUrl(url).then(xdata => {
            this.crouselSelectedImage = this.diagnosticsService.tempPdfUrl;
          });
          (<any>$("#sliderimagepopup")).modal("show");
          $('#prescription-modal').css('height', 'none');
        }
      });
    }

  }

  sliderImage(imageSrc, type) {
    this.prescriptionType = type;
    this.crouselSelectedImage = undefined;
    if (type == "pdf") {
      this.authService.openPDF(imageSrc)
    } else {
      $('#prescription-modal').css('height', 'none');
      this.crouselSelectedImage = imageSrc;
    }
  }

  viewProofDocumentImage(imageSrc){
    this.diagnosticsService.getPdfUrl(imageSrc).then(xdata => {
      this.crouselSelectedImage = this.diagnosticsService.tempPdfUrl;
    });
    $('#prescription-modal').css('height', 'none');
  }

  onEnterPressed(e) {
    if (e.keyCode == 13) {
      this.getVdcUserPrivilegeList();
    }
  }
  onChangeStatus(value) {
    this.reset();
    this.getVdcUserPrivilegeList();
  }

  startDateChoosen($event): void {
    this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(),
      this.startDate.getDate(), 0, 0, 0)
    this.getUserPrivilegesPerDate();
  }

  endDateChoosen(event) {
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(),
      this.endDate.getDate(), 0, 0, 0);
    this.getUserPrivilegesPerDate();
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
  getUserPrivilegesPerDate() {
    this.reset();
    if (this.startDate == null || this.endDate == null)
      return;
    if (this.startDate > this.endDate) {
      this.errorMessage = new Array();
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "End date must be greater than start date";
      return;
    }
    this.fromdate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate);
    this.todate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000;
    this.getVdcUserPrivilegeList();
  }

  getUserPrivilegesListBasedOnPhnNo() {
    this.mobileNo = $('#search').val().toString();
    console.log("mobileNo: " + this.mobileNo);
    if (this.mobileNo.length < 10 || this.mobileNo.length > 10) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Enter 10 digits only";
      return;
    }
    else {
      this.isError = false;
      this.showMessage = false;
      this.errorMessage = new Array();
    }
    console.log("calling getVdcUserPrivilegeList");
    this.getVdcUserPrivilegeList();
  }

  RefreshButton() {
    this.type = 0;
    this.status = 0;
    this.fromdate = 0;
    this.todate = 0;
    this.mobileNo = '';
    this.fromIndex=0;
    this.perPage=10;

    this.vdcUserPrivilegeResponse = new Array();
    this.getVdcUserPrivilegeList();
  }

  onPage(page: number) {
    this.fromIndex = +page * +this.perPage;
    console.log("fromIndex2:: " + this.fromIndex);
    this.getVdcUserPrivilegeList();
  }





}