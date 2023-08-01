import { SpinnerService } from './../../../../layout/widget/spinner/spinner.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { DoctorService } from '../../../doctor.service';
import { FavouritePartners } from '../../../../model/employee/favouritePartners';

@Component({
  selector: "partnerNetwork",
  templateUrl: "./partnerNetwork.template.html",
  styleUrls: ["./partnerNetwork.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class PartnerNetworkComponent implements OnInit {
  partnerNetworks: Array<FavouritePartners> = new Array();
  partnerTitles: any;
  constructor(private router: Router, private authservice: AuthService, private doctorservice: DoctorService, private spinnerService: SpinnerService) {

  }
  ngOnInit() {
    this.partnerNetworks = this.authservice.employeeDetails.partners;
    if (this.partnerNetworks)
      this.getPartnersTitles();
    console.log("=========>>>> " + JSON.stringify(this.partnerNetworks))
  }
  manage_partners() {
    this.router.navigate(['/app/doctor/favorites/partnerNetwork/manageNetwork']);
  }
  getPartnersTitles() {
    this.spinnerService.start();
    this.doctorservice.getPartnerTitle().then(response => {
      this.spinnerService.stop();
      this.partnerTitles = response;
      for (let i = 0; i < this.partnerNetworks.length; i++) {
        for (let j = 0; j < this.partnerTitles.length; j++) {
          if (this.partnerNetworks[i].subTypeId == this.partnerTitles[j].id) {
            this.partnerNetworks[i].Type = this.partnerTitles[j].type;
          }
        }
      }
    });
  }


}
