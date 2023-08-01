import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../../app.config';
import { AuthService } from '../../../../../auth/auth.service';
import { HsLocalStorage } from '../../../../../base/hsLocalStorage.service';
import { CommonUtil } from '../../../../../base/util/common-util';
import { ValidationUtil } from '../../../../../base/util/validation-util';
import { SpinnerService } from '../../../../../layout/widget/spinner/spinner.service';
import { HealthPackage } from "../../../../../model/package/healthPackage";
import { CDSSOptions } from '../../../../../model/poc/cdss';
import { HSAgreement } from '../../../../../model/poc/hsAgreement';
import { HSMargin } from '../../../../../model/poc/margin';
import { PocDetail } from '../../../../../model/poc/pocDetails';
import { ServiceItem } from '../../../../../model/service/serviceItem';
import { SuperAdminService } from '../../../../superadmin.service';
import { PartnerIncentives } from './../../../../../model/poc/partnerIncentives ';
import { Ranges } from './../../../../../model/poc/ranges';
import { Config } from '../../../../../base/config';

@Component({
  selector: 'partneragreement',
  templateUrl: './partneragreement.template.html',
  styleUrls: ['./partneragreement.style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PartnerAgreementComponent implements OnInit, OnDestroy {

  errorMessage: Array<string>;
  showErrorMessage: Array<string>
  isError: boolean;
  showMessage: boolean;
  isErrorCheck: boolean = false;
  pocDetail: PocDetail;
  packageList: HealthPackage[] = new Array<HealthPackage>();
  list: Array<any>;
  serviceItems: Array<ServiceItem> = new Array();
  hsRenge: Array<Ranges> = new Array();
  hsPartnerIncentive: PartnerIncentives = new PartnerIncentives();
  isDoctor: boolean = true;
  isDoctorsms: boolean = true;
  isDoctoronline: boolean = true;
  isdiagnostic: boolean = true;
  isdiagnosticsms: boolean = true;
  isdiagnosticonline: boolean = true;
  isPharmacy: boolean = true;
  isPharmacysms: boolean = true;
  isPharmacyonline: boolean = true;
  isProcedure: boolean = true;
  isProceduresms: boolean = true;
  isProcedureline: boolean = true;
  isProduct: boolean = true;
  isProductsms: boolean = true;
  isProductline: boolean = true;
  isImmunization: boolean = true;
  isImmunizationsms: boolean = true;
  isImmunizationline: boolean = true;
  isWellness: boolean = true;
  isWellnesssms: boolean = true;
  isWellnessline: boolean = true;
  isAppInstalltion: boolean = true;
  currentPageIndex: number = 2;
  enableReceptionistAvailabilityCheck: boolean

  rolesMap: Map<number, Array<ServiceItem>> = new Map<number, Array<ServiceItem>>();
  serviceKey: number[] = [1, 2, 3, 4, 5];
  serviceRole: string[] = ["Additional", "Diagnostic", "Medical", "Wellness", "Home Consultation"];
  selectedpackage: HealthPackage;
  list1: Array<any>;
  adminId: number;
  month: any;
  consultationMargin: number;
  isInsentiveMargin: boolean = true;
  year: any;
  notAvailable: boolean;
  notAvailable1: boolean;
  notAvailable2: boolean;
  DiagnosticPartnerNotAvailable: boolean;
  PharmacyPartnerNotAvailable: boolean;
  ispackage: boolean = true;
  nopackage: boolean = false;
  nodigi: boolean = false;
  noscan: boolean = false;
  nocdss: boolean = false;
  startDate: Date = new Date();
  endDate: Date = new Date();
  empId: number;
  isDigi: boolean = false;
  isHsPackage: boolean = false;
  datepickerOpts = {
    endDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy'
  };

  datepickerOptEnd = {
    startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',

  };
  isPercent: boolean = true;
  isWalkPercent: boolean = true;
  isWalkinAppPercent: boolean = true;
  isVideoPercent: boolean = true;
  isVideoAppPercent: boolean = true;
  isHomePercent: boolean = true;
  isHomeAppPercent: boolean = true;
  isDoctorBookingPercent: boolean = true;
  isinvestigationBookingPercent: boolean = true;
  isPharmacyBookingPercent: boolean = true;
  isHomeBookingPercent: boolean = true;
  isWalkinBookingPercent: boolean = true;
  isPharmacyWalkPercent: boolean = true;
  participateDigi: boolean = false;
  pharmacyWalkin: boolean = false;
  pharmacyDeliverWalkin: boolean = false;
  pharmacyHomeDeliverWalkin: boolean = false;
  productWalkin: boolean = false;
  productHomeDeliverWalkin: boolean = false;
  diagnosticWalkin: boolean = false;
  isdiagnosticWalkPercent: boolean = true;
  isdiagnosticAppWalkPercent: boolean = true;
  isAppDiagnosticPercent: boolean = true;
  diagnosticSampleWalkin: boolean = false;
  isIncentivePercent: boolean = true;
  isPharmacyPercent: boolean = true;
  isAppPharmacyPercent: boolean = true;
  isProductPercent: boolean = true;
  isAppProductPercent: boolean = true;
  isproductWalkPercent: boolean = true;
  isproductAppWalkPercent: boolean = true;
  isDiagnosticPercent: boolean = true;
  isWellnessPercent: boolean = true;
  isProcedurePercent: boolean = true;
  isImmunizationPercent: boolean = true;
  isDigiPercent: boolean = true;
  isdigibookingPercent: boolean = true;
  isPackagePercent: boolean = true;
  isOnboardingPercent: boolean = true;
  isOnboardingPackagePercent: boolean = true;
  pharmancyWalkNotAvailable: boolean;
  pharmancyParticPationNotAvailable: boolean;
  diagnosticWalkNotAvailable: boolean;
  isSuperAdmin: boolean;
  creditLimit: boolean = true;
  isPocModify: boolean;
  tabData = [];
  creditLimitAmount: number;
  invoiceGeneration: number;
  paymentIncentiveGeneration: number;


  constructor(config: AppConfig,
    private superAdminService: SuperAdminService, private auth: AuthService,
    private router: Router, private hsLocalStorage: HsLocalStorage, private spinnerService: SpinnerService, private commonUtil: CommonUtil, private validationUtil: ValidationUtil) {
    this.pocDetail = this.superAdminService.pocDetail;
    // this.pocDetail.agreement.participation = 1;
    this.isSuperAdmin = this.auth.userAuth.hasSuperAdminRole;
    this.tabData = superAdminService.createPocTabs;
    if (Config.portal && Config.portal.specialFeatures && Config.portal.specialFeatures.enableReceptionistAvailabilityCheck) {
      this.enableReceptionistAvailabilityCheck = true;
    }

  }



  ngOnInit() {

    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    this.pocDetail = this.superAdminService.pocDetail;
    this.isPocModify = this.superAdminService.isPocModify == undefined ? true : this.superAdminService.isPocModify;
    let createPocLoc = this.hsLocalStorage.getDataEncrypted('createPocLoc');
    if (this.pocDetail) {
      let data = { 'pocDetails': this.pocDetail, 'isPocModify': this.isPocModify };
      this.hsLocalStorage.setDataEncrypted('createPocLoc', data);
    } else {
      this.superAdminService.pocDetail = this.pocDetail = createPocLoc.pocDetails;
      this.superAdminService.isPocModify = this.isPocModify = createPocLoc.isPocModify;
      console.log(`pocdetails==>${JSON.stringify(this.pocDetail)}`);
    }
    if (this.pocDetail.fromDate) {
      if (new Date() > new Date(this.pocDetail.fromDate)) {
        this.startDate = new Date(this.pocDetail.fromDate);
      }
      else {
        this.startDate = new Date(this.pocDetail.fromDate);
      }
      this.endDate = new Date(this.pocDetail.toDate);
    }
    else {
      this.startDate = null;
      this.endDate = null;
    }
    this.getServices();
    this.getallpackages();
    this.settingDate();
    this.empId = this.auth.userAuth.employeeId;
    if (this.empId != 1) {
      $("#startdatepicker input").prop("disabled", "disabled");
      $("#enddatepicker input").prop("disabled", "disabled");
    }
    console.log("================>>>" + JSON.stringify(this.pocDetail))

    if (!this.pocDetail.agreement) {
      this.pocDetail.agreement = new HSAgreement();
      this.pocDetail.agreement.margin = new HSMargin();
      this.pocDetail.agreement.appUserMargin = new HSMargin();
    }

    if (!this.pocDetail.agreement.margin) {
      // this.pocDetail.agreement= new HSAgreement();
      this.pocDetail.agreement.margin = new HSMargin();
    }
    if (!this.pocDetail.agreement.appUserMargin) {
      this.pocDetail.agreement.appUserMargin = new HSMargin();
    }
    this.isPercent = this.pocDetail.agreement.margin.defaultMarginFee && this.pocDetail.agreement.margin.defaultMarginFee != 0 ? false : true;
    this.isWalkPercent = this.pocDetail.agreement.margin.walkinConsultationMarginFee &&
      this.pocDetail.agreement.margin.walkinConsultationMarginFee != 0 ? false : true;
    this.isWalkinAppPercent = this.pocDetail.agreement.appUserMargin.walkinConsultationMarginFee &&
      this.pocDetail.agreement.appUserMargin.walkinConsultationMarginFee != 0 ? false : true;

    this.isVideoPercent = this.pocDetail.agreement.margin.videoLaterConsultationMarginFee && this.pocDetail.agreement.margin.videoLaterConsultationMarginFee != 0 ? false : true;
    this.isVideoAppPercent = this.pocDetail.agreement.appUserMargin.videoLaterConsultationMarginFee && this.pocDetail.agreement.appUserMargin.videoLaterConsultationMarginFee != 0 ? false : true;
    this.isHomePercent = this.pocDetail.agreement.margin.homeConsultationMarginFee && this.pocDetail.agreement.margin.homeConsultationMarginFee != 0 ? false : true;
    this.isHomeAppPercent = this.pocDetail.agreement.appUserMargin.homeConsultationMarginFee && this.pocDetail.agreement.appUserMargin.homeConsultationMarginFee != 0 ? false : true;


    this.isPharmacyPercent = this.pocDetail.agreement.margin.homePharmacyMarginFee && this.pocDetail.agreement.margin.homePharmacyMarginFee != 0 ? false : true;
    this.isAppPharmacyPercent = this.pocDetail.agreement.appUserMargin.homePharmacyMarginFee && this.pocDetail.agreement.appUserMargin.homePharmacyMarginFee != 0 ? false : true;

    this.isProductPercent = this.pocDetail.agreement.margin.homeProductMarginFee && this.pocDetail.agreement.margin.homeProductMarginFee != 0 ? false : true;
    this.isAppProductPercent = this.pocDetail.agreement.appUserMargin.homeProductMarginFee && this.pocDetail.agreement.appUserMargin.homeProductMarginFee != 0 ? false : true;

    this.isproductWalkPercent = this.pocDetail.agreement.margin.walkinProductMarginFee && this.pocDetail.agreement.margin.walkinProductMarginFee != 0 ? false : true;
    this.isproductAppWalkPercent = this.pocDetail.agreement.appUserMargin.walkinProductMarginFee && this.pocDetail.agreement.appUserMargin.walkinProductMarginFee != 0 ? false : true;

    this.isdiagnosticWalkPercent = this.pocDetail.agreement.margin.walkinInvestigationMarginFee && this.pocDetail.agreement.margin.walkinInvestigationMarginFee != 0 ? false : true;
    this.isdiagnosticAppWalkPercent = this.pocDetail.agreement.appUserMargin.walkinInvestigationMarginFee && this.pocDetail.agreement.appUserMargin.walkinInvestigationMarginFee != 0 ? false : true;

    this.isDiagnosticPercent = this.pocDetail.agreement.margin.homeCollectionInvestigationMarginFee
      && this.pocDetail.agreement.margin.homeCollectionInvestigationMarginFee != 0 ? false : true;
    this.isAppDiagnosticPercent = this.pocDetail.agreement.appUserMargin.homeCollectionInvestigationMarginFee && this.pocDetail.agreement.appUserMargin.homeCollectionInvestigationMarginFee != 0 ? false : true;
    this.isIncentivePercent = this.pocDetail.agreement.margin.homeCollectionInvestigationIncentiveFee && this.pocDetail.agreement.margin.homeCollectionInvestigationIncentiveFee != 0 ? false : true;

    this.isWellnessPercent = this.pocDetail.agreement.margin.welnessMarginFee
      && this.pocDetail.agreement.margin.welnessMarginFee != 0 ? false : true;

    this.isProcedurePercent = this.pocDetail.agreement.margin.procedureMarginFee
      && this.pocDetail.agreement.margin.procedureMarginFee != 0 ? false : true;

    this.isImmunizationPercent = this.pocDetail.agreement.margin.immunizationMarginFee
      && this.pocDetail.agreement.margin.immunizationMarginFee != 0 ? false : true;

    this.isDigiPercent = this.pocDetail.agreement.margin.digiConsultationMarginFee
      && this.pocDetail.agreement.margin.digiConsultationMarginFee != 0 ? false : true;

    this.isdigibookingPercent = this.pocDetail.agreement.margin.digiBookingMarginFee
      && this.pocDetail.agreement.margin.digiBookingMarginFee != 0 ? false : true;

    this.isPackagePercent = this.pocDetail.agreement.margin.packageMarginFee
      && this.pocDetail.agreement.margin.packageMarginFee != 0 ? false : true;

    this.isOnboardingPercent = this.pocDetail.agreement.margin.onboardingMarginFee
      && this.pocDetail.agreement.margin.onboardingMarginFee != 0 ? false : true;

    this.isOnboardingPackagePercent = this.pocDetail.agreement.margin.onboardingPackageMarginFee
      && this.pocDetail.agreement.margin.onboardingPackageMarginFee != 0 ? false : true;

    // if (this.pocDetail.agreement.margin.walkinConsultationMarginFee && this.pocDetail.agreement.margin.walkinConsultationMarginFee != 0) {
    //   this.isWalkPercent = false;
    //   // this.isWalkValue = true;
    // }
    // else {
    //   this.isWalkPercent = true;
    //   // this.isWalkValue = false;
    // }
    if (this.pocDetail.agreement.margin.partnerIncentives && this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives.length > 0 && this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives != undefined) {
      this.hsRenge = this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives;
      this.hsRenge[0].isPer = this.hsRenge[0].incentivesFee && this.hsRenge[0].incentivesFee != 0 ? false : true;
    } else {
      this.pocDetail.agreement.margin.partnerIncentives = new PartnerIncentives();
      let r = new Ranges();
      // r.isPer = true;
      this.hsRenge.push(r)
    }
    // this.hsRenge.forEach(ele => {
    //   if (ele == undefined || ele == null) {
    //     ele.isPer = ele.incentivesFee && ele.incentivesFee != 0 ? false : true;
    //   }
    // })
    console.log("hsranges" + JSON.stringify(this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives))


    console.log(JSON.stringify(this.pocDetail));
    this.creditLimit = this.pocDetail.creditLimit && this.pocDetail.creditLimit != 0 ? true : false;
    this.isDoctor = this.hsPartnerIncentive.doctorBookings.cashPaymentIncentiveFee && this.hsPartnerIncentive.doctorBookings.cashPaymentIncentiveFee != 0 ? false : true;
    this.isDoctorsms = this.hsPartnerIncentive.doctorBookings.smsPaymentIncentiveFee && this.hsPartnerIncentive.doctorBookings.smsPaymentIncentiveFee != 0 ? false : true;
    this.isDoctoronline = this.hsPartnerIncentive.doctorBookings.onlinePaymentIncentiveFee && this.hsPartnerIncentive.doctorBookings.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isdiagnostic = this.hsPartnerIncentive.diagnosticBookings.cashPaymentIncentiveFee && this.hsPartnerIncentive.diagnosticBookings.cashPaymentIncentiveFee != 0 ? false : true;
    this.isdiagnosticsms = this.hsPartnerIncentive.diagnosticBookings.smsPaymentIncentiveFee && this.hsPartnerIncentive.diagnosticBookings.smsPaymentIncentiveFee != 0 ? false : true;
    this.isdiagnosticonline = this.hsPartnerIncentive.diagnosticBookings.onlinePaymentIncentiveFee && this.hsPartnerIncentive.diagnosticBookings.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isPharmacy = this.hsPartnerIncentive.pharmacySales.cashPaymentIncentiveFee && this.hsPartnerIncentive.pharmacySales.cashPaymentIncentiveFee != 0 ? false : true;
    this.isPharmacysms = this.hsPartnerIncentive.pharmacySales.smsPaymentIncentiveFee && this.hsPartnerIncentive.pharmacySales.smsPaymentIncentiveFee != 0 ? false : true;
    this.isPharmacyonline = this.hsPartnerIncentive.pharmacySales.onlinePaymentIncentiveFee && this.hsPartnerIncentive.pharmacySales.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isProcedure = this.hsPartnerIncentive.procedureSales.cashPaymentIncentiveFee && this.hsPartnerIncentive.procedureSales.cashPaymentIncentiveFee != 0 ? false : true;
    this.isProceduresms = this.hsPartnerIncentive.procedureSales.smsPaymentIncentiveFee && this.hsPartnerIncentive.procedureSales.smsPaymentIncentiveFee != 0 ? false : true;
    this.isProcedureline = this.hsPartnerIncentive.procedureSales.onlinePaymentIncentiveFee && this.hsPartnerIncentive.procedureSales.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isProduct = this.hsPartnerIncentive.productSales.cashPaymentIncentiveFee && this.hsPartnerIncentive.productSales.cashPaymentIncentiveFee != 0 ? false : true;
    this.isProductsms = this.hsPartnerIncentive.productSales.smsPaymentIncentiveFee && this.hsPartnerIncentive.productSales.smsPaymentIncentiveFee != 0 ? false : true;
    this.isProductline = this.hsPartnerIncentive.productSales.onlinePaymentIncentiveFee && this.hsPartnerIncentive.productSales.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isImmunization = this.hsPartnerIncentive.immunizationSales.cashPaymentIncentiveFee && this.hsPartnerIncentive.immunizationSales.cashPaymentIncentiveFee != 0 ? false : true;
    this.isImmunizationsms = this.hsPartnerIncentive.immunizationSales.smsPaymentIncentiveFee && this.hsPartnerIncentive.immunizationSales.smsPaymentIncentiveFee != 0 ? false : true;
    this.isImmunizationline = this.hsPartnerIncentive.immunizationSales.onlinePaymentIncentiveFee && this.hsPartnerIncentive.immunizationSales.onlinePaymentIncentiveFee != 0 ? false : true;

    this.isWellness = this.hsPartnerIncentive.wellnessSales.cashPaymentIncentiveFee && this.hsPartnerIncentive.wellnessSales.cashPaymentIncentiveFee != 0 ? false : true;
    this.isWellnesssms = this.hsPartnerIncentive.wellnessSales.smsPaymentIncentiveFee && this.hsPartnerIncentive.wellnessSales.smsPaymentIncentiveFee != 0 ? false : true;
    this.isWellnessline = this.hsPartnerIncentive.wellnessSales.onlinePaymentIncentiveFee && this.hsPartnerIncentive.wellnessSales.onlinePaymentIncentiveFee != 0 ? false : true;
    this.isAppInstalltion = this.pocDetail.agreement.margin.appInstallationIncentiveFee && this.pocDetail.agreement.margin.appInstallationIncentiveFee != 0 ? false : true;
    this.auth.setPreventNavigation(true);
    this.pocDetail && (this.pocDetail.pocType <= 0 || !this.pocDetail.pocType) ? this.pocDetail.pocType = 0 : '';
    // this.pocDetail && this.pocDetail.referralPocId > 0 ?
    //   this.pocDetail.referredPoc = { pocId: this.pocDetail.referralPocId, pocName: this.pocDetail.referralPocName } : '';
  }

  settingDate() {
    if (this.pocDetail.hasDigi == true) {
      this.isDigi = true;
    }
    else {
      this.nodigi = true;
    }

    if (!this.pocDetail.cdssOptions) {
      this.pocDetail.cdssOptions = new CDSSOptions();
    }

    if (this.pocDetail.cdssOptions.doctorEditable == false || this.pocDetail.cdssOptions.doctorEditable == undefined) {
      // this.nocdss = true;
      this.pocDetail.cdssOptions.doctorEditable = false;
    }
    else {
      this.pocDetail.cdssOptions.doctorEditable = true;
    }

    if (this.pocDetail.scanAndUploadPrescriptions == false || this.pocDetail.scanAndUploadPrescriptions == undefined || this.pocDetail.scanAndUploadPrescriptions == null) {
      this.pocDetail.scanAndUploadPrescriptions = false;
    }
    else {
      this.pocDetail.scanAndUploadPrescriptions = true;
    }

    if (this.pocDetail.payOnDeliveryAvailable == false || this.pocDetail.payOnDeliveryAvailable == undefined || this.pocDetail.payOnDeliveryAvailable == null) {
      this.pocDetail.payOnDeliveryAvailable = false;
    }
    else {
      this.pocDetail.payOnDeliveryAvailable = true;
    }
    if (this.pocDetail.localDiagnosticPartner == false || this.pocDetail.localDiagnosticPartner == undefined || this.pocDetail.localDiagnosticPartner == null) {
      this.pocDetail.localDiagnosticPartner = false;
    }
    else {
      this.pocDetail.localDiagnosticPartner = true;
    }
    if (this.pocDetail.localPharmacyPartner == false || this.pocDetail.localPharmacyPartner == undefined || this.pocDetail.localPharmacyPartner == null) {
      this.pocDetail.localPharmacyPartner = false;
    }
    else {
      this.pocDetail.localPharmacyPartner = true;
    }
    if (this.pocDetail.pharmacyWalkinAvailable == false || this.pocDetail.pharmacyWalkinAvailable == undefined || this.pocDetail.pharmacyWalkinAvailable == null) {
      this.pocDetail.pharmacyWalkinAvailable = false;
    }
    else {
      this.pocDetail.pharmacyWalkinAvailable = true;
    }
    if (this.pocDetail.productWalkinAvailable == false || this.pocDetail.productWalkinAvailable == undefined || this.pocDetail.productWalkinAvailable == null) {
      this.pocDetail.productWalkinAvailable = false;
    }
    else {
      this.pocDetail.productWalkinAvailable = true;
    }

    if (this.pocDetail.diagnosticWalkinAvailable == false || this.pocDetail.diagnosticWalkinAvailable == undefined || this.pocDetail.diagnosticWalkinAvailable == null) {
      this.pocDetail.diagnosticWalkinAvailable = false;
    }
    else {
      this.pocDetail.diagnosticWalkinAvailable = true;
    }

    if (this.pocDetail.diagnosticSampleCollectionAvailable == false || this.pocDetail.diagnosticSampleCollectionAvailable == undefined || this.pocDetail.diagnosticSampleCollectionAvailable == null) {
      this.pocDetail.diagnosticSampleCollectionAvailable = false;
    }
    else {
      this.pocDetail.diagnosticSampleCollectionAvailable = true;
    }

    if (this.pocDetail.pharmacyHomeDeliveryAvailable == false || this.pocDetail.pharmacyHomeDeliveryAvailable == undefined || this.pocDetail.pharmacyHomeDeliveryAvailable == null) {
      this.pocDetail.pharmacyHomeDeliveryAvailable = false;
    }
    else {
      this.pocDetail.pharmacyHomeDeliveryAvailable = true;
    }
    if (this.pocDetail.productHomeDeliveryAvailable == false || this.pocDetail.productHomeDeliveryAvailable == undefined || this.pocDetail.productHomeDeliveryAvailable == null) {
      this.pocDetail.productHomeDeliveryAvailable = false;
    }
    else {
      this.pocDetail.productHomeDeliveryAvailable = true;
    }

    if (!this.pocDetail.agreement) {
      this.pocDetail.agreement = new HSAgreement();
    }

    if (!this.pocDetail.agreement.packageIdList) {
      this.pocDetail.agreement.packageIdList = new Array();
    }

    if ((this.pocDetail.agreement.margin.packageMargin > 0) || (this.pocDetail.agreement.packageIdList.length > 0)) {
      this.ispackage = true;
    }
    else {
      this.ispackage = false;
      this.nopackage = true;
    }
    if (this.pocDetail.agreement.margin.partnerIncentives) {
      this.hsPartnerIncentive = this.pocDetail.agreement.margin.partnerIncentives;
    }

    if (this.pocDetail.agreement.margin.partnerIncentives && this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives != undefined) {
      this.hsRenge = this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives;
    }
    else {
      this.pocDetail.agreement.margin.partnerIncentives = new PartnerIncentives();
      let r = new Ranges();
      // r.isPer = true;
      this.hsRenge.push(r)
    }
    console.log("range" + JSON.stringify(this.pocDetail.agreement.margin.partnerIncentives))

  }
  changeData(type, isValue?) {
    if (type == 'participateInTransferPricing') {
      this.pocDetail.participateInTransferPricing = !this.pocDetail.participateInTransferPricing;
    }
    if (type == "disablePOC") {
      this.pocDetail.disablePOC = !this.pocDetail.disablePOC;
    }

    if (type == "receptionistAvailable") {
      this.pocDetail.receptionistAvailable = !this.pocDetail.receptionistAvailable
    }
    if (type == 'doctorEditable') {
      this.pocDetail.cdssOptions.doctorEditable = !this.pocDetail.cdssOptions.doctorEditable;
    }
    if (type == 'scanAndUploadPrescriptions') {
      this.pocDetail.scanAndUploadPrescriptions = !this.pocDetail.scanAndUploadPrescriptions;
    }
    if (type == 'pharmacyWalkinAvailable') {
      this.pocDetail.pharmacyWalkinAvailable = !this.pocDetail.pharmacyWalkinAvailable;
    }
    if (type == 'pharmacyHomeDeliveryAvailable') {
      this.pocDetail.pharmacyHomeDeliveryAvailable = !this.pocDetail.pharmacyHomeDeliveryAvailable;
    }
    if (type == 'productWalkinAvailable') {
      this.pocDetail.productWalkinAvailable = !this.pocDetail.productWalkinAvailable;
    }
    if (type == 'productHomeDeliveryAvailable') {
      this.pocDetail.productHomeDeliveryAvailable = !this.pocDetail.productHomeDeliveryAvailable;
    }
    if (type == 'diagnosticWalkinAvailable') {
      this.pocDetail.diagnosticWalkinAvailable = !this.pocDetail.diagnosticWalkinAvailable;
    }
    if (type == 'diagnosticSampleCollectionAvailable') {
      this.pocDetail.diagnosticSampleCollectionAvailable = !this.pocDetail.diagnosticSampleCollectionAvailable;
    }
    if (type == 'payOnDeliveryAvailable') {
      this.pocDetail.payOnDeliveryAvailable = !this.pocDetail.payOnDeliveryAvailable;
    }
    if (type == 'localDiagnosticPartner') {
      this.pocDetail.localDiagnosticPartner = !this.pocDetail.localDiagnosticPartner;
    }
    if (type == 'localPharmacyPartner') {
      this.pocDetail.localPharmacyPartner = !this.pocDetail.localPharmacyPartner;
    }
    if (type == 'participateDigi') {
      this.pocDetail.hasDigi = !this.pocDetail.hasDigi;
    }
    if (type == 'pharmacyWalkin') {
      this.pocDetail.pharmacyWalkinAvailable = !this.pocDetail.pharmacyWalkinAvailable;
    }
    if (type == 'productWalkin') {
      this.pocDetail.productWalkinAvailable = !this.pocDetail.productWalkinAvailable;
    }
    if (type == 'pharmacyHomeDeliverWalkin') {
      this.pocDetail.pharmacyHomeDeliveryAvailable = !this.pocDetail.pharmacyHomeDeliveryAvailable;
    }
    if (type == 'productHomeDeliverWalkin') {
      this.pocDetail.productHomeDeliveryAvailable = !this.pocDetail.productHomeDeliveryAvailable;
    }
    if (type == 'diagnosticWalkin') {
      this.pocDetail.diagnosticWalkinAvailable = !this.pocDetail.diagnosticWalkinAvailable;
    }
    if (type == 'diagnosticSampleWalkin') {
      this.pocDetail.diagnosticSampleCollectionAvailable = !this.pocDetail.diagnosticSampleCollectionAvailable;
    }
    if (type == 'ispackage') {
      this.ispackage = !this.ispackage;
    }
    if (type == 'pdfHeaderType') {
      this.pocDetail.pdfHeaderType = isValue;
      console.log(this.pocDetail.pdfHeaderType);
    }
  }

  addRevenu() {
    this.isError = false;
    this.showMessage = false;
    let ranges: Ranges = {
      incentivesMargin: undefined,
      incentivesFee: undefined,
      minimumAmount: this.hsRenge[this.hsRenge.length - 1].maximumAmount,
      maximumAmount: undefined,
      isPer: true
    };

    if (this.hsRenge != undefined) {
      this.hsRenge.forEach(e => {
        if (!e.minimumAmount || e.minimumAmount < 0) {
          this.isError = true;
          this.showErrorMessage = new Array();
          this.showErrorMessage[0] = "Enter Minimum Ranges";
          this.showMessage = true;
        }
        if ((!e.incentivesMargin || e.incentivesMargin < 0) && (!e.incentivesFee || e.incentivesFee < 0)) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Enter the Margin";
          this.showMessage = true;
        }
      })

      if (!this.hsRenge[this.hsRenge.length - 1].maximumAmount) {
        if (!this.hsRenge[this.hsRenge.length - 1].maximumAmount || this.hsRenge[this.hsRenge.length - 1].maximumAmount < 0) {
          this.isError = true;
          this.errorMessage = new Array();
          this.errorMessage[0] = "Enter Maximum Ranges";
          this.showMessage = true;
        }
      }
    }
    if (this.isError == true) return;
    this.hsRenge.push(ranges);

  }
  toggleBoolean(item: Ranges, value) {
    item = JSON.parse(value);
    // alert(JSON.stringify(item));
  }
  validateNumberInputOnly(event) {
    var key = window.event ? event.keyCode : event.which;
    if ((event.keyCode != 8 || event.keyCode == 32) && (event.keyCode < 48 || event.keyCode > 57)) {
      return false;
    }
    else return true;
  }
  validatecopyPast(event) {
    if (event.ctrlKey == true && (event.which == '118' || event.which == '86')) {
      event.preventDefault();
    }
  }
  checkPer(value, variable, isPer?) {
    isPer = JSON.parse(isPer)
    // alert(value.incentivesMargin+isPer)
    if (value[variable] > 100 && isPer) {
      // alert(value)
      value[variable] = 100;
    }
  }
  checkPerTran(value, variable) {
    value[variable] = value[variable] && value[variable] > 100 ? 100 : value[variable] < 0 ? 0 : value[variable];
  }
  applyCreditLimit(event: any) {
    if (event == null || event == '') {
      event = 0;
    } else if (event < 0 || event > 1000000) {
      this.creditLimitAmount = event;
      return
    }
    this.creditLimitAmount = event;

  }
  invoiceGenerationDays(event: any) {
    if (event == null || event == '') {
      event = 0;
    } else if (event < 1 || event > 365) {
      this.invoiceGeneration = event;
      return
    }
    this.invoiceGeneration = event;
  }
  paymentIncentiveGenerationDays(event: any) {
    if (event == null || event == '') {
      event = 0;
    } else if (event < 1 || event > 365) {
      this.paymentIncentiveGeneration = event;
      return
    }
    this.paymentIncentiveGeneration = event;
  }

  onBackClick(type?): void {
    this.tabData = [];
    setTimeout(() => { this.tabData = this.superAdminService.createPocTabs; }, 10)
    switch (type) {
      case 0: {
        this.router.navigate(['/app/master/poc/create/']);
        break;
      }
      case 1: {
        this.router.navigate(['/app/master/poc/serviceportfolio/']);
        break;
      }
      default: {
        break;
      }
    }
    this.superAdminService.isPocModify = true;
  }

  getServices() {
    if (this.pocDetail.serviceList != null && this.pocDetail.serviceList != undefined) {
      this.serviceItems = this.pocDetail.serviceList;
      let obj = new ServiceItem();
      for (let i = 0; i < this.serviceItems.length; i++) {
        let key = this.serviceItems[i].serviceType;
        if (this.rolesMap.has(key)) {
          let arr2 = new Array<ServiceItem>();
          arr2 = this.rolesMap.get(key);
          arr2.push(this.serviceItems[i]);
          this.rolesMap.set(key, arr2);
        } else {
          let arr = new Array<ServiceItem>();
          arr.push(this.serviceItems[i]);
          this.rolesMap.set(key, arr);
        }
      }

      this.rolesMap.forEach((value: Array<ServiceItem>, key: number) => {
      });

    }
  }

  getValue(key) {
    return this.rolesMap.get(key);
  }

  OnCreatepoc() {
    this.spinnerService.start();
    this.isError = false;
    $('html, body').animate({ scrollTop: '0px' }, 300);
    this.pocDetail.updatedTime = 0;
    if (this.startDate != undefined && this.startDate != null)
      this.pocDetail.fromDate = this.startDate.getTime();
    if (this.endDate != undefined && this.endDate != null)
      this.pocDetail.toDate = this.endDate.getTime();
    if (this.hsPartnerIncentive) {
      this.pocDetail.agreement.margin.partnerIncentives = this.hsPartnerIncentive;
    }
    if (this.hsRenge && this.hsRenge.length > 0) {
      this.pocDetail.agreement.margin.partnerIncentives.revenueIncentives = this.hsRenge;
    }

    // if(this.creditLimit){
    // this.pocDetail.creditLimit =this.creditLimit
    // }
    if (this.startDate > this.endDate) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "End date cannot be before start date.";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if (this.endDate < new Date()) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "End date cannot be before tomorrow's date.";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if (this.pocDetail.agreement.margin.appInstallationPayoutDuration &&
      (this.pocDetail.agreement.margin.appInstallationPayoutDuration == 0) ||
      (this.pocDetail.agreement.margin.appInstallationPayoutDuration > 365)) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter App Installation Payout Duration should be from 1 to 365";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if (!this.pocDetail || !this.pocDetail.pocName || this.pocDetail.pocName.trim() == '') {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter a valid name for the Center";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if (!this.pocDetail.saasSubscriber && this.pocDetail.invoiceGenerationDays && ((this.pocDetail.invoiceGenerationDays == 0) || (this.pocDetail.invoiceGenerationDays > 365))) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Invoice Generation Days should be from 1 to 365";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }
    if ((this.pocDetail.fromDate > this.pocDetail.toDate) || (this.startDate == undefined || this.startDate == null || this.startDate.toDateString() == "Invalid Date") || (this.endDate == undefined || this.endDate == null || this.endDate.toDateString() == "Invalid Date")) {
      this.isError = true;
      this.errorMessage = new Array();
      this.errorMessage[0] = "Enter a valid Date.";
      this.showMessage = true;
      this.spinnerService.stop();
      return;
    }

    else {
      this.isError = false;
      this.errorMessage = new Array();
      this.showMessage = false;
    }
    if (this.isError) {
      this.spinnerService.stop();
      return;
    } else {
      let serviceRef = this.superAdminService.referredByPocDetails;
      serviceRef.referredPocId == 0 ? this.pocDetail.referralPocId = serviceRef.pocId : '';
      serviceRef.referredPocId == 0 ? this.pocDetail.referralPocName = serviceRef.pocName : '';
    }

    this.superAdminService.addAndUpdatePocDetails(this.pocDetail).then(resp => {
      $('html, body').animate({ scrollTop: '0px' }, 300);
      this.auth.userAuth.pdfHeaderType = this.pocDetail.pdfHeaderType;
      if (resp.statusCode == 200 || resp.statusCode == 201) {
        if (!this.pocDetail.pocId) {
          alert("POC Created Successfully")
          this.isError = false;
          this.errorMessage = new Array();
          this.errorMessage.push("POC Created Successfully");
          this.showMessage = true;
        }
        else {
          alert("POC Updated Successfully")
          this.isError = false;
          this.errorMessage = new Array();
          this.errorMessage.push("POC Updated Successfully");
          this.showMessage = true;
        }
        this.spinnerService.stop();
        this.router.navigate(['/app/master/poc/list']);
      }
      else {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage.push("something went wrong");
        this.showMessage = true;
        this.spinnerService.stop();
        alert("something went wrong")
      }
    }).catch(err => {
      if (err) {
        this.isError = true;
        this.errorMessage = new Array();
        this.errorMessage[0] = "Server Issue ! Check Your Connection...";
        this.showMessage = true;
        this.spinnerService.stop();
      }
    });
  }
  getallpackages(): void {
    if (!this.pocDetail.agreement || this.pocDetail.agreement.packageIdList == null) {
      this.superAdminService.getallpackages().then(response => {
        console.log("here is th elist===>>>" + JSON.stringify(response))
        this.packageList = response;

      });
    }
    if (this.pocDetail.agreement && this.pocDetail.agreement.packageIdList != null) {
      setTimeout(() => {
        this.checkedSavedItem();
      }, 2000);
    }
  }

  packageSelection(index: number) {
    this.pocDetail.agreement.participation = 1;
    if (index == 0) {
      this.ispackage = true;
      console.log('if');
      this.pocDetail.agreement.participation = 1;
      this.nopackage = false;
    }
    else {
      this.ispackage = false;
      this.pocDetail.agreement.margin.packageMargin = 0;
      this.pocDetail.agreement.participation = 0;
      this.nopackage = true;
    }
  }
  selectDigi(index: number) {
    if (index == 0) {
      this.pocDetail.hasDigi = true;
      this.isDigi = true;
      this.nodigi = false;
    }
    else {
      this.pocDetail.hasDigi = false;
      this.pocDetail.agreement.digiMargin = 0;
      this.nodigi = true;
    }
  }


  checkedSavedItem() {
    this.superAdminService.getallpackages().then(response => {
      this.packageList = response;

      this.list = new Array<string>();
      for (let i = 0; i < this.packageList.length; i++) {
        for (let j = 0; j < this.pocDetail.agreement.packageIdList.length; j++) {
          if (this.packageList[i].packageId == this.pocDetail.agreement.packageIdList[j]) {
            this.list.push(this.packageList[i]);
          }
        }
      }
    });
  }


  checkSelectedPackage() {
    if (!this.list) {
      this.list = new Array<string>();
    }
    setTimeout(() => {
      for (let i = 0; i < this.packageList.length; i++) {
        for (let j = 0; j < this.list.length; j++) {
          if (this.packageList[i].packageId == this.list[j].packageId) {
            this.list.push(this.packageList[i].name);
            (<any>$("#" + this.packageList[i].packageId)).prop("checked", true)
          }
        }
      }
    }, 200)
  }
  calculatePackageMargin() {
    if (this.pocDetail.agreement.hsPackageMargin > 100) {
      this.pocDetail.agreement.hsPackageMargin = 100;
    }
  }
  onlyDecimalValueTillTwoDigits(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46 && evt.srcElement.value.split('.').length > 1) {
      return false;
    }
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    var velement = evt.target || evt.srcElement
    var fstpart_val = velement.value;
    var fstpart = velement.value.length;
    console.log("length" + fstpart);
    if (fstpart.length == 2) return false;
    var parts = velement.value.split('.');
    console.log("split" + parts);
    if (parts[0].length >= 14) return false;
    if (parts.length == 2 && parts[0].length <= 10 && parts[1].length >= 2) return false;
    return true;
  }
  onValueChecked(selectedpackage): void {
    if (this.list == undefined)
      this.list = new Array<string>();
    this.list.push(selectedpackage.name);
    if ((<any>$("#" + selectedpackage.packageId + ":checked")).length > 0) {
      this.ispackage = true;
      this.list.push(selectedpackage);
      this.superAdminService.pocDetail.agreement.packageIdList.push(selectedpackage.packageId);
    } else {
      var index = this.superAdminService.pocDetail.agreement.packageIdList.indexOf(selectedpackage.packageId);
      var index1 = this.list.indexOf(selectedpackage);
      this.list.splice(index1, 1)
      this.superAdminService.pocDetail.agreement.packageIdList.splice(index, 1);
    }
  }
  deleteVar(margin, varName) {
    delete margin[varName];
  }
  onRefPocChange(event) {
    // console.log(event);    
    this.pocDetail.referralPocId = event.pocId;
    this.pocDetail.referralPocName = event.pocName;
    let serviceRef = this.superAdminService.referredByPocDetails,
      rData = { ...serviceRef, ...{ pocName: event.pocName, pocId: event.pocId } };
    this.superAdminService.setReferredByPocDetails(rData);
  }
  ngOnDestroy() {
    this.auth.setPreventNavigation(false);
  }
}

