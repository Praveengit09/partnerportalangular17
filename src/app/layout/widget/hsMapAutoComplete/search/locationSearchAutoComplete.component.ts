import { Component, EventEmitter, Input } from '@angular/core';
import { ElementRef, NgZone, ViewChild, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { } from '@type/googlemaps';
import { MapsAPILoader } from '@agm/core';
declare var google: any;

@Component({
    selector: 'hs-locationsearch-autocomplete',
    templateUrl: './locationSearchAutoComplete.template.html',
    styleUrls: ['./locationSearchAutoComplete.style.scss']
})
export class LocationSearchAutoCompleteComponent {
    public searchControl: FormControl;
    @Input() address: string = "";
    addressToSend: any;
    searchBox: any;

    @ViewChild("search", { static: false })
    public searchElementRef: ElementRef;

    placeholder: string ='Pickup google location';

    @Output() onChooseAddress = new EventEmitter<any>();

    constructor(
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone
    ) { }

    ngOnInit() {

        //setting boundaries for suggestions 

        let  center = { lat: 17.3850, lng: 78.4867 };
        // Create a bounding box with sides ~200km away from the center point
        let defaultBounds = {
            north: center.lat + 1,
            south: center.lat - 1,
            east: center.lng + 1,
            west: center.lng - 1,
        };
        console.log("boundaries",JSON.stringify(defaultBounds));
        let options = {
            bounds: defaultBounds,
            componentRestrictions: { country: "in" },
            strictBounds: false,
            types: ["establishment"],
          };

        //create search FormControl
        this.searchControl = new FormControl();


        //load Places Autocomplete
        this.mapsAPILoader.load().then(() => {

            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, options);
            autocomplete.addListener("place_changed", () => {

                this.ngZone.run(() => {
                    //get the place result
                    let place = autocomplete.getPlace();

                    console.log("=====>>>>" + JSON.stringify(place));
                    this.addressToSend = place;
                    this.address = place.formatted_address;

                    if (this.address && this.address.length > 0) {
                        this.onChooseAddress.emit(this.addressToSend);
                    }
                });

            });
        });
    }
}