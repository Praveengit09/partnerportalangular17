import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SlotBookingDetails } from '../../../model/basket/slotBookingDetails';
import { SelectedRegisteredProfile } from '../../../model/profile/selectedRegisteredProfile';
import { OnboardingService } from '../../onboarding.service';
import { UserConfigCoupon } from '../../../model/onboarding/userConfigCoupon';
import { CommonUtil } from '../../../base/util/common-util';
import { SpinnerService } from '../../../layout/widget/spinner/spinner.service';


@Component({
    selector: 'couponuser',
    templateUrl: './couponuser.template.html',
    styleUrls: ['./couponuser.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class CouponUserComponent implements OnInit {
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    slotItem: SlotBookingDetails = new SlotBookingDetails();
    couponList: Array<any>;
    UserDeatil: any;

    couponDetailList: any;

    popupErrorMessage: string[] = new Array();
    popupIsError: boolean;
    popupShowMessage: boolean;
    userConfigCoupon: UserConfigCoupon = new UserConfigCoupon();
    from: number;
    size: number;
    empId: number;
    errorMessage: Array<string>;
    endingDate: Date = new Date();
    month: any;
    year: any;
    perPage: number = 10;
    total: number = 0;
    startDate;
    endDate;
    mobileNo = '';
    couponCode = '';
    couponuserList = new Array<any>();
    isError: boolean;
    showMessage: boolean;
    searchCriteria: string;
    skip: number = 0;
    searchTerm: any;

    columns: any[] = [
        {
            display: 'Profile ID',
            variable: 'profileId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Mobile No',
            variable: 'mobile',
            filter: 'mobile',
            filler: ',',
            sort: true
        },
        {
            display: 'User Name',
            variable: 'title fName lName ',
            filter: 'nametitle',
            filler: ',',
            sort: true
        },
        {
            display: 'Coupon Code',
            variable: 'couponCode',
            filter: 'couponCode',
            filler: ',',
            sort: true
        },
        {
            display: 'Reference Coupon Code',
            variable: 'referenceCouponCode',
            filter: 'referenceCouponCode',
            filler: ',',
            sort: true
        },
        {
            display: 'Package Valid FromDate',
            variable: 'packageValidFrom',
            filter: 'date',
            sort: true
        },
        {
            display: 'package Valid ToDate',
            variable: 'packageValidTo',
            filter: 'date',
            sort: true
        },
        // {
        //     display: 'Assign Status',
        //     label: 'Remarks',
        //     style: 'btn btn-danger mb-xs done_txt',
        //     filter: 'action',
        //     type: 'button',
        //     event: 'remarksButton',
        //     sort: false,
        //     variable: '',
        //     conditions: [
        //         {
        //             value: '0',
        //             condition: 'lte',
        //             label: 'Assign',
        //             style: 'btn btn-danger mb-xs done_txt'
        //         },
        //     ]
        // }
    ]

    sorting: any = {
        column: 'packageValidFrom',
        descending: true
    };

    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };



    constructor(
        private onboardingService: OnboardingService, private authService: AuthService, private commonUtil: CommonUtil, private spinnerService: SpinnerService) {

    }

    ngOnInit(): void {
        let now = new Date();
        this.month = now.getMonth() + 1;
        this.year = now.getFullYear();
        this.from = 0;
        this.size = 50;
        this.couponuserList = new Array();
        this.getCouponRecords();
    }

    assignCouponCOde() {
        this.getCouponRecords();
        this.onReset();
        (<any>$)('#UserModal').modal('show');
    }
    modelOpenRegister() {

        (<any>$)('#registerPatientModal').modal('show');
    }

    onPage(page: number) {
        this.from = +this.total;
        this.onSubmit();
    }

    closeModel(id: any) {
        $(id).on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
        (<any>$(id)).modal('hide');

    }
    startDateChoosen(startDate) {
        this.startDate = startDate;
    }

    endDateChoosen(endDate) {
        this.endDate = endDate;
    }

    getUserCofigCoupons() {
        let fromtDate, toDate, mobileNo;
        this.startDate ? fromtDate = this.commonUtil.convertOnlyDateToTimestamp(this.startDate) : fromtDate = 0;
        this.endDate ? toDate = this.commonUtil.convertOnlyDateToTimestamp(this.endDate) + 86400000 : toDate = 0;
        mobileNo = this.mobileNo;
        this.empId = this.authService.userAuth.employeeId;
        this.spinnerService.start();
        this.onboardingService.userCofigCoupons(this.empId, fromtDate, toDate, this.couponCode, mobileNo, this.from, this.size).then(data => {

            this.spinnerService.stop();
            this.couponuserList = data

        })

    }

    onInputChange() {
        this.total = this.skip = 0;
    }
    onEnterPressed(e) {
        if (e.keyCode == 13) {
            this.getCoponUserbaseMobileNo();
        }
    }
    getCoponUserbaseMobileNo() {
        var str1 = $('#search').val().toString().trim();

        var str = str1.replace(/\s/g, " ");
        if (str.length != 10) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter valid mobile number');
            this.showMessage = true;
            return;
        }

        if (!str) {
            window.alert("Please enter valid Patient's Name/Mobile Number");
            this.searchTerm = "";
        }
        this.mobileNo = str;
        alert("str-->" + JSON.stringify(str))
        this.onSubmit()
    }

    onSubmit() {

        if (this.startDate == '' || this.startDate == null || this.startDate == undefined) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter correct Start Date');
            this.showMessage = true;
            return;

        }
        if (this.endDate == '' || this.endDate == null || this.startDate == undefined || this.startDate > this.endDate) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage.push('Please Enter correct End Date');
            this.showMessage = true;
            return;

        }
        this.getUserCofigCoupons()
    }
    onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
        this.selectedRegisteredProfile = selectedRegisteredProfile;
        (<any>$('#registerPatientModal')).modal('hide');
        this.saveSelectedProfile();
    }

    saveSelectedProfile() {
        this.slotItem.patientProfileId = this.selectedRegisteredProfile.selectedProfile.profileId;
        this.slotItem.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.slotItem.patientRelationship = this.selectedRegisteredProfile.selectedProfile.relationShip;
        this.slotItem.patientProfileDetails = this.selectedRegisteredProfile.selectedProfile;
    }
    onReset() {
        this.slotItem.patientProfileId = 0;
        this.slotItem.parentProfileId = 0;
        this.couponCode = '';
        this.selectedRegisteredProfile = new SelectedRegisteredProfile();
        this.couponDetailList = '';
    }
    onCouponSelect(couponcode: string): void {
        this.couponCode = couponcode,
            this.onSubmit()

    }
    onPOpUPCouponSelect(couponcode: string): void {
        this.couponCode = couponcode,
            this.couponList.forEach(e => {
                if (this.couponCode == e.couponCode) {
                    this.couponDetailList = e
                }
                console.log("data" + JSON.stringify(this.couponDetailList))
            })
        this.couponDetailList.freeConsultationsList.forEach((element) => {
            if (element) {
                element.serviceList.forEach((e) => {
                    if (e.imageUrl) {
                        e.imageUrl = e.imageUrl.split(".png")[0] + "hdpi.png";
                    }
                });
            }
        })

    }
    getCouponRecords() {
        this.onboardingService.getConfigCoupons().then(data => {
            this.couponList = data
            console.log("datasddddsa" + JSON.stringify(this.couponList[0].couponCode))

        })
    }
    getCouponAssigns() {
        if (this.slotItem.parentProfileId == null || this.slotItem.parentProfileId == undefined || this.slotItem.parentProfileId == 0) {
            this.popupErrorMessage = new Array<string>();
            this.popupErrorMessage[0] =
                "Please Select a Patient Details";
            this.popupIsError = true;
            this.popupShowMessage = true;

            return;
        }
        if (this.couponCode == null || this.couponCode == undefined ||  this.couponCode == '') {
            this.popupErrorMessage = new Array<string>();
            this.popupErrorMessage[0] =
                "Please Select a Coupon Code";
            this.popupIsError = true;
            this.popupShowMessage = true;

            return;
        }

        let
            profileId = this.slotItem.parentProfileId,
            couponCode = this.couponCode
        this.onboardingService.getAssignCoupon(couponCode, profileId).then(data => {
            this.couponList = data
            console.log("data" + JSON.stringify(this.couponList))
            if (data.statusCode == 200) {
                (<any>$('#UserModal')).modal('hide');
                $('.modal-backdrop').remove();
                alert(data.statusMessage)
                this.onReset();
                this.onSubmit()
            }
        })
    }
}