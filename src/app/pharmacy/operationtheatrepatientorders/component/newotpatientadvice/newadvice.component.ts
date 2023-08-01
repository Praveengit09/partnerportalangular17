import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoUtil } from '../../../../auth/util/cryptoutil';
import { ToasterService } from '../../../../layout/toaster/toaster.service';
import { SpinnerService } from '../../../../layout/widget/spinner/spinner.service';
import { CartItem } from '../../../../model/basket/cartitem';
import { Config } from '../../../../base/config';
import { OutPatientOrdersService } from '../../outpatientorders.service';
import { DoctorDetails } from '../../../../model/employee/doctordetails';
import { PocAdviseData } from '../../../../model/poc/poc-advise-data';
import { SelectedRegisteredProfile } from '../../../../model/profile/selectedRegisteredProfile';
import { BaseGenericMedicine } from '../../../../model/pharmacy/baseGenericMedicine';
import { Pharmacy } from '../../../../model/pharmacy/pharmacy';
import { ProfileDetailsVO } from '../../../../model/profile/profileDetailsVO';
import { Payment } from '../../../../model/basket/payment';
import { AuthService } from '../../../../auth/auth.service';
import { PharmacyService } from '../../../pharmacy.service';
import { Doctor } from '../../../../model/employee/doctor';
import { ValidationUtil } from '../../../../base/util/validation-util';
import { BasketRequest } from '../../../../model/basket/basketRequest';
import { BookedPackageResponse } from '../../../../model/package/bookedPackageResponse';
import { ReportResponse } from '../../../../model/report/reportresponse';
import { OtPatientOrdersService } from '../../otpatientorders.service';





@Component({
    selector: 'newotpatientadvice',
    templateUrl: './newadvice.template.html',
    styleUrls: ['./newadvice.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class NewOtPatientAdviceComponent implements OnInit {

    errorMessage: Array<string>;
    isError: boolean;
    // isErrorCheck: boolean = false;
    showMessage: boolean;
    label: string = '';
    priceChange: boolean = false;

    basketRequest: BasketRequest = new BasketRequest();

    bookedPackageList: BookedPackageResponse[] = new Array();
    reportResponse: ReportResponse;
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();

    packageNames: string[];

    discountAmount: number = 0;
    selectedGlobalPackageId: number = 0;

    selectedPackageId: number = 0;
    discountPercent: number = 0;
    paymentModeIndex: number = 2;
    transactionId: string = '';
    pocId: any;
    isValue: boolean = false;
    isPercent: boolean = true;
    isValue1: boolean;
    isPercent1: boolean;
    Package4Original: number;
    dropDownIndex: number = 0;
    city: number;
    brandId: number;
    doctorName: string;
    pdfHeaderType: number;

    empId: any;
    packageNamesShow: Boolean = false;
    tempCalculatedValueOfOrder: any;

    isReset: boolean = false;
    cartItemType: number = CartItem.CART_ITEM_TYPE_PHARMACY;
    configAppId: number;
    triggerCount: number;
    doctorDetails: Doctor = new Doctor();
    cartItem: CartItem = new CartItem();
    otPatientAdviceDetailsForEdit: CartItem = new CartItem();
    isEditOrder: boolean;
    referenceIdForNewMedicine: string = '';
    tempPharmacyAdviceTrack: CartItem = new CartItem();


    constructor(private pharmacyService: PharmacyService, private OtPatientOrdersService: OtPatientOrdersService, private validation: ValidationUtil,
        private authService: AuthService, private spinner: SpinnerService, private cd: ChangeDetectorRef, private toast: ToasterService, private router: Router
    ) {
        this.pharmacyService.pharmacyList = new Array();
        this.validation = validation;
        this.isError = this.pharmacyService.isError;
        this.errorMessage = this.pharmacyService.errorMessage;
        this.showMessage = this.pharmacyService.showMessage;
        if (authService.selectedPocDetails && authService.selectedPocDetails.pocId && authService.selectedPocDetails.address) {
            this.city = authService.selectedPocDetails.address.city;
        }
        if (authService.selectedPOCMapping && authService.selectedPOCMapping.pocId && authService.selectedPOCMapping) {
            this.pocId = authService.selectedPOCMapping.pocId;
        }
        this.brandId = authService.userAuth.brandId;
        this.pdfHeaderType = authService.userAuth.pdfHeaderType;
        this.empId = authService.userAuth.employeeId;
        this.configAppId = Config.portal.appId;





    }

    ngOnInit() {

        this.otPatientAdviceDetailsForEdit = this.OtPatientOrdersService.otPatientAdviceDetailsForEdit;

        if (this.otPatientAdviceDetailsForEdit != undefined && JSON.stringify(this.otPatientAdviceDetailsForEdit) != '{}' &&
            (this.OtPatientOrdersService.isEditOrder == true || this.OtPatientOrdersService.isMultipleOrdersEdit == true)) {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            window.localStorage.setItem('otPatientAdviceDetailsForEdit', cryptoUtil.encryptData(JSON.stringify(this.otPatientAdviceDetailsForEdit)));
        } else {
            let cryptoUtil: CryptoUtil = new CryptoUtil();
            if (window.localStorage.getItem('otPatientAdviceDetailsForEdit') != null) {
                this.otPatientAdviceDetailsForEdit = JSON.parse(cryptoUtil.decryptData(window.localStorage.getItem('otPatientAdviceDetailsForEdit')));
            }
        }


        if (this.otPatientAdviceDetailsForEdit != undefined && JSON.stringify(this.otPatientAdviceDetailsForEdit) != '{}' && window.localStorage.hasOwnProperty('otPatientAdviceDetailsForEdit') == true) {
            this.cartItem = this.otPatientAdviceDetailsForEdit;
            this.isEditOrder = true;
            this.triggerCount = new Date().getTime();
            this.pharmacyService.pharmacyList = this.cartItem.pharmacyList;

            this.doctorPatientDetailsChanged();
        }
        else {

            let pharmacy = new Pharmacy();
            pharmacy.genericMedicine = new BaseGenericMedicine();
            let cartItem = new CartItem();
            cartItem.pharmacyList = new Array<Pharmacy>();
            cartItem.pharmacyList.push(pharmacy);
            cartItem.doctorDetail = new DoctorDetails();
            cartItem.patientProfileDetails = new ProfileDetailsVO();
            cartItem.pharmacyList = new Array<Pharmacy>();
            this.cartItem = cartItem;
            this.cartItem.cartItemType = CartItem.CART_ITEM_TYPE_PHARMACY;
            this.isEditOrder = false;

        }

        if (this.isEditOrder == true && this.cartItem.pharmacyList && this.cartItem.pharmacyList.length > 0) {
            this.referenceIdForNewMedicine = this.cartItem.pharmacyList[this.cartItem.pharmacyList.length - 1].referenceId;
            this.tempPharmacyAdviceTrack = JSON.parse(JSON.stringify(this.cartItem));
        }


    }


    async checkEmptyMedicineName() {
        let ret_value: boolean = true;
        let emptyArray = new Array();
        await this.cartItem.pharmacyList.forEach((e, i) => {
            if (!e.batchNumberTemp && !e.originalAmount) {
                // && charCode == 8
                emptyArray.push(i);
                ret_value = false;
            }
            else if (!e.batchNumberTemp) {
                alert('Select batch of ' + e.productName);
                ret_value = false;
            }
        });
        if (!ret_value) {
            let temp;
            for (let i = emptyArray.length; i > 0; i--) {
                temp = this.cartItem.pharmacyList.splice(emptyArray[i - 1], 1);
            }
            this.pharmacyService.pharmacyList = this.cartItem.pharmacyList = temp;
        }
        return ret_value;
    }



    setSelectedDoctorDetails(doctorDetails: DoctorDetails) {
        console.log('doctorDetails', JSON.stringify(doctorDetails));
        this.cartItem.doctorDetail = new DoctorDetails();
        this.cartItem.doctorDetail.firstName = doctorDetails.firstName;
        this.cartItem.doctorDetail.lastName = doctorDetails.lastName;
        this.cartItem.doctorDetail.title = doctorDetails.title ? doctorDetails.title : "";
    }

    doctorPatientDetailsChanged() {
        this.doctorDetails = new Doctor();
        this.selectedRegisteredProfile = new SelectedRegisteredProfile();
        this.selectedRegisteredProfile.selectedProfile.title = this.cartItem.patientProfileDetails.title;
        this.selectedRegisteredProfile.selectedProfile.fName = this.cartItem.patientProfileDetails.fName;
        this.selectedRegisteredProfile.selectedProfile.lName = this.cartItem.patientProfileDetails.lName;
        if (this.cartItem.doctorDetail != undefined && this.cartItem.doctorDetail.title != undefined) {
            this.doctorDetails.title = this.cartItem.doctorDetail.title;
            this.doctorDetails.doctorName = this.cartItem.doctorDetail.title + " " + this.cartItem.doctorDetail.firstName + " " + this.cartItem.doctorDetail.lastName;
            this.doctorDetails.lastName = this.cartItem.doctorDetail.lastName;
        }

    }


    async onCalculateEvent(calculatedValue) {
        this.tempCalculatedValueOfOrder = calculatedValue;
        let cartItemList = this.cartItem;
        cartItemList.isReset = this.tempCalculatedValueOfOrder.reset;

        this.cartItem = { ...cartItemList };
        this.priceChange = true;

        await this.cd.detectChanges();
    }



    async onConfirmOrNextClickHandler() {
        window.scroll(0, 0);
        if (this.priceChange)
            this.cartItem.pharmacyList = this.pharmacyService.pharmacyList.slice();
        this.cartItem.brandId = this.brandId;

        if (this.cartItem.pharmacyList.length < 1) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "You haven't added any medicines to your advice. Please add a medicine to create your advice.";
            this.showMessage = true;
            return;
        }
        if (!this.selectedRegisteredProfile.selectedProfile.fName) {
            this.isError = true;
            this.errorMessage = new Array();
            this.errorMessage[0] = "Please enter patient details";
            this.showMessage = true;
            return;
        }
        if (!this.cartItem.doctorDetail.firstName) {
            this.isError = true;
            this.errorMessage = new Array();
            $('html, body').animate({ scrollTop: '0px' }, 300);
            this.errorMessage[0] = "Please enter doctor name";
            this.showMessage = true;
            return;
        }

        else {
            this.isError = false;
            this.errorMessage = new Array();
            this.showMessage = false;
        }
        let isErrorFound: boolean = false;
        this.cartItem.pharmacyList.forEach((element, i) => {
            element.isErrorMsg = this.errorMessage = new Array();
            if (!element.productName && !element.productId && !element.genericMedicine.genericMedicineName) {
                isErrorFound = element.isErrorFound = true;
                element.isErrorMsg[0] = "Please Provide Medicine Details";
                return;
            }
            if (!element.quantity || element.quantity <= 0) {
                isErrorFound = element.isErrorFound = true;
                element.isErrorMsg[0] = "Quantity cannot be zero";
                return;
            }

            // if (!element.grossPrice || element.grossPrice <= 0) {
            //     isErrorFound = element.isErrorFound = true;
            //     element.isErrorMsg[0] = "Price cannot be zero";
            //     return;
            // }

            let enableStockValidation = false;
            if (Config.portal && Config.portal.pharmacyOptions && Config.portal.pharmacyOptions.enableStockValidation) {
                enableStockValidation = true;
            }

            if (enableStockValidation && (!element.stockDetails.batchNo || element.stockDetails.batchNo.trim() == "")) {
                isErrorFound = element.isErrorFound = true;
                element.isErrorMsg[0] = "Please Select Batch Number";
                return;
            }
            if (enableStockValidation && (!element.stockDetails || !element.stockDetails.expiryDate || element.stockDetails.expiryDate < new Date().getTime())) {
                isErrorFound = element.isErrorFound = true;
                element.isErrorMsg[0] = "Please Check Medicine Already Expired";
                return;
            }
            if (!element.productName) {
                isErrorFound = element.isErrorFound = true;
                element.isErrorMsg[0] = "Please fill all Product Names";
                return;
            }

        });
        if (isErrorFound) {
            return;
        }
        if (this.isError && this.showMessage) {
            return;
        }

        this.cartItem.pharmacyList.forEach((element, i) => {
            delete element.isErrorFound;
            delete element.isErrorMsg;
        });



        this.cartItem.pharmacyList.forEach(element => {
            if (element.stockDetails.expiryDate) {
                if (element.stockDetails.expiryDate instanceof Date)
                    element.stockDetails.expiryDate = element.stockDetails.expiryDate.getTime();
            }
        });

        let pocAdviseData: PocAdviseData = new PocAdviseData();
        pocAdviseData.pocId = this.authService.selectedPocDetails.pocId;
        pocAdviseData.pocName = this.authService.selectedPocDetails.pocName;

        this.cartItem.pocId = this.authService.selectedPocDetails.pocId;
        this.cartItem.doctorDetail.title = "Dr.";
        this.cartItem.actualDate = new Date().getTime();
        this.cartItem.empId = this.empId;

        if (this.selectedPackageId > 0) {
            this.cartItem.userPackageId = this.selectedPackageId;
        }
        if (this.isEditOrder == false) {
            this.createOtPatientOrder();

        }
        else {

            this.cartItem.pharmacyList.forEach((list, index) => {
                //while editing the order if we are adding a new medicine in pahrmacylist then ,
                // the refernceId of the last medicine in current order pharmacy list is added to new medicine(pharmacy object)

                if (list.referenceId == null || list.referenceId == undefined || list.referenceId == '') {
                    if (this.referenceIdForNewMedicine != undefined) {
                        list.referenceId = this.referenceIdForNewMedicine;

                    }
                    else {
                        list.referenceId = this.cartItem.billNo;
                    }

                }

            });
            let isEdited = this.checkIfPharmacyListIsEdited(this.tempPharmacyAdviceTrack.pharmacyList, this.cartItem.pharmacyList);
            isEdited == false ? this.cartItem.actionPerformed = -1 : '';
            console.log('&&&isEdited', isEdited)
            this.editOtPatientOrder()
        }

    }

    checkIfPharmacyListIsEdited(array1, array2) {
        let isEdited = false;
        if (array1.length != array2.length) {
            isEdited = true;
        }
        else {
            for (let i = 0; i < array1.length; i++) {
                if (this.compareObject(array1[i], array2[i]) == false) {
                    isEdited = true;
                    break;
                }
                else {
                    isEdited = false;
                }
            }
        }
        return isEdited;
    }

    compareObject(obj1, obj2) {
        if (obj1.brandName == obj2.brandName && obj1.drugForm == obj2.drugForm && obj1.genericMedicine.genericMedicineName == obj2.genericMedicine.genericMedicineName &&
            obj1.grossPrice == obj2.grossPrice && obj1.packingInformation.packageType == obj2.packingInformation.packageType &&
            obj1.packingInformation.unitsInPackage == obj2.packingInformation.unitsInPackage && obj1.stockDetails.batchNo == obj2.stockDetails.batchNo &&
            obj1.stockDetails.expiryDate == obj2.stockDetails.expiryDate && obj1.stockDetails.unitNetPrice == obj2.stockDetails.unitNetPrice &&
            obj1.productName == obj2.productName && obj1.quantity == obj2.quantity) {
            return true
        }
        else {
            return false;
        }
        // return (JSON.stringify(obj1) === JSON.stringify(obj2));
    }


    async createOtPatientOrder() {
        this.spinner.start()
        await this.OtPatientOrdersService.createOtPatientOrder(this.cartItem).then((response) => {

            if (response.statusCode === 200 || response.statusCode === 201) {
                this.toast.show(response.statusMessage, "bg-success text-white font-weight-bold", 3000);
                this.router.navigate(['/app/pharmacy/otpatientorders/list']);


            }
            else {
                this.toast.show(response.statusCode, "bg-danger text-white font-weight-bold", 3000);

            }

        }).catch((err) => {
            this.toast.show("Something went wrong,Please try again", "bg-danger text-white font-weight-bold", 3000);


        }).finally(() => {
            this.spinner.stop()
        })

    }

    async editOtPatientOrder() {
        if (this.OtPatientOrdersService.isMultipleOrdersEdit == true) {
            //for multiple order editing  bill no must be deleted
            delete this.cartItem.billNo;

        }
        this.spinner.start()
        await this.OtPatientOrdersService.editOtPatientOrder(this.cartItem).then((response) => {

            if (response.statusCode === 200 || response.statusCode === 201) {
                this.toast.show(response.statusMessage, "bg-success text-white font-weight-bold", 3000);
                this.router.navigate(['/app/pharmacy/otpatientorders/list']);


            }
            else {
                this.toast.show(response.statusCode, "bg-danger text-white font-weight-bold", 3000);

            }

        }).catch((err) => {
            this.toast.show("Something went wrong,Please try again", "bg-danger text-white font-weight-bold", 3000);


        }).finally(() => {
            this.spinner.stop()
        })

    }

    gotoPharmacyOrderList(): void {
        //  this.router.navigate(['/app/pharmacy/inpatientorders/list']) 
    }

    onRegisterNewUser(selectedRegisteredProfile: SelectedRegisteredProfile) {
        this.selectedRegisteredProfile = selectedRegisteredProfile;
        console.log("Selected profile in onRegisterNewUser--->" + JSON.stringify(this.selectedRegisteredProfile));
        this.basketRequest.parentProfileId = this.selectedRegisteredProfile.selfProfile.profileId;
        this.cartItem.patientProfileId =
            this.selectedRegisteredProfile.selectedProfile.profileId;
        if (this.selectedRegisteredProfile.selectedProfile.contactInfo != undefined
            && this.selectedRegisteredProfile.selectedProfile.contactInfo != null
            && this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile != undefined
            && this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile != null) {
            this.cartItem.patientProfileDetails.contactInfo.mobile =
                this.selectedRegisteredProfile.selectedProfile.contactInfo.mobile;
        } else {
            this.cartItem.patientProfileDetails.contactInfo.mobile =
                this.selectedRegisteredProfile.selfProfile.contactInfo.mobile;
        }
        this.cartItem.patientRelationship =
            this.selectedRegisteredProfile.selectedProfile.relationShip;
        this.cartItem.patientProfileDetails.title =
            this.selectedRegisteredProfile.selectedProfile.title;
        this.cartItem.patientProfileDetails.fName =
            this.selectedRegisteredProfile.selectedProfile.fName;
        this.cartItem.patientProfileDetails.title =
            this.selectedRegisteredProfile.selectedProfile.title;
        this.cartItem.patientProfileDetails.lName =
            this.selectedRegisteredProfile.selectedProfile.lName ? this.selectedRegisteredProfile.selectedProfile.lName : '';
        this.cartItem.patientProfileDetails.gender =
            this.selectedRegisteredProfile.selectedProfile.gender;
        this.cartItem.patientProfileDetails.age =
            this.selectedRegisteredProfile.selectedProfile.age;
        this.cartItem.parentProfileId =
            this.selectedRegisteredProfile.selfProfile.relationShipId;
        // this.getPharmacyPackages();
    }


    ngOnDestroy(): void {
        // this.pharmacyService.isEditedOrder = false;
        // this.OtPatientOrdersService.isMultipleOrdersEdit = false;

    }

    onNextClickHandler() {

    }

    gotoOtPatientPharmacyOrderList(): void {
        if (this.isEditOrder == true && !this.OtPatientOrdersService.isMultipleOrdersEdit == true)
            this.router.navigate(['/app/pharmacy/otpatientorders/ordersummary']);
        else if (this.isEditOrder == true && this.OtPatientOrdersService.isMultipleOrdersEdit == true)
            this.router.navigate(['/app/pharmacy/otpatientorders/list']);
        else
            this.router.navigate(['/app/pharmacy/otpatientorders/list']);

    }


    closeModel(id: string) {
        $(id).on('hidden.bs.modal', function (e) {
            $('.modal-backdrop').remove();
        });
        (<any>$(id)).modal('hide');
    }



}