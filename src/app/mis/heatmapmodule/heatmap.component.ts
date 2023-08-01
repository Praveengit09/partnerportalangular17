import { HttpService } from './../../base/http.service';
import { AppConstants } from '../../base/appconstants';
import { ViewEncapsulation, Component, Input, Output, EventEmitter, OnChanges, OnInit, AfterViewInit } from '@angular/core';
import { } from 'googlemaps';
// import { } from '@type/googlemaps';

declare var google: any;
var gradients = {
    prered: [
        'rgba(255, 0, 0, 0)',
        'rgba(255, 0, 0, 1)'
    ],
    pregreen: [
        'rgba(0, 255, 0, 0)',
        'rgba(0, 255, 0, 1)'
    ],
    red: [
        'rgba(224, 34, 27,0)',
        'rgba(224, 34, 27, 1)'
    ],
    orange: [
        'rgba(232, 80, 34,0)',
        'rgba(232, 80, 34, 1)'
    ],
    darkyellow: [
        'rgba(235, 148, 35,0)',
        'rgba(235, 148, 35, 1)'
    ],
    liteyellow: [
        'rgba(242, 216, 47,0)',
        'rgba(242, 216, 47, 1)'
    ],
    green: [
        'rgba(17, 191, 17, 0)',
        'rgba(17, 191, 17, 1)'
    ],
    blue: [
        'rgba(0, 0, 255, 0)',
        'rgba(0, 0, 255, 1)'
    ]
};
@Component({
    selector: 'heatmap',
    styles: [`agm-map {
        height: 55vh;
        width: 100%;
    }`],
    templateUrl: './heatmap.template.html',
    encapsulation: ViewEncapsulation.None,
})
export class HeatmapComponent implements OnChanges, OnInit, AfterViewInit {

    lat: number = 22.0574;
    lng: number = 78.9382;
    heatmapList: Array<any> = new Array();
    isHeatmapActive: boolean;
    locViewType = 'state';
    zoomSize = 5;
    lastType = 'state';
    lastLatLng = [0, 0];
    lastFetchedRes = [];

    @Input('isColorIndActive') isColorIndActive: boolean = false;
    @Input() config: any = {
        type: '',
        populationVar: '_',
        infowindowvars: ['-'],
    };
    @Input() dataList: [] = [];
    @Output() onEmit: EventEmitter<any> = new EventEmitter();
    private map: any = null;
    constructor(private http: HttpService) {

    }
    ngAfterViewInit(): void {
        // this.generateHealthScoreBasedHeatMap(this.dataList);
    }

    ngOnInit(): void {
        // this.ngOnChanges();
        // this.lastType = this.locViewType;
        // this.lastLatLng = [+this.lat, +this.lng];
        // this.onEmit.emit({
        //     type: this.locViewType,
        //     latlng: this.lastLatLng
        // });
    }
    ngOnChanges(): void {
        let oldList = [...this.heatmapList];
        // if (this.lastFetchedRes != this.dataList) {
        this.lastFetchedRes = this.dataList;
        this.generateHealthScoreBasedHeatMap(this.dataList);
        this.clearOverLay(oldList);
        // }
    }
    onMapLoad(mapInstance: any) {
        this.map = mapInstance;
    }
    centerChange(e) {
        console.log(e);
        this.lat = e.lat;
        this.lng = e.lng;
        // this.setLatLng(e.lat, e.lng);
    }
    onZoomChange(event) {
        console.log(event);
        this.zoomSize = event;
        if (event >= 0 && event <= 5) this.locViewType = 'state';
        else if (event >= 6 && event <= 9) this.locViewType = 'city';
        else if (event >= 10) this.locViewType = 'area';
    }
    onIdle(event) {
        console.log(event);
        let distanceDif = this.calculateDistanceInKilometer(this.lat, this.lng, this.lastLatLng[0], this.lastLatLng[1]);
        if (distanceDif > 10 || this.lastType != this.locViewType) {
            console.log(event, distanceDif);
            this.lastType = this.locViewType;
            this.lastLatLng = [+this.lat, +this.lng];
            this.onEmit.emit({
                type: this.locViewType,
                latlng: this.lastLatLng
            });
            // this.getHealthAvgList(this.locViewType, this.lastLatLng);
        }
    }
    onMarker(type, infoWindow, $event: MouseEvent) {
        type == 'over' ? infoWindow.open() : type == 'out' ? infoWindow.close() : infoWindow.close();
    }

    clearOverLay(list = this.heatmapList) {
        list.forEach(e => {
            e.setMap(null);
        });
    }
    generateHealthScoreBasedHeatMap(data) {
        // let preList = [...this.heatmapList];
        this.heatmapList = new Array();
        if (data && data.length > 0) {
            data.forEach(element => {
                let hmData =
                    [{ location: new google.maps.LatLng(+this.getLatLon(element).lat, +this.getLatLon(element).lon), weight: 150 * element[this.config.populationVar] }];
                let color = this.isColorIndActive ? { gradient: this.getColor(element[this.config.populationVar]) } : {};
                let heatmap = new google.maps.visualization.HeatmapLayer({
                    data: hmData,
                    radius: 30,
                    ...color,
                    dissapating: false,
                });
                heatmap.setMap(this.map);
                this.heatmapList.push(heatmap);
            });
            // this.clearOverLay(preList);
        }

    }
    getColor(value = 0) {
        // if (type == 'HScore' && value > 10) {
        //     return gradients['prered'];
        // } else {
        //     return gradients['pregreen'];
        // }
        if (value >= 80) {
            return gradients['green'];
            // return '#11bf11';
        } else if (value >= 60) {
            return gradients['liteyellow'];
            // return '#f2d82f';
        } else if (value >= 40) {
            return gradients['darkyellow'];
            // return '#eb9423';
        } else if (value >= 20) {
            return gradients['orange'];
            // return '#e85022';
        } else {
            return gradients['red'];
            // return '#e0221b';
        }
    }
    private calculateDistanceInKilometer(lat1, lon1, lat2, lon2) {
        let toRad = (degrees) => {
            var pi = Math.PI;
            return degrees * (pi / 180);
        }
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var R = 6371; // km
            var dLat = toRad(lat2 - lat1);
            var dLon = toRad(lon2 - lon1);
            lat1 = toRad(lat1);
            lat2 = toRad(lat2);

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        }
    }
    getLatLon(element) {
        if (element) {
            return {
                lat: element.latlng.latitude,
                lon: element.latlng.longitude,
                // lat: element[this.config.latVar],
                // lon: element[this.config.lonVar]
            };
        } else return { lat: 0, lon: 0 }
    }
}