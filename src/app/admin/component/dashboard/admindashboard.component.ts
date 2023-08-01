import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AppConfig } from '../../../app.config';

@Component({
  selector: 'admindashboard',
  templateUrl: './admindashboard.template.html',
  styleUrls: ['./admindashboard.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {
  config: any;

  constructor(config: AppConfig) {
    this.config = config.getConfig();
  }

  ngOnInit(): void {

  }

}
