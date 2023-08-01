import { log } from 'util';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from '../../../auth/auth.service';
import { DoctorService } from '../../doctor.service';
import { ToasterService } from '../../../layout/toaster/toaster.service';
import { EmployeePocMapping } from '../../../model/employee/employeepocmapping';

@Component({
  selector: "cdssOptions",
  templateUrl: "./cdssOptions.template.html",
  styleUrls: ["./cdssOptions.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class cdssOptionsComponent implements OnInit {
  pocRolesList: Array<EmployeePocMapping> = new Array<EmployeePocMapping>();
  pocName: string;
  doctorEditable: boolean;
  doctorSpecific: boolean;
  brandSpecific: boolean;
  brandDefaults: boolean;
  DoctorService: any;
  cdssOptions: any;
  constructor(private authService: AuthService, private toast: ToasterService, private doctorService: DoctorService) {
    // this.pocRolesList = authService.employeePocMappingList;
    // this.cdsssOptions=this.pocRolesList[0].participationSettings.cdssOptions;
  }

  ngOnInit() {
    this.cdssOptions = this.authService.selectedPocDetails.cdssOptions;
    this.pocName  = this.authService.selectedPocDetails.pocName;
    console.log(this.cdssOptions)
  }

  modifyCDSSOptions() {
    // for (let i = 0; i < this.pocRolesList.length; i++) {
    let updateCdssOptions = {
      "cdssOption": {
        "brandDefaults": this.cdssOptions.brandDefaults,
        "brandSpecific": this.cdssOptions.brandSpecific,
        "doctorEditable": this.cdssOptions.doctorEditable,
        "doctorSpecific": this.cdssOptions.doctorSpecific
      },
      
      "doctorId": this.authService.employeeDetails.empId,
      "pocId": this.authService.selectedPocDetails.pocId,
      
    }
    

    console.log(updateCdssOptions);
    let displayed = false;
    this.doctorService.modifyCDSSOptions(updateCdssOptions).then(resp => {
      console.log(resp);
      if (resp.statusCode == 200 && displayed == false) {
        displayed = true;
        this.toast.show('' + resp.statusMessage, "bg-success text-white font-weight-bold", 5000);
      } else if (displayed == false) {
        displayed = true;
        this.toast.show('' + resp.statusMessage, "bg-danger text-white font-weight-bold", 5000);
      }
    });
    // }

  }


}
