import { Component, ViewEncapsulation,Injector } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'phr',
  templateUrl: './phr.template.html',
  styleUrls: ['./phr.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PhrComponent {
  config: any;
date4: Date = new Date(2016, 5, 10);
datepickerOpts = {
    startDate: new Date(2016, 5, 10),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'D, d MM yyyy'
}
   constructor(injector: Injector,private router: Router) {
    
  }

 ///// check box show  and hide code start here /////// 
 ec_check(){
   if ($("#ec_check").is(":checked")) {
                $("#em_contact").show();
            } else {
                $("#em_contact").hide();
            }
 }

  ins_check(){
     if ($("#ins_check").is(":checked")) {
                $("#ins_details").show();
            } else {
                $("#ins_details").hide();
            }
  }
///// check box show  and hide code end here /////// 
}
