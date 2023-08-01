import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { DoctorService } from '../../doctor.service';
import { AppConfig } from '../../../app.config';
import { AuthService } from '../../../auth/auth.service';
import { Doctor } from '../../../model/employee/doctor';

@Component({
  selector: "referralNetwork",
  templateUrl: "./referralNetwork.template.html",
  styleUrls: ["./referralNetwork.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ReferralNetworkComponent implements OnInit {

  ReferralDoctorList: Doctor[] = new Array<Doctor>();

  columns: any[] = [
    {
      display: '#',
      variable: '',
      filter: 'index',
      sort: true,
      type: 'index',
    },
    {
      display: 'Partner Name',
      variable: 'firstName lastName',
      filter: 'text',
      sort: false
    },
    {
      display: 'Department',
      variable: 'serviceList',
      displayVariable: 'serviceName',
      breakFill:', ',
      filter: 'array-to-string',
      sort: false
    },
    {
      display: 'Mobile',
      variable: 'contactList[0]',
      filter: 'mobileNo',
      sort: false
    },
    {
      display: 'Email',
      variable: 'emailId',
      filter: 'email',
      sort: false
    },
  ];

 
  constructor(config: AppConfig, private authService: AuthService, private doctorService: DoctorService, private spinnerService: SpinnerService) {
  }


  ngOnInit() {
    this.getDoctorReferralNetworkQueue();
  }

  getDoctorReferralNetworkQueue() {
    this.spinnerService.start();
    let doctorStatusRes = this.doctorService.getSuggestedReferral(this.authService.userAuth.employeeId);
    doctorStatusRes.then(data => {
      this.spinnerService.stop();
      console.log('datanetwork' + JSON.stringify(data));
      this.ReferralDoctorList = data;
      if (this.ReferralDoctorList) {
        this.ReferralDoctorList.sort(function (a, b) {
          if (a.firstName < b.firstName)
            return -1;
          if (a.firstName > b.firstName)
            return 1;
          return 0;
        });
      }

    });
  }

  extractItem(item): string {
    //console.log("item in extractItem--->" + JSON.stringify(item));
    let length = item.serviceList.length;
    let arr: string = "";
    // if (length > 5) {
    //   for (let i = 0; i < 5; i++) {
    //     if (i < 4)
    //       arr = arr + item.serviceList[i].serviceName + " , ";
    //     else
    //       arr = arr + item.serviceList[i].serviceName;
    //   }
    //   arr = arr + "....";
    // }
    //  if {
    for (let i = 0; i < length; i++) {
      if (i < length - 1)
        arr = arr + item.serviceList[i].serviceName + " , ";
      else
        arr = arr + item.serviceList[i].serviceName;
    }
    // }
    //console.log("arr in extractItem-->" + arr);
    return arr;
  }

  clickEventHandler(e) {
    console.log(e);
    if (e.event == "") { 
     
    }
  }
}
