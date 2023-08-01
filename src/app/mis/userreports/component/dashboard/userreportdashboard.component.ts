import { PhrQustionConstIds } from './../../../../model/phr/phrQuestionIdList';
import { UserReportService } from './../../userreports.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
    selector: 'userreportdashbaord',
    templateUrl: './userreportdashboard.template.html',
    styleUrls: ['./userreportdashboard.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})


export class UserReportDashboardComponent implements OnInit {

    heatmapHScoreConfig = {
        type: 'average healthscore',
        populationVar: 'avrage',
        infowindowvars: ['name', 'userCount'],
        lonVar: 'latlng.longitude',
        latVar: 'latlng.latitude',
    }
    avghealthscoreresponse = [];
    phrDashboardConfig = {
        type: 'userCount',
        populationVar: 'userCount',
        infowindowvars: ['name'],
        lonVar: 'latlng.longitude',
        latVar: 'latlng.latitude',
    }
    PhrQustionConstIds = PhrQustionConstIds;
    phrDashboardEvent: any;
    phrDashboardResponse = [];
    selectedPhrQue = PhrQustionConstIds[0].id;
    constructor(private userReportService: UserReportService) {

    }
    public ngOnInit() {

    }
    onHeathscoreMapEmit(event) {
        this.userReportService.getHEATLH_SCORE_AVG_MAP_DATA(event.type, event.latlng).then(res => {
            console.log(res);
            if (this.avghealthscoreresponse != res) {
                this.avghealthscoreresponse = [];
                this.avghealthscoreresponse = res;
            }
        }).catch(err => console.log(err));
    }
    onPhrDashboadMapEmit(event = this.phrDashboardEvent) {
        this.phrDashboardEvent = event;
        let { type, latlng } = event;
        // averagephrdashboardgraphdetails  getPHR_DASHBOARD_MAP_DATA
        this.userReportService.getPHR_DASHBOARD_MAP_DATA(type, latlng, [this.selectedPhrQue]).then(res => {
            console.log(res);
            if (this.phrDashboardResponse != res) {
                this.phrDashboardResponse = [];
                this.phrDashboardResponse = res.filter((p) => p.answerId.toLowerCase() == 'yes');
                console.log(this.phrDashboardResponse);
                
            }
        }).catch(err => console.log(err));
    }
}