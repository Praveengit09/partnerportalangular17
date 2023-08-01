import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from './../../../base/config';

@Component({
  selector: 'diagnosticdashboard',
  templateUrl: './diagnosticdashboard.template.html',
  styleUrls: ['./diagnosticdashboard.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class DiagnosticDashBoardComponent {

  constructor(private router: Router) {
    // disabled graph dashboard for vdc
    if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableSpotBooking) {
      this.router.navigate(['/app/dashboard']);
    }
  }

}
