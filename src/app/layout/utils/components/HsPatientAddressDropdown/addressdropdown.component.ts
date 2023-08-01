import { UpdateAddress } from './../../../../model/profile/updateAddress';
import { Coordinates } from './../../../../model/poc/coordinates';
import { Component, OnInit, ViewEncapsulation, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { Address } from './../../../../model/profile/address';
import { SpinnerService } from './../../../widget/spinner/spinner.service';
import { UtilComponentsService } from './../uticomponent.service';
import { ValidationUtil } from './../../../../base/util/validation-util';
import { Location } from './../../../../model/profile/location';
import { Config } from './../../../../base/config';

@Component({
    selector: 'select-address-dropdown',
    templateUrl: './addressdropdown.template.html',
    styleUrls: ['addressdropdown.style.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SelectAddressDropDownComponent implements OnInit, AfterViewInit {

    isError: boolean = false;
    errMsg = new Array();
    errorMessagePopup = new Array();
    selectedAddressIndex: number = -1;
    // selectedId = -1;
    isAddNew: boolean = false;
    localityResponse = null;
    locationIndex = 0;
    validation: any;
    editAddress: Address = new Address();
    suggetionAddressList: Array<Address> = new Array();
    @Input() profileId = null;
    @Input('selectedAddress') selectedAddress: Address = new Address();
    @Input('suggetionAddressList') addList: Array<Address> = new Array();
    @Input('profileaddresses') profileaddresses: Array<Address> = new Array();
    @Output() onSelectAddress: EventEmitter<any> = new EventEmitter();

    constructor(private validationUtil: ValidationUtil,
        private spinnerService: SpinnerService,
        private utilService: UtilComponentsService) {
        this.validation = this.validationUtil;
    }
    ngOnInit() { }
    ngAfterViewInit(): void { }
    ngOnChanges(changes) {
        // this.errMsg = new Array();
        //timeout to avoid value change error onload component unchecked error
        setTimeout(() => {
            //console.log('mychanges===>', changes);

            if (changes.profileId && changes.profileId.currentValue != changes.profileId.previousValue) {
                if (this.profileaddresses && this.profileaddresses.length) {
                    this.suggetionAddressList = JSON.parse(JSON.stringify(this.profileaddresses.map(address => {
                        address.label = address.addressType == Address.ADDRESS_HOME ? 'Home Address' :
                            (address.addressType == Address.ADDRESS_OFFICE ? 'OfficeAddress' :
                                (address.addressType == Address.ADDRESS_OTHER && (address.label != undefined && address.label != null &&
                                    address.label.length > 0) ? address.label : 'Other Address'));
                        return address;
                    })));
                } else { this.suggetionAddressList = JSON.parse(JSON.stringify(this.addList)); }
                this.selectedAddressIndex = -1;
                this.editAddress = new Address();
                if (this.selectedAddress) {
                    this.selectedAddressIndex = this.suggetionAddressList.findIndex((add) => add.addressId == this.selectedAddress.addressId) + 1;
                    this.selectedAddressIndex > 0 ? this.editAddress = JSON.parse(JSON.stringify(this.selectedAddress)) : '';
                }
                this.errMsg = new Array();
                this.locationIndex = 0;
                this.localityResponse = null;
                this.onSelectAddress.emit(this.getResForEmit(this.selectedAddressIndex >= 0 ? this.editAddress : null));
            }
            // if (changes.addList && changes.addList.currentValue != changes.addList.previousValue) {
            //     let ind = this.addList.findIndex(a => this.editAddress.area == a.area)
            //     this.selectedAddressIndex = ind > 0 ? ind + 1 : -1;
            // }
        }, 0);

    }

    showUpdateAddressModal(is = true) {
        if (is) {
            (<any>$("#editAddModal")).modal({ backdrop: 'static', keyboard: false });
            (<any>$("#editAddModal")).modal("show");// show: true
        } else (<any>$("#editAddModal")).modal("hide");
    }
    onAddressSelect(index) {
        //console.log(index);
        this.errMsg = new Array();
        if (index == 0) {
            //console.log(index, 2);
            this.editAddress = new Address();
            this.editAddress.addressType = -1;
            this.isAddNew = true;
            this.showUpdateAddressModal(true);
        } else if (index) {
            this.editAddress = { ...this.suggetionAddressList[index - 1] };

            //console.log('changed_address', this.editAddress);
            this.onSelectAddress.emit(this.getResForEmit(this.editAddress));
            //console.log(this.editAddress);

        }
        else { this.editAddress = null; }
    }

    modifyAddress(address: Address) {
        this.isAddNew = false;
        this.localityResponse = null;
        this.locationIndex = 0;
        this.editAddress = JSON.parse(JSON.stringify(address));
        if (this.editAddress && this.editAddress.pinCode) {
            this.searchByPinCode(this.editAddress.pinCode, false);
        }
        this.showUpdateAddressModal(true);
    }
    close() {
        if (this.isAddNew)
            this.selectedAddressIndex = -1;
    }

    selectedAddressType() {
        let isFound: boolean = false;
        let addressType = this.editAddress.addressType;
        if (this.editAddress && this.editAddress.addressType
            && this.editAddress.addressType > -1
            && this.editAddress.addressType != Address.ADDRESS_OTHER) {
            let selAdd = this.suggetionAddressList.filter(address => { return address.addressType == this.editAddress.addressType });
            if (selAdd && selAdd[0]) {
                this.editAddress = JSON.parse(JSON.stringify(selAdd[0]));
                isFound = true;
            }
        }
        if (!isFound) {
            this.editAddress = new Address();
            this.editAddress.addressType = addressType;
            this.localityResponse = null;
        }
    }
    onLocationChange() {
        if (this.localityResponse && this.localityResponse.length > 0 && this.locationIndex >= 0) {
            let index = this.locationIndex;
            this.editAddress.area = this.localityResponse[index].id;
            this.editAddress.areaName = this.localityResponse[index].name;
            this.editAddress.locationCoordinates = new Coordinates();
            this.editAddress.locationCoordinates.lat = this.localityResponse[index].lat;
            this.editAddress.locationCoordinates.lon = this.localityResponse[index].lon;
            this.editAddress.location = new Location();
            this.editAddress.location.coordinates = new Array();
            this.editAddress.location.coordinates.push(this.localityResponse[index].lon);
            this.editAddress.location.coordinates.push(this.localityResponse[index].lat);
            //console.log('Selected area is ' + this.editAddress.areaName);
            //console.log('Selected areaID is ' + this.editAddress.area);
        }
    }

    searchByPinCode(pinCode: any, pincodeChanged: boolean) {
        if ((Config.portal && Config.portal.pincodeLength && Config.portal.pincodeLength > 0 && pinCode.length == Config.portal.pincodeLength) || pinCode.length == 6) {
            this.spinnerService.start();
            this.localityResponse = null;
            this.locationIndex = 0;
            this.utilService.pincodeSearch(pinCode).then(response => {
                if (response.length > 0) {
                    if (pincodeChanged) {
                        this.editAddress.city = response[0].cityId;
                        this.editAddress.cityName = response[0].cityName;
                        this.editAddress.state = response[0].stateId;
                        this.editAddress.stateName = response[0].stateName;
                        this.editAddress.area = response[0].localityList[0].id;
                        this.editAddress.areaName = response[0].localityList[0].name;
                        this.editAddress.locationCoordinates = new Coordinates();
                        this.editAddress.locationCoordinates.lat = response[0].localityList[0].lat;
                        this.editAddress.locationCoordinates.lon = response[0].localityList[0].lon;
                        this.editAddress.location = new Location();
                        this.editAddress.location.coordinates = new Array();
                        this.editAddress.location.coordinates.push(response[0].localityList[0].lon);
                        this.editAddress.location.coordinates.push(response[0].localityList[0].lat);
                    }
                    this.localityResponse = response[0].localityList;
                    if (this.editAddress && this.editAddress.area > 0 && this.localityResponse && this.localityResponse.length > 0) {
                        for (let i = 0; i < this.localityResponse.length; i++) {
                            if (this.editAddress.area == this.localityResponse[i].id) {
                                this.locationIndex = i;
                            }
                        }
                    }
                } else {
                    this.editAddress.city = null;
                    this.editAddress.cityName = null;
                    this.editAddress.state = null;
                    this.editAddress.stateName = null;
                    this.editAddress.area = null;
                    this.editAddress.areaName = null;
                    this.editAddress.locationCoordinates = new Coordinates();
                    this.editAddress.location = new Location();
                }
                this.spinnerService.stop();
            }).catch((err) => {
                if (err) this.spinnerService.stop();
            });
        }
    }
    saveAddress() {
        this.errMsg = new Array();
        this.errorMessagePopup = new Array();
        this.localityResponse = null;
        this.locationIndex = 0;
        if (this.editAddress.addressType == undefined || this.editAddress.addressType < 0) {
            this.errorMessagePopup[0] = "Please select Address Type";
            return;
        }
        if (this.editAddress.addressType == Address.ADDRESS_OTHER && (this.editAddress.label == undefined || this.editAddress.label == null || this.editAddress.label.length == 0)) {
            this.errorMessagePopup[0] = "Please enter a name for this address";
            return;
        }
        if (this.editAddress.address1 == undefined || this.editAddress.address1 == null) {
            this.errorMessagePopup[0] = "Please add Address";
            return;
        }
        if (this.editAddress.pinCode != undefined && this.editAddress.pinCode.length == 6 && this.editAddress.city > 0) {
            let addressRequest: UpdateAddress = new UpdateAddress();
            addressRequest.profileId = this.profileId;
            addressRequest.address = this.editAddress;
            this.spinnerService.start();
            this.utilService.saveAddress(addressRequest).then(response => {
                this.spinnerService.stop();
                if (response.statusCode >= 400) {
                    this.errorMessagePopup[0] = response.statusMessage;
                } else {
                    this.editAddress = response.address;
                    this.updateToSuggetionList(this.editAddress);
                    this.errMsg[0] = "Address updated successfully!";
                    this.showUpdateAddressModal(false);
                }
            }).catch((err) => {
                this.spinnerService.stop();
                window.alert('Something went wrong,Please try again');
                this.showUpdateAddressModal(false);
            });
        } else {
            this.errorMessagePopup[0] = "Please enter a valid pin code";
            return;
        }
    }
    updateToSuggetionList(address) {
        let isFound: boolean = false;
        let indexOfAddr = this.suggetionAddressList.findIndex(addr => address.addressId == addr.addressId);
        if (indexOfAddr >= 0) {
            this.suggetionAddressList[indexOfAddr] = address;
            // this.selectedId=
            this.selectedAddressIndex = indexOfAddr + 1;
            isFound = true;
        }
        if (!isFound) {
            let tempAddress = address;
            tempAddress.label = tempAddress.addressType == Address.ADDRESS_HOME ? 'Home Address' :
                (tempAddress.addressType == Address.ADDRESS_OFFICE ? 'Office Address' :
                    (tempAddress.addressType == Address.ADDRESS_OTHER ? tempAddress.label : 'Other Address'))
            this.suggetionAddressList.push(tempAddress);
            let indexOfAddr = this.suggetionAddressList.findIndex(addr => address.addressId == addr.addressId);
            if (indexOfAddr >= 0) {
                // this.selectedId =
                this.selectedAddressIndex = indexOfAddr + 1;
            }
            //console.log("My_addressList: " + JSON.stringify(this.suggetionAddressList));
        }
        //console.log('on_update_address', address);
        this.onSelectAddress.emit(this.getResForEmit(address, true));
    }
    getResForEmit(address, isListUpdated = false) {
        return { selectedAddress: address, profileAddresses: this.suggetionAddressList.slice(), isListUpdated };
    }

}

