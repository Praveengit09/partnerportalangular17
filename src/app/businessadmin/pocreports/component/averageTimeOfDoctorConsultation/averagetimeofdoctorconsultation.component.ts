import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AuthService } from '.././../../../auth/auth.service';
import { ReportRequest } from '../../../../model/report/reportrequest';
import { ReportResponse } from '../../../../model/common/reportResponse';
import { BusinessAdminService } from '../../../businessadmin.service';

@Component({
    selector: 'averageTimeOfDoctorConsultation',
    templateUrl: './averagetimeofdoctorconsultation.template.html',
    styleUrls: ['./averagetimeofdoctorconsultation.style.scss'],
    encapsulation: ViewEncapsulation.None
  })


  

export class  AverageTimeOfDoctorConsultation implements OnInit{

    dropDownIndexForPastDate: number = 0 ;
    toDate: number;
    startingDate: number;
    perPage: number = 5;
    total: number = 0;
    dataMsg: string = ''
    doctorAvgTimeConsultationsList: any[] = new Array<any>();
    

  

    columns: any[] = [
      
        {
          display: 'Centre Name',
          variable: 'pocName',
          filter: 'text',
          sort: false
        },
        {
          display: 'Doctor Name',
          variable: 'doctorFirstName doctorLastName',
          filter: 'text',
          sort: false
        },
        {
          display: 'Average Time',
          variable: 'avgTime',
          filter: 'text',
          sort: false
        }
      ];
    
      sorting: any = {
        column: 'date',
        descending: 'true'
    
      };
  
    constructor(private businessAdmin:BusinessAdminService,private authService:AuthService){
      this.dropDownIndexForPastDate = 0;

    }

    ngOnInit(): void {
      this.onDateOptionChange(this.dropDownIndexForPastDate);
    
    }


    // getAvgOfConsultationsList(request) {

    //     this.businessAdmin.getDoctorAvgTimeConsultationsList(request).then(reponse => {
    //       this.doctorAvgTimeConsultationsList = reponse;
    //       if (this.doctorAvgTimeConsultationsList.length == 0) {
    //         alert("no data found")
    //         this.dataMsg = "NO Data Found"
    //       }
    //     });
    //   }
    
      getadmincount() {
    
        let dateOffset;
        if (this.dropDownIndexForPastDate == 0) {
          dateOffset = (24 * 60 * 60 * 1000) * 7; // for 7 days
        } else if (this.dropDownIndexForPastDate == 1) {
          dateOffset = (24 * 60 * 60 * 1000) * 15; // for 15 days
        } else if (this.dropDownIndexForPastDate == 2) {
          dateOffset = (24 * 60 * 60 * 1000) * 30; // for 30 days
        }
        let startDate = new Date();
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        startDate.setTime(startDate.getTime() - dateOffset);
        this.startingDate = startDate.getTime();
        let endDate = new Date();
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setTime(endDate.getTime() - (24 * 60 * 60 * 1000));
        this.toDate = endDate.getTime();
        let request: ReportRequest = new ReportRequest();
        request.fromDate = startDate.getTime();
        request.toDate = endDate.getTime();
        request.pocIds = new Array<number>();
        console.log("POC_AUTH::" + this.authService.userAuth.pocId);
        // request.pocIds = this.authService.employeeDetails.pocIdList;
        request.pocIds = this.authService.loginResponse.employee.pocIdList;
     
        // request.perPOC = true;
        console.log("requesttttt" + JSON.stringify(request));
        return this.businessAdmin.getDoctorAvgTimeConsultationsList(request);
      }
      onDateOptionChange(index: number) {
        this.dropDownIndexForPastDate = index;
        console.log("dropDownIndexForPastDate:: " + this.dropDownIndexForPastDate);
        this.getadmincount().then(response => {
          if(response.length > 0)
          {
            this.doctorAvgTimeConsultationsList = response;
            this.total = this.doctorAvgTimeConsultationsList.length;
          }
          else{
                this.dataMsg = 'No Data Found';
          }
         
         
          this.doctorAvgTimeConsultationsList.forEach((queue) => {
            if (queue.time > 0) {
                queue.avgTime = Math.round(queue.time / 60000) + " " + 'mins';
            }
            else {
                queue.avgTime = 0 + " " + 'mins';
            }
        })

          console.log("Response In ConsumerOnboarded OnDateOptionChange:: " + JSON.stringify(this.doctorAvgTimeConsultationsList));
    
        });
      }


    
}