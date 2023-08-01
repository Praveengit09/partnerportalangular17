import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
    selector: 'chartsGraph',
    // encapsulation: ViewEncapsulation.None,
    templateUrl: './charts.template.html',
    // styleUrls: ['./layout.style.scss']
})
export class ChartsGraph implements OnInit {

    Linechart: any;
    @Input() chartType;
    @Input() chartLabels;
    @Input() chartData;
    @Input() classNames: string;
    @Input() id: string = 'chart';
    @Input() height: string = '250';
    @Input() width: string = '1100';

    ngOnInit(): void {
        setTimeout(e => {
            this.graphSetUp()
        }, 1)
    }

    graphSetUp() {
        this.Linechart = new Chart(this.id, {
            type: this.chartType,
            data: {
                labels: this.chartLabels,
                datasets: this.chartData
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            //labelString: 'Age'

                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 10
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        display: true
                    }],
                }
            }
        });
    }
}