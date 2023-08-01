import { Component, ViewEncapsulation, OnInit, Input, SimpleChange } from '@angular/core';
import { CentralDashboardTotalCountView } from '../../../model/common/centraldashboardtotalcountview';
import { TurnAroundTimeVo } from '../../../model/common/turnaroundtimevo';
import { keys } from 'd3';

@Component({
  selector: 'turnaroundtime',
  templateUrl: './turnaroundtime.template.html', 
  styleUrls: ['./turnaroundtime.style.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class TurnAroundTimeComponent implements OnInit {
  @Input() turnAroundTimeList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  perPage: number = 5;
  total: number = 0;
  dataMsg: string = '';
  hasData:boolean = false;
  opsDashboardDataList: CentralDashboardTotalCountView = new CentralDashboardTotalCountView();
  turnAroundTimeData: TurnAroundTimeVo[] = new Array<TurnAroundTimeVo>();
  columns_turnaroundtime: any[] = [
    {
      display: 'Date',
      variable: 'createdTime',
      filter: 'text',
      sort: false
    },
    {
      display: 'Onboarding Customer Calls(in mins)',
      variable: 'onboardingInteractedTATAvg',
      filter: 'text',
      sort: false
    },
    {
      display: 'Avg of doctor orders customer calls(in mins)',
      variable: 'doctorConsumerInteractedTATAvg',
      filter: 'text',
      sort: false
    },
    {
      display: 'Avg of diagnostic orders customer calls(in mins)',
      variable: 'diagnosticsConsumerInteractedTATAvg',
      filter: 'text',
      sort: false
    },
    {
      display: 'Avg of Doctor as provider calls(in mins)',
      variable: 'doctorInteractedOrderTATAvg',
      filter: 'text',
      sort: false
    },
    {
      display: 'Avg of Diagnostic as provider calls(in mins)',
      variable: 'diagnosticsInteractedOrderTATAvg',
      filter: 'text',
      sort: false
    }
  ]

  ngOnInit(): void {
    this.setData();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
   if (changes['turnAroundTimeList']) {
      this.turnAroundTimeList = changes['turnAroundTimeList'].currentValue;
      if (JSON.stringify(this.turnAroundTimeList) === '{}') {
        return;
      }
      else {
        this.setData();
      }

    }

  }

  setData() {
    this.hasData = false;
    this.opsDashboardDataList = new CentralDashboardTotalCountView();
    this.opsDashboardDataList.listOfTurnAroundTime = new Array<TurnAroundTimeVo>();
  
    this.turnAroundTimeData = new Array<TurnAroundTimeVo>();
    console.log('checkdatapresence'+JSON.stringify(this.turnAroundTimeList));
    this.opsDashboardDataList = this.turnAroundTimeList;
    this.hasData = JSON.stringify(this.turnAroundTimeList) != '{}' &&
                    this.turnAroundTimeList.listOfTurnAroundTime.length > 0;
     this.turnAroundTimeData.forEach((e, i) => {
      this.turnAroundTimeData[i] = new TurnAroundTimeVo();
    });
    
    if (this.opsDashboardDataList && this.opsDashboardDataList.listOfTurnAroundTime.length > 0 ) {
      console.log('checkdatapresence'+JSON.stringify(this.opsDashboardDataList.listOfTurnAroundTime));
 
    this.turnAroundTimeData = this.opsDashboardDataList.listOfTurnAroundTime;
    this.total = this.turnAroundTimeData.length;
      var elementkeys = [];
      elementkeys = keys(this.turnAroundTimeData[0]);
      elementkeys = elementkeys.slice(2, elementkeys.length);
      console.log('elementkeys'+JSON.stringify(elementkeys))
      this.turnAroundTimeData.forEach((queue) => {
        elementkeys.forEach((keyValue) => {
          // this.convertTimeToMins(queue[keyValue]);
          if (queue[keyValue] > 0) {
            queue[keyValue] = (Math.round(queue[keyValue] / 60000) );
          }
          else {
            queue[keyValue] = (0 );
          }
        })
      });
    }
    else {
      this.total = 0;
      this.dataMsg = 'No Data Found'
    }
  }

  openModal() {
    (<any>$)("#tat_modal").modal("show");
}

closeModal() {
    (<any>$)("#tat_modal").modal("hide");
}

convertTimeToMins(value){
  if (value > 0) {
    value= (Math.round(value / 60000) + " " + 'mins');
  }
  else {
    value = (0 + " " + 'mins');
  }
  return value;
}


}