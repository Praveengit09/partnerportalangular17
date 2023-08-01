import { Component } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { Config } from './../../../base/config';
@Component({
  selector: 'spinner-component',
  templateUrl: './spinner.template.html',

  // 'template': '<div *ngIf="active" class="loader"><div class="cssload-thecube"><div class="cssload-cube cssload-c1"></div><div class="cssload-cube cssload-c2"></div><div class="cssload-cube cssload-c4"></div><div class="cssload-cube cssload-c3"></div></div></div>',
  // // 'template': '<div *ngIf="active" class="loader"><div id="test" class="rotating"></div></div>',

  styleUrls: ['./spinner.style.scss']
})
export class SpinnerComponent {
  public active: boolean = false;

  jeevoneSpinner: boolean

  public constructor(spinner: SpinnerService) {
    
    spinner.status.subscribe((status: boolean) => {
      this.jeevoneSpinner = Config.portal.customizations && Config.portal.customizations.customizedSpinner;
 
      this.active = status;
    });
  }
}