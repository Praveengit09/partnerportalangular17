import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../../../../base/config';
import { BasketConstants } from '../../../../constants/basket/basketconstants';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { Payment } from '../../../../model/basket/payment';
import { SlotBookingDetails } from '../../../../model/basket/slotBookingDetails';
import { Employee } from '../../../../model/employee/employee';
import { DiscountType } from '../../../../model/package/discountType';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { AdminService } from './../../../../admin/admin.service';
import { AuthService } from "./../../../../auth/auth.service";
import { HsLocalStorage } from './../../../../base/hsLocalStorage.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { DiagnosticDeliveryAdviceTrack } from './../../../../model/diagnostics/diagnosticListForAdmin';
import { InvestigationTestDetails } from './../../../../model/diagnostics/investigationTestDetails';
import { PaymentType } from './../../../../model/payment/paymentType';
import { Coordinates } from './../../../../model/poc/coordinates';
import { Address } from './../../../../model/profile/address';
import { ContactInfo } from './../../../../model/profile/contactInfo';
import { Location } from './../../../../model/profile/location';
import { UpdateAddress } from './../../../../model/profile/updateAddress';
import { OnboardingService } from './../../../../onboarding/onboarding.service';
import { ReceptionService } from './../../../../reception/reception.service';
import { DiagnosticsService } from './../../../diagnostics.service';

@Component({
  templateUrl: './orderdetails.template.html',
  styleUrls: ['./orderdetails.style.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class OrderDetailsComponent implements OnInit, OnDestroy {

  investigationList: Array<InvestigationTestDetails> = new Array<InvestigationTestDetails>();
  diagnosticAdminOrderDetails: DiagnosticDeliveryAdviceTrack;

  isErrorCheck: boolean = false;
  errorMessageCheck: Array<string>;
  showMessageCheck: boolean;

  crouselSelectedImage: String;
  prescriptionType = "";

  pocId: number;
  empId: number;
  empName: string;
  pocName: string;
  validation: any;
  paymentModeIndex: number = Payment.PAYMENT_TYPE_CASH;
  transactionId: string;
  discountType: number = DiscountType.TYPE_DIAGNOSTIC_DISCOUNT;
  isUpdateSample: boolean = false;

  couponDiscountAmount: number = 0;
  partnerDiscountAmount: number = 0;
  promotionalDiscountAmount: number = 0;
  privilegeDiscountAmount: number = 0;
  selectedId: number;

  employeeList: Employee[];
  selectedEmpId: number = 0;
  selectedEmp: string = "";
  isPriceZero: boolean;
  centralAdminModify: boolean;
  isReception: boolean = false;
  enableCreditUser: boolean = false;
  enablePhleboVendorAssignment: boolean;
  vendorList: PocAdviseData[];
  selectedVendorPocId: number = 0;
  selectedVendorPocName: string = null;

  editAddress: Address = new Address();
  localityResponse: any;
  locationIndex: number = 0;
  isParentProfileAddress: boolean = false;
  paymentStatus: number = 1;
  selectedEmployeeId: number = 0;
  selectedVendorId: number = 0;
  assignedCheck: boolean = false;
  addressChange: number = 0;
  cancellationRemarks: string = '';
  vdcSlotDuration: number = 0;
  isVendor: boolean = false;
  isEdit: boolean = false;
  refId: boolean = true;
  editOrder: boolean = true;
  pin1: string = '';
  pin2: string = '';
  lisRepost: boolean = false;
  disableMobileAndEdit: boolean = false;
  isVDC: boolean = false;
  branchLogin: boolean = false;

  constructor(private diagnosticsService: DiagnosticsService, private authService: AuthService, private router: Router, private adminService: AdminService,
    private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService, private _validation: ValidationUtil, private receptionService: ReceptionService,
    private cd: ChangeDetectorRef, private onboardingService: OnboardingService) {
    this.diagnosticAdminOrderDetails = this.diagnosticsService.orderDetailAdviceTrack;
    this.pocId = authService.userAuth.pocId;
    this.pocName = authService.userAuth.pocName;
    this.empId = authService.userAuth.employeeId;
    this.empName = authService.userAuth.employeeName;
    this.validation = _validation;
    if (Config && Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment) {
      if (authService.userAuth.selectedPoc.pocType == 9) {
        this.isVendor = true;
        this.enablePhleboVendorAssignment = false;
      } else {
        this.enablePhleboVendorAssignment = Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enablePhleboVendorAssignment;
      }
    }
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableCreditUser) {
      this.enableCreditUser = true;
      this.isVDC = true;
    }

    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.disableMobileAndEditOption)
      this.disableMobileAndEdit = true;
  }

  ngOnInit(): void {
    this.diagnosticAdminOrderDetails = this.diagnosticsService.orderDetailAdviceTrack;
    this.centralAdminModify = this.diagnosticsService.centralAdminModify;
    this.isReception = this.diagnosticsService.isReception;
    console.log("ngOnit:>>>>>> " + JSON.stringify(this.diagnosticAdminOrderDetails));
    if (this.diagnosticAdminOrderDetails) {
      let data = {
        'diagnosticsAdminDetails': this.diagnosticAdminOrderDetails,
        'centralAdminModify': this.diagnosticsService.centralAdminModify,
        'isReception': this.diagnosticsService.isReception
      };
      this.hsLocalStorage.saveComponentData(data);
    } else {
      this.diagnosticAdminOrderDetails = this.hsLocalStorage.getComponentData().diagnosticsAdminDetails;
      this.centralAdminModify = this.hsLocalStorage.getComponentData().centralAdminModify;
      this.isReception = this.hsLocalStorage.getComponentData().isReception;
      this.diagnosticsService.orderDetailAdviceTrack = this.diagnosticAdminOrderDetails;
      if (!this.diagnosticAdminOrderDetails) {
        this.gotoDiagnosticsOrderList();
      }
    }

    if (this.isVDC && (this.diagnosticAdminOrderDetails.referenceId == undefined || this.diagnosticAdminOrderDetails.referenceId == null) && (this.diagnosticAdminOrderDetails.lisMessage != "ORDER PLACED SUCCESSFULLY" || this.diagnosticAdminOrderDetails.lisMessage == null || this.diagnosticAdminOrderDetails.lisMessage == undefined) && this.isVendor == false)
      this.lisRepost = true;

    if(this.isVDC && this.diagnosticAdminOrderDetails.bookingSubType == 0 && this.diagnosticAdminOrderDetails.referenceId != null && this.diagnosticAdminOrderDetails.referenceId.length)
      this.editOrder = false;

    if (this.isVDC && this.isReception)
      this.branchLogin = true;

    if (this.diagnosticAdminOrderDetails.patientProfileDetails && (this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo == null || this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo == undefined)) {
      this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo = new ContactInfo();
      this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses.push(this.diagnosticAdminOrderDetails.deliveryAddress);
      this.isParentProfileAddress = true;
    }
    this.diagnosticAdminOrderDetails.convertedDocumentUrlList = new Array();
    let check = true;
    if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.proofDocumentUrlList && this.diagnosticAdminOrderDetails.proofDocumentUrlList.length > 0) {
      this.diagnosticAdminOrderDetails.proofDocumentUrlList.forEach(proof => {
        if (proof.includes("https:")) {
          check = false;
          this.authService.getTempFileURLFromSecureURL(proof).then((resp) => {
            if (resp.statusCode == 200 || resp.statusCode == 201)
              this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(resp.data);
          })
        }
      })
    }

    if (check && this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.proofDocumentUrlList && this.diagnosticAdminOrderDetails.proofDocumentUrlList.length > 0) {
      this.diagnosticAdminOrderDetails.proofDocumentUrlList.forEach(url => {
        if (url.substring((url.lastIndexOf('.') + 1)).toString() == "pdf" || url.substring((url.lastIndexOf('.') + 1)).toString() == "png" || url.substring((url.lastIndexOf('.') + 1)).toString() == "jpg") {
          this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
        }
        else {
          if (url.includes("pdf"))
            this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(url);
          else {
            this.diagnosticsService.getPdfUrl(url).then(xdata => {
              this.diagnosticAdminOrderDetails.convertedDocumentUrlList.push(this.diagnosticsService.tempPdfUrl);
            });
          }
        }
      });
    }

    if (this.diagnosticAdminOrderDetails && this.diagnosticAdminOrderDetails.payment) {
      this.paymentModeIndex = this.diagnosticAdminOrderDetails.payment.transactionType;
      if (this.diagnosticAdminOrderDetails.payment.originalAmount > 0 && this.diagnosticAdminOrderDetails.payment.originalAmount == this.diagnosticAdminOrderDetails.payment.packageDiscountAmount) {
        this.diagnosticAdminOrderDetails.payment.finalAmount = 0;
      }
    }
    this.investigationList = this.diagnosticAdminOrderDetails.serviceList;
    const service = this.investigationList.find(element => element.originalPrice <= 0 || element.netPrice <= 0);
    console.log("servicee: ", service);
    if (service)
      this.isPriceZero = true;

    this.calculatePrice();
    this.cd.detectChanges();
    this.selectedVendorId = this.diagnosticAdminOrderDetails.vendorPocId ? this.diagnosticAdminOrderDetails.vendorPocId : 0;
    this.selectedEmployeeId = this.diagnosticAdminOrderDetails.employeeAccepted ? this.diagnosticAdminOrderDetails.employeeAccepted : 0;
    if (!this.isReception) {
      if (this.enablePhleboVendorAssignment) {
        this.getVendorsList();
      } else {
        this.getEmployeeList();
      }
    }
    this.checkPaymentStatusSelection(this.diagnosticAdminOrderDetails.payment.paymentStatus);
    this.addressChange = this.diagnosticAdminOrderDetails.payment.paymentStatus;
    console.log("employeeAccepted: " + this.diagnosticAdminOrderDetails.employeeAccepted);
    this.getProfileDetails();
    if (this.enableCreditUser) {
      if (this.diagnosticAdminOrderDetails.referenceId && this.diagnosticAdminOrderDetails.referenceId.length)
        this.refId = false;
      let t = this.diagnosticAdminOrderDetails.pickupTime;
      if (this.diagnosticAdminOrderDetails.bookingSubType)
        this.vdcSlotDuration = t + 3600000;
      else
        this.vdcSlotDuration = t + 3600000 * 4;
    }
  }

  getVendorsList() {
    this.diagnosticsService.geVendorListWithPOC(this.pocId).then(list => {
      this.vendorList = list;
    });
    if (this.selectedVendorId) {
      this.assignedCheck = true;
      this.selectedVendorPocId = this.selectedVendorId;
      this.selectedVendorPocName = this.diagnosticAdminOrderDetails.vendorPocName;
    }
    else this.assignedCheck = false;
  }

  onClickEdit() {
    console.log("editing", JSON.stringify(this.diagnosticAdminOrderDetails));
    this.editAddress = this.diagnosticAdminOrderDetails.deliveryAddress;
    this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses.forEach((address, index) => {
      address.label = address.addressType == Address.ADDRESS_HOME ? 'Home Address' :
        (address.addressType == Address.ADDRESS_OFFICE ? 'OfficeAddress' :
          (address.addressType == Address.ADDRESS_OTHER && (address.label != undefined && address.label != null &&
            address.label.length > 0) ? address.label : 'Other Address'))
      if (this.editAddress.addressId == 0) {
        (address.label == this.editAddress.label && address.pinCode == this.editAddress.pinCode) ? this.selectedId = index + 1 : "";
      } else
        address.addressId == this.editAddress.addressId ? this.selectedId = index + 1 : "";
    });
    console.log("sid", this.selectedId);
    (<any>$("#updateAddress")).modal("show");
  }

  selectedAddressType() {
    let isFound: boolean = false;
    let addressType = this.editAddress.addressType;
    if (this.editAddress != null && this.editAddress.addressType != undefined && this.editAddress.addressType > -1 &&
      this.editAddress.addressType != Address.ADDRESS_OTHER) {
      this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses.forEach((item, index) => {
        if (item.addressType == this.editAddress.addressType) {
          this.editAddress = JSON.parse(JSON.stringify(item));
          isFound = true;
          this.selectedId = index + 1;
        }
      });
    }
    if (!isFound) {
      this.editAddress = new Address();
      this.selectedId = 0;
      this.isEdit = true;
      this.editAddress.addressType = addressType;
    }
    else
      this.isEdit = false;
  }


  setSelectedAddress(index: number) {
    this.localityResponse = null;
    this.locationIndex = 0;
    if (index == 0) {
      this.editAddress = new Address();
      this.editAddress.addressType = 2;
      this.isEdit = true;
      (<any>$("#updateAddress")).modal("show");
    }
    else if (this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses[index - 1] && this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses[index - 1].addressId != 0 && this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses[index - 1].addressId > -1 && this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses != undefined && this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses != null) {
      this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses.forEach(address => {
        if (this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses[index - 1].addressId == address.addressId) {
          this.editAddress = address;
        }
      });
      this.isEdit = false;
    }
  }

  searchByPinCode(pinCode: any, pincodeChanged: boolean) {
    if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || pinCode.length == 6) {
      this.spinnerService.start();
      this.localityResponse = null;
      this.locationIndex = -1;
      this.editAddress.areaName = '';
      this.editAddress.area = 0;
      this.onboardingService.getStateCityByPinCode(pinCode).then(response => {
        if (response.length > 0) {
          if (pincodeChanged) {
            this.editAddress.city = response[0].cityId;
            this.editAddress.cityName = response[0].cityName;
            this.editAddress.state = response[0].stateId;
            this.editAddress.stateName = response[0].stateName;
          }
          this.localityResponse = response[0].localityList;

        }
        this.spinnerService.stop();
      });
    }
  }

  onLocationChange() {
    if (this.localityResponse && this.localityResponse.length > 0 && this.locationIndex >= 0) {
      let index = this.locationIndex;
      this.editAddress.area = this.localityResponse[index].id;
      this.editAddress.areaName = this.localityResponse[index].name;
      console.log('Selected area is ' + this.editAddress.areaName);
      console.log('Selected areaID is ' + this.editAddress.area);
    }
  }


  saveAddressRemark() {
    if (this.editAddress.area == null || this.editAddress.area == undefined || this.editAddress.area == 0 || this.editAddress.areaName == '') {
      this.isErrorCheck = true;
      this.showMessageCheck = true;
      this.errorMessageCheck[0] = "Please add Area";
      return;
    }
    this.localityResponse = null;
    this.locationIndex = 0;
    this.diagnosticAdminOrderDetails.acceptedEmpId = this.empId;
    this.diagnosticAdminOrderDetails.acceptedEmpName = this.empName;
    this.diagnosticAdminOrderDetails.payment.paymentStatus = this.addressChange; //saving address without change in payment status
    this.diagnosticAdminOrderDetails.deliveryAddress = this.editAddress;
    (<any>$("#updateAddress")).modal("hide");
    this.spinnerService.start();
    this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticAdminOrderDetails).then(data => {
      this.spinnerService.stop();
      this.errorMessageCheck = new Array();

      if (data.statusCode == 201 || data.statusCode == 200) {
        this.isErrorCheck = false;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = "";
        this.showMessageCheck = false;
        alert("Address saved successfully");
        this.getProfileDetails();
        this.onGenerateBack();
      }
      else {
        this.isErrorCheck = true;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = data.statusMessage;
        this.showMessageCheck = true;
      }
    });
  }

  saveAddress() {
    this.isErrorCheck = false;
    this.showMessageCheck = false;
    this.errorMessageCheck = new Array();

    if (this.editAddress.addressType == Address.ADDRESS_OTHER && (this.editAddress.label == undefined || this.editAddress.label == null || this.editAddress.label.length == 0)) {
      this.showMessageCheck = true;
      this.isErrorCheck = true;
      this.errorMessageCheck[0] = "Please enter a name for this address";
      return;
    }
    if (this.editAddress.address1 == undefined || this.editAddress.address1 == null || this.editAddress.address1 == "") {
      this.isErrorCheck = true;
      this.showMessageCheck = true;
      this.errorMessageCheck[0] = "Please add Address";
      return;
    }
    if (this.editAddress.landmark == undefined || this.editAddress.landmark == null || this.editAddress.landmark == "") {
      this.isErrorCheck = true;
      this.showMessageCheck = true;
      this.errorMessageCheck[0] = "Please add Landmark";
      return;
    }
    if (this.editAddress.pinCode == undefined || this.editAddress.pinCode == null || this.editAddress.pinCode == "" || this.editAddress.pinCode.length < 6) {
      this.isErrorCheck = true;
      this.showMessageCheck = true;
      this.errorMessageCheck[0] = "Please enter a valid pin code";
      return;
    }
    if (this.isEdit == true) {
      this.isErrorCheck = true;
      this.showMessageCheck = true;
      this.errorMessageCheck[0] = "Please select a valid Address";
      return;
    }

    if (!this.isParentProfileAddress)
      this.updateAddress();
    else
      this.saveAddressRemark();
  }

  updateAddress() {
    let addressRequest: UpdateAddress = new UpdateAddress();
    addressRequest.profileId = this.diagnosticAdminOrderDetails.patientProfileId;
    addressRequest.address = this.editAddress;
    this.spinnerService.start();
    this.receptionService.saveAddress(addressRequest).then(data => {
      this.spinnerService.stop();
      this.errorMessageCheck = new Array();

      if (data.statusCode == 201 || data.statusCode == 200) {
        this.isErrorCheck = false;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = "";
        this.showMessageCheck = false;
        this.editAddress = data.address;
        this.saveAddressRemark();
      }
      else {
        this.isErrorCheck = true;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = data.statusMessage;
        this.showMessageCheck = true;
      }
    });
  }

  getEmployeeList() {
    this.diagnosticsService.getEmployeeListWithPOC(this.pocId).then(list => {      
      this.employeeList = list.filter(e => e.employeeBlacklisted != true);
    });
    if (this.selectedEmployeeId) {
      this.assignedCheck = true;
      this.selectedEmpId = this.selectedEmployeeId;
      this.selectedEmp = this.diagnosticAdminOrderDetails.employeeAcceptedName;
    }
    else this.assignedCheck = false;
  }

  onEmployeeSelect(empId): void {
    this.selectedEmpId = empId;
    let empItem = this.employeeList.find(emp => Number(emp.empId) === Number(empId));
    console.log("onEmployeeSelect: ", empItem);
    this.selectedEmp = empItem.firstName + (empItem.lastName ? " " + empItem.lastName : "")
  }

  onVendorSelect(pocId): void {
    this.selectedVendorPocId = pocId;
    let vendor = this.vendorList.find(vendor => +vendor.pocId == +pocId);
    this.selectedVendorPocName = vendor.pocName;
  }

  onReassignOrder() {
    this.diagnosticAdminOrderDetails.acceptedEmpId = this.empId;
    this.diagnosticAdminOrderDetails.acceptedEmpName = this.empName;
    this.diagnosticAdminOrderDetails.payment.paymentStatus = this.addressChange;
    if (this.enablePhleboVendorAssignment) {
      if (this.selectedVendorPocId > 0) {
        this.diagnosticAdminOrderDetails.vendorPocId = this.selectedVendorPocId;
        this.diagnosticAdminOrderDetails.vendorPocName = this.selectedVendorPocName;
        this.updateAssignedVendorProcess();
      } else {
        this.isErrorCheck = true;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = "Please select a vendor for assignment";
        this.showMessageCheck = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      }
    } else {
      if (this.selectedEmpId > 0) {
        this.diagnosticAdminOrderDetails.employeeAccepted = this.selectedEmpId;
        this.diagnosticAdminOrderDetails.employeeAcceptedName = this.selectedEmp;
        this.diagnosticAdminOrderDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.ACCEPTED;
        this.updateAssignedProcess();
      } else {
        this.isErrorCheck = true;
        this.errorMessageCheck = new Array();
        this.errorMessageCheck[0] = "Please select an employee for assignment";
        this.showMessageCheck = true;
        $('html, body').animate({ scrollTop: '0px' }, 300);
        return;
      }
    }
  }
  updateAssignedProcess() {
    this.spinnerService.start();
    this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticAdminOrderDetails).then(data => {
      this.spinnerService.stop();
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.assignedCheck == true ? alert('Reassigned Successfully') : alert('Assigned Successfully');
        this.router.navigate(['/app/diagnostics/homeorders/adminhomeorderlist']);
      } else {
        if (data.statusMessage != null)
          alert(data.statusMessage);
        else
          alert('Something went wrong. Please try after sometime');
      }
    })
  }

  updateAssignedVendorProcess() {
    this.spinnerService.start();
    this.diagnosticsService.updateDiagnosticVendorAssignment(this.diagnosticAdminOrderDetails).then(data => {
      this.spinnerService.stop();
      if (data.statusCode == 200 || data.statusCode == 201) {
        this.assignedCheck == true ? alert('Reassigned Successfully') : alert('Assigned Successfully');
        this.router.navigate(['/app/diagnostics/homeorders/adminhomeorderlist']);
      } else {
        if (data.statusMessage != null)
          alert(data.statusMessage);
        else
          alert('Something went wrong. Please try after sometime');
      }
    })
  }

  rejectOrder() {
    (<any>$("#rejectModal")).modal("hide");
    $('#rejectModal').on('hidden.bs.modal', function (e) {
      $(".modal-backdrop").remove();
    });
    if (this.enablePhleboVendorAssignment) {
      this.diagnosticAdminOrderDetails.actionPerformed = 0;
      this.diagnosticAdminOrderDetails.cancellationStatus = 2;
    }
    else {
      this.diagnosticAdminOrderDetails.actionPerformed = 10;
      //added check for vendor cancellation
      if (!this.enablePhleboVendorAssignment)
        this.diagnosticAdminOrderDetails.cancellationStatus = 1;
    }
    this.diagnosticAdminOrderDetails.remarks = this.cancellationRemarks;
    this.diagnosticAdminOrderDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.REJECTED;
    this.onSubmit();
  }

  onMarkClick() {
    if (this.isReception)
      this.paymentModeIndex = Payment.PAYMENT_TYPE_MOBILE;
    console.log("onMarkClick");
    //$('html, body').animate({ scrollTop: '0px' }, 300);
    this.spinnerService.start();
    // this.diagnosticsService.subServiceDiagnosticsOrderAdmin = this.diagnosticAdminOrderDetails;
    if (this.enableCreditUser && this.diagnosticAdminOrderDetails.payment.creditUser == 1 && this.diagnosticAdminOrderDetails.clientName && this.diagnosticAdminOrderDetails.clientName.length) {
      this.diagnosticAdminOrderDetails.payment.paymentStatus = Payment.PAYMENT_STATUS_NOT_PAID;
      this.onSubmit();
    }
    else if (this.diagnosticAdminOrderDetails.amountToBePaid > 0) {
      if (this.paymentModeIndex == undefined || this.paymentModeIndex == 0) {
        this.errorMessageCheck = new Array<string>();
        this.errorMessageCheck[0] = "Please select a payment mode";
        this.isErrorCheck = true;
        this.showMessageCheck = true;
        this.spinnerService.stop();
        return;
      } else if (this.paymentModeIndex == 0) {
        this.errorMessageCheck = new Array<string>();
        this.errorMessageCheck[0] = "Please select a payment mode";
        this.isErrorCheck = true;
        this.showMessageCheck = true;
        this.spinnerService.stop();
        return;
      }
      if (this.paymentModeIndex && this.paymentModeIndex == 5) {
        this.diagnosticAdminOrderDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.COLLECTION_PENDING;
        this.diagnosticAdminOrderDetails.payment.transactionType = this.paymentModeIndex;
        this.diagnosticAdminOrderDetails.payment.paymentStatus = Payment.PAYMENT_STATUS_PENDING;
      } else {
        this.diagnosticAdminOrderDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.COLLECTION_PENDING;
        this.diagnosticAdminOrderDetails.payment.transactionType = this.paymentModeIndex;
        this.diagnosticAdminOrderDetails.payment.transactionId = this.transactionId;
        if (this.centralAdminModify)
          this.diagnosticAdminOrderDetails.payment.paymentStatus = Payment.PAYMENT_STATUS_NOT_PAID;
        else
          this.diagnosticAdminOrderDetails.payment.paymentStatus = this.paymentStatus;
      }
      // alert("Payment done Successfully");
      this.spinnerService.stop();
      this.onSubmit();
    } else {
      this.spinnerService.stop();
      this.diagnosticAdminOrderDetails.sampleCollectionStatus = DiagnosticDeliveryAdviceTrack.UPDATE_SAMPLE;
      this.isUpdateSample = true;
      this.onSubmit();
      // this.router.navigate(['/app/diagnostics/orderresults']);
    }
  }

  onGenerateBack() {
    this.gotoDiagnosticadminlist();
  }

  onSubmit(): void {
    this.diagnosticAdminOrderDetails.acceptedEmpId = this.empId;
    this.diagnosticAdminOrderDetails.acceptedEmpName = this.empName;
    this.spinnerService.start();
    this.diagnosticsService.updateDiagnosticAdminRemarks(this.diagnosticAdminOrderDetails).then(data => {

      if (data.statusCode == 201 || data.statusCode == 200) {
        if (this.isReception) {
          this.router.navigate(['/app/diagnostics/slotbooking/slotqueue']);
          return;
        }
        console.log('success-------------');
        this.diagnosticAdminOrderDetails.statusCode = data.statusCode;
        this.diagnosticAdminOrderDetails.statusMessage = data.statusMessage;
        this.diagnosticAdminOrderDetails.amountPaid = data.amountPaid;
        if (data.amountToBePaid)
          this.diagnosticAdminOrderDetails.amountToBePaid = data.amountToBePaid;
        if (data.amountToBeRefunded)
          this.diagnosticAdminOrderDetails.amountToBeRefunded = data.amountToBeRefunded
        this.diagnosticAdminOrderDetails.pdfUrlWithHeader = data.pdfUrlWithHeader;
        this.diagnosticAdminOrderDetails.pdfUrlWithoutHeader = data.pdfUrlWithoutHeader;
        this.diagnosticAdminOrderDetails.payment = data.payment;
        this.diagnosticAdminOrderDetails.basketDiscount = data.basketDiscount;
        console.log("PaymentStatus: " + this.diagnosticAdminOrderDetails.payment.paymentStatus);
        this.diagnosticsService.diagnosticsAdviseTrack = this.diagnosticAdminOrderDetails;
        this.spinnerService.stop();
        if (this.diagnosticAdminOrderDetails.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.REJECTED) {
          this.gotoDiagnosticadminlist();
        } else if ((this.diagnosticAdminOrderDetails.payment.paymentStatus == Payment.PAYMENT_STATUS_PAID)
          && this.isUpdateSample) {
          this.diagnosticsService.subServiceDiagnosticsOrderAdmin = data;
          console.log("OrderDetData: " + JSON.stringify(this.diagnosticsService.subServiceDiagnosticsOrderAdmin));
          this.router.navigate(['/app/diagnostics/orderresults']);
        } else {
          if (this.diagnosticAdminOrderDetails.payment.paymentStatus == Payment.PAYMENT_STATUS_PENDING) {

          } else {
            this.diagnosticAdminOrderDetails.amountToBePaid = 0;
          }
          console.log("PaymentStatus1: " + this.diagnosticAdminOrderDetails.payment.paymentStatus);

          ($('#messageModal') as any).modal({
            backdrop: 'static',
            keyboard: false,
            show: true
          });
        }
      }
      else {
        console.log('fails-------------')
        this.spinnerService.stop();
        this.errorMessageCheck = new Array<string>();
        this.errorMessageCheck[0] = data.statusMessage;
        this.isErrorCheck = true;
        this.showMessageCheck = true;
      }
    });

  }

  onCloseButtonClick() {
    if (this.diagnosticAdminOrderDetails.payment.paymentStatus == Payment.PAYMENT_STATUS_PENDING) {
      this.gotoDiagnosticadminlist();
    }
    else
      this.gotoDiagnosticadminlist();
  }

  gotoDiagnosticsOrderList(): void {
    this.router.navigate(['/app/diagnostics']);
  }

  gotoDiagnosticadminlist(): void {
    if (this.centralAdminModify && this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN)
      this.router.navigate(['/app/diagnostics/diagnosticadmin/centralwalkinorders']);
    else if (this.centralAdminModify && this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_HOME)
      this.router.navigate(['/app/diagnostics/diagnosticadmin/centralhomeorders']);
    else if (this.diagnosticsService.cancelOrder && this.diagnosticAdminOrderDetails.isAdminHomeOrder)
      this.router.navigate(['/app/diagnostics/diagnosticadmin/cancelledorders']);
    else if (this.diagnosticAdminOrderDetails.isAdminHomeOrder)
      this.router.navigate(['/app/diagnostics/homeorders/adminhomeorderlist']);
    else if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN)
      this.router.navigate(['/app/diagnostics/slotbooking/slotqueue']);
    else if (this.diagnosticsService.diagBookingSubType == SlotBookingDetails.INVESTIGATION_SUB_TYPE_WALKIN_BILLING)
      this.router.navigate(['/app/diagnostics/orders']);
    else if (this.enableCreditUser)
      this.router.navigate(['/app/diagnostics/diagnosticadmin/centralhomeorders']);
    else
      this.router.navigate(['/app/diagnostics/homeorders/homeorderlist']);
  }

  onEdit() {
    this.router.navigate(['/app/diagnostics/homeorders/editorderdetail']);
  }

  calculatePrice() {
    if (this.diagnosticAdminOrderDetails.basketDiscount && this.diagnosticAdminOrderDetails.basketDiscount.length > 0) {
      this.diagnosticAdminOrderDetails.basketDiscount.forEach(item => {
        if (item.type == BasketConstants.DISCOUNT_TYPE_PROMOTIONAL) {
          this.promotionalDiscountAmount = this.roundToTwo(item.discountAmount);
        } else if (item.type == BasketConstants.DISCOUNT_TYPE_PARTNER) {
          this.partnerDiscountAmount = this.roundToTwo(item.discountAmount);
        } else if (item.type == BasketConstants.DISCOUNT_TYPE_COUPON) {
          this.couponDiscountAmount = this.roundToTwo(item.discountAmount);
        } else if (item.type == BasketConstants.DISCOUNT_TYPE_PRIVELEGE_CARD) {
          this.privilegeDiscountAmount = this.roundToTwo(item.discountAmount);
        }
      });
    }
  }

  checkPaymentModeSelection(index: number) {
    this.paymentModeIndex = index;
    this.showMessageCheck = false;
    this.errorMessageCheck = new Array();
    this.isErrorCheck = false;
  }

  checkPaymentStatusSelection(index: number) {
    if (index == 1) {
      this.diagnosticAdminOrderDetails.payment.paymentStatus = this.paymentStatus = PaymentType.PAYMENT_STATUS_PAID;
    } else {
      this.diagnosticAdminOrderDetails.payment.paymentStatus = this.paymentStatus = PaymentType.PAYMENT_STATUS_NOT_PAID;
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

  hideToolBar(e) {
    $('.toolbar').css('display', 'none');
    return false;
  }

  roundToTwo(num) {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }

  onPrintButtonClick() {
    if (this.authService.userAuth.pdfHeaderType == 0) {
      this.authService.openPDF(this.diagnosticAdminOrderDetails.pdfUrlWithHeader);
    } else {
      this.authService.openPDF(this.diagnosticAdminOrderDetails.pdfUrlWithoutHeader);
    }
  }

  getProfileDetails() {
    this.adminService.getPHRForProfileId(this.diagnosticAdminOrderDetails.parentProfileId).then(response => {
      if (response.statusCode == 200 || response.statusCode == 201)
        this.diagnosticAdminOrderDetails.patientProfileDetails.contactInfo.addresses = response.contactInfo.addresses;
      console.log("response", JSON.stringify(this.diagnosticAdminOrderDetails));
    });
  }

  onCallUser(number) {
    let altno = false;
    number == 1 ? altno = false : altno = true;
    this.diagnosticsService.placeClickCallRequest(this.diagnosticAdminOrderDetails.parentProfileId, altno).then(resp => {
      if (resp && (resp.statusCode == 200 || resp.statusCode == 201)) {
        let temp = '';
        temp = 'Number : ' + resp.data.contactNo + ', Pin : ' + resp.data.pin;
        altno ? this.pin2 = temp : this.pin1 = temp;
      } else {
        alert(resp.statusMessage);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  onChooseAddress(addressResponse) {
    addressResponse = JSON.parse(JSON.stringify(addressResponse));
    if (addressResponse && addressResponse.formatted_address) {
      this.editAddress.address1 = addressResponse.formatted_address;
      this.isEdit = false;
      if (addressResponse.address_components && addressResponse.address_components.length > 0) {
        let filteredArr = addressResponse.address_components.filter(itm => itm.types && itm.types && itm.types.length > 0 && itm.types[0] == "postal_code");
        if (filteredArr && filteredArr.length > 0) {
          this.editAddress.pinCode = filteredArr[0].short_name;
          this.searchByPinCode(this.editAddress.pinCode, true);
        }
      }
      if (addressResponse.geometry) {
        this.editAddress.locationCoordinates = new Coordinates();
        this.editAddress.locationCoordinates.lon = addressResponse.geometry.location.lng;
        this.editAddress.locationCoordinates.lat = addressResponse.geometry.location.lat;
        this.editAddress.location = new Location();
        this.editAddress.location.coordinates = new Array();
        this.editAddress.location.coordinates.push(addressResponse.geometry.location.lng);
        this.editAddress.location.coordinates.push(addressResponse.geometry.location.lat);
      }
    }
  }


  onClickEditAddress1() {
    this.isEdit = true;
  }

  repostLisOrder() {
    (<any>$("#lisrepost")).modal("hide");
    $('#lisrepost').on('hidden.bs.modal', function (e) {
      $(".modal-backdrop").remove();
    });
    let post = this.diagnosticAdminOrderDetails.postPrandialSplitting ? true : false;
    let req = {
      "orderId": this.diagnosticAdminOrderDetails.orderId,
      "baseInvoiceId": this.diagnosticAdminOrderDetails.baseInvoiceId,
      "parentProfileId": this.diagnosticAdminOrderDetails.parentProfileId,
      "patientProfileId": this.diagnosticAdminOrderDetails.patientProfileId,
      "postPrandialSplit": post,
    }
    this.spinnerService.start();
    this.diagnosticsService.repostOrderIntoLIS(req).then(response => {
      console.log("response", JSON.stringify(response));
      this.spinnerService.stop();
      alert(response.statusMessage);
      this.gotoDiagnosticadminlist();
    });
  }

  ngOnDestroy() {
    this.diagnosticsService.isReception = false;
    window.localStorage.removeItem('isReception');
  }

} 