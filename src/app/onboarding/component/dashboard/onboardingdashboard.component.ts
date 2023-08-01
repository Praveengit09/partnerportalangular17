import { ToasterService } from './../../../layout/toaster/toaster.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from './../../../app.config';

import { SpinnerService } from './../../../layout/widget/spinner/spinner.service';
import { AuthService } from './../../../auth/auth.service';
import { Config } from '../../../base/config';
@Component({
  selector: 'onboardingdashboard',
  templateUrl: './onboardingdashboard.template.html',
  styleUrls: ['./onboardingdashboard.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OnboardingDashboardComponent implements OnInit {

  environment: string = Config.portal.name || 'MyMedic';

  shareEnabledInNav = (<any>navigator).share ? true : false;
  isMobile: boolean;
  
  config: any;
  errorMessage: Array<string>;
  isError: boolean;
  showMessage: boolean;
  hasBusinessAdminRole: boolean;
  appConfig :any = Config.portal;

  constructor(config: AppConfig, private authService: AuthService, private toast: ToasterService) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {
    this.isMobile = this.detectMobileDevice();
  }

  copyAppUrlForRefer() {
    let pocId = (this.authService.selectedPocDetails.pocId + '').padStart(10, '0');
    let appId = (this.appConfig.appId + '').padStart(3, '0');
    let brandName = this.appConfig.name;

    let doctorMessage = `Download the ${brandName} app for doctor bookings, diagnostic tests and more from Google Play Store: https://r.my3c.co/`+appId+`02`+pocId +`1 and  App Store : https://r.my3c.co/`+appId+`02`+pocId +`4`

    if (this.isMobile && (<any>navigator).share) {
      (<any>navigator).share({
        text: doctorMessage,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
      return;
    }

    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = doctorMessage;
    // Set non-editable to avoid focus and move outside of view
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.setAttribute('readonly', '');
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
    this.toast.show('Message copied', "bg-success text-white font-weight-bold", 2000);
  }

  detectMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
