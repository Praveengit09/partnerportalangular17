import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { AppConfig } from '../app.config';

import { SpinnerService } from '../layout/widget/spinner/spinner.service';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.template.html',
  styleUrls: ['./dashboard.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  config: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;

  constructor(config: AppConfig, private spinner: SpinnerService, private authService: AuthService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    // console.log("Dashboard--->"+JSON.stringify(this.authService.userAuth));
    // console.log("LoginPocDetails-->"+JSON.stringify(this.authService.selectedPocDetails));
    this.spinner.stop();
    if (this.authService.userNavArray == undefined || this.authService.userNavArray == null || this.authService.userNavArray.length == 0) {
      this.isError = true;
      this.showMessage = true;
      this.errorMessage = new Array<string>();
      this.errorMessage[0] = 'You do not have permissions to access any partner feature.';
      this.errorMessage[1] = 'Please contact the administrator for feature access.';
    } else {
      this.errorMessage = new Array<string>();
      this.isError = true;
      this.showMessage = true;
    }
  }

  ngOnDestroy() {
    this.spinner.start();
  }

}
