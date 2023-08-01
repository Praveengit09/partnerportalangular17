import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { DoctorService } from '../../doctor.service';
import { CryptoUtil } from '../../../auth/util/cryptoutil';
import { DiagnosticsService } from '../../../diagnostics/diagnostics.service';
import { ReceptionService } from '../../../reception/reception.service';
import { AuthService } from '../../../auth/auth.service';
import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';
import { CommonUtil } from '../../../base/util/common-util';

@Component({
    selector: 'edithomeconsultation',
    templateUrl: './edithomeconsultation.template.html',
    styleUrls: ['./edithomeconsultation.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class EditHomeConsultationComponent implements OnInit 
{

  doctorHomeConsultTrack:SlotBookingDetails;
  request:SlotBookingDetails = new SlotBookingDetails();
  response:SlotBookingDetails;
  date: Date = new Date();
  Time: Date = new Date(1970, 0, 1);
  fromTime: Date = new Date(1970, 0, 1);
  time:number;
  orderId:string;
  invoiceId:string;
  empId:number;
  cancelSlotResponse: any;
  disabled:boolean = false;
  errorMessage1: Array<string>;
  isError1: boolean;
  showMessage1: boolean;
  remarks:string;
  disable:boolean = false;
  consultationModeIndex:number;
  isError:boolean =false;
  errorMessage:Array<string>;
  showMessage:boolean =false;
  readonly:boolean = true;
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
    private router: Router, private spinnerService: SpinnerService, private commonUtil: CommonUtil,private doctorService:DoctorService) {
    this.empId = this.authService.userAuth.employeeId;
  }


  ngOnInit()
  {
    this.doctorHomeConsultTrack = this.doctorService.doctorHomeConsultTrack;
    if (this.doctorHomeConsultTrack != undefined)
    {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      window.localStorage.setItem('doctorHomeConsultTrack', cryptoUtil.encryptData(JSON.stringify(this.doctorHomeConsultTrack)));
    } 
    else 
    {
      let cryptoUtil: CryptoUtil = new CryptoUtil();
      if (window.localStorage.getItem('doctorHomeConsultTrack') != null) 
      {
        this.doctorHomeConsultTrack = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('doctorHomeConsultTrack')));
      }
    }
   
      this.date = new Date((this.doctorHomeConsultTrack.slotDate) + this.commonUtil.getTimezoneDifferential());
     this.Time = this.fromTime = new Date(this.doctorHomeConsultTrack.slotTime);
    this.onFromTimeSelected();
  }

  checkConsultationMode(index:number)//update status of doctor consultation
  {
    this.readonly = false;
    this.resetErrorMessage();
    this.consultationModeIndex = index;
    if(this.consultationModeIndex == 0)
    {
      console.log('enable')
      this.readonly = false;
      console.log('enable'+this.readonly)
    }
    else
    {
      this.readonly = true; 
    }
    // if(this.consultationModeIndex == 3)
    // {
    //   this.doctorHomeConsultTrack.cancellationStatus = 2
    // }
   if(this.consultationModeIndex == 2)
    {
      this.doctorHomeConsultTrack.invoiceCompletionStatus = 12;
    }
    else
    {
      this.doctorHomeConsultTrack.invoiceCompletionStatus = 11;
    }
  }

  goToDoctorHomeConsultationList() 
  {
    this.router.navigate(['app/doctor/doctorhomeconsult/listing']);
  }

  onDateSelected() 
  {
    if (this.date > new Date()) {
      this.isError1 = false;
      this.errorMessage1 = new Array();
      this.showMessage1 = false;
    }
    this.onFromTimeSelected();
  }

  onTime() 
  {
    this.isError1 = false;
    this.errorMessage1 = new Array();
    this.showMessage1 = false;
  }
  onFromTimeSelected() 
  {
    this.fromTime = new Date(this.fromTime);
    this.disabled = false;
    var today = new Date()
    var todayDate = new Date().getDate() + new Date().getMonth() + new Date().getFullYear();
    var givenDate = this.date.getDate() + this.date.getMonth() + this.date.getFullYear();
    
      if (todayDate == givenDate) 
      {
        var today = new Date()
        var hr = today.getHours();
        var min = today.getMinutes();
        var hr2 = this.fromTime.getHours();
        var min2 = this.fromTime.getMinutes();
        if (hr2 > hr) 
        {
          this.onTime();
        }
        else if (hr2 == hr) 
        {
          if (min2 >= min) 
          {
            this.onTime();
          }
          else {
            if(this.doctorHomeConsultTrack.invoiceCompletionStatus == 10)
            {
              this.disable = true;
              this.disabled = false;
            }
            else{
              this.disabled = true;
              this.isError1 = true;
              this.errorMessage1 = new Array();
              this.errorMessage1[0] = "Please Select Correct Time  !!";
              this.showMessage1 = true;
            }
           
          }
   
        }
        else {
          if(this.doctorHomeConsultTrack.invoiceCompletionStatus == 10)
          {
            this.disable = true;
            this.disabled = false;
          }
          else{
            this.disabled = true;
            this.isError1 = true;
            this.errorMessage1 = new Array();
            this.errorMessage1[0] = "Please Select Correct Time  !!";
            this.showMessage1 = true;
          }
        
        }
       
      }
      else if(todayDate > givenDate)
      {
        if(this.doctorHomeConsultTrack.invoiceCompletionStatus == 10)
        {
          this.disable = true;
          this.disabled = false;
        }
        return;
      }
      else {
        this.onTime();
      }

    
  }


  onUpdate()
  {

    this.doctorHomeConsultTrack.slotDate = this.commonUtil.convertDateToTimestamp(this.date);
    this.doctorHomeConsultTrack.remarks = this.remarks;
    this.doctorHomeConsultTrack.payment.transactionType = 0;
    if (this.Time) {
      this.doctorHomeConsultTrack.slotTime = this.fromTime.getTime();
    }
   if (this.consultationModeIndex == undefined || this.consultationModeIndex == null) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Please Select Status";
      this.showMessage = true;
      return;
    }
    if(this.showMessage1 == true)
    {
      return;
    }
    this.request = this.doctorHomeConsultTrack;
    this.spinnerService.start();
    this.doctorService.UpdateHomeConsultationStatus(this.request).then(response => {
    this.response = response;
    this.spinnerService.stop();
    if (this.response.statusCode == 200 || this.response.statusCode == 201) {
      window.alert('Successfully Updated');
      this.response = new SlotBookingDetails();
      this.goToDoctorHomeConsultationList();
    }
    else {
      window.alert("Something went wrong please try again...!!")
    }
    })
  }

  resetErrorMessage()
  {
    this.isError = false;
    this.errorMessage = new Array();
    this.showMessage = false;
  }

  
}