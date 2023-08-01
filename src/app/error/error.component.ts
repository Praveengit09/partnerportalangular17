import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../base/config';

@Component({
  selector: 'error',
  styleUrls: [ './error.style.scss' ],
  templateUrl: './error.template.html',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'error-page app'
  },
})
export class ErrorComponent {

  // environment: string = Config.TEST_TYPE == Config.LIVE_MY3C ? 'MyMedic' : 'MyMedic'; 
  environment: string = Config.portal.name || 'MyMedic';   
  
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  searchResult(): void {
    this.router.navigate(['/app', 'extra', 'search']);
  }
}
