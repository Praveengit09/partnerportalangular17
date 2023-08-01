import { Component, OnInit } from '@angular/core';
import { ToasterService } from './toaster.service';


declare var jQuery: any;

@Component({
  selector: 'toaster',
  templateUrl: './toaster.template.html',
  styleUrls: ['./toaster.style.scss']
})
export class ToasterComponent implements OnInit {

  className:string="";
  message:string="Some text some message...";
 
  constructor(private toasterService:ToasterService){
    let self=this;
    window.addEventListener('online', () =>{
      self.toasterService.show('You are back online.','bg-success text-white',2000)
    });
    window.addEventListener('offline', () => {
      self.toasterService.show('You are currently offline.','bg-warning text-dark',-1)
    });
  }
  ngOnInit() {

  }
  getMessage():string{
    this.message=this.toasterService.message;
    return this.message;
  }
  getClassName():string{
    this.className=this.toasterService.className;
    return this.className;
  }
}

