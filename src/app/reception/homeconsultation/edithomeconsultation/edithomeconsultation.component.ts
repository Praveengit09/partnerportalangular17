import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { CryptoUtil } from '../../../auth/util/cryptoutil';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { ReceptionService } from '../../../reception/reception.service';
import { AuthService } from '../../../auth/auth.service';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonUtil } from '../../../base/util/common-util';
import { DoctorService } from '../../../doctor/doctor.service';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';

@Component({
  selector: 'edithomeconsultation',
  templateUrl: './edithomeconsultation.template.html',
  styleUrls: ['./edithomeconsultation.style.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EditHomeConsultationComponent implements OnInit {

  doctorHomeConsultTrack: SlotBookingDetails;
  request: SlotBookingDetails = new SlotBookingDetails();
  response: SlotBookingDetails;
  date: Date = new Date();
  Time: Date = new Date(1970, 0, 1);
  fromTime: Date = new Date(1970, 0, 1);
  time: number;
  orderId: string;
  invoiceId: string;
  empId: number;
  cancelSlotResponse: any;
  remarks: string;
  id: number;
  disable: boolean = false;
  consultationModeIndex: number;
  isError: boolean = false;
  errorMessage: Array<string> = new Array<string>();
  showMessage: boolean = false;
  readonly: boolean = true;
  datepickerOpts = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'd MM yyyy',
  }

  constructor(
    private receptionService: ReceptionService, private diagnosticService: DiagnosticsService,
    private authService: AuthService, private hsLocalStorage: HsLocalStorage,
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private doctorService: DoctorService, private route: ActivatedRoute) {
    this.empId = this.authService.userAuth.employeeId;

  }


  ngOnInit() {
    this.doctorHomeConsultTrack = this.receptionService.doctorHomeConsultTrack;
    if (this.doctorHomeConsultTrack != undefined) {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('doctorHomeConsultTrack', cryptoUtil.encryptData(JSON.stringify(this.doctorHomeConsultTrack)));
    }
    else {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('doctorHomeConsultTrack') != null) {
        this.doctorHomeConsultTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('doctorHomeConsultTrack')));
      }
    }

    this.date = new Date((this.doctorHomeConsultTrack.slotDate) + this.commonUtil.getTimezoneDifferential());
    this.Time = this.fromTime = new Date(this.doctorHomeConsultTrack.slotTime);
    this.onFromTimeSelected();

  }

  checkConsultationMode(index: number)//update status of doctor consultation
  {
    this.readonly = false;
    this.resetErrorMessage();
    this.consultationModeIndex = index;
    if (this.consultationModeIndex == 0) {
      this.readonly = false;
    }
    else {
      this.readonly = true;
    }
    if (this.consultationModeIndex == 2) {
      this.doctorHomeConsultTrack.invoiceCompletionStatus = 12;
    }
    else {
      this.doctorHomeConsultTrack.invoiceCompletionStatus = 11;
    }
  }

  goToHomeConsultationList() {
    this.router.navigate(['app/reception/homeconsult/listing']);
  }

  onDateSelected() {
    console.log("onDateSelected:");

    if (this.date > new Date()) {
      this.resetErrorMessage();
    }
    this.onFromTimeSelected();
  }

  onTime() {
    this.resetErrorMessage();
  }
  onFromTimeSelected() {
    this.disable = false;
    var checkDateAndTime = this.commonUtil.dateAndTimeValidation(this.date, this.fromTime);
    console.log('checkDateAndTime' + checkDateAndTime);
    if (checkDateAndTime == -1 && this.doctorHomeConsultTrack.invoiceCompletionStatus == 10) {
      this.disable = true;
    }
    else if (checkDateAndTime == -1 && this.doctorHomeConsultTrack.invoiceCompletionStatus != 10) {
      this.setErrorMessage("Please Select Correct Time !");
      return false;
    }
    else if (checkDateAndTime == 1 || checkDateAndTime == 0) {
      console.log('disable' + this.disable);

      this.onTime();
      return true;
    }
    return false;
  }

  onUpdate() {
    var date = new Date(this.date.getFullYear(), this.date.getMonth(),
      this.date.getDate(), 0, 0, 0).getTime();
    this.doctorHomeConsultTrack.slotDate = date;
    this.doctorHomeConsultTrack.remarks = this.remarks;
    this.doctorHomeConsultTrack.payment.transactionType = 0;
    if (this.Time) {
      this.doctorHomeConsultTrack.slotTime = this.fromTime.getTime();
    }

    if (this.commonUtil.convertOnlyDateToTimestamp(this.date) < this.commonUtil.convertOnlyTimeStampToTime(new Date())) {
      this.setErrorMessage("Please Select Correct Date");
      return;
    }
    if (this.onFromTimeSelected() == false && this.consultationModeIndex != 2) {

      return;
    };

    if (this.consultationModeIndex == undefined || this.consultationModeIndex == null) {
      this.setErrorMessage("Please Select Status");
      return;
    }
    this.request = this.doctorHomeConsultTrack;
    this.resetErrorMessage();
    this.spinnerService.start();
    this.doctorService.UpdateHomeConsultationStatus(this.request).then(response => {
      this.spinnerService.stop();
      this.response = response;
      if (this.response.statusCode == 200 || this.response.statusCode == 201) {
        this.response = new SlotBookingDetails();
        window.alert('Successfully Updated');
        this.goToHomeConsultationList();
      }
      else {
        window.alert("Something went wrong please try again...!!")
        console.log('hi');
      }
    })
  }

  resetErrorMessage() {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }

  setErrorMessage(setErrorMessageAs): void {
    this.isError = true;
    this.errorMessage = new Array();
    this.errorMessage[0] = setErrorMessageAs;
    this.showMessage = true;
  }



}