import { Component, OnInit } from '@angular/core';
import { Config } from '../../base/config';


declare var jQuery: any;

@Component({
  selector: '[footer]',
  templateUrl: './footer.template.html',
  styleUrls: ['./footer.style.scss']
})
export class Footer implements OnInit {

 environment:any= Config.portal;

  ngOnInit() {

  }

}

