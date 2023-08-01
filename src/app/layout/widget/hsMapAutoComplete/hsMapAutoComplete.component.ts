import { Component, EventEmitter, Input } from '@angular/core';
import { ElementRef, NgZone, OnInit, ViewChild, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { } from '@type/googlemaps';
import { MapsAPILoader } from '@agm/core';
import { SpinnerService } from '../spinner/spinner.service';
declare var google: any;

@Component({
    selector: 'hs-autocomplete-map',
    templateUrl: './hsMapAutoComplete.template.html',
    styleUrls: ['./hsMapAutoComplete.style.scss']
})
export class HsMapAutoCompleteComponent {
    @Input() addressType: string;
    public latitude: number;
    public longitude: number;
    public searchControl: FormControl;
    public zoom: number;
    public geocoder: any;
    address: any = "Search for location...";
    addressToSend: any;
    map: any;
    searchBox: any;
    addProductError: any;
    isError: boolean = false;

    @ViewChild("search", { static: false })
    public searchElementRef: ElementRef;

    @Output() onChooseAddress = new EventEmitter<any>();

    constructor(
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone, private spinnerService: SpinnerService
    ) { }

    ngOnInit() {

        //set google maps defaults
        this.zoom = 12;
        let self = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(JSON.stringify(position.coords.latitude))
                self.latitude = position.coords.latitude;
                self.longitude = position.coords.longitude;
                this.setCurrentPosition();
            });
        }

        // this.latitude = 12.9716;
        // this.longitude = 77.5946;

        //create search FormControl
        this.searchControl = new FormControl();

        //set current position
        // this.setCurrentPosition();

        //load Places Autocomplete
        this.mapsAPILoader.load().then(() => {

            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
                // types: [this.addressType,'geocode ']
            });
            autocomplete.addListener("place_changed", () => {
                console.log("autocomplete called === <<<<");

                this.ngZone.run(() => {
                    //get the place result
                    let place = autocomplete.getPlace();

                    console.log("=====>>>>" + JSON.stringify(place));
                    this.addressToSend = place;
                    this.address = place.name + "," + place.formatted_address;

                    //verify result
                    if (place.geometry === undefined || place.geometry === null) {
                        this.addProductError = "Location Not Found";
                        this.isError = true;
                        return;
                    }
                    this.isError = false;

                    //set latitude, longitude and zoom
                    this.latitude = place.geometry.location.lat();
                    this.longitude = place.geometry.location.lng();

                    this.zoom = 12;
                });

            });
        });
    }

    onDragEnd(events) {
        console.log("======>>>> drag end === >" + JSON.stringify(events));
        this.address = "Loading address...Please wait"
        let latlng = new google.maps.LatLng(events.coords.lat, events.coords.lng);
        this.geoCodeLatLng(latlng);
        console.log('Returning from onDragEnd');

        return;
    }

    private setCurrentPosition() {
        // if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            console.log("=====>>>" + JSON.stringify(position));

            this.zoom = 12;
            let latlng = new google.maps.LatLng(this.latitude, this.longitude);
            this.geoCodeLatLng(latlng);
        });
        // }
    }

    mapReady(event: any) {

        this.map = event;

        /*    let position = new google.maps.LatLng(this.latitude, this.longitude);
           this.map.panTo(position); */

        let input = document.getElementById('Map-Search');
        this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

        let controlDiv = document.createElement('div');

        let firstChild = document.createElement('button');
        firstChild.style.backgroundColor = '#fff';
        firstChild.style.border = 'none';
        firstChild.style.outline = 'none';
        firstChild.style.width = '28px';
        firstChild.style.height = '28px';
        firstChild.style.borderRadius = '2px';
        firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        firstChild.style.cursor = 'pointer';
        firstChild.style.marginRight = '10px';
        firstChild.style.padding = '0px';
        firstChild.title = 'Your Location';
        controlDiv.appendChild(firstChild);

        /*   let secondChild = document.createElement('div');
          secondChild.style.margin = '5px';
          secondChild.style.width = '18px';
          secondChild.style.height = '18px';
          secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
          secondChild.style.backgroundSize = '180px 18px';
          secondChild.style.backgroundPosition = '0px 0px';
          secondChild.style.backgroundRepeat = 'no-repeat';
          secondChild.id = 'you_location_img';
          firstChild.appendChild(secondChild); */

        google.maps.event.addListener(this.map, 'dragend', () => {
            $('#you_location_img').css('background-position', '0px 0px');
        });

        firstChild.addEventListener('click', () => {
            let imgX = '0';
            let animationInterval = setInterval(() => {
                if (imgX == '-18') imgX = '0';
                else imgX = '-18';
                $('#you_location_img').css('background-position', imgX + 'px 0px');
            }, 500);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    this.map.setCenter(latlng);
                    this.geoCodeLatLng(latlng);
                    clearInterval(animationInterval);
                    $('#you_location_img').css('background-position', '-144px 0px');
                });
            }
            else {
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '0px 0px');
            }
        });

        // this.map.controls[google.maps.ControlPos ition.RIGHT_BOTTOM].push(controlDiv);

        google.maps.event.addListener(this.map, "idle", () => {
            google.maps.event.trigger(this.map, 'resize');
            // this.setCurrentPosition();
        });

    }

    onChooseLocationClick() {
        console.log("=====>>> 000" + JSON.stringify(this.addressToSend));

        if (!(this.addressToSend && this.addressToSend.formatted_address)) {
            this.addressToSend = {};
        }

        this.onChooseAddress.emit(this.addressToSend);

    }

    geoCodeLatLng(latlng) {
        let geocoder = new google.maps.Geocoder();
        let request = { location: latlng };
        geocoder.geocode(request, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
                this.ngZone.run(() => {
                    let result = results[0];
                    this.addressToSend = result;
                    this.address = result.formatted_address;
                    console.log("===++===" + JSON.stringify(result));
                    return;
                });
            }
        });
    }
}