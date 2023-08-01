import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

import { HsLocalStorage } from '../../../base/hsLocalStorage.service';
import { AutoRefreshInterval } from '../../../model/common/autorefresh';
import { Config } from '../../../base/config';

@Component({
  selector: 'auto-refresh',
  templateUrl: './refresh.template.html',
  styleUrls: ['./refresh.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class RefreshComponent implements OnInit, OnDestroy {
  @Input('componentName') public componentName: string;
  @Output() public refreshEvent = new EventEmitter();
  paymentListRefresh: any;
  unsubscribe: number;
  refreshTime: number;
  dropDownIndex1: number = 0;
  autoRefreshChange: boolean = false;
  randomId: number;
  disableSecondsRefresh: boolean = false;

  constructor(private localStorage: HsLocalStorage) {
    this.randomId = Math.floor(Math.random() * 10);
  }

  ngOnInit() {
    // Get auto refresh interval from local storage
    let autoRefreshInterval: AutoRefreshInterval = this.localStorage.getData(this.componentName);
    if (autoRefreshInterval != undefined && autoRefreshInterval != null) {
      this.dropDownIndex1 = autoRefreshInterval.refreshListIndex;
      this.autoRefreshChange = true;
      if (this.dropDownIndex1 != 0)
        this.onRefreshPageList(this.dropDownIndex1);
    }
    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.disableSecondsRefresh) {
      this.disableSecondsRefresh = Config.portal.specialFeatures.disableSecondsRefresh;
    }
    // if (Config.portal && Config.portal.diagnosticOptions && Config.portal.diagnosticOptions.enableSpotBooking) {
    //   this.dropDownIndex1 = 30000;
    //   this.autoRefreshChange = true;
    //   this.onRefreshPageList(this.dropDownIndex1);
    // }
  }

  onRefreshPageList(event) {
    this.autoRefreshChange = true;
    let autoRefreshInterval: AutoRefreshInterval = new AutoRefreshInterval();

    autoRefreshInterval.refreshListIndex = event;
    this.localStorage.setData(this.componentName, autoRefreshInterval);
    if (event == 0 && this.paymentListRefresh != undefined && this.paymentListRefresh != null) {
      clearInterval(this.paymentListRefresh);

      return;
    }
    else {
      if (this.unsubscribe == 1 && this.paymentListRefresh != undefined && this.paymentListRefresh != null) {
        console.log("$$$unsubscribed");
        clearInterval(this.paymentListRefresh);
        // this.paymentListRefresh.unsubscribe();
      }
      this.unsubscribe = 1;
      console.log("event" + (event));
      this.refreshTime = event;
      this.dropDownIndex1 = event;

      this.paymentListRefresh = setInterval(
        (val) => {
          console.log("&&&" + this.refreshTime);
          this.refreshEvent.emit(this.refreshTime);
        },
        this.refreshTime
      );
      // Observable.interval(this.refreshTime).subscribe((val) => {
      //   console.log("&&&" + this.refreshTime);
      //   this.refreshEvent.emit(this.refreshTime);
      // });
    }
  }

  ngOnDestroy(): void {
    if (this.paymentListRefresh != undefined && this.paymentListRefresh != null) {
      // this.paymentListRefresh.unsubscribe();
      clearInterval(this.paymentListRefresh);
    }
  }
}
